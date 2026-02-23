import { useState, useMemo, useCallback } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  selectResourceTemplate,
  changeResourceTemplate,
  setOperator,
  addFacetOption,
  removeFacetOption,
  setFacetTarget,
} from "../../../document-models/service-offering/gen/offering/creators.js";
import { generateId } from "document-model/core";
import { useResourceTemplateDocumentsInSelectedDrive } from "../../../document-models/resource-template/hooks.js";
import type {
  ResourceTemplateDocument,
  ResourceTemplateGlobalState,
} from "@powerhousedao/service-offering/document-models/resource-template";
import { MarkdownPreview } from "./MarkdownPreview.js";
import { useRemoteResourceTemplates } from "../hooks/useRemoteResourceTemplates.js";
import type { RemoteResourceTemplate } from "../utils/graphql-client.js";

/**
 * Normalized template shape used by all UI components.
 * Both local ResourceTemplateDocument and remote templates are mapped to this.
 */
interface NormalizedTemplate {
  id: string;
  isRemote: boolean;
  /** Resolved operator/builder name for remote templates */
  operatorName: string | null;
  state: {
    global: ResourceTemplateGlobalState;
  };
}

function normalizeLocalTemplate(
  doc: ResourceTemplateDocument,
): NormalizedTemplate {
  return {
    id: doc.header.id,
    isRemote: false,
    operatorName: null,
    state: { global: doc.state.global },
  };
}

function normalizeRemoteTemplate(
  remote: RemoteResourceTemplate,
): NormalizedTemplate {
  return {
    id: remote.id,
    isRemote: true,
    operatorName: remote.operatorName ?? null,
    state: {
      global: {
        id: remote.state.id ?? remote.id,
        operatorId: remote.state.operatorId ?? "",
        title: remote.state.title || remote.name || "Untitled",
        summary: remote.state.summary || "",
        description: remote.state.description || null,
        thumbnailUrl: remote.state.thumbnailUrl || null,
        infoLink: remote.state.infoLink || null,
        status:
          (remote.state.status as ResourceTemplateGlobalState["status"]) ||
          "DRAFT",
        lastModified: remote.state.lastModified || new Date().toISOString(),
        targetAudiences: remote.state.targetAudiences ?? [],
        setupServices: remote.state.setupServices ?? [],
        recurringServices: remote.state.recurringServices ?? [],
        facetTargets: remote.state.facetTargets ?? [],
        services: (remote.state.services ?? []).map((s) => ({
          ...s,
          description: s.description || null,
          displayOrder: s.displayOrder || null,
          parentServiceId: null,
          optionGroupId: s.optionGroupId || null,
          facetBindings: [],
        })),
        optionGroups: [],
        faqFields: [],
        contentSections: [],
      },
    },
  };
}

interface ResourceTemplateSelectorProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

