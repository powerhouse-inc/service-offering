# Metric Type & Accrual Cycle — Spec

**Model:** `subscription-instance` (v1)
**Status:** Ready for Developer
**Source BA:** [`../../[Platforms Workstream] - Subscription Instance BA Overview - 2026_04_17 15_14 CEST - Notes by Gemini.md`](../../%5BPlatforms%20Workstream%5D%20-%20Subscription%20Instance%20BA%20Overview%20-%202026_04_17%2015_14%20CEST%20-%20Notes%20by%20Gemini.md) (transcript @ 00:23:25, 00:29:02, 00:38:44, 00:40:18, 00:49:05, 00:51:25, 00:57:59, 01:00:35, 01:01:54)
**Supersedes:** [`../11-metric-reset-cycles.md`](../11-metric-reset-cycles.md)

---

## 1. Summary

The current schema conflates two concerns into a single nullable `usageResetPeriod` field: *when* usage is converted into debt, and *whether* usage drops to zero afterward. This refactor splits them into an explicit `metricType` (CUMULATIVE vs NON_CUMULATIVE) and a mandatory `accrualCycle`. Every metric now accrues on a cycle; the type only controls the post-accrual reset behavior. The billing cycle is decoupled from the accrual cycle and always terminates any in-flight accrual via a charge-what-accrued rule (no carryover, no time-extrapolation).

**Debt model:** `totalDebt` / `totalCredit` remain scalar running counters on state. Debt "slices" are **not** stored as ledger entries in state — each accrual is an operation in the document's event log, and the labeled line-item view that stakeholders want is produced by a processor/subgraph reading the operation log. This spec therefore has **no dependency on a structured-debt state schema**; it depends on the existing counter pattern. See §6 for rationale (vault note [subscription billing state should carry counters not ledger arrays](/mnt/f/PowerhouseVault/knowledge/notes/subscription%20billing%20state%20should%20carry%20counters%20not%20ledger%20arrays.md)).

---

## 2. Current State

### 2.1 Schema ([schema.graphql](../../../document-models/subscription-instance/v1/schema.graphql))

- `enum ResetPeriod` at lines 99–107 (HOURLY / DAILY / WEEKLY / MONTHLY / QUARTERLY / SEMI_ANNUAL / ANNUAL)
- `type ServiceMetric` at lines 147–156 has optional `usageResetPeriod: ResetPeriod` — **nullability implicitly encodes "non-cumulative"**
- Input types referencing `usageResetPeriod`: `InitializeMetricInput` (194), `AddServiceMetricInput` (458), `UpdateMetricInput` (472)
- `UpdateMetricUsageInput` (482), `IncrementMetricUsageInput` (494), `DecrementMetricUsageInput` (501) — three operations that modify `currentUsage`
- `ResetMetricCycleInput` (508) — manual reset operation

### 2.2 Reducers ([metrics.ts](../../../document-models/subscription-instance/v1/src/reducers/metrics.ts))

- `resetMetricCycleOperation` (lines 187–223): ACTIVE-only, calculates overage inline via `calculateOverageCost` logic, adds cost flat to `state.totalDebt`, then sets `currentUsage = 0`
- `updateMetricUsageOperation` (84–111): clamps to `paidLimit`, no debt effect
- `incrementMetricUsageOperation` (133–161): adds `incrementBy`, clamps to `paidLimit`
- `decrementMetricUsageOperation` (162–186): subtracts `decrementBy`

### 2.3 Settlement ([subscription.ts](../../../document-models/subscription-instance/v1/src/reducers/subscription.ts))

- `settleBillingCycleOperation` (lines 340–409) does metric overage inline via `processMetrics` (366–376):
  - For every metric: compute overage cost, add flat to `state.totalDebt`
  - If `shouldResetMetric(metric, billingCycle)` → set `currentUsage = 0`
- Relies on `RESET_HIERARCHY` in [utils.ts:17](../../../document-models/subscription-instance/v1/src/utils.ts) + `shouldResetMetric` ([utils.ts:142](../../../document-models/subscription-instance/v1/src/utils.ts))

### 2.4 Debt model today

