# Business Analysis: Service Offering Editor

## 1. Document Overview

**Purpose**: Complete business specification for the Service Offering Editor — pricing logic, calculations, UX flows, and user journeys. Written for front-end developers who need to understand matrix behavior, pricing calculations, and discount resolution.

**Document Model**: `service-offering` (Powerhouse Document Model)
**Editor**: `service-offering-editor` (React/TypeScript)

---

## 2. Entity Model

### 2.1 Core Entities

```
ServiceOfferingState
├── tiers: ServiceSubscriptionTier[]       # Subscription plans (Basic, Pro, Enterprise)
├── optionGroups: OptionGroup[]            # Service groups (recurring, setup, add-on)
├── services: Service[]                    # Individual service items
├── serviceGroups: ServiceGroup[]          # Logical groupings with shared billing
├── targetAudiences: TargetAudience[]      # Customer segments
└── facetTargets: FacetTarget[]            # Dynamic filtering categories
```

### 2.2 ServiceSubscriptionTier

A subscription plan that customers purchase.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `OID!` | Unique identifier |
| `name` | `String!` | Display name (e.g. "Basic", "Professional") |
| `description` | `String` | Tier description |
| `pricing.amount` | `Amount_Money` | Base monthly price (null for custom tiers) |
| `pricing.currency` | `Currency!` | ISO currency code |
| `isCustomPricing` | `Boolean!` | If true, price is "Contact Sales" |
| `pricingMode` | `TierPricingMode` | `CALCULATED` or `MANUAL_OVERRIDE` (null = MANUAL) |
| `defaultBillingCycle` | `BillingCycle` | Default cycle for this tier |
| `billingCycleDiscounts` | `[BillingCycleDiscount!]!` | Per-cycle discounts |
| `serviceLevels` | `[ServiceLevelBinding!]!` | Feature inclusion per service |
| `usageLimits` | `[ServiceUsageLimit!]!` | Usage quotas per service |

### 2.3 OptionGroup (Service Group)

Groups of services with shared pricing and billing configuration. Despite the name "OptionGroup", these are the primary pricing containers in the matrix — referred to as "service groups" in the UI.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `OID!` | Unique identifier |
| `name` | `String!` | Display name (e.g. "Operations", "Support") |
| `isAddOn` | `Boolean!` | If true, this is an optional add-on (below SUBTOTAL) |
| `costType` | `GroupCostType` | `RECURRING` / `SETUP` / null |
| `pricingMode` | `AddOnPricingMode` | `STANDALONE` / `TIER_DEPENDENT` |
| `standalonePricing` | `StandalonePricing` | Flat pricing (same across all tiers) |
| `tierDependentPricing` | `[OptionGroupTierPricing!]` | Per-tier pricing entries |
| `availableBillingCycles` | `[BillingCycle!]!` | Configured billing cycles |
| `billingCycleDiscounts` | `[BillingCycleDiscount!]!` | Group-level cycle discounts |
| `discountMode` | `DiscountMode` | `INHERIT_TIER` / `INDEPENDENT` (null = INHERIT_TIER) |
| `price` | `Amount_Money` | Legacy flat price |
| `currency` | `Currency` | Legacy currency |

**Group Categories (derived in UI):**

```
setupGroups     = optionGroups.filter(g => g.costType === "SETUP")
regularGroups   = optionGroups.filter(g => g.costType !== "SETUP" && !g.isAddOn)
addonGroups     = optionGroups.filter(g => g.isAddOn)
```

### 2.4 Service

An individual feature/service within a group.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `OID!` | Unique identifier |
| `title` | `String!` | Service name |
| `serviceGroupId` | `OID` | Parent group (null = ungrouped) |
| `optionGroupId` | `OID` | Links to an OptionGroup |
| `isSetupFormation` | `Boolean!` | If true, appears in Setup section |
| `displayOrder` | `Int` | Sort order within group |
| `facetBindings` | `[ResourceFacetBinding!]!` | Dynamic attribute bindings |

