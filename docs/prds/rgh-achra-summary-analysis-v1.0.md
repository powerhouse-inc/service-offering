# Stakeholder Requirements Analysis — Achra Summary View

**Source**: [rgh req achra summary view](rgh%20req%20achra%20summary%20view)
**Reference Mockup**: [Summary for Service Offerings.pdf](../../Context/Summary%20for%20Service%20Offerings.pdf)
**Cross-references**:
- [rgh-requirements-analysis-v1.0.md](rgh-requirements-analysis-v1.0.md) (SO pricing restructure)
- [rgh-si-requirements-analysis-v1.0.md](rgh-si-requirements-analysis-v1.0.md) (SI editor restructure)
- [service-purchase-flow-v1.0-prd.md](service-purchase-flow-v1.0-prd.md) (Step 4 spec)

**Date**: 2026-02-12
**Status**: Pending stakeholder clarification on 8 questions

---

## Part 1 — Requirements Clarity Assessment

**Clarity Score: 58/100**

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functional Clarity | 22/30 | Two-part cost split is clear; metric display guidelines are actionable; section structure well-described |
| Technical Specificity | 10/25 | No field-level mapping to data model; no mention of which schema types feed which sections; no API contract |
| Implementation Completeness | 14/25 | Good UX heuristics (expandable, info icons); but no error states, loading states, empty states, or shareable-URL interaction |
| Business Context | 12/20 | Clear user intent (concise, not overwhelming); no conversion metrics, A/B testing criteria, or analytics events |

**What's Clear:**
- Summary shows: operator, product name (resource template), price, tier, add-ons
- Metrics excluded from high-level view; metric *pricing* included
- Services minimized / expandable; costs grouped at service group level
- Two-part cost split: Setup Costs (immediate) vs Recurring Costs (ongoing)
- Info icons / tooltips for granular metric details (free allowance, per-unit cost)

**What's Ambiguous or Missing (see Part 5):**
- How metric pricing is displayed when metrics are excluded
- Where "metric setup costs that occur after subscription starts" appear
- How the summary relates to the subscription-instance creation flow
- No mention of shareable URL behavior (existing PRD has this)
- No mention of contact form / login gating (existing PRD has this)

---

## Part 2 — Requirement-by-Requirement Analysis

### ACHRA-R1: "Summary shows operator, product name, price, configuration"

**PDF Mockup Reference — Section 1 (Header):**
```
┌─────────────────────────────────────────────────┐
│ Powerhouse Genesis OH                           │
│ OPERATOR                                        │
│                                                 │
│ Operational Hub for Open Source Builders  $550/mo│
│ RESOURCE TEMPLATE                    + $3,000 Setup│
└─────────────────────────────────────────────────┘
```

**Data Source Mapping:**

| Display Field | Data Source | Schema Field | Available? |
|--------------|------------|-------------|-----------|
| Operator name | Service Offering | `ServiceOfferingState.operatorId` → resolve name | Partially — name not on SO, but `operatorName` now on SI state ✅ |
| "OPERATOR" label | Static | — | N/A |
| Resource template name | Resource Template doc | `resource.label` on SI state | ✅ Added in previous session |
| "RESOURCE TEMPLATE" label | Static | — | N/A |
| Total recurring price | Computed | Sum of tier base + add-on recurring costs | Computed at display time |
| Total setup price | Computed | Sum of all setup costs | Computed at display time |
| Resource thumbnail | Resource Template doc | `resource.thumbnailUrl` on SI state | ✅ Existed |

**Gap**: The header shows `$550/mo + $3,000 Setup` which are **computed totals**, not stored fields. The summary component must aggregate:
- Recurring: tier base ($300) + Finance Pack ($50) + Hosting Suite ($200) = $550/mo
- Setup: Legal Setup ($3,000) = $3,000

This requires traversing `serviceGroups` and `selectedOptionGroups`. All data is available in the subscription-instance state.

**Verdict**: Schema-ready. No changes needed. Computation logic required in summary component.

---

### ACHRA-R2: "Pricing matters, including metric-based pricing"

**Stakeholder intent**: Even though metric *details* (usage counts, reset cycles) are excluded, metric *pricing* must still be visible.

**What "metric pricing" includes:**

