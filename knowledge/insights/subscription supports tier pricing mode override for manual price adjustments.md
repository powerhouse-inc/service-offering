---
summary: TierPricingMode has CALCULATED and MANUAL_OVERRIDE variants allowing operators to override computed tier prices
type: context
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance, ServiceOffering]
topics: [[subscription map]], [[service-offering map]]
---

# subscription supports tier pricing mode override for manual price adjustments

The SubscriptionInstance schema includes `tierPricingMode` with two variants:
- **CALCULATED** — price comes from the ServiceOffering tier definition
- **MANUAL_OVERRIDE** — operator has overridden the tier price for this subscription

This enables:
- Custom pricing for strategic customers
- Negotiated enterprise deals that don't fit standard tiers
- Promotional pricing without changing the offering itself

Combined with `operatorNotes`, this creates a pattern where operators can adjust pricing and document why — important for B2B SaaS where pricing is often negotiated.

The interaction between manual overrides and discount calculations is worth monitoring — does a manual override bypass discounts, or do discounts apply on top of the override?

---

Relevant Insights:
- [[operator notes provide internal context that clients never see]] — notes explain override rationale
- [[billing cycles support monthly quarterly annual and one-time with discount modes]] — discount interaction with overrides

Topics:
- [[subscription map]]
- [[service-offering map]]
