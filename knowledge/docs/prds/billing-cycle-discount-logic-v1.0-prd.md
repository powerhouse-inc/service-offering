# Billing Cycle & Discount Logic - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: Subscriptions need flexible billing cycle management where a global default cycle applies discount incentives (e.g., 20% off for annual billing), but operators and clients must also be able to override billing cycles per service group without breaking the discount model.
- **Target Users**: Operators (service providers managing subscriptions) and Clients (subscribers viewing their billing projections).
- **Value Proposition**: Enables granular billing cycle control per service group while maintaining a coherent discount system — preventing confusing "all-or-nothing" cycle choices and allowing operators to tailor billing to each client's needs.

### Feature Overview

- **Core Features**:
  1. **Global Billing Cycle** — a subscription-level default cycle (Monthly, Quarterly, Annual) with tier-defined discounts applied uniformly to all recurring service groups, except add-ons. 
  2. **Custom Billing Cycle Mode** — triggered when any service group's cycle is overridden; switches the subscription to per-group cycle tracking with per-group discount application; non-overrriden groups inherit the previously selected cycle discounts. "Set Subscription Plan & Billing Cycle" now has CUSTOM on top of the predefined cycles in "Tiers" step. 
  3. **Auto-Remerge** — when all service groups end up on the same cycle (through manual changes or removal of overridden groups), the subscription automatically reverts to global cycle mode
  4. **Discount Inheritance vs. Custom** — each service group either inherits its discount from the tier or defines its own (mutually exclusive); done in the Services step in the editor: every reccuring service group has the same creation wizard as add-ons
  5. **Discount Validation** — system prevents discounts from exceeding the recurring base price

- **Feature Boundaries**:
  - Applies to **recurring service groups** only
  - **Add-ons** are independent: they have their own cycle and discount settings and are never affected by tier-level discounts
  - Discounts apply to **recurring base price only** — not to usage metrics and not to setup costs

- **User Scenarios**:
  - **Scenario 1 (Global)**: Client selects Annual billing. All 3 service groups get the tier-defined annual discount (e.g., $20 off each, this is visually expressed at the top/tier level as it is now). Subscription shows "Annual" as the billing cycle.
  - **Scenario 2 (Custom trigger)**: Client overrides Service Group A to Monthly. Subscription switches to "Custom." Groups B and C retain Annual with their respective discounts applied individually, shown in their service group header. Group A is now Monthly with no annual discount and with discounts shown if they are defined for group A for that specific billing cycle, 
  - **Scenario 3 (Remerge)**: Operator switches Group A back to Annual. If all groups are now Annual, then Subscription auto-remerges to Global "Annual" mode.
  

### Detailed Requirements

#### Billing Cycle Options
| Cycle      | Description              |
|------------|--------------------------|
| Monthly    | Billed every month       |
| Quarterly  | Billed every 3 months    |
| Annual     | Billed every 12 months   |
| Custom     | Per-group cycle tracking |

#### Discount Model

- **Discount Input**: Operator enters a **flat dollar amount** (the discount value, e.g., "$20 off")
- **Discount Display**: System calculates and expresses the discount as a **percentage** to the client (e.g., "20% off" when base is $100)
- **Discount Scope**: Applied to recurring base price only
- **Discount per Cycle**: Each billing cycle option (Monthly, Quarterly, Annual) can have its own discount amount. Some cycles may have no discount (zero).
- **Discount Source** (mutually exclusive per service group):
  - **Inherit from Tier**: Service group uses the discount defined at the tier level for the active billing cycle
  - **Custom Group Discount**: Service group defines its own discount amount (same mechanism as add-ons)

#### Global vs. Custom Mode Logic

```
IF all service groups share the same billing cycle:
  → Mode = GLOBAL
  → Display selected cycle (Monthly/Quarterly/Annual)
  → Apply tier-level discounts to all service groups (unless group has custom discount)

IF any service group has a different billing cycle:
  → Mode = CUSTOM
  → Display "Custom" in billing cycle selector
  → Each service group tracked independently
  → Non-overridden groups retain the previous default cycle
  → Discounts applied per-group based on each group's cycle and discount source
```

