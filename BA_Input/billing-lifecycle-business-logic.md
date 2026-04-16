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
- `addService` reducer — must call proration util and create `PRORATION_DEBIT` ledger entry
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
- `removeService` reducer — must call proration util and create `PRORATION_CREDIT` ledger entry
- `removeServiceFromGroup` reducer — same
- `removeServiceGroup` reducer — same
- `RemoveServiceInput` — needs `effectiveDate: DateTime` field
- `RemoveServiceFromGroupInput` — needs `effectiveDate: DateTime` field
- `RemoveServiceGroupInput` — needs `effectiveDate: DateTime` field

**Affected utils**:
- Same `calculateProratedCost()` function, output used as credit instead of debit

---

### D-3: Ledger Structure

**Decision**: Explicit `ledgerEntries: [LedgerEntry!]!` array at root of `SubscriptionInstanceState`. Append-only. `totalDebt` and `totalCredit` are running counters updated alongside entries.

**Rationale**: Wouter (00:47:38): "we need to keep a record somewhere of these changes." Considered two approaches:
1. Minimal — just `totalDebt` / `totalCredit` counters, reconstruct breakdown from operation history — rejected, because settlement reducer needs breakdown (overage vs proration vs recurring), editors need to display what contributed to the bill, and disputes need an audit trail
2. Explicit ledger — **selected**, each financial event appends an entry with type, amount, date, and references

**Why on SubscriptionInstance**: It's the only doc model that tracks the customer's billing relationship. ServiceOffering defines prices (no customer state), ResourceInstance handles provisioning (no financial state), ResourceTemplate and Facet have no billing concern.

**Affected doc model changes**:
- New `LedgerEntry` type in schema
- New `LedgerEntryType` enum
- New `LedgerDirection` enum
- New state fields: `ledgerEntries`, `totalDebt`, `totalCredit`
- Every reducer that touches money must append entries AND update counters

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

## Open Questions

### OQ-2: On early settlement + renewal, does the new cycle start from `settlementDate` or original `nextBillingDate`?

**Status**: RESOLVED (see D-4)

**Answer**: Original `nextBillingDate`. Prevents permanent date drift.

---

### OQ-3: What happens to mid-cycle change records when a cycle settles?

**Status**: OPEN

**Context**: When a cycle settles, the ledger entries for that cycle (PRORATION_DEBIT, PRORATION_CREDIT, OVERAGE_CHARGE, etc.) remain in the `ledgerEntries` array. They each have a `billingCycleStart` reference. The question is whether the array grows unbounded or we need lifecycle management.

**Options**:
- A. Keep all entries forever (append-only, no cleanup) — simplest, full audit trail, but array grows
- B. Archive entries older than N cycles — reduces state size but needs an archive mechanism
- C. Summarize old cycles into a single `CYCLE_SUMMARY` entry — compresses history but loses detail

**Affects**:
- `LedgerEntry` type — if option C, need a `CYCLE_SUMMARY` entry type
- `settleBillingCycle` reducer — if option B/C, needs cleanup/summary logic
- Long-term state size of subscription documents

---

### OQ-4: When a paused subscription resumes, does it continue the existing cycle or start a new one?

**Status**: OPEN

**Context**: Subscription goes ACTIVE → PAUSED → ACTIVE (resumed). The billing cycle was, say, April 1–30. Subscription was paused on April 10, resumed on April 20.

**Options**:
- A. Continue existing cycle — `nextBillingDate` stays April 30, usage tracking resumes, 10 lost days are just lost
- B. Extend cycle — `nextBillingDate` shifts to May 10 (original end + paused duration), customer gets the full paid-for period
- C. Start fresh cycle — new cycle begins from resume date

**Affects**:
- `resumeSubscription` reducer — if B, must recalculate `nextBillingDate`; if C, must create new `RECURRING_CHARGE` ledger entry
- `currentBillingCycleStart` — if C, must be reset to resume date
- Proration calculations — if A, mid-cycle changes during the remaining 10 days use the original cycle boundaries

---

### OQ-5: Can services be added/removed while subscription is paused?

**Status**: OPEN

**Context**: If paused, should the operator or customer be able to modify the service configuration?

**Options**:
- A. No changes while paused — all add/remove operations reject with error if status ≠ ACTIVE
- B. Allow changes, but no billing impact until resumed — changes queue up, proration calculated from resume date
- C. Allow changes with immediate billing impact — same as ACTIVE behavior

**Affects**:
- `addService`, `removeService`, `addServiceToGroup`, `removeServiceFromGroup` reducers — need status guard if A
- Error types — need `SubscriptionPausedError` if A
- Proration logic — if B, `effectiveDate` must be the resume date, not the change date

---

### OQ-6: Should the ledger be append-only (entries never modified/deleted) or can entries be voided/reversed?

**Status**: OPEN

**Context**: What if an entry was created in error? A payment was reported incorrectly? An overage was miscalculated?

**Options**:
- A. Strict append-only — to correct an error, you add a reversing entry (e.g., negative `PAYMENT` to undo an incorrect payment). Original entry stays. This is standard accounting practice (double-entry principle).
- B. Allow void/delete — entries can be marked as voided or removed. Simpler but loses audit trail.

