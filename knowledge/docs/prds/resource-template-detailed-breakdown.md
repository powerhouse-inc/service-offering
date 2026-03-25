# Resource Template - Detailed Breakdown

## Document Model Schema

### State Structure (ResourceTemplateState)

```graphql
type ResourceTemplateState {
  # Identity & Metadata
  id: PHID!                           # Auto-generated unique identifier
  operatorId: PHID!                   # Operator managing this template
  title: String!                      # Product name (e.g., "Operational Hub for Open Source Builders")
  summary: String!                    # Brief tagline (e.g., "Your Legal Shield for Global, Decentralized Work")
  description: String                 # Detailed product description (optional)
  thumbnailUrl: URL                   # Product image URL (optional)
  infoLink: URL                       # External documentation link (optional)
  status: TemplateStatus!             # DRAFT | COMING_SOON | ACTIVE | DEPRECATED
  lastModified: DateTime!             # Timestamp of last change

  # Targeting
  targetAudiences: [TargetAudience!]! # Who this product is for
  facetTargets: [FacetTarget!]!       # Configuration dimensions (SNO Function, Legal Entity, etc.)

  # Services
  setupServices: [String!]!           # One-time setup services (simple strings)
  recurringServices: [String!]!       # Ongoing services (simple strings)
  services: [Service!]!               # Detailed service definitions with facet bindings
  optionGroups: [OptionGroup!]!       # Service groupings (Setup, Recurring, Add-ons)

  # Content
  faqFields: [FaqField!]!             # FAQ entries for product info page
}
```

### Supporting Types

```graphql
type TargetAudience {
  id: OID!
  label: String!                      # e.g., "Founders", "SNO Governors"
  color: String                       # Optional hex color for UI display
}

type FacetTarget {
  id: OID!
  categoryKey: String!                # e.g., "sno-function", "legal-entity"
  categoryLabel: String!              # e.g., "SNO Function", "Legal Entity"
  selectedOptions: [String!]!         # Selected values for this facet
}

type Service {
  id: OID!
  title: String!                      # Service name
  description: String                 # Service description
  displayOrder: Int                   # For sorting
  isSetupFormation: Boolean!          # true = setup service, false = recurring
  optionGroupId: OID                  # Which group this belongs to
  parentServiceId: OID                # For nested services
  facetBindings: [ResourceFacetBinding!]!  # Which facets apply to this service
}

type ResourceFacetBinding {
  id: OID!
  facetType: PHID!                    # Reference to Facet document
  facetName: String!                  # Facet name for display
  supportedOptions: [OID!]!           # Which facet options this service supports
}

type OptionGroup {
  id: OID!
  name: String!                       # Group name (e.g., "Finance Pack")
  description: String
  isAddOn: Boolean!                   # true = optional add-on, false = core group
  defaultSelected: Boolean!           # Pre-selected by default?
}

type FaqField {
  id: OID!
  question: String
  answer: String
}

enum TemplateStatus {
  DRAFT
  COMING_SOON
  ACTIVE
  DEPRECATED
}
```

---

## Available Operations

| Operation | Input Type | Purpose |
|-----------|------------|---------|
| `UPDATE_TEMPLATE_INFO` | `UpdateTemplateInfoInput` | Update title, summary, description, thumbnailUrl, infoLink |
| `UPDATE_TEMPLATE_STATUS` | `UpdateTemplateStatusInput` | Change status (DRAFT → ACTIVE, etc.) |
| `SET_TEMPLATE_ID` | `SetTemplateIdInput` | Set the template ID |
| `SET_OPERATOR` | `SetOperatorInput` | Set the operator ID |
| `ADD_TARGET_AUDIENCE` | `AddTargetAudienceInput` | Add a target audience tag |
| `REMOVE_TARGET_AUDIENCE` | `RemoveTargetAudienceInput` | Remove a target audience |
| `SET_FACET_TARGET` | `SetFacetTargetInput` | Add/update a facet category with options |
| `REMOVE_FACET_TARGET` | `RemoveFacetTargetInput` | Remove a facet category |
| `ADD_FACET_OPTION` | `AddFacetOptionInput` | Add an option to a facet category |
| `REMOVE_FACET_OPTION` | `RemoveFacetOptionInput` | Remove an option from a facet |
| `SET_SETUP_SERVICES` | `SetSetupServicesInput` | Set the list of setup services |
| `SET_RECURRING_SERVICES` | `SetRecurringServicesInput` | Set the list of recurring services |
| `ADD_SERVICE` | `AddServiceInput` | Add a detailed service |
| `UPDATE_SERVICE` | `UpdateServiceInput` | Update a service |
| `DELETE_SERVICE` | `DeleteServiceInput` | Remove a service |
| `ADD_FACET_BINDING` | `AddFacetBindingInput` | Link a service to facet options |
| `REMOVE_FACET_BINDING` | `RemoveFacetBindingInput` | Unlink a service from facet |
| `ADD_OPTION_GROUP` | `AddOptionGroupInput` | Create a service group |
| `UPDATE_OPTION_GROUP` | `UpdateOptionGroupInput` | Update a group |
| `DELETE_OPTION_GROUP` | `DeleteOptionGroupInput` | Remove a group |
| `ADD_FAQ` | `AddFaqInput` | Add an FAQ entry |
| `UPDATE_FAQ` | `UpdateFaqInput` | Update an FAQ |
| `DELETE_FAQ` | `DeleteFaqInput` | Remove an FAQ |

