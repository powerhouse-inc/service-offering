# Service Offering Implementation Gap Analysis

**Date**: 2026-02-13
**Status**: Post Phase 1-2 Implementation Analysis

---

## Executive Summary

This document identifies gaps between stakeholder requirements (from `rgh-requirements-analysis-v1.0.md` and `questions.md`) and the current implementation of Service Offering and Subscription Instance document models and editors.

**Phase 1-2 Completion Status**: ✅ **Complete**
- Service pricing removed from Service type
- ServiceGroup tier pricing structure implemented
- Subscription Instance updated to use group-level pricing
- All TypeScript compilation errors resolved

**Remaining Gaps**: 🟡 **12 Critical Features Missing**

---

## 1. COMPLETED FEATURES ✅

### Service Offering Document Model
✅ **Service Type - Pricing Removal**
- Removed `costType`, `price`, `currency` from Service type
- Service now only has: `id`, `title`, `description`, `displayOrder`, `serviceGroupId`, `isSetupFormation`, `optionGroupId`, `facetBindings`

✅ **ServiceGroup - Tier Pricing Matrix**
- Added `tierPricing: [ServiceGroupTierPricing!]!` field
- `ServiceGroupTierPricing` includes:
  - `id`, `tierId`
  - `setupCost: SetupCost` (optional)
  - `recurringPricing: [RecurringPriceOption!]!` (multiple billing cycles)

✅ **Operations Implemented**
- `ADD_SERVICE_GROUP_TIER_PRICING` - Add pricing for a group×tier combination
- `UPDATE_SERVICE_GROUP_TIER_PRICING_SETUP` - Update setup cost
- `ADD_TIER_PRICING_RECURRING_OPTION` - Add billing cycle pricing
- `UPDATE_TIER_PRICING_RECURRING_OPTION` - Update billing cycle pricing
- `REMOVE_TIER_PRICING_RECURRING_OPTION` - Remove billing cycle pricing
- `REMOVE_SERVICE_GROUP_TIER_PRICING` - Remove entire pricing entry

✅ **Tier Discount Settings**
- Added `discountSettings: TierDiscountSettings` to ServiceSubscriptionTier
- `SET_TIER_DISCOUNT_SETTINGS` operation
- `REMOVE_TIER_DISCOUNT_SETTINGS` operation
- Supports PERCENTAGE and FLAT_AMOUNT discount types

✅ **Option Group Pricing Modes**
- Added `pricingMode: AddOnPricingMode` (TIER_DEPENDENT | STANDALONE)
- Added `standalonePricing: StandalonePricing` for fixed-price add-ons
- Added `tierDependentPricing: [OptionGroupTierPricing!]` for tier-linked add-ons
- Operations: `SET_OPTION_GROUP_STANDALONE_PRICING`, `ADD_OPTION_GROUP_TIER_PRICING`, etc.

### Subscription Instance Document Model
✅ **Service Type - Pricing Removal**
- Service still has `setupCost` and `recurringCost` (for instantiated services)
- This is correct - SI captures the selected pricing at subscription time

✅ **ServiceGroup - Cost Fields**
- Added `recurringCost: RecurringCost` to ServiceGroup
- `ADD_SERVICE_GROUP` operation accepts recurring cost parameters
- `ADD_SERVICE_TO_GROUP` operation for adding services to groups

✅ **Metrics - Consolidated Limit Field**
- Changed from `freeLimit/paidLimit` to single `limit: Int` field
- All operations and UI updated

### Editors
✅ **Service Offering Editor**
- ServiceCatalog.tsx refactored to remove service-level pricing UI
- TheMatrix.tsx updated to remove service pricing display

✅ **Subscription Instance Editor**
- ServicesPanel.tsx updated for group-based structure
- MetricActions.tsx updated for new limit field
- BillingPanel.tsx updated to show group-level costs
- Removed obsolete panels: FacetSelectionsPanel, OptionGroupsPanel, PendingRequestsPanel

---

## 2. CRITICAL GAPS 🔴

### Gap 1: Global Discount Application at Tier Level
**Requirement** (SO-Q2, line 150-151):
> "Users should be able to select annual subscription on the tier level and it's applied to all service groups"

**Current State**:
- ✅ `TierDiscountSettings` exists with per-cycle discounts
- ❌ No UI implementation in Service Offering editor to configure these discounts
- ❌ No mechanism to apply tier-level discounts automatically to all service groups

**What's Missing**:
1. **Service Offering Editor**:
   - UI component to configure tier discount settings (monthlyDiscount, quarterlyDiscount, annualDiscount)
   - UI to show effective pricing with discounts applied
   - Validation that discount is applied to all groups under that tier

