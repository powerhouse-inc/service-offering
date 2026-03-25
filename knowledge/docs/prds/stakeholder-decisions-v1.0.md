# Stakeholder Decisions — Service Offering & Subscription Instance Restructure

**Date**: 2026-02-13
**Status**: Approved for implementation
**Source**: [questions.md](questions.md)

---

## Executive Summary

**Key Architectural Changes**:
1. ✅ Pricing moves from individual services to service groups
2. ✅ Service groups have per-tier pricing with billing cycle discounts
3. ✅ Tier pricing becomes a calculated aggregate of group prices
4. ✅ Global discount configuration at tier level applies to all groups
5. ✅ Add-ons can be tier-dependent or standalone (fixed price)
6. ✅ Single currency per subscription instance

---

## Part 1 — Service Offering Decisions

### SO-Q1: Pricing Matrix Structure ✅ DECIDED

**Decision**: Pricing moves to service group level, with per-tier pricing

**Key Points**:
- There are as many "Core Services" pricings at the group level as there are tiers
- Each service group has a price for each tier
- Tier recurring pricing is a **calculated value** based on the service group recurring pricings
- Formula: `Tier Price = SUM(included service group prices for that tier)`

**Example**:
```
Service Group: "Core Services"
├─ Tier "Basic": $100/mo
├─ Tier "Team": $200/mo
└─ Tier "Enterprise": $500/mo

Service Group: "Operations"
├─ Tier "Basic": $50/mo
├─ Tier "Team": $100/mo
└─ Tier "Enterprise": $300/mo

Calculated Tier Prices:
├─ Tier "Basic": $100 + $50 = $150/mo
├─ Tier "Team": $200 + $100 = $300/mo
└─ Tier "Enterprise": $500 + $300 = $800/mo
```

---

### SO-Q2: Discount System & Billing Cycles ✅ DECIDED

**Decision**: Two-level discount system — per-group and global tier-level

**Discount Calculation Logic**:
- Base: $100/month
- Annual without discount: $100 × 12 = $1,200
- Annual with discount: $1,200 - $120 = $1,080
- Discount can be flat amount or percentage

**Implementation Approach**:

**Option A — Per-Group Billing Cycle Pricing** (Primary):
```
Service Group: "Core Services" for Tier "Team"
├─ Monthly: $200/mo
├─ Quarterly: $570/qtr ($190/mo equivalent) — 5% discount
├─ Semi-Annual: $1,080/6mo ($180/mo equivalent) — 10% discount
└─ Annual: $2,040/yr ($170/mo equivalent) — 15% discount

User selects billing cycle on Achra → sees discounted price
```

**Option B — Global Tier-Level Discount** (Secondary):
```
Tier "Team" has global discount settings:
├─ Monthly: 0% discount
├─ Quarterly: 5% discount
├─ Semi-Annual: 10% discount
└─ Annual: 15% discount

When user selects "Annual" at tier level:
→ All service groups in tier apply 15% discount automatically
```

**Editor Configuration**:
- SO editor allows operators to set either:
  1. Per-group per-cycle pricing (manual price entry)
  2. Global tier discount percentages (applies to all groups)
- Achra allows users to select billing cycle at tier level (applies globally to all groups in initial purchase)

**Key Requirement**: Billing cycle choice is typically applied globally across all service groups for the initial package purchase.

---

### SO-Q3: Downstream Impact on Subscription Instance ✅ DECIDED

**Decision**: YES — Service groups gain cost fields, individual services lose them

**Changes**:
- ✅ Subscription Instance `ServiceGroup` gains `setupCost` and `recurringCost` fields
- ✅ Individual `Service` entities lose all cost fields
- ✅ Applies to both Service Offering and Subscription Instance document models
- ✅ Applies to both document model schemas and editors

**Rationale**: Simplifies billing, aligns with pricing source, reduces redundancy.

---

### SO-Q4: Migration Strategy ✅ DECIDED

**Decision**: Service Offering should only have PER SERVICE GROUP PRICING, no per-service pricing

**Migration Path**:
1. Remove all per-service pricing fields from Service Offering schema
2. Add service group pricing (per-tier, per-cycle)
3. Migrate existing offerings: aggregate service prices into parent group prices
4. Hard break — no coexistence of old and new pricing models

---

### SO-Q5: Setup Cost Independence ✅ DECIDED

**Decision**: Setup cost defined once per group, same across all billing cycles

