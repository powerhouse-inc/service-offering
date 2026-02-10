# Service Offering Pricing Enhancements - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: The current service offering configuration only supports a single billing cycle per tier, limiting operators' ability to offer flexible pricing options (monthly, quarterly, annual). Additionally, metrics/usage limits lack the ability to specify overage pricing for usage beyond tier limits.
- **Target Users**: Operators configuring service offerings on the Achra platform
- **Value Proposition**: Enable operators to offer multi-billing cycle pricing with transparent monthly-equivalent display, and clearly communicate overage costs for metered services

### Feature Overview

#### Core Features
1. **Multi-Billing Cycle Tier Pricing**: Allow operators to set independent prices for monthly, quarterly, and annual billing cycles per tier
2. **Metric Overage Pricing**: Add unit price and billing cycle fields to usage limits for beyond-tier-limit pricing
3. **Monthly-Equivalent Display**: Show all pricing as monthly equivalents with total billed amount for transparency
4. **Metric Naming Clarity**: Rename "contributor onboarding" to "number of regular contributors"

#### Feature Boundaries
- **In Scope**:
  - Schema changes to `ServiceSubscriptionTier` and `ServiceUsageLimit`
  - New operations for managing tier pricing options
  - Editor UI updates for pricing configuration
  - Display logic for monthly-equivalent pricing

- **Out of Scope**:
  - Automatic discount calculation (prices set manually by operator)
  - Payment processing integration
  - Subscription billing system changes

#### User Scenarios
1. **Operator configures tier pricing**: Operator creates "Standard" tier and sets: Monthly = $500, Quarterly = $1,350, Annually = $5,400
2. **Operator configures metric overage**: Operator sets "number of regular contributors" with limit of 5, unit price of $500/month per additional contributor
3. **Customer views pricing**: Customer sees "$450/mo billed annually at $5,400" for transparent cost understanding

### Detailed Requirements

#### 1. Tier Pricing Options

**Current State** (`ServicePricing`):
```graphql
type ServicePricing {
    amount: Amount_Money
    currency: Currency!
    billingCycle: BillingCycle!
    setupFee: Amount_Money
}
```

**New State** - Add `TierPricingOption` array:
```graphql
type ServiceSubscriptionTier {
    id: OID!
    name: String!
    description: String
    isCustomPricing: Boolean!
    pricing: ServicePricing!           # Keep for backward compatibility / default
    pricingOptions: [TierPricingOption!]!  # NEW: Multi-cycle pricing
    serviceLevels: [ServiceLevelBinding!]!
    usageLimits: [ServiceUsageLimit!]!
}

type TierPricingOption {
    id: OID!
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
    setupFee: Amount_Money
    isDefault: Boolean!               # Which cycle is shown by default
}
```

**Display Logic**:
- Monthly equivalent = `amount / cycleMonths` where:
  - MONTHLY = 1
  - QUARTERLY = 3
  - SEMI_ANNUAL = 6
  - ANNUAL = 12
- Display format: `"$X/mo billed [cycle] at $Y"` (e.g., "$450/mo billed annually at $5,400")

#### 2. Metric/Usage Limit Overage Pricing

**Current State** (`ServiceUsageLimit`):
```graphql
type ServiceUsageLimit {
    id: OID!
    serviceId: OID!
    metric: String!
    limit: Int
    resetPeriod: ResetPeriod
    notes: String
}
```

**New State** - Add overage pricing fields:
```graphql
type ServiceUsageLimit {
    id: OID!
    serviceId: OID!
    metric: String!
    limit: Int
    resetPeriod: ResetPeriod
    notes: String
    # NEW: Overage pricing fields
    unitPrice: Amount_Money           # Price per unit beyond limit
    unitPriceCurrency: Currency       # Currency for unit price
    unitPriceBillingCycle: BillingCycle  # Billing cycle for unit price
}
```

**Example Configuration**:
- Metric: "number of regular contributors"
- Limit: 5 (included in tier)
- Unit Price: $500
- Unit Price Currency: USD
- Unit Price Billing Cycle: MONTHLY
- Display: "Up to 5 regular contributors included, then $500/mo per additional contributor"

#### 3. Input Types for Operations