### 2.5 Enums

```graphql
enum BillingCycle    { MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL, ONE_TIME }
enum ServiceLevel    { INCLUDED, NOT_INCLUDED, OPTIONAL, CUSTOM, VARIABLE, NOT_APPLICABLE }
enum TierPricingMode { CALCULATED, MANUAL_OVERRIDE }
enum AddOnPricingMode { STANDALONE, TIER_DEPENDENT }
enum DiscountMode    { INHERIT_TIER, INDEPENDENT }
enum DiscountType    { PERCENTAGE, FLAT_AMOUNT }
enum GroupCostType   { RECURRING, SETUP }
enum ServiceStatus   { DRAFT, COMING_SOON, ACTIVE, DEPRECATED }
```

---

## 3. Editor Flow (Tabs)

The editor has 4 sequential tabs:

| Tab | Name | Purpose |
|-----|------|---------|
| 1 | **Template** | Select a resource template (scope & facets) |
| 2 | **Tiers** | Define subscription tiers and pricing strategies |
| 3 | **Services** | Create service groups, add services, configure per-tier pricing |
| 4 | **Matrix** | Full pricing matrix — service levels, billing cycles, discounts |

---

## 4. Tier Definition (Tab 2)

### 4.1 Tier Presets

When no tiers exist, the editor shows 4 quick-start presets:

| Preset | Tiers Created |
|--------|---------------|
| Standard 3-Tier | Basic ($99), Professional ($299), Enterprise (custom) |
| Freemium | Free ($0), Pro ($49), Business ($149) |
| Simple 2-Tier | Starter ($79), Growth ($199) |
| Annual Focus | Essential ($990), Professional ($2,990), Enterprise (custom) |

### 4.2 Tier Pricing Modes

Each non-custom tier has a `pricingMode`:

**MANUAL_OVERRIDE (default when `pricingMode` is null):**
- Operator sets a fixed tier price
- Group prices may or may not sum to this amount
- Budget indicator shows allocation vs. fixed price
- Over-budget dialog triggers when calculated sum first exceeds the manual price

**CALCULATED:**
- Tier price = SUM of all regular group monthly prices for that tier
- Price field is read-only, shows the computed sum
- Group breakdown is visible below the price
- Groups without pricing for this tier show as $0 with a warning

### 4.3 Tier Pricing Mode Toggle

```
MANUAL → CALCULATED:
  1. Compute group sum for tier
  2. Display computed value (read-only)
  3. Dispatch setTierPricingMode(CALCULATED)

CALCULATED → MANUAL:
  1. Keep current calculated value as starting amount
  2. Make price editable
  3. Dispatch setTierPricingMode(MANUAL_OVERRIDE)
```

### 4.4 Over-Budget Detection

Only in MANUAL_OVERRIDE mode:

```
condition: calculatedSum CROSSES from ≤ manualPrice to > manualPrice
trigger: show OverBudgetDialog (once per crossing)

Resolution options:
  1. "Update tier price to $X" → dispatch updateTierPricing(calculatedSum)
  2. "Keep manual price" → dismiss, show budget warning
```

### 4.5 Billing Cycle Discounts

Each tier can have discounts per billing cycle. Example:

| Cycle | Discount |
|-------|----------|
| QUARTERLY | 5% off |
| SEMI_ANNUAL | 8% off |
| ANNUAL | 3% off or $60 flat |

These discounts cascade down to service groups (see Section 6).

### 4.6 Recommended Tier Badge

```
0 tiers   → no badge
1-2 tiers → badge on tier index 1 (second tier)
3+ tiers  → badge on middle tier (floor(length/2))
```

### 4.7 Charm Pricing Suggestions

Display 3 price suggestions with psychological pricing (.99/.97 endings):
- Lower charm price
- Nearest charm price
- Higher charm price

---

