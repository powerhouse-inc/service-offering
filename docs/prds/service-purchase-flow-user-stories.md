# Service Purchase Flow - User Stories & Sprint Backlog

> Generated using: Requirements Clarity, UI/UX Pro Max, Marketing Psychology, and Agile Product Owner skills

---

## Design System Summary

| Element | Specification |
|---------|---------------|
| **Pattern** | Funnel (5-Step Conversion) with progressive disclosure |
| **Style** | Trust & Authority |
| **Primary Color** | `#0F172A` (Slate 900) |
| **CTA Color** | `#0369A1` (Sky 700) |
| **Background** | `#F8FAFC` (Slate 50) |
| **Typography** | Plus Jakarta Sans |
| **Key Effects** | Badge hover, metric pulse, smooth stat reveal |

---

## Psychology Principles Applied

| Principle | Application in Flow |
|-----------|---------------------|
| **Goal-Gradient Effect** | Timeline shows "Step X of 5" - users accelerate as they approach completion |
| **Commitment & Consistency** | Small commitment (browse) → medium (select operator) → large (submit) |
| **Loss Aversion** | "Share Configuration" prevents losing work; preserved state on back navigation |
| **Endowment Effect** | Users "own" their configuration as they build it, increasing commitment |
| **Anchoring** | Enterprise tier shown in pricing matrix anchors perception of Team/Premium value |
| **Default Effect** | Pre-selected recommended tier increases conversions |
| **Zeigarnik Effect** | Incomplete purchase creates mental tension driving completion |
| **Social Proof** | Operator cards show "Active Since", "Setup Time" as trust signals |
| **Peak-End Rule** | Confirmation page (Step 5) designed as memorable positive ending |

---

## Epic: Service Purchase Flow

**Epic ID**: SPF-001
**Epic Owner**: Product Team
**Business Value**: Enable users to purchase operational hub services through a guided, conversion-optimized 5-step wizard

---

## User Stories

### US-001: Timeline Visibility Logic
**As a** visitor browsing the OH Resource Profile
**I want** the timeline to remain hidden until I initiate the purchase flow
**So that** I can explore product information without feeling pressured into a purchase journey

**Story Points**: 3
**Priority**: P0 (Critical)
**Sprint**: 1

#### Acceptance Criteria
- [ ] AC1: Timeline component is NOT rendered when user navigates directly to Product Info page
- [ ] AC2: Timeline becomes visible showing "Step 1 of 5" when user clicks "Back" from Step 2
- [ ] AC3: Timeline persists across all steps once purchase flow is initiated
- [ ] AC4: URL structure reflects flow state (e.g., `?flow=active` parameter)

#### Psychology Applied
- **Status-Quo Bias**: Don't disrupt browsing mode; only show purchase UI when user commits
- **Foot-in-the-Door**: Small action (click "Select an Operator") opens the full journey

#### UX Requirements
- [ ] No layout shift when timeline appears
- [ ] Timeline uses `transition-opacity duration-300` for smooth reveal
- [ ] Focus management: timeline not focusable until visible

#### Technical Notes
```typescript
// Flow state management
interface PurchaseFlowState {
  isActive: boolean;
  currentStep: 1 | 2 | 3 | 4 | 5;
  startedAt?: Date;
}
```

---

### US-002: Step 1 - Product Info Page
**As a** potential customer
**I want** to view comprehensive product information about the Operational Hub
**So that** I can make an informed decision before starting the purchase process

**Story Points**: 5
**Priority**: P0 (Critical)
**Sprint**: 1

#### Acceptance Criteria
- [ ] AC1: Hero section displays OH name, target audience (Founders, SNO Governors), and value proposition
- [ ] AC2: Expandable FAQ sections ("Working Without a Legal Wrapper...", "Why Establishing...")
- [ ] AC3: Primary CTA "Select an Operator" button at page bottom
- [ ] AC4: CTA click initiates purchase flow and navigates to Step 2

