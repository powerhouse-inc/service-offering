# Finalized Requirements — Service Offering Ecosystem v2

## DOMAIN A: Service Offering Document Model + Editor (must stay in parity)

### REQ-1: Introduce ServiceGroup as Core Organizational Unit

**Why:** Services need a grouping layer that owns billing frequency, separating "how often" (group) from "how much" (tier).

**Current state:**

- Services are flat (`services[]`) with `parentServiceId` for hierarchy
- `setupServices: [String!]!` and `recurringServices: [String!]!` are loose string arrays
- `OptionGroup` exists for add-ons with `isAddOn: Boolean`

**Change:**

Add a new `ServiceGroup` type that groups core (non-add-on) services:

```graphql
type ServiceGroup {
    id: OID!
    name: String!
    description: String
    billingCycle: BillingCycle!       # MONTHLY, QUARTERLY, ANNUAL, etc.
    displayOrder: Int
}
```

- Each `Service` gains a `serviceGroupId: OID` linking it to a group
- Remove `setupServices: [String!]!` and `recurringServices: [String!]!` from root state — they're replaced by group membership
- `ServiceGroup` and `OptionGroup` coexist: groups organize core services, option groups organize add-ons

**New operations needed:**

- `ADD_SERVICE_GROUP`, `UPDATE_SERVICE_GROUP`, `DELETE_SERVICE_GROUP`, `REORDER_SERVICE_GROUPS`

**Editor:** Add a group management UI. Services are created/displayed within their group. Group header shows billing cycle.

---

### REQ-2: Restructure Pricing — Tier vs Add-On Split

**Why:** Core service pricing belongs on tiers (bundle price). Add-on pricing belongs on the add-on group itself (additive cost).

**Current state:**

- `ServiceSubscriptionTier.pricing` has `billingCycle`
- `TierPricingOption` has `billingCycle`, `amount`, `currency`, `setupFee`
- `OptionGroup` has no pricing

**Change for Tiers:**

- `ServicePricing` loses `billingCycle` — billing cycle now comes from `ServiceGroup`
- `TierPricingOption` loses `billingCycle` — the tier price is the bundle price regardless; the billing frequency is per-group
- Tier `pricingOptions[]` remain: they represent different price points for the tier (e.g., commitment discounts)

**Change for OptionGroup (add-ons):**

`OptionGroup` gains pricing fields since add-ons are priced separately:

```graphql
type OptionGroup {
    id: OID!
    name: String!
    description: String
    isAddOn: Boolean!
    defaultSelected: Boolean!
    costType: GroupCostType!           # NEW: RECURRING or SETUP
    billingCycle: BillingCycle         # NEW: only if costType = RECURRING
    price: Amount_Money               # NEW: group-level price
    currency: Currency                # NEW
}

enum GroupCostType {
    RECURRING
    SETUP
}
```

**Total cost formula:**

```
Total = Tier bundle price + Σ(selected add-on group prices)
```

---

### REQ-3: Per-Service Cost Type in Add-On Groups

**Why:** Within an add-on group, individual services may be recurring or one-time setup costs.

**Change:** Add `costType` to `Service` (applicable only when the service belongs to an add-on `OptionGroup`):

```graphql
type Service {
    ...existing fields...
    costType: ServiceCostType        # NEW: RECURRING | SETUP (for add-on services)
    price: Amount_Money              # NEW: per-service price (for add-on services)
    currency: Currency               # NEW
}

enum ServiceCostType {
    RECURRING
    SETUP
}
```

**Rule:** If the parent `OptionGroup.costType` is set, services inherit it by default. Individual services can override if the group allows mixed types (group `costType` acts as the default).

---

### REQ-4: Metric Limits — Free Floor + Paid Ceiling

**Why:** Usage-based pricing needs a clear free tier and a hard cap before upgrade, not just a single limit.

**Current state:** `ServiceUsageLimit` has `limit: Int` (single boundary) and `unitPrice` for overage.

**Change:**

```graphql
type ServiceUsageLimit {
    id: OID!
    serviceId: OID!
    metric: String!
    unitName: String
    freeLimit: Int                # NEW: units included in base tier (free floor)
    paidLimit: Int                # NEW: max paid units before upgrade required
    resetCycle: UsageResetCycle   # RENAMED from resetPeriod, reduced options
    notes: String
    unitPrice: Amount_Money
    unitPriceCurrency: Currency
    # REMOVE: limit (replaced by freeLimit + paidLimit)
    # REMOVE: unitPriceBillingCycle (inherited from ServiceGroup)
    # REMOVE: resetPeriod (replaced by resetCycle)
}
```

**Behavior:**

| Usage Range | Billing | Action |
|---|---|---|
| 0 → freeLimit | Included in tier price | No charge |
| freeLimit → paidLimit | unitPrice per unit | Overage billed |
| > paidLimit | Blocked | Upgrade required |

**Editor:** Metric rows in tier definition must show both limit fields prominently. Visual indicator for the three zones.

---

### REQ-5: Separate Usage Reset Cycle from Billing Cycle

**Why:** A metric might bill monthly (inherited from group) but reset usage daily.

**Change:**

- **Billing cycle:** Inherited from the `ServiceGroup.billingCycle` — no longer stored on the metric
- **Reset cycle:** Stays on the metric, constrained to a shorter set of options:

```graphql
enum UsageResetCycle {
    DAILY
    WEEKLY
    MONTHLY
}
```

