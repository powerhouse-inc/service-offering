# Document Model Revisions — Work Breakdown

**Source**: Platform Sprint Planning — 2026-04-09
**Author**: Apeiron (synthesized from meeting transcript)
**Status**: Draft
**Last updated**: 2026-04-14

---

## Overview

The April 9 sprint planning meeting identified significant gaps in the **Subscription Instance** document model related to billing lifecycle mechanics. These gaps block both MVP polish (correct date calculations, cost projections) and post-MVP functionality (billing cycle settlement, debt/credit tracking, Stripe integration).

A secondary issue was flagged on the **Resource Instance** subgraph resolver (team drive generation). No changes were identified for Service Offering, Resource Template, or Facet models.

---

## 1. Subscription Instance (PRIMARY — High Complexity)

### 1A. Missing State: Debt & Credit Tracking

**Meeting reference**: Wouter @ 01:03:17

> "You keep track of two additional state properties: total debt and total credit. The amount that is owed is always the difference between the total debt minus the total credit."

**Current state**: `SubscriptionInstanceState` has `projectedBillAmount` and `projectedBillCurrency` but no debt/credit ledger.

#### Schema changes

| Field | Type | Description |
|-------|------|-------------|
| `totalDebt` | `Amount_Money` | Cumulative charges accrued across all billing cycles |
| `totalCredit` | `Amount_Money` | Cumulative payments received |
| `currentBillingCycleStart` | `DateTime` | Explicit start of the current billing cycle (currently implied but not stored) |

#### Clarification needed

- Rename or redefine `projectedBillAmount` — Wouter noted this is really the "unsettled bill" (stacked-up cost so far), not a forward projection. Decide whether to rename the field or keep it alongside the new debt/credit fields.

---

### 1B. Missing Operation: Settle / Advance Billing Cycle

**Meeting reference**: Wouter + Apeiron @ 00:36:20

> "It's missing the settle... advanced billing cycle operation."

**Current operations**: `setAutoRenew`, `setRenewalDate`, `updateBillingProjection` — none of these close a cycle.

#### New operation: `SETTLE_BILLING_CYCLE`

**Module**: `subscription`

**Input schema** (preliminary):

```graphql
input SettleBillingCycleInput {
  id: OID!
  settlementDate: DateTime!
}
```

**Reducer logic** (requires BA validation):

1. Calculate overage costs for all metrics: `usage - freeLimit` (capped at `paidLimit`), multiplied by `unitCost`
2. Add overage costs to `totalDebt`
3. Reset metrics whose `usageResetPeriod` aligns with the billing cycle
4. If `autoRenew` is true:
   - Add next cycle's fixed recurring costs to `totalDebt`
   - Advance `currentBillingCycleStart` to current `nextBillingDate`
   - Advance `nextBillingDate` by one billing cycle period
5. If `autoRenew` is false:
   - Transition `status` to `EXPIRING`

#### Open questions

- Should settlement be allowed at arbitrary dates (premature close, late close), or only on `nextBillingDate`? Wouter suggested yes — "there will be situations where you want to close the billing cycle prematurely" (00:40:05).
- How to handle settlement when `settlementDate` differs from `nextBillingDate` — prorate the fixed costs?

---

### 1C. Proration Logic for Mid-Cycle Changes

**Meeting reference**: Wouter @ 00:44:40

> "Complex prorata mechanism required for when a user adds or removes services within an ongoing billing cycle."

**Current state**: `addService` and `removeService` operations exist but perform no cost adjustment.

#### Reducer changes

| Operation | Change |
|-----------|--------|
| `addService` / `addServiceToGroup` | On add: calculate prorated cost for remaining days in cycle, add to `totalDebt` |
| `removeService` / `removeServiceFromGroup` | On remove: calculate prorated credit for remaining days, add to `totalCredit` |

#### Potential input schema changes

Service add/remove operations may need an `effectiveDate: DateTime` input field to serve as the proration anchor.

#### Proration formula (pending BA)

```
proratedCost = (remainingDays / totalCycleDays) * fullCycleCost
```

Where:
- `remainingDays` = `nextBillingDate` - `effectiveDate`
- `totalCycleDays` = `nextBillingDate` - `currentBillingCycleStart`

#### Example (from Wouter, 00:46:09)

> Monthly cycle, 30 days. 10 days in, user adds a third seat. User pays 2/3 of the seat cost for the 20 remaining days. If user removes a seat, the prorated cost is deducted as credit.

---

### 1D. Payment Reporting — Debt/Credit Integration

**Meeting reference**: Wouter @ 01:04:27

> "If the payment comes in you update the credit and that's how you get to a balance of zero."

**Current operations**: `reportSetupPayment` and `reportRecurringPayment` exist but don't update a debt/credit ledger.

#### Reducer changes

| Operation | Change |
|-----------|--------|
| `reportSetupPayment` | Add payment amount to `totalCredit` |
| `reportRecurringPayment` | Add payment amount to `totalCredit` |
| `activateSubscription` | Add setup cost + first cycle fixed costs to `totalDebt` (see 1F) |

---

