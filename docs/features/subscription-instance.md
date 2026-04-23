# SubscriptionInstance — Feature Manifest

**Document type:** `powerhouse/subscription-instance`
**Schema:** [`document-models/subscription-instance/v1/schema.graphql`](../../document-models/subscription-instance/v1/schema.graphql)
**Editors:** [`editors/subscription-instance-editor/`](../../editors/subscription-instance-editor/)

## 1. Model overview

A SubscriptionInstance captures a customer's live subscription to a Service Offering. It is a one-time snapshot of the offering at activation time and evolves independently. It tracks customer info, selected tier, billing cycle, active services (flat or grouped), per-service metrics with usage accrual, and running debt/credit counters for settlement.

## 2. State schema summary

### Top-level
- **Customer**: `customerId (PHID)`, `customerName`, `customerEmail`, `customerType (INDIVIDUAL|TEAM)`, `teamMemberCount`.
- **Offering link**: `operatorId`, `serviceOfferingId`, `tierName`, `tierPricingOptionId`, `tierPrice`, `tierCurrency`, `tierPricingMode (CALCULATED|MANUAL_OVERRIDE)`, `selectedBillingCycle`, `globalCurrency`.
- **Resource binding**: optional `resource: ResourceDocument { id, label, thumbnailUrl }`.
- **Lifecycle**: `status` (PENDING | ACTIVE | PAUSED | EXPIRING | CANCELLED), plus timestamps `createdAt`, `activatedSince`, `pausedSince`, `expiringSince`, `renewalDate`, `cancelledSince`, `cancellationReason`.
- **Settings**: `autoRenew (Boolean!)`, `operatorNotes`, `budget: BudgetCategory`.
- **Billing state**: `nextBillingDate`, `currentBillingCycleStart`, `totalDebt (Amount_Money)`, `totalCredit (Amount_Money)`.
- **Content**: `services: [Service!]!` and `serviceGroups: [ServiceGroup!]!`.

### Nested types
- **Service**: id, name, description, customValue, facetSelections, optional setupCost, optional recurringCost, `metrics: [ServiceMetric!]!`.
- **ServiceGroup**: id, optional flag, name, costType (RECURRING|SETUP), optional setupCost/recurringCost, nested `services`.
- **ServiceMetric**: id, name, unitName, freeLimit, paidLimit, unitCost (RecurringCost), currentUsage, **metricType (MetricType!)**, **accrualCycle (AccrualCycle!)**.
- **SetupCost**: amount, currency, paymentDate.
- **RecurringCost**: amount, currency, billingCycle, lastPaymentDate, discount.
- **DiscountInfo**: originalAmount, discountType (PERCENTAGE|FLAT_AMOUNT), discountValue, source (TIER_INHERITED|GROUP_INDEPENDENT|BUNDLE).

### Enums
- `BillingCycle`: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL, ONE_TIME.
- `AccrualCycle`: HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL. (Replaced `ResetPeriod`.)
- `MetricType`: CUMULATIVE, NON_CUMULATIVE. (New.) CUMULATIVE resets `currentUsage` to 0 after accrual; NON_CUMULATIVE retains usage.

## 3. Modules and operations

### `subscription`
- `INITIALIZE_SUBSCRIPTION` — seed state from a mapped offering snapshot.
- `SET_RESOURCE_DOCUMENT` — bind or update the resource reference.
- `ACTIVATE_SUBSCRIPTION` — PENDING → ACTIVE; computes initial debt = setup + first cycle recurring.
- `PAUSE_SUBSCRIPTION` / `RESUME_SUBSCRIPTION` — ACTIVE ↔ PAUSED.
- `SET_EXPIRING` — ACTIVE → EXPIRING (explicit).
- `RENEW_EXPIRING_SUBSCRIPTION` — EXPIRING → ACTIVE; advances billing cycle, adds recurring costs.
- `CANCEL_SUBSCRIPTION` — any status → CANCELLED.
- `SET_BUDGET_CATEGORY` / `REMOVE_BUDGET_CATEGORY`.
- `UPDATE_CUSTOMER_INFO`, `UPDATE_TIER_INFO`, `SET_OPERATOR_NOTES`, `SET_AUTO_RENEW`, `SET_RENEWAL_DATE`.
- `SETTLE_BILLING_CYCLE` — force-accrues every metric (overage → `totalDebt`, reset CUMULATIVE usage), then if `autoRenew` adds next-cycle recurring and advances boundaries; else transitions to EXPIRING.

