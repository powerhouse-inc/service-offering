# Tier ↔ Service Group Pricing Linkage — PRD

## Requirements Description

### Background

- **Business Problem**: The current service offering editor treats tier prices and service group prices as independent values. Stakeholder decision SO-Q1 established that `Tier Price = SUM(service group prices for that tier)`, but the implementation still allows operators to set a flat tier price disconnected from its constituent service groups. This creates pricing inconsistency, confuses operators, and makes it impossible to verify that the sum of parts equals the advertised whole.
- **Target Users**: Operators configuring service offerings
- **Value Proposition**: Enforce pricing integrity between tiers and their service groups, reducing operator errors and ensuring subscribers see coherent, defensible pricing.

### Pricing Strategy Analysis

#### Current Architecture (3 Disconnected Layers)

```
Tier Level:           $100/mo (flat, manually set)    ← NO CONNECTION
    ↓
Service Group Level:  $60 + $50 = $110                ← CAN EXCEED TIER
    ↓
Option Group Level:   $50/mo (standalone or per-tier)  ← INDEPENDENT
```

**Problem**: An operator can set Basic tier at $45/mo but configure service groups totaling $80/mo for that tier. Nothing prevents this. The tier price becomes a marketing number with no grounding in the actual cost structure.

#### Proposed Architecture (Connected Layers)

```
Tier Level:           $110/mo (CALCULATED from groups)  ← DERIVED VALUE
    ↑ SUM
Service Group Level:  $60 + $50 = $110                  ← SOURCE OF TRUTH
    +
Option Group Level:   $50/mo (standalone or per-tier)   ← SEPARATE ADD-ON
```

**Key insight from pricing strategy**: The tier price should function as an **anchor price** (per Good-Better-Best framework), but it must be grounded in the actual service group prices to maintain credibility. The anchor only works if it's defensible when the subscriber drills into the breakdown.

#### Why Linkage Matters (Value-Based Pricing Perspective)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Subscriber perceives tier as the "total package"       │
│  ────────────────────────────────────────────── $100    │
│                                                         │
│  But service groups actually sum to...                  │
│  ────────────────────────────────────────────── $110    │
│                                                         │
│  ↑ This gap breaks trust and creates billing disputes   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

The tier price is what the subscriber sees first (the **anchor**). The service group prices are the **value justification**. If these don't match, the pricing structure loses credibility.

---

### Feature Overview

#### Core Features

1. **Tier Price = Calculated Aggregate** — Tier recurring price is derived from the sum of all included service group recurring prices for that tier and billing cycle
2. **Bidirectional Editing with Guardrails** — Operators can either:
   - Set service group prices first → tier price auto-calculates
   - Set tier price first → distributes as a budget envelope for service groups
3. **Over-Budget Warning** — When service group prices exceed the tier price (or the operator sets a tier price below the sum), show a resolution dialog
4. **Billing Cycle Majority Auto-Adjustment** — When most service groups share the same billing cycle, auto-suggest adjusting the global subscription cycle to match

#### Feature Boundaries

- **In Scope**:
  - Tier price calculation from service group recurring prices
  - Over-budget detection and resolution UX
  - Billing cycle majority detection and suggestion
  - Validation at the editor level (not schema enforcement)

- **Out of Scope**:
  - Setup cost aggregation (setup costs remain independent per stakeholder decision SO-Q5)
  - Option group pricing (add-ons are always separate from tier base price)
  - Payment processing or billing system integration
  - Price locking after publish

---

### Detailed Requirements

#### Requirement 1: Tier Price Calculation

**Rule**: For each tier and billing cycle combination:

```
Tier Recurring Price = SUM(
  service_group.tierPricing[tier].recurringPricing[cycle].amount
  FOR EACH service_group WHERE service_group has pricing for this tier
)
```

**Example**:

```
Tier: "Basic" — Billing Cycle: ANNUAL

Service Group "Legal Setup" (ONE_TIME):     → excluded from recurring calc
Service Group "Operational":                → $30/mo annual rate for Basic
Service Group "777":                        → $15/mo annual rate for Basic

Calculated Tier Price (Annual):  $30 + $15 = $45/mo
                                 Billed $540 annually
```

**Display**: The tier card shows the calculated price. If no service groups have pricing yet, the tier shows "$0/mo" or "Configure services →".

**Important distinction**:
- **Recurring service groups** → contribute to tier recurring price
- **One-time/setup service groups** → contribute to "Total Setup Fee" (separate line, not part of tier recurring price, as it is currently)
- **Option groups** → shown separately as add-ons (never part of tier base price)

#### Requirement 2: Editing Modes

**Mode A — Bottom-Up (Service Groups → Tier)**

1. Operator configures service group prices per tier
2. Tier price auto-updates as groups are priced
3. This is the **primary/recommended** flow

**Mode B — Top-Down (Tier → Service Groups)**

1. Operator sets a desired tier price (e.g., $100/mo for Basic)
2. This becomes a **budget envelope** displayed while pricing service groups
3. As the operator prices each service group, the remaining budget decreases
4. UI shows: `$100 budget — $60 allocated — $40 remaining`

**Mode B Over-Budget Resolution**:

When service group prices exceed the tier budget:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Service group prices exceed tier budget                  │
│                                                             │
│  Tier "Basic" budget:    $100/mo                            │
│  Service group total:    $120/mo  (+$20 over)               │
│                                                             │
│  How would you like to resolve this?                        │
│                                                             │
│  ○ Update tier price to $120/mo (match actual costs)        │
│  ○ Revert last change (keep budget at $100/mo)              │
│  ○ Keep as-is (manual override — will show warning)         │
│                                                             │
│  [Apply]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Note**: The "Keep as-is" option exists because operators may intentionally want a tier price that differs from the sum (e.g., for a "bundled discount" where the tier price is less than the sum of groups — effectively a package deal). This should show a persistent info badge on the tier card.

#### Requirement 3: Billing Cycle Majority Auto-Adjustment

**Context**: Currently, the subscription has a global billing cycle selector (Month / Quarter / 6 Months / Year). Service groups can override this individually, triggering "Custom" mode per the billing-cycle-discount-logic-v1.0-prd.

**New behavior**: When configuring the service offering (not the subscription instance), the editor should detect billing cycle drift.

**Rule**:

```
IF majority_cycle = cycle used by > 50% of recurring service groups
AND majority_cycle ≠ current global billing cycle
THEN show suggestion:
  "Most service groups (N of M) are set to [Annual].
   Switch the default billing cycle to [Annual]?"
   [Switch] [Keep current]
```

**Auto-remerge** (already defined in billing-cycle-discount-logic PRD):
- When ALL service groups end up on the same cycle → auto-revert to global mode

