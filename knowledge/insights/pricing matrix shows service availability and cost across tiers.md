---
summary: The matrix view cross-references services against tiers showing inclusion status and per-tier pricing in one dense view
type: context
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[service-offering map]]
---

# pricing matrix shows service availability and cost across tiers

The pricing matrix is the central business artifact of the ServiceOffering model. It's a grid where:
- **Rows** = services (line items in the offering)
- **Columns** = tiers (Basic, Pro, Enterprise, etc.)
- **Cells** = availability (included, optional, custom, not available) + pricing (setup cost, recurring cost)

This view makes it possible to see at a glance what each tier includes and how pricing varies. It's implemented in the Matrix tab of the service-offering-editor.

The matrix also incorporates option groups (add-ons), which add additional columns or sections to the grid.

This is architecturally the most complex component because it must render a dynamic grid based on the number of tiers, services, and option groups — all of which can be added/removed at any time.

---

Relevant Insights:
- [[service offering uses a four-tab editor flow for progressive configuration]] — matrix is the final tab
- [[option groups enable add-on pricing beyond base tiers]] — option groups extend the matrix

Topics:
- [[service-offering map]]
