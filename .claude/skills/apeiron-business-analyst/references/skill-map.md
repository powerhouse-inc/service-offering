# Analyst Agent — Skill Map

Complete inventory of skills available to the Analyst Agent, organized by function.

## Core Analysis Skills

### requirements-clarity
**Status:** Installed (symlink)
**Invoke:** `requirements-clarity`
**When:** Feature request is vague, incomplete, or missing acceptance criteria.
**What it does:** Runs a 100-point scoring loop across 4 dimensions (Functional Clarity, Technical Specificity, Implementation Completeness, Business Context). Iterates with focused questions until score ≥90. Outputs a PRD to `docs/prds/`.
**Key behavior:** Asks 2-3 questions per round, builds on previous answers, won't generate PRD until score ≥90.

### faion-business-analyst
**Status:** Installed (symlink), user-invocable: false
**Invoke:** Invoked internally, not directly by user
**When:** You need structured BA methodology — stakeholder mapping, elicitation techniques, process modeling, use cases.
**What it does:** BABOK-based orchestrator. Routes to sub-skills:
- "Stakeholders" → stakeholder-analysis
- "Gather requirements" → elicitation-techniques
- "Document" → use-cases, user-stories
- "Model processes" → BPMN, data-models
- "Analyze strategy" → current state, future state, gap analysis

### agile-product-owner
**Status:** Installed (symlink)
**Invoke:** `agile-product-owner`
**When:** Requirements need to be broken into INVEST-compliant user stories for sprint planning, or you need velocity tracking and backlog prioritization.
**What it does:** Generates user stories, sprint plans, acceptance criteria. Manages backlog prioritization.

## Domain-Specific Skills

### pricing-strategy
**Status:** Installed (symlink)
**Invoke:** `pricing-strategy`
**When:** Feature involves pricing tiers, billing cycles, monetization, packaging, or free trial decisions.
**What it does:** Covers pricing research, tier structure, packaging strategy, Van Westendorp analysis, willingness-to-pay frameworks.
**Relevant to:** Service offering pricing model, option group pricing modes, billing cycle discounts.

### frontend-to-backend-requirements
**Status:** Installed (symlink)
**Invoke:** `frontend-to-backend-requirements`
**When:** Feature has UI implications and you need to document what data the frontend needs from backend.
**What it does:** Writes to `.claude/docs/ai/<feature-name>/backend-requirements.md`. Documents *what* data is needed, not *how* to implement it. Frontend owns requirements, backend owns implementation.
**Key rule:** NO implementation details — don't specify endpoints, field names, or API structure.

## Communication Skills

### professional-communication
**Status:** Installed (symlink)
**Invoke:** `professional-communication`
**When:** Drafting stakeholder communications, meeting agendas, or requirement summaries for non-technical audiences.
**What it does:** Guides email structure, team messaging etiquette, meeting agendas. Adapts tone for technical vs non-technical audiences.

## Knowledge Management Skills (requires arscontexta vault setup)

### arscontexta:ask
**Status:** Plugin installed, vault NOT initialized
**Invoke:** `/ask` or `arscontexta:ask`
**When:** You need to query prior domain decisions ("why did we remove serviceGroups?", "what was the rationale for facetTargets?").
**What it does:** Routes questions through a 3-tier knowledge base (WHY → research claims, HOW → guidance docs, WHAT IT LOOKS LIKE → domain examples).
**Prerequisite:** Run `/setup` to initialize the arscontexta vault.

### arscontexta:add-domain
**Status:** Plugin installed, vault NOT initialized
**Invoke:** `/add-domain`
**When:** A new workstream introduces a new knowledge domain that needs its own vocabulary, templates, and folder structure.
**What it does:** Derives domain-specific configuration through conversation, generates domain folders and templates.
**Prerequisite:** Run `/setup` to initialize the arscontexta vault.

## Skills NOT Used by the Analyst

These skills exist but belong to other Apeiron stages:

| Skill | Belongs to | Why not Analyst |
|-------|-----------|-----------------|
| `powervetra` | Architect, Developer | Schema design and implementation — Analyst captures *what*, not *how* |
| `react-best-practices` | Developer | Code-level concern |
| `frontend-design` | Developer | UI implementation |
| `webapp-testing` | Developer | Testing implementation |
| `gitnexus-*` | Architect, Developer, Reviewer | Code-level analysis |
| `simplify` | Developer, Reviewer | Code quality review |
