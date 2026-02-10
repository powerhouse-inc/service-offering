import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  ServiceSubscriptionTier,
  BillingCycle,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  addTier,
  updateTier,
  updateTierPricing,
  deleteTier,
} from "../../../document-models/service-offering/gen/creators.js";

interface TierDefinitionProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

// Calculate price per day for mental accounting display
const BILLING_CYCLE_DAYS: Record<BillingCycle, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMI_ANNUAL: 180,
  ANNUAL: 365,
  ONE_TIME: 1,
};

// Determine which tier should show "Most Popular" badge
// Uses middle-tier heuristic (Good-Better-Best psychology)
function getRecommendedTierIndex(tiers: ServiceSubscriptionTier[]): number {
  if (tiers.length < 2) return -1;
  if (tiers.length === 2) return 1; // Second tier for 2-tier setup
  // For 3+ tiers, recommend the middle tier (or middle-right for even counts)
  return Math.floor(tiers.length / 2);
}

// Charm Pricing - Left-digit bias pricing suggestions
// Convert any price to nearest charm prices (ending in .99 or .97)
function getCharmPriceSuggestions(currentPrice: number): number[] {
  if (currentPrice <= 0) return [9.99, 19.99, 29.99];

  const suggestions: number[] = [];
  const roundedDown = Math.floor(currentPrice);
  const roundedUp = Math.ceil(currentPrice);

  // Lower charm price (X9.99 below current)
  const lowerCharm = Math.max(0, roundedDown - (roundedDown % 10) - 1) + 9.99;
  if (lowerCharm > 0 && lowerCharm !== currentPrice) {
    suggestions.push(lowerCharm);
  }

  // Nearest .99 at current level
  const nearestCharm = roundedUp - 0.01;
  if (
    nearestCharm > 0 &&
    nearestCharm !== currentPrice &&
    !suggestions.includes(nearestCharm)
  ) {
    suggestions.push(nearestCharm);
  }

  // Higher charm price (X9.99 above current)
  const higherCharm = roundedUp + (10 - (roundedUp % 10)) - 0.01;
  if (higherCharm !== currentPrice && !suggestions.includes(higherCharm)) {
    suggestions.push(higherCharm);
  }

  return suggestions.slice(0, 3).sort((a, b) => a - b);
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
    amount: number | null;
    isCustomPricing: boolean;
  }>;
}

const TIER_PRESETS: TierPreset[] = [
  {
    name: "Standard 3-Tier",
    description: "Basic → Professional → Enterprise",
    icon: "📊",
    tiers: [
      {
        name: "Basic",
        amount: 99,
        isCustomPricing: false,
      },
      {
        name: "Professional",
        amount: 299,
        isCustomPricing: false,
      },
      {
        name: "Enterprise",
        amount: null,
        isCustomPricing: true,
      },
    ],
  },
  {
    name: "Freemium Model",
    description: "Free → Pro → Business",
    icon: "🚀",
    tiers: [
      {
        name: "Free",
        amount: 0,
        isCustomPricing: false,
      },
      {
        name: "Pro",
        amount: 49,
        isCustomPricing: false,
      },
      {
        name: "Business",
        amount: 149,
        isCustomPricing: false,
      },
    ],
  },
  {
    name: "Simple 2-Tier",
    description: "Starter → Growth",
    icon: "⚡",
    tiers: [
      {
        name: "Starter",
        amount: 79,
        isCustomPricing: false,
      },
      {
        name: "Growth",
        amount: 199,
        isCustomPricing: false,
      },
    ],
  },
  {
    name: "Annual Focus",
    description: "Annual pricing with discounts",
    icon: "📅",
    tiers: [
      {
        name: "Essential",
        amount: 990,
        isCustomPricing: false,
      },
      {
        name: "Professional",
        amount: 2990,
        isCustomPricing: false,
      },
      {
        name: "Enterprise",
        amount: null,
        isCustomPricing: true,
      },
    ],
  },
];

