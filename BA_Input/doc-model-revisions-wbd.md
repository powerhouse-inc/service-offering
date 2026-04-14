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

### SC-1. New types

```graphql
enum LedgerEntryType {
    SETUP_CHARGE
    RECURRING_CHARGE
    OVERAGE_CHARGE
    PRORATION_DEBIT
    PRORATION_CREDIT
    PAYMENT
}

enum LedgerDirection {
    DEBIT
    CREDIT
}

type LedgerEntry {
    id: OID!
    type: LedgerEntryType!
    direction: LedgerDirection!
    amount: Amount_Money!
    currency: Currency!
    date: DateTime!
    billingCycleStart: DateTime      # which cycle this entry belongs to
    serviceId: OID                   # optional: which service
    serviceGroupId: OID              # optional: which group
    metricId: OID                    # optional: which metric (overage)
    description: String
}
```

*Pending BA: entry types and fields may change based on OQ-6, OQ-7, OQ-8*

### SC-2. New fields on SubscriptionInstanceState

| Field | Type | Purpose |
|-------|------|---------|
| `currentBillingCycleStart` | `DateTime` | Explicit cycle start (currently implied) |
| `totalDebt` | `Amount_Money` | Sum of all debit ledger entries |
| `totalCredit` | `Amount_Money` | Sum of all credit ledger entries |
| `ledgerEntries` | `[LedgerEntry!]!` | Explicit financial event log |

*Pending BA: decide fate of `projectedBillAmount` / `projectedBillCurrency` — keep, rename to `unsettledAmount`, or remove in favor of ledger-derived calculation*

### SC-3. New operation

| Operation | Module | Input |
|-----------|--------|-------|
| `SETTLE_BILLING_CYCLE` | `subscription` | `{ settlementDate: DateTime! }` |

*Pending BA: input may grow based on OQ-1, OQ-2 decisions*

### SC-4. Updated operation inputs

| Operation | Field to add | Purpose |
|-----------|-------------|---------|
| `AddServiceInput` | `effectiveDate: DateTime` | Proration anchor |
| `RemoveServiceInput` | `effectiveDate: DateTime` | Proration anchor |
| `AddServiceToGroupInput` | `effectiveDate: DateTime` | Proration anchor |
| `RemoveServiceFromGroupInput` | `effectiveDate: DateTime` | Proration anchor |
| `AddServiceGroupInput` | `effectiveDate: DateTime` | Proration anchor |
| `RemoveServiceGroupInput` | `effectiveDate: DateTime` | Proration anchor |
| `ReportSetupPaymentInput` | `amount: Amount_Money!, currency: Currency!` | Currently only has `paymentDate` — needs amount for ledger |
| `ReportRecurringPaymentInput` | `amount: Amount_Money!, currency: Currency!` | Same |

### SC-5. Error types for new operation

| Error | Operation | Condition |
|-------|-----------|-----------|
| `NoBillingCycleActiveError` | `SETTLE_BILLING_CYCLE` | Status is not `ACTIVE` |
| `SettlementDateBeforeCycleStartError` | `SETTLE_BILLING_CYCLE` | `settlementDate` < `currentBillingCycleStart` |
| `SubscriptionNotActiveError` | `ADD_SERVICE` (mid-cycle) | Can't add service to non-active subscription |

---

## Track 3: Platform Rules (Reducers + Utils)

Implementation of business logic. **Blocked on Track 1 + Track 2 completion.**

### PR-1. Calculation Utils

**Location**: `document-models/subscription-instance/v1/src/utils.ts`

Pure functions, no state mutation. Called by reducers, editors, and subgraph resolvers.

| Function | Purpose |
|----------|---------|
| `calculateProratedCost(amount, cycleStart, cycleEnd, effectiveDate)` | Core proration formula: `(remainingDays / totalCycleDays) × amount` |
| `calculateOverageCost(metric)` | Per-metric: `max(0, currentUsage - freeLimit) × unitCost`, capped at paidLimit |
| `calculateTotalOverage(services)` | Sum overage across all metrics in all services |
| `calculateUnsettledBill(state, asOfDate)` | What is owed right now without settling — reads ledger + projects overage |
| `calculateAmountOwed(state)` | `totalDebt - totalCredit` |
| `calculateNextBillingDate(fromDate, billingCycle)` | Adds cycle duration to a date |
| `shouldResetMetric(metric, settlementDate)` | Whether a metric's reset period aligns with settlement |

