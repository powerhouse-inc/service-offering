# Postbuild Fixes for Powerhouse Reactor Packages

When publishing a Reactor Package to npm for use in Connect, `ph-cli build` (tsdown/rolldown) produces output in `dist/` that has several issues at runtime in the browser. This document describes each problem and the postbuild script that fixes them.

This guide is **generic** — adapt the asset paths to your project's editor structure.

---

## Problem 1: CJS `require()` Calls in Browser Bundle

**What happens:** The browser build externalizes `react`/`react-dom` as ESM imports at the top of output files. But CJS dependencies (e.g. `react-confirm` from `@powerhousedao/document-engineering`) use `require("react")`. Rolldown wraps these in a `__require()` shim that throws at runtime because `require` is undefined in the browser.

**Symptom:** Runtime error: `__require is not defined` or `require is not a function`.

**Fix:** Patch `__require("react")` / `__require("react-dom")` / `__require("react-dom/client")` calls in the browser JS output with the ESM module references (`React`, `ReactDOM`) that are already imported at the top of the same files.

---

## Problem 2: Static Assets Not Emitted

**What happens:** Editors may reference static assets (images, icons, etc.) via `new URL("./assets/file.png", import.meta.url)`. The bundler preserves this pattern in the output but does **not** copy the actual files into `dist/browser/`.

**Symptom:** Broken images / 404s for asset URLs at runtime.

**Fix:** Copy the editor assets directory into `dist/browser/assets/` before the browser directory copy (Fix 3), so they propagate to the package root `browser/` folder automatically.

**Adapt for your project:** Change the `assetsDir` path to match your editor's asset location:
```js
// Change this to your editor's assets folder
const assetsDir = join(ROOT, "editors", "<your-editor-name>", "assets");
```
If your project has multiple editors with assets, add a copy for each.

---

## Problem 3: Browser Path Mismatch

**What happens:** Connect's `BrowserPackageManager` loads packages at runtime via:
```js
const importUrl = `/node_modules/${name}/browser/index.js`;
```
But `ph-cli build` outputs the browser bundle to `dist/browser/`. The `package.json` exports map (`"./dist/browser/index.js"`) works for Node/bundler resolution, but the browser dynamic import uses a literal URL path and gets a 404.

**Symptom:** Package fails to load in Connect — 404 on the browser entry point.

**Fix:** Copy `dist/browser/` to `browser/` at the package root. A symlink won't work because **npm strips symlinks when publishing** — a real directory copy is required.

---

## Problem 4: Missing Styles

**What happens:** Connect loads the stylesheet from:
```js
const stylesheetUrl = `/node_modules/${name}/style.css`;
```
The build produces two separate CSS files:
- `dist/style.css` — Tailwind CSS (theme, utilities, etc.)
- `dist/browser/style.css` — Component CSS (third-party editor styles, etc.)

Connect only loads one `style.css` from the package root, so one set of styles is always missing.

**Symptom:** Editor loads but styling is broken — either Tailwind utilities are missing or component-specific styles (e.g. markdown editor) are missing.

**Fix:** Concatenate both CSS files into a single `style.css` at the package root.

---

## Implementation

### 1. Create `scripts/fix-browser-build.mjs`

