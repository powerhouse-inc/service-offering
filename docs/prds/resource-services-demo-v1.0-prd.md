# Resource Services Demo - Product Requirements Document (PRD)

> **Generated using**: Requirements Clarity, Frontend-to-Backend Requirements, Agile Product Owner skills

---

## Requirements Description

### Background
- **Business Problem**: Demonstrate the complete end-to-end flow of how Resource Templates are created, commercialized into Service Offerings, displayed on the ACHRA services marketplace, and purchased by customers through a 5-step purchase wizard.
- **Target Users**:
  - **Operators/Admins**: Create and manage Resource Templates and Service Offerings via Powerhouse editors
  - **Customers**: Browse, configure, and purchase services on the ACHRA marketplace
- **Value Proposition**: Unified demo showcasing the full product lifecycle from creation to purchase, demonstrating the Powerhouse document model ecosystem integrated with the Switchboard API and ACHRA frontend.

### Feature Overview
- **Core Features**:
  1. Resource Template creation (editor flow)
  2. Service Offering creation with pricing tiers (editor flow)
  3. Switchboard API querying for marketplace display
  4. ACHRA Services listing page
  5. Product Info page (OH Resource Profile)
  6. 5-step Purchase Flow
  7. Service Subscription creation (purchase completion)

- **Feature Boundaries**:
  - IN SCOPE: Full demo flow, editor UI, marketplace UI, purchase wizard
  - OUT OF SCOPE: Payment processing, actual legal document generation, email notifications

- **User Scenarios**:
  1. Operator creates "Operational Hub for Open Source Builders" Resource Template
  2. Operator creates Service Offering with Basic/Team/Premium/Enterprise tiers
  3. Customer browses ACHRA services, finds the offering
  4. Customer views product info, initiates purchase
  5. Customer completes 5-step wizard and submits request

---

## 7-Step Demo Flow

### Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           OPERATOR/ADMIN FLOW (Editor)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STEP 1                          STEP 2                                         │
│  ┌─────────────────┐            ┌─────────────────────────────────────┐        │
│  │ Resource        │            │ Service Offering Editor             │        │
│  │ Template Editor │──creates──▶│ ├─ Select Resource Template         │        │
│  │                 │            │ ├─ Define Pricing Tiers             │        │
│  │ • Title/Summary │            │ ├─ Configure Service Matrix         │        │
│  │ • Services      │            │ └─ Set Usage Limits                 │        │
│  │ • Facets        │            └─────────────────────────────────────┘        │
│  │ • FAQ           │                         │                                  │
│  └─────────────────┘                         │                                  │
│                                              ▼                                  │
│                                    ┌─────────────────┐                         │
│                                    │   Switchboard   │                         │
│                                    │   (GraphQL API) │                         │
│                                    └────────┬────────┘                         │
└─────────────────────────────────────────────┼───────────────────────────────────┘
                                              │