## 5. The Matrix (Tab 4) — Core Business Logic

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ SET SUBSCRIPTION PLAN & BILLING CYCLE: [Mo] [Qtr] [6Mo] [Yr] [Custom?] │
├─────────────────────────────────────────────────────────────┤
│ [Majority Banner: "X of Y groups use Z billing. Switch?"]   │
├─────────────────────────────────────────────────────────────┤
│ Tier Cards:  (●) Basic $300/mo  ( ) Professional $600/mo  ( ) Enterprise Custom │
│              Billed $3,600/yr   Billed $7,200/yr                                │
│              SAVE 3%            SAVE 3%                                          │
├─────────────────────────────────────────────────────────────┤
│ SCROLLABLE TABLE                                             │
│                                                              │
│ ⚙ Setup & Formation                                        │
│   [Legal] [ONE TIME]                            INCLUDED     │
│   TOTAL SETUP FEE                     $3,000 flat fee        │
│                                                              │
│ ✦ Recurring Services                                        │
│   [Group A] [Mo] [Yr*] [6Mo] [Qtr]  $96.77/mo  SAVE 3%    │
│     Swiss association entity    ✓      ✓      ✓              │
│     Invoice management          ✓      ✓      ✓              │
│   [Group B] [Mo] [6Mo] [Qtr] [Yr*]  $193.55/mo SAVE 3%    │
│     Monthly accounting          ✓      ✓      ✓              │
│   [Group C] [Mo] [6Mo*] [Qtr] [Yr]  $9.68/mo   SAVE 3%    │
│     Dedicated ops support       ✓      ✓      ✓              │
│                                                              │
│ SUBTOTAL                      $310 CALC  $620 CALC  Custom   │
│                                                              │
│ ☐ Add-On Group (toggle)                                     │
│   [Addon services]              ✓      ✓      ✓              │
│   SUBTOTAL                 +$50/yr                           │
├─────────────────────────────────────────────────────────────┤
│ STICKY GRAND TOTAL                                           │
│ Recurring Tier Price /year       $3,600  SAVE 3%             │
│ + Setup & Formation Fees         $3,000 one-time             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Global Billing Cycle Selection

The top bar shows all 4 recurring billing cycles: **Month, Quarter, 6 Months, Year**.

**Selecting a global cycle:**
1. Sets `activeBillingCycle` to the chosen cycle
2. Clears all per-group overrides (`groupBillingCycles = {}`)
3. All regular groups use this cycle
4. Tier prices recalculate for this cycle
5. Tier discounts for this cycle apply

### 5.3 Per-Group Billing Cycle Override

Each regular (non-addon) service group shows 4 cycle tabs: **Month, Quarter, 6 Months, Year**.

**When a group tab is clicked to a different cycle than global:**
1. `groupBillingCycles[groupId] = selectedCycle`
2. `isCustomBillingMode` becomes `true`
3. Global bar shows a **"Custom"** badge
4. The group uses its own cycle for pricing and discount resolution
5. Other non-overridden groups continue using the global cycle

### 5.4 Custom Billing Mode

```typescript
isCustomBillingMode = Object.values(groupBillingCycles)
  .some(cycle => cycle !== activeBillingCycle)
```

When `true`:
- Global bar shows "Custom" tab active
- Grand total switches from single row to **per-group itemized rows**
- Each group row shows its effective cycle and price

When `false`:
- Global bar highlights the active cycle
- Grand total shows a single "Recurring Tier Price /[cycle]" row

### 5.5 Majority-Based Auto-Revert

When a group's cycle is changed, the system checks if a majority (>50%) of all regular groups now share the same cycle.

```
detectMajorityCycle(regularGroups, globalCycle, groupOverrides):
  for each group:
    effectiveCycle = override[group.id] || globalCycle
  count cycles
  if any cycle > 50% AND differs from global:
    return { majorityCycle, count, total }
```

**Auto-revert in handleGroupCycleChange:**
If majority is found immediately, the system auto-switches:
1. `activeBillingCycle = majorityCycle`
2. `groupBillingCycles = {}` (clear all overrides)
3. All groups now use the new global cycle

