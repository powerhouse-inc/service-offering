---
summary: Each tier has separate setup (one-time) and recurring cost fields enabling enterprise onboarding fee models
type: context
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[service-offering map]]
---

# tier pricing distinguishes setup costs from recurring costs

Each pricing tier in a ServiceOffering has two cost dimensions:
- **Setup cost** — one-time fee charged at subscription creation (e.g., onboarding, implementation)
- **Recurring cost** — ongoing fee charged per billing cycle

This separation is important for enterprise SaaS where implementation fees, training costs, or custom integration work are common alongside the recurring subscription price.

The same separation applies at the service level (individual line items can have their own setup and recurring costs within a tier).

---

Relevant Insights:
- [[billing cycles support monthly quarterly annual and one-time with discount modes]] — recurring costs vary by billing cycle
- [[pricing matrix shows service availability and cost across tiers]] — both cost types appear in the matrix

Topics:
- [[service-offering map]]
