# Developer Agent — Skill Map

Complete inventory of skills available to the Developer Agent, organized by function.

## Core Implementation Skills

### powervetra
**Status:** Installed (local)
**Invoke:** `powervetra` (auto-triggered on Powerhouse mentions)
**When:** Every implementation task — this is the primary skill for the Developer Agent.
**What it does:** Complete Powerhouse/Vetra implementation guide:
- MCP tool usage (addActions, getDocument, createDocument)
- Reducer implementation (pure, synchronous, Mutative-wrapped)
- Editor creation (hooks pattern, dispatch, component structure)
- Subgraph/processor implementation
- CLI commands (ph vetra, ph generate)
**Key references to load:**
- `references/document-models.md` — all 37 MCP operations, reducer rules, error handling, testing patterns
- `references/editors.md` — editor patterns, drive-apps, styling
- `references/react-hooks.md` — all hooks from `@powerhousedao/reactor-browser`
- `references/component-library.md` — `@powerhousedao/document-engineering` components
- `references/mcp-tools.md` — full MCP tool reference
- `references/subgraphs-processors.md` — subgraph schema/resolvers

### CLAUDE.md (persistent context)
**Status:** Always loaded
**What it provides for Developer:**
- Two-step modification rule (MCP + source file)
- Reducer purity rules (no randomUUID, no Date.now)
- Nullable handling (InputMaybe → || null)
- Error handling patterns (specific errors, auto-imported)
- QA commands (npm run tsc, npm run lint:fix)
- Editor implementation pattern (useSelectedDocument hook)
- Toast usage (usePHToast, no ToastContainer import)

## UI/Editor Skills

### react-best-practices
**Status:** Installed (local)
**Invoke:** `react-best-practices`
**When:** Building or optimizing React editor components — performance patterns, hook optimization, bundle size.
**What it does:** Vercel Engineering guidelines for React/Next.js performance. Covers component patterns, data fetching, memoization, lazy loading.

### frontend-design
**Status:** Installed (local)
**Invoke:** `frontend-design`
**When:** Editor needs distinctive, high-quality UI beyond basic layout. Avoids generic AI aesthetics.
**What it does:** Generates creative, polished frontend code. Production-grade interfaces with high design quality.

### ui-ux-pro-max
**Status:** Installed (symlink)
**Invoke:** `ui-ux-pro-max`
**When:** Complex editor UIs requiring specific design patterns — dashboards, data tables, form layouts, chart visualizations.
**What it does:** 50 styles, 21 palettes, 50 font pairings, 20 chart types, 9 stacks. Covers glassmorphism, bento grid, dark mode, responsive patterns. Integrates with shadcn/ui.
**Use over frontend-design when:** You need specific design system guidance (palettes, font pairings, chart types) rather than creative freeform design.

### web-design-guidelines
**Status:** Installed (symlink)
**Invoke:** `web-design-guidelines`
**When:** Reviewing editor UI for accessibility, Web Interface Guidelines compliance.
**What it does:** Audits UI code against best practices — accessibility, responsive design, interaction patterns.
**Use as:** Final UI quality check before handoff to Reviewer.

## Testing Skills

### webapp-testing
**Status:** Installed (local)
**Invoke:** `webapp-testing`
**When:** You need to verify editor behavior in a real browser — screenshots, interaction testing, console log capture.
**What it does:** Playwright-based toolkit for browser interaction. Captures screenshots, clicks elements, fills forms, reads browser logs.
**Use case:** After building an editor, verify it renders correctly and dispatches operations as expected.

## Code Quality Skills

### simplify
**Status:** Available (built-in)
**Invoke:** `simplify`
**When:** After implementation — review changed code for reuse opportunities, quality issues, and efficiency improvements.
**What it does:** Reviews code and fixes issues found. Good pre-handoff self-check before the Reviewer sees the code.

### gitnexus-debugging
**Status:** Installed (global)
**Invoke:** `gitnexus-debugging`
**When:** Reducer logic fails or editor behavior is wrong — trace bugs through call chains using the knowledge graph.
**What it does:** Uses code knowledge graph to trace execution paths, find root causes, identify related bugs.

### gitnexus-refactoring
**Status:** Installed (global)
**Invoke:** `gitnexus-refactoring`
**When:** Refactoring existing code — plan safe refactors with blast radius and dependency mapping.
**What it does:** Maps dependencies, identifies affected files, plans refactor steps to minimize breakage.

## OpenSpec Skills (NOT YET INSTALLED)

The diagram envisions these for structured change management:

### openspec-propose (PLANNED)
**Status:** Not installed
**What it would do:** Propose code changes from a spec in a structured format.

### openspec-apply-change (PLANNED)
**Status:** Not installed
**What it would do:** Apply proposed changes to the codebase.

### openspec-archive-change (PLANNED)
**Status:** Not installed
**What it would do:** Archive completed changes to `openspec/changes/archive/YYYY-MM-DD-name/`.

**Current workaround:** The Developer implements directly from specs using `powervetra`. When openspec skills become available, they can be integrated to add structured change tracking.

## Skills NOT Used by the Developer

| Skill | Belongs to | Why not Developer |
|-------|-----------|-------------------|
| `requirements-clarity` | Analyst | Requirements gathering, not implementation |
| `faion-business-analyst` | Analyst, Architect | BA methodology, not coding |
| `pricing-strategy` | Analyst | Business decisions, not code |
| `agile-product-owner` | Analyst | Sprint planning, not implementation |
| `frontend-to-backend-requirements` | Analyst | Requirements capture, not implementation |
| `arscontexta:*` | Analyst, Architect | Knowledge management, not coding |
