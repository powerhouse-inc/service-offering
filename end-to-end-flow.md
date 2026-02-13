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

## The Big Picture

```
ResourceTemplate (PHID)
|  Product blueprint: services, facets, option groups
|
'-> ServiceOffering (PHID)
    |  resourceTemplateId --> ResourceTemplate
    |  Commercial layer: tiers, pricing, service levels
    |
    '-> [ Achra: browser-side resolution ]
        |                                        Operator's Drive
        |-> ResourceInstance (PHID)           <- placed in both drives
        |     resourceTemplateId                (operator provisions,
        |     customerId --> Team                 team configures)
        |     Lifecycle: DRAFT > ACTIVE
        |                                        Team's Drive
        '-> SubscriptionInstance (PHID)       <- placed in both drives
              serviceOfferingId --> SO           (operator manages billing,
              resource.id                         team reports usage)
              Lifecycle: PENDING > ACTIVE
```

Four **event-sourced documents**. Two **connect drives**. One **shared history**.

---

## Four Document Models

| Document | What it tracks | Lifecycle |
|----------|---------------|-----------|
| **ResourceTemplate** | What can be built --- capabilities, facets, option groups | DRAFT > ACTIVE > DEPRECATED |
| **ServiceOffering** | How it's priced --- tiers, service levels, usage limits | DRAFT > ACTIVE > DEPRECATED |
| **SubscriptionInstance** | The full contract --- tier, services, metrics, billing, customer | PENDING > ACTIVE > CANCELLED |
| **ResourceInstance** | Delivery status --- provisioning, configuration, suspension | DRAFT > PROVISIONING > ACTIVE |

**SubscriptionInstance** is the single source of truth for the subscription contract.
**ResourceInstance** is the single source of truth for the configured product.

---

<!-- _class: lead -->

# Phase 1

Product Definition

---

## Resource Template

The **product blueprint** --- what the operator can deliver, independent of pricing.

```
ResourceTemplateState
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
- **OptionGroups** define toggleable bundles

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

## Achra: Resolution

Achra is a **browser-side UI** (not a document) that reads the ServiceOffering and produces a denormalized snapshot.

### What it does

1. Team selects a **tier** and a **pricing option**
2. Resolves each service's **ServiceLevelBinding** for that tier
3. Lets team toggle **optional services/groups**
4. Captures **facet selections** from facet bindings
5. Resolves **usage limits** into metric definitions (freeLimit, paidLimit)
6. Computes **group-level costs** from option groups

### Output

A fully **denormalized, self-contained** snapshot --- ready to dispatch as `InitializeSubscriptionInput`.

---

## Resolution Algorithm

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

## Submit: What Happens

When the team clicks **Submit**, four things happen in sequence:

```
Submit
|
|- 1. Create team connect drive (named after team name)
|
|- 2. Create ResourceInstance (from resourceTemplateId)
|     |- placed in operator's connect drive
|     '- placed in team's connect drive
|
|- 3. Create SubscriptionInstance (via initializeSubscription)
|     |- links to resource instance via resource.id
|     |- placed in operator's connect drive
|     '- placed in team's connect drive
|
'- 4. Both drives sync the same underlying documents
```

---

## Steps 1-2: Drive + Resource Instance

### Team Drive

A new **connect drive** is created, named after the team (e.g. "BAI team"). Documents sync via connect --- changes by either party are visible to both.

### Resource Instance

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

The `initializeSubscription` dispatch creates the full operational record in one shot:

```
InitializeSubscriptionInput
|- customerId, customerName, customerEmail, customerType
|- operatorId, operatorName
|- serviceOfferingId                    <- back-reference to offering
|- tierId, tierName: "Basic"
|- tierPricingOptionId, tierPrice: 200, tierCurrency: "USD"
|- targetAudienceId, targetAudienceLabel
|- resourceId                           <- PHID of ResourceInstance (step 2)
|- resourceLabel, resourceThumbnailUrl
|- autoRenew, createdAt
|- projectedBillAmount, projectedBillCurrency
```

Status starts at **PENDING**.

---

## InitializeSubscriptionInput: Nested Data

After initialization, services, groups, metrics, option groups, and facets are added via individual dispatches:

```
addService()           <- per resolved standalone service
  |- serviceId, name, description, customValue
  |- setupAmount/Currency, recurringAmount/Currency/BillingCycle

