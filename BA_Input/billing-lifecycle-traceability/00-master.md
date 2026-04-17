# Billing Lifecycle — Master Traceability Report

**Source**: Platform Sprint Planning 2026-04-09 + BA Sessions 2026-04-14/16
**Status**: Implementation complete, testing in progress
**Last updated**: 2026-04-16

This document traces every business decision to its implementation: stakeholder source, real-world validation, doc model schema changes, reducer code, utils functions, and editor UI.

---

## D-1: Proration Charge Timing (Mid-Cycle Add)

See full traceability: [02-proration-charge-timing.md](02-proration-charge-timing.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Mid-cycle service group add = immediate prorated debit to totalDebt |
| **Source** | Wouter @ 00:44:40, 00:46:09 — "charge you prorata", "pay 2/3 for 20 remaining days" |
| **Validation** | Zoom: immediate (verified). Stripe: deferred default (verified). Slack: deferred (verified). We chose immediate per Wouter. **Google Workspace** (Mar 2026 invoice): upfront-variable model — 3 seats prepaid at €48.60, reduced to 1 seat mid-cycle on Mar 22. Google applies the same proration formula to the quantity delta within the group (3 seats × 22 days + 1 seat × 9 days = €39.19 actual, €9.41 credit from prepayment). Same math as D-1, but applied to quantity change within a group rather than whole group add. Our implementation currently only supports whole-group add — no `quantity` field or `UPDATE_SERVICE_GROUP_QUANTITY` operation yet. |
| **Reducer** | `addServiceGroupOperation` in [service-group.ts:17-80](document-models/subscription-instance/v1/src/reducers/service-group.ts#L17-L80) — calls `calculateProratedCost()`, adds to `totalDebt` |
| **Utils** | `calculateProratedCost(amount, cycleStart, cycleEnd, effectiveDate)` in [utils.ts:58-68](document-models/subscription-instance/v1/src/utils.ts#L58-L68) — formula: `(remainingDays / totalDays) * amount` |
| **Schema** | `AddServiceGroupInput.recurringAmount` prorated by reducer. No `effectiveDate` on input — reducer uses current time. |
| **Editor** | "+ Add Service Group" button in [ServicesPanel.tsx](editors/subscription-instance-editor/components/ServicesPanel.tsx) — reads available add-ons from service offering, dispatches `addServiceGroup` |
| **Test** | Activate → pay → add group → verify Outstanding Balance increases by prorated amount |

---

## D-2: Downgrade Policy (Mid-Cycle Remove)

See full traceability: [03-downgrade-policy.md](03-downgrade-policy.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Mid-cycle service group remove = prorated credit to totalCredit. Same formula as D-1, reversed direction. |
| **Source** | Wouter @ 00:46:09 — "if I'm removing a seat, the prorata cost is deducted. It's like putting credit." |
| **Validation** | Slack: prorated credit, non-refundable, auto-applied (verified). Zoom: no credit (verified). Stripe: credit on next invoice (verified). We chose Slack model. **Google Workspace** (Mar 2026 invoice): seat reduction from 3 → 1 mid-cycle. Prepaid €48.60, actual usage €39.19, difference (€9.41) carried as credit balance. Same proration-as-credit pattern as D-2, applied to quantity delta rather than whole group removal. |
| **Reducer** | `removeServiceGroupOperation` in [service-group.ts:62-120](document-models/subscription-instance/v1/src/reducers/service-group.ts#L62-L120) — calls `calculateProratedCost()` on group's `recurringCost.amount`, adds to `totalCredit` |
| **Utils** | Same `calculateProratedCost()` — output used as credit instead of debit |
| **Schema** | `RemoveServiceGroupInput { groupId: OID! }` — no pricing input needed, reads from group state |
| **Editor** | "Remove Group" button on optional/add-on groups in [ServicesPanel.tsx](editors/subscription-instance-editor/components/ServicesPanel.tsx) — visible in operator mode when ACTIVE or PENDING |
| **Test** | Add a group mid-cycle → remove it → verify Outstanding Balance decreases by prorated credit |

---

## D-3: Ledger Structure (Counters, Not Arrays)

See full traceability: [05-ledger-structure.md](05-ledger-structure.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Running counters only (totalDebt, totalCredit) on state. No ledger entries array. Audit trail lives in Reactor operation history. |
| **Source** | Wouter @ 00:47:38 — "we need to keep a record somewhere of these changes." + Wouter @ 01:01:07 — "derived values" and "pure query function utility" |
| **Validation** | Powerhouse pattern: no doc model uses unbounded growing arrays. `account-transactions` model exists for financial records. Event sourcing provides audit trail via operation history. Vault note: [[subscription billing state should carry counters not ledger arrays]] |
| **Schema** | Added `totalDebt: Amount_Money`, `totalCredit: Amount_Money` to `SubscriptionInstanceState`. Removed `projectedBillAmount`, `projectedBillCurrency` (now derived). |
| **Reducer** | Every reducer that touches money updates counters directly: activation (+debt), settlement (+debt), proration (+debt or +credit), payment (+credit) |
| **Utils** | `calculateAmountOwed(state)` in [utils.ts:117-122](document-models/subscription-instance/v1/src/utils.ts#L117-L122) — returns `(totalDebt ?? 0) - (totalCredit ?? 0)`, no floor per D-7 |
| **Editor** | Outstanding Balance display in [BillingPanel.tsx](editors/subscription-instance-editor/components/BillingPanel.tsx) — shows `totalDebt - totalCredit` as headline. Raw counters hidden from UI. |
| **Removed** | `UPDATE_BILLING_PROJECTION` operation deleted. `projectedBillAmount`/`projectedBillCurrency` fields removed from state and initialValue. Subgraph resolver dispatch removed from [resolvers.ts](subgraphs/resources-services/resolvers.ts). |

---

## D-4: Settlement Timing (Cycle Boundaries Stay Fixed)

See full traceability: [04-settlement-timing.md](04-settlement-timing.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Settlement triggers billing calculation but does NOT shift cycle boundaries. Both early and late settlement supported. |
| **Source** | Wouter @ 00:40:05 — "there will be situations where you want to just close the billing cycle prematurely... or we've just been lagging and it's like 6 weeks and we want to bill now." |
| **Validation** | Stripe: invoice timing doesn't shift subscription period (verified). Late settlement: overage window up to `nextBillingDate`. Early settlement: overage window up to `settlementDate`. |
| **Schema** | Added `currentBillingCycleStart: DateTime` to state. New operation `SETTLE_BILLING_CYCLE` with input `{ settlementDate: DateTime! }`. |
| **Reducer** | `settleBillingCycleOperation` in [subscription.ts:355-427](document-models/subscription-instance/v1/src/reducers/subscription.ts#L355-L427) |
| **Reducer logic** | 1. Guard: ACTIVE only. 2. Overage window: `min(settlementDate, nextBillingDate)`. 3. Calculate overage per metric → totalDebt. 4. Reset metrics via `shouldResetMetric()`. 5. If autoRenew: add recurring costs, advance dates. 6. If not: status → EXPIRING. |
| **Utils** | `calculateOverageCost(metric)` in [utils.ts:75-88](document-models/subscription-instance/v1/src/utils.ts#L75-L88), `shouldResetMetric(metric, billingCycle)` in [utils.ts:142-151](document-models/subscription-instance/v1/src/utils.ts#L142-L151), `calculateNextBillingDate(fromDate, billingCycle)` in [utils.ts:41-50](document-models/subscription-instance/v1/src/utils.ts#L41-L50) |
| **Errors** | `NoBillingCycleActiveError` (status not ACTIVE), `SettlementDateBeforeCycleStartError` (date before cycle start) |
| **Editor** | "Settle Cycle" button with date picker in [SubscriptionActions.tsx](editors/subscription-instance-editor/components/SubscriptionActions.tsx) — shows current cycle, allows custom date for simulating future settlements |
| **Test** | Activate → add usage → settle with date after cycle start → verify: overage in debt, metrics reset, cycle advanced |

---

## D-5: Pause/Resume (Continue Existing Cycle)

See full traceability: [07-pause-resume.md](07-pause-resume.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Paused subscription resumes into existing cycle. No date extension, no fresh cycle. Paused days lost. |
| **Source** | Consistent with D-4 (cycle boundaries stay fixed). Pausing is operator action (non-payment, maintenance), not customer benefit. |
| **Validation** | Universal — all platforms maintain subscription period on pause. |
| **Reducer** | `resumeSubscriptionOperation` in [subscription.ts:270-277](document-models/subscription-instance/v1/src/reducers/subscription.ts#L270-L277) — transitions PAUSED → ACTIVE, no billing changes |
| **Schema** | No changes — existing `ResumeSubscriptionInput { timestamp: DateTime! }` sufficient |
| **Editor** | "Resume" button in [SubscriptionActions.tsx](editors/subscription-instance-editor/components/SubscriptionActions.tsx) — visible when PAUSED |
| **Test** | Activate → pause → resume → verify cycle boundaries unchanged, totalDebt/totalCredit unchanged |

---

## D-6: Operation Status Matrix (Revised)

See full traceability: [09-operation-status-matrix.md](09-operation-status-matrix.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Every operation gated by subscription status. Service groups (add-ons with pricing) can be added/removed on ACTIVE with proration. Individual services (no pricing) can be added/removed without billing impact. Cost updates PENDING only. |
| **Source** | Wouter @ 00:47:38 — "from the moment you cancel there can't be any additional usage." Apeiron @ 00:49:12 — confirmed no mid-cycle group add at the time. Revised: groups carry pricing, so mid-cycle group changes ARE the proration mechanism. |
| **Reducers with status guards** | |
| — `addServiceGroup` | PENDING or ACTIVE (with proration) — [service-group.ts:17](document-models/subscription-instance/v1/src/reducers/service-group.ts#L17) |
| — `removeServiceGroup` | PENDING or ACTIVE (with credit) — [service-group.ts:62](document-models/subscription-instance/v1/src/reducers/service-group.ts#L62) |
| — `addService`, `addServiceToGroup` | PENDING or ACTIVE (no proration — services don't carry pricing) |
| — `removeService`, `removeServiceFromGroup` | PENDING or ACTIVE (no proration) |
| — `updateMetricUsage`, `incrementMetricUsage`, `decrementMetricUsage` | ACTIVE only |
| — `resetMetricCycle` | ACTIVE only |
| — `settleBillingCycle` | ACTIVE only |
| — `updateServiceSetupCost`, `updateServiceRecurringCost`, `updateServiceGroupCost` | PENDING only |
| — `reportSetupPayment`, `reportRecurringPayment` | All statuses (payments always accepted) |
| **Errors** | `StructuralChangeNotAllowedAddGroupError`, `StructuralChangeNotAllowedRemoveGroupError`, `SubscriptionNotActiveAddServiceError`, `SubscriptionNotActiveRemoveServiceError`, `SubscriptionNotActiveAddToGroupError`, `SubscriptionNotActiveRemoveFromGroupError`, `SubscriptionNotActiveUpdateUsageError`, `SubscriptionNotActiveIncrementUsageError`, `SubscriptionNotActiveDecrementUsageError`, `SubscriptionNotActiveResetMetricCycleError` |
| **Editor** | Controls disabled/hidden based on status. Metric +/- disabled when not ACTIVE. Add/Remove group disabled when PAUSED/EXPIRING/CANCELLED. |

---

## D-7: Negative Balance (Carry Forward)

See full traceability: [06-negative-balance.md](06-negative-balance.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | When totalDebt - totalCredit is negative (customer overpaid), surplus carries forward. No floor, no refund in doc model. |
| **Source** | Wouter @ 01:04:27 — "if the payment comes in you update the credit and that's how you get to a balance of zero." |
| **Validation** | Slack: credits non-refundable, auto-applied to future charges (verified). Stripe: credit balance carries forward (verified). |
| **Utils** | `calculateAmountOwed(state)` returns raw `totalDebt - totalCredit` — can be negative |
| **Editor** | BillingPanel shows "Credit Balance" in green when negative, "Outstanding Balance" in red when positive, "Paid up" when zero |
| **Test** | Overpay → verify "Credit Balance" displayed → add new charge → verify credit offsets it |

---

## D-8: Outstanding Debt at Settlement (No Guard)

See full traceability: [10-outstanding-debt-settlement.md](10-outstanding-debt-settlement.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Settlement always succeeds regardless of outstanding debt. Debt is a derived UI concern, not a reducer gate. |
| **Source** | Powerhouse alignment: reducers have no warning mechanism. Operations succeed or throw — no middle ground. Blocking settlement while debt exists is counterproductive. |
| **Validation** | Powerhouse pattern: no existing reducer returns warnings. `.error` property is binary. |
| **Reducer** | `settleBillingCycleOperation` has no balance check — always proceeds |
| **Editor** | Outstanding Balance display is the operator's signal. No programmatic blocker. |

---

## D-9: Manual Renewal Billing

See full traceability: [08-manual-renewal.md](08-manual-renewal.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | When autoRenew=false, settlement → EXPIRING. Manual renewal via `renewExpiringSubscription` initializes billing for new cycle. Cycle starts from `nextBillingDate` (fixed boundaries per D-4). |
| **Source** | Gap found during spec review — renewal reducer didn't touch billing state, leaving stale cycle boundaries. |
| **Reducer** | `renewExpiringSubscriptionOperation` in [subscription.ts:279-311](document-models/subscription-instance/v1/src/reducers/subscription.ts#L279-L311) — advances `currentBillingCycleStart`, `nextBillingDate`, adds recurring costs to `totalDebt` |
| **Utils** | Same `calculateNextBillingDate()` |
| **Editor** | "Renew" button in [SubscriptionActions.tsx](editors/subscription-instance-editor/components/SubscriptionActions.tsx) — visible when EXPIRING |
| **Test** | Turn off auto-renew → settle → verify EXPIRING → click Renew → verify new cycle starts, recurring costs charged |

---

## Activation Billing (BA-5)

See full traceability: [01-activation-billing.md](01-activation-billing.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | On activation: customer owes setup costs + first cycle recurring costs. Prepaid model. |
| **Source** | Wouter @ 00:42:57 — "at that moment you owe the fixed costs and the setup cost." "You pay in advance." |
| **Validation** | Stripe/Zoom/Dropbox: all charge immediately on activation (universal pattern). |
| **Reducer** | `activateSubscriptionOperation` in [subscription.ts:207-241](document-models/subscription-instance/v1/src/reducers/subscription.ts#L207-L241) — sums all setupCost + recurringCost across groups and services → `totalDebt`. Sets `currentBillingCycleStart`, `nextBillingDate`, `totalCredit = 0`. |
| **Utils** | `calculateNextBillingDate(activatedSince, selectedBillingCycle)` |
| **Editor** | "Activate" button in [SubscriptionActions.tsx](editors/subscription-instance-editor/components/SubscriptionActions.tsx) — visible when PENDING |
| **Test** | Click Activate → verify totalDebt = setup + recurring, cycle boundaries set |

---

## Independent Metric Reset Cycles

See full traceability: [11-metric-reset-cycles.md](11-metric-reset-cycles.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Metrics can have independent reset cycles (e.g., MONTHLY on a QUARTERLY subscription). At reset: overage is calculated and charged, then usage resets to 0. |
| **Source** | Wouter @ 00:55:28 — "reset cycles can be set at the individual metric level, independent of the billing cycle." Service offering defines `resetCycle` per metric, inherited by subscription via `mapOfferingToSubscription()`. |
| **Validation** | AWS: volume tiers reset monthly, storage persists (verified). Slack: seat count persists (verified). |
| **Schema** | New operation `RESET_METRIC_CYCLE` with input `{ serviceId: OID!, metricId: OID!, resetDate: DateTime! }` |
| **Reducer** | `resetMetricCycleOperation` in [metrics.ts:183-219](document-models/subscription-instance/v1/src/reducers/metrics.ts#L183-L219) — ACTIVE only, calculates overage via `calculateOverageCost()`, adds to `totalDebt`, resets `currentUsage = 0` |
| **Utils** | `calculateOverageCost(metric)` in [utils.ts:75-88](document-models/subscription-instance/v1/src/utils.ts#L75-L88) — `max(0, currentUsage - freeLimit) * unitCost.amount`, capped at paidLimit |
| **Editor** | Reset cycle button (rotate icon) on metrics with `usageResetPeriod` in [MetricActions.tsx](editors/subscription-instance-editor/components/MetricActions.tsx) — visible when usage > 0 |
| **Test** | Increment invoices above free limit → click reset → verify overage added to debt, usage reset to 0 |

---

## Payment Reporting

See full traceability: [12-payment-reporting.md](12-payment-reporting.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | Payments reduce `totalCredit`. Can be reported for setup costs (one-time) or recurring costs (per cycle). Accepts service ID or group ID. Overage payments accepted up to `amountOwed`. |
| **Source** | Wouter @ 01:04:27 — "if the payment comes in you update the credit." |
| **Schema** | `ReportSetupPaymentInput { serviceId: OID!, paymentDate: DateTime! }`. Same shape for `ReportRecurringPaymentInput`. `amount` and `currency` removed — payment amount now read from state (setup cost or recurring cost of the matched service/group). New operation `REPORT_OVERAGE_PAYMENT` with input `ReportOveragePaymentInput { paymentDate: DateTime!, amount: Amount_Money! }` — `amount` constrained to `<= amountOwed`. |
| **Reducer** | `reportSetupPaymentOperation` and `reportRecurringPaymentOperation` in [service.ts](document-models/subscription-instance/v1/src/reducers/service.ts) — searches services then groups by ID, reads payment amount from state, marks `paymentDate`/`lastPaymentDate`, adds amount to `totalCredit`. Guards: already-paid, no-cost, already-paid-this-cycle. `reportOveragePaymentOperation` — adds `amount` to `totalCredit` with guards: exceeds-debt (`amount > amountOwed`), invalid-amount (`amount <= 0`). |
| **Editor** | "Mark Paid" on unpaid setup costs, "Report Payment" on recurring costs (with once-per-cycle guard) in [BillingPanel.tsx](editors/subscription-instance-editor/components/BillingPanel.tsx). Uses group ID directly so empty groups work. |
| **Test** | Activate → click Mark Paid on setup → verify totalCredit increases, setup shows "Paid" tag. Click Report Payment on recurring → verify paid-this-cycle guard activates. Report Overage Payment → verify amount <= amountOwed constraint. |

---

## Cross-Document Read (Service Offering → Subscription)

See full traceability: [13-cross-document-read.md](13-cross-document-read.md)

| Layer | Implementation |
|-------|---------------|
| **Rule** | When adding a service group mid-cycle, the available add-ons come from the service offering catalog, not free-form entry. |
| **Source** | Service offering defines option groups with `isAddOn: true` and standalone pricing. Subscription stores `serviceOfferingId` as PHID reference. |
| **Hook** | `useServiceOfferingAddons(serviceOfferingId, existingGroupNames)` in [useServiceOfferingAddons.ts](editors/subscription-instance-editor/hooks/useServiceOfferingAddons.ts) — fetches offering via `useGetDocuments`, filters add-on groups not already in subscription |
| **Editor** | Add Service Group modal shows radio options from the offering with pricing, not a free-form input |
| **Constraint** | Offering must be accessible from the same Reactor. Remote offerings need to be synced as a remote drive first. |
| **Fix** | `mapOfferingToSubscription` now accepts `serviceOfferingDocumentId` (document header UUID) as the preferred identifier over `offering.id` (PHID). This fixes cross-document lookup when the PHID is not yet populated or differs from the document-level identifier. |

---

## Schema Summary

### Fields Added to SubscriptionInstanceState

| Field | Type | Purpose | Decision |
|-------|------|---------|----------|
| `currentBillingCycleStart` | `DateTime` | Explicit cycle start | D-4 |
| `totalDebt` | `Amount_Money` | Running sum of all charges | D-3 |
| `totalCredit` | `Amount_Money` | Running sum of all payments/credits | D-3 |

### Fields Removed from SubscriptionInstanceState

| Field | Reason | Decision |
|-------|--------|----------|
| `projectedBillAmount` | Now derived via `calculateAmountOwed()` | D-3 |
| `projectedBillCurrency` | Now uses `globalCurrency` | D-3 |

### Operations Added

| Operation | Module | Purpose | Decision |
|-----------|--------|---------|----------|
| `SETTLE_BILLING_CYCLE` | subscription | Close billing cycle, calculate overage, advance or expire | D-4 |
| `RESET_METRIC_CYCLE` | metrics | Independent metric reset with overage calculation | Sprint planning 00:55:28 |
| `REPORT_OVERAGE_PAYMENT` | service | Record payment toward outstanding overage debt, constrained to `<= amountOwed` | Payment reporting revision |

### Operations Removed

| Operation | Reason | Decision |
|-----------|--------|----------|
| `UPDATE_BILLING_PROJECTION` | State fields removed; projection is now derived | D-3 |

### Input Schema Changes

| Input | Change | Decision |
|-------|--------|----------|
| `AddServiceInput` | `effectiveDate` **removed** (was unused — services don't carry pricing) | Cleanup |
| `RemoveServiceInput` | `effectiveDate` **removed** (was unused) | Cleanup |
| `AddServiceToGroupInput` | `effectiveDate` **removed** (was unused) | Cleanup |
| `RemoveServiceFromGroupInput` | `effectiveDate` **removed** (was unused) | Cleanup |
| `ReportSetupPaymentInput` | `amount` and `currency` **removed** — payment amount now read from state | Payment reporting revision |
| `ReportRecurringPaymentInput` | `amount` and `currency` **removed** — payment amount now read from state | Payment reporting revision |

Note: `effectiveDate` fields were cleaned up since pricing lives on groups, not services — the fields were never used by reducers. `amount`/`currency` were removed from payment inputs because the reducer now reads the correct amount from the matched service/group state, eliminating the possibility of mismatched payment amounts.

---

## Utils Function Inventory

**File**: [utils.ts](document-models/subscription-instance/v1/src/utils.ts)

| Function | Line | Purpose | Used by |
|----------|------|---------|---------|
| `BILLING_CYCLE_DAYS` | 9-15 | Cycle duration constant (30, 91, 182, 365) | `calculateNextBillingDate`, settlement, activation |
| `daysBetween(a, b)` | 30-33 | Date diff in days (private helper) | `calculateProratedCost` |
| `calculateNextBillingDate(fromDate, billingCycle)` | 41-50 | Adds cycle duration to date | Activation, settlement, renewal |
| `calculateProratedCost(amount, cycleStart, cycleEnd, effectiveDate)` | 58-68 | Proration formula: `(remainingDays / totalDays) * amount` | D-1 add group, D-2 remove group |
| `calculateOverageCost(metric)` | 75-88 | Per-metric overage: `max(0, usage - freeLimit) * unitCost`, capped at paidLimit | Settlement, metric reset, editor billing breakdown |
| `calculateTotalOverage(services, serviceGroups)` | 93-111 | Sum overage across all metrics | Editor billing projection |
| `calculateAmountOwed(state)` | 117-122 | `totalDebt - totalCredit`, no floor (D-7) | Editor Outstanding Balance |
| `calculateUnsettledBill(state)` | 128-135 | `amountOwed + projectedOverage` | Editor (informational) |
| `shouldResetMetric(metric, billingCycle)` | 142-151 | Hierarchy check: MONTHLY <= QUARTERLY means reset | Settlement reducer |
| `findServiceById(serviceId, services, serviceGroups)` | 157-169 | Search flat + grouped services | All metric/payment reducers |
| `findGroupByServiceId(serviceId, serviceGroups)` | 175-185 | Find parent group of a service | Payment reducers |

---

## Editor UI Inventory

| Component | File | Controls |
|-----------|------|----------|
| **SubscriptionActions** | [SubscriptionActions.tsx](editors/subscription-instance-editor/components/SubscriptionActions.tsx) | Activate, Pause, Resume, Cancel, Renew, Settle Cycle (with date picker), Auto-Renew toggle |
| **BillingPanel** | [BillingPanel.tsx](editors/subscription-instance-editor/components/BillingPanel.tsx) | Outstanding Balance, cycle boundaries, cost projection (fixed + dynamic), setup costs, Report Payment buttons (setup + recurring with paid-this-cycle guard) |
| **ServicesPanel** | [ServicesPanel.tsx](editors/subscription-instance-editor/components/ServicesPanel.tsx) | Service cards, Remove Service button, + Add Service Group (reads from offering), Remove Group button on optional groups |
| **MetricActions** | [MetricActions.tsx](editors/subscription-instance-editor/components/MetricActions.tsx) | Increment/decrement usage, Reset Metric Cycle button |
| **SubscriptionHeader** | [SubscriptionHeader.tsx](editors/subscription-instance-editor/components/SubscriptionHeader.tsx) | Status badge, Outstanding/Paid up/Credit display, service count, due date countdown |
| **billing-utils** | [billing-utils.ts](editors/subscription-instance-editor/components/billing-utils.ts) | Formatting + `computeBillingBreakdown()` (delegates to doc model `calculateOverageCost()` for overage) |

---

## Sprint Planning Action Items → Status

| Action Item | Owner | Source | Status | Implementation |
|-------------|-------|--------|--------|---------------|
| Investigate dynamic cost calculations | Apeiron | Sprint planning | DONE | `calculateOverageCost()`, billing breakdown in editor |
| Analyze billing cycle mechanics | Apeiron | Sprint planning | DONE | D-1 through D-9, 9 decisions documented and grounded |
| Enrich SI doc model with debt/credit | Apeiron + Liberuum | Sprint planning | DONE | `totalDebt`, `totalCredit`, `currentBillingCycleStart` added |
| Implement calculation utils | Apeiron | Sprint planning | DONE | 11 functions in utils.ts |
| Missing settlement operation | Wouter + Apeiron | 00:36:20 | DONE | `SETTLE_BILLING_CYCLE` + `RESET_METRIC_CYCLE` |
| Fix nextBillingDate on activation | Apeiron | Sprint planning | DONE | `activateSubscription` reducer calculates via `calculateNextBillingDate()` |
| Fix dynamic cost projection | Apeiron | Sprint planning | DONE | Removed static `projectedBillAmount`, now derived |

---

## Full Traceability Matrix

### Platform Rules (Baked Into Reducers)

| Rule | Decision | Wouter Source | Real-World Validation | Reducer | Utils | Editor UI |
|------|----------|-------------|----------------------|---------|-------|-----------|
| Mid-cycle add = prorated debit | D-1 | 00:44:40: "charge you prorata for the ongoing billing cycle" | **Zoom**: immediate prorated charge (verified). **Stripe**: configurable, default deferred (verified). **Slack**: deferred to next month (verified). Chose immediate per Wouter. **Google Workspace**: same formula applied to quantity delta within a group (upfront-variable) — not yet supported | `addServiceGroupOperation` in [service-group.ts](document-models/subscription-instance/v1/src/reducers/service-group.ts) — status guard + `calculateProratedCost()` → `totalDebt` | `calculateProratedCost(amount, cycleStart, cycleEnd, effectiveDate)` in [utils.ts](document-models/subscription-instance/v1/src/utils.ts) — formula: `(remainingDays / totalDays) * amount` | "+ Add Service Group" button reads from service offering, dispatches `addServiceGroup` |
| Mid-cycle remove = prorated credit | D-2 | 00:46:09: "the prorata cost is deducted, it's like putting credit" | **Slack**: prorated credit, non-refundable, auto-applied (verified). **Zoom**: no credit, takes effect at renewal (verified). **Stripe**: credit on next invoice (verified). Chose Slack model. **Google Workspace**: seat reduction 3→1 mid-cycle, prepaid difference carried as credit — same pattern, quantity delta instead of whole group | `removeServiceGroupOperation` in [service-group.ts](document-models/subscription-instance/v1/src/reducers/service-group.ts) — calls `calculateProratedCost()` on group `recurringCost.amount` → `totalCredit` | Same `calculateProratedCost()` in [utils.ts](document-models/subscription-instance/v1/src/utils.ts), output used as credit | "Remove Group" button on add-on groups with proration |
| Setup + first cycle on activation | BA-5 | 00:42:57: "at that moment you owe the fixed costs and the setup cost" | **Stripe/Zoom/Dropbox**: all charge immediately on activation. Universal pattern. | `activateSubscriptionOperation` in [subscription.ts](document-models/subscription-instance/v1/src/reducers/subscription.ts) — sums all `setupCost` + `recurringCost` → `totalDebt` | `calculateNextBillingDate(activatedSince, billingCycle)` in [utils.ts](document-models/subscription-instance/v1/src/utils.ts) | "Activate" button in SubscriptionActions |
| Overage charged at settlement, not live | D-4 | 00:43:57: "overage costs are calculated and charged at the end of the billing cycle" | **AWS**: post-pay, monthly settlement with tiered resets (verified). **Stripe**: usage meters aggregate per period, invoiced at cycle end (verified). | `settleBillingCycleOperation` in [subscription.ts](document-models/subscription-instance/v1/src/reducers/subscription.ts) — `calculateOverageCost()` per metric → `totalDebt`. `resetMetricCycleOperation` in [metrics.ts](document-models/subscription-instance/v1/src/reducers/metrics.ts) for independent resets | `calculateOverageCost(metric)` in [utils.ts](document-models/subscription-instance/v1/src/utils.ts) — `max(0, currentUsage - freeLimit) * unitCost`, capped at paidLimit | "Settle Cycle" button with date picker; "Reset Cycle" button per metric |
| Cancellation = freeze usage | D-6 | 00:47:38: "from the moment you cancel there can't be any additional usage" | Universal — all platforms freeze on cancellation. **Zoom**: "you will lose all associated plan features" (verified). | All metric operations in [metrics.ts](document-models/subscription-instance/v1/src/reducers/metrics.ts): ACTIVE-only guard. Cancel in [subscription.ts](document-models/subscription-instance/v1/src/reducers/subscription.ts) sets status CANCELLED | N/A | "Cancel" button. Metric +/- disabled when not ACTIVE |
| Metric resets independent of billing cycle | Sprint planning | 00:55:28: "reset cycles can be set at the individual metric level" | **AWS**: volume tiers reset monthly, storage persists (verified). **Slack**: seat count persists (verified). | `resetMetricCycleOperation` in [metrics.ts](document-models/subscription-instance/v1/src/reducers/metrics.ts) — calculates overage, resets `currentUsage = 0`. `shouldResetMetric()` at settlement | `shouldResetMetric(metric, billingCycle)` in [utils.ts](document-models/subscription-instance/v1/src/utils.ts) — hierarchy check | Reset Cycle button on metrics with `usageResetPeriod` |
| Settlement always succeeds | D-8 | Powerhouse alignment: no warning mechanism in reducers | **Powerhouse**: `.error` property is binary (succeed or throw). No existing reducer returns warnings. | `settleBillingCycleOperation` in [subscription.ts](document-models/subscription-instance/v1/src/reducers/subscription.ts) has no balance check | N/A | Outstanding Balance display is the operator's signal |

### Structural Decisions (Schema + State Design)

| Decision | Wouter Source | Real-World Validation | Schema Change | Rationale |
|----------|-------------|----------------------|---------------|-----------|
| D-3: Counters, no ledger array | 00:47:38: "keep a record" + 01:01:07: "derived values" | **Powerhouse**: event sourcing, operation history is the audit trail. `account-transactions` model exists for financial records. No existing doc model uses growing arrays. | `totalDebt`, `totalCredit` on state. `projectedBillAmount`/`projectedBillCurrency` removed. | Vault note: [[subscription billing state should carry counters not ledger arrays]] |
| D-4: Cycle boundaries stay fixed | 00:40:05: "close the billing cycle prematurely... or lagging 6 weeks" | **Stripe**: prorations happen on plan changes, not on invoice timing (verified). Invoice date doesn't shift subscription period. | `currentBillingCycleStart: DateTime` on state. `settlementDate` on input. | Late: overage window to `nextBillingDate`. Early: to `settlementDate`. No date drift. |
| D-5: Pause continues cycle | Consistent with D-4 | Universal — all platforms maintain period on pause. | No changes — resume doesn't touch billing state. | Paused days lost. Operator action, not customer benefit. |
| D-6 revised: Groups carry pricing, services don't | 00:44:12: Wouter's examples (seats, servers) were within existing structure + pricing on `ServiceGroup.recurringCost` not `Service.recurringCost` | Subscription is a one-time snapshot via `mapOfferingToSubscription()`. Adding groups has sourcing from offering. | `addServiceGroup`/`removeServiceGroup`: PENDING or ACTIVE with proration. `addService`/`addServiceToGroup`: no proration. | Mid-cycle changes operate on groups (billable unit), not services (deliverables). |
| D-7: Negative balance carries forward | 01:04:27: "if payment comes in you update credit" | **Slack**: credits non-refundable, auto-applied (verified). **Stripe**: credit balance carries forward (verified). | `calculateAmountOwed()` returns raw difference, no floor. | Refunds are a Stripe concern. Capping hides surplus. |
| D-9: Manual renewal initializes billing | Gap found during spec review | **Stripe**: renewal creates new period with new invoice items. | `renewExpiringSubscription` reducer: advances dates, adds recurring costs. | Without this, subscription is ACTIVE but billing state stale after renewal. |

---

## Gaps / Not Yet Implemented

| Feature | Source | Status | Notes |
|---------|--------|--------|-------|
| `effectiveDate` on `AddServiceInput`, `AddServiceToGroupInput`, `RemoveServiceInput`, `RemoveServiceFromGroupInput` | D-1 original | **UNUSED** | Reducer has the field but doesn't use it for proration — services don't carry pricing. Fields remain for backward compatibility. |
| `updateServiceSetupCost`, `updateServiceRecurringCost`, `updateServiceGroupCost` status guards | D-6 reviewer warning | **DONE** | PENDING-only guard added. Cost updates on ACTIVE subscriptions have billing implications not accounted for. |
| `updateServiceInfo`, `addServiceFacetSelection`, `removeServiceFacetSelection` status guards | D-6 reviewer warning | **MISSING** | Lower priority — info updates, not billing-impacting. |
| Settlement test scenarios | Spec section 10.7 | **PARTIAL** | Basic test exists (operation recording). No tests for: on-time, late, early settlement, autoRenew=false, metric reset. |
| Editor: `billing-utils.ts` delegation to doc model utils | Spec section 7.1 | **PARTIAL** | Editor still computes billing breakdown independently in `billing-utils.ts`. `computeMetricOverage()` now delegates to `calculateOverageCost()`, but `computeBillingBreakdown()` is still independent. |
| Stripe Connect integration | 01:12:37 | **OUT OF SCOPE** | Post-MVP. Documented in WBD as P3. |
| Team drive generation | 01:02:15 | **SEPARATE TRACK** | Subgraph resolver issue. Needs Liberuum session. |
| Login integration | 01:09:16 | **OUT OF SCOPE** | Deprioritized below billing per Wouter. |
| Mid-cycle quantity change within group (upfront-variable) | Google Workspace invoice Mar 2026, D-1/D-2 | **NOT IMPLEMENTED** | Google applies D-1/D-2 proration to seat count changes within a group (3→1 seats). Our model only supports whole group add/remove. Would need: `quantity` field on `ServiceGroup`, `UPDATE_SERVICE_GROUP_QUANTITY` operation, proration on `(oldQty - newQty) * unitCost * remainingDays/totalDays`. Formula already exists — missing the structural hook. |
| Diagrams (Mermaid + Canvas) | BA artifacts plan | **NOT DONE** | State machine, process flow, proration tree, debt/credit flow — planned but not produced. |
