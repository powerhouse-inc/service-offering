# Stakeholder Requirements Analysis — Subscription Instance & Achra Summary

**Sources**:
- [rgh req SI](rgh%20req%20SI)
- [rgh req achra summary view](rgh%20req%20achra%20summary%20view)
- Cross-referenced: [rgh-requirements-analysis-v1.0.md](rgh-requirements-analysis-v1.0.md) (SO analysis)

**Date**: 2026-02-12
**Status**: Pending stakeholder clarification

---

## Part 1 — Requirements Clarity Assessment

### Document A: Subscription Instance Editor (SI)

**Clarity Score: 61/100**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functional Clarity | 22/30 | Billing projection concept clear; section merging well described; setup cost relocation underspecified |
| Technical Specificity | 14/25 | No schema field references; no mention of which state fields change; operator view underspecified |
| Implementation Completeness | 12/25 | No edge cases; no validation rules; "less visible tab" undefined; limit increase feature treatment vague |
| Business Context | 13/20 | Clear rationale (billing projection vs invoice); dynamic vs fixed cost distinction valuable; no success metrics |

### Document B: Achra Summary View

**Clarity Score: 58/100**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functional Clarity | 21/30 | Two-part cost split (setup/recurring) is clear; metric display guidelines are actionable |
| Technical Specificity | 12/25 | No mention of data sources or which schema fields populate summary; no API contract |
| Implementation Completeness | 13/25 | Good UX guidance (expandable services, info icons); but no wireframe reference; no error states |
| Business Context | 12/20 | Clear user intent (concise, not overwhelming); no conversion metrics or user testing criteria |

---

## Part 2 — Requirement-by-Requirement Cross-Reference (SI Editor)

### SI-R1: "Use 'billing projection' terminology"

**Current state in editor:**
- `BillingPanel.tsx` uses "Billing Overview" as section title
- `SubscriptionHeader.tsx` shows "Next Bill" in quick stats
- State fields: `projectedBillAmount`, `projectedBillCurrency`, `nextBillingDate`

**Impact:**

| Item | Current | Required | Change |
|------|---------|----------|--------|
| BillingPanel title | "Billing Overview" | "Billing Projection" | UI text change |
| Header stat label | "Next Bill" | "Projected Bill" | UI text change |
| State schema | `projectedBillAmount` | Already named correctly | None |

**Verdict**: Low effort. Text-only changes. Schema already aligned.

---

### SI-R2: "Add disclaimer for dynamic billing projection"

**Current state**: No disclaimer exists. Billing amounts are shown as final numbers.

**Impact:**

| Item | Change | Complexity |
|------|--------|-----------|
| BillingPanel summary card | Add asterisk + disclaimer text (e.g., "* Projection based on current usage. May change with metric activity.") | Low |
| Individual overage lines | Mark with indicator icon | Low |
| State schema | No change needed — this is display-only | None |

**Verdict**: Low effort. Display-only. No schema changes.

---

### SI-R3: "Simplify billing overview — focus on current usage, free units, projected total"

**Current state**: BillingPanel has 3 sections:
1. Recurring Services (per-service line items with amounts)
2. Setup Costs (per-service setup fees with paid/unpaid status)
3. Overage Estimates (calculated from metrics exceeding free limits)

**Stakeholder wants**: Merge recurring services + metrics into one section, structured by service group.

**Required new structure:**
```
[Billing Projection]
├── Summary Cards: Currency | Projected Amount | Next Billing Date
├── [Service Group: "Core Services" — $1,200/mo]
│   ├── Regular Contributors: 3/5 free, $500/unit → $0.00 projected
│   └── API Calls: 12,000/10,000 free → 2,000 × $0.01 = $20.00 projected
├── [Service Group: "Finance Pack" — $300/mo]  (add-on)
│   └── Transaction Volume: 450/500 free → $0.00 projected
├── ─────────────
│   TOTAL PROJECTED: $1,520.00/mo *
│   * Projection based on current usage
└── [Tab/Link: "View Setup Costs →"]
```

