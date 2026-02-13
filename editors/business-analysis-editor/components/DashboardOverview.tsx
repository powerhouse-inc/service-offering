import { useState, useMemo } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  setProjectInfo,
  setProjectPhase,
  setProjectStatus,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  ProjectPhase,
  ProjectStatus,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const PHASES: ProjectPhase[] = [
  "DISCOVERY",
  "ELICITATION",
  "ANALYSIS",
  "DESIGN",
  "VALIDATION",
  "IMPLEMENTATION",
  "CLOSED",
];
const STATUSES: ProjectStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
];

export function DashboardOverview({ document, dispatch }: Props) {
  const s = document.state.global;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    projectName: s.projectName || "",
    projectDescription: s.projectDescription || "",
    organization: s.organization || "",
    sponsor: s.sponsor || "",
    startDate: s.startDate ? s.startDate.slice(0, 10) : "",
    targetEndDate: s.targetEndDate ? s.targetEndDate.slice(0, 10) : "",
  });

  const handleSaveInfo = () => {
    dispatch(
      setProjectInfo({
        projectName: form.projectName || undefined,
        projectDescription: form.projectDescription || undefined,
        organization: form.organization || undefined,
        sponsor: form.sponsor || undefined,
        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : undefined,
        targetEndDate: form.targetEndDate
          ? new Date(form.targetEndDate).toISOString()
          : undefined,
      }),
    );
    setEditing(false);
  };

  const handlePhaseChange = (phase: ProjectPhase) => {
    dispatch(setProjectPhase({ phase, timestamp: new Date().toISOString() }));
  };

  const handleStatusChange = (status: ProjectStatus) => {
    dispatch(setProjectStatus({ status, timestamp: new Date().toISOString() }));
  };

  const dashStats = useMemo(() => {
    const reqCounts: Record<string, number> = {};
    for (const r of s.requirements) {
      const st = r.status || "DRAFT";
      reqCounts[st] = (reqCounts[st] || 0) + 1;
    }
    let active = 0;
    for (const r of s.risks) {
      if (r.status !== "RESOLVED" && r.status !== "ACCEPTED") active++;
    }
    let pending = 0;
    for (const d of s.decisions) {
      if (d.status === "PROPOSED" || d.status === "UNDER_DISCUSSION") pending++;
    }
    let done = 0;
    for (const d of s.deliverables) {
      if (d.status === "DELIVERED" || d.status === "APPROVED") done++;
    }
    let open = 0;
    for (const c of s.changeRequests) {
      if (c.status === "SUBMITTED" || c.status === "UNDER_REVIEW") open++;
    }
    return {
      reqCounts,
      activeRisks: active,
      pendingDecisions: pending,
      deliverablesDone: done,
      openChanges: open,
    };
  }, [s.requirements, s.risks, s.decisions, s.deliverables, s.changeRequests]);

  const reqByStatus = (status: string) => dashStats.reqCounts[status] || 0;
  const { activeRisks, pendingDecisions, deliverablesDone, openChanges } =
    dashStats;

  return (
    <div>
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{s.requirements.length}</div>
          <div className="ba-stat__label">Requirements</div>
        </div>
        <div className="ba-stat ba-stat--indigo">
          <div className="ba-stat__value">{s.stakeholders.length}</div>
          <div className="ba-stat__label">Stakeholders</div>
        </div>
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{activeRisks}</div>
          <div className="ba-stat__label">Active Risks</div>
        </div>
        <div className="ba-stat ba-stat--rose">
          <div className="ba-stat__value">{pendingDecisions}</div>
          <div className="ba-stat__label">Pending Decisions</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">
            {deliverablesDone}/{s.deliverables.length}
          </div>
          <div className="ba-stat__label">Deliverables Done</div>
        </div>
        {openChanges > 0 && (
          <div className="ba-stat ba-stat--amber">
            <div className="ba-stat__value">{openChanges}</div>
            <div className="ba-stat__label">Open Changes</div>
          </div>
        )}
      </div>

      <div className="ba-grid-2">
        <div className="ba-card">
          <div className="ba-card__header">
            <h3 className="ba-card__title">Project Information</h3>
            <button
              className="ba-btn ba-btn--ghost ba-btn--sm"
              onClick={() => {
                if (editing) {
                  handleSaveInfo();
                } else {
                  setForm({
                    projectName: s.projectName || "",
                    projectDescription: s.projectDescription || "",
                    organization: s.organization || "",
                    sponsor: s.sponsor || "",
                    startDate: s.startDate ? s.startDate.slice(0, 10) : "",
                    targetEndDate: s.targetEndDate
                      ? s.targetEndDate.slice(0, 10)
                      : "",
                  });
                  setEditing(true);
                }
              }}
              type="button"
            >
              {editing ? "Save" : "Edit"}
            </button>
          </div>
          <div className="ba-card__body">
            {editing ? (
              <div>
                <div className="ba-form-group">
                  <label className="ba-label">Project Name</label>
                  <input
                    className="ba-input"
                    value={form.projectName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, projectName: e.target.value }))
                    }
                    placeholder="Enter project name..."
                  />
                </div>
                <div className="ba-form-group">
                  <label className="ba-label">Description</label>
                  <textarea
                    className="ba-input ba-textarea"
                    value={form.projectDescription}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        projectDescription: e.target.value,
                      }))
                    }
                    placeholder="Describe the project..."
                  />
                </div>
                <div className="ba-form-row">
                  <div className="ba-form-group">
                    <label className="ba-label">Organization</label>
                    <input
                      className="ba-input"
                      value={form.organization}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          organization: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="ba-form-group">
                    <label className="ba-label">Sponsor</label>
                    <input
                      className="ba-input"
                      value={form.sponsor}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sponsor: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="ba-form-row">
                  <div className="ba-form-group">
                    <label className="ba-label">Start Date</label>
                    <input
                      type="date"
                      className="ba-input"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startDate: e.target.value }))
                      }
                    />
                  </div>
                  <div className="ba-form-group">
                    <label className="ba-label">Target End Date</label>
                    <input
                      type="date"
                      className="ba-input"
                      value={form.targetEndDate}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          targetEndDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {s.projectDescription && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--ba-text-secondary)",
                      margin: "0 0 16px",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.projectDescription}
                  </p>
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <InfoRow label="Organization" value={s.organization} />
                  <InfoRow label="Sponsor" value={s.sponsor} />
                  <InfoRow
                    label="Start Date"
                    value={
                      s.startDate
                        ? new Date(s.startDate).toLocaleDateString()
                        : null
                    }
                  />
                  <InfoRow
                    label="Target End"
                    value={
                      s.targetEndDate
                        ? new Date(s.targetEndDate).toLocaleDateString()
                        : null
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ba-card">
          <div className="ba-card__header">
            <h3 className="ba-card__title">Phase & Status</h3>
          </div>
          <div className="ba-card__body">
            <div className="ba-form-group">
              <label className="ba-label">Project Phase</label>
              <select
                className="ba-input ba-select"
                value={s.projectPhase || ""}
                onChange={(e) =>
                  handlePhaseChange(e.target.value as ProjectPhase)
                }
              >
                <option value="">Select phase...</option>
                {PHASES.map((p) => (
                  <option key={p} value={p}>
                    {p.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Project Status</label>
              <select
                className="ba-input ba-select"
                value={s.projectStatus || ""}
                onChange={(e) =>
                  handleStatusChange(e.target.value as ProjectStatus)
                }
              >
                <option value="">Select status...</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="ba-section" style={{ marginTop: 20 }}>
              <h4 className="ba-section__title">Requirements Breakdown</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <BreakdownRow
                  label="Draft"
                  count={reqByStatus("DRAFT")}
                  total={s.requirements.length}
                  color="var(--ba-slate-400)"
                />
                <BreakdownRow
                  label="Under Review"
                  count={reqByStatus("UNDER_REVIEW")}
                  total={s.requirements.length}
                  color="var(--ba-amber-500)"
                />
                <BreakdownRow
                  label="Approved"
                  count={reqByStatus("APPROVED")}
                  total={s.requirements.length}
                  color="var(--ba-emerald-500)"
                />
                <BreakdownRow
                  label="Implemented"
                  count={reqByStatus("IMPLEMENTED")}
                  total={s.requirements.length}
                  color="var(--ba-teal-500)"
                />
                <BreakdownRow
                  label="Verified"
                  count={reqByStatus("VERIFIED")}
                  total={s.requirements.length}
                  color="var(--ba-indigo-500)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {s.activityLog.length > 0 && (
        <div className="ba-card" style={{ marginTop: 24 }}>
          <div className="ba-card__header">
            <h3 className="ba-card__title">Recent Activity</h3>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--ba-text-muted)",
              }}
            >
              {s.activityLog.length} entries
            </span>
          </div>
          <div className="ba-card__body" style={{ padding: 0 }}>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {[...s.activityLog]
                .reverse()
                .slice(0, 20)
                .map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 24px",
                      borderBottom: "1px solid var(--ba-border)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--ba-text-muted)",
                        fontFamily: "var(--ba-mono)",
                        fontSize: "0.6875rem",
                        whiteSpace: "nowrap",
                        marginTop: 2,
                      }}
                    >
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--ba-text)",
                        }}
                      >
                        {entry.action}
                      </span>
                      {entry.description && (
                        <span
                          style={{
                            color: "var(--ba-text-secondary)",
                            marginLeft: 6,
                          }}
                        >
                          {entry.description}
                        </span>
                      )}
                      {entry.entityType && (
                        <span className="ba-tag" style={{ marginLeft: 6 }}>
                          {entry.entityType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--ba-text-muted)",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.875rem",
          color: value ? "var(--ba-text)" : "var(--ba-text-muted)",
          fontStyle: value ? "normal" : "italic",
        }}
      >
        {value || "Not set"}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--ba-text-secondary)",
          width: 90,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--ba-slate-100)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 300ms ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--ba-text)",
          fontFamily: "var(--ba-mono)",
          width: 24,
          textAlign: "right",
        }}
      >
        {count}
      </span>
    </div>
  );
}
