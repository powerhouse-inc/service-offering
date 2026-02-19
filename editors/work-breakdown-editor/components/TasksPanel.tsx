import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import type {
  TaskStatus,
  TaskSource,
} from "../../../document-models/work-breakdown/gen/schema/types.js";
import {
  addTask,
  updateTask,
  removeTask,
  setTaskStatus,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

const TASK_STATUSES: TaskStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
];
const TASK_SOURCES: TaskSource[] = ["EXTRACTED", "MANUAL"];

type StatusFilter = "ALL" | TaskStatus;
type SourceFilter = "ALL" | TaskSource;

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function statusClass(status: TaskStatus | null | undefined): string {
  if (!status) return "wb-status wb-status--pending";
  return `wb-status wb-status--${status.toLowerCase()}`;
}

function sourceClass(source: TaskSource): string {
  return `wb-status wb-status--${source.toLowerCase()}`;
}

interface AddTaskForm {
  name: string;
  owner: string;
  stepId: string;
  substepId: string;
  description: string;
  notes: string;
}

const EMPTY_FORM: AddTaskForm = {
  name: "",
  owner: "",
  stepId: "",
  substepId: "",
  description: "",
  notes: "",
};

export function TasksPanel({ document, dispatch }: Props) {
  const state = document.state.global;
  const tasks = state.tasks;
  const steps = state.steps;

  // AI extraction state
  const [isExtracting, setIsExtracting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");
  const [stepFilter, setStepFilter] = useState<string>("ALL");

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<AddTaskForm>(EMPTY_FORM);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    owner: string;
    stepId: string;
    substepId: string;
    sequenceOrder: number;
    notes: string;
  }>({
    name: "",
    description: "",
    owner: "",
    stepId: "",
    substepId: "",
    sequenceOrder: 0,
    notes: "",
  });

  // Step lookup map
  const stepMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const step of steps) {
      map.set(step.id, step.name);
    }
    return map;
  }, [steps]);

  // Substeps for a given step
  function getSubstepsForStep(stepId: string) {
    const step = steps.find((s) => s.id === stepId);
    return step?.substeps ?? [];
  }

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== "ALL") {
        const taskStatus = task.status ?? "PENDING";
        if (taskStatus !== statusFilter) return false;
      }
      if (sourceFilter !== "ALL" && task.source !== sourceFilter) return false;
      if (stepFilter !== "ALL" && task.stepId !== stepFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, sourceFilter, stepFilter]);

  // Stats
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(
    (t) => !t.status || t.status === "PENDING",
  ).length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const blockedCount = tasks.filter((t) => t.status === "BLOCKED").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  // Handlers
  function handleStatusChange(id: string, status: TaskStatus) {
    dispatch(setTaskStatus({ id, status }));
  }

  function handleRemoveTask(id: string) {
    dispatch(removeTask({ id }));
    if (editingId === id) {
      setEditingId(null);
    }
  }

  // -- Rule-Based Task Extraction (Powervetra-informed) --
  function handleExtractTasksFromDemo() {
    if (steps.length === 0) {
      alert(
        "No demo steps to extract from. Add steps in the Scenario tab first.",
      );
      return;
    }

    if (tasks.length > 0) {
      const confirm = window.confirm(
        "Tasks already exist. Extraction may add duplicate tasks. Continue?",
      );
      if (!confirm) return;
    }

    setIsExtracting(true);

    const extractedTasks: Array<{
      name: string;
      description: string;
      owner: string;
      stepId: string;
      substepId?: string;
    }> = [];

    // Powervetra-informed task templates based on step keywords
    const taskTemplates = {
      requirement: [
        { name: "Gather stakeholder requirements", owner: "BA" },
        { name: "Document functional specifications", owner: "BA" },
        { name: "Define acceptance criteria", owner: "PM" },
      ],
      schema: [
        { name: "Define GraphQL types and scalars", owner: "Backend Engineer" },
        { name: "Create state schema", owner: "Backend Engineer" },
        { name: "Document schema decisions", owner: "Backend Engineer" },
      ],
      reducer: [
        { name: "Implement operation reducers", owner: "Backend Engineer" },
        { name: "Add error handling", owner: "Backend Engineer" },
        { name: "Write reducer unit tests", owner: "QA Engineer" },
      ],
      editor: [
        { name: "Create editor document via MCP", owner: "Frontend Engineer" },
        { name: "Build UI components", owner: "Frontend Engineer" },
        { name: "Wire up dispatch hooks", owner: "Frontend Engineer" },
        { name: "Add form validation", owner: "Frontend Engineer" },
      ],
      component: [
        { name: "Design component architecture", owner: "Frontend Engineer" },
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

    // Extract tasks from each step
    steps.forEach((step) => {
      const stepText = (
        step.name +
        " " +
        (step.description || "")
      ).toLowerCase();

      // Match step to task templates based on keywords
      let templates: Array<{ name: string; owner: string }> = [];

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
        // Generic fallback tasks
        templates = [
          { name: `Plan ${step.name.toLowerCase()}`, owner: "Team Lead" },
          { name: `Implement ${step.name.toLowerCase()}`, owner: "Engineer" },
          { name: `Review ${step.name.toLowerCase()}`, owner: "Tech Lead" },
        ];
      }

      // Add 2-3 tasks per step
      templates.slice(0, 3).forEach((template) => {
        extractedTasks.push({
          name: template.name,
          description: `Task for step: ${step.name}`,
          owner: template.owner,
          stepId: step.id,
          substepId: undefined,
        });
      });

      // Add tasks for substeps if they exist
      if (step.substeps.length > 0) {
        step.substeps.slice(0, 2).forEach((substep) => {
          extractedTasks.push({
            name: substep.name,
            description:
              substep.description || `Task for substep: ${substep.name}`,
            owner: "Engineer",
            stepId: step.id,
            substepId: substep.id,
          });
        });
      }
    });

    // Add tasks to document
    extractedTasks.forEach((task, index) => {
      dispatch(
        addTask({
          id: generateId(),
          name: task.name,
          description: task.description,
          owner: task.owner,
          stepId: task.stepId,
          substepId: task.substepId,
          sequenceOrder: tasks.length + index + 1,
          source: "EXTRACTED",
          extractionContext: "Rule-based extraction from demo steps",
          notes: undefined,
          createdAt: new Date().toISOString(),
        }),
      );
    });

    setIsExtracting(false);
    alert(`Successfully extracted ${extractedTasks.length} tasks!`);
  }

  function handleStartEdit(task: (typeof tasks)[number]) {
    setEditingId(task.id);
    setEditForm({
      name: task.name,
      description: task.description ?? "",
      owner: task.owner,
      stepId: task.stepId,
      substepId: task.substepId ?? "",
      sequenceOrder: task.sequenceOrder,
      notes: task.notes ?? "",
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleSaveEdit() {
    if (!editingId) return;
    dispatch(
      updateTask({
        id: editingId,
        name: editForm.name || undefined,
        description: editForm.description || undefined,
        owner: editForm.owner || undefined,
        stepId: editForm.stepId || undefined,
        substepId: editForm.substepId || undefined,
        sequenceOrder: editForm.sequenceOrder,
        notes: editForm.notes || undefined,
      }),
    );
    setEditingId(null);
  }

  function handleAddTask() {
    if (!form.name || !form.owner || !form.stepId) return;
    dispatch(
      addTask({
        id: generateId(),
        name: form.name,
        owner: form.owner,
        stepId: form.stepId,
        substepId: form.substepId || undefined,
        description: form.description || undefined,
        source: "MANUAL",
        sequenceOrder: tasks.length + 1,
        notes: form.notes || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    setForm(EMPTY_FORM);
    setShowAddForm(false);
  }

  function handleFormChange(field: keyof AddTaskForm, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Reset substepId when step changes
      if (field === "stepId") {
        next.substepId = "";
      }
      return next;
    });
  }

  // Empty state
  if (tasks.length === 0 && !showAddForm) {
    return (
      <div>
        {/* Stats row */}
        <div className="wb-panel">
          <div className="wb-panel__header">
            <h2 className="wb-panel__title">Tasks</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="wb-btn wb-btn--sm"
                onClick={handleExtractTasksFromDemo}
                type="button"
                disabled={isExtracting || steps.length === 0}
                title={
                  steps.length === 0
                    ? "No demo steps to extract from"
                    : "Use AI to extract tasks from demo steps"
                }
              >
                <svg
                  className="wb-btn__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {isExtracting ? "Extracting..." : "Extract from Demo"}
              </button>
              <button
                className="wb-btn wb-btn--primary wb-btn--sm"
                onClick={() => setShowAddForm(true)}
                type="button"
              >
                + Add Task
              </button>
            </div>
          </div>
          <div className="wb-panel-empty">
            <svg
              style={{ width: 40, height: 40, opacity: 0.4 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <p className="wb-panel-empty__text">
              No tasks have been added yet. Add your first task to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Task Summary</h2>
        </div>
        <div className="wb-grid-4">
          <div className="wb-stat">
            <div className="wb-stat__value">{totalCount}</div>
            <div className="wb-stat__label">Total</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{pendingCount}</div>
            <div className="wb-stat__label">Pending</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{inProgressCount}</div>
            <div className="wb-stat__label">In Progress</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{blockedCount}</div>
            <div className="wb-stat__label">Blocked</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          <div className="wb-stat" style={{ minWidth: 100 }}>
            <div className="wb-stat__value">{doneCount}</div>
            <div className="wb-stat__label">Done</div>
          </div>
        </div>
      </div>

      {/* Filter bar + Add button */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Tasks</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="wb-btn wb-btn--sm"
              onClick={handleExtractTasksFromDemo}
              type="button"
              disabled={isExtracting || steps.length === 0}
              title={
                steps.length === 0
                  ? "No demo steps to extract from"
                  : "Use AI to extract tasks from demo steps"
              }
            >
              <svg
                className="wb-btn__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {isExtracting ? "Extracting..." : "Extract from Demo"}
            </button>
            <button
              className="wb-btn wb-btn--primary wb-btn--sm"
              onClick={() => setShowAddForm((v) => !v)}
              type="button"
            >
              {showAddForm ? "Cancel" : "+ Add Task"}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="wb-form-row" style={{ marginBottom: 16 }}>
          <div>
            <label className="wb-label" htmlFor="wb-tasks-filter-status">
              Status
            </label>
            <select
              id="wb-tasks-filter-status"
              className="wb-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              style={{ width: "100%" }}
            >
              <option value="ALL">All</option>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="wb-label" htmlFor="wb-tasks-filter-source">
              Source
            </label>
            <select
              id="wb-tasks-filter-source"
              className="wb-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
              style={{ width: "100%" }}
            >
              <option value="ALL">All</option>
              {TASK_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {formatLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="wb-label" htmlFor="wb-tasks-filter-step">
              Step
            </label>
            <select
              id="wb-tasks-filter-step"
              className="wb-select"
              value={stepFilter}
              onChange={(e) => setStepFilter(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="ALL">All</option>
              {steps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add task form */}
        {showAddForm && (
          <div className="wb-card" style={{ marginBottom: 16 }}>
            <div className="wb-card__header">
              <h3 className="wb-card__title">New Task</h3>
            </div>
            <div className="wb-card__body">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div className="wb-form-row">
                  <div>
                    <label className="wb-label" htmlFor="wb-tasks-add-name">
                      Name *
                    </label>
                    <input
                      id="wb-tasks-add-name"
                      className="wb-input"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Task name"
                    />
                  </div>
                  <div>
                    <label className="wb-label" htmlFor="wb-tasks-add-owner">
                      Owner *
                    </label>
                    <input
                      id="wb-tasks-add-owner"
                      className="wb-input"
                      type="text"
                      value={form.owner}
                      onChange={(e) =>
                        handleFormChange("owner", e.target.value)
                      }
                      placeholder="Owner name"
                    />
                  </div>
                </div>
                <div className="wb-form-row">
                  <div>
                    <label className="wb-label" htmlFor="wb-tasks-add-step">
                      Step *
                    </label>
                    <select
                      id="wb-tasks-add-step"
                      className="wb-select"
                      value={form.stepId}
                      onChange={(e) =>
                        handleFormChange("stepId", e.target.value)
                      }
                      style={{ width: "100%" }}
                    >
                      <option value="" disabled>
                        Select step
                      </option>
                      {steps.map((step) => (
                        <option key={step.id} value={step.id}>
                          {step.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="wb-label" htmlFor="wb-tasks-add-substep">
                      Substep
                    </label>
                    <select
                      id="wb-tasks-add-substep"
                      className="wb-select"
                      value={form.substepId}
                      onChange={(e) =>
                        handleFormChange("substepId", e.target.value)
                      }
                      style={{ width: "100%" }}
                      disabled={!form.stepId}
                    >
                      <option value="">None</option>
                      {form.stepId &&
                        getSubstepsForStep(form.stepId).map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="wb-label" htmlFor="wb-tasks-add-desc">
                    Description
                  </label>
                  <textarea
                    id="wb-tasks-add-desc"
                    className="wb-textarea"
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    placeholder="Task description"
                  />
                </div>
                <div>
                  <label className="wb-label" htmlFor="wb-tasks-add-notes">
                    Notes
                  </label>
                  <textarea
                    id="wb-tasks-add-notes"
                    className="wb-textarea"
                    value={form.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    placeholder="Additional notes"
                    style={{ minHeight: 60 }}
                  />
                </div>
                <div className="wb-card__actions">
                  <button
                    className="wb-btn wb-btn--primary wb-btn--sm"
                    onClick={handleAddTask}
                    type="button"
                    disabled={!form.name || !form.owner || !form.stepId}
                  >
                    Add Task
                  </button>
                  <button
                    className="wb-btn wb-btn--sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setForm(EMPTY_FORM);
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task table */}
        {filteredTasks.length === 0 ? (
          <div className="wb-panel-empty">
            <p className="wb-panel-empty__text">
              No tasks match the current filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="wb-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const isEditing = editingId === task.id;

                  if (isEditing) {
                    const editSubsteps = editForm.stepId
                      ? getSubstepsForStep(editForm.stepId)
                      : [];

                    return (
                      <tr key={task.id}>
                        <td colSpan={6}>
                          <div
                            className="wb-card"
                            style={{ margin: 0, border: "none" }}
                          >
                            <div className="wb-card__header">
                              <h3 className="wb-card__title">Edit Task</h3>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                              }}
                            >
                              <div className="wb-form-row">
                                <div>
                                  <label
                                    className="wb-label"
                                    htmlFor={`wb-tasks-edit-name-${task.id}`}
                                  >
                                    Name
                                  </label>
                                  <input
                                    id={`wb-tasks-edit-name-${task.id}`}
                                    className="wb-input"
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label
                                    className="wb-label"
                                    htmlFor={`wb-tasks-edit-owner-${task.id}`}
                                  >
                                    Owner
                                  </label>
                                  <input
                                    id={`wb-tasks-edit-owner-${task.id}`}
                                    className="wb-input"
                                    type="text"
                                    value={editForm.owner}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        owner: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                              <div className="wb-form-row">
                                <div>
                                  <label
                                    className="wb-label"
                                    htmlFor={`wb-tasks-edit-step-${task.id}`}
                                  >
                                    Step
                                  </label>
                                  <select
                                    id={`wb-tasks-edit-step-${task.id}`}
                                    className="wb-select"
                                    value={editForm.stepId}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        stepId: e.target.value,
                                        substepId: "",
                                      }))
                                    }
                                    style={{ width: "100%" }}
                                  >
                                    <option value="" disabled>
                                      Select step
                                    </option>
                                    {steps.map((step) => (
                                      <option key={step.id} value={step.id}>
                                        {step.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label
                                    className="wb-label"
                                    htmlFor={`wb-tasks-edit-substep-${task.id}`}
                                  >
                                    Substep
                                  </label>
                                  <select
                                    id={`wb-tasks-edit-substep-${task.id}`}
                                    className="wb-select"
                                    value={editForm.substepId}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        substepId: e.target.value,
                                      }))
                                    }
                                    style={{ width: "100%" }}
                                    disabled={!editForm.stepId}
                                  >
                                    <option value="">None</option>
                                    {editSubsteps.map((sub) => (
                                      <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="wb-form-row">
                                <div>
                                  <label
                                    className="wb-label"
                                    htmlFor={`wb-tasks-edit-order-${task.id}`}
                                  >
                                    Sequence Order
                                  </label>
                                  <input
                                    id={`wb-tasks-edit-order-${task.id}`}
                                    className="wb-input"
                                    type="number"
                                    value={editForm.sequenceOrder}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        sequenceOrder:
                                          parseInt(e.target.value, 10) || 0,
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  className="wb-label"
                                  htmlFor={`wb-tasks-edit-desc-${task.id}`}
                                >
                                  Description
                                </label>
                                <textarea
                                  id={`wb-tasks-edit-desc-${task.id}`}
                                  className="wb-textarea"
                                  value={editForm.description}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  placeholder="Task description"
                                />
                              </div>
                              <div>
                                <label
                                  className="wb-label"
                                  htmlFor={`wb-tasks-edit-notes-${task.id}`}
                                >
                                  Notes
                                </label>
                                <textarea
                                  id={`wb-tasks-edit-notes-${task.id}`}
                                  className="wb-textarea"
                                  value={editForm.notes}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      notes: e.target.value,
                                    }))
                                  }
                                  placeholder="Additional notes"
                                  style={{ minHeight: 60 }}
                                />
                              </div>
                              <div className="wb-card__actions">
                                <button
                                  className="wb-btn wb-btn--primary wb-btn--sm"
                                  onClick={handleSaveEdit}
                                  type="button"
                                >
                                  Save
                                </button>
                                <button
                                  className="wb-btn wb-btn--sm"
                                  onClick={handleCancelEdit}
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={task.id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{task.name}</span>
                        {task.description && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--wb-text-secondary)",
                              marginTop: 2,
                            }}
                          >
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td>{task.owner}</td>
                      <td>{stepMap.get(task.stepId) ?? task.stepId}</td>
                      <td>
                        <select
                          className="wb-select"
                          value={task.status ?? "PENDING"}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as TaskStatus,
                            )
                          }
                          style={{ minWidth: 120 }}
                        >
                          {TASK_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {formatLabel(s)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={sourceClass(task.source)}>
                          {formatLabel(task.source)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            className="wb-btn wb-btn--ghost wb-btn--sm"
                            onClick={() => handleStartEdit(task)}
                            type="button"
                            title="Edit task"
                          >
                            Edit
                          </button>
                          <button
                            className="wb-btn wb-btn--danger wb-btn--sm"
                            onClick={() => handleRemoveTask(task.id)}
                            type="button"
                            title="Remove task"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
