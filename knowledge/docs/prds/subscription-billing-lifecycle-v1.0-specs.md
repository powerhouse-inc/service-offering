# Subscription Billing Lifecycle — Architecture Specification

**Version**: 1.0
**Date**: 2026-04-16
**Stage**: Architect → Developer handoff
**Requirements**: [billing-lifecycle-business-logic.md](../../../BA_Input/billing-lifecycle-business-logic.md) (D-1 through D-8)
**WBD**: [doc-model-revisions-wbd.md](../../../BA_Input/doc-model-revisions-wbd.md) (Track 2 + 3)

---

## 1. Summary

Adds billing lifecycle mechanics to the Subscription Instance document model: debt/credit tracking, billing cycle settlement, mid-cycle proration, status guards, and pure calculation utils. No new types on state (counters only, per D-3). One new operation. Six updated operation inputs. Six new error types. One removed operation.

**Model impact**: `powerhouse/subscription-instance` only.
**Subgraph impact**: None (billing data is consumed via editor, not exposed via subgraph queries yet).
**Editor impact**: `subscription-instance-editor` — billing-utils refactor + settlement UI.

---

## 2. Schema Changes

### 2.1 Updated State Schema

The state type `SubscriptionInstanceState` gains 3 fields and loses 2.

```graphql
type SubscriptionInstanceState {
    # --- existing fields (unchanged) ---
    customerId: PHID
    customerName: String
    customerEmail: EmailAddress
    customerType: CustomerType
    teamMemberCount: Int
    operatorId: PHID
    serviceOfferingId: PHID
    tierName: String
    tierPricingOptionId: OID
    tierPrice: Amount_Money
    tierCurrency: Currency
    tierPricingMode: TierPricingMode
    selectedBillingCycle: BillingCycle
    globalCurrency: Currency
    resource: ResourceDocument
    status: SubscriptionStatus!
    createdAt: DateTime
    activatedSince: DateTime
    pausedSince: DateTime
    expiringSince: DateTime
    renewalDate: DateTime
    cancelledSince: DateTime
    cancellationReason: String
    autoRenew: Boolean!
    operatorNotes: String
    budget: BudgetCategory
    nextBillingDate: DateTime
    services: [Service!]!
    serviceGroups: [ServiceGroup!]!

    # --- NEW FIELDS (D-3, D-4) ---
    currentBillingCycleStart: DateTime    # Explicit start of current billing cycle
    totalDebt: Amount_Money               # Running sum of all charges (globalCurrency)
    totalCredit: Amount_Money             # Running sum of all payments/credits (globalCurrency)

    # --- REMOVED FIELDS ---
    # projectedBillAmount: Amount_Money   ← now derived via calculateAmountOwed()
    # projectedBillCurrency: Currency     ← now derived (uses globalCurrency)
}
```

**MCP action sequence** (SET_STATE_SCHEMA, scope: global):
1. Add `currentBillingCycleStart`, `totalDebt`, `totalCredit` after `nextBillingDate`
2. Remove `projectedBillAmount` and `projectedBillCurrency`
3. Update `initialValue` JSON to include `"currentBillingCycleStart": null, "totalDebt": null, "totalCredit": null` and remove `projectedBillAmount`/`projectedBillCurrency`

**Updated initialValue**:
```json
{
  "customerId": null,
  "customerName": null,
  "customerEmail": null,
  "customerType": null,
  "teamMemberCount": null,
  "operatorId": null,
  "serviceOfferingId": null,
  "tierName": null,
  "tierPricingOptionId": null,
  "tierPrice": null,
  "tierCurrency": null,
  "tierPricingMode": null,
  "selectedBillingCycle": null,
  "globalCurrency": null,
  "resource": null,
  "status": "PENDING",
  "createdAt": null,
  "activatedSince": null,
  "pausedSince": null,
  "expiringSince": null,
  "renewalDate": null,
  "cancelledSince": null,
  "cancellationReason": null,
  "autoRenew": false,
  "operatorNotes": null,
  "budget": null,
  "nextBillingDate": null,
  "currentBillingCycleStart": null,
  "totalDebt": null,
  "totalCredit": null,
  "services": [],
  "serviceGroups": []
}
```

