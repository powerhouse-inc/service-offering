import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
  WorkBreakdownPhase,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  addNote,
  removeNote,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

const PHASES: WorkBreakdownPhase[] = [
  "CAPTURE",
  "STRUCTURE",
  "EXECUTION",
  "REVIEW",
];

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function NotesPanel({ document, dispatch }: Props) {
  const state = document.state.global;
  const notes = state.notes;

  // New note form state
  const [newContent, setNewContent] = useState("");
  const [newPhase, setNewPhase] = useState<WorkBreakdownPhase>(
    state.phase || "CAPTURE",
  );

  const handleAdd = () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    dispatch(
      addNote({
        id: generateId(),
        phase: newPhase,
        content: trimmed,
        createdAt: new Date().toISOString(),
      }),
    );

    setNewContent("");
    setNewPhase(state.phase || "CAPTURE");
  };

  const handleRemove = (id: string) => {
    dispatch(removeNote({ id }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Group notes by phase
  const notesByPhase = notes.reduce(
    (acc, note) => {
      if (!acc[note.phase]) acc[note.phase] = [];
      acc[note.phase].push(note);
      return acc;
    },
    {} as Record<WorkBreakdownPhase, typeof notes>,
  );

  return (
    <div className="wb-panel">
      <div className="wb-panel__header">
        <div>
          <h2 className="wb-panel__title">Analyst Notes ({notes.length})</h2>
          <p className="wb-panel__subtitle">
            Record observations, decisions, and insights throughout the workflow
          </p>
        </div>
      </div>

      {/* Add new note form */}
      <div className="wb-card" style={{ marginBottom: 16 }}>
        <div className="wb-card__header">
          <h3 className="wb-card__title">Add New Note</h3>
        </div>
        <div className="wb-card__body">
          <div style={{ marginBottom: 10 }}>
            <label className="wb-label" htmlFor="notes-new-phase">
              Phase *
            </label>
            <select
              id="notes-new-phase"
              className="wb-select"
              value={newPhase}
              onChange={(e) =>
                setNewPhase(e.target.value as WorkBreakdownPhase)
              }
            >
              {PHASES.map((phase) => (
                <option key={phase} value={phase}>
                  {formatLabel(phase)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label className="wb-label" htmlFor="notes-new-content">
              Note Content *
            </label>
            <textarea
              id="notes-new-content"
              className="wb-textarea"
              placeholder="Enter your observation or note..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAdd();
                }
              }}
            />
          </div>
          <div className="wb-form-row" style={{ justifyContent: "flex-end" }}>
            <button
              className="wb-btn wb-btn--primary"
              type="button"
              onClick={handleAdd}
              disabled={!newContent.trim()}
            >
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Notes list grouped by phase */}
      {notes.length === 0 ? (
        <div className="wb-panel-empty">
          <p className="wb-panel-empty__text">
            No notes recorded yet. Add one above to capture your observations.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PHASES.map((phase) => {
            const phaseNotes = notesByPhase[phase] || [];
            if (phaseNotes.length === 0) return null;

            return (
              <div
                key={phase}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <h3
                  className="wb-panel__title"
                  style={{ fontSize: 14, marginBottom: 8 }}
                >
                  {formatLabel(phase)} ({phaseNotes.length})
                </h3>
                {phaseNotes
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((note) => (
                    <div key={note.id} className="wb-card">
                      <div className="wb-card__header">
                        <span
                          className={`wb-badge wb-badge--phase wb-badge--phase-${phase.toLowerCase()}`}
                        >
                          {formatLabel(phase)}
                        </span>
                        <span className="wb-card__meta">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <div className="wb-card__body">
                        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {note.content}
                        </p>
                      </div>
                      <div className="wb-card__actions">
                        <button
                          className="wb-btn wb-btn--sm wb-btn--danger"
                          type="button"
                          onClick={() => handleRemove(note.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
