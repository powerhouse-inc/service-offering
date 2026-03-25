# WBD Editor Improvements - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: The Work Breakdown (WBD) editor's AI extraction pipeline has several limitations that reduce its usefulness: static Powerhouse context that drifts from reality, no enforcement of step/substep limits, no structured team management, a basic capture flow with only manual text entry, and a minimal AI context UI. These gaps mean extractions produce inconsistent results, workers can't be properly assigned, and domain-specific knowledge isn't leveraged.
- **Target Users**: Powerhouse contributors using the WBD editor to break down projects into structured work plans with AI assistance.
- **Value Proposition**: Transform the WBD editor from a basic AI-assisted breakdown tool into a full project planning system with dynamic context, enforced structure (7x7), team resource management, multi-source ingestion, and domain-aware AI extraction.

### Feature Overview
- **Core Features**:
  1. Dynamic Powerhouse context loaded from MCP at editor mount
  2. 7x7 enforcement: max 7 steps, max 7 substeps per step
  3. Full resource management with team members as Powerhouse documents
  4. Domain-specific context via template dropdown + free-form textarea
  5. Multi-source capture: text, URLs, file upload, Powerhouse document references
  6. Improved AI context UI with structured sections and history

- **Feature Boundaries**:
  - IN: All 6 features above, schema changes, reducer logic, editor UI, AI prompt updates
  - OUT: Processors/analytics (deferred to v2), billing integration, cross-project resource sharing, real-time collaboration features

- **User Scenarios**:
  - A contributor opens a WBD for a "Pricing Editor" project, selects the "Pricing Editor" domain template, pastes a Business Analysis document reference, and the AI generates a 7-step plan with properly scoped substeps and assigned team members
  - A tech lead reviews the WBD, sees team capacity, reassigns tasks from an overloaded contributor, and adds domain-specific context to refine the next extraction

### Detailed Requirements

#### 1. Dynamic Powerhouse Context (MCP at Mount)

**Current State**: `POWERHOUSE_CONTEXT` (lines 98-149) and `WBD_SCHEMA_CONTEXT` (lines 154-248) in `ai-extraction.ts` are static string constants baked at build time.

**Target State**: Read context dynamically from MCP when the editor mounts.

- **Input**: MCP connection available via `reactor-mcp`
- **Output**: Fresh Powerhouse ecosystem context and WBD schema context loaded into memory
- **Implementation**:
  - On editor mount, call MCP `getDocumentModelSchema` for the WBD document model to get current schema
  - Read `CLAUDE.md` content via MCP resource or a known document reference
  - Cache in React ref (not state, to avoid re-renders)
  - Replace static constants with cached dynamic values in AI prompt construction
  - Fallback: If MCP is unavailable, fall back to the current static constants (keep them as defaults)
- **Edge Cases**:
  - MCP connection drops mid-session: use cached values from mount
  - MCP returns empty/malformed data: log warning, fall back to static
  - Editor re-mounts: refresh context

#### 2. 7x7 Step/Substep Enforcement

**Current State**: AI prompt says "5-8 steps, 3-5 substeps" (`ai-extraction.ts:290`). Reducers `addStepOperation` and `addSubstepOperation` in `scenario.ts` have no count validation.

**Target State**: Hard 7x7 limit enforced at 3 layers: AI prompt, reducer, and UI.

- **AI Prompt Layer**: Update system prompt to say "Generate exactly 5-7 steps, each with 3-7 substeps. Never exceed 7 steps or 7 substeps per step."
- **Reducer Layer**:
  - `addStepOperation`: Check `state.steps.length >= 7`, throw `MaxStepsExceededError` if at limit
  - `addSubstepOperation`: Check `step.substeps.length >= 7`, throw `MaxSubstepsExceededError` if at limit
  - `bulkAddStepsOperation` (if exists): Validate total won't exceed 7
- **UI Layer**:
  - Disable "Add Step" button when 7 steps exist
  - Show "7/7 steps" counter badge
  - Disable "Add Substep" on a step when it has 7 substeps
  - Show "N/7 substeps" counter per step
