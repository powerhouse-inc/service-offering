---
summary: ResourceTemplate has 7 modules with 30+ operations covering template metadata audiences facets services option groups content and categories
type: context
created: 2026-03-25
status: active
affects_models: [ResourceTemplate]
topics: [[resource map]], [[architecture map]]
---

# resource template has seven reducer modules making it the most operation-rich model

Despite having a "lighter weight" editor, ResourceTemplate has the most modular reducer architecture:

| Module | Operations | Purpose |
|--------|-----------|---------|
| template-management | 4 ops | Core metadata, status, operator |
| audience-management | 2 ops | Target audience segmentation |
| facet-targeting | 4 ops | Facet category/option selection |
| service-category-management | 2 ops | Setup vs recurring service labels |
| service-management | 5 ops | Service CRUD + facet bindings |
| option-group-management | 6 ops | Option groups + FAQ management |
| content-section-management | 4 ops | Expandable content sections |

The model supports hierarchical services (`parentServiceId`), FAQ fields, content sections, and detailed facet bindings per service (`ResourceFacetBinding` with `supportedOptions` constraining valid facet choices).

This richness suggests the template is designed to be a comprehensive product catalog entry, not just a simple blueprint — it contains marketing content (FAQs, content sections), audience targeting, and detailed service specifications.

---

Relevant Insights:
- [[resource templates define target audiences and available configurations]] — the business purpose
- [[resource editors are lighter weight reflecting simpler business processes]] — editor is simpler despite model complexity

Topics:
- [[resource map]]
- [[architecture map]]