**New Input Types**:
```graphql
input AddTierPricingOptionInput {
    tierId: OID!
    pricingOptionId: OID!
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
    setupFee: Amount_Money
    isDefault: Boolean
    lastModified: DateTime!
}

input UpdateTierPricingOptionInput {
    tierId: OID!
    pricingOptionId: OID!
    amount: Amount_Money
    currency: Currency
    setupFee: Amount_Money
    isDefault: Boolean
    lastModified: DateTime!
}

input RemoveTierPricingOptionInput {
    tierId: OID!
    pricingOptionId: OID!
    lastModified: DateTime!
}

input UpdateUsageLimitInput {
    tierId: OID!
    limitId: OID!
    metric: String
    limit: Int
    resetPeriod: ResetPeriod
    notes: String
    # NEW fields
    unitPrice: Amount_Money
    unitPriceCurrency: Currency
    unitPriceBillingCycle: BillingCycle
    lastModified: DateTime!
}
```

#### Edge Cases
- **No pricing options**: If `pricingOptions` is empty, fall back to `pricing` field
- **Single option**: If only one pricing option exists, don't show billing cycle selector
- **No unit price**: If `unitPrice` is null, metric is purely a limit with no overage option
- **Currency mismatch**: Validate that all pricing options for a tier use the same currency

---

## Design Decisions

### Technical Approach

#### Architecture Choice
- Extend existing `service-offering` document model
- Maintain backward compatibility with existing `pricing` field
- Add new `pricingOptions` array for multi-cycle support
- Add overage pricing fields to existing `ServiceUsageLimit` type

#### Key Components
1. **Document Model Schema**: Update `schema.graphql` with new types
2. **Reducers**: Add new operations for pricing option management
3. **Editor UI**: Update tier configuration and metrics panels
4. **Display Components**: Create monthly-equivalent price formatter

#### Data Storage
- Prices stored as `Amount_Money` (supports decimal precision)
- Currency stored alongside each price for explicit handling
- Billing cycle enum already exists and supports needed values

### Constraints

#### Performance Requirements
- Editor should render pricing options instantly (no network delay for display calculation)
- Monthly-equivalent calculation is client-side only

#### Compatibility
- Existing service offerings with single `pricing` should continue to work
- Migration path: existing `pricing` can be converted to first `pricingOptions` entry

#### Validation Rules
- At least one pricing option required if `isCustomPricing` is false
- Exactly one pricing option should have `isDefault: true`
- `billingCycle` values must be unique per tier (no duplicate cycles)
- `unitPrice` requires `unitPriceCurrency` and `unitPriceBillingCycle`

---

## Acceptance Criteria

### Functional Acceptance

