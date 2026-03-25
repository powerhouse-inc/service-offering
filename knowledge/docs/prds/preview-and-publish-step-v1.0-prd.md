# Preview & Publish Step — Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: Operators creating service offerings have no way to preview how their configuration looks to subscribers before publishing. They work across Service Catalog, Matrix, and Tier Definition tabs but never see the unified subscriber-facing view.
- **Target Users**: Service offering operators using the SO editor
- **Value Proposition**: Enables operators to verify their offering configuration in context before going live, reducing misconfigurations and improving operator confidence.

### Feature Overview
- **Core Features**:
  1. New "Preview & Publish" tab as the last step in the SO editor
  2. Achra-style summary view rendered from `ServiceOfferingState`
  3. Tier selector tabs (one tier previewed at a time)
  4. Billing cycle selector (prices update dynamically)
  5. Add-on toggle simulation (checkboxes to simulate subscriber selections)
  6. Publish action (change status to ACTIVE)
- **Feature Boundaries**:
  - Data source: `ServiceOfferingState` only (no cross-document resolution)
  - Header uses SO's own `title` + `summary` (not operator/resource template names)
  - Facets shown as available targets, not simulated selections
  - No validation gates for publish
- **Out of Scope**:
  - Shareable URL / public preview link
  - Contact form / login gating
  - Subscription-instance creation from preview
  - Cross-document name resolution (operator name, resource template name)

### Detailed Requirements

#### Section 1: Header
- Display SO `title` (large text) with "SERVICE OFFERING" label
- Display SO `summary` below title
- Display `thumbnailUrl` if set
- Display computed total prices: `$X/cycle` recurring + `$Y setup` (based on selected tier + enabled add-ons + selected billing cycle)

#### Section 2: Configuration (Facet Targets)
- For each entry in `facetTargets[]`:
  - Show `categoryLabel` as the label
  - Show `selectedOptions[]` as chips/tags
- If no `facetTargets`, hide this section entirely

#### Section 3: Tier + Included Service Groups
- **Tier header**: Selected tier name + base price for selected billing cycle
- **Per service group** (where group has tier pricing for the selected tier):
  - Group name + "INCLUDED" badge
  - Service list: each service shows `title` + level indicator from the tier's `serviceLevels[]`:
    - `INCLUDED` → checkmark (✓)
    - `NOT_INCLUDED` → dash (—)
    - `CUSTOM` → show `customValue` text
    - `OPTIONAL` → "Optional"
    - `VARIABLE` → "Variable"
    - `NOT_APPLICABLE` → "N/A"
  - Setup costs: Show per-cycle setup costs from `ServiceGroupTierPricing.setupCostsPerCycle[]` for the selected billing cycle
  - Recurring subtotal: Sum of `recurringPricing[]` for the selected cycle

#### Section 4: Add-ons (Option Groups where `isAddOn === true`)
- Each add-on has a **checkbox** (toggled on/off to simulate selection)
- When enabled: Show group name + "SELECTED" badge + price for selected cycle
- Show services under the add-on with level indicators (same as Section 3)
- Standalone pricing: Use `standalonePricing.recurringPricing[]` for selected cycle
- Tier-dependent pricing: Use `tierDependentPricing[]` matching selected tier + cycle

#### Section 5: Pricing Breakdown
- **RECURRING** section:
  - Tier base line: tier name + recurring price for selected cycle
  - Each service group with tier pricing: group name + recurring total for selected cycle
  - Each enabled add-on: add-on name + recurring price for selected cycle
  - **TOTAL RECURRING**: Sum of all recurring lines
- **ONE-TIME SETUP** section:
  - Each service group setup cost for selected cycle
  - Each enabled add-on setup cost
  - **TOTAL SETUP**: Sum of all setup lines
  - If no setup costs, hide this section

#### Section 6: Publish Action
- "Publish" button at the bottom
- Dispatches `updateOfferingStatus({ status: 'ACTIVE', lastModified: new Date().toISOString() })`
- No validation required — operator publishes at their discretion
- Current status displayed as a badge (DRAFT / COMING_SOON / ACTIVE / DEPRECATED)

