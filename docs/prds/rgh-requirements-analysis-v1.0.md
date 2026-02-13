# Stakeholder Requirements Analysis Report

**Source**: [rgh requirements SO.md](rgh%20requirements%20SO.md)
**Date**: 2026-02-12
**Status**: Pending stakeholder clarification

---

## Part 1 — Requirements Clarity Assessment

**Current Clarity Score: 52/100**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functional Clarity | 18/30 | Pricing relocation is clear, but interaction patterns (UI, migration) undefined |
| Technical Specificity | 12/25 | No mention of schema changes, migration strategy, or backward compatibility |
| Implementation Completeness | 10/25 | No edge cases, no error handling, no validation rules |
| Business Context | 12/20 | Problem implied (flexibility for billing cycle discounts), but no success metrics or user scenarios |

**What's Clear:**
- Pricing must move from service level to service group level
- Service groups must carry both one-time and recurring costs
- Pricing should be per-tier, per-billing-cycle on service groups (discount matrix)
- One-time costs are independent; only one recurring option applies
- Metrics structure is confirmed correct; metrics inherit billing cycle from parent group

**Needs Clarification (see Part 3):**
- How does per-tier, per-billing-cycle group pricing relate to existing `TierPricingOption`?
- What happens to existing service-level pricing data during migration?
- How does the subscription instance side reflect this restructuring?
- What does the UI experience look like for configuring group-level pricing?

---

## Part 2 — Cross-Reference with Current Document Models

### Requirement 1: "Remove pricing from individual service level"

**Current state in `service-offering/schema.graphql`:**
```graphql
type Service {
    # ...
    costType: ServiceCostType   # RECURRING | SETUP  ← TO REMOVE
    price: Amount_Money          # ← TO REMOVE
    currency: Currency           # ← TO REMOVE
}
```

**Impact:**

| Model | Type/Input | Fields to Remove | Severity |
|-------|-----------|-----------------|----------|
| Service Offering | `Service` type | `costType`, `price`, `currency` | **BREAKING** |
| Service Offering | `AddServiceInput` | `costType`, `price`, `currency` | **BREAKING** |
| Service Offering | `UpdateServiceInput` | `costType`, `price`, `currency` | **BREAKING** |
| Subscription Instance | `Service` type | `setupCost`, `recurringCost` | **BREAKING** |
| Subscription Instance | `AddServiceInput` | all `setup*` / `recurring*` fields | **BREAKING** |
| Subscription Instance | `AddServiceToGroupInput` | all `setup*` / `recurring*` fields | **BREAKING** |
| Subscription Instance | `UpdateServiceSetupCostOperation` | entire operation | **DELETE** |
| Subscription Instance | `UpdateServiceRecurringCostOperation` | entire operation | **DELETE** |
| Subscription Instance | `ReportSetupPaymentOperation` | entire operation | **DELETE** |
| Subscription Instance | `ReportRecurringPaymentOperation` | entire operation | **DELETE** |

### Requirement 2: "Define pricing at service group level with one-time + recurring"

**Current state in `service-offering/schema.graphql`:**
```graphql
type ServiceGroup {
    id: OID!
    name: String!
    description: String
    billingCycle: BillingCycle!   # Already has billing cycle
    displayOrder: Int
    # ← NO pricing fields exist
}
```

**What needs to be added to `ServiceGroup` (service-offering side):**

| New Field | Type | Purpose |
|-----------|------|---------|
| `setupCost` | `Amount_Money` | One-time setup cost |
| `setupCurrency` | `Currency` | Currency for setup cost |
| `recurringCost` | `Amount_Money` | Recurring cost (base) |
| `recurringCurrency` | `Currency` | Currency for recurring |

**But** — see Requirement 3, this is more complex because pricing is per-tier AND per-billing-cycle.

### Requirement 3: "Pricing per tier per billing cycle on service groups"

