# Service Purchase Flow - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: Users browsing the OH Resource Profile page need a clear, guided experience to purchase services from operators. Currently, there's no distinction between passive browsing and active purchasing, causing confusion about where users are in the process.
- **Target Users**: Founders and SNO Governors seeking legal operational hubs for global, decentralized work
- **Value Proposition**: A 5-step wizard flow that transforms the product page into a purchase journey with clear progress indication, state preservation, and shareable configurations

### Feature Overview
- **Core Features**:
  - 5-step purchase wizard: Product Info → Select an Operator → Select Services → Summary → Confirmation
  - Timeline/progress indicator that appears only when purchase flow is initiated
  - State preservation across all steps (selections, form data)
  - Shareable configuration URLs
  - Login-gated submission

- **Feature Boundaries**:
  - IN SCOPE: Purchase flow UI, timeline navigation, state management, share functionality
  - OUT OF SCOPE: Payment processing, operator onboarding, service fulfillment

- **User Scenarios**:
  1. User browses Product Info page (no timeline visible) → clicks "Select an Operator" → enters purchase flow (timeline appears)
  2. User in Step 3 clicks "Product Info" in timeline → returns to Step 1 with timeline visible, all selections preserved
  3. User completes configuration → shares URL → recipient opens directly to Summary (Step 4)

### Detailed Requirements

#### Step 1: Product Info
- **Input/Output**:
  - Input: User arrives at OH Resource Profile page
  - Output: User clicks "Select an Operator" to initiate flow
- **User Interaction**:
  - Timeline NOT visible when arriving directly (browsing mode)
  - Timeline visible with "Step 1 of 5" only when navigating back from Step 2+
  - "Select an Operator" CTA button at bottom
- **Data Requirements**: Product description, expandable FAQ sections
- **Edge Cases**:
  - Direct URL to Step 1 without flow context → no timeline shown
  - Back navigation from Step 2 → timeline shown

#### Step 2: Select an Operator
- **Input/Output**:
  - Input: User views available operators
  - Output: User selects an operator via "Select Services" or "Select Offering" button
- **User Interaction**:
  - Display operator cards with: Name, Description, Active Since, Setup Time, Recurring Cost range
  - "Back" button returns to Step 1 (timeline remains visible)
- **Data Requirements**:
  - Operator metadata: name, description, logo, active date, setup time, base pricing
- **Edge Cases**:
  - Changing operator after Step 3 → resets service selections (services differ per operator)
  - No operators available → show empty state with contact option

#### Step 3: Select Services
- **Input/Output**:
  - Input: Selected operator context
  - Output: Configured service package (tier + optional add-ons)
- **User Interaction**:
  - Operator header with SNO Function, Legal Entity, Team Structure, Anonymity Level
  - Tier selector: Basic / Team / Premium / Enterprise
  - Service catalog matrix showing included vs optional items per tier
  - Toggle switches for optional service packs (e.g., Finance Pack, Hosting Suite)
  - Running subtotals and grand total displayed
  - "Back" and "Continue" buttons
- **Data Requirements**:
  - Tier definitions with pricing
  - Service catalog with per-tier availability/limits
  - Optional add-on packs with pricing
- **Edge Cases**:
  - Enterprise tier with "Custom" pricing → may require contact flow
  - All optional packs disabled → $0 subtotal rows shown

#### Step 4: Summary
- **Input/Output**:
  - Input: Complete configuration from Steps 2-3
  - Output: User submits request or shares configuration
- **User Interaction**:
  - Configuration summary card showing:
    - Selected operator and resource
    - Configuration details (Legal Entity, Team Structure, Anonymity Level)
    - Service breakdown (Selected Tier, Setup Fee, Recurring Base, Add-ons)
    - Total pricing (monthly + setup)
  - Contact form: Name*, Email* (required fields)
  - "Submit Request" button (requires login)
  - "Share Configuration" link (generates shareable URL)
  - "Back" and "Continue" buttons
- **Data Requirements**:
  - Aggregated selections from previous steps
  - User contact information
- **Edge Cases**:
  - User not logged in clicks "Submit Request" → redirect to login, return to Step 4 with data preserved
  - Shared URL opened → lands directly on Step 4 with configuration pre-filled

#### Step 5: Confirmation
- **Input/Output**:
  - Input: Successfully submitted request
  - Output: Confirmation message and next steps
- **User Interaction**:
  - Success message: "Request Successfully Sent!"
  - Personalized thank you with user's name
  - Email confirmation notice
  - Next steps: "We will contact you shortly to schedule an introduction meeting"
  - "Explore ACHRA" CTA for continued engagement
  - "Back" button (for reference only, form already submitted)
- **Data Requirements**:
  - Submitted request reference
  - User email for confirmation
- **Edge Cases**:
  - Submission failure → show error, allow retry
  - User refreshes confirmation page → show same confirmation (idempotent)

## Design Decisions

