# Service Offering Editor — Demo Walkthrough Script

**Purpose:** Step-by-step presentation script for demoing the Service Offering Editor side-by-side with the BA-Service-Offering.md specification. Each step maps editor UI actions to business logic from the BA doc.

**Setup:** Editor open on the left, BA-Service-Offering.md (Notion or rendered markdown) on the right.

**Scenario:** We're creating an Operational Hosting service offering for a DAO services provider with 3 tiers, 3 service groups, 1 add-on, and a setup package — ending at a ~$4,000 quarterly bundle.

---

## Act 1: Template Selection

> **BA Reference:** Section 3 — Editor Flow, Tab 1

### Step 1.1 — Landing on the Editor

**Show in editor:** Fresh editor with DocumentToolbar and 4-tab navigation.

**Talk track:**
"The editor is a 4-step wizard. Each tab has a color accent — teal for Template, amber for Tiers, emerald for Services, slate for Matrix. The tab indicators show numbered circles; they turn to checkmarks as you complete each step. Progress percentage updates at the top."

### Step 1.2 — Select a Resource Template

**Show in editor:** Template grid with search box, Active Templates section, Recommended badge.

**Talk track:**
"Templates define the scope of what we're selling. Each card shows the template name, status, target audiences, and service count. Notice the 'Recommended' banner — that's social proof nudging the operator toward a validated template."

**Action:** Click a template (e.g., "Operational Hosting").

**Show in editor:** Detail view expands — hero section, description, Formation & Setup services (green), Recurring Services (amber).

**Talk track:**
"Once selected, we see the full template layout. Services are pre-categorized into Setup & Formation (one-time) and Recurring (monthly). This categorization directly maps to the `costType` field in the schema — `SETUP` vs `RECURRING`."

### Step 1.3 — Facet Targeting

**Show in editor:** Facet checkboxes with goal-gradient progress bar.

**Talk track:**
"Facets define who this offering targets. Each checkbox is a `FacetTarget` in the document model. The progress bar uses goal-gradient psychology — the closer you get to 100%, the more motivated you feel to complete it. These facet selections flow into the Matrix later for filtering."

> **BA Reference:** Section 2.1 — `facetTargets: FacetTarget[]`

**Action:** Select several facet options. Progress bar fills.

---

## Act 2: Tier Definition

> **BA Reference:** Section 4 — Tier Definition

### Step 2.1 — Tier Presets

**Action:** Navigate to Tab 2 (Tiers).

**Show in editor:** Empty state with 4 preset cards.

**Talk track:**
"When no tiers exist, we show quick-start presets. This is the Default Effect — reducing activation energy by pre-populating a sensible starting point."

> **BA Reference:** Section 4.1 — Tier Presets table

**Action:** Click "Standard 3-Tier" preset.

**Show in editor:** Three tier cards appear — Basic ($99), Professional ($299), Enterprise (custom).

**Talk track:**
"Instant creation of three tiers. Each card has:
- A color-coded accent bar
- The 'Most Popular' badge on the middle tier — that's section 4.6, the Recommended Tier Badge. For 3+ tiers it goes on `floor(length/2)`, so the second tier."

> **BA Reference:** Section 4.6 — `3+ tiers → badge on middle tier (floor(length/2))`

### Step 2.2 — Pricing Modes

**Show in editor:** Focus on Basic tier card. Point to the Manual/Calculated toggle.

**Talk track:**
"Each tier has a `pricingMode`. Manual Override means the operator sets a fixed price. Calculated means the price equals the sum of all service group prices for this tier. Default is Manual — the toggle dispatches `SET_TIER_PRICING_MODE`."

> **BA Reference:** Section 4.2 — `MANUAL_OVERRIDE` vs `CALCULATED`

**Action:** Edit Basic tier price to $300.

### Step 2.3 — Charm Pricing

**Show in editor:** Charm pricing suggestions below the price input — three `.99` buttons.

**Talk track:**
"These are charm pricing suggestions — psychological pricing with `.99` endings. The system generates three options: a lower, nearest, and higher charm price. Left-digit bias means $299.99 feels significantly cheaper than $300 even though it's one cent difference."

> **BA Reference:** Section 4.7 — Charm Pricing Suggestions

