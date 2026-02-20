# Achra Summary View - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: Users configuring a service offering purchase (operator + tier + add-ons + billing cycle) need a clear summary before submission. Currently, no intermediary review step exists between service configuration and subscription instance creation. The summary must surface all pricing, configuration, and service details in a concise, non-overwhelming format.
- **Target Users**: Founders and SNO Governors purchasing operational hosting services via the Achra purchase flow (Step 4 of 5)
- **Value Proposition**: A browser-stored, URL-shareable summary page that bridges the Service Offering (SO) configuration with future Subscription Instance (SI) creation, enabling review, sharing, and confident purchase decisions

### Feature Overview
- **Core Features**:
  - Configuration summary: operator, resource template, tier, services, add-ons, billing cycle
  - Two-part pricing breakdown: Recurring Costs vs One-Time Setup Costs
  - Expandable service groups with service-level detail
  - Metric pricing via info icon tooltips (not inline)
  - URL-encoded state for shareable configurations
  - Contact form (Name, Email) for submission
  - Shared React components with SO Editor's Preview & Publish tab

- **Feature Boundaries**:
  - IN SCOPE: Summary display, URL state encoding/decoding, contact form, shared component library
  - OUT OF SCOPE: Payment processing, SI document creation (manual later), authentication flow, backend API
  - DEFERRED: "Metric setup costs" concept (undefined in current schema — see Q2 resolution below)

- **User Scenarios**:
  1. User completes Steps 1-3, arrives at Summary showing full configuration with pricing
  2. User clicks "Share Configuration" — URL encodes all selections for sharing
  3. Recipient opens shared URL — lands directly on Summary with configuration pre-filled
  4. User submits request — contact info stored in browser, user later creates SI manually

### Detailed Requirements

#### Data Flow: SO → Browser Store → Summary Display

```
ServiceOfferingState (published, read-only)
    │
    ▼ User selects in Steps 1-3
    │
URL-Encoded Browser State
├── operatorId: PHID
├── selectedTierId: OID
├── selectedBillingCycle: BillingCycle (global)
├── enabledAddOnIds: Set<OID>            (OptionGroup IDs with isAddOn: true)
├── perGroupCycleOverrides: Map<OID, BillingCycle>  (optional per-group)
├── facetSelections: Map<categoryKey, selectedOption[]>
├── contactName: String
├── contactEmail: String
└── globalCurrency: Currency
    │
    ▼ Summary computes at display time
    │
Resolved Display State (computed, not stored)
├── tierDisplayPrice: post-discount for selected cycle
├── groupPrices: [{ groupId, name, setupCost, recurringAmount, discount }]
├── addonPrices: [{ groupId, name, setupCost, recurringAmount, discount }]
├── totalRecurring: sum of group + addon recurring
├── totalSetup: sum of group + addon setup costs
└── grandTotal: totalRecurring + totalSetup (first period only)
```

#### Data Sources (Schema Field Mapping)

| Summary Element | SO Schema Source | Available? |
|----------------|-----------------|-----------|
| Operator name | `ServiceOfferingState.operatorId` → resolve externally | Partial — operatorId exists, name resolution needed |
| Resource template | `ServiceOfferingState.resourceTemplateId` → resolve | Partial — ID exists, need label/thumbnail |
| Tier name | `ServiceSubscriptionTier.name` | Yes |
| Tier base price | `ServiceSubscriptionTier.pricing.amount` (MANUAL) or calculated sum (CALCULATED) | Yes |
| Tier pricing mode | `ServiceSubscriptionTier.pricingMode` | Yes |
| Billing cycle discounts | `ServiceSubscriptionTier.billingCycleDiscounts[]` | Yes |
| Service group names | `ServiceGroup.name` | Yes |
| Service group tier pricing | `ServiceGroup.tierPricing[].recurringPricing[]` | Yes |
| Service group setup costs | `ServiceGroup.tierPricing[].setupCostsPerCycle[]` | Yes |
| Service names | `Service.title` | Yes |
| Service levels per tier | `ServiceSubscriptionTier.serviceLevels[]` | Yes |
| Service custom values | `ServiceLevelBinding.customValue` | Yes |
| Usage limits (metrics) | `ServiceSubscriptionTier.usageLimits[]` | Yes |
| Add-on groups | `OptionGroup` where `isAddOn: true` | Yes |
| Add-on pricing | `OptionGroup.standalonePricing` or `tierDependentPricing[]` | Yes |
| Facet targets | `ServiceOfferingState.facetTargets[]` | Yes |
| Target audiences | `ServiceOfferingState.targetAudiences[]` | Yes |

