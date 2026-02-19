# Flat Discount Inheritance Fix - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: When a tier defines a FLAT_AMOUNT billing cycle discount (e.g., $77 off annual), service groups that inherit this discount apply the full flat amount to each group individually, causing double/triple counting. For 2 groups, a $77 discount becomes $154 total — group prices no longer sum to the tier's discounted price.
- **Target Users**: Service offering operators configuring tier-level flat discounts
- **Value Proposition**: Ensures mathematical integrity — group discounted prices always sum to the tier's discounted price, regardless of discount type (percentage or flat)

### Feature Overview
- **Core Fix**: Convert inherited FLAT_AMOUNT discounts to equivalent PERCENTAGE inside `resolveGroupDiscountForTier()` before returning to callers
- **Display Change**: Show proportional flat share in UI — "$41.46 off (from $77 tier discount)"
- **Feature Boundaries**: Only affects inherited tier discounts. INDEPENDENT group discounts and PERCENTAGE tier discounts are unaffected.
- **Out of Scope**: No schema changes. No document model changes. Pure editor/utility fix.

### Detailed Requirements

#### Mathematical Rule
```
tierCycleBase = tierMonthlyBase × cycleMonths
equivalentPercentage = (flatAmount / tierCycleBase) × 100
```

Where `tierMonthlyBase` = sum of all regular group monthly prices for this tier (using `calculateTierRecurringPrice()`).

#### Example
- Group A: $60/mo, Group B: $70/mo → tierMonthlyBase = $130
- Tier annual flat discount: $77
- tierCycleBase = $130 × 12 = $1,560
- equivalentPercentage = $77 / $1,560 × 100 = 4.936%
- Group A annual: $720 × (1 - 0.04936) = $684.46
- Group B annual: $840 × (1 - 0.04936) = $798.54
- Sum: $684.46 + $798.54 = $1,483.00 = $1,560 - $77 ✓

#### MANUAL_OVERRIDE Tiers
Use group sum as base (not the manual tier price). This ensures group discounts always sum to exactly the tier's flat discount amount.

#### Display Format (Option C)
```
Annual    $840
→ $798.54    $41.46 off (from $77 tier discount)
```

## Design Decisions

### Technical Approach
- **Architecture**: Conversion inside `resolveGroupDiscountForTier()` (single source of truth)
- **New parameter**: `tierMonthlyBase?: number` — sum of regular group monthly prices
- **Return type extension**: Add `originalTierFlat?: number` field to return object for display
- **Fallback**: If `tierMonthlyBase` is 0 or undefined, return null (no discount can be computed)

### Key Components
1. `pricing-utils.ts` — `resolveGroupDiscountForTier()` modification
2. All callers — pass `tierMonthlyBase` computed from `calculateTierRecurringPrice()`
3. UI components — use `originalTierFlat` for display formatting

## Acceptance Criteria

### Functional Acceptance
- [ ] Group discounted prices sum to tier discounted price for FLAT_AMOUNT discounts
- [ ] PERCENTAGE discounts behave exactly as before (no regression)
- [ ] INDEPENDENT group discounts behave exactly as before
- [ ] Edit Group dialog shows "$X off (from $Y tier discount)" format
- [ ] Matrix group rows show correct proportional discounts
- [ ] Works for all 4 billing cycles (Monthly, Quarterly, Semi-Annual, Annual)
- [ ] MANUAL_OVERRIDE tiers use group sum as base

### Quality Standards
- [ ] `npm run tsc` — no new errors
- [ ] `npm run lint:fix` — no new errors
- [ ] Existing tests still pass

## Execution Phases

### Phase 1: Utility Function
- [ ] Modify `resolveGroupDiscountForTier()` signature and logic
- [ ] Add `originalTierFlat` to return type

### Phase 2: Call Site Updates
- [ ] Find all callers of `resolveGroupDiscountForTier()`
- [ ] Pass `tierMonthlyBase` at each call site

### Phase 3: Display Updates
- [ ] Update Edit Group dialog discount display
- [ ] Update Matrix group-level discount display

### Phase 4: Verification
- [ ] Run tsc + lint
- [ ] Manual verification with flat and percentage discounts

---

**Document Version**: 1.0
**Created**: 2026-02-16
**Clarification Rounds**: 2
**Quality Score**: 94/100