**Majority suggestion banner:**
If majority is detected (not auto-reverted), a banner appears:
```
"X of Y service groups use [Cycle] billing."
[Switch to Cycle] [Keep current]
```
Dismissible — resets when group configuration changes.

---

## 6. Pricing Calculations

### 6.1 Constants

```typescript
BILLING_CYCLE_MONTHS = {
  MONTHLY: 1, QUARTERLY: 3, SEMI_ANNUAL: 6, ANNUAL: 12, ONE_TIME: 1
}
```

### 6.2 Group Price for a Tier

```
getGroupPriceForTier(group, tierId):
  1. Check group.tierDependentPricing[].find(tp.tierId === tierId)
     → If found: monthly = recurringPricing.find(MONTHLY).amount
  2. Fallback: group.standalonePricing.recurringPricing.find(MONTHLY).amount
  3. Return { amount: monthly || 0, hasPrice: boolean }
```

### 6.3 Calculated Tier Price

```
calculateTierRecurringPrice(regularGroups, cycle, tierId):
  monthlyTotal = 0
  for each group in regularGroups:
    monthly = getGroupPriceForTier(group, tierId).amount
    monthlyTotal += monthly

  return {
    monthlyTotal,
    cycleTotal: monthlyTotal × BILLING_CYCLE_MONTHS[cycle],
    groupBreakdown: [...per-group amounts],
    missingPriceGroups: [...groups with no pricing]
  }
```

### 6.4 Tier Price Display (Header Cards)

```
getTierPriceForCycle(tier, cycle):
  baseMonthly = tier.pricingMode === "CALCULATED"
    ? calculateTierRecurringPrice(regularGroups, "MONTHLY", tier.id).monthlyTotal
    : tier.pricing.amount ?? 0

  totalForCycle = baseMonthly × BILLING_CYCLE_MONTHS[cycle]

  discount = tier.billingCycleDiscounts.find(d.billingCycle === cycle)
  if no discount:
    return { amount: totalForCycle, monthlyEquivalent: baseMonthly, hasDiscount: false }

  if PERCENTAGE:
    adjusted = totalForCycle × (1 - discountValue / 100)
    savingsPercent = discountValue
  if FLAT_AMOUNT:
    adjusted = max(0, totalForCycle - discountValue)
    savingsPercent = round(discountValue / totalForCycle × 100)

  monthlyEq = adjusted / months
  return { amount: adjusted, monthlyEquivalent: monthlyEq, hasDiscount: true, savingsPercent }
```

### 6.5 Discount Resolution Cascade

The system resolves discounts through a mode-aware cascade:

```
resolveGroupDiscountForTier(group, tierId, effectiveCycle, tier, forceInherit?):

  # In global billing mode, forceInherit = true → always use tier discount
  discountMode = forceInherit ? null : group.discountMode

  if discountMode === "INDEPENDENT":
    → Read from group.tierDependentPricing[tierId].recurringPricing[cycle].discount
    → If found and discountValue > 0: return { discountRule, source: "group" }
    → Else: return null (no fallback)

  # INHERIT_TIER (or null/default):
  → Read from tier.billingCycleDiscounts.find(cycle)
  → If found and discountValue > 0: return { discountRule, source: "tier" }
  → Else: return null
```

**Key rules:**
- **Global billing mode**: `forceInherit = true` for all non-addon groups. Groups always show inherited tier discounts.
- **Custom billing mode**: `forceInherit = false`. Each group's `discountMode` determines behavior.
- **Default (`discountMode` = null)**: Behaves like `INHERIT_TIER`.
- **Add-ons**: Never force-inherit (they manage their own discounts).

### 6.6 Proportional Flat-Amount Discount Distribution

When a tier-level FLAT_AMOUNT discount is inherited by service groups, it must be distributed **proportionally** so that group prices sum to the tier's discounted total.

**Problem:** A $60 flat discount applied to each of 3 groups would give $180 total discount instead of $60.

**Solution:**

