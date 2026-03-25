# Schema Changes Plan — Service Offering & Subscription Instance

**Date**: 2026-02-13
**Status**: Ready for implementation
**Based on**: [stakeholder-decisions-v1.0.md](stakeholder-decisions-v1.0.md)

---

## Part 1 — Service Offering Schema Changes

### 1.1 ServiceGroup — ADD Tier Pricing

**Current**:
```graphql
type ServiceGroup {
    id: OID!
    name: String!
    description: String
    billingCycle: BillingCycle!
    displayOrder: Int
}
```

**After**:
```graphql
type ServiceGroup {
    id: OID!
    name: String!
    description: String
    billingCycle: BillingCycle!  # Default cycle, can be overridden per tier
    displayOrder: Int
    tierPricing: [ServiceGroupTierPricing!]!  # NEW — Per-tier pricing
}

type ServiceGroupTierPricing {
    id: OID!
    tierId: OID!  # References ServiceSubscriptionTier
    setupCost: SetupCost
    recurringPricing: [RecurringPriceOption!]!  # Per billing cycle
}

type SetupCost {
    amount: Amount_Money!
    currency: Currency!
}

type RecurringPriceOption {
    id: OID!
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
}
```

**Rationale**: Group pricing varies by tier. Each tier can have different prices for the same service group.

---

### 1.2 Service — REMOVE Pricing Fields

**Current**:
```graphql
type Service {
    id: OID!
    title: String!
    description: String
    displayOrder: Int
    serviceGroupId: OID
    isSetupFormation: Boolean!
    optionGroupId: OID
    costType: ServiceCostType       # ❌ REMOVE
    price: Amount_Money             # ❌ REMOVE
    currency: Currency              # ❌ REMOVE
    facetBindings: [ResourceFacetBinding!]!
}
```

**After**:
```graphql
type Service {
    id: OID!
    title: String!
    description: String
    displayOrder: Int
    serviceGroupId: OID
    isSetupFormation: Boolean!
    optionGroupId: OID
    # Removed: costType, price, currency
    facetBindings: [ResourceFacetBinding!]!
}
```

**Also REMOVE**:
```graphql
enum ServiceCostType {  # ❌ DELETE ENTIRE ENUM
    RECURRING
    SETUP
}
```

---

### 1.3 ServiceSubscriptionTier — ADD Discount Settings

**Current**:
```graphql
type ServiceSubscriptionTier {
    id: OID!
    name: String!
    description: String
    isCustomPricing: Boolean!
    pricing: ServicePricing!
    pricingOptions: [TierPricingOption!]!
    serviceLevels: [ServiceLevelBinding!]!
    usageLimits: [ServiceUsageLimit!]!
}
```

**After**:
```graphql
type ServiceSubscriptionTier {
    id: OID!
    name: String!
    description: String
    isCustomPricing: Boolean!
    pricing: ServicePricing!           # ⚠️ DEPRECATED — will be computed from groups
    pricingOptions: [TierPricingOption!]!  # ⚠️ DEPRECATED — replaced by group pricing
    serviceLevels: [ServiceLevelBinding!]!
    usageLimits: [ServiceUsageLimit!]!
    discountSettings: TierDiscountSettings  # NEW — Global discount configuration
}

type TierDiscountSettings {
    monthlyDiscount: DiscountRule
    quarterlyDiscount: DiscountRule
    semiAnnualDiscount: DiscountRule
    annualDiscount: DiscountRule
}

type DiscountRule {
    discountType: DiscountType!
    discountValue: Float!  # Percentage (15.0) or flat amount (120.0)
}

enum DiscountType {
    PERCENTAGE     # e.g., 15% → 15.0
    FLAT_AMOUNT    # e.g., $120 → 120.0
}
```

**Note**: `pricing` and `pricingOptions` are marked deprecated but kept temporarily for backward compatibility. In Phase 2, these will be removed and tier price will be computed as `SUM(group prices)`.

---

### 1.4 OptionGroup — ADD Pricing Modes

**Current**:
```graphql
type OptionGroup {
    id: OID!
    name: String!
    description: String
    isAddOn: Boolean!
    defaultSelected: Boolean!
    costType: GroupCostType
    billingCycle: BillingCycle
    price: Amount_Money
    currency: Currency
}
```

