# Integration Guide: Live Pricing + Subscription Creation

## Overview

This guide explains how to:

1. Use `getUserSelectionPriceBreakdown` for **live pricing** in your matrix UI
2. Call the `createProductInstances` **mutation** to create subscription + resource documents

The mutation handles all server-side logic: computing the price breakdown, creating the team drive, builder profile, resource instance, and subscription instance documents.

---

## 1. Install the package

```bash
npm install @powerhousedao/service-offering
```

This gives you access to:

- **`getUserSelectionPriceBreakdown`** — pure function for computing price breakdowns
- **TypeScript types** — `UserSelection`, `PriceBreakdown`, `OptionGroupBreakdown`, `AddOnBreakdown`, `BillingCycle`

---

## 2. Fetch the Service Offering

Use the `serviceOfferings` query to get the full offering state. You'll need all tiers, option groups, services, and service groups.

```graphql
query GetServiceOffering($filter: RSServiceOfferingsFilter) {
  serviceOfferings(filter: $filter) {
    id
    title
    summary
    description
    thumbnailUrl
    status
    tiers {
      id
      name
      description
      isCustomPricing
      pricingMode
      pricing { amount, currency }
      serviceLevels {
        id
        serviceId
        level
        customValue
        optionGroupId
      }
      usageLimits {
        id
        serviceId
        metric
        unitName
        freeLimit
        paidLimit
        resetCycle
        unitPrice
        unitPriceCurrency
      }
    }
    optionGroups {
      id
      name
      description
      isAddOn
      defaultSelected
      costType
      availableBillingCycles
      pricingMode
      price
      currency
      standalonePricing {
        setupCost { amount, currency, discount { discountType, discountValue } }
        recurringPricing { id, billingCycle, amount, currency, discount { discountType, discountValue } }
      }
      tierDependentPricing {
        id
        tierId
        setupCost { amount, currency, discount { discountType, discountValue } }
        setupCostDiscounts { billingCycle, discountRule { discountType, discountValue } }
        recurringPricing { id, billingCycle, amount, currency, discount { discountType, discountValue } }
      }
    }
    services {
      id
      title
      description
      serviceGroupId
      isSetupFormation
      optionGroupId
    }
    serviceGroups {
      id
      name
      billingCycle
      tierPricing {
        id
        tierId
        setupCostsPerCycle { id, billingCycle, amount, currency, discount { discountType, discountValue } }
        recurringPricing { id, billingCycle, amount, currency, discount { discountType, discountValue } }
      }
    }
  }
}
```

---

## 3. Track user selections (React state)

Your matrix UI needs to track these pieces of state:

```typescript
// Which tier the user selected
const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);

// Global billing cycle
const [activeBillingCycle, setActiveBillingCycle] = useState<BillingCycle>("MONTHLY");

// Which add-on groups are toggled ON (initialize from defaultSelected)
const [enabledAddonIds, setEnabledAddonIds] = useState<Set<string>>(
  () => new Set(optionGroups.filter(g => g.defaultSelected).map(g => g.id))
);

// Per-group billing cycle overrides (only when different from global)
const [groupCycleOverrides, setGroupCycleOverrides] = useState<Record<string, BillingCycle>>({});

// Per-addon billing cycle overrides (only when different from global)
const [addonCycleOverrides, setAddonCycleOverrides] = useState<Record<string, BillingCycle>>({});
```

**Key rules:**

- **Regular groups** (`isAddOn === false`) are always included — the user doesn't toggle them
- **Add-on groups** (`isAddOn === true`) are opt-in — track which ones the user has enabled
- **Override dictionaries** should only contain entries where the cycle **differs** from `activeBillingCycle`. Empty `{}` means all groups use the global cycle
- Check `optionGroup.availableBillingCycles` to know which cycles a group supports

---

## 4. Use `getUserSelectionPriceBreakdown` for live pricing

Call this function reactively on every user interaction to display real-time prices.