#### Psychology Applied
- **Authority Bias**: Display credentials, certifications, "Legal Shield" positioning
- **Confirmation Bias**: Content aligns with what founders already believe about legal protection needs
- **AIDA**: Attention (hero) → Interest (benefits) → Desire (FAQ addresses objections) → Action (CTA)

#### UX Requirements
- [ ] CTA button: `bg-[#0369A1] text-white px-8 py-4 rounded-lg cursor-pointer`
- [ ] Hover state: `hover:bg-[#0284C7] transition-colors duration-200`
- [ ] FAQ accordions with smooth expand/collapse animation
- [ ] "Step 1 of 5" indicator below CTA (only when timeline visible)

#### Design Specifications
```
Layout:
├── Header (fixed, floating with top-4 spacing)
├── Hero Section
│   ├── Product Image (placeholder)
│   ├── Title: "Operational Hub for Open Source Builders"
│   ├── Subtitle: "For Founders and SNO Governors"
│   └── Tagline: "Your Legal Shield for Global, Decentralized Work"
├── [Timeline - conditional]
├── Content Section (blurred in wireframe - product details)
├── FAQ Accordions
├── CTA Section
│   └── "Select an Operator" button
└── Step indicator (conditional)
```

---

### US-003: Step 2 - Operator Selection
**As a** user who initiated the purchase flow
**I want** to compare and select from available service operators
**So that** I can choose the provider that best fits my needs and budget

**Story Points**: 8
**Priority**: P0 (Critical)
**Sprint**: 1

#### Acceptance Criteria
- [ ] AC1: Display operator cards in a responsive grid (2 columns desktop, 1 mobile)
- [ ] AC2: Each card shows: Name, Description, Active Since, Setup Time, Recurring Cost range
- [ ] AC3: "Select Services" or "Select Offering" button on each card
- [ ] AC4: Selecting an operator navigates to Step 3 with operator context
- [ ] AC5: "Back" button returns to Step 1 with timeline still visible
- [ ] AC6: Changing operator later (from Step 3+) resets service selections

#### Psychology Applied
- **Social Proof**: "Active Since Jul 2022" establishes trust and longevity
- **Anchoring**: Higher-priced operator shown first anchors price expectations
- **Paradox of Choice**: Limited to 2-4 operators max to prevent decision paralysis
- **Mimetic Desire**: Showing both options implies others are choosing/using these

#### UX Requirements
- [ ] Cards: `cursor-pointer hover:shadow-lg transition-shadow duration-200`
- [ ] Card border: `border border-gray-200 hover:border-[#0369A1]`
- [ ] Operator logo/icon placeholder: 40x40px
- [ ] Metadata in muted text: `text-slate-600 text-sm`
- [ ] Price range emphasized: `font-semibold`

#### Data Structure
```typescript
interface Operator {
  id: string;
  name: string;
  description: string;
  activeSince: Date;
  setupTime: string; // e.g., "7 days"
  recurringCostFrom: number;
  currency: string;
  services: Service[];
}
```

---

### US-004: Step 3 - Service Configuration
**As a** user who selected an operator
**I want** to configure my service package by selecting a tier and optional add-ons
**So that** I can customize the offering to match my specific needs and budget

**Story Points**: 13
**Priority**: P0 (Critical)
**Sprint**: 2

#### Acceptance Criteria
- [ ] AC1: Operator header displays: SNO Function, Legal Entity, Team Structure, Anonymity Level
- [ ] AC2: Tier selector with 4 options: Basic, Team, Premium, Enterprise
- [ ] AC3: Service catalog matrix shows included/optional items per tier
- [ ] AC4: Toggle switches for optional add-on packs (Finance Pack, Hosting Suite)
- [ ] AC5: Running subtotals update in real-time as selections change
- [ ] AC6: Grand total prominently displayed with monthly + setup breakdown
- [ ] AC7: "Back" preserves current selections; "Continue" proceeds to Summary

#### Psychology Applied
- **Good-Better-Best Pricing**: 4 tiers with "Team" as the target (visually emphasized)
- **Decoy Effect**: Basic tier makes Team look like obvious value
- **Default Effect**: Team tier pre-selected as recommended option
- **Mental Accounting**: Show monthly cost, not annual, for easier mental processing
- **IKEA Effect**: User builds their package, increasing ownership and commitment

