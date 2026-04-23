# ServiceOffering — Feature Manifest

**Document type:** `powerhouse/service-offering`
**Schema:** [`document-models/service-offering/v1/schema.graphql`](../../document-models/service-offering/v1/schema.graphql)
**Editor:** [`editors/service-offering-editor/`](../../editors/service-offering-editor/)
**Subgraph:** [`subgraphs/resources-services/`](../../subgraphs/resources-services/)

## 1. Model overview

A ServiceOffering is an operator's published product: a set of services bundled into tiers with pricing, optional add-ons, facet-based audience targeting, and a link to a resource template. It is the template from which SubscriptionInstances are spawned. Its state describes *what's for sale*, not *who has bought it*.

## 2. State schema summary

### Top-level
- **Identity**: `id (PHID)`, `operatorId (PHID)`, `resourceTemplateId (PHID)`.
- **Presentation**: `title!`, `summary!`, `description`, `thumbnailUrl`, `infoLink`.
- **Status**: `status (ServiceStatus!)` = DRAFT | COMING_SOON | ACTIVE | DEPRECATED.
- **Modifiability**: `lastModified (DateTime)` — updated on every op.
- **Configuration**: `availableBillingCycles: [BillingCycle!]!` (MONTHLY | QUARTERLY | SEMI_ANNUAL | ANNUAL | ONE_TIME); `facetTargets: [FacetTarget!]!`.
- **Content**: `services`, `tiers`, `optionGroups`.

### Nested types
- **FacetTarget**: `id`, `categoryKey`, `categoryLabel`, `selectedOptions`.
- **Service**: `id`, `title!`, `description`, `displayOrder`, `isSetupFormation!`, `optionGroupId`.
- **ServiceSubscriptionTier**: `id`, `name!`, `description`, `isCustomPricing!`, `pricingMode (TierPricingMode)` = CALCULATED | MANUAL_OVERRIDE, `pricing: ServicePricing!`, `defaultBillingCycle`, `mostPopular!`, `billingCycleDiscounts`, `serviceLevels`, `usageLimits`, `excludeFromSetupFee!`.
- **ServiceLevelBinding**: `id`, `serviceId`, `level (ServiceLevel!)` = INCLUDED | NOT_INCLUDED | OPTIONAL | CUSTOM | VARIABLE | NOT_APPLICABLE, `customValue`, `optionGroupId`.
- **ServiceUsageLimit**: `id`, `serviceId`, `metric!`, `unitName`, `freeLimit`, `paidLimit`, **`metricType: MetricType!`**, **`accrualCycle: AccrualCycle!`**, `notes`, `unitPrice`, `unitPriceCurrency`.
- **OptionGroup**: `id`, `name!`, `description`, `isAddOn!`, `defaultSelected!`, `pricingMode (AddOnPricingMode)` = TIER_DEPENDENT | STANDALONE, `standalonePricing`, `tierDependentPricing`, `costType (GroupCostType)` = RECURRING | SETUP, `availableBillingCycles`, `billingCycleDiscounts`, `discountMode`, `price`, `currency`.
- **StandalonePricing**: `setupCost`, `recurringPricing: [RecurringPriceOption!]!`.
- **OptionGroupTierPricing**: `id`, `tierId`, `setupCost`, `setupCostDiscounts`, `recurringPricing`.
- **SetupCost**: `amount!`, `currency!`, `discount`.
- **RecurringPriceOption**: `id`, `billingCycle!`, `amount!`, `currency!`, `discount`.
- **BillingCycleDiscount**: `billingCycle!`, `discountRule: DiscountRule!`.
- **DiscountRule**: `discountType (DiscountType!)` = PERCENTAGE | FLAT_AMOUNT, `discountValue!`.