**After**:
```graphql
type OptionGroup {
    id: OID!
    name: String!
    description: String
    isAddOn: Boolean!
    defaultSelected: Boolean!
    pricingMode: AddOnPricingMode!  # NEW — TIER_DEPENDENT or STANDALONE

    # For STANDALONE mode (fixed price for all tiers)
    standalonePricing: StandalonePricing

    # For TIER_DEPENDENT mode (price varies by tier)
    tierDependentPricing: [OptionGroupTierPricing!]

    # ⚠️ DEPRECATED (replaced by pricing mode structures)
    costType: GroupCostType
    billingCycle: BillingCycle
    price: Amount_Money
    currency: Currency
}

enum AddOnPricingMode {
    TIER_DEPENDENT     # Price varies by tier
    STANDALONE         # Fixed price for all tiers
}

type StandalonePricing {
    setupCost: SetupCost
    recurringPricing: [RecurringPriceOption!]!
}

type OptionGroupTierPricing {
    id: OID!
    tierId: OID!
    setupCost: SetupCost
    recurringPricing: [RecurringPriceOption!]!
}
```

**Rationale**: Add-ons can either have tier-dependent pricing (more expensive for higher tiers) or standalone fixed pricing (same for all tiers).

---

### 1.5 Summary of Type Changes

| Type | Action | Fields Changed |
|------|--------|---------------|
| `ServiceGroup` | ✅ ADD | `tierPricing: [ServiceGroupTierPricing!]!` |
| `ServiceGroupTierPricing` | ✅ NEW TYPE | Full type definition |
| `SetupCost` | ✅ NEW TYPE | `amount`, `currency` |
| `RecurringPriceOption` | ✅ NEW TYPE | `id`, `billingCycle`, `amount`, `currency` |
| `Service` | ❌ REMOVE | `costType`, `price`, `currency` |
| `ServiceCostType` | ❌ DELETE | Entire enum |
| `ServiceSubscriptionTier` | ✅ ADD | `discountSettings: TierDiscountSettings` |
| `TierDiscountSettings` | ✅ NEW TYPE | Full type definition |
| `DiscountRule` | ✅ NEW TYPE | `discountType`, `discountValue` |
| `DiscountType` | ✅ NEW ENUM | `PERCENTAGE`, `FLAT_AMOUNT` |
| `OptionGroup` | ✅ ADD | `pricingMode`, `standalonePricing`, `tierDependentPricing` |
| `AddOnPricingMode` | ✅ NEW ENUM | `TIER_DEPENDENT`, `STANDALONE` |
| `StandalonePricing` | ✅ NEW TYPE | Full type definition |
| `OptionGroupTierPricing` | ✅ NEW TYPE | Full type definition |

---

## Part 2 — Service Offering Operations Changes

### 2.1 NEW Operations — Service Group Tier Pricing

```graphql
# Add pricing for a service group for a specific tier
input AddServiceGroupTierPricingInput {
    serviceGroupId: OID!
    tierPricingId: OID!
    tierId: OID!
    lastModified: DateTime!
}

# Update setup cost for service group at tier level
input SetServiceGroupSetupCostInput {
    serviceGroupId: OID!
    tierId: OID!
    amount: Amount_Money!
    currency: Currency!
    lastModified: DateTime!
}

# Remove setup cost
input RemoveServiceGroupSetupCostInput {
    serviceGroupId: OID!
    tierId: OID!
    lastModified: DateTime!
}

# Add recurring price option for a service group + tier + billing cycle
input AddRecurringPriceOptionInput {
    serviceGroupId: OID!
    tierId: OID!
    priceOptionId: OID!
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
    lastModified: DateTime!
}

# Update recurring price option
input UpdateRecurringPriceOptionInput {
    serviceGroupId: OID!
    tierId: OID!
    priceOptionId: OID!
    billingCycle: BillingCycle
    amount: Amount_Money
    currency: Currency
    lastModified: DateTime!
}

# Remove recurring price option
input RemoveRecurringPriceOptionInput {
    serviceGroupId: OID!
    tierId: OID!
    priceOptionId: OID!
    lastModified: DateTime!
}

# Remove entire tier pricing from service group
input RemoveServiceGroupTierPricingInput {
    serviceGroupId: OID!
    tierId: OID!
    lastModified: DateTime!
}
```

**New Operations Count**: 7

---

### 2.2 NEW Operations — Tier Discount Settings

