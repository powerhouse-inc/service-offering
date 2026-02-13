import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addDecision,
  updateDecision,
  removeDecision,
  setDecisionStatus,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  Decision,
  DecisionStatus,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const STATUSES: DecisionStatus[] = [
  "PROPOSED",
  "UNDER_DISCUSSION",
  "DECIDED",
  "DEFERRED",
  "REVERSED",
];

export function DecisionLog({ document, dispatch }: Props) {
  const s = document.state.global;
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    alternatives: "",
    outcome: "",
    rationale: "",
  });

  const filtered = useMemo(
    () =>
      filterStatus
        ? s.decisions.filter((d) => d.status === filterStatus)
        : s.decisions,
    [s.decisions, filterStatus],
  );

  const { pending, decided } = useMemo(() => {
    let pend = 0;
    let dec = 0;
    for (const d of s.decisions) {
      const st = d.status || "PROPOSED";
      if (st === "PROPOSED" || st === "UNDER_DISCUSSION") pend++;
      else if (st === "DECIDED") dec++;
    }
    return { pending: pend, decided: dec };
  }, [s.decisions]);

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      alternatives: "",
      outcome: "",
      rationale: "",
    });

  const openEdit = (dec: Decision) => {
    setForm({
      title: dec.title,
      description: dec.description || "",
      alternatives: dec.alternatives.join(", "),
      outcome: dec.outcome || "",
      rationale: dec.rationale || "",
    });
    setEditingId(dec.id);
    setShowAdd(true);
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const alts = form.alternatives
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    dispatch(
      addDecision({
        id: generateId(),
        title: form.title.trim(),
        description: form.description || undefined,
        alternatives: alts.length > 0 ? alts : undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    resetForm();
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editingId || !form.title.trim()) return;
    const alts = form.alternatives
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    dispatch(
      updateDecision({
        id: editingId,
        title: form.title.trim(),
        description: form.description || undefined,
        alternatives: alts.length > 0 ? alts : undefined,
        outcome: form.outcome || undefined,
        rationale: form.rationale || undefined,
      }),
    );
    resetForm();
    setEditingId(null);
    setShowAdd(false);
  };

  const handleStatusChange = (dec: Decision, status: DecisionStatus) => {
    dispatch(
      setDecisionStatus({
        id: dec.id,
        status,
        decidedAt: status === "DECIDED" ? new Date().toISOString() : undefined,
      }),
    );
  };

  const handleRemove = (id: string) => {
    dispatch(removeDecision({ id }));
  };

  const closeModal = () => {
    resetForm();
    setEditingId(null);
    setShowAdd(false);
  };

  if (s.decisions.length === 0) {
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No decisions logged yet. Record your first decision to maintain an
          audit trail.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAdd(true)}
          type="button"
        >
          Add Decision
        </button>
        {showAdd && renderModal()}
      </div>
    );
  }

  function renderModal() {
    return (
      <div className="ba-modal-overlay" onClick={closeModal}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">
              {editingId ? "Edit Decision" : "Add Decision"}
            </h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Title *</label>
              <input
                className="ba-input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Decision title..."
                autoFocus
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Description</label>
              <textarea
                className="ba-input ba-textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What decision needs to be made?"
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Alternatives (comma-separated)</label>
              <input
                className="ba-input"
                value={form.alternatives}
                onChange={(e) =>
                  setForm((f) => ({ ...f, alternatives: e.target.value }))
                }
                placeholder="Option A, Option B, Option C"
              />
            </div>
            {editingId && (
              <>
                <div className="ba-form-group">
                  <label className="ba-label">Outcome</label>
                  <input
                    className="ba-input"
                    value={form.outcome}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, outcome: e.target.value }))
                    }
                    placeholder="What was decided?"
                  />
                </div>
                <div className="ba-form-group">
                  <label className="ba-label">Rationale</label>
                  <textarea
                    className="ba-input ba-textarea"
                    value={form.rationale}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, rationale: e.target.value }))
                    }
                    placeholder="Why was this decision made?"
                  />
                </div>
              </>
            )}
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={closeModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={editingId ? handleUpdate : handleAdd}
              type="button"
              disabled={!form.title.trim()}
            >
              {editingId ? "Update" : "Add Decision"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--indigo">
          <div className="ba-stat__value">{s.decisions.length}</div>
          <div className="ba-stat__label">Total Decisions</div>
        </div>
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{pending}</div>
          <div className="ba-stat__label">Pending</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">{decided}</div>
          <div className="ba-stat__label">Decided</div>
        </div>
      </div>

      {/* Filters */}
      <div className="ba-filters">
        <select
          className="ba-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((st) => (
            <option key={st} value={st}>
              {st.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowAdd(true);
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
          Add Decision
        </button>
      </div>

      {/* Decision Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map((dec) => (
          <div key={dec.id} className="ba-card">
            <div className="ba-card__body">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--ba-text)",
                      margin: "0 0 4px",
                    }}
                  >
                    {dec.title}
                  </h4>
                  {dec.description && (
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--ba-text-secondary)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {dec.description}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <select
                    className="ba-filter-select"
                    value={dec.status || "PROPOSED"}
                    onChange={(e) =>
                      handleStatusChange(dec, e.target.value as DecisionStatus)
                    }
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alternatives */}
              {dec.alternatives.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--ba-text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    Alternatives
                  </div>
                  <div className="ba-tags">
                    {dec.alternatives.map((alt, i) => (
                      <span key={i} className="ba-tag">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcome */}
              {dec.outcome && (
                <div
                  style={{
                    background: "var(--ba-emerald-50)",
                    border: "1px solid var(--ba-emerald-100)",
                    borderRadius: "var(--ba-radius-sm)",
                    padding: "10px 14px",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--ba-emerald-700)",
                      marginBottom: 4,
                    }}
                  >
                    Outcome
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ba-emerald-700)",
                    }}
                  >
                    {dec.outcome}
                  </div>
                </div>
              )}

              {/* Rationale */}
              {dec.rationale && (
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--ba-text-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Rationale
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--ba-text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {dec.rationale}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: "1px solid var(--ba-border)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--ba-text-muted)",
                    fontFamily: "var(--ba-mono)",
                  }}
                >
                  {dec.createdAt &&
                    new Date(dec.createdAt).toLocaleDateString()}
                  {dec.decidedAt &&
                    ` • Decided ${new Date(dec.decidedAt).toLocaleDateString()}`}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="ba-btn ba-btn--ghost ba-btn--sm"
                    onClick={() => openEdit(dec)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="ba-btn ba-btn--ghost ba-btn--sm"
                    onClick={() => handleRemove(dec.id)}
                    type="button"
                    style={{ color: "var(--ba-rose-500)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && renderModal()}
    </div>
  );
}