#### UX Requirements
- [ ] Selected tier: `bg-[#0369A1] text-white` with filled circle indicator
- [ ] Unselected tier: `bg-transparent text-slate-700` with empty circle
- [ ] Toggle switches: accessible, with clear ON/OFF states
- [ ] Price updates: `transition-all duration-150` for smooth number changes
- [ ] "INCLUDED" badge: `bg-green-100 text-green-800 text-xs px-2 py-1 rounded`
- [ ] "OPTIONAL" badge: `bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded`
- [ ] Enterprise "Custom" pricing: triggers contact flow (out of scope for MVP)

#### Pricing Matrix Example
```
| Service             | Basic  | Team   | Premium | Enterprise |
|---------------------|--------|--------|---------|------------|
| Legal Setup         | ✓      | ✓      | ✓       | ✓          |
| Contractor Controls | Up to 3| Up to 6| Up to 10| >10        |
| Tax Administration  | ✓      | ✓      | ✓       | ✓          |
| Dedicated Manager   | -      | -      | ✓       | ✓          |
| SUBTOTAL (monthly)  | $200   | $300   | $500    | Custom     |
```

---

### US-005: Step 4 - Summary & Submission
**As a** user who configured my service package
**I want** to review my complete configuration and submit my request
**So that** I can confirm everything is correct before committing

**Story Points**: 8
**Priority**: P0 (Critical)
**Sprint**: 2

#### Acceptance Criteria
- [ ] AC1: Configuration summary displays selected operator, tier, and all options
- [ ] AC2: Cost breakdown shows: Setup Fee, Recurring Base, Add-ons, Grand Total
- [ ] AC3: Contact form with required fields: Name*, Email*
- [ ] AC4: "Submit Request" button requires user to be logged in
- [ ] AC5: If not logged in, redirect to login, then return to Step 4 with data preserved
- [ ] AC6: "Share Configuration" generates shareable URL
- [ ] AC7: Form data preserved when navigating back and returning

#### Psychology Applied
- **Commitment & Consistency**: Reviewing selections reinforces commitment
- **Loss Aversion**: "Share Configuration" prevents losing carefully built config
- **Regret Aversion**: Summary allows final review, reducing post-purchase regret
- **Peak-End Rule**: Summary is near the end - make it feel organized and trustworthy

#### UX Requirements
- [ ] Summary card: `bg-[#6B21A8] text-white rounded-xl p-6` (purple gradient from wireframe)
- [ ] Price highlight: Large, bold total with breakdown below
- [ ] Form labels: Use `<label>` with `for` attribute, not placeholder-only
- [ ] Submit button: `bg-[#6B21A8] hover:bg-[#7C3AED] text-white w-full py-4`
- [ ] Submit loading state: Disable button, show spinner, prevent double-click
- [ ] Share link: Secondary style with link icon

#### Share URL Structure
```
https://achra.com/services/sno-embryonic-hub-465c4?config=BASE64_ENCODED_STATE
```

---

### US-006: Step 5 - Confirmation
**As a** user who submitted my service request
**I want** to receive confirmation that my request was received
**So that** I know the next steps and feel confident in my purchase decision

**Story Points**: 3
**Priority**: P0 (Critical)
**Sprint**: 2

#### Acceptance Criteria
- [ ] AC1: Success message: "Request Successfully Sent!"
- [ ] AC2: Personalized thank you with user's name
- [ ] AC3: Email confirmation notice: "We have emailed the summary to [email]"
- [ ] AC4: Next steps: "We will contact you shortly to schedule an introduction meeting"
- [ ] AC5: "Explore ACHRA" CTA for continued engagement
- [ ] AC6: Page is idempotent (refresh shows same confirmation)

#### Psychology Applied
- **Peak-End Rule**: This is the END - make it memorable and positive
- **Reciprocity**: "Thank you" + next steps creates goodwill
- **Commitment & Consistency**: Confirmation reinforces the decision was good

