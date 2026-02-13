import { useState, useMemo, Fragment } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addChangeRequest,
  setChangeRequestStatus,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  ChangeRequest,
  ChangeRequestStatus,
  ChangeImpact,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const STATUSES: ChangeRequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "IMPLEMENTED",
];

const IMPACTS: ChangeImpact[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function impactColor(impact: ChangeImpact | null | undefined): string {
  switch (impact) {
    case "LOW":
      return "var(--ba-emerald-500)";
    case "MEDIUM":
      return "var(--ba-amber-500)";
    case "HIGH":
      return "var(--ba-rose-500)";
    case "CRITICAL":
      return "#9f1239";
    default:
      return "var(--ba-text-muted)";
  }
}

function statusColor(status: ChangeRequestStatus | null | undefined): string {
  switch (status) {
    case "SUBMITTED":
      return "var(--ba-teal-500)";
    case "UNDER_REVIEW":
      return "var(--ba-amber-500)";
    case "APPROVED":
      return "var(--ba-emerald-500)";
    case "REJECTED":
      return "var(--ba-rose-500)";
    case "IMPLEMENTED":
      return "var(--ba-teal-500)";
    default:
      return "var(--ba-text-muted)";
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
}

export function ChangeRequestsPanel({ document, dispatch }: Props) {
  const s = document.state.global;
  const crs = s.changeRequests;

  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolutionId, setResolutionId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    requestedBy: "",
    impact: "MEDIUM" as ChangeImpact,
    impactAnalysis: "",
  });

  const filtered = useMemo(
    () => (filterStatus ? crs.filter((cr) => cr.status === filterStatus) : crs),
    [crs, filterStatus],
  );

  const { submitted, underReview, approved, rejected } = useMemo(() => {
    let sub = 0;
    let review = 0;
    let app = 0;
    let rej = 0;
    for (const cr of crs) {
      const st = cr.status || "SUBMITTED";
      if (st === "SUBMITTED") sub++;
      else if (st === "UNDER_REVIEW") review++;
      else if (st === "APPROVED") app++;
      else if (st === "REJECTED") rej++;
    }
    return {
      submitted: sub,
      underReview: review,
      approved: app,
      rejected: rej,
    };
  }, [crs]);

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      requestedBy: "",
      impact: "MEDIUM",
      impactAnalysis: "",
    });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    dispatch(
      addChangeRequest({
        id: generateId(),
        title: form.title.trim(),
        description: form.description || undefined,
        requestedBy: form.requestedBy || undefined,
        impact: form.impact,
        impactAnalysis: form.impactAnalysis || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    resetForm();
    setShowAdd(false);
  };

  const handleStatusChange = (
    cr: ChangeRequest,
    status: ChangeRequestStatus,
  ) => {
    if (status === "APPROVED" || status === "REJECTED") {
      setResolutionId(cr.id);
      setResolutionText("");
      // Dispatch immediately; resolution can be added via the resolution prompt
      dispatch(
        setChangeRequestStatus({
          id: cr.id,
          status,
          resolvedAt: new Date().toISOString(),
        }),
      );
    } else {
      dispatch(
        setChangeRequestStatus({
          id: cr.id,
          status,
        }),
      );
    }
  };

  const handleResolutionSubmit = (crId: string) => {
    if (resolutionText.trim()) {
      dispatch(
        setChangeRequestStatus({
          id: crId,
          status: crs.find((cr) => cr.id === crId)?.status || "APPROVED",
          resolution: resolutionText.trim(),
          resolvedAt: new Date().toISOString(),
        }),
      );
    }
    setResolutionId(null);
    setResolutionText("");
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  function renderModal() {
    return (
      <div className="ba-modal-overlay" onClick={() => setShowAdd(false)}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add Change Request</h3>
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
                placeholder="Change request title..."
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
                placeholder="Describe the change being requested..."
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Requested By</label>
                <input
                  className="ba-input"
                  value={form.requestedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, requestedBy: e.target.value }))
                  }
                  placeholder="Name of requester"
                />
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Impact</label>
                <select
                  className="ba-input ba-select"
                  value={form.impact}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      impact: e.target.value as ChangeImpact,
                    }))
                  }
                >
                  {IMPACTS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Impact Analysis</label>
              <textarea
                className="ba-input ba-textarea"
                value={form.impactAnalysis}
                onChange={(e) =>
                  setForm((f) => ({ ...f, impactAnalysis: e.target.value }))
                }
                placeholder="Describe how this change impacts the project..."
              />
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => {
                resetForm();
                setShowAdd(false);
              }}
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
              Add Change Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (crs.length === 0) {
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
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No change requests yet. Add your first change request to start
          tracking project changes.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAdd(true)}
          type="button"
        >
          Add Change Request
        </button>
        {showAdd && renderModal()}
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{crs.length}</div>
          <div className="ba-stat__label">Total CRs</div>
        </div>
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{submitted}</div>
          <div className="ba-stat__label">Submitted</div>
        </div>
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{underReview}</div>
          <div className="ba-stat__label">Under Review</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">{approved}</div>
          <div className="ba-stat__label">Approved</div>
        </div>
        <div className="ba-stat ba-stat--rose">
          <div className="ba-stat__value">{rejected}</div>
          <div className="ba-stat__label">Rejected</div>
        </div>
      </div>

      {/* Filter + Add */}
      <div className="ba-card" style={{ marginTop: 24 }}>
        <div className="ba-card__header">
          <h3 className="ba-card__title">Change Requests</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
            <button
              className="ba-btn ba-btn--primary ba-btn--sm"
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
              type="button"
            >
              Add CR
            </button>
          </div>
        </div>
        <div className="ba-card__body" style={{ padding: 0 }}>
          <table className="ba-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Requested By</th>
                <th>Impact</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cr) => (
                <Fragment key={cr.id}>
                  <tr
                    onClick={() => toggleExpand(cr.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div className="ba-table__title">
                        <span
                          style={{
                            display: "inline-block",
                            marginRight: 6,
                            fontSize: "0.625rem",
                            transition: "transform 150ms ease",
                            transform:
                              expandedId === cr.id
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                          }}
                        >
                          &#9654;
                        </span>
                        {cr.title}
                      </div>
                      {cr.description && (
                        <div className="ba-table__sub">
                          {cr.description.length > 80
                            ? `${cr.description.slice(0, 80)}...`
                            : cr.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: cr.requestedBy
                            ? "var(--ba-text)"
                            : "var(--ba-text-muted)",
                          fontStyle: cr.requestedBy ? "normal" : "italic",
                        }}
                      >
                        {cr.requestedBy || "Unknown"}
                      </span>
                    </td>
                    <td>
                      {cr.impact && (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            color: "#fff",
                            background: impactColor(cr.impact),
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {cr.impact}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          color: "#fff",
                          background: statusColor(cr.status),
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {(cr.status || "SUBMITTED").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--ba-text-muted)",
                          fontFamily: "var(--ba-mono)",
                        }}
                      >
                        {formatDate(cr.createdAt)}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className="ba-filter-select"
                        value={cr.status || "SUBMITTED"}
                        onChange={(e) =>
                          handleStatusChange(
                            cr,
                            e.target.value as ChangeRequestStatus,
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
                  </tr>
                  {/* Expanded row */}
                  {expandedId === cr.id && (
                    <tr key={`${cr.id}-detail`}>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div
                          style={{
                            padding: "16px 24px",
                            background: "var(--ba-slate-100)",
                            borderTop: "1px solid var(--ba-slate-100)",
                          }}
                        >
                          {cr.description && (
                            <div style={{ marginBottom: 12 }}>
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
                                Description
                              </div>
                              <p
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--ba-text-secondary)",
                                  margin: 0,
                                  lineHeight: 1.5,
                                }}
                              >
                                {cr.description}
                              </p>
                            </div>
                          )}
                          {cr.impactAnalysis && (
                            <div style={{ marginBottom: 12 }}>
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
                                Impact Analysis
                              </div>
                              <p
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--ba-text-secondary)",
                                  margin: 0,
                                  lineHeight: 1.5,
                                }}
                              >
                                {cr.impactAnalysis}
                              </p>
                            </div>
                          )}
                          {cr.resolution && (
                            <div style={{ marginBottom: 12 }}>
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
                                Resolution
                              </div>
                              <p
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--ba-text-secondary)",
                                  margin: 0,
                                  lineHeight: 1.5,
                                }}
                              >
                                {cr.resolution}
                              </p>
                            </div>
                          )}
                          <div style={{ marginBottom: 12 }}>
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
                              Affected Requirements
                            </div>
                            <span
                              style={{
                                fontSize: "0.8125rem",
                                color: "var(--ba-text-secondary)",
                                fontFamily: "var(--ba-mono)",
                              }}
                            >
                              {cr.affectedRequirementIds.length} requirement
                              {cr.affectedRequirementIds.length !== 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                          {cr.resolvedAt && (
                            <div>
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
                                Resolved At
                              </div>
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--ba-text-secondary)",
                                  fontFamily: "var(--ba-mono)",
                                }}
                              >
                                {formatDate(cr.resolvedAt)}
                              </span>
                            </div>
                          )}
                          {/* Resolution input prompt */}
                          {resolutionId === cr.id && (
                            <div
                              style={{
                                marginTop: 12,
                                padding: "12px 16px",
                                background: "#fff",
                                borderRadius: 6,
                                border: "1px solid var(--ba-slate-100)",
                              }}
                            >
                              <div className="ba-form-group">
                                <label className="ba-label">
                                  Resolution (optional)
                                </label>
                                <textarea
                                  className="ba-input ba-textarea"
                                  value={resolutionText}
                                  onChange={(e) =>
                                    setResolutionText(e.target.value)
                                  }
                                  placeholder="Add resolution notes..."
                                  autoFocus
                                />
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  className="ba-btn ba-btn--secondary ba-btn--sm"
                                  onClick={() => {
                                    setResolutionId(null);
                                    setResolutionText("");
                                  }}
                                  type="button"
                                >
                                  Skip
                                </button>
                                <button
                                  className="ba-btn ba-btn--primary ba-btn--sm"
                                  onClick={() => handleResolutionSubmit(cr.id)}
                                  type="button"
                                >
                                  Save Resolution
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && renderModal()}
    </div>
  );
}