- Remove `unitPriceBillingCycle` from `ServiceUsageLimit`
- Remove `resetPeriod` enum, replace with `UsageResetCycle`

**Editor:** Reset cycle displayed in the metric header/card prominently. Billing cycle shown as inherited (read-only, from group).

---

## DOMAIN B: Service Subscription Document Model

### REQ-6: Resolve Auto-Renew vs Cancellation Duplication

**Current state:** Two overlapping mechanisms — `RENEW_SUBSCRIPTION` extends the period, `CANCEL_SUBSCRIPTION` ends it. No explicit auto-renew flag.

**Change:**

- Add `autoRenew: Boolean!` to state (default `true`)
- Remove `RENEW_SUBSCRIPTION` operation — renewal is implicit when `autoRenew` is `true` and period ends
- `CANCEL_SUBSCRIPTION` sets `autoRenew: false` and records when cancellation takes effect (end of current period)

**Simplify `SubscriptionStatus`:**

```graphql
enum SubscriptionStatus {
    PENDING       # Created but not yet active
    ACTIVE        # Running (autoRenew true or false, still in period)
    EXPIRED       # Period ended and autoRenew was false
}
```

- Remove `PAUSED` and `CANCELLED` as separate statuses — a subscription with `autoRenew: false` is still `ACTIVE` until its period ends, then becomes `EXPIRED`

**Operations after cleanup:**

- `INITIALIZE_SUBSCRIPTION` — stays
- `ACTIVATE_SUBSCRIPTION` — stays
- `CANCEL_SUBSCRIPTION` — sets `autoRenew: false`, `cancelledAt`, optional reason
- `SET_PRICING` — stays
- **Remove** `UPDATE_SUBSCRIPTION_STATUS` — status transitions are driven by the operations above
- **Remove** `RENEW_SUBSCRIPTION` — handled by auto-renew logic

---

### REQ-7: Remove Scope Creep — Focus on Billing Projection

**What stays (core subscription tracking):**

- Offering/tier/add-on references
- Current period dates
- Pricing snapshot
- Auto-renew flag + cancellation info
- Facet selections

**What must NOT be added:**

- Invoices / billing history
- Communication channels
- Payment methods
- Detailed usage logs

**What gets added (billing projection — stored in state, updated by processor):**

```graphql
type ServiceSubscriptionState {
    ...trimmed existing fields...
    nextBillingDate: DateTime         # Computed: currentPeriodEnd if autoRenew
    projectedBillAmount: Amount_Money # Computed: tier price + add-on prices
    projectedBillCurrency: Currency   # Computed: from pricing
}
```

#### Decision: Store in state, updated by a processor

Grounded in the Powerhouse architecture principles (CLAUDE.md):

1. **Reducers must be pure** — you cannot compute `projectedBillAmount` inside a reducer because it requires reading another document (the service offering's pricing). Cross-document reads are a side effect — forbidden in reducers.

2. **The ecosystem explicitly has processors** — CLAUDE.md states the project creates "document models, editors, processors and subgraphs." Processors exist precisely for this: reacting to document changes and dispatching derived operations.

3. **All state changes go through operations** — the Powerhouse model is operation-sourced. If projected billing exists as state, it must get there via an operation like `UPDATE_BILLING_PROJECTION`, dispatched by a processor.

4. **Subgraphs consume state, not UI logic** — if `projectedBillAmount` is only derived at render time in the editor, it's invisible to subgraphs and external consumers. Storing it in state makes it queryable.

**The pattern:**

```
Processor watches:
  - Subscription document (tier changes, add-on changes, period changes)
  - Service Offering document (pricing changes)

On change → computes:
  - nextBillingDate (from currentPeriodEnd + autoRenew)
  - projectedBillAmount (tier price + Σ add-on prices)

Dispatches:
  - UPDATE_BILLING_PROJECTION operation with computed values as input
```

**This means REQ-7 adds:**

- **State fields:** `nextBillingDate`, `projectedBillAmount`, `projectedBillCurrency`
- **One new operation:** `UPDATE_BILLING_PROJECTION` (only callable by processor, not by the editor)
- **One processor:** watches subscription + offering, dispatches projections
- The editor simply reads and displays these fields — no computation at render time.

---

### REQ-8: Cached Snippets for Clarity

Apply to both Subscription and Resource Instance models:

```graphql
# Service Subscription
type ServiceSubscriptionState {
    ...existing...
    serviceOfferingTitle: String      # Cached from offering document
    customerName: String              # Cached from customer document
}

# Resource Instance
type ResourceInstanceState {
    ...existing...
    customerName: String              # Cached from customer document
    resourceTemplateName: String      # Cached from template document
}
```

**Update mechanism:** A processor watches the source documents and updates cached snippets when names change. Slight staleness is acceptable for display purposes.

---

## Implementation Dependency Order

```
Phase 1 (Service Offering — structural)
  ├─ REQ-1: ServiceGroup type + operations + migration of services
  ├─ REQ-2: Pricing restructure (tier cleanup + OptionGroup pricing)
  └─ REQ-3: Per-service cost type in add-ons

Phase 2 (Service Offering — metrics)
  ├─ REQ-4: Free/paid metric limits
  └─ REQ-5: Reset cycle separation

Phase 3 (Service Offering Editor)
  └─ Mirror all Phase 1+2 changes in editor UI

Phase 4 (Subscription)
  ├─ REQ-6: Auto-renew resolution
  ├─ REQ-7: Scope cleanup + billing projection
  └─ REQ-8: Cached snippets
```