### 2.2 New Operation: SETTLE_BILLING_CYCLE

**Module**: `subscription`
**Scope**: global

```graphql
input SettleBillingCycleInput {
    settlementDate: DateTime!
}
```

**Errors**:

| Error Name | Error Code | Description |
|------------|-----------|-------------|
| `NoBillingCycleActiveError` | `NO_BILLING_CYCLE_ACTIVE` | Subscription status is not ACTIVE |
| `SettlementDateBeforeCycleStartError` | `SETTLEMENT_DATE_BEFORE_CYCLE_START` | `settlementDate` < `currentBillingCycleStart` |

**Reducer logic** (specification — Developer writes the actual code):

```
1. Guard: if status !== "ACTIVE" → throw NoBillingCycleActiveError
2. Guard: if settlementDate < currentBillingCycleStart → throw SettlementDateBeforeCycleStartError
3. Determine overage window: endDate = min(settlementDate, nextBillingDate)
4. For each service (flat + in groups):
   a. For each metric with unitCost:
      - overage = max(0, currentUsage - (freeLimit ?? 0))
      - If paidLimit: overage = min(overage, paidLimit - (freeLimit ?? 0))
      - cost = overage * unitCost.amount
      - totalDebt += cost
   b. If shouldResetMetric(metric, settlementDate): reset currentUsage = 0
5. If autoRenew:
   a. For each service group with recurringCost: totalDebt += recurringCost.amount
   b. For each standalone service with recurringCost: totalDebt += recurringCost.amount
   c. currentBillingCycleStart = nextBillingDate
   d. nextBillingDate = calculateNextBillingDate(nextBillingDate, selectedBillingCycle)
6. If NOT autoRenew:
   a. status = "EXPIRING"
   b. expiringSince = settlementDate
```

### 2.3 Updated Operation Inputs

#### 2.3.1 Service module — effectiveDate additions

**ADD_SERVICE** — add `effectiveDate: DateTime` to input:

```graphql
input AddServiceInput {
    serviceId: OID!
    name: String
    description: String
    customValue: String
    setupAmount: Amount_Money
    setupCurrency: Currency
    setupBillingDate: DateTime
    setupPaymentDate: DateTime
    recurringAmount: Amount_Money
    recurringCurrency: Currency
    recurringBillingCycle: BillingCycle
    recurringNextBillingDate: DateTime
    recurringLastPaymentDate: DateTime
    recurringDiscount: DiscountServiceInfoInput
    effectiveDate: DateTime                        # NEW — proration anchor (D-1)
}
```

**REMOVE_SERVICE** — add `effectiveDate: DateTime` to input:

```graphql
input RemoveServiceInput {
    serviceId: OID!
    effectiveDate: DateTime                        # NEW — proration anchor (D-2)
}
```

**New errors for service module** (D-6):

| Error Name | Error Code | Operation(s) | Description |
|------------|-----------|-------------|-------------|
| `SubscriptionNotActiveAddServiceError` | `SUBSCRIPTION_NOT_ACTIVE_ADD_SERVICE` | ADD_SERVICE | Status must be PENDING or ACTIVE |
| `SubscriptionNotActiveRemoveServiceError` | `SUBSCRIPTION_NOT_ACTIVE_REMOVE_SERVICE` | REMOVE_SERVICE | Status must be PENDING or ACTIVE |

#### 2.3.2 Service-group module — effectiveDate additions

**ADD_SERVICE_TO_GROUP** — add `effectiveDate: DateTime`:

```graphql
input AddServiceToGroupInput {
    groupId: OID!
    serviceId: OID!
    name: String
    description: String
    customValue: String
    setupAmount: Amount_Money
    setupCurrency: Currency
    setupBillingDate: DateTime
    setupPaymentDate: DateTime
    recurringAmount: Amount_Money
    recurringCurrency: Currency
    recurringBillingCycle: BillingCycle
    recurringNextBillingDate: DateTime
    recurringLastPaymentDate: DateTime
    effectiveDate: DateTime                        # NEW — proration anchor (D-1)
}
```

**REMOVE_SERVICE_FROM_GROUP** — add `effectiveDate: DateTime`:

