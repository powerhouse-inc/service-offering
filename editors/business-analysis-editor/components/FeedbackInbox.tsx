import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  submitFeedback,
  respondToFeedback,
  resolveFeedback,
  removeFeedback,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  StakeholderFeedback,
  FeedbackType,
  FeedbackStatus,
} from "../../../document-models/business-analysis/gen/schema/types.js";

type ViewMode = "analyst" | "stakeholder";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
  viewMode: ViewMode;
}

const FEEDBACK_TYPES: FeedbackType[] = [
  "COMMENT",
  "QUESTION",
  "APPROVAL",
  "REJECTION",
  "CHANGE_REQUEST",
];

const FEEDBACK_STATUSES: FeedbackStatus[] = [
  "PENDING",
  "ACKNOWLEDGED",
  "INCORPORATED",
  "RESOLVED",
];

const ENTITY_TYPES = [
  "Requirement",
  "Process",
  "Risk",
  "Decision",
  "Deliverable",
];

const TYPE_COLORS: Record<FeedbackType, string> = {
  COMMENT: "var(--ba-slate-100)",
  QUESTION: "var(--ba-teal-100)",
  APPROVAL: "var(--ba-emerald-100)",
  REJECTION: "var(--ba-rose-100)",
  CHANGE_REQUEST: "var(--ba-amber-100)",
};

const TYPE_TEXT_COLORS: Record<FeedbackType, string> = {
  COMMENT: "var(--ba-slate-600)",
  QUESTION: "var(--ba-teal-700)",
  APPROVAL: "var(--ba-emerald-700)",
  REJECTION: "var(--ba-rose-700)",
  CHANGE_REQUEST: "var(--ba-amber-700)",
};

