# Metric Type & Accrual Cycle — Spec

**Model:** `subscription-instance` (v1)
**Status:** Ready for Developer
**Source BA:** [`../../[Platforms Workstream] - Subscription Instance BA Overview - 2026_04_17 15_14 CEST - Notes by Gemini.md`](../../%5BPlatforms%20Workstream%5D%20-%20Subscription%20Instance%20BA%20Overview%20-%202026_04_17%2015_14%20CEST%20-%20Notes%20by%20Gemini.md) (transcript @ 00:23:25, 00:29:02, 00:38:44, 00:40:18, 00:49:05, 00:51:25, 00:57:59, 01:00:35, 01:01:54)
**Supersedes:** [`../11-metric-reset-cycles.md`](../11-metric-reset-cycles.md)

---

## 1. Summary

The current schema conflates two concerns into a single nullable `usageResetPeriod` field: *when* usage is converted into debt, and *whether* usage drops to zero afterward. This refactor splits them into an explicit `metricType` (CUMULATIVE vs NON_CUMULATIVE) and a mandatory `accrualCycle`. Every metric now accrues on a cycle; the type only controls the post-accrual reset behavior. The billing cycle is decoupled from the accrual cycle and always terminates any in-flight accrual via a charge-what-accrued rule (no carryover, no time-extrapolation). Accrual writes labeled debt slices into a structured debt ledger — this is a hard dependency on the separate structured-debt workstream.

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

`state.totalDebt` is a single `Amount_Money` scalar. No slicing, no labeling, no billed/unbilled flag. **This is what the structured-debt workstream replaces** — this spec assumes it exists.

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
+     debtSliceId: OID!
  }
```

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

- `accrueMetricUsageOperation` writes a debt slice instead of mutating `totalDebt`, branches on `metricType` for reset behavior.
- `updateMetricUsageOperation` accepts `isAdjustment`: when `true`, sets `currentUsage` absolutely with no debt effect; when `false`/absent, behaves as today (clamp to `paidLimit`).
- `settleBillingCycleOperation` no longer touches metrics inline. It force-accrues every metric (emitting one debt slice per metric) before adding the prepayment slice and flagging unbilled slices.
- `calculateOverageCost` in [utils.ts](../../../document-models/subscription-instance/v1/src/utils.ts) is retained (used by the accrual reducer). `shouldResetMetric` and `RESET_HIERARCHY` are **removed** — no longer needed; every metric accrues unconditionally.

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
    debtSliceId: OID!  # pre-allocated by caller (editor / settlement reducer)
}
```

**Reducer behavior:**
1. Guard: `state.status !== "ACTIVE"` → throw `SubscriptionNotActiveAccrueMetricUsageError`.
2. Resolve service via `findServiceById`. Not found → `AccrueMetricUsageServiceNotFoundError`.
3. Resolve metric by id. Not found → `AccrueMetricUsageMetricNotFoundError`.
4. Compute amount:
   - **CUMULATIVE:** `amount = calculateOverageCost(metric)` — i.e., `max(0, currentUsage - freeLimit) * unitCost.amount`, capped at `(paidLimit - freeLimit)`.
   - **NON_CUMULATIVE:** `amount = max(0, currentUsage - freeLimit) * unitCost.amount`, capped the same way. Formula is identical; the semantic difference is only in step 6.
5. If `amount > 0` and `metric.unitCost` exists → append a debt slice (see §6 for shape).
6. Reset rule:
   - `metricType === "CUMULATIVE"` → `metric.currentUsage = 0`
   - `metricType === "NON_CUMULATIVE"` → leave `metric.currentUsage` untouched

**Errors:** `SubscriptionNotActiveAccrueMetricUsageError`, `AccrueMetricUsageServiceNotFoundError`, `AccrueMetricUsageMetricNotFoundError`.

