---
marp: true
theme: default
paginate: true
footer: 'Service Offering Editor — Demo Walkthrough'
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --color-background: #ffffff;
  --color-foreground: #1f2937;
  --color-heading: #1e3a5f;
  --color-accent: #3b82f6;
  --color-border: #d1d5db;
  --color-teal: #0d9488;
  --color-amber: #d97706;
  --color-emerald: #059669;
  --color-slate: #475569;
  --font-default: 'Inter', 'Segoe UI', sans-serif;
}

section {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-default);
  font-weight: 400;
  box-sizing: border-box;
  border-top: 8px solid var(--color-heading);
  position: relative;
  line-height: 1.7;
  font-size: 22px;
  padding: 56px;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  color: var(--color-heading);
  margin: 0;
  padding: 0;
}

h1 {
  font-size: 52px;
  line-height: 1.3;
  text-align: left;
  letter-spacing: -0.02em;
}

h2 {
  position: absolute;
  top: 40px;
  left: 56px;
  right: 56px;
  font-size: 36px;
  padding-top: 0;
  padding-bottom: 14px;
  border-bottom: 3px solid var(--color-accent);
}

h2 + * {
  margin-top: 112px;
}

h3 {
  color: var(--color-accent);
  font-size: 24px;
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 600;
}

ul, ol {
  padding-left: 32px;
}

li {
  margin-bottom: 8px;
  line-height: 1.6;
}