addServiceMetric()     <- per resolved usage limit
  |- serviceId, metricId, name, unitName
  |- freeLimit, paidLimit, currentUsage, usageResetPeriod
  |- unitCostAmount/Currency/BillingCycle

addServiceGroup() + addServiceToGroup()  <- per option group
addSelectedOptionGroup()                 <- selected add-ons with pricing
setFacetSelection()                      <- subscription-level facets
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
|- ResourceInstance      <- SAME DOC (team configures)
'- SubscriptionInstance  <- SAME DOC (team reports usage)
```

Both drives reference the **same underlying documents** via Powerhouse connect sync.

Every operation dispatched by either party becomes part of the shared event-sourced history.

---

<!-- _class: lead -->

# Phase 4

Parallel Lifecycles

---

## Resource Instance: Operator Actions

Tracks the **product side** --- is the product ready?

```
DRAFT --> PROVISIONING --> ACTIVE --> SUSPENDED <-> ACTIVE --> TERMINATED
                                        |
                          (NON_PAYMENT | MAINTENANCE | OTHER)
```

| Action | Effect |
|---|---|
| `CONFIRM_INSTANCE` | DRAFT > PROVISIONING |
| `REPORT_PROVISIONING_STARTED` | Records start timestamp |
| `REPORT_PROVISIONING_COMPLETED` | Records completion timestamp |
| `REPORT_PROVISIONING_FAILED` | Records failure reason |
| `ACTIVATE_INSTANCE` | PROVISIONING > ACTIVE |
| `SUSPEND_FOR_NON_PAYMENT` | ACTIVE > SUSPENDED (amount, daysPastDue) |
| `SUSPEND_FOR_MAINTENANCE` | ACTIVE > SUSPENDED (duration, type) |
| `RESUME_AFTER_PAYMENT` / `RESUME_AFTER_MAINTENANCE` | SUSPENDED > ACTIVE |
| `TERMINATE_INSTANCE` | Any > TERMINATED (final) |

---

## Resource Instance: Team Actions

The team manages **configuration and profile** on the same document:

| Action | Effect |
|---|---|
| `UPDATE_INSTANCE_INFO` | Change name, description, thumbnail, info link |
| `SET_RESOURCE_PROFILE` | Switch the profile document reference |
| `SET_INSTANCE_FACET` | Add a configuration facet (e.g. "Jurisdiction: Swiss") |
| `UPDATE_INSTANCE_FACET` | Change a facet's selected option |
| `REMOVE_INSTANCE_FACET` | Remove a configuration facet |
| `APPLY_CONFIGURATION_CHANGES` | Batch add/update/remove facets in one dispatch |

The team **cannot** change lifecycle status --- only the operator controls provisioning, suspension, and termination.

---

## Subscription Instance: Operator Actions

Tracks the **commercial side** --- is the contract active and paid?

```
PENDING --> ACTIVE <-> PAUSED --> ACTIVE
                   --> EXPIRING --> ACTIVE (renewed)
                               --> CANCELLED
