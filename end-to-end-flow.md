---
marp: true
theme: default
paginate: true
footer: 'Powerhouse Service Offering Architecture'
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Fira+Code:wght@400;500;700&display=swap');

:root {
  --color-background: #0d1117;
  --color-foreground: #c9d1d9;
  --color-heading: #58a6ff;
  --color-accent: #7ee787;
  --color-code-bg: #161b22;
  --color-border: #30363d;
  --color-purple: #d2a8ff;
  --color-orange: #ffa657;
  --color-red: #ff7b72;
  --font-default: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
  --font-code: 'Fira Code', 'Consolas', monospace;
}

section {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-default);
  font-weight: 400;
  box-sizing: border-box;
  border-left: 4px solid var(--color-accent);
  position: relative;
  line-height: 1.6;
  font-size: 20px;
  padding: 56px;
}

h1, h2, h3 {
  font-weight: 700;
  color: var(--color-heading);
  margin: 0;
  padding: 0;
  font-family: var(--font-code);
}

h1 { font-size: 48px; line-height: 1.3; text-align: left; }
h1::before { content: '# '; color: var(--color-accent); }

h2 { font-size: 34px; margin-bottom: 32px; padding-bottom: 10px; border-bottom: 2px solid var(--color-border); }
h2::before { content: '## '; color: var(--color-accent); }

h3 { color: var(--color-foreground); font-size: 24px; margin-top: 24px; margin-bottom: 8px; }
h3::before { content: '### '; color: var(--color-accent); }

ul, ol { padding-left: 28px; }
li { margin-bottom: 6px; }
li::marker { color: var(--color-accent); }

pre {
  background-color: var(--color-code-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 14px;
  font-family: var(--font-code);
  font-size: 14px;
  line-height: 1.45;
}

code {
  background-color: var(--color-code-bg);
  color: var(--color-accent);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--font-code);
  font-size: 0.85em;
}

pre code { background-color: transparent; padding: 0; color: var(--color-foreground); }

footer {
  font-size: 13px;
  color: #8b949e;
  font-family: var(--font-code);
  position: absolute;
  left: 56px; right: 56px; bottom: 36px;
  text-align: right;
}
footer::before { content: '// '; color: var(--color-accent); }

section.lead {
  border-left: 4px solid var(--color-accent);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
section.lead h1 { margin-bottom: 20px; }
section.lead p { font-size: 20px; color: var(--color-foreground); font-family: var(--font-code); }

strong { color: var(--color-accent); font-weight: 700; }
em { color: var(--color-purple); font-style: normal; }
a { color: var(--color-heading); }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  margin-top: 16px;
}
th {
  background-color: var(--color-code-bg);
  color: var(--color-heading);
  font-family: var(--font-code);
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  text-align: left;
}
td {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
}
</style>

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: '' -->

# End-to-End Flow

Service Offering to Subscription + Resource Instance

*Powerhouse Document Architecture*

---

## Overview

Four **event-sourced document models** participate in the flow from product definition through customer onboarding:

```
ResourceTemplate          Product blueprint (what can be built)
       |
ServiceOffering           Commercial package (pricing, tiers, levels)
       |
    [ Achra ]             Browser-side configurator (not a document)
       |
    [ Submit ]            Coordinated document creation
      / \
ResourceInstance    SubscriptionInstance
(the deliverable)  (the commercial contract)
```

Both output documents are placed in **two connect drives** simultaneously.

---

## The Document Models

| Document | Type | Tracks | Lifecycle |
|----------|------|--------|-----------|
| **ResourceTemplate** | `powerhouse/resource-template` | What can be built | DRAFT > ACTIVE > DEPRECATED |
| **ServiceOffering** | `powerhouse/service-offering` | How it's priced | DRAFT > ACTIVE > DEPRECATED |
| **SubscriptionInstance** | `powerhouse/subscription-instance` | Commercial contract + operational detail | PENDING > ACTIVE > CANCELLED |
| **ResourceInstance** | `powerhouse/resource-instance` | Delivery status + configuration | DRAFT > PROVISIONING > ACTIVE |

The **SubscriptionInstance** is the single source of truth for the subscription contract --- it holds tier info, services, metrics, billing, and customer details in one document.

---

<!-- _class: lead -->

# Phase 1

Product Definition

---

## Resource Template

The **product blueprint** defines what the operator can deliver, independent of pricing.