2. **Subscription Instance**:
   - No field to store the selected billing cycle at the subscription level
   - No discount calculation logic when creating subscription from offering

**Implementation Required**:
```typescript
// Service Offering Editor - New Component Needed
<TierDiscountSettingsPanel>
  <TierCard tier={tier}>
    <DiscountRule cycle="ANNUAL" type="PERCENTAGE" value={10} />
    // Shows: 10% off for annual billing
    // Applies to ALL service groups in this tier
  </TierCard>
</TierDiscountSettingsPanel>

// Subscription Instance - Missing Field
type SubscriptionInstanceState {
  // ... existing fields
  selectedBillingCycle: BillingCycle  // ← MISSING
  tierDiscountApplied: DiscountRule   // ← MISSING
}
```

### Gap 2: ServiceGroup Setup Cost Field
**Requirement** (SO-Q5, line 157):
> "Setup cost defined once per group and are the same across all billing cycles"

**Current State**:
- ✅ ServiceGroupTierPricing includes `setupCost: SetupCost` (correct structure)
- ❌ But setup cost is per (group × tier) combination, not per group globally
- ❌ No enforcement that setup cost is same across all billing cycles for a tier

**What's Missing**:
The current structure allows different setup costs for different tiers within the same group, which is correct. But there's no UI/logic to enforce that setup cost doesn't vary by billing cycle within the same (group, tier) pair.

**Validation Needed**:
```typescript
// When setting recurring pricing for different cycles, enforce:
tierPricing.setupCost === sameForAllBillingCycles
```

### Gap 3: Calculated Tier Pricing
**Requirement** (SO-Q1, line 143):
> "Recurring pricing for the tier is a calculated value based on the service group recurring pricings"

**Current State**:
- ✅ ServiceSubscriptionTier still has `pricing` and `pricingOptions` fields
- ❌ No calculation logic to sum up all service group pricings for a tier
- ❌ These tier-level pricing fields are now redundant/conflicting with group-level pricing

**What's Missing**:
1. **Calculation Logic**:
   ```typescript
   // Calculate total tier price from all service groups
   function calculateTierPrice(tierId: string, billingCycle: BillingCycle): number {
     return state.serviceGroups
       .flatMap(g => g.tierPricing)
       .filter(tp => tp.tierId === tierId)
       .flatMap(tp => tp.recurringPricing)
       .filter(rp => rp.billingCycle === billingCycle)
       .reduce((sum, rp) => sum + rp.amount, 0);
   }
   ```

2. **Decision Needed**: Should `ServiceSubscriptionTier.pricing` be:
   - (a) Removed entirely (pricing is only at group level)
   - (b) Computed/cached value (sum of all groups)
   - (c) Base price that groups add to

**Recommendation**: Make tier pricing **computed** from service groups.

### Gap 4: Subscription Instance Missing setupCost on ServiceGroup
**Requirement** (SO-Q3, line 153):
> "Subscription instance service group gains a setup and a recurring cost fields"

**Current State**:
- ✅ SI ServiceGroup has `recurringCost: RecurringCost`
- ❌ SI ServiceGroup missing `setupCost: SetupCost` field

**Implementation Required**:
```graphql
# subscription-instance/schema.graphql
type ServiceGroup {
    id: OID!
    optional: Boolean!
    name: String!
    setupCost: SetupCost          # ← ADD THIS
    recurringCost: RecurringCost
    services: [Service!]!
}

# Update operations
input AddServiceGroupInput {
  # ... existing fields
  setupAmount: Amount_Money       # ← ADD THIS
  setupCurrency: Currency         # ← ADD THIS
  setupBillingDate: DateTime      # ← ADD THIS
}
```

### Gap 5: Service Offering Editor - Tier Pricing Configuration UI
**Requirement**: Configure group × tier × billing cycle pricing matrix

**Current State**:
- ✅ Operations exist in document model
- ❌ No UI to configure ServiceGroup tier pricing in the editor

**What's Missing**:
A comprehensive UI component to manage the pricing matrix:
```
ServiceCatalog or TheMatrix needs:
├── ServiceGroupPricingPanel
│   ├── For each ServiceGroup:
│   │   ├── For each Tier:
│   │   │   ├── Setup Cost: $___
│   │   │   └── Recurring Pricing:
│   │   │       ├── Monthly: $___
│   │   │       ├── Quarterly: $___
│   │   │       ├── Annual: $___
│   │   │       └── (with discount preview)
```

### Gap 6: Subscription Instance Editor - Billing Cycle Selection
**Requirement** (SO-Q2, line 149-151):
> "Users should be able to select a billing cycle for the service group on the Acra platform"