**Action:** Click the $299.99 charm suggestion. Price updates.

### Step 2.4 — Billing Cycle Discounts

**Show in editor:** Expand billing cycle discount panel on Basic tier.

**Talk track:**
"Each tier can have per-cycle discounts. This is the `billingCycleDiscounts` array on `ServiceSubscriptionTier`. We support two types — percentage and flat amount. These discounts cascade down to service groups in the Matrix."

> **BA Reference:** Section 4.5 — Billing Cycle Discounts + Section 6.5 — Discount Resolution Cascade

**Action:** Enable Annual discount, set 10% off. Enable Quarterly, set 5% off.

**Talk track:**
"So now Basic tier: monthly = $300, quarterly = $855 (5% off $900), annual = $3,240 (10% off $3,600). These numbers will appear on the Matrix tier cards."

### Step 2.5 — Enterprise Custom Tier

**Show in editor:** Point to Enterprise card showing "Custom" badge.

**Talk track:**
"Enterprise has `isCustomPricing: true`. It always shows 'Custom' in the matrix regardless of pricing mode — no price, no discounts, just 'Contact Sales'. This is rule #2 in the BA business rules summary."

> **BA Reference:** Section 15 — Rule #2: `Custom tier always shows "Custom" regardless of mode`

### Step 2.6 — The "Per Day" Breakdown

**Show in editor:** Point to "price per day" line under the tier price.

**Talk track:**
"Notice the 'per day' calculation below the price. This is mental accounting — breaking $300/month into ~$10/day makes the price feel smaller. Same psychology Starbucks uses: 'less than a coffee a day.'"

---

## Act 3: Service Catalog

> **BA Reference:** Section 12.2 — Option Group Management operations

### Step 3.1 — Creating Service Groups

**Action:** Navigate to Tab 3 (Services).

**Show in editor:** Service catalog with template-suggested services.

**Talk track:**
"Services are organized into Option Groups — we call them 'service groups' in the UI. There are three categories: Setup (one-time), Recurring (monthly billing), and Add-on (optional extras). These map to `costType` and `isAddOn` in the schema."

> **BA Reference:** Section 2.3 — Group Categories: `setupGroups`, `regularGroups`, `addonGroups`

**Action:** Create three groups:
1. "Legal & Formation" — costType: SETUP
2. "Operations" — costType: RECURRING, isAddOn: false
3. "Support" — costType: RECURRING, isAddOn: false
4. "Premium Analytics" — isAddOn: true

### Step 3.2 — Adding Services to Groups

**Action:** Add services from templates into each group.

**Talk track:**
"Each service has a `serviceGroupId` linking it to its parent. Services can also have `facetBindings` — dynamic attributes from the resource template. The `isSetupFormation` flag determines whether a service appears in the Setup section of the matrix."

**Show:** Services populated in each group:
- Legal & Formation: Entity registration, Compliance filing
- Operations: Invoice management, Monthly accounting, Tax filing
- Support: Dedicated ops support, Multi-currency support

### Step 3.3 — Per-Tier Pricing

**Action:** Open Operations group pricing panel. Select "Tier Dependent" pricing mode.

**Show in editor:** Tier tabs appear — Basic, Professional, Enterprise.

**Talk track:**
"This is the `pricingMode` on the Option Group — `STANDALONE` means one price for all tiers, `TIER_DEPENDENT` means each tier gets its own price. Dispatches `ADD_OPTION_GROUP_TIER_PRICING` per tier."

> **BA Reference:** Section 6.2 — `getGroupPriceForTier()` checks `tierDependentPricing` first, falls back to `standalonePricing`

**Action:** Set pricing:
- Operations: Basic = $100/mo, Professional = $200/mo
- Support: Basic = $10/mo, Professional = $50/mo
- Legal & Formation: $3,000 one-time (all tiers)

### Step 3.4 — Discount Mode Toggle

**Action:** On Operations group, show the discount mode selector.

**Talk track:**
"Each group has a `discountMode`: INHERIT_TIER or INDEPENDENT. Default is INHERIT_TIER — the group uses whatever discount the tier has configured. If set to INDEPENDENT, the group manages its own per-cycle discounts, separate from the tier."