#### Metric/Usage Limit Tooltips
- For services that have `usageLimits[]` on the selected tier:
  - Show info icon (ℹ️) next to the service line
  - Tooltip shows: free limit, paid limit, unit price, reset cycle
  - Format: "X included, then $Y/unit per [cycle]"

### Edge Cases
- **No tiers defined**: Show "No tiers configured" message with link back to Tier Definition
- **Custom pricing tier** (`isCustomPricing === true`): Show "Contact for pricing" instead of amounts
- **No service groups**: Show tier header with base price only
- **No add-ons**: Hide Section 4 entirely
- **No setup costs**: Hide ONE-TIME SETUP section in pricing breakdown
- **Billing cycle with no pricing**: If a service group has no `recurringPricing` entry for the selected cycle, show "—"

## Design Decisions

### Technical Approach
- **Architecture**: New React component `OfferingPreview.tsx` in `editors/service-offering-editor/components/`
- **Tab integration**: Added to the existing tab system in the SO editor as the last tab
- **State management**: Local React state for tier selection, billing cycle selection, and add-on toggles
- **Price computation**: Pure functions deriving prices from `ServiceOfferingState` + selections

### Key Components
| Component | Responsibility |
|-----------|---------------|
| `OfferingPreview` | Main container with tier/cycle selectors + publish button |
| `PreviewHeader` | Title, summary, thumbnail, total price badges |
| `PreviewFacets` | Facet target display as chips |
| `PreviewServiceGroups` | Tier's service groups with services and level indicators |
| `PreviewAddOns` | Toggle-able add-on cards with pricing |
| `PreviewPricingBreakdown` | Recurring vs setup cost table |

### Data Flow
```
ServiceOfferingState (from document)
  + selectedTierIdx (local state)
  + selectedBillingCycle (local state)
  + enabledAddOnIds (local state: Set<string>)
  ↓
  Price computation functions
  ↓
  Preview sections render
```

## Acceptance Criteria

### Functional Acceptance
- [ ] New "Preview & Publish" tab appears as the last tab in the SO editor
- [ ] Tier selector tabs display all defined tiers; clicking switches the preview
- [ ] Billing cycle selector shows available cycles for the selected tier
- [ ] Add-on checkboxes toggle simulation; prices update in real-time
- [ ] Service groups show services with correct level indicators per tier
- [ ] Pricing breakdown splits recurring vs one-time setup costs
- [ ] Publish button dispatches status change to ACTIVE
- [ ] Current status badge displays correctly (DRAFT/COMING_SOON/ACTIVE/DEPRECATED)
- [ ] Usage limit tooltips show on services with defined limits

### Quality Standards
- [ ] TypeScript: `npm run tsc` passes with no new errors
- [ ] Linting: `npm run lint:fix` passes with no new errors
- [ ] CSS uses existing `--so-*` variables for consistency

## Execution Phases

### Phase 1: Component Scaffold + Tab Integration
- [ ] Create `OfferingPreview.tsx` with basic structure
- [ ] Add "Preview & Publish" tab to the SO editor tab navigation
- [ ] Wire up tier selector and billing cycle selector (local state)

### Phase 2: Preview Sections
- [ ] Implement PreviewHeader with title, summary, total prices
- [ ] Implement PreviewFacets with facet target chips
- [ ] Implement PreviewServiceGroups with service level indicators
- [ ] Implement PreviewAddOns with toggle checkboxes
- [ ] Implement PreviewPricingBreakdown with recurring/setup split

### Phase 3: Interactive Features + Publish
- [ ] Add-on toggle updates pricing breakdown in real-time
- [ ] Usage limit tooltips on metric-backed services
- [ ] Publish button with status dispatch
- [ ] Edge state handling (no tiers, custom pricing, empty sections)

### Phase 4: Verification
- [ ] Run `npm run tsc`
- [ ] Run `npm run lint:fix`
- [ ] Visual review in Vetra

---

**Document Version**: 1.0
**Created**: 2026-02-16
**Clarification Rounds**: 3
**Quality Score**: 92/100