```
ResourceTemplateState
|- id: PHID!                 <- unique template identifier
|- operatorId: PHID!         <- the provider
|- title, summary            <- "Operational Hub for Open Source Builders"
|- status: TemplateStatus    <- DRAFT > COMING_SOON > ACTIVE > DEPRECATED
|- targetAudiences[]         <- who this is for
|- facetTargets[]            <- configurable dimensions (e.g. "Jurisdiction")
|   '- categoryKey, categoryLabel, selectedOptions[]
|- services[]                <- what can be delivered
|   '- title, facetBindings[], optionGroupId
'- optionGroups[]            <- selectable bundles (e.g. "Finance Pack")
```

- Services define **capabilities without prices**
- **FacetBindings** declare configurable dimensions per service

---

## Service Offering

Wraps a template with **pricing, tiers, and service levels**.

```
ServiceOfferingState
|- resourceTemplateId: PHID      <- points to ResourceTemplate
|- services[]                    <- priced service catalog
|   '- costType (RECURRING|SETUP), price, currency
|- tiers[]                       <- subscription tiers
|   |- pricing, pricingOptions[]
|   |- serviceLevels[]           <- per-service: INCLUDED | OPTIONAL | CUSTOM
|   |   '- serviceId, level, customValue, optionGroupId
|   '- usageLimits[]             <- per-service metrics
|       '- metric, freeLimit, paidLimit, unitPrice
'- optionGroups[]                <- add-on bundles with pricing
    '- costType, billingCycle, price, currency
```

Key relationship: **Tier > ServiceLevelBinding** determines per-service availability and the `customValue` display string.

---

## Concrete Example

"Operational Hub for Open Source Builders" with **Basic** tier at **$200/mo**:

| Offering Element | Tier Resolution |
|---|---|
| Needs Analysis | ServiceLevel: *customValue* = "~" |
| Incorporation Docs | ServiceLevel + FacetBinding > "Swiss Association", Setup $3,000 |
| Contributor Contracting | UsageLimit: *freeLimit* = 3 > "UP TO 3" |
| Tax Administration | ServiceLevel: INCLUDED > checkmark |
| Dedicated Account Manager | ServiceLevel: NOT_INCLUDED > "---" |
| Finance Pack | OptionGroup: +$50/mo, services: Bank Account Setup, Crypto Payment |
| Hosting Suite | OptionGroup: +$200/mo, services: Secure Email, Web Hosting |

---

<!-- _class: lead -->

# Phase 2

Achra Configurator

---

## Achra: The Resolution Step

Achra is a **browser-side UI** (not a document) that reads the ServiceOffering and lets a team configure their subscription.

### What it does

1. User selects a **tier** and a **pricing option**
2. Resolves each service's **ServiceLevelBinding** for that tier
3. Lets user toggle **optional services/groups**
4. Captures **facet selections** from facet bindings
5. Resolves **usage limits** into metric definitions
6. Computes **group-level recurring costs** from option groups

### Output

A fully **denormalized, self-contained** browser-side snapshot --- ready to dispatch.

---

## Achra Resolution Algorithm

```
for each service in offering.services:
    binding = tier.serviceLevels.find(serviceId == service.id)

    if binding.level == NOT_INCLUDED:  skip

    resolvedService = {
        name: service.title,
        customValue: binding.customValue || levelToDisplay(binding.level),
        facetSelections: resolveUserFacetPicks(service.facetBindings),
        setupCost: costType == SETUP ? { amount, currency } : null,
        recurringCost: costType == RECURRING ? { amount, currency } : null,
        metrics: tier.usageLimits.filter(serviceId).map(toMetric),
    }

for each optionGroup where user selected:
    resolvedGroup = {
        name: optionGroup.name,
        recurringCost: { amount, currency, billingCycle },
        services: resolve each grouped service,
    }
```

---

<!-- _class: lead -->

# Phase 3

The Submit Bridge

---

## Submit: Coordinated Creation

When the team clicks **Submit**, four things happen:

```
Submit
|
|- 1. Create team connect drive (named after team name)
|
|- 2. Create Resource Instance (from resourceTemplateId)
|     |- placed in operator's connect drive
|     '- placed in team's connect drive
|
|- 3. Create Subscription Instance (via initializeSubscription)
|     |- links to resource instance via resource.id
|     |- placed in operator's connect drive
|     '- placed in team's connect drive
|
'- 4. Both drives sync the same underlying documents
```

---

## Step 1: Team Drive Creation

A new **connect drive** is created for the builder team:

- **Drive name** = team name (e.g. "BAI team")
- Gives the team their own workspace
- Documents are **synced via connect** --- changes by either party are visible to both

### Step 2: Resource Instance

```
INITIALIZE_INSTANCE dispatch:

InitializeInstanceInput
|- profileId: PHID!              <- the profile document
|- profileDocumentType: String!  <- type of profile document
|- resourceTemplateId: PHID      <- back-reference to template
|- customerId: PHID              <- the team
|- name: "Operational Hub for Open Source Builders"
|- thumbnailUrl, infoLink, description
```

Status starts at **DRAFT**.

---

## Step 3: Subscription Instance

The `initializeSubscription` dispatch creates the full operational record:

```
InitializeSubscriptionInput
|- customerId, customerName, customerEmail
|- serviceOfferingId                    <- back-reference to offering
|- tierName: "Basic"
|- tierPricingOptionId, tierPrice: 200, tierCurrency: "USD"
|- resourceId                           <- PHID of ResourceInstance (step 2)
|- resourceLabel, resourceThumbnailUrl
|- autoRenew, createdAt
|- services[]                           <- resolved standalone services
'- serviceGroups[]                      <- resolved option groups
```

Status starts at **PENDING**.

---

## InitializeSubscriptionInput (Full)

```
services[]
|- id, name, description, customValue
|- facetSelections[]
|   '- id, facetName, selectedOption       <- "Swiss Association"
|- setupAmount, setupCurrency              <- one-time costs
|- recurringAmount, recurringCurrency,     <- recurring costs
|  recurringBillingCycle
'- metrics[]                               <- resolved usage limits
    '- id, name, unitName, limit, currentUsage,
       usageResetPeriod, unitCostAmount/Currency/BillingCycle

serviceGroups[]
|- id, name: "Finance Pack", optional: true
|- recurringAmount: 50, recurringCurrency: "USD",
|  recurringBillingCycle: "MONTHLY"
'- services[]                              <- same shape as above
```

---

## Step 4: Dual-Drive Placement

```
Operator's Connect Drive
|- ServiceOffering                  (already existed)
|- ResourceTemplate                 (already existed)
|- ResourceInstance      <- NEW     (operator provisions)
'- SubscriptionInstance  <- NEW     (operator manages billing)

Team's Connect Drive     <- NEWLY CREATED
|- ResourceInstance      <- SAME DOC (team uses deliverable)
'- SubscriptionInstance  <- SAME DOC (team views subscription)
```

Both drives reference the **same underlying documents** via Powerhouse connect sync. Every operation is visible to both parties through the event-sourced history.

---

<!-- _class: lead -->

# Phase 4

Parallel Lifecycles

---

## Resource Instance Lifecycle

Tracks the **delivery side**: is the deliverable ready?

```
DRAFT --> PROVISIONING --> ACTIVE --> SUSPENDED <-> ACTIVE --> TERMINATED
                                        |
                          (NON_PAYMENT | MAINTENANCE | OTHER)
```

### Operator actions

| Action | Effect |
|---|---|
| `CONFIRM_INSTANCE` | DRAFT > PROVISIONING |
| `REPORT_PROVISIONING_STARTED` | Sets provisioningStartedAt |
| `REPORT_PROVISIONING_COMPLETED` | Sets provisioningCompletedAt |
| `REPORT_PROVISIONING_FAILED` | Records failure reason |
| `ACTIVATE_INSTANCE` | PROVISIONING > ACTIVE |
| `SUSPEND_FOR_NON_PAYMENT` | ACTIVE > SUSPENDED (amount, daysPastDue) |
| `SUSPEND_FOR_MAINTENANCE` | ACTIVE > SUSPENDED (duration, type) |
| `RESUME_AFTER_PAYMENT` / `RESUME_AFTER_MAINTENANCE` | SUSPENDED > ACTIVE |
| `TERMINATE_INSTANCE` | Any > TERMINATED (final) |

---

## Resource Instance: Team Actions

The team manages their **configuration and profile** on the same document:

| Action | Effect |
|---|---|
| `UPDATE_INSTANCE_INFO` | Change name, description, thumbnail, info link |
| `SET_RESOURCE_PROFILE` | Switch the profile document reference |
| `SET_INSTANCE_FACET` | Add a configuration facet (e.g. "Jurisdiction: Swiss") |
| `UPDATE_INSTANCE_FACET` | Change a facet's selected option |
| `REMOVE_INSTANCE_FACET` | Remove a configuration facet |
| `APPLY_CONFIGURATION_CHANGES` | Batch add/update/remove facets in one dispatch |

