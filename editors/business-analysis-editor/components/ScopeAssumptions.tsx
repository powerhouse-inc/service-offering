import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addAssumption,
  removeAssumption,
  setAssumptionStatus,
  addScopeItem,
  removeScopeItem,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  AssumptionStatus,
  ScopeItem,
  ScopeItemType,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

type SubTab = "scope" | "assumptions";

const SCOPE_COLUMNS: {
  type: ScopeItemType;
  label: string;
  color: string;
  borderColor: string;
}[] = [
  {
    type: "IN_SCOPE",
    label: "In Scope",
    color: "var(--ba-teal-100)",
    borderColor: "var(--ba-teal-500)",
  },
  {
    type: "OUT_OF_SCOPE",
    label: "Out of Scope",
    color: "var(--ba-rose-100)",
    borderColor: "var(--ba-rose-500)",
  },
  {
    type: "DEFERRED",
    label: "Deferred",
    color: "var(--ba-amber-100)",
    borderColor: "var(--ba-amber-500)",
  },
];

const _ASSUMPTION_STATUSES: AssumptionStatus[] = [
  "ACTIVE",
  "VALIDATED",
  "INVALIDATED",
];

function statusBadgeClass(status: AssumptionStatus | null | undefined): {
  bg: string;
  color: string;
} {
  switch (status) {
    case "ACTIVE":
      return { bg: "var(--ba-teal-100)", color: "var(--ba-teal-600)" };
    case "VALIDATED":
      return { bg: "var(--ba-emerald-100)", color: "var(--ba-emerald-500)" };
    case "INVALIDATED":
      return { bg: "var(--ba-rose-100)", color: "var(--ba-rose-500)" };
    default:
      return { bg: "var(--ba-slate-100)", color: "var(--ba-text-secondary)" };
  }
}