**Key Points**:
- Setup cost is at (Group × Tier) level, NOT (Group × Tier × BillingCycle)
- Setup costs do not vary by billing cycle
- Only recurring costs can be discounted based on billing cycle
- Example: Legal Setup $3,000 is the same whether customer chooses monthly, quarterly, or annual

---

### SO-Q6: Standalone Add-Ons ✅ DECIDED

**Decision**: Add-ons support both tier-dependent and standalone pricing models

**Two Modes for Add-On Groups**:

**Mode 1 — Tier-Dependent Add-Ons**:
- Pricing varies by tier
- Example: "Finance Pack" costs $50/mo for Basic tier, $100/mo for Team tier
- Connected to tier pricing structure
- Useful for add-ons that scale with tier capabilities

**Mode 2 — Standalone Fixed-Price Add-Ons**:
- Fixed price regardless of tier
- Example: "Legal Compliance Pack" costs $200/mo for all tiers
- Useful for add-ons introduced after an instance is operational
- Simpler pricing model for universal add-ons

**Schema Support**:
```graphql
type OptionGroup {
    id: OID!
    name: String!
    pricingMode: AddOnPricingMode!  # TIER_DEPENDENT | STANDALONE

    # For standalone mode
    standalonePricing: StandalonePricing

    # For tier-dependent mode
    tierPricing: [OptionGroupTierPricing!]
}

enum AddOnPricingMode {
    TIER_DEPENDENT     # Price varies by tier
    STANDALONE         # Fixed price for all tiers
}

type StandalonePricing {
    setupCost: Amount_Money
    setupCurrency: Currency
    recurringPricing: [RecurringPriceOption!]!  # Per billing cycle
}

type OptionGroupTierPricing {
    tierId: OID!
    setupCost: Amount_Money
    setupCurrency: Currency
    recurringPricing: [RecurringPriceOption!]!  # Per billing cycle
}
```

---

## Part 2 — Subscription Instance Decisions

### SI-Q1: Service Group Pricing Storage ✅ DECIDED

**Decision**: Final selected price snapshot (setupCost + recurringCost fields)

**Schema**:
```graphql
type ServiceGroup {
    id: OID!
    name: String!
    billingCycle: BillingCycle!
    optional: Boolean!
    optionGroupId: OID
    displayOrder: Int

    # NEW: Cost snapshot from SO at subscription creation
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

**Rationale**: Historical record — prices locked in at subscription time, independent of future SO changes.

---

### SI-Q2: Setup Cost Display Location ✅ DECIDED

**Decision**: Collapsible section at bottom of billing panel

**UI Structure**:
```
┌─ Billing Panel (at top of editor) ────────────────┐
│                                                    │
│ [Billing Projection Section]                      │
│   - Projected bill amount                         │
│   - Billing date                                  │
│   - Service groups with recurring costs           │
│   - Metrics with usage bars                       │
│   - Total: Fixed + Dynamic                        │
│                                                    │
│ ─────────────────────────────────────────────────│
│                                                    │
│ [Setup Costs ▼] ← Collapsed by default            │
│   (Click to expand)                               │
│                                                    │
│ When expanded:                                     │
│ [Setup Costs ▲]                                   │
│   Legal Setup: $3,000 ✅ Paid                     │
│   Onboarding: $500 ⏳ Pending                     │
│   Total Setup: $3,500 ($3,000 paid, $500 pending)│
└────────────────────────────────────────────────────┘
```

**Key Points**:
- Billing panel remains at top of editor
- Setup costs are within billing panel but collapsible
- Collapsed by default (less visible)
- Expand on click to see details

---

### SI-Q3: Limit Increase Feature ✅ DECIDED

**Decision**: Kept but visually de-emphasized

**Implementation**:
```tsx
// BEFORE (current)
<MetricActions>
  <Button size="lg" variant="primary">Request Limit Increase</Button>
</MetricActions>

// AFTER (de-emphasized)
<MetricActions>
  <Button size="sm" variant="ghost">Request Increase</Button>
  {/* OR */}
  <OverflowMenu>
    <MenuItem>Request limit increase</MenuItem>
  </OverflowMenu>