> **BA Reference:** Section 6.5 — `resolveGroupDiscountForTier()` with `forceInherit` parameter

**Talk track:**
"In global billing mode, `forceInherit` is always true — groups can't override tier discounts. Only in custom billing mode does the INDEPENDENT option take effect. This prevents confusing behavior where groups show different discounts than the tier."

### Step 3.5 — Budget Indicator

**Show in editor:** Budget indicator bar in the pricing panel.

**Talk track:**
"For Manual Override tiers, the budget indicator shows how much of the tier's fixed price is allocated across service groups. Green under 80%, amber at 80-100%, red when over budget. Not shown for CALCULATED tiers — there's no fixed budget to compare against."

> **BA Reference:** Section 11 — Budget Indicator

---

## Act 4: The Matrix

> **BA Reference:** Section 5 — The Matrix (Tab 4)

### Step 4.1 — Matrix Overview

**Action:** Navigate to Tab 4 (Matrix).

**Show in editor:** Full matrix layout.

**Talk track:**
"This is the Matrix — the complete pricing and feature comparison view. Let me walk through the layout from top to bottom."

> **BA Reference:** Section 5.1 — Layout Structure diagram

Point to each section:

1. **"SET SUBSCRIPTION PLAN & BILLING CYCLE" bar** — "Four recurring cycle buttons: Month, Quarter, 6 Months, Year. Always shows all four — not just cycles with discounts. This is the global billing cycle."

2. **Tier cards** — "Radio buttons to select the active tier. Shows the price for the current billing cycle, with billed-as amount and SAVE badge if discounted."

3. **Setup & Formation section** — "Setup services with one-time pricing. Shows 'INCLUDED' cells per tier."

4. **Recurring Services section** — "Service groups with per-group billing cycle tabs and per-tier pricing."

5. **SUBTOTAL row** — "Sum of regular group prices per tier."

6. **Add-on section** — "Optional groups with enable/disable toggle."

7. **Sticky Grand Total** — "Bottom bar that stays visible during scroll. Shows recurring + addons + setup."

### Step 4.2 — Global Billing Cycle

**Action:** Click "Year" on the global billing cycle bar.

**Show in editor:** All tier prices update to annual amounts. Discount badges appear.

**Talk track:**
"Selecting a global cycle does five things: sets `activeBillingCycle`, clears all per-group overrides, recalculates tier prices, and applies tier discounts. Watch the Basic tier: $300/mo becomes $3,240/yr — that's $3,600 minus the 10% annual discount we configured. SAVE 10% badge appears."

> **BA Reference:** Section 5.2 — Global Billing Cycle Selection (5 steps) + Section 6.4 — `getTierPriceForCycle()`

**Talk track (calculation):**
"Let me break down the math: `baseMonthly = $300`, `totalForCycle = $300 x 12 = $3,600`, discount = 10% percentage, so `adjusted = $3,600 x (1 - 0.10) = $3,240`. Monthly equivalent = `$3,240 / 12 = $270/mo`. That's exactly what shows on the tier card."

### Step 4.3 — Per-Group Billing Cycle Override

**Action:** On the "Operations" service group, click the "Month" tab (while global is "Year").

**Show in editor:** Operations switches to monthly. Global bar shows "Custom" badge. Grand total changes to per-group rows.

**Talk track:**
"I just overrode Operations to monthly billing while the global cycle is annual. Three things happen:
1. `groupBillingCycles['operations-id'] = 'MONTHLY'`
2. `isCustomBillingMode` becomes true because at least one group differs from global
3. The grand total switches from a single row to per-group itemized rows"

> **BA Reference:** Section 5.3 — Per-Group Billing Cycle Override + Section 5.4 — Custom Billing Mode

**Show in editor:** Point to the grand total section showing:
- Operations /month: $100 (no discount — Monthly has no tier discount)
- Support /year: $108 (10% off $120)

**Talk track:**
"Notice Operations shows NO discount at $100/mo — we didn't configure a monthly discount on the tier. But Support still shows the annual discount because it's still on the global 'Year' cycle. Each group uses its effective cycle independently."

### Step 4.4 — Discount Resolution in Action

**Talk track:**
"Let me explain how discounts resolve. The system calls `resolveGroupDiscountForTier()` for each group."

