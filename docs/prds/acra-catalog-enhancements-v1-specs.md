# Acra Catalog Enhancements — Architecture Spec v1

**Date:** 2026-04-01
**Status:** Draft
**Requirements:** [acra-catalog-enhancements-v1-requirements.md](acra-catalog-enhancements-v1-requirements.md)
**Models affected:** ResourceTemplate, ServiceOffering

---

## Summary

Four additive schema changes across two document models to support Acra product catalog sorting, richer metadata, tier setup-fee exclusion, and tier reordering. No breaking changes, no subgraph impact, no cross-model propagation.

---

## Model 1: ResourceTemplate

### Schema Changes

```graphql
# ADD to ResourceTemplateState (after `contentSections` field)
type ResourceTemplateState {
    # ... existing fields unchanged ...
    weight: Int
    subtitle: String
}
```

**Design decisions:**
- `weight: Int` — optional integer. `null` means "unweighted, sort last." Lower = higher priority. Consistent with common sorting patterns (CSS z-index, display order).
- `subtitle: String` — optional string. Used as a tagline/secondary descriptor on Acra product cards. Placed alongside title/summary as product metadata.

### Operation Changes

#### New Operation: `SET_WEIGHT`

| Field | Value |
|-------|-------|
| **Operation** | `SET_WEIGHT` |
| **Module** | `template-management` (existing) |
| **Scope** | `global` |
| **Rationale** | Separate from `UPDATE_TEMPLATE_INFO` because weight is a catalog/sorting concern, not product information. Keeps the info operation focused on human-readable metadata. |

```graphql
input SetWeightInput {
    weight: Int
    lastModified: DateTime!
}
```

**Reducer logic:**
- Set `state.weight` to `action.input.weight` (accepts `null` to clear weight)
- Set `state.lastModified` to `action.input.lastModified`

**Errors:** None — any integer (including negative) and null are valid.

#### Modified Operation: `UPDATE_TEMPLATE_INFO`

Add `subtitle` to the existing input:

```graphql
input UpdateTemplateInfoInput {
    title: String
    summary: String
    description: String
    thumbnailUrl: URL
    infoLink: URL
    subtitle: String          # NEW — optional tagline
    lastModified: DateTime!
}
```

**Reducer change:** Add to existing reducer:
```
if (action.input.subtitle !== undefined) {
    state.subtitle = action.input.subtitle || null;
}
```

**Errors:** No new errors.

### Editor Impact: `resource-template-editor`

| Component | Change |
|-----------|--------|
| `TemplateInfo.tsx` | Add `subtitle` input field between title and summary. Add `weight` input field (numeric) in a "Catalog Settings" section or alongside status. |
| `editor.tsx` | No changes needed — TemplateInfo already receives document + dispatch. |

**New creator import needed:** `setWeight` from `gen/creators.js` (auto-generated after schema update).

---

## Model 2: ServiceOffering

### Schema Changes

```graphql
# MODIFY ServiceSubscriptionTier — add one field
type ServiceSubscriptionTier {
    id: OID!
    name: String!
    description: String
    isCustomPricing: Boolean!
    pricingMode: TierPricingMode
    pricing: ServicePricing!
    defaultBillingCycle: BillingCycle
    mostPopular: Boolean!
    billingCycleDiscounts: [BillingCycleDiscount!]!
    serviceLevels: [ServiceLevelBinding!]!
    usageLimits: [ServiceUsageLimit!]!
    excludeFromSetupFee: Boolean!    # NEW — default false
}
```

**Design decision:** `Boolean!` with default `false`, not `Boolean` (optional). This is a display flag that must always resolve — nullability adds no value and forces null-checks in consumers.

### Operation Changes

#### Modified Operation: `ADD_TIER`

Add `excludeFromSetupFee` to the existing input:

```graphql
input AddTierInput {
    id: OID!
    name: String!
    description: String
    amount: Amount_Money
    currency: Currency!
    isCustomPricing: Boolean
    excludeFromSetupFee: Boolean     # NEW — optional, defaults false in reducer
    lastModified: DateTime!
}
```

