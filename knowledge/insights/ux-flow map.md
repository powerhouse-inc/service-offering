---
summary: Editor user flows, component patterns, and interaction design across all four editors
type: moc
created: 2026-03-25
status: active
---

# ux-flow map

How users interact with the service-offering editors — the flows, components, and UX patterns.

## Core Ideas
- [[service offering editor uses four tabs for progressive complexity]] — Product → Tiers → Services → Matrix
- [[subscription editor separates operator and client views on the same document]] — dual-mode access pattern
- [[resource editors are lighter weight reflecting simpler business processes]] — template and instance editors have fewer components
- [[service offering editor tracks tab completion with progressive readiness gates]] — completion criteria gate progression
- [[subscription import creates a one-time snapshot from service offering with no back-sync]] — snapshot design with no sync
- [[facet targeting presets are hardcoded in the resource template editor]] — should read from Facet documents
- [[editors lack bulk operations versioning and workflow automation]] — evolution roadmap

## Tensions
- The service-offering editor's pricing matrix is powerful but complex — may overwhelm new users
- There's no preview or simulation mode for pricing changes before they take effect

## Open Questions
- Should the pricing matrix support a "what-if" mode for exploring pricing scenarios?
- How could the editors surface cross-model relationships (e.g., which subscriptions use this offering)?
- Is there a need for a dashboard view that aggregates across all document types?
