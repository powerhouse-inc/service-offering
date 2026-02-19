# SI Group-Level Pricing Alignment — Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: The Service Offering (SO) model moved pricing to the service group level (`ServiceGroup.tierPricing[tier].recurringPricing[cycle]`). Individual services in SO have NO pricing — only service levels (INCLUDED, OPTIONAL, CUSTOM, VARIABLE). However, the Subscription Instance (SI) editor still displays per-service recurring costs in the ServicesPanel, and the MockDataButton creates services with individual `recurringAmount` fields. This creates a misalignment: the SO→SI import pipeline (`mapOfferingToSubscription`) correctly maps group-level pricing, but the editor UI and mock data don't reflect this.
- **Target Users**: Operators and subscribers viewing the Subscription Instance editor
- **Value Proposition**: Consistent pricing presentation across SO and SI. Group = pricing unit. Services = feature names with usage metrics. No confusion about where pricing authority lives.

### Feature Overview
- **Core Features**:
  1. Remove per-service recurring/setup cost display from `ServiceCard`
  2. Rewrite `MockDataButton` to use service groups with group-level pricing
  3. Ensure metrics display aligns with PRD (SI-R3/R5) in billing view
- **Feature Boundaries**:
  - In scope: Editor UI changes, mock data restructure
  - Out of scope: SI schema changes (per-service fields remain for backwards compatibility, just not displayed)
- **User Scenarios**:
  - Operator imports SO config → sees group-level prices in headers, services show only features + metrics
  - Operator uses mock data → sees same structure as imported data

### Detailed Requirements

#### Requirement 1: Remove per-service pricing from ServiceCard

**Current**: `ServiceCard` in `ServicesPanel.tsx` shows:
- `service.recurringCost?.amount` with billing cycle suffix (lines 157-174)
- `service.setupCost` standalone display (lines 176-196)
- Setup fee line with paid/pending status (lines 204-231)
- Next billing date from `service.recurringCost?.nextBillingDate` (lines 249-255)

**Required**: ServiceCard shows only:
- Service name
- Service description
- Custom value (e.g., "Up to 10 users")
- Metrics with usage bars (unchanged)

**Rationale**: In the SO model, services don't have individual prices. Pricing lives at the service group level. The SI is a snapshot of the SO state at subscription time. Individual services represent features/capabilities, not billing units.

#### Requirement 2: Rewrite MockDataButton with group-level pricing

**Current**: Creates 4 standalone services with `recurringAmount` ($299, $149, $199, $79), then 2 add-on groups with per-service pricing.

**Required**:
- Move core services into a "Core Infrastructure" service group with `recurringAmount: 726` (at group level)
- Security Suite group: `recurringAmount: 178` (at group level), `setupAmount: 750`
- Premium Support group: `recurringAmount: 498` (at group level), `setupAmount: 1200`
- Services within groups: name, description, metrics only — NO `recurringAmount`
- Add proper `selectedBillingCycle`, `globalCurrency`, and `tierPricingMode` to `initializeSubscription`

#### Requirement 3: Metrics display alignment (PRD SI-R3/R5)

**Already implemented**:
- BillingPanel shows metrics as billing line items: `usage / freeLimit → excess × unitCost = projected`
- ServicesPanel shows metrics as usage bars with freeLimit/paidLimit distinction

**Decision**: Keep both formats — different contexts serve different purposes:
- ServicesPanel = management view (interactive usage bars, operator edit affordances)
- BillingPanel = billing view (cost line items, projected overages)

No changes needed for metrics display.

## Design Decisions

### Technical Approach
- **Architecture Choice**: UI-only changes. Schema stays as-is for backwards compatibility.
- **Key Components**:
  - `ServiceCard` in ServicesPanel.tsx — remove pricing elements
  - `MockDataButton` — restructure to use group-level pricing via `initializeSubscription`
- **Data Storage**: No schema changes. Per-service pricing fields remain in schema but are no longer populated by the import pipeline or displayed in the editor.

### Constraints
- SI schema still allows per-service pricing (backwards compatibility)
- `mapOfferingToSubscription` already correctly maps group pricing — no changes needed
- `billing-utils.ts` `computeBillingBreakdown` iterates standalone services for backwards compatibility

### Risk Assessment
- **Technical Risks**: Minimal — removing UI display, not schema fields
- **Dependency Risks**: None — changes are editor-only
- **Data Risks**: Existing SI documents with per-service pricing will simply not show those prices in the new UI. Data is preserved but hidden.

## Acceptance Criteria

### Functional Acceptance
- [ ] ServiceCard shows service name, description, customValue, and metrics only — no recurring or setup cost
- [ ] Group headers show group-level recurring price with discount badges (already implemented)
- [ ] MockDataButton creates service groups with group-level `recurringAmount`
- [ ] MockDataButton services have metrics but NO individual `recurringAmount`
- [ ] Billing panel correctly computes totals from group-level recurring costs
- [ ] UsageBar and MetricActions unchanged (management view preserved)

### Quality Standards
- [ ] `npm run tsc` passes with no new errors
- [ ] `npm run lint:fix` passes with no new errors
- [ ] No regression in BillingPanel or SubscriptionHeader

## Execution Phases

### Phase 1: Remove per-service pricing from ServiceCard
- [ ] Remove `service.recurringCost` price display block
- [ ] Remove `service.setupCost` standalone display block
- [ ] Remove setup fee line items from ServiceCard
- [ ] Remove next billing date from ServiceCard
- [ ] Clean up unused `showSetupCost` prop if no longer needed

### Phase 2: Rewrite MockDataButton
- [ ] Use `initializeSubscription` with service groups and group-level pricing
- [ ] Create "Core Infrastructure" group with combined recurring price
- [ ] Create "Security Suite" group with group-level recurring + setup
- [ ] Create "Premium Support" group with group-level recurring + setup
- [ ] Services have name, description, metrics — no individual pricing
- [ ] Set `globalCurrency`, `selectedBillingCycle`, `tierPricingMode`

### Phase 3: Verification
- [ ] Run `npm run tsc`
- [ ] Run `npm run lint:fix`
- [ ] Verify import flow still works (mapOfferingToSubscription unchanged)

---

**Document Version**: 1.0
**Created**: 2026-02-17
**Clarification Rounds**: 1
**Quality Score**: 91/100
