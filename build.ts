/**
 * Custom build driver that fixes the "two React instances" problem when the
 * package is loaded by a deployed Connect.
 *
 * The default `ph-cli build` (via `@powerhousedao/shared/clis`) uses
 * `deps.alwaysBundle: ["**"]` and filters React out of `browserNeverBundle`,
 * which ends up emitting a chunk (e.g. `react-*.js`) that contains the full
 * React source. When Connect imports the editor module from the CDN it pulls
 * that chunk in alongside its own React, producing two React instances and
 * breaking hooks with:
 *   `TypeError: Cannot read properties of null (reading 'useState')`
 *
 * This script reuses the shared Powerhouse build configs but forces React,
 * react-dom, and their sub-paths into `deps.neverBundle`, which tsdown passes
 * to rolldown as a hard `external`. Emitted chunks then contain bare
 * `import … from "react"` / `"react-dom"` statements, which Connect resolves
 * against its own React at runtime — so there's only ever one React.
 */

import { browserBuildConfig, nodeBuildConfig } from "@powerhousedao/shared/clis";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { build, type InlineConfig } from "tsdown";

const REACT_EXTERNALS = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react-dom/client",
];

const outDir = "dist";

const existingBrowserNeverBundle = Array.isArray(
  browserBuildConfig.deps?.neverBundle,
)
  ? (browserBuildConfig.deps?.neverBundle as string[])
  : [];

const browserNeverBundle = Array.from(
  new Set([...existingBrowserNeverBundle, ...REACT_EXTERNALS]),
);

// tsdown exports `browserBuildConfig`/`nodeBuildConfig` as `ResolvedConfig`,
// but `build()` accepts `InlineConfig`. The shapes overlap at runtime — the
// cast tells TS "trust me" for the few non-overlapping fields (like `copy`).
await build({
  ...(browserBuildConfig as InlineConfig),
  outDir: join(outDir, "browser"),
  deps: {
    ...browserBuildConfig.deps,
    neverBundle: browserNeverBundle,
  },
});

await build({
  ...(nodeBuildConfig as InlineConfig),
  outDir: join(outDir, "node"),
});

// Tailwind step — mirrors what ph-cli's build does after the bundle phase.
execSync("bun x @tailwindcss/cli -i ./style.css -o ./dist/style.css", {
  stdio: "inherit",
});
