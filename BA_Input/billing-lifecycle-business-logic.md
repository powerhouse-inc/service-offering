# Billing Lifecycle Business Logic

**Source**: Platform Sprint Planning 2026-04-09 + BA Session 2026-04-14/16
**Status**: In Progress
**Last updated**: 2026-04-16

This document is the **single source of truth** for billing lifecycle business logic decisions. Every decision and open question maps to specific doc model changes. No schema change or reducer implementation should proceed without a corresponding entry here.

---

## Decisions

### D-1: Proration Charge Timing

**Decision**: Platform rule. Mid-cycle add = immediate prorated debit. Not configurable per operator.

**Rationale**: Wouter defined this explicitly (00:44:40–00:46:09). Considered making it configurable per Service Offering (`IMMEDIATE` vs `DEFERRED` enum) but rejected — these are platform-level billing mechanics, not per-offering config. Adding config fields to ServiceOffering creates operator burden for decisions they shouldn't need to make.

**Real-world validation**:
- Zoom: immediate prorated charge (verified from Zoom support docs)
- Slack: deferred to next month (verified from Slack help center)
- Stripe: configurable, default deferred (verified from Stripe developer docs)

**Affected doc model changes**:
- `addService` reducer — must call proration util and add prorated amount to `totalDebt`
- `addServiceToGroup` reducer — same
- `addServiceGroup` reducer — same
- `AddServiceInput` — needs `effectiveDate: DateTime` field
- `AddServiceToGroupInput` — needs `effectiveDate: DateTime` field
- `AddServiceGroupInput` — needs `effectiveDate: DateTime` field

**Affected utils**:
- `calculateProratedCost(amount, cycleStart, cycleEnd, effectiveDate)` — core formula

---

### D-2: Downgrade Policy

**Decision**: Platform rule. Mid-cycle service removal creates a prorated credit. Same formula as add, reversed direction. Not configurable.

**Rationale**: Wouter (00:46:09): "if I'm removing a seat, the prorata cost is deducted. It's like putting credit." Considered three options:
1. No mid-cycle downgrade (Dropbox/Zoom model) — rejected, too restrictive
2. Prorated credit (Slack model) — **selected**
3. Configurable per operator — rejected, same reasoning as D-1

**Real-world validation**:
- Slack: prorated credit, non-refundable, auto-applied to future charges (verified)
- Zoom: no credit, takes effect at renewal (verified)
- Stripe: credit on next invoice (verified)

**Affected doc model changes**:
- `removeService` reducer — must call proration util and add prorated amount to `totalCredit`
- `removeServiceFromGroup` reducer — same
- `removeServiceGroup` reducer — same
- `RemoveServiceInput` — needs `effectiveDate: DateTime` field
- `RemoveServiceFromGroupInput` — needs `effectiveDate: DateTime` field
- `RemoveServiceGroupInput` — needs `effectiveDate: DateTime` field

**Affected utils**:
- Same `calculateProratedCost()` function, output used as credit instead of debit

---

### D-3: Ledger Structure (REVISED)

**Decision**: Running counters only (`totalDebt`, `totalCredit`) on SubscriptionInstanceState. No ledger entries array. Transaction detail lives in the Reactor's operation history and the downstream `account-transactions` model.

**Rationale**: Wouter (00:47:38): "we need to keep a record somewhere of these changes." Initially designed an explicit `ledgerEntries: [LedgerEntry!]!` array — **rejected after Powerhouse pattern analysis**:

1. **Anti-pattern**: No existing Powerhouse doc model uses unbounded growing arrays for transaction history. State is a snapshot, not a transaction log. Existing payment fields (`lastPaymentDate`) are single-value overwrites, not arrays.
2. **Reactor provides the audit trail**: Since Powerhouse follows event sourcing, every operation is immutable with index, timestamp, and hash. Filter operations by type (e.g., `SETTLE_BILLING_CYCLE`, `REPORT_RECURRING_PAYMENT`) to reconstruct billing history.
3. **Dedicated finance model exists**: `powerhouse/account-transactions` (10 ops) already tracks individual financial transactions (debits, credits). Billing statements aggregate these downstream.

Vault note: [[subscription billing state should carry counters not ledger arrays]]

**What the state carries**:
- `totalDebt: Amount_Money` — running sum of all charges, updated by reducers
- `totalCredit: Amount_Money` — running sum of all payments/credits, updated by reducers
- `amountOwed` = `totalDebt - totalCredit` — derived by util function, not stored

**Where transaction detail lives**:
- **Operation history** — filter by type and date range for billing cycle breakdown
- **account-transactions model** — downstream recording of individual debits/credits (separate document)

