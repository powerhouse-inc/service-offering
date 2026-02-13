import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addDeliverable,
  removeDeliverable,
  setDeliverableStatus,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  DeliverableType,
  DeliverableStatus,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const TYPES: DeliverableType[] = [
  "BRD",
  "FUNCTIONAL_SPEC",
  "USE_CASE_DIAGRAM",
  "PROCESS_MAP",
  "DATA_FLOW",
  "WIREFRAME",
  "TEST_PLAN",
  "TRAINING_MATERIAL",
  "PRESENTATION",
  "REPORT",
  "OTHER",
];

const STATUSES: DeliverableStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "DELIVERED",
  "APPROVED",
];

export function DeliverablesTracker({ document, dispatch }: Props) {
  const s = document.state.global;
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "BRD" as DeliverableType,
    assignee: "",
    dueDate: "",
    url: "",
  });

  const filtered = useMemo(
    () =>
      s.deliverables.filter((d) => {
        if (filterType && d.type !== filterType) return false;
        if (filterStatus && d.status !== filterStatus) return false;
        return true;
      }),
    [s.deliverables, filterType, filterStatus],
  );

  const { done, overdue, pct } = useMemo(() => {
    let doneCount = 0;
    let overdueCount = 0;
    const now = new Date();
    for (const d of s.deliverables) {
      const isDone = d.status === "DELIVERED" || d.status === "APPROVED";
      if (isDone) {
        doneCount++;
      } else if (d.dueDate && new Date(d.dueDate) < now) {
        overdueCount++;
      }
    }
    const pctVal =
      s.deliverables.length > 0
        ? Math.round((doneCount / s.deliverables.length) * 100)
        : 0;
    return { done: doneCount, overdue: overdueCount, pct: pctVal };
  }, [s.deliverables]);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    dispatch(
      addDeliverable({
        id: generateId(),
        name: form.name.trim(),
        description: form.description || undefined,
        type: form.type,
        assignee: form.assignee || undefined,
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : undefined,
        url: form.url || undefined,
      }),
    );
    setForm({
      name: "",
      description: "",
      type: "BRD",
      assignee: "",
      dueDate: "",
      url: "",
    });
    setShowAdd(false);
  };

  const handleStatusChange = (id: string, status: DeliverableStatus) => {
    dispatch(
      setDeliverableStatus({
        id,
        status,
        completedAt:
          status === "DELIVERED" || status === "APPROVED"
            ? new Date().toISOString()
            : undefined,
      }),
    );
  };

  const handleRemove = (id: string) => {
    dispatch(removeDeliverable({ id }));
  };

  if (s.deliverables.length === 0) {
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
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No deliverables tracked yet. Add your first deliverable to start
          tracking progress.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAdd(true)}
          type="button"
        >
          Add Deliverable
        </button>
        {showAdd && renderModal()}
      </div>
    );
  }

  function renderModal() {
    return (
      <div className="ba-modal-overlay" onClick={() => setShowAdd(false)}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add Deliverable</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Name *</label>
              <input
                className="ba-input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Deliverable name..."
                autoFocus
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Type</label>
                <select
                  className="ba-input ba-select"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as DeliverableType,
                    }))
                  }
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Assignee</label>
                <input
                  className="ba-input"
                  value={form.assignee}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assignee: e.target.value }))
                  }
                  placeholder="Who is responsible?"
                />
              </div>
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Due Date</label>
                <input
                  type="date"
                  className="ba-input"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="ba-form-group">
                <label className="ba-label">URL</label>
                <input
                  className="ba-input"
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Description</label>
              <textarea
                className="ba-input ba-textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe the deliverable..."
              />
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => setShowAdd(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={handleAdd}
              type="button"
              disabled={!form.name.trim()}
            >
              Add Deliverable
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats + Progress */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{s.deliverables.length}</div>
          <div className="ba-stat__label">Total</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">{done}</div>
          <div className="ba-stat__label">Completed</div>
        </div>
        {overdue > 0 && (
          <div className="ba-stat ba-stat--rose">
            <div className="ba-stat__value">{overdue}</div>
            <div className="ba-stat__label">Overdue</div>
          </div>
        )}
        <div className="ba-stat">
          <div className="ba-stat__value">{pct}%</div>
          <div className="ba-stat__label">Progress</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="ba-card" style={{ marginBottom: 24 }}>
        <div className="ba-card__body" style={{ padding: "16px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--ba-text)",
              }}
            >
              Overall Progress
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "var(--ba-teal-600)",
                fontFamily: "var(--ba-mono)",
              }}
            >
              {done}/{s.deliverables.length}
            </span>
          </div>
          <div
            style={{
              height: 10,
              background: "var(--ba-slate-100)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background:
                  pct === 100 ? "var(--ba-emerald-500)" : "var(--ba-teal-500)",
                borderRadius: 5,
                transition: "width 400ms ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ba-filters">
        <select
          className="ba-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
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
          onClick={() => setShowAdd(true)}
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
          Add Deliverable
        </button>
      </div>

      {/* Deliverables Table */}
      <div className="ba-card">
        <div className="ba-card__body" style={{ padding: 0 }}>
          <table className="ba-table">
            <thead>
              <tr>
                <th>Deliverable</th>
                <th>Type</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((del) => {
                const isOverdue =
                  del.dueDate &&
                  del.status !== "DELIVERED" &&
                  del.status !== "APPROVED" &&
                  new Date(del.dueDate) < new Date();
                return (
                  <tr key={del.id}>
                    <td>
                      <div className="ba-table__title">
                        {del.name}
                        {del.url && (
                          <a
                            href={del.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginLeft: 6,
                              color: "var(--ba-teal-600)",
                              fontSize: "0.6875rem",
                            }}
                          >
                            <svg
                              style={{
                                width: 12,
                                height: 12,
                                verticalAlign: "middle",
                              }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                      {del.description && (
                        <div className="ba-table__sub">
                          {del.description.length > 60
                            ? `${del.description.slice(0, 60)}...`
                            : del.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="ba-tag">
                        {(del.type || "OTHER").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: del.assignee
                            ? "var(--ba-text)"
                            : "var(--ba-text-muted)",
                          fontStyle: del.assignee ? "normal" : "italic",
                        }}
                      >
                        {del.assignee || "Unassigned"}
                      </span>
                    </td>
                    <td>
                      {del.dueDate ? (
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            fontFamily: "var(--ba-mono)",
                            color: isOverdue
                              ? "var(--ba-rose-600)"
                              : "var(--ba-text)",
                            fontWeight: isOverdue ? 600 : 400,
                          }}
                        >
                          {new Date(del.dueDate).toLocaleDateString()}
                          {isOverdue && (
                            <span
                              style={{
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                color: "var(--ba-rose-600)",
                                marginLeft: 6,
                                textTransform: "uppercase",
                              }}
                            >
                              Overdue
                            </span>
                          )}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--ba-text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          No date
                        </span>
                      )}
                    </td>
                    <td>
                      <select
                        className="ba-filter-select"
                        value={del.status || "NOT_STARTED"}
                        onChange={(e) =>
                          handleStatusChange(
                            del.id,
                            e.target.value as DeliverableStatus,
                          )
                        }
                        style={{ fontSize: "0.6875rem" }}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="ba-btn ba-btn--ghost ba-btn--sm"
                        onClick={() => handleRemove(del.id)}
                        type="button"
                        style={{ color: "var(--ba-rose-500)" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && renderModal()}
    </div>
  );
}