```graphql
input RemoveServiceFromGroupInput {
    groupId: OID!
    serviceId: OID!
    effectiveDate: DateTime                        # NEW — proration anchor (D-2)
}
```

**New errors for service-group module** (D-6):

| Error Name | Error Code | Operation(s) | Description |
|------------|-----------|-------------|-------------|
| `StructuralChangeNotAllowedAddGroupError` | `STRUCTURAL_CHANGE_NOT_ALLOWED_ADD_GROUP` | ADD_SERVICE_GROUP | Status must be PENDING for structural changes |
| `StructuralChangeNotAllowedRemoveGroupError` | `STRUCTURAL_CHANGE_NOT_ALLOWED_REMOVE_GROUP` | REMOVE_SERVICE_GROUP | Status must be PENDING for structural changes |
| `SubscriptionNotActiveAddToGroupError` | `SUBSCRIPTION_NOT_ACTIVE_ADD_TO_GROUP` | ADD_SERVICE_TO_GROUP | Status must be PENDING or ACTIVE |
| `SubscriptionNotActiveRemoveFromGroupError` | `SUBSCRIPTION_NOT_ACTIVE_REMOVE_FROM_GROUP` | REMOVE_SERVICE_FROM_GROUP | Status must be PENDING or ACTIVE |

#### 2.3.3 Service module — payment input expansion

**REPORT_SETUP_PAYMENT** — add `amount` and `currency`:

```graphql
input ReportSetupPaymentInput {
    serviceId: OID!
    paymentDate: DateTime!
    amount: Amount_Money!                          # NEW — for totalCredit update (D-3)
    currency: Currency!                            # NEW — for currency tracking
}
```

**REPORT_RECURRING_PAYMENT** — add `amount` and `currency`:

```graphql
input ReportRecurringPaymentInput {
    serviceId: OID!
    paymentDate: DateTime!
    amount: Amount_Money!                          # NEW — for totalCredit update (D-3)
    currency: Currency!                            # NEW — for currency tracking
}
```

#### 2.3.4 Metrics module — new errors

| Error Name | Error Code | Operation(s) | Description |
|------------|-----------|-------------|-------------|
| `SubscriptionNotActiveUpdateUsageError` | `SUBSCRIPTION_NOT_ACTIVE_UPDATE_USAGE` | UPDATE_METRIC_USAGE | Status must be ACTIVE |
| `SubscriptionNotActiveIncrementUsageError` | `SUBSCRIPTION_NOT_ACTIVE_INCREMENT_USAGE` | INCREMENT_METRIC_USAGE | Status must be ACTIVE |
| `SubscriptionNotActiveDecrementUsageError` | `SUBSCRIPTION_NOT_ACTIVE_DECREMENT_USAGE` | DECREMENT_METRIC_USAGE | Status must be ACTIVE |

### 2.4 Updated Reducer: RENEW_EXPIRING_SUBSCRIPTION (D-9)

**Module**: `subscription`
**Operation ID**: `op-renew-expiring-subscription` (existing — no schema change needed)

The existing input is sufficient (`timestamp: DateTime!`, `newRenewalDate: DateTime`). The **reducer** needs billing initialization logic added:

```
1. Guard: status must be EXPIRING (already exists)
2. status = "ACTIVE" (already exists)
3. expiringSince = null (already exists)
4. NEW: currentBillingCycleStart = nextBillingDate (pick up from expired cycle end)
5. NEW: nextBillingDate = calculateNextBillingDate(nextBillingDate, selectedBillingCycle)
6. NEW: For each service group with recurringCost: totalDebt += recurringCost.amount
7. NEW: For each standalone service with recurringCost: totalDebt += recurringCost.amount
8. renewalDate = newRenewalDate || null (already exists)
```

**Cycle boundary rule (D-4)**: New cycle starts from `nextBillingDate`, not from `timestamp`. If cycle expired April 30 and customer renews May 5, new cycle = April 30 – May 30. No date drift.

**MCP action**: SET_OPERATION_REDUCER on `op-renew-expiring-subscription` with updated logic.

---

### 2.5 Removed Operation: UPDATE_BILLING_PROJECTION

**Module**: `subscription`
**Operation ID**: `op-update-billing-projection`