---

## Editor Step-by-Step Demo

### Step 1.1: Create New Resource Template Document

**Location**: Vetra (`ph vetra`)
**Action**: Create new document of type `powerhouse/resource-template`

The document is created with initial empty state:
```json
{
  "global": {
    "id": "",
    "operatorId": "",
    "title": "",
    "summary": "",
    "description": null,
    "thumbnailUrl": null,
    "infoLink": null,
    "status": "DRAFT",
    "lastModified": "2026-01-27T00:00:00.000Z",
    "targetAudiences": [],
    "facetTargets": [],
    "setupServices": [],
    "recurringServices": [],
    "services": [],
    "optionGroups": [],
    "faqFields": []
  }
}
```

---

### Step 1.2: Fill Basic Information

**UI Component**: `TemplateInfo.tsx` → Hero Section

**Fields to Fill**:
| Field | Value | UI Element |
|-------|-------|------------|
| Title | "Operational Hub for Open Source Builders" | Large text input |
| Summary | "Your Legal Shield for Global, Decentralized Work" | Textarea (2 rows) |
| Description | (Detailed markdown content) | Textarea (4 rows) |
| Thumbnail URL | `https://achra.com/images/oh-builders.png` | Small text input |
| Info Link | `https://docs.achra.com/oh-builders` | Text input |
| Status | DRAFT → ACTIVE | Dropdown selector |
| Operator ID | `operator-powerhouse-genesis` | Monospace text input |

**Operations Dispatched**:
```typescript
// When user blurs from title/summary/description fields
dispatch(updateTemplateInfo({
  title: "Operational Hub for Open Source Builders",
  summary: "Your Legal Shield for Global, Decentralized Work",
  description: "Full description here...",
  thumbnailUrl: "https://...",
  infoLink: "https://...",
  lastModified: new Date().toISOString()
}));

// When user changes status dropdown
dispatch(updateTemplateStatus({
  status: "ACTIVE",
  lastModified: new Date().toISOString()
}));

// When user blurs from operator ID field
dispatch(setOperator({
  operatorId: "operator-powerhouse-genesis",
  lastModified: new Date().toISOString()
}));
```

---

### Step 1.3: Add Target Audiences

**UI Component**: `TemplateInfo.tsx` → Audiences section

**Demo Data**:
| Audience | Color |
|----------|-------|
| Founders | `#0ea5e9` (Sky) |
| SNO Governors | `#10b981` (Emerald) |

**Operations Dispatched**:
```typescript
// Quick-add preset audience
dispatch(addTargetAudience({
  id: generateId(),  // e.g., "aud_abc123"
  label: "Founders",
  color: "#0ea5e9",
  lastModified: new Date().toISOString()
}));

dispatch(addTargetAudience({
  id: generateId(),
  label: "SNO Governors",
  color: "#10b981",
  lastModified: new Date().toISOString()
}));
```

**Resulting State**:
```json
{
  "targetAudiences": [
    { "id": "aud_abc123", "label": "Founders", "color": "#0ea5e9" },
    { "id": "aud_def456", "label": "SNO Governors", "color": "#10b981" }
  ]
}
```

---

### Step 1.4: Configure Facet Targets

**UI Component**: `FacetTargeting.tsx`

**Demo Data** - 4 Recommended Facets:

| Facet | Key | Options |
|-------|-----|---------|
| SNO Function | `sno-function` | "Operational Hub for Open Source Builders" |
| Legal Entity | `legal-entity` | "Swiss Association" |
| Team | `team` | "Remote" |
| Anonymity | `anonymity` | "High" |

