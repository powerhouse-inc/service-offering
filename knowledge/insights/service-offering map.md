---
summary: Architecture and business logic of the ServiceOffering document model — tiers, pricing, services, and billing
type: moc
created: 2026-03-25
status: active
---

# service-offering map

The ServiceOffering model is the most complex in the ecosystem. It defines service packages with tiers, per-tier pricing, services (line items), option groups (add-ons), and billing cycles with discount modes.

## Core Ideas
- [[service offering uses a four-tab editor flow for progressive configuration]] — Product, Tiers, Services, Matrix
- [[pricing matrix shows service availability and cost across tiers]] — the central business artifact
- [[option groups enable add-on pricing beyond base tiers]] — flexibility for upselling
- [[billing cycles support monthly quarterly annual and one-time with discount modes]] — covers standard SaaS billing patterns
- [[tier pricing distinguishes setup costs from recurring costs]] — important for enterprise onboarding

## Tensions
- The pricing matrix is the most powerful view but also the most complex component to maintain
- Option groups and services share similar structures but are modeled differently

## Open Questions
- How should volume-based or usage-based pricing be represented beyond flat tier pricing?
- Should the pricing matrix support comparison views for customer-facing use?
- How do discount modes interact across option groups and base tiers?
