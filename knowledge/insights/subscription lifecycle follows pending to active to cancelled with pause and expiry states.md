---
summary: SubscriptionInstance models the full SaaS lifecycle with intermediate states for pausing and expiry warnings
type: context
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance]
topics: [[subscription map]]
---

# subscription lifecycle follows pending to active to cancelled with pause and expiry states

The SubscriptionInstance state machine:

```
PENDING → ACTIVE → PAUSED → ACTIVE (resume)
                 → EXPIRING → CANCELLED
                 → CANCELLED (direct)
```

Key states:
- **PENDING** — subscription created but not yet activated
- **ACTIVE** — subscription is live, billing is running
- **PAUSED** — temporarily suspended (customer request or payment issue)
- **EXPIRING** — approaching end of term, not yet cancelled
- **CANCELLED** — subscription terminated

This covers standard SaaS lifecycle patterns. Notable gaps: there's no explicit UPGRADE/DOWNGRADE transition state, and tier changes within an active subscription aren't modeled as lifecycle events.

---

Relevant Insights:
- [[subscription editor has dual modes for operator and client views]] — operators manage lifecycle transitions
- [[subscription metrics track usage per service with current values and limits]] — metrics only relevant while ACTIVE

Topics:
- [[subscription map]]
