# Per-Tier Service Group Pricing - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: Service groups (OptionGroups) currently have a single standalone recurring price that applies regardless of which tier a customer selects. This makes it impossible to model differentiated pricing (e.g., "operational" at $50/mo for Basic vs $100/mo for Professional). Tier prices and service group prices are disconnected, preventing integrity verification that tier price = SUM(constituent group prices).
- **Target Users**: Service offering operators who design pricing structures with multiple tiers and need per-tier granularity for each service group.
- **Value Proposition**: Enables accurate per-tier pricing composition where each service group contributes a specific amount to each tier, billing cycle discounts cascade correctly per group-tier pair, and the system can verify pricing integrity (SUM of group prices for tier X = tier X price).

### Feature Overview
- **Core Features**:
  1. Per-tier recurring price inputs for regular (non-addon, non-setup) service groups
  2. Tier tab navigation in the edit modal
  3. Per-tier budget checks (SUM of group prices per tier vs tier price)
  4. Discount cascade: group-tier discounts → tier-level discounts → none
  5. Custom tier tabs showing "negotiated per customer" (no price input)
  6. $0 + warning badge for groups without pricing on a given tier

- **Feature Boundaries**:
  - **In scope**: Regular group per-tier pricing, tier tabs in edit modal, per-tier budget checks in ServiceCatalog and Matrix, discount cascade update
  - **Out of scope**: Add-on groups (keep existing TIER_DEPENDENT/STANDALONE toggle), setup groups (no recurring pricing), subscription instance side effects
  - **Replaces**: Standalone pricing for regular groups, standalone-based budget indicators

- **User Scenarios**:
  1. Operator creates 3 tiers (Basic $99, Professional $299, Enterprise Custom), then in Services step sets per-tier prices for each group: "operational" → Basic $50, Professional $150, Enterprise (custom)
  2. Operator adds a new tier after groups exist → all groups show $0 with warning badge on that tier's tab
  3. Operator adjusts a group's price on Basic tier → budget indicator shows running total vs $99 tier price, warning if exceeded

### Detailed Requirements

- **Input/Output**:
  - Input: Per-tier recurring price (amount, currency, billing cycle) via `OptionGroup.tierDependentPricing[].recurringPricing[]`
  - Output: Per-tier calculated sums, budget indicators, discount-applied prices in Matrix
  - Operations used: `addOptionGroupTierPricing`, `updateOptionGroupTierPricing`, `removeOptionGroupTierPricing` (all existing)

- **User Interaction**:
  1. Open "Edit Group" modal for a regular service group
  2. See tier tab bar (e.g., [Basic] [Professional] [Enterprise (Custom)])
  3. On non-custom tier tab: enter recurring price, see billing cycle discounts (cascaded from tier if not set at group level)
  4. On custom tier tab: see "Price negotiated per customer" message, no price input
  5. See per-tier budget impact indicator below the price input
  6. Save → dispatches `addOptionGroupTierPricing` or `updateOptionGroupTierPricing` per modified tier

- **Data Requirements**:
  - `OptionGroup.tierDependentPricing: [OptionGroupTierPricing!]` — array of per-tier pricing entries
  - `OptionGroupTierPricing`: `{ id, tierId, setupCost?, recurringPricing: [RecurringPriceOption!]! }`
  - `RecurringPriceOption`: `{ id, billingCycle, amount, currency, discount? }`
  - When `addOptionGroupTierPricing` is dispatched, the reducer automatically sets `pricingMode = "TIER_DEPENDENT"` and clears `standalonePricing = null`

- **Edge Cases**:
  - **New tier added**: Groups show $0 + amber warning badge for that tier (no blocking)
  - **Tier deleted**: Associated `tierDependentPricing` entries should be cleaned up (existing `removeOptionGroupTierPricing` call per group)
  - **Custom pricing tier**: Tab shown with "Custom — negotiated per customer" label, no price input field
  - **No tiers exist**: Edit modal shows message "Create tiers first to set per-tier pricing"
  - **All groups missing pricing for a tier**: Tier shows "incomplete" in Matrix SUBTOTAL

## Design Decisions

### Stakeholder Decisions (Clarification Rounds)