```graphql
# Set global discount rules for a tier
input SetTierDiscountSettingsInput {
    tierId: OID!
    monthlyDiscount: DiscountRuleInput
    quarterlyDiscount: DiscountRuleInput
    semiAnnualDiscount: DiscountRuleInput
    annualDiscount: DiscountRuleInput
    lastModified: DateTime!
}

input DiscountRuleInput {
    discountType: DiscountType!
    discountValue: Float!
}

# Remove discount settings
input RemoveTierDiscountSettingsInput {
    tierId: OID!
    lastModified: DateTime!
}
```

**New Operations Count**: 2

---

### 2.3 NEW Operations — Option Group Pricing Modes

```graphql
# Set option group to standalone pricing mode
input SetOptionGroupStandalonePricingInput {
    optionGroupId: OID!
    setupAmount: Amount_Money
    setupCurrency: Currency
    recurringPricing: [RecurringPriceOptionInput!]!
    lastModified: DateTime!
}

input RecurringPriceOptionInput {
    id: OID!
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
}

# Add tier-dependent pricing for option group
input AddOptionGroupTierPricingInput {
    optionGroupId: OID!
    tierPricingId: OID!
    tierId: OID!
    setupAmount: Amount_Money
    setupCurrency: Currency
    recurringPricing: [RecurringPriceOptionInput!]!
    lastModified: DateTime!
}

# Update tier-dependent pricing
input UpdateOptionGroupTierPricingInput {
    optionGroupId: OID!
    tierId: OID!
    setupAmount: Amount_Money
    setupCurrency: Currency
    recurringPricing: [RecurringPriceOptionInput!]
    lastModified: DateTime!
}

# Remove tier-dependent pricing
input RemoveOptionGroupTierPricingInput {
    optionGroupId: OID!
    tierId: OID!
    lastModified: DateTime!
}
```

**New Operations Count**: 4

---

### 2.4 MODIFIED Operations — Remove Pricing Parameters

**AddServiceInput** — Remove cost fields:
```graphql
# BEFORE
input AddServiceInput {
    id: OID!
    title: String!
    description: String
    serviceGroupId: OID
    displayOrder: Int
    isSetupFormation: Boolean
    optionGroupId: OID
    costType: ServiceCostType        # ❌ REMOVE
    price: Amount_Money              # ❌ REMOVE
    currency: Currency               # ❌ REMOVE
    lastModified: DateTime!
}

# AFTER
input AddServiceInput {
    id: OID!
    title: String!
    description: String
    serviceGroupId: OID
    displayOrder: Int
    isSetupFormation: Boolean
    optionGroupId: OID
    # Removed: costType, price, currency
    lastModified: DateTime!
}
```

**UpdateServiceInput** — Remove cost fields:
```graphql
# BEFORE
input UpdateServiceInput {
    id: OID!
    title: String
    description: String
    serviceGroupId: OID
    displayOrder: Int
    isSetupFormation: Boolean
    optionGroupId: OID
    costType: ServiceCostType        # ❌ REMOVE
    price: Amount_Money              # ❌ REMOVE
    currency: Currency               # ❌ REMOVE
    lastModified: DateTime!
}

# AFTER
input UpdateServiceInput {
    id: OID!
    title: String
    description: String
    serviceGroupId: OID
    displayOrder: Int
    isSetupFormation: Boolean
    optionGroupId: OID
    # Removed: costType, price, currency
    lastModified: DateTime!
}
```

**Modified Operations Count**: 2

---

### 2.5 Operations Summary

| Category | Count | Operations |
|----------|-------|-----------|
| **New Operations** | 13 | Service group pricing (7), Tier discounts (2), Option group pricing (4) |
| **Modified Operations** | 2 | AddService, UpdateService |
| **Deprecated Operations** | 6 | UpdateTierPricing, Add/Update/RemoveTierPricingOption (will be removed in Phase 2) |

---

## Part 3 — Subscription Instance Schema Changes

### 3.1 SubscriptionInstanceState — ADD Billing Currency

**Current**:
```graphql
type SubscriptionInstanceState {
    # ... existing fields (id, operatorId, customerId, etc.)
    projectedBillAmount: Amount_Money
    projectedBillCurrency: Currency
    # ... other fields
}
```

**After**:
```graphql
type SubscriptionInstanceState {
    # ... existing fields
    billingCurrency: Currency!  # NEW — Authoritative currency for entire subscription
    projectedBillAmount: Amount_Money
    projectedBillCurrency: Currency  # ⚠️ DEPRECATED — use billingCurrency instead
    # ... other fields
}
```