`state.totalDebt` and `state.totalCredit` are single `Amount_Money` scalars. No slicing, no labeling, no billed/unbilled flag. **This is retained** per the counters-not-arrays pattern (see §6). The labeled debt view (setup / prepayment / dynamic usage) is not a state concern — it's a read-side projection produced from the operation log.

---

## 3. Target State

### 3.1 Schema diff

#### Enums

```diff
- enum ResetPeriod {
+ enum AccrualCycle {
      HOURLY
      DAILY
      WEEKLY
      MONTHLY
      QUARTERLY
      SEMI_ANNUAL
      ANNUAL
  }

+ enum MetricType {
+     CUMULATIVE      # usage resets to 0 after accrual
+     NON_CUMULATIVE  # usage stays at current level after accrual; charged per-unit-per-cycle
+ }
```

Closed enum at two values. High-watermark is explicitly out of scope (see §8).

#### `ServiceMetric` type

```diff
  type ServiceMetric {
      id: OID!
      name: String!
      unitName: String!
      freeLimit: Int
      paidLimit: Int
      unitCost: RecurringCost
      currentUsage: Int!
-     usageResetPeriod: ResetPeriod
+     metricType: MetricType!
+     accrualCycle: AccrualCycle!
  }
```

Both new fields are mandatory. This is a breaking change; existing documents are ignored per decision #5.

#### Input types

```diff
  input InitializeMetricInput {
      id: OID!
      name: String!
      unitName: String!
      freeLimit: Int
      paidLimit: Int
      currentUsage: Int!
-     usageResetPeriod: ResetPeriod
+     metricType: MetricType!
+     accrualCycle: AccrualCycle!
      unitCostAmount: Amount_Money
      unitCostCurrency: Currency
      unitCostBillingCycle: BillingCycle
  }

  input AddServiceMetricInput {
      serviceId: OID!
      metricId: OID!
      name: String!
      unitName: String!
      freeLimit: Int
      paidLimit: Int
      currentUsage: Int!
-     usageResetPeriod: ResetPeriod
+     metricType: MetricType!
+     accrualCycle: AccrualCycle!
      unitCostAmount: Amount_Money
      unitCostCurrency: Currency
      unitCostBillingCycle: BillingCycle
  }

  input UpdateMetricInput {
      serviceId: OID!
      metricId: OID!
      name: String
      unitName: String
      freeLimit: Int
      paidLimit: Int
-     usageResetPeriod: ResetPeriod
+     metricType: MetricType
+     accrualCycle: AccrualCycle
  }

  input UpdateMetricUsageInput {
      serviceId: OID!
      metricId: OID!
      currentTime: DateTime!
      currentUsage: Int!
+     isAdjustment: Boolean
  }

- input ResetMetricCycleInput {
+ input AccrueMetricUsageInput {
      serviceId: OID!
      metricId: OID!
-     resetDate: DateTime!
+     accrualDate: DateTime!
  }
```

No `debtSliceId` on `AccrueMetricUsageInput`. The operation itself is the ledger record — label is implicit in the op type (`ACCRUE_METRIC_USAGE` → "dynamic usage"), metric reference is in the input, timestamp is operation metadata. No in-state ledger entry is written.

`INCREMENT_METRIC_USAGE` and `DECREMENT_METRIC_USAGE`: **recommendation — remove both** (see §4.5). `UPDATE_METRIC_USAGE` with `isAdjustment` subsumes their intent.

### 3.2 Operation renames / semantic changes

| Old | New | Change type |
|---|---|---|
| `RESET_METRIC_CYCLE` | `ACCRUE_METRIC_USAGE` | Rename + semantics (writes debt slice, branches on type) |
| `UPDATE_METRIC_USAGE` | `UPDATE_METRIC_USAGE` | Semantic: optional `isAdjustment` flag |
| `INCREMENT_METRIC_USAGE` | *(removed)* | Collapse into `UPDATE_METRIC_USAGE` |
| `DECREMENT_METRIC_USAGE` | *(removed)* | Collapse into `UPDATE_METRIC_USAGE` |
| `SETTLE_BILLING_CYCLE` | `SETTLE_BILLING_CYCLE` | Semantic: delegates metric work to accrual, no inline overage |

### 3.3 Reducer behavior changes