| Metric Pricing Element | Schema Field | Where It Lives |
|----------------------|-------------|---------------|
| Free allowance | `ServiceMetric.freeLimit` | Per metric on subscription Service |
| Paid limit | `ServiceMetric.paidLimit` | Per metric on subscription Service |
| Per-unit overage cost | `ServiceMetric.unitCost.amount` | Per metric on subscription Service |
| Overage currency | `ServiceMetric.unitCost.currency` | Per metric on subscription Service |
| Overage billing cycle | `ServiceMetric.unitCost.billingCycle` | Per metric on subscription Service |

**Display approach** (from stakeholder): Info icons / tooltips showing:
- "5 contributors included, then $500/mo each"
- "10,000 API calls included, then $0.01/call"

**PDF mockup observation**: The mockup does NOT show metric pricing at all. It shows `customValue` text (e.g., "Up to 6", "3 Accounts", "Pro", "10 Accounts") but no per-unit overage pricing. This creates a **conflict between the requirements text and the mockup**.

**Open question (Q1)**: The mockup shows no metric pricing. The text says "pricing matters, including metric-based pricing." Where exactly should metric pricing appear — as a tooltip on the service line, as a sub-line, or in the pricing breakdown section?

---

### ACHRA-R3: "Minimize services, group at service group level"

**PDF Mockup Reference — Section 3 (Tier + Included Groups):**
```
┌─────────────────────────────────────────────────┐
│ Tier                                      Team  │
│ BASE PRICE                           $300/mo    │
│ ─────────────────────────────────────────────── │
│ 🔒 Legal Setup                       INCLUDED   │
│   Needs Analysis                          ✓     │
│   Incorporation Docs                      ✓     │
│     One-time fee                     $3,000     │
│ SETUP FEE                            $3,000     │
│ ─────────────────────────────────────────────── │
│ 🔒 Recurring Operational Service     INCLUDED   │
│   Contributor Contracting            Up to 6    │
│   Tax Administration                      ✓     │
│   Dedicated Account Manager               —     │
│ SUBTOTAL                             $300/mo    │
└─────────────────────────────────────────────────┘
```

**Data Source Mapping:**

| Display Element | Source Type | Schema Path |
|----------------|-----------|------------|
| Tier name ("Team") | Subscription Instance | `state.tierName` ✅ |
| Base price ($300/mo) | Subscription Instance | `state.tierPrice` + `state.tierCurrency` ✅ |
| Service group name ("Legal Setup") | ServiceGroup | `serviceGroups[].name` ✅ |
| "INCLUDED" badge | ServiceLevelBinding | `services[].serviceLevel` = INCLUDED ✅ |
| Service name ("Needs Analysis") | Service | `services[].name` ✅ |
| Service level indicator (✓, —, "Up to 6") | Service | `services[].serviceLevel` + `services[].customValue` ✅ |
| One-time fee line ($3,000) | Service | `services[].setupCost.amount` (current) or group-level (future) |
| Setup fee subtotal | Computed | Sum of setup costs in group |
| Recurring subtotal | Computed | Group recurring price (future) or tier base (current) |

**Key insight from mockup**: Services ARE shown — they're just presented as simple rows under the group header, not as full cards. The "minimize" requirement means: show service name + level indicator only, no description, no metrics, no cost per service.

**Current schema support**: All fields needed are available:
- `services[].name` ✅
- `services[].serviceLevel` ✅ (INCLUDED → ✓, NOT_INCLUDED → —, CUSTOM → customValue)
- `services[].customValue` ✅ (added in previous session: "Up to 6", "Pro", etc.)
- `services[].facetLabel` ✅ (added: for facet badges)
- `services[].isSetupService` ✅ (added: identifies setup group vs recurring group)
- `services[].setupCost` ✅ (for one-time fee display)

**Verdict**: Schema-ready for current mockup. Future dependency on SO pricing restructure for group-level pricing.

---

### ACHRA-R4: "Split costs — Setup (immediate) vs Recurring (ongoing)"

**PDF Mockup Reference — Section 5 (Pricing Breakdown):**
```
┌─────────────────────────────────────────────────┐
│ PRICING SUMMARY                                 │
│ ─────────────────────────────────────────────── │
│ RECURRING                                       │
│   Tier (Team)                        $300/mo    │
│   Finance Pack                        $50/mo    │
│   Hosting Suite                      $200/mo    │
│ TOTAL RECURRING                      $550/mo    │
│ ─────────────────────────────────────────────── │
│ ONE-TIME SETUP                                  │
│   Legal Setup                        $3,000     │
│ TOTAL SETUP                          $3,000     │
└─────────────────────────────────────────────────┘
```