---

## Design Decisions

### Open Question Resolutions (Opinionated)

#### Q1 — Metric Pricing Placement → **(a) Tooltip/info icon on service line**
- Rationale: Keeps summary clean (stakeholder intent: "not overwhelming"). The mockup shows service lines with `customValue` text (e.g., "Up to 6"). An info icon on metric-backed services reveals: free limit, paid limit, overage cost, reset cycle.
- Implementation: `<MetricInfoTooltip>` component, triggered by hover/click on the info icon.
- Example:
  ```
  Contributor Contracting    Up to 6  ℹ️
  ┌──────────────────────────────────────┐
  │ Included: 6 contributors             │
  │ Maximum: 10 contributors             │
  │ Overage: $500/mo per additional       │
  │ Resets: Monthly                       │
  └──────────────────────────────────────┘
  ```

#### Q2 — "Metric Setup Costs" → **Deferred (YAGNI)**
- Rationale: This concept doesn't exist in either schema. No examples provided. The current `ServiceMetric` has `unitCost` (recurring) but no `setupCost`. If a "metric activation fee" emerges later, we add it then.
- Decision: All service group setup costs → "Setup Costs (Pay Now)". All metric costs → "Recurring" overage projections only.

#### Q3 — Pricing Breakdown Structure → **(a) Group-level prices**
- The SO restructure moved pricing to service groups. Summary breakdown shows:
  - RECURRING: Each group name + recurring price/cycle
  - ONE-TIME SETUP: Each group with setup cost (if any)
- NOT "Tier (Team) $300" as aggregate — instead, individual group lines

#### Q4 — Expandable vs Visible Services → **(d) Adaptive by group size**
- Groups with ≤3 services: expanded by default
- Groups with >3 services: collapsed, "Show N services" toggle
- Add-on groups: always collapsed until enabled, then follow same ≤3 rule

#### Q5 — Configuration Section → **Dynamic from `facetTargets`**
- Show ALL facet selections as chips. The summary reflects whatever facets the SO operator configured — not a fixed set of 4.
- If no facets configured, hide the Configuration section.

#### Q6 — Pre vs Post-Subscription Summary → **Same layout, different mode**
- Achra Summary = pre-purchase (interactive, with "Submit Request")
- SI Editor could render same shared components in read-only mode (Phase 2)
- Build shared `<SummarySection>` components now, extract to SI editor later

#### Q7 — Billing Cycle Display → **(c) Show both**
- Format: `$750/qtr ($250/mo equivalent)` for non-monthly cycles
- Monthly: `$300/mo` (no equivalent needed)
- One-time: `$3,000 one-time` (no cycle qualifier)
- This matches the SO Matrix's display pattern

#### Q8 — Empty/Edge States
| State | Behavior |
|-------|----------|
| No add-ons selected | Hide Add-ons section entirely |
| No setup costs | Hide ONE-TIME SETUP section in pricing breakdown |
| Enterprise/custom tier | Show "Contact for Pricing" in price positions; replace "Submit Request" with "Contact Sales" CTA |
| Partial selections (no tier) | Show summary with available data; grey out missing; "Submit" disabled |
| No facets configured | Hide Configuration section |
| No service groups | Show tier header only; pricing breakdown shows tier line only |

### Technical Approach

