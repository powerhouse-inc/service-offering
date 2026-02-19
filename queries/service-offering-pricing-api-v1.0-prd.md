# Service Offering Pricing API — Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: The service offering pricing logic currently lives exclusively in the editor frontend (`pricing-utils.ts`, `TheMatrix.tsx`, `ServiceCatalog.tsx`). External frontends like Achra cannot access computed pricing — they would need to reimplement the entire discount resolution, flat→percentage conversion, billing cycle math, and tier-dependent pricing logic. This creates duplication and divergence risk.
- **Target Users**: Achra frontend developers and end-users who configure service subscriptions through the Achra UI (selecting tiers, toggling add-ons, choosing billing cycles).
- **Value Proposition**: A single server-side source of truth for pricing computation. Frontend sends configuration selections, API returns final computed prices with all discounts applied. No pricing logic needed in the consuming frontend.

### Feature Overview
- **Core Features**:
  1. **Catalog Query** — Returns all service offerings in a drive with structure + base monthly prices per tier, service groups, and available billing cycles
  2. **Compute Price Query** — Accepts user selections (tier, billing cycle, add-on toggles, per-group cycle overrides) and returns a computed pricing summary with discounts applied
  3. **Multi-offering support** — Serves all `powerhouse/service-offering` documents in the drive

- **Feature Boundaries**:
  - IN: Read-only pricing computation, catalog browsing, discount application (including flat→percentage conversion for inherited tier discounts)
  - OUT: Subscription creation/mutation (future feature), payment processing, user authentication for purchases

- **User Scenarios**:
  1. Frontend loads → queries catalog → displays pricing page with tier cards showing base prices
  2. User selects "Professional" tier + "Annual" billing → frontend sends `computePrice` query → API returns `$2,760/yr ($230/mo), SAVE $240 (8% off)`
  3. User toggles "Premium Support" add-on → frontend re-queries `computePrice` → updated total returned
  4. User switches a service group to quarterly billing (custom billing mode) → re-query with per-group override → API returns adjusted totals

### Detailed Requirements

#### Query 1: Catalog (Structure + Base Prices)

**Input**: Drive ID (optional — defaults to primary drive)

**Output per offering**:
```graphql
type ServiceOfferingCatalog {
  id: ID!
  name: String!
  description: String
  tiers: [TierSummary!]!
  serviceGroups: [ServiceGroupSummary!]!
  availableBillingCycles: [BillingCycle!]!
}

type TierSummary {
  id: ID!
  name: String!
  baseMonthlyPrice: Float!        # Sum of regular group prices for this tier
  currency: String!
  isCustomPricing: Boolean!
  availableBillingCycles: [BillingCycle!]!
  billingCycleDiscounts: [BillingCycleDiscountSummary!]!
}

type BillingCycleDiscountSummary {
  billingCycle: BillingCycle!
  discountType: DiscountType!     # PERCENTAGE or FLAT_AMOUNT
  discountValue: Float!
}

type ServiceGroupSummary {
  id: ID!
  name: String!
  isAddOn: Boolean!
  costType: String!               # RECURRING or SETUP
  basePrices: [TierPrice!]!       # Monthly price per tier
  setupCost: Float                # One-time setup fee if applicable
}

type TierPrice {
  tierId: ID!
  tierName: String!
  monthlyAmount: Float!
  hasPrice: Boolean!
}
```

#### Query 2: Compute Price

**Input**:
```graphql
input PricingConfigurationInput {
  offeringId: ID!
  tierId: ID!
  billingCycle: BillingCycle!                  # Global billing cycle
  enabledAddOnIds: [ID!]                       # Optional add-on group IDs to include
  groupCycleOverrides: [GroupCycleOverride!]   # Per-group cycle overrides (custom billing)
}

input GroupCycleOverride {
  groupId: ID!
  billingCycle: BillingCycle!
}
```

**Why this input is needed**: The service offering schema (`ServiceOfferingState`) already contains all pricing *data* — tiers, billing cycle discounts, service group prices, add-on pricing, and discount modes. However, `PricingConfigurationInput` represents the **customer's selections**, not the catalog itself. The schema defines what's available (a menu); this input captures what the customer chose (an order):

| Input Field | What it represents | Why it's not in the schema |
|---|---|---|
| `offeringId` | Which offering to price | A drive can contain multiple offerings |
| `tierId` | Which tier the customer picked | Schema defines available tiers; customer selects one |
| `billingCycle` | Monthly, quarterly, annual | Schema defines available cycles + discounts; customer picks one |
| `enabledAddOnIds` | Which add-ons to include | Add-ons (`isAddOn: true` option groups) are optional; customer toggles them |
| `groupCycleOverrides` | Per-group billing overrides | In custom billing mode, each group can use a different cycle |

Each field is a **choice** the customer makes that isn't predetermined:

