import { useMemo, useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  ServiceSubscriptionTier,
  OptionGroup,
  BillingCycle,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  addTier,
  updateTier,
  deleteTier,
  setAvailableBillingCycles,
} from "../../../document-models/service-offering/gen/creators.js";
import { calculateTierRecurringPrice, formatPrice } from "./pricing-utils.js";

interface TierDefinitionProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

// Determine which tier should show "Most Popular" badge
// Uses middle-tier heuristic (Good-Better-Best psychology)
function getRecommendedTierIndex(tiers: ServiceSubscriptionTier[]): number {
  if (tiers.length < 2) return -1;
  if (tiers.length === 2) return 1; // Second tier for 2-tier setup
  // For 3+ tiers, recommend the middle tier (or middle-right for even counts)
  return Math.floor(tiers.length / 2);
}

const TIER_ACCENTS = [
  {
    color: "var(--so-emerald-500)",
    bg: "var(--so-emerald-50)",
    name: "emerald",
  },
  { color: "var(--so-violet-500)", bg: "var(--so-violet-50)", name: "violet" },
  { color: "var(--so-amber-500)", bg: "var(--so-amber-50)", name: "amber" },
  { color: "var(--so-sky-500)", bg: "var(--so-sky-50)", name: "sky" },
  { color: "var(--so-rose-500)", bg: "var(--so-rose-50)", name: "rose" },
];

// Tier Presets - Default Effect & Activation Energy Reduction
interface TierPreset {
  name: string;
  description: string;
  icon: string;
  tiers: Array<{
    name: string;
    isCustomPricing: boolean;
  }>;
}

const TIER_PRESETS: TierPreset[] = [
  {
    name: "Standard 3-Tier",
    description: "Basic → Professional → Enterprise",
    icon: "📊",
    tiers: [
      { name: "Basic", isCustomPricing: false },
      { name: "Professional", isCustomPricing: false },
      { name: "Enterprise", isCustomPricing: true },
    ],
  },
  {
    name: "Freemium Model",
    description: "Free → Pro → Business",
    icon: "🚀",
    tiers: [
      { name: "Free", isCustomPricing: false },
      { name: "Pro", isCustomPricing: false },
      { name: "Business", isCustomPricing: false },
    ],
  },
  {
    name: "Simple 2-Tier",
    description: "Starter → Growth",
    icon: "⚡",
    tiers: [
      { name: "Starter", isCustomPricing: false },
      { name: "Growth", isCustomPricing: false },
    ],
  },
  {
    name: "Annual Focus",
    description: "Annual pricing with discounts",
    icon: "📅",
    tiers: [
      { name: "Essential", isCustomPricing: false },
      { name: "Professional", isCustomPricing: false },
      { name: "Enterprise", isCustomPricing: true },
    ],
  },
];

const BILLING_CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "SEMI_ANNUAL", label: "Semi-Annual" },
  { value: "ANNUAL", label: "Annual" },
];