</MetricActions>
```

**Changes**:
- Smaller button size
- Less prominent color (ghost/secondary variant)
- Optionally move to overflow menu
- Still accessible, just not primary action

---

### SI-Q4: Setup Cost Classification ✅ DECIDED

**Decision**: Service-level setup = deferred (has timeline), metric-level setup = deferred

**Key Points**:
- Service-level setup groups **cannot be immediate** since there is a timeline to the setup process
- All metric-level setup can be deferred
- Place under recurring section for service groups that are typically recurring

**Classification Rule**:

| Cost Type | When Charged | Display Section | Rationale |
|-----------|-------------|----------------|-----------|
| **Service group setup** | During/after setup timeline | Setup Costs (but acknowledged as deferred) | Has provisioning timeline |
| **Service group recurring** | Every billing cycle | Recurring Costs | Standard recurring billing |
| **Metric overage** | When usage exceeds limit | Recurring Costs | Usage-based, occurs during subscription |
| **Metric setup** (if exists) | On first usage | Recurring Costs | Deferred until usage begins |

**Achra Summary Display**:
```
┌─ PRICING SUMMARY ──────────────────────────────┐
│ RECURRING                                      │
│   Tier (Team)                        $300/mo   │
│   Finance Pack (add-on)               $50/mo   │
│ ──────────────────────────────────────────────│
│ TOTAL RECURRING                      $350/mo   │
│                                                │
│ ONE-TIME SETUP (Timeline-based)                │
│   Legal Setup                        $3,000    │
│   Note: Charged after setup completion         │
│ ──────────────────────────────────────────────│
│ TOTAL SETUP                          $3,000    │
└────────────────────────────────────────────────┘
```

**Important**: Setup costs are shown separately but with clear indication that they have a timeline (not immediate at subscription start).

---

### SI-Q5: Currency Management ✅ DECIDED

**Decision**: No mixed currencies — single currency per instance, user can select USD or USDC

**Implementation**:
```graphql
type SubscriptionInstanceState {
    # Existing fields...
    billingCurrency: Currency!  # NEW: Authoritative currency
}

enum Currency {
    USD
    USDC
    # ... other supported currencies
}
```

**Rules**:
- Instance is displayed through one currency as a whole
- Users can globally select USD or USDC (or other supported currencies)
- All costs (tier, groups, services, metrics, add-ons) must use the billing currency
- Validation: Reject operations that use a different currency than `billingCurrency`

**Initialization**:
```graphql
input InitializeSubscriptionInput {
    # ... existing fields
    billingCurrency: Currency!  # Required — user selects in Achra
}
```

**Display Logic**:
- All amounts displayed in `billingCurrency`
- Currency symbol/code shown consistently
- No conversion, no mixing

---

### SI-Q6: Operator Editable Fields ✅ DECIDED

**Decision**: Most fields should be operator-editable, except core identity and customer-owned fields

**Fields that should NOT be operator-editable**:
- ❌ Core identity: `id`, `operatorId`, `customerId`, `serviceOfferingId`, `resourceId`
- ❌ System timestamps: `createdAt` (but `nextBillingDate` is editable)
- ❌ Customer-owned fields:
  - `customerName`, `customerEmail` (customer updates these via self-service)
  - `teamMemberCount` (customer reports this)
  - `autoRenew` (customer preference)
  - Metric `currentUsage` (customer reports via increment/decrement, not direct edit)
- ❌ Lifecycle status (use dedicated lifecycle operations: ACTIVATE, PAUSE, CANCEL, etc.)

**Fields that SHOULD be operator-editable** (inline or via quick-edit):
- ✅ **Billing & Financial**:
  - `nextBillingDate` — Adjust billing cycle start
  - `projectedBillAmount` — Manual adjustment if needed
  - `serviceGroups[].setupCost` — Apply discount
  - `serviceGroups[].recurringCost` — Apply discount
  - `selectedOptionGroups[].price` — Adjust add-on pricing
- ✅ **Service Configuration**:
  - `services[].customValue` — Update service level display
  - `services[].serviceLevel` — Change service inclusion level
- ✅ **Metrics & Usage**:
  - `metrics[].freeLimit` — Adjust included usage
  - `metrics[].paidLimit` — Adjust maximum allowed
  - `metrics[].unitCost` — Adjust overage pricing
- ✅ **Metadata & Organization**:
  - `operatorNotes` — Internal comments
  - `budgetCategory` — Accounting classification
  - `targetAudienceId` / `targetAudienceLabel` — Business segment
- ✅ **Resource Configuration**:
  - `resource.label`, `resource.thumbnailUrl` — Display info

**UI Pattern**:
- Inline edit (pencil icon) for simple fields (dates, numbers, text)
- Modal for complex edits (cost structures, service levels)
- Clear indication when operator makes changes (audit trail)

**Rationale**: Operators need flexibility to adjust pricing, limits, and metadata for customer success, but should not directly edit customer-owned data or core identity fields.

---

## Part 3 — Remaining Achra Questions (Need Answers)

### ACHRA-Q1: Metric Pricing Placement ❓ PENDING

**Question**: Where should metric overage costs appear in the summary?

**Options**:
- (a) Tooltip/info icon on the service line
- (b) Sub-line under the service ("+ $500/mo per additional contributor")
- (c) Separate "Metric Pricing" section in pricing breakdown
- (d) Only in recurring costs total as projected overage

---

### ACHRA-Q2: Metric Setup Costs Definition ❓ PENDING

**Question**: What is a "metric setup cost that occurs after subscription starts"?

**Note**: Based on SI-Q4, this may be a non-existent concept. Need clarification if metric setup costs are:
- (a) One-time activation fees per metric
- (b) Something else
- (c) Not applicable (all metric costs are recurring overages)

---

### ACHRA-Q3: Pricing Breakdown Structure ❓ PENDING

**Question**: Should the pricing summary show:
- (a) Group-level prices ("Core Services $300/mo, Finance Pack $50/mo")
- (b) Keep "Tier (Team)" as aggregate, only list add-ons separately
- (c) Something else

---

### ACHRA-Q4: Expandable Services ❓ PENDING

**Question**: Should services be:
- (a) All visible (no expand/collapse)
- (b) Collapsed by default, "Show N services" toggle
- (c) First 3 visible, rest behind "Show more"
- (d) Different behavior for included groups (visible) vs add-ons (collapsed)

---

### ACHRA-Q5: Configuration Section ❓ PENDING

**Question**: Are facet selections:
- Always the same 4 categories?
- Dynamic based on `facetTargets`?
- Show ALL selected facets or a curated subset?

---

### ACHRA-Q6: Summary in SI Editor ❓ PENDING

**Question**: Should the same summary layout be available as read-only in SI editor after subscription creation?

---

### ACHRA-Q7: Billing Cycle Display ❓ PENDING

**Question**: If user selects quarterly or annual:
- (a) Monthly equivalent: "$250/mo billed quarterly at $750"
- (b) Actual amount: "$750/qtr"
- (c) Both: "$750/qtr ($250/mo equivalent)"

---

### ACHRA-Q8: Empty/Edge States ❓ PENDING

**Question**: What to show when:
- No add-ons selected
- No setup costs
- Enterprise/custom pricing tier
- Incomplete selections (partial summary)

---

## Part 4 — Schema Changes Summary

### Service Offering Schema Changes

**Add to ServiceGroup**:
```graphql
type ServiceGroup {
    # ... existing fields
    tierPricing: [ServiceGroupTierPricing!]!  # NEW
}

