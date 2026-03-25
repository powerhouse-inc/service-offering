---
summary: Resource templates and instances — blueprints, provisioning lifecycle, and facet-based configuration
type: moc
created: 2026-03-25
status: active
---

# resource map

ResourceTemplate defines reusable blueprints; ResourceInstance represents provisioned resources with lifecycle management. Facets provide the shared categorization system used across both.

## Core Ideas
- [[resource instances model infrastructure provisioning with explicit lifecycle states]] — draft, provisioning, active, suspended, terminated
- [[facets serve as the shared categorization primitive across all models]] — regions, tiers, storage sizes, etc.
- [[resource templates define target audiences and available configurations]] — the blueprint for what can be provisioned
- [[suspension distinguishes non-payment from maintenance reasons]] — important for customer communication
- [[resource instance configuration locks after activation requiring suspension to reconfigure]] — safety mechanism for provisioned infrastructure
- [[facet references use OIDs creating a decoupled but unvalidated reference pattern]] — cross-model reference design
- [[resource template has seven reducer modules making it the most operation-rich model]] — despite lighter editor
- [[createProductInstances mutation orchestrates team drive and triple document creation]] — the provisioning entry point

## Tensions
- ResourceInstance lifecycle is independent of SubscriptionInstance lifecycle — they could go out of sync
- Facet model has no editor, suggesting it may be managed programmatically or via another interface

## Open Questions
- Should resource provisioning status sync with subscription status automatically?
- How do facet changes propagate to existing instances that reference them?
- Is there a need for resource usage metrics separate from subscription metrics?