Remove entirely. `projectedBillAmount` and `projectedBillCurrency` no longer exist on state. The projection is now a derived value via `calculateUnsettledBill()` / `calculateAmountOwed()`.

**MCP action**: `DELETE_OPERATION` with `operationId: "op-update-billing-projection"` on module `mod-subscription`.

---

## 3. Operation Table (Complete)

### 3.1 New Operations

| Operation | Module | Input Schema | Purpose | Errors | Decision |
|-----------|--------|-------------|---------|--------|----------|
| `SETTLE_BILLING_CYCLE` | subscription | `{ settlementDate: DateTime! }` | Close billing cycle, calculate overage, advance or expire | `NoBillingCycleActiveError`, `SettlementDateBeforeCycleStartError` | D-4 |

### 3.2 Modified Operations (input changes)

| Operation | Module | Added Fields | Decision |
|-----------|--------|-------------|----------|
| `ADD_SERVICE` | service | `effectiveDate: DateTime` | D-1 |
| `REMOVE_SERVICE` | service | `effectiveDate: DateTime` | D-2 |
| `ADD_SERVICE_TO_GROUP` | service-group | `effectiveDate: DateTime` | D-1 |
| `REMOVE_SERVICE_FROM_GROUP` | service-group | `effectiveDate: DateTime` | D-2 |
| `REPORT_SETUP_PAYMENT` | service | `amount: Amount_Money!, currency: Currency!` | D-3 |
| `REPORT_RECURRING_PAYMENT` | service | `amount: Amount_Money!, currency: Currency!` | D-3 |

### 3.3 Modified Operations (reducer changes only — no input changes)

| Operation | Module | Reducer Change | Decision |
|-----------|--------|---------------|----------|
| `RENEW_EXPIRING_SUBSCRIPTION` | subscription | Add billing initialization: advance cycle dates, add recurring costs to totalDebt | D-9 |

### 3.3 Removed Operations

| Operation | Module | Reason |
|-----------|--------|--------|
| `UPDATE_BILLING_PROJECTION` | subscription | State fields removed; projection is now derived |

### 3.4 New Error Types (by module)

| Module | Error Name | Error Code | Operation(s) |
|--------|-----------|-----------|-------------|
| subscription | `NoBillingCycleActiveError` | `NO_BILLING_CYCLE_ACTIVE` | SETTLE_BILLING_CYCLE |
| subscription | `SettlementDateBeforeCycleStartError` | `SETTLEMENT_DATE_BEFORE_CYCLE_START` | SETTLE_BILLING_CYCLE |
| service | `SubscriptionNotActiveAddServiceError` | `SUBSCRIPTION_NOT_ACTIVE_ADD_SERVICE` | ADD_SERVICE |
| service | `SubscriptionNotActiveRemoveServiceError` | `SUBSCRIPTION_NOT_ACTIVE_REMOVE_SERVICE` | REMOVE_SERVICE |
| service-group | `StructuralChangeNotAllowedAddGroupError` | `STRUCTURAL_CHANGE_NOT_ALLOWED_ADD_GROUP` | ADD_SERVICE_GROUP |
| service-group | `StructuralChangeNotAllowedRemoveGroupError` | `STRUCTURAL_CHANGE_NOT_ALLOWED_REMOVE_GROUP` | REMOVE_SERVICE_GROUP |
| service-group | `SubscriptionNotActiveAddToGroupError` | `SUBSCRIPTION_NOT_ACTIVE_ADD_TO_GROUP` | ADD_SERVICE_TO_GROUP |
| service-group | `SubscriptionNotActiveRemoveFromGroupError` | `SUBSCRIPTION_NOT_ACTIVE_REMOVE_FROM_GROUP` | REMOVE_SERVICE_FROM_GROUP |
| metrics | `SubscriptionNotActiveUpdateUsageError` | `SUBSCRIPTION_NOT_ACTIVE_UPDATE_USAGE` | UPDATE_METRIC_USAGE |
| metrics | `SubscriptionNotActiveIncrementUsageError` | `SUBSCRIPTION_NOT_ACTIVE_INCREMENT_USAGE` | INCREMENT_METRIC_USAGE |
| metrics | `SubscriptionNotActiveDecrementUsageError` | `SUBSCRIPTION_NOT_ACTIVE_DECREMENT_USAGE` | DECREMENT_METRIC_USAGE |