- **Error Definitions**:
  - `MaxStepsExceededError` (code: `MAX_STEPS_EXCEEDED`) on `ADD_STEP` operation
  - `MaxSubstepsExceededError` (code: `MAX_SUBSTEPS_EXCEEDED`) on `ADD_SUBSTEP` operation
- **Edge Cases**:
  - AI generates 8+ steps: truncate at 7 in the editor before dispatching, warn user
  - Bulk operations: validate cumulative count before dispatching any

#### 3. Full Resource Management

**Current State**: `owner` is a freeform `String` field on `Task` type in the WBD schema. No team roster, no capacity tracking.

**Target State**: Team members as manageable entities within the WBD document (Phase 1), with cross-document references to standalone team member documents (Phase 2).

##### Phase 1: Schema-Level Team Management (this PRD)

- **New Schema Types**:
  ```graphql
  enum TeamRole {
    DOCUMENT_MODEL_ENGINEER
    FRONTEND_ENGINEER
    BACKEND_ENGINEER
    BUSINESS_ANALYST
    QA_ENGINEER
    TECH_LEAD
    DEVOPS
    DESIGNER
    PROJECT_MANAGER
    CUSTOM
  }

  type TeamMember {
    id: OID!
    name: String!
    role: TeamRole!
    customRoleLabel: String
    availability: Float
    avatarColor: String
  }
  ```
- **New State Fields**: `teamMembers: [TeamMember!]!` on `WorkBreakdownState`
- **Modified Fields**: `Task.owner` changes from `String` to `String` (remains a string for backward compat, but now references `TeamMember.id`)
- **New Module**: `team` with operations:
  | Operation | Input | Reducer Logic |
  |-----------|-------|---------------|
  | `ADD_TEAM_MEMBER` | `id, name, role, customRoleLabel, availability, avatarColor` | Push new member. Error: `DuplicateTeamMemberError` if id exists |
  | `UPDATE_TEAM_MEMBER` | `id, name, role, customRoleLabel, availability, avatarColor` | Find by id, update fields. Error: `UpdateTeamMemberNotFoundError` |
  | `REMOVE_TEAM_MEMBER` | `id` | Filter out. Unassign from all tasks that reference this member. Error: `RemoveTeamMemberNotFoundError` |
  | `ASSIGN_TASK_OWNER` | `taskId, teamMemberId` | Find task, set `owner` to member id. Error: `AssignTaskNotFoundError`, `AssignTeamMemberNotFoundError` |
  | `UNASSIGN_TASK_OWNER` | `taskId` | Find task, set `owner` to null. Error: `UnassignTaskNotFoundError` |
- **UI Components**:
  - Team roster panel (sidebar or modal) showing all members with role badges
  - Add/edit member form with role dropdown and availability slider (0-100%)
  - Task assignment dropdown showing team members grouped by role
  - Capacity overview: tasks assigned vs. availability per member
  - AI-generated tasks auto-suggest owner based on role matching (e.g., "Define schema" → Document Model Engineer)

##### Phase 2: Cross-Document References (future PRD)
- Create standalone `powerhouse/team-member` document model
- WBD references team members via PHID
- Shared team roster across multiple WBDs

#### 4. Domain-Specific Context (Free-form + Templates)

**Current State**: Single textarea for AI context that persists via `SET_AI_CONTEXT`. No templates, no structured prompting.

**Target State**: Template dropdown + free-form textarea. Selecting a template pre-fills the textarea. User can edit after pre-fill.