**New addition**:
- When MOST (>50%) service groups share a cycle → suggest (don't force) switching
- This is a **soft nudge**, not a hard rule
- Only shown once per drift detection (dismissible)

#### Requirement 4: Discount Cascade with Tier-Group Linkage

With the pricing linkage, discount application needs clarification:

**Tier-level billing cycle discounts** (e.g., 10% off for Annual):
- Applied to the **calculated tier total**, not to individual groups
- Equivalent to applying the same discount % to each group proportionally
- Display: Show at tier level as today

**Service group-level discounts** (when a group overrides its cycle):
- Applied to that group's price only
- Per billing-cycle-discount-logic PRD: "SG discount always wins" with fallback to tier discount
- The tier total recalculates after per-group discounts are applied

**Calculation order**:

```
1. Calculate base prices:
   Group A: $60/mo (Annual)
   Group B: $50/mo (Annual)

2. Apply discounts:
   - If global mode: Tier annual discount (10%) → $60×0.9 + $50×0.9 = $99/mo
   - If custom mode: Group A has 15% own discount, Group B inherits tier 10%
     → $60×0.85 + $50×0.9 = $51 + $45 = $96/mo

3. Tier displayed price = sum after discounts
```

---

## Design Decisions

### Technical Approach

**Option A: Tier price becomes a purely calculated field** (Recommended)
- Remove `ServicePricing.amount` from manual input
- Always derive from `SUM(service group prices)`
- Operator controls price through service groups

**Option B: Tier price remains settable, with sync validation**
- Keep manual tier price
- Show warning when it diverges from service group sum
- Allow operator override

**Recommendation**: **Option A** — aligns with stakeholder decision SO-Q1, prevents pricing inconsistency at the source. The tier price field becomes read-only in the editor, always computed. For "Enterprise/Custom" tiers (`isCustomPricing: true`), the calculated price is hidden and "Custom" is displayed instead.

### Schema Impact

**No schema changes needed** for calculation — this is an editor-level concern:
- Service group tier pricing already exists in the schema
- Tier `ServicePricing.amount` can be populated by the editor as the calculated sum (or left null for custom tiers)
- The editor computes and displays the aggregate

**Potential schema addition** (optional, for persistence):

```graphql
# Add to ServiceSubscriptionTier
type ServiceSubscriptionTier {
    # ... existing fields
    pricingMode: TierPricingMode    # NEW: CALCULATED | MANUAL_OVERRIDE
}

enum TierPricingMode {
    CALCULATED        # Price = sum of service group prices
    MANUAL_OVERRIDE   # Operator intentionally diverges (bundle discount, etc.)
}
```

This allows distinguishing between "price matches sum" and "operator intentionally set a different price" for downstream systems.

### UI/UX Approach

**Tier Definition step changes**:
- Tier price input becomes read-only when `pricingMode = CALCULATED`
- Shows live-updating total from service groups
- "Set custom price" toggle switches to `MANUAL_OVERRIDE`
- Custom tiers (`isCustomPricing: true`) always show "Custom"

**Matrix step changes**:
- Show running tier total at bottom of each tier column
- Budget remaining indicator if operator set a target price
- Color coding: green (under budget), yellow (near budget), red (over budget)

**Service Catalog step changes**:
- When adding recurring pricing to a service group, show the tier's current total and remaining budget
- After saving, the tier total updates in real time

### Risk Assessment

- **Technical Risks**:
  - Existing offerings with manually-set tier prices may not match service group sums → migration needed
  - Circular dependency if tier price influences group price and vice versa → solved by making tier price derived-only

- **UX Risks**:
  - Operators accustomed to setting tier price first may find bottom-up flow unintuitive → mitigated by Mode B (top-down budget envelope)
  - "Over-budget" dialog could be disruptive → make it dismissible and non-blocking

---

## Acceptance Criteria

### Functional Acceptance

- [ ] Tier recurring price displays as sum of its service group recurring prices (for the active billing cycle)
- [ ] Changing a service group's recurring price immediately updates the tier's displayed price
- [ ] Adding/removing a service group's tier pricing updates the tier total
- [ ] Over-budget warning appears when service group total exceeds a manually-set tier target
- [ ] Resolution dialog offers three options: update tier, revert change, keep override
- [ ] Custom pricing tiers (`isCustomPricing: true`) show "Custom" instead of calculated price
- [ ] Billing cycle majority detection triggers suggestion when >50% of groups share a different cycle
- [ ] Suggestion is dismissible and only shown once per drift event
- [ ] Tier-level discounts apply proportionally across all contributing service groups
- [ ] Setup costs and option groups are excluded from tier recurring price calculation

### Quality Standards

- [ ] TypeScript check passes (`npm run tsc`)
- [ ] ESLint check passes (`npm run lint:fix`)
- [ ] No regression in existing service offering editor functionality
- [ ] Price calculations handle edge cases: zero groups, all custom pricing, mixed currencies

### User Acceptance

- [ ] Operator can configure a complete 3-tier offering using bottom-up pricing
- [ ] Operator can set a tier budget target and see remaining budget as groups are priced
- [ ] Pricing breakdown in preview matches the sum of service group prices
- [ ] Billing cycle suggestion appears when majority of groups drift from global cycle

---

## Execution Phases

### Phase 1: Tier Price Calculation Logic
**Goal**: Make tier price a derived value in the editor

- [ ] Create utility function: `calculateTierRecurringPrice(tier, serviceGroups, billingCycle)`
- [ ] Update `TierDefinition.tsx` to display calculated price instead of manual input
- [ ] Add "CALCULATED vs MANUAL_OVERRIDE" toggle (optional schema addition)
- [ ] Update tier cards to show live-updating totals

**Deliverables**: Tier prices reflect service group sums in real time
**Dependencies**: Existing service group tier pricing must be populated

### Phase 2: Budget Envelope & Over-Budget Resolution
**Goal**: Support top-down pricing workflow

- [ ] Add budget target input to tier (optional field, not persisted — editor-only state)
- [ ] Create `BudgetIndicator` component showing allocated/remaining
- [ ] Create `OverBudgetDialog` component with three resolution options
- [ ] Wire into service group pricing flow in ServiceCatalog and Matrix steps

**Deliverables**: Operators can set a tier budget and get feedback as they price groups

### Phase 3: Billing Cycle Majority Detection
**Goal**: Suggest global billing cycle based on service group majority

- [ ] Create utility function: `detectMajorityCycle(serviceGroups)`
- [ ] Add suggestion banner component to billing cycle selector area
- [ ] Implement dismiss logic (show once per drift event)
- [ ] Wire auto-remerge (already in billing-cycle-discount-logic PRD) with majority suggestion

**Deliverables**: Smart billing cycle suggestions reduce manual configuration

### Phase 4: Discount Cascade Integration
**Goal**: Ensure discounts work correctly with calculated tier prices

- [ ] Verify tier-level discount applies after aggregation
- [ ] Verify per-group discount overrides work with calculated totals
- [ ] Update pricing display to show pre-discount and post-discount tier totals
- [ ] Add discount breakdown tooltip on tier card

**Deliverables**: Discounts work coherently with the new pricing linkage

### Phase 5: Quality Assurance & Migration
**Goal**: Validate and migrate existing offerings

- [ ] Audit existing offerings for tier price ↔ service group price mismatches
- [ ] Create migration path: recalculate tier prices from existing service group data
- [ ] Run `npm run tsc` and `npm run lint:fix`
- [ ] Manual testing across all billing cycles and tier configurations

**Deliverables**: All existing offerings compatible with new linkage model

---

## Pricing Strategy Recommendations

### 1. Bundle Discount Pattern

With tier prices now derived from service group sums, operators who want to offer a "package deal" (tier price < sum of groups) should use the `MANUAL_OVERRIDE` mode explicitly. This is a deliberate pricing strategy, not a configuration error.

**Example**:
- Service groups sum to $120/mo
- Operator sets tier to $100/mo (17% bundle discount)
- Editor shows: "Bundle savings: $20/mo (17% off individual pricing)"
- This is the **decoy effect** in action — showing the "value" of the bundle

### 2. Tier Anchoring

With calculated pricing, the Good-Better-Best structure becomes self-documenting:
- Basic tier: Sum of basic-level group prices → natural lowest anchor
- Professional tier: Sum of professional-level group prices → 2x multiple suggests value
- Enterprise: Custom → premium positioning

The price ratios between tiers should ideally follow 1x / 2-2.5x / "Contact us" for optimal anchoring.

### 3. Annual Discount Strategy

The billing cycle majority detection supports the pricing best practice of encouraging annual commitments:
- If most groups are already set to annual, nudging the global cycle to annual reinforces the 10-20% annual discount message
- This increases LTV by locking in longer commitments

---

**Document Version**: 1.0
**Created**: 2026-02-17
**Clarity Score**: 92/100
**Status**: Ready for stakeholder review
**Dependencies**: stakeholder-decisions-v1.0.md (SO-Q1), billing-cycle-discount-logic-v1.0-prd.md
