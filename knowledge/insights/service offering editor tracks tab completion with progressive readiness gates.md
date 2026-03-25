---
summary: Each tab has completion criteria (template selected, 2+ tiers, 1+ service, 50% matrix coverage) that gate progression
type: pattern
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[ux-flow map]], [[service-offering map]]
---

# service offering editor tracks tab completion with progressive readiness gates

The service-offering-editor enforces progressive readiness across its four tabs:

- **Scope-Facets**: Requires `resourceTemplateId` selected
- **Tier-Definition**: Requires 2+ tiers created
- **Service-Catalog**: Requires 1+ service in a valid group
- **The-Matrix**: Requires 50%+ service-to-tier coverage

A floating "Next" FAB appears when scrolling hides the bottom navigation button, providing smart navigation.

This pattern ensures users build up the offering structure correctly before reaching the complex pricing matrix. However, the flow is primarily linear — jumping back to adjust tiers after seeing the matrix impact is supported but not guided.

Key components: `OfferingProgress.tsx` (tab progress bars), `TAB_ORDER` constant enforcing sequence.

---

Relevant Insights:
- [[service offering uses a four-tab editor flow for progressive configuration]] — the tab architecture
- [[service offering editor uses four tabs for progressive complexity]] — the UX pattern

Topics:
- [[ux-flow map]]
- [[service-offering map]]
