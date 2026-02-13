import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addProcess,
  removeProcess,
  addProcessStep,
  removeProcessStep,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  BusinessProcess,
  ProcessType,
  StepType,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const PROCESS_TYPES: ProcessType[] = ["AS_IS", "TO_BE"];
const STEP_TYPES: StepType[] = [
  "START",
  "TASK",
  "DECISION",
  "GATEWAY",
  "SUBPROCESS",
  "END",
];

const STEP_TYPE_COLORS: Record<StepType, { bg: string; color: string }> = {
  START: {
    bg: "var(--ba-emerald-100)",
    color: "var(--ba-emerald-700)",
  },
  TASK: {
    bg: "var(--ba-teal-100)",
    color: "var(--ba-teal-700)",
  },
  DECISION: {
    bg: "var(--ba-amber-100)",
    color: "var(--ba-amber-700)",
  },
  GATEWAY: {
    bg: "var(--ba-indigo-100)",
    color: "var(--ba-indigo-700)",
  },
  SUBPROCESS: {
    bg: "var(--ba-slate-200)",
    color: "var(--ba-slate-700)",
  },
  END: {
    bg: "var(--ba-rose-100)",
    color: "var(--ba-rose-700)",
  },
};

export function ProcessesPanel({ document, dispatch }: Props) {
  const s = document.state.global;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [processForm, setProcessForm] = useState({
    name: "",
    type: "AS_IS" as ProcessType,
    description: "",
    owner: "",
  });
  const [stepForm, setStepForm] = useState({
    name: "",
    type: "TASK" as StepType,
    actor: "",
    description: "",
    duration: "",
    automatable: false,
  });

  const { asIsCount, toBeCount, totalSteps } = useMemo(() => {
    let asIs = 0;
    let toBe = 0;
    let steps = 0;
    for (const p of s.processes) {
      if (p.type === "AS_IS") asIs++;
      else if (p.type === "TO_BE") toBe++;
      steps += p.steps.length;
    }
    return { asIsCount: asIs, toBeCount: toBe, totalSteps: steps };
  }, [s.processes]);

  const resetProcessForm = () =>
    setProcessForm({
      name: "",
      type: "AS_IS",
      description: "",
      owner: "",
    });

  const resetStepForm = () =>
    setStepForm({
      name: "",
      type: "TASK",
      actor: "",
      description: "",
      duration: "",
      automatable: false,
    });

  const handleAddProcess = () => {
    if (!processForm.name.trim()) return;
    dispatch(
      addProcess({
        id: generateId(),
        name: processForm.name.trim(),
        type: processForm.type,
        description: processForm.description || undefined,
        owner: processForm.owner || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    resetProcessForm();
    setShowAddProcess(false);
  };

  const handleRemoveProcess = (id: string) => {
    dispatch(removeProcess({ id }));
    setConfirmDeleteId(null);
    if (expandedId === id) setExpandedId(null);
  };

  const handleAddStep = (processId: string) => {
    if (!stepForm.name.trim()) return;
    const process = s.processes.find((p) => p.id === processId);
    const order = process ? process.steps.length : 0;
    dispatch(
      addProcessStep({
        id: generateId(),
        processId,
        name: stepForm.name.trim(),
        order,
        type: stepForm.type,
        actor: stepForm.actor || undefined,
        description: stepForm.description || undefined,
        duration: stepForm.duration || undefined,
        automatable: stepForm.automatable,
      }),
    );
    resetStepForm();
    setShowAddStep(false);
  };

  const handleRemoveStep = (processId: string, stepId: string) => {
    dispatch(removeProcessStep({ id: stepId, processId }));
  };

  const closeProcessModal = () => {
    resetProcessForm();
    setShowAddProcess(false);
  };

  const closeStepModal = () => {
    resetStepForm();
    setShowAddStep(false);
  };

  if (s.processes.length === 0) {
    return (
      <div className="ba-panel-empty">
        <svg
          className="ba-panel-empty__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h8m-8 6h16M9 6v12"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No processes documented yet. Add your first process to begin mapping
          workflows.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAddProcess(true)}
          type="button"
        >
          Add Process
        </button>
        {showAddProcess && renderProcessModal()}
      </div>
    );
  }

  function renderProcessModal() {
    return (
      <div className="ba-modal-overlay" onClick={closeProcessModal}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add Process</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Name *</label>
              <input
                className="ba-input"
                value={processForm.name}
                onChange={(e) =>
                  setProcessForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Process name..."
                autoFocus
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Type</label>
                <select
                  className="ba-input ba-select"
                  value={processForm.type}
                  onChange={(e) =>
                    setProcessForm((f) => ({
                      ...f,
                      type: e.target.value as ProcessType,
                    }))
                  }
                >
                  {PROCESS_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Owner</label>
                <input
                  className="ba-input"
                  value={processForm.owner}
                  onChange={(e) =>
                    setProcessForm((f) => ({ ...f, owner: e.target.value }))
                  }
                  placeholder="Process owner..."
                />
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Description</label>
              <textarea
                className="ba-input ba-textarea"
                value={processForm.description}
                onChange={(e) =>
                  setProcessForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the process..."
              />
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={closeProcessModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={handleAddProcess}
              type="button"
              disabled={!processForm.name.trim()}
            >
              Add Process
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderStepModal(processId: string) {
    return (
      <div className="ba-modal-overlay" onClick={closeStepModal}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add Step</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Name *</label>
              <input
                className="ba-input"
                value={stepForm.name}
                onChange={(e) =>
                  setStepForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Step name..."
                autoFocus
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Type</label>
                <select
                  className="ba-input ba-select"
                  value={stepForm.type}
                  onChange={(e) =>
                    setStepForm((f) => ({
                      ...f,
                      type: e.target.value as StepType,
                    }))
                  }
                >
                  {STEP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Actor</label>
                <input
                  className="ba-input"
                  value={stepForm.actor}
                  onChange={(e) =>
                    setStepForm((f) => ({ ...f, actor: e.target.value }))
                  }
                  placeholder="Who performs this step?"
                />
              </div>
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Duration</label>
                <input
                  className="ba-input"
                  value={stepForm.duration}
                  onChange={(e) =>
                    setStepForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  placeholder="e.g. 2 hours, 1 day"
                />
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Automatable</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    paddingTop: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={stepForm.automatable}
                    onChange={(e) =>
                      setStepForm((f) => ({
                        ...f,
                        automatable: e.target.checked,
                      }))
                    }
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ba-text-secondary)",
                    }}
                  >
                    Can be automated
                  </span>
                </div>
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Description</label>
              <textarea
                className="ba-input ba-textarea"
                value={stepForm.description}
                onChange={(e) =>
                  setStepForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe the step..."
              />
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={closeStepModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={() => handleAddStep(processId)}
              type="button"
              disabled={!stepForm.name.trim()}
            >
              Add Step
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderStepsList(process: BusinessProcess) {
    const sortedSteps = [...process.steps].sort((a, b) => a.order - b.order);

    return (
      <div style={{ paddingTop: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--ba-text-secondary)",
            }}
          >
            Steps ({process.steps.length})
          </span>
          <button
            className="ba-btn ba-btn--primary ba-btn--sm"
            onClick={() => {
              resetStepForm();
              setShowAddStep(true);
            }}
            type="button"
          >
            <svg
              className="ba-btn__icon"
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
            Add Step
          </button>
        </div>

        {sortedSteps.length === 0 ? (
          <div
            style={{
              padding: "20px 0",
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "var(--ba-text-muted)",
              fontStyle: "italic",
            }}
          >
            No steps defined yet
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {sortedSteps.map((step, idx) => {
              const stepType = step.type || "TASK";
              const colors = STEP_TYPE_COLORS[stepType];
              return (
                <div key={step.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 0",
                    }}
                  >
                    {/* Order number circle */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: colors.bg,
                        color: colors.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        fontFamily: "var(--ba-mono)",
                      }}
                    >
                      {step.order + 1}
                    </div>

                    {/* Step content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "var(--ba-text)",
                          }}
                        >
                          {step.name}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "1px 6px",
                            fontSize: "0.5625rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            borderRadius: 4,
                            background: colors.bg,
                            color: colors.color,
                            fontFamily: "var(--ba-mono)",
                          }}
                        >
                          {stepType.replace(/_/g, " ")}
                        </span>
                        {step.automatable && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              padding: "1px 6px",
                              fontSize: "0.5625rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              borderRadius: 4,
                              background: "var(--ba-emerald-100)",
                              color: "var(--ba-emerald-700)",
                            }}
                          >
                            Automatable
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        {step.actor && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ba-text-secondary)",
                            }}
                          >
                            Actor: {step.actor}
                          </span>
                        )}
                        {step.duration && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ba-text-secondary)",
                              fontFamily: "var(--ba-mono)",
                            }}
                          >
                            {step.duration}
                          </span>
                        )}
                      </div>

                      {step.description && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--ba-text-muted)",
                            margin: "4px 0 0",
                            lineHeight: 1.4,
                          }}
                        >
                          {step.description}
                        </p>
                      )}
                    </div>

                    {/* Remove step button */}
                    <button
                      className="ba-btn ba-btn--ghost ba-btn--sm"
                      onClick={() => handleRemoveStep(process.id, step.id)}
                      type="button"
                      style={{ color: "var(--ba-rose-500)", flexShrink: 0 }}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Connector line between steps */}
                  {idx < sortedSteps.length - 1 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 13,
                      }}
                    >
                      <div
                        style={{
                          width: 2,
                          height: 16,
                          background: "var(--ba-border)",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showAddStep && renderStepModal(process.id)}
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{s.processes.length}</div>
          <div className="ba-stat__label">Total Processes</div>
        </div>
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{asIsCount}</div>
          <div className="ba-stat__label">As-Is</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">{toBeCount}</div>
          <div className="ba-stat__label">To-Be</div>
        </div>
        <div className="ba-stat ba-stat--rose">
          <div className="ba-stat__value">{totalSteps}</div>
          <div className="ba-stat__label">Total Steps</div>
        </div>
      </div>

      {/* Filters + Add Button */}
      <div className="ba-filters">
        <span
          style={{
            fontSize: "0.8125rem",
            color: "var(--ba-text-secondary)",
            fontWeight: 500,
          }}
        >
          {s.processes.length} process
          {s.processes.length !== 1 ? "es" : ""}
        </span>
        <div style={{ flex: 1 }} />
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => {
            resetProcessForm();
            setShowAddProcess(true);
          }}
          type="button"
        >
          <svg
            className="ba-btn__icon"
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
          Add Process
        </button>
      </div>

      {/* Process Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {s.processes.map((proc) => {
          const isExpanded = expandedId === proc.id;
          const isConfirmingDelete = confirmDeleteId === proc.id;
          const typeBadgeStyle =
            proc.type === "TO_BE"
              ? {
                  background: "var(--ba-teal-100)",
                  color: "var(--ba-teal-700)",
                }
              : {
                  background: "var(--ba-amber-100)",
                  color: "var(--ba-amber-700)",
                };

          return (
            <div key={proc.id} className="ba-card">
              <div className="ba-card__body">
                {/* Process header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : proc.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "var(--ba-text)",
                          margin: 0,
                        }}
                      >
                        {proc.name}
                      </h4>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "2px 8px",
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          borderRadius: 4,
                          fontFamily: "var(--ba-mono)",
                          ...typeBadgeStyle,
                        }}
                      >
                        {proc.type.replace(/_/g, " ")}
                      </span>
                    </div>

                    {proc.description && (
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--ba-text-secondary)",
                          margin: "0 0 6px",
                          lineHeight: 1.5,
                        }}
                      >
                        {proc.description}
                      </p>
                    )}

                    {/* Meta info row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      {proc.owner && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--ba-text-secondary)",
                          }}
                        >
                          Owner: {proc.owner}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--ba-text-muted)",
                          fontFamily: "var(--ba-mono)",
                        }}
                      >
                        {proc.steps.length} step
                        {proc.steps.length !== 1 ? "s" : ""}
                      </span>
                      {proc.painPoints.length > 0 && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--ba-amber-600)",
                            fontWeight: 500,
                          }}
                        >
                          {proc.painPoints.length} pain point
                          {proc.painPoints.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {proc.improvements.length > 0 && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--ba-emerald-600)",
                            fontWeight: 500,
                          }}
                        >
                          {proc.improvements.length} improvement
                          {proc.improvements.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand/collapse + actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    {isConfirmingDelete ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="ba-btn ba-btn--ghost ba-btn--sm"
                          onClick={() => setConfirmDeleteId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className="ba-btn ba-btn--sm"
                          onClick={() => handleRemoveProcess(proc.id)}
                          type="button"
                          style={{
                            background: "var(--ba-rose-50)",
                            color: "var(--ba-rose-600)",
                          }}
                        >
                          Confirm Delete
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{ display: "flex", gap: 4 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="ba-btn ba-btn--ghost ba-btn--sm"
                          onClick={() => setConfirmDeleteId(proc.id)}
                          type="button"
                          style={{ color: "var(--ba-rose-500)" }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    <svg
                      style={{
                        width: 18,
                        height: 18,
                        color: "var(--ba-text-muted)",
                        transition: "transform 150ms ease",
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded steps list */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px solid var(--ba-border)",
                      marginTop: 16,
                    }}
                  >
                    {renderStepsList(proc)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddProcess && renderProcessModal()}
    </div>
  );
}