type ServiceGroupTierPricing {
    tierId: OID!
    setupCost: Amount_Money
    setupCurrency: Currency
    recurringPricing: [RecurringPriceOption!]!
}

type RecurringPriceOption {
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
}
```

**Remove from Service**:
```graphql
type Service {
    # REMOVE: costType, price, currency
    # Keep: id, name, description, serviceLevel, etc.
}
```

**Add to ServiceSubscriptionTier**:
```graphql
type ServiceSubscriptionTier {
    # ... existing fields
    discountSettings: TierDiscountSettings  # NEW (optional global discount)
}

type TierDiscountSettings {
    monthlyDiscount: DiscountRule
    quarterlyDiscount: DiscountRule
    semiAnnualDiscount: DiscountRule
    annualDiscount: DiscountRule
}

type DiscountRule {
    discountType: DiscountType!  # PERCENTAGE | FLAT_AMOUNT
    discountValue: Float!
}

enum DiscountType {
    PERCENTAGE     # e.g., 15% off
    FLAT_AMOUNT    # e.g., $120 off
}
```

**Modify OptionGroup**:
```graphql
type OptionGroup {
    # ... existing fields
    pricingMode: AddOnPricingMode!
    standalonePricing: StandalonePricing
    tierPricing: [OptionGroupTierPricing!]
}
```

---

### Subscription Instance Schema Changes

**Add to ServiceGroup**:
```graphql
type ServiceGroup {
    # ... existing fields
    setupCost: SetupCost       # NEW
    recurringCost: RecurringCost  # NEW
}
```

**Remove from Service**:
```graphql
type Service {
    # REMOVE: setupCost, recurringCost
    # Keep: id, name, serviceLevel, customValue, facetLabel, displayOrder, isSetupService
}
```

**Add to State**:
```graphql
type SubscriptionInstanceState {
    # ... existing fields
    billingCurrency: Currency!  # NEW (required)
}
```

---

## Part 5 — Operations Changes

### Service Offering Operations

**Remove**:
- ❌ `UPDATE_SERVICE_COST`
- ❌ Any operations that set per-service pricing

**Add**:
- ✅ `ADD_SERVICE_GROUP_TIER_PRICING` — Set pricing for (group × tier)
- ✅ `UPDATE_SERVICE_GROUP_TIER_PRICING` — Modify pricing
- ✅ `DELETE_SERVICE_GROUP_TIER_PRICING` — Remove pricing
- ✅ `ADD_RECURRING_PRICE_OPTION` — Add billing cycle pricing to group+tier
- ✅ `UPDATE_RECURRING_PRICE_OPTION` — Modify cycle pricing
- ✅ `DELETE_RECURRING_PRICE_OPTION` — Remove cycle pricing
- ✅ `SET_TIER_DISCOUNT_SETTINGS` — Configure global tier discounts
- ✅ `SET_SERVICE_GROUP_SETUP_COST` — Set setup cost for (group × tier)

**Modify**:
- 🔄 `ADD_SERVICE_GROUP` — Remove cost parameters (now set via separate operations)
- 🔄 `ADD_SERVICE` — Remove cost parameters

---

### Subscription Instance Operations

**Remove**:
- ❌ `UPDATE_SERVICE_SETUP_COST`
- ❌ `UPDATE_SERVICE_RECURRING_COST`

**Add**:
- ✅ `UPDATE_SERVICE_GROUP_SETUP_COST` — Operator adjusts group setup cost
- ✅ `UPDATE_SERVICE_GROUP_RECURRING_COST` — Operator adjusts group recurring cost
- ✅ `SET_BILLING_CURRENCY` — Set/update billing currency

**Modify**:
- 🔄 `INITIALIZE_SUBSCRIPTION` — Add `billingCurrency` parameter, populate group costs
- 🔄 `ADD_SERVICE_GROUP` — Add `setupCost` and `recurringCost` parameters
- 🔄 `ADD_SERVICE` — Remove cost parameters
- 🔄 `ADD_SERVICE_TO_GROUP` — Remove cost parameters

---

## Part 6 — Implementation Phases

### Phase 1: Service Offering Schema (Week 1-2)
- [ ] Add `ServiceGroupTierPricing` type
- [ ] Add `RecurringPriceOption` type
- [ ] Add `TierDiscountSettings` type
- [ ] Add `AddOnPricingMode` enum and related types
- [ ] Remove pricing fields from `Service`
- [ ] Add new operations (8 operations)
- [ ] Update existing operations (2 operations)

### Phase 2: Subscription Instance Schema (Week 2-3)
- [ ] Add `setupCost` and `recurringCost` to `ServiceGroup`
- [ ] Remove cost fields from `Service`
- [ ] Add `billingCurrency` to state
- [ ] Add new operations (3 operations)
- [ ] Update existing operations (4 operations)

### Phase 3: Service Offering Editor (Week 3-4)
- [ ] Build service group pricing UI (per-tier pricing matrix)
- [ ] Build billing cycle pricing UI (per-cycle amounts)
- [ ] Build tier discount settings UI (global discounts)
- [ ] Build add-on pricing mode selector (tier-dependent vs standalone)
- [ ] Remove per-service pricing UI
- [ ] Add validation for currency consistency

### Phase 4: Subscription Instance Editor (Week 4-5)
- [ ] Update BillingPanel to show group-level costs
- [ ] Add collapsible setup costs section
- [ ] Remove per-service cost displays
- [ ] Add billing currency selector to initialization
- [ ] De-emphasize limit increase button
- [ ] Update billing projection calculations

### Phase 5: Achra Summary Component (Week 5-6)
- [ ] Pending answers to ACHRA-Q1 through ACHRA-Q8
- [ ] Build summary component based on decisions
- [ ] Integrate with purchase wizard

### Phase 6: Testing & Migration (Week 6-7)
- [ ] Test pricing calculations (tier aggregation, discounts)
- [ ] Test currency enforcement
- [ ] Test group-level billing display
- [ ] Test add-on pricing modes
- [ ] Create migration guide for existing offerings

---

**Document Version**: 1.0
**Created**: 2026-02-13
**Status**: Approved — Ready for Phase 1 implementation
**Next Steps**: Begin Service Offering schema changes