> **BA Reference:** Section 6.5 — Discount Resolution Cascade

**Point to Support group (still on Annual):**
"Support is in global billing mode, so `forceInherit = true`. The function ignores the group's `discountMode` and reads directly from `tier.billingCycleDiscounts`. Finds ANNUAL = 10% off. Returns `{ discountRule: {type: PERCENTAGE, value: 10}, source: 'tier' }`."

**Point to Operations group (overridden to Monthly):**
"Operations has been overridden, so we're in custom billing mode for this group. `forceInherit = false`. Since `discountMode` is null (default), it behaves like INHERIT_TIER and looks at `tier.billingCycleDiscounts` for MONTHLY. We didn't set one, so it returns `null`. No discount."

### Step 4.5 — Majority Auto-Revert

**Action:** Override Support to "Month" as well (now 2 of 2 regular groups are Monthly).

**Show in editor:** System auto-switches global to Monthly, clears all overrides.

**Talk track:**
"Watch what happens — both regular groups are now Monthly, that's 100% majority (more than 50%). The system auto-reverts: global switches to Monthly, all overrides clear, we're back to uniform billing. This is `detectMajorityCycle()` in action."

> **BA Reference:** Section 5.5 — Majority-Based Auto-Revert

**Talk track (algorithm):**
"`detectMajorityCycle` counts effective cycles across all regular groups. It found 2/2 on Monthly, which is > 50% and different from the current global (Annual). Instead of showing a banner, the handler auto-switches immediately because the majority is unambiguous."

### Step 4.6 — Proportional Flat Discount Distribution

**Action:** Switch back to global Annual. Then change Basic tier's annual discount from 10% to $60 flat.

**Show in editor:** Each service group shows a different SAVE amount.

**Talk track:**
"This is the most subtle calculation in the system. When a tier has a FLAT_AMOUNT discount and it's inherited by groups, we can't just apply $60 to each group — that would be $120 total off instead of $60. We distribute proportionally."

> **BA Reference:** Section 6.6 — Proportional Flat-Amount Discount Distribution

**Talk track (calculation):**
"Let's do the math live:
- Operations monthly = $100, Support monthly = $10. Total = $110.
- Operations proportion = $100 / $110 = 90.9%
- Support proportion = $10 / $110 = 9.1%
- Operations gets 90.9% x $60 = $54.55 off its annual price
- Support gets 9.1% x $60 = $5.45 off its annual price
- Sum of discounts = $54.55 + $5.45 = exactly $60

The group prices now sum to the tier's discounted annual price. That's what the SAVE badges show on each group's pricing bar."

**Show in editor:** Point to the group prices confirming they sum correctly.

### Step 4.7 — Service Level Cells

**Action:** Click a cell in the matrix where a service intersects with a tier.

**Show in editor:** Level selector popup with 6 options.

**Talk track:**
"Each cell is a `ServiceLevelBinding` on the tier. Six levels with distinct visual treatments."

> **BA Reference:** Section 9.1 — Service Level Values table

**Talk through each level:**
- "INCLUDED (green checkmark) — feature is in this tier"
- "NOT_INCLUDED (dash) — not available, shows as gray striped"
- "OPTIONAL (circle) — available as an add-on"
- "CUSTOM (text) — free-text value like 'Up to 5 users'"
- "VARIABLE (hash) — usage-based with configurable limits"
- "NOT_APPLICABLE (slash) — doesn't apply to this tier"

**Action:** Set a few cells to different levels. Set one to VARIABLE.

**Show in editor:** Usage limit editor appears for VARIABLE.

**Talk track:**
"VARIABLE levels open a usage limit editor. You define the metric name, free and paid limits, unit price, and reset cycle. This creates a `ServiceUsageLimit` on the tier."

> **BA Reference:** Section 9.3 — Usage Limits

### Step 4.8 — Setup & Formation Section

**Show in editor:** Setup section at top of matrix.

**Talk track:**
"Setup groups appear at the top with ONE_TIME billing badge. The 'TOTAL SETUP FEE' row sums all setup costs. In our example: $3,000 one-time for Legal & Formation. This appears in the grand total as a separate line — it's not part of the recurring calculation."

### Step 4.9 — Add-on Toggle