const tierStyles = `
  .tier-def {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tier-billing-cycles {
    background: white;
    border: 1px solid var(--so-slate-200);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .tier-billing-cycles__label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--so-slate-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .tier-billing-cycles__options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tier-billing-cycles__btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1.5px solid var(--so-slate-200);
    background: white;
    color: var(--so-slate-500);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tier-billing-cycles__btn:hover {
    border-color: var(--so-violet-300);
    color: var(--so-violet-600);
  }

  .tier-billing-cycles__btn--active {
    background: var(--so-violet-500);
    border-color: var(--so-violet-500);
    color: white;
  }

  .tier-billing-cycles__btn--active:hover {
    background: var(--so-violet-600);
    border-color: var(--so-violet-600);
    color: white;
  }

  .tier-def__grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 1.5rem;
    overflow-x: auto;
    overflow-y: visible;
    padding-bottom: 1rem;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .tier-def__grid::-webkit-scrollbar {
    height: 8px;
  }

  .tier-def__grid::-webkit-scrollbar-track {
    background: var(--so-slate-100);
    border-radius: 4px;
  }

  .tier-def__grid::-webkit-scrollbar-thumb {
    background: var(--so-slate-300);
    border-radius: 4px;
  }

  .tier-def__grid::-webkit-scrollbar-thumb:hover {
    background: var(--so-slate-400);
  }

  /* Tier Card */
  .tier-card {
    width: 320px;
    max-height: 85vh;
    background: var(--so-white);
    border-radius: var(--so-radius-lg);
    box-shadow: var(--so-shadow-md);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: var(--so-transition-base);
    animation: tier-slide-up 0.3s ease-out;
    position: relative;
  }

  .tier-card:hover {
    box-shadow: var(--so-shadow-lg);
    transform: translateY(-2px);
  }

  /* Popular/Recommended Tier - Social Proof */
  .tier-card--popular {
    border: 2px solid var(--so-violet-300);
    transform: scale(1.02);
    z-index: 1;
  }

  .tier-card--popular:hover {
    transform: scale(1.02) translateY(-2px);
  }

  .tier-card__popular-banner {
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.875rem;
    background: linear-gradient(135deg, var(--so-violet-600) 0%, var(--so-violet-700) 100%);
    color: white;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    z-index: 2;
  }

  .tier-card__popular-banner svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  @keyframes tier-slide-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tier-card__accent {
    height: 4px;
    width: 100%;
  }

  .tier-card__body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .tier-card__body::-webkit-scrollbar {
    width: 6px;
  }

  .tier-card__body::-webkit-scrollbar-track {
    background: var(--so-slate-50);
    border-radius: 3px;
  }

  .tier-card__body::-webkit-scrollbar-thumb {
    background: var(--so-slate-300);
    border-radius: 3px;
  }

  .tier-card__body::-webkit-scrollbar-thumb:hover {
    background: var(--so-slate-400);
  }

  .tier-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  .tier-card__name-group {
    flex: 1;
  }

  .tier-card__label {
    display: block;
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--so-slate-400);
    margin-bottom: 0.375rem;
  }

  .tier-card__name-input {
    width: 100%;
    font-family: var(--so-font-sans);
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--so-slate-900);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0 0 0.25rem 0;
    transition: var(--so-transition-fast);
    outline: none;
  }

  .tier-card__name-input:hover {
    border-bottom-color: var(--so-slate-200);
  }

  .tier-card__name-input:focus {
    border-bottom-color: var(--so-violet-500);
  }

  .tier-card__delete-btn {
    padding: 0.375rem;
    color: var(--so-slate-400);
    background: transparent;
    border: none;
    border-radius: var(--so-radius-sm);
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .tier-card__delete-btn:hover {
    color: var(--so-rose-500);
    background: var(--so-rose-50);
  }

  /* Custom Pricing Badge */
  .tier-card__custom-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--so-amber-50);
    border: 1px solid var(--so-amber-200);
    border-radius: var(--so-radius-md);
    margin-bottom: 1rem;
  }

  .tier-card__custom-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--so-amber-600);
  }

  .tier-card__custom-text {
    flex: 1;
  }

  .tier-card__custom-title {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-amber-800);
  }

  .tier-card__custom-desc {
    font-size: 0.6875rem;
    color: var(--so-amber-600);
  }

  /* Pricing Section */
  .tier-card__pricing {
    margin-bottom: 1rem;
  }

  .tier-card__pricing-header {
    margin-bottom: 0.375rem;
  }

  .tier-card__pricing-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    border: 1px solid var(--so-slate-100);
  }

  .tier-card__calculated-amount {
    font-family: var(--so-font-mono);
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--so-emerald-700);
  }

  .tier-card__calculated-label {
    font-size: 0.875rem;
    color: var(--so-emerald-600);
    font-weight: 500;
  }

  .tier-card__breakdown {
    margin-top: 0.5rem;
    padding: 0.5rem 0.625rem;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-sm);
    border: 1px solid var(--so-slate-100);
  }

  .tier-card__breakdown-title {
    display: block;
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--so-slate-500);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.375rem;
  }

  .tier-card__breakdown-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.1875rem 0;
  }

  .tier-card__breakdown-row--missing .tier-card__breakdown-name {
    color: var(--so-amber-600);
  }

  .tier-card__breakdown-row--missing .tier-card__breakdown-amount {
    color: var(--so-amber-500);
    font-style: italic;
  }

  .tier-card__breakdown-name {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--so-slate-600);
  }

  .tier-card__breakdown-warn {
    width: 0.75rem;
    height: 0.75rem;
    color: var(--so-amber-500);
  }

  .tier-card__breakdown-amount {
    font-family: var(--so-font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--so-slate-700);
  }

  .tier-card__missing-warning {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.5rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.6875rem;
    color: var(--so-amber-700);
    background: var(--so-amber-50);
    border: 1px solid var(--so-amber-200);
    border-radius: var(--so-radius-sm);
  }

  .tier-card__missing-warning svg {
    flex-shrink: 0;
    width: 0.875rem;
    height: 0.875rem;
    color: var(--so-amber-500);
  }

  .tier-card__divider {
    color: var(--so-slate-300);
    font-size: 1rem;
  }

  .tier-card__cycle-select {
    flex: 1;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: var(--so-slate-600);
    background: transparent;
    border: none;
    cursor: pointer;
    outline: none;
    appearance: none;
    padding-right: 1.25rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0 center;
    background-size: 1rem;
  }

  /* Description */
  .tier-card__description {
    margin-top: 1rem;
  }

  .tier-card__desc-textarea {
    width: 100%;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    color: var(--so-slate-600);
    background: var(--so-slate-50);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    padding: 0.75rem;
    resize: none;
    outline: none;
    transition: var(--so-transition-fast);
  }

  .tier-card__desc-textarea:focus {
    border-color: var(--so-violet-400);
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  .tier-card__desc-textarea::placeholder {
    color: var(--so-slate-400);
  }

  /* Footer */
  .tier-card__footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: var(--so-slate-50);
    border-top: 1px solid var(--so-slate-100);
  }

  .tier-card__footer-icon {
    width: 1rem;
    height: 1rem;
    color: var(--so-slate-400);
  }

  .tier-card__footer-text {
    font-size: 0.75rem;
    color: var(--so-slate-500);
  }

  /* Add Card */
  .tier-add-card {
    width: 320px;
    min-height: 280px;
    background: var(--so-white);
    border: 2px dashed var(--so-slate-200);
    border-radius: var(--so-radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: var(--so-transition-base);
  }

  .tier-add-card:hover {
    border-color: var(--so-violet-300);
    background: var(--so-violet-50);
  }

  .tier-add-card__icon-wrap {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: var(--so-slate-100);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--so-transition-base);
  }

  .tier-add-card:hover .tier-add-card__icon-wrap {
    background: var(--so-violet-100);
  }

  .tier-add-card__icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--so-slate-400);
    transition: var(--so-transition-fast);
  }

  .tier-add-card:hover .tier-add-card__icon {
    color: var(--so-violet-600);
  }

  .tier-add-card__text {
    font-family: var(--so-font-sans);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--so-slate-500);
    transition: var(--so-transition-fast);
  }

  .tier-add-card:hover .tier-add-card__text {
    color: var(--so-violet-600);
  }

  /* Add Form Card */
  .tier-form-card {
    width: 320px;
    background: var(--so-white);
    border: 2px solid var(--so-violet-200);
    border-radius: var(--so-radius-lg);
    padding: 1.5rem;
    animation: tier-slide-up 0.2s ease-out;
  }

  .tier-form-card__title {
    font-family: var(--so-font-sans);
    font-size: 1rem;
    font-weight: 700;
    color: var(--so-slate-900);
    margin-bottom: 1.25rem;
  }

  .tier-form-card__field {
    margin-bottom: 1rem;
  }

  .tier-form-card__label {
    display: block;
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--so-slate-500);
    margin-bottom: 0.375rem;
  }

  .tier-form-card__input {
    width: 100%;
    font-family: var(--so-font-sans);
    font-size: 1rem;
    font-weight: 600;
    color: var(--so-slate-900);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    padding: 0.625rem 0.875rem;
    outline: none;
    transition: var(--so-transition-fast);
  }

  .tier-form-card__input:focus {
    border-color: var(--so-violet-400);
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  .tier-form-card__input::placeholder {
    font-weight: 400;
    color: var(--so-slate-400);
  }

  /* Custom Pricing Toggle */
  .tier-form-card__toggle {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  .tier-form-card__checkbox {
    width: 1.125rem;
    height: 1.125rem;
    accent-color: var(--so-amber-500);
    cursor: pointer;
  }

  .tier-form-card__toggle-text {
    font-size: 0.8125rem;
    color: var(--so-slate-600);
  }

  .tier-form-card__separator {
    color: var(--so-slate-300);
  }

  .tier-form-card__cycle-select {
    flex: 1;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: var(--so-slate-700);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    outline: none;
    transition: var(--so-transition-fast);
  }

  .tier-form-card__cycle-select:focus {
    border-color: var(--so-violet-400);
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  /* Actions */
  .tier-form-card__actions {
    display: flex;
    gap: 0.625rem;
    margin-top: 1.25rem;
  }

  .tier-form-card__btn {
    flex: 1;
    padding: 0.625rem 1rem;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: var(--so-transition-fast);
  }

  .tier-form-card__btn--primary {
    background: var(--so-violet-600);
    color: var(--so-white);
    border: none;
  }

  .tier-form-card__btn--primary:hover:not(:disabled) {
    background: var(--so-violet-700);
  }

  .tier-form-card__btn--primary:disabled {
    background: var(--so-slate-200);
    color: var(--so-slate-400);
    cursor: not-allowed;
  }

  .tier-form-card__btn--secondary {
    background: var(--so-slate-100);
    color: var(--so-slate-700);
    border: none;
  }

  .tier-form-card__btn--secondary:hover {
    background: var(--so-slate-200);
  }

  /* Tier Presets - Quick Start Templates */
  .tier-presets {
    background: linear-gradient(135deg, var(--so-violet-50) 0%, var(--so-sky-50) 100%);
    border-radius: var(--so-radius-lg);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid var(--so-violet-100);
  }

  .tier-presets__header {
    margin-bottom: 1.25rem;
  }

  .tier-presets__title {
    font-family: var(--so-font-sans);
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--so-slate-800);
    margin: 0 0 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tier-presets__title::before {
    content: '⚡';
  }

  .tier-presets__subtitle {
    font-size: 0.875rem;
    color: var(--so-slate-600);
    margin: 0;
  }

  .tier-presets__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .tier-preset-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    background: white;
    border: 2px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .tier-preset-card:hover {
    border-color: var(--so-violet-400);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
    transform: translateY(-2px);
  }

  .tier-preset-card__icon {
    font-size: 1.5rem;
  }

  .tier-preset-card__content {
    flex: 1;
  }

  .tier-preset-card__name {
    font-family: var(--so-font-sans);
    font-size: 1rem;
    font-weight: 600;
    color: var(--so-slate-800);
    margin: 0 0 0.25rem;
  }

  .tier-preset-card__desc {
    font-size: 0.8125rem;
    color: var(--so-slate-500);
    margin: 0;
  }

  .tier-preset-card__preview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--so-slate-100);
  }

  .tier-preset-card__tier {
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    padding: 0.25rem 0.5rem;
    background: var(--so-slate-100);
    color: var(--so-slate-600);
    border-radius: var(--so-radius-sm);
  }

  .tier-preset-card:hover .tier-preset-card__tier {
    background: var(--so-violet-100);
    color: var(--so-violet-700);
  }

  /* Info Notice */
  .tier-notice {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    background: var(--so-amber-50);
    border: 1px solid var(--so-amber-200);
    border-radius: var(--so-radius-lg);
  }

  .tier-notice__icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--so-amber-600);
    margin-top: 0.125rem;
  }

  .tier-notice__content {
    flex: 1;
  }

  .tier-notice__title {
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--so-amber-800);
    margin-bottom: 0.25rem;
  }

  .tier-notice__text {
    font-size: 0.8125rem;
    color: var(--so-amber-700);
    line-height: 1.5;
  }
`;

