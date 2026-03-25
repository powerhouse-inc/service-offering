Work Breakdown Editor: Business Requirements & Logic

1. Executive Summary

The Work Breakdown Editor is a high-density, hierarchical project management tool designed to transform messy stakeholder input into a structured demo scenario (7×7 model) and subsequently into actionable developer tasks. It bridges the gap between Narrative (what the user sees) and Execution (what the developer builds).

2. Business Logic & Rules

2.1 The 4-Phase Workflow

The application enforces a linear progression to ensure data integrity:

CAPTURE: Ingestion of raw text/transcripts. Unlocks the "Structure" engine.

STRUCTURE: Definition of the Demo Scenario (Steps and Substeps).

EXECUTION: Conversion of narrative points into technical tasks, assignment of owners, and blocker management.

REVIEW: Final readiness check based on global progress and critical blockers.

2.2 Hierarchical Data Model

The editor uses a deeply nested structure to maintain context:

Step: The primary narrative milestone (e.g., "Project Scaffolding").

Substep: Granular user actions within a step (e.g., "Click Save Button").

Checkpoint (Prerequisite): Non-technical or technical blockers that must be "MET" before work begins. Pinned to the top of the list.

Task: Atomic technical work units. Can belong to a Step or a Substep.

2.3 Brute-Force Progress Calculation

Progress is calculated using a weighted average of task statuses:

DONE: 1.0 (100%)

IN_PROGRESS: 0.5 (50%)

PENDING / BLOCKED: 0 (0%)

Formula: (Sum of Status Weights) / (Total Number of Tasks) * 100

2.4 Dependency & Blocker Logic

Internal Blocker: A task or checkpoint within the breakdown that prevents another task from starting.

External Blocker: A factor outside the breakdown (e.g., "Client Approval").

Communication: When a task is marked BLOCKED, the user must provide a reason. This reason is automatically injected into the Notes / Context column.

3. User Flows

Flow A: From Messy Input to Structured Scenario

User enters CAPTURE phase and pastes a meeting transcript.

User clicks Process & Structure, moving to the STRUCTURE phase.

User clicks Extract Scenario. AI generates a 7×7 model (Steps + Substeps).

User manually adds "New Demo Substep" to refine the narrative.

User uses Move Up/Down buttons to reorder steps to match the demo flow.

Flow B: From Structure to Technical Execution

User (Analyst) clicks Extract Tasks in the Header.

The system generates technical tasks for every Step and Substep.

The system automatically advances the app to the EXECUTION phase.

Developer/Lead assigns Owners to the new tasks.

Lead adds a Checkpoint (e.g., "Verify API Access") and pins it to the top of Step 1.

Flow C: Managing Blockers

Developer changes Task status to BLOCKED.

A Blocker Modal appears.

Developer selects "Link Internal Item" and searches for the blocking task.

Developer adds a comment: "Waiting for schema finalization."

The Parent Step progress bar reflects the blockage with a visual rose-colored alert.

4. UX & UI Principles

4.1 "Spreadsheet on Steroids" (The High-Density Grid)

Efficiency: Inline editing for all text fields. No "Edit" buttons required.

Visual Hierarchy: Indentation and iconography distinguish between narrative (Steps/Substeps) and technical work (Tasks/Checkpoints).

Expansion: Users can collapse branches to focus on specific demo stages.

4.2 UI Components

Status Pills: Color-coded (Emerald for Done, Blue for In Progress, Amber for Pending, Rose for Blocked).

Aggregated Avatars: Step rows show a summary of all assignees working on that step, providing immediate visibility into team distribution.

Context Column: A dedicated area for "Execution Context"—a live feed of blocker reasons and manual notes.

Phase Toggle: A global header component that visually tracks the project's maturity level.

4.3 Agentic Readiness

Unique Addressing: While hidden in the narrative view, every item has an underlying ID, making the document ready for AI Agents to read and write statuses via API.

Context Persistence: The "Notes" field ensures that human-readable context is preserved even when automated extractions take place.