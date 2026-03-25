---
summary: FacetTargeting component has hardcoded presets (SNO Function, Legal Entity, Team, Anonymity) rather than reading from Facet documents
type: idea
created: 2026-03-25
status: open
affects_models: [ResourceTemplate, Facet]
topics: [[resource map]], [[ux-flow map]]
---

# facet targeting presets are hardcoded in the resource template editor

The `FacetTargeting.tsx` component in the resource-template-editor contains hardcoded facet presets:

- **SNO Function** → Operational Hub, IP SPV, Revenue Generating Hub, etc.
- **Legal Entity** → Swiss Association, BVI Entity
- **Team** → Remote, Local, Hybrid
- **Anonymity** → High, Highest

These presets should ideally be read from actual Facet documents rather than hardcoded. Currently:
- Adding a new facet option requires editor code changes
- The Facet document model exists but has no editor — it's managed separately
- There's no dynamic query to fetch available facets from the system

This is likely a development-time shortcut that should be addressed as the product matures. A dynamic facet selector that queries Facet documents would make the template editor self-maintaining.

---

Relevant Insights:
- [[facets serve as the shared categorization primitive across all models]] — facets should be the source of truth
- [[facet references use OIDs creating a decoupled but unvalidated reference pattern]] — the reference pattern these presets bypass

Topics:
- [[resource map]]
- [[ux-flow map]]
