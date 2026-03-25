---
summary: getUserSelectionPriceBreakdown is a pure client-side pricing engine that resolves tier-dependent vs standalone pricing with discount inheritance
type: pattern
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[service-offering map]], [[architecture map]]
---

# pricing utility computes full price breakdown with discount hierarchy and cycle conversion

The pricing engine at `document-models/service-offering/v1/src/utils.ts` (lines 263-368) is a pure function that computes total pricing given a user's selections:

**Input**: tier ID, billing cycle, selected option group IDs, per-group cycle overrides
**Output**: tier cycle total, option group breakdowns, setup group breakdowns, add-on breakdowns, grand recurring total

**Key algorithms:**
1. **Billing cycle conversion** — maps cycles to months (monthly=1, quarterly=3, semi-annual=6, annual=12, one-time=0)
2. **Pricing source resolution** — tier-dependent pricing takes precedence over standalone, falls back to empty
3. **Discount hierarchy** — direct discount on billing cycle option → inherited tier discount → no discount
4. **Discount application** — percentage: `amount × (1 - value/100)`, flat: `amount - value`, clamped to 0

This utility is NOT part of reducer logic — it's used by the editor UI to display pricing estimates. It has **no unit tests**, which is a gap given its complexity.

Supports per-group billing cycle overrides, enabling scenarios like "annual base tier but monthly add-on billing."

---

Relevant Insights:
- [[billing cycles support monthly quarterly annual and one-time with discount modes]] — the cycles this utility converts
- [[option groups enable add-on pricing beyond base tiers]] — option group pricing resolved here
- [[subscription tests verify operation recording but not state mutation accuracy]] — similar test gap pattern

Topics:
- [[service-offering map]]
- [[architecture map]]