---

## 4. MCP Action Sequence

Execute on document `9707bb0e-b5be-4816-b6df-3d7c0608018f` (SubscriptionInstance on vetra-1e38b0a0 drive).

### Phase 1: State schema update

```
Action 1: SET_STATE_SCHEMA (scope: "global")
  - Full updated schema with:
    - currentBillingCycleStart, totalDebt, totalCredit added
    - projectedBillAmount, projectedBillCurrency removed
  - Updated initialValue JSON

Action 2: SET_INITIAL_STATE (scope: "global")
  - Updated JSON with new fields, removed fields
```

### Phase 2: Remove dead operation

```
Action 3: DELETE_OPERATION
  - moduleId: "mod-subscription"
  - operationId: "op-update-billing-projection"
```

### Phase 3: Add new operation

```
Action 4: ADD_OPERATION
  - moduleId: "mod-subscription"
  - id: "op-settle-billing-cycle"
  - name: "SETTLE_BILLING_CYCLE"
  - scope: "global"
  - description: "Settle the current billing cycle — calculate overage, reset metrics, advance or expire"
  - template: "Settle the current billing cycle"

Action 5: SET_OPERATION_SCHEMA (op-settle-billing-cycle)
  - schema: SettleBillingCycleInput

Action 6: ADD_OPERATION_ERROR (op-settle-billing-cycle)
  - NoBillingCycleActiveError

Action 7: ADD_OPERATION_ERROR (op-settle-billing-cycle)
  - SettlementDateBeforeCycleStartError

Action 8: SET_OPERATION_REDUCER (op-settle-billing-cycle)
  - reducer code (see section 2.2 for logic spec)
```

### Phase 4: Update existing operation schemas

```
Action 9: SET_OPERATION_SCHEMA (op-add-service)
  - Updated AddServiceInput with effectiveDate

Action 10: SET_OPERATION_SCHEMA (op-remove-service)
  - Updated RemoveServiceInput with effectiveDate

Action 11: SET_OPERATION_SCHEMA (op-add-service-to-group)
  - Updated AddServiceToGroupInput with effectiveDate

Action 12: SET_OPERATION_SCHEMA (op-remove-service-from-group)
  - Updated RemoveServiceFromGroupInput with effectiveDate

Action 13: SET_OPERATION_SCHEMA (op-report-setup-payment)
  - Updated ReportSetupPaymentInput with amount + currency

Action 14: SET_OPERATION_SCHEMA (op-report-recurring-payment)
  - Updated ReportRecurringPaymentInput with amount + currency
```

### Phase 5: Add new error types to existing operations

```
Actions 15-16: ADD_OPERATION_ERROR on ADD_SERVICE, REMOVE_SERVICE
  - SubscriptionNotActiveAddServiceError
  - SubscriptionNotActiveRemoveServiceError

Actions 17-20: ADD_OPERATION_ERROR on service-group operations
  - StructuralChangeNotAllowedAddGroupError (ADD_SERVICE_GROUP)
  - StructuralChangeNotAllowedRemoveGroupError (REMOVE_SERVICE_GROUP)
  - SubscriptionNotActiveAddToGroupError (ADD_SERVICE_TO_GROUP)
  - SubscriptionNotActiveRemoveFromGroupError (REMOVE_SERVICE_FROM_GROUP)

Actions 21-23: ADD_OPERATION_ERROR on metrics operations
  - SubscriptionNotActiveUpdateUsageError (UPDATE_METRIC_USAGE)
  - SubscriptionNotActiveIncrementUsageError (INCREMENT_METRIC_USAGE)
  - SubscriptionNotActiveDecrementUsageError (DECREMENT_METRIC_USAGE)
```

### Phase 6: Update reducers with status guards + billing logic

```
Actions 24+: SET_OPERATION_REDUCER on all modified operations
  - Each reducer gets status guards per D-6 matrix
  - activateSubscription gets billing initialization
  - addService/removeService/addServiceToGroup/removeServiceFromGroup get proration
  - addServiceGroup/removeServiceGroup get PENDING-only guard
  - reportSetupPayment/reportRecurringPayment get totalCredit update
  - metric usage operations get ACTIVE-only guard
```

