import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  Service,
  ServiceSubscriptionTier,
  ServiceLevel,
  ServiceLevelBinding,
  OptionGroup,
  ServiceUsageLimit,
  BillingCycle,
  UsageResetCycle,
} from "@powerhousedao/service-offering/document-models/service-offering";
import { BILLING_CYCLE_SHORT_LABELS, formatPrice } from "./pricing-utils.js";
import {
  addServiceLevel,
  updateServiceLevel,
  addUsageLimit,
  updateUsageLimit,
  removeUsageLimit,
  addService,
  updateService,
} from "../../../document-models/service-offering/gen/creators.js";

interface TheMatrixProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

const SERVICE_LEVELS: {
  value: ServiceLevel;
  label: string;
  shortLabel: string;
  color: string;
}[] = [
  {
    value: "INCLUDED",
    label: "Included",
    shortLabel: "✓",
    color: "var(--so-emerald-600)",
  },
  {
    value: "OPTIONAL",
    label: "Optional",
    shortLabel: "Optional",
    color: "var(--so-sky-600)",
  },
  {
    value: "NOT_INCLUDED",
    label: "Not Included",
    shortLabel: "—",
    color: "var(--so-slate-400)",
  },
  {
    value: "NOT_APPLICABLE",
    label: "Not Applicable",
    shortLabel: "/",
    color: "var(--so-slate-300)",
  },
  {
    value: "CUSTOM",
    label: "Custom",
    shortLabel: "Custom",
    color: "var(--so-amber-600)",
  },
  {
    value: "VARIABLE",
    label: "Variable",
    shortLabel: "#",
    color: "var(--so-violet-600)",
  },
];

const UNGROUPED_ID = "__ungrouped__";

