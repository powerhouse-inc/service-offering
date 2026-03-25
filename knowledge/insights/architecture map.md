---
summary: Reducer patterns, editor architecture, subgraph design, and cross-cutting technical decisions
type: moc
created: 2026-03-25
status: active
---

# architecture map

Technical patterns and decisions across the service-offering ecosystem — how document models, editors, and the subgraph are structured.

## Core Ideas
- [[reducers use mutative for direct state mutation with pure synchronous semantics]] — Powerhouse convention enabling clean reducer code
- [[editors follow a module-plus-components pattern with auto-generated hooks]] — consistent architecture across all four editors
- [[subgraph exposes resourceTemplates and serviceOfferings as top-level queries]] — the external API surface
- [[all dynamic values must come from operation input not generated in reducers]] — non-deterministic operations are forbidden
- [[reducers enforce no cross-cutting validation leaving business rules to the UI]] — deliberate tradeoff
- [[subscription tests verify operation recording but not state mutation accuracy]] — test coverage gap
- [[pricing utility computes full price breakdown with discount hierarchy and cycle conversion]] — untested pricing engine
- [[createProductInstances mutation orchestrates team drive and triple document creation]] — cross-model orchestration
- [[facet references use OIDs creating a decoupled but unvalidated reference pattern]] — reference integrity gap
- [[resource instance configuration locks after activation requiring suspension to reconfigure]] — lifecycle safety pattern

## Tensions
- Generated code in gen/ and hand-written code in src/ must stay synchronized — two-step update process
- The subgraph only exposes two of five models — some data is only accessible through the document system

## Open Questions
- Should the subgraph expose SubscriptionInstance queries for external billing integrations?
- Are there shared reducer utilities that could be extracted across models?
- How should cross-model validation work (e.g., subscription referencing a valid offering)?