- **Domain Templates** (stored as static constants, extensible later):
  ```typescript
  const DOMAIN_TEMPLATES: DomainTemplate[] = [
    {
      id: "document-model",
      name: "Document Model",
      description: "Building a new Powerhouse document model",
      context: "This project involves creating a new Powerhouse document model. Focus on: GraphQL schema design with proper scalar types (OID, DateTime, Amount), pure synchronous reducers using Mutative, operation modules with typed errors, Zod validation schemas, and comprehensive test coverage. Follow the document model creation workflow: schema → operations → reducers → tests → editor."
    },
    {
      id: "document-editor",
      name: "Document Editor",
      description: "Building a React editor for a document model",
      context: "This project involves building a React editor for a Powerhouse document model. Focus on: useSelected*Document hooks, action creator imports from gen/creators, DocumentToolbar preservation, Tailwind styling, modular components, dispatch patterns, and integration with the Powerhouse design system. Avoid generating any non-deterministic values in the editor."
    },
    {
      id: "pricing-editor",
      name: "Pricing Editor",
      description: "Service offering pricing configuration",
      context: "This project involves pricing configuration for service offerings. Focus on: tier-based pricing models, service group cost aggregation, option group management, budget indicators, recurring vs. setup costs, discount cascade logic, and the pricing matrix UI. Reference the ServiceOffering document model schema."
    },
    {
      id: "dashboard-viewer",
      name: "Dashboard / App",
      description: "Drive-level app for browsing documents",
      context: "This project involves building a Powerhouse drive app (dashboard). Focus on: useSelectedDrive hook, filtering drive nodes by documentType, CRUD operations via drive actions (ADD_FILE, DELETE_NODE), folder navigation, and document type filtering. Reference the powerhouse/app document model pattern."
    },
    {
      id: "subscription-management",
      name: "Subscription Management",
      description: "Subscription instance lifecycle",
      context: "This project involves subscription instance management. Focus on: subscription lifecycle (initialize → activate → pause → cancel → renew), service provisioning, billing projection, metrics tracking, service groups, and customer management. Reference the SubscriptionInstance document model."
    },
    {
      id: "processor",
      name: "Processor / Subgraph",
      description: "Backend data pipeline or GraphQL subgraph",
      context: "This project involves building a Powerhouse processor or subgraph. Focus on: one-way data pipelines (operations IN → derived data OUT), event-driven processing, GraphQL resolver patterns, and integration with the Switchboard. Processors cannot dispatch operations back."
    },
    {
      id: "custom",
      name: "Custom Domain",
      description: "Write your own domain context",
      context: ""
    }
  ];
  ```
- **UI**:
  - Dropdown above the AI context textarea: "Select domain template..."
  - Selecting a template fills the textarea with the template's context string
  - User can freely edit after selection
  - "Custom Domain" option leaves textarea empty for free-form input
  - Show template description as helper text when selected
- **Integration with AI Extraction**:
  - Domain context is appended to the system prompt as a separate `<domain-context>` block
  - Template ID is recorded in extraction records (new optional field `domainTemplate: String` on `ExtractionRecord`)
- **Schema Changes**:
  - Add `domainTemplate: String` to `ExtractionRecord` type
  - Add `domainTemplate: String` to `AddExtractionRecordInput`

#### 5. Multi-Source Capture & Ingest Flow

**Current State**: Single textarea in `CaptureView.tsx`, source hardcoded to `"Manual Ingestion"`, auto-advances to STRUCTURE phase.

**Target State**: Structured capture form with 4 ingest methods.

- **Source Types**:
  ```graphql
  enum IngestSource {
    MANUAL
    URL
    FILE_UPLOAD
    DOCUMENT_REFERENCE
  }
  ```
- **UI Flow**:
  1. Source type selector (tab bar or segmented control): Manual | URL | File | Document
  2. Per-source input:
     - **Manual**: Current textarea (keep as-is)
     - **URL**: URL input field + "Fetch" button → scrapes content via `fetch()` + DOMParser or a lightweight markdown conversion
     - **File Upload**: File input accepting `.md`, `.txt`, `.pdf` → reads content via FileReader API. PDF parsing via pdf.js or similar browser-compatible library
     - **Document Reference**: Dropdown/search of available Powerhouse documents in the drive (fetched via MCP `getDocuments`). Selecting a document reads its state and extracts relevant text content
  3. Preview panel showing parsed content before processing
  4. "Process & Structure" button dispatches `addInput()` with proper `source` field reflecting the ingest method
