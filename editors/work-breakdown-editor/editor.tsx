import { useState, useCallback } from "react";
import { generateId } from "document-model/core";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedWorkBreakdownDocument } from "../../document-models/work-breakdown/hooks.js";
import type { WorkBreakdownPhase } from "../../document-models/work-breakdown/gen/schema/types.js";
import {
  setPhase,
  addTask,
  addStep,
  addSubstep,
  bulkAddTasks,
  removeTask,
  removeStep,
  setAiContext,
  addExtractionRecord,
  updateExtractionRecord,
} from "../../document-models/work-breakdown/gen/creators.js";
import { CaptureView } from "./components/CaptureView.js";
import { HierarchyGrid } from "./components/HierarchyGrid.js";
import { ReadinessFooter } from "./components/ReadinessFooter.js";
import {
  isAIAvailable,
  setAIApiKey,
  extractScenarioWithAI,
  extractTasksWithAI,
  MODEL,
  type ProjectStateContext,
} from "./components/ai-extraction.js";

const PHASES: WorkBreakdownPhase[] = [
  "CAPTURE",
  "STRUCTURE",
  "EXECUTION",
  "REVIEW",
];

export default function Editor() {
  const [document, dispatch] = useSelectedWorkBreakdownDocument();
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState("");

  const [aiEnabled, setAiEnabled] = useState(isAIAvailable());
  const [showAIContext, setShowAIContext] = useState(false);
  // Local textarea state; synced to document on blur
  const [localAIContext, setLocalAIContext] = useState(
    document.state.global.aiContext ?? "",
  );

  function handleConfigureAI() {
    const current = isAIAvailable();
    const action = current ? "Replace" : "Set";
    const key = window.prompt(
      `${action} your Anthropic API key for AI extraction.\n\nThis is stored in your browser's localStorage (demo only).${current ? "\n\nLeave empty and click OK to remove the key." : ""}`,
    );
    if (key === null) return; // cancelled
    setAIApiKey(key || null);
    setAiEnabled(isAIAvailable());
  }

  const activePhase: WorkBreakdownPhase =
    document.state.global.phase ?? "CAPTURE";

  function handlePhaseChange(phase: WorkBreakdownPhase) {
    dispatch(setPhase({ phase, timestamp: new Date().toISOString() }));
  }

  // ── Build project state context for AI prompts ──

  function buildProjectState(): ProjectStateContext {
    const s = document.state.global;
    // Summarize task distribution by step for AI awareness
    const stepTaskMap = new Map<
      string,
      { taskCount: number; owners: Set<string> }
    >();
    for (const step of s.steps) {
      stepTaskMap.set(step.name, { taskCount: 0, owners: new Set() });
    }
    for (const task of s.tasks) {
      const step = s.steps.find((st) => st.id === task.stepId);
      if (step) {
        const entry = stepTaskMap.get(step.name);
        if (entry) {
          entry.taskCount++;
          entry.owners.add(task.owner);
        }
      }
    }

    return {
      phase: s.phase,
      status: s.status,
      templateMode: s.templateMode,
      appliedTemplateId: s.appliedTemplateId,
      stepsCount: s.steps.length,
      tasksCount: s.tasks.length,
      prerequisitesCount: s.prerequisites.length,
      existingStepNames: s.steps.map((st) => st.name),
      existingTaskSummary: Array.from(stepTaskMap.entries()).map(
        ([stepName, data]) => ({
          stepName,
          taskCount: data.taskCount,
          owners: Array.from(data.owners),
        }),
      ),
      userContext:
        (document.state.global.aiContext ?? localAIContext) || undefined,
    };
  }

  // ── Scenario extraction (AI-powered with rule-based fallback) ──

  const handleExtractScenario = useCallback(async () => {
    const state = document.state.global;

    if (state.inputs.length === 0 && state.steps.length === 0) {
      alert("Add stakeholder inputs first or create steps manually.");
      return;
    }

    if (state.steps.length > 0) {
      const ok = window.confirm(
        state.steps.length > 0 && aiEnabled
          ? "Steps already exist. AI extraction will replace all existing steps. Continue?"
          : "Steps already exist. Extraction will add new steps. Continue?",
      );
      if (!ok) return;
    }

    setIsExtracting(true);

    // If AI is available, use it; otherwise fall back to rule-based
    if (aiEnabled) {
      const recordId = generateId();
      const userContext =
        (document.state.global.aiContext ?? localAIContext) || undefined;
      dispatch(
        addExtractionRecord({
          id: recordId,
          type: "SCENARIO",
          requestedAt: new Date().toISOString(),
          model: MODEL,
          userContext: userContext ?? null,
        }),
      );

      try {
        setExtractionMessage(
          `Analyzing ${state.inputs.length} stakeholder input${state.inputs.length === 1 ? "" : "s"} with AI...`,
        );

        // Remove existing steps if replacing
        if (state.steps.length > 0) {
          for (const step of [...state.steps].reverse()) {
            dispatch(removeStep({ id: step.id }));
          }
        }

        const result = await extractScenarioWithAI({
          projectTitle: state.title,
          projectDescription: state.description,
          stakeholderInputs: state.inputs.map((i) => ({
            rawContent: i.rawContent,
            source: i.source,
          })),
          templateHint:
            state.templateMode === "PRE_SELECTED"
              ? state.appliedTemplateId
              : null,
          projectState: buildProjectState(),
        });

        setExtractionMessage("Dispatching steps...");

        result.steps.forEach((aiStep, si) => {
          const stepId = generateId();
          dispatch(
            addStep({
              id: stepId,
              order: si + 1,
              name: aiStep.name,
              description: aiStep.description,
            }),
          );
          aiStep.substeps.forEach((sub, subi) => {
            dispatch(
              addSubstep({
                id: generateId(),
                stepId,
                order: subi + 1,
                name: sub.name,
                description: sub.description,
                acceptanceCriteria: sub.acceptanceCriteria,
              }),
            );
          });
        });

        dispatch(
          updateExtractionRecord({
            id: recordId,
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
            stepsGenerated: result.steps.length,
          }),
        );

        // Auto-advance to STRUCTURE if in CAPTURE
        if (activePhase === "CAPTURE") {
          dispatch(
            setPhase({
              phase: "STRUCTURE",
              timestamp: new Date().toISOString(),
            }),
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown AI error";
        dispatch(
          updateExtractionRecord({
            id: recordId,
            status: "FAILED",
            completedAt: new Date().toISOString(),
            error: message,
          }),
        );
        alert(
          `AI extraction failed: ${message}\n\nFalling back to rule-based extraction.`,
        );
        extractScenarioRuleBased();
      }
    } else {
      extractScenarioRuleBased();
    }

    setIsExtracting(false);
    setExtractionMessage("");
  }, [document, dispatch, activePhase, aiEnabled]);

  function extractScenarioRuleBased() {
    const state = document.state.global;

    const allInputText = state.inputs
      .map((input) => input.rawContent.toLowerCase())
      .join(" ");

    const keywords = {
      documentModel: /document\s*model|schema|graphql|state|operation|reducer/i,
      editor: /editor|ui|component|react|interface|form/i,
      subgraph: /subgraph|query|resolver|data|api/i,
      driveApp: /drive\s*app|multi-document|drive-level/i,
      fullStack: /full[\s-]?stack|end[\s-]?to[\s-]?end|e2e/i,
    };

    const detected = {
      documentModel: keywords.documentModel.test(allInputText),
      editor: keywords.editor.test(allInputText),
      subgraph: keywords.subgraph.test(allInputText),
      driveApp: keywords.driveApp.test(allInputText),
      fullStack: keywords.fullStack.test(allInputText),
    };

    type StepDef = {
      name: string;
      description: string;
      substeps: Array<{ name: string; description: string }>;
    };

    let workflowSteps: StepDef[];

    if (detected.fullStack || (!detected.documentModel && !detected.editor)) {
      workflowSteps = getFullStackWorkflow();
    } else if (detected.documentModel && detected.editor) {
      workflowSteps = getDocModelEditorWorkflow();
    } else if (detected.documentModel) {
      workflowSteps = getDocModelOnlyWorkflow();
    } else if (detected.editor) {
      workflowSteps = getEditorOnlyWorkflow();
    } else if (detected.subgraph) {
      workflowSteps = getSubgraphWorkflow();
    } else {
      workflowSteps = getFullStackWorkflow();
    }

    const baseOrder = state.steps.length;
    workflowSteps.forEach((ws, si) => {
      const stepId = generateId();
      dispatch(
        addStep({
          id: stepId,
          order: baseOrder + si + 1,
          name: ws.name,
          description: ws.description,
        }),
      );
      ws.substeps.forEach((sub, subi) => {
        dispatch(
          addSubstep({
            id: generateId(),
            stepId,
            order: subi + 1,
            name: sub.name,
            description: sub.description,
          }),
        );
      });
    });

    // Auto-advance to STRUCTURE if in CAPTURE
    if (activePhase === "CAPTURE") {
      dispatch(
        setPhase({ phase: "STRUCTURE", timestamp: new Date().toISOString() }),
      );
    }
  }

  // ── Task extraction (AI-powered with rule-based fallback) ──

  const handleExtractTasks = useCallback(async () => {
    const state = document.state.global;

    if (state.steps.length === 0) {
      alert("No demo steps to extract from. Create steps first.");
      return;
    }

    const existingExtracted = state.tasks.filter(
      (t) => t.source === "EXTRACTED",
    );
    if (state.tasks.length > 0) {
      const message =
        aiEnabled && existingExtracted.length > 0
          ? `${existingExtracted.length} AI-extracted tasks exist. Replace them? (Manual tasks will be kept.)`
          : "Tasks already exist. Extraction may add duplicates. Continue?";
      const ok = window.confirm(message);
      if (!ok) return;
    }

    setIsExtracting(true);

    if (aiEnabled) {
      const recordId = generateId();
      const userContext =
        (document.state.global.aiContext ?? localAIContext) || undefined;
      dispatch(
        addExtractionRecord({
          id: recordId,
          type: "TASK",
          requestedAt: new Date().toISOString(),
          model: MODEL,
          userContext: userContext ?? null,
        }),
      );

      try {
        setExtractionMessage(
          `Extracting tasks from ${state.steps.length} steps with AI...`,
        );

        // Remove previously extracted tasks (keep manual)
        for (const task of existingExtracted) {
          dispatch(removeTask({ id: task.id }));
        }

        const result = await extractTasksWithAI({
          projectTitle: state.title,
          projectDescription: state.description,
          steps: state.steps.map((s) => ({
            name: s.name,
            description: s.description,
            substeps: s.substeps.map((sub) => ({
              name: sub.name,
              description: sub.description,
            })),
          })),
          stakeholderInputs: state.inputs.map((i) => ({
            rawContent: i.rawContent,
          })),
          projectState: buildProjectState(),
        });

        setExtractionMessage("Dispatching tasks...");

        // Build step name -> id lookup
        const stepNameToId = new Map<string, string>();
        for (const step of state.steps) {
          stepNameToId.set(step.name.toLowerCase(), step.id);
        }

        // Build substep name -> id lookup (scoped by step)
        const substepNameToId = new Map<string, string>();
        for (const step of state.steps) {
          for (const sub of step.substeps) {
            substepNameToId.set(
              `${step.name.toLowerCase()}::${sub.name.toLowerCase()}`,
              sub.id,
            );
          }
        }

        // Count existing manual tasks for sequenceOrder offset
        const manualTaskCount = state.tasks.filter(
          (t) => t.source === "MANUAL",
        ).length;

        const taskInputs = result.tasks.map((aiTask, idx) => {
          // Fuzzy-match step name
          let stepId = stepNameToId.get(aiTask.stepName.toLowerCase());
          if (!stepId) {
            // Try partial match
            for (const [name, id] of stepNameToId) {
              if (
                name.includes(aiTask.stepName.toLowerCase()) ||
                aiTask.stepName.toLowerCase().includes(name)
              ) {
                stepId = id;
                break;
              }
            }
          }
          // Default to first step if no match
          if (!stepId) {
            stepId = state.steps[0].id;
          }

          let substepId: string | undefined;
          if (aiTask.substepName) {
            const key = `${aiTask.stepName.toLowerCase()}::${aiTask.substepName.toLowerCase()}`;
            substepId = substepNameToId.get(key);
          }

          return {
            id: generateId(),
            name: aiTask.name,
            description: aiTask.description,
            owner: aiTask.owner,
            stepId,
            substepId,
            sequenceOrder: manualTaskCount + idx + 1,
            source: "EXTRACTED" as const,
            extractionContext: "AI extraction via Claude API",
            createdAt: new Date().toISOString(),
          };
        });

        dispatch(bulkAddTasks({ tasks: taskInputs }));

        dispatch(
          updateExtractionRecord({
            id: recordId,
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
            tasksGenerated: result.tasks.length,
          }),
        );

        // Auto-advance to EXECUTION
        if (activePhase === "STRUCTURE") {
          dispatch(
            setPhase({
              phase: "EXECUTION",
              timestamp: new Date().toISOString(),
            }),
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown AI error";
        dispatch(
          updateExtractionRecord({
            id: recordId,
            status: "FAILED",
            completedAt: new Date().toISOString(),
            error: message,
          }),
        );
        alert(
          `AI task extraction failed: ${message}\n\nFalling back to rule-based extraction.`,
        );
        extractTasksRuleBased();
      }
    } else {
      extractTasksRuleBased();
    }

    setIsExtracting(false);
    setExtractionMessage("");
  }, [document, dispatch, activePhase, aiEnabled]);

  function extractTasksRuleBased() {
    const state = document.state.global;

    const taskTemplates: Record<
      string,
      Array<{ name: string; owner: string }>
    > = {
      requirement: [
        { name: "Gather stakeholder requirements", owner: "BA" },
        { name: "Document functional specifications", owner: "BA" },
        { name: "Define acceptance criteria", owner: "PM" },
      ],
      schema: [
        {
          name: "Define GraphQL types and scalars",
          owner: "Backend Engineer",
        },
        { name: "Create state schema", owner: "Backend Engineer" },
        { name: "Document schema decisions", owner: "Backend Engineer" },
      ],
      reducer: [
        { name: "Implement operation reducers", owner: "Backend Engineer" },
        { name: "Add error handling", owner: "Backend Engineer" },
        { name: "Write reducer unit tests", owner: "QA Engineer" },
      ],
      editor: [
        {
          name: "Create editor document via MCP",
          owner: "Frontend Engineer",
        },
        { name: "Build UI components", owner: "Frontend Engineer" },
        { name: "Wire up dispatch hooks", owner: "Frontend Engineer" },
        { name: "Add form validation", owner: "Frontend Engineer" },
      ],
      component: [
        {
          name: "Design component architecture",
          owner: "Frontend Engineer",
        },
        { name: "Implement React components", owner: "Frontend Engineer" },
        { name: "Add TypeScript types", owner: "Frontend Engineer" },
      ],
      subgraph: [
        { name: "Define GraphQL schema", owner: "Backend Engineer" },
        { name: "Implement resolvers", owner: "Backend Engineer" },
        { name: "Set up data fetching", owner: "Backend Engineer" },
      ],
      testing: [
        { name: "Write unit tests", owner: "QA Engineer" },
        { name: "Run TypeScript checks", owner: "QA Engineer" },
        { name: "Perform integration testing", owner: "QA Engineer" },
      ],
      deployment: [
        { name: "Build production bundle", owner: "DevOps" },
        { name: "Verify manifest", owner: "DevOps" },
        { name: "Publish to npm", owner: "DevOps" },
      ],
    };

    let taskIndex = state.tasks.length;

    state.steps.forEach((step) => {
      const stepText = `${step.name} ${step.description ?? ""}`.toLowerCase();

      let templates: Array<{ name: string; owner: string }>;
      if (/requirement|gather|scope|plan/.test(stepText)) {
        templates = taskTemplates.requirement;
      } else if (/schema|graphql|type|state/.test(stepText)) {
        templates = taskTemplates.schema;
      } else if (/reducer|operation|logic/.test(stepText)) {
        templates = taskTemplates.reducer;
      } else if (/editor|scaffold/.test(stepText)) {
        templates = taskTemplates.editor;
      } else if (/component|ui|interface/.test(stepText)) {
        templates = taskTemplates.component;
      } else if (/subgraph|resolver|query/.test(stepText)) {
        templates = taskTemplates.subgraph;
      } else if (/test|qa|quality|validation/.test(stepText)) {
        templates = taskTemplates.testing;
      } else if (/deploy|publish|build/.test(stepText)) {
        templates = taskTemplates.deployment;
      } else {
        templates = [
          { name: `Plan ${step.name.toLowerCase()}`, owner: "Team Lead" },
          {
            name: `Implement ${step.name.toLowerCase()}`,
            owner: "Engineer",
          },
          {
            name: `Review ${step.name.toLowerCase()}`,
            owner: "Tech Lead",
          },
        ];
      }

      templates.slice(0, 3).forEach((template) => {
        taskIndex++;
        dispatch(
          addTask({
            id: generateId(),
            name: template.name,
            description: `Task for step: ${step.name}`,
            owner: template.owner,
            stepId: step.id,
            sequenceOrder: taskIndex,
            source: "EXTRACTED",
            extractionContext: "Rule-based extraction from demo steps",
            createdAt: new Date().toISOString(),
          }),
        );
      });

      step.substeps.slice(0, 2).forEach((substep) => {
        taskIndex++;
        dispatch(
          addTask({
            id: generateId(),
            name: substep.name,
            description:
              substep.description ?? `Task for substep: ${substep.name}`,
            owner: "Engineer",
            stepId: step.id,
            substepId: substep.id,
            sequenceOrder: taskIndex,
            source: "EXTRACTED",
            extractionContext: "Rule-based extraction from demo steps",
            createdAt: new Date().toISOString(),
          }),
        );
      });
    });

    // Auto-advance to EXECUTION
    if (activePhase === "STRUCTURE") {
      dispatch(
        setPhase({
          phase: "EXECUTION",
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  const state = document.state.global;

  return (
    <div className="wbg-editor">
      {GridStyles}
      <DocumentToolbar />

      {/* AI Extraction Loading Overlay */}
      {isExtracting && extractionMessage && (
        <div className="wbg-ai-overlay">
          <div className="wbg-ai-overlay__card">
            <div className="wbg-ai-overlay__spinner" />
            <p className="wbg-ai-overlay__message">{extractionMessage}</p>
            <p className="wbg-ai-overlay__hint">
              {aiEnabled
                ? "Powered by Claude AI"
                : "Using rule-based extraction"}
            </p>
          </div>
        </div>
      )}

      {/* Global Header */}
      <header className="wbg-header">
        <div className="wbg-header__left">
          <div className="wbg-header__icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <div className="wbg-header__info">
            <h1 className="wbg-header__title">
              {state.title || "Work Breakdown Framework"}
            </h1>
            <div className="wbg-header__breadcrumb">
              <span>WBD ENGINE</span>
              <span className="wbg-header__sep">&raquo;</span>
              <span className="wbg-header__phase-label">
                {activePhase} PHASE
              </span>
              <button
                type="button"
                className={`wbg-ai-badge ${aiEnabled ? "" : "wbg-ai-badge--off"}`}
                onClick={
                  aiEnabled
                    ? () => setShowAIContext((v) => !v)
                    : handleConfigureAI
                }
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleConfigureAI();
                }}
                title={
                  aiEnabled
                    ? "Click to toggle AI context panel / Right-click to change API key"
                    : "Click to configure AI API key"
                }
              >
                {aiEnabled
                  ? showAIContext
                    ? "AI Context"
                    : "AI"
                  : "Set AI Key"}
              </button>
            </div>
          </div>
        </div>

        <div className="wbg-header__center">
          {/* Phase Toggle */}
          <div className="wbg-phase-toggle">
            {PHASES.map((p) => (
              <button
                key={p}
                className={`wbg-phase-toggle__btn ${activePhase === p ? "wbg-phase-toggle__btn--active" : ""}`}
                onClick={() => handlePhaseChange(p)}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="wbg-header__right">
          {/* Conditional action buttons */}
          {(activePhase === "STRUCTURE" || activePhase === "EXECUTION") && (
            <button
              className="wbg-btn wbg-btn--outline"
              onClick={() => {
                void handleExtractTasks();
              }}
              type="button"
              disabled={isExtracting || state.steps.length === 0}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {isExtracting
                ? "Extracting..."
                : aiEnabled
                  ? "Extract Tasks (AI)"
                  : "Extract Tasks"}
            </button>
          )}
          <button
            className="wbg-btn wbg-btn--primary"
            onClick={() => {
              void handleExtractScenario();
            }}
            type="button"
            disabled={isExtracting}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isExtracting
              ? "Extracting..."
              : aiEnabled
                ? "Extract Scenario (AI)"
                : "Extract Scenario"}
          </button>
        </div>
      </header>

      {/* AI Context Panel */}
      {showAIContext && aiEnabled && (
        <div className="wbg-ai-context">
          <div className="wbg-ai-context__header">
            <span className="wbg-ai-context__label">AI Context</span>
            <span className="wbg-ai-context__hint">
              Add domain knowledge, constraints, or instructions for AI
              extraction
            </span>
            <button
              type="button"
              className="wbg-ai-context__close"
              onClick={() => setShowAIContext(false)}
            >
              &times;
            </button>
          </div>
          <textarea
            className="wbg-ai-context__input"
            value={localAIContext}
            onChange={(e) => setLocalAIContext(e.target.value)}
            onBlur={() => {
              const current = document.state.global.aiContext ?? "";
              if (localAIContext !== current) {
                dispatch(setAiContext({ context: localAIContext || null }));
              }
            }}
            placeholder={`Examples:\n- "This project uses the Service Offering document model with ServiceGroup and OptionGroup types"\n- "Focus on billing cycle and pricing restructure tasks"\n- "Include processor tasks for cross-document billing projections"\n- "The team has no DevOps — assign infra tasks to Backend Engineer"`}
            rows={4}
          />
          {document.state.global.extractionHistory.length > 0 && (
            <div className="wbg-ai-context__history">
              <span className="wbg-ai-context__history-label">
                Recent extractions
              </span>
              {document.state.global.extractionHistory
                .slice(-3)
                .reverse()
                .map((r) => (
                  <span
                    key={r.id}
                    className={`wbg-ai-context__history-pill wbg-ai-context__history-pill--${r.status.toLowerCase()}`}
                  >
                    {r.type}{" "}
                    {r.status === "COMPLETED"
                      ? r.stepsGenerated
                        ? `${r.stepsGenerated} steps`
                        : `${r.tasksGenerated ?? 0} tasks`
                      : r.status === "FAILED"
                        ? "failed"
                        : "..."}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Phase Content */}
      <main className="wbg-main">
        {activePhase === "CAPTURE" ? (
          <CaptureView document={document} dispatch={dispatch} />
        ) : (
          <>
            <HierarchyGrid
              document={document}
              dispatch={dispatch}
              phase={activePhase}
            />
            {(activePhase === "EXECUTION" || activePhase === "REVIEW") && (
              <ReadinessFooter tasks={state.tasks} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────
// Workflow step definitions (7x7 Powervetra-informed)
// ────────────────────────────────────────────────

function getFullStackWorkflow() {
  return [
    {
      name: "Environment Scaffolding",
      description: "Setup development repo and initial schemas",
      substeps: [
        {
          name: "Initialize repository",
          description: "Create repo and configure tooling",
        },
        {
          name: "Configure MCP Document",
          description: "Setup Powerhouse document model project",
        },
        {
          name: "Define GraphQL Enums",
          description: "Define state enums and scalars",
        },
        {
          name: "Setup development environment",
          description: "Install dependencies and configure workspace",
        },
        {
          name: "Configure linting and formatting",
          description: "Setup ESLint, Prettier",
        },
        {
          name: "Create project manifest",
          description: "Configure powerhouse.manifest.json",
        },
        {
          name: "Verify build pipeline",
          description: "Run initial build to validate setup",
        },
      ],
    },
    {
      name: "Logic Implementation",
      description: "Synchronous reducer and state transitions",
      substeps: [
        {
          name: "Define state schema",
          description: "Create GraphQL state types",
        },
        {
          name: "Create operation schemas",
          description: "Define input types for all operations",
        },
        {
          name: "Implement add operations",
          description: "Build reducers for creation operations",
        },
        {
          name: "Implement update operations",
          description: "Build reducers for modification operations",
        },
        {
          name: "Implement remove operations",
          description: "Build reducers for deletion operations",
        },
        {
          name: "Add error handling",
          description: "Define and implement custom error types",
        },
        {
          name: "Write reducer tests",
          description: "Test all operation reducers",
        },
      ],
    },
    {
      name: "Editor Scaffolding",
      description: "React editor component setup",
      substeps: [
        {
          name: "Create editor document",
          description: "Use MCP to create editor definition",
        },
        {
          name: "Configure document type binding",
          description: "Link editor to document model",
        },
        {
          name: "Setup component structure",
          description: "Create component file hierarchy",
        },
        {
          name: "Implement document hooks",
          description: "Wire up useSelectedDocument hook",
        },
        {
          name: "Create base layout",
          description: "Build editor shell with toolbar",
        },
        {
          name: "Add action creators import",
          description: "Import dispatch creators",
        },
        {
          name: "Verify editor renders",
          description: "Test basic editor loading",
        },
      ],
    },
    {
      name: "UI Component Build",
      description: "Interactive form and display components",
      substeps: [
        {
          name: "Build form components",
          description: "Create input forms for operations",
        },
        {
          name: "Build list/grid views",
          description: "Create data display components",
        },
        {
          name: "Add status indicators",
          description: "Implement status pills and badges",
        },
        {
          name: "Create modal dialogs",
          description: "Build confirmation and input modals",
        },
        {
          name: "Add inline editing",
          description: "Implement click-to-edit fields",
        },
        { name: "Style with Tailwind/CSS", description: "Apply visual design" },
        {
          name: "Add responsive layout",
          description: "Ensure mobile compatibility",
        },
      ],
    },
    {
      name: "Data Integration",
      description: "Connect editor to document operations",
      substeps: [
        {
          name: "Wire create operations",
          description: "Connect add forms to dispatch",
        },
        {
          name: "Wire update operations",
          description: "Connect edit forms to dispatch",
        },
        {
          name: "Wire delete operations",
          description: "Connect remove actions to dispatch",
        },
        {
          name: "Wire status transitions",
          description: "Connect status changes to dispatch",
        },
        {
          name: "Add optimistic updates",
          description: "Implement immediate UI feedback",
        },
        {
          name: "Handle error states",
          description: "Display operation errors to user",
        },
        {
          name: "Test data flow end-to-end",
          description: "Verify full CRUD cycle",
        },
      ],
    },
    {
      name: "Validation & Testing",
      description: "Quality assurance and error checking",
      substeps: [
        { name: "Run TypeScript checks", description: "Execute npm run tsc" },
        { name: "Run ESLint", description: "Execute npm run lint:fix" },
        { name: "Write component tests", description: "Test React components" },
        {
          name: "Test edge cases",
          description: "Validate boundary conditions",
        },
        {
          name: "Test empty states",
          description: "Verify empty document handling",
        },
        {
          name: "Performance review",
          description: "Check for unnecessary re-renders",
        },
        {
          name: "Accessibility audit",
          description: "Verify keyboard nav and ARIA",
        },
      ],
    },
    {
      name: "Documentation & Review",
      description: "Final review and deployment preparation",
      substeps: [
        { name: "Review code quality", description: "Final code review pass" },
        {
          name: "Update README",
          description: "Document usage and configuration",
        },
        {
          name: "Verify manifest entries",
          description: "Check powerhouse.manifest.json",
        },
        {
          name: "Test in Vetra preview",
          description: "Load document in preview drive",
        },
        {
          name: "Cross-browser testing",
          description: "Verify in multiple browsers",
        },
        {
          name: "Stakeholder demo",
          description: "Present to stakeholders for feedback",
        },
        {
          name: "Tag release",
          description: "Create version tag and changelog",
        },
      ],
    },
  ];
}

function getDocModelEditorWorkflow() {
  return getFullStackWorkflow(); // Same as full-stack for combined
}

function getDocModelOnlyWorkflow() {
  return [
    {
      name: "Requirements Analysis",
      description: "Define document model requirements",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Requirement task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Schema Design",
      description: "Design GraphQL state schema",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Schema task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Module Definition",
      description: "Define operation modules",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Module task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Operation Implementation",
      description: "Implement reducers",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Reducer task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Error Handling",
      description: "Define custom errors",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Error task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Testing",
      description: "Write and run tests",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Test task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Review & Deploy",
      description: "Final review",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Review task ${i + 1}`,
        description: "",
      })),
    },
  ];
}

function getEditorOnlyWorkflow() {
  return [
    {
      name: "Editor Planning",
      description: "Plan editor architecture",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Planning task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Editor Scaffolding",
      description: "Create editor document",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Scaffold task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Component Design",
      description: "Design UI components",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Design task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Component Build",
      description: "Build React components",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Build task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Data Wiring",
      description: "Connect to document model",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Wiring task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Styling",
      description: "Apply visual design",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Style task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Testing & QA",
      description: "Test and validate",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `QA task ${i + 1}`,
        description: "",
      })),
    },
  ];
}

function getSubgraphWorkflow() {
  return [
    {
      name: "Subgraph Planning",
      description: "Define subgraph schema",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Plan task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Schema Definition",
      description: "GraphQL schema",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Schema task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Resolver Implementation",
      description: "Build resolvers",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Resolver task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Data Source Config",
      description: "Configure data sources",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Data task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Integration",
      description: "Integrate with document models",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Integration task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Testing",
      description: "Test queries and mutations",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Test task ${i + 1}`,
        description: "",
      })),
    },
    {
      name: "Deploy & Monitor",
      description: "Deploy and configure monitoring",
      substeps: Array.from({ length: 7 }, (_, i) => ({
        name: `Deploy task ${i + 1}`,
        description: "",
      })),
    },
  ];
}

// ────────────────────────────────────────────────
// Scoped Styles
// ────────────────────────────────────────────────

const gridStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .wbg-editor {
    --wbg-font: 'Space Grotesk', system-ui, sans-serif;
    --wbg-mono: 'JetBrains Mono', monospace;

    --wbg-bg: #f8f8f6;
    --wbg-surface: #ffffff;
    --wbg-surface-alt: #fafaf7;
    --wbg-border: #e5e3dd;
    --wbg-border-strong: #d1cfc8;

    --wbg-text: #1e293b;
    --wbg-text-secondary: #64748b;
    --wbg-text-muted: #94a3b8;

    --wbg-indigo: #6366f1;
    --wbg-indigo-dark: #4f46e5;
    --wbg-indigo-light: #eef2ff;
    --wbg-emerald: #10b981;
    --wbg-emerald-light: #ecfdf5;
    --wbg-amber: #f59e0b;
    --wbg-amber-light: #fffbeb;
    --wbg-rose: #f43f5e;
    --wbg-rose-light: #fff1f2;
    --wbg-sky: #0ea5e9;
    --wbg-sky-light: #f0f9ff;

    font-family: var(--wbg-font);
    color: var(--wbg-text);
    background: var(--wbg-bg);
    min-height: 100vh;
    line-height: 1.5;
  }

  /* ── Empty state ── */
  .wbg-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 12px;
    color: var(--wbg-text-muted);
    text-align: center;
  }
  .wbg-empty h2 { font-size: 18px; font-weight: 600; color: var(--wbg-text-secondary); margin: 0; }
  .wbg-empty p { font-size: 14px; margin: 0; }

  /* ── Global Header ── */
  .wbg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: var(--wbg-surface);
    border-bottom: 2px solid var(--wbg-indigo);
    gap: 16px;
    flex-wrap: wrap;
  }
  .wbg-header__left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .wbg-header__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--wbg-indigo);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wbg-header__info { display: flex; flex-direction: column; }
  .wbg-header__title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }
  .wbg-header__breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--wbg-text-muted);
  }
  .wbg-header__sep { color: var(--wbg-border-strong); }
  .wbg-header__phase-label { color: var(--wbg-indigo); }

  .wbg-header__center { flex: 1; display: flex; justify-content: center; }
  .wbg-header__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ── Phase Toggle ── */
  .wbg-phase-toggle {
    display: flex;
    border: 1px solid var(--wbg-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--wbg-surface-alt);
  }
  .wbg-phase-toggle__btn {
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--wbg-font);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: none;
    background: transparent;
    color: var(--wbg-text-secondary);
    cursor: pointer;
    transition: all 150ms ease;
    white-space: nowrap;
  }
  .wbg-phase-toggle__btn:hover { color: var(--wbg-text); background: var(--wbg-border); }
  .wbg-phase-toggle__btn--active {
    background: var(--wbg-text);
    color: white;
    font-weight: 700;
  }
  .wbg-phase-toggle__btn--active:hover {
    background: var(--wbg-text);
    color: white;
  }

  /* ── Buttons ── */
  .wbg-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--wbg-font);
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 150ms ease;
    white-space: nowrap;
  }
  .wbg-btn--primary {
    background: var(--wbg-indigo);
    color: white;
  }
  .wbg-btn--primary:hover { background: var(--wbg-indigo-dark); }
  .wbg-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .wbg-btn--outline {
    background: var(--wbg-surface);
    color: var(--wbg-text);
    border: 1px solid var(--wbg-border);
  }
  .wbg-btn--outline:hover { background: var(--wbg-surface-alt); border-color: var(--wbg-border-strong); }
  .wbg-btn--outline:disabled { opacity: 0.5; cursor: not-allowed; }
  .wbg-btn--dark {
    background: var(--wbg-text);
    color: white;
    padding: 10px 24px;
    font-size: 14px;
    border-radius: 10px;
  }
  .wbg-btn--dark:hover { opacity: 0.9; }
  .wbg-btn--ghost {
    background: transparent;
    color: var(--wbg-text-secondary);
    border: none;
  }
  .wbg-btn--ghost:hover { color: var(--wbg-text); }
  .wbg-btn--danger {
    background: var(--wbg-rose);
    color: white;
  }
  .wbg-btn--danger:hover { opacity: 0.9; }

  .wbg-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--wbg-text-muted);
    transition: all 150ms ease;
  }
  .wbg-icon-btn:hover { background: var(--wbg-border); color: var(--wbg-text); }
  .wbg-icon-btn--danger:hover { background: var(--wbg-rose-light); color: var(--wbg-rose); }

  /* ── Main content ── */
  .wbg-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
  }

  /* ── Capture View ── */
  .wbg-capture { max-width: 800px; margin: 0 auto; padding-top: 24px; }
  .wbg-capture__title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px;
    font-style: italic;
  }
  .wbg-capture__desc {
    font-size: 15px;
    color: var(--wbg-text-secondary);
    margin: 0 0 24px;
  }
  .wbg-capture__card {
    background: var(--wbg-surface);
    border: 1px solid var(--wbg-border);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
  }
  .wbg-capture__textarea {
    width: 100%;
    min-height: 200px;
    border: none;
    outline: none;
    font-family: var(--wbg-font);
    font-size: 15px;
    color: var(--wbg-text);
    resize: vertical;
    line-height: 1.6;
    box-sizing: border-box;
  }
  .wbg-capture__textarea::placeholder { color: var(--wbg-text-muted); }
  .wbg-capture__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--wbg-border);
  }
  .wbg-capture__source {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--wbg-amber);
    text-transform: uppercase;
  }
  .wbg-capture__existing { margin-top: 32px; }
  .wbg-capture__existing-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--wbg-text-secondary);
    margin: 0 0 12px;
  }
  .wbg-capture__input-card {
    background: var(--wbg-surface-alt);
    border: 1px solid var(--wbg-border);
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 8px;
  }
  .wbg-capture__input-text {
    font-size: 13px;
    margin: 0;
    white-space: pre-wrap;
    color: var(--wbg-text);
  }
  .wbg-capture__input-meta {
    font-size: 11px;
    color: var(--wbg-text-muted);
    margin-top: 4px;
    display: block;
  }

  /* ── Hierarchy Grid ── */
  .wbg-grid {
    background: var(--wbg-surface);
    border: 1px solid var(--wbg-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
  }

  .wbg-grid__header {
    display: flex;
    padding: 10px 16px;
    background: var(--wbg-surface-alt);
    border-bottom: 1px solid var(--wbg-border);
  }
  .wbg-cell--header {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wbg-text-muted);
  }

  /* Grid cell layout */
  .wbg-cell--hierarchy { flex: 3; min-width: 300px; display: flex; align-items: center; gap: 8px; }
  .wbg-cell--status { flex: 1; min-width: 120px; display: flex; align-items: center; }
  .wbg-cell--context { flex: 1.5; min-width: 150px; display: flex; align-items: center; }
  .wbg-cell--assignees { flex: 1; min-width: 120px; display: flex; align-items: center; }
  .wbg-cell--actions { flex: 0 0 80px; display: flex; align-items: center; justify-content: flex-end; gap: 4px; }

  /* Row styles */
  .wbg-row {
    display: flex;
    padding: 10px 16px;
    border-bottom: 1px solid var(--wbg-border);
    align-items: center;
    transition: background 100ms ease;
  }
  .wbg-row:hover { background: var(--wbg-surface-alt); }

  .wbg-row--step {
    cursor: pointer;
    padding: 14px 16px;
  }
  .wbg-row--step:hover { background: #f5f5f0; }

  .wbg-row--checkpoint {
    padding-left: 48px;
  }

  .wbg-row--task {
    padding-left: 48px;
  }
  .wbg-row--task-nested {
    padding-left: 72px;
  }

  .wbg-row--substep {
    cursor: pointer;
    padding-left: 48px;
  }

  .wbg-row--add-inline {
    padding-left: 48px;
    background: var(--wbg-indigo-light);
  }

  /* Step styles */
  .wbg-step { border-bottom: 1px solid var(--wbg-border); }
  .wbg-step:last-child { border-bottom: none; }
  .wbg-step__children { }

  .wbg-chevron {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--wbg-text-muted);
    padding: 0;
  }
  .wbg-chevron--sm { width: 20px; height: 20px; }

  .wbg-step__number {
    font-size: 14px;
    font-weight: 700;
    color: var(--wbg-text-muted);
    min-width: 20px;
    flex-shrink: 0;
  }
  .wbg-step__info { display: flex; flex-direction: column; min-width: 0; }
  .wbg-step__name { font-size: 15px; font-weight: 700; color: var(--wbg-text); }
  .wbg-step__desc {
    font-size: 12px;
    color: var(--wbg-text-secondary);
    font-style: italic;
    margin-top: 2px;
  }

  /* Progress bar */
  .wbg-progress { display: flex; align-items: center; gap: 8px; width: 100%; }
  .wbg-progress__bar {
    flex: 1;
    height: 6px;
    background: var(--wbg-border);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  .wbg-progress__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--wbg-indigo);
    border-radius: 3px;
    transition: width 300ms ease;
  }
  .wbg-progress__blocked {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--wbg-rose);
    border-radius: 3px;
  }
  .wbg-progress__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--wbg-text-secondary);
    white-space: nowrap;
  }

  /* Avatars */
  .wbg-avatars { display: flex; align-items: center; gap: -4px; }
  .wbg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--wbg-indigo-light);
    color: var(--wbg-indigo);
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--wbg-surface);
    margin-left: -4px;
  }
  .wbg-avatar:first-child { margin-left: 0; }
  .wbg-avatar--more { background: var(--wbg-border); color: var(--wbg-text-secondary); }

  /* Checkpoint styles */
  .wbg-checkbox {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid var(--wbg-border-strong);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 150ms ease;
    padding: 0;
  }
  .wbg-checkbox:hover { border-color: var(--wbg-indigo); }
  .wbg-checkbox--checked {
    background: var(--wbg-emerald);
    border-color: var(--wbg-emerald);
  }

  .wbg-checkpoint-icon { flex-shrink: 0; }
  .wbg-checkpoint__info { display: flex; flex-direction: column; min-width: 0; }
  .wbg-checkpoint__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--wbg-text);
  }
  .wbg-checkpoint__label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wbg-indigo);
  }

  /* Substep styles */
  .wbg-substep__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--wbg-indigo);
    flex-shrink: 0;
  }
  .wbg-substep__name {
    font-size: 13px;
    font-weight: 600;
    font-style: italic;
    color: var(--wbg-text);
  }

  .wbg-indent--2 { width: 24px; flex-shrink: 0; }

  /* Task styles */
  .wbg-task-icon {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 2px solid var(--wbg-border-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .wbg-task-icon__empty { width: 12px; height: 12px; }
  .wbg-task-icon--done { background: var(--wbg-emerald); border-color: var(--wbg-emerald); }
  .wbg-task-icon--blocked { background: var(--wbg-rose); border-color: var(--wbg-rose); }
  .wbg-task-icon--inprogress { background: var(--wbg-sky); border-color: var(--wbg-sky); }

  .wbg-task__info { display: flex; flex-direction: column; min-width: 0; }
  .wbg-task__name { font-size: 13px; font-weight: 500; color: var(--wbg-text); }
  .wbg-task__badges { display: flex; gap: 6px; align-items: center; margin-top: 2px; }
  .wbg-source-badge {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--wbg-text-muted);
  }
  .wbg-blocked-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--wbg-rose);
    background: var(--wbg-rose-light);
    padding: 1px 6px;
    border-radius: 4px;
  }

  /* Status pills */
  .wbg-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--wbg-font);
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }
  .wbg-pill--pending { background: var(--wbg-border); color: var(--wbg-text-secondary); }
  .wbg-pill--in-progress { background: var(--wbg-sky-light); color: var(--wbg-sky); border: 1px solid var(--wbg-sky); }
  .wbg-pill--blocked { background: var(--wbg-rose-light); color: var(--wbg-rose); border: 1px solid var(--wbg-rose); }
  .wbg-pill--done { background: var(--wbg-emerald-light); color: var(--wbg-emerald); border: 1px solid var(--wbg-emerald); }

  /* Context text */
  .wbg-context-text {
    font-size: 12px;
    color: var(--wbg-text-muted);
    font-style: italic;
  }
  .wbg-context-text--blocked { color: var(--wbg-rose); font-style: normal; }
  .wbg-context-placeholder {
    font-size: 12px;
    color: var(--wbg-text-muted);
    font-style: italic;
  }

  /* Assignees */
  .wbg-assignee-placeholder {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--wbg-text-muted);
  }

  /* Inline input */
  .wbg-inline-input {
    flex: 1;
    border: none;
    outline: none;
    font-family: var(--wbg-font);
    font-size: 13px;
    background: transparent;
    color: var(--wbg-text);
    padding: 4px 0;
  }
  .wbg-inline-input::placeholder { color: var(--wbg-text-muted); font-style: italic; }

  /* Add link */
  .wbg-add-link {
    display: block;
    padding: 8px 16px 8px 72px;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--wbg-font);
    color: var(--wbg-indigo);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background 150ms ease;
  }
  .wbg-add-link:hover { background: var(--wbg-indigo-light); }
  .wbg-add-link--step { padding-left: 24px; border-top: 1px solid var(--wbg-border); }

  /* ── Readiness Footer ── */
  .wbg-footer {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    padding: 20px 24px;
    background: var(--wbg-surface);
    border: 1px solid var(--wbg-border);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
  }
  .wbg-footer__stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px;
    border-radius: 8px;
    background: var(--wbg-surface-alt);
  }
  .wbg-footer__stat--blockers { }
  .wbg-footer__stat-info { display: flex; flex-direction: column; }
  .wbg-footer__stat-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wbg-text-muted);
  }
  .wbg-footer__stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--wbg-text);
    line-height: 1;
  }
  .wbg-footer__stat-value--danger { color: var(--wbg-rose); }

  /* ── Blocker Modal ── */
  .wbg-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .wbg-modal {
    background: var(--wbg-surface);
    border-radius: 16px;
    width: 500px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,.15);
  }
  .wbg-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--wbg-border);
  }
  .wbg-modal__header--blocked {
    background: var(--wbg-rose-light);
  }
  .wbg-modal__header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--wbg-rose);
  }
  .wbg-modal__title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .wbg-modal__close {
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--wbg-text-muted);
    padding: 4px;
  }
  .wbg-modal__close:hover { color: var(--wbg-text); }
  .wbg-modal__task-name {
    font-size: 15px;
    font-weight: 600;
    padding: 16px 20px 0;
    color: var(--wbg-text);
  }
  .wbg-modal__body { padding: 16px 20px; }
  .wbg-modal__label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wbg-text-muted);
    margin-bottom: 8px;
  }
  .wbg-modal__textarea {
    width: 100%;
    min-height: 80px;
    border: 1px solid var(--wbg-border);
    border-radius: 8px;
    padding: 10px 12px;
    font-family: var(--wbg-font);
    font-size: 14px;
    color: var(--wbg-text);
    outline: none;
    resize: vertical;
    box-sizing: border-box;
  }
  .wbg-modal__textarea:focus { border-color: var(--wbg-indigo); box-shadow: 0 0 0 3px var(--wbg-indigo-light); }
  .wbg-modal__item-list {
    border: 1px solid var(--wbg-border);
    border-radius: 8px;
    overflow: hidden;
    max-height: 200px;
    overflow-y: auto;
  }
  .wbg-modal__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: var(--wbg-font);
    text-align: left;
    border-bottom: 1px solid var(--wbg-border);
    color: var(--wbg-text);
    transition: background 100ms ease;
  }
  .wbg-modal__item:last-child { border-bottom: none; }
  .wbg-modal__item:hover { background: var(--wbg-surface-alt); }
  .wbg-modal__item--selected {
    background: var(--wbg-indigo-light);
    border-left: 3px solid var(--wbg-indigo);
  }
  .wbg-modal__item-info { display: flex; flex-direction: column; }
  .wbg-modal__item-name { font-size: 13px; font-weight: 500; }
  .wbg-modal__item-type {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--wbg-text-muted);
  }
  .wbg-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid var(--wbg-border);
  }

  /* ── AI Overlay ── */
  .wbg-ai-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(2px);
  }
  .wbg-ai-overlay__card {
    background: var(--wbg-surface);
    border-radius: 16px;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,.2);
    min-width: 300px;
  }
  .wbg-ai-overlay__spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--wbg-border);
    border-top-color: var(--wbg-indigo);
    border-radius: 50%;
    animation: wbg-spin 0.8s linear infinite;
  }
  @keyframes wbg-spin {
    to { transform: rotate(360deg); }
  }
  .wbg-ai-overlay__message {
    font-size: 15px;
    font-weight: 600;
    color: var(--wbg-text);
    margin: 0;
    text-align: center;
  }
  .wbg-ai-overlay__hint {
    font-size: 12px;
    color: var(--wbg-text-muted);
    margin: 0;
  }

  /* ── AI Badge (button) ── */
  .wbg-ai-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    border-radius: 4px;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .wbg-ai-badge:hover {
    opacity: 0.85;
  }
  .wbg-ai-badge--off {
    background: var(--wbg-border);
    color: var(--wbg-text-muted);
    font-weight: 600;
    font-size: 8px;
  }

  /* ── AI Context Panel ── */
  .wbg-ai-context {
    border-bottom: 1px solid var(--wbg-border);
    background: color-mix(in srgb, var(--wbg-surface) 50%, #8b5cf6 4%);
    padding: 12px 20px;
    animation: wbg-ai-context-in 0.15s ease-out;
  }
  @keyframes wbg-ai-context-in {
    from { opacity: 0; max-height: 0; padding: 0 20px; }
    to   { opacity: 1; max-height: 200px; padding: 12px 20px; }
  }
  .wbg-ai-context__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .wbg-ai-context__label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #8b5cf6;
  }
  .wbg-ai-context__hint {
    font-size: 11px;
    color: var(--wbg-text-muted);
    flex: 1;
  }
  .wbg-ai-context__close {
    background: none;
    border: none;
    color: var(--wbg-text-muted);
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }
  .wbg-ai-context__close:hover {
    color: var(--wbg-text);
  }
  .wbg-ai-context__input {
    width: 100%;
    box-sizing: border-box;
    background: var(--wbg-surface);
    border: 1px solid var(--wbg-border);
    border-radius: 6px;
    color: var(--wbg-text);
    font-size: 12px;
    font-family: inherit;
    padding: 8px 10px;
    resize: vertical;
    min-height: 60px;
    max-height: 200px;
    outline: none;
    transition: border-color 0.15s;
  }
  .wbg-ai-context__input:focus {
    border-color: #8b5cf6;
  }
  .wbg-ai-context__input::placeholder {
    color: var(--wbg-text-muted);
    opacity: 0.6;
  }
  .wbg-ai-context__history {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .wbg-ai-context__history-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wbg-text-muted);
  }
  .wbg-ai-context__history-pill {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .wbg-ai-context__history-pill--completed {
    background: var(--wbg-emerald-light);
    color: var(--wbg-emerald);
  }
  .wbg-ai-context__history-pill--failed {
    background: var(--wbg-rose-light);
    color: var(--wbg-rose);
  }
  .wbg-ai-context__history-pill--pending {
    background: var(--wbg-amber-light);
    color: var(--wbg-amber);
  }

  /* ── Accessibility ── */
  @media (prefers-reduced-motion: reduce) {
    .wbg-editor, .wbg-editor * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const GridStyles = <style dangerouslySetInnerHTML={{ __html: gridStyles }} />;