**Example payload:**
```json
{
  "type": "ACCRUE_METRIC_USAGE",
  "input": {
    "serviceId": "svc-invoices-01",
    "metricId": "metric-invoice-count",
    "accrualDate": "2026-05-01T00:00:00Z",
    "debtSliceId": "debt-20260501-invoices"
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
**Purpose:** End a billing cycle. Force-accrue every metric (§5 rules), then add prepayment slice for next period, then flag all unbilled debt slices as billed. Billing cycle is the hard stop — no carryover of mid-flight accruals.

**Input:** unchanged — whatever exists today (`settlementDate: DateTime!`, plus inputs needed to supply pre-allocated debt slice ids — see §9 open question).

**Reducer behavior:**
1. Guard ACTIVE (existing `NoBillingCycleActiveError`).
2. Guard `settlementDate >= currentBillingCycleStart` (existing `SettlementDateBeforeCycleStartError`).
3. **For every metric on every service (flat + grouped):** execute the accrual logic from §4.1 inline (or by dispatching — implementation choice, but semantically equivalent). Uses pro-rata rule from §5 (charge what accrued, no time-extrapolation).
4. If `autoRenew`: append a prepayment debt slice (label `PREPAYMENT`) summing all recurring costs for the next cycle. Advance `currentBillingCycleStart` and `nextBillingDate`.
5. Else: transition status to `EXPIRING` (existing behavior).
6. Flag every debt slice with `billed: false` → `billed: true` (pre-existing slices from in-cycle accruals are now billed; the just-added prepayment slice is also billed).

**Note:** step 3 replaces the current `processMetrics` inline overage calc. `shouldResetMetric` is no longer called — every metric gets accrued on every settlement regardless of its `accrualCycle` enum value. The `accrualCycle` field drives the *scheduled* accrual (editor/cron-triggered); settlement is an *unconditional* force-accrual.

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

## 6. Debt-Slice Write Contract

**⚠ Dependency flag:** this contract assumes the structured-debt workstream ships the ledger primitives (typed debt slices, label enum, billed flag, FIFO payment reducer). This metric spec **cannot land** until those primitives exist. The Developer must confirm ledger readiness before starting.

### 6.1 Shape of the slice written by `ACCRUE_METRIC_USAGE`

The accrual reducer appends a record with roughly this shape to the structured-debt ledger (exact field names to be reconciled with the debt workstream's schema):

```graphql
# Illustrative — authoritative type lives in the structured-debt spec
type DebtSlice {
    id: OID!
    label: DebtLabel!           # enum — see below
    amount: Amount_Money!
    accruedAt: DateTime!
    billed: Boolean!            # false on create; flipped by SETTLE_BILLING_CYCLE
    sourceMetricId: OID         # null for setup/prepayment slices
    sourceServiceId: OID        # null for setup/prepayment slices
    accrualCycleStart: DateTime # null for non-usage slices
    accrualCycleEnd: DateTime   # null for non-usage slices
}