**Operations Dispatched**:
```typescript
// Add SNO Function facet with option
dispatch(setFacetTarget({
  id: generateId(),
  categoryKey: "sno-function",
  categoryLabel: "SNO Function",
  selectedOptions: ["Operational Hub for Open Source Builders"],
  lastModified: new Date().toISOString()
}));

// Add Legal Entity facet
dispatch(setFacetTarget({
  id: generateId(),
  categoryKey: "legal-entity",
  categoryLabel: "Legal Entity",
  selectedOptions: ["Swiss Association"],
  lastModified: new Date().toISOString()
}));

// Add Team facet
dispatch(setFacetTarget({
  id: generateId(),
  categoryKey: "team",
  categoryLabel: "Team",
  selectedOptions: ["Remote"],
  lastModified: new Date().toISOString()
}));

// Add Anonymity facet
dispatch(setFacetTarget({
  id: generateId(),
  categoryKey: "anonymity",
  categoryLabel: "Anonymity",
  selectedOptions: ["High"],
  lastModified: new Date().toISOString()
}));
```

**Resulting State**:
```json
{
  "facetTargets": [
    {
      "id": "ft_001",
      "categoryKey": "sno-function",
      "categoryLabel": "SNO Function",
      "selectedOptions": ["Operational Hub for Open Source Builders"]
    },
    {
      "id": "ft_002",
      "categoryKey": "legal-entity",
      "categoryLabel": "Legal Entity",
      "selectedOptions": ["Swiss Association"]
    },
    {
      "id": "ft_003",
      "categoryKey": "team",
      "categoryLabel": "Team",
      "selectedOptions": ["Remote"]
    },
    {
      "id": "ft_004",
      "categoryKey": "anonymity",
      "categoryLabel": "Anonymity",
      "selectedOptions": ["High"]
    }
  ]
}
```

---

### Step 1.5: Add Setup Services

**UI Component**: `TemplateInfo.tsx` → Formation & Setup card

**Demo Data**:
- Swiss association entity
- Registered address (Zug)
- Legal document templates
- Needs Analysis
- Incorporation Docs

**Operations Dispatched**:
```typescript
// Set all setup services at once
dispatch(setSetupServices({
  services: [
    "Swiss association entity",
    "Registered address (Zug)",
    "Legal document templates",
    "Needs Analysis",
    "Incorporation Docs"
  ],
  lastModified: new Date().toISOString()
}));
```

**Resulting State**:
```json
{
  "setupServices": [
    "Swiss association entity",
    "Registered address (Zug)",
    "Legal document templates",
    "Needs Analysis",
    "Incorporation Docs"
  ]
}
```

---

### Step 1.6: Add Recurring Services

**UI Component**: `TemplateInfo.tsx` → Recurring Services card

**Demo Data**:
- Invoice management
- Annual tax filing
- Monthly accounting & close
- Contributor operations
- Dedicated account manager

**Operations Dispatched**:
```typescript
dispatch(setRecurringServices({
  services: [
    "Invoice management",
    "Annual tax filing",
    "Monthly accounting & close",
    "Contributor operations",
    "Dedicated account manager"
  ],
  lastModified: new Date().toISOString()
}));
```

---

### Step 1.7: Add FAQ Entries

**UI Component**: `TemplateInfo.tsx` → FAQ Section

**Demo Data**:

| # | Question | Answer |
|---|----------|--------|
| 1 | "Working Without a Legal Wrapper Puts You at Risk" | "As a builder contributing to decentralized protocols, you face significant legal and financial risks when operating without a formal legal structure..." |
| 2 | "Why Establishing Your Own Operational Hub Is the Most Rational Next Step?" | "An Operational Hub provides you with a legal shield that protects your personal assets while enabling compliant global operations..." |

**Operations Dispatched**:
```typescript
dispatch(addFaq({
  id: generateId(),
  question: "Working Without a Legal Wrapper Puts You at Risk",
  answer: "As a builder contributing to decentralized protocols...",
  lastModified: new Date().toISOString()
}));

dispatch(addFaq({
  id: generateId(),
  question: "Why Establishing Your Own Operational Hub Is the Most Rational Next Step?",
  answer: "An Operational Hub provides you with a legal shield...",
  lastModified: new Date().toISOString()
}));
```