| Input Field | Why it's needed | Not in schema because... |
|---|---|---|
| `offeringId` | Identifies WHICH service offering document to read | A drive can have multiple offerings |
| `tierId` | The offering has multiple tiers (`tiers: [ServiceSubscriptionTier!]!`). Customer SELECTS which tier they want | Schema defines available tiers, but the customer picks one |
| `billingCycle` | Schema defines available cycles and tier-level defaults (`defaultBillingCycle`), but customer CHOOSES which cycle | Each tier can support multiple cycles with different discounts |
| `enabledAddOnIds` | Option groups with `isAddOn: true` are optional add-ons. Customer decides which to enable | Schema defines what's available; the selection is user input |
| `groupCycleOverrides` | Service groups have a `billingCycle` field, and in "custom billing mode" users can override per group | This is a per-session user selection |

**Mental Model**:
```
Service Offering Schema (catalog)       Customer Selections (input)
─────────────────────────────────       ─────────────────────────────
"Professional" tier: $300/mo      ──┐
"Enterprise" tier: custom         ──┤── Customer picks: tierId = "professional"
"Starter" tier: $100/mo           ──┘

Annual: 10% off                   ──┐
Quarterly: 5% off                 ──┤── Customer picks: billingCycle = ANNUAL
Monthly: no discount              ──┘

"Premium Support" (add-on)        ──┐
"SLA Upgrade" (add-on)            ──┤── Customer enables: ["premium-support"]
"Training" (add-on)               ──┘

                                          ↓
                                    Compute Price API
                                          ↓
                                    $2,760/yr (save $240)
```

The compute query combines catalog data (from `ServiceOfferingState`) with these selections to produce the final computed price with all discounts applied. The only alternative would be precomputing every possible combination (tier x cycle x add-on permutations), which explodes combinatorially and wouldn't handle per-group overrides.

**Output**:
```graphql
type ComputedPricingSummary {
  # Totals
  monthlyEquivalent: Float!       # Total monthly equivalent across all groups
  billedTotal: Float!             # Total billed for the selected cycle
  currency: String!

  # Discount summary
  totalDiscount: Float!           # Total discount amount for the billing period
  totalSavingsPercent: Float!     # Overall savings percentage

  # Breakdown
  tierName: String!
  billingCycle: BillingCycle!
  isCustomPricing: Boolean!       # If true, no computed prices (Enterprise tier)

  # Per-group summary
  groups: [GroupPricingSummary!]!
}

type GroupPricingSummary {
  groupId: ID!
  groupName: String!
  isAddOn: Boolean!
  billingCycle: BillingCycle!     # Effective cycle for this group
  baseAmount: Float!              # Undiscounted amount for the cycle
  discountedAmount: Float!        # After discount application
  discountAmount: Float!          # Savings for this group
  discountSource: DiscountSource  # Where the discount came from
  originalTierFlat: Float         # If tier FLAT_AMOUNT was converted to %, the original flat value
}

enum DiscountSource {
  TIER_INHERITED
  GROUP_INDEPENDENT
  NONE
}
```

#### Edge Cases
- **Custom pricing tier selected**: Return `isCustomPricing: true`, no computed totals, groups return base amounts only
- **Group without tier-specific price**: Return `hasPrice: false`, amount = 0 (same as editor behavior)
- **FLAT_AMOUNT tier discount inheritance**: Convert to equivalent percentage using `tierMonthlyBase` (same logic as `pricing-utils.ts`)
- **Disabled add-on not in `enabledAddOnIds`**: Excluded from totals
- **No discount configured**: `discountAmount = 0`, `discountSource = NONE`

## Design Decisions

### Technical Approach
- **Architecture**: Powerhouse Subgraph extending `BaseSubgraph`
- **Document access**: Via `subgraph.reactor.getDocument(docId)` and `doc.state.global`
- **Pricing logic**: Extract core computation functions from `editors/service-offering-editor/components/pricing-utils.ts` into a shared library (`document-models/service-offering/src/pricing/`) importable by both the editor and the subgraph
- **Query resolution**: Resolvers read document state, apply pricing functions, return computed results

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Shared pricing lib | `document-models/service-offering/src/pricing/` | Core pricing functions extracted from `pricing-utils.ts` |
| Subgraph document | Created via MCP | `powerhouse/subgraph` definition, confirmed → generates scaffold |
| Schema | `subgraphs/service-offering-pricing/schema.graphql` | GraphQL types + queries defined above |
| Resolvers | `subgraphs/service-offering-pricing/resolvers.ts` | Catalog + ComputePrice query implementations |
| Manifest entry | `powerhouse.manifest.json` | Register the subgraph |

### Shared Pricing Library

The following functions from `pricing-utils.ts` need to be extracted into a shared module:

1. `calculateTierRecurringPrice()` — Sum of group prices for a tier
2. `resolveGroupDiscountForTier()` — Discount resolution with flat→% conversion
3. `getGroupPriceForTier()` — Tier-dependent pricing lookup
4. `getGroupIndependentDiscount()` — Independent discount lookup
5. `BILLING_CYCLE_MONTHS` — Cycle-to-months mapping
6. `formatPrice()` — Price formatting

