# Billing Lifecycle — Unified Diagram

Copy each diagram into Excalidraw's mermaid import (or render with any mermaid viewer).

---

## 1. Subscription State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: createDocument

    PENDING --> ACTIVE: activateSubscription\n[BA-5] setup + recurring → totalDebt\ncycle boundaries initialized

    ACTIVE --> PAUSED: pauseSubscription\n[D-5] no billing change\npaused days lost
    PAUSED --> ACTIVE: resumeSubscription\n[D-5] no billing change\ncycle unchanged

    ACTIVE --> ACTIVE: settleBillingCycle\n[D-4] autoRenew=true\noverage → totalDebt\nrecurring → totalDebt\ncycle advanced

    ACTIVE --> EXPIRING: settleBillingCycle\n[D-4] autoRenew=false\noverage → totalDebt\nno recurring charged

    EXPIRING --> ACTIVE: renewExpiringSubscription\n[D-9] recurring → totalDebt\ncycle advanced from nextBillingDate

    ACTIVE --> CANCELLED: cancelSubscription\n[D-6] usage frozen
    PAUSED --> CANCELLED: cancelSubscription
    EXPIRING --> CANCELLED: cancelSubscription

    note right of ACTIVE
        Mid-cycle operations:
        addServiceGroup → D-1 proration debit
        removeServiceGroup → D-2 proration credit
        incrementMetricUsage → usage tracked
        resetMetricCycle → overage charged
    end note

    note right of PENDING
        Setup phase:
        All config allowed
        Cost updates allowed
        No billing counters yet
    end note
```

---

## 2. Money Flow (Debt / Credit / Balance)

```mermaid
flowchart TB
    subgraph DEBT["totalDebt (charges)"]
        direction TB
        BA5["BA-5: Activation\nsetup + recurring costs"]
        D1["D-1: Mid-cycle group add\ncalculateProratedCost → debit"]
        D4_OVR["D-4: Settlement overage\ncalculateOverageCost per metric"]
        D4_REC["D-4: Settlement recurring\nnext cycle costs if autoRenew"]
        D9_REC["D-9: Manual renewal\nrecurring costs for new cycle"]
        MET_RST["Metric reset\noverage charged before reset"]
    end

    subgraph CREDIT["totalCredit (payments + credits)"]
        direction TB
        D2["D-2: Mid-cycle group remove\ncalculateProratedCost → credit"]
        PAY_S["reportSetupPayment\namount → credit"]
        PAY_R["reportRecurringPayment\namount → credit"]
    end

    subgraph BALANCE["Outstanding Balance = totalDebt − totalCredit"]
        direction TB
        POS["Positive → owes money 🔴"]
        ZERO["Zero → paid up ⚪"]
        NEG["Negative → credit surplus 🟢\nD-7: carries forward, no floor"]
    end

    DEBT --> BALANCE
    CREDIT --> BALANCE

    subgraph D3["D-3: Counters, not arrays"]
        direction TB
        AUDIT["Audit trail = Reactor operation history"]
        NO_LEDGER["No ledger entries on state"]
    end

    subgraph D8["D-8: No debt guard on settlement"]
        direction TB
        NO_BLOCK["Settlement always succeeds\ndebt is a UI concern"]
    end
```

---

## 3. Settlement Flow (D-4 Detail)

```mermaid
flowchart TD
    START["SETTLE_BILLING_CYCLE\nsettlementDate input"]
    GUARD1{"status === ACTIVE?"}
    GUARD2{"settlementDate >=\ncurrentBillingCycleStart?"}
    WINDOW["Overage window =\nmin(settlementDate, nextBillingDate)"]

    subgraph METRICS["Per metric across all services"]
        CALC["calculateOverageCost\nmax(0, usage - freeLimit) × unitCost\ncapped at paidLimit"]
        CHARGE["cost > 0?\ntotalDebt += cost"]
        RESET{"shouldResetMetric?\nmetric period <= billing cycle"}
        DO_RESET["currentUsage = 0"]
    end

    RENEW{"autoRenew?"}

    subgraph YES_RENEW["Auto-renew path"]
        ADD_REC["Add recurring costs → totalDebt"]
        ADVANCE["currentBillingCycleStart = nextBillingDate\nnextBillingDate += cycleDuration"]
    end

    subgraph NO_RENEW["Manual path"]
        EXPIRING["status → EXPIRING\nD-9 handles renewal"]
    end

    START --> GUARD1
    GUARD1 -->|No| ERR1["NoBillingCycleActiveError"]
    GUARD1 -->|Yes| GUARD2
    GUARD2 -->|No| ERR2["SettlementDateBeforeCycleStartError"]
    GUARD2 -->|Yes| WINDOW
    WINDOW --> METRICS
    CALC --> CHARGE
    CHARGE --> RESET
    RESET -->|Yes| DO_RESET
    RESET -->|No| RENEW
    DO_RESET --> RENEW
    RENEW -->|Yes| YES_RENEW
    RENEW -->|No| NO_RENEW