```

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
| `APPROVE_REQUEST` / `REJECT_REQUEST` | Responds to team requests |

---

## Subscription Instance: Team Actions

The team manages **profile, usage, preferences, and change requests**:

| Action | Effect |
|---|---|
| `SET_AUTO_RENEW` | Toggle auto-renewal on/off |
| `UPDATE_CUSTOMER_INFO` | Update name, email, customer ID |
| `SET_CUSTOMER_TYPE` | Set type: INDIVIDUAL or TEAM |
| `UPDATE_TEAM_MEMBER_COUNT` | Report current team member count |
| `INCREMENT_METRIC_USAGE` | Report usage increase (e.g. +1 contributor) |
| `DECREMENT_METRIC_USAGE` | Report usage decrease |
| `SET_FACET_SELECTION` | Set subscription-level facet (e.g. region, compliance) |
| `ADD_SELECTED_OPTION_GROUP` | Select an add-on group |
| `CREATE_CLIENT_REQUEST` | Request a change (e.g. remove add-on, upgrade tier) |

The team **cannot** change lifecycle status or modify billing --- only the operator controls those.

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

Steady State Operations

---

## Operator Capabilities

Via their connect drive, the operator manages both documents:

### SubscriptionInstance (8 modules, 46 operations)
- **Lifecycle**: activate, pause, resume, expire, renew, cancel
- **Billing**: report setup/recurring payments, update projections
- **Services**: add/remove services and groups, update costs
- **Metrics**: define metrics, update limits, track overages
- **Requests**: approve or reject team change requests
- **Admin**: budget categories, operator notes, tier info, target audience

### ResourceInstance (2 modules, 16 operations)
- **Lifecycle**: confirm, provision, activate, suspend, resume, terminate
- **Configuration**: manage facets, apply batch changes

---

## Team Capabilities

Via their connect drive, the team dispatches on the **same synced documents**:

### SubscriptionInstance
- **Self-service**: toggle auto-renew, update contact info, set customer type
- **Usage**: increment/decrement metrics, report team member count
- **Configuration**: set facet selections, add/remove option groups
- **Requests**: submit change requests (operator approves/rejects)
- **Read-only**: view tier, services, billing, costs

### ResourceInstance
- **Configuration**: set/update/remove facets, batch apply changes
- **Profile**: update name, description, links, profile reference
- **Read-only**: view provisioning and suspension status

---

<!-- _class: lead -->

# Achra Summary Mapping

Achra Summary > Documents

---

## Header & Tier

| Screenshot Element | Subscription Instance | Resource Instance |
|---|---|---|
| "Operational Hub for Open Source Builders" | `resource.label` | `name` |
| Icon / thumbnail | `resource.thumbnailUrl` | `thumbnailUrl` |
| "$450/mo" total | `projectedBillAmount` | --- |
| "+ $3,000 Setup" | sum of `setupCost.amount` | --- |
| **Tier: "Basic"** | `tierName` | --- |
| **$200/mo** | `tierPrice` + `tierCurrency` | --- |

### Achra submit form

| Field | Maps to |
|---|---|
| Name: "apeiron" | SubscriptionInstance `customerName` |
| Team Name: "BAI team" | Team connect drive name |
| Email: "apeiron@powerhouse.inc" | SubscriptionInstance `customerEmail` |

---

## Services

| Screenshot Element | Field |
|---|---|
| Needs Analysis > "~" | `services[].customValue: "~"` |
| Incorporation Docs | `services[].name` |
| "Swiss Association" badge | `services[].facetSelections[].selectedOption` |
| "$3,000" + "One-time fee" | `services[].setupCost: { amount: 3000 }` |
| Contributor Contracting > "UP TO 3" | `services[].customValue` |
| Tax Administration > checkmark | `services[].customValue: "INCLUDED"` |
| Dedicated Account Manager > "---" | `services[].customValue: "---"` |

Every `customValue` string originates from the **ServiceLevelBinding** resolution in Achra.

---

## Service Groups

| Screenshot Element | Field |
|---|---|
| "Finance Pack" | `serviceGroups[].name` |
| "+ $50/mo" | `serviceGroups[].recurringCost` or `selectedOptionGroups[].price` |
| Bank Account Setup | `serviceGroups[].services[].name` |
| "Swiss Association" on Bank Account | `serviceGroups[].services[].facetSelections[]` |
| Crypto Payment > "---" | `serviceGroups[].services[].customValue` |
| "Hosting Suite" | `serviceGroups[].name` |
| "+ $200/mo" | `serviceGroups[].recurringCost` or `selectedOptionGroups[].price` |
| Secure Email > "3 ACCOUNTS" | `serviceGroups[].services[].customValue` |
| Web Hosting > "BASIC" | `serviceGroups[].services[].customValue` |

---

<!-- _class: lead -->

# Key Takeaways

---



1. **Four document models** form the pipeline: Template > Offering > Achra > SubscriptionInstance + ResourceInstance

2. **Achra resolves** relational offering data into denormalized, self-contained snapshots --- the instances never reference the offering's internal structure

3. **Dual-drive topology** gives both operator and team real-time visibility into the same synced documents via connect

4. **Dual perspectives on shared documents**: operator controls lifecycle + billing; team controls configuration + usage reporting

5. **Request workflow**: teams submit change requests via `CREATE_CLIENT_REQUEST`; operators respond with `APPROVE_REQUEST` / `REJECT_REQUEST`

6. **Event sourcing** ensures a complete audit trail --- every operation from both parties is replayable and attributable
