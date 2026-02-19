import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  WorkBreakdownAction,
  WorkBreakdownDocument,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  addTemplate,
  removeTemplate,
  setTemplateMode,
  applyTemplate,
} from "../../../document-models/work-breakdown/gen/creators.js";
import type {
  TemplateMode,
  DemoTemplate,
  TemplateStep,
} from "../../../document-models/work-breakdown/gen/schema/types.js";

interface Props {
  document: WorkBreakdownDocument;
  dispatch: DocumentDispatch<WorkBreakdownAction>;
}

const TEMPLATE_MODES: TemplateMode[] = [
  "NONE",
  "PRE_SELECTED",
  "AUTO_DETECTED",
];

function formatMode(mode: TemplateMode): string {
  return mode.replace(/_/g, " ");
}

// Built-in templates from WBD spec
const BUILT_IN_TEMPLATES = [
  {
    name: "New Document Model",
    description:
      "Create a new Powerhouse document model with GraphQL schema and operations",
    domain: "Powervetra Engineering",
    steps: [
      {
        order: 1,
        name: "Requirements Gathering",
        description: "Elicit stakeholder needs, define domain entities",
        substeps: [],
      },
      {
        order: 2,
        name: "Schema Design",
        description: "Define GraphQL state types, scalars, enums",
        substeps: [],
      },
      {
        order: 3,
        name: "Module & Operation Planning",
        description: "Group operations into modules, define inputs",
        substeps: [],
      },
      {
        order: 4,
        name: "MCP Implementation",
        description: "Create document model via reactor-mcp, set schemas",
        substeps: [],
      },
      {
        order: 5,
        name: "Reducer Implementation",
        description: "Write pure synchronous reducer logic",
        substeps: [],
      },
      {
        order: 6,
        name: "Error Handling",
        description: "Define operation errors, edge cases",
        substeps: [],
      },
      {
        order: 7,
        name: "Quality Assurance",
        description: "TypeScript checks, linting, testing",
        substeps: [],
      },
    ],
  },
  {
    name: "Editor Build",
    description: "Build a React-based editor for a Powerhouse document model",
    domain: "Powervetra Engineering",
    steps: [
      {
        order: 1,
        name: "Model Review",
        description: "Understand document model state and operations",
        substeps: [],
      },
      {
        order: 2,
        name: "Editor Scaffolding",
        description: "Create editor document, confirm via MCP",
        substeps: [],
      },
      {
        order: 3,
        name: "Hook Integration",
        description: "Wire useSelectedDocument and dispatch hooks",
        substeps: [],
      },
      {
        order: 4,
        name: "Component Architecture",
        description: "Design modular UI components",
        substeps: [],
      },
      {
        order: 5,
        name: "Form & Interaction Logic",
        description: "Implement CRUD flows, validation",
        substeps: [],
      },
      {
        order: 6,
        name: "Styling & Polish",
        description: "Tailwind/scoped styles, responsive layout",
        substeps: [],
      },
      {
        order: 7,
        name: "Testing & Review",
        description: "Visual review, type checking, lint",
        substeps: [],
      },
    ],
  },
  {
    name: "Full-Stack Feature",
    description:
      "End-to-end feature including document model, editor, and subgraph",
    domain: "Powervetra Engineering",
    steps: [
      {
        order: 1,
        name: "Feature Scoping",
        description: "Define feature boundaries and acceptance criteria",
        substeps: [],
      },
      {
        order: 2,
        name: "Document Model Creation",
        description: "Schema, modules, operations, reducers",
        substeps: [],
      },
      {
        order: 3,
        name: "Editor Implementation",
        description: "UI components with hooks and dispatch",
        substeps: [],
      },
      {
        order: 4,
        name: "Subgraph/Processor Setup",
        description: "Data views, relational DB hooks if needed",
        substeps: [],
      },
      {
        order: 5,
        name: "Integration Testing",
        description: "End-to-end flow verification",
        substeps: [],
      },
      {
        order: 6,
        name: "Drive & Preview Setup",
        description: "Populate preview drive with demo data",
        substeps: [],
      },
      {
        order: 7,
        name: "Deployment Prep",
        description: "Build, publish, manifest verification",
        substeps: [],
      },
    ],
  },
  {
    name: "Subgraph Integration",
    description: "Integrate a new subgraph for data queries and processing",
    domain: "Powervetra Engineering",
    steps: [
      {
        order: 1,
        name: "Data Requirements",
        description: "Identify query patterns and data sources",
        substeps: [],
      },
      {
        order: 2,
        name: "Schema Definition",
        description: "GraphQL types, queries, mutations",
        substeps: [],
      },
      {
        order: 3,
        name: "Resolver Implementation",
        description: "Data fetching and transformation logic",
        substeps: [],
      },
      {
        order: 4,
        name: "Processor Setup",
        description: "Event-driven data transformation if needed",
        substeps: [],
      },
      {
        order: 5,
        name: "Gateway Integration",
        description: "Supergraph stitching, routing verification",
        substeps: [],
      },
      {
        order: 6,
        name: "Database Hooks",
        description: "PGlite/Kysely relational views",
        substeps: [],
      },
      {
        order: 7,
        name: "Validation & Monitoring",
        description: "Query testing, performance verification",
        substeps: [],
      },
    ],
  },
  {
    name: "Drive App",
    description: "Build a drive-level application for managing documents",
    domain: "Powervetra Engineering",
    steps: [
      {
        order: 1,
        name: "App Requirements",
        description: "Define app scope, target document types",
        substeps: [],
      },
      {
        order: 2,
        name: "Document Model Dependencies",
        description: "Verify/create needed document models",
        substeps: [],
      },
      {
        order: 3,
        name: "App Scaffolding",
        description: "Create app document, confirm via MCP",
        substeps: [],
      },
      {
        order: 4,
        name: "Multi-Document UI",
        description: "Implement drive-level views and navigation",
        substeps: [],
      },
      {
        order: 5,
        name: "Cross-Document Operations",
        description: "Link documents, aggregate data",
        substeps: [],
      },
      {
        order: 6,
        name: "User Experience Polish",
        description: "Responsive design, accessibility",
        substeps: [],
      },
      {
        order: 7,
        name: "Build & Publish",
        description: "Package verification, npm publish",
        substeps: [],
      },
    ],
  },
];