**Affected doc model changes**:
- New state fields: `totalDebt`, `totalCredit` (no `ledgerEntries` array)
- ~~New `LedgerEntry` type~~ — removed
- ~~New `LedgerEntryType` enum~~ — removed
- ~~New `LedgerDirection` enum~~ — removed
- Every reducer that touches money updates the running counters directly

---

### D-4: Settlement Timing — Cycle Boundaries Stay Fixed

**Decision**: Settlement triggers billing calculation but does NOT shift cycle boundaries. Both early and late settlement are supported. `nextBillingDate` stays as originally scheduled.

**Rationale**: Wouter (00:40:05): "there will be situations where you want to just close the billing cycle prematurely... or we've just been lagging and it's like 6 weeks and we want to bill now."

#### Late settlement (operator missed `nextBillingDate`)

- **When it happens**: Operational lag — operator didn't run settlement on time
- **Overage calculation window**: Up to `nextBillingDate` (the original cycle end), NOT up to actual settlement date
- **Usage after `nextBillingDate`**: Counts toward the next cycle
- **Cycle boundaries**: Don't shift. Next cycle starts from `nextBillingDate` as scheduled
- **Effect**: It's as if settlement ran on time, just the books were closed late

#### Early settlement (before `nextBillingDate`)

- **When it happens**: Customer cancellation mid-cycle, dispute resolution, tier switch
- **Overage calculation window**: Up to `settlementDate` — can't charge for usage that hasn't happened yet
- **Current cycle credit**: No prorated credit for unused days of current cycle — you prepaid, settling early by choice
- **Next cycle start**: From original `nextBillingDate`, NOT from `settlementDate` — prevents permanent date drift
- **Effect**: Early settlement = "calculate and invoice overage up to today." The cycle continues as-is. If auto-renew is on, next cycle still starts on `nextBillingDate`

#### Cancellation settlement

- **When it happens**: Customer cancels, need to close the books
- **Overage calculation window**: Up to `settlementDate`
- **Next cycle**: None — `autoRenew` is already false or status transitions to `EXPIRING`/`CANCELLED`
- **Credit for unused days**: No — consistent with early settlement rule

**Affected doc model changes**:
- `SETTLE_BILLING_CYCLE` operation — input includes `settlementDate: DateTime!`
- `settleBillingCycle` reducer — must compare `settlementDate` vs `nextBillingDate` to determine overage window
- `NoBillingCycleActiveError` — settlement on non-ACTIVE subscription
- `SettlementDateBeforeCycleStartError` — `settlementDate` < `currentBillingCycleStart`

**Affected utils**:
- `calculateOverageCost(metric)` — needs date range parameter (cycleStart, endDate) where endDate = min(settlementDate, nextBillingDate)
- `calculateTotalOverage(services, cycleStart, endDate)` — same

---

### D-5: Pause/Resume — Continue Existing Cycle

**Decision**: When a paused subscription resumes, it continues the existing billing cycle. `nextBillingDate` stays as-is. Paused days are lost.

**Rationale**: Consistent with D-4 (cycle boundaries stay fixed). Considered three options:
1. Continue existing cycle — **selected**. Simplest, no recalculation. Customer paid for 30 days, got 20. Pausing is typically an operator action (non-payment, maintenance), not a customer benefit.
2. Extend cycle by paused duration — rejected. Shifts `nextBillingDate` and all future dates, contradicts the fixed-boundary principle from D-4.
3. Start fresh cycle — rejected. Most complex — triggers early settlement of old cycle + new recurring charge on resume. Over-engineered for a pause scenario.

**Affected doc model changes**:
- `resumeSubscription` reducer — no billing logic needed. Just transitions status back to `ACTIVE` and sets timestamp. `nextBillingDate`, `currentBillingCycleStart`, `totalDebt`, `totalCredit` all remain unchanged.

**Affected utils**:
- None — proration during remaining days after resume uses original cycle boundaries as-is.

---

### D-6: Operation Status Matrix and Structural Change Boundaries

**Decision**: Every operation on SubscriptionInstance is gated by subscription status. Structural changes (adding/removing entire service groups) are blocked on ACTIVE subscriptions. Mid-cycle changes are limited to services within existing groups and metric usage.

#### Part 1: Status Guards

No reducer currently checks `state.status`. All operations execute regardless of whether the subscription is PENDING, ACTIVE, PAUSED, EXPIRING, or CANCELLED. This is a gap — e.g., you can currently add services to a CANCELLED subscription.

**Operation status matrix**:

| Operation | PENDING | ACTIVE | PAUSED | EXPIRING | CANCELLED |
|-----------|---------|--------|--------|----------|-----------|
| `initializeSubscription` | Yes | — | — | — | — |
| `activateSubscription` | Yes | — | — | — | — |
| `addService` | Yes (setup) | Yes + proration | No | No | No |
| `removeService` | Yes (setup) | Yes + proration | No | No | No |
| `addServiceGroup` | Yes (setup) | **No** | No | No | No |
| `removeServiceGroup` | Yes (setup) | **No** | No | No | No |
| `addServiceToGroup` | Yes (setup) | Yes + proration | No | No | No |
| `removeServiceFromGroup` | Yes (setup) | Yes + proration | No | No | No |
| `updateServiceGroupCost` | Yes (setup) | No | No | No | No |
| `updateMetricUsage` | — | Yes | No | No | No |
| `incrementMetricUsage` | — | Yes | No | No | No |
| `decrementMetricUsage` | — | Yes | No | No | No |
| `reportSetupPayment` | Yes | Yes | Yes | Yes | Yes |
| `reportRecurringPayment` | — | Yes | Yes | Yes | Yes |
| `settleBillingCycle` | — | Yes | No | No | No |
| `pauseSubscription` | — | Yes | — | — | — |
| `resumeSubscription` | — | — | Yes | — | — |
| `cancelSubscription` | — | Yes | Yes | Yes | — |
| `setAutoRenew` | — | Yes | Yes | Yes | — |
| `setRenewalDate` | — | Yes | Yes | Yes | — |
| `setOperatorNotes` | Yes | Yes | Yes | Yes | Yes |
| `updateCustomerInfo` | Yes | Yes | Yes | Yes | — |
| `updateTierInfo` | Yes | Yes | — | — | — |

**Key principles**:
- **PENDING** = setup phase, all configuration allowed, no billing impact (no active cycle)
- **ACTIVE** = full operational state with billing, proration on service changes
- **PAUSED** = frozen, only payments and administrative operations (per D-5 and OQ-5)
- **EXPIRING** = winding down, no new services, payments still accepted to settle debt
- **CANCELLED** = terminal, only payment reporting to clear outstanding balance

Wouter (00:47:38): *"from the moment you cancel there can't be any additional usage. That's it."*

#### Part 2: Structural Changes Blocked on ACTIVE

**Decision**: `addServiceGroup` and `removeServiceGroup` are blocked when status = ACTIVE. Only `addServiceToGroup` / `removeServiceFromGroup` (within existing groups) are allowed mid-cycle.

**Rationale — where do service groups come from?**

The subscription instance is created as a **one-time snapshot** from the service offering via `mapOfferingToSubscription()` (see `editors/subscription-instance-editor/components/mapOfferingToSubscription.ts`). This function:

1. Takes the selected tier and customer's purchase choices
2. Maps option group breakdowns → required service groups (`optional: false`)
3. Maps add-on breakdowns → optional service groups (`optional: true`)
4. Maps standalone services not in any group
5. Produces an `InitializeSubscriptionInput` — a point-in-time snapshot

After creation, the subscription is **independent** — there is no back-sync with the service offering. Vault note: [[subscription import creates a one-time snapshot from service offering with no back-sync]].

This means adding a service group to an ACTIVE subscription has a **sourcing problem**:

| Scenario | Where does the group config come from? | Problem |
|----------|---------------------------------------|---------|
| Customer wants an add-on they didn't pick at purchase | Would need to re-read the service offering and run `mapOfferingToSubscription` for just that group | Offering may have changed since subscription creation — prices, services, billing cycles could all be different |
| Operator creates a custom group | Invented from scratch, not in the catalog | Contradicts the catalog model — pricing has no basis in the offering |
| Offering updated, customer wants new group | Re-read offering for the new group only | No back-sync mechanism exists; partial re-import is undefined |

**What Wouter actually described** (00:44:40–00:47:38):

Wouter's mid-cycle examples were all **within existing structure**:
- *"you add a user, you add a seat"* — incrementing within an existing service/metric
- *"if three days in I decide to add a third seat"* — adding capacity, not a new group
- *"if I'm adding a new server, I'm not paying anything, it's just pure overage cost"* — usage within existing metrics

He never discussed adding entirely new service groups mid-cycle. The Dropbox seat example, the AWS server example — all are changes **within** the existing subscription structure.

Apeiron confirmed the current limitation (00:49:12): *"currently the subscription instance is not... except for the metrics edits. You cannot add stuff or like currently you cannot increase like per seat, we don't have this, you cannot currently add new service groups to an existing subscription."*

Wouter's response was to ask for a BA on the mechanism — but the mechanism he described was proration on **service-level changes**, not group-level structural changes.