export function ScopeAssumptions({ document, dispatch }: Props) {
  const s = document.state.global;
  const [subTab, setSubTab] = useState<SubTab>("scope");

  // Scope state
  const [showScopeForm, setShowScopeForm] = useState<ScopeItemType | null>(
    null,
  );
  const [scopeForm, setScopeForm] = useState({
    description: "",
    rationale: "",
  });

  // Assumption state
  const [showAssumptionModal, setShowAssumptionModal] = useState(false);
  const [assumptionForm, setAssumptionForm] = useState({
    description: "",
    category: "",
    notes: "",
  });
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validatedBy, setValidatedBy] = useState("");

  // --- Scope handlers ---

  const handleAddScopeItem = (type: ScopeItemType) => {
    if (!scopeForm.description.trim()) return;
    dispatch(
      addScopeItem({
        id: generateId(),
        description: scopeForm.description.trim(),
        type,
        rationale: scopeForm.rationale || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    setScopeForm({ description: "", rationale: "" });
    setShowScopeForm(null);
  };

  const handleRemoveScopeItem = (id: string) => {
    dispatch(removeScopeItem({ id }));
  };

  const scopeByType = useMemo(() => {
    const map: Record<ScopeItemType, ScopeItem[]> = {
      IN_SCOPE: [],
      OUT_OF_SCOPE: [],
      DEFERRED: [],
    };
    for (const item of s.scopeItems) {
      if (map[item.type]) map[item.type].push(item);
    }
    return map;
  }, [s.scopeItems]);

  const scopeItemsByType = (type: ScopeItemType): ScopeItem[] =>
    scopeByType[type];

  // --- Assumption handlers ---

  const handleAddAssumption = () => {
    if (!assumptionForm.description.trim()) return;
    dispatch(
      addAssumption({
        id: generateId(),
        description: assumptionForm.description.trim(),
        category: assumptionForm.category || undefined,
        notes: assumptionForm.notes || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    setAssumptionForm({ description: "", category: "", notes: "" });
    setShowAssumptionModal(false);
  };

  const handleRemoveAssumption = (id: string) => {
    dispatch(removeAssumption({ id }));
  };

  const handleValidate = (id: string) => {
    dispatch(
      setAssumptionStatus({
        id,
        status: "VALIDATED",
        validatedAt: new Date().toISOString(),
        validatedBy: validatedBy || undefined,
      }),
    );
    setValidatingId(null);
    setValidatedBy("");
  };

  const handleInvalidate = (id: string) => {
    dispatch(
      setAssumptionStatus({
        id,
        status: "INVALIDATED",
        validatedAt: new Date().toISOString(),
      }),
    );
  };

  const handleReactivate = (id: string) => {
    dispatch(
      setAssumptionStatus({
        id,
        status: "ACTIVE",
      }),
    );
  };

  // --- Counts ---

  const inScopeCount = scopeByType.IN_SCOPE.length;
  const outScopeCount = scopeByType.OUT_OF_SCOPE.length;
  const deferredCount = scopeByType.DEFERRED.length;

  const { activeAssumptions, validatedAssumptions, invalidatedAssumptions } =
    useMemo(() => {
      let active = 0;
      let validated = 0;
      let invalidated = 0;
      for (const a of s.assumptions) {
        const st = a.status || "ACTIVE";
        if (st === "ACTIVE") active++;
        else if (st === "VALIDATED") validated++;
        else if (st === "INVALIDATED") invalidated++;
      }
      return {
        activeAssumptions: active,
        validatedAssumptions: validated,
        invalidatedAssumptions: invalidated,
      };
    }, [s.assumptions]);

  // --- Render ---

  function renderScopeTab() {
    if (s.scopeItems.length === 0 && !showScopeForm) {
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="ba-panel-empty__text">
            No scope items defined yet. Define what is in scope, out of scope,
            or deferred.
          </p>
          <button
            className="ba-btn ba-btn--primary"
            onClick={() => setShowScopeForm("IN_SCOPE")}
            type="button"
          >
            Add Scope Item
          </button>
        </div>
      );
    }

    return (
      <div>
        {/* Stats */}
        <div className="ba-stats">
          <div className="ba-stat ba-stat--teal">
            <div className="ba-stat__value">{s.scopeItems.length}</div>
            <div className="ba-stat__label">Total Items</div>
          </div>
          <div className="ba-stat ba-stat--teal">
            <div className="ba-stat__value">{inScopeCount}</div>
            <div className="ba-stat__label">In Scope</div>
          </div>
          <div className="ba-stat ba-stat--rose">
            <div className="ba-stat__value">{outScopeCount}</div>
            <div className="ba-stat__label">Out of Scope</div>
          </div>
          <div className="ba-stat ba-stat--amber">
            <div className="ba-stat__value">{deferredCount}</div>
            <div className="ba-stat__label">Deferred</div>
          </div>
        </div>

        {/* Kanban columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {SCOPE_COLUMNS.map((col) => {
            const items = scopeItemsByType(col.type);
            return (
              <div
                key={col.type}
                className="ba-card"
                style={{ overflow: "hidden" }}
              >
                <div
                  className="ba-card__header"
                  style={{ borderTop: `3px solid ${col.borderColor}` }}
                >
                  <h3 className="ba-card__title">{col.label}</h3>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--ba-text-muted)",
                        background: "var(--ba-slate-100)",
                        padding: "1px 7px",
                        borderRadius: 8,
                      }}
                    >
                      {items.length}
                    </span>
                    <button
                      className="ba-btn ba-btn--primary ba-btn--sm"
                      onClick={() => {
                        setScopeForm({ description: "", rationale: "" });
                        setShowScopeForm(col.type);
                      }}
                      type="button"
                    >
                      + Add
                    </button>
                  </div>
                </div>
                <div className="ba-card__body" style={{ padding: 12 }}>
                  {items.length === 0 && showScopeForm !== col.type && (
                    <div
                      style={{
                        padding: "20px 12px",
                        textAlign: "center",
                        color: "var(--ba-text-muted)",
                        fontSize: "0.8125rem",
                        fontStyle: "italic",
                      }}
                    >
                      No items
                    </div>
                  )}
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: col.color,
                        borderRadius: "var(--ba-radius-sm)",
                        padding: "12px 14px",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              color: "var(--ba-text)",
                              lineHeight: 1.4,
                              marginBottom: item.rationale ? 6 : 0,
                            }}
                          >
                            {item.description}
                          </div>
                          {item.rationale && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--ba-text-secondary)",
                                lineHeight: 1.4,
                              }}
                            >
                              {item.rationale}
                            </div>
                          )}
                        </div>
                        <button
                          className="ba-btn ba-btn--ghost ba-btn--sm"
                          onClick={() => handleRemoveScopeItem(item.id)}
                          type="button"
                          style={{
                            color: "var(--ba-rose-500)",
                            flexShrink: 0,
                            padding: "2px 6px",
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            style={{ width: 14, height: 14 }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Inline add form */}
                  {showScopeForm === col.type && (
                    <div
                      style={{
                        background: "var(--ba-slate-50)",
                        borderRadius: "var(--ba-radius-sm)",
                        padding: 12,
                        marginTop: items.length > 0 ? 4 : 0,
                        border: "1px dashed var(--ba-border-strong)",
                      }}
                    >
                      <div className="ba-form-group">
                        <label className="ba-label">Description *</label>
                        <textarea
                          className="ba-input ba-textarea"
                          value={scopeForm.description}
                          onChange={(e) =>
                            setScopeForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe the scope item..."
                          style={{ minHeight: 60 }}
                          autoFocus
                        />
                      </div>
                      <div className="ba-form-group">
                        <label className="ba-label">Rationale</label>
                        <input
                          className="ba-input"
                          value={scopeForm.rationale}
                          onChange={(e) =>
                            setScopeForm((f) => ({
                              ...f,
                              rationale: e.target.value,
                            }))
                          }
                          placeholder="Why is this in/out of scope?"
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        <button
                          className="ba-btn ba-btn--secondary ba-btn--sm"
                          onClick={() => setShowScopeForm(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className="ba-btn ba-btn--primary ba-btn--sm"
                          onClick={() => handleAddScopeItem(col.type)}
                          type="button"
                          disabled={!scopeForm.description.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderAssumptionsTab() {
    if (s.assumptions.length === 0) {
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="ba-panel-empty__text">
            No assumptions documented yet. Record assumptions to track and
            validate them.
          </p>
          <button
            className="ba-btn ba-btn--primary"
            onClick={() => setShowAssumptionModal(true)}
            type="button"
          >
            Add Assumption
          </button>
          {showAssumptionModal && renderAssumptionModal()}
        </div>
      );
    }

    return (
      <div>
        {/* Stats */}
        <div className="ba-stats">
          <div className="ba-stat ba-stat--teal">
            <div className="ba-stat__value">{s.assumptions.length}</div>
            <div className="ba-stat__label">Total Assumptions</div>
          </div>
          <div className="ba-stat ba-stat--teal">
            <div className="ba-stat__value">{activeAssumptions}</div>
            <div className="ba-stat__label">Active</div>
          </div>
          <div className="ba-stat ba-stat--emerald">
            <div className="ba-stat__value">{validatedAssumptions}</div>
            <div className="ba-stat__label">Validated</div>
          </div>
          <div className="ba-stat ba-stat--rose">
            <div className="ba-stat__value">{invalidatedAssumptions}</div>
            <div className="ba-stat__label">Invalidated</div>
          </div>
        </div>

        {/* Table */}
        <div className="ba-card">
          <div className="ba-card__header">
            <h3 className="ba-card__title">All Assumptions</h3>
            <button
              className="ba-btn ba-btn--primary ba-btn--sm"
              onClick={() => {
                setAssumptionForm({ description: "", category: "", notes: "" });
                setShowAssumptionModal(true);
              }}
              type="button"
            >
              Add Assumption
            </button>
          </div>
          <div className="ba-card__body" style={{ padding: 0 }}>
            <table className="ba-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Validated By</th>
                  <th>Validated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {s.assumptions.map((assumption) => {
                  const badgeStyle = statusBadgeClass(assumption.status);
                  const displayStatus = assumption.status || "ACTIVE";
                  return (
                    <tr key={assumption.id}>
                      <td>
                        <div className="ba-table__title">
                          {assumption.description}
                        </div>
                        {assumption.notes && (
                          <div className="ba-table__sub">
                            {assumption.notes.length > 80
                              ? `${assumption.notes.slice(0, 80)}...`
                              : assumption.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: assumption.category
                              ? "var(--ba-text)"
                              : "var(--ba-text-muted)",
                            fontStyle: assumption.category
                              ? "normal"
                              : "italic",
                          }}
                        >
                          {assumption.category || "Uncategorized"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 10px",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            borderRadius: 100,
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                          }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: assumption.validatedBy
                              ? "var(--ba-text)"
                              : "var(--ba-text-muted)",
                            fontStyle: assumption.validatedBy
                              ? "normal"
                              : "italic",
                          }}
                        >
                          {assumption.validatedBy || "\u2014"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            fontFamily: "var(--ba-mono)",
                            color: assumption.validatedAt
                              ? "var(--ba-text)"
                              : "var(--ba-text-muted)",
                          }}
                        >
                          {assumption.validatedAt
                            ? new Date(
                                assumption.validatedAt,
                              ).toLocaleDateString()
                            : "\u2014"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          {(!assumption.status ||
                            assumption.status === "ACTIVE") && (
                            <>
                              <button
                                className="ba-btn ba-btn--ghost ba-btn--sm"
                                onClick={() => {
                                  setValidatingId(assumption.id);
                                  setValidatedBy("");
                                }}
                                type="button"
                                style={{ color: "var(--ba-emerald-500)" }}
                              >
                                Validate
                              </button>
                              <button
                                className="ba-btn ba-btn--ghost ba-btn--sm"
                                onClick={() => handleInvalidate(assumption.id)}
                                type="button"
                                style={{ color: "var(--ba-rose-500)" }}
                              >
                                Invalidate
                              </button>
                            </>
                          )}
                          {assumption.status === "VALIDATED" && (
                            <button
                              className="ba-btn ba-btn--ghost ba-btn--sm"
                              onClick={() => handleReactivate(assumption.id)}
                              type="button"
                              style={{ color: "var(--ba-teal-500)" }}
                            >
                              Reactivate
                            </button>
                          )}
                          {assumption.status === "INVALIDATED" && (
                            <button
                              className="ba-btn ba-btn--ghost ba-btn--sm"
                              onClick={() => handleReactivate(assumption.id)}
                              type="button"
                              style={{ color: "var(--ba-teal-500)" }}
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            className="ba-btn ba-btn--ghost ba-btn--sm"
                            onClick={() =>
                              handleRemoveAssumption(assumption.id)
                            }
                            type="button"
                            style={{ color: "var(--ba-rose-500)" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {showAssumptionModal && renderAssumptionModal()}
        {validatingId && renderValidateModal()}
      </div>
    );
  }

  function renderAssumptionModal() {
    return (
      <div
        className="ba-modal-overlay"
        onClick={() => setShowAssumptionModal(false)}
      >
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add Assumption</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Description *</label>
              <textarea
                className="ba-input ba-textarea"
                value={assumptionForm.description}
                onChange={(e) =>
                  setAssumptionForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the assumption..."
                autoFocus
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Category</label>
              <input
                className="ba-input"
                value={assumptionForm.category}
                onChange={(e) =>
                  setAssumptionForm((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
                placeholder="e.g., Technical, Business, Regulatory"
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Notes</label>
              <textarea
                className="ba-input ba-textarea"
                value={assumptionForm.notes}
                onChange={(e) =>
                  setAssumptionForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => setShowAssumptionModal(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={handleAddAssumption}
              type="button"
              disabled={!assumptionForm.description.trim()}
            >
              Add Assumption
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderValidateModal() {
    return (
      <div
        className="ba-modal-overlay"
        onClick={() => {
          setValidatingId(null);
          setValidatedBy("");
        }}
      >
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Validate Assumption</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Validated By</label>
              <input
                className="ba-input"
                value={validatedBy}
                onChange={(e) => setValidatedBy(e.target.value)}
                placeholder="Who validated this assumption?"
                autoFocus
              />
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--ba-text-secondary)",
                margin: 0,
              }}
            >
              The current date will be recorded as the validation date.
            </p>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => {
                setValidatingId(null);
                setValidatedBy("");
              }}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={() => validatingId && handleValidate(validatingId)}
              type="button"
            >
              Confirm Validation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sub-tab navigation */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: "var(--ba-slate-100)",
          padding: 4,
          borderRadius: "var(--ba-radius-md)",
          width: "fit-content",
        }}
      >
        <button
          className={`ba-btn ${subTab === "scope" ? "ba-btn--primary" : "ba-btn--ghost"}`}
          onClick={() => setSubTab("scope")}
          type="button"
          style={{ minWidth: 100 }}
        >
          Scope
        </button>
        <button
          className={`ba-btn ${subTab === "assumptions" ? "ba-btn--primary" : "ba-btn--ghost"}`}
          onClick={() => setSubTab("assumptions")}
          type="button"
          style={{ minWidth: 100 }}
        >
          Assumptions
        </button>
      </div>

      {subTab === "scope" ? renderScopeTab() : renderAssumptionsTab()}
    </div>
  );
}
