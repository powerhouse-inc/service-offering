import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "../../../document-models/work-breakdown/gen/types.js";
import type {
  DependencySourceType,
  DependencyTargetType,
} from "../../../document-models/work-breakdown/gen/schema/types.js";
import {
  addDependency,
  updateDependency,
  removeDependency,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

const SOURCE_TYPES: DependencySourceType[] = ["TASK", "PREREQUISITE"];
const TARGET_TYPES: DependencyTargetType[] = ["TASK", "PREREQUISITE"];

export function DependencyGraph({ document, dispatch }: Props) {
  const state = document.state.global;

  const [sourceType, setSourceType] = useState<DependencySourceType>("TASK");
  const [sourceId, setSourceId] = useState("");
  const [targetType, setTargetType] = useState<DependencyTargetType>("TASK");
  const [targetId, setTargetId] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");

  const dependencies = state.dependencies;
  const tasks = state.tasks;
  const prerequisites = state.prerequisites;

  // Stats
  const totalDependencies = dependencies.length;
  const taskToTaskCount = dependencies.filter(
    (d) => d.sourceType === "TASK" && d.targetType === "TASK",
  ).length;
  const prereqToTaskCount = dependencies.filter(
    (d) => d.sourceType === "PREREQUISITE" && d.targetType === "TASK",
  ).length;

  // Helpers
  function getSourceOptions() {
    if (sourceType === "TASK") {
      return tasks.map((t) => ({ id: t.id, label: t.name }));
    }
    return prerequisites.map((p) => ({
      id: p.id,
      label: p.description,
    }));
  }

  function getTargetOptions() {
    if (targetType === "TASK") {
      return tasks.map((t) => ({ id: t.id, label: t.name }));
    }
    return prerequisites.map((p) => ({
      id: p.id,
      label: p.description,
    }));
  }

  function resolveName(
    id: string,
    type: DependencySourceType | DependencyTargetType,
  ): string {
    if (type === "TASK") {
      const task = tasks.find((t) => t.id === id);
      return task ? task.name : id;
    }
    const prereq = prerequisites.find((p) => p.id === id);
    return prereq?.description ?? id;
  }

  function handleAdd() {
    if (!sourceId || !targetId) return;
    dispatch(
      addDependency({
        id: generateId(),
        sourceId,
        sourceType,
        targetId,
        targetType,
        description: description || undefined,
      }),
    );
    setSourceId("");
    setTargetId("");
    setDescription("");
  }

  function handleRemove(id: string) {
    dispatch(removeDependency({ id }));
  }

  function handleStartEdit(
    id: string,
    currentDescription: string | null | undefined,
  ) {
    setEditingId(id);
    setEditDescription(currentDescription ?? "");
  }

  function handleSaveEdit(id: string) {
    dispatch(
      updateDependency({
        id,
        description: editDescription || undefined,
      }),
    );
    setEditingId(null);
    setEditDescription("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditDescription("");
  }

  function handleSourceTypeChange(value: DependencySourceType) {
    setSourceType(value);
    setSourceId("");
  }

  function handleTargetTypeChange(value: DependencyTargetType) {
    setTargetType(value);
    setTargetId("");
  }

  function typeBadgeClass(
    type: DependencySourceType | DependencyTargetType,
  ): string {
    return type === "TASK"
      ? "wb-status wb-status--extracted"
      : "wb-status wb-status--manual";
  }

  const sourceOptions = getSourceOptions();
  const targetOptions = getTargetOptions();
  const canAdd = sourceId !== "" && targetId !== "";

  return (
    <div>
      {/* Stats */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Dependency Stats</h2>
        </div>
        <div className="wb-grid-3">
          <div className="wb-stat">
            <div className="wb-stat__value">{totalDependencies}</div>
            <div className="wb-stat__label">Total Dependencies</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{taskToTaskCount}</div>
            <div className="wb-stat__label">Task to Task</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{prereqToTaskCount}</div>
            <div className="wb-stat__label">Prerequisite to Task</div>
          </div>
        </div>
      </div>

      {/* Add Dependency Form */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Add Dependency</h2>
        </div>
        <div className="wb-form-row">
          <div style={{ flex: 1 }}>
            <label className="wb-label" htmlFor="wb-dep-source-type">
              Source Type
            </label>
            <select
              id="wb-dep-source-type"
              className="wb-select"
              value={sourceType}
              onChange={(e) =>
                handleSourceTypeChange(e.target.value as DependencySourceType)
              }
              style={{ width: "100%" }}
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label className="wb-label" htmlFor="wb-dep-source">
              Source
            </label>
            <select
              id="wb-dep-source"
              className="wb-select"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="" disabled>
                Select source
              </option>
              {sourceOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="wb-form-row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="wb-label" htmlFor="wb-dep-target-type">
              Target Type
            </label>
            <select
              id="wb-dep-target-type"
              className="wb-select"
              value={targetType}
              onChange={(e) =>
                handleTargetTypeChange(e.target.value as DependencyTargetType)
              }
              style={{ width: "100%" }}
            >
              {TARGET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label className="wb-label" htmlFor="wb-dep-target">
              Target
            </label>
            <select
              id="wb-dep-target"
              className="wb-select"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="" disabled>
                Select target
              </option>
              {targetOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="wb-label" htmlFor="wb-dep-description">
            Description (optional)
          </label>
          <input
            id="wb-dep-description"
            className="wb-input"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this dependency"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            className="wb-btn wb-btn--primary wb-btn--sm"
            onClick={handleAdd}
            disabled={!canAdd}
            type="button"
          >
            Add Dependency
          </button>
        </div>
      </div>

      {/* Dependencies Table */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Dependencies</h2>
        </div>

        {dependencies.length === 0 ? (
          <div className="wb-panel-empty">
            <p className="wb-panel-empty__text">
              No dependencies have been added yet. Use the form above to create
              a dependency between tasks and prerequisites.
            </p>
          </div>
        ) : (
          <table className="wb-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Target</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep) => (
                <tr key={dep.id}>
                  <td>
                    <span style={{ marginRight: 6 }}>
                      {resolveName(dep.sourceId, dep.sourceType)}
                    </span>
                    <span className={typeBadgeClass(dep.sourceType)}>
                      {dep.sourceType}
                    </span>
                  </td>
                  <td>
                    <span style={{ marginRight: 6 }}>
                      {resolveName(dep.targetId, dep.targetType)}
                    </span>
                    <span className={typeBadgeClass(dep.targetType)}>
                      {dep.targetType}
                    </span>
                  </td>
                  <td>
                    {editingId === dep.id ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <input
                          className="wb-input"
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                          style={{ flex: 1 }}
                        />
                        <button
                          className="wb-btn wb-btn--primary wb-btn--sm"
                          onClick={() => handleSaveEdit(dep.id)}
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
                    ) : (
                      <span>{dep.description || "--"}</span>
                    )}
                  </td>
                  <td>
                    {editingId !== dep.id && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="wb-btn wb-btn--ghost wb-btn--sm"
                          onClick={() =>
                            handleStartEdit(dep.id, dep.description)
                          }
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="wb-btn wb-btn--danger wb-btn--sm"
                          onClick={() => handleRemove(dep.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