```js
/**
 * Post-build fixes for browser bundle.
 *
 * Fix 1: Patch CJS __require() calls that fail at runtime in the browser.
 * Fix 2: Copy static assets that the bundler doesn't emit.
 * Fix 3: Copy dist/browser/ to package root for Connect's BrowserPackageManager.
 * Fix 4: Merge Tailwind + component CSS into a single root style.css.
 */
import { readFileSync, writeFileSync, globSync, existsSync, rmSync, cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BROWSER_DIR = join(ROOT, "dist", "browser");

// === Fix 1: Patch CJS require() calls in browser bundle ===
const files = globSync("**/*.js", { cwd: BROWSER_DIR }).map((f) =>
  join(BROWSER_DIR, f),
);

const replacements = [
  [/__require\("react"\)/g, "React"],
  [/__require\("react-dom"\)/g, "ReactDOM"],
  [/__require\("react-dom\/client"\)/g, "ReactDOM"],
];

let totalPatches = 0;

for (const filePath of files) {
  let content = readFileSync(filePath, "utf-8");
  let filePatches = 0;

  for (const [pattern, replacement] of replacements) {
    const matches = content.match(pattern);
    if (matches) {
      filePatches += matches.length;
      content = content.replace(pattern, replacement);
    }
  }

  if (filePatches > 0) {
    writeFileSync(filePath, content, "utf-8");
    const relative = filePath.replace(ROOT + "/", "");
    console.log(`  Patched ${filePatches} require() calls in ${relative}`);
    totalPatches += filePatches;
  }
}

if (totalPatches > 0) {
  console.log(`Fixed ${totalPatches} CJS require() calls in browser build.`);
} else {
  console.log("No CJS require() calls found — build is clean.");
}

// === Fix 2: Copy static assets into dist/browser/ (before browser/ copy) ===
// ADAPT: Change this path to match your editor's assets folder.
// If you have multiple editors with assets, add a copy for each.
const assetsDir = join(ROOT, "editors", "builder-profile", "assets");
const distAssetsDir = join(BROWSER_DIR, "assets");
if (existsSync(assetsDir)) {
  mkdirSync(distAssetsDir, { recursive: true });
  cpSync(assetsDir, distAssetsDir, { recursive: true });
  console.log("Copied editor assets → dist/browser/assets/ for static asset resolution.");
}

// === Fix 3: Copy dist/browser/ to package root for npm publish ===
// (runs after Fix 2 so assets are included in the copy)
const browserCopyPath = join(ROOT, "browser");
if (existsSync(browserCopyPath)) {
  rmSync(browserCopyPath, { recursive: true });
}
cpSync(join(ROOT, "dist", "browser"), browserCopyPath, { recursive: true });
console.log("Copied dist/browser/ → browser/ for Connect package loader.");

// === Fix 4: Merge all CSS into root style.css for Connect stylesheet loader ===
// dist/style.css has Tailwind CSS, dist/browser/style.css has component CSS.
// Connect only loads one style.css from the package root, so we concatenate both.
const tailwindCss = join(ROOT, "dist", "style.css");
const componentCss = join(ROOT, "dist", "browser", "style.css");
const styleDest = join(ROOT, "style.css");

let combinedCss = "";
if (existsSync(tailwindCss)) {
  combinedCss += readFileSync(tailwindCss, "utf-8");
}
if (existsSync(componentCss)) {
  combinedCss += "\n/* === Component styles (bundled from browser build) === */\n";
  combinedCss += readFileSync(componentCss, "utf-8");
}
if (combinedCss) {
  writeFileSync(styleDest, combinedCss, "utf-8");
  console.log("Merged dist/style.css + dist/browser/style.css → style.css for Connect stylesheet loader.");
}
```

### 2. Update `package.json`

**Build script** — chain the fix after `ph-cli build`:
```json
"build": "ph-cli build && node scripts/fix-browser-build.mjs"
```

**Files array** — include the root copies in the published tarball:
```json
"files": ["/dist", "/browser", "style.css"]
```

### 3. Update `.gitignore`

Add the build artifacts (they're regenerated on every build):
```
browser
style.css
```

---

## Verification

After running `npm run build`:

```bash
# Fix 1: No __require() calls remain
grep -rn '__require(' dist/browser/ --include="*.js"
# Should return no results

# Fix 2: Assets exist in browser output
ls dist/browser/assets/
# Should list your asset files (e.g. operator-icon.png)

# Fix 3: browser/ is a real directory (not a symlink)
file browser
# Should say: browser: directory

# Fix 4: Root style.css contains both Tailwind and component styles
wc -l style.css
# Should be larger than either dist/style.css or dist/browser/style.css alone
grep 'tailwindcss' style.css && echo "Tailwind: OK"
# Verify component CSS is present (adapt the class name to your project):
grep 'w-md-editor' style.css && echo "Component CSS: OK"
```

---

## Publishing

```bash
# bump the prerelease version
npm version <next-version> --no-git-tag-version

# publish to npm
npm publish --access public
```

Then in consuming projects, update `package.json` and `powerhouse.config.json` to the new version and `npm install`.

---

## When to Use This

You need this postbuild script if your Reactor Package:

- Has **CJS dependencies** that `require("react")` (Fix 1) — common with older React libraries
- Has **static assets** referenced via `new URL(..., import.meta.url)` in editors (Fix 2)
- Is **published to npm** and loaded by Connect at runtime (Fixes 3 & 4) — all published packages need these

If your package has no editors or no CJS dependencies, some fixes may be no-ops (the script handles this gracefully).
