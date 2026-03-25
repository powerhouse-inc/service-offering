---
summary: ResourceInstance suspension reasons differentiate customer-caused (non-payment) from operator-caused (maintenance) events
type: context
created: 2026-03-25
status: active
affects_models: [ResourceInstance]
topics: [[resource map]]
---

# suspension distinguishes non-payment from maintenance reasons

When a ResourceInstance is suspended, the model captures the reason:
- **Non-payment** — customer billing issue, implies potential service restoration upon payment
- **Maintenance** — operator-initiated, implies temporary and planned
- **Other** — catch-all for edge cases

This distinction matters for:
- Customer communication (different messaging for each reason)
- Automated restoration logic (maintenance suspensions auto-resume)
- Billing implications (non-payment may stop billing; maintenance should not)

---

Relevant Insights:
- [[resource instances model infrastructure provisioning with explicit lifecycle states]] — suspension is one lifecycle state

Topics:
- [[resource map]]
