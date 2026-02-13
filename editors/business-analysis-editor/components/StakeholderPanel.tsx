import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addStakeholder,
  updateStakeholder,
  removeStakeholder,
  setEngagementLevel,
} from "../../../document-models/business-analysis/gen/creators.js";
import type {
  Stakeholder,
  StakeholderInfluence,
  StakeholderInterest,
  EngagementLevel,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const INFLUENCES: StakeholderInfluence[] = ["HIGH", "MEDIUM", "LOW"];
const INTERESTS: StakeholderInterest[] = ["HIGH", "MEDIUM", "LOW"];
const ENGAGEMENTS: EngagementLevel[] = [
  "CHAMPION",
  "SUPPORTIVE",
  "NEUTRAL",
  "RESISTANT",
  "UNAWARE",
];

const ENGAGEMENT_COLORS: Record<EngagementLevel, string> = {
  CHAMPION: "var(--ba-emerald-600)",
  SUPPORTIVE: "var(--ba-teal-600)",
  NEUTRAL: "var(--ba-slate-500)",
  RESISTANT: "var(--ba-amber-600)",
  UNAWARE: "var(--ba-slate-400)",
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function StakeholderPanel({ document, dispatch }: Props) {
  const s = document.state.global;
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    organization: "",
    email: "",
    influence: "MEDIUM" as StakeholderInfluence,
    interest: "MEDIUM" as StakeholderInterest,
    engagementLevel: "NEUTRAL" as EngagementLevel,
    notes: "",
  });

  const resetForm = () =>
    setForm({
      name: "",
      role: "",
      organization: "",
      email: "",
      influence: "MEDIUM",
      interest: "MEDIUM",
      engagementLevel: "NEUTRAL",
      notes: "",
    });

  const openEdit = (sh: Stakeholder) => {
    setForm({
      name: sh.name,
      role: sh.role || "",
      organization: sh.organization || "",
      email: sh.email || "",
      influence: sh.influence || "MEDIUM",
      interest: sh.interest || "MEDIUM",
      engagementLevel: sh.engagementLevel || "NEUTRAL",
      notes: sh.notes || "",
    });
    setEditingId(sh.id);
    setShowAdd(true);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    dispatch(
      addStakeholder({
        id: generateId(),
        name: form.name.trim(),
        role: form.role || undefined,
        organization: form.organization || undefined,
        email: form.email || undefined,
        influence: form.influence,
        interest: form.interest,
        engagementLevel: form.engagementLevel,
        notes: form.notes || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    resetForm();
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editingId || !form.name.trim()) return;
    dispatch(
      updateStakeholder({
        id: editingId,
        name: form.name.trim(),
        role: form.role || undefined,
        organization: form.organization || undefined,
        email: form.email || undefined,
        influence: form.influence,
        interest: form.interest,
        notes: form.notes || undefined,
      }),
    );
    dispatch(
      setEngagementLevel({
        id: editingId,
        engagementLevel: form.engagementLevel,
      }),
    );
    resetForm();
    setEditingId(null);
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    dispatch(removeStakeholder({ id }));
  };

  const closeModal = () => {
    resetForm();
    setEditingId(null);
    setShowAdd(false);
  };

  // Influence/Interest matrix placement
  const getQuadrant = (
    inf: StakeholderInfluence | null | undefined,
    int: StakeholderInterest | null | undefined,
  ) => {
    const i = inf || "MEDIUM";
    const j = int || "MEDIUM";
    if (i === "HIGH" && j === "HIGH") return "manage";
    if (i === "HIGH") return "satisfy";
    if (j === "HIGH") return "inform";
    return "monitor";
  };

  const quadrants = useMemo(() => {
    const result = {
      manage: [] as Stakeholder[],
      satisfy: [] as Stakeholder[],
      inform: [] as Stakeholder[],
      monitor: [] as Stakeholder[],
    };
    for (const sh of s.stakeholders) {
      const q = getQuadrant(sh.influence, sh.interest);
      result[q].push(sh);
    }
    return result;
  }, [s.stakeholders]);

  if (s.stakeholders.length === 0) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="ba-panel-empty__text">
          No stakeholders yet. Add your first stakeholder to begin mapping.
        </p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAdd(true)}
          type="button"
        >
          Add Stakeholder
        </button>
        {renderModal()}
      </div>
    );
  }

  function renderModal() {
    if (!showAdd) return null;
    return (
      <div className="ba-modal-overlay" onClick={closeModal}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">
              {editingId ? "Edit Stakeholder" : "Add Stakeholder"}
            </h3>
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
                placeholder="Stakeholder name..."
                autoFocus
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Role</label>
                <input
                  className="ba-input"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  placeholder="e.g. Product Manager"
                />
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Organization</label>
                <input
                  className="ba-input"
                  value={form.organization}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, organization: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Email</label>
              <input
                className="ba-input"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">Influence</label>
                <select
                  className="ba-input ba-select"
                  value={form.influence}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      influence: e.target.value as StakeholderInfluence,
                    }))
                  }
                >
                  {INFLUENCES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-form-group">
                <label className="ba-label">Interest</label>
                <select
                  className="ba-input ba-select"
                  value={form.interest}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      interest: e.target.value as StakeholderInterest,
                    }))
                  }
                >
                  {INTERESTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Engagement Level</label>
              <select
                className="ba-input ba-select"
                value={form.engagementLevel}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    engagementLevel: e.target.value as EngagementLevel,
                  }))
                }
              >
                {ENGAGEMENTS.map((v) => (
                  <option key={v} value={v}>
                    {v.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Notes</label>
              <textarea
                className="ba-input ba-textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Additional notes..."
              />
            </div>
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
              disabled={!form.name.trim()}
            >
              {editingId ? "Update" : "Add Stakeholder"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ba-filters">
        <span
          style={{
            fontSize: "0.8125rem",
            color: "var(--ba-text-secondary)",
            fontWeight: 500,
          }}
        >
          {s.stakeholders.length} stakeholder
          {s.stakeholders.length !== 1 ? "s" : ""}
        </span>
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
          Add Stakeholder
        </button>
      </div>

      {/* Influence/Interest Matrix */}
      <div className="ba-card" style={{ marginBottom: 24 }}>
        <div className="ba-card__header">
          <h3 className="ba-card__title">Influence / Interest Matrix</h3>
        </div>
        <div className="ba-card__body" style={{ padding: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 1fr",
              gridTemplateRows: "auto 1fr 1fr auto",
            }}
          >
            {/* Y-axis label */}
            <div
              style={{
                gridRow: "1 / 4",
                gridColumn: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ba-text-muted)",
              }}
            >
              Influence
            </div>

            {/* High Influence / Low Interest */}
            <QuadrantCell
              title="Keep Satisfied"
              stakeholders={quadrants.satisfy}
              bg="var(--ba-amber-50)"
              borderColor="var(--ba-amber-100)"
              onEdit={openEdit}
            />
            {/* High Influence / High Interest */}
            <QuadrantCell
              title="Manage Closely"
              stakeholders={quadrants.manage}
              bg="var(--ba-rose-50)"
              borderColor="var(--ba-rose-100)"
              onEdit={openEdit}
            />
            {/* Low Influence / Low Interest */}
            <QuadrantCell
              title="Monitor"
              stakeholders={quadrants.monitor}
              bg="var(--ba-slate-50)"
              borderColor="var(--ba-border)"
              onEdit={openEdit}
            />
            {/* Low Influence / High Interest */}
            <QuadrantCell
              title="Keep Informed"
              stakeholders={quadrants.inform}
              bg="var(--ba-teal-50)"
              borderColor="var(--ba-teal-100)"
              onEdit={openEdit}
            />

            {/* X-axis label */}
            <div
              style={{
                gridColumn: "2 / 4",
                textAlign: "center",
                padding: "8px 0 12px",
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ba-text-muted)",
              }}
            >
              Interest
            </div>
          </div>
        </div>
      </div>

      {/* Stakeholder List */}
      <div className="ba-card">
        <div className="ba-card__header">
          <h3 className="ba-card__title">All Stakeholders</h3>
        </div>
        <div className="ba-card__body" style={{ padding: 0 }}>
          <table className="ba-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role / Org</th>
                <th>Influence</th>
                <th>Interest</th>
                <th>Engagement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {s.stakeholders.map((sh) => (
                <tr key={sh.id}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--ba-teal-100)",
                          color: "var(--ba-teal-700)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(sh.name)}
                      </div>
                      <div>
                        <div className="ba-table__title">{sh.name}</div>
                        {sh.email && (
                          <div className="ba-table__sub">{sh.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8125rem" }}>
                      {sh.role || "—"}
                    </div>
                    {sh.organization && (
                      <div className="ba-table__sub">{sh.organization}</div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`ba-risk-level ba-risk-level--${(sh.influence || "medium").toLowerCase()}`}
                    >
                      {sh.influence || "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`ba-risk-level ba-risk-level--${(sh.interest || "medium").toLowerCase()}`}
                    >
                      {sh.interest || "—"}
                    </span>
                  </td>
                  <td>
                    {sh.engagementLevel ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color:
                            ENGAGEMENT_COLORS[sh.engagementLevel] ||
                            "var(--ba-text-secondary)",
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background:
                              ENGAGEMENT_COLORS[sh.engagementLevel] ||
                              "var(--ba-slate-400)",
                          }}
                        />
                        {sh.engagementLevel.replace(/_/g, " ")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div className="ba-table__actions">
                      <button
                        className="ba-btn ba-btn--ghost ba-btn--sm"
                        onClick={() => openEdit(sh)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="ba-btn ba-btn--ghost ba-btn--sm"
                        onClick={() => handleRemove(sh.id)}
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

      {renderModal()}
    </div>
  );
}

function QuadrantCell({
  title,
  stakeholders,
  bg,
  borderColor,
  onEdit,
}: {
  title: string;
  stakeholders: Stakeholder[];
  bg: string;
  borderColor: string;
  onEdit: (sh: Stakeholder) => void;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        padding: 16,
        minHeight: 100,
      }}
    >
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--ba-text-secondary)",
          marginBottom: 8,
        }}
      >
        {title}{" "}
        <span style={{ fontWeight: 500, color: "var(--ba-text-muted)" }}>
          ({stakeholders.length})
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {stakeholders.map((sh) => (
          <button
            key={sh.id}
            onClick={() => onEdit(sh)}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px 4px 4px",
              background: "var(--ba-surface)",
              border: "1px solid var(--ba-border)",
              borderRadius: 100,
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--ba-text)",
              fontFamily: "var(--ba-font)",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "var(--ba-teal-100)",
                color: "var(--ba-teal-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.5625rem",
                fontWeight: 700,
              }}
            >
              {getInitials(sh.name)}
            </span>
            {sh.name}
          </button>
        ))}
        {stakeholders.length === 0 && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--ba-text-muted)",
              fontStyle: "italic",
            }}
          >
            None
          </span>
        )}
      </div>
    </div>
  );
}