The team **cannot** change lifecycle status (provisioning, suspension, termination) --- only the operator controls those transitions.

---

## Subscription Instance Lifecycle

Tracks the **commercial side**: is the contract active and paid?

```
PENDING --> ACTIVE <-> PAUSED --> ACTIVE
                   --> EXPIRING --> ACTIVE (renewed)
                               --> CANCELLED
```

### Operator actions

| Action | Effect |
|---|---|
| `ACTIVATE_SUBSCRIPTION` | PENDING > ACTIVE |
| `PAUSE_SUBSCRIPTION` | ACTIVE > PAUSED |
| `RESUME_SUBSCRIPTION` | PAUSED > ACTIVE |
| `SET_EXPIRING` | ACTIVE > EXPIRING |
| `RENEW_EXPIRING_SUBSCRIPTION` | EXPIRING > ACTIVE |
| `CANCEL_SUBSCRIPTION` | Any > CANCELLED |
| `UPDATE_BILLING_PROJECTION` | Sets nextBillingDate, amount |
| `REPORT_SETUP_PAYMENT` / `REPORT_RECURRING_PAYMENT` | Records payments |

---

## Subscription Instance: Team Actions

The team manages their **profile, usage, and preferences** on the same document:

| Action | Effect |
|---|---|
| `SET_AUTO_RENEW` | Toggle auto-renewal on/off |
| `UPDATE_CUSTOMER_INFO` | Update name, email, customer ID |
| `SET_CUSTOMER_TYPE` | Set type: INDIVIDUAL or TEAM |
| `UPDATE_TEAM_MEMBER_COUNT` | Report current team member count |
| `INCREMENT_METRIC_USAGE` | Report usage increase (e.g. +1 contributor) |
| `DECREMENT_METRIC_USAGE` | Report usage decrease |
| `UPDATE_METRIC_USAGE` | Set metric to specific value |

The team **cannot** change lifecycle status (activate, pause, cancel) or modify billing/costs --- only the operator controls those transitions.

---

## Lifecycle Correlation

The two documents are **paired but independent**:

| Event | ResourceInstance | SubscriptionInstance |
|---|---|---|
| **Submit** | Created (DRAFT) | Created (PENDING) |
| **Operator confirms** | PROVISIONING | --- |
| **Provisioning done** | ACTIVE | --- |
| **Operator activates** | --- | ACTIVE |
| **Normal operation** | ACTIVE (team uses it) | ACTIVE (billing tracked) |
| **Non-payment** | SUSPENDED | PAUSED or EXPIRING |
| **Payment received** | ACTIVE (resumed) | ACTIVE (resumed) |
| **Cancellation** | TERMINATED | CANCELLED |

Resource = "Is the deliverable available?"
Subscription = "Is the contract active and paid?"

---

<!-- _class: lead -->

# Phase 5

Steady State

---

## Operator's View

Via their connect drive, the operator manages both documents:

### Subscription Instance (5 modules, 36 operations)
- **Lifecycle**: activate, pause, resume, expire, renew, cancel
- **Billing**: report setup/recurring payments, update projections
- **Services**: add/remove services, update costs, manage groups
- **Metrics**: define metrics, update limits, track overages
- **Admin**: set budget categories, operator notes, tier info

### Resource Instance (2 modules, 16 operations)
- **Lifecycle**: confirm, provision, activate, suspend, resume, terminate
- **Configuration**: manage facets, apply batch config changes
- **Monitoring**: track provisioning progress, suspension reasons

---

## Team's View

Via their connect drive, the team dispatches operations on the **same synced documents**:

### Subscription Instance
- **Self-service**: toggle auto-renew, update contact info
- **Customer profile**: set customer type, report team member count
- **Usage reporting**: increment/decrement/set metric usage
- **Read-only**: view tier, services, billing projections, costs

### Resource Instance
- **Configuration**: set/update/remove facets, batch apply changes
- **Profile**: update instance info (name, description, links)
- **Read-only**: view provisioning status, suspension status

Both parties dispatch operations on the **same document** --- connect sync ensures full visibility.

---

<!-- _class: lead -->

# Document Model Map

---

## Complete Relationship Map

