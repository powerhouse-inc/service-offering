# Document Model Revisions — Work Breakdown

**Source**: Platform Sprint Planning — 2026-04-09
**Author**: Apeiron (synthesized from meeting transcript + BA session 2026-04-14)
**Status**: Draft v2
**Last updated**: 2026-04-14

---

## Overview

The April 9 sprint planning meeting identified significant gaps in the **Subscription Instance** document model related to billing lifecycle mechanics. This WBD separates the work into three tracks:

1. **BA Work** — Business analysis artifacts that define rules precisely before any code is written
2. **Schema Changes** — Structural changes to the document model GraphQL schema
3. **Platform Rules** — Reducer logic and calculation utils that implement the defined rules

All implementation work (tracks 2 & 3) is **gated on BA completion** (track 1).

> "You can't vibe code the actual business logic — it has to be exactly right."
> — Wouter @ 01:02:15

---

## Track 1: BA Work (Analysis — No Code)

This track produces the requirements document and visual artifacts that the Architect and Developer need. Output goes to `docs/prds/subscription-billing-lifecycle-v1.0-requirements.md`.

### BA-1. Billing Cycle Lifecycle Rules

Define the exact sequence of events and state transitions for a billing cycle from start to finish.

**Must define**:
- What happens on activation (initial debt creation)
- What happens during a cycle (usage accrual, mid-cycle changes)
- What happens at settlement (overage calc, metric resets, renewal or expiry)
- What happens on cancellation (freeze usage, no renewal)

**Platform rules established by Wouter** (not open questions):

| Rule | Source | Detail |
|------|--------|--------|
| On activation, customer owes setup cost + first cycle fixed costs | 00:42:57 | Prepaid model — you pay at cycle start |
| Overage is charged at end of billing cycle | 00:43:57 | Post-pay for variable usage only |
| Mid-cycle add = immediate prorated debit | 00:46:09 | `(remainingDays / totalCycleDays) * cost` |
| Mid-cycle remove = prorated credit at settlement | 00:46:09 | *"the prorata cost is deducted, it's like putting credit"* |
| Cancellation = no renewal, freeze usage | 00:47:38 | *"from the moment you cancel there can't be any additional usage"* |
| Metric resets are per-metric, independent of billing cycle | 00:55:28 | `usageResetPeriod` already exists per metric |
| Premature/late settlement should be allowed | 00:40:05 | Arbitrary settlement dates, not just on `nextBillingDate` |

**Open questions the BA must resolve**:

| # | Question | Context |
|---|----------|---------|
| OQ-1 | When settlement date differs from `nextBillingDate`, how are fixed costs prorated? | Wouter said premature close is needed but didn't define the formula |
| OQ-2 | On premature settlement + renewal: does the new cycle start from `settlementDate` or from original `nextBillingDate`? | Affects all future cycle dates |
| OQ-3 | What happens to mid-cycle change records when a cycle settles? Archive, clear, or keep? | Impacts ledger growth |
| OQ-4 | When a paused subscription resumes, does it continue the existing cycle or start a new one? | Status transition gap |
| OQ-5 | Can services be added/removed while paused? | Determines if proration applies to paused state |

**Artifact**: Obsidian Canvas — **Billing Cycle Lifecycle Process Flow** (freeform, left-to-right)

---

### BA-2. Ledger Entry Model

Define the structure and semantics of the explicit ledger that tracks all financial events on a subscription.

**Must define**:
- What types of ledger entries exist
- What data each entry carries
- How entries relate to billing cycles, services, and metrics
- How `totalDebt` and `totalCredit` are derived (sum of entry amounts by direction)

**Preliminary entry types** (BA must validate and finalize):

| Entry Type | Direction | Trigger | Example |
|------------|-----------|---------|---------|
| `SETUP_CHARGE` | Debit | Activation | One-time setup cost per service |
| `RECURRING_CHARGE` | Debit | Activation + each renewal | Fixed cycle cost, prepaid |
| `OVERAGE_CHARGE` | Debit | Settlement | Usage above free limit × unit cost |
| `PRORATION_DEBIT` | Debit | Mid-cycle service add | Prorated cost for remaining days |
| `PRORATION_CREDIT` | Credit | Mid-cycle service remove | Prorated refund for remaining days |
| `PAYMENT` | Credit | Payment reported | External payment received |

**Open questions**:

| # | Question |
|---|----------|
| OQ-6 | Should the ledger be append-only (entries never modified/deleted) or can entries be voided/reversed? |
| OQ-7 | Do we need a `CYCLE_SUMMARY` entry type that captures the settlement snapshot? |
| OQ-8 | How do we handle currency — is the ledger single-currency (globalCurrency) or per-entry? |

**Artifact**: Obsidian Canvas — **Debt/Credit Ledger Flow** (freeform, timeline showing a sample lifecycle)

---

### BA-3. Proration Rules

Define the exact formulas and edge cases for mid-cycle service changes.

**Must define**:
- Proration formula (per-day granularity, confirmed by Wouter's example)
- What costs are prorated (recurring only? setup too?)
- How proration interacts with discounts (prorate the discounted amount or the original?)
- Edge cases: service added and removed in same cycle, service added on last day, service added on first day

**Real-world validation** (verified from primary sources):

| Platform | Formula | Charge timing | Downgrade | Source verified? |
|----------|---------|---------------|-----------|-----------------|
| Zoom | Prorated to remaining days | Immediate | No credit, takes effect at renewal | Yes — Zoom support docs |
| Slack | `(cost / days_in_period) × remaining_days` | Deferred to next month | Prorated credit, non-refundable | Yes — Slack help center |
| Stripe | Prorated to the second, configurable | Default: deferred; configurable to immediate | Credit on next invoice | Yes — Stripe developer docs |
| Dropbox | Prorated to remaining days | Claimed immediate | No mid-cycle removal credit | Unverified (JS-heavy page) |

**Our model** (per Wouter):
- Add = immediate prorated debit (closest to Zoom)
- Remove = prorated credit applied at settlement (closest to Slack)
- Formula = `(remainingDays / totalCycleDays) × fullCycleCost` (per-day, same as Slack)

**Artifact**: Obsidian Canvas — **Proration Decision Tree** (mindmap)

---

### BA-4. Settlement Mechanics

Define exactly what the `SETTLE_BILLING_CYCLE` operation does step by step.

**Must define** (ordered sequence):
1. Calculate overage for each metric: `max(0, currentUsage - freeLimit)` capped at `paidLimit`, × `unitCost`
2. Create `OVERAGE_CHARGE` ledger entries
3. Reset metrics whose `usageResetPeriod` aligns with the billing cycle
4. If `autoRenew` is true:
   - Create `RECURRING_CHARGE` ledger entries for next cycle
   - Advance `currentBillingCycleStart` and `nextBillingDate`
5. If `autoRenew` is false:
   - Transition status to `EXPIRING`
6. Update `totalDebt` / `totalCredit` from ledger

**Open questions**:

| # | Question |
|---|----------|
| OQ-9 | What if `totalDebt - totalCredit` is negative at settlement (customer overpaid)? Carry forward or refund? |
| OQ-10 | Should settlement fail/warn if there's unsettled debt from previous cycles? |

**Artifact**: Obsidian Canvas — **Subscription Billing State Machine** (freeform, state diagram with billing side-effects on each transition)

---

### BA-5. Activation Billing Rules

Define what happens financially when a subscription transitions from `PENDING` to `ACTIVE`.

**Must define**:
- Which costs create initial debt (setup + first cycle recurring)
- How `nextBillingDate` is calculated from activation date + `selectedBillingCycle`
- Whether activation creates ledger entries or just sets counters
- Interaction with resource instance activation (cross-document coordination)

**Not an open question** — Wouter defined this clearly:
> "At that moment you owe the fixed costs and the setup cost." (00:42:57)
> "You pay in advance." (00:42:57)

---

## Track 2: Schema Changes (Subscription Instance)

All changes below are to `document-models/subscription-instance/v1/schema.graphql`. **Blocked on Track 1 completion.**

Cross-reference: every change below maps to a decision in [billing-lifecycle-business-logic.md](billing-lifecycle-business-logic.md).

### SC-1. New state fields on SubscriptionInstanceState

No new types needed (D-3 revised: no ledger on state).

| Field | Type | Purpose | Decision |
|-------|------|---------|----------|
| `currentBillingCycleStart` | `DateTime` | Explicit start of current billing cycle (currently implied) | D-4 |
| `totalDebt` | `Amount_Money` | Running sum of all charges, in `globalCurrency` | D-3, D-7 |
| `totalCredit` | `Amount_Money` | Running sum of all payments/credits, in `globalCurrency` | D-3, D-7 |

**Fate of existing fields**:
- `projectedBillAmount` / `projectedBillCurrency` — **remove**. These are now derived values: `totalDebt - totalCredit` via `calculateAmountOwed()` util. Keeping them creates dual sources of truth.
- `nextBillingDate` — **keep**. Still needed as the cycle end boundary.
- `renewalDate` — **keep**. Used by `setRenewalDate` operation.

### SC-2. New operation

| Operation | Module | Input | Decision |
|-----------|--------|-------|----------|
| `SETTLE_BILLING_CYCLE` | `subscription` | `{ settlementDate: DateTime! }` | D-4 |

### SC-3. Updated operation inputs

| Operation | Field to add | Purpose | Decision |
|-----------|-------------|---------|----------|
| `AddServiceInput` | `effectiveDate: DateTime` | Proration anchor for mid-cycle add | D-1 |
| `RemoveServiceInput` | `effectiveDate: DateTime` | Proration anchor for mid-cycle remove | D-2 |
| `AddServiceToGroupInput` | `effectiveDate: DateTime` | Proration anchor for mid-cycle add within group | D-1 |
| `RemoveServiceFromGroupInput` | `effectiveDate: DateTime` | Proration anchor for mid-cycle remove within group | D-2 |
| `ReportSetupPaymentInput` | `amount: Amount_Money!, currency: Currency!` | Currently only has `paymentDate` — needs amount for counter update | D-3 |
| `ReportRecurringPaymentInput` | `amount: Amount_Money!, currency: Currency!` | Same | D-3 |

**Not updated** (per D-6):
- `AddServiceGroupInput` — no `effectiveDate` needed because `addServiceGroup` is blocked on ACTIVE subscriptions. Only allowed in PENDING (setup phase, no proration).
- `RemoveServiceGroupInput` — same reasoning.

### SC-4. Error types

| Error | Operations | Condition | Decision |
|-------|-----------|-----------|----------|
| `NoBillingCycleActiveError` | `SETTLE_BILLING_CYCLE` | Status is not `ACTIVE` | D-4, D-6 |
| `SettlementDateBeforeCycleStartError` | `SETTLE_BILLING_CYCLE` | `settlementDate` < `currentBillingCycleStart` | D-4 |
| `SubscriptionNotActiveError` | `ADD_SERVICE`, `REMOVE_SERVICE`, `ADD_SERVICE_TO_GROUP`, `REMOVE_SERVICE_FROM_GROUP`, `UPDATE_METRIC_USAGE`, `INCREMENT_METRIC_USAGE`, `DECREMENT_METRIC_USAGE` | Operation requires ACTIVE status but subscription is PAUSED, EXPIRING, or CANCELLED | D-6 |
| `SubscriptionPausedError` | `ADD_SERVICE`, `REMOVE_SERVICE`, `ADD_SERVICE_TO_GROUP`, `REMOVE_SERVICE_FROM_GROUP` | Subscription is PAUSED — must resume first | D-5, D-6 |
| `StructuralChangeNotAllowedError` | `ADD_SERVICE_GROUP`, `REMOVE_SERVICE_GROUP` | Subscription is ACTIVE — structural changes only allowed in PENDING | D-6 |
| `SubscriptionCancelledError` | Service/metric operations | Subscription is CANCELLED — only payment reporting allowed | D-6 |

### SC-5. Summary of schema delta

```graphql
# --- NEW FIELDS on SubscriptionInstanceState ---
# (add after existing fields)
currentBillingCycleStart: DateTime
totalDebt: Amount_Money
totalCredit: Amount_Money

# --- REMOVED FIELDS from SubscriptionInstanceState ---
# projectedBillAmount: Amount_Money    ← removed, now derived
# projectedBillCurrency: Currency      ← removed, now derived

# --- NEW OPERATION INPUT ---
input SettleBillingCycleInput {
    settlementDate: DateTime!
}

# --- UPDATED INPUTS (new optional field) ---
# AddServiceInput: + effectiveDate: DateTime
# RemoveServiceInput: + effectiveDate: DateTime
# AddServiceToGroupInput: + effectiveDate: DateTime
# RemoveServiceFromGroupInput: + effectiveDate: DateTime
# ReportSetupPaymentInput: + amount: Amount_Money!, currency: Currency!
# ReportRecurringPaymentInput: + amount: Amount_Money!, currency: Currency!
```

---

## Track 3: Platform Rules (Reducers + Utils)

Implementation of business logic. **Blocked on Track 1 + Track 2 completion.**

### PR-1. Calculation Utils

**Location**: `document-models/subscription-instance/v1/src/utils.ts`

Pure functions, no state mutation. Called by reducers, editors, and subgraph resolvers.

| Function | Purpose | Decision |
|----------|---------|----------|
| `calculateProratedCost(amount, cycleStart, cycleEnd, effectiveDate)` | Core proration formula: `(remainingDays / totalCycleDays) * amount` | D-1, D-2 |
| `calculateOverageCost(metric, cycleStart, endDate)` | Per-metric: `max(0, currentUsage - freeLimit) * unitCost`, capped at paidLimit. `endDate` = `min(settlementDate, nextBillingDate)` | D-4 |
| `calculateTotalOverage(services, cycleStart, endDate)` | Sum overage across all metrics in all services | D-4 |
| `calculateUnsettledBill(state, asOfDate)` | What is owed right now without settling — projects overage from current usage | D-3 |
| `calculateAmountOwed(state)` | `totalDebt - totalCredit`. Can be negative (credit surplus, per D-7). No floor. | D-3, D-7 |
| `calculateNextBillingDate(fromDate, billingCycle)` | Adds cycle duration to a date | D-4 |
| `shouldResetMetric(metric, settlementDate)` | Whether a metric's `usageResetPeriod` aligns with settlement | BA-4 |
| `summarizeCycle(operations, cycleStart, cycleEnd)` | Derives cycle breakdown from Reactor operation history (filters by type and date range) | D-3 |

### PR-2. Status Guards (all reducers)

**Per D-6**: Every reducer gets a status check as its first line. See the full operation status matrix in [billing-lifecycle-business-logic.md](billing-lifecycle-business-logic.md) D-6.

| Status | Allowed operations (summary) |
|--------|------------------------------|
| **PENDING** | All config (services, groups, metrics setup). No billing impact. No settlement, no usage tracking. |
| **ACTIVE** | Service add/remove within groups (+ proration), metric usage, settlement, payments, pause, cancel |
| **PAUSED** | Payments, cancel, setAutoRenew, resume only. All service/metric ops blocked. (D-5, D-6) |
| **EXPIRING** | Payments, cancel, setAutoRenew. No service/metric changes. |
| **CANCELLED** | Payment reporting only (to settle outstanding debt). |

Structural changes (`addServiceGroup`, `removeServiceGroup`) — **PENDING only** (D-6).

### PR-3. Updated Reducers

| Reducer | Changes | Decision |
|---------|---------|----------|
| **`activateSubscription`** | Set `currentBillingCycleStart` = activation date. Calculate `nextBillingDate`. Add setup costs + first cycle recurring costs to `totalDebt`. Initialize `totalCredit` = 0. | D-4, BA-5 |
| **`addService`** | Add status guard (PENDING or ACTIVE only). If ACTIVE + `effectiveDate`: call `calculateProratedCost()`, add prorated amount to `totalDebt`. | D-1, D-6 |
| **`removeService`** | Add status guard (PENDING or ACTIVE only). If ACTIVE + `effectiveDate`: call `calculateProratedCost()`, add prorated amount to `totalCredit`. | D-2, D-6 |
| **`addServiceToGroup`** | Same as `addService` — status guard + proration on ACTIVE. | D-1, D-6 |
| **`removeServiceFromGroup`** | Same as `removeService` — status guard + proration on ACTIVE. | D-2, D-6 |
| **`addServiceGroup`** | Add status guard: **PENDING only**. Throw `StructuralChangeNotAllowedError` if ACTIVE. No proration (not allowed mid-cycle). | D-6 |
| **`removeServiceGroup`** | Same — **PENDING only**. | D-6 |
| **`reportSetupPayment`** | Add payment `amount` to `totalCredit`. (Now takes amount + currency in input, not just paymentDate.) | D-3 |
| **`reportRecurringPayment`** | Add payment `amount` to `totalCredit`. Same input change. | D-3 |
| **`resumeSubscription`** | Status guard (PAUSED only). Transition to ACTIVE. No billing state changes. | D-5 |
| **`cancelSubscription`** | Freeze: no further usage allowed after this. Status → CANCELLED. | D-6 |
| **`updateMetricUsage`** | Add status guard (ACTIVE only). | D-6 |
| **`incrementMetricUsage`** | Add status guard (ACTIVE only). | D-6 |
| **`decrementMetricUsage`** | Add status guard (ACTIVE only). | D-6 |

### PR-4. New Reducer

| Reducer | Logic | Decision |
|---------|-------|----------|
| **`settleBillingCycle`** | 1. Status guard: ACTIVE only. 2. Determine overage window: `endDate = min(settlementDate, nextBillingDate)` (D-4). 3. Calculate overage per metric via `calculateOverageCost()`, add to `totalDebt`. 4. Reset metrics where `shouldResetMetric()` returns true. 5. If `autoRenew`: add next cycle recurring costs to `totalDebt`, advance `currentBillingCycleStart` and `nextBillingDate`. 6. If not `autoRenew`: set status `EXPIRING`. 7. No debt guard — always succeeds (D-8). | D-4, D-7, D-8 |

### PR-5. Editor Refactor

| File | Change |
|------|--------|
| `editors/subscription-instance-editor/components/billing-utils.ts` | Refactor to import and delegate to `document-models/subscription-instance/v1/src/utils.ts` instead of computing independently |

### PR-6. Remove `updateBillingProjection` operation

**Rationale**: `projectedBillAmount` and `projectedBillCurrency` are being removed from state (SC-1). The `UPDATE_BILLING_PROJECTION` operation that sets them is now dead. The projection is a derived value via `calculateUnsettledBill()`.

**Impact**: Remove operation from the `subscription` module. Remove the `updateBillingProjectionOperation` reducer. Remove the `UpdateBillingProjectionInput` input type from schema.

---

## Track Dependencies

```
Track 1 (BA)  ← ALL OPEN QUESTIONS RESOLVED (D-1 through D-8)
  ├─ BA-1 Billing Cycle Lifecycle Rules
  ├─ BA-2 Debt/Credit Counter Model (revised from Ledger)
  ├─ BA-3 Proration Rules
  ├─ BA-4 Settlement Mechanics
  └─ BA-5 Activation Billing Rules
       │
       ▼
Track 2 (Schema)
  ├─ SC-1 New state fields (currentBillingCycleStart, totalDebt, totalCredit)
  │       + Remove projectedBillAmount/projectedBillCurrency
  ├─ SC-2 New operation (SETTLE_BILLING_CYCLE)
  ├─ SC-3 Updated operation inputs (effectiveDate, payment amounts)
  └─ SC-4 Error types (status guards + structural change)
       │
       ▼
Track 3 (Reducers + Utils)
  ├─ PR-1 Calculation utils (8 pure functions)
  ├─ PR-2 Status guards (all reducers, per D-6 matrix)
  ├─ PR-3 Updated reducers (activation, add/remove, payments)
  ├─ PR-4 New reducer (settleBillingCycle)
  ├─ PR-5 Editor refactor (billing-utils delegation)
  └─ PR-6 Remove updateBillingProjection operation
```

---

## BA Artifacts Summary

| Artifact | Type | Format | Content |
|----------|------|--------|---------|
| `subscription-billing-lifecycle-v1.0-requirements.md` | Requirements doc | Markdown | Full requirements with acceptance criteria |
| `billing-lifecycle-business-logic.md` | Decision log | Markdown | D-1 through D-8, all OQs resolved |
| Billing Cycle Lifecycle Process Flow | Diagram | Mermaid + Obsidian Canvas | Activation → cycle → settlement → renewal/expiry with decision points |
| Subscription Billing State Machine | Diagram | Mermaid + Obsidian Canvas | PENDING→ACTIVE→PAUSED/EXPIRING→CANCELLED with billing side-effects per D-6 |
| Proration Decision Tree | Diagram | Mermaid + Obsidian Canvas | Mid-cycle change types → formulas → counter impact |
| Debt/Credit Counter Flow | Diagram | Mermaid + Obsidian Canvas | Sample lifecycle showing events → counter updates → running balance |

---

## Resource Instance (Separate Track — Subgraph/Resolver)

Not a schema change. Separate from the billing work.

| Item | Detail | Dependency |
|------|--------|------------|
| Team drive generation | `createProductInstances` mutation creates team drive, not operator drive | Liberuum support session |
| Activation coordination | Resource instance activation triggers subscription instance activation | Liberuum support session |

---

## Models With No Changes Identified

- **Service Offering** — no schema revisions. Proration/downgrade/charge timing are platform-level rules baked into reducers (D-1, D-2), not per-offering config.
- **Resource Template** — no revisions
- **Facet** — no revisions
