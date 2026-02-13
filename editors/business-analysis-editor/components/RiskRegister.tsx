import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addRisk,
  removeRisk,
  setRiskStatus,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  Risk,
  RiskLevel,
  RiskStatus,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const RISK_LEVELS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const RISK_STATUSES: RiskStatus[] = [
  "IDENTIFIED",
  "MITIGATING",
  "RESOLVED",
  "ACCEPTED",
  "ESCALATED",
];

const LEVEL_IDX: Record<RiskLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const HEAT_COLORS: Record<string, string> = {
  "0-0": "var(--ba-emerald-100)",
  "0-1": "var(--ba-emerald-100)",
  "0-2": "#fef9c3",
  "0-3": "var(--ba-amber-100)",
  "1-0": "var(--ba-emerald-100)",
  "1-1": "#fef9c3",
  "1-2": "var(--ba-amber-100)",
  "1-3": "var(--ba-rose-100)",
  "2-0": "#fef9c3",
  "2-1": "var(--ba-amber-100)",
  "2-2": "var(--ba-rose-100)",
  "2-3": "var(--ba-rose-100)",
  "3-0": "var(--ba-amber-100)",
  "3-1": "var(--ba-rose-100)",
  "3-2": "var(--ba-rose-100)",
  "3-3": "var(--ba-rose-100)",
};

