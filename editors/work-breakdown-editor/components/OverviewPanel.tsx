import { useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
  WorkBreakdownPhase,
  WorkBreakdownStatus,
} from "../../../document-models/work-breakdown/gen/types.js";
import {
  setProjectInfo,
  setPhase,
  setStatus,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

const PHASES: WorkBreakdownPhase[] = [
  "CAPTURE",
  "STRUCTURE",
  "EXECUTION",
  "REVIEW",
];

const STATUSES: WorkBreakdownStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
];

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function OverviewPanel({ document, dispatch }: Props) {
  const state = document.state.global;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(state.title ?? "");
  const [editDescription, setEditDescription] = useState(
    state.description ?? "",
  );

  function handleStartEditing() {
    setEditTitle(state.title ?? "");
    setEditDescription(state.description ?? "");
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setIsEditing(false);
  }

  function handleSaveProjectInfo() {
    dispatch(
      setProjectInfo({
        title: editTitle || undefined,
        description: editDescription || undefined,
      }),
    );
    setIsEditing(false);
  }

  function handlePhaseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const phase = e.target.value as WorkBreakdownPhase;
    dispatch(setPhase({ phase, timestamp: new Date().toISOString() }));
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as WorkBreakdownStatus;
    dispatch(setStatus({ status: newStatus }));
  }

  // Summary stats
  const inputsCount = state.inputs.length;
  const stepsCount = state.steps.length;
  const tasksCount = state.tasks.length;
  const prerequisitesCount = state.prerequisites.length;

  // Task completion
  const tasksDone = state.tasks.filter((t) => t.status === "DONE").length;
  const tasksTotal = state.tasks.length;

  // Prerequisite status breakdown
  const prerequisitesMet = state.prerequisites.filter(
    (p) => p.status === "MET",
  ).length;
  const prerequisitesInProgress = state.prerequisites.filter(
    (p) => p.status === "IN_PROGRESS",
  ).length;
  const prerequisitesNotMet = state.prerequisites.filter(
    (p) => !p.status || p.status === "NOT_MET",
  ).length;

  return (
    <div>
      {/* Project Info */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <div>
            <h2 className="wb-panel__title">Project Info</h2>
            <p className="wb-panel__subtitle">
              Basic details about this work breakdown
            </p>
          </div>
          {!isEditing && (
            <button
              className="wb-btn wb-btn--sm"
              onClick={handleStartEditing}
              type="button"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <label className="wb-label" htmlFor="wb-overview-title">
                Title
              </label>
              <input
                id="wb-overview-title"
                className="wb-input"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="wb-label" htmlFor="wb-overview-description">
                Description
              </label>
              <textarea
                id="wb-overview-description"
                className="wb-textarea"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Project description"
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="wb-btn wb-btn--primary wb-btn--sm"
                onClick={handleSaveProjectInfo}
                type="button"
              >
                Save
              </button>
              <button
                className="wb-btn wb-btn--sm"
                onClick={handleCancelEditing}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="wb-card__title" style={{ marginBottom: 4 }}>
              {state.title || "Untitled"}
            </p>
            <p className="wb-card__body">
              {state.description || "No description provided."}
            </p>
          </div>
        )}
      </div>

      {/* Phase & Status selectors */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Phase & Status</h2>
        </div>
        <div className="wb-grid-2">
          <div>
            <label className="wb-label" htmlFor="wb-overview-phase">
              Phase
            </label>
            <select
              id="wb-overview-phase"
              className="wb-select"
              value={state.phase ?? ""}
              onChange={handlePhaseChange}
              style={{ width: "100%" }}
            >
              <option value="" disabled>
                Select phase
              </option>
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  {formatLabel(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="wb-label" htmlFor="wb-overview-status">
              Status
            </label>
            <select
              id="wb-overview-status"
              className="wb-select"
              value={state.status ?? ""}
              onChange={handleStatusChange}
              style={{ width: "100%" }}
            >
              <option value="" disabled>
                Select status
              </option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Summary</h2>
        </div>
        <div className="wb-grid-4">
          <div className="wb-stat">
            <div className="wb-stat__value">{inputsCount}</div>
            <div className="wb-stat__label">Inputs</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{stepsCount}</div>
            <div className="wb-stat__label">Steps</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{tasksCount}</div>
            <div className="wb-stat__label">Tasks</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{prerequisitesCount}</div>
            <div className="wb-stat__label">Prerequisites</div>
          </div>
        </div>
      </div>

      {/* Task Completion */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Task Completion</h2>
        </div>
        {tasksTotal > 0 ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span className="wb-card__body">
                {tasksDone} of {tasksTotal} tasks completed
              </span>
              <span className="wb-mono" style={{ fontWeight: 600 }}>
                {Math.round((tasksDone / tasksTotal) * 100)}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 8,
                background: "var(--wb-border)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, var(--wb-emerald-500), var(--wb-emerald-600))",
                  borderRadius: 4,
                  transition: "width 400ms ease",
                }}
              />
            </div>
          </div>
        ) : (
          <p className="wb-card__body">No tasks added yet.</p>
        )}
      </div>

      {/* Prerequisite Status Breakdown */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Prerequisite Status</h2>
        </div>
        {prerequisitesCount > 0 ? (
          <div className="wb-grid-3">
            <div className="wb-card">
              <div className="wb-card__header">
                <span className="wb-status wb-status--met">MET</span>
              </div>
              <div className="wb-card__body">
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--wb-text)",
                  }}
                >
                  {prerequisitesMet}
                </span>
              </div>
            </div>
            <div className="wb-card">
              <div className="wb-card__header">
                <span className="wb-status wb-status--in_progress">
                  IN PROGRESS
                </span>
              </div>
              <div className="wb-card__body">
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--wb-text)",
                  }}
                >
                  {prerequisitesInProgress}
                </span>
              </div>
            </div>
            <div className="wb-card">
              <div className="wb-card__header">
                <span className="wb-status wb-status--not_met">NOT MET</span>
              </div>
              <div className="wb-card__body">
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--wb-text)",
                  }}
                >
                  {prerequisitesNotMet}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="wb-card__body">No prerequisites added yet.</p>
        )}
      </div>
    </div>
  );
}