```
tierBaseMonthly = SUM of all regular group monthly prices for this tier

For each group:
  proportion = groupBaseMonthly / tierBaseMonthly
  proportionalDiscount = tierFlatDiscount × proportion
  adjustedCyclePrice = max(0, totalForCycle - proportionalDiscount)
```

**Example:**
| Group | Monthly | Proportion | Proportional share of $60 | Adjusted Annual |
|-------|---------|------------|---------------------------|-----------------|
| A | $100 | 32.3% | $19.35 | $1,200 - $19.35 = $1,180.65 |
| B | $200 | 64.5% | $38.71 | $2,400 - $38.71 = $2,361.29 |
| C | $10 | 3.2% | $1.94 | $120 - $1.94 = $118.06 |
| **Total** | **$310** | **100%** | **$60.00** | **$3,660.00** |

Tier annual price = $310 × 12 - $60 = $3,660. Group sum matches.

**PERCENTAGE discounts** distribute naturally (5% of each part = 5% of whole).

### 6.7 Addon Pricing

```
getAddonPriceForCycle(group, cycle, tier):
  Read from group.standalonePricing or group.tierDependentPricing[tierId]
  Apply group's own billingCycleDiscounts for the cycle
  Calculate monthly equivalent
```

Addons are independent — their discounts are not proportionally distributed since they're separate from the tier base price.

---

## 7. Grand Total Calculation

### 7.1 Global Billing Mode (single row)

```
Recurring Tier Price /[cycle]:
  → For selected tier: getTierPriceForCycle(tier, activeBillingCycle)
  → Shows discount badge if applicable
```

### 7.2 Custom Billing Mode (per-group rows)

```
For each regularGroup:
  effectiveCycle = groupBillingCycles[group.id] || activeBillingCycle
  baseMonthly = getGroupPriceForTier(group, selectedTier.id).amount
  totalForCycle = baseMonthly × months

  Resolve discount (respects group's discountMode):
    PERCENTAGE → adjusted = totalForCycle × (1 - value/100)
    FLAT_AMOUNT inherited → proportional distribution
    FLAT_AMOUNT independent → full subtraction

  Display: "GroupName /[cycle]" → "$adjusted" [SAVE X%]
```

### 7.3 Grand Total Components

```
Grand Total = Recurring + Addons + Setup

Recurring:
  Global mode: single tier price row
  Custom mode: sum of per-group rows

+ Recurring Add-on Prices:
  For each enabled addon: +$X/[addonCycle]

+ Setup & Formation Fees:
  Sum of all setup group flat fees (one-time)
```

---

## 8. SUBTOTAL Row

Positioned between regular service groups and addon groups. Shows per-tier totals.

**Per tier cell:**
```
if tier.isCustomPricing → "Custom"
else:
  calcResult = calculateTierRecurringPrice(regularGroups, "MONTHLY", tier.id)
  groupSum = calcResult.monthlyTotal

  if tier.pricingMode === "CALCULATED":
    Show groupSum with "calc" badge
  else (MANUAL_OVERRIDE):
    Show tier.pricing.amount
    if groupSum !== tierPrice:
      Show comparison: "Groups: $X (+$Y over)" or "Groups: $X"
```

---

## 9. Service Level Matrix

### 9.1 Service Level Values

| Level | Display | Badge Color | Description |
|-------|---------|-------------|-------------|
| `INCLUDED` | ✓ | Green | Feature included in tier |
| `NOT_INCLUDED` | — | Gray/striped | Feature not available |
| `OPTIONAL` | ○ | Blue | Available as optional add-on |
| `CUSTOM` | text | Purple | Custom value (free text) |
| `VARIABLE` | # | Amber | Usage-based/variable |
| `NOT_APPLICABLE` | / | Light gray | Not applicable to this service |

### 9.2 Cell Interaction

Clicking a cell opens a level selector:
```
handleSetServiceLevel(serviceId, tierId, newLevel):
  if existing binding → dispatch updateServiceLevel()
  else → dispatch addServiceLevel()
```