- **Architecture**: Shared component library between SO Preview tab and Achra Summary
- **State Management**: URL-encoded state (base64 or query params) for shareability
- **Computation**: All pricing resolved at display time from SO state + user selections (no stored computed values)
- **Key Components** (shared):
  - `<SummaryHeader>`: Operator + resource template + total price badges
  - `<ConfigurationChips>`: Facet selections as tag chips
  - `<ServiceGroupSection>`: Group name + price + expandable service list
  - `<ServiceLine>`: Service name + level indicator (checkmark, dash, custom text)
  - `<MetricInfoTooltip>`: Info icon tooltip for metric-backed services
  - `<AddonSection>`: Optional groups with toggle + pricing
  - `<PricingBreakdown>`: Two-section (Recurring/Setup) cost summary
  - `<GrandTotal>`: Sticky footer with total
- **Achra-specific components**:
  - `<ContactForm>`: Name + Email fields
  - `<ShareConfigButton>`: URL generation + clipboard copy
  - `<SubmitRequestButton>`: Login-gated submission CTA

### Constraints
- **Performance**: Summary must render in <200ms from URL state decode
- **Compatibility**: Desktop + tablet; mobile optimization deferred
- **Security**: URL state must NOT include sensitive data (no prices in URL — recomputed from SO state + selections)
- **Shareability**: URL must encode: operatorId, tierId, billingCycle, enabledAddOnIds, facetSelections. Prices are NOT in URL (recomputed).

### Risk Assessment
- **Technical Risks**: URL state encoding limits for complex configurations → Mitigate with base64 compression; fallback to short-code lookup if too long
- **Dependency Risks**: SO pricing restructure must be complete before group-level pricing displays correctly; `mapOfferingToSubscription.ts` already exists and handles the mapping
- **Scope Risk**: Shared components may have different needs in SO Preview vs Achra contexts → Mitigate with `mode` prop (`preview` | `purchase`) to control interactive elements

---

## Component Architecture

### Shared Component Tree

```
<SummaryLayout mode="preview" | "purchase">
├── <SummaryHeader>
│   ├── Operator name + "OPERATOR" label
│   ├── Resource template name + thumbnail + "RESOURCE TEMPLATE" label
│   └── Total price badges: "$X/cycle" + "$Y Setup" (computed)
│
├── <ConfigurationChips>                          (if facetTargets exist)
│   └── Chip per facet: "Anonymity: High", "Legal Entity: Swiss Association"
│
├── <TierHeader>
│   ├── Tier name (e.g., "Team")
│   ├── "BASE PRICE" label + amount/cycle
│   └── Discount badge if applicable ("SAVE 10%")
│
├── <ServiceGroupSection> × N                     (for each non-addon group)
│   ├── Group name + "INCLUDED" badge
│   ├── <ServiceLine> × M                         (expandable if M > 3)
│   │   ├── Service name
│   │   ├── Level indicator: ✓ | — | custom text | ○ | # | /
│   │   └── <MetricInfoTooltip>                   (if service has usage limits)
│   ├── Setup fee sub-line (if group has setup cost)
│   └── Group subtotal (setup + recurring)
│
├── <SubtotalRow>                                 (sum of regular groups)
│
├── <AddonSection>                                (if addon groups exist)
│   └── <AddonGroupCard> × N                      (for each addon OptionGroup)
│       ├── Toggle switch (purchase mode) or checkbox (preview mode)
│       ├── Group name + "SELECTED" / "AVAILABLE" badge + price
│       └── <ServiceLine> × M (collapsed by default)
│
├── <PricingBreakdown>
│   ├── RECURRING section
│   │   ├── Per-group recurring lines (name + amount/cycle)
│   │   ├── Per-enabled-addon recurring lines
│   │   └── TOTAL RECURRING
│   └── ONE-TIME SETUP section (hidden if no setup costs)
│       ├── Per-group setup lines (name + amount)
│       └── TOTAL SETUP
│
├── <GrandTotal>                                  (sticky footer)
│   ├── Recurring total /cycle
│   ├── + Setup total (one-time)
│   └── Grand total
│
└── [Purchase mode only]:
    ├── <ContactForm> (Name*, Email*)
    ├── <ShareConfigButton>
    └── <SubmitRequestButton> / <ContactSalesButton> (custom tier)
```

