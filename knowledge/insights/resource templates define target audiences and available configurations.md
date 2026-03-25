---
summary: ResourceTemplate blueprints specify which audiences and facet configurations are available for resource provisioning
type: context
created: 2026-03-25
status: active
affects_models: [ResourceTemplate]
topics: [[resource map]]
---

# resource templates define target audiences and available configurations

ResourceTemplate is the blueprint layer. Each template:
- Defines basic info (title, summary, description)
- Specifies target audiences
- Lists available services
- References facets to determine which configurations are supported
- Can include content sections and FAQs

Templates serve as the bridge between abstract service definitions and concrete provisioned instances. A ServiceOffering may link to a ResourceTemplate to define what customers are actually getting.

The resource-template-editor is relatively lightweight — template info editing, markdown content, and facet targeting — reflecting that templates change less frequently than instances.

---

Relevant Insights:
- [[facets serve as the shared categorization primitive across all models]] — templates use facets for configuration targeting
- [[resource instances model infrastructure provisioning with explicit lifecycle states]] — instances are created from templates

Topics:
- [[resource map]]