export function TemplateManager({ document, dispatch }: Props) {
  const state = document.state.global;
  const templates: DemoTemplate[] = state.templates;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", domain: "" });

  const hasSteps = state.steps.length > 0;

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleModeChange(mode: TemplateMode) {
    dispatch(setTemplateMode({ mode }));
  }

  function handleApply(templateId: string) {
    dispatch(
      applyTemplate({ templateId, timestamp: new Date().toISOString() }),
    );
  }

  function handleRemove(id: string) {
    dispatch(removeTemplate({ id }));
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    dispatch(
      addTemplate({
        id: generateId(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        domain: form.domain.trim() || undefined,
        steps: [],
        createdAt: new Date().toISOString(),
      }),
    );
    setForm({ name: "", description: "", domain: "" });
    setShowAddForm(false);
  }

  function handleCancelAdd() {
    setForm({ name: "", description: "", domain: "" });
    setShowAddForm(false);
  }

  function handleLoadBuiltInTemplates() {
    const timestamp = new Date().toISOString();
    BUILT_IN_TEMPLATES.forEach((template) => {
      // Check if template with same name already exists
      const exists = templates.some((t) => t.name === template.name);
      if (exists) return;

      dispatch(
        addTemplate({
          id: generateId(),
          name: template.name,
          description: template.description,
          domain: template.domain,
          steps: template.steps.map((step) => ({
            id: generateId(),
            order: step.order,
            name: step.name,
            description: step.description,
            substeps: step.substeps,
          })),
          createdAt: timestamp,
        }),
      );
    });
  }

  function renderStepList(steps: TemplateStep[]) {
    const sorted = [...steps].sort((a, b) => a.order - b.order);
    return (
      <div style={{ marginTop: 8 }}>
        {sorted.map((step) => (
          <div
            key={step.id}
            style={{
              padding: "8px 12px",
              borderLeft: "2px solid var(--wb-indigo-200)",
              marginLeft: 4,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--wb-text)",
              }}
            >
              {step.order}. {step.name}
            </div>
            {step.description ? (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--wb-text-secondary)",
                  marginTop: 2,
                }}
              >
                {step.description}
              </div>
            ) : null}
            {step.substeps.length > 0 ? (
              <div style={{ marginTop: 6, paddingLeft: 12 }}>
                {[...step.substeps]
                  .sort((a, b) => a.order - b.order)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        fontSize: 12,
                        color: "var(--wb-text-secondary)",
                        padding: "3px 0",
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--wb-text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        {step.order}.{sub.order}
                      </span>
                      <span>{sub.name}</span>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Template Mode Selector */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <h2 className="wb-panel__title">Template Mode</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {TEMPLATE_MODES.map((mode) => {
            const isActive =
              state.templateMode === mode ||
              (mode === "NONE" && !state.templateMode);
            return (
              <button
                key={mode}
                className={`wb-btn wb-btn--sm ${isActive ? "wb-btn--primary" : ""}`}
                onClick={() => handleModeChange(mode)}
                type="button"
              >
                {formatMode(mode)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Library */}
      <div className="wb-panel">
        <div className="wb-panel__header">
          <div>
            <h2 className="wb-panel__title">Template Library</h2>
            <p className="wb-panel__subtitle">
              {templates.length} template{templates.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="wb-btn wb-btn--sm"
              onClick={handleLoadBuiltInTemplates}
              type="button"
              title="Load 5 built-in Powervetra templates"
            >
              Load Built-in Templates
            </button>
            <button
              className="wb-btn wb-btn--primary wb-btn--sm"
              onClick={() => {
                setForm({ name: "", description: "", domain: "" });
                setShowAddForm(!showAddForm);
              }}
              type="button"
            >
              {showAddForm ? "Cancel" : "Add Template"}
            </button>
          </div>
        </div>

        {/* Add Template Form */}
        {showAddForm ? (
          <div
            className="wb-card"
            style={{
              marginBottom: 16,
              background: "var(--wb-surface-alt)",
            }}
          >
            <div className="wb-card__header">
              <h3 className="wb-card__title">New Template</h3>
            </div>
            <div className="wb-card__body">
              <div style={{ marginBottom: 10 }}>
                <label className="wb-label" htmlFor="wb-tmpl-name">
                  Name *
                </label>
                <input
                  id="wb-tmpl-name"
                  className="wb-input"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Template name"
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label className="wb-label" htmlFor="wb-tmpl-description">
                  Description
                </label>
                <textarea
                  id="wb-tmpl-description"
                  className="wb-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="What this template covers..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="wb-label" htmlFor="wb-tmpl-domain">
                  Domain
                </label>
                <input
                  id="wb-tmpl-domain"
                  className="wb-input"
                  type="text"
                  value={form.domain}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, domain: e.target.value }))
                  }
                  placeholder="e.g. Engineering, Finance, Marketing"
                />
              </div>
              <div className="wb-card__actions">
                <button
                  className="wb-btn wb-btn--primary wb-btn--sm"
                  onClick={handleAdd}
                  type="button"
                  disabled={!form.name.trim()}
                >
                  Add Template
                </button>
                <button
                  className="wb-btn wb-btn--sm"
                  onClick={handleCancelAdd}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Template Cards */}
        {templates.length === 0 ? (
          <div className="wb-panel-empty">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ width: 40, height: 40, opacity: 0.5 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            <p className="wb-panel-empty__text">
              No templates yet. Add one to get started.
            </p>
          </div>
        ) : (
          <div>
            {templates.map((template) => {
              const isApplied = state.appliedTemplateId === template.id;
              const isExpanded = expandedIds.has(template.id);
              const canApply = !hasSteps && !isApplied;

              return (
                <div
                  key={template.id}
                  className="wb-card"
                  style={
                    isApplied
                      ? {
                          borderColor: "var(--wb-indigo-200)",
                          background: "var(--wb-indigo-50)",
                        }
                      : undefined
                  }
                >
                  <div className="wb-card__header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <h3 className="wb-card__title">{template.name}</h3>
                      {isApplied ? (
                        <span className="wb-status wb-status--in_progress">
                          APPLIED
                        </span>
                      ) : null}
                    </div>
                    <div className="wb-card__meta">
                      {template.steps.length} step
                      {template.steps.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="wb-card__body">
                    {template.description ? (
                      <p style={{ margin: "0 0 6px" }}>
                        {template.description}
                      </p>
                    ) : null}
                    {template.domain ? (
                      <span
                        className="wb-status"
                        style={{
                          background: "var(--wb-amber-50)",
                          color: "var(--wb-amber-700)",
                        }}
                      >
                        {template.domain}
                      </span>
                    ) : null}
                  </div>

                  {/* Expanded steps */}
                  {isExpanded && template.steps.length > 0
                    ? renderStepList(template.steps)
                    : null}

                  <div className="wb-card__actions">
                    {template.steps.length > 0 ? (
                      <button
                        className="wb-btn wb-btn--ghost wb-btn--sm"
                        onClick={() => toggleExpand(template.id)}
                        type="button"
                      >
                        {isExpanded ? "Collapse" : "Expand Steps"}
                      </button>
                    ) : null}
                    <button
                      className="wb-btn wb-btn--primary wb-btn--sm"
                      onClick={() => handleApply(template.id)}
                      type="button"
                      disabled={!canApply}
                      title={
                        isApplied
                          ? "This template is already applied"
                          : hasSteps
                            ? "Cannot apply a template when steps already exist"
                            : "Apply this template"
                      }
                    >
                      Apply
                    </button>
                    <button
                      className="wb-btn wb-btn--danger wb-btn--sm"
                      onClick={() => handleRemove(template.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
