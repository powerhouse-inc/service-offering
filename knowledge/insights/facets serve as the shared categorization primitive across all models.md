---
summary: The Facet model provides configurable categorization (region, tier, storage) used by templates, instances, and offerings
type: pattern
created: 2026-03-25
status: active
affects_models: [Facet, ResourceTemplate, ResourceInstance, ServiceOffering]
topics: [[resource map]], [[architecture map]]
---

# facets serve as the shared categorization primitive across all models

The Facet document model is the foundational categorization system. Each facet:
- Has a name (e.g., "Region", "Storage Size", "Support Tier")
- Contains discrete options with labels (e.g., "us-east-1", "us-west-2")
- Is referenced by ResourceTemplate (targeting), ResourceInstance (configuration), and ServiceOffering (audience targeting)

Notably, the Facet model has no dedicated editor — it's the only model of the five without one. This suggests facets are either managed programmatically, through a separate admin interface, or are considered stable enough to not need frequent editing.

The cross-model nature of facets makes them an integration point: changing a facet's options could affect all models that reference it.

---

Relevant Insights:
- [[resource templates define target audiences and available configurations]] — templates use facets for targeting
- [[resource instances model infrastructure provisioning with explicit lifecycle states]] — instances store facet selections

Topics:
- [[resource map]]
- [[architecture map]]
