Work Breakdown Document Model — Final Proposal (v3)
Model Identity
Field	Value
Name	Work Breakdown
ID	powerhouse/work-breakdown
Extension	phwb
Description	Structured demo scenario decomposition with template support, prerequisite tracking, task extraction, and cross-entity dependency management
1. User Flow (5 Phases)

[Stakeholder Input]
       │
       ▼
Phase 1: CAPTURE — Raw input ingestion
       │
       ▼
Phase 2: SCENARIO — Extract/structure into 7×7 demo steps
       │  ┌─── template-agnostic (no template)
       │  ├─── pre-selected template (BA picks before extraction)
       │  └─── auto-detected template (system matches input to template)
       │
       ▼
Phase 3: PREREQUISITES — Global + per-step prerequisites
       │
       ▼
Phase 4: TASKS — Extract from scenario (AI-assisted) + manual additions
       │
       ▼
Phase 5: REVIEW — Dependency validation, readiness check
2. Template System
Templates are skeletons — pre-defined step/substep structures that can be applied to accelerate scenario structuring. They don't contain tasks or prerequisites, only the demo flow outline.

Template Modes (on extraction)
Mode	Behavior
NONE	Template-agnostic. Steps created from scratch based on input.
PRE_SELECTED	BA selects a template before extraction. Extraction populates the template's step structure.
AUTO_DETECTED	System analyzes input and suggests matching template. BA confirms or overrides.
Built-in Template Skeletons (Powervetra Domain)
Template 1: "New Document Model"

Step	Name	Description
1	Requirements Gathering	Elicit stakeholder needs, define domain entities
2	Schema Design	Define GraphQL state types, scalars, enums
3	Module & Operation Planning	Group operations into modules, define inputs
4	MCP Implementation	Create document model via reactor-mcp, set schemas
5	Reducer Implementation	Write pure synchronous reducer logic
6	Error Handling	Define operation errors, edge cases
7	Quality Assurance	TypeScript checks, linting, testing
Template 2: "Editor Build"

Step	Name	Description
1	Model Review	Understand document model state and operations
2	Editor Scaffolding	Create editor document, confirm via MCP
3	Hook Integration	Wire useSelectedDocument and dispatch hooks
4	Component Architecture	Design modular UI components
5	Form & Interaction Logic	Implement CRUD flows, validation
6	Styling & Polish	Tailwind/scoped styles, responsive layout
7	Testing & Review	Visual review, type checking, lint
Template 3: "Full-Stack Feature"

Step	Name	Description
1	Feature Scoping	Define feature boundaries and acceptance criteria
2	Document Model Creation	Schema, modules, operations, reducers
3	Editor Implementation	UI components with hooks and dispatch
4	Subgraph/Processor Setup	Data views, relational DB hooks if needed
5	Integration Testing	End-to-end flow verification
6	Drive & Preview Setup	Populate preview drive with demo data
7	Deployment Prep	Build, publish, manifest verification
Template 4: "Subgraph Integration"

Step	Name	Description
1	Data Requirements	Identify query patterns and data sources
2	Schema Definition	GraphQL types, queries, mutations
3	Resolver Implementation	Data fetching and transformation logic
4	Processor Setup	Event-driven data transformation if needed
5	Gateway Integration	Supergraph stitching, routing verification
6	Database Hooks	PGlite/Kysely relational views
7	Validation & Monitoring	Query testing, performance verification
Template 5: "Drive App"

Step	Name	Description
1	App Requirements	Define app scope, target document types
2	Document Model Dependencies	Verify/create needed document models
3	App Scaffolding	Create app document, confirm via MCP
4	Multi-Document UI	Implement drive-level views and navigation
5	Cross-Document Operations	Link documents, aggregate data
6	User Experience Polish	Responsive design, accessibility
7	Build & Publish	Package verification, npm publish
Each template also includes substep skeletons (up to 7 per step). These are populated during extraction or manually by the BA.

3. GraphQL State Schema

# ── Enums ──

enum WorkBreakdownPhase { CAPTURE SCENARIO PREREQUISITES TASKS REVIEW COMPLETE }
enum WorkBreakdownStatus { NOT_STARTED IN_PROGRESS ON_HOLD COMPLETED }
enum TemplateMode { NONE PRE_SELECTED AUTO_DETECTED }
enum TaskStatus { PENDING IN_PROGRESS BLOCKED DONE }
enum TaskSource { EXTRACTED MANUAL }
enum PrerequisiteScope { GLOBAL STEP }
enum PrerequisiteStatus { NOT_MET IN_PROGRESS MET }
enum DependencySourceType { TASK PREREQUISITE }
enum DependencyTargetType { TASK PREREQUISITE }

# ── Template Types ──

type TemplateSubstep {
  id: OID!
  order: Int!
  name: String!
  description: String
}

type TemplateStep {
  id: OID!
  order: Int!
  name: String!
  description: String
  substeps: [TemplateSubstep!]!
}