---

### 3.2 ServiceGroup — ADD Cost Fields

**Current**:
```graphql
type ServiceGroup {
    id: OID!
    name: String!
    billingCycle: BillingCycle!
    optional: Boolean!
    optionGroupId: OID
    displayOrder: Int
    services: [Service!]!
}
```

**After**:
```graphql
type ServiceGroup {
    id: OID!
    name: String!
    billingCycle: BillingCycle!
    optional: Boolean!
    optionGroupId: OID
    displayOrder: Int

    # NEW — Cost snapshot from SO at subscription time
    setupCost: SetupCost
    recurringCost: RecurringCost

    services: [Service!]!
}

type SetupCost {
    amount: Amount_Money!
    currency: Currency!
}

type RecurringCost {
    amount: Amount_Money!
    currency: Currency!
    billingCycle: BillingCycle!
}
```

---

### 3.3 Service — REMOVE Cost Fields

**Current**:
```graphql
type Service {
    id: OID!
    name: String!
    description: String
    serviceLevel: ServiceLevel!
    customValue: String
    facetLabel: String
    displayOrder: Int
    isSetupService: Boolean!

    # Cost fields
    setupCost: SetupCost           # ❌ REMOVE
    recurringCost: RecurringCost   # ❌ REMOVE

    facetSelections: [FacetSelection!]!
    metrics: [ServiceMetric!]!
}
```

**After**:
```graphql
type Service {
    id: OID!
    name: String!
    description: String
    serviceLevel: ServiceLevel!
    customValue: String
    facetLabel: String
    displayOrder: Int
    isSetupService: Boolean!

    # Removed: setupCost, recurringCost

    facetSelections: [FacetSelection!]!
    metrics: [ServiceMetric!]!
}
```

---

### 3.4 Summary of SI Type Changes

| Type | Action | Fields Changed |
|------|--------|---------------|
| `SubscriptionInstanceState` | ✅ ADD | `billingCurrency: Currency!` |
| `ServiceGroup` | ✅ ADD | `setupCost`, `recurringCost` |
| `SetupCost` | ✅ NEW TYPE | `amount`, `currency` |
| `RecurringCost` | ✅ NEW TYPE | `amount`, `currency`, `billingCycle` |
| `Service` | ❌ REMOVE | `setupCost`, `recurringCost` |

---

## Part 4 — Subscription Instance Operations Changes

### 4.1 MODIFIED Operation — InitializeSubscription

**Current** `InitializeSubscriptionInput`:
```graphql
input InitializeSubscriptionInput {
    # ... many existing fields (operatorId, customerId, etc.)
    projectedBillAmount: Amount_Money
    projectedBillCurrency: Currency
    # ... other fields
}
```

**After**:
```graphql
input InitializeSubscriptionInput {
    # ... existing fields
    billingCurrency: Currency!  # NEW — Required
    projectedBillAmount: Amount_Money
    projectedBillCurrency: Currency  # ⚠️ DEPRECATED
    # ... other fields
}
```

**Reducer Changes**:
- Set `state.billingCurrency = action.input.billingCurrency`
- Validate all costs use this currency

---

### 4.2 MODIFIED Operation — AddServiceGroup

**Current**:
```graphql
input AddServiceGroupInput {
    id: OID!
    name: String!
    billingCycle: BillingCycle!
    optional: Boolean!
    optionGroupId: OID
    displayOrder: Int
}
```

**After**:
```graphql
input AddServiceGroupInput {
    id: OID!
    name: String!
    billingCycle: BillingCycle!
    optional: Boolean!
    optionGroupId: OID
    displayOrder: Int

    # NEW — Cost snapshot
    setupAmount: Amount_Money
    setupCurrency: Currency
    recurringAmount: Amount_Money!
    recurringCurrency: Currency!
}
```

---

### 4.3 MODIFIED Operation — AddService

**Current**:
```graphql
input AddServiceInput {
    id: OID!
    serviceGroupId: OID!
    name: String!
    description: String
    serviceLevel: ServiceLevel!
    customValue: String
    facetLabel: String
    displayOrder: Int
    isSetupService: Boolean!

    # Cost fields
    setupAmount: Amount_Money        # ❌ REMOVE
    setupCurrency: Currency          # ❌ REMOVE
    recurringAmount: Amount_Money    # ❌ REMOVE
    recurringCurrency: Currency      # ❌ REMOVE
    recurringBillingCycle: BillingCycle  # ❌ REMOVE
}
```