**Resulting State**:
```json
{
  "faqFields": [
    {
      "id": "faq_001",
      "question": "Working Without a Legal Wrapper Puts You at Risk",
      "answer": "As a builder contributing to decentralized protocols..."
    },
    {
      "id": "faq_002",
      "question": "Why Establishing Your Own Operational Hub Is the Most Rational Next Step?",
      "answer": "An Operational Hub provides you with a legal shield..."
    }
  ]
}
```

---

### Step 1.8: Set Status to ACTIVE

**UI Component**: `TemplateInfo.tsx` → Status dropdown

**Operation**:
```typescript
dispatch(updateTemplateStatus({
  status: "ACTIVE",
  lastModified: new Date().toISOString()
}));
```

---

## Complete Final State

```json
{
  "global": {
    "id": "phd_resourcetemplate_abc123",
    "operatorId": "operator-powerhouse-genesis",
    "title": "Operational Hub for Open Source Builders",
    "summary": "Your Legal Shield for Global, Decentralized Work",
    "description": "Full detailed description...",
    "thumbnailUrl": "https://achra.com/images/oh-builders.png",
    "infoLink": "https://docs.achra.com/oh-builders",
    "status": "ACTIVE",
    "lastModified": "2026-01-27T10:30:00.000Z",
    "targetAudiences": [
      { "id": "aud_001", "label": "Founders", "color": "#0ea5e9" },
      { "id": "aud_002", "label": "SNO Governors", "color": "#10b981" }
    ],
    "facetTargets": [
      {
        "id": "ft_001",
        "categoryKey": "sno-function",
        "categoryLabel": "SNO Function",
        "selectedOptions": ["Operational Hub for Open Source Builders"]
      },
      {
        "id": "ft_002",
        "categoryKey": "legal-entity",
        "categoryLabel": "Legal Entity",
        "selectedOptions": ["Swiss Association"]
      },
      {
        "id": "ft_003",
        "categoryKey": "team",
        "categoryLabel": "Team",
        "selectedOptions": ["Remote"]
      },
      {
        "id": "ft_004",
        "categoryKey": "anonymity",
        "categoryLabel": "Anonymity",
        "selectedOptions": ["High"]
      }
    ],
    "setupServices": [
      "Swiss association entity",
      "Registered address (Zug)",
      "Legal document templates",
      "Needs Analysis",
      "Incorporation Docs"
    ],
    "recurringServices": [
      "Invoice management",
      "Annual tax filing",
      "Monthly accounting & close",
      "Contributor operations",
      "Dedicated account manager"
    ],
    "services": [],
    "optionGroups": [],
    "faqFields": [
      {
        "id": "faq_001",
        "question": "Working Without a Legal Wrapper Puts You at Risk",
        "answer": "As a builder contributing to decentralized protocols..."
      },
      {
        "id": "faq_002",
        "question": "Why Establishing Your Own Operational Hub Is the Most Rational Next Step?",
        "answer": "An Operational Hub provides you with a legal shield..."
      }
    ]
  }
}
```

---

## Switchboard GraphQL Queries

### Query 1: List All Active Resource Templates

**Use Case**: Admin dashboard, template selector in Service Offering editor

```graphql
query ResourceTemplates($status: TemplateStatus) {
  resourceTemplates(filter: { status: $status }) {
    id
    title
    summary
    thumbnailUrl
    status
    lastModified
    operatorId
    targetAudiences {
      id
      label
      color
    }
  }
}
```

**Variables**:
```json
{
  "status": "ACTIVE"
}
```

**Example Response**:
```json
{
  "data": {
    "resourceTemplates": [
      {
        "id": "phd_resourcetemplate_abc123",
        "title": "Operational Hub for Open Source Builders",
        "summary": "Your Legal Shield for Global, Decentralized Work",
        "thumbnailUrl": "https://achra.com/images/oh-builders.png",
        "status": "ACTIVE",
        "lastModified": "2026-01-27T10:30:00.000Z",
        "operatorId": "operator-powerhouse-genesis",
        "targetAudiences": [
          { "id": "aud_001", "label": "Founders", "color": "#0ea5e9" },
          { "id": "aud_002", "label": "SNO Governors", "color": "#10b981" }
        ]
      }
    ]
  }
}
```

---

### Query 2: Get Full Resource Template Detail

**Use Case**: Service Offering editor (to inherit template data), Product Info page