type DemoTemplate {
  id: OID!
  name: String!
  description: String
  domain: String
  steps: [TemplateStep!]!
  createdAt: DateTime
}

# ── Core Types ──

type StakeholderInput {
  id: OID!
  rawContent: String!
  source: String
  submittedBy: String
  createdAt: DateTime!
}

type DemoSubstep {
  id: OID!
  stepId: OID!
  order: Int!
  name: String!
  description: String
  acceptanceCriteria: String
}

type DemoStep {
  id: OID!
  order: Int!
  name: String!
  description: String
  substeps: [DemoSubstep!]!
  templateStepId: OID
}

type Prerequisite {
  id: OID!
  description: String!
  owner: String!
  scope: PrerequisiteScope!
  stepId: OID
  status: PrerequisiteStatus
  notes: String
  createdAt: DateTime
}

type Task {
  id: OID!
  name: String!
  description: String
  owner: String!
  status: TaskStatus
  source: TaskSource!
  extractionContext: String
  stepId: OID!
  substepId: OID
  sequenceOrder: Int!
  notes: String
  createdAt: DateTime
}

type Dependency {
  id: OID!
  sourceId: OID!
  sourceType: DependencySourceType!
  targetId: OID!
  targetType: DependencyTargetType!
  description: String
}

type AnalystNote {
  id: OID!
  phase: WorkBreakdownPhase!
  content: String!
  createdAt: DateTime!
}

# ── Root State ──

type WorkBreakdownState {
  title: String
  description: String
  phase: WorkBreakdownPhase
  status: WorkBreakdownStatus
  templateMode: TemplateMode
  appliedTemplateId: OID

  templates: [DemoTemplate!]!
  inputs: [StakeholderInput!]!
  steps: [DemoStep!]!
  prerequisites: [Prerequisite!]!
  tasks: [Task!]!
  dependencies: [Dependency!]!
  notes: [AnalystNote!]!
}
4. Modules & Operations (7 modules, 31 operations)
Module 1: project (3 ops)
Operation	Input	Purpose
SET_PROJECT_INFO	title, description	Set project-level metadata
SET_PHASE	phase: WorkBreakdownPhase!, timestamp: DateTime!	Advance workflow phase
SET_STATUS	status: WorkBreakdownStatus!	Set overall project status
Module 2: templates (5 ops)
Operation	Input	Purpose
ADD_TEMPLATE	id, name!, description, domain, steps: [TemplateStepInput!]!, createdAt	Add a demo template skeleton
UPDATE_TEMPLATE	id!, name, description, domain	Update template metadata
REMOVE_TEMPLATE	id!	Delete a template
SET_TEMPLATE_MODE	mode: TemplateMode!	Set extraction mode (none/pre-selected/auto-detected)
APPLY_TEMPLATE	templateId!, timestamp: DateTime!	Apply template steps to current scenario, set appliedTemplateId
Module 3: scenario (9 ops)
Operation	Input	Purpose
ADD_INPUT	id!, rawContent!, source, submittedBy, createdAt!	Capture raw stakeholder input
UPDATE_INPUT	id!, rawContent, source, submittedBy	Edit raw input
REMOVE_INPUT	id!	Remove an input
ADD_STEP	id!, order!, name!, description, templateStepId	Add a demo step (from scratch or template-linked)
UPDATE_STEP	id!, order, name, description	Edit step details
REMOVE_STEP	id!	Remove a step (cascades to substeps)
ADD_SUBSTEP	id!, stepId!, order!, name!, description, acceptanceCriteria	Add a substep under a step
UPDATE_SUBSTEP	id!, stepId!, order, name, description, acceptanceCriteria	Edit substep details
REMOVE_SUBSTEP	id!, stepId!	Remove a substep
Module 4: prerequisites (4 ops)
Operation	Input	Purpose
ADD_PREREQUISITE	id!, description!, owner!, scope!, stepId, notes, createdAt!	Add global or step-level prerequisite
UPDATE_PREREQUISITE	id!, description, owner, notes	Edit prerequisite
REMOVE_PREREQUISITE	id!	Remove a prerequisite
SET_PREREQUISITE_STATUS	id!, status: PrerequisiteStatus!	Mark prerequisite as met/in-progress/not-met
Module 5: tasks (5 ops)
Operation	Input	Purpose
ADD_TASK	id!, name!, description, owner!, stepId!, substepId, sequenceOrder!, source!, extractionContext, notes, createdAt!	Manually add a single task
BULK_ADD_TASKS	tasks: [TaskInput!]!	Batch-add extracted tasks (AI-assisted or bulk import)
UPDATE_TASK	id!, name, description, owner, stepId, substepId, sequenceOrder, notes	Edit task details
REMOVE_TASK	id!	Remove a task
SET_TASK_STATUS	id!, status: TaskStatus!	Update task status
Module 6: dependencies (3 ops)
Operation	Input	Purpose
ADD_DEPENDENCY	id!, sourceId!, sourceType!, targetId!, targetType!, description	Create a directed dependency edge
UPDATE_DEPENDENCY	id!, description	Edit dependency description
REMOVE_DEPENDENCY	id!	Remove a dependency
Module 7: notes (2 ops)
Operation	Input	Purpose
ADD_NOTE	id!, phase!, content!, createdAt!	Record analyst observation tied to a phase
REMOVE_NOTE	id!	Remove a note
5. Error Definitions (unique per operation)
Operation	Error Name	Condition
APPLY_TEMPLATE	ApplyTemplateNotFoundError	templateId doesn't exist
APPLY_TEMPLATE	ApplyTemplateStepsExistError	Steps already exist, would overwrite
UPDATE_STEP	UpdateStepNotFoundError	stepId doesn't exist
REMOVE_STEP	RemoveStepNotFoundError	stepId doesn't exist
ADD_SUBSTEP	AddSubstepStepNotFoundError	parent stepId doesn't exist
UPDATE_SUBSTEP	UpdateSubstepNotFoundError	substepId doesn't exist
REMOVE_SUBSTEP	RemoveSubstepNotFoundError	substepId doesn't exist
UPDATE_PREREQUISITE	UpdatePrerequisiteNotFoundError	prerequisiteId doesn't exist
REMOVE_PREREQUISITE	RemovePrerequisiteNotFoundError	prerequisiteId doesn't exist
SET_PREREQUISITE_STATUS	SetPrerequisiteStatusNotFoundError	prerequisiteId doesn't exist
UPDATE_TASK	UpdateTaskNotFoundError	taskId doesn't exist
REMOVE_TASK	RemoveTaskNotFoundError	taskId doesn't exist
SET_TASK_STATUS	SetTaskStatusNotFoundError	taskId doesn't exist
UPDATE_DEPENDENCY	UpdateDependencyNotFoundError	dependencyId doesn't exist
REMOVE_DEPENDENCY	RemoveDependencyNotFoundError	dependencyId doesn't exist
REMOVE_NOTE	RemoveNoteNotFoundError	noteId doesn't exist
UPDATE_TEMPLATE	UpdateTemplateNotFoundError	templateId doesn't exist
REMOVE_TEMPLATE	RemoveTemplateNotFoundError	templateId doesn't exist
UPDATE_INPUT	UpdateInputNotFoundError	inputId doesn't exist
REMOVE_INPUT	RemoveInputNotFoundError	inputId doesn't exist
6. Dependency Graph (DAG)
The unified Dependency type supports all cross-entity relationships:

Source Type	Target Type	Example
TASK	TASK	"Deploy contract" depends on "Compile contract"
PREREQUISITE	TASK	"API key obtained" must be met before "Configure endpoint"
PREREQUISITE	PREREQUISITE	"Budget approved" before "Hardware purchased"
TASK	PREREQUISITE	"Verify credentials" validates "API key obtained"
Direction: source must complete before target can start.

7. Template + Extraction Interaction

BA receives vague input
        │
        ├─ Mode: NONE ──────────► SET_TEMPLATE_MODE(NONE)
        │                          Steps created from scratch via ADD_STEP
        │
        ├─ Mode: PRE_SELECTED ──► SET_TEMPLATE_MODE(PRE_SELECTED)
        │                          BA picks template ► APPLY_TEMPLATE(templateId)
        │                          Template steps populated into state
        │
        └─ Mode: AUTO_DETECTED ─► SET_TEMPLATE_MODE(AUTO_DETECTED)
                                   AI analyzes input, suggests template
                                   BA confirms ► APPLY_TEMPLATE(templateId)
                                   or overrides ► ADD_STEP from scratch

After steps exist (from template or scratch):
  ► AI extracts tasks via BULK_ADD_TASKS (source: EXTRACTED)
  ► BA manually adds tasks via ADD_TASK (source: MANUAL)
  ► Both coexist — extraction doesn't prevent manual additions
8. Key Design Decisions
Decision	Rationale
No effort estimation	User explicitly removed — not needed at this stage
TaskSource enum (EXTRACTED vs MANUAL)	Distinguish AI-extracted from manually-added tasks
extractionContext on Task	Records what input/step context the extraction was based on
Unified Dependency type	Single entity handles task→task, prereq→task, prereq→prereq
Templates are skeletons only	Steps/substeps structure, no tasks or prerequisites
templateStepId on DemoStep	Links step back to its template origin (nullable for from-scratch)
appliedTemplateId on state	Records which template was used (nullable if none)
7×7 soft limit	UI guidance, not enforced by schema
9. Initial State

{
  "title": null,
  "description": null,
  "phase": "CAPTURE",
  "status": "NOT_STARTED",
  "templateMode": "NONE",
  "appliedTemplateId": null,
  "templates": [],
  "inputs": [],
  "steps": [],
  "prerequisites": [],
  "tasks": [],
  "dependencies": [],
  "notes": []
}