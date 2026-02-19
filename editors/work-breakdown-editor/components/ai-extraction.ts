/**
 * AI-powered extraction for Work Breakdown Editor.
 *
 * Calls the Claude Messages API to semantically decompose stakeholder inputs
 * into structured demo steps/substeps and actionable tasks.
 *
 * The API key is stored in localStorage under "wbd_anthropic_api_key".
 * Set it via the browser console: localStorage.setItem("wbd_anthropic_api_key", "sk-ant-...")
 * Or use the setAIApiKey() helper exported from this module.
 *
 * Demo only — not production-safe.
 */

// ── Types for AI responses ──

export interface AIStep {
  name: string;
  description: string;
  acceptanceCriteria?: string;
  substeps: AISubstep[];
}

export interface AISubstep {
  name: string;
  description: string;
  acceptanceCriteria?: string;
}

export interface AITask {
  name: string;
  description: string;
  owner: string;
  /** The step name this task belongs to (matched by the caller) */
  stepName: string;
  /** Optional substep name for finer mapping */
  substepName?: string;
}

export interface ScenarioExtractionResult {
  steps: AIStep[];
}

export interface TaskExtractionResult {
  tasks: AITask[];
}

/** Current project state passed to AI for context-aware generation. */
export interface ProjectStateContext {
  phase?: string | null;
  status?: string | null;
  templateMode?: string | null;
  appliedTemplateId?: string | null;
  stepsCount: number;
  tasksCount: number;
  prerequisitesCount: number;
  existingStepNames?: string[];
  existingTaskSummary?: Array<{
    stepName: string;
    taskCount: number;
    owners: string[];
  }>;
  /** Free-text context/instructions provided by the user via the editor UI. */
  userContext?: string;
}

// ── Configuration ──

const API_URL = "https://api.anthropic.com/v1/messages";
export const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 8192;

const STORAGE_KEY = "wbd_anthropic_api_key";

function getApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function isAIAvailable(): boolean {
  return getApiKey() !== null;
}

