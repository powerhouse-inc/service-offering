# Billing Engine Demo Walkthrough

**Audience**: Wouter (first time seeing billing lifecycle in the subscription instance)
**Test document**: `http://localhost:3001/d/preview-1e38b0a0/94004d1b-7744-4f98-90d1-4c7cf13b8d11`
**Date**: 2026-04-17

---

## Opening

> "Remember the sprint planning session on April 9th where you laid out how billing cycles should work — proration, settlement, overage, the counter model? All of that is implemented and running in the subscription instance doc model and editor. Let me walk you through it."

---

## Act 1 — Activation (BA-5)

**Your rule**: "At that moment you owe the fixed costs and the setup cost. You pay in advance." (00:42:57)

### What to show

1. Open the test subscription — it starts in **PENDING** status with 5 service groups configured
2. Switch to **Operator View**
3. Click **Activate**

### What happens under the hood

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | Open `{}` inspector → `ACTIVATE_SUBSCRIPTION` operation. Input is just `{ activatedSince }` — no pricing in the input. | Operation inspector |
| **Reducer** | The reducer at [subscription.ts:207-241](document-models/subscription-instance/v1/src/reducers/subscription.ts#L207-L241) loops all groups and services, sums every `setupCost.amount` + `recurringCost.amount` → writes `state.totalDebt`. Also sets `currentBillingCycleStart` and calculates `nextBillingDate`. | Code |
| **State** | The editor BillingPanel shows "Outstanding Balance: **$11,020**" — that's `totalDebt - totalCredit` derived live. Cycle shows Apr 17 → May 17 (Monthly). | Editor UI |

### The math

| Group | Setup | Recurring | Total |
|-------|-------|-----------|-------|
| Core Tools & Documentation | — | — | $0 |
| Financial Operations & Reporting | — | $750 | $750 |
| Entity & Compliance Foundation | $3,000 | — | $3,000 |
| Financial Operations & Reporting Add-On | $3,600 | $1,810 | $5,410 |
| Advanced & Scale Add-On | — | $1,860 | $1,860 |
| **Total** | **$6,600** | **$4,420** | **$11,020** |

### Key point for Wouter

> "The activation reducer reads ALL costs from the subscription state — nothing comes from user input except the timestamp. The pricing was locked in during the PENDING phase when we imported from the service offering."

---

## Act 2 — Payments (Constrained)

**Your rule**: "If the payment comes in you update the credit." (01:04:27)

### What to show

1. In the BillingPanel, find the **Report Payments** section (operator view, after activation)
2. Click **Mark Paid** on "Entity & Compliance Foundation" setup ($3,000)
3. Watch Outstanding Balance drop from $11,020 to $8,020

### What happens under the hood

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | Open `{}` → `REPORT_SETUP_PAYMENT`. Input: `{ serviceId: "sg-entity-compliance", paymentDate: "..." }`. **No amount field, no currency field.** | Operation inspector |
| **Reducer** | [service.ts:155-189](document-models/subscription-instance/v1/src/reducers/service.ts#L155-L189) — finds the group by ID, reads `setupCost.amount` from state ($3,000), adds that to `totalCredit`. Sets `paymentDate` on the cost. | Code |
| **State** | BillingPanel: Outstanding Balance now $8,020. Setup cost shows "Paid" tag. `totalCredit` went from 0 → 3,000. | Editor UI |

### Now show the guard — try to pay it again

4. The "Mark Paid" button is gone (replaced with "Paid" tag)
5. If dispatched programmatically, the reducer throws `ReportSetupPaymentAlreadyPaidError`

### Show recurring payment

6. Click **Report Payment** on "Financial Operations & Reporting" recurring ($750)
7. Outstanding Balance drops to $7,270

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | `REPORT_RECURRING_PAYMENT` with `{ serviceId: "sg-finops", paymentDate: "..." }`. Again — **no amount**. | Operation inspector |
| **Reducer** | [service.ts:190-230](document-models/subscription-instance/v1/src/reducers/service.ts#L190-L230) — reads `recurringCost.amount` ($750) from state. Sets `lastPaymentDate`. Per-cycle guard: if `lastPaymentDate >= currentBillingCycleStart`, throws `AlreadyPaidThisCycleError`. | Code |
| **State** | Balance down. Button shows "Paid" for this cycle. After settlement advances the cycle, the button reappears. | Editor UI |

### Key point for Wouter

> "The operator can't type in an amount. The system knows what's owed for each line item. Click 'paid' and it credits the right number. Can't double-pay setup costs. Can't pay recurring twice in the same cycle."

---

## Act 3 — Usage Metrics & Dynamic Costs

**Your rule**: "Reset cycles can be set at the individual metric level, independent of the billing cycle." (00:55:28)

### What to show

1. Find the **Invoice management** service inside the Financial Operations group
2. It has a metric: "Invoice(s)" — 5 free, up to 10 paid at $21/unit
3. Click **+** to increment usage to 8 (3 over the free limit)
4. Watch the **Dynamic Costs** section appear in BillingPanel showing: `3 × $21 = $63`

### What happens under the hood

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | `INCREMENT_METRIC_USAGE` with `{ serviceId, metricId, incrementBy: 1, currentTime }`. Status guard: ACTIVE only. | Operation inspector |
| **Reducer** | [metrics.ts:136-164](document-models/subscription-instance/v1/src/reducers/metrics.ts#L136-L164) — increments `currentUsage`, capped at `paidLimit` (10). | Code |
| **State** | `metric.currentUsage: 8`. The BillingPanel computes overage live via `calculateOverageCost()`: `max(0, 8 - 5) × $21 = $63`. This is a **projection** — not yet charged to `totalDebt`. | Editor UI |

### Key point for Wouter

> "The $63 is a projection. It's what WOULD be charged if we settled now. The actual charge happens at settlement — that's when it hits totalDebt."

---

## Act 4 — Settlement (D-4)

**Your rule**: "There will be situations where you want to just close the billing cycle prematurely... or we've just been lagging and it's like 6 weeks and we want to bill now." (00:40:05)

### What to show

1. Click **Settle Cycle** (green button in operator actions)
2. Use the date picker or accept default (today's date)
3. Watch: Outstanding Balance jumps up (overage + next cycle recurring added to debt), metrics reset to 0, cycle dates advance

### What happens under the hood

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | `SETTLE_BILLING_CYCLE` with `{ settlementDate }`. Just a timestamp — all calculation is deterministic from state. | Operation inspector |
| **Reducer** | [subscription.ts:355-427](document-models/subscription-instance/v1/src/reducers/subscription.ts#L355-L427) — four steps: (1) Calculate overage per metric → `totalDebt`. (2) Reset metrics where `usageResetPeriod <= billingCycle`. (3) If autoRenew: add next cycle recurring costs → `totalDebt`, advance `currentBillingCycleStart` and `nextBillingDate`. (4) If not autoRenew: status → EXPIRING. | Code |
| **State** | `totalDebt` increased by $63 (overage) + $4,420 (next cycle recurring). Metrics back to 0. Cycle advanced: May 17 → Jun 16. | Editor UI |

### The settlement math

| Component | Amount |
|-----------|--------|
| Overage: 3 invoices × $21 | +$63 to totalDebt |
| Next cycle: FinOps recurring | +$750 to totalDebt |
| Next cycle: FinOps Add-On recurring | +$1,810 to totalDebt |
| Next cycle: Advanced Add-On recurring | +$1,860 to totalDebt |
| **Total added to debt** | **$4,483** |

### Key points for Wouter

> "Settlement date doesn't shift the cycle. If I settle late, overage is still calculated up to the original nextBillingDate — no extra usage sneaks in. If I settle early, overage window ends at the settlement date."
>
> "Cycle boundaries are fixed — they always advance from `nextBillingDate`, not from when I clicked the button."

---

## Act 5 — Overage Payment

**New capability**: After settlement adds overage to totalDebt, the operator can report it as paid.

### What to show

1. After settlement, some of the Outstanding Balance is from overage ($63) and some from recurring
2. Mark the recurring line items as paid (Report Payment buttons)
3. The remaining balance is the overage + unpaid items
4. Click **Pay Balance** — credits the exact remaining amount

### What happens under the hood

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | `REPORT_OVERAGE_PAYMENT` with `{ paymentDate, amount }`. Unlike setup/recurring, overage keeps an amount field because it's an aggregate across metrics — no single line item. | Operation inspector |
| **Reducer** | [service.ts:249-262](document-models/subscription-instance/v1/src/reducers/service.ts#L249-L262) — validates `amount > 0`, validates `amount <= (totalDebt - totalCredit)`. Can't credit more than what's owed. | Code |
| **State** | `totalCredit` increases. Outstanding Balance drops to $0 ("Paid up"). | Editor UI |

### Key point for Wouter

> "Every payment path is constrained. Setup and recurring: amount locked to the line item, no user input. Overage: amount is user-supplied but capped at the outstanding balance. You literally cannot inflate the credit counter beyond what's owed."

---

## Act 6 — Mid-Cycle Proration (D-1/D-2)

**Your rule**: "If you add a seat, it's going to charge you prorata for the ongoing billing cycle." (00:44:40)
**Your formula**: "If it's a month of 30 days and we're 10 days in, I'm going to pay 2/3 for the 20 remaining days." (00:46:09)

### What to show — Add

1. Click **+ Add Service Group** at the bottom of Recurring Services
2. The modal loads available add-ons from the service offering (this is the cross-document read — `serviceOfferingId` fix)
3. Select an add-on, click **Add Group**
4. Outstanding Balance increases by the **prorated** amount (not the full cycle cost)

### What happens under the hood

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | `ADD_SERVICE_GROUP` with `{ groupId, name, recurringAmount, ... }`. | Operation inspector |
| **Reducer** | [service-group.ts:17-83](document-models/subscription-instance/v1/src/reducers/service-group.ts#L17-L83) — creates the group, then if ACTIVE: calls `calculateProratedCost(recurringAmount, cycleStart, cycleEnd, now)` → adds prorated amount to `totalDebt`. Setup cost added in full immediately. | Code |
| **Utils** | [utils.ts:58-68](document-models/subscription-instance/v1/src/utils.ts#L58-L68) — `(remainingDays / totalDays) × amount`. Your exact formula. | Code |
| **State** | `totalDebt` increased by prorated amount (not full cycle). New group visible in services panel. | Editor UI |

### What to show — Remove (D-2)

5. Remove the group you just added
6. Outstanding Balance **decreases** — prorated credit applied

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | `REMOVE_SERVICE_GROUP` with `{ groupId }`. No pricing input — reads from group state. | Operation inspector |
| **Reducer** | [service-group.ts:85-121](document-models/subscription-instance/v1/src/reducers/service-group.ts#L85-L121) — same `calculateProratedCost()`, but result goes to `totalCredit` instead of `totalDebt`. | Code |
| **State** | `totalCredit` increased. Group gone. Balance drops. | Editor UI |

### Key point for Wouter

> "Same formula for add and remove — `remainingDays / totalDays × cost`. Add goes to debt, remove goes to credit. Symmetric, like you described it."

---

## Act 7 — Manual Renewal (D-9)

**Your rule**: When autoRenew is off, settlement moves to EXPIRING. Manual renewal starts a new cycle.

### What to show

1. Toggle **Auto-Renew** off
2. Click **Settle Cycle** — status changes to **EXPIRING** (instead of staying ACTIVE)
3. Click **Renew** — status goes back to ACTIVE, new cycle starts, recurring costs charged

### What happens under the hood

| Layer | What to show | Where to look |
|-------|-------------|---------------|
| **Operation** | `RENEW_EXPIRING_SUBSCRIPTION` with `{ timestamp }`. | Operation inspector |
| **Reducer** | [subscription.ts:279-311](document-models/subscription-instance/v1/src/reducers/subscription.ts#L279-L311) — sets ACTIVE, advances cycle boundaries from `nextBillingDate` (D-4 fixed boundaries), adds recurring costs to `totalDebt`. | Code |
| **State** | New cycle dates. Recurring costs added to debt. Status ACTIVE again. | Editor UI |

---

## Act 8 — Negative Balance / Credit Carry-Forward (D-7)

**Your rule**: "If the payment comes in you update the credit and that's how you get to a balance of zero." (01:04:27)

### What to show

1. Pay all line items so balance is $0
2. At this point, if a prorated credit from a group removal makes `totalCredit > totalDebt`, the balance goes **negative**
3. Remove an optional add-on group → prorated credit → balance goes negative
4. BillingPanel shows "Credit Balance: $X" in **green** instead of "Outstanding Balance" in red
5. Next settlement adds recurring costs → balance trends back toward zero naturally

### Key point for Wouter

> "No special handling. No refund logic. Credit carries forward and offsets the next cycle's charges. The math just works — exactly like Slack and Stripe do it."

---

## Closing — The Design Pattern

For every billing event in this system, the same pattern holds:

1. **Operation**: just the intent + a timestamp. No calculated values in the input.
2. **Reducer**: deterministic calculation from current state. Same input + same state = same result, always.
3. **State**: running counters (`totalDebt`, `totalCredit`). The editor derives everything from these.
4. **Audit trail**: the operation history. Replay the operations, you get the same state.

This is D-3 — counters, not a ledger. The Reactor's event sourcing IS the audit trail.

---

## Supporting Materials

| Document | Purpose |
|----------|---------|
| [00-master.md](00-master.md) | Executive summary — every decision traced to implementation |
| [01-activation-billing.md](01-activation-billing.md) | BA-5: Setup + first cycle charged on activation |
| [02-proration-charge-timing.md](02-proration-charge-timing.md) | D-1: Mid-cycle add proration with real-world validation |
| [03-downgrade-policy.md](03-downgrade-policy.md) | D-2: Mid-cycle remove credit |
| [04-settlement-timing.md](04-settlement-timing.md) | D-4: Fixed cycle boundaries, early/late settlement |
| [05-ledger-structure.md](05-ledger-structure.md) | D-3: Counter model, reducer touchpoints |
| [06-negative-balance.md](06-negative-balance.md) | D-7: Credit carry-forward |
| [07-pause-resume.md](07-pause-resume.md) | D-5: Paused days lost, cycle continues |
| [08-manual-renewal.md](08-manual-renewal.md) | D-9: Manual renewal billing |
| [09-operation-status-matrix.md](09-operation-status-matrix.md) | D-6: What's allowed in each status |
| [10-outstanding-debt-settlement.md](10-outstanding-debt-settlement.md) | D-8: Settlement always succeeds |
| [11-metric-reset-cycles.md](11-metric-reset-cycles.md) | Independent metric resets |
| [12-payment-reporting.md](12-payment-reporting.md) | Constrained payments + overage path |
| [13-cross-document-read.md](13-cross-document-read.md) | Service offering → subscription link |
| [evidence/](evidence/) | Screenshots: Stripe, Zoom, Slack, AWS, Google Workspace |
