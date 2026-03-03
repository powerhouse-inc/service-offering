# Architect Agent — Skill Map

Complete inventory of skills available to the Architect Agent, organized by function.

## Core Design Skills

### powervetra
**Status:** Installed (local)
**Invoke:** `powervetra` (auto-triggered on Powerhouse mentions)
**When:** Designing any schema, planning operations, or referencing Powerhouse conventions.
**What it does:** Comprehensive Powerhouse/Vetra skill — document model structure, GraphQL schema rules, available scalars, MCP tool reference, editor patterns, subgraph patterns.
**Key references to load:**
- `references/graphql-schema.md` — full schema rules, custom scalar creation
- `references/document-models.md` — all 37 operations, reducer rules
- `references/subgraphs-processors.md` — subgraph schema/resolver patterns

**CRITICAL:** Before proposing any schema, consult powervetra for:
- State type naming: `<ModelName>State` (not `GlobalState`)
- Array convention: `[ObjectType!]!` with `id: OID!`
- Available scalars (OID, PHID, Amount_Money, Currency, DateTime, URL, etc.)
- Most fields optional (documents start empty)

### faion-business-analyst (modeling sub-skills)
**Status:** Installed (symlink), user-invocable: false
**When:** You need process modeling (BPMN, data flow diagrams) to understand the domain before designing schema types.
**What it does:** Routes to modeling tools — BPMN workflows, data models, use case diagrams.
**Use case:** Complex features where you need to visualize the process before deciding on types and operations.

## Impact Analysis Skills

### gitnexus-impact-analysis
**Status:** Installed (global)
**Invoke:** `gitnexus-impact-analysis`
**When:** Before proposing schema changes — assess blast radius across editors, resolvers, subgraphs, and tests.
**What it does:** Analyzes what code depends on the types/fields you're about to change. Prevents proposing changes that silently break downstream consumers.
**Key question it answers:** "If I add/remove/rename this type, what files need to change?"

### gitnexus-exploring
**Status:** Installed (global)
**Invoke:** `gitnexus-exploring`
**When:** Navigating unfamiliar parts of the codebase to understand existing patterns before designing new ones.
**What it does:** Uses a knowledge graph to navigate code structure — find related files, trace dependencies, understand architecture.
**Use case:** When the requirements touch a model you haven't worked with before.

## Visualization Skills

### visual-explainer
**Status:** Installed (global)
**Invoke:** `visual-explainer`
**When:** You need to present a schema proposal visually — architecture diagrams, type relationship diagrams, data flow visualization.
**What it does:** Generates self-contained HTML pages with diagrams, tables, and visual explanations.
**Use case:** Instead of a wall of GraphQL text, show the type relationships as a visual diagram for human review.

## Knowledge Management Skills (requires arscontexta vault setup)

### arscontexta:architect
**Status:** Plugin installed, vault NOT initialized
**Invoke:** `arscontexta:architect`
**When:** You need research-backed architecture advice — should this be a new model or an extension? Which pattern fits?
**What it does:** Analyzes health reports, friction patterns, and derivation history to propose specific changes with research justification.
**Prerequisite:** Run `/setup` to initialize the arscontexta vault.

### arscontexta:recommend
**Status:** Plugin installed, vault NOT initialized
**Invoke:** `/recommend`
**When:** You're choosing between architectural approaches and want grounded recommendations.
**What it does:** Takes use case, constraints, and goals → returns specific recommendations with rationale.
**Prerequisite:** Run `/setup` to initialize the arscontexta vault.

### arscontexta:ask
**Status:** Plugin installed, vault NOT initialized
**Invoke:** `/ask`
**When:** You need domain context before designing — "what was the rationale for separating resource-template from service-offering?"
**Prerequisite:** Run `/setup` to initialize the arscontexta vault.

## Persistent Context

The Architect always has access to:

| Source | Loaded | Provides |
|--------|--------|----------|
| `CLAUDE.md` | Always (auto) | GraphQL schema guidelines, state type naming, available scalars, MCP rules |
| `powervetra` SKILL.md | On demand | Full Powerhouse domain knowledge, schema conventions |
| `apeiron-reviewer/references/cleanup-history.md` | On demand | What was removed and why — check before re-adding |
| `apeiron-reviewer/references/query-field-mapping.md` | On demand | Current verified queries — what fields are live |

## Skills NOT Used by the Architect

| Skill | Belongs to | Why not Architect |
|-------|-----------|------------------|
| `requirements-clarity` | Analyst | Requirements are input to Architect, not its job |
| `frontend-to-backend-requirements` | Analyst | Data needs capture, not schema design |
| `react-best-practices` | Developer | Code-level concern |
| `frontend-design` | Developer | UI implementation |
| `webapp-testing` | Developer | Testing |
| `simplify` | Developer, Reviewer | Code review, not schema design |