### 1E. Billing Calculation Utils (Pure Query Functions)

**Meeting reference**: Wouter @ 00:38:26, 01:01:07

> "A query function where you calculate what the current billing cycle result is when it settles."
>
> "For values that change constantly, like a current timestamp, you need a pure query function utility."

**Current state**: `billing-utils.ts` exists in the editor (`editors/subscription-instance-editor/components/`) with `computeBillingBreakdown()` and `computeMetricOverage()`. This logic lives in the wrong layer — it should be in the document model.

#### Changes

| Location | Action |
|----------|--------|
| `document-models/subscription-instance/v1/src/utils.ts` | Create pure utility functions that operate on document state |
| `editors/subscription-instance-editor/components/billing-utils.ts` | Refactor to delegate to document model utils |

#### Required utility functions

- `calculateUnsettledBill(state, asOfDate)` — what is owed right now without settling
- `calculateOverageCosts(metrics, cycleStart, asOfDate)` — overage across all metrics
- `calculateProratedCost(amount, cycleStart, cycleEnd, effectiveDate)` — proration for mid-cycle changes
- `calculateAmountOwed(state)` — `totalDebt - totalCredit`

---

### 1F. Activation Reducer Enhancement

**Meeting reference**: Wouter @ 00:42:57

> "At that moment you owe the fixed costs and the setup cost."

**Current state**: `activateSubscription` transitions status to `ACTIVE` and sets `activatedSince`, but does not initialize billing state.

#### Reducer changes

On activation, the reducer must:

1. Set `currentBillingCycleStart` to the activation date
2. Calculate `nextBillingDate` = activation date + billing cycle duration
3. Add to `totalDebt`:
   - All setup costs (one-time)
   - First cycle's fixed recurring costs (prepaid)
4. Initialize `totalCredit` to zero (or leave as-is if already initialized)

#### Cost accrual rules (from meeting discussion)

| Cost type | When owed | Payment timing |
|-----------|-----------|----------------|
| Setup cost | On activation | Immediate (prepaid) |
| Fixed recurring cost | On activation + each renewal | Prepaid at cycle start |
| Overage cost | Accrues during cycle | Charged at cycle end (settlement) |

---

## 2. Resource Instance (SECONDARY — Subgraph/Resolver)

**Meeting reference**: Apeiron @ 01:02:15

> "Currently this is not generating a team drive, it's landing on the operator drive."

This is **not a schema change** — it is a subgraph resolver issue in the `createProductInstances` mutation.

| Item | Detail |
|------|--------|
| Team drive generation | Mutation should create a team drive for the customer, not land documents on the operator drive |
| Activation coordination | Resource instance activation should trigger subscription instance activation (cross-document) |

**Dependency**: Requires a support session with Liberuum to understand contributor billing setup and drive topology.

---

## 3. Models With No Changes Identified

- **Service Offering** — no revisions discussed
- **Resource Template** — no revisions discussed
- **Facet** — no revisions discussed

---

## Priority & Sequencing

| Priority | Item | Description | Prerequisite | Owner |
|----------|------|-------------|-------------|-------|
| **P0 — MVP** | 1F (partial) | Fix `nextBillingDate` calculation on activation | None | Apeiron |
| **P0 — MVP** | Editor bug | Fix dynamic cost projection not updating | None | Apeiron |
| **P1 — Post-MVP** | BA | Business analysis defining proration, debt/credit, settlement rules | None | Apeiron |
| **P1 — Post-MVP** | 1A | Add debt/credit state properties to schema | BA complete | Apeiron + Liberuum |
| **P1 — Post-MVP** | 1B | New `SETTLE_BILLING_CYCLE` operation + reducer | 1A | Apeiron + Liberuum |
| **P1 — Post-MVP** | 1E | Billing calculation utils in document model | 1A | Apeiron |
| **P1 — Post-MVP** | 1D | Update payment reducers for ledger integration | 1A | Apeiron |
| **P2 — Post-MVP** | 1C | Proration logic for mid-cycle service changes | 1A, 1E | Apeiron |
| **P2 — Post-MVP** | 2 | Team drive generation fix (subgraph) | Liberuum support session | Apeiron + Liberuum |

---

## Gating Prerequisite

> "You can't vibe code the actual business logic — it has to be exactly right."
> — Wouter @ 01:02:15

All P1 work is gated on a completed **business analysis** that precisely defines:

1. What happens on activation (initial debt calculation)
2. What happens on settlement (overage calculation, metric resets, renewal debt)
3. Proration rules for mid-cycle service add/remove
4. Metric reset cycles vs. billing cycles (independent per metric)
5. Edge cases: premature settlement, late settlement, cancellation mid-cycle

The BA should be reviewed and approved before any reducer implementation begins.

---

## Post-MVP Horizon (Not In Scope Here)

The meeting also discussed future work that depends on these revisions but is out of scope for this WBD:

- **Stripe Connect integration** — SaaS-mode credit card charging (P3, after settlement logic works)
- **Marketplace payments** — third-party provider payouts via Stripe Connect (P4)
- **Login integration** — client library + signing for mutations (deprioritized below billing)
