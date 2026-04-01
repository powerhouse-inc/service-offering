# Acra Catalog Enhancements — Requirements v1

**Date:** 2026-04-01
**Status:** Draft
**Stakeholders:** Acra frontend team, Service Offering operators
**Models affected:** ResourceTemplate, ServiceOffering

---

## Problem Statement

The Acra product catalog needs sorting control, richer product metadata (subtitles), tier reordering for display, and the ability to exclude specific tiers from one-time setup fee information. These are four discrete changes spanning two document models.

---

## Change 1: Weight field on ResourceTemplate

**What:** A numeric weight property for controlling product sort order in the Acra catalog.

**Why:** Products on Acra need deterministic ordering beyond alphabetical or creation-time. Operators must control which products appear first.

### Functional Requirements

- FR-1.1: ResourceTemplate must support a `weight` field — an integer that determines sort position.
- FR-1.2: Lower weight = higher priority (appears first). Convention: 0 is highest priority.
- FR-1.3: Weight is optional. Templates without a weight sort after those with one.
- FR-1.4: An operation must exist to set/update the weight value.
- FR-1.5: The resource-template-editor must expose the weight field for editing.

### Data Requirements

- A single optional integer field on the ResourceTemplate state.
- No relationships to other entities.

### Acceptance Criteria

- [ ] ResourceTemplate state includes the weight field
- [ ] An operation exists to set the weight
- [ ] resource-template-editor allows editing the weight
- [ ] Two templates with different weights sort correctly (lower weight first)

---

## Change 2: Subtitle/Tagline on ResourceTemplate

**What:** A short text property for displaying a subtitle or tagline in the Acra product overview.

**Why:** Product cards on Acra need a secondary descriptor beyond the title — a tagline like "Enterprise-grade infrastructure" or "For teams of 5-50".

### Functional Requirements

- FR-2.1: ResourceTemplate must support a `subtitle` field — a short string for tagline display.
- FR-2.2: Subtitle is optional. Null/empty means no subtitle displayed.
- FR-2.3: The existing `UPDATE_TEMPLATE_INFO` operation should accept subtitle as an optional field (consistent with how title, summary, description are updated together).
- FR-2.4: The resource-template-editor must expose the subtitle field, positioned between title and summary.

### Data Requirements

- A single optional String field on the ResourceTemplate state.
- No validation rules beyond standard string limits.

### Acceptance Criteria

- [ ] ResourceTemplate state includes the subtitle field
- [ ] UPDATE_TEMPLATE_INFO operation accepts and persists subtitle
- [ ] resource-template-editor shows the subtitle field
- [ ] Subtitle displays correctly when set and gracefully absent when null

---

## Change 3: Exclude tier from setup fee (ServiceOffering)

**What:** A boolean flag on ServiceSubscriptionTier to mark tiers that should be excluded from one-time setup fee display/calculation.

**Why:** The "essential tier" (tier zero / cheapest tier) should not show setup fee information on Acra. Operators need to control this per-tier rather than relying on tier position or naming conventions.

### Functional Requirements

- FR-3.1: ServiceSubscriptionTier must support an `excludeFromSetupFee` boolean field.
- FR-3.2: Default is `false` (all tiers include setup fee info by default).
- FR-3.3: The existing `ADD_TIER` operation should accept `excludeFromSetupFee` as an optional input (defaults false).
- FR-3.4: The existing `UPDATE_TIER` operation should accept `excludeFromSetupFee` as an optional input.
- FR-3.5: The service-offering-editor tier definition UI must expose a toggle/checkbox for this flag.
- FR-3.6: Acra-facing consumers of this data use the flag to conditionally hide setup fee info.

### Data Requirements

- A single Boolean field on the ServiceSubscriptionTier type within ServiceOffering state.
- No cross-model propagation needed — this is display metadata, not billing logic.

### Acceptance Criteria

- [ ] ServiceSubscriptionTier type includes `excludeFromSetupFee` boolean
- [ ] ADD_TIER and UPDATE_TIER operations accept the field
- [ ] service-offering-editor exposes the toggle in tier definition
- [ ] A tier with `excludeFromSetupFee: true` is distinguishable in the document state

---

## Change 4: Reorder tiers (ServiceOffering)

**What:** A new operation to reorder the tiers array in ServiceOffering, with editor UI for moving tiers left/right.

**Why:** Tier display order on Acra matters (e.g., Essential | Pro | Enterprise). Currently the only way to reorder is to delete and re-add tiers, which loses all service level bindings and usage limits.

### Functional Requirements

- FR-4.1: A new `REORDER_TIERS` operation must accept an ordered array of tier IDs and rewrite the tiers array in that order.
- FR-4.2: All tier IDs in the input must match existing tiers. Missing or extra IDs are an error.
- FR-4.3: The operation must preserve all tier data (service levels, usage limits, billing cycle discounts) — only position changes.
- FR-4.4: The service-offering-editor must provide move left/move right controls on each tier.
- FR-4.5: The operation follows the same pattern as existing `REORDER_CONTENT_SECTIONS` on ResourceTemplate (accepts `tierIds: [OID!]!` and `lastModified: DateTime!`).
- FR-4.6: This is purely a ServiceOffering operation — no propagation to SubscriptionInstance.

### Data Requirements

- No new state fields — the existing `tiers` array order becomes the canonical display order.
- New operation input: ordered list of tier OIDs + lastModified timestamp.

### Error Scenarios

- Input contains a tier ID not present in current state → error
- Input is missing a tier ID that exists in current state → error
- Empty input when tiers exist → error

### Acceptance Criteria

- [ ] REORDER_TIERS operation exists on ServiceOffering
- [ ] Operation reorders tiers array to match input order
- [ ] Operation rejects mismatched tier ID lists
- [ ] service-offering-editor shows move left/right arrows on tiers
- [ ] Moving a tier preserves all its nested data (service levels, usage limits, discounts)

---

## Integration Touchpoints

| Model | Changes | Editor |
|-------|---------|--------|
| ResourceTemplate | Add `weight`, add `subtitle` to state; update `UPDATE_TEMPLATE_INFO` input; add `SET_WEIGHT` operation | resource-template-editor |
| ServiceOffering | Add `excludeFromSetupFee` to ServiceSubscriptionTier; update `ADD_TIER`/`UPDATE_TIER` inputs; add `REORDER_TIERS` operation | service-offering-editor |

No subgraph changes required. No SubscriptionInstance changes required.

---

## Constraints & Risks

- **Low risk:** All four changes are additive — no existing fields removed, no breaking schema changes.
- **Ordering:** Changes 1-2 (ResourceTemplate) are independent from changes 3-4 (ServiceOffering) and can be implemented in parallel.
- **Editor coupling:** Tier reorder UI touches `TierDefinition.tsx` and possibly `TheMatrix.tsx` — Architect should review component structure.

---

## Handoff Notes for Architect

- **Weight:** Decide whether to add a dedicated `SET_WEIGHT` operation or extend `UPDATE_TEMPLATE_INFO`. The analyst recommends a separate operation since weight is a catalog concern, not template info.
- **Subtitle:** Recommend extending `UPDATE_TEMPLATE_INFO` input since subtitle is metadata alongside title/summary/description.
- **excludeFromSetupFee:** Straightforward boolean addition to the tier type and existing tier operations.
- **REORDER_TIERS:** Follow the `REORDER_CONTENT_SECTIONS` / `REORDER_FAQS` pattern already established on ResourceTemplate. Define appropriate error types for ID mismatch.
- **MCP parity:** All schema changes must be applied both to local `schema.graphql` files AND to the Vetra drive document models via MCP `addActions`.
