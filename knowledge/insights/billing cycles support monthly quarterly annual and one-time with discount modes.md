---
summary: ServiceOffering supports multiple billing cycles with configurable discount modes for longer commitments
type: context
created: 2026-03-25
status: active
affects_models: [ServiceOffering, SubscriptionInstance]
topics: [[service-offering map]], [[subscription map]]
---

# billing cycles support monthly quarterly annual and one-time with discount modes

The ServiceOffering model supports four billing cycles: monthly, quarterly, annual, and one-time. Each tier can have different pricing per cycle, and discount modes incentivize longer commitments.

Discount modes determine how pricing is calculated when customers choose longer billing cycles (e.g., annual vs monthly). The discount calculations live in pricing utility functions within the service-offering-editor.

This design covers standard SaaS billing patterns but raises questions about:
- How discounts compound when option groups are also selected
- Whether per-service billing cycle overrides are needed (currently billing cycle is at the offering level)
- How one-time charges interact with recurring billing for the same subscription

---

Relevant Insights:
- [[subscription lifecycle follows pending to active to cancelled with pause and expiry states]] — billing cycle affects subscription renewal
- [[tier pricing distinguishes setup costs from recurring costs]] — setup is typically one-time regardless of billing cycle

Topics:
- [[service-offering map]]
- [[subscription map]]
