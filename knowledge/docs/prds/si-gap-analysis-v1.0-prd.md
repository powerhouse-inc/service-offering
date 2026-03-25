# Subscription Instance Gap Analysis — Revision Report

## Requirements Description

### Background
- **Business Problem**: The Service Offering document model has evolved significantly — introducing calculated tier pricing (`TierPricingMode`), discount cascades (`DiscountMode`), per-group billing cycle overrides, and a 3-category group structure (regular/setup/addon). The Subscription Instance document model and editor were built before these changes and cannot properly receive, store, or display the pricing data that the SO now produces.
- **Target Users**: Operators creating subscriptions from service offerings; subscribers viewing their billing
- **Value Proposition**: Ensure the SO → SI data pipeline is complete so pricing integrity established in the SO editor carries through to the subscription instance.

### Scope
This report covers **pricing linkage ripple effects only** — what the SI schema and editor need to change so that the one-time snapshot import from SO to SI preserves the full pricing context. The SI billing panel layout redesign (stakeholder requirements from `rgh req SI`) is noted as context but **not in scope** for implementation.

### Key Decisions (from clarification)
1. **Snapshot model**: SI pricing is independent after creation — no live reference to SO
2. **Post-discount prices**: SI receives final discounted amounts; should display them as discounted
3. **One-time copy**: Import happens at "submit request" on Achra, from browser store state
4. **Selected intersection only**: SI receives prices for the selected tier + each group's resolved billing cycle

---

## Gap Analysis

### GAP 1: Service Group Type Classification

**SO has** (from BA Section 2.3):
```
setupGroups   = optionGroups.filter(g => g.costType === "SETUP")
regularGroups = optionGroups.filter(g => g.costType !== "SETUP" && !g.isAddOn)
addonGroups   = optionGroups.filter(g => g.isAddOn)
```

**SI has**:
```graphql
type ServiceGroup {
    id: OID!
    optional: Boolean!     # true = add-on, false = everything else
    name: String!
    setupCost: SetupCost
    recurringCost: RecurringCost
    services: [Service!]!
}
```

**Gap**: SI uses a single `optional: Boolean` which conflates "setup group" and "regular recurring group" into `optional: false`. There's no way to distinguish a one-time setup group from a recurring service group.

**Impact**: The stakeholder requirement to move setup costs to a separate tab requires knowing which groups are setup-type. The billing panel currently lumps all non-optional groups together.

**Recommendation**: Add `costType: GroupCostType` field to SI's `ServiceGroup`.

```graphql
enum GroupCostType { RECURRING, SETUP }

type ServiceGroup {
    # ... existing fields
    costType: GroupCostType    # NEW: maps from SO OptionGroup.costType
}
```

**Priority**: Medium — needed for proper billing display, but the current `setupCost` field on groups partially covers this.

---

### GAP 2: Discount Context Lost at Import

**SO has** (from BA Sections 6.4–6.6):
- Tier-level `billingCycleDiscounts[]` per cycle (percentage or flat amount)
- Group-level `discountMode` (INHERIT_TIER / INDEPENDENT)
- Group-level `billingCycleDiscounts[]` for independent mode
- Per-price-option `discount: DiscountRule` on recurringPricing entries
- Proportional flat-amount distribution for inherited discounts

**SI has**: Nothing. No discount fields anywhere in the schema.

**Gap**: When the SO calculates a post-discount price (e.g., $96.77/mo after 3% annual discount on $100/mo base), the SI only receives the final $96.77. It cannot display:
- "Was $100/mo, now $96.77/mo"
- "SAVE 3%"
- Whether the discount was tier-inherited or group-independent

**Impact**: The subscriber sees a price with no context. The operator cannot verify if the discount was correctly applied at creation time. The billing panel shows flat amounts with no discount badges.

**Recommendation**: Add discount metadata to SI costs.

```graphql
type DiscountInfo {
    originalAmount: Amount_Money!      # Pre-discount price
    discountType: DiscountType!        # PERCENTAGE or FLAT_AMOUNT
    discountValue: Float!              # e.g., 3 for 3%, or 60 for $60 off
    source: DiscountSource!            # Where the discount came from
}

enum DiscountSource {
    TIER_INHERITED        # Discount cascaded from tier billing cycle discount
    GROUP_INDEPENDENT     # Group's own independent discount
    BUNDLE               # Tier was in MANUAL_OVERRIDE with price < group sum
}

enum DiscountType {
    PERCENTAGE
    FLAT_AMOUNT
}

type RecurringCost {
    # ... existing fields
    discount: DiscountInfo    # NEW: discount that was applied at creation
}
```