- **Schema Changes**:
  - Modify `StakeholderInput.source` from `String` to `String` (keep as string for flexibility, but populate with structured values like `"URL: https://..."`, `"Document: {docId}"`, `"File: filename.pdf"`)
  - Or add `sourceType: IngestSource` enum field to `StakeholderInput` for structured tracking
- **Edge Cases**:
  - URL fetch fails (CORS, 404): show error toast, don't advance
  - File too large: limit to 500KB, show warning
  - PDF parsing fails: show error, suggest manual paste
  - Document reference not found: show error toast
  - Multiple inputs: allow adding multiple inputs before advancing to STRUCTURE

#### 6. AI Context UI Improvements

**Current State**: Single textarea with placeholder text, last 3 extraction history pills.

**Target State**: Structured AI context panel with sections, template integration, and richer history.

- **Panel Layout**:
  ```
  ┌─────────────────────────────────────┐
  │ AI Context                    [?]   │
  ├─────────────────────────────────────┤
  │ Domain Template: [Dropdown    ▼]    │
  │ "Building a new document model..."  │
  ├─────────────────────────────────────┤
  │ Custom Instructions:                │
  │ ┌─────────────────────────────────┐ │
  │ │ Focus on security tasks and...  │ │
  │ │                                 │ │
  │ └─────────────────────────────────┘ │
  ├─────────────────────────────────────┤
  │ Extraction History                  │
  │ ● Scenario - Completed (5 steps)    │
  │ ● Tasks - Completed (12 tasks)      │
  │ ○ Tasks - Failed (rate limit)       │
  │                         [Clear All] │
  └─────────────────────────────────────┘
  ```
- **Sections**:
  1. **Domain Template Dropdown**: See Feature 4
  2. **Custom Instructions Textarea**: Current AI context textarea, persists via `SET_AI_CONTEXT`
  3. **Extraction History**: Scrollable list of all records (not just last 3), with status pills, timestamps, and error messages expandable on click
- **Dispatch pattern**: Local state for textarea, dispatch `SET_AI_CONTEXT` on blur (current pattern, keep it)

## Design Decisions

### Technical Approach
- **Architecture**: All changes flow through Powerhouse document operations → Switchboard sync. No local-only state for persistent data.
- **MCP Integration**: Use `reactor-mcp` tools (`getDocumentModelSchema`, `getDocuments`, `getDocument`) at editor mount to load dynamic context. Cache in React refs.
- **Team Management Phase 1**: Team members stored within WBD document state (not separate documents) to keep Phase 1 scope manageable. Cross-document references deferred to Phase 2.
- **AI Prompt Composition**: Build prompts from 4 layers: (1) Static system instructions, (2) Dynamic Powerhouse context from MCP, (3) Domain template context, (4) User's custom instructions. Each layer is wrapped in XML tags for clarity.

### Key Components
| Component | File | Purpose |
|-----------|------|---------|
| `DynamicContextProvider` | `components/dynamic-context.ts` | MCP context loading + caching |
| `CaptureView` (enhanced) | `components/CaptureView.tsx` | Multi-source ingest UI |
| `TeamPanel` | `components/TeamPanel.tsx` | Team roster management |
| `TaskAssignmentDropdown` | `components/TaskAssignmentDropdown.tsx` | Team member assignment on tasks |
| `AIContextPanel` | `components/AIContextPanel.tsx` | Restructured AI context UI |
| `DomainTemplates` | `components/domain-templates.ts` | Template definitions + selector |
| `ai-extraction.ts` (modified) | `components/ai-extraction.ts` | Dynamic context, 7x7 prompts, domain context injection |

### Constraints
- **Performance**: MCP calls at mount should complete within 2s. Use loading skeleton while context loads.
- **Compatibility**: Must work with current Node v18 runtime (no `ph-cli generate`). All gen/ files for new modules must be manually created.
- **Security**: No new API keys or secrets. File upload size capped at 500KB. URL fetch limited to public endpoints.
- **Reducers**: All reducer logic must be pure and synchronous per Powerhouse conventions.