┌─────────────────────────────────────────────┼───────────────────────────────────┐
│                           CUSTOMER FLOW (ACHRA Marketplace)                     │
├─────────────────────────────────────────────┼───────────────────────────────────┤
│                                             ▼                                   │
│  STEP 3                          STEP 4                                         │
│  ┌─────────────────┐            ┌─────────────────┐                            │
│  │ ACHRA Services  │            │ Product Info    │                            │
│  │ Listing Page    │──click────▶│ (OH Resource    │                            │
│  │                 │  "More     │  Profile Page)  │                            │
│  │ • Grid of       │   Info"    │                 │                            │
│  │   offerings     │            │ • Full details  │                            │
│  │ • Filters       │            │ • FAQ sections  │                            │
│  │ • Search        │            │ • "Purchase"    │                            │
│  └─────────────────┘            └────────┬────────┘                            │
│                                          │ click                                │
│                                          │ "Select an Operator"                 │
│                                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    5-STEP PURCHASE WIZARD (Steps 5-7)                    │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │  STEP 5              STEP 6              STEP 7                          │  │
│  │  ┌────────────┐     ┌────────────┐     ┌──────────────────────────────┐  │  │
│  │  │ Select an  │     │ Select     │     │ Summary → Confirmation       │  │  │
│  │  │ Operator   │────▶│ Services   │────▶│                              │  │  │
│  │  │            │     │            │     │ • Review config              │  │  │
│  │  │ • Operator │     │ • Tier     │     │ • Enter contact info         │  │  │
│  │  │   cards    │     │   selector │     │ • Submit request             │  │  │
│  │  │ • Compare  │     │ • Service  │     │ • Receive confirmation       │  │  │
│  │  │   options  │     │   matrix   │     │                              │  │  │
│  │  └────────────┘     │ • Add-ons  │     │ Creates: Service Subscription│  │  │
│  │                     └────────────┘     └──────────────────────────────┘  │  │
│  │                                                                          │  │
│  │  Timeline: ○ Product Info → ● Select Operator → ○ Services → ○ Summary → ○ Confirm  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Demo Script

### Step 1: Create Resource Template (Editor)

**Actor**: Operator/Admin
**Location**: Powerhouse Vetra Editor
**Duration**: ~5 minutes

**Demo Actions**:
1. Open Vetra (`ph vetra`)
2. Create new Resource Template document
3. Fill in basic info:
   - Title: "Operational Hub for Open Source Builders"
   - Summary: "Your Legal Shield for Global, Decentralized Work"
   - Target Audiences: Founders, SNO Governors
4. Add Services:
   - **Setup Services**: Legal Setup, Needs Analysis, Incorporation Docs
   - **Recurring Services**: Contractor Controls, Tax Administration, Account Management
5. Configure Facet Targets:
   - SNO Function: Operational Hub
   - Legal Entity: Swiss Association
   - Team Structure: Remote Team
   - Anonymity Level: High (Standard)
6. Add FAQ items:
   - "Working Without a Legal Wrapper Puts You at Risk"
   - "Why Establishing Your Own Operational Hub Is the Most Rational Next Step?"
7. Set Status: ACTIVE

**Output**: Resource Template document saved to drive

---

### Step 2: Create Service Offering with Pricing (Editor)

**Actor**: Operator/Admin
**Location**: Powerhouse Vetra Editor
**Duration**: ~10 minutes

**Demo Actions**:
1. Create new Service Offering document
2. **Tab 1: Scope & Facets**
   - Select the Resource Template created in Step 1
   - Confirm inherited facets and audiences
3. **Tab 2: Service Catalog**
   - Review inherited services
   - Optionally add offering-specific services
4. **Tab 3: Tier Definition**
   - Create 4 tiers:
     | Tier | Monthly Price | Setup Fee |
     |------|---------------|-----------|
     | Basic | $200/mo | $3,000 |
     | Team | $300/mo | $3,000 |
     | Premium | $500/mo | $3,000 |
     | Enterprise | Custom | Custom |
5. **Tab 4: The Matrix**
   - Configure service levels per tier:
     | Service | Basic | Team | Premium | Enterprise |
     |---------|-------|------|---------|------------|
     | Legal Setup | ✓ | ✓ | ✓ | ✓ |
     | Contractor Controls | Up to 3 | Up to 6 | Up to 10 | >10 |
     | Dedicated Manager | - | - | ✓ | ✓ |
   - Set usage limits for metered services
6. Configure optional add-ons:
   - Finance Pack ($0-300/mo depending on tier)
   - Hosting Suite ($0-300/mo depending on tier)
7. Set Status: ACTIVE

**Output**: Service Offering document with full pricing matrix

---

### Step 3: Browse ACHRA Services Page

**Actor**: Customer
**Location**: https://achra.com/services
**Duration**: ~2 minutes

**Demo Actions**:
1. Navigate to ACHRA Services page
2. **Data Source**: Page queries Switchboard GraphQL API for Service Offerings
3. View service offerings grid:
   - Card shows: Title, Summary, Thumbnail, Starting Price
   - Filter by: Category, Price Range, Features
4. Locate "Operational Hub for Open Source Builders" card
5. Click "More Info" to view details

**Data Flow**:
```graphql
query ServiceOfferings {
  serviceOfferings(status: ACTIVE) {
    id
    title
    summary
    thumbnailUrl
    tiers {
      name
      pricing { recurringPrice }
    }
    targetAudiences { label }
  }
}
```

---

### Step 4: View Product Info Page (OH Resource Profile)

**Actor**: Customer
**Location**: https://achra.com/services/sno-embryonic-hub-465c4
**Duration**: ~3 minutes

**Demo Actions**:
1. Page loads full product details from Switchboard
2. **Data Source**: Queries Service Offering + linked Resource Template
3. View page sections:
   - Hero: Title, Subtitle, Value Proposition
   - Description (from Resource Template)
   - Target Audiences
   - FAQ Accordions (expandable)
4. **Timeline NOT visible** (not in purchase flow yet)
5. Primary CTA: "Select an Operator" button at bottom
6. Click CTA to initiate purchase flow

**Data Flow**:
```graphql
query ServiceOfferingDetail($id: PHID!) {
  serviceOffering(id: $id) {
    title
    summary
    description
    thumbnailUrl
    targetAudiences { id label }
    resourceTemplate {
      faqFields { question answer }
      description
    }
    tiers { ... }
  }
}
```

---

### Step 5: Select an Operator (Purchase Step 2)

**Actor**: Customer
**Location**: Same URL, purchase wizard overlay
**Duration**: ~2 minutes

**Demo Actions**:
1. **Timeline NOW visible**: "Step 2 of 5" indicator
2. View available operators for this offering:
   - Accountable OPC (Active Since Jul 2022, Setup: 7 days, From $500/mo)
   - Powerhouse Genesis OH (Active Since Jul 2022, Setup: 7 days, From $600/mo)
3. Compare operator cards:
   - Description
   - Pricing
   - Reputation indicators
4. Click "Select Services" on preferred operator
5. **Back button**: Returns to Step 1 (Product Info) with timeline visible

**State Management**:
```typescript
interface PurchaseFlowState {
  isActive: true;
  currentStep: 2;
  selectedOperatorId: null;
}
```

---

### Step 6: Configure Services (Purchase Step 3)

**Actor**: Customer
**Location**: Purchase wizard
**Duration**: ~5 minutes

**Demo Actions**:
1. **Timeline**: "Step 3 of 5"
2. View operator header:
   - SNO Function: Operational Hub
   - Legal Entity: Swiss Association
   - Team Structure: Remote Team
   - Anonymity Level: High (Standard)
3. **Tier Selection**:
   - View 4 tier options with prices
   - Select "Team" tier ($300/mo)
4. **Service Catalog Matrix**:
   - View what's included per tier
   - See checkmarks, limits, and "Custom" indicators
5. **Optional Add-ons**:
   - Toggle ON: Hosting Suite (+$300/mo for Team tier)
   - Toggle OFF: Finance Pack
6. View running totals:
   - Setup: $3,000 (flat fee)
   - Recurring: $300 + $300 = $600/mo
7. Click "Continue"

**State Management**:
```typescript
{
  selectedOperatorId: "powerhouse-genesis",
  selectedTierId: "team",
  selectedAddons: ["hosting-suite"],
  pricing: {
    setupFee: 3000,
    recurringTotal: 600
  }
}
```

---

### Step 7: Summary & Confirmation (Purchase Steps 4-5)

**Actor**: Customer
**Location**: Purchase wizard
**Duration**: ~3 minutes

**Demo Actions - Summary (Step 4)**:
1. **Timeline**: "Step 4 of 5"
2. Review configuration summary:
   - Operator: Powerhouse Genesis OH
   - Resource: Operational Hub for Open Source Builders
   - Configuration: Swiss Association, Remote Team, High Anonymity
   - Tier: Team
   - Services breakdown with pricing
3. Enter contact information:
   - Name: Alex
   - Email: alex@dao.xyz
4. Optional: Click "Share Configuration" → generates shareable URL
5. Click "Submit Request" (requires login)
6. If not logged in → redirect to login → return to Step 4

**Demo Actions - Confirmation (Step 5)**:
1. **Timeline**: "Step 5 of 5"
2. Success message: "Request Successfully Sent!"
3. Personalized: "Thank you Alex!"
4. Email confirmation: "We have emailed the summary to alex@dao.xyz"
5. Next steps: "We will contact you shortly to schedule an introduction meeting"
6. CTA: "Explore ACHRA"

**Backend Action**: Creates Service Subscription document
```typescript
// Service Subscription created with:
{
  serviceOfferingId: "offering-123",
  resourceTemplateId: "template-456",
  operatorId: "powerhouse-genesis",
  selectedTierId: "team",
  selectedAddons: [{ id: "hosting-suite", pricingOptionId: "team-hosting" }],
  facetSelections: [...],
  pricing: {
    setupFee: 3000,
    recurringPrice: 600,
    billingCycle: "MONTHLY"
  },
  customerInfo: {
    name: "Alex",
    email: "alex@dao.xyz"
  },
  status: "PENDING_REVIEW"
}
```

---

## Backend Requirements (Frontend Perspective)

### Data I Need to Display

#### ACHRA Services Listing (Step 3)
- List of active Service Offerings with:
  - Basic info (title, summary, thumbnail)
  - Starting price (lowest tier)
  - Target audience tags
  - Category/filter dimensions

#### Product Info Page (Step 4)
- Full Service Offering details
- Linked Resource Template content (description, FAQ)
- All tiers with pricing (for comparison)

#### Operator Selection (Step 5)
- List of operators serving this offering
- Operator metadata (active since, setup time, base pricing)
- Operator reputation/trust indicators

#### Service Configuration (Step 6)
- Full pricing matrix by tier
- Service catalog with tier-specific levels
- Optional add-ons with tier-specific pricing
- Real-time subtotal calculation

#### Summary (Step 7)
- Aggregated configuration for review
- User authentication state
- Shareable URL generation endpoint

### Actions User Can Perform
- Browse/filter service offerings
- View offering details
- Select operator
- Select tier
- Toggle add-ons
- Submit purchase request
- Share configuration
- Navigate between steps

### States to Handle
- **Loading**: Fetching offerings, fetching offering detail, submitting request
- **Empty**: No offerings match filter
- **Error**: API failure, submission failure
- **Auth Required**: User must log in to submit

### Questions for Backend
- Should shared configuration URLs have an expiration?
- Is there an existing user authentication flow to integrate with?
- Should we support partial saves (draft subscriptions)?
- How should we handle Enterprise "Custom" pricing requests?

---

## Work Breakdown Structure (WBS)

### Epic 1: Resource Template Editor Enhancements

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| RT-001 | Verify Resource Template editor displays all required fields | 3 | P0 | None |
| RT-002 | Add FAQ management UI if not present | 5 | P1 | RT-001 |
| RT-003 | Add status workflow (DRAFT → ACTIVE) | 3 | P1 | RT-001 |
| RT-004 | Test Resource Template creation end-to-end | 2 | P0 | RT-001 |
| **Epic 1 Total** | | **13** | | |

---

### Epic 2: Service Offering Editor Enhancements

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| SO-001 | Verify Resource Template selection works correctly | 3 | P0 | RT-004 |
| SO-002 | Implement/verify tier definition UI | 5 | P0 | SO-001 |
| SO-003 | Implement/verify The Matrix service level configuration | 8 | P0 | SO-002 |
| SO-004 | Add usage limits configuration per tier | 5 | P1 | SO-003 |
| SO-005 | Add optional add-on pack configuration | 5 | P1 | SO-002 |
| SO-006 | Test Service Offering creation end-to-end | 3 | P0 | SO-003 |
| **Epic 2 Total** | | **29** | | |

---

### Epic 3: Switchboard API Integration

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| SB-001 | Define GraphQL schema for Service Offering queries | 5 | P0 | SO-006 |
| SB-002 | Implement serviceOfferings list query with filters | 5 | P0 | SB-001 |
| SB-003 | Implement serviceOffering detail query with nested data | 5 | P0 | SB-001 |
| SB-004 | Implement operators list query (for Step 5) | 3 | P0 | SB-001 |
| SB-005 | Test API responses match frontend data needs | 3 | P0 | SB-004 |
| **Epic 3 Total** | | **21** | | |

---

### Epic 4: ACHRA Services Listing Page

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| AC-001 | Design services listing page layout | 3 | P0 | None |
| AC-002 | Implement service offering cards component | 5 | P0 | SB-002 |
| AC-003 | Implement filter/search functionality | 5 | P1 | AC-002 |
| AC-004 | Implement "More Info" navigation to detail page | 2 | P0 | AC-002 |
| AC-005 | Add loading states and error handling | 3 | P1 | AC-002 |
| **Epic 4 Total** | | **18** | | |

---

### Epic 5: Product Info Page (OH Resource Profile)

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| PI-001 | Design product info page layout | 3 | P0 | None |
| PI-002 | Implement hero section with offering details | 3 | P0 | SB-003 |
| PI-003 | Implement FAQ accordion component | 3 | P0 | PI-002 |
| PI-004 | Implement "Select an Operator" CTA | 2 | P0 | PI-002 |
| PI-005 | Implement conditional timeline visibility logic | 5 | P0 | PI-004 |
| PI-006 | Add responsive design for mobile | 3 | P1 | PI-005 |
| **Epic 5 Total** | | **19** | | |

---

### Epic 6: Purchase Flow - Steps 2-3 (Operator & Services)

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| PF-001 | Implement PurchaseFlowProvider context | 5 | P0 | PI-005 |
| PF-002 | Implement timeline component | 5 | P0 | PF-001 |
| PF-003 | Implement Step 2: Operator selection cards | 5 | P0 | SB-004, PF-001 |
| PF-004 | Implement Step 3: Tier selector | 5 | P0 | PF-003 |
| PF-005 | Implement Step 3: Service catalog matrix | 8 | P0 | PF-004 |
| PF-006 | Implement Step 3: Optional add-ons toggles | 5 | P0 | PF-004 |
| PF-007 | Implement real-time pricing calculation | 5 | P0 | PF-006 |
| PF-008 | Implement back navigation with state preservation | 3 | P0 | PF-003 |
| PF-009 | Implement operator change → service reset logic | 3 | P1 | PF-008 |
| **Epic 6 Total** | | **44** | | |

---

### Epic 7: Purchase Flow - Steps 4-5 (Summary & Confirmation)

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| SC-001 | Implement Step 4: Summary configuration display | 5 | P0 | PF-007 |
| SC-002 | Implement Step 4: Contact form (Name, Email) | 3 | P0 | SC-001 |
| SC-003 | Implement Step 4: Share Configuration URL generation | 5 | P1 | SC-001 |
| SC-004 | Implement authentication gate for submission | 5 | P0 | SC-002 |
| SC-005 | Implement Step 4: Submit Request action | 5 | P0 | SC-004 |
| SC-006 | Implement Step 5: Confirmation page | 3 | P0 | SC-005 |
| SC-007 | Implement Service Subscription document creation | 5 | P0 | SC-005 |
| SC-008 | Handle shared URL → Step 4 landing | 5 | P1 | SC-003 |
| **Epic 7 Total** | | **36** | | |

---

### Epic 8: Integration & Demo Polish

| ID | Task | Points | Priority | Dependencies |
|----|------|--------|----------|--------------|
| DM-001 | Create demo data (Resource Template + Service Offering) | 3 | P0 | SO-006 |
| DM-002 | End-to-end flow testing | 5 | P0 | SC-006 |
| DM-003 | Fix TypeScript/ESLint errors | 3 | P0 | DM-002 |
| DM-004 | Create demo script/walkthrough documentation | 3 | P1 | DM-002 |
| DM-005 | Record demo video (optional) | 5 | P2 | DM-004 |
| **Epic 8 Total** | | **19** | | |

---

## Summary

| Epic | Description | Points |
|------|-------------|--------|
| Epic 1 | Resource Template Editor | 13 |
| Epic 2 | Service Offering Editor | 29 |
| Epic 3 | Switchboard API | 21 |
| Epic 4 | Services Listing Page | 18 |
| Epic 5 | Product Info Page | 19 |
| Epic 6 | Purchase Flow Steps 2-3 | 44 |
| Epic 7 | Purchase Flow Steps 4-5 | 36 |
| Epic 8 | Integration & Demo | 19 |
| **Total** | | **199 points** |

---

## Sprint Planning Recommendation

Assuming 20-25 points per sprint (2-week sprints):

| Sprint | Epics | Points | Goal |
|--------|-------|--------|------|
| Sprint 1 | Epic 1 + Epic 2 (partial) | 24 | Editor foundation |
| Sprint 2 | Epic 2 (complete) + Epic 3 | 25 | Editors + API |
| Sprint 3 | Epic 4 + Epic 5 | 37 | Marketplace pages |
| Sprint 4 | Epic 6 | 44 | Purchase flow core |
| Sprint 5 | Epic 7 | 36 | Purchase completion |
| Sprint 6 | Epic 8 | 19 | Integration & demo |

**Total estimated duration**: 6 sprints (~12 weeks)

---

## Acceptance Criteria Summary

### Demo Completion Criteria
- [ ] Resource Template can be created and saved via editor
- [ ] Service Offering can be created with tiers and linked to template
- [ ] Switchboard API returns offering data correctly
- [ ] ACHRA Services page displays offerings from API
- [ ] Product Info page shows full offering details with FAQ
- [ ] 5-step purchase wizard navigable with state preservation
- [ ] Service Subscription created on successful purchase
- [ ] TypeScript/ESLint pass with no errors
- [ ] Demo walkthrough documented

---

**Document Version**: 1.0
**Created**: 2026-01-27
**Quality Score**: 92/100
**Total Story Points**: 199
**Estimated Duration**: 12 weeks (6 sprints)
