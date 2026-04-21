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
// ADAPT: If your editors have an assets folder, add a copy for each here.
// Example:
// const assetsDir = join(ROOT, "editors", "my-editor", "assets");
// const distAssetsDir = join(BROWSER_DIR, "assets");
// if (existsSync(assetsDir)) {
//   mkdirSync(distAssetsDir, { recursive: true });
//   cpSync(assetsDir, distAssetsDir, { recursive: true });
//   console.log("Copied editor assets → dist/browser/assets/");
// }

// === Fix 3: Copy dist/browser/ to package root for npm publish ===
const browserCopyPath = join(ROOT, "browser");
if (existsSync(browserCopyPath)) {
  rmSync(browserCopyPath, { recursive: true });
}
cpSync(join(ROOT, "dist", "browser"), browserCopyPath, { recursive: true });
console.log("Copied dist/browser/ → browser/ for Connect package loader.");

// === Fix 4: Merge all CSS into root style.css for Connect stylesheet loader ===
const tailwindCss = join(ROOT, "dist", "style.css");
const componentCss = join(ROOT, "dist", "browser", "style.css");
const styleDest = join(ROOT, "style.css");

const COMPONENT_MARKER =
  "/* === Component styles (bundled from browser build) === */";

let combinedCss = "";
if (existsSync(tailwindCss)) {
  combinedCss += readFileSync(tailwindCss, "utf-8")
    .split(COMPONENT_MARKER)[0]
    .trimEnd();
}
if (existsSync(componentCss)) {
  combinedCss += `\n\n${COMPONENT_MARKER}\n`;
  combinedCss += readFileSync(componentCss, "utf-8");
}
if (combinedCss) {
  // Fix 5: Hoist @import rules to the top (CSS spec requires them before any other rules).
  // Extract all @import lines, deduplicate, and prepend them.
  const importRegex = /^@import\s+url\([^)]+\);?\s*$/gm;
  const imports = [...new Set((combinedCss.match(importRegex) || []).map(s => s.trim()))];
  combinedCss = combinedCss.replace(importRegex, "").trimStart();
  if (imports.length > 0) {
    combinedCss = imports.join("\n") + "\n\n" + combinedCss;
    console.log(`Hoisted ${imports.length} @import rule(s) to top of style.css.`);
  }
  writeFileSync(styleDest, combinedCss, "utf-8");
  console.log("Merged dist/style.css + dist/browser/style.css → style.css for Connect stylesheet loader.");
}