### Data Flow in Summary

```typescript
// URL State → Decoded Selections
interface AchraSummaryState {
  operatorId: string;
  selectedTierId: string;
  selectedBillingCycle: BillingCycle;
  enabledAddOnIds: string[];
  perGroupCycleOverrides: Record<string, BillingCycle>;
  facetSelections: Record<string, string[]>;
  contactName?: string;
  contactEmail?: string;
}

// At display time, compute from SO state + selections:
function computeSummaryPricing(
  offering: ServiceOfferingState,
  selections: AchraSummaryState
): SummaryPricing {
  // 1. Find tier → get pricing mode
  // 2. For each service group → find tier pricing → find billing cycle price
  // 3. Apply discount cascade (tier → group, proportional flat distribution)
  // 4. For each enabled add-on → find pricing (standalone or tier-dependent)
  // 5. Sum recurring, sum setup, compute grand total
}
```

### Pricing Computation Rules

Uses existing logic from BA-Service-Offering.md:

1. **Group price for tier**: `getGroupPriceForTier(group, tierId)` → monthly base
2. **Cycle adjustment**: `monthlyBase × BILLING_CYCLE_MONTHS[cycle]`
3. **Discount resolution**: `resolveGroupDiscountForTier(group, tierId, cycle, tier, forceInherit)`
   - Global billing mode: `forceInherit = true` → always inherit tier discount
   - Custom billing mode: respect group's `discountMode`
4. **Proportional flat distribution**: If tier has FLAT_AMOUNT discount, distribute proportionally across groups
5. **Add-on pricing**: Independent — own discounts, own billing cycle
6. **Setup costs**: Per-group, per-tier, per-cycle from `setupCostsPerCycle[]`

### URL State Encoding

```typescript
// Encode selections to URL
function encodeAchraState(state: AchraSummaryState): string {
  const payload = {
    o: state.operatorId,
    t: state.selectedTierId,
    c: state.selectedBillingCycle,
    a: state.enabledAddOnIds,
    g: state.perGroupCycleOverrides,
    f: state.facetSelections,
  };
  return btoa(JSON.stringify(payload));
}

// URL format: /achra/summary?config={base64}
// Prices NOT in URL — recomputed from SO state + selections
```

---

## Acceptance Criteria

### Functional Acceptance
- [ ] Summary displays operator name, resource template name + thumbnail
- [ ] Summary shows selected tier name with base price for selected billing cycle
- [ ] Service groups show group name + "INCLUDED" badge + expandable service list
- [ ] Services show level indicators: ✓ (INCLUDED), — (NOT_INCLUDED), custom text (CUSTOM), ○ (OPTIONAL), # (VARIABLE), / (NOT_APPLICABLE)
- [ ] Services with metrics show info icon; tooltip displays free limit, paid limit, overage cost, reset cycle
- [ ] Groups with ≤3 services are expanded by default; >3 collapsed with "Show N services"
- [ ] Enabled add-ons show with pricing; disabled add-ons hidden
- [ ] Pricing breakdown shows RECURRING (per-group lines + total) and ONE-TIME SETUP (per-group + total)
- [ ] Non-monthly billing cycles show both actual amount and monthly equivalent
- [ ] Discount badges (SAVE X%) display when tier/group discounts apply
- [ ] Custom pricing tiers show "Contact for Pricing" and "Contact Sales" CTA instead of amounts
- [ ] Empty sections (no add-ons, no setup, no facets) are hidden, not shown empty
- [ ] "Share Configuration" generates URL with encoded selections; opening it pre-fills summary
- [ ] Contact form collects Name (required) and Email (required)
- [ ] Shared components render correctly in both `preview` and `purchase` modes

### Quality Standards
- [ ] Code Quality: TypeScript strict mode, ESLint passing, shared component modularity
- [ ] Test Coverage: Unit tests for pricing computation, URL encoding/decoding, discount resolution
- [ ] Performance: Summary renders in <200ms from URL decode
- [ ] Security: No prices or sensitive data in URL state

