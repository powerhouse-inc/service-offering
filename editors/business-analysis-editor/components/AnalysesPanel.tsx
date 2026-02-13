import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addAnalysis,
  removeAnalysis,
  addAnalysisEntry,
  removeAnalysisEntry,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  AnalysisArtifact,
  AnalysisType,
  AnalysisEntry,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const ANALYSIS_TYPES: AnalysisType[] = [
  "SWOT",
  "PESTLE",
  "MOSCOW",
  "GAP_ANALYSIS",
  "COST_BENEFIT",
  "ROOT_CAUSE",
  "FIVE_WHYS",
  "CUSTOM",
];

const TYPE_LABELS: Record<AnalysisType, string> = {
  SWOT: "SWOT",
  PESTLE: "PESTLE",
  MOSCOW: "MoSCoW",
  GAP_ANALYSIS: "Gap Analysis",
  COST_BENEFIT: "Cost-Benefit",
  ROOT_CAUSE: "Root Cause",
  FIVE_WHYS: "5 Whys",
  CUSTOM: "Custom",
};

const TYPE_COLORS: Record<AnalysisType, { bg: string; color: string }> = {
  SWOT: { bg: "var(--ba-teal-100)", color: "var(--ba-teal-700)" },
  PESTLE: { bg: "var(--ba-indigo-100)", color: "var(--ba-indigo-700)" },
  MOSCOW: { bg: "var(--ba-amber-100)", color: "var(--ba-amber-700)" },
  GAP_ANALYSIS: { bg: "var(--ba-emerald-100)", color: "var(--ba-emerald-700)" },
  COST_BENEFIT: { bg: "#fce7f3", color: "#9d174d" },
  ROOT_CAUSE: { bg: "var(--ba-rose-100)", color: "var(--ba-rose-700)" },
  FIVE_WHYS: { bg: "var(--ba-slate-200)", color: "var(--ba-slate-700)" },
  CUSTOM: { bg: "var(--ba-slate-100)", color: "var(--ba-slate-600)" },
};

const SWOT_CATEGORIES = ["Strength", "Weakness", "Opportunity", "Threat"];

const SWOT_QUADRANT_STYLES: Record<
  string,
  { bg: string; border: string; accent: string }
> = {
  Strength: {
    bg: "var(--ba-emerald-50)",
    border: "var(--ba-emerald-100)",
    accent: "var(--ba-emerald-600)",
  },
  Weakness: {
    bg: "var(--ba-rose-50)",
    border: "var(--ba-rose-100)",
    accent: "var(--ba-rose-600)",
  },
  Opportunity: {
    bg: "var(--ba-teal-50)",
    border: "var(--ba-teal-100)",
    accent: "var(--ba-teal-600)",
  },
  Threat: {
    bg: "var(--ba-amber-50)",
    border: "var(--ba-amber-100)",
    accent: "var(--ba-amber-600)",
  },
};