**Current State**:
- ❌ No UI to select billing cycle when creating subscription
- ❌ No field to store selected billing cycle at subscription level
- ❌ Only group-level recurringCost exists (single selected option)

**What's Missing**:
1. **Subscription Instance State**:
   ```graphql
   type SubscriptionInstanceState {
     # ... existing
     selectedBillingCycle: BillingCycle!  # Global billing cycle choice
   }
   ```

2. **UI Component** (for Achra summary / subscription creation):
   ```tsx
   <BillingCycleSelector
     options={[MONTHLY, QUARTERLY, ANNUAL]}
     onSelect={(cycle) => {
       // Apply discount from tier discount settings
       // Update all service groups with selected cycle pricing
     }}
   />
   ```

### Gap 7: Standalone vs Tier-Dependent Add-on Pricing Logic
**Requirement** (SO-Q6, lines 159-160):
> "Standalone add-on that has a fixed cost irrespective of the tier (useful for add-ons introduced after an instance is operational)"

**Current State**:
- ✅ OptionGroup has `pricingMode` (STANDALONE | TIER_DEPENDENT)
- ✅ OptionGroup has `standalonePricing` and `tierDependentPricing` structures
- ❌ No UI to toggle between modes
- ❌ No clear documentation on when to use which mode

**What's Missing**:
1. **Service Offering Editor UI**:
   ```tsx
   <OptionGroupPricingModeSelector
     mode={optionGroup.pricingMode}
     onSwitch={(mode) => {
       if (mode === "STANDALONE") {
         // Show flat pricing inputs
       } else {
         // Show per-tier pricing matrix
       }
     }}
   />
   ```

2. **Business Logic Documentation**: When should operators use STANDALONE vs TIER_DEPENDENT?

### Gap 8: Subscription Instance - Billing Panel Redesign
**Requirement** (SI-Q2, line 164):
> "Collapsible section at the bottom of billing panel, but the billing panel should be at the top as a whole"

**Current State**:
- ❌ BillingPanel exists but not positioned at top
- ❌ No collapsible section for setup costs
- ❌ Current layout: Services → Billing (somewhere in the middle)

**What's Missing**:
```tsx
// Editor layout should be:
<SubscriptionInstanceEditor>
  <SubscriptionHeader />
  <BillingPanel />           {/* ← Move to top */}
    <RecurringCostsSection />
    <SetupCostsCollapsible /> {/* ← Collapsible at bottom */}
  <ServicesPanel />
  <CustomerInfo />
  <OperatorNotes />
</SubscriptionInstanceEditor>
```

### Gap 9: Single Currency Enforcement
**Requirement** (SI-Q5, line 170):
> "No mixed currencies, instance is displayed through one currency as a whole"

**Current State**:
- ✅ SubscriptionInstanceState has `projectedBillCurrency: Currency`
- ❌ No validation to reject operations with mismatched currencies
- ❌ No global currency selector UI

**What's Missing**:
1. **Validation in Operations**:
   ```typescript
   addServiceToGroupOperation(state, action) {
     // Validate that service currency matches instance currency
     if (action.input.currency !== state.projectedBillCurrency) {
       throw new CurrencyMismatchError("Service currency must match subscription currency");
     }
   }
   ```

2. **UI**: Global currency selector at subscription creation time

### Gap 10: Operator Editable Fields Implementation
**Requirement** (SI-Q6, line 172):
> "Most fields should be operator-editable, except: core identity fields, customer-owned fields, and lifecycle status"

**Current State**:
- ✅ ModeToggle exists (client/operator views)
- ❌ No inline editing for operator-editable fields
- ❌ All fields are currently read-only or require modal/operation dispatch

**What's Missing**:
Inline editing UI for operator mode:
```tsx
<EditableField
  value={state.nextBillingDate}
  editable={mode === "operator"}
  onChange={(newDate) => dispatch(updateNextBillingDate(...))}
/>
```

Fields that should be editable:
- `nextBillingDate`, `renewalDate`
- `projectedBillAmount`, `projectedBillCurrency`
- `operatorNotes`, `budget`
- Metric `limit` values
- Service group `recurringCost.amount`

Fields that should NOT be editable:
- `id`, `operatorId`, `customerId`
- `customerName`, `customerEmail`, `teamMemberCount`, `autoRenew`
- `status` (use dedicated operations)
- Metric `currentUsage`

### Gap 11: Service Offering Editor - Import from Service Offering
**Current State**:
- ✅ Subscription Instance editor has `ImportServiceConfigButton`
- ❌ No logic to import pricing from Service Offering tier pricing matrix
- ❌ Button likely doesn't work correctly with new pricing structure

