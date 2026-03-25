---
summary: Each service within a subscription tracks usage metrics with current value and limit enabling usage-based monitoring
type: context
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance]
topics: [[subscription map]]
---

# subscription metrics track usage per service with current values and limits

The SubscriptionInstance model tracks metrics per selected service:
- **Current value** — how much of the service has been consumed (e.g., 50,000 API calls)
- **Limit** — the maximum allowed under the current tier/plan (e.g., 100,000 API calls)

This enables usage-based monitoring and could support usage percentage calculations, threshold alerts, and overage detection.

Current gaps:
- No aggregation across services (total usage view)
- No historical tracking (only current period values)
- No alerting mechanism when usage approaches limits
- Overage pricing is not modeled — what happens when current exceeds limit?

---

Relevant Insights:
- [[subscription lifecycle follows pending to active to cancelled with pause and expiry states]] — metrics only meaningful while active
- [[billing cycles support monthly quarterly annual and one-time with discount modes]] — metrics likely reset per billing cycle

Topics:
- [[subscription map]]