**Priority**: High — this is the core pricing linkage gap. Without it, the SI cannot show discounted pricing context.

---

### GAP 3: Tier Pricing Mode Not Tracked

**SO has** (from BA Section 4.2):
```graphql
enum TierPricingMode { CALCULATED, MANUAL_OVERRIDE }
```

**SI has**:
```graphql
tierName: String
tierPricingOptionId: OID
tierPrice: Amount_Money
tierCurrency: Currency
```

**Gap**: SI stores a flat `tierPrice` but doesn't know how it was derived. When `MANUAL_OVERRIDE` was used (operator set tier price below group sum for a bundle discount), the SI tier price differs from the sum of its service group recurring costs — and this is *intentional*, not an error.

**Impact**: If the SI billing panel ever sums service group recurring costs and compares to tier price, a MANUAL_OVERRIDE tier will show a mismatch. Without knowing the mode, the editor can't determine if this is a bug or a deliberate bundle discount.

**Recommendation**: Add pricing mode to SI state.

```graphql
type SubscriptionInstanceState {
    # ... existing fields
    tierPricingMode: TierPricingMode    # NEW: CALCULATED or MANUAL_OVERRIDE
}

enum TierPricingMode { CALCULATED, MANUAL_OVERRIDE }
```

**Priority**: Medium — informational context for operators. The SI tier price is fixed after creation regardless of mode.

---

### GAP 4: Usage Limit Granularity

**SO has** (from BA Section 9.3):
```graphql
type ServiceUsageLimit {
    metric: String!
    freeLimit: Int          # Usage included in tier price
    paidLimit: Int          # Maximum allowed (including paid overage)
    unitPrice: Amount_Money # Cost per unit above freeLimit
    resetCycle: UsageResetCycle
}
```

**SI has**:
```graphql
type ServiceMetric {
    limit: Int              # Single limit — which one?
    currentUsage: Int!
    unitCost: RecurringCost # Full cost structure (overkill?)
}
```

**Gap**: SO distinguishes between `freeLimit` (included units) and `paidLimit` (maximum). SI has a single `limit`. The overage calculation in `BillingPanel.tsx` uses `metric.limit` as the threshold for overage, but it's unclear if this maps to `freeLimit` or `paidLimit`.

**Example**:
- SO: freeLimit=1000, paidLimit=5000, unitPrice=$0.01
- Subscriber uses 2500 units
- Overage = 2500 - 1000 = 1500 units × $0.01 = $15.00
- But SI only stores `limit: ???` — is it 1000 or 5000?

**Impact**: Incorrect overage calculations if `limit` maps to `paidLimit` instead of `freeLimit`. The billing projection becomes unreliable.

**Recommendation**: Split limit into two fields.

```graphql
type ServiceMetric {
    # ... existing fields
    freeLimit: Int          # NEW: included in tier price (overage threshold)
    paidLimit: Int          # NEW: maximum allowed (hard cap)
    # DEPRECATE: limit (migrate to freeLimit)
}
```

**Priority**: High — directly affects billing projection accuracy.

---

### GAP 5: Service Level Not Tracked

**SO has** (from BA Section 9.1):
```graphql
enum ServiceLevel {
    INCLUDED, NOT_INCLUDED, OPTIONAL, CUSTOM, VARIABLE, NOT_APPLICABLE
}

type ServiceLevelBinding {
    serviceId: OID!
    level: ServiceLevel!
    customValue: String
    optionGroupId: OID
}
```

**SI has**: No `serviceLevel` field on services.

**Gap**: When an SO service is at level OPTIONAL for a tier, the subscriber may or may not have chosen it. When CUSTOM, it has a `customValue`. When VARIABLE, it's usage-based. The SI service doesn't record what level it was at in the original offering.

**Impact**: The SI editor can't distinguish between:
- A service that was INCLUDED (always part of the tier)
- A service that was OPTIONAL (subscriber actively chose it)
- A service that was CUSTOM (has a negotiated value)

This matters for display (e.g., showing "Optional add-on" badge) and for renewal (knowing what was actively chosen vs. automatically included).

**Recommendation**: Add service level to SI services.

```graphql
type Service {
    # ... existing fields
    serviceLevel: ServiceLevel    # NEW: level from SO at creation time
}
```