**Stakeholder refinement** (beyond mockup): The text adds nuance the mockup doesn't show:

| Cost Category | What's Included | Stakeholder Text |
|--------------|----------------|-----------------|
| **Setup Costs** (immediate) | One-time costs from all service groups, **excluding metrics** | "Display Setup Costs (one-time costs from all service groups, excluding metrics) as the immediate payment" |
| **Recurring Costs** (ongoing) | Group recurring + metric recurring + **metric setup costs that occur after subscription starts** | "Display Recurring Costs (service group recurring costs, metric recurring costs, and metric setup costs that occur after the subscription starts)" |

**Critical classification rule:**

```
IF cost.type == SETUP AND cost.source == SERVICE_GROUP → Setup Costs (immediate)
IF cost.type == SETUP AND cost.source == METRIC       → Recurring Costs (deferred)
IF cost.type == RECURRING                              → Recurring Costs
```

**How to implement this classification:**

| Classification Signal | Current Schema Support | Notes |
|----------------------|----------------------|-------|
| Service-level setup (immediate) | `services[].isSetupService == true` + `services[].setupCost` | ✅ Available |
| Group-level setup (immediate) | No group-level setupCost exists yet | ❌ Depends on SO restructure |
| Metric setup (deferred) | No concept of "metric setup cost" in schema | ❌ **Gap** |
| Metric recurring | `ServiceMetric.unitCost` (RecurringCost type) | ✅ Available |

**Gap identified — "Metric setup costs"**: The stakeholder mentions "metric setup costs that occur after the subscription starts." This concept does not exist in either document model. Metrics currently have:
- `unitCost: RecurringCost` — per-unit overage pricing (recurring)
- No `setupCost` on metrics

**Open question (Q2)**: What are "metric setup costs"? Examples:
- (a) A one-time fee to activate a metric (e.g., "$100 to enable API monitoring")
- (b) The first billing cycle's overage charge (treated as a setup)
- (c) Something else entirely

**Data sources for pricing breakdown:**

| Breakdown Line | Data Source | Schema Path |
|---------------|-----------|------------|
| Tier (Team) $300/mo | Subscription state | `state.tierPrice` + `state.tierCurrency` ✅ |
| Finance Pack $50/mo | SelectedOptionGroup | `selectedOptionGroups[].price` where `costType == RECURRING` ✅ |
| Hosting Suite $200/mo | SelectedOptionGroup | `selectedOptionGroups[].price` where `costType == RECURRING` ✅ |
| Legal Setup $3,000 | Service/Group setup | `services[].setupCost` where `isSetupService == true` ✅ (current) |

**Verdict**: Mostly schema-ready for the mockup's example. Two gaps: (1) group-level pricing depends on SO restructure, (2) "metric setup costs" concept is undefined.

---

### ACHRA-R5: "Expandable services"

**Stakeholder text**: "Minimize the display of individual services, perhaps making them expandable"

**PDF mockup**: Services ARE shown directly (not collapsed). But this may represent the expanded state.

**Implementation approach:**
- Service group header: always visible with name + price + INCLUDED/SELECTED badge
- Service list: collapsed by default, expandable on click
- Each service row: name + level indicator (✓, —, customValue)

**Impact**: Pure UI component design. No schema changes.

**UX consideration**: The mockup shows all services expanded. For groups with many services (10+), a collapsed default with "Show N services" toggle is appropriate. For small groups (2-3 services), showing all by default may be better.

---

### ACHRA-R6: "Info icons for metric details"

**Stakeholder text**: "Use comment-like features or information icons for granular metric details (like absolute limits) to prevent overwhelming the user, while still showing relevant pricing information (free allowances, per-unit costs)."

**Where metrics appear in the mockup**: They don't appear explicitly. Services like "Contributor Contracting: Up to 6" use `customValue` which is a text summary, not live metric data.

**Proposed tooltip content for metric-backed services:**

