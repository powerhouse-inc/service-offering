# Discount Cascade Logic - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: When service groups have mixed billing cycles (triggering "Custom" billing mode in the matrix), the discount applied to each service group's pricing is ambiguous. The current implementation only checks the service group's own `billingCycleDiscounts` array, ignoring the tier-level discount as a fallback. This means service groups without explicitly defined discounts show no savings even when the tier has a global discount configured for that billing cycle.
- **Target Users**: Service operators configuring offerings via the Service Offering editor, and subscribers viewing the pricing matrix on Achra.
- **Value Proposition**: Predictable, transparent discount logic that respects both operator intent (global tier discounts) and per-group overrides, reducing configuration burden while maintaining flexibility.

### Feature Overview
- **Core Feature**: Discount cascade resolution that checks SG-level discounts first, then falls back to tier-level discounts.
- **Feature Boundaries**:
  - IN SCOPE: Discount resolution for regular service groups, add-on groups, tier headers, and grand total display.
  - OUT OF SCOPE: Changes to the discount data model itself, new discount types, subscription instance logic.
- **User Scenarios**:
  1. Operator defines Annual 10% discount at tier level. All service groups show "SAVE 10%" when Annual is selected, without needing per-group discount configuration.
  2. Operator overrides one service group's billing cycle to Quarterly (triggering Custom mode). The other service groups remain on the global cycle and still show the tier's discount.
  3. Operator defines a service group-specific Annual discount of 15%. Even though the tier has 10% Annual, this group shows "SAVE 15%" because SG-level takes priority.

### Detailed Requirements

#### Discount Resolution Algorithm

```
resolveDiscount(serviceGroup, effectiveCycle, tier):
  1. sgDiscount = serviceGroup.billingCycleDiscounts.find(d => d.billingCycle === effectiveCycle)
  2. IF sgDiscount exists AND sgDiscount.discountRule.discountValue > 0:
       RETURN sgDiscount.discountRule
  3. tierDiscount = tier.billingCycleDiscounts.find(d => d.billingCycle === effectiveCycle)
  4. IF tierDiscount exists AND tierDiscount.discountRule.discountValue > 0:
       RETURN tierDiscount.discountRule
  5. RETURN null  (no discount)
```

Where `effectiveCycle` is:
- For add-on groups: `addonActiveCycle || activeBillingCycle`
- For regular groups: `groupActiveCycle || activeBillingCycle`
- For tier headers: `activeBillingCycle` (unchanged, tier header always uses its own discounts)

#### Priority Rules (confirmed by stakeholder)

| Scenario | Discount Source |
|----------|----------------|
| SG has discount for cycle | SG discount (always wins) |
| SG has no discount, tier has discount for cycle | Tier discount (cascade) |
| Neither SG nor tier has discount for cycle | No discount |
| Custom mode, non-overridden SG, no SG discount | Tier discount cascades |
| Custom mode, overridden SG, no SG discount | Tier discount for the SG's selected cycle cascades |

#### Grand Total Display

The grand total section at the bottom of the matrix should show itemized per-group lines:
- Each service group's contribution as a separate line
- Each line shows the group name, the effective amount after discount, billing cycle, and discount badge if applicable
- The final total sums all lines

#### Edge Cases
- **Tier has FLAT_AMOUNT discount**: The same flat amount is subtracted from the SG's cycle total. If the flat amount exceeds the SG's total, clamp to $0.
- **SG discount is 0**: Treated as "no SG discount" - falls through to tier discount.
- **MONTHLY cycle**: No discount typically applies (monthly is the base). If a discount IS defined for monthly, it still applies through the same cascade.
- **ONE_TIME billing**: Discount cascade applies the same way.
- **No tiers exist**: No tier discount to cascade; only SG discounts apply.
- **isCustomPricing tier**: Skip discount display for that tier column entirely (unchanged from current behavior).

## Design Decisions

### Technical Approach
- **Architecture**: Extract a shared `resolveGroupDiscount(group, effectiveCycle, tier)` utility function in `pricing-utils.ts`. Use it in `ServiceGroupSection` for the group header pricing bar and in the grand total section.
- **Key Components**:
  - `pricing-utils.ts` - New `resolveGroupDiscount()` function
  - `TheMatrix.tsx` - `ServiceGroupSection` updated to accept selectedTier and use cascade logic
  - `TheMatrix.tsx` - Grand total section updated to show itemized per-group breakdown
- **No schema changes required**: The existing `tier.billingCycleDiscounts` and `group.billingCycleDiscounts` fields are sufficient.

### Constraints
- **Pure display logic**: All changes are in the editor/presentation layer. No reducer or document model changes.
- **Performance**: The cascade lookup is O(1) per group per cycle (small arrays). No concern.
- **Backward compatibility**: Existing offerings with no SG-level discounts will now inherit tier discounts where previously they showed none. This is the desired behavior.

## Acceptance Criteria

### Functional Acceptance
- [ ] Service group with no SG discount shows tier discount badge when tier has one for the effective cycle
- [ ] Service group with its own SG discount shows the SG discount (not the tier discount)
- [ ] In custom billing mode, non-overridden groups still show the global tier discount
- [ ] In custom billing mode, overridden groups cascade to the tier discount for their selected cycle if no SG discount
- [ ] Grand total section shows itemized per-group discount lines
- [ ] Tier header discount display is unchanged (always uses tier.billingCycleDiscounts)
- [ ] Add-on groups use the same cascade logic with their independent billing cycles

### Quality Standards
- [ ] `npm run tsc` passes with no new errors
- [ ] `npm run lint:fix` passes with no new errors
- [ ] Visual verification in Vetra: create tier with Annual 10% discount, verify regular SG shows "SAVE 10%" without needing SG-specific discount

## Execution Phases

### Phase 1: Utility Function
- [ ] Add `resolveGroupDiscount(group, effectiveCycle, tier)` to `pricing-utils.ts`
- [ ] Returns `{ discountRule, source: 'group' | 'tier' | null }` for transparency
- **Deliverables**: Shared discount resolution function

### Phase 2: ServiceGroupSection Update
- [ ] Pass `selectedTier` (or `tiers[selectedTierIdx]`) to `ServiceGroupSection`
- [ ] Replace inline `group.billingCycleDiscounts` lookup with `resolveGroupDiscount()`
- [ ] Display discount badge with source indicator (optional: subtle "tier discount" vs "group discount" visual hint)
- **Deliverables**: Service group headers show cascaded discounts

### Phase 3: Grand Total Itemization
- [ ] Update grand total section to show per-group lines with individual discounts
- [ ] Each line: group name, effective price, cycle, discount badge
- [ ] Final sum row
- **Deliverables**: Itemized grand total with per-group discount visibility

### Phase 4: Verification
- [ ] Run `npm run tsc` and `npm run lint:fix`
- [ ] Manual testing in Vetra with various discount configurations
- **Deliverables**: Clean build, verified behavior

---

**Document Version**: 1.0
**Created**: 2026-02-16
**Clarification Rounds**: 1
**Quality Score**: 91/100