const matrixStyles = `
  .matrix {
    background: var(--so-white);
    border-radius: var(--so-radius-lg);
    box-shadow: var(--so-shadow-md);
    overflow: hidden;
  }

  /* Facet Selector */
  .matrix__facets {
    padding: 1.25rem 1.5rem;
    background: linear-gradient(to bottom, var(--so-slate-50), var(--so-white));
    border-bottom: 1px solid var(--so-slate-200);
  }

  .matrix__facets-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1.5rem;
  }

  .matrix__facet-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .matrix__facet-label {
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--so-slate-500);
  }

  .matrix__facet-select {
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    color: var(--so-slate-700);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    cursor: pointer;
    outline: none;
    transition: var(--so-transition-fast);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
  }

  .matrix__facet-select:hover {
    border-color: var(--so-slate-300);
  }

  .matrix__facet-select:focus {
    border-color: var(--so-violet-400);
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  /* Toggle Button Group */
  .matrix__toggle-group {
    display: flex;
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    overflow: hidden;
  }

  .matrix__toggle-btn {
    padding: 0.5rem 0.875rem;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-600);
    background: var(--so-white);
    border: none;
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .matrix__toggle-btn:not(:first-child) {
    border-left: 1px solid var(--so-slate-200);
  }

  .matrix__toggle-btn:hover:not(.matrix__toggle-btn--active) {
    background: var(--so-slate-50);
  }

  .matrix__toggle-btn--active {
    background: var(--so-violet-100);
    color: var(--so-violet-700);
  }

  /* Facet Notice */
  .matrix__facet-notice {
    margin-top: 0.875rem;
    padding: 0.625rem 0.875rem;
    background: var(--so-amber-50);
    border: 1px solid var(--so-amber-200);
    border-radius: var(--so-radius-md);
  }

  .matrix__facet-notice-text {
    font-size: 0.75rem;
    color: var(--so-amber-700);
  }

  .matrix__facet-notice-text strong {
    color: var(--so-amber-800);
  }

  /* Table */
  .matrix__table-wrap {
    overflow-x: auto;
  }

  .matrix__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
  }

  /* Header */
  .matrix__corner-cell {
    position: sticky;
    left: 0;
    z-index: 10;
    background: var(--so-white);
    padding: 1rem;
    text-align: left;
    font-weight: 400;
    color: var(--so-slate-500);
    border-bottom: 1px solid var(--so-slate-200);
    min-width: 260px;
  }

  .matrix__tier-header {
    padding: 1rem;
    text-align: center;
    border-bottom: 1px solid var(--so-slate-200);
    min-width: 140px;
    cursor: pointer;
    transition: var(--so-transition-fast);
    background: var(--so-white);
  }

  .matrix__tier-header:hover:not(.matrix__tier-header--selected) {
    background: linear-gradient(180deg, var(--so-slate-50) 0%, var(--so-violet-50) 100%);
  }

  .matrix__tier-header--selected {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    color: var(--so-white);
    box-shadow:
      0 4px 12px rgba(139, 92, 246, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    position: relative;
  }

  .matrix__tier-header--selected::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, transparent 50%);
    pointer-events: none;
  }

  .matrix__tier-header-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
  }

  .matrix__tier-radio {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid var(--so-slate-300);
    transition: var(--so-transition-fast);
  }

  .matrix__tier-header--selected .matrix__tier-radio {
    border-color: rgba(255, 255, 255, 0.9);
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow:
      inset 0 0 0 3px var(--so-white),
      0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .matrix__tier-name {
    font-family: var(--so-font-sans);
    font-weight: 600;
    color: var(--so-slate-900);
  }

  .matrix__tier-header--selected .matrix__tier-name {
    color: var(--so-white);
  }

  .matrix__tier-price {
    font-size: 0.6875rem;
    color: var(--so-slate-500);
  }

  .matrix__tier-header--selected .matrix__tier-price {
    color: rgba(255, 255, 255, 0.85);
  }

  /* Billing Cycle Selector in Tier Header */
  .matrix__tier-cycle-select {
    font-family: var(--so-font-sans);
    font-size: 0.625rem;
    color: var(--so-slate-600);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    outline: none;
    transition: var(--so-transition-fast);
    margin-top: 0.25rem;
  }

  .matrix__tier-cycle-select:hover {
    border-color: var(--so-slate-300);
  }

  .matrix__tier-cycle-select:focus {
    border-color: var(--so-violet-400);
    box-shadow: 0 0 0 2px var(--so-violet-100);
  }

  .matrix__tier-header--selected .matrix__tier-cycle-select {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.3);
    color: var(--so-white);
    backdrop-filter: blur(4px);
  }

  .matrix__tier-header--selected .matrix__tier-cycle-select:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .matrix__tier-header--selected .matrix__tier-cycle-select:focus {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* Section Header */
  .matrix__section-header {
    background: var(--so-slate-100);
    padding: 0.625rem 1rem;
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--so-slate-600);
    border-bottom: 1px solid var(--so-slate-200);
  }

  /* Category Header */
  .matrix__category-header {
    background: var(--so-slate-50);
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--so-slate-700);
    border-bottom: 1px solid var(--so-slate-200);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .matrix__category-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--so-slate-500);
  }

  .matrix__category-icon svg {
    width: 100%;
    height: 100%;
  }

  /* Group Header */
  .matrix__group-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--so-slate-200);
  }

  .matrix__group-header--setup {
    background: var(--so-amber-100);
  }

  .matrix__group-header--optional {
    background: var(--so-sky-100);
  }

  .matrix__group-header--regular {
    background: var(--so-slate-100);
  }

  .matrix__group-header-sticky {
    position: sticky;
    left: 0;
    z-index: 10;
  }

  .matrix__group-header-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .matrix__group-toggle {
    position: relative;
    width: 2.5rem;
    height: 1.25rem;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    transition: var(--so-transition-base);
  }

  .matrix__group-toggle--on {
    background: var(--so-violet-600);
  }

  .matrix__group-toggle--off {
    background: var(--so-slate-300);
  }

  .matrix__group-toggle-knob {
    position: absolute;
    top: 0.125rem;
    width: 1rem;
    height: 1rem;
    background: var(--so-white);
    border-radius: 50%;
    box-shadow: var(--so-shadow-sm);
    transition: var(--so-transition-fast);
  }

  .matrix__group-toggle--on .matrix__group-toggle-knob {
    left: calc(100% - 1.125rem);
  }

  .matrix__group-toggle--off .matrix__group-toggle-knob {
    left: 0.125rem;
  }

  .matrix__group-name {
    font-family: var(--so-font-sans);
    font-weight: 600;
    color: var(--so-slate-800);
  }

  .matrix__group-badge {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    border-radius: var(--so-radius-sm);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .matrix__group-badge--included {
    background: var(--so-emerald-100);
    color: var(--so-emerald-700);
  }

  .matrix__group-badge--optional {
    background: var(--so-sky-200);
    color: var(--so-sky-700);
  }

  .matrix__group-billing-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: var(--so-radius-sm);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: var(--so-violet-100);
    color: var(--so-violet-700);
    margin-left: 8px;
  }

  .matrix__group-price-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: var(--so-radius-sm);
    font-size: 0.625rem;
    font-weight: 600;
    background: var(--so-amber-100);
    color: var(--so-amber-700);
    margin-left: 6px;
  }

  /* Service Row */
  .matrix__service-row {
    transition: var(--so-transition-fast);
  }

  .matrix__service-row--setup {
    background: var(--so-amber-50);
  }

  .matrix__service-row--optional {
    background: var(--so-sky-50);
  }

  .matrix__service-row--regular {
    background: var(--so-slate-50);
  }

  .matrix__service-row:hover {
    filter: brightness(0.98);
  }

  .matrix__service-cell {
    padding: 0.625rem 1rem;
    padding-left: 2rem;
    border-bottom: 1px solid var(--so-slate-100);
    position: sticky;
    left: 0;
    z-index: 10;
  }

  .matrix__service-title {
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    color: var(--so-slate-700);
  }

  .matrix__service-title--clickable {
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    margin: -0.25rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--so-transition-fast);
    text-align: left;
  }

  .matrix__service-title--clickable:hover {
    background: var(--so-slate-100);
    color: var(--so-violet-700);
  }

  .matrix__service-setup-badge {
    display: inline-block;
    padding: 0.0625rem 0.375rem;
    margin-left: 0.375rem;
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: var(--so-radius-sm);
    background: var(--so-amber-100);
    color: var(--so-amber-700);
    vertical-align: middle;
  }

  .matrix__service-setup-price {
    display: inline-block;
    padding: 0.0625rem 0.375rem;
    margin-left: 0.25rem;
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    border-radius: var(--so-radius-sm);
    background: var(--so-slate-100);
    color: var(--so-slate-700);
    vertical-align: middle;
  }

  /* Premium Only Badge - Exclusivity Signal (Toggle Button) */
  .matrix__premium-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    margin-left: 0.5rem;
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 100px;
    cursor: pointer;
    transition: all var(--so-transition-fast);
    font-family: var(--so-font-sans);
  }

  .matrix__premium-badge--active {
    color: var(--so-amber-700);
    background: linear-gradient(135deg, var(--so-amber-100) 0%, var(--so-amber-50) 100%);
    border: 1px solid var(--so-amber-200);
  }

  .matrix__premium-badge--active:hover {
    background: linear-gradient(135deg, var(--so-amber-200) 0%, var(--so-amber-100) 100%);
    border-color: var(--so-amber-300);
  }

  .matrix__premium-badge--inactive {
    color: var(--so-slate-400);
    background: var(--so-slate-50);
    border: 1px dashed var(--so-slate-200);
    opacity: 0.6;
  }

  .matrix__premium-badge--inactive:hover {
    opacity: 1;
    color: var(--so-amber-600);
    background: var(--so-amber-50);
    border: 1px dashed var(--so-amber-300);
  }

  .matrix__premium-badge--active svg {
    width: 0.625rem;
    height: 0.625rem;
    fill: var(--so-amber-500);
    stroke: var(--so-amber-600);
  }

  .matrix__premium-badge--inactive svg {
    width: 0.625rem;
    height: 0.625rem;
    fill: none;
    stroke: currentColor;
  }

  /* Incomplete Services Warning */
  .matrix__incomplete-warning {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    background: var(--so-amber-50);
    border: 1px solid var(--so-amber-200);
    border-radius: var(--so-radius-md);
    animation: matrix-warning-pulse 2s ease-in-out infinite;
  }

  @keyframes matrix-warning-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    50% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
  }

  .matrix__incomplete-icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--so-amber-600);
  }

  .matrix__incomplete-icon svg {
    width: 100%;
    height: 100%;
  }

  .matrix__incomplete-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .matrix__incomplete-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--so-amber-800);
  }

  .matrix__incomplete-text {
    font-size: 0.8125rem;
    color: var(--so-amber-700);
    line-height: 1.5;
  }

  .matrix__incomplete-text strong {
    font-weight: 600;
    color: var(--so-amber-900);
  }

  /* Bulk Actions Toolbar */
  .matrix__bulk-actions {
    margin-bottom: 1rem;
  }

  .matrix__bulk-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-slate-600);
    background: var(--so-slate-100);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .matrix__bulk-toggle:hover {
    background: var(--so-slate-200);
    color: var(--so-slate-700);
  }

  .matrix__bulk-toggle svg:first-child {
    width: 1rem;
    height: 1rem;
  }

  .matrix__bulk-toggle-arrow {
    width: 0.875rem;
    height: 0.875rem;
    margin-left: auto;
    transition: transform var(--so-transition-fast);
  }

  .matrix__bulk-toggle-arrow--open {
    transform: rotate(180deg);
  }

  .matrix__bulk-panel {
    margin-top: 0.75rem;
    padding: 1rem;
    background: var(--so-slate-50);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: so-scale-in var(--so-transition-fast) ease-out;
  }

  .matrix__bulk-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .matrix__bulk-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--so-slate-500);
  }

  .matrix__bulk-buttons,
  .matrix__bulk-copy {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .matrix__bulk-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    font-family: var(--so-font-sans);
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: var(--so-radius-sm);
    border: 1px solid;
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .matrix__bulk-btn svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .matrix__bulk-btn--include {
    background: var(--so-emerald-50);
    border-color: var(--so-emerald-200);
    color: var(--so-emerald-700);
  }

  .matrix__bulk-btn--include:hover {
    background: var(--so-emerald-100);
    border-color: var(--so-emerald-300);
  }

  .matrix__bulk-btn--clear {
    background: var(--so-rose-50);
    border-color: var(--so-rose-200);
    color: var(--so-rose-700);
  }

  .matrix__bulk-btn--clear:hover {
    background: var(--so-rose-100);
    border-color: var(--so-rose-300);
  }

  .matrix__bulk-btn--copy {
    background: var(--so-sky-50);
    border-color: var(--so-sky-200);
    color: var(--so-sky-700);
  }

  .matrix__bulk-btn--copy:hover {
    background: var(--so-sky-100);
    border-color: var(--so-sky-300);
  }

  /* Pattern Presets Section */
  .matrix__bulk-patterns {
    border-top: 1px dashed var(--so-slate-200);
    padding-top: 1rem;
    margin-top: 0.5rem;
  }

  .matrix__bulk-label-icon {
    width: 1rem;
    height: 1rem;
    vertical-align: middle;
    margin-right: 0.25rem;
  }

  .matrix__pattern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .matrix__pattern-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.875rem 0.75rem;
    background: linear-gradient(135deg, var(--so-white) 0%, var(--so-slate-50) 100%);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all var(--so-transition-fast);
    text-align: center;
  }

  .matrix__pattern-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--so-shadow-md);
    border-color: var(--so-violet-300);
    background: linear-gradient(135deg, var(--so-violet-50) 0%, var(--so-white) 100%);
  }

  .matrix__pattern-btn:active {
    transform: translateY(0);
  }

  .matrix__pattern-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .matrix__pattern-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .matrix__pattern-desc {
    font-size: 0.6875rem;
    color: var(--so-slate-500);
    line-height: 1.3;
  }

  .matrix__pattern-btn--simple {
    padding: 0.625rem 0.75rem;
    flex-direction: row;
    gap: 0.5rem;
  }

  .matrix__pattern-btn--simple .matrix__pattern-icon {
    font-size: 1rem;
  }

  .matrix__pattern-btn--simple .matrix__pattern-name {
    font-size: 0.75rem;
  }

  .matrix__level-cell {
    padding: 0.625rem 1rem;
    text-align: center;
    border-bottom: 1px solid var(--so-slate-100);
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .matrix__level-cell:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .matrix__level-cell--selected {
    box-shadow: inset 0 0 0 2px #8b5cf6;
    background: rgba(139, 92, 246, 0.08);
  }

  .matrix__level-cell--highlight {
    background: linear-gradient(180deg, rgba(139, 92, 246, 0.06) 0%, rgba(139, 92, 246, 0.12) 100%);
  }

  .matrix__level-value {
    font-family: var(--so-font-sans);
    font-weight: 500;
  }

  /* Loss Aversion Styling for NOT_INCLUDED */
  .matrix__level-cell--not-included {
    position: relative;
    background: repeating-linear-gradient(
      135deg,
      transparent,
      transparent 8px,
      rgba(148, 163, 184, 0.08) 8px,
      rgba(148, 163, 184, 0.08) 16px
    );
  }

  .matrix__level-cell--not-included:hover .matrix__upgrade-hint {
    opacity: 1;
    transform: translateY(0);
  }

  .matrix__upgrade-hint {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    font-size: 0.5625rem;
    font-weight: 500;
    color: var(--so-violet-600);
    white-space: nowrap;
    opacity: 0;
    transition: all 0.15s ease-out;
    pointer-events: none;
  }

  .matrix__level-value--not-included {
    opacity: 0.6;
  }

  /* Metric Row */
  .matrix__metric-row {
    background: inherit;
    cursor: pointer;
    transition: var(--so-transition-fast);
    height: 2.25rem;
  }

  .matrix__metric-row:hover {
    background: rgba(124, 58, 237, 0.08);
  }

  .matrix__metric-cell {
    padding: 0.5rem 1rem;
    padding-left: 7rem;
    border-bottom: 1px solid var(--so-slate-100);
    position: sticky;
    left: 0;
    z-index: 10;
    height: 2.25rem;
    vertical-align: middle;
  }

  .matrix__metric-name-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    height: 100%;
  }

  .matrix__metric-name-wrapper::before {
    content: "";
    position: absolute;
    left: -2rem;
    top: 50%;
    width: 1.5rem;
    height: 1px;
    background: var(--so-slate-300);
  }

  .matrix__metric-name-wrapper::after {
    content: "";
    position: absolute;
    left: -2rem;
    top: -100%;
    width: 1px;
    height: calc(100% + 50%);
    background: var(--so-slate-300);
  }

  .matrix__metric-name {
    font-family: var(--so-font-sans);
    font-size: 0.75rem;
    font-style: italic;
    color: var(--so-slate-500);
  }

  .matrix__metric-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: var(--so-transition-fast);
  }

  .matrix__metric-row:hover .matrix__metric-actions {
    opacity: 1;
  }

  .matrix__metric-btn {
    padding: 0.125rem;
    background: transparent;
    border: none;
    color: var(--so-slate-400);
    cursor: pointer;
    border-radius: var(--so-radius-sm);
    transition: var(--so-transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .matrix__metric-btn:hover {
    background: var(--so-slate-200);
  }

  .matrix__metric-btn--edit:hover {
    color: var(--so-violet-600);
  }

  .matrix__metric-btn--remove:hover {
    color: var(--so-rose-600);
  }

  .matrix__metric-btn-icon {
    width: 0.75rem;
    height: 0.75rem;
  }

  .matrix__metric-value-cell {
    padding: 0.375rem 1rem;
    text-align: center;
    border-bottom: 1px solid var(--so-slate-100);
  }

  .matrix__metric-value-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
  }

  .matrix__metric-value {
    font-size: 0.6875rem;
    color: var(--so-slate-500);
  }

  .matrix__metric-overage {
    font-family: var(--so-font-mono);
    font-size: 0.5625rem;
    font-weight: 500;
    color: #059669;
    white-space: nowrap;
  }

  .matrix__metric-reset-cycle {
    font-size: 0.5625rem;
    font-weight: 500;
    color: #64748b;
    text-transform: capitalize;
  }

  /* Add Metric Button on Service Row */
  .matrix__service-cell-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
  }

  .matrix__add-metric-btn {
    opacity: 0.6;
    font-family: var(--so-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--so-violet-600);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.125rem 0.375rem;
    border-radius: var(--so-radius-sm);
    transition: var(--so-transition-fast);
    white-space: nowrap;
  }

  .matrix__service-row:hover .matrix__add-metric-btn {
    opacity: 1;
  }

  .matrix__add-metric-btn:hover {
    background: var(--so-violet-100);
    color: var(--so-violet-700);
  }

  /* Reorder Buttons for Service Reordering */
  .matrix__reorder-buttons {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-right: 0.5rem;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .matrix__service-row:hover .matrix__reorder-buttons {
    opacity: 1;
  }

  .matrix__reorder-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 14px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--so-slate-400);
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.15s ease;
  }

  .matrix__reorder-btn:hover:not(:disabled) {
    background: var(--so-violet-100);
    color: var(--so-violet-600);
  }

  .matrix__reorder-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .matrix__reorder-btn svg {
    width: 12px;
    height: 12px;
  }

  /* Add Service Row */
  .matrix__add-service-row td {
    padding: 0.5rem 1rem;
    padding-left: 2rem;
    border-bottom: 1px solid var(--so-slate-100);
  }

  .matrix__add-service-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-violet-600);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .matrix__add-service-btn:hover {
    color: var(--so-violet-700);
  }

  .matrix__add-service-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Total Rows */
  .matrix__total-row {
    background: var(--so-slate-100);
  }

  .matrix__total-row td {
    padding: 0.625rem 1rem;
    font-weight: 600;
    color: var(--so-slate-700);
    border-bottom: 1px solid var(--so-slate-300);
  }

  .matrix__total-row td:first-child {
    position: sticky;
    left: 0;
    z-index: 10;
    background: var(--so-slate-100);
  }

  .matrix__setup-total-row {
    background: var(--so-slate-50);
  }

  .matrix__setup-total-row td {
    padding: 0.625rem 1rem;
    font-weight: 600;
    color: var(--so-slate-700);
    border-bottom: 1px solid var(--so-slate-200);
  }

  .matrix__setup-total-row td:first-child {
    position: sticky;
    left: 0;
    z-index: 10;
    background: var(--so-slate-50);
  }

  /* Grand Total */
  .matrix__grand-total-row {
    background: var(--so-violet-100);
  }

  .matrix__grand-total-row td {
    padding: 0.875rem 1rem;
    font-weight: 700;
    color: var(--so-violet-900);
    border-top: 2px solid var(--so-violet-300);
  }

  .matrix__grand-total-row td:first-child {
    position: sticky;
    left: 0;
    z-index: 10;
    background: var(--so-violet-100);
  }

  .matrix__grand-total-cell--selected {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    color: var(--so-white);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
    position: relative;
  }

  .matrix__grand-total-row--setup {
    background: var(--so-violet-50);
    border-top: none;
  }

  .matrix__grand-total-row--setup td {
    border-top: 1px dashed var(--so-violet-200);
    font-weight: 600;
    font-size: 0.8125rem;
    color: var(--so-violet-700);
    padding: 0.5rem 1rem;
  }

  .matrix__grand-total-row--setup td:first-child {
    background: var(--so-violet-50);
  }

  .matrix__grand-total-row--addon {
    background: var(--so-violet-50);
  }

  .matrix__grand-total-row--addon td {
    border-top: 1px dashed var(--so-violet-200);
    font-weight: 600;
    font-size: 0.8125rem;
    color: var(--so-violet-700);
    padding: 0.5rem 1rem;
  }

  .matrix__grand-total-row--addon td:first-child {
    background: var(--so-violet-50);
  }

  /* Empty State */
  .matrix__empty {
    padding: 4rem 2rem;
    text-align: center;
  }

  .matrix__empty-icon {
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    color: var(--so-slate-300);
  }

  .matrix__empty-title {
    font-family: var(--so-font-sans);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--so-slate-900);
    margin-bottom: 0.5rem;
  }

  .matrix__empty-text {
    font-size: 0.875rem;
    color: var(--so-slate-500);
    max-width: 28rem;
    margin: 0 auto;
  }

  /* Detail Panel */
  .matrix__panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    z-index: 50;
    animation: panel-overlay-fade 0.2s ease-out;
  }

  @keyframes panel-overlay-fade {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(4px);
    }
  }

  .matrix__panel {
    width: 24rem;
    height: 100%;
    background: #ffffff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow-y: auto;
    animation: panel-slide-in 0.2s ease-out;
  }

  @keyframes panel-slide-in {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .matrix__panel-header {
    background: #7c3aed;
    color: #ffffff;
    padding: 1rem;
  }

  .matrix__panel-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .matrix__panel-tier {
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.8;
  }

  .matrix__panel-close {
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: #ffffff;
    cursor: pointer;
    border-radius: var(--so-radius-sm);
    transition: var(--so-transition-fast);
  }

  .matrix__panel-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .matrix__panel-close-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .matrix__panel-title {
    font-family: var(--so-font-sans);
    font-size: 1.125rem;
    font-weight: 600;
  }

  .matrix__panel-body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .matrix__panel-section-label {
    display: block;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.75rem;
  }

  .matrix__panel-level-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .matrix__panel-level-btn {
    padding: 0.625rem 0.875rem;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 500;
    color: #1e293b;
    border-radius: var(--so-radius-md);
    border: 2px solid #cbd5e1;
    background: #ffffff;
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .matrix__panel-level-btn:hover:not(.matrix__panel-level-btn--active) {
    border-color: #94a3b8;
    background: #f8fafc;
  }

  .matrix__panel-level-btn--active {
    border-color: #8b5cf6;
    background: #f5f3ff;
    color: #6d28d9;
    font-weight: 600;
  }

  .matrix__panel-input {
    width: 100%;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    color: #0f172a;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: var(--so-radius-md);
    padding: 0.625rem 0.875rem;
    outline: none;
    transition: var(--so-transition-fast);
  }

  .matrix__panel-input:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .matrix__panel-limits-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .matrix__panel-add-btn {
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #7c3aed;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .matrix__panel-add-btn:hover {
    color: #6d28d9;
  }

  .matrix__panel-empty-text {
    font-size: 0.8125rem;
    font-style: italic;
    color: #64748b;
  }

  .matrix__panel-limit-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: var(--so-radius-md);
    margin-bottom: 0.75rem;
  }

  .matrix__panel-limit-item:hover .matrix__panel-limit-actions {
    opacity: 1;
  }

  .matrix__panel-limit-content {
    flex: 1;
    cursor: pointer;
    padding: 0.25rem;
    margin: -0.25rem;
    border-radius: var(--so-radius-sm);
    transition: var(--so-transition-fast);
  }

  .matrix__panel-limit-content:hover {
    background: #e2e8f0;
  }

  .matrix__panel-limit-metric {
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f172a;
  }

  .matrix__panel-limit-value {
    font-size: 0.8125rem;
    color: #64748b;
  }

  .matrix__panel-limit-value-group {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .matrix__panel-limit-overage {
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    color: #059669;
    font-weight: 500;
  }

  /* Overage Pricing Section */
  .matrix__panel-overage-section {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #cbd5e1;
  }

  .matrix__panel-overage-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .matrix__panel-overage-price {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .matrix__panel-overage-currency {
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    color: #64748b;
  }

  .matrix__panel-overage-input {
    width: 4.5rem;
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: var(--so-radius-sm);
    padding: 0.375rem 0.5rem;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .matrix__panel-overage-input:focus {
    border-color: #7c3aed;
  }

  .matrix__panel-overage-separator {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .matrix__panel-overage-select {
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    color: #334155;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: var(--so-radius-sm);
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    outline: none;
  }

  .matrix__panel-overage-select:focus {
    border-color: #7c3aed;
  }

  .matrix__panel-overage-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .matrix__panel-limit-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: var(--so-transition-fast);
  }

  .matrix__panel-limit-btn {
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    border-radius: var(--so-radius-sm);
    transition: var(--so-transition-fast);
  }

  .matrix__panel-limit-btn:hover {
    background: #e2e8f0;
  }

  .matrix__panel-limit-btn--edit:hover {
    color: #7c3aed;
  }

  .matrix__panel-limit-btn--remove:hover {
    color: #e11d48;
  }

  .matrix__panel-limit-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Edit Form */
  .matrix__panel-edit-form {
    padding: 0.75rem;
    background: #f5f3ff;
    border-radius: var(--so-radius-md);
    margin-bottom: 0.75rem;
  }

  .matrix__panel-edit-form > div {
    margin-bottom: 0.625rem;
  }

  .matrix__panel-edit-form > div:last-child {
    margin-bottom: 0;
  }

  .matrix__panel-edit-label {
    display: block;
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    margin-bottom: 0.25rem;
  }

  .matrix__panel-edit-hint {
    font-size: 0.6875rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  .matrix__panel-edit-actions {
    display: flex;
    gap: 0.5rem;
  }

  .matrix__panel-edit-btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .matrix__panel-edit-btn--primary {
    background: #7c3aed;
    color: #ffffff;
    border: none;
  }

  .matrix__panel-edit-btn--primary:hover:not(:disabled) {
    background: #6d28d9;
  }

  .matrix__panel-edit-btn--primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .matrix__panel-edit-btn--secondary {
    background: #e2e8f0;
    color: #334155;
    border: none;
  }

  .matrix__panel-edit-btn--secondary:hover {
    background: #cbd5e1;
  }

  .matrix__panel-footer {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
  }

  .matrix__panel-done-btn {
    width: 100%;
    padding: 0.625rem 1rem;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    background: #7c3aed;
    color: #ffffff;
    border: none;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .matrix__panel-done-btn:hover {
    background: var(--so-violet-700);
  }

  /* Modal */
  .matrix__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: modal-backdrop 0.2s ease-out;
  }

  @keyframes modal-backdrop {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(4px);
    }
  }

  .matrix__modal {
    width: 24rem;
    background: #ffffff;
    border-radius: var(--so-radius-lg);
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.35),
      0 0 0 1px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    animation: modal-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes modal-pop {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .matrix__modal-title {
    font-family: var(--so-font-sans);
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
  }

  .matrix__modal-field {
    margin-bottom: 1.25rem;
  }

  .matrix__modal-label {
    display: block;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
  }

  .matrix__modal-input {
    width: 100%;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: #0f172a;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: var(--so-radius-md);
    padding: 0.75rem 1rem;
    outline: none;
    transition: var(--so-transition-fast);
  }

  .matrix__modal-input:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .matrix__modal-input::placeholder {
    color: #94a3b8;
  }

  .matrix__modal-hint {
    font-size: 0.8125rem;
    color: #475569;
    margin-bottom: 1.25rem;
    line-height: 1.5;
  }

  .matrix__modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 0.5rem;
  }

  .matrix__modal-btn {
    padding: 0.625rem 1.25rem;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .matrix__modal-btn--cancel {
    background: #e2e8f0;
    color: #475569;
    border: none;
  }

  .matrix__modal-btn--cancel:hover {
    background: #cbd5e1;
    color: #1e293b;
  }

  .matrix__modal-btn--primary {
    background: #7c3aed;
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
  }

  .matrix__modal-btn--primary:hover:not(:disabled) {
    background: #6d28d9;
    box-shadow: 0 4px 8px rgba(124, 58, 237, 0.4);
    transform: translateY(-1px);
  }

  .matrix__modal-btn--primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .matrix__modal-btn--primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .matrix__modal--wide {
    width: min(32rem, calc(100vw - 2rem));
    max-width: 32rem;
    max-height: 85vh;
    overflow-y: auto;
  }

  .matrix__modal-textarea {
    width: 100%;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: #0f172a;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: var(--so-radius-md);
    padding: 0.75rem 1rem;
    outline: none;
    transition: var(--so-transition-fast);
    resize: vertical;
    min-height: 80px;
  }

  .matrix__modal-textarea:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .matrix__modal-textarea::placeholder {
    color: #94a3b8;
  }

  .matrix__modal-tier-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }

  .matrix__modal-tier-option {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #ffffff;
    border: 2px solid #cbd5e1;
    border-radius: var(--so-radius-lg);
    cursor: pointer;
    transition: all var(--so-transition-fast);
    min-width: 0;
    overflow: hidden;
  }

  .matrix__modal-tier-option:hover {
    border-color: #a78bfa;
    background: #f5f3ff;
  }

  .matrix__modal-tier-option--selected {
    border-color: #8b5cf6;
    background: #f5f3ff;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .matrix__modal-tier-option--selected:hover {
    border-color: #7c3aed;
    background: #f5f3ff;
  }

  /* Custom checkbox styling */
  .matrix__modal-tier-checkbox {
    position: relative;
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    appearance: none;
    -webkit-appearance: none;
    background: #ffffff;
    border: 2px solid #94a3b8;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .matrix__modal-tier-checkbox:checked {
    background: #7c3aed;
    border-color: #7c3aed;
  }

  .matrix__modal-tier-checkbox:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.375rem;
    height: 0.625rem;
    border: 2px solid white;
    border-top: none;
    border-left: none;
    transform: translate(-50%, -60%) rotate(45deg);
  }

  .matrix__modal-tier-option:hover .matrix__modal-tier-checkbox:not(:checked) {
    border-color: #a78bfa;
  }

  .matrix__modal-tier-name {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .matrix__modal-tier-price {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .matrix__modal-tier-option--selected .matrix__modal-tier-name {
    color: #4c1d95;
  }

  .matrix__modal-tier-option--selected .matrix__modal-tier-price {
    color: #7c3aed;
  }

  .matrix__modal-tier-hint {
    font-size: 0.8125rem;
    color: #64748b;
    margin: 0.75rem 0 0;
    font-style: italic;
  }

  .matrix__modal-hint strong {
    color: #334155;
    font-weight: 600;
  }
`;