**After**:
```graphql
input AddServiceInput {
    id: OID!
    serviceGroupId: OID!
    name: String!
    description: String
    serviceLevel: ServiceLevel!
    customValue: String
    facetLabel: String
    displayOrder: Int
    isSetupService: Boolean!

    # Removed: all cost fields
}
```

---

### 4.4 MODIFIED Operation — AddServiceToGroup

Same changes as `AddServiceInput` — remove all cost fields.

---

### 4.5 NEW Operations — Service Group Cost Management

```graphql
# Update service group setup cost (operator adjustment)
input UpdateServiceGroupSetupCostInput {
    serviceGroupId: OID!
    amount: Amount_Money!
    currency: Currency!
}

# Update service group recurring cost (operator adjustment)
input UpdateServiceGroupRecurringCostInput {
    serviceGroupId: OID!
    amount: Amount_Money!
    currency: Currency!
    billingCycle: BillingCycle!
}

# Set billing currency (for migration or correction)
input SetBillingCurrencyInput {
    currency: Currency!
}
```

**New Operations Count**: 3

---

### 4.6 REMOVED Operations

```graphql
# These operations are no longer needed (cost is at group level)
❌ UPDATE_SERVICE_SETUP_COST
❌ UPDATE_SERVICE_RECURRING_COST
```

**Removed Operations Count**: 2

---

### 4.7 SI Operations Summary

| Category | Count | Operations |
|----------|-------|-----------|
| **New Operations** | 3 | UpdateServiceGroupSetupCost, UpdateServiceGroupRecurringCost, SetBillingCurrency |
| **Modified Operations** | 4 | InitializeSubscription, AddServiceGroup, AddService, AddServiceToGroup |
| **Removed Operations** | 2 | UPDATE_SERVICE_SETUP_COST, UPDATE_SERVICE_RECURRING_COST |

---

## Part 5 — Implementation Checklist

### Phase 1: Service Offering Schema (Week 1-2)

**Schema Changes**:
- [ ] Add `ServiceGroupTierPricing` type
- [ ] Add `SetupCost` type
- [ ] Add `RecurringPriceOption` type
- [ ] Add `TierDiscountSettings` type
- [ ] Add `DiscountRule` type
- [ ] Add `DiscountType` enum
- [ ] Add `AddOnPricingMode` enum
- [ ] Add `StandalonePricing` type
- [ ] Add `OptionGroupTierPricing` type
- [ ] Add `tierPricing` field to `ServiceGroup`
- [ ] Add `discountSettings` field to `ServiceSubscriptionTier`
- [ ] Add pricing mode fields to `OptionGroup`
- [ ] Remove `costType`, `price`, `currency` from `Service`
- [ ] Delete `ServiceCostType` enum

**Operations**:
- [ ] Add 7 service group pricing operations
- [ ] Add 2 tier discount operations
- [ ] Add 4 option group pricing operations
- [ ] Modify `AddServiceInput` (remove cost fields)
- [ ] Modify `UpdateServiceInput` (remove cost fields)

**Reducers**:
- [ ] Implement all new operation reducers
- [ ] Update service add/update reducers

**Testing**:
- [ ] Unit tests for all new reducers
- [ ] Test pricing matrix (group × tier × cycle)
- [ ] Test discount calculations
- [ ] Test add-on pricing modes
- [ ] Run `npm run tsc` and `npm run lint:fix`

---

### Phase 2: Subscription Instance Schema (Week 2-3)

**Schema Changes**:
- [ ] Add `billingCurrency` to `SubscriptionInstanceState`
- [ ] Add `setupCost` to `ServiceGroup`
- [ ] Add `recurringCost` to `ServiceGroup`
- [ ] Add `SetupCost` type (if not shared with SO)
- [ ] Add `RecurringCost` type (if not shared with SO)
- [ ] Remove `setupCost` from `Service`
- [ ] Remove `recurringCost` from `Service`