| Decision | Question | Answer | Rationale |
|----------|----------|--------|-----------|
| SO-PTR-1 | Regular group pricing mode? | **Always per-tier** | Simplifies model — no toggle needed for regular groups |
| SO-PTR-2 | Edit modal UX? | **Tier tabs** | Keeps modal compact, one tier visible at a time |
| SO-PTR-3 | Discount cascade? | **Group → Tier** | Check group-tier discounts first, fall back to tier-level. Extends existing `resolveGroupDiscount()` pattern |
| SO-PTR-4 | New tier without prices? | **$0 + warning badge** | Non-blocking, operator fills in gradually |
| SO-PTR-5 | Which data entity? | **OptionGroup.tierDependentPricing** | Editor already revolves around OptionGroups. ServiceGroup.tierPricing stays unused |
| SO-PTR-6 | Budget check model? | **Replace with per-tier** | Each tier independently: SUM(group prices for tier X) vs tier X price |
| SO-PTR-7 | Add-on groups? | **Keep toggle** | Add-ons retain existing TIER_DEPENDENT/STANDALONE toggle |
| SO-PTR-8 | Custom tier tabs? | **Show tab, no price input** | Tab labeled "Enterprise (Custom)" with "negotiated per customer" note |

### Technical Approach

- **Architecture**: Leverage existing `OptionGroup.tierDependentPricing` schema and operations (no schema changes needed). Replace editor UI from standalone pricing to per-tier pricing.
- **Key Components**:
  1. **ServiceCatalog.tsx** — Tier tab bar + per-tier price input in edit modal
  2. **pricing-utils.ts** — Updated `calculateTierRecurringPrice()` to read from `tierDependentPricing` per tier
  3. **TheMatrix.tsx** — Per-tier calculated sums in SUBTOTAL, per-tier budget comparison
  4. **TierDefinition.tsx** — Calculated price uses per-tier sum for CALCULATED mode
  5. **BudgetIndicator.tsx** — Per-tier budget awareness
- **Data Storage**: `OptionGroup.tierDependentPricing[]` in the document model state (already exists in schema)
- **Interface Design**: Existing MCP operations — no new operations needed

### Existing Operations (Already Implemented)

| Operation | Input | Reducer Behavior |
|-----------|-------|-----------------|
| `ADD_OPTION_GROUP_TIER_PRICING` | `{ optionGroupId, tierPricingId, tierId, setupCost?, recurringPricing[] }` | Sets `pricingMode="TIER_DEPENDENT"`, clears `standalonePricing=null`, pushes to `tierDependentPricing[]` |
| `UPDATE_OPTION_GROUP_TIER_PRICING` | `{ optionGroupId, tierId, setupCost?, recurringPricing[]? }` | Updates existing entry matched by `tierId` |
| `REMOVE_OPTION_GROUP_TIER_PRICING` | `{ optionGroupId, tierId }` | Removes entry by `tierId` from `tierDependentPricing[]` |

### Constraints

- **Backward Compatibility**: Existing OptionGroups with `standalonePricing` will need migration. First `addOptionGroupTierPricing` call on a group automatically clears standalone pricing (reducer handles this).
- **Add-on groups**: Keep existing `pricingMode` toggle (TIER_DEPENDENT/STANDALONE). When STANDALONE, add-ons use `standalonePricing`. When TIER_DEPENDENT, they use `tierDependentPricing`.
- **Performance**: No concern — tier count is small (typically 2-5), operation dispatches are local.
- **Scalability**: Per-tier pricing entries scale linearly with tier count (N groups × M tiers entries).

### Risk Assessment

- **Technical Risks**:
  - *Edit modal complexity*: Tier tabs add UI state. Mitigation: Keep tab state local, persist only on "Save Changes".
  - *Discount cascade changes*: `resolveGroupDiscount()` needs to accept tier-specific group discounts. Mitigation: Extend existing function signature.
- **Dependency Risks**:
  - `addOptionGroupTierPricing` reducer auto-clears standalone pricing — this is intentional but irreversible per group. No rollback mechanism needed (operator can re-add pricing).
- **Migration Risk**:
  - Existing groups with standalone pricing will show $0 per tier until operator fills in per-tier prices. The "Edit Group" modal should detect this and offer to migrate standalone price as a starting point.

## Acceptance Criteria

### Functional Acceptance

