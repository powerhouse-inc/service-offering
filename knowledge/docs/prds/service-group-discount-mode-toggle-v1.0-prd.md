# Service Group Discount Mode Toggle - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: Recurring service groups currently inherit billing cycle discounts from tier-level definitions. When a group's billing cycle is overridden in the matrix (custom billing mode), the tier discount applies uniformly. Operators need the ability to define group-specific discounts per tier that differ from the tier-level defaults — e.g., "Operational" on the Professional tier gets a $20 flat discount on annual billing, while the tier-level annual discount is 17%.
- **Target Users**: Service offering operators managing complex pricing structures where individual service groups need differentiated discount terms per tier.
- **Value Proposition**: Enables granular pricing control where each service group can either inherit the tier's standard discount schedule or define its own per-tier flat discounts. This is essential for custom billing modes where groups have independent billing cycles.

### Feature Overview
- **Core Features**:
  1. Group-level `discountMode` toggle: `INHERIT_TIER` (default) or `INDEPENDENT`
  2. Per-tier tab toggle in the edit modal switching between read-only inherited discounts and editable discount inputs
  3. Independent flat-amount discounts stored per tier per billing cycle in `tierDependentPricing[].recurringPricing[].discount`
  4. Matrix integration: group-level discounts applied only in custom billing mode (when group overrides cycle)
  5. In global billing mode, tier-level discounts apply at the tier level (no change to current behavior)

- **Feature Boundaries**:
  - **In scope**: Discount mode toggle for regular (non-addon, non-setup) groups, per-tier discount inputs in edit modal, matrix custom billing mode integration
  - **Out of scope**: Percentage discounts (FLAT_AMOUNT only for now), add-on group discount changes (keep existing behavior), global billing mode discount changes
  - **Replaces**: Nothing — this is additive. INHERIT_TIER mode preserves current behavior exactly.

