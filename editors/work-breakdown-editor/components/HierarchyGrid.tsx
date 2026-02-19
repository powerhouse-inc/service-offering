import { useState, useMemo, useCallback } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import type {
  DemoStep,
  Task,
  Prerequisite,
  WorkBreakdownPhase,
  TaskStatus,
  PrerequisiteStatus,
} from "../../../document-models/work-breakdown/gen/schema/types.js";
import {
  addStep,
  addSubstep,
  removeSubstep,
  addPrerequisite,
  setPrerequisiteStatus,
  removePrerequisite,
  setTaskStatus,
  removeTask,
} from "../../../document-models/work-breakdown/gen/creators.js";
import { BlockerModal } from "./BlockerModal.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
  phase: WorkBreakdownPhase;
}

/** Calculate step progress from its tasks */
function calcStepProgress(tasks: Task[]): {
  pct: number;
  blockedPct: number;
} {
  if (tasks.length === 0) return { pct: 0, blockedPct: 0 };
  let sum = 0;
  let blockedCount = 0;
  for (const t of tasks) {
    const s = t.status ?? "PENDING";
    if (s === "DONE") sum += 1;
    else if (s === "IN_PROGRESS") sum += 0.5;
    if (s === "BLOCKED") blockedCount++;
  }
  return {
    pct: Math.round((sum / tasks.length) * 100),
    blockedPct: Math.round((blockedCount / tasks.length) * 100),
  };
}

/** Get unique owners from tasks */
function getStepOwners(tasks: Task[]): string[] {
  const owners = new Set<string>();
  for (const t of tasks) {
    if (t.owner) owners.add(t.owner);
  }
  return Array.from(owners);
}

/** Avatar initial */
function avatarInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function statusPillClass(status: string | null | undefined): string {
  const s = (status ?? "PENDING").toLowerCase();
  return `wbg-pill wbg-pill--${s.replace(/_/g, "-")}`;
}