- [ ] Regular (non-addon, non-setup) service groups show tier tab bar in edit modal
- [ ] Each non-custom tier tab has a recurring price input with billing cycle discount fields
- [ ] Custom tier tabs show "Price negotiated per customer" with no price input
- [ ] Saving dispatches `addOptionGroupTierPricing` or `updateOptionGroupTierPricing` per tier
- [ ] New tiers show $0 + amber warning badge for groups without pricing
- [ ] Per-tier budget indicator: SUM(group prices for tier X) vs tier X price
- [ ] Over-budget warning when group sum exceeds tier price (per tier)
- [ ] Matrix SUBTOTAL shows per-tier calculated sum vs tier price
- [ ] CALCULATED mode tier price = SUM(group prices for THAT tier)
- [ ] Discount cascade: group-tier discount → tier-level discount → none
- [ ] Add-on groups retain existing TIER_DEPENDENT/STANDALONE toggle (no change)
- [ ] Setup groups have no recurring pricing (no change)

### Quality Standards

- [ ] Code Quality: `npm run tsc` passes with 0 new errors
- [ ] Lint: `npm run lint:fix` passes with 0 new errors
- [ ] Test Coverage: Existing tier-management and option-group-management tests pass
- [ ] No regressions in Matrix, TierDefinition, or ServiceCatalog rendering

### User Acceptance

- [ ] Operator can set different monthly prices per tier for the same service group
- [ ] Budget indicators accurately reflect per-tier totals
- [ ] Edit modal tier tabs are navigable and intuitive
- [ ] Custom tiers handled gracefully (no confusing empty inputs)

## Execution Phases

### Phase 1: Utility & Pricing Logic Updates
**Goal**: Update pricing calculation utilities to support per-tier pricing from `tierDependentPricing`

- [ ] Update `calculateTierRecurringPrice()` in `pricing-utils.ts` to accept a `tierId` parameter and read from `OptionGroup.tierDependentPricing` instead of `standalonePricing`
- [ ] Update `resolveGroupDiscount()` to accept group-tier-specific discounts in the cascade
- [ ] Add helper: `getGroupPriceForTier(group: OptionGroup, tierId: string, billingCycle: BillingCycle)` that returns the price from `tierDependentPricing` for a specific tier
- **Deliverables**: Updated `pricing-utils.ts` with per-tier calculation functions

### Phase 2: ServiceCatalog Edit Modal — Tier Tabs
**Goal**: Replace single price input with tier tab bar and per-tier pricing

- [ ] Add tier tab bar component in the edit modal (above the recurring price section)
- [ ] Each tab shows: tier name, recurring price input, setup cost input, billing cycle discounts
- [ ] Custom tier tabs: show "Price negotiated per customer" note, no inputs
- [ ] Empty tier state: show $0 with "Set price for this tier" prompt
- [ ] Update "Save Changes" handler to dispatch `addOptionGroupTierPricing` / `updateOptionGroupTierPricing` per modified tier (instead of `setOptionGroupStandalonePricing`)
- [ ] Import `addOptionGroupTierPricing`, `updateOptionGroupTierPricing` from gen/creators
- [ ] Migration UX: If group has `standalonePricing` but no `tierDependentPricing`, pre-fill all tier tabs with the standalone price as starting point
- **Deliverables**: Updated `ServiceCatalog.tsx` with tier tab UI

### Phase 3: Budget Indicators & Matrix Updates
**Goal**: Replace standalone-based budget checks with per-tier checks

- [ ] Update ServiceCatalog budget indicator to compute per-tier: SUM(group `tierDependentPricing` for tier X) vs tier X price
- [ ] Update `TheMatrix.tsx` `getTierPriceForCycle()` to use `tierDependentPricing` for calculating group sums per tier
- [ ] Update Matrix SUBTOTAL row to show per-tier sum vs tier price
- [ ] Update `TierDefinition.tsx` CALCULATED mode to use per-tier sum
- [ ] Update `BudgetIndicator` to work with per-tier data
- [ ] Update `OverBudgetDialog` to reference the specific tier that exceeded
- **Deliverables**: Per-tier budget awareness across all pricing surfaces

### Phase 4: Verification & Polish
**Goal**: Ensure quality and no regressions

- [ ] Run `npm run tsc` — 0 new TypeScript errors
- [ ] Run `npm run lint:fix` — 0 new lint errors
- [ ] Run existing tests — all pass
- [ ] Manual testing: create 3 tiers, add groups, set per-tier prices, verify Matrix, verify budget indicators
- [ ] Verify add-on groups still work with TIER_DEPENDENT/STANDALONE toggle
- [ ] Verify custom pricing tiers show correctly in edit modal tabs
- **Deliverables**: Clean build, passing tests, verified UX

---

**Document Version**: 1.0
**Created**: 2026-02-16
**Clarification Rounds**: 3
**Quality Score**: 93/100
