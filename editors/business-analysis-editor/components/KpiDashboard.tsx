import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addKpi,
  removeKpi,
  recordKpiMeasurement,
  setKpiStatus,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  Kpi,
  KpiStatus,
  MeasurementFrequency,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const KPI_STATUSES: KpiStatus[] = [
  "ON_TRACK",
  "AT_RISK",
  "OFF_TRACK",
  "NOT_MEASURED",
];

const FREQUENCIES: MeasurementFrequency[] = [
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "ANNUALLY",
];

const STATUS_COLORS: Record<KpiStatus, string> = {
  ON_TRACK: "var(--ba-emerald-500)",
  AT_RISK: "var(--ba-amber-500)",
  OFF_TRACK: "var(--ba-rose-500)",
  NOT_MEASURED: "var(--ba-slate-400)",
};

const STATUS_BG: Record<KpiStatus, string> = {
  ON_TRACK: "var(--ba-emerald-100)",
  AT_RISK: "var(--ba-amber-100)",
  OFF_TRACK: "var(--ba-rose-100)",
  NOT_MEASURED: "var(--ba-slate-100)",
};

const STATUS_TEXT: Record<KpiStatus, string> = {
  ON_TRACK: "var(--ba-emerald-700)",
  AT_RISK: "var(--ba-amber-700)",
  OFF_TRACK: "var(--ba-rose-700)",
  NOT_MEASURED: "var(--ba-slate-600)",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getProgress(kpi: Kpi): number | null {
  if (
    kpi.targetValue == null ||
    kpi.targetValue === 0 ||
    kpi.currentValue == null
  ) {
    return null;
  }
  const pct = (kpi.currentValue / kpi.targetValue) * 100;
  return Math.min(Math.max(pct, 0), 100);
}

export function KpiDashboard({ document, dispatch }: Props) {
  const s = document.state.global;
  const kpis = s.kpis;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState<
    string | null
  >(null);

  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    targetValue: "",
    unit: "",
    frequency: "" as string,
    owner: "",
  });

  const [measureForm, setMeasureForm] = useState({
    value: "",
    notes: "",
  });

  const { onTrackCount, atRiskCount, offTrackCount } = useMemo(() => {
    let onTrack = 0;
    let atRisk = 0;
    let offTrack = 0;
    for (const k of kpis) {
      if (k.status === "ON_TRACK") onTrack++;
      else if (k.status === "AT_RISK") atRisk++;
      else if (k.status === "OFF_TRACK") offTrack++;
    }
    return {
      onTrackCount: onTrack,
      atRiskCount: atRisk,
      offTrackCount: offTrack,
    };
  }, [kpis]);

  const handleAddKpi = () => {
    if (!addForm.name.trim()) return;
    dispatch(
      addKpi({
        id: generateId(),
        name: addForm.name.trim(),
        description: addForm.description || undefined,
        targetValue: addForm.targetValue
          ? parseFloat(addForm.targetValue)
          : undefined,
        unit: addForm.unit || undefined,
        frequency: addForm.frequency
          ? (addForm.frequency as MeasurementFrequency)
          : undefined,
        owner: addForm.owner || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    setAddForm({
      name: "",
      description: "",
      targetValue: "",
      unit: "",
      frequency: "",
      owner: "",
    });
    setShowAddModal(false);
  };

  const handleRecordMeasurement = (kpiId: string) => {
    if (!measureForm.value) return;
    dispatch(
      recordKpiMeasurement({
        id: generateId(),
        kpiId,
        value: parseFloat(measureForm.value),
        recordedAt: new Date().toISOString(),
        notes: measureForm.notes || undefined,
      }),
    );
    setMeasureForm({ value: "", notes: "" });
    setShowMeasurementModal(null);
  };

  const handleStatusChange = (kpiId: string, status: KpiStatus) => {
    dispatch(setKpiStatus({ id: kpiId, status }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeKpi({ id }));
    if (expandedId === id) setExpandedId(null);
  };

  // Empty state
  if (kpis.length === 0) {
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
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No KPIs defined yet. Add your first KPI to start tracking performance.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAddModal(true)}
          type="button"
        >
          Add KPI
        </button>
        {showAddModal && renderAddModal()}
      </div>
    );
  }

  function renderAddModal() {
    return (
      <div className="ba-modal-overlay" onClick={() => setShowAddModal(false)}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add KPI</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Name *</label>
              <input
                className="ba-input"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="KPI name..."
                autoFocus
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Description</label>
              <textarea
                className="ba-input ba-textarea"
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What does this KPI measure?"
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Target Value</label>
                <input
                  className="ba-input"
                  type="number"
                  value={addForm.targetValue}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, targetValue: e.target.value }))
                  }
                  placeholder="e.g. 100"
                />
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Unit</label>
                <input
                  className="ba-input"
                  value={addForm.unit}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  placeholder="e.g. %, users, seconds"
                />
              </div>
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Frequency</label>
                <select
                  className="ba-input ba-select"
                  value={addForm.frequency}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, frequency: e.target.value }))
                  }
                >
                  <option value="">Select frequency...</option>
                  {FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Owner</label>
                <input
                  className="ba-input"
                  value={addForm.owner}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, owner: e.target.value }))
                  }
                  placeholder="Who owns this KPI?"
                />
              </div>
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => setShowAddModal(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={handleAddKpi}
              type="button"
              disabled={!addForm.name.trim()}
            >
              Add KPI
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderMeasurementModal(kpiId: string) {
    const kpi = kpis.find((k) => k.id === kpiId);
    if (!kpi) return null;

    return (
      <div
        className="ba-modal-overlay"
        onClick={() => setShowMeasurementModal(null)}
      >
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">
              Record Measurement &mdash; {kpi.name}
            </h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">
                Value *{kpi.unit ? ` (${kpi.unit})` : ""}
              </label>
              <input
                className="ba-input"
                type="number"
                value={measureForm.value}
                onChange={(e) =>
                  setMeasureForm((f) => ({ ...f, value: e.target.value }))
                }
                placeholder="Measured value..."
                autoFocus
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Notes</label>
              <textarea
                className="ba-input ba-textarea"
                value={measureForm.notes}
                onChange={(e) =>
                  setMeasureForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Optional notes about this measurement..."
              />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--ba-text-muted)",
                marginTop: 4,
              }}
            >
              Date will be recorded as now.
            </div>
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => setShowMeasurementModal(null)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={() => handleRecordMeasurement(kpiId)}
              type="button"
              disabled={!measureForm.value}
            >
              Record
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderKpiCard(kpi: Kpi) {
    const isExpanded = expandedId === kpi.id;
    const progress = getProgress(kpi);
    const status: KpiStatus = kpi.status || "NOT_MEASURED";
    const sortedMeasurements = [...kpi.measurements].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );
    const latestMeasurement =
      sortedMeasurements.length > 0 ? sortedMeasurements[0] : null;

    return (
      <div key={kpi.id} className="ba-card" style={{ marginBottom: 16 }}>
        {/* Card header - clickable to expand */}
        <div
          className="ba-card__header"
          style={{ cursor: "pointer" }}
          onClick={() => setExpandedId(isExpanded ? null : kpi.id)}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h3 className="ba-card__title" style={{ margin: 0 }}>
                {kpi.name}
              </h3>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  borderRadius: 100,
                  background: STATUS_BG[status],
                  color: STATUS_TEXT[status],
                }}
              >
                {status.replace(/_/g, " ")}
              </span>
            </div>
            {kpi.owner && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--ba-text-secondary)",
                }}
              >
                Owner: {kpi.owner}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            {/* Measurement count */}
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--ba-text-muted)",
                fontFamily: "var(--ba-mono)",
              }}
            >
              {kpi.measurements.length} measurement
              {kpi.measurements.length !== 1 ? "s" : ""}
            </span>
            {/* Expand icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              style={{
                color: "var(--ba-text-muted)",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 150ms ease",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Card body - progress and summary */}
        <div className="ba-card__body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {/* Progress bar */}
            <div style={{ flex: 1, minWidth: 160 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--ba-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Progress
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    fontFamily: "var(--ba-mono)",
                    color: "var(--ba-text)",
                  }}
                >
                  {kpi.currentValue != null ? kpi.currentValue : "---"}
                  {kpi.targetValue != null ? ` / ${kpi.targetValue}` : ""}
                  {kpi.unit ? ` ${kpi.unit}` : ""}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--ba-slate-100)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: progress != null ? `${progress}%` : "0%",
                    height: "100%",
                    background: STATUS_COLORS[status],
                    borderRadius: 4,
                    transition: "width 300ms ease",
                  }}
                />
              </div>
              {progress != null && (
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--ba-text-muted)",
                    marginTop: 4,
                    fontFamily: "var(--ba-mono)",
                  }}
                >
                  {progress.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Meta info */}
            <div
              style={{
                display: "flex",
                gap: 16,
                fontSize: "0.75rem",
                color: "var(--ba-text-secondary)",
              }}
            >
              {kpi.frequency && (
                <div>
                  <span
                    style={{
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginRight: 4,
                    }}
                  >
                    Freq:
                  </span>
                  {kpi.frequency.replace(/_/g, " ")}
                </div>
              )}
              {latestMeasurement && (
                <div>
                  <span
                    style={{
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginRight: 4,
                    }}
                  >
                    Latest:
                  </span>
                  <span style={{ fontFamily: "var(--ba-mono)" }}>
                    {latestMeasurement.value}
                  </span>{" "}
                  on {formatDate(latestMeasurement.recordedAt)}
                </div>
              )}
            </div>
          </div>

          {/* Actions row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--ba-border)",
            }}
          >
            <select
              className="ba-filter-select"
              value={status}
              onChange={(e) =>
                handleStatusChange(kpi.id, e.target.value as KpiStatus)
              }
              style={{ fontSize: "0.6875rem" }}
            >
              {KPI_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <button
              className="ba-btn ba-btn--primary ba-btn--sm"
              onClick={(e) => {
                e.stopPropagation();
                setMeasureForm({ value: "", notes: "" });
                setShowMeasurementModal(kpi.id);
              }}
              type="button"
            >
              Record Measurement
            </button>
            <div style={{ flex: 1 }} />
            <button
              className="ba-btn ba-btn--ghost ba-btn--sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(kpi.id);
              }}
              type="button"
              style={{ color: "var(--ba-rose-500)" }}
            >
              Remove
            </button>
          </div>
        </div>

        {/* Expanded detail: measurement history */}
        {isExpanded && (
          <div
            style={{
              borderTop: "1px solid var(--ba-border)",
              padding: "16px 24px",
              background: "var(--ba-surface-alt)",
            }}
          >
            {kpi.description && (
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--ba-text-secondary)",
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}
              >
                {kpi.description}
              </div>
            )}
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
                Measurement History
              </span>
            </div>

            {sortedMeasurements.length === 0 ? (
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--ba-text-muted)",
                  fontStyle: "italic",
                  padding: "12px 0",
                }}
              >
                No measurements recorded yet.
              </div>
            ) : (
              <table className="ba-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Value</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMeasurements.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span style={{ fontFamily: "var(--ba-mono)" }}>
                          {formatDate(m.recordedAt)}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            fontFamily: "var(--ba-mono)",
                          }}
                        >
                          {m.value}
                        </span>
                        {kpi.unit && (
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--ba-text-muted)",
                              marginLeft: 4,
                            }}
                          >
                            {kpi.unit}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            color: m.notes
                              ? "var(--ba-text)"
                              : "var(--ba-text-muted)",
                            fontStyle: m.notes ? "normal" : "italic",
                          }}
                        >
                          {m.notes || "---"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{kpis.length}</div>
          <div className="ba-stat__label">Total KPIs</div>
        </div>
        <div className="ba-stat ba-stat--emerald">
          <div className="ba-stat__value">{onTrackCount}</div>
          <div className="ba-stat__label">On Track</div>
        </div>
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{atRiskCount}</div>
          <div className="ba-stat__label">At Risk</div>
        </div>
        <div className="ba-stat ba-stat--rose">
          <div className="ba-stat__value">{offTrackCount}</div>
          <div className="ba-stat__label">Off Track</div>
        </div>
      </div>

      {/* Header with Add button */}
      <div className="ba-card" style={{ marginBottom: 24 }}>
        <div className="ba-card__header">
          <h3 className="ba-card__title">KPI Tracker</h3>
          <button
            className="ba-btn ba-btn--primary ba-btn--sm"
            onClick={() => setShowAddModal(true)}
            type="button"
          >
            Add KPI
          </button>
        </div>
      </div>

      {/* KPI cards */}
      {kpis.map((kpi) => renderKpiCard(kpi))}

      {/* Modals */}
      {showAddModal && renderAddModal()}
      {showMeasurementModal && renderMeasurementModal(showMeasurementModal)}
    </div>
  );
}