#### Tier Pricing Options
- [ ] AC1: Operator can add multiple pricing options (monthly, quarterly, annual) to a tier
- [ ] AC2: Each pricing option has: billing cycle, amount, currency, optional setup fee
- [ ] AC3: Operator can mark one pricing option as default
- [ ] AC4: Operator can update individual pricing option amounts
- [ ] AC5: Operator can remove a pricing option (unless it's the only one)
- [ ] AC6: Billing cycles must be unique per tier (no duplicates)

#### Metric Overage Pricing
- [ ] AC7: Operator can set unit price for a metric/usage limit
- [ ] AC8: Operator can set billing cycle for the unit price
- [ ] AC9: Unit price is optional (null means no overage pricing)
- [ ] AC10: Display shows limit and overage pricing together

#### Display Requirements
- [ ] AC11: All pricing displays monthly equivalent prominently
- [ ] AC12: Full billed amount shown alongside monthly equivalent
- [ ] AC13: Format: "$X/mo billed [cycle] at $Y"
- [ ] AC14: Monthly pricing shows just "$X/mo" (no redundant billing text)

### Quality Standards
- [ ] Code Quality: All new code passes `npm run tsc` and `npm run lint:fix`
- [ ] Test Coverage: Reducer tests for all new operations
- [ ] Performance Metrics: Editor renders within 100ms

---

## Work Breakdown

### Phase 1: Document Model Schema Updates
**Goal**: Update service-offering schema with new types and fields

| Task | Description | Complexity |
|------|-------------|------------|
| 1.1 | Add `TierPricingOption` type to schema | Low |
| 1.2 | Add `pricingOptions: [TierPricingOption!]!` to `ServiceSubscriptionTier` | Low |
| 1.3 | Add overage fields to `ServiceUsageLimit` (`unitPrice`, `unitPriceCurrency`, `unitPriceBillingCycle`) | Low |
| 1.4 | Create input types for pricing option operations | Low |
| 1.5 | Update initial state with empty `pricingOptions` arrays | Low |

**Deliverables**: Updated `schema.graphql`, regenerated types
**MCP Operations**: `SET_STATE_SCHEMA`

---

### Phase 2: New Operations & Reducers
**Goal**: Implement CRUD operations for tier pricing options

| Task | Description | Complexity |
|------|-------------|------------|
| 2.1 | Add `ADD_TIER_PRICING_OPTION` operation | Medium |
| 2.2 | Add `UPDATE_TIER_PRICING_OPTION` operation | Medium |
| 2.3 | Add `REMOVE_TIER_PRICING_OPTION` operation | Medium |
| 2.4 | Update `ADD_USAGE_LIMIT` to include overage fields | Low |
| 2.5 | Update `UPDATE_USAGE_LIMIT` to include overage fields | Low |
| 2.6 | Add error definitions for validation (duplicate cycle, missing default) | Low |
| 2.7 | Write reducer code for all new operations | Medium |

**Deliverables**: New operations in document model, updated reducers in `src/`
**MCP Operations**: `ADD_OPERATION`, `SET_OPERATION_SCHEMA`, `SET_OPERATION_REDUCER`, `ADD_OPERATION_ERROR`

---

### Phase 3: Editor UI Updates
**Goal**: Update service offering editor with pricing configuration UI

| Task | Description | Complexity |
|------|-------------|------------|
| 3.1 | Create `TierPricingOptionsPanel` component | Medium |
| 3.2 | Add billing cycle selector with add/remove options | Medium |
| 3.3 | Create `MonthlyEquivalentDisplay` component | Low |
| 3.4 | Update `UsageLimitForm` with overage pricing fields | Medium |
| 3.5 | Add validation UI feedback for duplicate cycles | Low |
| 3.6 | Style components with Tailwind | Low |

**Deliverables**: Updated editor components

---

### Phase 4: Integration & Testing
**Goal**: End-to-end validation and quality assurance

| Task | Description | Complexity |
|------|-------------|------------|
| 4.1 | Run `npm run tsc` and fix type errors | Low |
| 4.2 | Run `npm run lint:fix` and fix lint errors | Low |
| 4.3 | Test backward compatibility with existing offerings | Medium |
| 4.4 | Test edge cases (empty options, single option, no overage) | Medium |
| 4.5 | Verify monthly-equivalent display calculations | Low |

**Deliverables**: Passing CI, tested functionality

---

## Implementation Order

```
Phase 1 (Schema)
    │
    ▼
Phase 2 (Operations & Reducers)
    │
    ▼
Phase 3 (Editor UI)
    │
    ▼
Phase 4 (Testing)
```

**Recommended approach**: Complete Phase 1 and 2 together (document model changes), then Phase 3 (editor), then Phase 4 (testing).

---

## Schema Change Summary

### New Types
```graphql
type TierPricingOption {
    id: OID!
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
    setupFee: Amount_Money
    isDefault: Boolean!
}
```

### Modified Types
```graphql
# ServiceSubscriptionTier - add field:
pricingOptions: [TierPricingOption!]!

# ServiceUsageLimit - add fields:
unitPrice: Amount_Money
unitPriceCurrency: Currency
unitPriceBillingCycle: BillingCycle
```

### New Operations
| Operation | Module | Description |
|-----------|--------|-------------|
| `ADD_TIER_PRICING_OPTION` | tier-management | Add pricing option to tier |
| `UPDATE_TIER_PRICING_OPTION` | tier-management | Update pricing option |
| `REMOVE_TIER_PRICING_OPTION` | tier-management | Remove pricing option |

### Modified Operations
| Operation | Changes |
|-----------|---------|
| `ADD_USAGE_LIMIT` | Add `unitPrice`, `unitPriceCurrency`, `unitPriceBillingCycle` to input |
| `UPDATE_USAGE_LIMIT` | Add `unitPrice`, `unitPriceCurrency`, `unitPriceBillingCycle` to input |

---

**Document Version**: 1.0
**Created**: 2026-01-26
**Clarification Rounds**: 2
**Quality Score**: 92/100
