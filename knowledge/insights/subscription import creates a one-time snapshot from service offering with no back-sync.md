---
summary: mapOfferingToSubscription converts an offering snapshot into subscription input at creation time but changes to the offering never propagate
type: decision
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance, ServiceOffering]
topics: [[subscription map]], [[architecture map]]
---

# subscription import creates a one-time snapshot from service offering with no back-sync

The `mapOfferingToSubscription()` function in `editors/subscription-instance-editor/components/mapOfferingToSubscription.ts` converts a ServiceOffering into `InitializeSubscriptionInput`:

1. Locates the selected tier by ID
2. Maps option group + add-on breakdowns into service groups (using price breakdown)
3. Maps standalone services with tier service levels and usage limits
4. Calculates tier price (CALCULATED mode sums groups; MANUAL_OVERRIDE uses manual price)
5. Filters out unselected add-on services

**Critical design choice**: This is a one-time snapshot. After subscription creation:
- Changing the ServiceOffering does NOT update existing subscriptions
- There's no mechanism to "re-sync" a subscription with its source offering
- Price changes only affect new subscriptions

This is standard for subscription billing (you don't change existing contracts) but means there's no way to batch-apply price adjustments or offering changes to existing customers. An "upgrade path" feature would need to bridge this gap.

---

Relevant Insights:
- [[pricing utility computes full price breakdown with discount hierarchy and cycle conversion]] — used during the mapping
- [[subscription lifecycle follows pending to active to cancelled with pause and expiry states]] — the subscription lives independently after creation

Topics:
- [[subscription map]]
- [[architecture map]]