**What's Missing**:
Update import logic to:
1. Read ServiceGroupTierPricing from selected tier
2. Apply tier discount settings if annual billing selected
3. Create SI ServiceGroups with setupCost + recurringCost
4. Create SI Services without pricing (pricing is on groups)

### Gap 12: TheMatrix Component - Pricing Display
**Current State**:
- ✅ TheMatrix removed service-level pricing display
- ❌ No group-level pricing matrix display
- ❌ No way to visualize (Group × Tier × BillingCycle) pricing

**What's Missing**:
A visual pricing matrix component:
```
                 Starter   Professional   Enterprise
Core Services
  Monthly        $100      $300           Custom
  Annual         $1,000    $3,000         Custom

Add-ons
  Finance Pack
    Monthly      $50       $50            $50
    Annual       $500      $500           $500
```

---

## 3. MINOR GAPS 🟡

### Gap 13: Service Offering Editor - Discount Preview
**Requirement** (SO-Q2): Show discount calculations

**What's Missing**:
When configuring service group pricing, show effective price with discount:
```
Monthly: $100/mo
Annual: $1,200/yr → $1,080/yr (10% tier discount applied)
```

### Gap 14: Subscription Instance - Setup Cost Tab/Section
**Requirement** (SI-Q2): Collapsible section for setup costs

**Current State**: Setup costs are displayed inline with services

**What's Missing**: Dedicated collapsible section at bottom of billing panel

### Gap 15: Subscription Instance - Metric Pricing Display
**Requirement** (SI-Q7/ACHRA-Q1): Show metric overage pricing

**Current State**: MetricActions shows usage bar but no pricing preview

**What's Missing**:
```tsx
<MetricCard>
  <UsageBar current={45} limit={50} />
  <OveragePricing>
    $500/mo per additional contributor above 50
  </OveragePricing>
</MetricCard>
```

---

## 4. DOCUMENTATION GAPS 📝

### Gap 16: Pricing Model Flow Documentation
**Missing**: End-to-end flow documentation for:
1. Creating service offering with group-level pricing
2. Configuring tier discounts
3. Creating subscription instance from offering
4. How pricing is calculated and displayed

### Gap 17: Migration Guide
**Missing**: Guide for migrating existing documents from old service-level pricing to new group-level pricing

### Gap 18: Add-on Pricing Mode Decision Guide
**Missing**: When to use STANDALONE vs TIER_DEPENDENT for add-on option groups

---

## 5. SCHEMA INCONSISTENCIES ⚠️

### Issue 1: Redundant Tier Pricing Fields
**Problem**: `ServiceSubscriptionTier` still has both:
- `pricing: ServicePricing!` (base price)
- `pricingOptions: [TierPricingOption!]!` (per-cycle prices)

But pricing now lives at service group level.

**Resolution Needed**: Decide if these should be:
- (a) Removed (breaking change)
- (b) Computed from service groups
- (c) Kept as deprecated for backward compatibility

### Issue 2: OptionGroup Deprecated Fields
**Problem**: `OptionGroup` has both new and old pricing fields:
- New: `pricingMode`, `standalonePricing`, `tierDependentPricing`
- Old: `costType`, `billingCycle`, `price`, `currency` (deprecated)

**Resolution Needed**: Remove deprecated fields or add migration logic

### Issue 3: ServiceGroup billingCycle Field
**Problem**: `ServiceGroup` in Service Offering has `billingCycle: BillingCycle!` field

But in the new model, billing cycle is:
- Selected at subscription creation time (global choice)
- Or multiple options in `recurringPricing` array

**Resolution Needed**: This field may be redundant or needs clarification on its purpose

---

## 6. PRIORITY MATRIX

| Gap | Priority | Effort | User Impact |
|-----|----------|--------|-------------|
| Gap 1: Global Discount Application | 🔴 Critical | High | High - Core pricing feature |
| Gap 2: Setup Cost Enforcement | 🟡 High | Medium | Medium - Edge case handling |
| Gap 3: Calculated Tier Pricing | 🔴 Critical | Medium | High - Tier price display |
| Gap 4: SI ServiceGroup setupCost | 🔴 Critical | Low | High - Schema completeness |
| Gap 5: SO Editor Tier Pricing UI | 🔴 Critical | High | High - Cannot configure pricing |
| Gap 6: SI Billing Cycle Selection | 🔴 Critical | Medium | High - Cannot create subscription |
| Gap 7: Add-on Pricing Mode UI | 🟡 High | Medium | Medium - Add-on configuration |
| Gap 8: Billing Panel Redesign | 🟡 High | Medium | Medium - UX improvement |
| Gap 9: Currency Enforcement | 🟡 High | Low | Medium - Data integrity |
| Gap 10: Operator Editable Fields | 🟡 Medium | High | Medium - Operator convenience |
| Gap 11: Import from SO | 🟡 High | Medium | High - Integration feature |
| Gap 12: TheMatrix Pricing Display | 🟡 Medium | High | Low - Nice to have visualization |
| Gaps 13-15: Minor UI Enhancements | 🟢 Low | Low-Med | Low - Polish |

