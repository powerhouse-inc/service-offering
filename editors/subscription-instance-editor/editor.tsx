import { useState } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedSubscriptionInstanceDocument } from "../../document-models/subscription-instance/hooks.js";
import type { ViewMode } from "./types.js";
import { ModeToggle } from "./components/ModeToggle.js";
import { MockDataButton } from "./components/MockDataButton.js";
import { ImportServiceConfigButton } from "./components/ImportServiceConfigButton.js";
import { SubscriptionHeader } from "./components/SubscriptionHeader.js";
import { ServicesPanel } from "./components/ServicesPanel.js";
import { BillingPanel } from "./components/BillingPanel.js";
import { CustomerInfo } from "./components/CustomerInfo.js";
import { OperatorNotes } from "./components/OperatorNotes.js";
import { OptionGroupsPanel } from "./components/OptionGroupsPanel.js";
import { FacetSelectionsPanel } from "./components/FacetSelectionsPanel.js";
import { PendingRequestsPanel } from "./components/PendingRequestsPanel.js";

export default function SubscriptionInstanceEditor() {
  const [document, dispatch] = useSelectedSubscriptionInstanceDocument();
  const [mode, setMode] = useState<ViewMode>("client");

  if (!document) {
    return (
      <div className="si-editor">
        <style>{editorStyles}</style>
        <div className="si-empty-state">
          <div className="si-empty-state__icon">
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
          <h2 className="si-empty-state__title">No subscription selected</h2>
          <p className="si-empty-state__subtitle">
            Select a subscription instance to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="si-editor" data-mode={mode}>
      <style>{editorStyles}</style>
      <DocumentToolbar />

      <div className="si-editor__container">
        {/* Mode Toggle & Actions */}
        <div className="si-editor__header">
          {mode === "operator" && (
            <>
              <ImportServiceConfigButton
                document={document}
                dispatch={dispatch}
              />
              <MockDataButton document={document} dispatch={dispatch} />
            </>
          )}
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>

        {/* Subscription Header */}
        <SubscriptionHeader
          document={document}
          dispatch={dispatch}
          mode={mode}
        />

        {/* Billing Projection - Top Section */}
        <div style={{ marginTop: 24 }}>
          <BillingPanel document={document} dispatch={dispatch} mode={mode} />
        </div>

        {/* Main Content Grid */}
        <div className="si-editor__grid">
          {/* Left Column - Services */}
          <div className="si-editor__main">
            <ServicesPanel
              document={document}
              dispatch={dispatch}
              mode={mode}
            />
            <OptionGroupsPanel
              document={document}
              dispatch={dispatch}
              mode={mode}
            />
          </div>

          {/* Right Column - Info & Notes */}
          <div className="si-editor__sidebar">
            <PendingRequestsPanel
              document={document}
              dispatch={dispatch}
              mode={mode}
            />
            <CustomerInfo document={document} dispatch={dispatch} mode={mode} />
            <FacetSelectionsPanel document={document} mode={mode} />
            {mode === "operator" && (
              <OperatorNotes document={document} dispatch={dispatch} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const editorStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .si-editor {
    --si-font-sans: 'Inter', system-ui, sans-serif;
    --si-font-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;

    /* Colors */
    --si-slate-50: #f8fafc;
    --si-slate-100: #f1f5f9;
    --si-slate-200: #e2e8f0;
    --si-slate-300: #cbd5e1;
    --si-slate-400: #94a3b8;
    --si-slate-500: #64748b;
    --si-slate-600: #475569;
    --si-slate-700: #334155;
    --si-slate-800: #1e293b;
    --si-slate-900: #0f172a;

    --si-emerald-50: #ecfdf5;
    --si-emerald-100: #d1fae5;
    --si-emerald-500: #10b981;
    --si-emerald-600: #059669;
    --si-emerald-700: #047857;

    --si-amber-50: #fffbeb;
    --si-amber-100: #fef3c7;
    --si-amber-500: #f59e0b;
    --si-amber-600: #d97706;
    --si-amber-700: #b45309;

    --si-orange-50: #fff7ed;
    --si-orange-100: #ffedd5;
    --si-orange-500: #f97316;
    --si-orange-600: #ea580c;

    --si-rose-50: #fff1f2;
    --si-rose-100: #ffe4e6;
    --si-rose-500: #f43f5e;
    --si-rose-600: #e11d48;
    --si-rose-700: #be123c;

    --si-violet-50: #f5f3ff;
    --si-violet-100: #ede9fe;
    --si-violet-500: #8b5cf6;
    --si-violet-600: #7c3aed;
    --si-violet-700: #6d28d9;

    --si-sky-50: #f0f9ff;
    --si-sky-100: #e0f2fe;
    --si-sky-500: #0ea5e9;
    --si-sky-600: #0284c7;

    /* Spacing */
    --si-radius-sm: 6px;
    --si-radius-md: 8px;
    --si-radius-lg: 12px;

    /* Shadows */
    --si-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --si-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
    --si-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);

    /* Transitions */
    --si-transition-fast: 150ms ease;
    --si-transition-base: 200ms ease;

    font-family: var(--si-font-sans);
    background: var(--si-slate-50);
    min-height: 100%;
    overflow-y: auto;
  }

  .si-editor__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px 48px;
  }

  .si-editor__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .si-editor__grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
    margin-top: 24px;
  }

  @media (max-width: 1024px) {
    .si-editor__grid {
      grid-template-columns: 1fr;
    }
  }

  .si-editor__main {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .si-editor__sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Empty State */
  .si-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 48px;
  }

  .si-empty-state__icon {
    width: 64px;
    height: 64px;
    color: var(--si-slate-300);
    margin-bottom: 16px;
  }

  .si-empty-state__icon svg {
    width: 100%;
    height: 100%;
  }

  .si-empty-state__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--si-slate-700);
    margin: 0 0 8px;
  }

  .si-empty-state__subtitle {
    font-size: 0.875rem;
    color: var(--si-slate-500);
    margin: 0;
  }

  /* Mode Toggle */
  .si-mode-toggle {
    display: inline-flex;
    background: var(--si-slate-100);
    border-radius: var(--si-radius-lg);
    padding: 4px;
    gap: 4px;
  }

  .si-mode-toggle__btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-family: var(--si-font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-slate-600);
    background: transparent;
    border: none;
    border-radius: var(--si-radius-md);
    cursor: pointer;
    transition: all var(--si-transition-fast);
  }

  .si-mode-toggle__btn:hover {
    color: var(--si-slate-800);
  }

  .si-mode-toggle__btn--active {
    background: white;
    color: var(--si-slate-900);
    box-shadow: var(--si-shadow-sm);
  }

  .si-mode-toggle__icon {
    width: 18px;
    height: 18px;
  }

  /* Header */
  .si-header {
    background: white;
    border-radius: var(--si-radius-lg);
    padding: 24px;
    box-shadow: var(--si-shadow-sm);
    border: 1px solid var(--si-slate-200);
  }

  .si-header__main {
    margin-bottom: 20px;
  }

  .si-header__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .si-header__info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .si-header__thumbnail {
    width: 48px;
    height: 48px;
    border-radius: var(--si-radius-md);
    object-fit: cover;
  }

  .si-header__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--si-slate-900);
    margin: 0;
  }

  .si-header__subtitle {
    font-size: 0.875rem;
    color: var(--si-slate-500);
    margin: 4px 0 0;
  }

  .si-header__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  .si-header__meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .si-header__meta-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--si-slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .si-header__meta-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-slate-800);
  }

  .si-header__stats {
    display: flex;
    gap: 32px;
    padding-top: 20px;
    border-top: 1px solid var(--si-slate-100);
  }

  .si-header__stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .si-header__stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--si-slate-900);
  }

  .si-header__stat-label {
    font-size: 0.75rem;
    color: var(--si-slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Badges */
  .si-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .si-badge--sm {
    padding: 2px 8px;
    font-size: 0.6875rem;
  }

  .si-badge--emerald {
    background: var(--si-emerald-100);
    color: var(--si-emerald-700);
  }

  .si-badge--amber {
    background: var(--si-amber-100);
    color: var(--si-amber-700);
  }

  .si-badge--orange {
    background: var(--si-orange-100);
    color: var(--si-orange-600);
  }

  .si-badge--rose {
    background: var(--si-rose-100);
    color: var(--si-rose-700);
  }

  .si-badge--violet {
    background: var(--si-violet-100);
    color: var(--si-violet-700);
  }

  .si-badge--sky {
    background: var(--si-sky-100);
    color: var(--si-sky-600);
  }

  .si-badge--slate {
    background: var(--si-slate-100);
    color: var(--si-slate-600);
  }

  /* Panel */
  .si-panel {
    background: white;
    border-radius: var(--si-radius-lg);
    padding: 24px;
    box-shadow: var(--si-shadow-sm);
    border: 1px solid var(--si-slate-200);
  }

  .si-panel--compact {
    padding: 20px;
  }

  .si-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .si-panel__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--si-slate-900);
    margin: 0;
  }

  .si-panel__count {
    font-size: 0.875rem;
    color: var(--si-slate-500);
  }

  /* Empty State within panel */
  .si-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px;
    text-align: center;
  }

  .si-empty__icon {
    width: 48px;
    height: 48px;
    color: var(--si-slate-300);
    margin-bottom: 12px;
  }

  .si-empty__text {
    font-size: 0.875rem;
    color: var(--si-slate-500);
    margin: 0;
  }

  /* Services Grid */
  .si-services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .si-service-card {
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    padding: 16px;
    border: 1px solid var(--si-slate-200);
  }

  .si-service-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .si-service-card__name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--si-slate-800);
    margin: 0;
  }

  .si-service-card__price {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-emerald-600);
    white-space: nowrap;
  }

  .si-service-card__desc {
    font-size: 0.8125rem;
    color: var(--si-slate-600);
    margin: 0 0 12px;
    line-height: 1.5;
  }

  .si-service-card__setup {
    display: flex;
    justify-content: space-between;
    font-size: 0.8125rem;
    padding: 8px 0;
    border-top: 1px solid var(--si-slate-200);
    margin-top: 8px;
  }

  .si-service-card__setup-label {
    color: var(--si-slate-500);
  }

  .si-service-card__setup-value {
    color: var(--si-slate-700);
    font-weight: 500;
  }

  .si-service-card__paid {
    color: var(--si-emerald-600);
  }

  .si-service-card__pending {
    color: var(--si-amber-600);
  }

  .si-service-card__metrics {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .si-service-card__billing {
    font-size: 0.75rem;
    color: var(--si-slate-500);
    margin: 12px 0 0;
  }

  /* Service Group */
  .si-service-group {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--si-slate-200);
  }

  .si-service-group:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  .si-service-group__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .si-service-group__name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-slate-700);
    margin: 0;
  }

  /* Metrics / Usage */
  .si-metric {
    padding: 8px;
    background: white;
    border-radius: var(--si-radius-sm);
    border: 1px solid var(--si-slate-200);
  }

  .si-metric__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .si-metric__name {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--si-slate-700);
  }

  .si-metric__value {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-metric__unit {
    font-weight: 400;
    color: var(--si-slate-500);
  }

  .si-metric__reset {
    font-size: 0.6875rem;
    color: var(--si-slate-500);
    margin: 6px 0 0;
  }

  /* Usage Bar */
  .si-usage-bar {
    height: 6px;
    background: var(--si-slate-200);
    border-radius: 3px;
    overflow: hidden;
  }

  .si-usage-bar__fill {
    height: 100%;
    border-radius: 3px;
    transition: width var(--si-transition-base);
  }

  .si-usage-bar__fill--normal {
    background: var(--si-emerald-500);
  }

  .si-usage-bar__fill--warning {
    background: var(--si-amber-500);
  }

  .si-usage-bar__fill--danger {
    background: var(--si-rose-500);
  }

  /* Billing Summary */
  .si-billing-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    padding: 16px;
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    margin-bottom: 20px;
  }

  .si-billing-summary__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .si-billing-summary__item--alert {
    border-left: 3px solid var(--si-rose-500);
    padding-left: 12px;
  }

  .si-billing-summary__label {
    font-size: 0.75rem;
    color: var(--si-slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .si-billing-summary__value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-billing-summary__value--success {
    color: var(--si-emerald-600);
  }

  .si-billing-summary__value--warning {
    color: var(--si-amber-600);
  }

  .si-billing-summary__value--danger {
    color: var(--si-rose-600);
  }

  /* Invoice List */
  .si-invoices-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .si-invoice-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    border: 1px solid var(--si-slate-200);
    cursor: pointer;
    transition: all var(--si-transition-fast);
  }

  .si-invoice-row:hover {
    border-color: var(--si-slate-300);
    background: white;
  }

  .si-invoice-row__main {
    flex: 1;
    min-width: 0;
  }

  .si-invoice-row__id {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .si-invoice-row__number {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-invoice-row__period {
    font-size: 0.75rem;
    color: var(--si-slate-500);
  }

  .si-invoice-row__amounts {
    text-align: right;
  }

  .si-invoice-row__total {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-invoice-row__due {
    font-size: 0.75rem;
    color: var(--si-amber-600);
    font-weight: 500;
  }

  .si-invoice-row__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    min-width: 100px;
  }

  .si-invoice-row__date {
    font-size: 0.75rem;
    color: var(--si-slate-500);
  }

  .si-invoice-row__items {
    font-size: 0.6875rem;
    color: var(--si-slate-400);
  }

  /* Customer Info */
  .si-customer-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .si-customer-info__section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .si-customer-info__section + .si-customer-info__section {
    padding-top: 16px;
    border-top: 1px solid var(--si-slate-100);
  }

  .si-customer-info__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .si-customer-info__label {
    font-size: 0.8125rem;
    color: var(--si-slate-500);
  }

  .si-customer-info__value {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-slate-800);
    text-align: right;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .si-customer-info__value--mono {
    font-family: var(--si-font-mono);
    font-size: 0.8125rem;
  }

  .si-customer-info__detail {
    font-weight: 400;
    color: var(--si-slate-500);
  }

  .si-customer-info__verified {
    width: 16px;
    height: 16px;
    color: var(--si-emerald-500);
  }

  /* Operator Notes */
  .si-operator-notes {
    background: var(--si-amber-50);
    border-radius: var(--si-radius-lg);
    padding: 16px;
    border: 1px solid var(--si-amber-100);
  }

  .si-operator-notes__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .si-operator-notes__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-amber-700);
    margin: 0;
  }

  .si-operator-notes__icon {
    width: 16px;
    height: 16px;
  }

  .si-operator-notes__content {
    padding: 0;
  }

  .si-operator-notes__text {
    font-size: 0.875rem;
    color: var(--si-slate-700);
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  }

  .si-operator-notes__empty {
    font-size: 0.875rem;
    color: var(--si-slate-500);
    font-style: italic;
    margin: 0;
  }

  .si-operator-notes__edit {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .si-operator-notes__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  /* Buttons */
  .si-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    font-family: var(--si-font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: var(--si-radius-md);
    border: none;
    cursor: pointer;
    transition: all var(--si-transition-fast);
  }

  .si-btn--sm {
    padding: 6px 12px;
    font-size: 0.8125rem;
  }

  .si-btn--primary {
    background: var(--si-violet-600);
    color: white;
  }

  .si-btn--primary:hover {
    background: var(--si-violet-700);
  }

  .si-btn--ghost {
    background: transparent;
    color: var(--si-slate-600);
  }

  .si-btn--ghost:hover {
    background: var(--si-slate-100);
    color: var(--si-slate-800);
  }

  .si-btn--secondary {
    background: var(--si-slate-100);
    color: var(--si-slate-700);
    border: 1px solid var(--si-slate-200);
  }

  .si-btn--secondary:hover {
    background: var(--si-slate-200);
    border-color: var(--si-slate-300);
  }

  .si-btn__icon {
    width: 18px;
    height: 18px;
  }

  /* Input */
  .si-input {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--si-font-sans);
    font-size: 0.875rem;
    color: var(--si-slate-800);
    background: white;
    border: 1px solid var(--si-slate-300);
    border-radius: var(--si-radius-md);
    transition: all var(--si-transition-fast);
  }

  .si-input:focus {
    outline: none;
    border-color: var(--si-violet-500);
    box-shadow: 0 0 0 3px var(--si-violet-100);
  }

  .si-input--textarea {
    resize: vertical;
    min-height: 80px;
  }

  .si-input--center {
    text-align: center;
  }

  .si-input--mono {
    font-family: var(--si-font-mono);
    font-size: 0.8125rem;
  }

  .si-input--with-prefix {
    padding-left: 56px;
  }

  .si-input-group {
    position: relative;
  }

  .si-input-group__prefix {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-slate-500);
  }

  /* Select */
  .si-select {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--si-font-sans);
    font-size: 0.875rem;
    color: var(--si-slate-800);
    background: white;
    border: 1px solid var(--si-slate-300);
    border-radius: var(--si-radius-md);
    cursor: pointer;
    transition: all var(--si-transition-fast);
  }

  .si-select:focus {
    outline: none;
    border-color: var(--si-violet-500);
    box-shadow: 0 0 0 3px var(--si-violet-100);
  }

  /* Form Elements */
  .si-form-group {
    margin-bottom: 16px;
  }

  .si-form-group:last-child {
    margin-bottom: 0;
  }

  .si-form-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--si-slate-700);
    margin-bottom: 6px;
  }

  .si-form-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: var(--si-slate-700);
  }

  .si-form-checkbox input {
    width: 16px;
    height: 16px;
    accent-color: var(--si-violet-600);
  }

  .si-form-summary {
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    padding: 16px;
    margin-bottom: 20px;
  }

  .si-form-summary__row {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    padding: 4px 0;
  }

  .si-form-summary__row--highlight {
    font-weight: 600;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid var(--si-slate-200);
  }

  .si-form-summary__success {
    color: var(--si-emerald-600);
  }

  /* Modal */
  .si-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
  }

  .si-modal {
    background: white;
    border-radius: var(--si-radius-lg);
    box-shadow: var(--si-shadow-lg);
    max-width: 400px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .si-modal--md {
    max-width: 500px;
  }

  .si-modal--sm {
    max-width: 360px;
  }

  .si-modal__header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--si-slate-200);
  }

  .si-modal__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--si-slate-900);
    margin: 0;
  }

  .si-modal__subtitle {
    font-size: 0.875rem;
    color: var(--si-slate-500);
    margin-top: 4px;
    display: block;
  }

  .si-modal__body {
    padding: 20px 24px;
  }

  .si-modal__message {
    font-size: 0.875rem;
    color: var(--si-slate-600);
    line-height: 1.6;
    margin: 0 0 16px;
  }

  .si-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--si-slate-200);
    background: var(--si-slate-50);
    border-radius: 0 0 var(--si-radius-lg) var(--si-radius-lg);
  }

  /* Actions Section */
  .si-header__actions-section {
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid var(--si-slate-100);
  }

  .si-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }

  .si-actions__row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .si-actions__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-slate-700);
  }

  .si-actions__buttons {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  /* Toggle Switch */
  .si-toggle {
    width: 44px;
    height: 24px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  .si-toggle__track {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--si-slate-300);
    border-radius: 12px;
    position: relative;
    transition: background var(--si-transition-fast);
  }

  .si-toggle--active .si-toggle__track {
    background: var(--si-emerald-500);
  }

  .si-toggle__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: var(--si-shadow-sm);
    transition: transform var(--si-transition-fast);
  }

  .si-toggle--active .si-toggle__thumb {
    transform: translateX(20px);
  }

  /* Additional Button Variants */
  .si-btn--success {
    background: var(--si-emerald-500);
    color: white;
  }

  .si-btn--success:hover {
    background: var(--si-emerald-600);
  }

  .si-btn--warning {
    background: var(--si-amber-500);
    color: white;
  }

  .si-btn--warning:hover {
    background: var(--si-amber-600);
  }

  .si-btn--danger {
    background: var(--si-rose-500);
    color: white;
  }

  .si-btn--danger:hover {
    background: var(--si-rose-600);
  }

  .si-btn--danger-ghost {
    background: transparent;
    color: var(--si-rose-600);
  }

  .si-btn--danger-ghost:hover {
    background: var(--si-rose-50);
    color: var(--si-rose-700);
  }

  /* Metric Actions */
  .si-metric__body {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .si-metric__body .si-usage-bar {
    flex: 1;
  }

  .si-metric-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .si-metric-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--si-slate-100);
    border: 1px solid var(--si-slate-200);
    border-radius: 4px;
    color: var(--si-slate-600);
    cursor: pointer;
    transition: all var(--si-transition-fast);
  }

  .si-metric-btn:hover {
    background: var(--si-slate-200);
    color: var(--si-slate-800);
  }

  .si-metric-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .si-metric-btn svg {
    width: 14px;
    height: 14px;
  }

  .si-metric-btn--plus:hover {
    background: var(--si-emerald-100);
    border-color: var(--si-emerald-200);
    color: var(--si-emerald-700);
  }

  .si-metric-btn--minus:hover {
    background: var(--si-rose-100);
    border-color: var(--si-rose-200);
    color: var(--si-rose-700);
  }

  .si-metric-btn--verify:hover {
    background: var(--si-emerald-100);
    border-color: var(--si-emerald-200);
    color: var(--si-emerald-700);
  }

  .si-metric-adjust-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.8125rem;
    color: var(--si-slate-500);
    margin-bottom: 16px;
  }

  .si-metric-adjust-preview {
    font-size: 0.875rem;
    color: var(--si-slate-600);
    text-align: center;
    padding: 12px;
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    margin-top: 16px;
  }

  /* Communication Channels */
  .si-channels-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .si-channel {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    border: 1px solid var(--si-slate-200);
  }

  .si-channel--primary {
    background: var(--si-violet-50);
    border-color: var(--si-violet-200);
  }

  .si-channel__icon {
    width: 24px;
    height: 24px;
    color: var(--si-slate-500);
    flex-shrink: 0;
  }

  .si-channel__icon svg {
    width: 100%;
    height: 100%;
  }

  .si-channel--primary .si-channel__icon {
    color: var(--si-violet-600);
  }

  .si-channel__info {
    flex: 1;
    min-width: 0;
  }

  .si-channel__identifier {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-slate-800);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .si-channel__type {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--si-slate-500);
  }

  .si-channel__badge {
    display: inline-flex;
    padding: 2px 6px;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    background: var(--si-violet-100);
    color: var(--si-violet-700);
    border-radius: 4px;
  }

  .si-channel__verified {
    width: 14px;
    height: 14px;
    color: var(--si-emerald-500);
  }

  .si-channel__actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .si-channel-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--si-slate-400);
    cursor: pointer;
    transition: all var(--si-transition-fast);
  }

  .si-channel-btn:hover {
    background: var(--si-slate-200);
    color: var(--si-slate-700);
  }

  .si-channel-btn svg {
    width: 16px;
    height: 16px;
  }

  .si-channel-btn--verify:hover {
    background: var(--si-emerald-100);
    color: var(--si-emerald-700);
  }

  .si-channel-btn--remove:hover {
    background: var(--si-rose-100);
    color: var(--si-rose-700);
  }

  /* Empty states */
  .si-empty--sm {
    padding: 16px;
  }

  .si-empty--sm .si-empty__text {
    font-size: 0.8125rem;
  }

  /* Button size variants */
  .si-btn--xs {
    padding: 4px 8px;
    font-size: 0.75rem;
  }

  /* Panel badge */
  .si-panel__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: 0.6875rem;
    font-weight: 600;
    border-radius: 10px;
    margin-left: 8px;
  }

  .si-panel__badge--warning {
    background: var(--si-amber-100);
    color: var(--si-amber-700);
  }

  .si-panel__empty {
    font-size: 0.875rem;
    color: var(--si-slate-500);
    text-align: center;
    padding: 16px;
    margin: 0;
  }

  /* Client Requests */
  .si-requests-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .si-requests-list--compact {
    gap: 8px;
  }

  .si-request-card {
    background: var(--si-slate-50);
    border: 1px solid var(--si-slate-200);
    border-radius: var(--si-radius-md);
    padding: 12px;
  }

  .si-request-card--processed {
    opacity: 0.7;
  }

  .si-request-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .si-request-card__type {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-request-card__status {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .si-request-card__body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--si-slate-500);
    margin-bottom: 8px;
  }

  .si-request-card__info {
    color: var(--si-slate-600);
  }

  .si-request-card__time {
    color: var(--si-slate-400);
  }

  .si-request-card__reason {
    font-size: 0.8125rem;
    color: var(--si-slate-600);
    background: white;
    padding: 8px;
    border-radius: var(--si-radius-sm);
    margin: 8px 0;
  }

  .si-request-card__response {
    font-size: 0.8125rem;
    color: var(--si-slate-600);
    font-style: italic;
    margin: 4px 0 0;
  }

  .si-request-card__actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--si-slate-200);
  }

  .si-requests-history {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--si-slate-200);
  }

  .si-requests-history__title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--si-slate-500);
    margin: 0 0 12px;
  }

  /* Request Details in Modal */
  .si-request-details {
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    padding: 12px;
    margin-bottom: 16px;
  }

  .si-request-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--si-slate-200);
  }

  .si-request-detail:last-child {
    border-bottom: none;
  }

  .si-request-detail__label {
    font-size: 0.8125rem;
    color: var(--si-slate-500);
  }

  .si-request-detail__value {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-slate-800);
  }

  /* Pending Actions in Client View */
  .si-actions__pending-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    font-size: 0.8125rem;
    font-weight: 500;
    background: var(--si-amber-100);
    color: var(--si-amber-700);
    border-radius: var(--si-radius-md);
  }

  .si-actions__pending-badge--danger {
    background: var(--si-rose-100);
    color: var(--si-rose-700);
  }

  .si-actions__pending-list {
    width: 100%;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--si-slate-200);
  }

  .si-actions__pending-title {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--si-slate-500);
    margin-bottom: 12px;
  }

  .si-actions__pending-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--si-amber-50);
    border: 1px solid var(--si-amber-100);
    border-radius: var(--si-radius-md);
    margin-bottom: 8px;
  }

  .si-actions__pending-item:last-child {
    margin-bottom: 0;
  }

  .si-actions__pending-type {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--si-amber-700);
  }

  /* Client Metric Request Button */
  .si-metric-actions--client {
    margin-left: auto;
  }

  .si-metric-btn--request {
    background: var(--si-violet-100);
    border-color: var(--si-violet-200);
    color: var(--si-violet-600);
  }

  .si-metric-btn--request:hover {
    background: var(--si-violet-200);
    border-color: var(--si-violet-300);
    color: var(--si-violet-700);
  }

  /* Service Card Actions (Client) */
  .si-service-card__actions {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--si-slate-200);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .si-service-card__header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* Customer Info Field Editing */
  .si-customer-info__edit-wallet,
  .si-customer-info__edit-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .si-customer-info__edit-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .si-customer-info__type-edit {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .si-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
    padding-right: 32px;
    cursor: pointer;
  }

  .si-input--number {
    width: 80px;
  }

  .si-customer-info__edit-btn {
    width: 20px;
    height: 20px;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--si-slate-400);
    cursor: pointer;
    transition: color var(--si-transition-fast);
    margin-left: 8px;
  }

  .si-customer-info__edit-btn:hover {
    color: var(--si-violet-600);
  }

  .si-customer-info__edit-btn svg {
    width: 100%;
    height: 100%;
  }

  .si-customer-info__value--empty {
    color: var(--si-slate-400);
    font-style: italic;
  }

  .si-input--sm {
    padding: 6px 10px;
    font-size: 0.8125rem;
  }

  /* Issuer Info */
  .si-issuer-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    margin-bottom: 16px;
    align-items: center;
  }

  .si-issuer-info__label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--si-slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .si-issuer-info__details {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .si-issuer-info__name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-issuer-info__email {
    font-size: 0.8125rem;
    color: var(--si-slate-600);
  }

  .si-issuer-info__wallet {
    font-size: 0.8125rem;
    font-family: var(--si-font-mono);
    color: var(--si-violet-600);
    background: var(--si-violet-50);
    padding: 2px 8px;
    border-radius: 4px;
  }

  /* Invoice Row Actions */
  .si-invoice-row__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .si-invoice-row {
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .si-invoice-row__actions {
      width: 100%;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--si-slate-200);
      justify-content: flex-end;
    }
  }

  /* Import Service Config Styles */
  .si-textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--si-slate-300);
    border-radius: var(--si-radius-md);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    resize: vertical;
    transition: border-color var(--si-transition-fast), box-shadow var(--si-transition-fast);
  }

  .si-textarea:focus {
    outline: none;
    border-color: var(--si-violet-400);
    box-shadow: 0 0 0 3px var(--si-violet-100);
  }

  .si-alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--si-radius-md);
    margin-top: 12px;
  }

  .si-alert--error {
    background: var(--si-rose-50);
    border: 1px solid var(--si-rose-200);
    color: var(--si-rose-700);
  }

  .si-alert__icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .si-import-help {
    margin-top: 16px;
    padding: 16px;
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
  }

  .si-import-help__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-slate-700);
    margin: 0 0 12px 0;
  }

  .si-import-help__steps {
    margin: 0;
    padding-left: 20px;
    font-size: 0.8125rem;
    color: var(--si-slate-600);
    line-height: 1.6;
  }

  .si-import-help__steps li {
    margin-bottom: 4px;
  }

  .si-import-preview {
    background: var(--si-slate-50);
    border-radius: var(--si-radius-md);
    padding: 16px;
  }

  .si-import-preview__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--si-slate-200);
  }

  .si-import-preview__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--si-slate-800);
    margin: 0;
  }

  .si-import-preview__count {
    font-size: 0.8125rem;
    color: var(--si-slate-500);
  }

  .si-tier-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .si-tier-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border: 2px solid var(--si-slate-200);
    border-radius: var(--si-radius-md);
    cursor: pointer;
    transition: border-color var(--si-transition-fast), background var(--si-transition-fast);
  }

  .si-tier-option:hover {
    border-color: var(--si-violet-300);
    background: var(--si-violet-50);
  }

  .si-tier-option--selected {
    border-color: var(--si-violet-500);
    background: var(--si-violet-50);
  }

  .si-tier-option__radio {
    margin-top: 2px;
    accent-color: var(--si-violet-600);
  }

  .si-tier-option__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .si-tier-option__name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-tier-option__desc {
    font-size: 0.8125rem;
    color: var(--si-slate-600);
  }

  .si-tier-option__meta {
    font-size: 0.75rem;
    color: var(--si-slate-500);
    margin-top: 4px;
  }

  .si-import-summary {
    margin-top: 16px;
    padding: 12px 16px;
    background: white;
    border-radius: var(--si-radius-md);
    border: 1px solid var(--si-slate-200);
  }

  .si-import-summary__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--si-slate-700);
    margin: 0 0 8px 0;
  }

  .si-import-summary__list {
    margin: 0;
    padding-left: 20px;
    font-size: 0.8125rem;
    color: var(--si-slate-600);
  }

  .si-import-summary__list li {
    margin-bottom: 4px;
  }

  .si-import-summary__list strong {
    color: var(--si-slate-800);
  }

  .si-import-summary__metrics {
    color: var(--si-slate-500);
  }

  .si-import-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 12px 0 0;
    padding: 10px 12px;
    background: var(--si-amber-50);
    border-radius: var(--si-radius-sm);
    font-size: 0.8125rem;
    color: var(--si-amber-800);
  }

  .si-import-note__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--si-amber-600);
  }

  .si-modal--lg {
    max-width: 600px;
    width: 90vw;
  }

  /* Overage Preview (in limit increase modal) */
  .si-overage-preview {
    background: var(--si-amber-50);
    border: 1px solid var(--si-amber-100);
    border-radius: var(--si-radius-md);
    padding: 12px;
    margin-bottom: 16px;
  }

  .si-overage-preview__title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--si-amber-600);
    margin-bottom: 8px;
  }

  .si-overage-preview__row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8125rem;
    color: var(--si-slate-600);
    padding: 4px 0;
  }

  .si-overage-preview__row--total {
    font-weight: 600;
    color: var(--si-amber-700);
    padding-top: 8px;
    margin-top: 4px;
    border-top: 1px solid var(--si-amber-200);
  }

  .si-overage-preview__warning {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--si-rose-600);
    margin-top: 8px;
    padding: 6px 8px;
    background: var(--si-rose-50);
    border-radius: var(--si-radius-sm);
  }

  /* Metric Pending Tag */
  .si-metric-pending-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: var(--si-amber-100);
    color: var(--si-amber-700);
    border-radius: 4px;
  }

  /* Metric Limit Highlight (modal) */
  .si-metric-limit-highlight {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 12px;
    background: var(--si-slate-50);
    border: 1px solid var(--si-slate-200);
    border-radius: var(--si-radius);
    text-align: center;
  }

  .si-metric-limit-highlight__label {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--si-slate-500);
  }

  .si-metric-limit-highlight__value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--si-slate-800);
  }

  .si-metric-limit-highlight__note {
    font-size: 0.6875rem;
    color: var(--si-slate-400);
    font-style: italic;
  }

  .si-metric-adjust-info--cost {
    background: var(--si-blue-50);
    border: 1px solid var(--si-blue-100);
    border-radius: var(--si-radius-sm);
    padding: 6px 10px;
    color: var(--si-blue-700);
    font-size: 0.75rem;
  }

  /* Metric Overage Indicator */
  .si-metric__overage {
    font-size: 0.6875rem;
    color: var(--si-amber-700);
    background: var(--si-amber-50);
    border: 1px solid var(--si-amber-100);
    border-radius: var(--si-radius-sm);
    padding: 4px 8px;
    margin-top: 6px;
  }

  .si-metric__overage strong {
    color: var(--si-amber-800);
  }

  /* Metric Paid Limit */
  .si-metric__paid-limit {
    font-size: 0.6875rem;
    color: var(--si-slate-500);
    margin-top: 4px;
  }

  /* Metric Reset Period */
  .si-metric__reset-period {
    font-weight: 500;
    text-transform: capitalize;
  }

  /* Countdown in header stats */
  .si-header__stat-countdown {
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--si-slate-500);
  }

  /* Billing Section CSS (replaces inline styles) */
  .si-billing-section {
    margin-bottom: 16px;
  }

  .si-billing-section:last-child {
    margin-bottom: 0;
  }

  .si-billing-section__title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--si-slate-500);
    margin-bottom: 8px;
  }

  .si-billing-section__title--setup {
    color: var(--si-violet-600);
    display: flex;
    justify-content: space-between;
  }

  .si-billing-section__title--overage {
    color: var(--si-amber-600);
  }

  .si-billing-section__total {
    font-weight: 500;
    font-size: 0.8125rem;
  }

  .si-billing-section__lines {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .si-billing-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--si-slate-50);
    border-radius: var(--si-radius-sm);
    font-size: 0.875rem;
  }

  .si-billing-line--setup {
    background: var(--si-violet-50);
    border: 1px solid var(--si-violet-100);
  }

  .si-billing-line--overage {
    background: var(--si-amber-50);
    border: 1px solid var(--si-amber-100);
  }

  .si-billing-line__name {
    color: var(--si-slate-700);
  }

  .si-billing-line__name--overage {
    color: var(--si-amber-700);
  }

  .si-billing-line__cycle {
    color: var(--si-slate-400);
    font-size: 0.75rem;
    margin-left: 6px;
  }

  .si-billing-line__calc {
    color: var(--si-amber-500);
    font-size: 0.75rem;
    margin-left: 6px;
  }

  .si-billing-line__amount {
    font-weight: 600;
    color: var(--si-slate-800);
  }

  .si-billing-line__amount--setup {
    color: var(--si-violet-700);
  }

  .si-billing-line__amount--overage {
    color: var(--si-amber-700);
  }

  .si-billing-line__amount--paid {
    color: var(--si-slate-500);
    text-decoration: line-through;
  }

  .si-billing-line__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .si-billing-line__paid-tag {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--si-emerald-600);
    text-transform: uppercase;
  }
`;
