---
summary: The GraphQL subgraph only exposes two of five models leaving subscriptions and instances without external API access
type: context
created: 2026-03-25
status: active
affects_models: [ResourceTemplate, ServiceOffering]
topics: [[architecture map]]
---

# subgraph exposes resourceTemplates and serviceOfferings as top-level queries

The subgraph at `subgraphs/resources-services/` provides GraphQL queries for:
- `resourceTemplates` — query resource template data
- `serviceOfferings` — query service offering data

Notably absent:
- SubscriptionInstance — customer subscription data is not externally queryable
- ResourceInstance — provisioned resource data is not externally queryable
- Facet — categorization data is not directly queryable

This means external systems (billing integrations, customer portals, dashboards) can discover what's available (offerings, templates) but cannot query active subscriptions or provisioned resources through the subgraph.

This may be intentional (subscriptions contain sensitive customer data) or a gap to address.

---

Relevant Insights:
- [[facets serve as the shared categorization primitive across all models]] — facets not exposed in subgraph
- [[subscription metrics track usage per service with current values and limits]] — metrics not externally queryable

Topics:
- [[architecture map]]
