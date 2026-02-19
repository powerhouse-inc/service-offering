import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  addInput,
  updateInput,
  removeInput,
} from "../../../document-models/work-breakdown/gen/creators.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

interface EditState {
  rawContent: string;
  source: string;
  submittedBy: string;
}

export function CapturePanel({ document, dispatch }: Props) {
  const state = document.state.global;
  const inputs = state.inputs;

  // New input form state
  const [newRawContent, setNewRawContent] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newSubmittedBy, setNewSubmittedBy] = useState("");

  // Editing state — tracks which card ID is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    rawContent: "",
    source: "",
    submittedBy: "",
  });

  const handleAdd = () => {
    const trimmed = newRawContent.trim();
    if (!trimmed) return;

    dispatch(
      addInput({
        id: generateId(),
        rawContent: trimmed,
        source: newSource.trim() || undefined,
        submittedBy: newSubmittedBy.trim() || undefined,
        createdAt: new Date().toISOString(),
      }),
    );

    setNewRawContent("");
    setNewSource("");
    setNewSubmittedBy("");
  };

  const handleStartEdit = (input: {
    id: string;
    rawContent: string;
    source: string | null | undefined;
    submittedBy: string | null | undefined;
  }) => {
    setEditingId(input.id);
    setEditState({
      rawContent: input.rawContent,
      source: input.source ?? "",
      submittedBy: input.submittedBy ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditState({ rawContent: "", source: "", submittedBy: "" });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const trimmed = editState.rawContent.trim();
    if (!trimmed) return;

    dispatch(
      updateInput({
        id: editingId,
        rawContent: trimmed,
        source: editState.source.trim() || undefined,
        submittedBy: editState.submittedBy.trim() || undefined,
      }),
    );

    setEditingId(null);
    setEditState({ rawContent: "", source: "", submittedBy: "" });
  };

  const handleRemove = (id: string) => {
    dispatch(removeInput({ id }));
    if (editingId === id) {
      handleCancelEdit();
    }
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

  return (
    <div className="wb-panel">
      <div className="wb-panel__header">
        <h2 className="wb-panel__title">
          Stakeholder Inputs ({inputs.length})
        </h2>
      </div>

      {/* Add new input form */}
      <div className="wb-card" style={{ marginBottom: 16 }}>
        <div className="wb-card__header">
          <h3 className="wb-card__title">Add New Input</h3>
        </div>
        <div className="wb-card__body">
          <div style={{ marginBottom: 10 }}>
            <label className="wb-label" htmlFor="capture-new-content">
              Content *
            </label>
            <textarea
              id="capture-new-content"
              className="wb-textarea"
              placeholder="Enter stakeholder input content..."
              value={newRawContent}
              onChange={(e) => setNewRawContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAdd();
                }
              }}
            />
          </div>
          <div className="wb-form-row">
            <div>
              <label className="wb-label" htmlFor="capture-new-source">
                Source
              </label>
              <input
                id="capture-new-source"
                className="wb-input"
                type="text"
                placeholder="e.g. Interview, Survey, Email"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
              />
            </div>
            <div>
              <label className="wb-label" htmlFor="capture-new-submitted-by">
                Submitted By
              </label>
              <input
                id="capture-new-submitted-by"
                className="wb-input"
                type="text"
                placeholder="e.g. John Doe"
                value={newSubmittedBy}
                onChange={(e) => setNewSubmittedBy(e.target.value)}
              />
            </div>
            <div className="wb-form-row__action">
              <button
                className="wb-btn wb-btn--primary"
                type="button"
                onClick={handleAdd}
                disabled={!newRawContent.trim()}
              >
                Add Input
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Input cards list */}
      {inputs.length === 0 ? (
        <div className="wb-panel-empty">
          <p className="wb-panel-empty__text">
            No stakeholder inputs yet. Add one above to get started.
          </p>
        </div>
      ) : (
        inputs.map((input) => {
          const isEditing = editingId === input.id;

          if (isEditing) {
            return (
              <div key={input.id} className="wb-card">
                <div className="wb-card__header">
                  <h3 className="wb-card__title">Editing Input</h3>
                  <span className="wb-card__meta">
                    {formatDate(input.createdAt)}
                  </span>
                </div>
                <div className="wb-card__body">
                  <div style={{ marginBottom: 10 }}>
                    <label
                      className="wb-label"
                      htmlFor={`edit-content-${input.id}`}
                    >
                      Content *
                    </label>
                    <textarea
                      id={`edit-content-${input.id}`}
                      className="wb-textarea"
                      value={editState.rawContent}
                      onChange={(e) =>
                        setEditState((prev) => ({
                          ...prev,
                          rawContent: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="wb-form-row">
                    <div>
                      <label
                        className="wb-label"
                        htmlFor={`edit-source-${input.id}`}
                      >
                        Source
                      </label>
                      <input
                        id={`edit-source-${input.id}`}
                        className="wb-input"
                        type="text"
                        placeholder="e.g. Interview, Survey, Email"
                        value={editState.source}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            source: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="wb-label"
                        htmlFor={`edit-submitted-by-${input.id}`}
                      >
                        Submitted By
                      </label>
                      <input
                        id={`edit-submitted-by-${input.id}`}
                        className="wb-input"
                        type="text"
                        placeholder="e.g. John Doe"
                        value={editState.submittedBy}
                        onChange={(e) =>
                          setEditState((prev) => ({
                            ...prev,
                            submittedBy: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="wb-card__actions">
                  <button
                    className="wb-btn wb-btn--primary wb-btn--sm"
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editState.rawContent.trim()}
                  >
                    Save
                  </button>
                  <button
                    className="wb-btn wb-btn--ghost wb-btn--sm"
                    type="button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={input.id} className="wb-card">
              <div className="wb-card__header">
                <h3 className="wb-card__title">
                  {input.source ? input.source : "Stakeholder Input"}
                </h3>
                <span className="wb-card__meta">
                  {formatDate(input.createdAt)}
                </span>
              </div>
              <div className="wb-card__body">
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {input.rawContent}
                </p>
                {input.submittedBy ? (
                  <p className="wb-card__meta" style={{ marginTop: 6 }}>
                    Submitted by: {input.submittedBy}
                  </p>
                ) : null}
              </div>
              <div className="wb-card__actions">
                <button
                  className="wb-btn wb-btn--sm wb-btn--ghost"
                  type="button"
                  onClick={() => handleStartEdit(input)}
                >
                  Edit
                </button>
                <button
                  className="wb-btn wb-btn--sm wb-btn--danger"
                  type="button"
                  onClick={() => handleRemove(input.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