#### UX Requirements
- [ ] Success icon: Green checkmark with subtle pulse animation
- [ ] Heading: `text-2xl font-bold text-slate-900`
- [ ] User name in different color: `text-[#0369A1]`
- [ ] Email link: clickable mailto
- [ ] "Explore ACHRA" CTA: Secondary button style

---

### US-007: Timeline Navigation
**As a** user in the middle of the purchase flow
**I want** to click on timeline steps to navigate directly to previous steps
**So that** I can review or modify earlier selections without losing my progress

**Story Points**: 5
**Priority**: P1 (High)
**Sprint**: 2

#### Acceptance Criteria
- [ ] AC1: All completed and current steps are clickable
- [ ] AC2: Future steps are not clickable (grayed out)
- [ ] AC3: Clicking a previous step navigates to that step with all selections preserved
- [ ] AC4: Visual indicator shows current step (filled circle) vs completed (checkmark) vs future (empty)
- [ ] AC5: Keyboard accessible: Tab to focus, Enter to activate

#### Psychology Applied
- **Goal-Gradient Effect**: Seeing progress toward Step 5 motivates completion
- **Zeigarnik Effect**: Visible incomplete steps create tension to finish
- **Status-Quo Bias**: Easy back navigation reduces fear of commitment

#### UX Requirements
- [ ] Clickable step: `cursor-pointer hover:text-[#0369A1]`
- [ ] Current step: Filled circle `bg-slate-900`
- [ ] Completed step: Checkmark icon or filled circle with different color
- [ ] Future step: Empty circle `border-2 border-slate-300`
- [ ] Step labels: `text-sm text-slate-600`
- [ ] Focus ring: `focus:outline-none focus:ring-2 focus:ring-[#0369A1] focus:ring-offset-2`

---

### US-008: State Persistence & URL Sharing
**As a** user who configured a service package
**I want** to generate a shareable URL that recreates my exact configuration
**So that** I can share it with colleagues for review or continue later on a different device

**Story Points**: 5
**Priority**: P1 (High)
**Sprint**: 3

#### Acceptance Criteria
- [ ] AC1: "Share Configuration" button generates a unique URL
- [ ] AC2: URL opens directly to Step 4 (Summary) with configuration pre-populated
- [ ] AC3: Shared URL works without authentication (login only required to submit)
- [ ] AC4: Copy-to-clipboard feedback: "Link copied!" toast notification
- [ ] AC5: URL remains valid for at least 30 days

#### Psychology Applied
- **Endowment Effect**: Sharing makes the configuration feel more "owned"
- **Social Proof**: Ability to share implies others use and share configurations
- **Loss Aversion**: Prevents losing work by providing persistence mechanism

#### Technical Approach
Option A: Encode state in URL parameters (simpler, no backend)
Option B: Short code lookup (cleaner URLs, requires backend storage)

```typescript
// Option A: URL encoding
const config = btoa(JSON.stringify({
  operatorId: 'powerhouse-genesis',
  tier: 'team',
  addons: ['hosting-suite'],
  // ... other selections
}));
// URL: ?config=eyJvcGVyYXRvck...

// Option B: Short code
// POST /api/configs → returns { code: 'abc123' }
// URL: ?c=abc123
```

---

### US-009: Operator Change Reset Logic
**As a** user who selected services for one operator
**I want** to be informed when changing operators will reset my service selections
**So that** I don't accidentally lose my configuration work

**Story Points**: 3
**Priority**: P2 (Medium)
**Sprint**: 3

#### Acceptance Criteria
- [ ] AC1: If user is on Step 3+ and navigates to Step 2, current operator remains selected
- [ ] AC2: Selecting a DIFFERENT operator triggers confirmation dialog
- [ ] AC3: Dialog message: "Selecting a different operator will reset your service configuration. Continue?"
- [ ] AC4: "Cancel" keeps current operator; "Continue" resets and loads new operator services
- [ ] AC5: If same operator is re-selected, no reset occurs

