---
summary: The four-tab layout (Product, Tiers, Services, Matrix) guides users from simple setup to complex pricing configuration
type: pattern
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[ux-flow map]]
---

# service offering editor uses four tabs for progressive complexity

The service-offering-editor progressive disclosure pattern:

1. **Product tab** — lowest complexity: name, description, thumbnail, template link, facet targeting
2. **Tiers tab** — medium complexity: create/edit pricing tiers with costs per billing cycle
3. **Services tab** — higher complexity: define line items, configure per-tier availability
4. **Matrix tab** — highest complexity: full pricing matrix with all tiers, services, and option groups

This progressive pattern works because each tab builds on the previous one — you can't meaningfully configure the matrix without first defining tiers and services.

The UX question is whether this flow supports iterative refinement (going back to adjust tiers after seeing the matrix) or primarily supports linear first-time setup.

---

Relevant Insights:
- [[service offering uses a four-tab editor flow for progressive configuration]] — the detailed context insight
- [[subscription editor separates operator and client views on the same document]] — different progressive disclosure approach

Topics:
- [[ux-flow map]]