**Conclusion**: Mid-cycle changes operate **within the snapshot** — add/remove services within existing groups, track usage on existing metrics, prorate costs. Adding new groups requires an upgrade flow that is a separate feature (re-reads the offering, resolves price drift, creates new group with proper sourcing). This is out of scope for the billing lifecycle BA.

**Affected doc model changes**:
- All reducers — add status guard as first check, throw specific error if status not allowed
- New error types:
  - `SubscriptionNotActiveError` — for operations requiring ACTIVE status
  - `SubscriptionPausedError` — for operations blocked during PAUSED
  - `SubscriptionCancelledError` — for operations blocked after cancellation
  - `StructuralChangeNotAllowedError` — for `addServiceGroup`/`removeServiceGroup` on ACTIVE subscription
- `addServiceGroup` / `removeServiceGroup` — allowed in PENDING only
- `addServiceToGroup` / `removeServiceFromGroup` — allowed in PENDING and ACTIVE (with proration in ACTIVE)

#### Future work (out of scope)

- **Subscription upgrade flow** — re-read offering to add groups post-activation. Requires: offering version tracking, price drift resolution, partial re-import logic. Separate BA + PRD needed.
- **Subscription downgrade flow** — remove groups post-activation with billing impact. Same complexity as upgrade.

---

### D-7: Negative Balance — Carry Forward

**Decision**: When `totalDebt - totalCredit` is negative (customer overpaid), the surplus carries forward naturally. No special handling in the document model.

**Rationale**: Considered three options:
1. Carry forward — **selected**. The counters are cumulative and keep running. If credit > debt, the customer is ahead. Next cycle's recurring charge adds to `totalDebt`, bringing the balance back toward zero naturally. Zero reducer complexity — the math just works.
2. Refund — rejected for now. Refunds are a payment layer concern (Stripe), not a document model concern. The doc model tracks what's owed, not how to move money. If a refund is needed, it's dispatched externally and reported back via `reportRecurringPayment` (which adds to `totalCredit` — or in this case, a future adjustment operation could subtract from `totalCredit`).
3. Cap at zero — rejected. Capping hides the surplus. The operator needs to see that the customer has excess credit so they can decide whether to refund or let it apply to the next cycle.

**Real-world validation**:
- Slack: credits are non-refundable, auto-applied to future charges (verified from Slack help center)
- Stripe: customer credit balance carries forward, applied before determining amount due on next invoice (verified from Stripe developer docs)

**Affected doc model changes**:
- None. No special handling needed in any reducer.
- `calculateAmountOwed(state)` util returns `totalDebt - totalCredit` without floor — negative value means customer has credit surplus.

**Affected utils**:
- `calculateAmountOwed()` — returns raw difference, can be negative. Callers (editors, subgraph) decide how to display it (e.g., "Credit balance: $50" vs "Amount owed: $200").

---

### D-8: Outstanding Debt at Settlement — No Guard, UI Concern

**Decision**: Settlement always succeeds regardless of outstanding debt. Accumulated debt is a derived value surfaced in the UI, not a reducer gate.

**Rationale**: Considered three options:
1. No guard, always succeed — **selected**. Blocking settlement because of unpaid debt is counterproductive — the current cycle's overage keeps accruing uncaptured, making the debt worse. The operator can always see `calculateAmountOwed()` in the editor/dashboard.
2. Warn but proceed — rejected. **Powerhouse reducers have no warning mechanism.** Operations either succeed (state mutates) or throw an error (state unchanged, error recorded on the operation). There is no middle ground. No existing reducer in the codebase returns a warning alongside a successful mutation.
3. Block with error — rejected. Would prevent operators from closing books on new cycles until old debt is cleared, creating a cascading backlog.

**Powerhouse alignment**: Warnings as a concept don't exist in reducers. The `.error` property on operations is binary — it's a failure, not a warning. Derived state like "you have outstanding debt" is a UI/query concern. The editor reads `calculateAmountOwed()` and displays it. The reducer's job is to mutate state correctly, not to make business judgment calls about whether the operator should proceed.

**Affected doc model changes**:
- None. No error types, no state fields, no reducer guards.

**Affected utils**:
- `calculateAmountOwed(state)` — already defined (D-7). Returns `totalDebt - totalCredit`. Positive = debt outstanding, negative = credit surplus. The editor/dashboard uses this to show alerts, badges, or warnings — that's a presentation concern.

---

## Open Questions

### OQ-2: On early settlement + renewal, does the new cycle start from `settlementDate` or original `nextBillingDate`?

**Status**: RESOLVED (see D-4)