**Priority**: Low — informational. The SO → SI import would only copy services that are INCLUDED or OPTIONAL+selected. But useful for display context.

---

### GAP 6: Add-On Enable/Disable State

**SO has** (from BA Section 10.1):
```
enabledOptionalGroups: Set<groupId>
```
Add-ons can be toggled on/off in the matrix. Only enabled add-ons contribute to grand total.

**SI has**: `serviceGroup.optional: Boolean` — indicates the group IS an add-on, but not whether it was enabled/selected.

**Gap**: When creating an SI from an SO configuration, enabled add-ons should be included as `optional: true` groups. Disabled add-ons should be excluded entirely. The SI currently has no way to know if a group was an enabled add-on vs. a required group.

**Impact**: Minor at import time (we simply don't import disabled add-ons). But the SI editor can't let the operator toggle add-ons on/off post-creation without knowing which groups are add-ons.

**Recommendation**: The existing `optional: Boolean` field is sufficient for the snapshot. At import, only include add-ons that were enabled. No schema change needed — `optional: true` already means "this is an add-on that was selected."

**Priority**: None — existing field covers this.

---

### GAP 7: Global Currency

**Stakeholder requirement** (from `rgh req SI`):
> "Set one global currency at the instance document level for billing to avoid mixing multiple currencies in line items."

**SI has**: Per-cost currencies (`tierCurrency`, `recurringCost.currency`, `setupCost.currency`, `projectedBillCurrency`).

**Gap**: No single `globalCurrency` field. Each cost has its own currency, which could theoretically be different (e.g., setup in EUR, recurring in USD).

**Impact**: The billing panel has to pick a "display currency" heuristically:
```typescript
const projectedCurrency =
    state.projectedBillCurrency || serviceLines[0]?.currency || "USD";
```

**Recommendation**: Add global currency to SI state.

```graphql
type SubscriptionInstanceState {
    # ... existing fields
    globalCurrency: Currency    # NEW: single currency for all billing
}
```

At import, set from the SO's currency. All service/group costs should use this currency. Editor validates currency consistency.

**Priority**: Medium — quality-of-life for billing display. Currently works but is fragile.

---

### GAP 8: Import Flow (Mock → Real)

**Current state**: `ImportServiceConfigButton.tsx` uses `MOCK_SERVICE_OFFERING` with hardcoded data. Does not read from any SO document.

**Needed**: Import from browser store state (Achra "submit request" flow).

**Gap**: The entire import flow needs to be built:

```
SO Browser Store State (Achra)
    ├── Selected tier (id, name, pricingMode)
    ├── Selected billing cycle (global)
    ├── Per-group billing cycle overrides
    ├── Enabled add-ons
    ├── Resolved prices (post-discount, per-group, per-cycle)
    └── Services with metrics and limits
         │
         ▼ One-time copy (InitializeSubscription mutation)
         │
SI Document State
    ├── tierName, tierPrice (snapshot)
    ├── serviceGroups[] (with resolved costs)
    ├── services[] (with resolved metrics)
    └── Independent from SO going forward
```

**Required mapping** (SO → SI):

| SO Field | SI Field | Transformation |
|----------|----------|----------------|
| `tier.name` | `tierName` | Direct copy |
| `tier.pricing.amount` (or calculated) | `tierPrice` | Post-discount amount for selected cycle |
| `tier.pricing.currency` | `tierCurrency` | Direct copy |
| `tier.pricingMode` | `tierPricingMode` | Direct copy (NEW field) |
| `activeBillingCycle` | `selectedBillingCycle` | Direct copy |
| `regularGroup` | `serviceGroup {optional: false}` | Map OptionGroup → ServiceGroup |
| `setupGroup` | `serviceGroup {optional: false, costType: SETUP}` | Map with costType |
| `addonGroup (enabled)` | `serviceGroup {optional: true}` | Only if enabled |
| `group.recurringPricing[selectedCycle]` | `group.recurringCost` | Post-discount amount |
| `group.setupCost` | `group.setupCost` | Direct copy |
| `service (INCLUDED/OPTIONAL+selected)` | `service` | Filter by service level |
| `usageLimit.freeLimit` | `metric.freeLimit` | NEW field |
| `usageLimit.paidLimit` | `metric.paidLimit` | NEW field |
| `usageLimit.unitPrice` | `metric.unitCost.amount` | Direct copy |
| `discount applied` | `recurringCost.discount` | NEW DiscountInfo |

**Priority**: Critical — this is the core pipeline. Without it, SI creation is manual.

---

### GAP 9: Billing Panel Structure (Context Only — Out of Scope)

**Stakeholder requirement** (from `rgh req SI`):
> "Merge the recurring services and metrics sections by using the service group as a header with the recurring price, and using the metrics as line items."

**Current SI BillingPanel**: Shows flat service-level lines, iterating through `state.services[]` and `state.serviceGroups[].services[]` independently.

**Gap**: The billing panel doesn't use service groups as headers. It doesn't merge metrics under their parent service. Setup costs aren't on a separate tab.

**Impact**: Not blocking for the pricing linkage, but noted as a downstream requirement that depends on GAP 1 (costType) and GAP 2 (discount context).

**Priority**: Out of scope — tracked for future SI editor redesign.

---

## Design Decisions

### Schema Changes Summary

```graphql
# NEW enum
enum DiscountType { PERCENTAGE, FLAT_AMOUNT }
enum DiscountSource { TIER_INHERITED, GROUP_INDEPENDENT, BUNDLE }
enum TierPricingMode { CALCULATED, MANUAL_OVERRIDE }
# GroupCostType already exists in SO, reuse: enum GroupCostType { RECURRING, SETUP }

# NEW type
type DiscountInfo {
    originalAmount: Amount_Money!
    discountType: DiscountType!
    discountValue: Float!
    source: DiscountSource!
}

# MODIFIED: SubscriptionInstanceState — add fields
type SubscriptionInstanceState {
    # ... all existing fields unchanged
    tierPricingMode: TierPricingMode    # NEW
    globalCurrency: Currency            # NEW
}

# MODIFIED: ServiceGroup — add field
type ServiceGroup {
    # ... all existing fields unchanged
    costType: GroupCostType             # NEW
}

# MODIFIED: RecurringCost — add field
type RecurringCost {
    # ... all existing fields unchanged
    discount: DiscountInfo              # NEW
}

# MODIFIED: ServiceMetric — add fields, deprecate limit
type ServiceMetric {
    # ... all existing fields unchanged
    freeLimit: Int                      # NEW (replaces limit)
    paidLimit: Int                      # NEW
    # limit: Int — KEEP for backward compat, map to freeLimit at import
}

# MODIFIED: Service — add field
type Service {
    # ... all existing fields unchanged
    serviceLevel: ServiceLevel          # NEW (optional, low priority)
}
```

### Operations Needed

| Operation | Module | Purpose |
|-----------|--------|---------|
| Modify `InitializeSubscription` | subscription | Accept new fields (tierPricingMode, globalCurrency) |
| Modify `AddServiceGroup` | service-group | Accept `costType` field |
| Modify `AddServiceToGroup` / `AddService` | service / service-group | Accept `serviceLevel` field |
| Modify `AddServiceMetric` | metrics | Accept `freeLimit`, `paidLimit` (keep `limit` as alias) |
| New: `UpdateRecurringCostDiscount` | service | Set/update discount info on a recurring cost |

### Risk Assessment

- **Breaking changes**: Adding optional fields to existing types is non-breaking. `limit` → `freeLimit` migration needs backward compatibility (keep `limit`, use `freeLimit ?? limit` in calculations).
- **Import complexity**: The SO → SI mapping involves discount resolution at import time. The browser store must compute post-discount prices before dispatching `InitializeSubscription`.
- **Dual-model maintenance**: Changes to SO pricing logic may require updating the import mapping. This is mitigated by the snapshot model (SI is independent after creation).

---

## Acceptance Criteria

### Schema Acceptance
- [ ] `SubscriptionInstanceState` includes `tierPricingMode` and `globalCurrency` fields
- [ ] `ServiceGroup` includes `costType: GroupCostType` field
- [ ] `RecurringCost` includes `discount: DiscountInfo` field
- [ ] `ServiceMetric` includes `freeLimit` and `paidLimit` fields
- [ ] All new fields are optional (nullable) for backward compatibility
- [ ] Existing operations continue to work unchanged

### Import Pipeline Acceptance
- [ ] `InitializeSubscription` mutation accepts all new fields
- [ ] Import correctly maps SO OptionGroups → SI ServiceGroups with costType
- [ ] Import resolves post-discount prices using SO's discount cascade
- [ ] Import sets `discount: DiscountInfo` with original amount and discount metadata
- [ ] Import maps `freeLimit` and `paidLimit` from SO usage limits
- [ ] Import only includes enabled add-ons
- [ ] Import only includes services at INCLUDED or OPTIONAL+selected levels

### Quality Standards
- [ ] TypeScript check passes (`npm run tsc`)
- [ ] ESLint check passes (`npm run lint:fix`)
- [ ] No regression in existing SI editor functionality
- [ ] All existing SI tests continue to pass

---

## Execution Phases

### Phase 1: Schema Updates
**Goal**: Add new fields to SI document model schema

- [ ] Add `TierPricingMode`, `DiscountType`, `DiscountSource`, `GroupCostType` enums to SI schema
- [ ] Add `DiscountInfo` type to SI schema
- [ ] Add `tierPricingMode`, `globalCurrency` to `SubscriptionInstanceState`
- [ ] Add `costType` to `ServiceGroup`
- [ ] Add `discount` to `RecurringCost`
- [ ] Add `freeLimit`, `paidLimit` to `ServiceMetric`
- [ ] Update via MCP (document model operations) and regenerate types
- **Deliverables**: Updated schema.graphql, generated types

### Phase 2: Reducer Updates
**Goal**: Update operations to accept and store new fields

- [ ] Update `initializeSubscription` reducer to handle `tierPricingMode`, `globalCurrency`
- [ ] Update `addServiceGroup` reducer to handle `costType`
- [ ] Update `addService` / `addServiceToGroup` reducers for `serviceLevel`
- [ ] Update `addServiceMetric` reducer for `freeLimit`, `paidLimit`
- [ ] Add input fields to operation schemas via MCP
- [ ] Update `InitializeSubscriptionInput` with all new fields including service group `costType` and metric `freeLimit`/`paidLimit`
- **Deliverables**: Updated reducers passing all new data through

### Phase 3: Import Pipeline
**Goal**: Replace mock import with real SO → SI mapping

- [ ] Define the browser store state interface (what Achra provides)
- [ ] Create `mapOfferingToSubscription()` utility function
- [ ] Implement discount resolution at import time (post-discount with metadata)
- [ ] Map SO OptionGroups → SI ServiceGroups (with costType, resolved costs)
- [ ] Map SO Services (filtered by level) → SI Services
- [ ] Map SO UsageLimits → SI ServiceMetrics (freeLimit + paidLimit)
- [ ] Replace `ImportServiceConfigButton` with real import logic
- **Deliverables**: Working SO → SI data pipeline

### Phase 4: Tests & Validation
**Goal**: Verify the pipeline produces correct SI state

- [ ] Write tests for `mapOfferingToSubscription()` — regular groups, setup groups, addons
- [ ] Write tests for discount resolution at import (percentage, flat, proportional)
- [ ] Write tests for metric limit mapping (freeLimit vs paidLimit)
- [ ] Write tests for MANUAL_OVERRIDE tier price preservation (bundle discount scenario)
- [ ] Update existing SI tests for new schema fields
- [ ] Run `npm run tsc` and `npm run lint:fix`
- **Deliverables**: Complete test coverage for import pipeline

---

## Gap Priority Matrix

| Gap | Priority | Schema Change | Editor Change | Blocks Import |
|-----|----------|---------------|---------------|---------------|
| GAP 2: Discount context | **High** | Yes (DiscountInfo) | Future | Yes |
| GAP 4: Usage limits | **High** | Yes (freeLimit/paidLimit) | BillingPanel overage calc | Yes |
| GAP 8: Import flow | **Critical** | No | Yes | IS the import |
| GAP 1: Group costType | **Medium** | Yes (costType) | Future (billing tabs) | Partially |
| GAP 3: Tier pricing mode | **Medium** | Yes (tierPricingMode) | Informational only | No |
| GAP 7: Global currency | **Medium** | Yes (globalCurrency) | Simplifies billing | No |
| GAP 5: Service level | **Low** | Yes (serviceLevel) | Display badge | No |
| GAP 6: Add-on state | **None** | No | No | No |
| GAP 9: Billing layout | **Out of scope** | Depends on GAP 1, 2 | Yes (redesign) | No |

---

**Document Version**: 1.0
**Created**: 2026-02-17
**Clarity Score**: 91/100
**Status**: Ready for stakeholder review
**Dependencies**: BA-Service-Offering.md, tier-service-group-pricing-linkage-v1.0-prd.md, rgh req SI