```typescript
import {
  getUserSelectionPriceBreakdown,
  type PriceBreakdown,
} from "@powerhousedao/service-offering/document-models/service-offering";
```

```typescript
const breakdown: PriceBreakdown = getUserSelectionPriceBreakdown(
  // Wrap the query response in the expected state shape
  { global: offeringState, local: {} },
  {
    tierId: selectedTier.id,
    billingCycle: activeBillingCycle,
    optionGroupIds: [...enabledAddonIds],
    groupBillingCycleOverrides: groupCycleOverrides,   // Record<string, BillingCycle>
    addonBillingCycleOverrides: addonCycleOverrides,   // Record<string, BillingCycle>
  }
);
```

> **Note:** The first argument must be shaped as `{ global: <offering state>, local: {} }`. If your GraphQL response is the flat `RSServiceOffering` object, wrap it accordingly.

### What you get back — `PriceBreakdown`

| Field                                              | Use for                                                 |
| -------------------------------------------------- | ------------------------------------------------------- |
| `breakdown.tierCycleTotal`                         | Total tier price for the selected billing cycle          |
| `breakdown.tierCurrency`                           | Currency label                                          |
| `breakdown.optionGroupBreakdowns[].recurringAmount`| Per-group recurring price (after discount)              |
| `breakdown.optionGroupBreakdowns[].discount`       | Discount details (original amount, type, value)         |
| `breakdown.optionGroupBreakdowns[].setupCost`      | One-time setup cost per group                           |
| `breakdown.addOnBreakdowns[].recurringAmount`      | Per-add-on recurring price                              |
| `breakdown.totals.grandRecurringTotal`             | Total recurring across all groups + add-ons             |
| `breakdown.totals.grandSetupTotal`                 | Total one-time setup costs                              |

### Why use this function?

- It encodes all pricing logic: tier-dependent vs standalone pricing, billing cycle multipliers, percentage and flat discounts, setup costs, billing-cycle-aware discounts, and discount stripping when overriding cycles
- It's a **pure function** (no side effects, no API calls) — safe to call on every state change
- It's the **same function** the server calls when processing the mutation, so what the user sees matches what gets written to the subscription

---

## 5. Call the mutation when user confirms

When the user is ready, build the `CreateProductInstancesInput` from the same state you've been tracking.

```graphql
mutation CreateProductInstances($input: CreateProductInstancesInput!) {
  createProductInstances(input: $input) {
    success
    data
    errors
  }
}
```

### Build the mutation variables

```typescript
function buildMutationInput() {
  // Convert Record overrides → array format (mutation expects arrays, not dictionaries)
  const groupOverrides = Object.entries(groupCycleOverrides)
    .filter(([, cycle]) => cycle !== activeBillingCycle)
    .map(([groupId, billingCycle]) => ({ groupId, billingCycle }));

  const addonOverrides = Object.entries(addonCycleOverrides)
    .filter(([groupId]) => enabledAddonIds.has(groupId))
    .filter(([, cycle]) => cycle !== activeBillingCycle)
    .map(([groupId, billingCycle]) => ({ groupId, billingCycle }));

  return {
    serviceOfferingId: offering.id,
    name: "Customer Project Name",       // max 64 chars, [a-zA-Z0-9 _-]
    teamName: "customer-team",            // max 64 chars, same constraints
    customerEmail: "user@example.com",    // optional
    userSelection: {
      tierId: selectedTier.id,
      billingCycle: activeBillingCycle,
      optionGroupIds: [...enabledAddonIds],
      // Only include if non-empty:
      ...(groupOverrides.length > 0 && { groupBillingCycleOverrides: groupOverrides }),
      ...(addonOverrides.length > 0 && { addonBillingCycleOverrides: addonOverrides }),
    },
  };
}
```

### Input field reference