---

## 7. RECOMMENDED IMPLEMENTATION PHASES

### Phase 3: Critical Pricing Features (High Priority)
**Goal**: Make pricing fully functional

1. **Gap 4**: Add `setupCost` field to SI ServiceGroup schema ✅ Schema change
2. **Gap 3**: Implement calculated tier pricing logic ✅ Business logic
3. **Gap 6**: Add `selectedBillingCycle` to SI state + operations ✅ Schema change
4. **Gap 9**: Add currency validation to all cost operations ✅ Validation logic

**Estimated Effort**: 1-2 days

### Phase 4: Service Offering Editor - Pricing Configuration (Critical)
**Goal**: Enable operators to configure group-level pricing

1. **Gap 5**: Build ServiceGroupPricingPanel UI component
   - Matrix view: Group × Tier × BillingCycle
   - Setup cost input per (Group, Tier)
   - Recurring pricing inputs per billing cycle

2. **Gap 1**: Build TierDiscountSettings UI component
   - Configure percentage/flat discounts per billing cycle
   - Preview effective pricing with discounts

3. **Gap 7**: Add-on pricing mode toggle UI
   - Switch between STANDALONE and TIER_DEPENDENT
   - Conditional pricing inputs

**Estimated Effort**: 3-4 days

### Phase 5: Subscription Instance Editor - Subscription Creation (High Priority)
**Goal**: Enable creating subscriptions with new pricing model

1. **Gap 6**: Billing cycle selection UI (for Achra summary)
2. **Gap 11**: Update import from Service Offering logic
3. **Gap 8**: Restructure editor layout (billing panel at top)
4. **Gap 14**: Add collapsible setup costs section

**Estimated Effort**: 2-3 days

### Phase 6: Operator Experience Enhancements (Medium Priority)
**Goal**: Improve operator workflow

1. **Gap 10**: Implement inline editing for operator mode
2. **Gap 15**: Add metric pricing display
3. **Gap 13**: Add discount preview in pricing UI

**Estimated Effort**: 2-3 days

### Phase 7: Polish & Documentation (Low Priority)
1. **Gaps 16-18**: Create comprehensive documentation
2. **Gap 12**: Build TheMatrix pricing visualization
3. **Schema Cleanup**: Remove deprecated fields (breaking change)

**Estimated Effort**: 2-3 days

---

## 8. BLOCKING ISSUES

### None Currently Blocking
All critical features can be implemented with current schema structure.

### Decisions Needed Before Phase 7
1. **Tier Pricing Fields**: Remove or keep `ServiceSubscriptionTier.pricing` and `pricingOptions`?
2. **OptionGroup Deprecated Fields**: When to remove old pricing fields?
3. **ServiceGroup billingCycle**: Keep or remove this field?

---

## 9. TESTING REQUIREMENTS

### Integration Tests Needed
1. ✅ Discount calculation (tier-level discount applied to all groups)
2. ✅ Pricing matrix completeness (all group × tier combinations have pricing)
3. ✅ Currency consistency (all costs use same currency)
4. ✅ Setup cost consistency (same across billing cycles for same group × tier)
5. ✅ Import from Service Offering (creates valid SI with correct pricing)

### E2E Tests Needed
1. ✅ Create service offering with multiple groups and tiers
2. ✅ Configure tier discounts
3. ✅ Create subscription instance
4. ✅ Verify pricing displayed correctly in SI editor
5. ✅ Verify billing calculations

---

## SUMMARY

**Completed**: 15 major features ✅
**Critical Gaps**: 12 features 🔴
**Minor Gaps**: 3 features 🟡
**Documentation**: 3 items 📝

**Next Immediate Actions**:
1. Implement Phase 3 (Critical Pricing Features) - 1-2 days
2. Implement Phase 4 (SO Editor Pricing UI) - 3-4 days
3. Implement Phase 5 (SI Editor Subscription Creation) - 2-3 days

**Total Estimated Effort**: 6-9 days to complete all critical features
