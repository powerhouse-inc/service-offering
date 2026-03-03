# Reviewer Agent — Skill Map

Complete inventory of skills available to the Reviewer Agent, organized by function.

## Core Review Skills (Self-Contained)

The Reviewer's primary workflows are defined in its own references:

### schema-audit-checklist.md
**Location:** `references/schema-audit-checklist.md`
**When:** Before any schema change ships, or on-demand for any model.
**What it does:** 4-step audit (state field check → operation check → subgraph alignment → report) plus pre-commit delivery checklist.

### query-field-mapping.md
**Location:** `references/query-field-mapping.md`
**When:** Verifying subgraph queries, preparing field lists for backend consumers.
**What it does:** Verified queries for serviceOfferings, resourceTemplates, createProductInstances. Last verified dates, excluded fields with reasons, dead weight notes.

### cleanup-history.md
**Location:** `references/cleanup-history.md`
**When:** Before approving any schema change that re-introduces a previously removed field.
**What it does:** Records what was removed, why, when, and what cleanup is still pending.

## Impact Analysis Skills

### gitnexus-impact-analysis
**Status:** Installed (global)
**Invoke:** `gitnexus-impact-analysis`
**When:** Reviewing schema changes — verify blast radius before approving. "Does this change break anything the Developer didn't account for?"
**What it does:** Analyzes code dependencies to identify all files affected by a change.
**Key use case:** Developer adds a new field — verify that editors, resolvers, and tests all handle it. Developer removes a field — verify no orphaned references remain.

## Code Quality Skills

### simplify
**Status:** Available (built-in)
**Invoke:** `simplify`
**When:** Reviewing implementation code for unnecessary complexity, missed reuse opportunities, or inefficient patterns.
**What it does:** Reviews changed code, identifies quality issues, and proposes fixes.
**Use as:** Complement to the tsc/lint quality gate — catches design-level issues that linters miss.

## Quality Gate (from CLAUDE.md)

These are not skills but MANDATORY actions the Reviewer runs:

```bash
npm run tsc      # TypeScript check — must pass
npm run lint:fix # ESLint check — must pass
```

Failure of either is a BLOCKER. No exceptions.

## Knowledge Management Skills (requires arscontexta vault setup)

### arscontexta:health
**Status:** Plugin installed, vault NOT initialized
**Invoke:** `/health`
**When:** Weekly or pre-delivery — check for orphaned decisions, stale documentation, broken links in knowledge base.
**What it does:** 8-category diagnostics (schema compliance, orphan detection, link health, description quality, three-space boundaries, processing throughput, stale notes, MOC coherence). Returns FAIL/WARN/PASS report.
**Prerequisite:** Run `/setup` to initialize the arscontexta vault.

### arscontexta:ask
**Status:** Plugin installed, vault NOT initialized
**Invoke:** `/ask`
**When:** You need historical context during review — "was this field removed before?", "what was the rationale for this pattern?"
**Prerequisite:** Run `/setup` to initialize the arscontexta vault.

## Persistent Context

The Reviewer always has access to:

| Source | Loaded | Provides |
|--------|--------|----------|
| `CLAUDE.md` | Always (auto) | QA commands, commit conventions, reducer rules (to verify against) |
| Own references | On demand | Audit checklist, query mapping, cleanup history |
| `powervetra` references | On demand (if needed) | Schema conventions to verify implementations against |

## Skills NOT Used by the Reviewer

| Skill | Belongs to | Why not Reviewer |
|-------|-----------|------------------|
| `requirements-clarity` | Analyst | Requirements gathering, not review |
| `faion-business-analyst` | Analyst, Architect | BA methodology, not audit |
| `powervetra` | Architect, Developer | Implementation skill — Reviewer audits, doesn't implement |
| `react-best-practices` | Developer | Code-level concern — Reviewer checks correctness, not perf optimization |
| `frontend-design` | Developer | UI implementation, not audit |
| `webapp-testing` | Developer | Testing, not review |
| `ui-ux-pro-max` | Developer | Design patterns, not audit |
| `openspec-*` | Developer | Change management, not review |
