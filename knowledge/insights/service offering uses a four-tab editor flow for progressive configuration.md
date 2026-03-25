---
summary: The editor organizes complexity into Product, Tiers, Services, and Matrix tabs so users build up pricing progressively
type: context
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[service-offering map]], [[ux-flow map]]
---

# service offering uses a four-tab editor flow for progressive configuration

The service-offering-editor is the most complex editor in the ecosystem. It uses a four-tab flow:

1. **Product** — Basic info (title, summary, description, thumbnail), link to a ResourceTemplate, and facet targeting
2. **Tiers** — Create pricing tiers (Basic, Pro, Enterprise) with setup and recurring costs per billing cycle
3. **Services** — Add line-item services, configure which are included/optional/custom per tier
4. **Matrix** — The pricing matrix view showing service availability and pricing across all tiers and option groups

This progressive flow means users must configure the foundation (product identity and tiers) before they can define the detailed pricing matrix. The matrix tab is both the culmination and the most complex view.

The editor lives at `editors/service-offering-editor/` with custom CSS in `editor.css` and pricing utilities in the components directory.

---

Relevant Insights:
- [[pricing matrix shows service availability and cost across tiers]] — the matrix tab is the central artifact
- [[option groups enable add-on pricing beyond base tiers]] — option groups add another dimension to the matrix

Topics:
- [[service-offering map]]
- [[ux-flow map]]