```
ResourceTemplate (PHID)
|  Product blueprint: services, facets, option groups
|
'-> ServiceOffering (PHID)
    |  resourceTemplateId --> ResourceTemplate
    |  Commercial layer: tiers, pricing, service levels
    |
    '-> [ Achra: browser-side resolution ]
        |
        |-> ResourceInstance (PHID)
        |     resourceTemplateId --> ResourceTemplate
        |     customerId --> Team
        |     profile --> actual workspace document
        |     Lifecycle: DRAFT > PROVISIONING > ACTIVE
        |
        '-> SubscriptionInstance (PHID)
              serviceOfferingId --> ServiceOffering
              resource.id --> ResourceInstance
              customerId --> Team
              Lifecycle: PENDING > ACTIVE > CANCELLED
```

---

## Document Responsibilities

| Document | What it tracks | Primary audience |
|---|---|---|
| **ResourceTemplate** | What can be built (capabilities, facets, option groups) | Operator (authoring) |
| **ServiceOffering** | How it's priced (tiers, levels, usage limits, option pricing) | Operator + Teams (browsing) |
| **SubscriptionInstance** | Full contract: tier, services, metrics, billing, customer | Both (operator manages, team self-serves) |
| **ResourceInstance** | Delivery: provisioning, configuration, suspension | Both (operator provisions, team configures) |

### Key design principle

Achra **flattens and resolves** all relational data from the offering into **denormalized, self-contained** inputs. The instance documents never reference the offering's internal structure --- they are standalone.

---

<!-- _class: lead -->

# Screenshot Mapping

Achra Summary > Documents

---

## Header & Tier Mapping

| Screenshot Element | Subscription Instance | Resource Instance |
|---|---|---|
| "Operational Hub for Open Source Builders" | `resource.label` | `name` |
| Icon / thumbnail | `resource.thumbnailUrl` | `thumbnailUrl` |
| "$450/mo" total | `projectedBillAmount` | --- |
| "+ $3,000 Setup" | sum of `setupCost.amount` | --- |
| **Tier: "Basic"** | `tierName` | --- |
| **$200/mo** | `tierPrice` + `tierCurrency` | --- |

### Form fields (from Achra submit form)

| Field | Subscription Instance | Team Drive |
|---|---|---|
| Name: "apeiron" | `customerName` | --- |
| Team Name: "BAI team" | --- | Drive name |
| Email: "apeiron@powerhouse.inc" | `customerEmail` | --- |

---

## Services Mapping

| Screenshot Element | Field |
|---|---|
| Needs Analysis > "~" | `services[0].customValue: "~"` |
| Incorporation Docs | `services[1].name` |
| "Swiss Association" badge | `services[1].facetSelections[0].selectedOption` |
| "$3,000" + "One-time fee" | `services[1].setupCost: { amount: 3000 }` |
| Contributor Contracting > "UP TO 3" | `services[2].customValue` |
| Tax Administration > checkmark | `services[3].customValue: "INCLUDED"` |
| Dedicated Account Manager > "---" | `services[4].customValue: "---"` |

All `customValue` strings come from the **ServiceLevelBinding** resolution in achra.

---

## Service Groups Mapping

| Screenshot Element | Field |
|---|---|
| "Finance Pack" | `serviceGroups[0].name` |
| "+ $50/mo" | `serviceGroups[0].recurringCost` |
| Bank Account Setup | `serviceGroups[0].services[0].name` |
| "Swiss Association" on Bank Account | `serviceGroups[0].services[0].facetSelections[0]` |
| "LABEL" | `serviceGroups[0].services[0].customValue` |
| Crypto Payment > "---" | `serviceGroups[0].services[1].customValue` |
| "Hosting Suite" | `serviceGroups[1].name` |
| "+ $200/mo" | `serviceGroups[1].recurringCost` |
| Secure Email > "3 ACCOUNTS" | `serviceGroups[1].services[0].customValue` |
| Web Hosting > "BASIC" | `serviceGroups[1].services[1].customValue` |

---

<!-- _class: lead -->

# Summary

---

## Key Takeaways

1. **Four document models** work together: Template > Offering > Achra > SubscriptionInstance + ResourceInstance

2. **Achra resolves** relational offering data into denormalized, self-contained snapshots

3. **Single dispatch** (`initializeSubscription`) creates the full subscription with nested services, groups, metrics, and facets

4. **Dual-drive topology** gives both operator and team visibility into the same synced documents

5. **Dual perspectives**: operator controls lifecycle + billing; team controls configuration + usage reporting

6. **Event sourcing** ensures complete audit trail --- every operation from both parties is replayable
