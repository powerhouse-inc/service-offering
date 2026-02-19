import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "../../../document-models/work-breakdown/gen/types.js";
import type {
  PrerequisiteScope,
  PrerequisiteStatus,
} from "../../../document-models/work-breakdown/gen/schema/types.js";
import {
  addPrerequisite,
  updatePrerequisite,
  removePrerequisite,
  setPrerequisiteStatus,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

type ScopeFilter = "ALL" | "GLOBAL" | "STEP";
type StatusFilter = "ALL" | "NOT_MET" | "IN_PROGRESS" | "MET";

const SCOPE_OPTIONS: { value: PrerequisiteScope; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "STEP", label: "Step" },
];

const STATUS_OPTIONS: { value: PrerequisiteStatus; label: string }[] = [
  { value: "NOT_MET", label: "Not Met" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "MET", label: "Met" },
];

function formatStatus(status: PrerequisiteStatus | null | undefined): string {
  if (!status) return "NOT MET";
  return status.replace(/_/g, " ");
}

function statusClass(status: PrerequisiteStatus | null | undefined): string {
  if (!status || status === "NOT_MET") return "wb-status wb-status--not_met";
  if (status === "IN_PROGRESS") return "wb-status wb-status--in_progress";
  return "wb-status wb-status--met";
}

