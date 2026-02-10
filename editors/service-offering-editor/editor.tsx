import { useState } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedServiceOfferingDocument } from "../../document-models/service-offering/hooks.js";
import { OfferingProgress } from "./components/OfferingProgress.js";
import type { TabId } from "./components/TabNavigation.js";
import { ResourceTemplateSelector } from "./components/ResourceTemplateSelector.js";
import { ServiceCatalog } from "./components/ServiceCatalog.js";
import { TierDefinition } from "./components/TierDefinition.js";
import { TheMatrix } from "./components/TheMatrix.js";

export default function ServiceOfferingEditor() {
  const [document, dispatch] = useSelectedServiceOfferingDocument();
  const [activeTab, setActiveTab] = useState<TabId>("scope-facets");

  if (!document) {
    return (
      <div className="so-editor">
        <style>{editorStyles}</style>
        <div className="so-empty-state">
          <div className="so-empty-state__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="so-empty-state__title">
            No service offering selected
          </h2>
          <p className="so-empty-state__subtitle">
            Select a document to start editing
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "scope-facets":
        return (
          <ResourceTemplateSelector document={document} dispatch={dispatch} />
        );
      case "service-catalog":
        return <ServiceCatalog document={document} dispatch={dispatch} />;
      case "tier-definition":
        return <TierDefinition document={document} dispatch={dispatch} />;
      case "the-matrix":
        return <TheMatrix document={document} dispatch={dispatch} />;
      default:
        return null;
    }
  };

  return (
    <div className="so-editor">
      <style>{editorStyles}</style>
      <DocumentToolbar />
      <div className="so-editor__container">
        {/* Global Progress Component - Goal-Gradient Effect */}
        {/* Global Progress Component - Goal-Gradient Effect with integrated navigation */}
        <OfferingProgress
          document={document}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="so-editor__content">{renderTabContent()}</div>
      </div>
    </div>
  );
}

const editorStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  .so-editor {
    --so-font-sans: 'DM Sans', system-ui, sans-serif;
    --so-font-mono: 'DM Mono', 'SF Mono', monospace;

    --so-slate-50: #f8fafc;
    --so-slate-100: #f1f5f9;
    --so-slate-200: #e2e8f0;
    --so-slate-300: #cbd5e1;
    --so-slate-400: #94a3b8;
    --so-slate-500: #64748b;
    --so-slate-600: #475569;
    --so-slate-700: #334155;
    --so-slate-800: #1e293b;
    --so-slate-900: #0f172a;

    --so-amber-50: #fffbeb;
    --so-amber-100: #fef3c7;
    --so-amber-200: #fde68a;
    --so-amber-500: #f59e0b;
    --so-amber-600: #d97706;
    --so-amber-700: #b45309;

    --so-emerald-50: #ecfdf5;
    --so-emerald-100: #d1fae5;
    --so-emerald-500: #10b981;
    --so-emerald-600: #059669;
    --so-emerald-700: #047857;

    --so-violet-50: #f5f3ff;
    --so-violet-100: #ede9fe;
    --so-violet-200: #ddd6fe;
    --so-violet-500: #8b5cf6;
    --so-violet-600: #7c3aed;
    --so-violet-700: #6d28d9;

    --so-rose-50: #fff1f2;
    --so-rose-100: #ffe4e6;
    --so-rose-500: #f43f5e;
    --so-rose-600: #e11d48;

    --so-sky-50: #f0f9ff;
    --so-sky-100: #e0f2fe;
    --so-sky-500: #0ea5e9;
    --so-sky-600: #0284c7;

    --so-radius-sm: 6px;
    --so-radius-md: 10px;
    --so-radius-lg: 14px;
    --so-radius-xl: 20px;

    --so-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
    --so-shadow-md: 0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04);
    --so-shadow-lg: 0 10px 40px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04);
    --so-shadow-xl: 0 20px 60px rgba(15, 23, 42, 0.12), 0 4px 16px rgba(15, 23, 42, 0.06);

    --so-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --so-transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --so-transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

    font-family: var(--so-font-sans);
    background: linear-gradient(135deg, var(--so-slate-100) 0%, var(--so-slate-50) 50%, #f0f4f8 100%);
    min-height: 100%;
    overflow-y: auto;
  }

  .so-editor__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px 48px;
  }

  .so-editor__content {
    min-height: 500px;
    animation: so-fade-in var(--so-transition-slow) ease-out;
  }

  @keyframes so-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes so-scale-in {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }

  .so-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 48px;
  }

  .so-empty-state__icon {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
    color: var(--so-slate-300);
    animation: so-float 3s ease-in-out infinite;
  }

  .so-empty-state__icon svg {
    width: 100%;
    height: 100%;
  }

  @keyframes so-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .so-empty-state__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--so-slate-700);
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .so-empty-state__subtitle {
    font-size: 1rem;
    color: var(--so-slate-500);
    margin: 0;
  }

  /* Shared component styles */
  .so-card {
    background: white;
    border-radius: var(--so-radius-lg);
    box-shadow: var(--so-shadow-md);
    border: 1px solid var(--so-slate-100);
    transition: box-shadow var(--so-transition-base), transform var(--so-transition-base);
  }

  .so-card:hover {
    box-shadow: var(--so-shadow-lg);
  }

  .so-card--interactive:hover {
    transform: translateY(-2px);
  }

  .so-section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--so-slate-800);
    letter-spacing: -0.02em;
    margin: 0 0 20px;
  }

  .so-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--so-slate-500);
    margin-bottom: 8px;
  }

  .so-input {
    width: 100%;
    padding: 12px 16px;
    font-family: var(--so-font-sans);
    font-size: 0.9375rem;
    color: var(--so-slate-800);
    background: var(--so-slate-50);
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    transition: all var(--so-transition-fast);
  }

  .so-input:hover {
    border-color: var(--so-slate-300);
    background: white;
  }

  .so-input:focus {
    outline: none;
    border-color: var(--so-violet-500);
    background: white;
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  .so-input::placeholder {
    color: var(--so-slate-400);
  }

  .so-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--so-radius-md);
    border: none;
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .so-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .so-btn--primary {
    background: linear-gradient(135deg, var(--so-violet-600) 0%, var(--so-violet-700) 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
  }

  .so-btn--primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
  }

  .so-btn--primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .so-btn--secondary {
    background: var(--so-slate-100);
    color: var(--so-slate-700);
  }

  .so-btn--secondary:hover:not(:disabled) {
    background: var(--so-slate-200);
  }

  .so-btn--ghost {
    background: transparent;
    color: var(--so-slate-600);
  }

  .so-btn--ghost:hover:not(:disabled) {
    background: var(--so-slate-100);
  }

  .so-btn--danger {
    background: var(--so-rose-50);
    color: var(--so-rose-600);
  }

  .so-btn--danger:hover:not(:disabled) {
    background: var(--so-rose-100);
  }

  .so-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 100px;
  }

  .so-badge--amber {
    background: var(--so-amber-100);
    color: var(--so-amber-700);
  }

  .so-badge--emerald {
    background: var(--so-emerald-100);
    color: var(--so-emerald-700);
  }

  .so-badge--violet {
    background: var(--so-violet-100);
    color: var(--so-violet-700);
  }

  .so-badge--sky {
    background: var(--so-sky-100);
    color: var(--so-sky-600);
  }

  .so-badge--slate {
    background: var(--so-slate-100);
    color: var(--so-slate-600);
  }

  .so-mono {
    font-family: var(--so-font-mono);
  }
`;