### PR-2. Updated Reducers

| Reducer | Changes |
|---------|---------|
| **`activateSubscription`** | Initialize `currentBillingCycleStart`, calculate `nextBillingDate`, create `SETUP_CHARGE` + `RECURRING_CHARGE` ledger entries, set `totalDebt` |
| **`addService`** | If subscription is `ACTIVE` + has `effectiveDate`: call proration util, create `PRORATION_DEBIT` ledger entry, update `totalDebt` |
| **`removeService`** | If subscription is `ACTIVE` + has `effectiveDate`: call proration util, create `PRORATION_CREDIT` ledger entry, update `totalCredit` |
| **`addServiceToGroup`** | Same proration logic as `addService` |
| **`removeServiceFromGroup`** | Same proration logic as `removeService` |
| **`addServiceGroup`** | Same proration logic at group level |
| **`removeServiceGroup`** | Same proration logic at group level |
| **`reportSetupPayment`** | Create `PAYMENT` ledger entry, update `totalCredit` |
| **`reportRecurringPayment`** | Create `PAYMENT` ledger entry, update `totalCredit` |

### PR-3. New Reducer

| Reducer | Logic |
|---------|-------|
| **`settleBillingCycle`** | 1. Calculate + record overage per metric → `OVERAGE_CHARGE` entries. 2. Reset applicable metrics. 3. If `autoRenew`: create `RECURRING_CHARGE` entries for next cycle, advance dates. 4. If not: set status `EXPIRING`. 5. Update `totalDebt` / `totalCredit`. |

### PR-4. Editor Refactor

| File | Change |
|------|--------|
| `editors/subscription-instance-editor/components/billing-utils.ts` | Refactor to import and delegate to `document-models/subscription-instance/v1/src/utils.ts` instead of computing independently |

---

## Track Dependencies

```
Track 1 (BA)
  ├─ BA-1 Billing Cycle Lifecycle Rules
  ├─ BA-2 Ledger Entry Model
  ├─ BA-3 Proration Rules
  ├─ BA-4 Settlement Mechanics
  └─ BA-5 Activation Billing Rules
       │
       ▼
Track 2 (Schema)  ← blocked on Track 1
  ├─ SC-1 New types (LedgerEntry, enums)
  ├─ SC-2 New state fields
  ├─ SC-3 New operation (SETTLE_BILLING_CYCLE)
  ├─ SC-4 Updated operation inputs
  └─ SC-5 Error types
       │
       ▼
Track 3 (Reducers + Utils)  ← blocked on Track 1 + Track 2
  ├─ PR-1 Calculation utils
  ├─ PR-2 Updated reducers (activation, add/remove service, payments)
  ├─ PR-3 New reducer (settleBillingCycle)
  └─ PR-4 Editor refactor
```

---

## BA Artifacts Summary

| Artifact | Type | Layout | Content |
|----------|------|--------|---------|
| `subscription-billing-lifecycle-v1.0-requirements.md` | Requirements doc | — | Full requirements with acceptance criteria |
| Billing Cycle Lifecycle Process Flow | Obsidian Canvas | Freeform (left-to-right) | Activation → cycle → settlement → renewal/expiry with decision points |
| Subscription Billing State Machine | Obsidian Canvas | Freeform (state diagram) | PENDING→ACTIVE→PAUSED/EXPIRING→CANCELLED with billing side-effects |
| Proration Decision Tree | Obsidian Canvas | MindMap | Mid-cycle change types → formulas → ledger impact |
| Debt/Credit Ledger Flow | Obsidian Canvas | Freeform (timeline) | Sample lifecycle showing events → ledger entries → running balance |

---

## Resource Instance (Separate Track — Subgraph/Resolver)

Not a schema change. Separate from the billing work.

| Item | Detail | Dependency |
|------|--------|------------|
| Team drive generation | `createProductInstances` mutation creates team drive, not operator drive | Liberuum support session |
| Activation coordination | Resource instance activation triggers subscription instance activation | Liberuum support session |

---

## Models With No Changes Identified

- **Service Offering** — no schema revisions (proration/downgrade rules are platform-level, not per-offering config)
- **Resource Template** — no revisions
- **Facet** — no revisions