```

---

## 4. Proration Formula (D-1 / D-2)

```mermaid
flowchart LR
    subgraph FORMULA["calculateProratedCost"]
        TOTAL["totalDays = daysBetween(cycleStart, cycleEnd)"]
        REMAIN["remainingDays = daysBetween(effectiveDate, cycleEnd)"]
        CALC["result = (remainingDays / totalDays) × amount"]
    end

    subgraph ADD["D-1: Mid-cycle ADD group"]
        ADD_IN["input: recurringAmount"]
        ADD_OUT["totalDebt += proratedCost"]
        ADD_FILE["service-group.ts:63-79"]
    end

    subgraph REMOVE["D-2: Mid-cycle REMOVE group"]
        REM_IN["state: group.recurringCost.amount"]
        REM_OUT["totalCredit += proratedCredit"]
        REM_FILE["service-group.ts:102-118"]
    end

    subgraph GOOGLE["Google Workspace example"]
        GOOG_IN["3 seats → 1 seat on Mar 22\n€48.60 prepaid for Mar 1-31"]
        GOOG_CALC["3 seats × 22d = €34.49\n1 seat × 9d = €4.70\ntotal = €39.19"]
        GOOG_CREDIT["€48.60 - €39.19 = €9.41 credit"]
        GOOG_GAP["GAP: no quantity field\non ServiceGroup yet"]
    end

    ADD_IN --> FORMULA
    REM_IN --> FORMULA
    FORMULA --> ADD_OUT
    FORMULA --> REM_OUT
    GOOG_IN --> GOOG_CALC --> GOOG_CREDIT --> GOOG_GAP
```

---

## 5. Operation Status Matrix (D-6)

```mermaid
flowchart TD
    subgraph MATRIX["Operation Status Matrix — D-6"]
        direction TB

        subgraph PENDING_OPS["PENDING — setup phase"]
            P1["✅ addServiceGroup — no proration"]
            P2["✅ removeServiceGroup — no proration"]
            P3["✅ addService / addServiceToGroup"]
            P4["✅ updateServiceSetupCost"]
            P5["✅ updateServiceRecurringCost"]
            P6["✅ updateServiceGroupCost"]
            P7["✅ reportPayment"]
            P8["❌ metric operations"]
            P9["❌ settleBillingCycle"]
        end

        subgraph ACTIVE_OPS["ACTIVE — billing live"]
            A1["✅ addServiceGroup — D-1 proration"]
            A2["✅ removeServiceGroup — D-2 credit"]
            A3["✅ addService / addServiceToGroup"]
            A4["✅ increment/decrement/update usage"]
            A5["✅ resetMetricCycle"]
            A6["✅ settleBillingCycle"]
            A7["✅ reportPayment"]
            A8["❌ cost updates"]
        end

        subgraph PAUSED_OPS["PAUSED — frozen D-5"]
            PA1["❌ everything except payment"]
            PA2["✅ reportPayment"]
        end

        subgraph EXPIRING_OPS["EXPIRING — wind down"]
            E1["❌ everything except payment + renew"]
            E2["✅ reportPayment"]
            E3["✅ renewExpiringSubscription — D-9"]
        end

        subgraph CANCELLED_OPS["CANCELLED — terminal"]
            C1["❌ everything except payment"]
            C2["✅ reportPayment"]
        end
    end
```

---

## 6. File Map

```mermaid
flowchart LR
    subgraph REDUCERS["Reducer Files"]
        SG["service-group.ts\naddServiceGroup D-1\nremoveServiceGroup D-2\naddServiceToGroup\nremoveServiceFromGroup\nupdateServiceGroupCost"]
        SUB["subscription.ts\nactivateSubscription BA-5\npause/resume D-5\ncancel D-6\nrenewExpiring D-9\nsettleBillingCycle D-4\nsetAutoRenew"]
        MET["metrics.ts\nincrement/decrement/update usage\nresetMetricCycle\naddServiceMetric"]
        SVC["service.ts\naddService/removeService\nreportSetupPayment\nreportRecurringPayment\nupdateCosts"]
    end

    subgraph UTILS["utils.ts"]
        U1["calculateProratedCost — D-1, D-2"]
        U2["calculateOverageCost — D-4, metric reset"]
        U3["calculateNextBillingDate — BA-5, D-4, D-9"]
        U4["calculateAmountOwed — D-3, D-7"]
        U5["shouldResetMetric — D-4"]
        U6["findServiceById — metrics, payments"]
    end

    subgraph EDITOR["Editor Components"]
        EA["SubscriptionActions.tsx\nActivate, Pause, Resume\nCancel, Renew, Settle"]
        EB["BillingPanel.tsx\nOutstanding Balance\nCost breakdown\nPayment buttons"]
        EC["ServicesPanel.tsx\nService cards\nAdd/Remove group"]
        ED["MetricActions.tsx\nIncrement/Decrement\nReset Cycle"]
    end

    SG --> U1
    SUB --> U2
    SUB --> U3
    SUB --> U5
    MET --> U6
    SVC --> U6
    UTILS --> EDITOR
```