export function ResourceTemplateSelector({
  document,
  dispatch,
}: ResourceTemplateSelectorProps) {
  const localTemplates = useResourceTemplateDocumentsInSelectedDrive();
  const [searchQuery, setSearchQuery] = useState("");
  const [showingSelector, setShowingSelector] = useState(false);

  // Build set of local template IDs for deduplication
  const localTemplateIds = useMemo(
    () => new Set((localTemplates ?? []).map((t) => t.header.id)),
    [localTemplates],
  );

  // Fetch remote templates (filtered to exclude locals)
  const { templates: remoteTemplates, isLoading: isLoadingRemote } =
    useRemoteResourceTemplates(localTemplateIds);

  // Normalize and merge local + remote templates
  const allTemplates = useMemo(() => {
    const normalized: NormalizedTemplate[] = (localTemplates ?? []).map(
      normalizeLocalTemplate,
    );
    for (const remote of remoteTemplates) {
      normalized.push(normalizeRemoteTemplate(remote));
    }
    return normalized;
  }, [localTemplates, remoteTemplates]);

  // Get the currently selected template ID from document state
  const currentTemplateId = document.state.global.resourceTemplateId;

  const filteredTemplates = useMemo(() => {
    if (!allTemplates.length) return [];
    if (!searchQuery.trim()) return allTemplates;

    const query = searchQuery.toLowerCase();
    return allTemplates.filter(
      (t) =>
        t.state.global.title.toLowerCase().includes(query) ||
        t.state.global.summary.toLowerCase().includes(query),
    );
  }, [allTemplates, searchQuery]);

  const selectedTemplate = useMemo(() => {
    if (!currentTemplateId || !allTemplates.length) return null;
    return allTemplates.find((t) => t.id === currentTemplateId) || null;
  }, [currentTemplateId, allTemplates]);

  const handleSelectTemplate = useCallback(
    (template: NormalizedTemplate) => {
      const now = new Date().toISOString();

      if (currentTemplateId) {
        dispatch(
          changeResourceTemplate({
            previousTemplateId: currentTemplateId,
            newTemplateId: template.id,
            lastModified: now,
          }),
        );
      } else {
        dispatch(
          selectResourceTemplate({
            resourceTemplateId: template.id,
            lastModified: now,
          }),
        );
      }

      dispatch(
        setOperator({
          operatorId: template.state.global.operatorId ?? "",
          lastModified: now,
        }),
      );
      setShowingSelector(false);
    },
    [currentTemplateId, dispatch],
  );

  const handleChangeTemplate = useCallback(() => {
    setShowingSelector(true);
  }, []);

  const activeTemplates = filteredTemplates.filter(
    (t) => t.state.global.status === "ACTIVE",
  );
  const otherTemplates = filteredTemplates.filter(
    (t) => t.state.global.status !== "ACTIVE",
  );

  // Determine recommended template (Social Proof / Authority Bias)
  // The most complete active template is recommended
  const recommendedTemplateId = useMemo(() => {
    if (!activeTemplates || activeTemplates.length === 0) return null;

    // Score templates by completeness (more services, facets, audiences = better)
    const scored = activeTemplates.map((t) => ({
      id: t.id,
      score:
        t.state.global.services.length * 3 + // Services weighted highest
        t.state.global.facetTargets.length * 2 +
        t.state.global.targetAudiences.length +
        (t.state.global.description ? 2 : 0) +
        (t.state.global.thumbnailUrl ? 1 : 0),
    }));

    const best = scored.sort((a, b) => b.score - a.score)[0];
    return best?.id || null;
  }, [activeTemplates]);

  // If a template is selected and user is not changing, show the detail view with facet selection
  if (selectedTemplate && !showingSelector) {
    return (
      <>
        <style>{styles}</style>
        <div className="rts-container">
          <TemplateDetailView
            template={selectedTemplate}
            offeringDocument={document}
            dispatch={dispatch}
            onChangeTemplate={handleChangeTemplate}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="rts-container">
        {/* Header */}
        <div className="rts-header">
          <div className="rts-header__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="rts-header__text">
            <h2 className="rts-header__title">Select a Product</h2>
            <p className="rts-header__subtitle">
              Choose a product to base this service offering on. The product
              defines the configuration, target audiences, and available
              services.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="rts-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" strokeWidth="2" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="rts-search__input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rts-search__clear"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>

        {/* Templates List */}
        <div className="rts-templates">
          {isLoadingRemote && allTemplates.length === 0 ? (
            <div className="rts-empty">
              <div className="rts-loading-spinner" />
              <p className="rts-empty__desc">Loading products...</p>
            </div>
          ) : allTemplates.length === 0 ? (
            <div className="rts-empty">
              <div className="rts-empty__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="rts-empty__title">No Products Found</h3>
              <p className="rts-empty__desc">
                Create a product first to define the base configuration for your
                service offering.
              </p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="rts-empty rts-empty--search">
              <p className="rts-empty__desc">
                No templates match "{searchQuery}"
              </p>
            </div>
          ) : (
            <>
              {/* Active Templates Section */}
              {activeTemplates.length > 0 && (
                <div className="rts-section">
                  <h3 className="rts-section__title">
                    <span className="rts-section__dot rts-section__dot--active" />
                    Active Templates
                  </h3>
                  <div className="rts-grid">
                    {activeTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={currentTemplateId === template.id}
                        isRecommended={template.id === recommendedTemplateId}
                        onSelect={() => handleSelectTemplate(template)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Templates Section */}
              {otherTemplates.length > 0 && (
                <div className="rts-section">
                  <h3 className="rts-section__title">
                    <span className="rts-section__dot" />
                    Other Templates
                  </h3>
                  <div className="rts-grid">
                    {otherTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={currentTemplateId === template.id}
                        onSelect={() => handleSelectTemplate(template)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Remote loading indicator */}
              {isLoadingRemote && (
                <div className="rts-remote-loading">
                  <div className="rts-loading-spinner rts-loading-spinner--small" />
                  <span>Loading remote products...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

interface TemplateCardProps {
  template: NormalizedTemplate;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

function TemplateCard({
  template,
  isSelected,
  isRecommended,
  onSelect,
}: TemplateCardProps) {
  const globalState = template.state.global;

  const statusStyle = getStatusStyle(globalState.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rts-card ${isSelected ? "rts-card--selected" : ""} ${isRecommended ? "rts-card--recommended" : ""}`}
    >
      {isRecommended && !isSelected && (
        <div className="rts-card__recommended">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Recommended
        </div>
      )}
      {template.isRemote && (
        <div
          className={`rts-card__remote-badge ${template.operatorName ? "rts-card__remote-badge--operator" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {template.operatorName ? (
              <>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </>
            ) : (
              <>
                <path d="M2 15c6.667-6 13.333 0 20-6" />
                <path d="M9 22c1.798-1.998 2.54-3.995 2.807-5.993" />
                <path d="M15 2c-1.798 1.998-2.54 3.995-2.807 5.993" />
              </>
            )}
          </svg>
          {template.operatorName ?? "Remote"}
        </div>
      )}
      <div className="rts-card__header">
        {globalState.thumbnailUrl ? (
          <div
            className="rts-card__thumb"
            style={{ backgroundImage: `url(${globalState.thumbnailUrl})` }}
          />
        ) : (
          <div className="rts-card__thumb rts-card__thumb--placeholder">
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
          </div>
        )}
        <span
          className="rts-card__status"
          style={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
          }}
        >
          <span
            className="rts-card__status-dot"
            style={{ backgroundColor: statusStyle.dot }}
          />
          {globalState.status.replace("_", " ")}
        </span>
      </div>
      <div className="rts-card__body">
        <h4 className="rts-card__title">{globalState.title || "Untitled"}</h4>
        <p className="rts-card__summary">
          {globalState.summary || "No summary provided"}
        </p>
        <div className="rts-card__meta">
          {globalState.targetAudiences.length > 0 && (
            <span className="rts-card__tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  strokeWidth="2"
                />
                <circle cx="9" cy="7" r="4" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
              </svg>
              {globalState.targetAudiences.length}
            </span>
          )}
          {globalState.services.length > 0 && (
            <span className="rts-card__tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" />
                <path d="M2 17l10 5 10-5" strokeWidth="2" />
                <path d="M2 12l10 5 10-5" strokeWidth="2" />
              </svg>
              {globalState.services.length}
            </span>
          )}
          {globalState.facetTargets.length > 0 && (
            <span className="rts-card__tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18M7 12h10M10 18h4" strokeWidth="2" />
              </svg>
              {globalState.facetTargets.length}
            </span>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="rts-card__check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12l5 5L20 7" strokeWidth="2.5" />
          </svg>
        </div>
      )}
    </button>
  );
}

interface TemplateDetailViewProps {
  template: NormalizedTemplate;
  offeringDocument: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onChangeTemplate: () => void;
}

function TemplateDetailView({
  template,
  offeringDocument,
  dispatch,
  onChangeTemplate,
}: TemplateDetailViewProps) {
  const globalState = template.state.global;
  const statusStyle = getStatusStyle(globalState.status);

  // Get the current facet selections from the offering document
  const offeringFacetTargets = offeringDocument.state.global.facetTargets;

  // Check if an option is selected in the offering
  const isOptionSelected = useCallback(
    (categoryKey: string, optionId: string) => {
      const facetTarget = offeringFacetTargets.find(
        (f) => f.categoryKey === categoryKey,
      );
      return facetTarget?.selectedOptions.includes(optionId) ?? false;
    },
    [offeringFacetTargets],
  );

  // Toggle a facet option in the offering
  const handleToggleFacetOption = useCallback(
    (categoryKey: string, categoryLabel: string, optionId: string) => {
      const now = new Date().toISOString();
      const existingFacetTarget = offeringFacetTargets.find(
        (f) => f.categoryKey === categoryKey,
      );

      if (!existingFacetTarget) {
        // Create the facet target with this option selected
        dispatch(
          setFacetTarget({
            id: generateId(),
            categoryKey,
            categoryLabel,
            selectedOptions: [optionId],
            lastModified: now,
          }),
        );
      } else if (existingFacetTarget.selectedOptions.includes(optionId)) {
        // Remove the option
        dispatch(
          removeFacetOption({
            categoryKey,
            optionId,
            lastModified: now,
          }),
        );
      } else {
        // Add the option
        dispatch(
          addFacetOption({
            categoryKey,
            optionId,
            lastModified: now,
          }),
        );
      }
    },
    [offeringFacetTargets, dispatch],
  );

  // Calculate facet completion progress (Goal-Gradient Effect)
  const facetProgress = useMemo(() => {
    const totalOptions = globalState.facetTargets.reduce(
      (sum, facet) => sum + facet.selectedOptions.length,
      0,
    );
    const selectedOptions = offeringFacetTargets.reduce(
      (sum, facet) => sum + facet.selectedOptions.length,
      0,
    );
    const percent =
      totalOptions > 0 ? Math.round((selectedOptions / totalOptions) * 100) : 0;
    return { total: totalOptions, selected: selectedOptions, percent };
  }, [globalState.facetTargets, offeringFacetTargets]);

  return (
    <div className="rtd-container">
      {/* Selected Template Header */}
      <div className="rtd-selected-header">
        <div className="rtd-selected-header__info">
          <span className="rtd-selected-header__badge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            Selected Template
          </span>
          <button
            type="button"
            onClick={onChangeTemplate}
            className="rtd-selected-header__change"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Change Template
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="rtd-hero">
        <div className="rtd-hero__thumbnail-area">
          <div
            className="rtd-hero__thumbnail"
            style={{
              backgroundImage: globalState.thumbnailUrl
                ? `url(${globalState.thumbnailUrl})`
                : undefined,
            }}
          >
            {!globalState.thumbnailUrl && (
              <div className="rtd-hero__thumbnail-placeholder">
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
              </div>
            )}
            <span
              className="rtd-hero__status"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
              }}
            >
              <span
                className="rtd-hero__status-dot"
                style={{ backgroundColor: statusStyle.dot }}
              />
              {globalState.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="rtd-hero__identity">
          <h1 className="rtd-hero__title">
            {globalState.title || "Untitled Template"}
          </h1>

          {/* Target Audiences */}
          {globalState.targetAudiences.length > 0 && (
            <div className="rtd-hero__audiences">
              {globalState.targetAudiences.map((audience) => (
                <span
                  key={audience.id}
                  className="rtd-hero__audience-tag"
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
                </span>
              ))}
            </div>
          )}

          <p className="rtd-hero__summary">
            {globalState.summary || "No summary provided"}
          </p>
        </div>
      </section>

      {/* Description */}
      {globalState.description && (
        <section className="rtd-card">
          <div className="rtd-card__header">
            <div className="rtd-card__icon rtd-card__icon--violet">
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
              <h3 className="rtd-card__title">Description</h3>
            </div>
          </div>
          <MarkdownPreview
            content={globalState.description}
            className="rtd-card__text"
          />
        </section>
      )}

      {/* Services Grid */}
      <div className="rtd-grid">
        {/* Setup Services */}
        <section className="rtd-card">
          <div className="rtd-card__header">
            <div className="rtd-card__icon rtd-card__icon--emerald">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h3 className="rtd-card__title">Formation & Setup</h3>
              <p className="rtd-card__subtitle">One-time setup services</p>
            </div>
          </div>
          {globalState.setupServices.length > 0 ? (
            <div className="rtd-services">
              {globalState.setupServices.map((service, index) => (
                <div key={index} className="rtd-service">
                  <span className="rtd-service__bullet" />
                  <span className="rtd-service__text">{service}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rtd-card__empty">No setup services defined</p>
          )}
        </section>

        {/* Recurring Services */}
        <section className="rtd-card">
          <div className="rtd-card__header">
            <div className="rtd-card__icon rtd-card__icon--amber">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <div>
              <h3 className="rtd-card__title">Recurring Services</h3>
              <p className="rtd-card__subtitle">Ongoing services included</p>
            </div>
          </div>
          {globalState.recurringServices.length > 0 ? (
            <div className="rtd-services">
              {globalState.recurringServices.map((service, index) => (
                <div key={index} className="rtd-service">
                  <span className="rtd-service__bullet rtd-service__bullet--recurring" />
                  <span className="rtd-service__text">{service}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rtd-card__empty">No recurring services defined</p>
          )}
        </section>
      </div>

      {/* Facet Targeting - Interactive Selection */}
      {globalState.facetTargets.length > 0 && (
        <section className="rtd-card">
          <div className="rtd-card__header rtd-card__header--with-progress">
            <div className="rtd-card__header-left">
              <div className="rtd-card__icon rtd-card__icon--sky">
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
                <h3 className="rtd-card__title">Facet Targeting</h3>
                <p className="rtd-card__subtitle">
                  Select which facet options apply to this offering
                </p>
              </div>
            </div>
            {/* Goal-Gradient Progress Indicator */}
            <div className="rtd-facet-progress">
              <div className="rtd-facet-progress__bar">
                <div
                  className="rtd-facet-progress__fill"
                  style={{ width: `${facetProgress.percent}%` }}
                />
              </div>
              <span className="rtd-facet-progress__text">
                {facetProgress.selected} of {facetProgress.total} selected
                {facetProgress.percent === 100 && (
                  <span className="rtd-facet-progress__complete"> ✓</span>
                )}
              </span>
            </div>
          </div>
          <div className="rtd-facets">
            {globalState.facetTargets.map((facet) => (
              <div key={facet.id} className="rtd-facet rtd-facet--selectable">
                <span className="rtd-facet__label">{facet.categoryLabel}</span>
                <div className="rtd-facet__options">
                  {facet.selectedOptions.map((option) => {
                    const selected = isOptionSelected(
                      facet.categoryKey,
                      option,
                    );
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`rtd-facet__option rtd-facet__option--toggle ${selected ? "rtd-facet__option--selected" : ""}`}
                        onClick={() =>
                          handleToggleFacetOption(
                            facet.categoryKey,
                            facet.categoryLabel,
                            option,
                          )
                        }
                      >
                        <span className="rtd-facet__checkbox">
                          {selected && (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          )}
                        </span>
                        {option.replace(/-/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Catalog */}
      {globalState.services.length > 0 && (
        <section className="rtd-card">
          <div className="rtd-card__header">
            <div className="rtd-card__icon rtd-card__icon--teal">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
              </svg>
            </div>
            <div>
              <h3 className="rtd-card__title">Services Defined</h3>
              <p className="rtd-card__subtitle">
                {globalState.services.length} service
                {globalState.services.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
          <div className="rtd-services-list">
            {globalState.services.map((service) => (
              <div key={service.id} className="rtd-service-item">
                <div className="rtd-service-item__main">
                  <span className="rtd-service-item__title">
                    {service.title}
                  </span>
                  {service.isSetupFormation && (
                    <span className="rtd-service-item__badge">Setup</span>
                  )}
                </div>
                {service.description && (
                  <p className="rtd-service-item__desc">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Metadata */}
      <section className="rtd-metadata">
        {globalState.operatorId && (
          <div className="rtd-meta-field">
            <span className="rtd-meta-field__label">Operator ID</span>
            <span className="rtd-meta-field__value rtd-meta-field__value--mono">
              {globalState.operatorId}
            </span>
          </div>
        )}
        {globalState.infoLink && (
          <div className="rtd-meta-field">
            <span className="rtd-meta-field__label">More Info</span>
            <a
              href={globalState.infoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rtd-meta-field__link"
            >
              {globalState.infoLink}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

function getStatusStyle(status: ResourceTemplateGlobalState["status"]) {
  const statusColors: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    ACTIVE: {
      bg: "var(--rts-emerald-light)",
      text: "var(--rts-emerald)",
      dot: "var(--rts-emerald)",
    },
    DRAFT: {
      bg: "var(--rts-slate-light)",
      text: "var(--rts-slate)",
      dot: "var(--rts-slate)",
    },
    COMING_SOON: {
      bg: "var(--rts-sky-light)",
      text: "var(--rts-sky)",
      dot: "var(--rts-sky)",
    },
    DEPRECATED: {
      bg: "var(--rts-rose-light)",
      text: "var(--rts-rose)",
      dot: "var(--rts-rose)",
    },
  };

  return statusColors[status] || statusColors.DRAFT;
}

const styles = `
  .rts-container {
    --rts-font: 'Instrument Sans', system-ui, sans-serif;
    --rts-mono: 'DM Mono', 'SF Mono', monospace;

    --rts-ink: #1a1f36;
    --rts-ink-light: #4a5578;
    --rts-ink-muted: #8792a8;
    --rts-surface: #ffffff;
    --rts-surface-raised: #fafbfc;
    --rts-border: #e4e8f0;
    --rts-border-light: #f0f2f7;

    --rts-teal: #14b8a6;
    --rts-teal-light: #ccfbf1;
    --rts-violet: #7c5cff;
    --rts-violet-light: #f4f1ff;
    --rts-emerald: #10b981;
    --rts-emerald-light: #e8faf3;
    --rts-sky: #0ea5e9;
    --rts-sky-light: #e8f7fc;
    --rts-rose: #f43f5e;
    --rts-rose-light: #fef1f3;
    --rts-slate: #64748b;
    --rts-slate-light: #f1f5f9;
    --rts-amber: #f59e0b;
    --rts-amber-light: #fef7e6;

    font-family: var(--rts-font);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Header */
  .rts-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 24px;
    background: var(--rts-surface);
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04), 0 4px 16px rgba(26, 31, 54, 0.06);
    border-left: 4px solid var(--rts-teal);
  }

  .rts-header__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--rts-teal-light);
    color: var(--rts-teal);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rts-header__icon svg {
    width: 24px;
    height: 24px;
  }

  .rts-header__text {
    flex: 1;
  }

  .rts-header__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--rts-ink);
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .rts-header__subtitle {
    font-size: 0.9375rem;
    color: var(--rts-ink-light);
    margin: 0;
    line-height: 1.6;
    max-width: 600px;
  }

  /* Search */
  .rts-search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: var(--rts-surface);
    border: 1.5px solid var(--rts-border);
    border-radius: 12px;
    transition: all 0.15s ease;
  }

  .rts-search:focus-within {
    border-color: var(--rts-teal);
    box-shadow: 0 0 0 3px var(--rts-teal-light);
  }

  .rts-search > svg {
    width: 20px;
    height: 20px;
    color: var(--rts-ink-muted);
    flex-shrink: 0;
  }

  .rts-search__input {
    flex: 1;
    font-family: var(--rts-font);
    font-size: 0.9375rem;
    background: transparent;
    border: none;
    outline: none;
    color: var(--rts-ink);
  }

  .rts-search__input::placeholder {
    color: var(--rts-ink-muted);
  }

  .rts-search__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: var(--rts-border-light);
    border: none;
    border-radius: 6px;
    color: var(--rts-ink-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .rts-search__clear:hover {
    background: var(--rts-border);
    color: var(--rts-ink-light);
  }

  .rts-search__clear svg {
    width: 14px;
    height: 14px;
  }

  /* Templates */
  .rts-templates {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .rts-section__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--rts-ink-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 16px;
  }

  .rts-section__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--rts-slate);
  }

  .rts-section__dot--active {
    background: var(--rts-emerald);
  }

  .rts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  /* Card */
  .rts-card {
    position: relative;
    display: flex;
    flex-direction: column;
    text-align: left;
    background: var(--rts-surface);
    border: 2px solid var(--rts-border-light);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .rts-card:hover {
    border-color: var(--rts-border);
    box-shadow: 0 4px 16px rgba(26, 31, 54, 0.08);
    transform: translateY(-2px);
  }

  .rts-card--selected {
    border-color: var(--rts-teal);
    background: var(--rts-teal-light);
  }

  .rts-card--selected:hover {
    border-color: var(--rts-teal);
  }

  .rts-card__header {
    position: relative;
    height: 100px;
  }

  .rts-card__thumb {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-color: var(--rts-border-light);
  }

  .rts-card__thumb--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--rts-border-light) 0%, var(--rts-border) 100%);
    color: var(--rts-ink-muted);
  }

  .rts-card__thumb--placeholder svg {
    width: 32px;
    height: 32px;
    opacity: 0.5;
  }

  .rts-card__status {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 100px;
    backdrop-filter: blur(8px);
  }

  .rts-card__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .rts-card__body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .rts-card__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--rts-ink);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .rts-card__summary {
    font-size: 0.8125rem;
    color: var(--rts-ink-light);
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .rts-card__meta {
    display: flex;
    gap: 12px;
    margin-top: auto;
    padding-top: 8px;
  }

  .rts-card__tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--rts-ink-muted);
  }

  .rts-card__tag svg {
    width: 14px;
    height: 14px;
  }

  .rts-card__check {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--rts-teal);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.4);
  }

  .rts-card__check svg {
    width: 16px;
    height: 16px;
  }

  /* Recommended Badge - Social Proof */
  .rts-card--recommended {
    border-color: var(--rts-amber);
    box-shadow: 0 0 0 1px var(--rts-amber), 0 4px 16px rgba(245, 158, 11, 0.15);
  }

  .rts-card--recommended:hover {
    border-color: var(--rts-amber);
    box-shadow: 0 0 0 1px var(--rts-amber), 0 6px 20px rgba(245, 158, 11, 0.2);
  }

  .rts-card__recommended {
    position: absolute;
    top: -1px;
    right: 40px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: white;
    background: linear-gradient(135deg, var(--rts-amber) 0%, #d97706 100%);
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    z-index: 5;
  }

  .rts-card__recommended svg {
    width: 12px;
    height: 12px;
    fill: currentColor;
    stroke: currentColor;
  }

  /* Remote Badge */
  .rts-card__remote-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--rts-violet);
    background: var(--rts-violet-light);
    border-radius: 100px;
    backdrop-filter: blur(8px);
    z-index: 4;
  }

  .rts-card__remote-badge--operator {
    text-transform: none;
    font-weight: 600;
    color: var(--rts-teal);
    background: var(--rts-teal-light);
  }

  .rts-card__remote-badge svg {
    width: 12px;
    height: 12px;
  }

  /* Loading Spinner */
  .rts-loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--rts-border);
    border-top-color: var(--rts-teal);
    border-radius: 50%;
    animation: rts-spin 0.8s linear infinite;
    margin: 0 auto 12px;
  }

  .rts-loading-spinner--small {
    width: 16px;
    height: 16px;
    border-width: 2px;
    margin: 0;
  }

  @keyframes rts-spin {
    to { transform: rotate(360deg); }
  }

  /* Remote Loading Indicator */
  .rts-remote-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    font-size: 0.8125rem;
    color: var(--rts-ink-muted);
    background: var(--rts-surface-raised);
    border-radius: 8px;
    border: 1px solid var(--rts-border-light);
  }

  /* Empty State */
  .rts-empty {
    padding: 48px;
    text-align: center;
    background: var(--rts-surface);
    border-radius: 16px;
    border: 2px dashed var(--rts-border);
  }

  .rts-empty--search {
    padding: 24px;
    border-style: solid;
    background: var(--rts-surface-raised);
  }

  .rts-empty__icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    color: var(--rts-ink-muted);
    opacity: 0.5;
  }

  .rts-empty__icon svg {
    width: 100%;
    height: 100%;
  }

  .rts-empty__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--rts-ink);
    margin: 0 0 8px;
  }

  .rts-empty__desc {
    font-size: 0.9375rem;
    color: var(--rts-ink-muted);
    margin: 0;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* ========================================
     Template Detail View (Read-Only)
     ======================================== */

  .rtd-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Selected Header */
  .rtd-selected-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--rts-teal-light);
    border: 2px solid var(--rts-teal);
    border-radius: 12px;
  }

  .rtd-selected-header__info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .rtd-selected-header__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--rts-teal);
  }

  .rtd-selected-header__badge svg {
    width: 18px;
    height: 18px;
  }

  .rtd-selected-header__change {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-family: var(--rts-font);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--rts-teal);
    background: white;
    border: 1.5px solid var(--rts-teal);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .rtd-selected-header__change:hover {
    background: var(--rts-teal);
    color: white;
  }

  .rtd-selected-header__change svg {
    width: 16px;
    height: 16px;
  }

  /* Hero Section */
  .rtd-hero {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 24px;
    background: var(--rts-surface);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04), 0 4px 16px rgba(26, 31, 54, 0.06);
  }

  .rtd-hero__thumbnail-area {
    position: relative;
  }

  .rtd-hero__thumbnail {
    width: 180px;
    height: 135px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--rts-border-light) 0%, var(--rts-border) 100%);
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
  }

  .rtd-hero__thumbnail-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rts-ink-muted);
  }

  .rtd-hero__thumbnail-placeholder svg {
    width: 40px;
    height: 40px;
    opacity: 0.5;
  }

  .rtd-hero__status {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 100px;
    backdrop-filter: blur(8px);
  }

  .rtd-hero__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .rtd-hero__identity {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rtd-hero__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--rts-ink);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .rtd-hero__audiences {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .rtd-hero__audience-tag {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: 100px;
    background: var(--rts-teal-light);
    border: 1px solid rgba(20, 184, 166, 0.2);
    color: var(--rts-teal);
  }

  .rtd-hero__summary {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--rts-ink-light);
    margin: 0;
  }

  /* Cards */
  .rtd-card {
    background: var(--rts-surface);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04), 0 4px 16px rgba(26, 31, 54, 0.06);
  }

  .rtd-card__header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }

  .rtd-card__header--with-progress {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .rtd-card__header-left {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  /* Goal-Gradient Progress Bar for Facet Selection */
  .rtd-facet-progress {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    min-width: 140px;
  }

  .rtd-facet-progress__bar {
    width: 100%;
    height: 6px;
    background: var(--rts-border-light);
    border-radius: 100px;
    overflow: hidden;
  }

  .rtd-facet-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--rts-sky), var(--rts-emerald));
    border-radius: 100px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .rtd-facet-progress__text {
    font-size: 0.6875rem;
    color: var(--rts-ink-muted);
    font-weight: 500;
  }

  .rtd-facet-progress__complete {
    color: var(--rts-emerald);
    font-weight: 600;
  }

  .rtd-card__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rtd-card__icon svg {
    width: 20px;
    height: 20px;
  }

  .rtd-card__icon--violet {
    background: var(--rts-violet-light);
    color: var(--rts-violet);
  }

  .rtd-card__icon--emerald {
    background: var(--rts-emerald-light);
    color: var(--rts-emerald);
  }

  .rtd-card__icon--amber {
    background: var(--rts-amber-light);
    color: var(--rts-amber);
  }

  .rtd-card__icon--sky {
    background: var(--rts-sky-light);
    color: var(--rts-sky);
  }

  .rtd-card__icon--teal {
    background: var(--rts-teal-light);
    color: var(--rts-teal);
  }

  .rtd-card__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--rts-ink);
    margin: 0;
  }

  .rtd-card__subtitle {
    font-size: 0.8125rem;
    color: var(--rts-ink-muted);
    margin: 2px 0 0;
  }

  .rtd-card__text {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--rts-ink-light);
    margin: 0;
  }

  .rtd-card__empty {
    font-size: 0.875rem;
    color: var(--rts-ink-muted);
    font-style: italic;
    margin: 0;
  }

  .rtd-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* Services */
  .rtd-services {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rtd-service {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--rts-surface-raised);
    border-radius: 8px;
  }

  .rtd-service__bullet {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--rts-emerald);
    flex-shrink: 0;
  }

  .rtd-service__bullet--recurring {
    background: var(--rts-amber);
  }

  .rtd-service__text {
    font-size: 0.875rem;
    color: var(--rts-ink);
  }

  /* Facets */
  .rtd-facets {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .rtd-facet {
    padding: 14px;
    background: var(--rts-surface-raised);
    border-radius: 10px;
    border: 1px solid var(--rts-border-light);
  }

  .rtd-facet__label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--rts-ink-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
  }

  .rtd-facet__options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .rtd-facet__option {
    display: inline-block;
    padding: 4px 10px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--rts-sky);
    background: var(--rts-sky-light);
    border-radius: 6px;
    text-transform: capitalize;
  }

  /* Interactive facet options */
  .rtd-facet--selectable {
    background: var(--rts-surface);
    border: 1.5px solid var(--rts-border);
  }

  .rtd-facet__option--toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-family: var(--rts-font);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--rts-ink-light);
    background: var(--rts-surface-raised);
    border: 1.5px solid var(--rts-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-transform: capitalize;
  }

  .rtd-facet__option--toggle:hover {
    border-color: var(--rts-sky);
    background: var(--rts-sky-light);
    color: var(--rts-sky);
  }

  .rtd-facet__option--toggle.rtd-facet__option--selected {
    background: var(--rts-teal-light);
    border-color: var(--rts-teal);
    color: var(--rts-teal);
  }

  .rtd-facet__checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    background: var(--rts-surface);
    border: 1.5px solid var(--rts-border);
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .rtd-facet__option--toggle:hover .rtd-facet__checkbox {
    border-color: var(--rts-sky);
  }

  .rtd-facet__option--selected .rtd-facet__checkbox {
    background: var(--rts-teal);
    border-color: var(--rts-teal);
  }

  .rtd-facet__checkbox svg {
    width: 12px;
    height: 12px;
    color: white;
  }

  /* Services List */
  .rtd-services-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rtd-service-item {
    padding: 14px 16px;
    background: var(--rts-surface-raised);
    border-radius: 10px;
    border: 1px solid var(--rts-border-light);
  }

  .rtd-service-item__main {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .rtd-service-item__title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--rts-ink);
  }

  .rtd-service-item__badge {
    padding: 2px 8px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--rts-emerald);
    background: var(--rts-emerald-light);
    border-radius: 4px;
  }

  .rtd-service-item__desc {
    font-size: 0.8125rem;
    color: var(--rts-ink-light);
    margin: 6px 0 0;
    line-height: 1.5;
  }

  /* Metadata */
  .rtd-metadata {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 20px;
    background: var(--rts-surface);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(26, 31, 54, 0.04);
  }

  .rtd-meta-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rtd-meta-field__label {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--rts-ink-muted);
  }

  .rtd-meta-field__value {
    font-size: 0.9375rem;
    color: var(--rts-ink);
  }

  .rtd-meta-field__value--mono {
    font-family: var(--rts-mono);
    font-size: 0.875rem;
  }

  .rtd-meta-field__link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    color: var(--rts-teal);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .rtd-meta-field__link:hover {
    color: #0d9488;
  }

  .rtd-meta-field__link svg {
    width: 14px;
    height: 14px;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .rtd-hero {
      grid-template-columns: 1fr;
    }

    .rtd-hero__thumbnail-area {
      order: -1;
    }

    .rtd-hero__thumbnail {
      width: 100%;
      height: 160px;
    }

    .rtd-grid {
      grid-template-columns: 1fr;
    }

    .rtd-facets {
      grid-template-columns: 1fr;
    }

    .rtd-metadata {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .rts-header {
      flex-direction: column;
    }

    .rts-grid {
      grid-template-columns: 1fr;
    }
  }
`;