This is the most significant structural change. The stakeholder wants a **pricing matrix**: for each `(ServiceGroup, Tier, BillingCycle)` combination, there's a specific price.

**Current structure has NO mechanism for this.** Currently:
- `TierPricingOption` lives on `ServiceSubscriptionTier` — it's a *tier-level* price, not group-level
- `ServiceGroup` has a single `billingCycle` — no per-tier pricing

**Proposed new structure needed (service-offering side):**

```graphql
type ServiceGroupPricing {
    id: OID!
    serviceGroupId: OID!
    tierId: OID!
    billingCycle: BillingCycle!
    recurringAmount: Amount_Money!
    recurringCurrency: Currency!
    setupAmount: Amount_Money       # One-time, independent of cycle
    setupCurrency: Currency
}
```

This creates a pricing matrix: **Group × Tier × BillingCycle → Price**.

**Impact on existing types:**

| Current Type | What Changes |
|-------------|-------------|
| `ServiceSubscriptionTier.pricing` | May become redundant (or repurposed as total tier price) |
| `ServiceSubscriptionTier.pricingOptions` | May become redundant (pricing moves to group level) |
| `TierPricingOption` | Potentially replaced by `ServiceGroupPricing` |
| `ServiceGroup` | Gets pricing association (or separate pricing array) |

### Requirement 4: "One-time costs separate, only one recurring applies"

This is a business rule, not a structural change. It means:
- Each service group can have both a setup cost AND a recurring cost
- The customer selects ONE billing cycle → only that recurring price applies
- The setup cost always applies regardless of billing cycle choice

**Implication**: The pricing matrix rows for the same (group, tier) but different billing cycles differ only in `recurringAmount`. The `setupAmount` should be the same across billing cycles (or defined once separately).

### Requirement 5: "Metrics inherit billing cycle from parent service group"

**Current state in `service-offering/schema.graphql`:**
```graphql
type ServiceUsageLimit {
    # ...
    resetCycle: UsageResetCycle    # Has its own reset cycle
    unitPrice: Amount_Money        # Has its own overage price
    unitPriceCurrency: Currency
    # NO billingCycle field — doesn't inherit from group
}
```

**Current state in `subscription-instance/schema.graphql`:**
```graphql
type ServiceMetric {
    # ...
    unitCost: RecurringCost        # Has FULL RecurringCost with its OWN billingCycle
    usageResetPeriod: ResetPeriod
}
```

**Stakeholder confirms**: Current metrics structure is correct. But metrics should **inherit** the billing cycle from their parent service group rather than defining their own.

**Impact**: This is a **display/logic rule**, not necessarily a schema change. The `resetCycle` on `ServiceUsageLimit` is about *when usage resets* (e.g., monthly), not billing. The billing cycle for overage charges should come from the parent group.

- On the service-offering side: `unitPriceBillingCycle` is NOT currently in the schema (only `unitPrice` and `unitPriceCurrency`) — no removal needed
- On the subscription-instance side: `ServiceMetric.unitCost.billingCycle` should match the parent group's billing cycle. This could be enforced at dispatch time rather than schema time.

---

## Part 3 — Gap Analysis & Open Questions

### Questions for Stakeholder (Priority-Ordered)

**Q1 — Pricing Matrix Structure** (Critical)
> The requirement says "pricing per tier per billing cycle on service groups." Does this mean we need a new `ServiceGroupPricing` join entity (group × tier × cycle → price)? Or should we add pricing arrays directly to the existing `ServiceGroup` or `ServiceSubscriptionTier`?
>
> Example: Service Group "Core Services" for Tier "Standard" might have:
> - Monthly: $500/mo recurring + $200 setup
> - Quarterly: $1,350/qtr recurring + $200 setup
> - Annual: $5,400/yr recurring + $200 setup
>
> Where does this data live?