enum DebtLabel {
    SETUP_COST
    PREPAYMENT
    DYNAMIC_USAGE
    # ESTIMATED_USAGE, RECONCILIATION — deferred (see §8)
}
```

### 6.2 What `ACCRUE_METRIC_USAGE` writes

| Field | Value |
|---|---|
| `id` | `action.input.debtSliceId` (caller-allocated; see §9 open question 1) |
| `label` | `DYNAMIC_USAGE` |
| `amount` | As computed in §4.1 step 4 |
| `accruedAt` | `action.input.accrualDate` |
| `billed` | `false` |
| `sourceMetricId` | `action.input.metricId` |
| `sourceServiceId` | `action.input.serviceId` |
| `accrualCycleStart` | Previous `accrualDate` for this metric, or subscription activation date if none |
| `accrualCycleEnd` | `action.input.accrualDate` |

If `amount === 0` (no overage above free limit): **do not write a slice**. The accrual still occurs — metric type rule in §4.1 step 6 still applies — but no ledger entry is created.

### 6.3 What `SETTLE_BILLING_CYCLE` writes

- One debt slice per metric (via the accrual path), as above.
- One debt slice with `label: PREPAYMENT`, `amount: <sum of next-cycle recurring costs>`, `accruedAt: settlementDate`, `billed: true` (immediate — prepayment is billed on creation).
- All existing `billed: false` slices flipped to `billed: true`.

---

## 7. Editor Changes (non-schema — for the Developer)

These are UI-side and do not affect schema. Listed for implementation completeness.

1. **Metric create/edit form:** add a `MetricType` picker (radio or select: Cumulative / Non-cumulative). Replace the "No reset cycle" checkbox/option with this explicit field.
2. **Accrual cycle picker:** now always required; relabel "Reset period" → "Accrual cycle" in all copy.
3. **Metric actions:** rename the "Reset cycle" button → "Accrue now". Icon can stay.
4. **Debt display:** the flat `totalDebt` scalar display needs to be replaced with a slice-list view per the structured-debt spec — cross-reference that workstream's editor changes.
5. **Adjustment flow:** when editing `currentUsage` on a non-cumulative metric, expose an "Adjustment (no charge)" toggle that dispatches `UPDATE_METRIC_USAGE` with `isAdjustment: true`.

Copy change summary: "reset" → "accrual" everywhere; "no reset cycle" → "non-cumulative".

---

## 8. Out of Scope (Deferred)

Explicitly excluded from this spec, to be addressed separately:

- **Service Offering schema changes.** The SO document model must carry `metricType` + `accrualCycle` so they flow through to subscription instances. Needs a separate spec against the `service-offering` model. Without it, the `mapOfferingToSubscription` helper has nothing to copy from.
- **`ESTIMATED_USAGE` + `RECONCILIATION` debt labels.** The utilities-billing scenario (billing cycle shorter than accrual cycle). Deferred.
- **Billing-cycle-shorter-than-accrual-cycle scenarios.** Same deferral.
- **High-watermark metric type.** Explicitly excluded; `MetricType` enum stays closed at two values.
- **Migration of existing subscription instances.** Per decision #5: breaking change, no migration path designed.
- **Structured-debt ledger design.** This spec consumes it, does not design it.

---

## 9. Open Questions / Risks

1. **Debt slice id allocation.** Reducers must be pure — they cannot call `generateId()`. Options:
   - **(a)** Caller pre-allocates `debtSliceId` on the action input for both `ACCRUE_METRIC_USAGE` (trivial — one id) and `SETTLE_BILLING_CYCLE` (harder — needs N ids, one per metric plus one for prepayment). The settlement case requires the caller to know the metric count before dispatching. Feasible but awkward from the editor.
   - **(b)** Deterministic id derivation inside the reducer (e.g., hash of `(subscriptionId, metricId, accrualDate)`). Keeps reducers pure, clean API, but id shape is less conventional.
   - **Recommend (a)** for `ACCRUE_METRIC_USAGE` (single id), **(b)** for `SETTLE_BILLING_CYCLE`'s internal slice generation. Needs confirmation before Developer starts.

2. **Does `calculateOverageCost` still cover non-cumulative correctness?** Per decision #4, a non-cumulative metric charges per-unit-per-cycle regardless of free-limit semantics for seats (you don't typically get "free seats"). Confirm the formula `max(0, currentUsage - freeLimit) * unitCost.amount` is correct for non-cumulative, or whether non-cumulative ignores `freeLimit` entirely. If non-cumulative should charge full `currentUsage * unitCost.amount`, the reducer needs branching in step 4 (§4.1).

3. **Scheduled accrual trigger.** This spec defines `ACCRUE_METRIC_USAGE` as an operation but doesn't specify what *triggers* it on the accrual-cycle boundary between settlements. Options: operator-dispatched (editor button), external cron, processor. Needs alignment with whoever owns the scheduling layer — flag to `apeiron-coordinator`.

4. **`AddServiceMetricInput` / `InitializeMetricInput` required fields.** Making `metricType: MetricType!` and `accrualCycle: AccrualCycle!` non-nullable in inputs means the SO → subscription mapper (`mapOfferingToSubscription`) breaks until the SO spec lands. Sequencing risk — developer must confirm the mapper is either stubbed with defaults (e.g., `NON_CUMULATIVE` / `MONTHLY`) or that the SO spec lands first.

5. **Removing `INCREMENT_METRIC_USAGE` / `DECREMENT_METRIC_USAGE`.** If any external system (Switchboard integrations, scripts) currently dispatches these, removal is a breaking API change beyond the document model itself. Flag to `apeiron-coordinator` to check call sites before deletion.

---

## 10. Handoff Notes for Developer

**Implementation order:**

1. **Confirm structured-debt ledger primitives are available** (or stub them). This is the hard blocker.
2. Resolve open questions 1, 2, and 4 with the user before touching schema.
3. Schema updates via MCP: new enum `MetricType`, rename `ResetPeriod` → `AccrualCycle`, update `ServiceMetric`, update all five affected input types, rename `ResetMetricCycleInput` → `AccrueMetricUsageInput`.
4. Operation ops via MCP: rename `RESET_METRIC_CYCLE` → `ACCRUE_METRIC_USAGE`, delete `INCREMENT_METRIC_USAGE` + `DECREMENT_METRIC_USAGE` (after coordinator check), add new error types.
5. Reducers in `src/reducers/metrics.ts` and `src/reducers/subscription.ts`:
   - Replace `resetMetricCycleOperation` with `accrueMetricUsageOperation` per §4.1.
   - Extend `updateMetricUsageOperation` per §4.2.
   - Rewrite `settleBillingCycleOperation`'s metric handling per §4.3. Delete the `processMetrics` inline block.
   - Delete `incrementMetricUsageOperation` + `decrementMetricUsageOperation` reducers.
6. Utils in `src/utils.ts`:
   - Retain `calculateOverageCost`.
   - Delete `shouldResetMetric` and `RESET_HIERARCHY` — no longer called.
7. Editor updates per §7.
8. `npm run tsc` + `npm run lint:fix` — both must pass.

**Gotchas:**

- The v1 schema file at [`document-models/subscription-instance/v1/schema.graphql`](../../../document-models/subscription-instance/v1/schema.graphql) has `ResetPeriod` referenced in multiple input types (lines 194, 458, 472) — don't miss any.
- Test reducer errors via `operation.error` on the operations array, not `.toThrow()` (per CLAUDE.md).
- `AccrueMetricUsageInput.debtSliceId` must come from action input, not generated in the reducer (determinism rule).
- The `settleBillingCycleOperation` currently mutates `state.totalDebt` directly in two places (metric overage + recurring). Both go away; all debt now flows through the ledger.

**After Developer is done → `apeiron-reviewer` runs the delivery checklist.**