### User Acceptance
- [ ] Non-overwhelming presentation — services minimized, pricing grouped
- [ ] Clear cost distinction — recurring vs setup visually separated
- [ ] Metric pricing accessible but not prominent — info icons, not inline
- [ ] Shareable URL works cross-browser

---

## Execution Phases

### Phase 1: Shared Component Library
**Goal**: Build reusable summary components
- [ ] Create `<SummaryHeader>` component
- [ ] Create `<ConfigurationChips>` component
- [ ] Create `<TierHeader>` component
- [ ] Create `<ServiceGroupSection>` with expandable service list
- [ ] Create `<ServiceLine>` with level indicators
- [ ] Create `<MetricInfoTooltip>` component
- [ ] Create `<AddonSection>` with toggle support
- [ ] Create `<PricingBreakdown>` (Recurring + Setup)
- [ ] Create `<GrandTotal>` sticky footer
- [ ] All components accept `mode` prop for `preview` | `purchase` rendering
- **Deliverables**: Shared component library in `editors/shared/summary/`
- **Acceptance**: Components render correctly with mock data in both modes

### Phase 2: Pricing Computation Engine
**Goal**: Accurate pricing from SO state + selections
- [ ] Implement `computeSummaryPricing()` function
- [ ] Implement discount resolution (percentage + flat proportional)
- [ ] Implement per-group billing cycle override support
- [ ] Implement add-on pricing (standalone + tier-dependent)
- [ ] Unit tests for all pricing scenarios from BA-Service-Offering.md
- **Deliverables**: Pricing computation module with full test coverage
- **Acceptance**: All pricing scenarios from BA Section 6 pass

### Phase 3: Achra Summary Page
**Goal**: Complete Step 4 of purchase flow
- [ ] URL state encoding/decoding
- [ ] Integrate shared components with pricing computation
- [ ] Contact form (Name, Email)
- [ ] Share Configuration button with clipboard copy
- [ ] Submit Request / Contact Sales CTA
- [ ] Edge state handling (no addons, no setup, custom tier, partial selections)
- **Deliverables**: Functional Achra Summary page
- **Acceptance**: All acceptance criteria pass

### Phase 4: SO Preview Tab Integration
**Goal**: Reuse shared components in SO Editor
- [ ] Wire shared summary components into SO Editor's Preview & Publish tab
- [ ] Tier/cycle selector for preview simulation
- [ ] Publish button (dispatch status change to ACTIVE)
- **Deliverables**: Preview tab using shared components
- **Acceptance**: Preview tab displays same layout as Achra Summary in `preview` mode

---

## Cross-References

| Document | Relationship |
|----------|-------------|
| [BA-Service-Offering.md](../BA-Service-Offering.md) | Pricing logic, discount cascade, matrix calculations |
| [SO-Editor-Walkthrough.md](../SO-Editor-Walkthrough.md) | Demo script showing pricing flows end-to-end |
| [service-purchase-flow-v1.0-prd.md](service-purchase-flow-v1.0-prd.md) | Step 4 of 5-step wizard, parent flow |
| [rgh-achra-summary-analysis-v1.0.md](rgh-achra-summary-analysis-v1.0.md) | Stakeholder requirements analysis, Q1-Q8 |
| [rgh-si-requirements-analysis-v1.0.md](rgh-si-requirements-analysis-v1.0.md) | SI editor restructure, dependency map |
| [si-gap-analysis-v1.0-prd.md](si-gap-analysis-v1.0-prd.md) | SO → SI mapping gaps, InitializeSubscription flow |
| [stakeholder-decisions-v1.0.md](stakeholder-decisions-v1.0.md) | Architectural decisions on pricing, currency, groups |

---

**Document Version**: 1.0
**Created**: 2026-02-18
**Clarification Rounds**: 1
**Quality Score**: 91/100
**Open Questions Resolved**: 8/8 (opinionated decisions, pending stakeholder override)