- **User Scenarios**:
  1. Operator opens edit modal for "Operational" group → sees tier tabs → on Professional tab, toggles discount mode from "Inherit from tier" to "Independent" → enters $20 flat discount on Annual → saves
  2. In the matrix, operator overrides "Operational" to Annual billing → sees the $20 discount applied (instead of tier's standard annual discount)
  3. Operator switches "Operational" back to "Inherit from tier" → Annual discount reverts to tier-level schedule → group's custom discounts are preserved but ignored

### Detailed Requirements

- **Input/Output**:
  - Input: `discountMode` toggle (INHERIT_TIER / INDEPENDENT) at the group level
  - Input: Per-tier flat-amount discounts via `RecurringPriceOption.discount` (existing schema field)
  - Output: In custom billing mode, resolved discount uses group-level discount when INDEPENDENT, tier-level when INHERIT_TIER
  - Operations: New `SET_OPTION_GROUP_DISCOUNT_MODE` operation + existing `updateOptionGroupTierPricing` for discount values

- **User Interaction**:
  1. Open "Edit Group" modal for a regular service group
  2. Navigate to a non-custom tier tab (e.g., Professional)
  3. Below the recurring price input, see discount mode toggle: "Inherit tier discounts" / "Set independent discounts"
  4. When "Inherit tier discounts" selected: read-only display showing tier's billing cycle discounts
  5. When "Set independent discounts" selected: editable flat discount inputs per billing cycle
  6. Save → dispatches `SET_OPTION_GROUP_DISCOUNT_MODE` (if mode changed) + `updateOptionGroupTierPricing` (if discount values changed)

- **Data Requirements**:
  - New enum: `DiscountMode` with values `INHERIT_TIER`, `INDEPENDENT`
  - New field: `OptionGroup.discountMode: DiscountMode` (nullable, defaults to `INHERIT_TIER` behavior when null)
  - Discount storage: `OptionGroupTierPricing.recurringPricing[].discount: DiscountRule` (already exists in schema)
  - `DiscountRule`: `{ discountType: FLAT_AMOUNT, discountValue: Float }` (FLAT_AMOUNT only for now)

- **Edge Cases**:
  - **Custom pricing tiers**: Tab shows "Price negotiated per customer" — no discount inputs in either mode
  - **No billing cycle override (global mode)**: Discounts not shown per group; tier-level discounts apply at the tier level
  - **Switch from INDEPENDENT to INHERIT_TIER**: Group's custom discounts are preserved in data but ignored in calculations. Switching back to INDEPENDENT restores them.
  - **New tier added**: In INDEPENDENT mode, new tier has no discounts (0). In INHERIT_TIER mode, inherits from the new tier's discount schedule.
  - **No tiers exist**: Discount toggle not shown (no tiers to reference)
  - **Existing groups (migration)**: Default to INHERIT_TIER (null = INHERIT_TIER behavior). No data migration needed.

## Design Decisions

### Stakeholder Decisions (Clarification Rounds)

| Decision | Question | Answer | Rationale |
|----------|----------|--------|-----------|
| SO-DM-1 | Discount scope per tier or flat? | **Per-tier independent** | Each tier can have different discounts. Consistent with per-tier pricing model. Uses existing `RecurringPriceOption.discount` field. |
| SO-DM-2 | Toggle location? | **Per-tier tab toggle** | Toggle on each tier tab in the edit modal. Shows either read-only inherited or editable inputs per tab. |
| SO-DM-3 | Persist mode? | **New schema field** | Add `discountMode: DiscountMode` to OptionGroup. Explicit, no ambiguity. |
| SO-DM-4 | When do discounts apply? | **Only in custom billing mode** | When a group overrides its cycle. In global mode, tier-level discounts apply at the tier level (current behavior). |
| SO-DM-5 | Discount type? | **FLAT_AMOUNT only** | Consistent with existing add-on discount UI. Percentage support can be added later. |
| SO-DM-6 | Default for existing groups? | **INHERIT_TIER** | No behavior change for existing groups. Operators opt-in to independent discounts. |
| SO-DM-7 | Mode scope? | **Group-level** | Single `discountMode` field on OptionGroup. All tiers for that group use the same mode. |
| SO-DM-8 | Global mode group discounts? | **No group discount in global mode** | Tier discounts apply at tier level. Only in custom billing mode do group-level discounts appear. |

### Technical Approach

- **Architecture**: Add new `DiscountMode` enum and `discountMode` field to `OptionGroup`. Store independent discounts in existing `RecurringPriceOption.discount` within `tierDependentPricing`. New operation `SET_OPTION_GROUP_DISCOUNT_MODE` to toggle the mode.
- **Key Components**:
  1. **schema.graphql** — New `DiscountMode` enum, new `discountMode` field on `OptionGroup`
  2. **ServiceCatalog.tsx** — Discount mode toggle per tier tab, conditional editable/read-only discount section
  3. **pricing-utils.ts** — Update `resolveGroupDiscount()` to check `discountMode` and read from `tierDependentPricing[].recurringPricing[].discount` when INDEPENDENT
  4. **TheMatrix.tsx** — In custom billing mode, use resolved group discount (INDEPENDENT or INHERIT_TIER cascade)
- **Data Storage**: `OptionGroup.discountMode` (new field) + `OptionGroupTierPricing.recurringPricing[].discount` (existing field)
- **Interface Design**: New `SET_OPTION_GROUP_DISCOUNT_MODE` operation

### Existing Schema (Already Supports Discount Storage)

```graphql
type RecurringPriceOption {
    id: OID!
    billingCycle: BillingCycle!
    amount: Amount_Money!
    currency: Currency!
    discount: DiscountRule        # ← Already exists, used for INDEPENDENT mode
}

type DiscountRule {
    discountType: DiscountType!   # FLAT_AMOUNT
    discountValue: Float!
}
```

### New Schema Additions

```graphql
enum DiscountMode {
    INHERIT_TIER
    INDEPENDENT
}

# Add to OptionGroup:
type OptionGroup {
    # ... existing fields
    discountMode: DiscountMode    # NEW — defaults to INHERIT_TIER when null
}

input SetOptionGroupDiscountModeInput {
    optionGroupId: OID!
    discountMode: DiscountMode!
    lastModified: DateTime!
}
```

### Constraints

- **Backward Compatibility**: `discountMode: null` = `INHERIT_TIER` behavior. No migration needed for existing groups.
- **Add-on groups**: Unaffected. Add-ons continue using their own discount system (group billingCycleDiscounts → tier fallback).
- **Performance**: No concern — discount resolution is O(1) lookup per group-tier-cycle combination.
- **FLAT_AMOUNT only**: UI restricts to flat discounts. Schema supports both types; percentage can be enabled later.

### Risk Assessment

- **Technical Risks**:
  - *Discount resolution complexity*: `resolveGroupDiscount()` needs to branch on `discountMode`. Mitigation: clear conditional logic, existing function already handles cascade.
  - *Edit modal state management*: Per-tier discount toggle adds local state. Mitigation: discount mode is group-level (single state), per-tier values are already managed.
- **Dependency Risks**:
  - Dependent on per-tier pricing implementation (completed). `tierDependentPricing` must be populated before independent discounts can be set.
- **Migration Risk**:
  - None — `discountMode: null` preserves current behavior exactly.

## Acceptance Criteria

### Functional Acceptance

- [ ] Regular service groups show discount mode toggle on each non-custom tier tab in edit modal
- [ ] Toggle options: "Inherit tier discounts" (default) / "Set independent discounts"
- [ ] When INHERIT_TIER: tier tab shows read-only display of tier's billing cycle discounts
- [ ] When INDEPENDENT: tier tab shows editable flat discount inputs per billing cycle
- [ ] Saving dispatches `SET_OPTION_GROUP_DISCOUNT_MODE` when mode changes
- [ ] Saving dispatches `updateOptionGroupTierPricing` with discount values when INDEPENDENT discounts are modified
- [ ] In matrix custom billing mode: group with INDEPENDENT mode shows its own discount (not tier's)
- [ ] In matrix custom billing mode: group with INHERIT_TIER mode shows tier's discount (current behavior)
- [ ] In matrix global billing mode: no per-group discounts shown (tier-level applies at tier level)
- [ ] Custom pricing tier tabs: no discount toggle or inputs (show "Price negotiated per customer")
- [ ] Switching from INDEPENDENT to INHERIT_TIER preserves discount data (ignored but not deleted)
- [ ] New groups default to INHERIT_TIER (discountMode: null)
- [ ] Add-on groups unaffected (keep existing discount system)
- [ ] Setup groups unaffected (no discounts)

### Quality Standards

- [ ] Code Quality: `npm run tsc` passes with 0 new errors
- [ ] Lint: `npm run lint:fix` passes with 0 new errors
- [ ] Test Coverage: Existing tests pass, new operation test for `SET_OPTION_GROUP_DISCOUNT_MODE`
- [ ] No regressions in Matrix, ServiceCatalog, TierDefinition rendering

### User Acceptance

- [ ] Operator can toggle between inherited and independent discounts for a recurring group
- [ ] Independent discounts correctly applied per tier in custom billing mode
- [ ] Inherited discounts match tier-level values in custom billing mode
- [ ] Toggle state persists across edit modal open/close cycles
- [ ] UI clearly communicates which discount mode is active

## Execution Phases

### Phase 1: Schema Change + Document Model Update
**Goal**: Add `DiscountMode` enum, `discountMode` field, and `SET_OPTION_GROUP_DISCOUNT_MODE` operation

- [ ] Add `DiscountMode` enum to schema (`INHERIT_TIER`, `INDEPENDENT`)
- [ ] Add `discountMode: DiscountMode` field to `OptionGroup` type
- [ ] Add `SetOptionGroupDiscountModeInput` input type
- [ ] Add `SET_OPTION_GROUP_DISCOUNT_MODE` operation to `option-group-management` module via MCP
- [ ] Add error type: `SetDiscountModeGroupNotFoundError`
- [ ] Implement reducer: find group, set `discountMode`, update `lastModified`
- [ ] Update `src/reducers/option-group-management.ts` with reducer implementation
- **Deliverables**: Updated schema, new operation, working reducer

### Phase 2: Pricing Utils Update
**Goal**: Update discount resolution to support both modes

- [ ] Update `resolveGroupDiscount()` signature to accept `discountMode` and `tierDependentPricing` for the group
- [ ] When `discountMode === "INDEPENDENT"`: read discount from `tierDependentPricing[tierId].recurringPricing[cycle].discount`
- [ ] When `discountMode` is null or `"INHERIT_TIER"`: current cascade behavior (group billingCycleDiscounts → tier billingCycleDiscounts)
- [ ] Add helper: `getGroupIndependentDiscount(group, tierId, cycle)` to extract per-tier discount
- **Deliverables**: Updated `pricing-utils.ts` with mode-aware discount resolution

### Phase 3: ServiceCatalog Edit Modal — Discount Mode Toggle
**Goal**: Add discount mode toggle and conditional discount inputs on tier tabs

- [ ] Add discount mode toggle UI below recurring price input on each tier tab
- [ ] When INHERIT_TIER: show read-only inherited tier discount info per billing cycle
- [ ] When INDEPENDENT: show editable flat discount inputs per billing cycle
- [ ] Add local state for discount mode and per-tier discount values
- [ ] Update `handleSaveGroupEdit` to dispatch `SET_OPTION_GROUP_DISCOUNT_MODE` when changed
- [ ] Update `handleSaveGroupEdit` to include `discount` field in `recurringPricing` when saving tier pricing with INDEPENDENT discounts
- [ ] Import `setOptionGroupDiscountMode` creator (will be generated)
- **Deliverables**: Updated `ServiceCatalog.tsx` with discount mode toggle

### Phase 4: Matrix Integration
**Goal**: Apply correct discounts in custom billing mode based on discount mode

- [ ] Update custom billing mode discount resolution in `TheMatrix.tsx` to check `group.discountMode`
- [ ] When INDEPENDENT: use group's per-tier discount from `tierDependentPricing`
- [ ] When INHERIT_TIER (or null): use tier's billing cycle discounts (current behavior)
- [ ] Update grand total custom billing rows to reflect mode-aware discounts
- [ ] Ensure global billing mode is unaffected (tier-level discounts apply at tier level)
- **Deliverables**: Mode-aware discount display in custom billing mode

### Phase 5: Verification & Polish
**Goal**: Ensure quality and no regressions

- [ ] Run `npm run tsc` — 0 new TypeScript errors
- [ ] Run `npm run lint:fix` — 0 new lint errors
- [ ] Run existing tests — all pass
- [ ] Add test for `SET_OPTION_GROUP_DISCOUNT_MODE` operation
- [ ] Manual testing: toggle discount mode, verify inherited vs independent in matrix
- [ ] Verify add-on groups unaffected
- [ ] Verify custom pricing tiers handled correctly
- **Deliverables**: Clean build, passing tests, verified UX

---

**Document Version**: 1.0
**Created**: 2026-02-16
**Clarification Rounds**: 3
**Quality Score**: 93/100