**Impact:**

| Item | Current | Required | Complexity |
|------|---------|----------|-----------|
| BillingPanel structure | 3 flat sections | Grouped by service group with metrics as sub-items | **Major refactor** |
| Service group as header | Not linked to pricing | Show group recurring price as header | Requires group-level pricing (depends on SO-R2/R3) |
| Metrics as line items | Separate overage section | Inline under parent group | Medium restructure |
| Setup costs | In same panel | Moved to separate tab | New tab/section |

**Cross-dependency with SO requirements**: This requirement assumes pricing lives at the service group level. The SO analysis (Q1, Q2) identified this as pending stakeholder clarification. **SI-R3 cannot be fully implemented until the SO pricing restructure is resolved.**

---

### SI-R4: "Move setup costs to a different, less visible tab"

**Current state**: Setup costs are shown as a violet-accented section in BillingPanel, and as line items within service cards in ServicesPanel.

**Impact:**

| Item | Current | Required | Complexity |
|------|---------|----------|-----------|
| BillingPanel | Setup section visible by default | Moved to separate tab/panel | Medium |
| ServicesPanel | Setup fee line in service cards | May need to be hidden or simplified | Low |
| Editor layout | No tab system exists | Need tab/accordion infrastructure | Medium |
| Operator view | Shows paid/unpaid status | Should retain setup cost management in operator view | Low |

**Open question**: Does "less visible tab" mean:
- (a) A collapsible section at the bottom of BillingPanel?
- (b) A separate tab in a tabbed interface?
- (c) A separate panel in the sidebar?

---

### SI-R5: "Merge recurring services and metrics sections — group header + metric line items"

**Current state**: ServicesPanel shows services with inline metrics (usage bars). BillingPanel shows billing amounts separately. These are two different panels with different data presentations.

**Stakeholder wants**: In the billing view, service group = header with price, metrics = indented line items showing usage and cost contribution.

**Impact:**

| Item | Current | Required | Complexity |
|------|---------|----------|-----------|
| BillingPanel | Flat list of service recurring costs | Hierarchical: Group → metrics with usage + cost | **Major refactor** |
| Data flow | Services and metrics traversed separately | Need to traverse: groups → services → metrics | Medium |
| Display | Recurring amount per service | Recurring amount per group + per-metric dynamic cost | Requires group-level pricing |

**Cross-dependency**: Requires service group pricing from SO model. Currently `ServiceGroup` in subscription-instance has no `recurringCost` or `setupCost` fields.

---

### SI-R6: "Set one global currency at instance level"

**Current state**:
- `SubscriptionInstanceState` has `projectedBillCurrency` and `tierCurrency`
- Each `Service.recurringCost` and `Service.setupCost` has its own `currency` field
- Each `ServiceMetric.unitCost` has its own `currency` field
- `SelectedOptionGroup` has its own `currency` field
- `BillingPanel.tsx` falls back through multiple sources with default "USD"

**Stakeholder wants**: One authoritative currency field. No mixed currencies in billing.

**Impact:**

| Item | Current | Required | Complexity |
|------|---------|----------|-----------|
| State schema | `projectedBillCurrency` exists but not enforced | Make this the single source OR add explicit `billingCurrency` field | Low schema change |
| Per-entity currency | Each cost has own currency | Redundant but harmless — enforce at dispatch/UI level | Validation rule |
| BillingPanel | Complex currency fallback logic | Simplify to read from one field | Low |
| InitializeSubscription | Has `projectedBillCurrency` | Could add dedicated `billingCurrency` field | Low |

**Open question**: Should we:
- (a) Use `projectedBillCurrency` as the authoritative field (rename to `billingCurrency`)?
- (b) Add a new `billingCurrency` field and deprecate per-entity currencies?
- (c) Keep per-entity currencies but validate they all match at dispatch time?

---

### SI-R7: "Fixed vs dynamic cost distinction"

**Current state**: BillingPanel separates recurring vs setup vs overage, but doesn't explicitly label costs as "fixed" or "dynamic."

