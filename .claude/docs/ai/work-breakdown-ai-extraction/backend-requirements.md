# Backend Requirements: AI-Powered Extraction for Work Breakdown Editor

## Context

The Work Breakdown Editor currently uses **rule-based keyword matching** to extract demo scenario steps and tasks from stakeholder inputs. This works but produces rigid, template-driven output regardless of input nuance. We want to replace (or augment) this with an AI service (Claude or similar) that can semantically understand stakeholder inputs and generate contextually relevant demo steps, substeps, and tasks.

**Who uses it**: Business analysts and project leads decomposing work into executable tasks during the CAPTURE -> STRUCTURE -> EXECUTION workflow phases.

**What success looks like**: A user pastes unstructured stakeholder requirements into the Capture phase, clicks "Extract Scenario" or "Extract Tasks", and receives intelligently decomposed steps/tasks that reflect the actual content -- not just keyword-matched templates.

---

## Current Architecture Context

The Powerhouse ecosystem uses a **document model + editor + processor/subgraph** architecture:

- **Editors** are React components that dispatch **actions** to modify document state via pure reducers
- **Processors** handle server-side event-driven transformations
- **Subgraphs** provide query-time data resolution
- **Reducers are pure and synchronous** -- no API calls, no side effects, no async
- All dynamic values (IDs, timestamps) must come from action input, never generated inside reducers

**What exists today**:
- `BULK_ADD_TASKS` operation -- designed for batch import of extracted tasks
- `Task.extractionContext` field -- stores provenance info ("Rule-based extraction from demo steps")
- `Task.source` enum with `EXTRACTED` value -- distinguishes AI-generated from manual tasks
- Rule-based extraction in `editor.tsx` using keyword regex patterns
- No external API calls anywhere in the current codebase
- No environment variable handling for API keys

---

## Screens/Components

### Extract Scenario (CAPTURE -> STRUCTURE transition)

**Purpose**: User has entered stakeholder inputs (raw text requirements). They click "Extract Scenario" and the system should generate a hierarchical set of demo steps and substeps.

**Data I need from the AI service**:
- A list of demo steps, where each step has:
  - A short descriptive name (what this phase of work is about)
  - A description of the step's purpose
  - Acceptance criteria (how we know this step is done)
  - An ordered list of substeps, each with:
    - A short descriptive name
    - A description
    - Acceptance criteria
- The steps should be ordered in a logical execution sequence
- The output should reflect the actual content of the stakeholder inputs, not generic templates

**What the user provides as input to the AI**:
- All current `StakeholderInput` entries (raw text with source and submittedBy metadata)
- Optionally, the project title and description for additional context
- Optionally, a selected template mode hint (e.g., "this is about building a document model")

**Actions after receiving AI response**:
- For each step: dispatch `ADD_STEP` with the AI-generated name, description, acceptance criteria
- For each substep: dispatch `ADD_SUBSTEP` linked to its parent step
- Auto-advance phase from CAPTURE to STRUCTURE

**States to handle**:
- **Loading**: AI is processing the inputs (could take 5-30 seconds)
- **Empty**: AI returns no meaningful steps (input was too vague)
- **Error**: API call fails (network, rate limit, auth, timeout)
- **Partial**: AI returns some steps but the response was truncated or incomplete
- **Success**: Full set of steps/substeps generated

**Business rules affecting UI**:
- If steps already exist, user should be warned before overwriting (existing validation)
- Extraction context should record that this was AI-generated (model name, timestamp)
- User should be able to review/edit AI output before committing (or commit and edit in-place)

---

### Extract Tasks (STRUCTURE -> EXECUTION transition)

**Purpose**: User has a set of demo steps and substeps. They click "Extract Tasks" and the system should generate discrete, actionable work items from those steps.

**Data I need from the AI service**:
- A list of tasks, where each task includes:
  - A short task name (action-oriented)
  - A description of what needs to be done
  - Which step it belongs to (by step name or position, since IDs are frontend-generated)
  - Suggested owner role (e.g., "Engineer", "Designer", "Analyst")
  - Suggested sequence order within the step
- Optionally, suggested prerequisites (conditions that must be met before a task can start)
- Optionally, suggested dependencies between tasks

**What the user provides as input to the AI**:
- All current demo steps and their substeps (names, descriptions, acceptance criteria)
- The stakeholder inputs for additional context
- Project title and description

**Actions after receiving AI response**:
- Dispatch `BULK_ADD_TASKS` with the generated tasks (each task gets a frontend-generated ID)
- Set `source: "EXTRACTED"` and `extractionContext` with AI model info
- Optionally dispatch `ADD_PREREQUISITE` for suggested prerequisites
- Optionally dispatch `ADD_DEPENDENCY` for suggested dependencies
- Auto-advance phase from STRUCTURE to EXECUTION

**States to handle**:
- **Loading**: AI is processing the steps
- **Empty**: No tasks could be extracted (steps are too vague)
- **Error**: API failure
- **Success**: Tasks generated and ready for review

**Business rules affecting UI**:
- Existing tasks should not be duplicated if extraction is run again
- User should see which tasks were AI-generated vs manually created (already supported via `source` field)
- Task count per step should be reasonable (not 50 tasks for a simple step)

---

### Potential Future: Prerequisite Inference