```graphql
query ResourceTemplateDetail($id: PHID!) {
  resourceTemplate(id: $id) {
    id
    operatorId
    title
    summary
    description
    thumbnailUrl
    infoLink
    status
    lastModified

    targetAudiences {
      id
      label
      color
    }

    facetTargets {
      id
      categoryKey
      categoryLabel
      selectedOptions
    }

    setupServices
    recurringServices

    services {
      id
      title
      description
      displayOrder
      isSetupFormation
      optionGroupId
      parentServiceId
      facetBindings {
        id
        facetType
        facetName
        supportedOptions
      }
    }

    optionGroups {
      id
      name
      description
      isAddOn
      defaultSelected
    }

    faqFields {
      id
      question
      answer
    }
  }
}
```

**Variables**:
```json
{
  "id": "phd_resourcetemplate_abc123"
}
```

**Example Response**:
```json
{
  "data": {
    "resourceTemplate": {
      "id": "phd_resourcetemplate_abc123",
      "operatorId": "operator-powerhouse-genesis",
      "title": "Operational Hub for Open Source Builders",
      "summary": "Your Legal Shield for Global, Decentralized Work",
      "description": "Full detailed description of the operational hub...",
      "thumbnailUrl": "https://achra.com/images/oh-builders.png",
      "infoLink": "https://docs.achra.com/oh-builders",
      "status": "ACTIVE",
      "lastModified": "2026-01-27T10:30:00.000Z",
      "targetAudiences": [
        { "id": "aud_001", "label": "Founders", "color": "#0ea5e9" },
        { "id": "aud_002", "label": "SNO Governors", "color": "#10b981" }
      ],
      "facetTargets": [
        {
          "id": "ft_001",
          "categoryKey": "sno-function",
          "categoryLabel": "SNO Function",
          "selectedOptions": ["Operational Hub for Open Source Builders"]
        },
        {
          "id": "ft_002",
          "categoryKey": "legal-entity",
          "categoryLabel": "Legal Entity",
          "selectedOptions": ["Swiss Association"]
        },
        {
          "id": "ft_003",
          "categoryKey": "team",
          "categoryLabel": "Team",
          "selectedOptions": ["Remote"]
        },
        {
          "id": "ft_004",
          "categoryKey": "anonymity",
          "categoryLabel": "Anonymity",
          "selectedOptions": ["High"]
        }
      ],
      "setupServices": [
        "Swiss association entity",
        "Registered address (Zug)",
        "Legal document templates",
        "Needs Analysis",
        "Incorporation Docs"
      ],
      "recurringServices": [
        "Invoice management",
        "Annual tax filing",
        "Monthly accounting & close",
        "Contributor operations",
        "Dedicated account manager"
      ],
      "services": [],
      "optionGroups": [],
      "faqFields": [
        {
          "id": "faq_001",
          "question": "Working Without a Legal Wrapper Puts You at Risk",
          "answer": "As a builder contributing to decentralized protocols..."
        },
        {
          "id": "faq_002",
          "question": "Why Establishing Your Own Operational Hub Is the Most Rational Next Step?",
          "answer": "An Operational Hub provides you with a legal shield..."
        }
      ]
    }
  }
}
```

---

### Query 3: Resource Templates for Product Listing (Minimal)

**Use Case**: ACHRA Services page grid cards

```graphql
query ResourceTemplateCards {
  resourceTemplates(filter: { status: ACTIVE }) {
    id
    title
    summary
    thumbnailUrl
    targetAudiences {
      label
      color
    }
    setupServices
    recurringServices
  }
}
```

**Example Response**:
```json
{
  "data": {
    "resourceTemplates": [
      {
        "id": "phd_resourcetemplate_abc123",
        "title": "Operational Hub for Open Source Builders",
        "summary": "Your Legal Shield for Global, Decentralized Work",
        "thumbnailUrl": "https://achra.com/images/oh-builders.png",
        "targetAudiences": [
          { "label": "Founders", "color": "#0ea5e9" },
          { "label": "SNO Governors", "color": "#10b981" }
        ],
        "setupServices": [
          "Swiss association entity",
          "Registered address (Zug)",
          "Legal document templates"
        ],
        "recurringServices": [
          "Invoice management",
          "Annual tax filing",
          "Monthly accounting & close"
        ]
      }
    ]
  }
}
```

---

### Query 4: Resource Template for Service Offering Inheritance

**Use Case**: Service Offering editor - selecting a template to base the offering on

