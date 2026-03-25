---
description: Why each configuration dimension was chosen — the reasoning behind initial system setup
category: derivation-rationale
created: 2026-03-25
status: active
---

# derivation rationale for service-offering

This knowledge system was derived for the `@powerhousedao/service-offering` ecosystem — a Powerhouse package containing five document models, four editors, a subgraph, and processors for managing SaaS service offerings, subscriptions, and resource provisioning.

## Why These Dimensions

**Moderate granularity** was chosen because project insights are coherent observations, not atomic claims. An insight like "the pricing matrix doesn't support per-service billing cycle overrides" is a complete thought that needs context, evidence, and recommendations together.

**Heavy processing** reflects the continuous improvement goal. The user wants to track how the codebase evolves, surface gaps, and identify patterns — this requires active extraction, connection-finding, and evolution of old insights as code changes.

**Dense schema** with six extraction categories (business-gap, architecture, domain-model, ux-flow, pricing, integration) captures the multi-faceted nature of the project. Each category surfaces different types of improvement opportunities.

**3-tier navigation** maps naturally to the project structure: a hub index links to domain maps (service-offering, subscription, resource, architecture, UX), which link to individual insights.

**Full automation** leverages the Claude Code platform for hooks, skills, and pipeline processing.

## Platform

Claude Code with full automation ceiling. Vault lives inside the repo at `knowledge/` to keep project intelligence co-located with the code it describes.

## Key Design Decisions

- Vault is project-scoped (inside the repo), not user-scoped
- Insights track codebase evolution — temporal staleness is the primary risk
- Six extraction categories cover both technical and business dimensions
- The processing pipeline emphasizes distillation quality over capture speed

---

Topics:
- [[methodology]]
