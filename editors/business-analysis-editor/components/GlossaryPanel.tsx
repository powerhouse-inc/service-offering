import { useState, useMemo } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
} from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  addGlossaryTerm,
  updateGlossaryTerm,
  removeGlossaryTerm,
} from "../../../document-models/business-analysis/gen/creators.js";
import type { GlossaryTerm } from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
  dispatch: DocumentDispatch<BusinessAnalysisAction>;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryPanel({ document, dispatch }: Props) {
  const s = document.state.global;
  const terms: GlossaryTerm[] = s.glossary;

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [form, setForm] = useState({
    term: "",
    definition: "",
    context: "",
    aliases: "",
  });

  const resetForm = () =>
    setForm({ term: "", definition: "", context: "", aliases: "" });

  const openEdit = (t: GlossaryTerm) => {
    setForm({
      term: t.term,
      definition: t.definition,
      context: t.context || "",
      aliases: t.aliases.join(", "),
    });
    setEditingId(t.id);
    setShowAdd(true);
  };

  const handleAdd = () => {
    if (!form.term.trim() || !form.definition.trim()) return;
    const aliases = form.aliases
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    dispatch(
      addGlossaryTerm({
        id: generateId(),
        term: form.term.trim(),
        definition: form.definition.trim(),
        context: form.context || undefined,
        aliases: aliases.length > 0 ? aliases : undefined,
        linkedRequirementIds: undefined,
        createdAt: new Date().toISOString(),
      }),
    );
    resetForm();
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editingId || !form.term.trim() || !form.definition.trim()) return;
    const aliases = form.aliases
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    dispatch(
      updateGlossaryTerm({
        id: editingId,
        term: form.term.trim(),
        definition: form.definition.trim(),
        context: form.context || undefined,
        aliases: aliases.length > 0 ? aliases : undefined,
        linkedRequirementIds: undefined,
      }),
    );
    resetForm();
    setEditingId(null);
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    dispatch(removeGlossaryTerm({ id }));
  };

  const closeModal = () => {
    resetForm();
    setEditingId(null);
    setShowAdd(false);
  };

  // Letters that have terms (for highlighting alpha nav)
  const lettersWithTerms = useMemo(
    () =>
      new Set(
        terms
          .map((t) => (t.term[0] ? t.term[0].toUpperCase() : ""))
          .filter(Boolean),
      ),
    [terms],
  );

  // Filter, sort, and group terms
  const { grouped, groupKeys } = useMemo(() => {
    const filtered = terms.filter((t) => {
      if (activeLetter) {
        if (!t.term.toUpperCase().startsWith(activeLetter)) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) =>
      a.term.localeCompare(b.term, undefined, { sensitivity: "base" }),
    );

    const grp: Record<string, GlossaryTerm[]> = {};
    for (const t of sorted) {
      const letter = t.term[0] ? t.term[0].toUpperCase() : "#";
      if (!grp[letter]) grp[letter] = [];
      grp[letter].push(t);
    }

    return { grouped: grp, groupKeys: Object.keys(grp).sort() };
  }, [terms, activeLetter, search]);

  function renderModal() {
    if (!showAdd) return null;
    return (
      <div className="ba-modal-overlay" onClick={closeModal}>
        <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ba-modal__header">
            <h3 className="ba-modal__title">
              {editingId ? "Edit Term" : "Add Term"}
            </h3>
          </div>
          <div className="ba-modal__body">
            <div className="ba-form-group">
              <label className="ba-label">Term *</label>
              <input
                className="ba-input"
                value={form.term}
                onChange={(e) =>
                  setForm((f) => ({ ...f, term: e.target.value }))
                }
                placeholder="Enter term..."
                autoFocus
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Definition *</label>
              <textarea
                className="ba-input ba-textarea"
                value={form.definition}
                onChange={(e) =>
                  setForm((f) => ({ ...f, definition: e.target.value }))
                }
                placeholder="Define this term..."
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Context</label>
              <input
                className="ba-input"
                value={form.context}
                onChange={(e) =>
                  setForm((f) => ({ ...f, context: e.target.value }))
                }
                placeholder="In what context is this term used?"
              />
            </div>
            <div className="ba-form-group">
              <label className="ba-label">Aliases (comma-separated)</label>
              <input
                className="ba-input"
                value={form.aliases}
                onChange={(e) =>
                  setForm((f) => ({ ...f, aliases: e.target.value }))
                }
                placeholder="synonym1, synonym2, abbreviation"
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
              disabled={!form.term.trim() || !form.definition.trim()}
            >
              {editingId ? "Update" : "Add Term"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (terms.length === 0) {
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
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <p className="ba-panel-empty__text">No glossary terms defined yet</p>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => setShowAdd(true)}
          type="button"
        >
          Add Term
        </button>
        {renderModal()}
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{terms.length}</div>
          <div className="ba-stat__label">Total Terms</div>
        </div>
      </div>

      {/* Search + Add button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 16,
              height: 16,
              color: "var(--ba-text-muted)",
              pointerEvents: "none",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            className="ba-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms or definitions..."
            style={{ paddingLeft: 34 }}
          />
        </div>
        <button
          className="ba-btn ba-btn--primary"
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowAdd(true);
          }}
          type="button"
        >
          Add Term
        </button>
      </div>

      {/* Alpha navigation */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginBottom: 20,
        }}
      >
        <button
          className={`ba-btn ba-btn--sm ${activeLetter === null ? "ba-btn--primary" : "ba-btn--ghost"}`}
          onClick={() => setActiveLetter(null)}
          type="button"
          style={{ minWidth: 32 }}
        >
          All
        </button>
        {ALPHABET.map((letter) => {
          const hasTerm = lettersWithTerms.has(letter);
          const isActive = activeLetter === letter;
          return (
            <button
              key={letter}
              className={`ba-btn ba-btn--sm ${isActive ? "ba-btn--primary" : "ba-btn--ghost"}`}
              onClick={() => setActiveLetter(isActive ? null : letter)}
              type="button"
              style={{
                minWidth: 32,
                opacity: hasTerm ? 1 : 0.35,
                fontFamily: "var(--ba-mono)",
              }}
              disabled={!hasTerm}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Term list grouped by letter */}
      {groupKeys.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--ba-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          No terms match your search.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {groupKeys.map((letter) => (
            <div key={letter}>
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--ba-teal-600)",
                  borderBottom: "2px solid var(--ba-teal-500)",
                  paddingBottom: 6,
                  marginBottom: 12,
                  fontFamily: "var(--ba-mono)",
                }}
              >
                {letter}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {grouped[letter].map((t) => (
                  <div key={t.id} className="ba-card">
                    <div className="ba-card__body">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h4
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "var(--ba-text)",
                              margin: "0 0 6px",
                            }}
                          >
                            {t.term}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--ba-text-secondary)",
                              margin: "0 0 8px",
                              lineHeight: 1.6,
                            }}
                          >
                            {t.definition}
                          </p>
                          {t.context && (
                            <p
                              style={{
                                fontSize: "0.8125rem",
                                color: "var(--ba-text-muted)",
                                margin: "0 0 8px",
                                fontStyle: "italic",
                                lineHeight: 1.5,
                              }}
                            >
                              Context: {t.context}
                            </p>
                          )}
                          {t.aliases.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                                marginTop: 4,
                              }}
                            >
                              {t.aliases.map((alias, i) => (
                                <span
                                  key={i}
                                  style={{
                                    display: "inline-block",
                                    padding: "2px 10px",
                                    borderRadius: 100,
                                    fontSize: "0.6875rem",
                                    fontWeight: 500,
                                    background: "var(--ba-slate-100)",
                                    color: "var(--ba-text-secondary)",
                                    fontFamily: "var(--ba-mono)",
                                  }}
                                >
                                  {alias}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <button
                            className="ba-btn ba-btn--ghost ba-btn--sm"
                            onClick={() => openEdit(t)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="ba-btn ba-btn--ghost ba-btn--sm"
                            onClick={() => handleRemove(t.id)}
                            type="button"
                            style={{ color: "var(--ba-rose-500)" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {renderModal()}
    </div>
  );
}