```graphql
query ResourceTemplateForOffering($id: PHID!) {
  resourceTemplate(id: $id) {
    id
    title
    summary
    description
    targetAudiences {
      id
      label
      color
    }
    facetTargets {
      id
      categoryKey
      categoryLabel
      selectedOptions
    }
    setupServices
    recurringServices
    services {
      id
      title
      description
      displayOrder
      isSetupFormation
      optionGroupId
      facetBindings {
        id
        facetType
        facetName
        supportedOptions
      }
    }
    optionGroups {
      id
      name
      description
      isAddOn
      defaultSelected
    }
    faqFields {
      id
      question
      answer
    }
  }
}
```

---

## Work Breakdown - Resource Template Editor Tasks

### Task RT-001: Verify Basic Info Fields
**Points**: 2 | **Priority**: P0

**Acceptance Criteria**:
- [ ] Title field updates on blur
- [ ] Summary field updates on blur
- [ ] Description field updates on blur
- [ ] Thumbnail URL field updates on blur and shows preview
- [ ] Info Link field updates on blur
- [ ] All fields persist to document state

---

### Task RT-002: Verify Status Workflow
**Points**: 2 | **Priority**: P0

**Acceptance Criteria**:
- [ ] Status dropdown shows all 4 options
- [ ] Selecting status immediately dispatches update
- [ ] Status badge color matches selection (emerald=Active, sky=Coming Soon, etc.)
- [ ] Status persists to document state

---

### Task RT-003: Verify Target Audience Management
**Points**: 3 | **Priority**: P0

**Acceptance Criteria**:
- [ ] Can add custom audience with "Add Audience" button
- [ ] Can quick-add preset audiences (Builders, Networks)
- [ ] Can remove audience with X button
- [ ] Audience tags display with correct colors
- [ ] Changes persist to document state

---

### Task RT-004: Verify Facet Targeting
**Points**: 5 | **Priority**: P0

**Acceptance Criteria**:
- [ ] Progress bar shows completion percentage
- [ ] Can add facet from preset cards
- [ ] Can add custom facet category
- [ ] Can add options to facet (quick-add or custom)
- [ ] Can remove facet options
- [ ] Can remove entire facet category (with confirmation)
- [ ] Changes persist to document state

---

### Task RT-005: Verify Setup Services Management
**Points**: 2 | **Priority**: P0

**Acceptance Criteria**:
- [ ] Can add service with text input + Enter
- [ ] Can quick-add from template panel
- [ ] Can remove service with X button
- [ ] Service list displays correctly
- [ ] Changes persist to document state

---

### Task RT-006: Verify Recurring Services Management
**Points**: 2 | **Priority**: P0

**Acceptance Criteria**:
- [ ] Can add service with text input + Enter
- [ ] Can quick-add from template panel
- [ ] Can remove service with X button
- [ ] Service list displays correctly
- [ ] Changes persist to document state

---

### Task RT-007: Verify FAQ Management
**Points**: 3 | **Priority**: P1

**Acceptance Criteria**:
- [ ] Can add FAQ with question + answer fields
- [ ] Can edit existing FAQ (inline edit mode)
- [ ] Can delete FAQ with confirmation
- [ ] FAQ displays with numbered badges
- [ ] Changes persist to document state

---

### Task RT-008: Verify Operator ID Field
**Points**: 1 | **Priority**: P1

**Acceptance Criteria**:
- [ ] Operator ID field accepts PHID format
- [ ] Field updates on blur
- [ ] Displays in monospace font
- [ ] Persists to document state

---

### Task RT-009: End-to-End Demo Test
**Points**: 3 | **Priority**: P0

**Acceptance Criteria**:
- [ ] Create new Resource Template document
- [ ] Fill all fields per demo script
- [ ] Verify final state matches expected JSON
- [ ] Verify document can be queried via Switchboard
- [ ] TypeScript check passes (`npm run tsc`)
- [ ] ESLint check passes (`npm run lint:fix`)

---

## Summary

| Task | Points | Priority |
|------|--------|----------|
| RT-001: Basic Info Fields | 2 | P0 |
| RT-002: Status Workflow | 2 | P0 |
| RT-003: Target Audiences | 3 | P0 |
| RT-004: Facet Targeting | 5 | P0 |
| RT-005: Setup Services | 2 | P0 |
| RT-006: Recurring Services | 2 | P0 |
| RT-007: FAQ Management | 3 | P1 |
| RT-008: Operator ID | 1 | P1 |
| RT-009: E2E Demo Test | 3 | P0 |
| **Total** | **23** | |

---

**Document Version**: 1.0
**Created**: 2026-01-27
