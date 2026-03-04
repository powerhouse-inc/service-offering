import { memo, useMemo, useState, useCallback } from "react";
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
import { InfoIcon } from "./InfoIcon.js";
import { ConfirmDialog } from "./ConfirmDialog.js";
import "./TierDefinition.css";

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

export function TierDefinition({ document, dispatch }: TierDefinitionProps) {
  const { state } = document;
  const tiers = state.global.tiers ?? [];
  const optionGroups = state.global.optionGroups ?? [];

  const regularGroups = useMemo(
    () => optionGroups.filter((g) => g.costType !== "SETUP" && !g.isAddOn),
    [optionGroups],
  );

  const [isAddingTier, setIsAddingTier] = useState(false);
  const [pendingDeleteTierId, setPendingDeleteTierId] = useState<string | null>(
    null,
  );
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

  const handleDeleteTier = useCallback((tierId: string) => {
    setPendingDeleteTierId(tierId);
  }, []);

  const confirmDeleteTier = useCallback(() => {
    if (!pendingDeleteTierId) return;
    dispatch(
      deleteTier({
        id: pendingDeleteTierId,
        lastModified: new Date().toISOString(),
      }),
    );
    setPendingDeleteTierId(null);
  }, [pendingDeleteTierId, dispatch]);

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
      <div className="tier-def">
        {/* Tier Presets - Show when no tiers exist (Default Effect) */}
        {tiers.length === 0 && (
          <div className="tier-presets">
            <div className="tier-presets__header">
              <h3 className="tier-presets__title">
                Quick Start with a Template
                <InfoIcon content="Quick-start templates for common tier structures. You can customize everything after selecting a preset." />
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
          <span className="tier-billing-cycles__label">
            Billing Cycles:
            <InfoIcon content="Select which payment frequencies you want to offer. These will be available for pricing across all tiers." />
          </span>
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
          {(state.global.availableBillingCycles ?? []).length === 0 && (
            <div className="tier__validation-warning">
              Select at least one billing cycle to enable pricing
            </div>
          )}
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

      {pendingDeleteTierId && (
        <ConfirmDialog
          title="Delete this tier?"
          message="This will remove the tier and all its pricing configuration. This action cannot be undone."
          confirmLabel="Delete Tier"
          variant="danger"
          onConfirm={confirmDeleteTier}
          onCancel={() => setPendingDeleteTierId(null)}
        />
      )}
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

const TierCard = memo(function TierCard({
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
          <InfoIcon content="Automatically assigned to the middle tier. This badge helps guide client decisions toward the recommended option." />
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
              <span className="tier-card__label">
                Recurring Price
                <InfoIcon content="This price is automatically calculated from the services and pricing configured in the Service Catalog. It is read-only — to change it, adjust pricing in your option groups." />
              </span>
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
});