/** Set or clear the API key (call from editor UI or browser console). */
export function setAIApiKey(key: string | null): void {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ── Powerhouse Domain Context ──
// Deep ecosystem knowledge from CLAUDE.md — gives the AI rich Powerhouse awareness.

const POWERHOUSE_CONTEXT = `
## Powerhouse Ecosystem Context

You are working within the Powerhouse ecosystem — an operation-sourced document management platform. Every piece of data is a **document** governed by a **document model**, and all state changes happen through **operations** (actions dispatched and recorded with metadata).

### Core Architecture

- **Document Model**: A template defining schema (GraphQL) and allowed operations for a document type. Built with modules containing operations. The schema defines both the state shape and the input types for each operation. Created and managed via MCP (Model Context Protocol) tools.
- **Document**: An instance of a document model containing actual data that follows the model's structure. Documents live in drives and are modified exclusively through operations.
- **Editor**: A React UI component for editing a single document instance. Uses hooks like \`useSelectedXDocument()\` and dispatches actions via generated creator functions (e.g., \`addStep()\`, \`updateTask()\`).
- **App (Drive Editor)**: A React UI for managing collections of documents in a drive. Uses \`useSelectedDrive()\` hook.
- **Processor**: Server-side logic that reacts to document operations. Used for cross-document computation, integrations, webhooks, and external API calls. Processors watch documents and dispatch derived operations.
- **Subgraph**: A GraphQL API layer that exposes document data for querying by external consumers.
- **Drive**: A collection of documents and folders (type "powerhouse/document-drive"). Documents are added to drives via ADD_FILE operations.

### Document Model Structure
- **State Schema**: GraphQL types defining the document's data shape. Global state (shared) uses \`<ModelName>State\` type. Local state (per-user) uses \`<ModelName>LocalState\`.
- **Modules**: Logical groupings of related operations (e.g., "tasks", "scenario", "prerequisites").
- **Operations**: Named actions with input schemas (e.g., ADD_STEP, UPDATE_TASK). Each operation has an input type, optional error types, and a reducer.
- **Reducers**: Pure synchronous functions that take current state + operation input and return new state. Wrapped with Mutative (direct mutation is safe). CRITICAL: No async, no Date.now(), no crypto.randomUUID() — all dynamic values come from operation inputs.

### Schema Conventions
- Custom scalars: OID (Object ID), PHID (Powerhouse ID), OLabel, DateTime, Date, Amount_Money, Amount_Percentage, Currency, URL, EmailAddress, EthereumAddress
- Arrays must be \`[Type!]!\` (non-nullable items, non-nullable array)
- Objects in arrays must have an \`OID!\` field for unique identification
- State fields are mostly optional (supports creating empty documents)
- Input types reflect user intent with descriptive names

### Development Workflow
1. Define document model schema (GraphQL state + operation input types)
2. Create document model via MCP (ADD_MODULE, ADD_OPERATION, SET_STATE_SCHEMA, SET_OPERATION_SCHEMA, SET_OPERATION_REDUCER)
3. Implement reducer logic in \`src/reducers/\` — auto-generated stubs must be replaced with actual logic
4. Create document editor (React component using hooks + action creators)
5. Create processors for cross-document logic (billing projections, cached snippets, etc.)
6. Create subgraphs for external API exposure
7. Quality checks: \`npm run tsc\`, \`npm run lint:fix\`

### Error Handling Pattern
- Each operation defines typed errors (e.g., \`TaskNotFoundError\`, \`DuplicateStepError\`)
- Error names must be globally unique across all operations (prefix with operation name)
- Reducers throw typed errors; the operation is still recorded but with an \`.error\` property
- State is NOT mutated when a reducer throws

### Common Roles in Powerhouse Projects
- **Document Model Engineer**: Schema design, reducer logic, operation definitions, GraphQL types
- **Frontend Engineer**: Editor UI, React components, hooks, state management, Tailwind styling
- **Backend Engineer**: Processors, subgraphs, API integrations, cross-document logic
- **Business Analyst (BA)**: Requirements gathering, acceptance criteria, stakeholder alignment, domain modeling
- **QA Engineer**: Reducer unit tests, editor integration tests, edge case validation
- **Tech Lead**: Architecture decisions, code review, cross-cutting concerns, dependency ordering
- **DevOps**: Deployment, CI/CD, infrastructure, environment configuration
`;

// ── Work Breakdown Document Model Schema ──
// The actual schema this editor operates on — injected so AI knows the data structures.

const WBD_SCHEMA_CONTEXT = `
## Work Breakdown Document Model Schema

This is the document model you are generating data for. The AI extraction produces steps, substeps, and tasks that will be dispatched as operations to this model.

### State Structure
\`\`\`graphql
type WorkBreakdownState {
  title: String
  description: String
  phase: WorkBreakdownPhase          # CAPTURE → STRUCTURE → EXECUTION → REVIEW
  status: WorkBreakdownStatus        # NOT_STARTED, IN_PROGRESS, ON_HOLD, COMPLETED
  templateMode: TemplateMode         # NONE, PRE_SELECTED, AUTO_DETECTED
  appliedTemplateId: OID
  templates: [DemoTemplate!]!
  inputs: [StakeholderInput!]!       # Raw stakeholder requirements (the AI's input)
  steps: [DemoStep!]!                # Demo steps (what scenario extraction produces)
  prerequisites: [Prerequisite!]!
  tasks: [Task!]!                    # Work items (what task extraction produces)
  dependencies: [Dependency!]!
  notes: [AnalystNote!]!
}
\`\`\`

### Key Types

**StakeholderInput** — Raw requirements captured from stakeholders:
\`\`\`graphql
type StakeholderInput {
  id: OID!
  rawContent: String!               # Free-text requirement
  source: String                    # e.g., "Product Owner", "Client", "Tech Lead"
  submittedBy: String
  createdAt: DateTime!
}
\`\`\`

**DemoStep** — A high-level work phase in the breakdown:
\`\`\`graphql
type DemoStep {
  id: OID!
  order: Int!                       # Sequence position (1-based)
  name: String!                     # Action-oriented name
  description: String
  substeps: [DemoSubstep!]!         # Detailed breakdown within this step
  templateStepId: OID               # Link to template if applied
}
\`\`\`

**DemoSubstep** — A detailed task within a step:
\`\`\`graphql
type DemoSubstep {
  id: OID!
  stepId: OID!                      # Parent step reference
  order: Int!
  name: String!
  description: String
  acceptanceCriteria: String        # Measurable completion criteria
}
\`\`\`

**Task** — A discrete, assignable work item:
\`\`\`graphql
type Task {
  id: OID!
  name: String!                     # Action-oriented (starts with verb)
  description: String
  owner: String!                    # Role assignment
  status: TaskStatus                # PENDING, IN_PROGRESS, BLOCKED, DONE
  source: TaskSource!               # EXTRACTED (from AI) or MANUAL
  extractionContext: String          # How this task was generated
  stepId: OID!                      # Links to parent DemoStep
  substepId: OID                    # Optional link to DemoSubstep
  sequenceOrder: Int!               # Execution priority within step
  notes: String
  blockedReason: String
  blockedByItemId: OID
  createdAt: DateTime
}
\`\`\`

### Phase Flow
The editor follows a phased workflow:
1. **CAPTURE**: Collect stakeholder inputs (raw requirements)
2. **STRUCTURE**: AI extracts demo steps/substeps from inputs → user reviews/edits
3. **EXECUTION**: AI extracts tasks from steps → user assigns, tracks, manages
4. **REVIEW**: Final review of all work items, prerequisites, and dependencies

### Operations Available
- Steps: ADD_STEP, UPDATE_STEP, REMOVE_STEP
- Substeps: ADD_SUBSTEP, UPDATE_SUBSTEP, REMOVE_SUBSTEP
- Tasks: ADD_TASK, BULK_ADD_TASKS, UPDATE_TASK, REMOVE_TASK, SET_TASK_STATUS
- Prerequisites: ADD_PREREQUISITE, UPDATE_PREREQUISITE, REMOVE_PREREQUISITE
- Dependencies: ADD_DEPENDENCY, UPDATE_DEPENDENCY, REMOVE_DEPENDENCY
`;

// ── Prompts ──

function buildScenarioSystemPrompt(projectState?: ProjectStateContext): string {
  let stateSection = "";
  if (projectState) {
    const parts: string[] = ["\n## Current Project State\n"];
    if (projectState.phase)
      parts.push(`- Current phase: ${projectState.phase}`);
    if (projectState.status)
      parts.push(`- Project status: ${projectState.status}`);
    if (projectState.templateMode && projectState.templateMode !== "NONE")
      parts.push(`- Template mode: ${projectState.templateMode}`);
    if (projectState.stepsCount > 0)
      parts.push(
        `- Existing steps: ${projectState.stepsCount} (will be replaced by your output)`,
      );
    if (projectState.prerequisitesCount > 0)
      parts.push(
        `- Prerequisites already defined: ${projectState.prerequisitesCount} — consider these as constraints`,
      );
    stateSection = parts.join("\n");
  }

  const userSection = projectState?.userContext?.trim()
    ? `\n## Additional Context from User\n\n${projectState.userContext.trim()}\n`
    : "";

  return `You are a project decomposition assistant for the Powerhouse ecosystem work breakdown tool.

${POWERHOUSE_CONTEXT}
${WBD_SCHEMA_CONTEXT}
${stateSection}
${userSection}

## Your Task

Given stakeholder requirements, generate a hierarchical work breakdown as structured JSON.
Your output will be dispatched as ADD_STEP and ADD_SUBSTEP operations to a WorkBreakdown document.

Rules:
- Generate 5-8 demo steps, each with 3-5 substeps
- Steps should be in logical execution sequence following the Powerhouse development workflow
- Each step and substep must have a clear, action-oriented name
- Descriptions should be concise (1-2 sentences)
- Acceptance criteria should be measurable when possible
- Tailor the breakdown to the actual content — do NOT use generic templates
- When requirements involve Powerhouse concepts, use domain-specific terminology:
  - "Define document model schema" not "Create database schema"
  - "Implement reducer logic" not "Write business logic"
  - "Build document editor" not "Create UI form"
  - "Configure MCP operations" not "Set up API endpoints"
  - "Create subgraph queries" not "Build data layer"
  - "Set up processor for cross-document logic" not "Create background job"
- Reference specific Powerhouse patterns in descriptions when relevant (GraphQL scalars, OID fields, Mutative reducers, typed errors, etc.)

Respond ONLY with valid JSON matching this exact schema (no markdown, no explanation):
{
  "steps": [
    {
      "name": "Step Name",
      "description": "What this step accomplishes",
      "acceptanceCriteria": "How we know this step is done",
      "substeps": [
        {
          "name": "Substep Name",
          "description": "What this substep accomplishes",
          "acceptanceCriteria": "Measurable completion criteria"
        }
      ]
    }
  ]
}`;
}

function buildTaskSystemPrompt(projectState?: ProjectStateContext): string {
  let stateSection = "";
  if (projectState) {
    const parts: string[] = ["\n## Current Project State\n"];
    if (projectState.phase)
      parts.push(`- Current phase: ${projectState.phase}`);
    if (projectState.tasksCount > 0)
      parts.push(
        `- Existing tasks: ${projectState.tasksCount} (extracted tasks will be replaced, manual tasks kept)`,
      );
    if (projectState.prerequisitesCount > 0)
      parts.push(
        `- Prerequisites defined: ${projectState.prerequisitesCount} — generated tasks should account for these`,
      );
    if (projectState.existingTaskSummary?.length) {
      parts.push(`- Current task distribution by step:`);
      for (const s of projectState.existingTaskSummary) {
        parts.push(
          `  - "${s.stepName}": ${s.taskCount} tasks (owners: ${s.owners.join(", ")})`,
        );
      }
    }
    stateSection = parts.join("\n");
  }

  const userSection = projectState?.userContext?.trim()
    ? `\n## Additional Context from User\n\n${projectState.userContext.trim()}\n`
    : "";

  return `You are a task extraction assistant for the Powerhouse ecosystem work breakdown tool.

${POWERHOUSE_CONTEXT}
${WBD_SCHEMA_CONTEXT}
${stateSection}
${userSection}

## Your Task

Given a set of demo steps and substeps, generate discrete, actionable work items as structured JSON.
Your output will be dispatched as BULK_ADD_TASKS operations to a WorkBreakdown document.
Each task maps to the Task type in the schema above.

Rules:
- Generate 2-4 tasks per step (keep it focused — avoid filler tasks)
- Task names should be action-oriented (start with a verb)
- Assign owner roles appropriate to Powerhouse development:
  - "Document Model Engineer" for schema design, GraphQL types, reducer logic, operation definitions, SET_STATE_SCHEMA, SET_OPERATION_REDUCER
  - "Frontend Engineer" for editors, React components, UI, Tailwind, useSelectedXDocument hooks, action creator dispatch
  - "Backend Engineer" for processors, subgraphs, API integrations, cross-document watchers
  - "BA" for requirements, acceptance criteria, stakeholder alignment, domain modeling
  - "QA Engineer" for reducer unit tests, editor integration tests, error path validation
  - "Tech Lead" for architecture decisions, dependency ordering, code review
  - "DevOps" for deployment, CI/CD, infrastructure
- Map each task to its parent step by the step's exact name
- Optionally map tasks to a substep by the substep's exact name
- Descriptions should reference specific Powerhouse patterns when relevant:
  - "Write pure reducer for ADD_X operation using Mutative state mutation"
  - "Create React editor component using useSelectedXDocument hook"
  - "Define GraphQL input type with OID! for entity identification"
  - "Add typed errors (XNotFoundError, DuplicateXError) to operation"
  - "Implement processor to watch document changes and dispatch derived operations"
  - "Create subgraph resolvers exposing document state via GraphQL API"

IMPORTANT: Keep your response concise. Use short descriptions (1 sentence). Do NOT add explanatory text outside the JSON.

Respond ONLY with valid JSON matching this exact schema (no markdown, no explanation):
{
  "tasks": [
    {
      "name": "Implement X reducer logic",
      "description": "What needs to be done",
      "owner": "Document Model Engineer",
      "stepName": "Exact Step Name",
      "substepName": "Exact Substep Name or omit"
    }
  ]
}`;
}

// ── API call ──

async function callClaude(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "No API key configured. Add VITE_ANTHROPIC_API_KEY to .env.local",
    );
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`Claude API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text?: string }>;
    stop_reason?: string;
  };

  const textBlock = data.content.find((block) => block.type === "text");
  if (!textBlock?.text) {
    throw new Error("No text response from Claude API");
  }

  // Warn if response was truncated due to token limit
  if (data.stop_reason === "max_tokens") {
    console.warn(
      "[ai-extraction] Response truncated at max_tokens — attempting to salvage partial JSON",
    );
  }

  return textBlock.text;
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    // If JSON is truncated (likely token limit), try to salvage partial data
    const repaired = tryRepairTruncatedJSON(cleaned);
    if (repaired) {
      return JSON.parse(repaired) as T;
    }
    throw e;
  }
}

/**
 * Attempts to repair truncated JSON by closing open arrays/objects.
 * Handles the common case where the response was cut off mid-output.
 */
function tryRepairTruncatedJSON(raw: string): string | null {
  let repaired = raw;

  // Remove any trailing incomplete string value
  repaired = repaired.replace(/,\s*"[^"]*$/, "");
  // Remove trailing incomplete key-value pair
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*("[^"]*)?$/, "");
  // Remove trailing incomplete object
  repaired = repaired.replace(/,\s*\{[^}]*$/, "");

  // Count unclosed brackets and braces
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escaped = false;

  for (const ch of repaired) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") braces++;
    if (ch === "}") braces--;
    if (ch === "[") brackets++;
    if (ch === "]") brackets--;
  }

  // Close any unclosed structures
  for (let i = 0; i < brackets; i++) repaired += "]";
  for (let i = 0; i < braces; i++) repaired += "}";

  try {
    JSON.parse(repaired);
    return repaired;
  } catch {
    return null;
  }
}

// ── Public API ──

export async function extractScenarioWithAI(context: {
  projectTitle?: string | null;
  projectDescription?: string | null;
  stakeholderInputs: Array<{ rawContent: string; source?: string | null }>;
  templateHint?: string | null;
  projectState?: ProjectStateContext;
}): Promise<ScenarioExtractionResult> {
  const parts: string[] = [];

  if (context.projectTitle) {
    parts.push(`Project: ${context.projectTitle}`);
  }
  if (context.projectDescription) {
    parts.push(`Description: ${context.projectDescription}`);
  }
  if (context.templateHint) {
    parts.push(`Domain hint: ${context.templateHint}`);
  }

  parts.push("\n--- Stakeholder Requirements ---\n");

  for (const input of context.stakeholderInputs) {
    const sourceLabel = input.source ? ` (Source: ${input.source})` : "";
    parts.push(`${input.rawContent}${sourceLabel}\n`);
  }

  const userMessage = parts.join("\n");
  const systemPrompt = buildScenarioSystemPrompt(context.projectState);
  const raw = await callClaude(systemPrompt, userMessage);
  const result = parseJSON<ScenarioExtractionResult>(raw);

  if (
    !result.steps ||
    !Array.isArray(result.steps) ||
    result.steps.length === 0
  ) {
    throw new Error(
      "AI returned no steps. Try adding more detail to your stakeholder inputs.",
    );
  }

  return result;
}

export async function extractTasksWithAI(context: {
  projectTitle?: string | null;
  projectDescription?: string | null;
  steps: Array<{
    name: string;
    description?: string | null;
    substeps: Array<{
      name: string;
      description?: string | null;
    }>;
  }>;
  stakeholderInputs?: Array<{ rawContent: string }>;
  projectState?: ProjectStateContext;
}): Promise<TaskExtractionResult> {
  const parts: string[] = [];

  if (context.projectTitle) {
    parts.push(`Project: ${context.projectTitle}`);
  }
  if (context.projectDescription) {
    parts.push(`Description: ${context.projectDescription}`);
  }

  parts.push("\n--- Demo Steps ---\n");

  for (const step of context.steps) {
    parts.push(`Step: ${step.name}`);
    if (step.description) parts.push(`  Description: ${step.description}`);
    for (const sub of step.substeps) {
      parts.push(`  Substep: ${sub.name}`);
      if (sub.description) parts.push(`    Description: ${sub.description}`);
    }
    parts.push("");
  }

  if (context.stakeholderInputs?.length) {
    parts.push("\n--- Original Requirements (for context) ---\n");
    for (const input of context.stakeholderInputs.slice(0, 5)) {
      parts.push(input.rawContent.slice(0, 1000));
      parts.push("");
    }
  }

  const userMessage = parts.join("\n");
  const systemPrompt = buildTaskSystemPrompt(context.projectState);
  const raw = await callClaude(systemPrompt, userMessage);
  const result = parseJSON<TaskExtractionResult>(raw);

  if (
    !result.tasks ||
    !Array.isArray(result.tasks) ||
    result.tasks.length === 0
  ) {
    throw new Error(
      "AI returned no tasks. Try adding more detail to your steps.",
    );
  }

  return result;
}