```
┌─ Contributor Contracting ─── Up to 6 ──── ℹ️ ─┐
│                                                │
│  Tooltip:                                      │
│  ┌──────────────────────────────────────────┐  │
│  │ Included: 6 contributors                 │  │
│  │ Maximum: 10 contributors                 │  │
│  │ Overage: $500/mo per additional           │  │
│  │ Reset: Monthly                            │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

**Data needed for tooltip:**

| Tooltip Field | Schema Path | Available? |
|--------------|------------|-----------|
| Included (free limit) | `ServiceMetric.freeLimit` | ✅ |
| Maximum (paid limit) | `ServiceMetric.paidLimit` | ✅ |
| Overage per unit | `ServiceMetric.unitCost.amount` + `.currency` | ✅ |
| Billing cycle | `ServiceMetric.unitCost.billingCycle` | ✅ |
| Reset period | `ServiceMetric.usageResetPeriod` | ✅ |

**Challenge**: At the Achra summary stage (pre-subscription), we're showing a *preview* built from the service-offering configuration, not from a live subscription-instance. The metric data at this stage comes from `ServiceUsageLimit` on the service-offering tier, not from `ServiceMetric` on the subscription-instance.

**Mapping from service-offering to summary tooltip:**

| Service Offering Source | Maps To |
|------------------------|---------|
| `ServiceUsageLimit.freeLimit` | "Included" |
| `ServiceUsageLimit.paidLimit` | "Maximum" |
| `ServiceUsageLimit.unitPrice` + `.unitPriceCurrency` | "Overage per unit" |
| `ServiceUsageLimit.resetCycle` | "Reset period" |

**Verdict**: Data available from service-offering schema. No new fields needed. Requires mapping logic in the summary component.

---

### ACHRA-R7: "Exclude metric details, include metric pricing"

This is the synthesis of R2 + R6. The rule is:

| Data Element | Show in Summary? | How? |
|-------------|-----------------|------|
| Metric name | No (hidden behind service) | — |
| Current usage | No | — |
| Usage reset period | No (tooltip only) | ℹ️ icon |
| Free limit | Tooltip only | ℹ️ icon: "5 included" |
| Paid limit | Tooltip only | ℹ️ icon: "max 10" |
| Unit overage cost | Yes — visible | Inline or tooltip: "$500/mo each additional" |
| Overage billing cycle | Yes — with unit cost | Part of cost display |

**The tension**: "Exclude metrics" but "include metric pricing." Resolution: the `customValue` text on the service line (e.g., "Up to 6") serves as the user-facing summary. The info icon reveals the pricing breakdown for users who want detail.

---

## Part 3 — Mockup vs Requirements Consistency Check

| Mockup Element | Requirements Text | Consistent? | Notes |
|---------------|-------------------|-------------|-------|
| Header: Operator + Resource Template | "Clearly summarize operator, product name" | ✅ Yes | |
| Header: $550/mo + $3,000 Setup | "Price" | ✅ Yes | Computed totals |
| Section 2: Configuration details | "Selected configuration details" | ✅ Yes | Facet selections |
| Section 3: Tier + services listed individually | "Minimize services, make expandable" | ⚠️ Partial | Mockup shows all services; text says minimize |
| Section 3: No metric pricing shown | "Pricing matters, including metric-based pricing" | ❌ Conflict | Mockup shows customValue text only, no overage pricing |
| Section 4: Add-ons with service details | "Group all costs at service group level" | ✅ Yes | Groups shown with sub-services |
| Section 5: Recurring vs One-Time split | "Split costs into Setup and Recurring" | ✅ Yes | Clear two-part breakdown |
| No metric details anywhere | "Exclude metrics from high-level summary" | ✅ Yes | |
| No info icons in mockup | "Use info icons for metric details" | ❌ Missing | Mockup doesn't show info icons |
| No "metric setup costs" shown | "Metric setup costs under Recurring" | ❌ Missing | Not represented in mockup |

**Conclusion**: The mockup is a good structural foundation but is missing two stakeholder requirements:
1. Metric pricing visibility (info icons / tooltips)
2. Metric setup costs classification

---

## Part 4 — Cross-Cutting Dependencies

### With SO Pricing Restructure

| SO Requirement | Impact on Achra Summary | Severity |
|---------------|------------------------|----------|
| Pricing moves to service group level | Section 5 line items change from tier+addons to group-level prices | **High** — restructures pricing breakdown |
| Per-tier, per-billing-cycle pricing matrix | Summary must show the selected billing cycle's price, not a generic price | **Medium** — display logic |
| Remove pricing from individual services | Service lines in Sections 3/4 lose per-service cost | **Low** — mockup already doesn't show per-service costs |

### With SI Editor Restructure

| SI Requirement | Impact on Achra Summary | Severity |
|---------------|------------------------|----------|
| SI-R6: Single global currency | Summary already assumes single currency (no mixing in mockup) | **None** — aligned |
| SI-R4: Setup costs separate tab | Same data split as ACHRA-R4 pricing breakdown | **None** — same pattern |
| SI-R3/R5: Group-based billing | Summary already groups by service group | **None** — aligned |

### With Previous Session Work

| Recent Change | Relevance to Achra Summary | Status |
|--------------|---------------------------|--------|
| `operatorName` on SI state | Feeds header "OPERATOR" line | ✅ Ready |
| `tierName`, `tierPrice`, `tierCurrency` | Feeds Section 3 tier header + Section 5 recurring line | ✅ Ready |
| `customValue` on Service | Feeds service level display ("Up to 6", "Pro") | ✅ Ready |
| `facetLabel` on Service | Could feed facet badge on service lines | ✅ Ready |
| `isSetupService` on Service | Identifies setup groups for Section 5 cost classification | ✅ Ready |
| `displayOrder` on Service/Group | Controls rendering order in Sections 3/4 | ✅ Ready |
| `resource.label`, `resource.thumbnailUrl` | Feeds header "RESOURCE TEMPLATE" line | ✅ Ready |
| Facet selections | Feed Section 2 configuration display | ✅ Ready |
| Selected option groups | Feed Section 4 add-ons | ✅ Ready |

---

## Part 5 — Open Questions for Stakeholder

### Critical (blocks implementation)

**Q1 — Metric Pricing Placement**
> The requirements say "pricing matters, including metric-based pricing" but the mockup shows no metric pricing. Where should metric overage costs appear?
> - (a) As a tooltip/info icon on the service line (e.g., ℹ️ on "Contributor Contracting: Up to 6")
> - (b) As a sub-line under the service (e.g., "+ $500/mo per additional contributor")
> - (c) As a separate "Metric Pricing" section in the pricing breakdown
> - (d) Only in the recurring costs total as a projected overage amount

**Q2 — "Metric Setup Costs" Definition**
> The requirement mentions "metric setup costs that occur after the subscription starts" under Recurring Costs. What is a metric setup cost? This concept doesn't exist in the current data model.
> - (a) A one-time activation fee per metric (e.g., "$100 to enable monitoring")
> - (b) The first overage charge for a metric
> - (c) Something else — please describe with example

**Q3 — Pricing Breakdown: Group-Level or Entity-Level?**
> The mockup shows:
> - RECURRING: Tier (Team) $300, Finance Pack $50, Hosting Suite $200
> - ONE-TIME: Legal Setup $3,000
>
> If pricing moves to the service group level (per SO requirements), should Section 5 show:
> - (a) Group-level prices (e.g., "Core Services $300/mo, Finance Pack $50/mo") — replacing "Tier (Team)" with individual group recurring prices
> - (b) Keep "Tier (Team)" as an aggregate and only list add-ons separately
> - (c) Something else

### High Priority

**Q4 — Expandable vs Visible Services**
> The mockup shows all services visible by default. The text says "minimize, perhaps making expandable." Which approach:
> - (a) All services visible as in mockup (no expand/collapse)
> - (b) Collapsed by default, "Show N services" toggle
> - (c) First 3 visible, rest behind "Show more"
> - (d) Different behavior for included groups (visible) vs add-ons (collapsed)

**Q5 — Configuration Section Data Source**
> Section 2 shows "Anonymity: High, Legal Entity: Swiss Association, Team: Remote, SNO Function: ..." These are facet selections. In the purchase flow, these come from the user's selections in Step 3.
> - Are these always the same 4 facet categories, or dynamic based on the service offering's `facetTargets`?
> - Should this section show ALL selected facets, or only a curated subset?

### Medium Priority

**Q6 — Pre-Subscription vs Post-Subscription Summary**
> The Achra summary is shown at Step 4 (pre-purchase). After the subscription-instance is created, should the same summary layout be available as a read-only view in the SI editor? Or are these completely separate UIs?

**Q7 — Billing Cycle Display**
> The mockup shows "$300/mo" (monthly). If the user selects a quarterly or annual billing cycle:
> - (a) Show monthly equivalent: "$250/mo billed quarterly at $750"
> - (b) Show actual billing amount: "$750/qtr"
> - (c) Show both: "$750/qtr ($250/mo equivalent)"

**Q8 — Empty/Edge States**
> What should the summary show when:
> - No add-ons selected (Section 4 empty)
> - No setup costs (Section 5 one-time empty)
> - Enterprise/custom pricing tier selected (no fixed amounts)
> - User hasn't completed all selections yet (partial summary)

---

## Part 6 — Component Architecture (Proposed)

Based on the mockup and requirements, here's the proposed component breakdown for the Achra summary:

```
<AchraSummary>
├── <SummaryHeader>
│   ├── Operator name + label
│   ├── Resource template name + thumbnail + label
│   └── Total price badges (recurring + setup)
│
├── <ConfigurationSection>
│   └── Facet selection chips (from facetSelections[])
│
├── <TierServiceGroupsSection>
│   ├── Tier name + base price header
│   └── <ServiceGroupCard> (for each non-optional group)
│       ├── Group name + "INCLUDED" badge
│       ├── <ServiceLine> (for each service in group)
│       │   ├── Service name
│       │   ├── Level indicator (✓, —, customValue)
│       │   ├── Setup fee sub-line (if applicable)
│       │   └── <MetricInfoTooltip> (if service has metrics)  ← Q1
│       └── Group subtotals (setup fee, recurring)
│
├── <AddOnsSection>
│   └── <OptionGroupCard> (for each selected optional group)
│       ├── Group name + "SELECTED" badge + price
│       ├── <ServiceLine> (for each service)
│       └── Group subtotal
│
└── <PricingBreakdown>
    ├── RECURRING section
    │   ├── Tier base line
    │   ├── Add-on recurring lines
    │   └── TOTAL RECURRING
    └── ONE-TIME SETUP section
        ├── Setup cost lines
        └── TOTAL SETUP