- `accrueMetricUsageOperation` increments `state.totalDebt` by the computed amount and branches on `metricType` for the reset decision. No ledger-entry write.
- `updateMetricUsageOperation` accepts `isAdjustment`: when `true`, sets `currentUsage` absolutely with no debt effect; when `false`/absent, behaves as today (clamp to `paidLimit`).
- `settleBillingCycleOperation` no longer computes overage inline. Instead, it force-accrues every metric by applying the same math as `accrueMetricUsageOperation` (one pass over all metrics, increment `totalDebt` per metric, branch on `metricType` for reset), then adds the prepayment amount to `totalDebt`, advances cycle boundaries.
- `calculateOverageCost` in [utils.ts](../../../document-models/subscription-instance/v1/src/utils.ts) is retained (used by both reducers). `shouldResetMetric` and `RESET_HIERARCHY` are **removed** — no longer needed; every metric accrues unconditionally at settlement.

---

## 4. Operations Catalog

### 4.1 `ACCRUE_METRIC_USAGE` (renamed from `RESET_METRIC_CYCLE`)

**Module:** `metrics`
**Purpose:** End an accrual cycle for one metric. Crystallize `currentUsage` into a labeled debt slice; reset or retain usage based on `metricType`.

**Input:**
```graphql
input AccrueMetricUsageInput {
    serviceId: OID!
    metricId: OID!
    accrualDate: DateTime!
}
```

**Reducer behavior:**
1. Guard: `state.status !== "ACTIVE"` → throw `SubscriptionNotActiveAccrueMetricUsageError`.
2. Resolve service via `findServiceById`. Not found → `AccrueMetricUsageServiceNotFoundError`.
3. Resolve metric by id. Not found → `AccrueMetricUsageMetricNotFoundError`.
4. Compute amount via `calculateOverageCost(metric)` — i.e., `max(0, currentUsage - freeLimit) * unitCost.amount`, capped at `(paidLimit - freeLimit)`. Formula is identical for CUMULATIVE and NON_CUMULATIVE; the type difference manifests only in step 6.
5. If `amount > 0` and `metric.unitCost` exists → `state.totalDebt = (state.totalDebt ?? 0) + amount`.
6. Reset rule:
   - `metricType === "CUMULATIVE"` → `metric.currentUsage = 0`
   - `metricType === "NON_CUMULATIVE"` → leave `metric.currentUsage` untouched

No in-state ledger write. The labeled-line-item breakdown is produced by a processor/subgraph reading operations of type `ACCRUE_METRIC_USAGE` (label: dynamic usage), `REPORT_PAYMENT` (label: payment), `SETTLE_BILLING_CYCLE` (label: prepayment), etc.

**Errors:** `SubscriptionNotActiveAccrueMetricUsageError`, `AccrueMetricUsageServiceNotFoundError`, `AccrueMetricUsageMetricNotFoundError`.

**Example payload:**
```json
{
  "type": "ACCRUE_METRIC_USAGE",
  "input": {
    "serviceId": "svc-invoices-01",
    "metricId": "metric-invoice-count",
    "accrualDate": "2026-05-01T00:00:00Z"
  }
}
```

---

### 4.2 `UPDATE_METRIC_USAGE` (semantic change)

**Module:** `metrics`
**Purpose:** Set absolute `currentUsage`. Default behavior clamps to `paidLimit` and is meant for usage reporting. With `isAdjustment: true`, bypasses clamping and records a correction (no debt effect either way — debt accrues only at `ACCRUE_METRIC_USAGE`).

**Input:**
```graphql
input UpdateMetricUsageInput {
    serviceId: OID!
    metricId: OID!
    currentTime: DateTime!
    currentUsage: Int!
    isAdjustment: Boolean
}
```

**Reducer behavior:**
1. Guard ACTIVE → `SubscriptionNotActiveUpdateUsageError` (existing).
2. Resolve service / metric (existing errors).
3. If `isAdjustment === true`: `metric.currentUsage = action.input.currentUsage` (no clamping).
4. Else: `metric.currentUsage = paidLimit != null ? min(currentUsage, paidLimit) : currentUsage` (existing behavior).