**Stakeholder wants**: Clear labeling:
- **Fixed costs**: Recurring service group fees + setup costs (don't change unless subscription modified)
- **Dynamic costs**: Metric-based charges (change with usage)

**Impact:**

| Item | Change | Complexity |
|------|--------|-----------|
| BillingPanel labels | Add "Fixed" / "Dynamic" section labels or badges | Low |
| Projected total | Show breakdown: "Fixed: $1,200 + Dynamic: $320 = $1,520" | Low |
| Disclaimer | Dynamic costs get the asterisk treatment (SI-R2) | Low |

**Verdict**: Low effort. Display/labeling only. No schema changes.

---

### SI-R8: "Operator view mirrors client view with editable fields"

**Current state**: Operator vs client distinction is binary:
- Operator: has direct action buttons (±, adjust, approve/reject), sees all data
- Client: has request-only flow, sees limited data

**Stakeholder wants**: Operator view should look like client view but with selective editability (limit adjustments, billing date changes — "non-frequently changing" items).

**Impact:**

| Item | Current | Required | Complexity |
|------|---------|----------|-----------|
| BillingPanel | Same for both modes | Operator: inline edit for billing date, amounts | Medium |
| ServicesPanel | Different actions | Operator: edit icons instead of heavy action buttons | Medium |
| MetricActions | Full ±/adjust buttons | Simpler edit approach (inline or modal) | Medium |
| Overall layout | Same grid | Should be identical grid, just with edit affordances | Low |

**Open question**: Which specific fields should be operator-editable? Current editable items include:
- Metric usage (±, adjust)
- Service add/remove
- Subscription status changes
- Customer info
- Budget category
- Operator notes

The stakeholder says "non-frequently changing adjustments" — need to define which subset.

---

## Part 3 — Requirement-by-Requirement Cross-Reference (Achra Summary)

### ACHRA-R1: "Summary shows operator, product name, price, configuration"

**Current state**: The Achra purchase wizard Step 4 summary was analyzed in the previous session. We identified and fixed gaps in `InitializeSubscriptionInput` so the subscription instance can now store:
- `operatorName` ✅ (added)
- `tierName`, `tierPrice`, `tierCurrency` ✅ (added)
- Resource info (label, thumbnail) ✅ (existed)
- `targetAudienceId`, `targetAudienceLabel` ✅ (existed)

**Verdict**: Schema is now aligned from our earlier work. Summary view can pull all header data from subscription state.

---

### ACHRA-R2: "Exclude metrics from high-level summary, but show metric pricing"

**Current state**: No Achra summary component exists yet (the wizard UI is not built).

**Implication for data model**: The subscription instance already stores metrics per service (`ServiceMetric`). The summary view should:
- Hide: `currentUsage`, `usageResetPeriod`, `nextUsageReset`
- Show: `freeLimit`, `unitCost.amount`, `unitCost.currency`

**Verdict**: No schema change needed. This is a display rule for the Achra summary component.

---

### ACHRA-R3: "Minimize services display, group at service group level"

**Current state**: Service groups in subscription instance already group services. Each group has:
- `name`, `billingCycle`, `optional`, `optionGroupId`
- `services[]` with individual service details

**Impact**: Summary should show:
- Group name + group-level price (requires group-level pricing — depends on SO restructure)
- Expandable: individual service names + service levels
- NOT: per-service pricing (being removed per SO requirements)

**Cross-dependency**: Same as SI-R3/R5. Group-level pricing must exist before summary can show group prices.

---

### ACHRA-R4: "Split costs: Setup Costs (immediate) vs Recurring Costs (ongoing)"

**Current state**: Subscription instance has `SetupCost` and `RecurringCost` on individual services.

**Stakeholder wants two clear sections in summary:**
1. **Setup Costs** = one-time costs from all service groups (excluding metrics) → "Pay Now"
2. **Recurring Costs** = group recurring + metric recurring + metric setup costs after start → "Ongoing"

**Important nuance**: "Metric setup costs that occur after subscription starts" should go under Recurring, not Setup. This means some setup costs are actually deferred and should be presented as recurring.

**Impact:**

| Item | Change | Complexity |
|------|--------|-----------|
| Summary component | Two cost sections with clear labels | Medium (new component) |
| Cost classification | Need to distinguish immediate setup vs deferred metric setup | Logic in summary component |
| Service `isSetupService` flag | Already exists on subscription Service type (we added it) | Used to classify |

**Open question**: How do we distinguish "immediate setup" from "deferred metric setup"? Is `isSetupService: true` the indicator for immediate? Or is the distinction based on whether the cost is on a service vs a metric?

---

### ACHRA-R5: "Use info icons / tooltips for granular metric details"

**Impact**: Pure UI design guidance. No schema changes. Informs the component architecture of the future Achra summary wizard step.

---

## Part 4 — Cross-Cutting Dependencies

### Dependency Map

```
SO Requirements (pricing restructure)
    │
    ├──→ SI-R3: Merge recurring + metrics by group (needs group-level pricing)
    ├──→ SI-R5: Group header with recurring price (needs group-level pricing)
    ├──→ ACHRA-R3: Group costs at service group level (needs group-level pricing)
    └──→ ACHRA-R4: Setup vs recurring split (needs clear cost ownership)

SI-R6: Global currency
    │
    └──→ ACHRA-R4: Cost summation assumes single currency

SI-R4: Setup costs in separate tab
    │
    └──→ ACHRA-R4: Setup costs as "immediate payment" (same data, different view)
```

### Implementation Order (Recommended)

```
Phase 0: Resolve SO pricing questions (Q1, Q2 from SO analysis)
    │
Phase 1: Schema changes
    ├── SI-R6: Add billingCurrency field (or enforce projectedBillCurrency)
    ├── Add setupCost/recurringCost to ServiceGroup (subscription-instance)
    └── Remove per-service pricing if SO confirms
    │
Phase 2: SI Editor restructure
    ├── SI-R1: Rename to "Billing Projection"
    ├── SI-R2: Add disclaimer
    ├── SI-R7: Fixed vs dynamic labels
    ├── SI-R3/R5: Merged group → metrics billing view
    ├── SI-R4: Setup costs tab
    └── SI-R8: Operator view alignment
    │
Phase 3: Achra summary component
    ├── ACHRA-R1: Header section (already schema-ready)
    ├── ACHRA-R3: Grouped services with expandable detail
    ├── ACHRA-R4: Setup vs recurring cost split
    ├── ACHRA-R2/R5: Metric display rules (info icons, hide usage)
    └── Wire to purchase wizard Step 4
```

---

## Part 5 — Open Questions for Stakeholder

### Priority: Critical (blocks implementation)

**Q1 — Service Group Pricing on Subscription Instance** (Critical)
> When pricing moves to the service group level (per SO requirements), what should the subscription instance `ServiceGroup` type store?
> - (a) The final selected price: `recurringAmount + recurringCurrency + billingCycle + setupAmount + setupCurrency`
> - (b) Just a reference to the selected pricing option, with amounts computed at display time
> - (c) A full snapshot of all pricing options so the customer can switch billing cycles post-subscription

**Q2 — Setup Cost Tab Semantics** (High)
> "Move setup costs to a less visible tab" — does this mean:
> - (a) Collapsible section at bottom of billing panel
> - (b) A separate tab within a new tabbed billing interface
> - (c) A separate panel in the editor sidebar
> - (d) Hidden by default, revealed on click/toggle

**Q3 — Limit Increase Feature Disposition** (High)
> The requirement says "downplayed and separated." Currently this is part of MetricActions with a prominent button. Should it be:
> - (a) Moved to a dropdown menu or "..." overflow
> - (b) Only accessible from PendingRequestsPanel
> - (c) Removed from the billing view entirely, available only in the services view
> - (d) Kept but visually de-emphasized (smaller, gray)

**Q4 — Achra Summary: Deferred Metric Setup Costs** (High)
> The requirement says metric setup costs go under "Recurring Costs" in the summary. How do we identify which setup costs are immediate vs deferred?
> - Is `isSetupService: true` the indicator for "immediate setup cost"?
> - Or is the rule: all service-level setup = immediate, all metric-level setup = deferred?

### Priority: Medium

**Q5 — Global Currency Enforcement** (Medium)
> Should the system:
> - (a) Reject operations that use a different currency than the subscription's billing currency
> - (b) Allow mixed currencies in state but display all amounts in billing currency (conversion?)
> - (c) Simply use one currency field and ignore per-entity currencies

**Q6 — Operator Editable Fields** (Medium)
> Which fields should be inline-editable for operators in the new "mirrors client view" approach?
> Candidates: billing date, metric limits, recurring amounts, service levels, group pricing.
> Which subset is "non-frequently changing"?

**Q7 — Metric Pricing in Achra Summary** (Medium)
> The requirement says "exclude metrics but include metric pricing." Specifically, should the summary show:
> - (a) Per-metric unit price only (e.g., "$500/mo per additional contributor")
> - (b) Free allowance + unit price (e.g., "5 included, then $500/mo each")
> - (c) Projected overage cost based on some default assumption

---

## Part 6 — Impact on Recent Work

We recently added several fields to the subscription-instance model. Here's how the SI requirements affect that work:

| Recent Addition | SI Requirement Impact | Risk |
|----------------|----------------------|------|
| `customValue` on Service | Unaffected — display field | None |
| `facetLabel` on Service | Unaffected — display field | None |
| `isSetupService` on Service | Relevant to ACHRA-R4 (immediate vs deferred classification) | Low — aligns well |
| `displayOrder` on Service/Group | Unaffected — ordering field | None |
| `operatorName` on state | Aligns with ACHRA-R1 | None |
| `tierPrice`/`tierCurrency` on state | May become redundant if pricing moves to group level | Medium — SO dependency |
| `projectedBillAmount`/`Currency` | Aligns with SI-R1/R6 (billing projection) | None |
| `setupCost`/`recurringCost` on Service | **May be removed** if pricing moves to group level per SO requirements | **High** |
| `optionGroupId` on ServiceGroup | Useful for linking add-on groups to pricing | None |

### Risk Summary

The highest risk is that our recently added per-service `setupCost`/`recurringCost` fields (and the related operations) **may need to be removed or relocated** to the service group level, depending on the resolution of the SO pricing structure questions (SO Q1, Q2).

**Recommendation**: Do not remove these fields yet. Wait for SO pricing decisions. If pricing moves to groups, these fields become deprecated but don't break anything. If the stakeholder decides on a hybrid model (group pricing + optional per-service overrides), they remain useful.

---

## Part 7 — Consistency Check: SI vs Achra Summary Requirements

| Topic | SI Requirement | Achra Summary Requirement | Consistent? |
|-------|---------------|--------------------------|-------------|
| Cost grouping | Group by service group | Group at service group level | Yes |
| Setup costs | Separate tab, less visible | Separate section: "Pay Now" | Yes — same data, different UX |
| Metrics display | Inline under group as billing line items | Exclude details, show pricing only | **Partial conflict** — SI shows usage bars, Achra hides usage |
| Currency | Single global currency | Implied single currency (sums costs) | Yes |
| Pricing source | Service group price as header | Service group price in summary | Yes — both need group-level pricing |
| Disclaimer | Add projection disclaimer | Not mentioned | N/A — Achra is pre-subscription, SI is post |
| Operator info | Not explicitly mentioned | Show operator in summary | Compatible |

**The one tension**: SI wants metrics as prominent billing line items showing current usage and projected overages, while Achra summary wants metrics hidden with only pricing shown via tooltips. This is actually fine — they're different contexts (ongoing billing management vs pre-purchase summary).

---

**Document Version**: 1.0
**Created**: 2026-02-12
**SI Clarity Score**: 61/100
**Achra Summary Clarity Score**: 58/100
