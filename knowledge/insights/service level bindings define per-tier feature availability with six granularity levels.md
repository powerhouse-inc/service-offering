---
summary: Each service-tier combination has a ServiceLevel enum (INCLUDED, OPTIONAL, CUSTOM, VARIABLE, NOT_APPLICABLE, NOT_INCLUDED) enabling fine-grained feature matrices
type: context
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[service-offering map]]
---

# service level bindings define per-tier feature availability with six granularity levels

The ServiceLevelBinding type maps each service to a tier with a ServiceLevel enum:

- **INCLUDED** — always provided in this tier
- **NOT_INCLUDED** — not available in this tier
- **OPTIONAL** — customer can toggle on/off
- **CUSTOM** — per-instance customization (e.g., "custom analytics dashboard")
- **VARIABLE** — metered/usage-based, paired with ServiceUsageLimit
- **NOT_APPLICABLE** — feature concept doesn't apply to this tier

This six-level granularity goes beyond simple included/not-included and supports complex SaaS models where features have different access modes per tier. Each binding can also specify a `customValue` string and link to an option group for upgrades.

The pricing matrix in the editor renders these bindings as a grid — making the matrix view the central place to understand what each tier actually provides.

---

Relevant Insights:
- [[pricing matrix shows service availability and cost across tiers]] — renders these bindings
- [[service offering uses a four-tab editor flow for progressive configuration]] — bindings created in Services tab

Topics:
- [[service-offering map]]