export function RiskRegister({ document, dispatch }: Props) {
  const s = document.state.global;
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    probability: "MEDIUM" as RiskLevel,
    impact: "MEDIUM" as RiskLevel,
    mitigation: "",
    owner: "",
  });

  const filtered = useMemo(
    () =>
      filterStatus ? s.risks.filter((r) => r.status === filterStatus) : s.risks,
    [s.risks, filterStatus],
  );

  const { activeRisks, criticalRisks, heatMap } = useMemo(() => {
    const active: Risk[] = [];
    const critical: Risk[] = [];
    const heat: Record<string, number> = {};
    for (const r of s.risks) {
      const st = r.status || "IDENTIFIED";
      if (st !== "RESOLVED" && st !== "ACCEPTED") {
        active.push(r);
        const pi = LEVEL_IDX[r.probability || "MEDIUM"];
        const ii = LEVEL_IDX[r.impact || "MEDIUM"];
        heat[`${pi}-${ii}`] = (heat[`${pi}-${ii}`] || 0) + 1;
      }
      if (
        r.probability === "CRITICAL" ||
        r.impact === "CRITICAL" ||
        (r.probability === "HIGH" && r.impact === "HIGH")
      )
        critical.push(r);
    }
    return { activeRisks: active, criticalRisks: critical, heatMap: heat };
  }, [s.risks]);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    dispatch(
      addRisk({
        id: generateId(),
        title: form.title.trim(),
        description: form.description || undefined,
        probability: form.probability,
        impact: form.impact,
        mitigation: form.mitigation || undefined,
        owner: form.owner || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    setForm({
      title: "",
      description: "",
      probability: "MEDIUM",
      impact: "MEDIUM",
      mitigation: "",
      owner: "",
    });
    setShowAdd(false);
  };

  const handleStatusChange = (risk: Risk, status: RiskStatus) => {
    dispatch(setRiskStatus({ id: risk.id, status }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeRisk({ id }));
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of s.risks) {
      const st = r.status || "IDENTIFIED";
      counts[st] = (counts[st] || 0) + 1;
    }
    return counts;
  }, [s.risks]);

  if (s.risks.length === 0) {
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No risks identified yet. Add your first risk to begin tracking.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAdd(true)}
          type="button"
        >
          Add Risk
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
            <h3 className="ba-modal__title">Add Risk</h3>
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
                placeholder="Risk title..."
                autoFocus
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Probability</label>
                <select
                  className="ba-input ba-select"
                  value={form.probability}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      probability: e.target.value as RiskLevel,
                    }))
                  }
                >
                  {RISK_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Impact</label>
                <select
                  className="ba-input ba-select"
                  value={form.impact}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      impact: e.target.value as RiskLevel,
                    }))
                  }
                >
                  {RISK_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Owner</label>
              <input
                className="ba-input"
                value={form.owner}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner: e.target.value }))
                }
                placeholder="Who is responsible?"
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Mitigation Strategy</label>
              <textarea
                className="ba-input ba-textarea"
                value={form.mitigation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mitigation: e.target.value }))
                }
                placeholder="How will this risk be mitigated?"
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
                placeholder="Describe the risk..."
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
              Add Risk
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
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{s.risks.length}</div>
          <div className="ba-stat__label">Total Risks</div>
        </div>
        <div className="ba-stat ba-stat--rose">
          <div className="ba-stat__value">{activeRisks.length}</div>
          <div className="ba-stat__label">Active</div>
        </div>
        <div className="ba-stat ba-stat--rose">
          <div className="ba-stat__value">{criticalRisks.length}</div>
          <div className="ba-stat__label">Critical / High</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">{statusCounts["RESOLVED"] || 0}</div>
          <div className="ba-stat__label">Resolved</div>
        </div>
      </div>

      <div className="ba-grid-2">
        {/* Heat Map */}
        <div className="ba-card">
          <div className="ba-card__header">
            <h3 className="ba-card__title">Risk Heat Map</h3>
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--ba-text-muted)",
              }}
            >
              Active risks only
            </span>
          </div>
          <div className="ba-card__body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto repeat(4, 1fr)",
                gridTemplateRows: "repeat(4, 1fr) auto",
                gap: 3,
              }}
            >
              {/* Y-axis labels (probability, from top: CRITICAL -> LOW) */}
              {[...RISK_LEVELS].reverse().map((l, row) => (
                <div
                  key={`y-${l}`}
                  style={{
                    gridRow: row + 1,
                    gridColumn: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 8,
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    color: "var(--ba-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {l}
                </div>
              ))}
              {/* Grid cells */}
              {[3, 2, 1, 0].map((pIdx, row) =>
                [0, 1, 2, 3].map((iIdx, col) => {
                  const count = heatMap[`${pIdx}-${iIdx}`] || 0;
                  return (
                    <div
                      key={`${pIdx}-${iIdx}`}
                      style={{
                        gridRow: row + 1,
                        gridColumn: col + 2,
                        background:
                          HEAT_COLORS[`${pIdx}-${iIdx}`] ||
                          "var(--ba-slate-50)",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 48,
                        fontSize: count > 0 ? "1rem" : "0.75rem",
                        fontWeight: count > 0 ? 700 : 400,
                        color:
                          count > 0 ? "var(--ba-text)" : "var(--ba-text-muted)",
                      }}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  );
                }),
              )}
              {/* X-axis labels (impact) */}
              {RISK_LEVELS.map((l, col) => (
                <div
                  key={`x-${l}`}
                  style={{
                    gridRow: 5,
                    gridColumn: col + 2,
                    textAlign: "center",
                    paddingTop: 6,
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    color: "var(--ba-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                fontSize: "0.6875rem",
                color: "var(--ba-text-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <span>Probability (Y)</span>
              <span>Impact (X)</span>
            </div>
          </div>
        </div>

        {/* Risk by Status */}
        <div className="ba-card">
          <div className="ba-card__header">
            <h3 className="ba-card__title">By Status</h3>
          </div>
          <div className="ba-card__body">
            {RISK_STATUSES.map((st) => {
              const count = statusCounts[st] || 0;
              const pct =
                s.risks.length > 0 ? (count / s.risks.length) * 100 : 0;
              return (
                <div
                  key={st}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--ba-text-secondary)",
                      width: 90,
                    }}
                  >
                    {st.replace(/_/g, " ")}
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
                        background:
                          st === "RESOLVED"
                            ? "var(--ba-emerald-500)"
                            : st === "ESCALATED"
                              ? "var(--ba-rose-500)"
                              : st === "MITIGATING"
                                ? "var(--ba-teal-500)"
                                : "var(--ba-amber-500)",
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
            })}
          </div>
        </div>
      </div>

      {/* Risk List */}
      <div className="ba-card" style={{ marginTop: 24 }}>
        <div className="ba-card__header">
          <h3 className="ba-card__title">All Risks</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="ba-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {RISK_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <button
              className="ba-btn ba-btn--primary ba-btn--sm"
              onClick={() => setShowAdd(true)}
              type="button"
            >
              Add Risk
            </button>
          </div>
        </div>
        <div className="ba-card__body" style={{ padding: 0 }}>
          <table className="ba-table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>P</th>
                <th>I</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((risk) => (
                <tr key={risk.id}>
                  <td>
                    <div className="ba-table__title">{risk.title}</div>
                    {risk.mitigation && (
                      <div className="ba-table__sub">
                        Mitigation:{" "}
                        {risk.mitigation.length > 60
                          ? `${risk.mitigation.slice(0, 60)}...`
                          : risk.mitigation}
                      </div>
                    )}
                  </td>
                  <td>
                    {risk.probability && (
                      <span
                        className={`ba-risk-level ba-risk-level--${risk.probability.toLowerCase()}`}
                      >
                        {risk.probability}
                      </span>
                    )}
                  </td>
                  <td>
                    {risk.impact && (
                      <span
                        className={`ba-risk-level ba-risk-level--${risk.impact.toLowerCase()}`}
                      >
                        {risk.impact}
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      className="ba-filter-select"
                      value={risk.status || "IDENTIFIED"}
                      onChange={(e) =>
                        handleStatusChange(risk, e.target.value as RiskStatus)
                      }
                      style={{ fontSize: "0.6875rem" }}
                    >
                      {RISK_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: risk.owner
                          ? "var(--ba-text)"
                          : "var(--ba-text-muted)",
                        fontStyle: risk.owner ? "normal" : "italic",
                      }}
                    >
                      {risk.owner || "Unassigned"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="ba-btn ba-btn--ghost ba-btn--sm"
                      onClick={() => handleRemove(risk.id)}
                      type="button"
                      style={{ color: "var(--ba-rose-500)" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && renderModal()}
    </div>
  );
}