**Q2 — Tier-Level Pricing (`TierPricingOption`) Fate** (Critical)
> Currently, `TierPricingOption` on `ServiceSubscriptionTier` defines per-tier billing cycle pricing. If pricing moves to the service group level, what happens to:
> - `ServiceSubscriptionTier.pricing` (base tier price)
> - `ServiceSubscriptionTier.pricingOptions` (per-cycle tier prices)
>
> Are these removed entirely, or do they coexist (e.g., tier has a base price + groups have additional group-level pricing)?

**Q3 — Subscription Instance Downstream Impact** (High)
> When a customer subscribes, the subscription-instance currently stores `setupCost` and `recurringCost` per service. If pricing moves to the group level:
> - Should the subscription-instance `ServiceGroup` type gain `setupCost` and `recurringCost` fields?
> - Should individual services in the subscription lose their cost fields?
> - How are add-on option groups (`SelectedOptionGroup`) affected?

**Q4 — Migration / Backward Compatibility** (High)
> Existing service offerings have per-service pricing. What's the migration strategy?
> - Automatically migrate service prices into their parent group?
> - Keep old `price`/`costType` fields as deprecated?
> - Hard break with a new schema version?

**Q5 — Setup Cost Independence** (Medium)
> "One-time costs are separate and apply independently." Does this mean:
> - (a) Setup cost is defined once per group (same across all billing cycles), OR
> - (b) Setup cost can vary per billing cycle too (e.g., different setup fee for annual vs monthly)?

**Q6 — Groups Without a Tier** (Medium)
> Can a service group have pricing outside of a tier context? For example, a standalone add-on group that isn't tied to a specific tier?

---

## Part 4 — Impact Summary

### Structural Changes Required

| Change | Service Offering | Subscription Instance | Severity |
|--------|------------------|-----------------------|----------|
| Remove pricing from `Service` | Remove `costType`, `price`, `currency` | Remove `setupCost`, `recurringCost` from `Service` | Breaking |
| Add pricing to `ServiceGroup` | New pricing structure (matrix) | New cost fields on `ServiceGroup` | Major addition |
| New pricing matrix entity | New `ServiceGroupPricing` type + ops | Reflect selected pricing | New entity |
| Remove service cost operations | N/A | Remove 4 operations (setup/recurring cost management) | Breaking |
| Add group cost operations | New CRUD for group pricing | New operations for group cost tracking | New operations |
| Metric billing cycle inheritance | Display/logic rule | Remove explicit billingCycle from metric costs | Minor |

### Affected Files (estimated)

**Service Offering:**
- `document-models/service-offering/schema.graphql` — Major rewrite of Service + ServiceGroup + new types
- `document-models/service-offering/service-offering.json` — New operations, modified operations
- `document-models/service-offering/src/reducers/` — New reducers for group pricing
- Editor components — Pricing UI overhaul

**Subscription Instance:**
- `document-models/subscription-instance/schema.graphql` — Service type simplification, ServiceGroup pricing addition
- `document-models/subscription-instance/subscription-instance.json` — Remove 4 operations, add new ones
- `document-models/subscription-instance/src/reducers/service.ts` — Remove cost-related operations
- `document-models/subscription-instance/src/reducers/service-group.ts` — Add cost handling
- Editor components — Billing panel overhaul

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Breaking change to existing documents | High | High | Version the schema, plan migration path |
| Editor UI complexity (pricing matrix) | Medium | Medium | Design mockups before implementation |
| Conflict with recently added fields | Medium | Low | `customValue`, `facetLabel`, `displayOrder` on Service are unaffected by pricing removal |
| Subscription instance cost calculation confusion | Medium | Medium | Clear rules for which entity owns pricing |

---

## Recommendation

Before implementing, resolve **Q1** (pricing matrix structure) and **Q2** (tier pricing option fate) with the stakeholder. These are architectural decisions that fundamentally shape how many entities change and how the pricing matrix is stored. The answers will determine whether this is a ~20 field change or a ~60 field restructuring.

---

**Document Version**: 1.0
**Created**: 2026-02-12
**Clarity Score**: 52/100
