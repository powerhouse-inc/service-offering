import { useState, useEffect } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  TargetAudience,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  updateOfferingInfo,
  updateOfferingStatus,
  setOperator,
  addTargetAudience,
  removeTargetAudience,
  setFacetTarget,
  removeFacetTarget,
  addFacetOption,
  removeFacetOption,
} from "../../../document-models/service-offering/gen/creators.js";

interface ScopeAndFacetsProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", color: "slate" },
  { value: "COMING_SOON", label: "Coming Soon", color: "sky" },
  { value: "ACTIVE", label: "Active", color: "emerald" },
  { value: "DEPRECATED", label: "Deprecated", color: "rose" },
] as const;

const AUDIENCE_PRESETS = [
  { label: "Founders", color: "#8b5cf6" },
  { label: "SNO Governors", color: "#f43f5e" },
  { label: "Builders", color: "#0ea5e9" },
  { label: "Operators", color: "#f97316" },
  { label: "Contributors", color: "#10b981" },
  { label: "Investors", color: "#6366f1" },
];

const FACET_CATEGORIES = [
  {
    key: "sno-function",
    label: "SNO Function",
    description: "Service node operator function type",
    options: [
      { id: "operational-hub", label: "Operational Hub" },
      { id: "embryonic-hub", label: "Embryonic Hub" },
      { id: "ip-spv", label: "IP SPV" },
      { id: "revenue-generating-hub", label: "Revenue Generating Hub" },
      {
        id: "operational-collateral-fund",
        label: "Operational Collateral Fund",
      },
    ],
  },
  {
    key: "legal-entity",
    label: "Legal Entity",
    description: "Required legal structure",
    options: [
      { id: "swiss-association", label: "Swiss Association" },
      { id: "bvi", label: "BVI" },
    ],
  },
  {
    key: "team",
    label: "Team",
    description: "Team location type",
    options: [
      { id: "remote", label: "Remote" },
      { id: "local", label: "Local" },
      { id: "hybrid", label: "Hybrid" },
    ],
  },
  {
    key: "anonymity",
    label: "Anonymity",
    description: "Identity disclosure level",
    options: [
      { id: "high", label: "High" },
      { id: "highest", label: "Highest" },
    ],
  },
];

