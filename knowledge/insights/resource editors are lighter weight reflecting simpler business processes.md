---
summary: Resource template and instance editors have fewer components than service/subscription editors matching their simpler domain logic
type: context
created: 2026-03-25
status: active
affects_models: [ResourceTemplate, ResourceInstance]
topics: [[ux-flow map]]
---

# resource editors are lighter weight reflecting simpler business processes

The resource-template-editor and resource-instance-editor are significantly simpler than the service-offering and subscription editors:

**Resource Template Editor:**
- Template info editing (title, summary, description)
- Markdown content editing
- Facet targeting configuration
- ~5 components

**Resource Instance Editor:**
- Profile management
- Provisioning lifecycle tracking
- Facet configuration
- External GraphQL queries for profile data
- ~5 components

This lighter weight reflects that resource management is more structured and less variable than pricing or subscription management. The business processes are simpler: define a template, provision an instance, manage its lifecycle.

The resource-instance-editor is notable for using external GraphQL queries — it reaches outside the document for profile data, unlike other editors that are self-contained.

---

Relevant Insights:
- [[editors follow a module-plus-components pattern with auto-generated hooks]] — same architecture, different scale
- [[resource instances model infrastructure provisioning with explicit lifecycle states]] — the domain the editor manages

Topics:
- [[ux-flow map]]