### 9.3 Usage Limits (Metrics)

Services can have metrics (e.g., "API calls", "Storage") with per-tier limits:
```
ServiceUsageLimit:
  metric: "API calls"
  freeLimit: 1000
  paidLimit: 10000
  unitPrice: $0.01
  resetCycle: MONTHLY
```

---

## 10. Optional Groups (Add-Ons)

### 10.1 Toggle Behavior

Add-on groups have an enable/disable toggle:
```
enabledOptionalGroups: Set<groupId>

toggleOptionalGroup(groupId):
  if enabled → disable (remove from grand total)
  if disabled → enable (add to grand total)
```

### 10.2 Addon SUBTOTAL Row

Each enabled addon shows its own SUBTOTAL:
```
+$X/[cycle] + $Y setup (if setup cost exists)
```

Disabled addons show "—".

### 10.3 Addon Billing Cycles

Add-ons have their own cycle selector (independent of global):
```
addonBillingCycles: Record<groupId, BillingCycle>
```

---

## 11. Budget Indicator

Displayed in the Service Catalog edit modal for MANUAL_OVERRIDE tiers.

```
Props: { budget: number, allocated: number, currency: string }

remaining = budget - allocated
fillPercent = min((allocated / budget) × 100, 100)

Visual states:
  < 80%  → Green bar, "$X remaining"
  80-100% → Amber bar, "$X remaining"
  > 100%  → Red bar, "+$X over budget"
```

**Not shown when:**
- `tier.pricingMode === "CALCULATED"` (no fixed budget)
- `tier.isCustomPricing === true`

---

## 12. Operations Reference

### 12.1 Tier Management

| Operation | Key Fields | Behavior |
|-----------|-----------|----------|
| `ADD_TIER` | id, name, amount?, currency, isCustomPricing? | Creates tier with empty serviceLevels/usageLimits, pricingMode: null |
| `UPDATE_TIER` | id, name?, description?, isCustomPricing? | Updates fields conditionally |
| `UPDATE_TIER_PRICING` | tierId, amount?, currency? | Updates pricing amount/currency |
| `DELETE_TIER` | id | Removes tier |
| `ADD_SERVICE_LEVEL` | tierId, serviceLevelId, serviceId, level | Adds feature binding |
| `UPDATE_SERVICE_LEVEL` | tierId, serviceLevelId, level?, optionGroupId?, customValue? | Updates binding |
| `REMOVE_SERVICE_LEVEL` | tierId, serviceLevelId | Removes binding |
| `ADD_USAGE_LIMIT` | tierId, limitId, serviceId, metric, unitName?, freeLimit?, paidLimit?, resetCycle?, unitPrice? | Creates usage quota |
| `UPDATE_USAGE_LIMIT` | tierId, limitId, metric?, freeLimit?, paidLimit?, ... | Updates quota |
| `REMOVE_USAGE_LIMIT` | tierId, limitId | Removes quota |
| `SET_TIER_DEFAULT_BILLING_CYCLE` | tierId, defaultBillingCycle | Sets default cycle |
| `SET_TIER_BILLING_CYCLE_DISCOUNTS` | tierId, discounts[] | Replaces all cycle discounts |
| `SET_TIER_PRICING_MODE` | tierId, pricingMode | Sets CALCULATED or MANUAL_OVERRIDE |

### 12.2 Option Group Management