---

## 5. Calculation Utils Specification

**Location**: `document-models/subscription-instance/v1/src/utils.ts`

All pure functions. No side effects. No state mutation. All amounts in `globalCurrency`.

### 5.1 BILLING_CYCLE_DAYS

```typescript
const BILLING_CYCLE_DAYS: Record<string, number> = {
  MONTHLY: 30,
  QUARTERLY: 91,
  SEMI_ANNUAL: 182,
  ANNUAL: 365,
  ONE_TIME: 0,
};
```

### 5.2 calculateNextBillingDate

```typescript
function calculateNextBillingDate(fromDate: string, billingCycle: string): string
```

Adds the cycle duration (in days) to `fromDate`. Returns ISO date string.

### 5.3 calculateProratedCost

```typescript
function calculateProratedCost(
  amount: number,
  cycleStart: string,
  cycleEnd: string,
  effectiveDate: string,
): number
```

Formula: `(remainingDays / totalCycleDays) * amount`
- `totalCycleDays` = diff in days between `cycleEnd` and `cycleStart`
- `remainingDays` = diff in days between `cycleEnd` and `effectiveDate`
- Returns 0 if `effectiveDate` >= `cycleEnd` or `totalCycleDays` <= 0

### 5.4 calculateOverageCost

```typescript
function calculateOverageCost(
  metric: { currentUsage: number; freeLimit?: number | null; paidLimit?: number | null; unitCost?: { amount: number } | null },
): number
```

Formula: `max(0, currentUsage - (freeLimit ?? 0)) * unitCost.amount`
- If `paidLimit`: cap overage at `paidLimit - (freeLimit ?? 0)`
- Returns 0 if no `unitCost`

### 5.5 calculateTotalOverage

```typescript
function calculateTotalOverage(
  services: Array<{ metrics: Array<...> }>,
  serviceGroups: Array<{ services: Array<{ metrics: Array<...> }> }>,
): number
```

Sums `calculateOverageCost()` across all metrics in all services (flat + grouped).

### 5.6 calculateAmountOwed

```typescript
function calculateAmountOwed(state: { totalDebt?: number | null; totalCredit?: number | null }): number
```

Returns `(totalDebt ?? 0) - (totalCredit ?? 0)`. Can be negative (credit surplus per D-7).

### 5.7 calculateUnsettledBill

```typescript
function calculateUnsettledBill(
  state: SubscriptionInstanceState,
): number
```

Returns `calculateAmountOwed(state) + calculateTotalOverage(state.services, state.serviceGroups)`.
This is the "what would the bill be if we settled right now" projection.

### 5.8 shouldResetMetric

```typescript
function shouldResetMetric(
  metric: { usageResetPeriod?: string | null },
  billingCycle: string,
): boolean
```

Returns true if the metric's `usageResetPeriod` matches the `billingCycle` or is a subdivision of it (e.g., MONTHLY metric resets on QUARTERLY settlement).

---

## 6. Reducer Specifications (Status Guards)

The Developer must add status guards to every reducer per the D-6 matrix. The pattern is:

```typescript
// At the top of each reducer:
const ALLOWED_STATUSES = ["PENDING", "ACTIVE"]; // varies per operation
if (!ALLOWED_STATUSES.includes(state.status)) {
  throw new SpecificStatusError(`Cannot perform X when status is ${state.status}`);
}
```

For the **activateSubscription** reducer, the existing guard already works. The new billing logic appended after the status transition:

```
// After: state.status = "ACTIVE"; state.activatedSince = ...
state.currentBillingCycleStart = action.input.activatedSince;
state.nextBillingDate = calculateNextBillingDate(action.input.activatedSince, state.selectedBillingCycle);
state.totalDebt = 0;
state.totalCredit = 0;

// Sum all setup costs across services and service groups
// Sum all recurring costs for first cycle
// Add both to totalDebt
```

---

## 7. Editor Impact

### 7.1 billing-utils.ts refactor

The existing `computeMetricOverage()` and `computeBillingBreakdown()` functions in `editors/subscription-instance-editor/components/billing-utils.ts` should delegate to the new doc model utils:

- `computeMetricOverage()` → calls `calculateOverageCost()` from doc model utils
- `computeBillingBreakdown().projectedTotal` → replaced by `calculateUnsettledBill()` from doc model utils
- `calculateAmountOwed()` → new function from doc model utils, replaces any direct reads of `projectedBillAmount`

Formatting functions (`formatCurrency`, `formatDate`, `formatBillingCycleSuffix`, etc.) stay in the editor — they are UI concerns.

### 7.2 UI changes needed

- Replace any display of `projectedBillAmount` with `calculateAmountOwed(state)` or `calculateUnsettledBill(state)`
- Add "Settle Billing Cycle" button/action (dispatches `SETTLE_BILLING_CYCLE`)
- Display `currentBillingCycleStart` and `nextBillingDate` as cycle boundaries
- Display `totalDebt` and `totalCredit` with "Amount Owed" derived display
- Disable service add/remove controls when status ≠ PENDING or ACTIVE
- Disable metric controls when status ≠ ACTIVE

---

## 8. Subgraph Impact

**None.** The subgraph at `subgraphs/resources-services/` does not currently expose subscription billing fields. The new fields (`totalDebt`, `totalCredit`, `currentBillingCycleStart`) and the removed fields (`projectedBillAmount`, `projectedBillCurrency`) are consumed by the editor only.

If subgraph exposure is needed later, it's a separate task.

---

## 9. Implementation Order

The Developer should execute in this order:

1. **MCP Phase 1**: State schema update (SET_STATE_SCHEMA + SET_INITIAL_STATE)
2. **MCP Phase 2**: Delete UPDATE_BILLING_PROJECTION operation
3. **MCP Phase 3**: Add SETTLE_BILLING_CYCLE operation with schema, errors, reducer
4. **MCP Phase 4**: Update existing operation input schemas
5. **MCP Phase 5**: Add new error types to existing operations
6. **MCP Phase 6**: Update all reducers with status guards + billing logic
7. **src/utils.ts**: Write calculation util functions
8. **src/reducers/*.ts**: Update all reducer files to match MCP (both steps required per CLAUDE.md)
9. **Editor refactor**: Update billing-utils.ts
10. **Run `npm run tsc` and `npm run lint:fix`** to validate

### Dependencies between steps

- Steps 1-6 are MCP actions (codegen runs after each)
- Step 7 (utils) has no MCP dependency — can be written in parallel with MCP actions
- Step 8 (reducer files) must happen after MCP actions (needs generated types)
- Step 9 (editor) must happen after step 7 (imports from utils)

---

## 10. Handoff Notes for Developer

1. **CRITICAL**: Both MCP updates AND manual `src/` file updates are required for every reducer change. Forgetting the MCP update means future codegen will overwrite your fixes.

2. **Error naming convention**: Error names must be unique per module and end with "Error". Error codes use UPPER_SNAKE_CASE. Follow the existing pattern in `gen/*/error.ts`.

3. **Proration in reducers**: When status is ACTIVE and `effectiveDate` is provided, call `calculateProratedCost()` and add to `totalDebt` (add) or `totalCredit` (remove). When status is PENDING, skip proration — it's setup phase with no active cycle.

4. **Settlement reducer is the most complex**: Follow the logic spec in section 2.2 exactly. The overage window is `min(settlementDate, nextBillingDate)` — this handles both early and late settlement per D-4.

5. **Don't add `projectedBillAmount` back**: It's tempting to keep it as a convenience field. Don't — it's a derived value now. The editor computes it via `calculateUnsettledBill()`.

6. **Payment inputs are now required**: `ReportSetupPaymentInput` and `ReportRecurringPaymentInput` now require `amount` and `currency`. This is a **breaking change** for any existing callers. The subgraph mutation `createProductInstances` may need updating if it dispatches these operations.

7. **Testing**: Write tests for the settlement reducer with these scenarios: on-time settlement, late settlement (after nextBillingDate), early settlement (before nextBillingDate), settlement with autoRenew=false, settlement with zero overage. Remember: errors are recorded on `operation.error`, NOT via `expect().toThrow()`.