**Errors:** unchanged — reuse existing `SubscriptionNotActiveUpdateUsageError`, `UpdateMetricUsageServiceNotFoundError`, `UpdateMetricUsageNotFoundError`.

**Example payload (adjustment on a non-cumulative metric):**
```json
{
  "type": "UPDATE_METRIC_USAGE",
  "input": {
    "serviceId": "svc-seats",
    "metricId": "metric-seat-count",
    "currentTime": "2026-04-20T10:00:00Z",
    "currentUsage": 4,
    "isAdjustment": true
  }
}
```

---

### 4.3 `SETTLE_BILLING_CYCLE` (behavior change)

**Module:** `subscription`
**Purpose:** End a billing cycle. Force-accrue every metric, then add prepayment to `totalDebt` for the next period, then advance cycle boundaries. Billing cycle is the hard stop — no carryover of mid-flight accruals.

**Input:** unchanged — `settlementDate: DateTime!` (whatever the current schema has).

**Reducer behavior:**
1. Guard ACTIVE (existing `NoBillingCycleActiveError`).
2. Guard `settlementDate >= currentBillingCycleStart` (existing `SettlementDateBeforeCycleStartError`).
3. **For every metric on every service (flat + grouped):** inline the accrual math from §4.1 step 4–6. Increment `totalDebt` by each metric's accrued amount; reset `currentUsage` for CUMULATIVE metrics. Uses the pro-rata rule from §5 (charge what accrued, no time-extrapolation).
4. If `autoRenew`: compute next-cycle prepayment total (sum of all recurring costs across services + service groups), add to `totalDebt`, advance `currentBillingCycleStart` and `nextBillingDate`.
5. Else: transition status to `EXPIRING` (existing behavior).

**Note:** step 3 replaces the current `processMetrics` inline overage calc. `shouldResetMetric` is no longer called — every metric gets accrued on every settlement regardless of its `accrualCycle` enum value. The `accrualCycle` field drives the *scheduled* accrual (editor/cron-triggered between settlements); settlement itself is an *unconditional* force-accrual for all metrics.

