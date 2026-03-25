---
summary: Customer subscription lifecycle — billing, metrics, services, and operator workflows
type: moc
created: 2026-03-25
status: active
---

# subscription map

The SubscriptionInstance model represents a customer's active subscription. It tracks billing, selected services, usage metrics, and supports dual operator/client views.

## Core Ideas
- [[subscription lifecycle follows pending to active to cancelled with pause and expiry states]] — standard SaaS lifecycle
- [[subscription editor has dual modes for operator and client views]] — same document, different permissions and visibility
- [[subscription metrics track usage per service with current values and limits]] — enables usage-based monitoring
- [[operator notes provide internal context that clients never see]] — operational intelligence

## Tensions
- Metrics are tracked per-service but there's no aggregation or alerting mechanism
- The lifecycle model doesn't capture upgrade/downgrade transitions between tiers

## Open Questions
- Should subscription changes (tier upgrades, service additions) create audit trails?
- How do usage metrics relate to billing — is overage pricing modeled?
- Could auto-renewal logic trigger notifications before expiry?