| Field                                        | Type                          | Required | Description                                                |
| -------------------------------------------- | ----------------------------- | -------- | ---------------------------------------------------------- |
| `serviceOfferingId`                          | `PHID!`                       | Yes      | The offering `id` from the query                           |
| `name`                                       | `String!`                     | Yes      | Display name for the resource/subscription                 |
| `teamName`                                   | `String!`                     | Yes      | Team drive name (becomes the drive slug)                   |
| `customerEmail`                              | `EmailAddress`                | No       | Optional customer email stored on the subscription         |
| `userSelection.tierId`                       | `OID!`                        | Yes      | The selected `tiers[].id`                                  |
| `userSelection.billingCycle`                 | `RSBillingCycle!`             | Yes      | `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL`, `ONE_TIME`|
| `userSelection.optionGroupIds`               | `[OID!]!`                     | Yes      | IDs of enabled add-on groups (can be empty `[]`)           |
| `userSelection.groupBillingCycleOverrides`   | `[BillingCycleOverrideInput!]`| No       | Per-group overrides when cycle differs from global         |
| `userSelection.addonBillingCycleOverrides`   | `[BillingCycleOverrideInput!]`| No       | Per-add-on overrides when cycle differs from global        |

### Critical rules

1. **`optionGroupIds`** — Only include IDs of **add-on** groups (`isAddOn === true`) that the user enabled. Regular groups are included server-side automatically. Empty `[]` is valid.
2. **Override arrays** — Never send null values. Either omit the field or include only entries where the cycle differs from the global `billingCycle`.
3. **`name` / `teamName`** — Max 64 characters. Only letters, numbers, spaces, hyphens, underscores.

---

## 6. Handle the response

```typescript
interface CreateProductInstancesOutput {
  success: boolean;
  data: {
    linkToDrive: string;  // URL to the team drive in Connect
  } | null;
  errors: string[];
}
```

On `success: true`, redirect the user to `data.linkToDrive`.

---

## Billing cycle overrides explained

The override fields are **optional** and only needed when a specific group uses a **different billing cycle** than the global selection.

### When to omit (most common)

All groups use the same cycle as the global `billingCycle`:

```json
{
  "tierId": "abc-123",
  "billingCycle": "ANNUAL",
  "optionGroupIds": ["addon-1"]
}
```

### When to include

User picks `ANNUAL` globally but wants specific groups billed differently:

```json
{
  "tierId": "abc-123",
  "billingCycle": "ANNUAL",
  "optionGroupIds": ["addon-1", "addon-2"],
  "groupBillingCycleOverrides": [
    { "groupId": "group-1", "billingCycle": "MONTHLY" }
  ],
  "addonBillingCycleOverrides": [
    { "groupId": "addon-2", "billingCycle": "QUARTERLY" }
  ]
}
```

### Override format difference

| Context                              | Format                                        | Example                                 |
| ------------------------------------ | --------------------------------------------- | --------------------------------------- |
| `getUserSelectionPriceBreakdown` (client) | `Record<string, BillingCycle>` (dictionary)  | `{ "group-1": "MONTHLY" }`             |
| Mutation `userSelection` (server)    | `[{ groupId, billingCycle }]` (array)         | `[{ groupId: "group-1", billingCycle: "MONTHLY" }]` |

---

## What the mutation creates (server-side)

You don't implement any of this — the resolver handles it all:

1. **Team drive** — with `teamName` as slug, `builder-team-admin` as preferred editor
2. **Builder profile** — inside the team drive, with the `name`
3. **Resource instance** — initialized from the resource template linked to the offering
4. **Subscription instance** — populated with all tier pricing, service groups, add-on groups, discounts, setup costs, and usage limits fully resolved from the price breakdown

---

## Reference implementation

The `TheMatrix.tsx` editor in this repository is the reference implementation:

- **State management** — how `enabledOptionalGroups`, `activeBillingCycle`, `groupBillingCycles`, `addonBillingCycles` are tracked
- **Price breakdown computation** — how `getUserSelectionPriceBreakdown` is called reactively in a `useMemo`
- **Copy Selection button** — how the `UserSelectionInput` JSON is built from React state (the exact shape the mutation expects)