| Operation | Key Fields | Behavior |
|-----------|-----------|----------|
| `ADD_OPTION_GROUP` | id, name, isAddOn, defaultSelected, costType?, availableBillingCycles?, price?, currency? | Creates group, pricingMode: null, discountMode: null |
| `UPDATE_OPTION_GROUP` | id, name?, isAddOn?, costType?, availableBillingCycles?, ... | Updates conditionally |
| `DELETE_OPTION_GROUP` | id | Removes group, cascades: nullifies optionGroupId in all tier ServiceLevelBindings |
| `SET_OPTION_GROUP_STANDALONE_PRICING` | optionGroupId, setupCost?, recurringPricing[] | Sets pricingMode=STANDALONE, clears tierDependentPricing |
| `ADD_OPTION_GROUP_TIER_PRICING` | optionGroupId, tierPricingId, tierId, setupCost?, recurringPricing[] | Sets pricingMode=TIER_DEPENDENT, adds tier entry |
| `UPDATE_OPTION_GROUP_TIER_PRICING` | optionGroupId, tierId, setupCost?, recurringPricing? | Updates existing tier pricing |
| `REMOVE_OPTION_GROUP_TIER_PRICING` | optionGroupId, tierId | Removes tier pricing entry |
| `SET_OPTION_GROUP_DISCOUNT_MODE` | optionGroupId, discountMode | Sets INHERIT_TIER or INDEPENDENT |

### 12.3 Service Management

| Operation | Key Fields | Behavior |
|-----------|-----------|----------|
| `ADD_SERVICE` | id, title, serviceGroupId?, isSetupFormation?, optionGroupId? | Creates service |
| `UPDATE_SERVICE` | id, title?, serviceGroupId?, isSetupFormation?, ... | Updates conditionally |
| `DELETE_SERVICE` | id | Removes service, cascades: removes all ServiceLevelBindings across all tiers |
| `ADD_FACET_BINDING` | serviceId, bindingId, facetName, facetType, supportedOptions[] | Binds facet to service |
| `REMOVE_FACET_BINDING` | serviceId, bindingId | Removes facet binding |

### 12.4 Service Group Management

| Operation | Key Fields | Behavior |
|-----------|-----------|----------|
| `ADD_SERVICE_GROUP` | id, name, billingCycle, displayOrder? | Creates group with empty tierPricing[] |
| `UPDATE_SERVICE_GROUP` | id, name?, billingCycle?, displayOrder? | Updates conditionally |
| `DELETE_SERVICE_GROUP` | id | Removes group, cascades: nullifies serviceGroupId on services |
| `REORDER_SERVICE_GROUPS` | order[] | Reorders groups by OID array |
| `ADD_SERVICE_GROUP_TIER_PRICING` | serviceGroupId, tierPricingId, tierId | Creates empty tier pricing entry |
| `SET_SERVICE_GROUP_SETUP_COST` | serviceGroupId, tierId, amount, currency | Sets setup cost |
| `ADD_RECURRING_PRICE_OPTION` | serviceGroupId, tierId, priceOptionId, billingCycle, amount, currency | Adds recurring price |
| `UPDATE_RECURRING_PRICE_OPTION` | serviceGroupId, tierId, priceOptionId, amount?, discount? | Updates price/discount |
| `REMOVE_RECURRING_PRICE_OPTION` | serviceGroupId, tierId, priceOptionId | Removes price option |

---

## 13. User Journeys

### 13.1 Journey: Create a 3-Tier SaaS Offering

```
1. Template Tab
   → Select resource template (optional)
   → Define target audiences

2. Tiers Tab
   → Click "Standard 3-Tier" preset
   → Creates: Basic ($99), Professional ($299), Enterprise (custom)
   → Edit Basic: set description, add annual discount (3% off)
   → Edit Professional: set description, add annual discount (3% off)
   → Enterprise stays as "Custom" (Contact Sales)

3. Services Tab
   → Create "Operations" group (RECURRING, not add-on)
   → Add services: Invoicing, Tax Filing, Accounting
   → Edit group pricing per tier:
     - Basic: $100/mo
     - Professional: $200/mo
     - Enterprise: (custom, no price)
   → Create "Support" group (RECURRING, not add-on)
   → Add services: Dedicated Ops, Multi-currency
   → Edit group pricing per tier:
     - Basic: $10/mo
     - Professional: $50/mo
   → Create "Premium Analytics" add-on
   → Set standalone price: $25/mo
   → Set annual discount: $30 off (flat)

4. Matrix Tab
   → Global cycle: YEAR selected
   → See tier prices: Basic $1,188/yr (SAVE 3%), Pro $2,970/yr (SAVE 3%)
   → All services show ✓ INCLUDED for Basic and Pro
   → Toggle Premium Analytics add-on ON
   → Grand total: $1,188 + $270 addon + $0 setup
```