export function PrerequisitesPanel({ document, dispatch }: Props) {
  const state = document.state.global;

  // Add form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [scope, setScope] = useState<PrerequisiteScope>("GLOBAL");
  const [stepId, setStepId] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter state
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Step lookup map
  const stepMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const step of state.steps) {
      map.set(step.id, step.name);
    }
    return map;
  }, [state.steps]);

  // Stats
  const total = state.prerequisites.length;
  const metCount = state.prerequisites.filter((p) => p.status === "MET").length;
  const inProgressCount = state.prerequisites.filter(
    (p) => p.status === "IN_PROGRESS",
  ).length;
  const notMetCount = state.prerequisites.filter(
    (p) => !p.status || p.status === "NOT_MET",
  ).length;

  // Filtered prerequisites
  const filtered = useMemo(() => {
    return state.prerequisites.filter((p) => {
      if (scopeFilter !== "ALL" && p.scope !== scopeFilter) return false;
      if (statusFilter !== "ALL") {
        const effective = p.status || "NOT_MET";
        if (effective !== statusFilter) return false;
      }
      return true;
    });
  }, [state.prerequisites, scopeFilter, statusFilter]);

  // Group by scope: GLOBAL first, then STEP
  const globalPrereqs = useMemo(
    () => filtered.filter((p) => p.scope === "GLOBAL"),
    [filtered],
  );
  const stepPrereqs = useMemo(
    () => filtered.filter((p) => p.scope === "STEP"),
    [filtered],
  );

  function handleAdd() {
    if (!name.trim() || !owner.trim()) return;
    dispatch(
      addPrerequisite({
        id: generateId(),
        name: name.trim(),
        description: description.trim() || undefined,
        owner: owner.trim(),
        scope,
        stepId: scope === "STEP" ? stepId || undefined : undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    setName("");
    setDescription("");
    setOwner("");
    setScope("GLOBAL");
    setStepId("");
    setNotes("");
    setShowAddForm(false);
  }

  function handleStatusToggle(id: string, newStatus: PrerequisiteStatus) {
    dispatch(setPrerequisiteStatus({ id, status: newStatus }));
  }

  function handleStartEdit(prereq: {
    id: string;
    name: string;
    description: string | null | undefined;
    owner: string;
    notes: string | null | undefined;
  }) {
    setEditingId(prereq.id);
    setEditName(prereq.name);
    setEditDescription(prereq.description ?? "");
    setEditOwner(prereq.owner);
    setEditNotes(prereq.notes ?? "");
  }

  function handleSaveEdit() {
    if (!editingId) return;
    dispatch(
      updatePrerequisite({
        id: editingId,
        name: editName.trim() || undefined,
        description: editDescription.trim() || undefined,
        owner: editOwner.trim() || undefined,
        notes: editNotes.trim() || undefined,
      }),
    );
    setEditingId(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleRemove(id: string) {
    dispatch(removePrerequisite({ id }));
    if (editingId === id) setEditingId(null);
  }

  function renderPrerequisiteCard(prereq: (typeof state.prerequisites)[0]) {
    const isEditing = editingId === prereq.id;
    const effectiveStatus = prereq.status || "NOT_MET";

    if (isEditing) {
      return (
        <div className="wb-card" key={prereq.id}>
          <div style={{ marginBottom: 10 }}>
            <label className="wb-label">Name</label>
            <input
              className="wb-input"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Checkpoint name"
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label className="wb-label">Description</label>
            <textarea
              className="wb-textarea"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Prerequisite description"
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label className="wb-label">Owner</label>
            <input
              className="wb-input"
              type="text"
              value={editOwner}
              onChange={(e) => setEditOwner(e.target.value)}
              placeholder="Owner"
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label className="wb-label">Notes</label>
            <textarea
              className="wb-textarea"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Additional notes (optional)"
            />
          </div>
          <div className="wb-card__actions">
            <button
              className="wb-btn wb-btn--primary wb-btn--sm"
              onClick={handleSaveEdit}
              type="button"
            >
              Save
            </button>
            <button
              className="wb-btn wb-btn--sm"
              onClick={handleCancelEdit}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="wb-card" key={prereq.id}>
        <div className="wb-card__header">
          <h4 className="wb-card__title">{prereq.name}</h4>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span
              className={
                prereq.scope === "GLOBAL"
                  ? "wb-status wb-status--extracted"
                  : "wb-status wb-status--manual"
              }
            >
              {prereq.scope}
            </span>
            <span className={statusClass(prereq.status)}>
              {formatStatus(prereq.status)}
            </span>
          </div>
        </div>

        {prereq.description ? (
          <div className="wb-card__body" style={{ marginTop: 4 }}>
            {prereq.description}
          </div>
        ) : null}

        <div className="wb-card__meta">
          Owner: {prereq.owner}
          {prereq.scope === "STEP" && prereq.stepId
            ? ` | Step: ${stepMap.get(prereq.stepId) ?? prereq.stepId}`
            : ""}
        </div>

        {prereq.notes ? (
          <div className="wb-card__body" style={{ marginTop: 6 }}>
            {prereq.notes}
          </div>
        ) : null}

        {/* Status toggle buttons */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 10,
            marginBottom: 4,
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`wb-btn wb-btn--sm ${
                effectiveStatus === opt.value ? "wb-btn--primary" : ""
              }`}
              onClick={() => handleStatusToggle(prereq.id, opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="wb-card__actions">
          <button
            className="wb-btn wb-btn--sm wb-btn--ghost"
            onClick={() => handleStartEdit(prereq)}
            type="button"
          >
            Edit
          </button>
          <button
            className="wb-btn wb-btn--sm wb-btn--danger"
            onClick={() => handleRemove(prereq.id)}
            type="button"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  function renderGroup(label: string, items: typeof state.prerequisites) {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "var(--wb-text-secondary)",
            marginBottom: 8,
          }}
        >
          {label}
        </h3>
        {items.map(renderPrerequisiteCard)}
      </div>
    );
  }

  return (
    <div>
      {/* Header with add button */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <div>
            <h2 className="wb-panel__title">Prerequisites</h2>
          </div>
          <button
            className="wb-btn wb-btn--primary wb-btn--sm"
            onClick={() => setShowAddForm(!showAddForm)}
            type="button"
          >
            {showAddForm ? "Cancel" : "Add Prerequisite"}
          </button>
        </div>

        {/* Add form */}
        {showAddForm ? (
          <div
            style={{
              borderTop: "1px solid var(--wb-border)",
              paddingTop: 16,
              marginTop: 8,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <label className="wb-label">Name *</label>
              <input
                className="wb-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Checkpoint name (e.g. Verify API Access)"
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="wb-label">Description</label>
              <textarea
                className="wb-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What must be in place before work begins?"
              />
            </div>
            <div className="wb-grid-2">
              <div>
                <label className="wb-label">Owner *</label>
                <input
                  className="wb-input"
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Responsible person or team"
                />
              </div>
              <div>
                <label className="wb-label">Scope</label>
                <select
                  className="wb-select"
                  value={scope}
                  onChange={(e) =>
                    setScope(e.target.value as PrerequisiteScope)
                  }
                  style={{ width: "100%" }}
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {scope === "STEP" ? (
              <div style={{ marginTop: 10 }}>
                <label className="wb-label">Step</label>
                <select
                  className="wb-select"
                  value={stepId}
                  onChange={(e) => setStepId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="">Select a step</option>
                  {state.steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div style={{ marginTop: 10 }}>
              <label className="wb-label">Notes (optional)</label>
              <textarea
                className="wb-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional context or notes"
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                className="wb-btn wb-btn--primary wb-btn--sm"
                onClick={handleAdd}
                disabled={!name.trim() || !owner.trim()}
                type="button"
              >
                Add Prerequisite
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Stats row */}
      <div className="wb-panel">
        <div className="wb-grid-4">
          <div className="wb-stat">
            <div className="wb-stat__value">{total}</div>
            <div className="wb-stat__label">Total</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{metCount}</div>
            <div className="wb-stat__label">Met</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{inProgressCount}</div>
            <div className="wb-stat__label">In Progress</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{notMetCount}</div>
            <div className="wb-stat__label">Not Met</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="wb-panel">
        <div className="wb-form-row">
          <div>
            <label className="wb-label">Scope</label>
            <select
              className="wb-select"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
              style={{ width: "100%" }}
            >
              <option value="ALL">All</option>
              <option value="GLOBAL">Global</option>
              <option value="STEP">Step</option>
            </select>
          </div>
          <div>
            <label className="wb-label">Status</label>
            <select
              className="wb-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              style={{ width: "100%" }}
            >
              <option value="ALL">All</option>
              <option value="NOT_MET">Not Met</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="MET">Met</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prerequisites list grouped by scope */}
      {filtered.length === 0 ? (
        <div className="wb-panel">
          <div className="wb-panel-empty">
            <p className="wb-panel-empty__text">
              {total === 0
                ? "No prerequisites added yet. Add one to get started."
                : "No prerequisites match the current filters."}
            </p>
          </div>
        </div>
      ) : (
        <div className="wb-panel">
          {renderGroup("Global Prerequisites", globalPrereqs)}
          {renderGroup("Step Prerequisites", stepPrereqs)}
        </div>
      )}
    </div>
  );
}