**Reducer change:** Add to existing reducer's tier push:
```
excludeFromSetupFee: action.input.excludeFromSetupFee || false,
```

#### Modified Operation: `UPDATE_TIER`

Add `excludeFromSetupFee` to the existing input:

```graphql
input UpdateTierInput {
    id: OID!
    name: String
    description: String
    isCustomPricing: Boolean
    lastModified: DateTime!
    mostPopular: Boolean
    excludeFromSetupFee: Boolean     # NEW — optional
}
```

**Reducer change:** Add to existing reducer after other field checks:
```
if (action.input.excludeFromSetupFee !== undefined && action.input.excludeFromSetupFee !== null) {
    tier.excludeFromSetupFee = action.input.excludeFromSetupFee;
}
```

#### New Operation: `REORDER_TIERS`

| Field | Value |
|-------|-------|
| **Operation** | `REORDER_TIERS` |
| **Module** | `tiers` (existing) |
| **Scope** | `global` |
| **Pattern** | Follows `REORDER_CONTENT_SECTIONS` and `REORDER_FAQS` on ResourceTemplate |

```graphql
input ReorderTiersInput {
    tierIds: [OID!]!
    lastModified: DateTime!
}
```

**Reducer logic:**
```javascript
const currentIds = state.tiers.map(t => t.id);
const inputIds = action.input.tierIds;

// Validate: same set of IDs
if (inputIds.length !== currentIds.length) {
    throw new TierIdsMismatchError("Input tier IDs count does not match existing tiers count");
}
const inputSet = new Set(inputIds);
if (inputSet.size !== inputIds.length) {
    throw new DuplicateTierIdError("Input contains duplicate tier IDs");
}
for (const id of currentIds) {
    if (!inputSet.has(id)) {
        throw new TierIdsMismatchError(`Tier ID ${id} exists but was not included in reorder input`);
    }
}

// Reorder: build new array in input order
const tierMap = new Map(state.tiers.map(t => [t.id, t]));
state.tiers = inputIds.map(id => tierMap.get(id)!);
state.lastModified = action.input.lastModified;
```

**Error definitions:**

| Error Name | Code | Description |
|------------|------|-------------|
| `TierIdsMismatchError` | `TIER_IDS_MISMATCH` | Input tier IDs don't match the current set of tier IDs |
| `DuplicateTierIdError` | `DUPLICATE_TIER_ID` | Input contains duplicate tier IDs |

### Editor Impact: `service-offering-editor`

| Component | Change |
|-----------|--------|
| `TierDefinition.tsx` | (1) Add move-left / move-right arrow buttons to each `TierCard`. Disable left arrow on first tier, right arrow on last. (2) Add `excludeFromSetupFee` checkbox/toggle to each `TierCard`, below the "Custom Pricing" checkbox area. |
| `TierCard` (inner component) | Accept new props for `onMoveLeft`, `onMoveRight`, `isFirst`, `isLast`. Dispatch `reorderTiers` with swapped IDs. Display `excludeFromSetupFee` toggle. |

**New creator import needed:** `reorderTiers` from `gen/creators.js` (auto-generated after schema update).

---

## Operation Summary Table

| Operation | Model | Module | Action | Type |
|-----------|-------|--------|--------|------|
| `SET_WEIGHT` | ResourceTemplate | template-management | New | Create |
| `UPDATE_TEMPLATE_INFO` | ResourceTemplate | template-management | Modified (add `subtitle`) | Modify |
| `ADD_TIER` | ServiceOffering | tiers | Modified (add `excludeFromSetupFee`) | Modify |
| `UPDATE_TIER` | ServiceOffering | tiers | Modified (add `excludeFromSetupFee`) | Modify |
| `REORDER_TIERS` | ServiceOffering | tiers | New | Create |

---

## MCP Parity Checklist

All changes must be applied in **both** places:

### ResourceTemplate (Vetra doc ID: `5584b085-d2ab-41ee-aa59-a57791ef45ba`)