export function FeedbackInbox({ document, dispatch, viewMode }: Props) {
  const s = document.state.global;
  const [showSubmit, setShowSubmit] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    stakeholderId: "",
    entityType: "Requirement",
    entityId: "",
    type: "COMMENT" as FeedbackType,
    content: "",
  });

  const stakeholderNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const st of s.stakeholders) map.set(st.id, st.name);
    return map;
  }, [s.stakeholders]);

  const getStakeholderName = (id: string) =>
    stakeholderNameMap.get(id) || "Unknown";

  const getEntitiesByType = (type: string) => {
    switch (type) {
      case "Requirement":
        return s.requirements.map((r) => ({ id: r.id, label: r.title }));
      case "Process":
        return s.processes.map((p) => ({ id: p.id, label: p.name }));
      case "Risk":
        return s.risks.map((r) => ({ id: r.id, label: r.title }));
      case "Decision":
        return s.decisions.map((d) => ({ id: d.id, label: d.title }));
      case "Deliverable":
        return s.deliverables.map((d) => ({ id: d.id, label: d.name }));
      default:
        return [];
    }
  };

  const sorted = useMemo(
    () =>
      [...s.feedback]
        .filter((fb) => {
          if (filterType && fb.type !== filterType) return false;
          if (filterStatus && fb.status !== filterStatus) return false;
          return true;
        })
        .sort((a, b) => {
          const statusOrder: Record<string, number> = {
            PENDING: 0,
            ACKNOWLEDGED: 1,
            INCORPORATED: 2,
            RESOLVED: 3,
          };
          const sa = statusOrder[a.status || "PENDING"] ?? 0;
          const sb = statusOrder[b.status || "PENDING"] ?? 0;
          if (sa !== sb) return sa - sb;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }),
    [s.feedback, filterType, filterStatus],
  );

  const { pendingCount, acknowledgedCount, resolvedCount } = useMemo(() => {
    let pending = 0;
    let acknowledged = 0;
    let resolved = 0;
    for (const f of s.feedback) {
      const st = f.status || "PENDING";
      if (st === "PENDING") pending++;
      else if (st === "ACKNOWLEDGED") acknowledged++;
      else if (st === "RESOLVED" || st === "INCORPORATED") resolved++;
    }
    return {
      pendingCount: pending,
      acknowledgedCount: acknowledged,
      resolvedCount: resolved,
    };
  }, [s.feedback]);

  const handleSubmit = () => {
    if (!form.content.trim() || !form.stakeholderId || !form.entityId) return;
    dispatch(
      submitFeedback({
        id: generateId(),
        stakeholderId: form.stakeholderId,
        entityId: form.entityId,
        entityType: form.entityType,
        type: form.type,
        content: form.content.trim(),
        createdAt: new Date().toISOString(),
      }),
    );
    setForm({
      stakeholderId: "",
      entityType: "Requirement",
      entityId: "",
      type: "COMMENT",
      content: "",
    });
    setShowSubmit(false);
  };

  const handleRespond = (fb: StakeholderFeedback) => {
    if (!responseText.trim()) return;
    dispatch(
      respondToFeedback({ id: fb.id, analystResponse: responseText.trim() }),
    );
    setRespondingId(null);
    setResponseText("");
  };

  const handleResolve = (fb: StakeholderFeedback, status: FeedbackStatus) => {
    dispatch(
      resolveFeedback({
        id: fb.id,
        status,
        resolvedAt: new Date().toISOString(),
      }),
    );
  };

  const handleRemove = (id: string) => {
    dispatch(removeFeedback({ id }));
  };

  if (s.feedback.length === 0 && !showSubmit) {
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <p className="ba-panel-empty__text">
          {viewMode === "analyst"
            ? "No feedback received yet. Stakeholders can submit feedback on requirements, processes, and other artifacts."
            : "No feedback submitted yet. Share your thoughts on the analysis artifacts."}
        </p>
        {viewMode === "stakeholder" && (
          <button
            className="ba-btn ba-btn--primary"
            onClick={() => setShowSubmit(true)}
            type="button"
          >
            Submit Feedback
          </button>
        )}
      </div>
    );
  }

  function renderSubmitModal() {
    const entities = getEntitiesByType(form.entityType);
    return (
      <div className="ba-modal-overlay" onClick={() => setShowSubmit(false)}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Submit Feedback</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">As Stakeholder *</label>
              <select
                className="ba-input ba-select"
                value={form.stakeholderId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stakeholderId: e.target.value }))
                }
              >
                <option value="">Select stakeholder...</option>
                {s.stakeholders.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Entity Type *</label>
                <select
                  className="ba-input ba-select"
                  value={form.entityType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      entityType: e.target.value,
                      entityId: "",
                    }))
                  }
                >
                  {ENTITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Entity *</label>
                <select
                  className="ba-input ba-select"
                  value={form.entityId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, entityId: e.target.value }))
                  }
                >
                  <option value="">Select...</option>
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Feedback Type *</label>
              <select
                className="ba-input ba-select"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as FeedbackType,
                  }))
                }
              >
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Content *</label>
              <textarea
                className="ba-input ba-textarea"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Share your feedback..."
                autoFocus
              />
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => setShowSubmit(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={handleSubmit}
              type="button"
              disabled={
                !form.content.trim() || !form.stakeholderId || !form.entityId
              }
            >
              Submit
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
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{s.feedback.length}</div>
          <div className="ba-stat__label">Total Feedback</div>
        </div>
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{pendingCount}</div>
          <div className="ba-stat__label">Pending</div>
        </div>
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{acknowledgedCount}</div>
          <div className="ba-stat__label">Acknowledged</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">{resolvedCount}</div>
          <div className="ba-stat__label">Resolved</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <select
          className="ba-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {FEEDBACK_TYPES.map((t) => (
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
          {FEEDBACK_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        {viewMode === "stakeholder" && (
          <button
            className="ba-btn ba-btn--primary"
            onClick={() => setShowSubmit(true)}
            type="button"
          >
            Submit Feedback
          </button>
        )}
      </div>

      {/* Feedback List */}
      <div className="ba-card">
        <div className="ba-card__body" style={{ padding: 0 }}>
          <table className="ba-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>On</th>
                <th>Content</th>
                <th>Status</th>
                {viewMode === "analyst" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((fb) => (
                <tr key={fb.id}>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "2px 8px",
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderRadius: 4,
                        background: TYPE_COLORS[fb.type],
                        color: TYPE_TEXT_COLORS[fb.type],
                      }}
                    >
                      {fb.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8125rem" }}>
                      {getStakeholderName(fb.stakeholderId)}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--ba-text-secondary)",
                      }}
                    >
                      {fb.entityType}
                    </span>
                  </td>
                  <td>
                    <div className="ba-table__title">
                      {fb.content.length > 80
                        ? `${fb.content.slice(0, 80)}...`
                        : fb.content}
                    </div>
                    {fb.analystResponse && (
                      <div className="ba-table__sub">
                        Response: {fb.analystResponse}
                      </div>
                    )}
                    {respondingId === fb.id && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                        <input
                          className="ba-input ba-input--sm"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write response..."
                          autoFocus
                          style={{ flex: 1 }}
                        />
                        <button
                          className="ba-btn ba-btn--primary ba-btn--sm"
                          onClick={() => handleRespond(fb)}
                          type="button"
                          disabled={!responseText.trim()}
                        >
                          Send
                        </button>
                        <button
                          className="ba-btn ba-btn--ghost ba-btn--sm"
                          onClick={() => {
                            setRespondingId(null);
                            setResponseText("");
                          }}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`ba-status ba-status--${(fb.status || "pending").toLowerCase()}`}
                    >
                      {(fb.status || "PENDING").replace(/_/g, " ")}
                    </span>
                  </td>
                  {viewMode === "analyst" && (
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {fb.status === "PENDING" && (
                          <button
                            className="ba-btn ba-btn--ghost ba-btn--sm"
                            onClick={() => {
                              setRespondingId(fb.id);
                              setResponseText("");
                            }}
                            type="button"
                          >
                            Respond
                          </button>
                        )}
                        {(fb.status === "PENDING" ||
                          fb.status === "ACKNOWLEDGED") && (
                          <select
                            className="ba-filter-select"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleResolve(
                                  fb,
                                  e.target.value as FeedbackStatus,
                                );
                              }
                            }}
                            style={{ fontSize: "0.6875rem" }}
                          >
                            <option value="">Resolve...</option>
                            <option value="INCORPORATED">Incorporated</option>
                            <option value="RESOLVED">Resolved</option>
                          </select>
                        )}
                        <button
                          className="ba-btn ba-btn--ghost ba-btn--sm"
                          onClick={() => handleRemove(fb.id)}
                          type="button"
                          style={{ color: "var(--ba-rose-500)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSubmit && renderSubmitModal()}
    </div>
  );
}