### Technical Approach
- **Architecture Choice**: Client-side state management for flow progression with URL-based state encoding for shareability
- **Key Components**:
  - `PurchaseFlowProvider`: Context provider managing flow state
  - `TimelineIndicator`: Progress stepper component (conditional render based on flow state)
  - `StepContainer`: Wrapper handling navigation and state persistence
  - Step-specific components: `ProductInfo`, `OperatorSelector`, `ServiceConfigurator`, `Summary`, `Confirmation`
- **Data Storage**:
  - Flow state in React context/store
  - Shareable configuration encoded in URL parameters or short-code lookup
- **Interface Design**:
  - Timeline: Horizontal stepper with clickable steps (filled circle = current/completed, empty = future)
  - Navigation: "Back" button (left), "Continue"/"Submit" button (right)
  - Step indicator: "Step X of 5" text below content

### Constraints
- **Performance Requirements**:
  - Step transitions < 200ms
  - Shareable URL generation < 500ms
- **Compatibility**:
  - Desktop and tablet responsive (mobile optimization future phase)
  - Modern browsers (Chrome, Firefox, Safari, Edge)
- **Security**:
  - Login required for submission
  - Shareable URLs should not expose sensitive pricing or user data
- **Scalability**:
  - Support for multiple operators with varying service catalogs
  - Extensible step system for future flow modifications

### Risk Assessment
- **Technical Risks**:
  - Complex state management across 5 steps → Mitigate with well-structured context/reducer pattern
  - URL state encoding limits → Use short-code lookup service for complex configurations
- **Dependency Risks**:
  - Operator/service data availability → Ensure graceful degradation if data fetch fails
- **Schedule Risks**:
  - Scope creep with "nice-to-have" features → Strict MVP definition per phase

## Acceptance Criteria

### Functional Acceptance
- [ ] Timeline NOT visible on direct navigation to Product Info page (Step 1)
- [ ] Timeline visible showing "Step 1 of 5" when navigating back from Step 2+
- [ ] Clicking "Select an Operator" initiates flow and shows timeline on Step 2
- [ ] All 5 steps accessible via timeline clicks when in flow
- [ ] Clicking previous step in timeline preserves all current selections
- [ ] Changing operator in Step 2 resets service selections in Step 3
- [ ] Contact form data preserved when navigating back from Step 4 and returning
- [ ] "Share Configuration" generates URL that opens to Step 4 with configuration pre-filled
- [ ] "Submit Request" requires user to be logged in
- [ ] Successful submission shows Step 5 confirmation with personalized message

### Quality Standards
- [ ] Code Quality: TypeScript strict mode, ESLint passing, component modularity
- [ ] Test Coverage: Unit tests for state management, integration tests for flow navigation
- [ ] Performance Metrics: Step transitions under 200ms, no layout shifts during navigation
- [ ] Security Review: Authentication flow validated, no sensitive data in shareable URLs

### User Acceptance
- [ ] User Experience: Clear visual distinction between browsing and purchasing modes
- [ ] Documentation: Component API documentation for future maintenance
- [ ] Training Materials: N/A (self-service flow)

## Execution Phases

### Phase 1: Foundation
**Goal**: Core flow infrastructure and navigation
- [ ] Create `PurchaseFlowProvider` context with step state management
- [ ] Implement `TimelineIndicator` component with conditional visibility logic
- [ ] Build `StepContainer` wrapper with Back/Continue navigation
- [ ] Set up routing for 5-step flow with URL structure
- **Deliverables**: Working navigation skeleton, timeline component
- **Acceptance**: Can navigate forward/backward through all 5 steps, timeline shows/hides correctly

### Phase 2: Step Implementation
**Goal**: Build out individual step UIs
- [ ] Step 1: Product Info with conditional timeline rendering
- [ ] Step 2: Operator selector with card grid layout
- [ ] Step 3: Service configurator with tier matrix and optional add-ons
- [ ] Step 4: Summary with configuration display and contact form
- [ ] Step 5: Confirmation with success state
- **Deliverables**: All 5 step components with full UI
- **Acceptance**: Visual parity with wireframes, all interactive elements functional

### Phase 3: State Management & Persistence
**Goal**: Robust state handling across flow
- [ ] Implement selection persistence (operator, tier, services, form data)
- [ ] Handle operator change → service reset logic
- [ ] Build shareable URL generation and parsing
- [ ] Integrate authentication check for submission
- **Deliverables**: Complete state management, share functionality
- **Acceptance**: All state scenarios from acceptance criteria pass

### Phase 4: Integration & Polish
**Goal**: Production readiness
- [ ] Connect to real operator/service data APIs
- [ ] Implement form submission with backend integration
- [ ] Add loading states, error handling, edge cases
- [ ] Performance optimization and accessibility audit
- [ ] Cross-browser testing
- **Deliverables**: Production-ready feature
- **Acceptance**: All acceptance criteria pass, QA sign-off

---

**Document Version**: 1.0
**Created**: 2026-01-21
**Clarification Rounds**: 3
**Quality Score**: 92/100