### Enums (new in 2026-04-23 refactor)
- **`MetricType`**: CUMULATIVE | NON_CUMULATIVE — added for parity with SubscriptionInstance accrual semantics. Replaces the type-side of the old `resetCycle` contract.
- **`AccrualCycle`**: HOURLY | DAILY | WEEKLY | MONTHLY | QUARTERLY | SEMI_ANNUAL | ANNUAL. Replaces `UsageResetCycle` and drops the legacy `NONE` value.

## 3. Modules and operations

### `offering`
Metadata and status: `UPDATE_OFFERING_INFO`, `UPDATE_OFFERING_STATUS`, `SET_OPERATOR`, `SET_OFFERING_ID`, `SET_FACET_TARGET`, `REMOVE_FACET_TARGET`, `ADD_FACET_OPTION`, `REMOVE_FACET_OPTION`, `SELECT_RESOURCE_TEMPLATE`, `CHANGE_RESOURCE_TEMPLATE`, `SET_AVAILABLE_BILLING_CYCLES`.

### `services`
`ADD_SERVICE`, `UPDATE_SERVICE` (incl. `displayOrder` for matrix ordering), `DELETE_SERVICE`.

### `tiers`
Tier CRUD and bindings: `ADD_TIER`, `UPDATE_TIER`, `UPDATE_TIER_PRICING`, `DELETE_TIER`, `ADD_SERVICE_LEVEL`, `UPDATE_SERVICE_LEVEL`, `REMOVE_SERVICE_LEVEL`, `ADD_USAGE_LIMIT`, `UPDATE_USAGE_LIMIT`, `REMOVE_USAGE_LIMIT`, `SET_TIER_DEFAULT_BILLING_CYCLE`, `SET_TIER_BILLING_CYCLE_DISCOUNTS`, `SET_TIER_PRICING_MODE`, `REORDER_TIERS`.

`ADD_USAGE_LIMIT` and `UPDATE_USAGE_LIMIT` now require `metricType` + `accrualCycle` (the latter mandatory on add, optional on update).

### `option-groups`
`ADD_OPTION_GROUP`, `UPDATE_OPTION_GROUP`, `DELETE_OPTION_GROUP`, `SET_OPTION_GROUP_STANDALONE_PRICING`, `ADD_OPTION_GROUP_TIER_PRICING`, `UPDATE_OPTION_GROUP_TIER_PRICING`, `REMOVE_OPTION_GROUP_TIER_PRICING`, `SET_OPTION_GROUP_DISCOUNT_MODE`.

## 4. Editor capabilities

Four-tab progressive-disclosure editor.

- **Offering info** — title, description, thumbnail, info link, status, billing cycles, facet targets, resource template selection.
- **Services** — CRUD for services; each service can be assigned to an option group; `displayOrder` controls ordering in the matrix.
- **Tiers** ([`TierDefinition.tsx`](../../editors/service-offering-editor/components/TierDefinition.tsx)) — tier metadata, pricing, pricing mode, default billing cycle, discount rules. Drag-reorder via `REORDER_TIERS`.
- **Option groups** — setup vs recurring groups, standalone vs tier-dependent pricing, discount modes, per-tier billing cycles.
- **The Matrix** ([`TheMatrix.tsx`](../../editors/service-offering-editor/components/TheMatrix.tsx)) — the service-level × tier authoring grid. Per-cell edits service levels and usage limits. Usage-limit modal now exposes an **Accrual Cycle** picker (DAILY / WEEKLY / MONTHLY / QUARTERLY / SEMI_ANNUAL / ANNUAL). New usage limits default to `metricType: NON_CUMULATIVE`. Legacy `resetCycle` is tolerated on read (falling back to MONTHLY when NONE/absent).

## 5. Subgraph exposure

All major ServiceOffering state is projected through [`subgraphs/resources-services/`](../../subgraphs/resources-services/):