#### Auto-Remerge Rules

The subscription automatically reverts from Custom to Global mode when:
1. An operator switches an overridden group's cycle back to match all others


#### Validation Rules

- Discount amount **must not exceed** the recurring base price of the service group
- Discount amount **must be >= 0** (no negative discounts)
- Price after discount **must be > $0** (system prevents zero-cost recurring services)

#### Add-on Behavior (Out of Scope but Documented)
- Add-ons have their own billing cycle and discount settings
- Add-ons are **never** affected by tier-level discounts
- Add-on discount configuration is identical to custom group-level discounts

### Data Requirements

#### Service Group Billing Fields
| Field                | Type            | Description                                                  |
|----------------------|-----------------|--------------------------------------------------------------|
| `billingCycle`       | Enum            | Monthly, Quarterly, Annual (inherited from global or custom) |
| `cycleOverridden`    | Boolean         | Whether this group has a custom cycle override               |
| `discountSource`     | Enum            | `TIER_INHERITED` or `CUSTOM`                                 |
| `discountAmounts`    | Object          | Flat discount amount per cycle (e.g., `{ monthly: 0, quarterly: 10, annual: 20 }`) — only used when `discountSource = CUSTOM` |

#### Subscription-Level Billing Fields
| Field                | Type            | Description                                          |
|----------------------|-----------------|------------------------------------------------------|
| `defaultBillingCycle`| Enum            | Monthly, Quarterly, Annual                           |
| `billingMode`        | Enum            | `GLOBAL` or `CUSTOM`                                 |
| `currency`           | Currency        | Single global currency for the subscription instance |

#### Tier-Level Discount Fields
| Field                | Type            | Description                                         |
|----------------------|-----------------|-----------------------------------------------------|
| `cycleDiscounts`     | Object          | Flat discount amounts per cycle (e.g., `{ monthly: 0, quarterly: 10, annual: 20 }`) |

### Edge Cases

1. **All groups on Monthly with no discounts**: Global mode, Monthly selected, no discount applied — straightforward
2. **Single service group subscription**: Overriding the only group's cycle still triggers Custom mode (consistent behavior), but since there's only one group it's functionally equivalent
3. **Discount exceeds base price**: System blocks the input with a validation error
4. **Operator removes all service groups**: No billing cycle applicable — subscription has no recurring charges (only add-ons and/or metrics if any)
5. **Cycle change with existing discount**: When a group's cycle changes, the discount for the new cycle is applied (could be different or zero)

## Design Decisions

### Technical Approach
- **Architecture Choice**: Billing cycle and discount logic lives in the **subscription-instance document model** reducers. The service-offering document model defines the available tier discounts. The subscription instance references and applies them.
- **Key Components**:
  - Subscription-level billing mode state (`GLOBAL` / `CUSTOM`)
  - Per-service-group cycle and discount tracking
  - Auto-remerge detection logic in reducers
  - Discount validation in reducers
- **Data Storage**: All state stored in the subscription-instance document model's global state
- **Interface Design**: Editor UI shows billing cycle toggle (Monthly / Quarterly / Annual / Custom) at the top, with per-group cycle badges when in Custom mode

### Constraints
- **Performance Requirements**: Discount calculations are synchronous and deterministic (pure reducer functions)
- **Compatibility**: Must work with existing service-offering tier definitions and subscription-instance schema
- **Security**: Operators can modify billing cycles and discounts; clients have read-only view
- **Scalability**: Model supports any number of service groups with independent cycle/discount settings

### Risk Assessment
- **Technical Risks**: Auto-remerge logic must handle all edge cases (removal, reversion, adding new groups). Mitigation: comprehensive test coverage for mode transitions.
- **Dependency Risks**: Depends on service-offering tier discount definitions being available in the subscription instance. Mitigation: import/sync mechanism already exists.
- **UX Risk**: "Custom" mode could confuse clients. Mitigation: clear per-group badges and billing projection breakdown.