**Action:** Toggle Premium Analytics add-on ON.

**Show in editor:** Add-on section expands with pricing.

**Talk track:**
"Add-ons have their own enable/disable toggle tracked in UI state (`enabledOptionalGroups`). When enabled, the add-on's price appears in the grand total. Add-ons have their own independent billing cycle selector — they don't follow the global cycle."

> **BA Reference:** Section 10.1 — Toggle Behavior + Section 10.3 — Addon Billing Cycles

### Step 4.10 — SUBTOTAL Row

**Show in editor:** Point to SUBTOTAL row between recurring groups and add-ons.

**Talk track:**
"The SUBTOTAL row shows the aggregate per tier. For CALCULATED tiers, it shows the computed sum with a 'calc' badge. For MANUAL_OVERRIDE tiers, it shows the manual price but adds a comparison if the group sum differs — 'Groups: $110 (+$10 over)' or similar."

> **BA Reference:** Section 8 — SUBTOTAL Row

### Step 4.11 — Grand Total

**Show in editor:** Sticky grand total footer.

**Talk track:**
"The grand total is always visible — it's a sticky footer. Three components:"

> **BA Reference:** Section 7.3 — Grand Total Components

**Point to each line:**
1. "**Recurring Tier Price** — in global mode, single row from `getTierPriceForCycle()`. In custom mode, per-group itemized rows."
2. "**+ Add-on Prices** — each enabled add-on on its own line with its cycle."
3. "**+ Setup Fees** — one-time total across all setup groups."

**Talk track:**
"For our example: Recurring = $3,240/yr (annual with $60 flat discount), Add-ons = $300/yr (Premium Analytics), Setup = $3,000 one-time. Grand total = $6,540 first year, $3,540/yr thereafter."

---

## Act 5: The Bundle Scenario

> **Talk track:** "Now let me show how all of this maps to Kilgore's 'package bundle' concept — setup + 3 months for ~$4k."

### Step 5.1 — Bundle as Tier

**Action:** Edit Basic tier: set name to "Starter Bundle", price to $4,000, billing cycle to Quarterly.

**Talk track:**
"A package bundle is just a Manual Override tier with quarterly billing. $4,000 covers everything — setup + 3 months of recurring services. The operator sets this as a flat bundle price."

### Step 5.2 — Bundle Breakdown

**Action:** Switch to global Quarterly billing.

**Show in editor:** Tier card shows $4,000/qtr. Service groups show their quarterly prices summing below.

**Talk track:**
"The matrix still shows the breakdown — Operations at $300/qtr, Support at $30/qtr, Setup at $3,000. That's $3,330 in service costs vs $4,000 bundle price — the $670 difference is the operator's margin. The budget indicator shows green: '$670 remaining'."

### Step 5.3 — Why the Full System Matters

**Talk track:**
"Even for a simple bundle, the full system adds value:
- The matrix shows customers exactly what's included per tier
- Service levels (INCLUDED/NOT_INCLUDED) make the comparison clear
- If we add Professional at $8,000/qtr, the matrix comparison sells itself
- Billing cycle flexibility means we can offer monthly at $1,500/mo later
- The schema supports it all without restructuring"

---

## Closing: Key Takeaways

**Talk track:**

"To recap what we've walked through:"

1. **Templates define scope** — facets, services, and targeting flow from template to all other tabs
2. **Tiers define pricing strategy** — manual or calculated, with per-cycle discounts that cascade to groups
3. **Service groups are the pricing atoms** — each has per-tier pricing, billing cycles, and discount modes
4. **The Matrix is the truth table** — everything converges here: pricing x service levels x billing cycles
5. **Discounts resolve through a cascade** — group mode (inherit vs independent), tier discounts, proportional distribution for flat amounts
6. **Custom billing mode activates** when any group overrides the global cycle — grand total switches to per-group itemization
7. **Majority detection auto-corrects** when >50% of groups converge on a different cycle
8. **Pure reducers** ensure every calculation is deterministic and reproducible

> **BA Reference:** Section 15 — Key Business Rules Summary (all 12 rules)

---

**Document Version:** 1.0
**Created:** 2026-02-16
**Companion:** docs/BA-Service-Offering.md