The editor would import from the shared lib instead of its local `pricing-utils.ts`. The subgraph resolvers would also import from the shared lib.

### Constraints
- **Performance**: Catalog query should respond in <200ms (reads document state, no heavy computation). Compute query should respond in <100ms (pure math on in-memory state).
- **Compatibility**: Must work with existing service offering document model schema — no schema changes required
- **Security**: Subgraph inherits Powerhouse permission model. Read access to the drive grants access to pricing data.
- **Scalability**: One subgraph instance serves all offerings in the drive. For multi-drive scenarios, the drive ID parameter enables filtering.

### Risk Assessment
- **Technical Risk**: Shared library extraction requires updating all editor imports. Mitigated by keeping the same function signatures.
- **Dependency Risk**: Subgraph code generation depends on Vetra tooling (`SET_SUBGRAPH_STATUS → CONFIRMED`). If code gen fails, manual scaffold is straightforward.
- **Data Freshness**: Subgraph reads document state at query time — always current. No caching layer means no stale data risk.

## Acceptance Criteria

### Functional Acceptance
- [ ] Catalog query returns all service offerings in the drive with tier names, base monthly prices, group names, and available billing cycles
- [ ] Compute query accepts tier + cycle + add-on IDs + group cycle overrides and returns correct totals
- [ ] FLAT_AMOUNT tier discounts are converted to equivalent percentages when inherited by groups (same behavior as editor)
- [ ] PERCENTAGE tier discounts are applied correctly to each group
- [ ] Custom pricing tiers return `isCustomPricing: true` with no computed totals
- [ ] Groups without tier-specific pricing show `hasPrice: false` with amount = 0
- [ ] Per-group billing cycle overrides produce correct per-group totals
- [ ] `discountSource` correctly identifies TIER_INHERITED vs GROUP_INDEPENDENT
- [ ] `originalTierFlat` is populated when a FLAT_AMOUNT was converted to percentage

### Quality Standards
- [ ] Code Quality: Shared pricing library has identical output to existing `pricing-utils.ts` for all inputs
- [ ] Test Coverage: Unit tests for shared pricing functions + integration tests for subgraph resolvers
- [ ] Performance: Catalog <200ms, Compute <100ms for a typical offering with 3 tiers and 5 groups
- [ ] TypeScript: `npm run tsc` passes with no new errors

### User Acceptance
- [ ] Achra frontend team can query the catalog and render a pricing page
- [ ] Achra frontend team can send configuration selections and receive computed prices
- [ ] Computed prices match what the editor's Matrix view shows for the same configuration

## Execution Phases

### Phase 1: Shared Pricing Library
**Goal**: Extract pricing functions into a shared module
- [ ] Create `document-models/service-offering/src/pricing/index.ts` with extracted functions
- [ ] Update editor `pricing-utils.ts` to re-export from shared lib (or update imports directly)
- [ ] Verify editor still works correctly (`npm run tsc`, `npm run lint:fix`)
- [ ] Add unit tests for shared pricing functions
- **Deliverables**: Shared pricing lib, passing tests, editor unchanged in behavior

### Phase 2: Subgraph Scaffold
**Goal**: Create and configure the Powerhouse subgraph
- [ ] Create `powerhouse/subgraph` document via MCP
- [ ] Set subgraph name to "service-offering-pricing"
- [ ] Confirm subgraph (`SET_SUBGRAPH_STATUS` → `CONFIRMED`)
- [ ] Add to vetra drive
- [ ] Verify code generation produces scaffold in `subgraphs/`
- **Deliverables**: Subgraph scaffold with schema.graphql and resolvers.ts stubs

### Phase 3: Schema + Resolvers
**Goal**: Implement the two queries
- [ ] Define catalog and compute-price types in `schema.graphql`
- [ ] Implement catalog resolver: read all `powerhouse/service-offering` documents from drive, extract structure + base prices
- [ ] Implement compute-price resolver: accept config input, apply pricing functions from shared lib, return summary
- [ ] Handle edge cases (custom pricing, missing prices, no discounts)
- **Deliverables**: Working subgraph with both queries

### Phase 4: Testing + Integration
**Goal**: Verify correctness and performance
- [ ] Write integration tests comparing subgraph output to editor calculations
- [ ] Test with existing service offering documents in the drive
- [ ] Performance test: catalog and compute queries under target latency
- [ ] Update `powerhouse.manifest.json` with subgraph entry
- [ ] Run `npm run tsc` and `npm run lint:fix`
- **Deliverables**: Tested, registered subgraph ready for Achra integration

---

**Document Version**: 1.0
**Created**: 2026-02-16
**Clarification Rounds**: 3
**Quality Score**: 92/100