export function ScopeAndFacets({ document, dispatch }: ScopeAndFacetsProps) {
  const { state } = document;
  const globalState = state.global;

  const [formData, setFormData] = useState({
    title: globalState.title || "",
    summary: globalState.summary || "",
    description: globalState.description || "",
    operatorId: globalState.operatorId || "",
    thumbnailUrl: globalState.thumbnailUrl || "",
    infoLink: globalState.infoLink || "",
    status: globalState.status,
  });

  const [newAudienceLabel, setNewAudienceLabel] = useState("");
  const [showAudienceInput, setShowAudienceInput] = useState(false);

  useEffect(() => {
    setFormData({
      title: globalState.title || "",
      summary: globalState.summary || "",
      description: globalState.description || "",
      operatorId: globalState.operatorId || "",
      thumbnailUrl: globalState.thumbnailUrl || "",
      infoLink: globalState.infoLink || "",
      status: globalState.status,
    });
  }, [
    globalState.title,
    globalState.summary,
    globalState.description,
    globalState.operatorId,
    globalState.thumbnailUrl,
    globalState.infoLink,
    globalState.status,
  ]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInfoBlur = () => {
    const changes: Record<string, string | null> = {};
    let hasChanges = false;

    if (formData.title !== globalState.title) {
      changes.title = formData.title;
      hasChanges = true;
    }
    if (formData.summary !== globalState.summary) {
      changes.summary = formData.summary;
      hasChanges = true;
    }
    if (formData.description !== (globalState.description || "")) {
      changes.description = formData.description || null;
      hasChanges = true;
    }
    if (formData.thumbnailUrl !== (globalState.thumbnailUrl || "")) {
      changes.thumbnailUrl = formData.thumbnailUrl || null;
      hasChanges = true;
    }
    if (formData.infoLink !== (globalState.infoLink || "")) {
      changes.infoLink = formData.infoLink || null;
      hasChanges = true;
    }

    if (hasChanges) {
      dispatch(
        updateOfferingInfo({
          ...changes,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const handleOperatorBlur = () => {
    if (formData.operatorId !== globalState.operatorId) {
      dispatch(
        setOperator({
          operatorId: formData.operatorId,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const handleStatusChange = (value: string) => {
    const status = value as "DRAFT" | "COMING_SOON" | "ACTIVE" | "DEPRECATED";
    setFormData((prev) => ({ ...prev, status }));
    dispatch(
      updateOfferingStatus({
        status,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleAddAudience = (label: string, color?: string) => {
    if (!label.trim()) return;
    dispatch(
      addTargetAudience({
        id: generateId(),
        label: label.trim(),
        color: color || null,
        lastModified: new Date().toISOString(),
      }),
    );
    setNewAudienceLabel("");
    setShowAudienceInput(false);
  };

  const handleRemoveAudience = (id: string) => {
    dispatch(
      removeTargetAudience({
        id,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleFacetOptionToggle = (
    categoryKey: string,
    categoryLabel: string,
    optionId: string,
  ) => {
    const existingTarget = globalState.facetTargets.find(
      (ft) => ft.categoryKey === categoryKey,
    );
    const isSelected = existingTarget?.selectedOptions.includes(optionId);

    if (isSelected) {
      dispatch(
        removeFacetOption({
          categoryKey,
          optionId,
          lastModified: new Date().toISOString(),
        }),
      );
    } else {
      if (existingTarget) {
        dispatch(
          addFacetOption({
            categoryKey,
            optionId,
            lastModified: new Date().toISOString(),
          }),
        );
      } else {
        dispatch(
          setFacetTarget({
            id: generateId(),
            categoryKey,
            categoryLabel,
            selectedOptions: [optionId],
            lastModified: new Date().toISOString(),
          }),
        );
      }
    }
  };

  const handleClearFacetCategory = (categoryKey: string) => {
    dispatch(
      removeFacetTarget({
        categoryKey,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const getFacetSelectedOptions = (categoryKey: string): string[] => {
    const target = globalState.facetTargets.find(
      (ft) => ft.categoryKey === categoryKey,
    );
    return target?.selectedOptions || [];
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === formData.status);

  const availablePresets = AUDIENCE_PRESETS.filter(
    (preset) =>
      !globalState.targetAudiences.some((a) => a.label === preset.label),
  );

  return (
    <>
      <style>{styles}</style>
      <div className="offering-editor">
        {/* Hero Section - Thumbnail & Core Identity */}
        <section className="offering-editor__hero">
          <div className="offering-editor__thumbnail-area">
            <div
              className="offering-editor__thumbnail"
              style={{
                backgroundImage: formData.thumbnailUrl
                  ? `url(${formData.thumbnailUrl})`
                  : undefined,
              }}
            >
              {!formData.thumbnailUrl && (
                <div className="offering-editor__thumbnail-placeholder">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span>Add Thumbnail</span>
                </div>
              )}
              {formData.thumbnailUrl && (
                <div
                  className={`offering-editor__status-badge offering-editor__status-badge--${currentStatus?.color}`}
                >
                  {currentStatus?.label}
                </div>
              )}
            </div>
            <div className="offering-editor__thumbnail-input">
              <input
                type="text"
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  handleFieldChange("thumbnailUrl", e.target.value)
                }
                onBlur={handleInfoBlur}
                placeholder="https://example.com/image.jpg"
                className="offering-editor__input offering-editor__input--sm"
              />
            </div>
          </div>

          <div className="offering-editor__identity">
            <div className="offering-editor__title-row">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                onBlur={handleInfoBlur}
                className="offering-editor__title-input"
                placeholder="Offering Title"
              />
              <div className="offering-editor__status-select">
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="offering-editor__select"
                  data-status={currentStatus?.color}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span
                  className={`offering-editor__status-indicator offering-editor__status-indicator--${currentStatus?.color}`}
                />
              </div>
            </div>

            {/* Target Audiences */}
            <div className="offering-editor__audiences">
              {globalState.targetAudiences.map((audience: TargetAudience) => (
                <span
                  key={audience.id}
                  className="offering-editor__audience-tag"
                  style={
                    audience.color
                      ? {
                          backgroundColor: `${audience.color}15`,
                          borderColor: `${audience.color}40`,
                          color: audience.color,
                        }
                      : undefined
                  }
                >
                  {audience.label}
                  <button
                    type="button"
                    onClick={() => handleRemoveAudience(audience.id)}
                    className="offering-editor__audience-remove"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" />
                    </svg>
                  </button>
                </span>
              ))}

              {showAudienceInput ? (
                <div className="offering-editor__audience-input-wrap">
                  <input
                    type="text"
                    value={newAudienceLabel}
                    onChange={(e) => setNewAudienceLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleAddAudience(newAudienceLabel);
                      if (e.key === "Escape") setShowAudienceInput(false);
                    }}
                    placeholder="Audience name..."
                    className="offering-editor__audience-input"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAudience(newAudienceLabel)}
                    className="offering-editor__audience-add-btn"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAudienceInput(true)}
                  className="offering-editor__add-audience-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" strokeWidth="2" />
                  </svg>
                  Add Audience
                </button>
              )}
            </div>

            {availablePresets.length > 0 && (
              <div className="offering-editor__audience-presets">
                <span className="offering-editor__presets-label">
                  Quick add:
                </span>
                {availablePresets.slice(0, 4).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      handleAddAudience(preset.label, preset.color)
                    }
                    className="offering-editor__preset-btn"
                    style={{ color: preset.color }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={formData.summary}
              onChange={(e) => handleFieldChange("summary", e.target.value)}
              onBlur={handleInfoBlur}
              className="offering-editor__summary"
              placeholder="Brief summary of your service offering..."
              rows={2}
            />
          </div>
        </section>

        {/* Description */}
        <section className="offering-editor__card offering-editor__card--full">
          <div className="offering-editor__card-header">
            <div className="offering-editor__card-icon offering-editor__card-icon--violet">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </div>
            <div>
              <h3 className="offering-editor__card-title">Description</h3>
              <p className="offering-editor__card-subtitle">
                Detailed description of your offering
              </p>
            </div>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            onBlur={handleInfoBlur}
            className="offering-editor__textarea"
            placeholder="Provide a comprehensive description of your service offering, including what makes it unique and valuable..."
            rows={4}
          />
        </section>

        {/* Facet Targeting Section */}
        <section className="offering-editor__facets">
          <div className="offering-editor__facets-header">
            <div className="offering-editor__card-icon offering-editor__card-icon--sky">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M3 6h18M7 12h10M10 18h4" />
              </svg>
            </div>
            <div>
              <h3 className="offering-editor__card-title">Facet Targeting</h3>
              <p className="offering-editor__card-subtitle">
                Define which resource combinations can access this offering
              </p>
            </div>
          </div>
          <div className="offering-editor__facets-grid">
            {FACET_CATEGORIES.map((category) => {
              const selectedOptions = getFacetSelectedOptions(category.key);
              return (
                <div key={category.key} className="offering-editor__facet-card">
                  <div className="offering-editor__facet-header">
                    <span className="offering-editor__facet-label">
                      {category.label}
                    </span>
                    {selectedOptions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleClearFacetCategory(category.key)}
                        className="offering-editor__facet-clear"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="offering-editor__facet-desc">
                    {category.description}
                  </p>
                  <div className="offering-editor__facet-options">
                    {category.options.map((option) => {
                      const isSelected = selectedOptions.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            handleFacetOptionToggle(
                              category.key,
                              category.label,
                              option.id,
                            )
                          }
                          className={`offering-editor__facet-option ${
                            isSelected
                              ? "offering-editor__facet-option--selected"
                              : ""
                          }`}
                        >
                          <span className="offering-editor__facet-checkbox">
                            {isSelected && (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path d="M5 12l5 5L20 7" strokeWidth="2.5" />
                              </svg>
                            )}
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Metadata Row */}
        <section className="offering-editor__metadata">
          <div className="offering-editor__meta-field">
            <label className="offering-editor__label">Operator ID</label>
            <input
              type="text"
              value={formData.operatorId}
              onChange={(e) => handleFieldChange("operatorId", e.target.value)}
              onBlur={handleOperatorBlur}
              className="offering-editor__input offering-editor__input--mono"
              placeholder="operator-123"
            />
          </div>
          <div className="offering-editor__meta-field">
            <label className="offering-editor__label">More Info Link</label>
            <input
              type="text"
              value={formData.infoLink}
              onChange={(e) => handleFieldChange("infoLink", e.target.value)}
              onBlur={handleInfoBlur}
              className="offering-editor__input"
              placeholder="https://example.com/more-info"
            />
          </div>
        </section>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');

  .offering-editor {
    --oe-font: 'Instrument Sans', system-ui, sans-serif;
    --oe-mono: 'DM Mono', 'SF Mono', monospace;

    --oe-ink: #1a1f36;
    --oe-ink-light: #4a5578;
    --oe-ink-muted: #8792a8;
    --oe-surface: #ffffff;
    --oe-surface-raised: #fafbfc;
    --oe-border: #e4e8f0;
    --oe-border-light: #f0f2f7;

    --oe-violet: #7c5cff;
    --oe-violet-light: #f4f1ff;
    --oe-amber: #f59e0b;
    --oe-amber-light: #fef7e6;
    --oe-emerald: #10b981;
    --oe-emerald-light: #e8faf3;
    --oe-sky: #0ea5e9;
    --oe-sky-light: #e8f7fc;
    --oe-rose: #f43f5e;
    --oe-rose-light: #fef1f3;
    --oe-slate: #64748b;
    --oe-slate-light: #f1f5f9;

    font-family: var(--oe-font);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Hero Section */
  .offering-editor__hero {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 28px;
    background: var(--oe-surface);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04), 0 4px 16px rgba(26, 31, 54, 0.06);
  }

  .offering-editor__thumbnail-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .offering-editor__thumbnail {
    width: 160px;
    height: 120px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--oe-border-light) 0%, var(--oe-border) 100%);
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .offering-editor__thumbnail:hover {
    transform: scale(1.02);
  }

  .offering-editor__thumbnail-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--oe-ink-muted);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .offering-editor__thumbnail-placeholder svg {
    width: 32px;
    height: 32px;
    opacity: 0.5;
  }

  .offering-editor__status-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 10px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 100px;
    backdrop-filter: blur(8px);
  }

  .offering-editor__status-badge--emerald {
    background: rgba(16, 185, 129, 0.9);
    color: white;
  }

  .offering-editor__status-badge--sky {
    background: rgba(14, 165, 233, 0.9);
    color: white;
  }

  .offering-editor__status-badge--slate {
    background: rgba(100, 116, 139, 0.9);
    color: white;
  }

  .offering-editor__status-badge--rose {
    background: rgba(244, 63, 94, 0.9);
    color: white;
  }

  .offering-editor__thumbnail-input {
    width: 100%;
  }

  .offering-editor__identity {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .offering-editor__title-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .offering-editor__title-input {
    flex: 1;
    font-family: var(--oe-font);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--oe-ink);
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    letter-spacing: -0.02em;
  }

  .offering-editor__title-input::placeholder {
    color: var(--oe-ink-muted);
  }

  .offering-editor__status-select {
    position: relative;
    display: flex;
    align-items: center;
  }

  .offering-editor__select {
    appearance: none;
    font-family: var(--oe-font);
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 8px 32px 8px 28px;
    border-radius: 100px;
    border: 1.5px solid var(--oe-border);
    background: var(--oe-surface-raised);
    color: var(--oe-ink-light);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .offering-editor__select:hover {
    border-color: var(--oe-ink-muted);
  }

  .offering-editor__select:focus {
    outline: none;
    border-color: var(--oe-violet);
    box-shadow: 0 0 0 3px var(--oe-violet-light);
  }

  .offering-editor__status-indicator {
    position: absolute;
    left: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    pointer-events: none;
  }

  .offering-editor__status-indicator--emerald { background: var(--oe-emerald); }
  .offering-editor__status-indicator--sky { background: var(--oe-sky); }
  .offering-editor__status-indicator--slate { background: var(--oe-slate); }
  .offering-editor__status-indicator--rose { background: var(--oe-rose); }

  /* Audiences */
  .offering-editor__audiences {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .offering-editor__audience-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: 100px;
    background: var(--oe-violet-light);
    border: 1px solid rgba(124, 92, 255, 0.2);
    color: var(--oe-violet);
    transition: all 0.15s ease;
  }

  .offering-editor__audience-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  .offering-editor__audience-remove:hover {
    opacity: 1;
  }

  .offering-editor__audience-remove svg {
    width: 12px;
    height: 12px;
  }

  .offering-editor__add-audience-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-family: var(--oe-font);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--oe-ink-muted);
    background: transparent;
    border: 1.5px dashed var(--oe-border);
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .offering-editor__add-audience-btn:hover {
    border-color: var(--oe-ink-muted);
    color: var(--oe-ink-light);
  }

  .offering-editor__add-audience-btn svg {
    width: 14px;
    height: 14px;
  }

  .offering-editor__audience-input-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .offering-editor__audience-input {
    width: 140px;
    padding: 6px 12px;
    font-family: var(--oe-font);
    font-size: 0.8125rem;
    border: 1.5px solid var(--oe-violet);
    border-radius: 100px;
    outline: none;
    background: var(--oe-surface);
  }

  .offering-editor__audience-add-btn {
    padding: 6px 12px;
    font-family: var(--oe-font);
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    background: var(--oe-violet);
    border: none;
    border-radius: 100px;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .offering-editor__audience-add-btn:hover {
    background: #6b4ee0;
  }

  .offering-editor__audience-presets {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 4px;
  }

  .offering-editor__presets-label {
    font-size: 0.75rem;
    color: var(--oe-ink-muted);
  }

  .offering-editor__preset-btn {
    font-family: var(--oe-font);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 4px 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s ease;
  }

  .offering-editor__preset-btn:hover {
    opacity: 1;
  }

  .offering-editor__summary {
    width: 100%;
    font-family: var(--oe-font);
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--oe-ink-light);
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    padding: 0;
  }

  .offering-editor__summary::placeholder {
    color: var(--oe-ink-muted);
  }

  /* Grid Cards */
  .offering-editor__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .offering-editor__card {
    background: var(--oe-surface);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04), 0 4px 16px rgba(26, 31, 54, 0.06);
  }

  .offering-editor__card-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 20px;
  }

  .offering-editor__card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .offering-editor__card-icon svg {
    width: 20px;
    height: 20px;
  }

  .offering-editor__card-icon--violet {
    background: var(--oe-violet-light);
    color: var(--oe-violet);
  }

  .offering-editor__card-icon--amber {
    background: var(--oe-amber-light);
    color: var(--oe-amber);
  }

  .offering-editor__card-icon--emerald {
    background: var(--oe-emerald-light);
    color: var(--oe-emerald);
  }

  .offering-editor__card--full {
    grid-column: 1 / -1;
  }

  .offering-editor__card-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--oe-ink);
    margin: 0 0 2px;
  }

  .offering-editor__card-subtitle {
    font-size: 0.8125rem;
    color: var(--oe-ink-muted);
    margin: 0;
  }

  .offering-editor__textarea {
    width: 100%;
    font-family: var(--oe-font);
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--oe-ink);
    background: var(--oe-surface-raised);
    border: 1.5px solid var(--oe-border-light);
    border-radius: 12px;
    padding: 16px;
    resize: vertical;
    transition: all 0.15s ease;
  }

  .offering-editor__textarea:hover {
    border-color: var(--oe-border);
  }

  .offering-editor__textarea:focus {
    outline: none;
    border-color: var(--oe-violet);
    box-shadow: 0 0 0 3px var(--oe-violet-light);
  }

  .offering-editor__textarea::placeholder {
    color: var(--oe-ink-muted);
  }

  /* Services */
  .offering-editor__services {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .offering-editor__service {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--oe-surface-raised);
    border-radius: 8px;
    transition: background 0.15s ease;
  }

  .offering-editor__service:hover {
    background: var(--oe-border-light);
  }

  .offering-editor__service-bullet {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--oe-emerald);
    flex-shrink: 0;
  }

  .offering-editor__service-bullet--recurring {
    background: var(--oe-amber);
  }

  .offering-editor__service-bullet--ghost {
    background: var(--oe-border);
  }

  .offering-editor__service-text {
    flex: 1;
    font-size: 0.875rem;
    color: var(--oe-ink);
  }

  .offering-editor__service-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: var(--oe-ink-muted);
    opacity: 0;
    transition: all 0.15s ease;
  }

  .offering-editor__service:hover .offering-editor__service-remove {
    opacity: 1;
  }

  .offering-editor__service-remove:hover {
    background: var(--oe-rose-light);
    color: var(--oe-rose);
  }

  .offering-editor__service-remove svg {
    width: 14px;
    height: 14px;
  }

  .offering-editor__add-service {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: transparent;
    border: 1.5px dashed var(--oe-border);
    border-radius: 8px;
    transition: all 0.15s ease;
  }

  .offering-editor__add-service:focus-within {
    border-color: var(--oe-violet);
    border-style: solid;
  }

  .offering-editor__service-new-input {
    flex: 1;
    font-family: var(--oe-font);
    font-size: 0.875rem;
    background: transparent;
    border: none;
    outline: none;
    color: var(--oe-ink);
  }

  .offering-editor__service-new-input::placeholder {
    color: var(--oe-ink-muted);
  }

  .offering-editor__service-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: var(--oe-violet);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: white;
    transition: background 0.15s ease;
  }

  .offering-editor__service-add-btn:hover {
    background: #6b4ee0;
  }

  .offering-editor__service-add-btn svg {
    width: 16px;
    height: 16px;
  }

  /* Metadata */
  .offering-editor__metadata {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    background: var(--oe-surface);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04), 0 4px 16px rgba(26, 31, 54, 0.06);
  }

  .offering-editor__meta-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .offering-editor__label {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--oe-ink-muted);
  }

  .offering-editor__input {
    width: 100%;
    font-family: var(--oe-font);
    font-size: 0.9375rem;
    padding: 12px 16px;
    background: var(--oe-surface-raised);
    border: 1.5px solid var(--oe-border-light);
    border-radius: 10px;
    color: var(--oe-ink);
    transition: all 0.15s ease;
  }

  .offering-editor__input:hover {
    border-color: var(--oe-border);
  }

  .offering-editor__input:focus {
    outline: none;
    border-color: var(--oe-violet);
    box-shadow: 0 0 0 3px var(--oe-violet-light);
  }

  .offering-editor__input::placeholder {
    color: var(--oe-ink-muted);
  }

  .offering-editor__input--sm {
    font-size: 0.8125rem;
    padding: 8px 12px;
  }

  .offering-editor__input--mono {
    font-family: var(--oe-mono);
    font-size: 0.875rem;
  }

  /* Facet Targeting */
  .offering-editor__facets {
    background: var(--oe-surface);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04), 0 4px 16px rgba(26, 31, 54, 0.06);
  }

  .offering-editor__facets-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 20px;
  }

  .offering-editor__card-icon--sky {
    background: var(--oe-sky-light);
    color: var(--oe-sky);
  }

  .offering-editor__facets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .offering-editor__facet-card {
    background: var(--oe-surface-raised);
    border: 1px solid var(--oe-border-light);
    border-radius: 12px;
    padding: 16px;
    transition: border-color 0.15s ease;
  }

  .offering-editor__facet-card:hover {
    border-color: var(--oe-border);
  }

  .offering-editor__facet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .offering-editor__facet-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--oe-ink);
  }

  .offering-editor__facet-clear {
    font-family: var(--oe-font);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 4px 8px;
    background: transparent;
    border: none;
    color: var(--oe-ink-muted);
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .offering-editor__facet-clear:hover {
    color: var(--oe-rose);
  }

  .offering-editor__facet-desc {
    font-size: 0.75rem;
    color: var(--oe-ink-muted);
    margin: 0 0 12px;
  }

  .offering-editor__facet-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .offering-editor__facet-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    font-family: var(--oe-font);
    font-size: 0.8125rem;
    color: var(--oe-ink-light);
    background: var(--oe-surface);
    border: 1.5px solid var(--oe-border-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .offering-editor__facet-option:hover {
    border-color: var(--oe-border);
    background: var(--oe-surface);
  }

  .offering-editor__facet-option--selected {
    border-color: var(--oe-sky);
    background: var(--oe-sky-light);
    color: var(--oe-ink);
  }

  .offering-editor__facet-option--selected:hover {
    border-color: var(--oe-sky);
    background: var(--oe-sky-light);
  }

  .offering-editor__facet-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    background: var(--oe-surface);
    border: 1.5px solid var(--oe-border);
    transition: all 0.15s ease;
  }

  .offering-editor__facet-option--selected .offering-editor__facet-checkbox {
    background: var(--oe-sky);
    border-color: var(--oe-sky);
  }

  .offering-editor__facet-checkbox svg {
    width: 12px;
    height: 12px;
    color: white;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .offering-editor__hero {
      grid-template-columns: 1fr;
    }

    .offering-editor__thumbnail-area {
      flex-direction: row;
      align-items: flex-start;
    }

    .offering-editor__thumbnail {
      width: 120px;
      height: 90px;
    }

    .offering-editor__thumbnail-input {
      flex: 1;
    }

    .offering-editor__grid {
      grid-template-columns: 1fr;
    }

    .offering-editor__metadata {
      grid-template-columns: 1fr;
    }

    .offering-editor__facets-grid {
      grid-template-columns: 1fr;
    }
  }
`;