export function AnalysesPanel({ document, dispatch }: Props) {
  const s = document.state.global;
  const analyses = s.analyses;

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null,
  );
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [filterType, setFilterType] = useState<string>("");

  const [analysisForm, setAnalysisForm] = useState({
    name: "",
    type: "SWOT" as AnalysisType,
    summary: "",
  });

  const [entryForm, setEntryForm] = useState({
    category: "",
    content: "",
    impact: "",
    likelihood: "",
    notes: "",
  });

  const selectedAnalysis = useMemo(
    () =>
      selectedAnalysisId
        ? analyses.find((a) => a.id === selectedAnalysisId) || null
        : null,
    [analyses, selectedAnalysisId],
  );

  const filteredAnalyses = useMemo(
    () =>
      filterType ? analyses.filter((a) => a.type === filterType) : analyses,
    [analyses, filterType],
  );

  const typeCounts = useMemo(() => {
    const acc: Partial<Record<AnalysisType, number>> = {};
    for (const a of analyses) {
      acc[a.type] = (acc[a.type] || 0) + 1;
    }
    return acc;
  }, [analyses]);

  const resetAnalysisForm = () =>
    setAnalysisForm({ name: "", type: "SWOT", summary: "" });

  const resetEntryForm = () =>
    setEntryForm({
      category: "",
      content: "",
      impact: "",
      likelihood: "",
      notes: "",
    });

  const handleAddAnalysis = () => {
    if (!analysisForm.name.trim()) return;
    dispatch(
      addAnalysis({
        id: generateId(),
        name: analysisForm.name.trim(),
        type: analysisForm.type,
        summary: analysisForm.summary || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    resetAnalysisForm();
    setShowAddModal(false);
  };

  const handleRemoveAnalysis = (id: string) => {
    dispatch(removeAnalysis({ id }));
    if (selectedAnalysisId === id) {
      setSelectedAnalysisId(null);
    }
  };

  const handleAddEntry = () => {
    if (
      !selectedAnalysis ||
      !entryForm.category.trim() ||
      !entryForm.content.trim()
    )
      return;
    dispatch(
      addAnalysisEntry({
        id: generateId(),
        analysisId: selectedAnalysis.id,
        category: entryForm.category.trim(),
        content: entryForm.content.trim(),
        impact: entryForm.impact || undefined,
        likelihood: entryForm.likelihood || undefined,
        notes: entryForm.notes || undefined,
      }),
    );
    resetEntryForm();
    setShowAddEntry(false);
  };

  const handleRemoveEntry = (entryId: string, analysisId: string) => {
    dispatch(removeAnalysisEntry({ id: entryId, analysisId }));
  };

  const openAddEntry = () => {
    resetEntryForm();
    if (selectedAnalysis?.type === "SWOT") {
      setEntryForm((f) => ({ ...f, category: "Strength" }));
    }
    setShowAddEntry(true);
  };

  // --- Empty state ---
  if (analyses.length === 0) {
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No analyses created yet. Add your first analysis to begin.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAddModal(true)}
          type="button"
        >
          Add Analysis
        </button>
        {renderAddAnalysisModal()}
      </div>
    );
  }

  // --- Detail view ---
  if (selectedAnalysis) {
    return (
      <div>
        {/* Back button + header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <button
            className="ba-btn ba-btn--secondary ba-btn--sm"
            onClick={() => setSelectedAnalysisId(null)}
            type="button"
          >
            <svg
              style={{ width: 14, height: 14 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "var(--ba-text)",
                  letterSpacing: "-0.01em",
                }}
              >
                {selectedAnalysis.name}
              </h3>
              <span
                className="ba-type-badge"
                style={{
                  background: TYPE_COLORS[selectedAnalysis.type].bg,
                  color: TYPE_COLORS[selectedAnalysis.type].color,
                }}
              >
                {TYPE_LABELS[selectedAnalysis.type]}
              </span>
            </div>
            {selectedAnalysis.summary && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.8125rem",
                  color: "var(--ba-text-secondary)",
                }}
              >
                {selectedAnalysis.summary}
              </p>
            )}
          </div>
          <button
            className="ba-btn ba-btn--primary ba-btn--sm"
            onClick={openAddEntry}
            type="button"
          >
            <svg
              style={{ width: 14, height: 14 }}
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
            Add Entry
          </button>
        </div>

        {/* SWOT 2x2 grid */}
        {selectedAnalysis.type === "SWOT"
          ? renderSwotGrid(selectedAnalysis)
          : renderEntriesTable(selectedAnalysis)}

        {renderAddEntryModal()}
      </div>
    );
  }

  // --- List / grid view ---
  return (
    <div>
      {/* Stats */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{analyses.length}</div>
          <div className="ba-stat__label">Total Analyses</div>
        </div>
        {Object.entries(typeCounts).map(([type, count]) => {
          const t = type as AnalysisType;
          const statColor =
            t === "SWOT"
              ? "ba-stat--teal"
              : t === "PESTLE"
                ? "ba-stat--indigo"
                : t === "MOSCOW"
                  ? "ba-stat--amber"
                  : t === "ROOT_CAUSE" || t === "FIVE_WHYS"
                    ? "ba-stat--rose"
                    : "ba-stat--emerald";
          return (
            <div key={type} className={`ba-stat ${statColor}`}>
              <div className="ba-stat__value">{count}</div>
              <div className="ba-stat__label">{TYPE_LABELS[t]}</div>
            </div>
          );
        })}
      </div>

      {/* Filters + Add */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <select
          className="ba-filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {ANALYSIS_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => {
            resetAnalysisForm();
            setShowAddModal(true);
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
          Add Analysis
        </button>
      </div>

      {/* Analysis cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {filteredAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className="ba-card"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedAnalysisId(analysis.id)}
          >
            <div className="ba-card__header">
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
                    className="ba-card__title"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {analysis.name}
                  </h4>
                </div>
                <span
                  className="ba-type-badge"
                  style={{
                    background: TYPE_COLORS[analysis.type].bg,
                    color: TYPE_COLORS[analysis.type].color,
                  }}
                >
                  {TYPE_LABELS[analysis.type]}
                </span>
              </div>
              <button
                className="ba-btn ba-btn--ghost ba-btn--sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAnalysis(analysis.id);
                }}
                type="button"
                style={{ color: "var(--ba-rose-500)" }}
              >
                Delete
              </button>
            </div>
            <div className="ba-card__body">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: analysis.summary ? 8 : 0,
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--ba-text-secondary)",
                    fontFamily: "var(--ba-mono)",
                  }}
                >
                  {analysis.entries.length} entr
                  {analysis.entries.length === 1 ? "y" : "ies"}
                </span>
                {analysis.createdAt && (
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--ba-text-muted)",
                    }}
                  >
                    Created {new Date(analysis.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {analysis.summary && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8125rem",
                    color: "var(--ba-text-secondary)",
                    lineHeight: 1.5,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {analysis.summary}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {renderAddAnalysisModal()}
    </div>
  );

  // --- SWOT 2x2 grid ---
  function renderSwotGrid(analysis: AnalysisArtifact) {
    const entriesByCategory: Record<string, AnalysisEntry[]> = {};
    for (const cat of SWOT_CATEGORIES) {
      entriesByCategory[cat] = analysis.entries.filter(
        (e) => e.category === cat,
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 2,
          borderRadius: "var(--ba-radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--ba-border)",
        }}
      >
        {SWOT_CATEGORIES.map((cat) => {
          const style = SWOT_QUADRANT_STYLES[cat];
          const entries = entriesByCategory[cat];
          return (
            <div
              key={cat}
              style={{
                background: style.bg,
                padding: 20,
                minHeight: 180,
              }}
            >
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
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: style.accent,
                  }}
                >
                  {cat}s
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--ba-text-muted)",
                    fontFamily: "var(--ba-mono)",
                  }}
                >
                  {entries.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      background: "var(--ba-surface)",
                      border: `1px solid ${style.border}`,
                      borderRadius: "var(--ba-radius-sm)",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: "0.8125rem",
                        color: "var(--ba-text)",
                        lineHeight: 1.4,
                      }}
                    >
                      {entry.content}
                    </span>
                    <button
                      className="ba-btn ba-btn--ghost ba-btn--sm"
                      onClick={() => handleRemoveEntry(entry.id, analysis.id)}
                      type="button"
                      style={{
                        color: "var(--ba-rose-500)",
                        flexShrink: 0,
                        padding: "2px 6px",
                      }}
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
                ))}
                {entries.length === 0 && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--ba-text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    No entries yet
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- Entries table (non-SWOT) ---
  function renderEntriesTable(analysis: AnalysisArtifact) {
    if (analysis.entries.length === 0) {
      return (
        <div className="ba-card">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="ba-panel-empty__text">
              No entries yet. Add your first entry to this analysis.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="ba-card">
        <div className="ba-card__body" style={{ padding: 0 }}>
          <table className="ba-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Content</th>
                <th>Impact</th>
                <th>Likelihood</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analysis.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className="ba-tag">{entry.category}</span>
                  </td>
                  <td>
                    <span className="ba-table__title">{entry.content}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: entry.impact
                          ? "var(--ba-text)"
                          : "var(--ba-text-muted)",
                      }}
                    >
                      {entry.impact || "\u2014"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: entry.likelihood
                          ? "var(--ba-text)"
                          : "var(--ba-text-muted)",
                      }}
                    >
                      {entry.likelihood || "\u2014"}
                    </span>
                  </td>
                  <td>
                    {entry.notes ? (
                      <span className="ba-table__sub">
                        {entry.notes.length > 50
                          ? `${entry.notes.slice(0, 50)}...`
                          : entry.notes}
                      </span>
                    ) : (
                      <span style={{ color: "var(--ba-text-muted)" }}>
                        {"\u2014"}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="ba-btn ba-btn--ghost ba-btn--sm"
                      onClick={() => handleRemoveEntry(entry.id, analysis.id)}
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
    );
  }

  // --- Add Analysis modal ---
  function renderAddAnalysisModal() {
    if (!showAddModal) return null;
    return (
      <div className="ba-modal-overlay" onClick={() => setShowAddModal(false)}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add Analysis</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Name *</label>
              <input
                className="ba-input"
                value={analysisForm.name}
                onChange={(e) =>
                  setAnalysisForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Analysis name..."
                autoFocus
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Type</label>
              <select
                className="ba-input ba-select"
                value={analysisForm.type}
                onChange={(e) =>
                  setAnalysisForm((f) => ({
                    ...f,
                    type: e.target.value as AnalysisType,
                  }))
                }
              >
                {ANALYSIS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Summary</label>
              <textarea
                className="ba-input ba-textarea"
                value={analysisForm.summary}
                onChange={(e) =>
                  setAnalysisForm((f) => ({ ...f, summary: e.target.value }))
                }
                placeholder="Brief summary of this analysis..."
              />
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
              onClick={handleAddAnalysis}
              type="button"
              disabled={!analysisForm.name.trim()}
            >
              Add Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Add Entry modal ---
  function renderAddEntryModal() {
    if (!showAddEntry || !selectedAnalysis) return null;
    const isSwot = selectedAnalysis.type === "SWOT";

    return (
      <div className="ba-modal-overlay" onClick={() => setShowAddEntry(false)}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">Add Entry</h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Category *</label>
              {isSwot ? (
                <select
                  className="ba-input ba-select"
                  value={entryForm.category}
                  onChange={(e) =>
                    setEntryForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {SWOT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="ba-input"
                  value={entryForm.category}
                  onChange={(e) =>
                    setEntryForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="e.g. Political, Financial, Gap..."
                />
              )}
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Content *</label>
              <textarea
                className="ba-input ba-textarea"
                value={entryForm.content}
                onChange={(e) =>
                  setEntryForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Describe this entry..."
                autoFocus={isSwot}
              />
            </div>
            {!isSwot && (
              <>
                <div className="ba-form-row">
                  <div className="ba-form-group">
                    <label className="ba-label">Impact</label>
                    <input
                      className="ba-input"
                      value={entryForm.impact}
                      onChange={(e) =>
                        setEntryForm((f) => ({ ...f, impact: e.target.value }))
                      }
                      placeholder="e.g. High, Low..."
                    />
                  </div>
                  <div className="ba-form-group">
                    <label className="ba-label">Likelihood</label>
                    <input
                      className="ba-input"
                      value={entryForm.likelihood}
                      onChange={(e) =>
                        setEntryForm((f) => ({
                          ...f,
                          likelihood: e.target.value,
                        }))
                      }
                      placeholder="e.g. Likely, Unlikely..."
                    />
                  </div>
                </div>
                <div className="ba-form-group">
                  <label className="ba-label">Notes</label>
                  <textarea
                    className="ba-input ba-textarea"
                    value={entryForm.notes}
                    onChange={(e) =>
                      setEntryForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Additional notes..."
                  />
                </div>
              </>
            )}
          </div>
          <div className="ba-modal__footer">
            <button
              className="ba-btn ba-btn--secondary"
              onClick={() => setShowAddEntry(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="ba-btn ba-btn--primary"
              onClick={handleAddEntry}
              type="button"
              disabled={!entryForm.category.trim() || !entryForm.content.trim()}
            >
              Add Entry
            </button>
          </div>
        </div>
      </div>
    );
  }
}