### Risk Assessment
- **MCP unavailability**: Mitigated by static fallback constants. Editor degrades gracefully.
- **Node v18 codegen**: All gen/ files must be manually created. Risk of drift if codegen is later run on Node v20+. Mitigated by keeping manual files aligned with schema.
- **Team management complexity**: Phase 1 keeps team within WBD document. If team size grows large, document size could balloon. Mitigated by Phase 2 cross-document approach.
- **URL fetch CORS**: Browser fetch may fail for many URLs. Mitigated by showing clear error and suggesting manual paste as fallback.
- **PDF parsing**: Browser-side PDF parsing (pdf.js) adds ~500KB to bundle. Consider lazy-loading.

## Acceptance Criteria

### Functional Acceptance
- [ ] Dynamic context loads from MCP on editor mount; AI prompts include fresh Powerhouse context
- [ ] Static fallback works when MCP is unavailable
- [ ] Adding an 8th step fails with `MaxStepsExceededError`; UI disables "Add Step" at 7
- [ ] Adding an 8th substep to any step fails with `MaxSubstepsExceededError`; UI disables "Add Substep" at 7
- [ ] AI extraction generates max 7 steps with max 7 substeps each
- [ ] Team members can be added/edited/removed from the team roster panel
- [ ] Tasks can be assigned to team members via dropdown
- [ ] Removing a team member unassigns them from all tasks
- [ ] Domain template dropdown pre-fills AI context textarea
- [ ] Custom edits to pre-filled context are preserved via `SET_AI_CONTEXT`
- [ ] Manual text, URL, file upload, and document reference ingest all work
- [ ] Extraction history shows all records with expandable details
- [ ] All operations sync through Switchboard (persist across sessions, visible to collaborators)

### Quality Standards
- [ ] `npm run tsc` passes with no new errors
- [ ] `npm run lint:fix` passes with no new warnings
- [ ] All new reducer operations have unit tests
- [ ] All new error types are tested (error on operation, state not mutated)
- [ ] No non-deterministic code in reducers (no `Date.now()`, `Math.random()`, `crypto.randomUUID()`)

### User Acceptance
- [ ] AI context persists across page reloads (Switchboard sync verified)
- [ ] Team roster visible and manageable in the editor
- [ ] Domain templates provide meaningful, tailored AI extraction results
- [ ] 7/7 counters are visible and intuitive
- [ ] Multi-source capture flow is discoverable and error-tolerant

## Execution Phases

### Phase 1: 7x7 Enforcement + AI Prompt Updates
**Goal**: Enforce structural limits and update AI prompts

- [ ] Add `MaxStepsExceededError` and `MaxSubstepsExceededError` to WBD document model via MCP
- [ ] Update `addStepOperation` reducer: check `state.steps.length >= 7`
- [ ] Update `addSubstepOperation` reducer: check `step.substeps.length >= 7`
- [ ] Update `bulkAddStepsOperation` if it exists: validate cumulative count
- [ ] Update AI extraction prompts: "5-7 steps, 3-7 substeps, never exceed 7"
- [ ] Add post-extraction validation: truncate at 7 before dispatching
- [ ] Add UI counters: "N/7 steps", "N/7 substeps" badges
- [ ] Disable add buttons at limits
- [ ] Write tests for limit enforcement and error cases
- [ ] Run `tsc` + `lint:fix`
- **Deliverables**: Enforced 7x7 limits at all 3 layers
- **Files**: `schema.graphql`, `src/reducers/scenario.ts`, `ai-extraction.ts`, `HierarchyGrid.tsx`, `tests/scenario.test.ts`

### Phase 2: Domain Templates + AI Context UI
**Goal**: Structured AI context with domain awareness

- [ ] Create `domain-templates.ts` with template definitions
- [ ] Create `AIContextPanel.tsx` component (replaces inline AI context section in editor.tsx)
- [ ] Add domain template dropdown UI
- [ ] Add `domainTemplate` field to `ExtractionRecord` schema
- [ ] Update `addExtractionRecord` reducer and input to include `domainTemplate`
- [ ] Update AI prompt composition: inject domain context as `<domain-context>` block
- [ ] Update extraction history UI: full list, expandable details, clear all
- [ ] Write tests for updated extraction record
- [ ] Run `tsc` + `lint:fix`
- **Deliverables**: Domain template selector, improved AI context panel, richer extraction history
- **Files**: `components/domain-templates.ts`, `components/AIContextPanel.tsx`, `schema.graphql`, `ai-extraction.ts`, `src/reducers/extraction.ts`, `editor.tsx`