**Answer**: Original `nextBillingDate`. Prevents permanent date drift.

---

### OQ-3: What happens to mid-cycle change records when a cycle settles?

**Status**: RESOLVED (see D-3 revised)

**Answer**: No longer applicable. There are no ledger entries on state to manage. The Reactor's operation history is the audit trail and is managed by the platform, not by our reducers. Transaction detail for billing lives in the `account-transactions` model downstream.

---

### OQ-4: When a paused subscription resumes, does it continue the existing cycle or start a new one?

**Status**: RESOLVED (see D-5)

**Answer**: Continue existing cycle. `nextBillingDate` stays as-is. Paused days are lost — no extension, no fresh cycle.

---

### OQ-5: Can services be added/removed while subscription is paused?

**Status**: RESOLVED (see D-6)

**Answer**: No. All service add/remove operations are blocked when status = PAUSED. The subscription is frozen — operator must resume first, then make changes with normal proration. This is consistent with the resource instance pattern where configuration locks after activation requiring suspension to reconfigure.

---

### OQ-6: Should the ledger be append-only or can entries be voided/reversed?

**Status**: RESOLVED (see D-3 revised)

**Answer**: No longer applicable. There is no ledger on state. Error correction for the running counters (`totalDebt`, `totalCredit`) is handled by dispatching a corrective operation (e.g., a negative payment report or an adjustment operation). The Reactor's operation history records both the original and the correction, providing the audit trail.

---

### OQ-7: Do we need a `CYCLE_SUMMARY` entry type?

**Status**: RESOLVED (see D-3 revised)

**Answer**: No ledger entries exist on state. Cycle summaries are derived on read by a util function that filters the Reactor's operation history by type and date range: `summarizeCycle(operations, cycleStart, cycleEnd)`.

---

### OQ-8: Is the ledger single-currency or per-entry?

**Status**: RESOLVED (see D-3 revised)

**Answer**: No ledger on state. The `totalDebt` and `totalCredit` counters use `globalCurrency` (already on SubscriptionInstanceState). All reducer calculations convert to `globalCurrency` before updating the counters. Currency is not a per-entry concern since there are no entries — it's a per-counter concern, and both counters share `globalCurrency`.

---

### OQ-9: What if `totalDebt - totalCredit` is negative at settlement (customer overpaid)?

**Status**: RESOLVED (see D-7)

**Answer**: Carry forward. Negative balance rolls naturally into the next cycle. No special handling in the doc model.

---

### OQ-10: Should settlement fail/warn if there's unsettled debt from previous cycles?

**Status**: RESOLVED (see D-8)

**Answer**: No guard. Settlement always succeeds. Outstanding debt is a derived value (`calculateAmountOwed()`) surfaced in the UI, not a reducer concern.

**Previous options considered**:
- A. No guard — settlement always succeeds. Unpaid debt from previous cycles just accumulates. The running totals reflect the full history.
- B. Warn but proceed — settlement succeeds but reducer adds a flag or note indicating outstanding previous debt
- C. Block — settlement fails if there's outstanding debt from prior cycles

**Affects**:
- `settleBillingCycle` reducer — if C, need to check balance before proceeding
- Error types — if C, need `OutstandingDebtError`
- `SubscriptionInstanceState` — if B, may need an `outstandingDebtWarning: Boolean` or similar

---

## Cross-Reference: Open Questions → Doc Model Impact

| OQ | Status | Schema Impact | Reducer Impact | Utils Impact |
|----|--------|--------------|----------------|--------------|
| OQ-1 | RESOLVED (D-4) | None | Settlement overage window logic | `calculateOverageCost` date range |
| OQ-2 | RESOLVED (D-4) | None | None — cycle boundaries stay fixed | None |
| OQ-3 | RESOLVED (D-3) | No ledger on state | No cleanup needed | None |
| OQ-4 | RESOLVED (D-5) | None | `resumeSubscription` — no billing changes needed | None |
| OQ-5 | RESOLVED (D-6) | Error types for status guards | All service/group reducers get status checks | None |
| OQ-6 | RESOLVED (D-3) | No ledger on state | Corrective operations update counters | None |
| OQ-7 | RESOLVED (D-3) | No ledger on state | None | `summarizeCycle()` reads operation history |
| OQ-8 | RESOLVED (D-3) | No ledger — counters use globalCurrency | All counter updates in globalCurrency | None |
| OQ-9 | RESOLVED (D-7) | None | None — math just works | `calculateAmountOwed()` returns raw difference, no floor |
| OQ-10 | RESOLVED (D-8) | None | None — settlement always succeeds | `calculateAmountOwed()` surfaces debt in UI |