### `service`
Service CRUD on the flat `services` array: `ADD_SERVICE`, `REMOVE_SERVICE`, `UPDATE_SERVICE_INFO`, `UPDATE_SERVICE_SETUP_COST`, `UPDATE_SERVICE_RECURRING_COST`, `ADD_SERVICE_FACET_SELECTION`, `REMOVE_SERVICE_FACET_SELECTION`. Payment reporting: `REPORT_SETUP_PAYMENT`, `REPORT_RECURRING_PAYMENT`, `REPORT_OVERAGE_PAYMENT`.

### `service-group`
`ADD_SERVICE_GROUP`, `REMOVE_SERVICE_GROUP`, `ADD_SERVICE_TO_GROUP`, `REMOVE_SERVICE_FROM_GROUP`, `UPDATE_SERVICE_GROUP_COST`.

### `metrics`
- `ADD_SERVICE_METRIC` — attach a new ServiceMetric to a service; requires `metricType` and `accrualCycle`.
- `UPDATE_METRIC` — update metric config (name, unitName, free/paid limits, metricType, accrualCycle).
- `UPDATE_METRIC_USAGE` — set `currentUsage` absolutely. `isAdjustment: Boolean` bypasses `paidLimit` clamping when true; otherwise clamps.
- `REMOVE_SERVICE_METRIC`.
- `ACCRUE_METRIC_USAGE` (renamed from `RESET_METRIC_CYCLE`) — end an accrual cycle for one metric: overage → `totalDebt`; CUMULATIVE resets usage, NON_CUMULATIVE retains.
- `INCREMENT_METRIC_USAGE`, `DECREMENT_METRIC_USAGE` — **DEPRECATED**. Retained pending external-consumer audit (spec §4.5 / §10 Q4). Not dispatched by editor; prefer `UPDATE_METRIC_USAGE`.

### `customer`
`SET_CUSTOMER_TYPE`, `UPDATE_TEAM_MEMBER_COUNT`.

## 4. Editor capabilities

Tab-based editor split into operator vs client views where applicable.

- **Services panel** ([ServicesPanel.tsx](../../editors/subscription-instance-editor/components/ServicesPanel.tsx)) — lists flat services and grouped services, per-metric usage bars with free/paid limits, "X accrual · cumulative/non-cumulative" badge.
- **Metric actions** ([MetricActions.tsx](../../editors/subscription-instance-editor/components/MetricActions.tsx), operator only) — edit usage (absolute, via `UPDATE_METRIC_USAGE`; auto-flags `isAdjustment:true` for NON_CUMULATIVE), "Accrue now" button (dispatches `ACCRUE_METRIC_USAGE`).
- **Billing panel** — payments and cycle timeline (pre-existing).
- **Subscription header** — customer, tier, status badges.
- **Import service config** — seed a subscription from a service offering snapshot via `mapOfferingToSubscription`.
- **Mock data button** — developer convenience, dispatches `INITIALIZE_SUBSCRIPTION` with fixtures.

## 5. Subgraph exposure

SubscriptionInstance metrics are **not** currently projected in the `resources-services` subgraph. The subgraph exposes Service Offering usage limits via `RSServiceUsageLimit` (with `resetCycle: RSUsageResetCycle`) — that is the OFFERING side, not the SubscriptionInstance side. No subgraph changes are required for this spec.

## 6. Known constraints