export function TheMatrix({ document, dispatch }: TheMatrixProps) {
  const { state } = document;
  const services = state.global.services ?? [];
  const tiers = state.global.tiers ?? [];
  const optionGroups = state.global.optionGroups ?? [];

  // Get selected facets from the offering document's facetTargets
  const offeringFacetTargets = state.global.facetTargets ?? [];

  // Build facet categories from the SERVICE OFFERING's selected facet targets
  // This ensures only the options selected in the offering's facet targeting appear in the Matrix
  const facetCategories = useMemo(() => {
    const categories: Record<
      string,
      { label: string; options: { id: string; label: string }[] }
    > = {};

    offeringFacetTargets.forEach((facet) => {
      categories[facet.categoryKey] = {
        label: facet.categoryLabel,
        options: facet.selectedOptions.map((option) => ({
          id: option.toLowerCase().replace(/\s+/g, "-"),
          label: option,
        })),
      };
    });

    return categories;
  }, [offeringFacetTargets]);

  const [enabledOptionalGroups, setEnabledOptionalGroups] = useState<
    Set<string>
  >(new Set(optionGroups.filter((g) => g.defaultSelected).map((g) => g.id)));

  const [selectedCell, setSelectedCell] = useState<{
    serviceId: string;
    tierId: string;
  } | null>(null);

  const [addServiceModal, setAddServiceModal] = useState<{
    groupId: string;
    isSetupFormation: boolean;
  } | null>(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceSelectedTiers, setNewServiceSelectedTiers] = useState<
    Set<string>
  >(new Set());

  // Edit service modal state
  const [editServiceModal, setEditServiceModal] = useState<Service | null>(
    null,
  );
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceDescription, setEditServiceDescription] = useState("");
  const [editServiceSelectedTiers, setEditServiceSelectedTiers] = useState<
    Set<string>
  >(new Set());

  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);

  // Selected billing cycle per tier (for tiers with multiple pricing options)
  const [selectedBillingCycles, setSelectedBillingCycles] = useState<
    Record<string, string>
  >({});

  // Initialize selected facets from offering's facet targets
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      offeringFacetTargets.forEach((facet) => {
        if (facet.selectedOptions.length > 0) {
          initial[facet.categoryKey] = facet.selectedOptions[0]
            .toLowerCase()
            .replace(/\s+/g, "-");
        }
      });
      return initial;
    },
  );

  // Metric editing modal state
  const [metricModal, setMetricModal] = useState<{
    serviceId: string;
    metric: string | null; // null means adding new metric
  } | null>(null);
  const [metricName, setMetricName] = useState("");
  const [metricLimits, setMetricLimits] = useState<Record<string, string>>({});
  const [metricEnabledTiers, setMetricEnabledTiers] = useState<Set<string>>(
    new Set(),
  );
  // Per-tier overage pricing for metric modal
  const [metricOveragePrices, setMetricOveragePrices] = useState<
    Record<string, string>
  >({});
  const [metricOverageCycles, setMetricOverageCycles] = useState<
    Record<string, BillingCycle | "">
  >({});
  // Unit name for the metric (e.g., "entity", "user", "API call")
  const [metricUnitName, setMetricUnitName] = useState("");
  // Per-tier paid limits for the metric modal (dual limits: freeLimit + paidLimit)
  const [metricPaidLimits, setMetricPaidLimits] = useState<
    Record<string, string>
  >({});
  // Reset cycle for the metric (shared across tiers)
  const [metricResetCycle, setMetricResetCycle] =
    useState<UsageResetCycle>("MONTHLY");

  // Service reordering state (not used - arrow buttons handle reorder directly)

  const getServiceGroup = (service: Service): string | null => {
    // Services now have optionGroupId directly on them
    return service.optionGroupId || null;
  };

  const groupedServices = useMemo(() => {
    const groups: Map<string, Service[]> = new Map();
    optionGroups.forEach((g) => groups.set(g.id, []));
    groups.set(UNGROUPED_ID, []);

    services.forEach((service) => {
      const groupId = getServiceGroup(service) || UNGROUPED_ID;
      const groupServices = groups.get(groupId) || [];
      groupServices.push(service);
      groups.set(groupId, groupServices);
    });

    // Sort services within each group by displayOrder
    groups.forEach((groupServices, _groupId) => {
      groupServices.sort((a, b) => {
        const orderA = a.displayOrder ?? 999;
        const orderB = b.displayOrder ?? 999;
        return orderA - orderB;
      });
    });

    return groups;
  }, [services, tiers, optionGroups]);

  const setupGroups = useMemo(() => {
    return optionGroups.filter((g) => g.costType === "SETUP");
  }, [optionGroups]);

  const regularGroups = useMemo(() => {
    return optionGroups.filter((g) => g.costType !== "SETUP" && !g.isAddOn);
  }, [optionGroups]);

  const addonGroups = useMemo(() => {
    return optionGroups.filter((g) => g.isAddOn);
  }, [optionGroups]);

  const ungroupedSetupServices = useMemo(() => {
    return (groupedServices.get(UNGROUPED_ID) || []).filter(
      (s) => s.isSetupFormation,
    );
  }, [groupedServices]);

  const ungroupedRegularServices = useMemo(() => {
    return (groupedServices.get(UNGROUPED_ID) || []).filter(
      (s) => !s.isSetupFormation,
    );
  }, [groupedServices]);

  const getServiceLevelForTier = (
    serviceId: string,
    tier: ServiceSubscriptionTier,
  ) => {
    return tier.serviceLevels.find((sl) => sl.serviceId === serviceId);
  };

  const getUniqueMetricsForService = (serviceId: string): string[] => {
    const metricsSet = new Set<string>();
    tiers.forEach((tier) => {
      tier.usageLimits
        .filter((ul) => ul.serviceId === serviceId)
        .forEach((ul) => metricsSet.add(ul.metric));
    });
    return Array.from(metricsSet);
  };

  // Incomplete services detection - services not assigned to any tier
  const incompleteServices = useMemo(() => {
    if (tiers.length === 0) return [];

    return services.filter((service) => {
      // Check if service is included in at least one tier
      const isIncludedAnywhere = tiers.some((tier) =>
        tier.serviceLevels.some(
          (sl) => sl.serviceId === service.id && sl.level === "INCLUDED",
        ),
      );
      return !isIncludedAnywhere;
    });
  }, [services, tiers]);

  const getUsageLimitForMetric = (
    serviceId: string,
    metric: string,
    tier: ServiceSubscriptionTier,
  ): ServiceUsageLimit | undefined => {
    return tier.usageLimits.find(
      (ul) => ul.serviceId === serviceId && ul.metric === metric,
    );
  };

  const handleSetServiceLevel = (
    serviceId: string,
    tierId: string,
    level: ServiceLevel,
    existingLevelId?: string,
    optionGroupId?: string,
  ) => {
    if (existingLevelId) {
      dispatch(
        updateServiceLevel({
          tierId,
          serviceLevelId: existingLevelId,
          level,
          lastModified: new Date().toISOString(),
        }),
      );
    } else {
      dispatch(
        addServiceLevel({
          tierId,
          serviceLevelId: generateId(),
          serviceId,
          level,
          optionGroupId,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const toggleOptionalGroup = (groupId: string) => {
    setEnabledOptionalGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleAddService = () => {
    if (!addServiceModal || !newServiceName.trim()) return;

    const newServiceId = generateId();
    const now = new Date().toISOString();

    // Add the service with optionGroupId directly on the service
    dispatch(
      addService({
        id: newServiceId,
        title: newServiceName.trim(),
        description: newServiceDescription.trim() || null,
        isSetupFormation: addServiceModal.isSetupFormation,
        optionGroupId:
          addServiceModal.groupId !== UNGROUPED_ID
            ? addServiceModal.groupId
            : undefined,
        lastModified: now,
      }),
    );

    // Create ServiceLevelBindings for each selected tier
    newServiceSelectedTiers.forEach((tierId) => {
      dispatch(
        addServiceLevel({
          tierId,
          serviceLevelId: generateId(),
          serviceId: newServiceId,
          level: "INCLUDED",
          optionGroupId:
            addServiceModal.groupId !== UNGROUPED_ID
              ? addServiceModal.groupId
              : undefined,
          lastModified: now,
        }),
      );
    });

    setNewServiceName("");
    setNewServiceDescription("");
    setNewServiceSelectedTiers(new Set());
    setAddServiceModal(null);
  };

  const openAddServiceModal = (groupId: string, isSetupFormation: boolean) => {
    setAddServiceModal({ groupId, isSetupFormation });
    setNewServiceName("");
    setNewServiceDescription("");
    setNewServiceSelectedTiers(new Set());
  };

  const openEditServiceModal = (service: Service) => {
    setEditServiceModal(service);
    setEditServiceName(service.title);
    setEditServiceDescription(service.description || "");
    // Initialize selected tiers based on current service levels
    const includedTiers = new Set<string>();
    tiers.forEach((tier) => {
      const serviceLevel = tier.serviceLevels.find(
        (sl) => sl.serviceId === service.id,
      );
      if (serviceLevel && serviceLevel.level === "INCLUDED") {
        includedTiers.add(tier.id);
      }
    });
    setEditServiceSelectedTiers(includedTiers);
  };

  const handleSaveEditService = () => {
    if (!editServiceModal || !editServiceName.trim()) return;
    const now = new Date().toISOString();

    // Update service name/description
    dispatch(
      updateService({
        id: editServiceModal.id,
        title: editServiceName.trim(),
        description: editServiceDescription.trim() || null,
        lastModified: now,
      }),
    );

    // Update tier assignments
    tiers.forEach((tier) => {
      const existingLevel = tier.serviceLevels.find(
        (sl) => sl.serviceId === editServiceModal.id,
      );
      const shouldBeIncluded = editServiceSelectedTiers.has(tier.id);

      if (shouldBeIncluded && !existingLevel) {
        // Add to tier
        dispatch(
          addServiceLevel({
            tierId: tier.id,
            serviceLevelId: generateId(),
            serviceId: editServiceModal.id,
            level: "INCLUDED",
            optionGroupId: editServiceModal.optionGroupId || undefined,
            lastModified: now,
          }),
        );
      } else if (
        shouldBeIncluded &&
        existingLevel &&
        existingLevel.level !== "INCLUDED"
      ) {
        // Update to included
        dispatch(
          updateServiceLevel({
            tierId: tier.id,
            serviceLevelId: existingLevel.id,
            level: "INCLUDED",
            lastModified: now,
          }),
        );
      } else if (
        !shouldBeIncluded &&
        existingLevel &&
        existingLevel.level === "INCLUDED"
      ) {
        // Remove from tier (set to NOT_INCLUDED)
        dispatch(
          updateServiceLevel({
            tierId: tier.id,
            serviceLevelId: existingLevel.id,
            level: "NOT_INCLUDED",
            lastModified: now,
          }),
        );
      }
    });

    setEditServiceModal(null);
    setEditServiceName("");
    setEditServiceDescription("");
    setEditServiceSelectedTiers(new Set());
  };

  // Metric modal handlers
  const handleAddMetric = (serviceId: string) => {
    setMetricModal({ serviceId, metric: null });
    setMetricName("");
    // Initialize limits for all tiers to empty string
    const initialLimits: Record<string, string> = {};
    const initialPaidLimits: Record<string, string> = {};
    const initialOveragePrices: Record<string, string> = {};
    const initialOverageCycles: Record<string, BillingCycle | ""> = {};
    // For new metrics, enable all tiers by default
    const allTierIds = new Set<string>();
    tiers.forEach((tier) => {
      initialLimits[tier.id] = "";
      initialPaidLimits[tier.id] = "";
      initialOveragePrices[tier.id] = "";
      initialOverageCycles[tier.id] = "";
      allTierIds.add(tier.id);
    });
    setMetricLimits(initialLimits);
    setMetricPaidLimits(initialPaidLimits);
    setMetricEnabledTiers(allTierIds);
    // Reset per-tier overage pricing and unit name
    setMetricOveragePrices(initialOveragePrices);
    setMetricOverageCycles(initialOverageCycles);
    setMetricUnitName("");
    setMetricResetCycle("MONTHLY");
  };

  const handleEditMetric = (serviceId: string, metric: string) => {
    setMetricModal({ serviceId, metric });
    setMetricName(metric);
    // Initialize limits with existing values and track which tiers have this metric
    const existingLimits: Record<string, string> = {};
    const existingPaidLimits: Record<string, string> = {};
    const existingOveragePrices: Record<string, string> = {};
    const existingOverageCycles: Record<string, BillingCycle | ""> = {};
    const enabledTiers = new Set<string>();
    let existingUnitName = "";
    let existingResetCycle: UsageResetCycle = "MONTHLY";
    tiers.forEach((tier) => {
      const usageLimit = tier.usageLimits.find(
        (ul) => ul.serviceId === serviceId && ul.metric === metric,
      );
      // Load value from either limit (numeric) or notes (string)
      existingLimits[tier.id] =
        usageLimit?.freeLimit?.toString() || usageLimit?.notes || "";
      existingPaidLimits[tier.id] = usageLimit?.paidLimit?.toString() || "";
      // Load per-tier overage pricing
      existingOveragePrices[tier.id] = usageLimit?.unitPrice?.toString() || "";
      existingOverageCycles[tier.id] = "";
      if (usageLimit) {
        enabledTiers.add(tier.id);
        // Get unit name from first tier that has it
        if (!existingUnitName && usageLimit.unitName) {
          existingUnitName = usageLimit.unitName;
        }
        // Get reset cycle from first tier that has it
        if (usageLimit.resetCycle) {
          existingResetCycle = usageLimit.resetCycle;
        }
      }
    });
    setMetricLimits(existingLimits);
    setMetricPaidLimits(existingPaidLimits);
    setMetricEnabledTiers(enabledTiers);
    setMetricOveragePrices(existingOveragePrices);
    setMetricOverageCycles(existingOverageCycles);
    setMetricUnitName(existingUnitName);
    setMetricResetCycle(existingResetCycle);
  };

  const handleRemoveMetric = (serviceId: string, metric: string) => {
    // Remove this metric from all tiers
    tiers.forEach((tier) => {
      const usageLimit = tier.usageLimits.find(
        (ul) => ul.serviceId === serviceId && ul.metric === metric,
      );
      if (usageLimit) {
        dispatch(
          removeUsageLimit({
            tierId: tier.id,
            limitId: usageLimit.id,
            lastModified: new Date().toISOString(),
          }),
        );
      }
    });
  };

  // Arrow button handler for service reordering
  const handleReorderService = (
    serviceId: string,
    direction: "up" | "down",
    groupServices: Service[],
  ) => {
    // Sort services by displayOrder for consistent ordering
    const sortedServices = [...groupServices].sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });

    const currentIndex = sortedServices.findIndex((s) => s.id === serviceId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= sortedServices.length) return;

    const now = new Date().toISOString();

    // Swap the two services
    const currentService = sortedServices[currentIndex];
    const swapService = sortedServices[newIndex];

    dispatch(
      updateService({
        id: currentService.id,
        displayOrder: newIndex,
        lastModified: now,
      }),
    );

    dispatch(
      updateService({
        id: swapService.id,
        displayOrder: currentIndex,
        lastModified: now,
      }),
    );
  };

  const handleSaveMetric = () => {
    if (!metricModal || !metricName.trim()) return;

    const { serviceId, metric: originalMetric } = metricModal;
    const now = new Date().toISOString();

    tiers.forEach((tier) => {
      const isEnabled = metricEnabledTiers.has(tier.id);
      const limitValue = metricLimits[tier.id];
      const existingLimit = originalMetric
        ? tier.usageLimits.find(
            (ul) => ul.serviceId === serviceId && ul.metric === originalMetric,
          )
        : null;

      // Check if value is numeric or string
      const parsedLimit = limitValue ? parseInt(limitValue, 10) : null;
      const isNumeric = parsedLimit !== null && !isNaN(parsedLimit);

      // Parse paid limit
      const paidLimitValue = metricPaidLimits[tier.id];
      const parsedPaidLimit = paidLimitValue
        ? parseInt(paidLimitValue, 10)
        : null;
      const isPaidNumeric = parsedPaidLimit !== null && !isNaN(parsedPaidLimit);

      // Get per-tier overage pricing
      const tierOveragePrice = metricOveragePrices[tier.id];
      const parsedOveragePrice = tierOveragePrice
        ? parseFloat(tierOveragePrice)
        : null;
      const hasOveragePricing =
        parsedOveragePrice !== null && !isNaN(parsedOveragePrice);

      if (existingLimit && !isEnabled) {
        // Remove limit - tier was disabled
        dispatch(
          removeUsageLimit({
            tierId: tier.id,
            limitId: existingLimit.id,
            lastModified: now,
          }),
        );
      } else if (existingLimit && isEnabled) {
        // Update existing limit - use limit for numeric values, notes for strings
        dispatch(
          updateUsageLimit({
            tierId: tier.id,
            limitId: existingLimit.id,
            metric: metricName.trim(),
            unitName: metricUnitName.trim() || undefined,
            freeLimit: isNumeric ? parsedLimit : null,
            paidLimit: isPaidNumeric ? parsedPaidLimit : null,
            notes: !isNumeric && limitValue ? limitValue.trim() : null,
            resetCycle: metricResetCycle,
            unitPrice: hasOveragePricing ? parsedOveragePrice : null,
            unitPriceCurrency: hasOveragePricing ? "USD" : undefined,
            lastModified: now,
          }),
        );
      } else if (!existingLimit && isEnabled) {
        // Add new limit - use limit for numeric values, notes for strings
        dispatch(
          addUsageLimit({
            tierId: tier.id,
            limitId: generateId(),
            serviceId,
            metric: metricName.trim(),
            unitName: metricUnitName.trim() || undefined,
            freeLimit: isNumeric ? parsedLimit : null,
            paidLimit: isPaidNumeric ? parsedPaidLimit : null,
            notes: !isNumeric && limitValue ? limitValue.trim() : null,
            resetCycle: metricResetCycle,
            unitPrice: hasOveragePricing ? parsedOveragePrice : undefined,
            unitPriceCurrency: hasOveragePricing ? "USD" : undefined,
            lastModified: now,
          }),
        );
      }
    });

    setMetricModal(null);
    setMetricName("");
    setMetricLimits({});
    setMetricPaidLimits({});
    setMetricEnabledTiers(new Set());
    setMetricOveragePrices({});
    setMetricOverageCycles({});
    setMetricUnitName("");
    setMetricResetCycle("MONTHLY");
  };

  const getLevelDisplay = (
    serviceLevel: ServiceLevelBinding | undefined,
  ): { label: string; color: string } => {
    if (!serviceLevel) return { label: "—", color: "var(--so-slate-300)" };

    const level = serviceLevel.level;
    const config = SERVICE_LEVELS.find((l) => l.value === level);

    if (level === "CUSTOM" && serviceLevel.customValue) {
      return {
        label: serviceLevel.customValue,
        color: config?.color || "var(--so-amber-600)",
      };
    }

    return {
      label: config?.shortLabel || level,
      color: config?.color || "var(--so-slate-600)",
    };
  };

  if (services.length === 0 || tiers.length === 0) {
    return (
      <>
        <style>{matrixStyles}</style>
        <div className="matrix">
          <div className="matrix__empty">
            <svg
              className="matrix__empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <h3 className="matrix__empty-title">Matrix Not Ready</h3>
            <p className="matrix__empty-text">
              {services.length === 0 && tiers.length === 0
                ? "Add services in the Service Catalog and tiers in Tier Definition to configure the matrix."
                : services.length === 0
                  ? "Add services in the Service Catalog to configure the matrix."
                  : "Add tiers in Tier Definition to configure the matrix."}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{matrixStyles}</style>
      <div className="matrix">
        {/* Facet Selector - Dynamic from Resource Template */}
        {Object.keys(facetCategories).length > 0 && (
          <div className="matrix__facets">
            <div className="matrix__facets-row">
              {Object.entries(facetCategories).map(([key, category]) => (
                <div key={key} className="matrix__facet-group">
                  <span className="matrix__facet-label">{category.label}</span>
                  {category.options.length <= 3 ? (
                    <div className="matrix__toggle-group">
                      {category.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setSelectedFacets((prev) => ({
                              ...prev,
                              [key]: option.id,
                            }))
                          }
                          className={`matrix__toggle-btn ${
                            selectedFacets[key] === option.id
                              ? "matrix__toggle-btn--active"
                              : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <select
                      value={
                        selectedFacets[key] || category.options[0]?.id || ""
                      }
                      onChange={(e) =>
                        setSelectedFacets((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="matrix__facet-select"
                    >
                      {category.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incomplete Services Warning */}
        {incompleteServices.length > 0 && (
          <div className="matrix__incomplete-warning">
            <div className="matrix__incomplete-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="matrix__incomplete-content">
              <span className="matrix__incomplete-title">
                {incompleteServices.length} service
                {incompleteServices.length !== 1 ? "s" : ""} not configured
              </span>
              <span className="matrix__incomplete-text">
                The following services are not included in any tier:{" "}
                <strong>
                  {incompleteServices
                    .slice(0, 3)
                    .map((s) => s.title)
                    .join(", ")}
                </strong>
                {incompleteServices.length > 3 &&
                  ` and ${incompleteServices.length - 3} more`}
              </span>
            </div>
          </div>
        )}

        <div className="matrix__table-wrap">
          <table className="matrix__table">
            <thead>
              <tr>
                <th className="matrix__corner-cell" />
                {tiers.map((tier, idx) => {
                  const hasPricingOptions =
                    tier.pricingOptions && tier.pricingOptions.length > 0;
                  const selectedCycleId = selectedBillingCycles[tier.id];
                  const activePricingOption = hasPricingOptions
                    ? tier.pricingOptions.find(
                        (po) => po.id === selectedCycleId,
                      ) ||
                      tier.pricingOptions.find((po) => po.isDefault) ||
                      tier.pricingOptions[0]
                    : null;
                  const displayAmount = activePricingOption
                    ? activePricingOption.amount
                    : tier.pricing.amount;

                  return (
                    <th
                      key={tier.id}
                      onClick={() => setSelectedTierIdx(idx)}
                      className={`matrix__tier-header ${
                        idx === selectedTierIdx
                          ? "matrix__tier-header--selected"
                          : ""
                      }`}
                    >
                      <div className="matrix__tier-header-inner">
                        <div className="matrix__tier-radio" />
                        <span className="matrix__tier-name">{tier.name}</span>
                        <span className="matrix__tier-price">
                          {tier.isCustomPricing
                            ? "Custom"
                            : displayAmount !== null
                              ? `$${displayAmount}/mo`
                              : "$null/mo"}
                        </span>
                        {/* Billing Cycle Selector for tiers with multiple options */}
                        {hasPricingOptions &&
                          tier.pricingOptions.length > 1 && (
                            <select
                              value={
                                selectedCycleId || activePricingOption?.id || ""
                              }
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedBillingCycles((prev) => ({
                                  ...prev,
                                  [tier.id]: e.target.value,
                                }));
                              }}
                              className="matrix__tier-cycle-select"
                            >
                              {tier.pricingOptions.map((po) => (
                                <option key={po.id} value={po.id}>
                                  ${po.amount}
                                </option>
                              ))}
                            </select>
                          )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={tiers.length + 1}
                  className="matrix__section-header"
                >
                  Service Catalog
                </td>
              </tr>

              {/* Setup & Formation category header */}
              {(setupGroups.length > 0 ||
                ungroupedSetupServices.length > 0) && (
                <tr>
                  <td
                    colSpan={tiers.length + 1}
                    className="matrix__category-header"
                  >
                    <span className="matrix__category-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      >
                        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                        <path d="M9 21v-6h6v6" />
                        <path d="M9 7h.01M9 11h.01M15 7h.01M15 11h.01" />
                      </svg>
                    </span>
                    Setup & Formation
                  </td>
                </tr>
              )}

              {setupGroups.map((group) => (
                <ServiceGroupSection
                  key={group.id}
                  group={group}
                  services={groupedServices.get(group.id) || []}
                  tiers={tiers}
                  isSetupFormation={true}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  onAddService={openAddServiceModal}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                />
              ))}

              {ungroupedSetupServices.length > 0 && (
                <ServiceGroupSection
                  key="ungrouped-setup"
                  group={{
                    id: UNGROUPED_ID,
                    name: "Setup & Formation",
                    description: null,
                    isAddOn: false,
                    defaultSelected: true,
                    billingCycle: null,
                    costType: null,
                    currency: null,
                    price: null,
                  }}
                  services={ungroupedSetupServices}
                  tiers={tiers}
                  isSetupFormation={true}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                />
              )}

              {/* Recurring Services category header */}
              {(regularGroups.length > 0 ||
                ungroupedRegularServices.length > 0) && (
                <tr>
                  <td
                    colSpan={tiers.length + 1}
                    className="matrix__category-header"
                  >
                    <span className="matrix__category-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    </span>
                    Recurring Services
                  </td>
                </tr>
              )}

              {regularGroups.map((group) => (
                <ServiceGroupSection
                  key={group.id}
                  group={group}
                  services={groupedServices.get(group.id) || []}
                  tiers={tiers}
                  isSetupFormation={false}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  onAddService={openAddServiceModal}
                  selectedTierIdx={selectedTierIdx}
                  dispatch={dispatch}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                />
              ))}

              {ungroupedRegularServices.length > 0 && (
                <ServiceGroupSection
                  key="ungrouped-regular"
                  group={{
                    id: UNGROUPED_ID,
                    name: "Recurring Services",
                    description: null,
                    isAddOn: false,
                    defaultSelected: true,
                    billingCycle: null,
                    costType: null,
                    currency: null,
                    price: null,
                  }}
                  services={ungroupedRegularServices}
                  tiers={tiers}
                  isSetupFormation={false}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                />
              )}

              <tr className="matrix__total-row">
                <td>SUBTOTAL</td>
                {tiers.map((tier) => (
                  <td key={tier.id} style={{ textAlign: "center" }}>
                    {tier.isCustomPricing
                      ? "Custom"
                      : `$${tier.pricing.amount}`}
                  </td>
                ))}
              </tr>

              {addonGroups.map((group) => (
                <ServiceGroupSection
                  key={group.id}
                  group={group}
                  services={groupedServices.get(group.id) || []}
                  tiers={tiers}
                  isSetupFormation={false}
                  isOptional={true}
                  isEnabled={enabledOptionalGroups.has(group.id)}
                  onToggle={() => toggleOptionalGroup(group.id)}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  onAddService={openAddServiceModal}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                />
              ))}

              {/* 1. Recurring Tier Price */}
              <tr className="matrix__grand-total-row">
                <td>Recurring Tier Price</td>
                {tiers.map((tier, idx) => (
                  <td
                    key={tier.id}
                    className={
                      idx === selectedTierIdx
                        ? "matrix__grand-total-cell--selected"
                        : ""
                    }
                    style={{ textAlign: "center" }}
                  >
                    {idx === selectedTierIdx
                      ? tier.isCustomPricing
                        ? "Custom"
                        : `${formatPrice(tier.pricing.amount || 0, tier.pricing.currency || "USD")}/mo`
                      : null}
                  </td>
                ))}
              </tr>

              {/* 2. Recurring Add-on Prices - each add-on shown separately with its billing cycle */}
              {addonGroups
                .filter(
                  (g) => enabledOptionalGroups.has(g.id) && g.price != null,
                )
                .map((g) => {
                  const billingLabel = g.billingCycle
                    ? `/${BILLING_CYCLE_SHORT_LABELS[g.billingCycle].toLowerCase()}`
                    : "/mo";
                  return (
                    <tr
                      key={`addon-recurring-${g.id}`}
                      className="matrix__grand-total-row matrix__grand-total-row--addon"
                    >
                      <td>+ {g.name}</td>
                      {tiers.map((tier, idx) => (
                        <td
                          key={tier.id}
                          className={
                            idx === selectedTierIdx
                              ? "matrix__grand-total-cell--selected"
                              : ""
                          }
                          style={{ textAlign: "center" }}
                        >
                          {idx === selectedTierIdx
                            ? `${formatPrice(g.price || 0, g.currency || "USD")}${billingLabel}`
                            : null}
                        </td>
                      ))}
                    </tr>
                  );
                })}

              {/* 3. Setup fees for services in add-on groups (one-time) */}
              {(() => {
                const addonSetupServices = addonGroups.flatMap((g) => {
                  if (!enabledOptionalGroups.has(g.id)) return [];
                  return (groupedServices.get(g.id) || []).filter(
                    (s) => s.costType === "SETUP" && s.price != null,
                  );
                });
                const addonSetupTotal = addonSetupServices.reduce(
                  (sum, s) => sum + (s.price || 0),
                  0,
                );
                if (addonSetupTotal === 0) return null;
                return (
                  <tr className="matrix__grand-total-row matrix__grand-total-row--setup">
                    <td>+ Add-on Setup Fees</td>
                    {tiers.map((tier, idx) => (
                      <td
                        key={tier.id}
                        className={
                          idx === selectedTierIdx
                            ? "matrix__grand-total-cell--selected"
                            : ""
                        }
                        style={{ textAlign: "center" }}
                      >
                        {idx === selectedTierIdx
                          ? `${formatPrice(addonSetupTotal, "USD")} one-time`
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })()}

              {/* 4. Setup & Formation Fees from setup groups (one-time) */}
              {(() => {
                const totalSetupGroupFee = setupGroups.reduce(
                  (sum, g) => sum + (g.price || 0),
                  0,
                );
                if (totalSetupGroupFee === 0) return null;
                return (
                  <tr className="matrix__grand-total-row matrix__grand-total-row--setup">
                    <td>+ Setup & Formation Fees</td>
                    {tiers.map((tier, idx) => (
                      <td
                        key={tier.id}
                        className={
                          idx === selectedTierIdx
                            ? "matrix__grand-total-cell--selected"
                            : ""
                        }
                        style={{ textAlign: "center" }}
                      >
                        {idx === selectedTierIdx
                          ? `${formatPrice(totalSetupGroupFee, "USD")} one-time`
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {selectedCell && (
          <ServiceLevelDetailPanel
            serviceId={selectedCell.serviceId}
            tierId={selectedCell.tierId}
            services={services}
            tiers={tiers}
            optionGroups={optionGroups}
            dispatch={dispatch}
            onClose={() => setSelectedCell(null)}
          />
        )}

        {addServiceModal && (
          <div className="matrix__modal-overlay">
            <div className="matrix__modal matrix__modal--wide">
              <h3 className="matrix__modal-title">Add New Service</h3>

              {/* Service Name */}
              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Service Name</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Enter service name"
                  className="matrix__modal-input"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Description (optional)
                </label>
                <textarea
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={2}
                  className="matrix__modal-textarea"
                />
              </div>

              {/* Tier Selection */}
              {tiers.length > 0 && (
                <div className="matrix__modal-field">
                  <label className="matrix__modal-label">
                    Include in Tiers
                  </label>
                  <div className="matrix__modal-tier-grid">
                    {tiers.map((tier) => {
                      const isSelected = newServiceSelectedTiers.has(tier.id);
                      return (
                        <label
                          key={tier.id}
                          className={`matrix__modal-tier-option ${isSelected ? "matrix__modal-tier-option--selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSet = new Set(newServiceSelectedTiers);
                              if (e.target.checked) {
                                newSet.add(tier.id);
                              } else {
                                newSet.delete(tier.id);
                              }
                              setNewServiceSelectedTiers(newSet);
                            }}
                            className="matrix__modal-tier-checkbox"
                          />
                          <span className="matrix__modal-tier-name">
                            {tier.name}
                          </span>
                          {tier.pricing.amount !== null && (
                            <span className="matrix__modal-tier-price">
                              ${tier.pricing.amount}/mo
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {newServiceSelectedTiers.size === 0 && (
                    <p className="matrix__modal-tier-hint">
                      Select at least one tier to include this service
                    </p>
                  )}
                </div>
              )}

              <p className="matrix__modal-hint">
                This service will be added to{" "}
                <strong>
                  {addServiceModal.groupId !== UNGROUPED_ID
                    ? optionGroups.find((g) => g.id === addServiceModal.groupId)
                        ?.name || "Unknown Group"
                    : "Ungrouped Services"}
                </strong>{" "}
                as a{" "}
                {addServiceModal.isSetupFormation
                  ? "Setup/Formation"
                  : "Recurring"}{" "}
                service.
              </p>

              <div className="matrix__modal-actions">
                <button
                  onClick={() => {
                    setAddServiceModal(null);
                    setNewServiceName("");
                    setNewServiceDescription("");
                    setNewServiceSelectedTiers(new Set());
                  }}
                  className="matrix__modal-btn matrix__modal-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  disabled={
                    !newServiceName.trim() || newServiceSelectedTiers.size === 0
                  }
                  className="matrix__modal-btn matrix__modal-btn--primary"
                >
                  Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {editServiceModal && (
          <div className="matrix__modal-overlay">
            <div className="matrix__modal matrix__modal--wide">
              <h3 className="matrix__modal-title">Edit Service</h3>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Service Name</label>
                <input
                  type="text"
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  placeholder="Enter service name"
                  className="matrix__modal-input"
                  autoFocus
                />
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Description (optional)
                </label>
                <textarea
                  value={editServiceDescription}
                  onChange={(e) => setEditServiceDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={2}
                  className="matrix__modal-textarea"
                />
              </div>

              {/* Tier Selection */}
              {tiers.length > 0 && (
                <div className="matrix__modal-field">
                  <label className="matrix__modal-label">
                    Include in Tiers
                  </label>
                  <div className="matrix__modal-tier-grid">
                    {tiers.map((tier) => {
                      const isSelected = editServiceSelectedTiers.has(tier.id);
                      return (
                        <label
                          key={tier.id}
                          className={`matrix__modal-tier-option ${isSelected ? "matrix__modal-tier-option--selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSet = new Set(editServiceSelectedTiers);
                              if (e.target.checked) {
                                newSet.add(tier.id);
                              } else {
                                newSet.delete(tier.id);
                              }
                              setEditServiceSelectedTiers(newSet);
                            }}
                            className="matrix__modal-tier-checkbox"
                          />
                          <span className="matrix__modal-tier-name">
                            {tier.name}
                          </span>
                          {tier.pricing.amount !== null && (
                            <span className="matrix__modal-tier-price">
                              ${tier.pricing.amount}/mo
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="matrix__modal-actions">
                <button
                  onClick={() => {
                    setEditServiceModal(null);
                    setEditServiceName("");
                    setEditServiceDescription("");
                    setEditServiceSelectedTiers(new Set());
                  }}
                  className="matrix__modal-btn matrix__modal-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditService}
                  disabled={!editServiceName.trim()}
                  className="matrix__modal-btn matrix__modal-btn--primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Metric Edit Modal */}
        {metricModal && (
          <div className="matrix__modal-overlay">
            <div className="matrix__modal matrix__modal--wide">
              <h3 className="matrix__modal-title">
                {metricModal.metric ? "Edit Metric" : "Add Metric"}
              </h3>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Metric Name</label>
                <input
                  type="text"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  placeholder="e.g., Number of Entities, API Calls, Storage"
                  className="matrix__modal-input"
                  autoFocus
                />
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Unit Name (Optional)
                </label>
                <input
                  type="text"
                  value={metricUnitName}
                  onChange={(e) => setMetricUnitName(e.target.value)}
                  placeholder="e.g., entity, user, API call, GB"
                  className="matrix__modal-input"
                />
                <p
                  className="matrix__modal-hint"
                  style={{ marginTop: "0.375rem" }}
                >
                  Used for overage pricing (e.g., "$50/entity above free limit")
                </p>
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Reset Cycle</label>
                <select
                  value={metricResetCycle}
                  onChange={(e) =>
                    setMetricResetCycle(e.target.value as UsageResetCycle)
                  }
                  className="matrix__modal-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
                <p
                  className="matrix__modal-hint"
                  style={{ marginTop: "0.375rem" }}
                >
                  How often usage limits reset
                </p>
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Pricing Tiers & Values
                </label>
                <p
                  className="matrix__modal-hint"
                  style={{ marginBottom: "0.75rem" }}
                >
                  Enable the metric for each tier and set values.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {tiers.map((tier) => {
                    const isEnabled = metricEnabledTiers.has(tier.id);
                    const tierOveragePrice = metricOveragePrices[tier.id] || "";
                    return (
                      <div
                        key={tier.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          borderRadius: "6px",
                          background: isEnabled
                            ? "rgba(124, 58, 237, 0.05)"
                            : "#f8fafc",
                          border: isEnabled
                            ? "1px solid rgba(124, 58, 237, 0.2)"
                            : "1px solid #e2e8f0",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: "pointer",
                              minWidth: "120px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                setMetricEnabledTiers((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) {
                                    next.add(tier.id);
                                  } else {
                                    next.delete(tier.id);
                                  }
                                  return next;
                                });
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                accentColor: "#7c3aed",
                                cursor: "pointer",
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 600,
                                color: isEnabled ? "#334155" : "#94a3b8",
                                fontSize: "0.875rem",
                              }}
                            >
                              {tier.name}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={metricLimits[tier.id] || ""}
                            onChange={(e) =>
                              setMetricLimits((prev) => ({
                                ...prev,
                                [tier.id]: e.target.value,
                              }))
                            }
                            placeholder={isEnabled ? "Free limit" : "—"}
                            className="matrix__modal-input"
                            disabled={!isEnabled}
                            style={{
                              flex: 1,
                              opacity: isEnabled ? 1 : 0.5,
                              cursor: isEnabled ? "text" : "not-allowed",
                            }}
                          />
                          <input
                            type="text"
                            value={metricPaidLimits[tier.id] || ""}
                            onChange={(e) =>
                              setMetricPaidLimits((prev) => ({
                                ...prev,
                                [tier.id]: e.target.value,
                              }))
                            }
                            placeholder={isEnabled ? "Paid limit" : "—"}
                            className="matrix__modal-input"
                            disabled={!isEnabled}
                            style={{
                              flex: 1,
                              opacity: isEnabled ? 1 : 0.5,
                              cursor: isEnabled ? "text" : "not-allowed",
                            }}
                          />
                        </div>
                        {/* Per-tier overage pricing */}
                        {isEnabled && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginLeft: "1.75rem",
                              padding: "0.5rem 0.75rem",
                              background: "rgba(255,255,255,0.6)",
                              borderRadius: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Overage price:
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--so-font-mono)",
                                fontSize: "0.8125rem",
                                color: "#64748b",
                              }}
                            >
                              $
                            </span>
                            <input
                              type="number"
                              value={tierOveragePrice}
                              onChange={(e) =>
                                setMetricOveragePrices((prev) => ({
                                  ...prev,
                                  [tier.id]: e.target.value,
                                }))
                              }
                              placeholder="0.00"
                              step="0.01"
                              style={{
                                width: "4rem",
                                fontFamily: "var(--so-font-mono)",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                color: "#0f172a",
                                background: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                padding: "0.25rem 0.375rem",
                                outline: "none",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                color: "#64748b",
                              }}
                            >
                              per {metricUnitName || "unit"} above free limit
                              {metricResetCycle
                                ? ` / ${metricResetCycle.toLowerCase()}`
                                : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="matrix__modal-actions">
                <button
                  onClick={() => {
                    setMetricModal(null);
                    setMetricName("");
                    setMetricUnitName("");
                    setMetricLimits({});
                    setMetricPaidLimits({});
                    setMetricEnabledTiers(new Set());
                    setMetricOveragePrices({});
                    setMetricOverageCycles({});
                    setMetricResetCycle("MONTHLY");
                  }}
                  className="matrix__modal-btn matrix__modal-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMetric}
                  disabled={!metricName.trim() || metricEnabledTiers.size === 0}
                  className="matrix__modal-btn matrix__modal-btn--primary"
                >
                  {metricModal.metric ? "Save Changes" : "Add Metric"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface ServiceGroupSectionProps {
  group: OptionGroup;
  services: Service[];
  tiers: ServiceSubscriptionTier[];
  isSetupFormation: boolean;
  isOptional: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  getServiceLevelForTier: (
    serviceId: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceLevelBinding | undefined;
  getUniqueMetricsForService: (serviceId: string) => string[];
  getUsageLimitForMetric: (
    serviceId: string,
    metric: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceUsageLimit | undefined;
  getLevelDisplay: (serviceLevel: ServiceLevelBinding | undefined) => {
    label: string;
    color: string;
  };
  selectedCell: { serviceId: string; tierId: string } | null;
  setSelectedCell: (cell: { serviceId: string; tierId: string } | null) => void;
  handleSetServiceLevel: (
    serviceId: string,
    tierId: string,
    level: ServiceLevel,
    existingLevelId?: string,
    optionGroupId?: string,
  ) => void;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onAddService?: (groupId: string, isSetupFormation: boolean) => void;
  selectedTierIdx: number;
  onAddMetric: (serviceId: string) => void;
  onEditMetric: (serviceId: string, metric: string) => void;
  onRemoveMetric: (serviceId: string, metric: string) => void;
  onEditService: (service: Service) => void;
  onReorderService: (
    serviceId: string,
    direction: "up" | "down",
    groupServices: Service[],
  ) => void;
}

function ServiceGroupSection({
  group,
  services,
  tiers,
  isSetupFormation,
  isOptional,
  isEnabled,
  onToggle,
  getServiceLevelForTier,
  getUniqueMetricsForService,
  getUsageLimitForMetric,
  getLevelDisplay,
  selectedCell,
  setSelectedCell,
  onAddService,
  selectedTierIdx,
  onAddMetric,
  onEditMetric,
  onRemoveMetric,
  onEditService,
  onReorderService,
}: ServiceGroupSectionProps) {
  const showGroup = services.length > 0 || onAddService;
  if (!showGroup) return null;

  const headerClass = isSetupFormation
    ? "matrix__group-header--setup"
    : isOptional
      ? "matrix__group-header--optional"
      : "matrix__group-header--regular";

  const rowClass = isSetupFormation
    ? "matrix__service-row--setup"
    : isOptional
      ? "matrix__service-row--optional"
      : "matrix__service-row--regular";

  return (
    <>
      <tr className={`matrix__group-header ${headerClass}`}>
        <td className={`matrix__group-header-sticky ${headerClass}`}>
          <div className="matrix__group-header-inner">
            {isOptional && (
              <button
                onClick={onToggle}
                className={`matrix__group-toggle ${isEnabled ? "matrix__group-toggle--on" : "matrix__group-toggle--off"}`}
              >
                <span className="matrix__group-toggle-knob" />
              </button>
            )}
            <span className="matrix__group-name">{group.name}</span>
            {group.billingCycle && (
              <span className="matrix__group-billing-badge">
                {BILLING_CYCLE_SHORT_LABELS[group.billingCycle]}
              </span>
            )}
            {group.isAddOn && group.price != null && (
              <span className="matrix__group-price-badge">
                {formatPrice(group.price, group.currency || "USD")}
              </span>
            )}
          </div>
        </td>
        <td
          colSpan={tiers.length}
          className={headerClass}
          style={{ textAlign: "center" }}
        >
          <span
            className={`matrix__group-badge ${
              isSetupFormation || !isOptional
                ? "matrix__group-badge--included"
                : "matrix__group-badge--optional"
            }`}
          >
            {isSetupFormation
              ? "INCLUDED"
              : isOptional
                ? "OPTIONAL"
                : "INCLUDED"}
          </span>
        </td>
      </tr>

      {services.map((service) => {
        const metrics = getUniqueMetricsForService(service.id);

        return (
          <ServiceRowWithMetrics
            key={service.id}
            service={service}
            metrics={metrics}
            tiers={tiers}
            rowClass={rowClass}
            getServiceLevelForTier={getServiceLevelForTier}
            getUsageLimitForMetric={getUsageLimitForMetric}
            getLevelDisplay={getLevelDisplay}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            selectedTierIdx={selectedTierIdx}
            onAddMetric={onAddMetric}
            onEditMetric={onEditMetric}
            onRemoveMetric={onRemoveMetric}
            onEditService={onEditService}
            onReorderService={onReorderService}
            groupServices={services}
            serviceIndex={services.indexOf(service)}
          />
        );
      })}

      {onAddService && group.id !== "__ungrouped__" && (
        <tr className={`matrix__add-service-row ${rowClass}`}>
          <td className={rowClass}>
            <button
              onClick={() => onAddService(group.id, isSetupFormation)}
              className="matrix__add-service-btn"
            >
              <svg
                className="matrix__add-service-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add a Service
            </button>
          </td>
          <td colSpan={tiers.length} className={rowClass} />
        </tr>
      )}

      {isSetupFormation && (
        <tr className="matrix__setup-total-row">
          <td>TOTAL SETUP FEE</td>
          <td colSpan={tiers.length} style={{ textAlign: "center" }}>
            {group.price
              ? `${formatPrice(group.price, group.currency || "USD")} flat fee (applied to all tiers)`
              : "No setup fee configured"}
          </td>
        </tr>
      )}

      {isOptional && (
        <>
          {/* Show setup services within this add-on as a separate line */}
          {(() => {
            const setupServicesInGroup = services.filter(
              (s) => s.costType === "SETUP" && s.price != null,
            );
            if (setupServicesInGroup.length === 0) return null;
            const setupTotal = setupServicesInGroup.reduce(
              (sum, s) => sum + (s.price || 0),
              0,
            );
            return (
              <tr className="matrix__setup-total-row">
                <td>Setup fees ({group.name})</td>
                <td colSpan={tiers.length} style={{ textAlign: "center" }}>
                  {isEnabled
                    ? `${formatPrice(setupTotal, group.currency || "USD")} one-time`
                    : "—"}
                </td>
              </tr>
            );
          })()}
          <tr className={`matrix__total-row ${headerClass}`}>
            <td className={headerClass}>SUBTOTAL</td>
            {tiers.map((tier, tierIdx) => {
              const recurringPrice = isEnabled && group.price ? group.price : 0;
              const billingLabel = group.billingCycle
                ? `/${BILLING_CYCLE_SHORT_LABELS[group.billingCycle].toLowerCase()}`
                : "/mo";

              return (
                <td
                  key={tier.id}
                  style={{
                    textAlign: "center",
                    background:
                      tierIdx === selectedTierIdx && isEnabled
                        ? "var(--so-violet-200)"
                        : undefined,
                    color:
                      tierIdx === selectedTierIdx && isEnabled
                        ? "var(--so-violet-900)"
                        : undefined,
                  }}
                >
                  {isEnabled && recurringPrice > 0
                    ? `+${formatPrice(recurringPrice, group.currency || "USD")}${billingLabel}`
                    : isEnabled
                      ? "Included"
                      : "—"}
                </td>
              );
            })}
          </tr>
        </>
      )}
    </>
  );
}

interface ServiceRowWithMetricsProps {
  service: Service;
  metrics: string[];
  tiers: ServiceSubscriptionTier[];
  rowClass: string;
  getServiceLevelForTier: (
    serviceId: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceLevelBinding | undefined;
  getUsageLimitForMetric: (
    serviceId: string,
    metric: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceUsageLimit | undefined;
  getLevelDisplay: (serviceLevel: ServiceLevelBinding | undefined) => {
    label: string;
    color: string;
  };
  selectedCell: { serviceId: string; tierId: string } | null;
  setSelectedCell: (cell: { serviceId: string; tierId: string } | null) => void;
  selectedTierIdx: number;
  onAddMetric: (serviceId: string) => void;
  onEditMetric: (serviceId: string, metric: string) => void;
  onRemoveMetric: (serviceId: string, metric: string) => void;
  onEditService: (service: Service) => void;
  onReorderService: (
    serviceId: string,
    direction: "up" | "down",
    groupServices: Service[],
  ) => void;
  groupServices: Service[];
  serviceIndex: number;
}

function ServiceRowWithMetrics({
  service,
  metrics,
  tiers,
  rowClass,
  getServiceLevelForTier,
  getUsageLimitForMetric,
  getLevelDisplay,
  selectedCell,
  setSelectedCell,
  selectedTierIdx,
  onAddMetric,
  onEditMetric,
  onRemoveMetric,
  onEditService,
  onReorderService,
  groupServices,
  serviceIndex,
}: ServiceRowWithMetricsProps) {
  const isFirst = serviceIndex === 0;
  const isLast = serviceIndex === groupServices.length - 1;

  return (
    <>
      <tr className={`matrix__service-row ${rowClass}`}>
        <td className={`matrix__service-cell ${rowClass}`}>
          <div className="matrix__service-cell-wrapper">
            {/* Reorder arrows */}
            <div className="matrix__reorder-buttons">
              <button
                className="matrix__reorder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReorderService(service.id, "up", groupServices);
                }}
                disabled={isFirst}
                title="Move up"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
              <button
                className="matrix__reorder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReorderService(service.id, "down", groupServices);
                }}
                disabled={isLast}
                title="Move down"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            <button
              className="matrix__service-title matrix__service-title--clickable"
              onClick={(e) => {
                e.stopPropagation();
                onEditService(service);
              }}
              title="Click to edit service"
            >
              {service.title}
            </button>
            {service.costType === "SETUP" && (
              <span className="matrix__service-setup-badge">Setup</span>
            )}
            {service.costType === "SETUP" && service.price != null && (
              <span className="matrix__service-setup-price">
                {formatPrice(service.price, service.currency || "USD")}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddMetric(service.id);
              }}
              className="matrix__add-metric-btn"
              title="Add metric to this service"
            >
              + Metric
            </button>
          </div>
        </td>
        {tiers.map((tier, tierIdx) => {
          const serviceLevel = getServiceLevelForTier(service.id, tier);
          const display = getLevelDisplay(serviceLevel);
          const isSelected =
            selectedCell?.serviceId === service.id &&
            selectedCell?.tierId === tier.id;
          const isNotIncluded =
            !serviceLevel || serviceLevel.level === "NOT_INCLUDED";

          // Find next tier that has this service included (for upgrade hint)
          const nextTierWithService = isNotIncluded
            ? tiers.slice(tierIdx + 1).find((t) => {
                const sl = getServiceLevelForTier(service.id, t);
                return sl && sl.level === "INCLUDED";
              })
            : null;

          return (
            <td
              key={tier.id}
              className={`matrix__level-cell ${
                isSelected ? "matrix__level-cell--selected" : ""
              } ${tierIdx === selectedTierIdx ? "matrix__level-cell--highlight" : ""} ${
                isNotIncluded ? "matrix__level-cell--not-included" : ""
              }`}
              onClick={() =>
                setSelectedCell(
                  isSelected
                    ? null
                    : { serviceId: service.id, tierId: tier.id },
                )
              }
            >
              <span
                className={`matrix__level-value ${isNotIncluded ? "matrix__level-value--not-included" : ""}`}
                style={{ color: display.color }}
              >
                {display.label}
              </span>
              {/* Loss Aversion: Show upgrade hint for NOT_INCLUDED */}
              {isNotIncluded && nextTierWithService && (
                <span className="matrix__upgrade-hint">
                  In {nextTierWithService.name} →
                </span>
              )}
            </td>
          );
        })}
      </tr>

      {metrics.map((metric) => (
        <tr
          key={`${service.id}-${metric}`}
          className={`matrix__metric-row ${rowClass}`}
          onClick={() => onEditMetric(service.id, metric)}
        >
          <td className={`matrix__metric-cell ${rowClass}`}>
            <div className="matrix__metric-name-wrapper">
              <span className="matrix__metric-name">{metric}</span>
              <div className="matrix__metric-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMetric(service.id, metric);
                  }}
                  className="matrix__metric-btn matrix__metric-btn--edit"
                  title="Edit metric"
                >
                  <svg
                    className="matrix__metric-btn-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMetric(service.id, metric);
                  }}
                  className="matrix__metric-btn matrix__metric-btn--remove"
                  title="Remove metric"
                >
                  <svg
                    className="matrix__metric-btn-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </td>
          {tiers.map((tier, tierIdx) => {
            const usageLimit = getUsageLimitForMetric(service.id, metric, tier);

            return (
              <td
                key={tier.id}
                className={`matrix__metric-value-cell ${
                  tierIdx === selectedTierIdx
                    ? "matrix__level-cell--highlight"
                    : ""
                }`}
              >
                <div className="matrix__metric-value-container">
                  <span className="matrix__metric-value">
                    {usageLimit
                      ? usageLimit.freeLimit
                        ? `Free: ${usageLimit.freeLimit}${usageLimit.paidLimit ? ` / Paid: ${usageLimit.paidLimit}` : ""}`
                        : usageLimit.notes || "Unlimited"
                      : "—"}
                  </span>
                  {usageLimit?.resetCycle && (
                    <span className="matrix__metric-reset-cycle">
                      {usageLimit.resetCycle.toLowerCase()}
                    </span>
                  )}
                  {usageLimit?.unitPrice != null && (
                    <span className="matrix__metric-overage">
                      +
                      {formatPrice(
                        usageLimit.unitPrice,
                        usageLimit.unitPriceCurrency || "USD",
                      )}
                      /{usageLimit.unitName || "unit"} above free
                      {usageLimit.resetCycle
                        ? ` / ${usageLimit.resetCycle.toLowerCase()}`
                        : ""}
                    </span>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

interface ServiceLevelDetailPanelProps {
  serviceId: string;
  tierId: string;
  services: Service[];
  tiers: ServiceSubscriptionTier[];
  optionGroups: OptionGroup[];
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onClose: () => void;
}

function ServiceLevelDetailPanel({
  serviceId,
  tierId,
  services,
  tiers,
  optionGroups: _optionGroups,
  dispatch,
  onClose,
}: ServiceLevelDetailPanelProps) {
  const service = services.find((s) => s.id === serviceId);
  const tier = tiers.find((t) => t.id === tierId);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Scroll lock when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus trap - keep focus inside the panel
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, []);

  // Click outside to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const serviceLevel = service
    ? tier?.serviceLevels.find((sl) => sl.serviceId === serviceId)
    : undefined;
  const usageLimits = service
    ? tier?.usageLimits.filter((ul) => ul.serviceId === serviceId) || []
    : [];

  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetric, setNewMetric] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [customValue, setCustomValue] = useState(
    serviceLevel?.customValue || "",
  );

  if (!service || !tier) return null;

  const handleAddLimit = () => {
    if (!newMetric.trim()) return;
    const parsedLimit = newLimit ? parseInt(newLimit, 10) : null;
    const isNumeric = parsedLimit !== null && !isNaN(parsedLimit);
    dispatch(
      addUsageLimit({
        tierId: tier.id,
        limitId: generateId(),
        serviceId: service.id,
        metric: newMetric.trim(),
        freeLimit: isNumeric ? parsedLimit : undefined,
        notes: !isNumeric && newLimit ? newLimit.trim() : undefined,
        resetCycle: "MONTHLY",
        lastModified: new Date().toISOString(),
      }),
    );
    setNewMetric("");
    setNewLimit("");
    setIsAddingMetric(false);
  };

  const handleRemoveLimit = (limitId: string) => {
    dispatch(
      removeUsageLimit({
        tierId: tier.id,
        limitId,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  return (
    <div
      ref={overlayRef}
      className="matrix__panel-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      <div ref={panelRef} className="matrix__panel">
        <div className="matrix__panel-header">
          <div className="matrix__panel-header-top">
            <span className="matrix__panel-tier">{tier.name} Tier</span>
            <button onClick={onClose} className="matrix__panel-close">
              <svg
                className="matrix__panel-close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <h3 id="panel-title" className="matrix__panel-title">
            {service.title}
          </h3>
        </div>

        <div className="matrix__panel-body">
          <div>
            <div className="matrix__panel-limits-header">
              <label
                className="matrix__panel-section-label"
                style={{ marginBottom: 0 }}
              >
                Metrics
              </label>
              <button
                onClick={() => setIsAddingMetric(true)}
                className="matrix__panel-add-btn"
              >
                + Add Metric
              </button>
            </div>

            {usageLimits.map((limit) => (
              <MetricLimitItem
                key={limit.id}
                limit={limit}
                tierId={tier.id}
                dispatch={dispatch}
                onRemove={() => handleRemoveLimit(limit.id)}
              />
            ))}

            {usageLimits.length === 0 && !isAddingMetric && (
              <p className="matrix__panel-empty-text">
                No metrics added yet. Metrics will appear as nested rows under
                this service in the matrix.
              </p>
            )}

            {isAddingMetric && (
              <div className="matrix__panel-edit-form">
                <div>
                  <label className="matrix__panel-edit-label">
                    Metric Name
                  </label>
                  <input
                    type="text"
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                    placeholder="e.g., API Calls, Storage, Users"
                    className="matrix__panel-input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="matrix__panel-edit-label">Value</label>
                  <input
                    type="text"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder="e.g., 100, Unlimited, Custom"
                    className="matrix__panel-input"
                  />
                  <p className="matrix__panel-edit-hint">
                    Enter a value or leave empty
                  </p>
                </div>
                <div className="matrix__panel-edit-actions">
                  <button
                    onClick={handleAddLimit}
                    disabled={!newMetric.trim()}
                    className="matrix__panel-edit-btn matrix__panel-edit-btn--primary"
                  >
                    Add Metric
                  </button>
                  <button
                    onClick={() => {
                      setNewMetric("");
                      setNewLimit("");
                      setIsAddingMetric(false);
                    }}
                    className="matrix__panel-edit-btn matrix__panel-edit-btn--secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="matrix__panel-footer">
          <button onClick={onClose} className="matrix__panel-done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricLimitItemProps {
  limit: ServiceUsageLimit;
  tierId: string;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onRemove: () => void;
}

function MetricLimitItem({
  limit,
  tierId,
  dispatch,
  onRemove,
}: MetricLimitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMetric, setEditMetric] = useState(limit.metric);
  const [editUnitName, setEditUnitName] = useState(limit.unitName || "");
  const [editLimit, setEditLimit] = useState(
    limit.freeLimit?.toString() || limit.notes || "",
  );
  const [editPaidLimit, setEditPaidLimit] = useState(
    limit.paidLimit?.toString() || "",
  );
  const [editResetCycle, setEditResetCycle] = useState<UsageResetCycle>(
    limit.resetCycle || "MONTHLY",
  );
  // Overage pricing state
  const [editUnitPrice, setEditUnitPrice] = useState(
    limit.unitPrice?.toString() || "",
  );
  const [editUnitPriceCurrency] = useState(limit.unitPriceCurrency || "USD");

  const handleSave = () => {
    const parsedLimit = editLimit ? parseInt(editLimit, 10) : null;
    const isNumeric = parsedLimit !== null && !isNaN(parsedLimit);
    const parsedPaidLimit = editPaidLimit ? parseInt(editPaidLimit, 10) : null;
    const isPaidNumeric = parsedPaidLimit !== null && !isNaN(parsedPaidLimit);
    const parsedUnitPrice = editUnitPrice ? parseFloat(editUnitPrice) : null;
    dispatch(
      updateUsageLimit({
        tierId,
        limitId: limit.id,
        metric: editMetric.trim() || limit.metric,
        unitName: editUnitName.trim() || undefined,
        freeLimit: isNumeric ? parsedLimit : undefined,
        paidLimit: isPaidNumeric ? parsedPaidLimit : undefined,
        notes: !isNumeric && editLimit ? editLimit.trim() : undefined,
        resetCycle: editResetCycle,
        unitPrice: parsedUnitPrice,
        unitPriceCurrency: parsedUnitPrice ? editUnitPriceCurrency : undefined,
        lastModified: new Date().toISOString(),
      }),
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditMetric(limit.metric);
    setEditUnitName(limit.unitName || "");
    setEditLimit(limit.freeLimit?.toString() || limit.notes || "");
    setEditPaidLimit(limit.paidLimit?.toString() || "");
    setEditResetCycle(limit.resetCycle || "MONTHLY");
    setEditUnitPrice(limit.unitPrice?.toString() || "");
    setIsEditing(false);
  };

  // Format overage display string
  const getOverageDisplay = () => {
    if (!limit.unitPrice) return null;
    const unitLabel = limit.unitName || "unit";
    return `+${formatPrice(limit.unitPrice, limit.unitPriceCurrency || "USD")} per ${unitLabel}`;
  };

  const overageDisplay = getOverageDisplay();

  if (isEditing) {
    return (
      <div className="matrix__panel-edit-form">
        <div>
          <label className="matrix__panel-edit-label">Metric Name</label>
          <input
            type="text"
            value={editMetric}
            onChange={(e) => setEditMetric(e.target.value)}
            placeholder="e.g., Number of Entities"
            className="matrix__panel-input"
            autoFocus
          />
        </div>
        <div>
          <label className="matrix__panel-edit-label">Unit Name</label>
          <input
            type="text"
            value={editUnitName}
            onChange={(e) => setEditUnitName(e.target.value)}
            placeholder="e.g., entity, credit card, contractor"
            className="matrix__panel-input"
          />
          <p className="matrix__panel-edit-hint">
            Used for overage pricing display (e.g., "$50 per entity")
          </p>
        </div>
        <div>
          <label className="matrix__panel-edit-label">Free Limit</label>
          <input
            type="text"
            value={editLimit}
            onChange={(e) => setEditLimit(e.target.value)}
            placeholder="e.g., 100, Unlimited, Custom"
            className="matrix__panel-input"
          />
          <p className="matrix__panel-edit-hint">
            Included free limit for this tier
          </p>
        </div>
        <div>
          <label className="matrix__panel-edit-label">Paid Limit</label>
          <input
            type="text"
            value={editPaidLimit}
            onChange={(e) => setEditPaidLimit(e.target.value)}
            placeholder="e.g., 500, 1000"
            className="matrix__panel-input"
          />
          <p className="matrix__panel-edit-hint">
            Maximum paid usage beyond the free limit (optional)
          </p>
        </div>
        <div>
          <label className="matrix__panel-edit-label">Reset Cycle</label>
          <select
            value={editResetCycle}
            onChange={(e) =>
              setEditResetCycle(e.target.value as UsageResetCycle)
            }
            className="matrix__panel-input"
            style={{ cursor: "pointer" }}
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
        <div className="matrix__panel-overage-section">
          <label className="matrix__panel-edit-label">
            Overage Pricing (Optional)
          </label>
          <p
            className="matrix__panel-edit-hint"
            style={{ marginBottom: "0.5rem" }}
          >
            Set a price for usage beyond the included limit
          </p>
          <div className="matrix__panel-overage-row">
            <div className="matrix__panel-overage-price">
              <span className="matrix__panel-overage-currency">$</span>
              <input
                type="number"
                value={editUnitPrice}
                onChange={(e) => setEditUnitPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="matrix__panel-overage-input"
              />
            </div>
            <span className="matrix__panel-overage-label">
              per {editUnitName || "unit"}
            </span>
          </div>
        </div>
        <div className="matrix__panel-edit-actions">
          <button
            onClick={handleSave}
            className="matrix__panel-edit-btn matrix__panel-edit-btn--primary"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="matrix__panel-edit-btn matrix__panel-edit-btn--secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="matrix__panel-limit-item">
      <div
        className="matrix__panel-limit-content"
        onClick={() => setIsEditing(true)}
      >
        <div className="matrix__panel-limit-metric">{limit.metric}</div>
        <div className="matrix__panel-limit-value-group">
          <div className="matrix__panel-limit-value">
            {limit.freeLimit != null
              ? `Free: ${limit.freeLimit}${limit.paidLimit != null ? ` / Paid: ${limit.paidLimit}` : ""}`
              : (limit.notes ?? "—")}
          </div>
          {limit.resetCycle && (
            <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
              Resets {limit.resetCycle.toLowerCase()}
            </div>
          )}
          {overageDisplay && (
            <div className="matrix__panel-limit-overage">{overageDisplay}</div>
          )}
        </div>
      </div>
      <div className="matrix__panel-limit-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="matrix__panel-limit-btn matrix__panel-limit-btn--edit"
          title="Edit metric"
        >
          <svg
            className="matrix__panel-limit-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
        <button
          onClick={onRemove}
          className="matrix__panel-limit-btn matrix__panel-limit-btn--remove"
          title="Remove metric"
        >
          <svg
            className="matrix__panel-limit-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