**Implementation choice — dispatch vs inline:** the reducer cannot dispatch other operations (it's a pure function). Therefore settlement inlines the accrual math directly rather than firing N `ACCRUE_METRIC_USAGE` operations. Trade-off: the operation log will show one `SETTLE_BILLING_CYCLE` instead of N `ACCRUE_METRIC_USAGE` + one `SETTLE_BILLING_CYCLE`, so the read-side projection (processor/subgraph) that produces the labeled-line-item view must attribute per-metric amounts by re-running the same math against the pre-settlement state snapshot. Flagged in §9.

**Errors:** existing `NoBillingCycleActiveError`, `SettlementDateBeforeCycleStartError`.

---

### 4.4 `ADD_SERVICE_METRIC` / `INITIALIZE_METRIC` / `UPDATE_METRIC` (field updates only)

These operations already exist; only the input shape changes per §3.1. Reducers update `metric.metricType` and `metric.accrualCycle` where today they handle `metric.usageResetPeriod`. Both fields must be supplied on create (non-nullable); `UPDATE_METRIC` keeps them optional.

---

### 4.5 `INCREMENT_METRIC_USAGE` / `DECREMENT_METRIC_USAGE` — **remove**

**Recommendation:** delete both operations.

Rationale:
- `UPDATE_METRIC_USAGE` already sets absolute usage, which is the correct semantic for reporting state.
- `isAdjustment` covers the non-cumulative correction case.
- Keeping three overlapping operations creates ambiguity for the Service Offering → Subscription Instance payload mapping and for future editor UX.
- Usage-increment semantics ("+1 invoice") belong to whichever system emits the usage events; by the time an action reaches the document, it should be expressing the absolute current state.

If a delta-based API is truly needed (e.g., for concurrent-safe usage reporting), reintroduce as `REPORT_METRIC_DELTA` later with explicit semantics — do not keep the current increment/decrement pair.

---

## 5. Pro-Rata Termination Rules

**Locked rule (decision #1):** charge exactly what has accrued at the moment of termination — `currentUsage * unitCost`, applying free/paid limits as today. **No time-extrapolation.**

Applies whenever an accrual cycle ends before its scheduled boundary. Three triggers:

### 5.1 Billing-cycle end cuts an accrual short

**Scenario:** monthly accrual cycle on invoice metric, quarterly billing cycle. Today is 2026-05-01 (billing cycle end); accrual cycle started 2026-04-15 (only 16 days of a 30-day accrual cycle elapsed).

**Computation:** `amount = max(0, 22 - freeLimit) * unitCost.amount` where 22 is `currentUsage` at settlement time. No prorating by `16/30`. The invoices were used — they're charged.

**Result:** single debt slice with `amount = <as computed>`, `accrualCycleStart = 2026-04-15`, `accrualCycleEnd = 2026-05-01`.

### 5.2 Plan change or service-group change mid-accrual

**Scenario:** customer changes plans on day 12 of a 30-day accrual cycle. Seats metric (NON_CUMULATIVE), `currentUsage = 5`, `unitCost = $10/seat/month`.

**Computation:** `amount = 5 * 10 = $50`. No prorating by `12/30`. The seats were provisioned — they're charged full.

**Result:** single debt slice with `amount = $50`. Because the metric is NON_CUMULATIVE, `currentUsage` remains `5` after accrual. Under the new plan, a fresh accrual cycle begins with whatever seat price is in effect.

### 5.3 Worked example — cumulative metric on billing-cycle boundary

**Scenario:** API calls metric, CUMULATIVE, monthly accrual, quarterly billing. `freeLimit = 1000`, `unitCost = $0.001/call`, `currentUsage = 5000` at settlement. Settlement happens to fall *on* the scheduled accrual boundary.

**Computation:** `amount = max(0, 5000 - 1000) * 0.001 = $4.00`.

**Result:** debt slice `amount = $4.00`; `currentUsage` reset to `0`. Indistinguishable from a scheduled accrual — the billing cycle just happens to coincide with the accrual boundary.

---

## 6. Debt Model — Counters in State, Detail in Operations

**Rationale (from vault note [subscription billing state should carry counters not ledger arrays](/mnt/f/PowerhouseVault/knowledge/notes/subscription%20billing%20state%20should%20carry%20counters%20not%20ledger%20arrays.md)):**

> Running totals (totalDebt, totalCredit) belong on subscription state; transaction-level detail lives in the Reactor operation history or the account-transactions model downstream. (...) Duplicating this in a state array means maintaining two sources of truth that must stay in sync. (...) No existing Powerhouse document model uses unbounded growing arrays for transaction history.

This spec follows the pattern. Every debt-affecting operation increments/decrements a scalar counter; the labeled, per-source breakdown (setup cost / prepayment / dynamic usage) is produced **outside** the document model.

### 6.1 What stays in state

- `state.totalDebt: Amount_Money` — running sum of all charges.
- `state.totalCredit: Amount_Money` — running sum of all payments/credits.
- `amountOwed` is derived: `totalDebt - totalCredit` (pure util, not a stored field).

### 6.2 How each operation affects debt

| Operation | `totalDebt` effect |
|---|---|
| `ACTIVATE_SUBSCRIPTION` | += setup + first-cycle recurring (existing) |
| `ACCRUE_METRIC_USAGE` | += `calculateOverageCost(metric)` when > 0 |
| `SETTLE_BILLING_CYCLE` | += sum of force-accruals, += next-cycle prepayment (if autoRenew) |
| `REPORT_PAYMENT` | no direct effect on `totalDebt`; increments `totalCredit` |

### 6.3 How the "labeled line items" view is produced (out of scope for this spec)

The user-visible debt breakdown — "setup cost: $100 / prepayment: $200 / dynamic usage: $47" — is a **read-side projection**. Two Powerhouse-native options, both outside this spec:

1. **Processor** maintaining a PGlite-backed view keyed by operation type, queried by the editor via `useRelationalQuery`.
2. **Subgraph** query that walks the operation log on demand and groups by op type.

Either approach attributes per-source amounts from operation inputs + metadata. For `SETTLE_BILLING_CYCLE` — which inlines multiple accruals — the projection re-runs `calculateOverageCost` against the state snapshot at the op's timestamp to attribute per-metric amounts.

**This spec does not design the projection.** Flagged as a follow-up workstream in §8.

### 6.4 FIFO payment ordering (deferred)

Wouter's transcript point @ 00:45:52 — "payments pay the oldest slice of debt first" — is a payment-side concern (how `REPORT_PAYMENT` decides what to retire), not a metric-side concern. It applies to the read-side projection and possibly to a future `REPORT_PAYMENT` semantic change, but does not affect this spec. Flagged as a follow-up.

---

## 7. Editor Changes (non-schema — for the Developer)

These are UI-side and do not affect schema. Listed for implementation completeness.

1. **Metric create/edit form:** add a `MetricType` picker (radio or select: Cumulative / Non-cumulative). Replace the "No reset cycle" checkbox/option with this explicit field.
2. **Accrual cycle picker:** now always required; relabel "Reset period" → "Accrual cycle" in all copy.
3. **Metric actions:** rename the "Reset cycle" button → "Accrue now". Icon can stay.
4. **Adjustment flow:** when editing `currentUsage` on a non-cumulative metric, expose an "Adjustment (no charge)" toggle that dispatches `UPDATE_METRIC_USAGE` with `isAdjustment: true`.
5. **Debt display (unchanged for this spec):** `totalDebt` continues to render as a scalar. The labeled-line-item breakdown is a follow-up tied to the processor/subgraph projection (§6.3) — **not part of this spec's deliverables**.

Copy change summary: "reset" → "accrual" everywhere; "no reset cycle" → "non-cumulative".

---

## 8. Out of Scope (Deferred)

Explicitly excluded from this spec, to be addressed separately:

- **Service Offering schema changes.** The SO document model must carry `metricType` + `accrualCycle` so they flow through to subscription instances. Needs a separate spec against the `service-offering` model. Without it, the `mapOfferingToSubscription` helper has nothing to copy from. **Blocking dependency** — see §9 Q2.
- **Labeled debt breakdown projection.** The processor or subgraph that produces "setup cost / prepayment / dynamic usage" line items from the operation log. This is where Wouter's structured-debt vision lives (read-side), and it's a follow-up spec.
- **FIFO payment ordering.** `REPORT_PAYMENT` semantics for retiring oldest debt first. Payment-side concern, not metric-side.
- **`ESTIMATED_USAGE` + `RECONCILIATION` debt categories.** The utilities-billing scenario (billing cycle shorter than accrual cycle). Deferred.
- **Billing-cycle-shorter-than-accrual-cycle scenarios.** Same deferral.
- **High-watermark metric type.** Explicitly excluded; `MetricType` enum stays closed at two values.
- **Migration of existing subscription instances.** Per decision #5: breaking change, no migration path designed.
- **Scheduled accrual automation.** Between settlements, `ACCRUE_METRIC_USAGE` is operator-dispatched only (editor button). Time-triggered automation (cron, processor-adjacent service) is a follow-up — no Powerhouse-native scheduler exists. See §9 Q3.

---

## 9. Open Questions / Risks

1. **`freeLimit` on non-cumulative metrics.** Per decision #4, non-cumulative charges per-unit-per-cycle (e.g., 5 seats × $10/seat/month = $50/month). The current formula `max(0, currentUsage - freeLimit) * unitCost.amount` would still produce $50 if `freeLimit = 0` (likely the case for seats). **Recommend: keep the uniform formula.** Operators who don't want a free tier set `freeLimit = 0` or leave it null. This preserves the "first N seats free" modeling option without complicating the reducer.

2. **Service Offering dependency.** Making `metricType: MetricType!` and `accrualCycle: AccrualCycle!` non-nullable in `InitializeMetricInput` / `AddServiceMetricInput` breaks `mapOfferingToSubscription` because the SO model doesn't carry these fields. **Recommend: land the SO-side spec first**, then land this one. Alternative: stub defaults in the mapper (`NON_CUMULATIVE` / `MONTHLY`) and make SO a follow-up — but that risks silently wrong data. Human decision needed before Developer starts.

3. **Scheduled accrual automation.** `ACCRUE_METRIC_USAGE` fires only when explicitly dispatched. Between settlements, if the accrual cycle is shorter than the billing cycle (e.g., monthly accrual on quarterly billing), something must fire the op on day 30 and day 60. No Powerhouse-native scheduler exists. **Recommend: ship with operator-dispatched only (editor "Accrue now" button)**; automation is a follow-up spec involving either a processor-adjacent service or external cron. Flag to `apeiron-coordinator`.

4. **Removing `INCREMENT_METRIC_USAGE` / `DECREMENT_METRIC_USAGE`.** If any external system (Switchboard integrations, scripts, processors) currently dispatches these, removal breaks those call sites. **Recommend: audit first** — grep the monorepo and ask about external consumers before deleting. If nothing external uses them, hard delete. If something does, deprecate (leave the reducers but stop exposing in editor). Flag to `apeiron-coordinator`.

5. **Read-side projection for labeled line items.** The vault pattern says detail lives in the operation log, produced via processor or subgraph on read. This is the right answer architecturally, but it means the labeled-line-item view Wouter described is NOT delivered by this spec — it's a follow-up workstream. Confirm this is acceptable product-wise (i.e., the editor ships with scalar `totalDebt` and gets the structured view in a later release).

6. **SETTLE_BILLING_CYCLE attribution in the projection.** Because `SETTLE_BILLING_CYCLE` inlines multiple accruals into one operation (it's a pure reducer — can't dispatch sub-ops), the read-side projection must re-run the overage math against the pre-settlement state snapshot to attribute per-metric amounts. This is tractable (the snapshot is at `operation[i-1]`), but should be captured in the projection spec. **Risk:** if the projection gets this wrong, the per-metric breakdown in the editor won't match what the reducer actually charged.

---

## 10. Handoff Notes for Developer

**Prerequisites — resolve before starting:**

1. **Q2: Service Offering sequencing.** Either SO-side spec lands first (preferred) or mapper gets explicit defaults.
2. **Q4: Increment/decrement call-site audit.** Coordinator confirms no external consumers before hard delete.
3. **Q5: Confirm scalar `totalDebt` is acceptable for this ship.** Structured labeled view is a follow-up.

**Implementation order:**

1. Schema updates via MCP: new enum `MetricType`, rename `ResetPeriod` → `AccrualCycle`, update `ServiceMetric`, update affected input types, rename `ResetMetricCycleInput` → `AccrueMetricUsageInput` (no `debtSliceId` field).
2. Operation ops via MCP: rename `RESET_METRIC_CYCLE` → `ACCRUE_METRIC_USAGE`, delete `INCREMENT_METRIC_USAGE` + `DECREMENT_METRIC_USAGE` (after coordinator audit), add new error types.
3. Reducers in `src/reducers/metrics.ts` and `src/reducers/subscription.ts`:
   - Replace `resetMetricCycleOperation` with `accrueMetricUsageOperation` per §4.1 — increments `state.totalDebt`, branches on `metricType`.
   - Extend `updateMetricUsageOperation` per §4.2 — `isAdjustment` flag.
   - Rewrite `settleBillingCycleOperation`'s metric handling per §4.3. Replace the current `processMetrics` inline block with one that applies the accrual math (§4.1 step 4–6) per metric, instead of the overage-plus-shouldReset pattern.
   - Delete `incrementMetricUsageOperation` + `decrementMetricUsageOperation` reducers.
4. Utils in `src/utils.ts`:
   - Retain `calculateOverageCost`.
   - Delete `shouldResetMetric` and `RESET_HIERARCHY` — no longer called.
5. Editor updates per §7.
6. `npm run tsc` + `npm run lint:fix` — both must pass.

**Gotchas:**

- The v1 schema file at [`document-models/subscription-instance/v1/schema.graphql`](../../../document-models/subscription-instance/v1/schema.graphql) has `ResetPeriod` referenced in multiple input types (lines 194, 458, 472) — don't miss any.
- Test reducer errors via `operation.error` on the operations array, not `.toThrow()` (per CLAUDE.md).
- The `settleBillingCycleOperation` currently mutates `state.totalDebt` directly in two places (metric overage + recurring). **Keep this pattern** — both still mutate `totalDebt` directly. The only change is replacing `shouldResetMetric` branching with unconditional per-type reset.
- No `generateId()` calls anywhere in this refactor. All operations take inputs only.

**After Developer is done → `apeiron-reviewer` runs the delivery checklist.**
