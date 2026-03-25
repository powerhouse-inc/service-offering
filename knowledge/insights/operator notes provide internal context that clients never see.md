---
summary: SubscriptionInstance includes operator-only notes for internal team context about the customer relationship
type: context
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance]
topics: [[subscription map]]
---

# operator notes provide internal context that clients never see

The SubscriptionInstance model includes an operator notes field that's only visible in operator mode. This supports:
- Internal remarks from support or sales teams
- Context about customer negotiations or special arrangements
- Flags for renewal discussions or churn risk
- Implementation notes for custom configurations

This is a simple but important pattern for B2B SaaS where customer relationships involve context that shouldn't be exposed to the client view.

---

Relevant Insights:
- [[subscription editor has dual modes for operator and client views]] — notes only appear in operator mode

Topics:
- [[subscription map]]