#### Psychology Applied
- **Loss Aversion**: Warning prevents accidental loss of configuration work
- **Regret Aversion**: Confirmation reduces regret from hasty decisions

#### UX Requirements
- [ ] Modal dialog: centered, backdrop blur
- [ ] Destructive action: "Continue" in warning color `bg-amber-500`
- [ ] Safe action: "Cancel" as primary outlined button

---

### US-010: Authentication Gate for Submission
**As a** system administrator
**I want** to require users to log in before submitting a service request
**So that** we can verify identity and associate requests with user accounts

**Story Points**: 5
**Priority**: P1 (High)
**Sprint**: 3

#### Acceptance Criteria
- [ ] AC1: "Submit Request" checks authentication state before proceeding
- [ ] AC2: If not authenticated, redirect to login page with return URL
- [ ] AC3: After successful login, redirect back to Step 4 with all data intact
- [ ] AC4: Form data (Name, Email) persisted in session/local storage during auth flow
- [ ] AC5: If user cancels login, return to Step 4 (not logged in, cannot submit)

#### UX Requirements
- [ ] Pre-auth state: Show "Log in to Submit" hint near button
- [ ] Auth redirect: Store flow state before redirect
- [ ] Post-auth: Seamless return with no visible loading

---

## Sprint Planning

### Sprint 1: Foundation (3 weeks)
**Capacity**: 21 story points
**Velocity Target**: 21 points

| Story | Points | Priority | Dependencies |
|-------|--------|----------|--------------|
| US-001: Timeline Visibility Logic | 3 | P0 | None |
| US-002: Step 1 - Product Info | 5 | P0 | US-001 |
| US-003: Step 2 - Operator Selection | 8 | P0 | US-001 |
| **Sprint 1 Total** | **16** | | |

**Sprint Goal**: Users can browse Product Info and select an operator, with proper timeline visibility behavior.

---

### Sprint 2: Core Flow (3 weeks)
**Capacity**: 24 story points

| Story | Points | Priority | Dependencies |
|-------|--------|----------|--------------|
| US-004: Step 3 - Service Configuration | 13 | P0 | US-003 |
| US-005: Step 4 - Summary & Submission | 8 | P0 | US-004 |
| US-006: Step 5 - Confirmation | 3 | P0 | US-005 |
| **Sprint 2 Total** | **24** | | |

**Sprint Goal**: Complete end-to-end purchase flow from operator selection through confirmation.

---

### Sprint 3: Polish & Features (2 weeks)
**Capacity**: 18 story points

| Story | Points | Priority | Dependencies |
|-------|--------|----------|--------------|
| US-007: Timeline Navigation | 5 | P1 | US-001 |
| US-008: State Persistence & URL Sharing | 5 | P1 | US-005 |
| US-009: Operator Change Reset Logic | 3 | P2 | US-003, US-004 |
| US-010: Authentication Gate | 5 | P1 | US-005 |
| **Sprint 3 Total** | **18** | | |

**Sprint Goal**: Enable timeline navigation, URL sharing, and authentication integration.

---

## Definition of Done

- [ ] Code reviewed and approved
- [ ] Unit tests written (>80% coverage for new code)
- [ ] Integration tests for happy path
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Responsive design verified (375px, 768px, 1024px, 1440px)
- [ ] `npm run tsc` passes
- [ ] `npm run lint:fix` passes
- [ ] Design review approved
- [ ] Product Owner acceptance

---

## Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Complex state management | High | Medium | Use established patterns (React Context + useReducer) |
| URL encoding limits | Medium | Low | Implement short-code fallback (US-008 Option B) |
| Auth flow disruption | High | Medium | Extensive testing of auth redirect/return flow |
| Operator data inconsistency | Medium | Low | Validate operator/service data on page load |

---

**Document Version**: 1.0
**Created**: 2026-01-22
**Skills Applied**: Requirements Clarity, UI/UX Pro Max, Marketing Psychology, Agile Product Owner
**Total Story Points**: 58
**Estimated Sprints**: 3