export function TierDefinition({ document, dispatch }: TierDefinitionProps) {
  const { state } = document;
  const tiers = state.global.tiers ?? [];
  const optionGroups = state.global.optionGroups ?? [];

  const regularGroups = useMemo(
    () => optionGroups.filter((g) => g.costType !== "SETUP" && !g.isAddOn),
    [optionGroups],
  );

  const [isAddingTier, setIsAddingTier] = useState(false);
  const [newTier, setNewTier] = useState({
    name: "",
    currency: "USD",
    isCustomPricing: false,
  });

  const handleAddTier = () => {
    if (!newTier.name.trim()) return;

    dispatch(
      addTier({
        id: generateId(),
        name: newTier.name.trim(),
        currency: newTier.currency,
        isCustomPricing: newTier.isCustomPricing,
        lastModified: new Date().toISOString(),
      }),
    );

    setNewTier({
      name: "",
      currency: "USD",
      isCustomPricing: false,
    });
    setIsAddingTier(false);
  };

  const handleDeleteTier = (tierId: string) => {
    if (!confirm("Are you sure you want to delete this tier?")) return;
    dispatch(
      deleteTier({
        id: tierId,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  // Apply a preset tier configuration - Default Effect
  const handleApplyPreset = (preset: TierPreset) => {
    const now = new Date().toISOString();
    preset.tiers.forEach((tierConfig) => {
      dispatch(
        addTier({
          id: generateId(),
          name: tierConfig.name,
          currency: "USD",
          isCustomPricing: tierConfig.isCustomPricing,
          lastModified: now,
        }),
      );
    });
  };

  const getTierAccent = (index: number) =>
    TIER_ACCENTS[index % TIER_ACCENTS.length];

  const recommendedTierIndex = getRecommendedTierIndex(tiers);

  return (
    <>
      <style>{tierStyles}</style>
      <div className="tier-def">
        {/* Tier Presets - Show when no tiers exist (Default Effect) */}
        {tiers.length === 0 && (
          <div className="tier-presets">
            <div className="tier-presets__header">
              <h3 className="tier-presets__title">
                Quick Start with a Template
              </h3>
              <p className="tier-presets__subtitle">
                Choose a pricing structure to get started quickly, or create
                custom tiers below
              </p>
            </div>
            <div className="tier-presets__grid">
              {TIER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="tier-preset-card"
                >
                  <span className="tier-preset-card__icon">{preset.icon}</span>
                  <div className="tier-preset-card__content">
                    <h4 className="tier-preset-card__name">{preset.name}</h4>
                    <p className="tier-preset-card__desc">
                      {preset.description}
                    </p>
                  </div>
                  <div className="tier-preset-card__preview">
                    {preset.tiers.map((t, i) => (
                      <span key={i} className="tier-preset-card__tier">
                        {t.name}
                        {t.isCustomPricing ? " (Custom)" : ""}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Billing Cycle Selector */}
        <div className="tier-billing-cycles">
          <span className="tier-billing-cycles__label">Billing Cycles:</span>
          <div className="tier-billing-cycles__options">
            {BILLING_CYCLE_OPTIONS.map((opt) => {
              const isActive = (
                state.global.availableBillingCycles ?? []
              ).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  className={`tier-billing-cycles__btn ${isActive ? "tier-billing-cycles__btn--active" : ""}`}
                  onClick={() => {
                    const current = state.global.availableBillingCycles ?? [];
                    let updated: BillingCycle[];
                    if (isActive) {
                      updated = current.filter((c) => c !== opt.value);
                      if (updated.length === 0) return;
                    } else {
                      updated = [...current, opt.value];
                    }
                    dispatch(
                      setAvailableBillingCycles({
                        billingCycles: updated,
                        lastModified: new Date().toISOString(),
                      }),
                    );
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="tier-def__grid">
          {tiers.map((tier, index) => (
            <TierCard
              key={tier.id}
              tier={tier}
              accent={getTierAccent(index)}
              dispatch={dispatch}
              onDelete={() => handleDeleteTier(tier.id)}
              isRecommended={index === recommendedTierIndex}
              regularGroups={regularGroups}
            />
          ))}

          {isAddingTier ? (
            <div className="tier-form-card">
              <h3 className="tier-form-card__title">New Subscription Tier</h3>

              <div className="tier-form-card__field">
                <label className="tier-form-card__label">Tier Name</label>
                <input
                  type="text"
                  value={newTier.name}
                  onChange={(e) =>
                    setNewTier({ ...newTier, name: e.target.value })
                  }
                  placeholder="e.g., Basic, Professional"
                  className="tier-form-card__input"
                  autoFocus
                />
              </div>

              <label className="tier-form-card__toggle">
                <input
                  type="checkbox"
                  checked={newTier.isCustomPricing}
                  onChange={(e) =>
                    setNewTier({
                      ...newTier,
                      isCustomPricing: e.target.checked,
                    })
                  }
                  className="tier-form-card__checkbox"
                />
                <span className="tier-form-card__toggle-text">
                  Custom Pricing (price varies per client)
                </span>
              </label>

              <div className="tier-form-card__actions">
                <button
                  onClick={handleAddTier}
                  disabled={!newTier.name.trim()}
                  className="tier-form-card__btn tier-form-card__btn--primary"
                >
                  Create Tier
                </button>
                <button
                  onClick={() => {
                    setIsAddingTier(false);
                    setNewTier({
                      name: "",
                      currency: "USD",
                      isCustomPricing: false,
                    });
                  }}
                  className="tier-form-card__btn tier-form-card__btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTier(true)}
              className="tier-add-card"
            >
              <div className="tier-add-card__icon-wrap">
                <svg
                  className="tier-add-card__icon"
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
              </div>
              <span className="tier-add-card__text">Add Subscription Tier</span>
            </button>
          )}
        </div>

        <div className="tier-notice">
          <svg
            className="tier-notice__icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="tier-notice__content">
            <p className="tier-notice__title">
              Pricing is managed at the option group level
            </p>
            <p className="tier-notice__text">
              Billing cycles and pricing are configured per option group in the
              Service Catalog. Setup fees, recurring prices, and billing cycles
              apply to all tiers within each group.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

interface TierCardProps {
  tier: ServiceSubscriptionTier;
  accent: { color: string; bg: string; name: string };
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onDelete: () => void;
  isRecommended?: boolean;
  regularGroups: OptionGroup[];
}

function TierCard({
  tier,
  accent,
  dispatch,
  onDelete,
  isRecommended,
  regularGroups,
}: TierCardProps) {
  const [localName, setLocalName] = useState(tier.name);
  const [localDescription, setLocalDescription] = useState(
    tier.description || "",
  );
  const isCustomPricing = tier.isCustomPricing ?? false;

  const calculatedPrice = useMemo(
    () => calculateTierRecurringPrice(regularGroups, "MONTHLY", tier.id),
    [regularGroups, tier.id],
  );

  const handleNameBlur = () => {
    if (localName !== tier.name && localName.trim()) {
      dispatch(
        updateTier({
          id: tier.id,
          name: localName.trim(),
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const handleDescriptionBlur = () => {
    if (localDescription !== (tier.description || "")) {
      dispatch(
        updateTier({
          id: tier.id,
          description: localDescription,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  return (
    <div className={`tier-card ${isRecommended ? "tier-card--popular" : ""}`}>
      {/* Most Popular Badge - Social Proof */}
      {isRecommended && (
        <div className="tier-card__popular-banner">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Most Popular
        </div>
      )}
      <div className="tier-card__accent" style={{ background: accent.color }} />

      <div className="tier-card__body">
        <div className="tier-card__header">
          <div className="tier-card__name-group">
            <span className="tier-card__label">Tier Name</span>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              className="tier-card__name-input"
            />
          </div>
          <button onClick={onDelete} className="tier-card__delete-btn">
            <svg
              width="20"
              height="20"
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

        {isCustomPricing && (
          <div className="tier-card__custom-badge">
            <svg
              className="tier-card__custom-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="tier-card__custom-text">
              <span className="tier-card__custom-title">Custom Pricing</span>
              <span className="tier-card__custom-desc">
                Price varies per client
              </span>
            </div>
          </div>
        )}

        {!isCustomPricing && (
          <div className="tier-card__pricing">
            <div className="tier-card__pricing-header">
              <span className="tier-card__label">Recurring Price</span>
            </div>

            <div className="tier-card__pricing-box">
              <span className="tier-card__currency">$</span>
              <span className="tier-card__calculated-amount">
                {formatPrice(calculatedPrice.monthlyTotal).replace("$", "")}
              </span>
              <span className="tier-card__calculated-label">/mo</span>
            </div>

            {calculatedPrice.groupBreakdown.length > 0 && (
              <div className="tier-card__breakdown">
                <span className="tier-card__breakdown-title">
                  Sum of {calculatedPrice.groupBreakdown.length} service group
                  {calculatedPrice.groupBreakdown.length !== 1 ? "s" : ""}
                </span>
                {calculatedPrice.groupBreakdown.map((g) => (
                  <div
                    key={g.groupId}
                    className={`tier-card__breakdown-row ${!g.hasPrice ? "tier-card__breakdown-row--missing" : ""}`}
                  >
                    <span className="tier-card__breakdown-name">
                      {!g.hasPrice && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="tier-card__breakdown-warn"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                      {g.groupName}
                    </span>
                    <span className="tier-card__breakdown-amount">
                      {g.hasPrice ? formatPrice(g.monthlyAmount) : "$0"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {calculatedPrice.missingPriceGroups.length > 0 && (
              <div className="tier-card__missing-warning">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  {calculatedPrice.missingPriceGroups.length} group
                  {calculatedPrice.missingPriceGroups.length !== 1
                    ? "s"
                    : ""}{" "}
                  without pricing (counted as $0)
                </span>
              </div>
            )}
          </div>
        )}

        <div className="tier-card__description">
          <span className="tier-card__label">Description</span>
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Add a description..."
            rows={2}
            className="tier-card__desc-textarea"
          />
        </div>
      </div>

      <div className="tier-card__footer">
        <svg
          className="tier-card__footer-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="tier-card__footer-text">
          Configure service levels in the Matrix view
        </span>
      </div>
    </div>
  );
}