- **Settlement force-accrues unconditionally**: `SETTLE_BILLING_CYCLE` runs accrual math for every metric regardless of `accrualCycle`. The `accrualCycle` enum currently drives only the *scheduled* accrual (operator-dispatched via the "Accrue now" button). No automation layer fires scheduled accruals yet (spec §9 Q3).
- **Pro-rata rule**: charge what accrued at termination — no time-extrapolation. `max(0, currentUsage - freeLimit) * unitCost.amount`, capped at `(paidLimit - freeLimit)`.
- **Structured debt**: `totalDebt`/`totalCredit` remain scalar counters. The labeled line-item breakdown (setup / prepayment / dynamic usage) is a read-side projection — not in state, follow-up work.
- **Mapper stubs**: `mapOfferingToSubscription` defaults `metricType = NON_CUMULATIVE` and carries `accrualCycle` from the Service Offering's `resetCycle` (or `MONTHLY` when NONE/absent). **Temporary**: the Service Offering model must grow a native `metricType` + `accrualCycle` (spec §8, §10 Q2). Flagged for `apeiron-coordinator`.
- **Legacy documents**: existing documents created before this refactor will have `metric.metricType === undefined` and `metric.accrualCycle === undefined`. Reducers tolerate undefined (treat as NON_CUMULATIVE, no reset). Editor rendering **must** guard — see Known issue below.

## 7. Validation rules

- Status transitions: `ACTIVATE_SUBSCRIPTION` requires `PENDING`; `PAUSE` requires `ACTIVE`; `RESUME` requires `PAUSED`; `SET_EXPIRING` requires `ACTIVE`; `RENEW_EXPIRING_SUBSCRIPTION` requires `EXPIRING`; `CANCEL` forbids already-CANCELLED.
- Usage-modifying operations (`UPDATE_METRIC_USAGE`, `INCREMENT_METRIC_USAGE`, `DECREMENT_METRIC_USAGE`, `ACCRUE_METRIC_USAGE`) require status = `ACTIVE`.
- `SETTLE_BILLING_CYCLE` requires status = `ACTIVE` and `settlementDate >= currentBillingCycleStart`.
- Payment reporting (setup/recurring): errors if no cost defined, already paid, or amount exceeds owed.
- `REMOVE_BUDGET_CATEGORY` requires the budget id to match the current.
- Structural ops inside groups (ADD/REMOVE_SERVICE_TO_GROUP) require subscription ACTIVE.
- `currentUsage` is clamped to `paidLimit` on usage reports unless `isAdjustment = true`.

## 8. Last updated

**2026-04-23** — Metric type + accrual cycle refactor (spec: [`BA_Input/billing-lifecycle-traceability/specs/metric-type-and-accrual-cycle-spec.md`](../../BA_Input/billing-lifecycle-traceability/specs/metric-type-and-accrual-cycle-spec.md)).

Changes:
- Added `MetricType` enum (CUMULATIVE / NON_CUMULATIVE).
- Renamed `ResetPeriod` → `AccrualCycle`; replaced `usageResetPeriod` with mandatory `metricType` + `accrualCycle` on `ServiceMetric` and all metric input types.
- Renamed `RESET_METRIC_CYCLE` → `ACCRUE_METRIC_USAGE`; branches reset on `metricType === "CUMULATIVE"`.
- `UPDATE_METRIC_USAGE` gained `isAdjustment: Boolean` for NON_CUMULATIVE corrections.
- `SETTLE_BILLING_CYCLE` now force-accrues all metrics (replaces `shouldResetMetric` + `RESET_HIERARCHY`).
- `INCREMENT_METRIC_USAGE` / `DECREMENT_METRIC_USAGE` marked DEPRECATED; editor no longer uses them.

## Known issues

1. **Legacy document rendering (BLOCKER from 2026-04-23 review).** `ServicesPanel.tsx` calls `metric.accrualCycle.charAt(0)` unconditionally. Documents created before this refactor have `accrualCycle === undefined` and will crash the panel. A guarded fallback (e.g. `metric.accrualCycle?.charAt(0) ?? "?"` with a "legacy metric" notice) is required before shipping.
