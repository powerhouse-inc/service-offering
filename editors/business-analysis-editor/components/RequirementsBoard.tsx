import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addRequirement,
  setRequirementStatus,
  removeRequirement,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  RequirementStatus,
  RequirementType,
  Priority,
  Requirement,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const STATUS_COLUMNS: { status: RequirementStatus; label: string }[] = [
  { status: "DRAFT", label: "Draft" },
  { status: "UNDER_REVIEW", label: "Under Review" },
  { status: "APPROVED", label: "Approved" },
  { status: "IMPLEMENTED", label: "Implemented" },
  { status: "VERIFIED", label: "Verified" },
];

const REQ_TYPES: RequirementType[] = [
  "FUNCTIONAL",
  "NON_FUNCTIONAL",
  "USER_STORY",
  "BUSINESS_RULE",
  "CONSTRAINT",
];
const PRIORITIES: Priority[] = [
  "MUST_HAVE",
  "SHOULD_HAVE",
  "COULD_HAVE",
  "WONT_HAVE",
];

export function RequirementsBoard({ document, dispatch }: Props) {
  const s = document.state.global;
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    type: "FUNCTIONAL" as RequirementType,
    priority: "SHOULD_HAVE" as Priority,
    description: "",
    code: "",
    source: "",
  });

  const filtered = useMemo(
    () =>
      s.requirements.filter((r) => {
        if (filterType && r.type !== filterType) return false;
        if (filterPriority && r.priority !== filterPriority) return false;
        return true;
      }),
    [s.requirements, filterType, filterPriority],
  );

  const handleAdd = () => {
    if (!form.title.trim()) return;
    dispatch(
      addRequirement({
        id: generateId(),
        title: form.title.trim(),
        type: form.type,
        priority: form.priority,
        description: form.description || undefined,
        code: form.code || undefined,
        source: form.source || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    setForm({
      title: "",
      type: "FUNCTIONAL",
      priority: "SHOULD_HAVE",
      description: "",
      code: "",
      source: "",
    });
    setShowAdd(false);
  };

  const handleStatusChange = (
    req: Requirement,
    newStatus: RequirementStatus,
  ) => {
    dispatch(
      setRequirementStatus({
        id: req.id,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      }),
    );
  };

  const handleRemove = (id: string) => {
    dispatch(removeRequirement({ id }));
  };

  return (
    <div>
      <div className="ba-filters">
        <select
          className="ba-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {REQ_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          className="ba-filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p.replace(/_/g, " ")}
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
          Add Requirement
        </button>
      </div>

      <div className="ba-kanban">
        {STATUS_COLUMNS.map((col) => {
          const items = filtered.filter((r) => r.status === col.status);
          return (
            <div key={col.status} className="ba-kanban__col">
              <div className="ba-kanban__col-header">
                <span className="ba-kanban__col-title">{col.label}</span>
                <span className="ba-kanban__col-count">{items.length}</span>
              </div>
              <div className="ba-kanban__col-body">
                {items.map((req) => (
                  <div key={req.id} className="ba-kanban__card">
                    <div className="ba-kanban__card-title">{req.title}</div>
                    <div className="ba-kanban__card-meta">
                      <span
                        className={`ba-type-badge ba-type-badge--${req.type.toLowerCase()}`}
                      >
                        {req.type.replace(/_/g, " ")}
                      </span>
                      {req.priority && (
                        <span
                          className={`ba-priority ba-priority--${req.priority.toLowerCase()}`}
                        >
                          {req.priority.replace(/_/g, " ")}
                        </span>
                      )}
                      {req.code && (
                        <span className="ba-kanban__card-code">{req.code}</span>
                      )}
                    </div>
                    {req.description && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--ba-text-secondary)",
                          margin: "6px 0 0",
                          lineHeight: 1.4,
                        }}
                      >
                        {req.description.length > 80
                          ? `${req.description.slice(0, 80)}...`
                          : req.description}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        marginTop: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      {col.status !== "VERIFIED" && (
                        <button
                          className="ba-btn ba-btn--ghost ba-btn--sm"
                          onClick={() => {
                            const idx = STATUS_COLUMNS.findIndex(
                              (c) => c.status === col.status,
                            );
                            if (idx < STATUS_COLUMNS.length - 1) {
                              handleStatusChange(
                                req,
                                STATUS_COLUMNS[idx + 1].status,
                              );
                            }
                          }}
                          type="button"
                          title="Move to next status"
                        >
                          <svg
                            style={{ width: 12, height: 12 }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        className="ba-btn ba-btn--ghost ba-btn--sm"
                        onClick={() => handleRemove(req.id)}
                        type="button"
                        title="Remove"
                        style={{ color: "var(--ba-rose-500)" }}
                      >
                        <svg
                          style={{ width: 12, height: 12 }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
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
                {items.length === 0 && (
                  <div
                    style={{
                      padding: 16,
                      textAlign: "center",
                      fontSize: "0.75rem",
                      color: "var(--ba-text-muted)",
                    }}
                  >
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.filter(
        (r) => r.status === "REJECTED" || r.status === "DEFERRED",
      ).length > 0 && (
        <div className="ba-card" style={{ marginTop: 24 }}>
          <div className="ba-card__header">
            <h3 className="ba-card__title">Rejected / Deferred</h3>
          </div>
          <div className="ba-card__body" style={{ padding: 0 }}>
            <table className="ba-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .filter(
                    (r) => r.status === "REJECTED" || r.status === "DEFERRED",
                  )
                  .map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div className="ba-table__title">{req.title}</div>
                        {req.code && (
                          <div className="ba-table__sub">{req.code}</div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`ba-type-badge ba-type-badge--${req.type.toLowerCase()}`}
                        >
                          {req.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`ba-status ba-status--${req.status?.toLowerCase()}`}
                        >
                          {req.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <div className="ba-table__actions">
                          <button
                            className="ba-btn ba-btn--ghost ba-btn--sm"
                            onClick={() => handleStatusChange(req, "DRAFT")}
                            type="button"
                          >
                            Reopen
                          </button>
                          <button
                            className="ba-btn ba-btn--ghost ba-btn--sm"
                            onClick={() => handleRemove(req.id)}
                            type="button"
                            style={{ color: "var(--ba-rose-500)" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="ba-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ba-modal__header">
              <h3 className="ba-modal__title">Add Requirement</h3>
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
                  placeholder="Requirement title..."
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
                        type: e.target.value as RequirementType,
                      }))
                    }
                  >
                    {REQ_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ba-form-group">
                  <label className="ba-label">Priority</label>
                  <select
                    className="ba-input ba-select"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priority: e.target.value as Priority,
                      }))
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ba-form-row">
                <div className="ba-form-group">
                  <label className="ba-label">Code</label>
                  <input
                    className="ba-input"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                    placeholder="REQ-001"
                  />
                </div>
                <div className="ba-form-group">
                  <label className="ba-label">Source</label>
                  <input
                    className="ba-input"
                    value={form.source}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source: e.target.value }))
                    }
                    placeholder="e.g. Stakeholder interview"
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
                  placeholder="Describe the requirement..."
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
                disabled={!form.title.trim()}
              >
                Add Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