1. `SET_STATE_SCHEMA` — add `weight: Int` and `subtitle: String` to `ResourceTemplateState`
2. `ADD_OPERATION` — add `SET_WEIGHT` to `template-management` module
3. `SET_OPERATION_SCHEMA` — set `SetWeightInput` schema for `SET_WEIGHT`
4. `SET_OPERATION_REDUCER` — set reducer code for `SET_WEIGHT`
5. `SET_OPERATION_SCHEMA` — update `UpdateTemplateInfoInput` to include `subtitle`
6. `SET_OPERATION_REDUCER` — update `UPDATE_TEMPLATE_INFO` reducer to handle `subtitle`

### ServiceOffering (Vetra doc ID: `a57c85e4-a620-4a64-99db-c8e01eafd61b`)

1. `SET_STATE_SCHEMA` — add `excludeFromSetupFee: Boolean!` to `ServiceSubscriptionTier`
2. `SET_OPERATION_SCHEMA` — update `AddTierInput` to include `excludeFromSetupFee`
3. `SET_OPERATION_REDUCER` — update `ADD_TIER` reducer
4. `SET_OPERATION_SCHEMA` — update `UpdateTierInput` to include `excludeFromSetupFee`
5. `SET_OPERATION_REDUCER` — update `UPDATE_TIER` reducer
6. `ADD_OPERATION` — add `REORDER_TIERS` to `tiers` module
7. `SET_OPERATION_SCHEMA` — set `ReorderTiersInput` schema
8. `SET_OPERATION_REDUCER` — set reducer code for `REORDER_TIERS`
9. `ADD_OPERATION_ERROR` (x2) — add `TierIdsMismatchError` and `DuplicateTierIdError`

### Local file updates

1. `document-models/resource-template/v1/schema.graphql` — add fields and input
2. `document-models/service-offering/v1/schema.graphql` — add field, inputs, and input type
3. `document-models/resource-template/src/reducers/template-management.ts` — update reducers
4. `document-models/service-offering/src/reducers/tiers.ts` — update reducers + add REORDER_TIERS

---

## Subgraph Impact

None. These changes are internal to the document models and consumed by editors only. No subgraph query fields need updating.

---

## Implementation Order

**Phase A (ResourceTemplate)** — independent, can start immediately:
1. Update state schema (MCP + local) — add `weight`, `subtitle`
2. Add `SET_WEIGHT` operation (MCP + local)
3. Modify `UPDATE_TEMPLATE_INFO` operation (MCP + local)
4. Update `TemplateInfo.tsx` editor component

**Phase B (ServiceOffering)** — independent, can run in parallel with Phase A:
1. Update state schema (MCP + local) — add `excludeFromSetupFee`
2. Modify `ADD_TIER` and `UPDATE_TIER` operations (MCP + local)
3. Add `REORDER_TIERS` operation (MCP + local)
4. Update `TierDefinition.tsx` editor component

**Phase C (Validation):**
1. Run `bun run tsc` — verify type safety
2. Run `bun run lint:fix` — verify lint compliance
3. Manual QA in editors

---

## Handoff Notes for Developer

- **SET_WEIGHT reducer** is trivial — direct assignment with null support. No validation needed.
- **UPDATE_TEMPLATE_INFO subtitle** follows the exact same pattern as `description` in the existing reducer.
- **excludeFromSetupFee** defaults to `false` in ADD_TIER, uses boolean null-guard in UPDATE_TIER — follow the `isCustomPricing` pattern exactly.
- **REORDER_TIERS** is the most complex change. Use a `Map` for O(1) lookups during reorder. The error validation must happen *before* mutation (throw before any state changes).
- **Editor reorder UX**: Simplest approach is to swap adjacent IDs and dispatch `reorderTiers` with the full new order. Don't implement drag-and-drop — move-left/move-right arrows are sufficient per requirements.
- **MCP parity is mandatory** — every schema and reducer change must be applied via MCP `addActions` AND to local files. The parity check we just ran should still pass after implementation.