export function HierarchyGrid({ document, dispatch, phase }: Props) {
  const state = document.state.global;
  const sortedSteps = useMemo(
    () => [...state.steps].sort((a, b) => a.order - b.order),
    [state.steps],
  );

  const showExecution = phase === "EXECUTION" || phase === "REVIEW";

  // Expanded state
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(
    () => new Set(state.steps.map((s) => s.id)),
  );
  const [expandedSubsteps, setExpandedSubsteps] = useState<Set<string>>(
    new Set(),
  );

  // Blocker modal
  const [blockerTarget, setBlockerTarget] = useState<{
    id: string;
    name: string;
    type: "task" | "prerequisite";
  } | null>(null);

  // Inline add substep
  const [addingSubstepForStep, setAddingSubstepForStep] = useState<
    string | null
  >(null);
  const [newSubstepName, setNewSubstepName] = useState("");

  // Inline add checkpoint
  const [addingCheckpointForStep, setAddingCheckpointForStep] = useState<
    string | null
  >(null);
  const [newCheckpointName, setNewCheckpointName] = useState("");

  const toggleStep = useCallback((id: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSubstep = useCallback((id: string) => {
    setExpandedSubsteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Get tasks for a step
  const getStepTasks = useCallback(
    (stepId: string): Task[] => state.tasks.filter((t) => t.stepId === stepId),
    [state.tasks],
  );

  // Get prerequisites for a step
  const getStepPrerequisites = useCallback(
    (stepId: string): Prerequisite[] =>
      state.prerequisites.filter(
        (p) => p.scope === "STEP" && p.stepId === stepId,
      ),
    [state.prerequisites],
  );

  // Handle task status change
  function handleTaskStatus(taskId: string, status: TaskStatus) {
    if (status === "BLOCKED") {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        setBlockerTarget({ id: task.id, name: task.name, type: "task" });
      }
      return;
    }
    dispatch(setTaskStatus({ id: taskId, status }));
  }

  // Handle prerequisite status change
  function handlePrereqStatus(prereqId: string, status: PrerequisiteStatus) {
    dispatch(setPrerequisiteStatus({ id: prereqId, status }));
  }

  // Blocker confirm
  function handleBlockerConfirm(
    reason: string,
    blockedByItemId: string | null,
  ) {
    if (!blockerTarget) return;
    dispatch(
      setTaskStatus({
        id: blockerTarget.id,
        status: "BLOCKED",
        blockedReason: reason || undefined,
        blockedByItemId: blockedByItemId || undefined,
      }),
    );
    setBlockerTarget(null);
  }

  // Add substep inline
  function handleAddSubstep(stepId: string) {
    const trimmed = newSubstepName.trim();
    if (!trimmed) return;
    const step = state.steps.find((s) => s.id === stepId);
    const order = step ? step.substeps.length + 1 : 1;
    dispatch(
      addSubstep({
        id: generateId(),
        stepId,
        order,
        name: trimmed,
      }),
    );
    setNewSubstepName("");
    setAddingSubstepForStep(null);
  }

  // Add checkpoint inline
  function handleAddCheckpoint(stepId: string) {
    const trimmed = newCheckpointName.trim();
    if (!trimmed) return;
    dispatch(
      addPrerequisite({
        id: generateId(),
        name: trimmed,
        owner: "Unassigned",
        scope: "STEP",
        stepId,
        createdAt: new Date().toISOString(),
      }),
    );
    setNewCheckpointName("");
    setAddingCheckpointForStep(null);
  }

  // Add manual step
  function handleAddManualStep() {
    const order = state.steps.length + 1;
    dispatch(
      addStep({
        id: generateId(),
        order,
        name: `New Step ${order}`,
      }),
    );
  }

  // Prerequisite status cycle (click to advance)
  function cyclePrereqStatus(prereq: Prerequisite) {
    const current = prereq.status ?? "NOT_MET";
    const next: PrerequisiteStatus =
      current === "NOT_MET"
        ? "IN_PROGRESS"
        : current === "IN_PROGRESS"
          ? "MET"
          : "NOT_MET";
    handlePrereqStatus(prereq.id, next);
  }

  function prereqStatusClass(
    status: PrerequisiteStatus | null | undefined,
  ): string {
    const s = status ?? "NOT_MET";
    if (s === "MET") return "wbg-pill wbg-pill--done";
    if (s === "IN_PROGRESS") return "wbg-pill wbg-pill--in-progress";
    return "wbg-pill wbg-pill--pending";
  }

  function formatPrereqStatus(
    status: PrerequisiteStatus | null | undefined,
  ): string {
    const s = status ?? "NOT_MET";
    if (s === "MET") return "Done";
    if (s === "IN_PROGRESS") return "In Progress";
    return "Pending";
  }

  // Render a single step block
  function renderStep(step: DemoStep, index: number) {
    const isExpanded = expandedSteps.has(step.id);
    const stepTasks = getStepTasks(step.id);
    const stepPrereqs = getStepPrerequisites(step.id);
    const progress = calcStepProgress(stepTasks);
    const owners = getStepOwners(stepTasks);
    const sortedSubsteps = [...step.substeps].sort((a, b) => a.order - b.order);

    return (
      <div key={step.id} className="wbg-step">
        {/* Step Header Row */}
        <div
          className="wbg-row wbg-row--step"
          onClick={() => toggleStep(step.id)}
        >
          <div className="wbg-cell wbg-cell--hierarchy wbg-cell--step">
            <button
              className="wbg-chevron"
              type="button"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <span className="wbg-step__number">{index + 1}</span>
            <div className="wbg-step__info">
              <span className="wbg-step__name">{step.name}</span>
              {step.description && (
                <span className="wbg-step__desc">{step.description}</span>
              )}
            </div>
          </div>

          <div className="wbg-cell wbg-cell--status">
            {stepTasks.length > 0 && (
              <div className="wbg-progress">
                <div className="wbg-progress__bar">
                  {progress.blockedPct > 0 && (
                    <div
                      className="wbg-progress__blocked"
                      style={{ width: `${progress.blockedPct}%` }}
                    />
                  )}
                  <div
                    className="wbg-progress__fill"
                    style={{
                      width: `${progress.pct}%`,
                    }}
                  />
                </div>
                <span className="wbg-progress__label">{progress.pct}%</span>
              </div>
            )}
          </div>

          <div className="wbg-cell wbg-cell--context" />

          {showExecution && (
            <div className="wbg-cell wbg-cell--assignees">
              {owners.length > 0 && (
                <div className="wbg-avatars">
                  {owners.slice(0, 3).map((owner) => (
                    <span key={owner} className="wbg-avatar" title={owner}>
                      {avatarInitial(owner)}
                    </span>
                  ))}
                  {owners.length > 3 && (
                    <span className="wbg-avatar wbg-avatar--more">
                      +{owners.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="wbg-cell wbg-cell--actions">
            <button
              className="wbg-icon-btn"
              title="Add checkpoint"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAddingCheckpointForStep(
                  addingCheckpointForStep === step.id ? null : step.id,
                );
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </button>
            <button
              className="wbg-icon-btn"
              title="Add substep"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAddingSubstepForStep(
                  addingSubstepForStep === step.id ? null : step.id,
                );
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="wbg-step__children">
            {/* Checkpoints (prerequisites) pinned at top */}
            {stepPrereqs.map((prereq) => renderCheckpoint(prereq))}

            {/* Inline add checkpoint */}
            {addingCheckpointForStep === step.id && (
              <div className="wbg-row wbg-row--add-inline">
                <div className="wbg-cell wbg-cell--hierarchy wbg-cell--checkpoint">
                  <div className="wbg-indent wbg-indent--2" />
                  <input
                    className="wbg-inline-input"
                    placeholder="Checkpoint name..."
                    value={newCheckpointName}
                    onChange={(e) => setNewCheckpointName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCheckpoint(step.id);
                      if (e.key === "Escape") setAddingCheckpointForStep(null);
                    }}
                    autoFocus
                  />
                </div>
                <div className="wbg-cell" />
                <div className="wbg-cell" />
                {showExecution && <div className="wbg-cell" />}
                <div className="wbg-cell wbg-cell--actions">
                  <button
                    className="wbg-icon-btn"
                    onClick={() => handleAddCheckpoint(step.id)}
                    type="button"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--wbg-emerald)"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Tasks for this step (execution phase) */}
            {showExecution &&
              stepTasks
                .filter((t) => !t.substepId)
                .map((task) => renderTask(task))}

            {/* Substeps */}
            {sortedSubsteps.map((substep) => {
              const isSubExpanded = expandedSubsteps.has(substep.id);
              const substepTasks = stepTasks.filter(
                (t) => t.substepId === substep.id,
              );

              return (
                <div key={substep.id} className="wbg-substep-block">
                  <div
                    className="wbg-row wbg-row--substep"
                    onClick={() => toggleSubstep(substep.id)}
                  >
                    <div className="wbg-cell wbg-cell--hierarchy wbg-cell--substep">
                      {showExecution && substepTasks.length > 0 && (
                        <button
                          className="wbg-chevron wbg-chevron--sm"
                          type="button"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            style={{
                              transform: isSubExpanded
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "transform 150ms ease",
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      )}
                      <span className="wbg-substep__dot" />
                      <span className="wbg-substep__name">{substep.name}</span>
                    </div>
                    <div className="wbg-cell wbg-cell--status" />
                    <div className="wbg-cell wbg-cell--context" />
                    {showExecution && (
                      <div className="wbg-cell wbg-cell--assignees" />
                    )}
                    <div className="wbg-cell wbg-cell--actions">
                      <button
                        className="wbg-icon-btn"
                        title="Add checkpoint"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </button>
                      <button
                        className="wbg-icon-btn"
                        title="Remove substep"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            removeSubstep({
                              id: substep.id,
                              stepId: step.id,
                            }),
                          );
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                            style={{
                              transform: "rotate(45deg)",
                              transformOrigin: "center",
                            }}
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Substep tasks (expanded in execution) */}
                  {showExecution &&
                    isSubExpanded &&
                    substepTasks.map((task) => renderTask(task, true))}
                </div>
              );
            })}

            {/* + New Demo Substep */}
            {addingSubstepForStep === step.id ? (
              <div className="wbg-row wbg-row--add-inline">
                <div className="wbg-cell wbg-cell--hierarchy wbg-cell--substep">
                  <div className="wbg-indent wbg-indent--2" />
                  <input
                    className="wbg-inline-input"
                    placeholder="Substep name..."
                    value={newSubstepName}
                    onChange={(e) => setNewSubstepName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSubstep(step.id);
                      if (e.key === "Escape") setAddingSubstepForStep(null);
                    }}
                    autoFocus
                  />
                </div>
                <div className="wbg-cell" />
                <div className="wbg-cell" />
                {showExecution && <div className="wbg-cell" />}
                <div className="wbg-cell wbg-cell--actions">
                  <button
                    className="wbg-icon-btn"
                    onClick={() => handleAddSubstep(step.id)}
                    type="button"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--wbg-emerald)"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="wbg-add-link"
                onClick={() => setAddingSubstepForStep(step.id)}
                type="button"
              >
                + New Demo Substep
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render checkpoint row
  function renderCheckpoint(prereq: Prerequisite) {
    const effectiveStatus = prereq.status ?? "NOT_MET";
    const isMet = effectiveStatus === "MET";

    return (
      <div key={prereq.id} className="wbg-row wbg-row--checkpoint">
        <div className="wbg-cell wbg-cell--hierarchy wbg-cell--checkpoint">
          <button
            className={`wbg-checkbox ${isMet ? "wbg-checkbox--checked" : ""}`}
            onClick={() => cyclePrereqStatus(prereq)}
            type="button"
            title="Toggle status"
          >
            {isMet && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
          <svg
            className="wbg-checkpoint-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--wbg-indigo)"
            strokeWidth={2}
          >
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="wbg-checkpoint__info">
            <span className="wbg-checkpoint__name">{prereq.name}</span>
            <span className="wbg-checkpoint__label">CHECKPOINT</span>
          </div>
        </div>

        <div className="wbg-cell wbg-cell--status">
          <button
            className={prereqStatusClass(prereq.status)}
            onClick={() => cyclePrereqStatus(prereq)}
            type="button"
          >
            {formatPrereqStatus(prereq.status)}
          </button>
        </div>

        <div className="wbg-cell wbg-cell--context">
          <span className="wbg-context-placeholder">
            {prereq.notes ?? "Prerequisite context..."}
          </span>
        </div>

        {showExecution && (
          <div className="wbg-cell wbg-cell--assignees">
            <span className="wbg-assignee-placeholder">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {prereq.owner === "Unassigned" ? "Unassigned" : prereq.owner}
            </span>
          </div>
        )}

        <div className="wbg-cell wbg-cell--actions">
          <button
            className="wbg-icon-btn wbg-icon-btn--danger"
            title="Remove checkpoint"
            type="button"
            onClick={() => dispatch(removePrerequisite({ id: prereq.id }))}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Render task row
  function renderTask(task: Task, nested = false) {
    const status = task.status ?? "PENDING";
    const isBlocked = status === "BLOCKED";
    const blockedDeps = isBlocked && task.blockedByItemId ? 1 : 0;

    return (
      <div
        key={task.id}
        className={`wbg-row wbg-row--task ${nested ? "wbg-row--task-nested" : ""}`}
      >
        <div className="wbg-cell wbg-cell--hierarchy wbg-cell--task">
          <div
            className={`wbg-task-icon ${isBlocked ? "wbg-task-icon--blocked" : status === "DONE" ? "wbg-task-icon--done" : status === "IN_PROGRESS" ? "wbg-task-icon--inprogress" : ""}`}
          >
            {status === "DONE" ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : isBlocked ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            ) : status === "IN_PROGRESS" ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ) : (
              <div className="wbg-task-icon__empty" />
            )}
          </div>
          <div className="wbg-task__info">
            <span className="wbg-task__name">{task.name}</span>
            <div className="wbg-task__badges">
              <span className="wbg-source-badge">{task.source}</span>
              {isBlocked && blockedDeps > 0 && (
                <span className="wbg-blocked-badge">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {blockedDeps} BLOCKED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="wbg-cell wbg-cell--status">
          <select
            className={statusPillClass(status)}
            value={status}
            onChange={(e) =>
              handleTaskStatus(task.id, e.target.value as TaskStatus)
            }
            onClick={(e) => e.stopPropagation()}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="wbg-cell wbg-cell--context">
          <span
            className={`wbg-context-text ${isBlocked ? "wbg-context-text--blocked" : ""}`}
          >
            {task.notes ?? task.extractionContext ?? "Execution context..."}
          </span>
        </div>

        {showExecution && (
          <div className="wbg-cell wbg-cell--assignees">
            <span className="wbg-assignee-placeholder">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {task.owner === "Unassigned" ? "Unassigned" : task.owner}
            </span>
          </div>
        )}

        <div className="wbg-cell wbg-cell--actions">
          <button
            className="wbg-icon-btn wbg-icon-btn--danger"
            title="Remove task"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(removeTask({ id: task.id }));
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wbg-grid">
      {/* Column header */}
      <div className="wbg-grid__header">
        <div className="wbg-cell wbg-cell--hierarchy wbg-cell--header">
          HIERARCHY (STEP {">"} CHECKPOINT {">"} TASK)
        </div>
        <div className="wbg-cell wbg-cell--status wbg-cell--header">STATUS</div>
        <div className="wbg-cell wbg-cell--context wbg-cell--header">
          NOTES / CONTEXT
        </div>
        {showExecution && (
          <div className="wbg-cell wbg-cell--assignees wbg-cell--header">
            ASSIGNEES
          </div>
        )}
        <div className="wbg-cell wbg-cell--actions wbg-cell--header">
          ACTIONS
        </div>
      </div>

      {/* Step rows */}
      {sortedSteps.map((step, i) => renderStep(step, i))}

      {/* + Add Manual Step */}
      <button
        className="wbg-add-link wbg-add-link--step"
        onClick={handleAddManualStep}
        type="button"
      >
        + Add Manual Step
      </button>

      {/* Blocker Modal */}
      {blockerTarget && (
        <BlockerModal
          taskName={blockerTarget.name}
          tasks={state.tasks}
          prerequisites={state.prerequisites}
          currentItemId={blockerTarget.id}
          onConfirm={handleBlockerConfirm}
          onCancel={() => setBlockerTarget(null)}
        />
      )}
    </div>
  );
}