const tierStyles = `
  .tier-def {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tier-def__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  /* Tier Card */
  .tier-card {
    width: 320px;
    background: var(--so-white);
    border-radius: var(--so-radius-lg);
    box-shadow: var(--so-shadow-md);
    overflow: hidden;
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

  .tier-card__pricing-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    border: 1px solid var(--so-slate-100);
  }

  .tier-card__currency {
    font-family: var(--so-font-mono);
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--so-slate-400);
  }

  .tier-card__amount-input {
    width: 5rem;
    font-family: var(--so-font-mono);
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--so-slate-900);
    background: transparent;
    border: none;
    outline: none;
  }

  .tier-card__amount-input::placeholder {
    color: var(--so-slate-300);
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

  /* Price Per Day Breakdown - Mental Accounting */
  .tier-card__price-breakdown {
    margin-top: 0.625rem;
    padding-top: 0.625rem;
    border-top: 1px dashed var(--so-slate-200);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tier-card__per-day {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .tier-card__per-day-amount {
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--so-emerald-600);
  }

  .tier-card__per-day-label {
    font-size: 0.6875rem;
    color: var(--so-slate-500);
  }

  .tier-card__comparison {
    font-size: 0.625rem;
    color: var(--so-slate-400);
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* Charm Pricing Suggestions */
  .tier-card__charm-pricing {
    margin-top: 0.625rem;
    padding-top: 0.625rem;
    border-top: 1px dashed var(--so-slate-200);
  }

  .tier-card__charm-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--so-violet-600);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .tier-card__charm-label svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .tier-card__charm-options {
    display: flex;
    gap: 0.375rem;
  }

  .tier-card__charm-btn {
    padding: 0.25rem 0.625rem;
    font-family: var(--so-font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--so-slate-600);
    background: var(--so-slate-100);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .tier-card__charm-btn:hover {
    background: var(--so-violet-50);
    border-color: var(--so-violet-300);
    color: var(--so-violet-700);
  }

  .tier-card__charm-btn--active {
    background: var(--so-violet-100);
    border-color: var(--so-violet-400);
    color: var(--so-violet-700);
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

  /* Pricing Row */
  .tier-form-card__pricing-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tier-form-card__currency {
    font-family: var(--so-font-mono);
    font-size: 1rem;
    color: var(--so-slate-400);
  }

  .tier-form-card__amount-input {
    width: 5rem;
    font-family: var(--so-font-mono);
    font-size: 1rem;
    font-weight: 500;
    color: var(--so-slate-900);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    padding: 0.5rem 0.75rem;
    outline: none;
    transition: var(--so-transition-fast);
  }

  .tier-form-card__amount-input:focus {
    border-color: var(--so-violet-400);
    box-shadow: 0 0 0 3px var(--so-violet-100);
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

  const [isAddingTier, setIsAddingTier] = useState(false);
  const [newTier, setNewTier] = useState({
    name: "",
    amount: "",
    currency: "USD",
    isCustomPricing: false,
  });

  const handleAddTier = () => {
    if (!newTier.name.trim() || (!newTier.isCustomPricing && !newTier.amount))
      return;

    dispatch(
      addTier({
        id: generateId(),
        name: newTier.name.trim(),
        amount: newTier.isCustomPricing
          ? undefined
          : parseFloat(newTier.amount),
        currency: newTier.currency,
        isCustomPricing: newTier.isCustomPricing,
        lastModified: new Date().toISOString(),
      }),
    );

    setNewTier({
      name: "",
      amount: "",
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
          amount: tierConfig.isCustomPricing
            ? undefined
            : (tierConfig.amount ?? undefined),
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
                        {t.isCustomPricing ? "" : ` $${t.amount}`}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="tier-def__grid">
          {tiers.map((tier, index) => (
            <TierCard
              key={tier.id}
              tier={tier}
              accent={getTierAccent(index)}
              dispatch={dispatch}
              onDelete={() => handleDeleteTier(tier.id)}
              isRecommended={index === recommendedTierIndex}
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
                      amount: "",
                    })
                  }
                  className="tier-form-card__checkbox"
                />
                <span className="tier-form-card__toggle-text">
                  Custom Pricing (price varies per client)
                </span>
              </label>

              {!newTier.isCustomPricing && (
                <div className="tier-form-card__field">
                  <label className="tier-form-card__label">
                    Recurring Price
                  </label>
                  <div className="tier-form-card__pricing-row">
                    <span className="tier-form-card__currency">$</span>
                    <input
                      type="number"
                      value={newTier.amount}
                      onChange={(e) =>
                        setNewTier({ ...newTier, amount: e.target.value })
                      }
                      placeholder="0"
                      className="tier-form-card__amount-input"
                      step="0.01"
                    />
                    {/* Billing cycle is configured at the ServiceGroup level */}
                  </div>
                </div>
              )}

              <div className="tier-form-card__actions">
                <button
                  onClick={handleAddTier}
                  disabled={
                    !newTier.name.trim() ||
                    (!newTier.isCustomPricing && !newTier.amount)
                  }
                  className="tier-form-card__btn tier-form-card__btn--primary"
                >
                  Create Tier
                </button>
                <button
                  onClick={() => {
                    setIsAddingTier(false);
                    setNewTier({
                      name: "",
                      amount: "",
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
}

function TierCard({
  tier,
  accent,
  dispatch,
  onDelete,
  isRecommended,
}: TierCardProps) {
  const [localName, setLocalName] = useState(tier.name);
  const [localAmount, setLocalAmount] = useState(
    tier.pricing.amount?.toString() || "",
  );
  const [localDescription, setLocalDescription] = useState(
    tier.description || "",
  );
  const isCustomPricing = tier.isCustomPricing ?? false;

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

  const handlePricingChange = (amount?: string) => {
    const newAmount =
      amount !== undefined
        ? amount
          ? parseFloat(amount)
          : null
        : tier.pricing.amount;

    if (!isCustomPricing && (newAmount == null || isNaN(newAmount))) return;

    dispatch(
      updateTierPricing({
        tierId: tier.id,
        amount: newAmount,
        lastModified: new Date().toISOString(),
      }),
    );
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
            <span className="tier-card__label">Recurring Price</span>
            <div className="tier-card__pricing-box">
              <span className="tier-card__currency">$</span>
              <input
                type="number"
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                onBlur={() => handlePricingChange(localAmount)}
                className="tier-card__amount-input"
                step="0.01"
              />
              {/* Billing cycle is configured at the ServiceGroup level */}
            </div>
            {/* Charm Pricing Suggestions - Left-Digit Bias */}
            {localAmount && parseFloat(localAmount) > 0 && (
              <div className="tier-card__charm-pricing">
                <span className="tier-card__charm-label">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Charm prices:
                </span>
                <div className="tier-card__charm-options">
                  {getCharmPriceSuggestions(parseFloat(localAmount)).map(
                    (price) => (
                      <button
                        key={price}
                        type="button"
                        onClick={() => {
                          setLocalAmount(price.toFixed(2));
                          handlePricingChange(price.toFixed(2));
                        }}
                        className={`tier-card__charm-btn ${parseFloat(localAmount) === price ? "tier-card__charm-btn--active" : ""}`}
                      >
                        ${price.toFixed(2).replace(/\.00$/, "")}
                      </button>
                    ),
                  )}
                </div>
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