**Purpose**: After tasks are created, AI could suggest prerequisites and dependencies.

**Data I would need**:
- Suggested prerequisite names with scope (GLOBAL or STEP-specific)
- Suggested dependency edges between tasks
- Confidence level or reasoning for each suggestion

*Not requesting this for v1, but flagging it as a natural extension.*

---

## Uncertainties

- [ ] **Where should the AI call live?** The Powerhouse architecture has three extension points: editors (client-side), processors (server-side event-driven), and subgraphs (query-time). An editor-side call is simplest for a demo, but a processor might be more appropriate for production (keeps API keys server-side, enables caching, supports offline reconciliation).

- [ ] **How do we handle API keys?** No `.env` or environment variable pattern exists in the current codebase. For a demo, a hardcoded key in the editor works but is insecure. For production, the key needs to live server-side (processor or subgraph layer). What's the preferred approach?

- [ ] **Should the AI response be stored as a document operation?** Currently, extraction results are immediately dispatched as individual `ADD_STEP`/`BULK_ADD_TASKS` operations. Should we also store the raw AI response somewhere for audit/debugging? The `extractionContext` field exists but only holds a short string.

- [ ] **Streaming vs. batch response?** For large inputs, Claude's response could be streamed to show progress. But the document model's reducer pattern expects complete actions. Should the UI show streaming output as a preview, then dispatch the final result as operations?

- [ ] **What happens when extraction is re-run?** The current rule-based extraction warns if steps already exist. Should re-running AI extraction append, replace, or present a diff?

- [ ] **Token/cost management**: Stakeholder inputs could be very long. Should we truncate, summarize, or chunk inputs before sending to the AI? Who owns cost tracking?

- [ ] **Prompt engineering ownership**: Who owns and maintains the prompts? Should prompts be hardcoded, stored as templates in the document model, or configurable by the user?

---

## Questions for Backend

- Would it make sense to implement this as a **Powerhouse processor** that listens for phase transitions and triggers extraction automatically, rather than having the editor make direct API calls? That would keep API keys server-side and enable background processing.

- Is there an existing pattern in the Powerhouse ecosystem for **editors to call external services**? The current codebase has zero external API calls from editors. Should we establish a pattern (e.g., a `useExternalService` hook) or keep this as a one-off?

- Should the AI extraction be **synchronous (request-response)** or **asynchronous (dispatch a "request extraction" action, processor handles it, result appears later)**? The async pattern fits the document model philosophy better but adds complexity.

- Is there a preferred way to **store API keys/secrets** in the Powerhouse stack? Environment variables, a secrets document, a configuration processor?

- Should we consider a **hybrid approach** where the rule-based extraction remains as a fast fallback, and AI extraction is an "enhanced" option the user can toggle?

- For the demo, is it acceptable to make the **Claude API call directly from the editor component** (client-side) with a key stored in a `.env` file, knowing this is not production-safe?

- Would it make sense to create a **new document model** (e.g., `powerhouse/ai-extraction-config`) to store prompt templates, model preferences, and extraction history?

---

## Implementation Complexity Assessment

### Minimum Viable Demo (Client-Side, ~2-3 days of work)

| What | How |
|------|-----|
| Claude API call | `fetch()` in editor component to Claude Messages API |
| API key | `.env` file or hardcoded constant (demo only) |
| Prompt | Hardcoded in editor, sends stakeholder inputs as user message |
| Response parsing | Extract structured JSON from Claude's response |
| State update | Dispatch existing `ADD_STEP`/`BULK_ADD_TASKS` operations |
| Error handling | Toast notifications for failures |
| Loading state | `useState` boolean with spinner/overlay |

**Risks**: API key exposure in client bundle, no caching, no retry logic, prompt not tunable.

### Production-Ready (Processor-Based, ~1-2 weeks)

| What | How |
|------|-----|
| Claude API call | Powerhouse processor listening for extraction events |
| API key | Server-side environment variable |
| Prompt | Configurable template (possibly its own document model) |
| Response parsing | Structured output parsing with validation |
| State update | Processor dispatches operations back to the document |
| Error handling | Operation-level error recording + UI toast |
| Loading state | Async status field on document (IDLE/EXTRACTING/DONE/ERROR) |
| Caching | Previous extractions cached to avoid redundant calls |
| Cost tracking | Token usage logged per extraction |

**Requires**: Understanding of Powerhouse processor lifecycle, server-side deployment, secret management.

---

## What Frontend Needs From Backend (Summary)

1. **An endpoint or service** that accepts stakeholder text + context and returns structured steps/tasks
2. **Structured response format** that maps cleanly to our existing operations (`ADD_STEP`, `ADD_SUBSTEP`, `BULK_ADD_TASKS`)
3. **Error responses** that distinguish between "AI couldn't extract anything useful" vs "service failure"
4. **Authentication/authorization** handled server-side so the editor doesn't need API keys
5. **Reasonable latency** -- under 30 seconds for typical inputs, with a way to show progress

Let me know if this doesn't make sense for how the data is structured. Open to suggestions on a better approach -- especially around whether a processor, subgraph, or direct editor call is the right pattern for this use case. Push back if the AI integration complicates the document model philosophy unnecessarily.

---

## Discussion Log

*[Backend responses, decisions made, changes to requirements will be added here]*