- Query: `serviceOfferings(filter)` returns offerings enriched with resource-template metadata.
- Mutation: `createProductInstances` spawns ResourceInstance + SubscriptionInstance docs from an offering tier selection (via `mapOfferingToSubscription`).
- Types (prefixed `RS…`): `RSServiceOffering`, `RSServiceSubscriptionTier`, `RSOptionGroup`, `RSServiceLevelBinding`, `RSServiceUsageLimit`, and the new `RSMetricType` / `RSAccrualCycle` enums.
- `RSServiceUsageLimit` now carries `metricType: RSMetricType!` + `accrualCycle: RSAccrualCycle!`. Resolver falls back to legacy `resetCycle` (or `MONTHLY` if absent) so legacy docs don't break the subgraph contract.

## 6. Known constraints

- **`availableBillingCycles` is populated programmatically** via `SET_AVAILABLE_BILLING_CYCLES`, typically invoked from the option-groups flow. Empty state does not mean dead weight — the editor can leave it empty and the offering still functions.
- **Services can belong to one `optionGroupId`**. They're shown under that group in the matrix; standalone services (no `optionGroupId`) appear in the `UNGROUPED` bucket.
- **`displayOrder` is sparse**: missing values fall back to `999` for sorting. Reorder ops swap two services' values rather than reassigning all.
- **Legacy `resetCycle`**: pre-refactor offerings with usage limits still carry `resetCycle` in state. The subgraph resolver and the SI mapper both tolerate it (fall back to MONTHLY when NONE/absent). New ops write to `accrualCycle` only.
- **`MetricType` currently not user-editable in the matrix**. All new usage limits default to `NON_CUMULATIVE`. When the product team needs per-limit control, add a picker to the metric-edit modal in [`TheMatrix.tsx`](../../editors/service-offering-editor/components/TheMatrix.tsx).

## 7. Validation rules

- **`SET_AVAILABLE_BILLING_CYCLES`** requires a non-empty list (else `NoBillingCyclesSelectedError`).
- **`CHANGE_RESOURCE_TEMPLATE`** requires `previousTemplateId` to match current (`ChangeResourceTemplateMismatchError`).
- **`REORDER_TIERS`** validates that input IDs match the current set (no additions, no duplicates, no removals) — errors `TierIdsMismatchError`, `DuplicateTierIdError`.
- **Service level CRUD** requires the tier to exist (`AddServiceLevelTierNotFoundError`, etc.).
- **Usage limit CRUD** requires the tier to exist and, for update, the limit to exist.
- **Option group CRUD** requires the group to exist for update/delete.
- **Option group tier pricing**: `SET_OPTION_GROUP_STANDALONE_PRICING` and `ADD_OPTION_GROUP_TIER_PRICING` both set the group's `pricingMode` as a side effect (`STANDALONE` or `TIER_DEPENDENT` respectively).

## 8. Last updated

**2026-04-23** — Metric type + accrual cycle refactor (spec: [`BA_Input/billing-lifecycle-traceability/specs/metric-type-and-accrual-cycle-spec.md`](../../BA_Input/billing-lifecycle-traceability/specs/metric-type-and-accrual-cycle-spec.md), SO-side follow-up).

Changes:
- Added `MetricType` enum.
- Renamed `UsageResetCycle` → `AccrualCycle`; dropped the `NONE` value.
- `ServiceUsageLimit`: replaced optional `resetCycle` with mandatory `metricType: MetricType!` + `accrualCycle: AccrualCycle!`.
- `AddUsageLimitInput` / `UpdateUsageLimitInput` updated accordingly.
- Subgraph `RSServiceUsageLimit` exposes the new fields; resolver tolerates legacy `resetCycle` with fallback to `MONTHLY` + `NON_CUMULATIVE`.
- Editor matrix metric-modal renamed "Reset Cycle" → "Accrual Cycle"; added QUARTERLY / SEMI_ANNUAL / ANNUAL options; "None" option removed. Display text changed from "Resets X" to "Accrues X".
- `mapOfferingToSubscription` simplified — no more stub defaults, reads native SO fields first.