**Affects**:
- `LedgerEntry` type — if A, may need a `reversesEntryId: OID` field to link corrections; if B, need a `voided: Boolean` field
- New operations — if A, need a `REVERSE_LEDGER_ENTRY` or `CORRECTION` entry type; if B, need a `VOID_LEDGER_ENTRY` operation
- `totalDebt` / `totalCredit` counters — must be recalculated on reversal/void

---

### OQ-7: Do we need a `CYCLE_SUMMARY` entry type?

**Status**: OPEN (linked to OQ-3)

**Context**: At settlement, should the reducer create a summary entry that captures the totals for that cycle? This would make it easy to display "Cycle April: $450 charged, $400 paid, $50 outstanding" without re-aggregating all entries.

**Options**:
- A. Yes — `CYCLE_SUMMARY` entry created at settlement with breakdown (total overage, total recurring, total proration, total payments for that cycle)
- B. No — derive cycle summaries from the ledger entries on read (query function in utils)

**Affects**:
- `LedgerEntryType` enum — if A, add `CYCLE_SUMMARY`
- `LedgerEntry` type — if A, may need additional fields for breakdown amounts
- `settleBillingCycle` reducer — if A, must create the summary entry
- Utils — if B, need `summarizeCycle(ledgerEntries, cycleStart)` function

---

### OQ-8: Is the ledger single-currency or per-entry?

**Status**: OPEN

**Context**: `SubscriptionInstanceState` already has `globalCurrency`. Individual services and metrics have their own `currency` fields. The ledger needs to handle amounts — in one currency or many?

**Options**:
- A. Single currency (globalCurrency) — all ledger entries use `globalCurrency`. Conversion happens before entry creation. Simpler arithmetic.
- B. Per-entry currency — each `LedgerEntry` has its own `currency`. Requires conversion logic when summing totals. More flexible but much more complex.

**Affects**:
- `LedgerEntry` type — if A, `currency` field could be removed (implied by `globalCurrency`); if B, keep it and add conversion utils
- `totalDebt` / `totalCredit` — if B, these must specify their currency and conversion rates become a concern
- `calculateAmountOwed()` util — if B, needs currency conversion logic

---

### OQ-9: What if `totalDebt - totalCredit` is negative at settlement (customer overpaid)?

**Status**: OPEN

**Context**: Customer has more credit than debt — e.g., they made a large payment, then removed services generating more credits.

**Options**:
- A. Carry forward — negative balance (credit surplus) rolls into the next cycle, reduces next cycle's effective charge
- B. Refund — trigger a refund mechanism (likely Stripe-side, not in doc model)
- C. Cap at zero — `amountOwed` is `max(0, totalDebt - totalCredit)`, surplus just sits as excess credit

**Affects**:
- `calculateAmountOwed()` util — if C, add floor at zero
- Settlement reducer — if A, no special handling needed (math just works); if B, need a new `REFUND` entry type
- Stripe integration (downstream) — if B, refund trigger needed

---

### OQ-10: Should settlement fail/warn if there's unsettled debt from previous cycles?

**Status**: OPEN

**Context**: Operator settles cycle 2, but cycle 1's debt was never fully paid (totalDebt > totalCredit from cycle 1).

**Options**:
- A. No guard — settlement always succeeds. Unpaid debt from previous cycles just accumulates. The running totals reflect the full history.
- B. Warn but proceed — settlement succeeds but reducer adds a flag or note indicating outstanding previous debt
- C. Block — settlement fails if there's outstanding debt from prior cycles

**Affects**:
- `settleBillingCycle` reducer — if C, need to check balance before proceeding
- Error types — if C, need `OutstandingDebtError`
- `SubscriptionInstanceState` — if B, may need an `outstandingDebtWarning: Boolean` or similar

---

## Cross-Reference: Open Questions → Doc Model Impact

| OQ | Schema Impact | Reducer Impact | Utils Impact |
|----|--------------|----------------|--------------|
| OQ-3 | `LedgerEntryType` (if CYCLE_SUMMARY) | `settleBillingCycle` (cleanup logic) | None |
| OQ-4 | None | `resumeSubscription` (cycle continuation vs reset) | `calculateNextBillingDate` (if extending) |
| OQ-5 | Error types (if blocking changes) | `addService`, `removeService` (status guard) | Proration (effectiveDate logic) |
| OQ-6 | `LedgerEntry` (reversal fields) | New operation or entry type for corrections | Counter recalculation |
| OQ-7 | `LedgerEntryType` (CYCLE_SUMMARY) | `settleBillingCycle` (summary creation) | `summarizeCycle()` function |
| OQ-8 | `LedgerEntry.currency` field scope | All reducers creating entries | Conversion utils if multi-currency |
| OQ-9 | Possibly `REFUND` entry type | Settlement (floor logic or refund trigger) | `calculateAmountOwed()` floor |
| OQ-10 | Possibly error type | `settleBillingCycle` (balance check) | None |