```

**Data Flow:**

```
Service Offering (template)
    ├── Tier definitions → tier name, base price
    ├── Service groups → group structure, billing cycles
    ├── Services → names, levels, customValues
    ├── Usage limits → metric pricing (tooltips)
    └── Option groups → add-on definitions + pricing

User Selections (wizard state)
    ├── Selected tier
    ├── Selected billing cycle
    ├── Selected add-ons (option groups)
    └── Facet selections

        ↓ merged at display time ↓

Achra Summary Component
    → Renders sections 1-5 from PDF mockup
    → On "Submit Request" → creates subscription-instance via API
```

---

## Part 7 — Schema Readiness Summary

| Summary Section | Schema Fields Used | All Available? |
|----------------|-------------------|---------------|
| Header (operator, resource, totals) | `operatorName`, `resource.label`, `resource.thumbnailUrl`, `tierPrice`, `tierCurrency` | ✅ Yes |
| Configuration (facets) | `facetSelections[].categoryLabel`, `.selectedOptions` | ✅ Yes |
| Tier + Groups (Section 3) | `tierName`, `tierPrice`, `serviceGroups[].name`, `.services[].name`, `.services[].serviceLevel`, `.services[].customValue`, `.services[].isSetupService`, `.services[].setupCost` | ✅ Yes |
| Add-ons (Section 4) | `selectedOptionGroups[].name`, `.price`, `.currency`, `.costType`, `.isAddOn` + group services | ✅ Yes |
| Pricing Breakdown (Section 5) | `tierPrice`, `selectedOptionGroups[].price` (recurring), `services[].setupCost` (one-time) | ✅ Yes |
| Metric tooltips | `ServiceMetric.freeLimit`, `.paidLimit`, `.unitCost.amount`, `.unitCost.currency` | ✅ Yes (if metrics populated) |
| Metric setup costs | **Not in schema** | ❌ Gap (Q2) |

**Bottom line**: The schema is ready for 95% of the mockup. The only true gap is the undefined "metric setup costs" concept (Q2). Everything else is either available or computable from existing fields.

---

**Document Version**: 1.0
**Created**: 2026-02-12
**Clarity Score**: 58/100
**Open Questions**: 8 (2 critical, 2 high, 4 medium)