### Phase 3: Dynamic Powerhouse Context (MCP)
**Goal**: Load context from MCP at runtime

- [ ] Create `dynamic-context.ts` module with MCP loading logic
- [ ] Implement `loadPowerhouseContext()`: call MCP `getDocumentModelSchema` for WBD schema
- [ ] Implement `loadClaudeMdContext()`: read CLAUDE.md via MCP resource
- [ ] Add loading state in editor: show skeleton while context loads
- [ ] Update `ai-extraction.ts`: accept dynamic context as parameter instead of using static constants
- [ ] Keep static constants as fallback
- [ ] Test: MCP available → dynamic context used; MCP unavailable → static fallback
- [ ] Run `tsc` + `lint:fix`
- **Deliverables**: Dynamic context loading from MCP with graceful fallback
- **Files**: `components/dynamic-context.ts`, `ai-extraction.ts`, `editor.tsx`

### Phase 4: Team Management
**Goal**: Full team roster and task assignment within WBD

- [ ] Add `TeamRole` enum and `TeamMember` type to WBD schema via MCP
- [ ] Add `teamMembers: [TeamMember!]!` to `WorkBreakdownState`
- [ ] Create `team` module with 5 operations via MCP
- [ ] Add error types: `DuplicateTeamMemberError`, `UpdateTeamMemberNotFoundError`, `RemoveTeamMemberNotFoundError`, `AssignTaskNotFoundError`, `AssignTeamMemberNotFoundError`, `UnassignTaskNotFoundError`
- [ ] Manually create gen/ files for team module (Node v18 constraint)
- [ ] Implement `src/reducers/team.ts` with all 5 operations
- [ ] Create `TeamPanel.tsx` component: add/edit/remove members, role badges, availability
- [ ] Create `TaskAssignmentDropdown.tsx`: dropdown of team members grouped by role
- [ ] Update `HierarchyGrid.tsx`: show team member avatars instead of text initials
- [ ] Update AI task extraction: auto-suggest owner based on role matching
- [ ] Write comprehensive tests for all team operations including error cases
- [ ] Run `tsc` + `lint:fix`
- **Deliverables**: Team roster panel, task assignment UI, role-based auto-suggestion
- **Files**: `schema.graphql`, `gen/team/`, `src/reducers/team.ts`, `components/TeamPanel.tsx`, `components/TaskAssignmentDropdown.tsx`, `HierarchyGrid.tsx`, `tests/team.test.ts`

### Phase 5: Multi-Source Capture
**Goal**: Ingest from text, URLs, files, and Powerhouse documents

- [ ] Add `IngestSource` enum to schema (or keep source as flexible String)
- [ ] Enhance `CaptureView.tsx` with source type tabs
- [ ] Implement URL fetch: input field + fetch button + content preview
- [ ] Implement file upload: FileReader for .md/.txt, pdf.js for .pdf (lazy-loaded)
- [ ] Implement document reference: MCP `getDocuments` dropdown + `getDocument` content extraction
- [ ] Add content preview panel before processing
- [ ] Support multiple inputs before advancing to STRUCTURE
- [ ] Update `addInput` dispatch to include structured source metadata
- [ ] Error handling: toast notifications for fetch failures, file parsing errors, missing documents
- [ ] Run `tsc` + `lint:fix`
- **Deliverables**: Multi-source capture UI with 4 ingest methods
- **Files**: `components/CaptureView.tsx`, `schema.graphql` (if adding IngestSource enum), `editor.tsx`

---

**Document Version**: 1.0
**Created**: 2026-02-17
**Clarification Rounds**: 1
**Quality Score**: 82/100