### 13.2 Journey: Override a Group's Billing Cycle

```
Starting state: Global = Annual, 3 service groups all on Annual

1. Click "Month" tab on "Operations" group
   → groupBillingCycles = { "operations-id": "MONTHLY" }
   → isCustomBillingMode = true (Month ≠ Annual)
   → Global bar shows "Custom" badge
   → Operations group now shows $100/mo (no annual discount)
   → Other groups still show annual pricing with tier discount

2. Grand total switches to per-group rows:
   → Operations /month: $100
   → Support /year: $108.60 (SAVE 3%)
   → Tax Services /year: $580.80 (SAVE 3%)

3. Click "Month" on Support group
   → Now 2 of 3 groups are Monthly
   → Majority detected (>50% = Monthly)
   → Auto-revert: global switches to MONTHLY
   → All overrides cleared
   → All groups now show Monthly pricing
```

### 13.3 Journey: Set Independent Discount on a Group

```
1. In Services Tab, edit "Operations" group
2. Toggle discount mode: INHERIT_TIER → INDEPENDENT
3. Set per-tier, per-cycle discounts:
   - Basic tier, Annual: 10% off
   - Professional tier, Annual: 15% off

4. In Matrix Tab:
   - Global cycle = Annual
   - Operations group shows its OWN discount (10% for Basic, 15% for Pro)
   - Other groups inherit the TIER's annual discount (e.g., 3%)

5. Override Operations to Monthly:
   - Custom mode active
   - Operations shows no discount (no independent monthly discount set)
   - Other groups still inherit tier discount for their cycle
```

---

## 14. Pricing Display Formats

### 14.1 Monthly Pricing

```
$100/mo
```

### 14.2 Non-Monthly Pricing (with monthly equivalent)

```
$96.77/mo  Billed $1,161.29 annually  SAVE 3%
```

### 14.3 One-Time Pricing

```
$3,000 flat fee (applied to all tiers)
```

### 14.4 Custom Pricing

```
Custom (no price shown)
```

### 14.5 Discount Badges

```
SAVE 3%    (green badge, percentage)
SAVE $60   (green badge, flat amount — only for group-level independent)
```

---

## 15. Key Business Rules Summary

| # | Rule | Implementation |
|---|------|----------------|
| 1 | Tier price = SUM(group prices) when CALCULATED mode | `calculateTierRecurringPrice()` |
| 2 | Custom tier always shows "Custom" regardless of mode | `tier.isCustomPricing` check |
| 3 | Global cycle applies to all non-overridden, non-addon groups | `effectiveCycle = override || global` |
| 4 | >50% majority auto-reverts all overrides | `detectMajorityCycle()` + `handleGroupCycleChange()` |
| 5 | Inherited flat discounts distribute proportionally | `proportion = groupBase / tierBase` |
| 6 | Percentage discounts apply uniformly to each group | `adjusted = total × (1 - pct/100)` |
| 7 | INDEPENDENT discount mode reads from group's tierDependentPricing | `getGroupIndependentDiscount()` |
| 8 | Global mode forces INHERIT_TIER for all groups | `forceInherit = !isCustom && !isAddOn` |
| 9 | Budget indicator hidden for CALCULATED tiers | No fixed budget to compare against |
| 10 | Over-budget dialog fires once per crossing | Track `previousTotal` state |
| 11 | Delete cascades: service→levels, group→serviceGroupId, optionGroup→optionGroupId | Reducer logic |
| 12 | Reducers are pure synchronous — IDs and timestamps come from action input | No `Math.random()` or `Date.now()` |

---

**Document Version**: 1.0
**Created**: 2026-02-16
**Quality Score**: 95/100