## Acceptance Criteria

### Functional Acceptance
- [ ] Global billing cycle applies tier discount to all recurring service groups when all groups share the same cycle
- [ ] Overriding any single service group's cycle switches subscription to Custom mode
- [ ] In Custom mode, non-overridden groups retain the previous default cycle with their respective discounts
- [ ] Each service group can independently inherit tier discount OR set a custom discount (mutually exclusive)
- [ ] Discounts are entered as flat amounts by operator and displayed as percentages to clients
- [ ] Each billing cycle option can have its own discount amount (or no discount)
- [ ] Discount applies to recurring base price only (not metrics, not setup costs)
- [ ] Auto-remerge to Global mode when all groups end up on the same cycle
- [ ] Auto-remerge triggers when overridden group is removed and remaining groups share cycle
- [ ] System prevents discount from exceeding recurring base price
- [ ] Add-ons are unaffected by tier-level discounts and maintain independent cycle/discount settings

### Quality Standards
- [ ] Code Quality: Reducers are pure, synchronous, deterministic functions
- [ ] Test Coverage: Unit tests for all mode transitions (Global → Custom → Global), discount inheritance, validation, and edge cases
- [ ] Performance Metrics: All calculations complete synchronously within reducer execution
- [ ] Type Safety: Full TypeScript coverage with no `any` types

### User Acceptance
- [ ] Operator can select global billing cycle and see discount applied
- [ ] Operator can override individual service group cycles
- [ ] "Custom" badge appears in billing cycle selector when in custom mode
- [ ] Each service group displays its billing cycle badge
- [ ] Billing projection correctly reflects per-group discounts
- [ ] Client view shows percentage discounts clearly

## Execution Phases

### Phase 1: Schema & Model Updates
**Goal**: Update subscription-instance document model to support billing cycle modes and per-group discounts
- [ ] Add `billingMode` (GLOBAL/CUSTOM) to subscription-level state
- [ ] Add per-service-group billing cycle override fields
- [ ] Add discount source (TIER_INHERITED/CUSTOM) and discount amounts to service group state
- [ ] Add cycle discount definitions to tier-level configuration
- [ ] Update GraphQL schema and regenerate types
- **Deliverables**: Updated schema, generated types, initial state structure

### Phase 2: Reducer Logic
**Goal**: Implement billing cycle and discount business logic
- [ ] Implement global-to-custom mode transition logic
- [ ] Implement auto-remerge detection logic
- [ ] Implement discount inheritance from tier vs. custom group discount
- [ ] Implement discount validation (cannot exceed base price)
- [ ] Implement per-group discount calculation (flat amount → percentage)
- **Deliverables**: Working reducers with mode transitions and discount logic

### Phase 3: Editor UI
**Goal**: Build operator and client-facing billing cycle UI
- [ ] Add billing cycle selector with Custom option at subscription level
- [ ] Add per-service-group cycle override controls
- [ ] Add discount source toggle (inherit tier / custom) per group
- [ ] Add per-cycle discount amount input fields
- [ ] Display calculated percentage discount to client
- [ ] Show per-group billing cycle badges in Custom mode
- **Deliverables**: Functional editor with billing cycle and discount management

### Phase 4: Testing & Validation
**Goal**: Comprehensive testing of all billing cycle scenarios
- [ ] Unit tests for all mode transitions
- [ ] Unit tests for discount calculation and validation
- [ ] Unit tests for auto-remerge scenarios
- [ ] Integration tests with service-offering tier discounts
- [ ] TypeScript and lint checks pass
- **Deliverables**: Full test suite, passing CI checks

---

**Document Version**: 1.0
**Created**: 2026-02-17
**Clarification Rounds**: 4
**Quality Score**: 93/100
