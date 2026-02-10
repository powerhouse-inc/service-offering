# Backend Requirements: Achra Authentication Rules

## Context

**What we're building**: Authentication and authorization rules for Achra, a service marketplace platform offering legal/operational infrastructure for blockchain networks.

**Who it's for**:
- **Visitors** (anonymous) - browsing services
- **Founders** - early-stage network initiatives
- **Builders** - open-source developers
- **Operators** - network operations management
- **SNO Governors** - network stakeholder governance
- **Admins** - platform administrators

**What problem it solves**: Control who can view, purchase, and manage services on the Achra platform using Powerhouse's Document Permission System.

**Reference**: [Document Permission System](https://academy.vetra.io/academy/MasteryTrack/BuildingUserExperiences/Authorization/DocumentPermissions)

---

## Screens/Components

### Services Listing Page (`/services`)

**Purpose**: Display available service packages (SNO Embryonic Hub, Swiss Association Hub, IP SPV, etc.)

**Data I need to display**:
- List of all available services with their metadata (name, description, target audience)
- For each service: whether the current user can purchase it
- For each service: whether the "Purchase" button should be enabled or disabled
- Visual indication of which services are available to the user's role

**Actions**:
- View service details → Navigate to service info page (Step 1 of purchase flow)
- Click "Purchase" → Initiate purchase flow (if authorized)

**States to handle**:
- **Anonymous**: Can browse all services, but some "Purchase" buttons may be disabled
- **Logged in (wrong role)**: Can see services but cannot purchase role-restricted services
- **Logged in (correct role)**: Full access to purchase eligible services
- **Error**: What happens if permission check fails?

**Business rules affecting UI**:
- Some services are restricted to specific roles (e.g., "IP SPV" only for SNO Governors)
- The "Purchase" button state depends on user's role/permissions
- Service visibility: Should all services be visible to everyone, or should some be hidden entirely?

---

### Service Info Page (Step 1 of Purchase Flow)

**Purpose**: Display comprehensive product information before purchase

**Data I need to display**:
- Full service details (already visible to all?)
- Whether user can proceed to operator selection

**Actions**:
- "Select an Operator" → Proceed to Step 2 (requires what permission level?)

**States to handle**:
- **Anonymous viewing**: Can read all info, but CTA behavior unclear
- **Logged in**: Can proceed to operator selection

**Business rules affecting UI**:
- Can anonymous users view service details? (Current assumption: YES - READ access)
- Must users be logged in to click "Select an Operator"?

---

### Operator Selection (Step 2)

**Purpose**: Compare and select from available service operators

**Data I need to display**:
- List of operators for the selected service
- Operator details (name, description, active since, setup time, pricing)

**Actions**:
- Select an operator → Proceed to service configuration

**States to handle**:
- **Not logged in**: Can they view operators? Can they select one?
- **Logged in**: Can proceed with selection

**Business rules affecting UI**:
- Is operator data public (READ for all) or restricted?
- At what point does authentication become required?

---

### Service Configuration (Step 3)

**Purpose**: Configure service package (tier, add-ons)

**Data I need to display**:
- Operator header info
- Tier options with pricing matrix
- Add-on packages
- Running totals

**Actions**:
- Select tier → Update configuration
- Toggle add-ons → Update configuration
- Continue → Proceed to summary

**States to handle**:
- **Session expired mid-flow**: How to handle?
- **Configuration data**: Is this stored server-side or client-only?

**Business rules affecting UI**:
- Should configuration require authentication, or only submission?
- Can users share configurations without being logged in?

---

### Summary & Submission (Step 4)

**Purpose**: Review configuration and submit request

**Data I need to display**:
- Complete configuration summary
- Cost breakdown
- User's contact info (if logged in)

**Actions**:
- "Submit Request" → Submit purchase request (REQUIRES LOGIN per US-010)
- "Share Configuration" → Generate shareable URL

**States to handle**:
- **Not logged in**: Show "Log in to Submit" prompt
- **Logged in**: Can submit
- **Submission error**: Display error message

**Business rules affecting UI**:
- **Confirmed**: Submission requires authentication (US-010)
- Who can view a shared configuration URL? (Anyone? Only logged-in users?)

---

### Confirmation (Step 5)

**Purpose**: Confirm request was received

**Data I need to display**:
- Success message with user's name
- Email confirmation notice
- Next steps

**Actions**:
- "Explore ACHRA" → Return to services listing

**States to handle**:
- Only accessible after successful submission
- Should be idempotent on refresh

---

## Permission Model Proposal

Based on the Powerhouse Document Permission System, here's what I think we need:

### Permission Levels Needed

| Resource | Anonymous | Logged-in User | Correct Role | Admin |
|----------|-----------|----------------|--------------|-------|
| Services listing | READ | READ | READ | ADMIN |
| Service details | READ | READ | READ | ADMIN |
| Operator list | READ | READ | READ | ADMIN |
| Configure service | READ | WRITE | WRITE | ADMIN |
| Submit request | - | - | WRITE | ADMIN |
| View own requests | - | READ | READ | ADMIN |
| Manage services | - | - | - | ADMIN |

### Role-to-Service Mapping

| Service | Founders | Builders | Operators | SNO Governors |
|---------|----------|----------|-----------|---------------|
| SNO Embryonic Hub | WRITE | - | - | WRITE |
| Swiss Association Hub | - | WRITE | WRITE | - |
| IP SPV | - | - | - | WRITE |
| Revenue Generating Hub | - | - | - | WRITE |
| Operational Collateral Fund | - | - | - | WRITE |
| Sky Star Foundation | - | - | - | WRITE |

---

## Uncertainties

- [ ] Not sure if services should be **hidden** from unauthorized roles or just have **disabled purchase buttons**
- [ ] Don't understand if a user can have multiple roles (e.g., Founder AND SNO Governor)
- [ ] Guessing that "Share Configuration" URLs should work without authentication (READ-only)
- [ ] Not sure how role assignment works - is it during registration? Manual admin assignment?
- [ ] Don't know if operators have their own permission rules (can certain operators only be selected by certain users?)
- [ ] Unclear if there's a "guest checkout" flow or if auth is always required for purchase

---

## Questions for Backend

1. **Role granularity**: Should roles be hierarchical (Admin > SNO Governor > Operator > Builder > Founder) or flat/independent?

2. **Service visibility**: When a user doesn't have permission to purchase a service:
   - Should the service be hidden entirely?
   - Should it show with a disabled "Purchase" button?
   - Should it show with a "Contact Us" or "Request Access" button?

3. **Document structure**: How should Achra map to the Document Permission System?
   - Is each service a separate document?
   - Is there a parent "Achra Services" drive?
   - Should we use groups for role-based access?

4. **Environment config**: Should these be the defaults?
   ```
   AUTH_ENABLED=true
   DOCUMENT_PERMISSIONS_ENABLED=true
   ```

5. **Shared configurations**: Should shared URLs (`?config=...`) work for:
   - Anyone (no auth required to view)?
   - Only logged-in users?
   - Only users with the correct role for that service?

6. **Session handling**: What happens if a user's session expires mid-purchase-flow? Should we:
   - Store flow state server-side (requires auth)?
   - Store in localStorage (client-only)?
   - Use URL state (shareable but limited)?

---

## Discussion Log

*[Backend responses and decisions will be added here]*

---

**Document Version**: 1.0
**Created**: 2026-01-22
**Clarity Score**: 45/100 (pending backend clarification)
**Skills Applied**: Requirements Clarity, Frontend-to-Backend Requirements