**Operations**:
- [ ] Add `UpdateServiceGroupSetupCost` operation
- [ ] Add `UpdateServiceGroupRecurringCost` operation
- [ ] Add `SetBillingCurrency` operation
- [ ] Modify `InitializeSubscriptionInput` (add billingCurrency)
- [ ] Modify `AddServiceGroupInput` (add cost fields)
- [ ] Modify `AddServiceInput` (remove cost fields)
- [ ] Modify `AddServiceToGroupInput` (remove cost fields)
- [ ] Remove `UPDATE_SERVICE_SETUP_COST` operation
- [ ] Remove `UPDATE_SERVICE_RECURRING_COST` operation

**Reducers**:
- [ ] Implement new group cost operation reducers
- [ ] Update `initializeSubscription` reducer (set billingCurrency)
- [ ] Update `addServiceGroup` reducer (set costs)
- [ ] Update `addService` reducer (remove cost handling)
- [ ] Add currency validation to all cost operations

**Testing**:
- [ ] Unit tests for all modified reducers
- [ ] Test billing currency enforcement
- [ ] Test group-level cost storage
- [ ] Test cost calculations (group totals)
- [ ] Run `npm run tsc` and `npm run lint:fix`

---

### Phase 3: Service Offering Editor (Week 3-4)

**UI Components**:
- [ ] Build `ServiceGroupPricingMatrix` component (group × tier grid)
- [ ] Build `BillingCyclePricingRow` component (per-cycle inputs)
- [ ] Build `TierDiscountSettings` component (global discount config)
- [ ] Build `AddOnPricingModeSelector` component (tier-dependent vs standalone)
- [ ] Remove per-service pricing UI components
- [ ] Add currency validation feedback

**Integration**:
- [ ] Wire pricing matrix to service group editor
- [ ] Wire discount settings to tier editor
- [ ] Wire pricing mode to option group editor
- [ ] Update offering summary to show calculated tier prices
- [ ] Add validation: all costs use same currency

**Testing**:
- [ ] UI interaction tests
- [ ] Currency validation tests
- [ ] Pricing calculation display tests

---

### Phase 4: Subscription Instance Editor (Week 4-5)

**UI Components**:
- [ ] Update `BillingPanel` to show group-level costs
- [ ] Add collapsible setup costs section
- [ ] Remove per-service cost displays
- [ ] Update `SubscriptionHeader` to show billing currency
- [ ] Add currency selector to initialization flow
- [ ] De-emphasize limit increase button (smaller, ghost variant)

**Integration**:
- [ ] Wire group costs to billing display
- [ ] Wire collapsible setup section
- [ ] Update billing projections to aggregate group costs
- [ ] Add currency display consistency across all panels

**Testing**:
- [ ] UI layout tests (collapsible section)
- [ ] Billing calculation tests (group aggregation)
- [ ] Currency display tests

---

### Phase 5: Documentation & Migration (Week 5)

**Documentation**:
- [ ] Update SO editor user guide
- [ ] Update SI editor user guide
- [ ] Document pricing matrix structure
- [ ] Document discount calculation logic
- [ ] Document add-on pricing modes
- [ ] Create migration guide for existing offerings

**Migration**:
- [ ] Create migration script for existing SO documents
- [ ] Test migration on sample documents
- [ ] Document breaking changes
- [ ] Plan rollout communication

---

## Part 6 — Validation Rules

### Service Offering Validation

1. **Currency Consistency**: All pricing within an offering must use the same currency
2. **Tier Pricing Completeness**: Each tier must have pricing for all non-optional service groups
3. **Billing Cycle Coverage**: Each (group × tier) must have at least one recurring price option
4. **Discount Value Range**: Percentage discounts must be 0-100, flat amounts must be positive
5. **Add-On Pricing Mode**: Option groups must have either standalone OR tier-dependent pricing (not both)

### Subscription Instance Validation

1. **Billing Currency Match**: All cost fields must use `billingCurrency`
2. **Group Cost Required**: All service groups must have `recurringCost`, setup optional
3. **Service No Costs**: Services must not have cost fields (rejected at operation level)

---

## Part 7 — Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **Breaking changes to existing documents** | Keep deprecated fields temporarily, plan migration window |
| **Currency mismatch errors** | Add validation at operation dispatch time, show clear error messages |
| **Pricing calculation errors** | Comprehensive unit tests, manual QA on sample offerings |
| **Editor UI complexity** | Design mockups before implementation, user testing with operators |
| **Migration data loss** | Test on copies first, provide rollback procedure |

---

**Document Version**: 1.0
**Created**: 2026-02-13
**Status**: Ready for Phase 1 implementation
**Estimated Total Effort**: 5 weeks (with testing and documentation)
