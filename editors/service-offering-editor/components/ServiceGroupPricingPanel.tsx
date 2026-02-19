import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingAction,
  OptionGroup,
  ServiceSubscriptionTier,
  BillingCycle,
  SetupCostInput,
  RecurringPriceOptionInput,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  setOptionGroupStandalonePricing,
  addOptionGroupTierPricing,
  updateOptionGroupTierPricing,
} from "../../../document-models/service-offering/gen/option-group-management/creators.js";

interface ServiceGroupPricingPanelProps {
  addOnGroups: OptionGroup[];
  tiers: ServiceSubscriptionTier[];
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

const BILLING_CYCLES: BillingCycle[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
];

const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  SEMI_ANNUAL: "Semi-Annual",
  ANNUAL: "Annual",
  ONE_TIME: "One-Time",
};

export function ServiceGroupPricingPanel({
  addOnGroups,
  tiers,
  dispatch,
}: ServiceGroupPricingPanelProps) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  if (addOnGroups.length === 0) {
    return (
      <div className="sgp-empty">
        <div className="sgp-empty__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="sgp-empty__title">No Add-on Groups</h3>
        <p className="sgp-empty__text">
          Create add-on service groups in the Service Catalog tab to configure
          their pricing here.
        </p>
      </div>
    );
  }

  return (
    <div className="sgp">
      <div className="sgp__header">
        <h2 className="sgp__title">Add-on Group Pricing</h2>
        <p className="sgp__subtitle">
          Configure setup costs and recurring pricing for each add-on group
        </p>
      </div>

      <div className="sgp__groups">
        {addOnGroups.map((group) => (
          <div key={group.id} className="sgp__group">
            <button
              onClick={() =>
                setExpandedGroupId(
                  expandedGroupId === group.id ? null : group.id,
                )
              }
              className="sgp__group-header"
            >
              <div className="sgp__group-info">
                <h3 className="sgp__group-name">{group.name}</h3>
                <div className="sgp__group-meta">
                  <span className="sgp__badge sgp__badge--violet">Add-on</span>
                  {group.pricingMode && (
                    <span className="sgp__badge sgp__badge--slate">
                      {group.pricingMode === "STANDALONE"
                        ? "Standalone Pricing"
                        : "Tier-Dependent Pricing"}
                    </span>
                  )}
                </div>
              </div>
              <svg
                className={`sgp__expand-icon ${expandedGroupId === group.id ? "sgp__expand-icon--open" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedGroupId === group.id && (
              <div className="sgp__group-content">
                {!group.pricingMode && (
                  <div className="sgp__notice sgp__notice--warning">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <strong>Pricing Mode Not Set</strong>
                      <p>
                        Edit this group in the Service Catalog tab and select a
                        pricing mode (Standalone or Tier-Dependent) before
                        configuring detailed pricing.
                      </p>
                    </div>
                  </div>
                )}

                {group.pricingMode === "STANDALONE" && (
                  <StandalonePricingEditor group={group} dispatch={dispatch} />
                )}

                {group.pricingMode === "TIER_DEPENDENT" && (
                  <TierDependentPricingEditor
                    group={group}
                    tiers={tiers}
                    dispatch={dispatch}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{styles}</style>
    </div>
  );
}

interface StandalonePricingEditorProps {
  group: OptionGroup;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

function StandalonePricingEditor({
  group,
  dispatch,
}: StandalonePricingEditorProps) {
  const [setupAmount, setSetupAmount] = useState(
    group.standalonePricing?.setupCost?.amount?.toString() || "",
  );
  const [setupCurrency, setSetupCurrency] = useState(
    group.standalonePricing?.setupCost?.currency || "USD",
  );
  const [recurringPrices, setRecurringPrices] = useState<
    Record<BillingCycle, string>
  >(() => {
    const prices: Record<string, string> = {};
    BILLING_CYCLES.forEach((cycle) => {
      const existing = group.standalonePricing?.recurringPricing.find(
        (rp) => rp.billingCycle === cycle,
      );
      prices[cycle] = existing?.amount?.toString() || "";
    });
    return prices as Record<BillingCycle, string>;
  });

  const handleSave = () => {
    const setupCost: SetupCostInput | undefined =
      setupAmount && parseFloat(setupAmount) > 0
        ? {
            amount: parseFloat(setupAmount),
            currency: setupCurrency,
          }
        : undefined;

    const recurringPricing: RecurringPriceOptionInput[] = BILLING_CYCLES.filter(
      (cycle) =>
        recurringPrices[cycle] && parseFloat(recurringPrices[cycle]) > 0,
    ).map((cycle) => ({
      id: generateId(),
      billingCycle: cycle,
      amount: parseFloat(recurringPrices[cycle]),
      currency: "USD",
    }));

    dispatch(
      setOptionGroupStandalonePricing({
        optionGroupId: group.id,
        setupCost,
        recurringPricing,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  return (
    <div className="sgp__pricing-editor">
      <div className="sgp__section">
        <h4 className="sgp__section-title">Setup Cost</h4>
        <div className="sgp__setup-row">
          <div className="sgp__input-group">
            <label className="sgp__label">Amount</label>
            <div className="sgp__currency-input">
              <span className="sgp__currency-symbol">$</span>
              <input
                type="number"
                value={setupAmount}
                onChange={(e) => setSetupAmount(e.target.value)}
                placeholder="0.00"
                className="sgp__input"
                step="0.01"
              />
            </div>
          </div>
          <div className="sgp__input-group">
            <label className="sgp__label">Currency</label>
            <select
              value={setupCurrency}
              onChange={(e) => setSetupCurrency(e.target.value)}
              className="sgp__select"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sgp__section">
        <h4 className="sgp__section-title">Recurring Pricing</h4>
        <div className="sgp__recurring-grid">
          {BILLING_CYCLES.map((cycle) => (
            <div key={cycle} className="sgp__recurring-row">
              <label className="sgp__label">
                {BILLING_CYCLE_LABELS[cycle]}
              </label>
              <div className="sgp__currency-input">
                <span className="sgp__currency-symbol">$</span>
                <input
                  type="number"
                  value={recurringPrices[cycle]}
                  onChange={(e) =>
                    setRecurringPrices({
                      ...recurringPrices,
                      [cycle]: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="sgp__input"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sgp__actions">
        <button onClick={handleSave} className="sgp__btn sgp__btn--primary">
          Save Pricing
        </button>
      </div>
    </div>
  );
}

interface TierDependentPricingEditorProps {
  group: OptionGroup;
  tiers: ServiceSubscriptionTier[];
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

function TierDependentPricingEditor({
  group,
  tiers,
  dispatch,
}: TierDependentPricingEditorProps) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(
    tiers[0]?.id || null,
  );

  const selectedTierPricing = group.tierDependentPricing?.find(
    (tp) => tp.tierId === selectedTierId,
  );

  const [setupAmount, setSetupAmount] = useState(
    selectedTierPricing?.setupCost?.amount?.toString() || "",
  );
  const [setupCurrency, setSetupCurrency] = useState(
    selectedTierPricing?.setupCost?.currency || "USD",
  );
  const [recurringPrices, setRecurringPrices] = useState<
    Record<BillingCycle, string>
  >(() => {
    const prices: Record<string, string> = {};
    BILLING_CYCLES.forEach((cycle) => {
      const existing = selectedTierPricing?.recurringPricing.find(
        (rp) => rp.billingCycle === cycle,
      );
      prices[cycle] = existing?.amount?.toString() || "";
    });
    return prices as Record<BillingCycle, string>;
  });

  // Update local state when selected tier changes
  useState(() => {
    const pricing = group.tierDependentPricing?.find(
      (tp) => tp.tierId === selectedTierId,
    );
    setSetupAmount(pricing?.setupCost?.amount?.toString() || "");
    setSetupCurrency(pricing?.setupCost?.currency || "USD");
    const prices: Record<string, string> = {};
    BILLING_CYCLES.forEach((cycle) => {
      const existing = pricing?.recurringPricing.find(
        (rp) => rp.billingCycle === cycle,
      );
      prices[cycle] = existing?.amount?.toString() || "";
    });
    setRecurringPrices(prices as Record<BillingCycle, string>);
  });

  const handleSave = () => {
    if (!selectedTierId) return;

    const setupCost: SetupCostInput | undefined =
      setupAmount && parseFloat(setupAmount) > 0
        ? {
            amount: parseFloat(setupAmount),
            currency: setupCurrency,
          }
        : undefined;

    const recurringPricing: RecurringPriceOptionInput[] = BILLING_CYCLES.filter(
      (cycle) =>
        recurringPrices[cycle] && parseFloat(recurringPrices[cycle]) > 0,
    ).map((cycle) => ({
      id: generateId(),
      billingCycle: cycle,
      amount: parseFloat(recurringPrices[cycle]),
      currency: "USD",
    }));

    const existingPricing = group.tierDependentPricing?.find(
      (tp) => tp.tierId === selectedTierId,
    );

    if (existingPricing) {
      dispatch(
        updateOptionGroupTierPricing({
          optionGroupId: group.id,
          tierId: selectedTierId,
          setupCost,
          recurringPricing,
          lastModified: new Date().toISOString(),
        }),
      );
    } else {
      dispatch(
        addOptionGroupTierPricing({
          optionGroupId: group.id,
          tierPricingId: generateId(),
          tierId: selectedTierId,
          setupCost,
          recurringPricing,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  if (tiers.length === 0) {
    return (
      <div className="sgp__notice sgp__notice--info">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong>No Tiers Available</strong>
          <p>
            Create subscription tiers in the Tier Definition tab before
            configuring tier-dependent pricing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sgp__pricing-editor">
      <div className="sgp__tier-selector">
        <label className="sgp__label">Select Tier</label>
        <div className="sgp__tier-tabs">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`sgp__tier-tab ${selectedTierId === tier.id ? "sgp__tier-tab--active" : ""}`}
            >
              {tier.name}
            </button>
          ))}
        </div>
      </div>

      <div className="sgp__section">
        <h4 className="sgp__section-title">
          Setup Cost for {tiers.find((t) => t.id === selectedTierId)?.name}
        </h4>
        <div className="sgp__setup-row">
          <div className="sgp__input-group">
            <label className="sgp__label">Amount</label>
            <div className="sgp__currency-input">
              <span className="sgp__currency-symbol">$</span>
              <input
                type="number"
                value={setupAmount}
                onChange={(e) => setSetupAmount(e.target.value)}
                placeholder="0.00"
                className="sgp__input"
                step="0.01"
              />
            </div>
          </div>
          <div className="sgp__input-group">
            <label className="sgp__label">Currency</label>
            <select
              value={setupCurrency}
              onChange={(e) => setSetupCurrency(e.target.value)}
              className="sgp__select"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sgp__section">
        <h4 className="sgp__section-title">Recurring Pricing</h4>
        <div className="sgp__recurring-grid">
          {BILLING_CYCLES.map((cycle) => (
            <div key={cycle} className="sgp__recurring-row">
              <label className="sgp__label">
                {BILLING_CYCLE_LABELS[cycle]}
              </label>
              <div className="sgp__currency-input">
                <span className="sgp__currency-symbol">$</span>
                <input
                  type="number"
                  value={recurringPrices[cycle]}
                  onChange={(e) =>
                    setRecurringPrices({
                      ...recurringPrices,
                      [cycle]: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="sgp__input"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sgp__actions">
        <button onClick={handleSave} className="sgp__btn sgp__btn--primary">
          Save Pricing for {tiers.find((t) => t.id === selectedTierId)?.name}
        </button>
      </div>
    </div>
  );
}

const styles = `
  .sgp {
    padding: 24px;
  }

  .sgp__header {
    margin-bottom: 24px;
  }

  .sgp__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--so-slate-900);
    margin: 0 0 8px 0;
  }

  .sgp__subtitle {
    font-size: 0.875rem;
    color: var(--so-slate-600);
    margin: 0;
  }

  .sgp__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
  }

  .sgp__empty__icon {
    width: 64px;
    height: 64px;
    color: var(--so-slate-400);
    margin-bottom: 16px;
  }

  .sgp__empty__icon svg {
    width: 100%;
    height: 100%;
  }

  .sgp__empty__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--so-slate-800);
    margin: 0 0 8px 0;
  }

  .sgp__empty__text {
    font-size: 0.875rem;
    color: var(--so-slate-600);
    margin: 0;
    max-width: 400px;
  }

  .sgp__groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sgp__group {
    background: white;
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-lg);
    overflow: hidden;
  }

  .sgp__group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px 20px;
    background: var(--so-slate-50);
    border: none;
    cursor: pointer;
    transition: background-color var(--so-transition-fast);
  }

  .sgp__group-header:hover {
    background: var(--so-slate-100);
  }

  .sgp__group-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .sgp__group-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--so-slate-900);
    margin: 0;
  }

  .sgp__group-meta {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .sgp__badge {
    padding: 4px 10px;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: var(--so-radius-full);
  }

  .sgp__badge--violet {
    background: var(--so-violet-100);
    color: var(--so-violet-700);
  }

  .sgp__badge--slate {
    background: var(--so-slate-100);
    color: var(--so-slate-700);
  }

  .sgp__expand-icon {
    width: 20px;
    height: 20px;
    color: var(--so-slate-500);
    transition: transform var(--so-transition-fast);
  }

  .sgp__expand-icon--open {
    transform: rotate(180deg);
  }

  .sgp__group-content {
    padding: 24px;
    border-top: 1px solid var(--so-slate-200);
  }

  .sgp__notice {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-radius: var(--so-radius-md);
    margin-bottom: 20px;
  }

  .sgp__notice svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .sgp__notice strong {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .sgp__notice p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .sgp__notice--warning {
    background: var(--so-amber-50);
    border: 1px solid var(--so-amber-200);
    color: var(--so-amber-900);
  }

  .sgp__notice--warning svg {
    color: var(--so-amber-600);
  }

  .sgp__notice--info {
    background: var(--so-blue-50);
    border: 1px solid var(--so-blue-200);
    color: var(--so-blue-900);
  }

  .sgp__notice--info svg {
    color: var(--so-blue-600);
  }

  .sgp__pricing-editor {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .sgp__tier-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sgp__tier-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sgp__tier-tab {
    padding: 10px 18px;
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--so-slate-100);
    color: var(--so-slate-700);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .sgp__tier-tab:hover {
    background: var(--so-slate-200);
  }

  .sgp__tier-tab--active {
    background: var(--so-violet-500);
    color: white;
    border-color: var(--so-violet-500);
  }

  .sgp__section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sgp__section-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--so-slate-800);
    margin: 0;
  }

  .sgp__setup-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
  }

  .sgp__input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sgp__label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .sgp__currency-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
  }

  .sgp__currency-input:focus-within {
    border-color: var(--so-violet-500);
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  .sgp__currency-symbol {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--so-slate-500);
  }

  .sgp__input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.875rem;
    color: var(--so-slate-900);
    font-family: var(--so-font-sans);
  }

  .sgp__input::placeholder {
    color: var(--so-slate-400);
  }

  .sgp__select {
    padding: 10px 12px;
    font-size: 0.875rem;
    color: var(--so-slate-900);
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    font-family: var(--so-font-sans);
  }

  .sgp__select:focus {
    outline: none;
    border-color: var(--so-violet-500);
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  .sgp__recurring-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .sgp__recurring-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sgp__actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }

  .sgp__btn {
    padding: 12px 24px;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: var(--so-radius-md);
    border: none;
    cursor: pointer;
    transition: all var(--so-transition-fast);
    font-family: var(--so-font-sans);
  }

  .sgp__btn--primary {
    background: var(--so-violet-500);
    color: white;
  }

  .sgp__btn--primary:hover {
    background: var(--so-violet-600);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  .sgp__btn--primary:active {
    transform: translateY(0);
  }
`;