footer {
  font-size: 14px;
  color: #9ca3af;
  position: absolute;
  left: 56px;
  right: 56px;
  bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

footer::before {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
  margin-right: 16px;
}

section.lead {
  border-top: 8px solid var(--color-heading);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #e8f0fe 100%);
}

section.lead footer {
  display: none;
}

section.lead h1 {
  margin-bottom: 24px;
  color: var(--color-heading);
}

section.lead p {
  font-size: 22px;
  color: #6b7280;
  font-weight: 500;
}

section.act-break {
  border-top: 8px solid var(--color-accent);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  color: #ffffff;
}

section.act-break h1 {
  color: #ffffff;
  font-size: 48px;
  margin-bottom: 16px;
}

section.act-break p {
  color: #bfdbfe;
  font-size: 24px;
  font-weight: 400;
}

section.act-break footer {
  display: none;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 18px;
}

th, td {
  border: 1px solid var(--color-border);
  padding: 10px 14px;
  text-align: left;
}

th {
  background-color: var(--color-heading);
  color: #ffffff;
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: #f9fafb;
}

strong {
  color: var(--color-heading);
  font-weight: 700;
}

code {
  background-color: #f3f4f6;
  color: var(--color-heading);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.85em;
}

em {
  color: #6b7280;
  font-style: italic;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

blockquote {
  border-left: 4px solid var(--color-accent);
  padding-left: 20px;
  margin: 16px 0;
  color: #4b5563;
  font-size: 20px;
}
</style>

<!-- _class: lead -->
<!-- _paginate: false -->

# Service Offering Editor
## Demo Walkthrough

Operational Hosting scenario — 3 tiers, 3 service groups, 1 add-on
Side-by-side with BA-Service-Offering.md specification

---

## Agenda

- **Act 1** — Template Selection &nbsp;&nbsp; *Scope & targeting*
- **Act 2** — Tier Definition &nbsp;&nbsp; *Pricing modes, charm pricing, discounts*
- **Act 3** — Service Catalog &nbsp;&nbsp; *Groups, per-tier pricing, discount modes*
- **Act 4** — The Matrix &nbsp;&nbsp; *Billing cycles, discount resolution, grand total*
- **Act 5** — The Bundle &nbsp;&nbsp; *Mapping to a ~$4k quarterly package*

---

## The 4-Tab Editor

| Tab | Color | Purpose |
|-----|-------|---------|
| Template | Teal | Define scope and targeting |
| Tiers | Amber | Set pricing strategy per tier |
| Services | Emerald | Configure service groups and pricing |
| Matrix | Slate | Full pricing + feature comparison |

- Numbered circle indicators turn to **checkmarks** on completion
- Progress percentage updates at the top

> BA Reference: Section 3 — Editor Flow

---

<!-- _class: act-break -->

# Act 1
Template Selection

---

## Select a Template

- Template grid with search, status badges, and **Recommended** banner
- Each card shows: name, status, target audiences, service count
- "Recommended" badge is social proof nudging toward validated templates

### What happens on selection

- Detail view expands — hero section, description, service categories
- Services pre-categorized: **Setup & Formation** (one-time) vs **Recurring** (monthly)
- Categorization maps to `costType` field: `SETUP` vs `RECURRING`

---

## Facet Targeting

- Facets define **who** this offering targets
- Each checkbox is a `FacetTarget` in the document model
- **Goal-gradient progress bar** — closer to 100% = more motivation to finish

### Why it matters

- Facet selections flow into the Matrix for filtering
- Drives the targeting metadata for the offering

> BA Reference: Section 2.1 — `facetTargets: FacetTarget[]`

---

<!-- _class: act-break -->

# Act 2
Tier Definition

---

## Tier Presets

- Empty state shows 4 **quick-start presets** — reduces activation energy
- This is the **Default Effect**: pre-populating sensible starting points

### Standard 3-Tier Preset

| Tier | Price | Badge |
|------|-------|-------|
| Basic | $99/mo | — |
| Professional | $299/mo | Most Popular |
| Enterprise | Custom | Contact Sales |

- "Most Popular" badge on middle tier: `floor(length / 2)`

> BA Reference: Section 4.1, 4.6

---

## Pricing Modes

### Two modes per tier

| Mode | Behavior |
|------|----------|
| **Manual Override** | Operator sets a fixed price |
| **Calculated** | Price = SUM of all service group prices |

- Default is **Manual** — toggle dispatches `SET_TIER_PRICING_MODE`
- Custom tiers (`isCustomPricing: true`) always show "Custom" regardless of mode

> BA Reference: Section 4.2

---

## Charm Pricing

- **Psychological pricing** suggestions with `.99` endings below the price input
- System generates 3 options: lower, nearest, and higher charm price

### Example

Operator enters **$300** — suggestions appear:

| | |
|---|---|
| $249.99 | Lower bracket |
| $299.99 | Nearest charm |
| $349.99 | Higher bracket |

- **Left-digit bias**: $299.99 feels significantly cheaper than $300

> BA Reference: Section 4.7

---

## Billing Cycle Discounts

- Each tier has a `billingCycleDiscounts` array
- Two types: **Percentage** and **Flat Amount**

### Example: Basic tier at $300/mo

| Cycle | Discount | Calculation | Result |
|-------|----------|-------------|--------|
| Monthly | — | $300 | $300/mo |
| Quarterly | 5% | $900 x 0.95 | $855/qtr |
| Annual | 10% | $3,600 x 0.90 | $3,240/yr |

- These discounts **cascade down** to service groups in the Matrix

> BA Reference: Section 4.5, 6.5

---

## Mental Accounting

### "Per Day" Breakdown

- Below the price: **$300/mo = ~$10/day**
- Mental accounting psychology — makes the price feel smaller
- Same approach as "less than a coffee a day"

### Enterprise Custom Tier

- `isCustomPricing: true` — always shows "Custom"
- No price inputs, no discounts — just "Contact Sales"
- Business Rule #2 in the BA spec

---

<!-- _class: act-break -->

# Act 3
Service Catalog

---

## Service Groups (Option Groups)

Three categories based on `costType` and `isAddOn`:

| Category | Criteria | Billing |
|----------|----------|---------|
| **Setup** | `costType: SETUP` | One-time |
| **Regular** | `costType: RECURRING`, `!isAddOn` | Monthly |
| **Add-on** | `isAddOn: true` | Optional |

### Our scenario

1. Legal & Formation — Setup ($3,000 one-time)
2. Operations — Recurring
3. Support — Recurring
4. Premium Analytics — Add-on

> BA Reference: Section 2.3

---

## Per-Tier Pricing

### Two pricing modes per group

| Mode | Behavior |
|------|----------|
| **Standalone** | One price for all tiers |
| **Tier Dependent** | Different price per tier |

### Our scenario — Tier Dependent

| Group | Basic | Professional | Enterprise |
|-------|-------|-------------|------------|
| Operations | $100/mo | $200/mo | Custom |
| Support | $10/mo | $50/mo | Custom |
| Legal & Formation | $3,000 | $3,000 | Custom |

- Dispatches `ADD_OPTION_GROUP_TIER_PRICING` per tier

> BA Reference: Section 6.2 — `getGroupPriceForTier()`

---

## Discount Mode Toggle

Each group has a `discountMode`:

| Mode | Behavior |
|------|----------|
| **INHERIT_TIER** | Uses the tier's billing cycle discounts (default) |
| **INDEPENDENT** | Group manages its own per-cycle discounts |

### Key rule

- In **global billing mode**: `forceInherit = true` always
- Groups **cannot** override tier discounts in global mode
- INDEPENDENT only takes effect in **custom billing mode**

> BA Reference: Section 6.5 — `resolveGroupDiscountForTier()`

---

## Budget Indicator

- Shown for **Manual Override** tiers only
- Horizontal bar: allocated vs. remaining budget

| Range | Color | Meaning |
|-------|-------|---------|
| < 80% | Green | Healthy margin |
| 80–100% | Amber | Getting tight |
| > 100% | Red | Over budget |

- Not shown for CALCULATED tiers — no fixed budget to compare against

> BA Reference: Section 11

---

<!-- _class: act-break -->

# Act 4
The Matrix

---

## Matrix Layout (Top to Bottom)

1. **Billing Cycle Bar** — Month / Quarter / 6 Months / Year
2. **Tier Cards** — Radio select with price, SAVE badge
3. **Setup & Formation** — One-time services, INCLUDED cells
4. **Recurring Services** — Per-group billing tabs + per-tier prices
5. **SUBTOTAL Row** — Sum of regular group prices per tier
6. **Add-on Section** — Optional groups with enable/disable toggle
7. **Sticky Grand Total** — Always visible footer

> BA Reference: Section 5.1 — Layout Structure

---

## Global Billing Cycle

Selecting a cycle triggers **5 operations**:

1. Sets `activeBillingCycle`
2. Clears all per-group overrides
3. Recalculates tier prices
4. Applies tier billing cycle discounts
5. Updates grand total

### Example: Switch to Annual

| | Monthly | Annual |
|---|---------|--------|
| Base | $300/mo | $3,600/yr |
| Discount | — | 10% off |
| **Result** | $300/mo | **$3,240/yr** |
| Monthly equiv. | $300 | $270/mo |

> BA Reference: Section 5.2

---

## Per-Group Billing Override

Override Operations to **Monthly** while global is **Annual**:

### Three things happen

1. `groupBillingCycles['operations-id'] = 'MONTHLY'`
2. `isCustomBillingMode = true` (at least one group differs)
3. Grand total switches from single row to **per-group itemization**

### Result

| Group | Cycle | Price | Discount |
|-------|-------|-------|----------|
| Operations | Monthly | $100/mo | None |
| Support | Annual | $108/yr | 10% off $120 |

- Operations has **no discount** — we didn't set a monthly discount on the tier

> BA Reference: Section 5.3, 5.4

---

## Discount Resolution Cascade

`resolveGroupDiscountForTier()` for each group:

### Support (Annual, global mode)

1. `forceInherit = true` (global billing)
2. Ignores group's `discountMode`
3. Reads `tier.billingCycleDiscounts` for ANNUAL
4. Finds 10% — returns `{ source: 'tier' }`

### Operations (Monthly, overridden)

1. `forceInherit = false` (custom billing)
2. `discountMode = null` (default = INHERIT_TIER)
3. Looks at `tier.billingCycleDiscounts` for MONTHLY
4. Nothing configured — returns `null`

> BA Reference: Section 6.5

---

## Majority Auto-Revert

Override **both** regular groups to Monthly (while global is Annual):

### What happens

- 2 of 2 regular groups on Monthly = **100% majority** (> 50%)
- System **auto-switches** global to Monthly
- All per-group overrides are cleared
- Back to uniform billing

### Algorithm: `detectMajorityCycle()`

- Counts effective cycles across regular groups
- Triggers when > 50% share a cycle **different from** current global
- Auto-switches immediately — no confirmation needed

> BA Reference: Section 5.5

---

## Proportional Flat Discount

Change Basic tier's annual discount from 10% to **$60 flat**:

### The problem

$60 flat can't apply to each group — that would be $120 total!

### The solution — proportional distribution

| Group | Monthly | Proportion | Discount Share |
|-------|---------|------------|----------------|
| Operations | $100 | 100/110 = 90.9% | $54.55 |
| Support | $10 | 10/110 = 9.1% | $5.45 |
| **Total** | **$110** | **100%** | **$60.00** |

- Group discounts sum to **exactly** the tier's flat discount
- Each group's SAVE badge shows its proportional share

> BA Reference: Section 6.6

---

## Service Level Cells

Each cell is a `ServiceLevelBinding` — 6 possible values:

| Level | Icon | Meaning |
|-------|------|---------|
| INCLUDED | Green checkmark | Feature is in this tier |
| NOT_INCLUDED | Dash | Not available (gray striped) |
| OPTIONAL | Circle | Available as an add-on |
| CUSTOM | Text | Free-text (e.g., "Up to 5 users") |
| VARIABLE | Hash | Usage-based with limits |
| NOT_APPLICABLE | Slash | Doesn't apply to this tier |

- **VARIABLE** opens a usage limit editor: metric name, free/paid limits, unit price, reset cycle

> BA Reference: Section 9.1

---

## Grand Total

Sticky footer — always visible. Three components:

### 1. Recurring Tier Price

- **Global mode**: single row from `getTierPriceForCycle()`
- **Custom mode**: per-group itemized rows

### 2. Add-on Prices

- Each enabled add-on on its own line with its billing cycle

### 3. Setup Fees

- One-time total across all setup groups

### Our scenario

| Component | Amount |
|-----------|--------|
| Recurring | $3,240/yr (annual, 10% off) |
| Add-ons | $300/yr (Premium Analytics) |
| Setup | $3,000 one-time |
| **Year 1 Total** | **$6,540** |

---

<!-- _class: act-break -->

# Act 5
The Bundle Scenario

---

## Package Bundle: ~$4k for Setup + 3 Months

> "We're going to do a package bundle for OH setup + 3 months for like $4k" — Kilgore

### How it maps

- A package bundle = a **Manual Override** tier with quarterly billing
- Rename Basic to "Starter Bundle", price = **$4,000**, cycle = **Quarterly**

### The breakdown

| Component | Cost |
|-----------|------|
| Operations | $300/qtr ($100 x 3) |
| Support | $30/qtr ($10 x 3) |
| Setup | $3,000 one-time |
| **Service total** | **$3,330** |
| **Bundle price** | **$4,000** |
| **Margin** | **$670** |

Budget indicator shows green: "$670 remaining"

---

## Why the Full System Matters

Even for a simple bundle, the system delivers:

- **Transparency** — Matrix shows customers exactly what's included per tier
- **Comparison** — Service levels (INCLUDED / NOT_INCLUDED) make tiers self-selling
- **Flexibility** — Add Professional at $8k/qtr; the matrix comparison sells itself
- **Adaptability** — Switch to monthly at $1,500/mo later without restructuring

> The schema supports all of this without changes

---

<!-- _class: act-break -->

# Key Takeaways

---

## Eight Core Principles

1. **Templates define scope** — facets, services, targeting flow to all tabs
2. **Tiers define pricing strategy** — manual or calculated, with cascading discounts
3. **Service groups are pricing atoms** — per-tier pricing, billing cycles, discount modes
4. **The Matrix is the truth table** — pricing x service levels x billing cycles
5. **Discounts cascade** — group mode (inherit vs independent), proportional flat distribution
6. **Custom billing mode** activates when any group overrides global cycle
7. **Majority detection auto-corrects** when > 50% of groups converge on a different cycle
8. **Pure reducers** ensure every calculation is deterministic and reproducible

> BA Reference: Section 15 — Key Business Rules Summary

---

<!-- _class: lead -->

# Thank You

Service Offering Editor — Powered by Powerhouse Document Models

*Companion doc: BA-Service-Offering.md*
