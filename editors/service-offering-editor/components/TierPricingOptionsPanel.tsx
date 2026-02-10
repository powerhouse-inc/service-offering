import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingAction,
  TierPricingOption,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  addTierPricingOption,
  updateTierPricingOption,
  removeTierPricingOption,
} from "../../../document-models/service-offering/gen/creators.js";
import { formatPrice } from "./pricing-utils.js";

interface TierPricingOptionsPanelProps {
  tierId: string;
  pricingOptions: TierPricingOption[];
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  accentColor?: string;
}

const panelStyles = `
  .pricing-options-panel {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--so-slate-200);
  }

  .pricing-options-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .pricing-options-panel__title {
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--so-slate-500);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .pricing-options-panel__title svg {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--so-violet-500);
  }

  .pricing-options-panel__add-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-family: var(--so-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--so-violet-600);
    background: var(--so-violet-50);
    border: 1px solid var(--so-violet-200);
    border-radius: var(--so-radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .pricing-options-panel__add-btn:hover {
    background: var(--so-violet-100);
    border-color: var(--so-violet-300);
  }

  .pricing-options-panel__add-btn svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .pricing-options-panel__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Individual Pricing Option Row */
  .pricing-option-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: var(--so-slate-50);
    border: 1px solid var(--so-slate-100);
    border-radius: var(--so-radius-md);
    transition: all 0.15s ease;
  }

  .pricing-option-row:hover {
    border-color: var(--so-slate-200);
  }

  .pricing-option-row--default {
    background: var(--so-violet-50);
    border-color: var(--so-violet-200);
  }

  .pricing-option-row__cycle {
    flex-shrink: 0;
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--so-slate-600);
    padding: 0.25rem 0.5rem;
    background: var(--so-white);
    border-radius: var(--so-radius-sm);
    min-width: 4rem;
    text-align: center;
  }

  .pricing-option-row--default .pricing-option-row__cycle {
    color: var(--so-violet-700);
    background: var(--so-violet-100);
  }

  .pricing-option-row__amount-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
  }

  .pricing-option-row__currency {
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    color: var(--so-slate-400);
  }

  .pricing-option-row__amount-input {
    width: 5rem;
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-800);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    padding: 0.25rem 0.5rem;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .pricing-option-row__amount-input:focus {
    border-color: var(--so-violet-400);
  }

  .pricing-option-row__monthly {
    flex: 1;
    font-family: var(--so-font-sans);
    font-size: 0.6875rem;
    color: var(--so-emerald-600);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pricing-option-row__actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .pricing-option-row__default-badge {
    font-family: var(--so-font-mono);
    font-size: 0.5625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--so-violet-600);
    padding: 0.125rem 0.375rem;
    background: var(--so-violet-100);
    border-radius: var(--so-radius-sm);
  }

  .pricing-option-row__action-btn {
    padding: 0.25rem;
    color: var(--so-slate-400);
    background: transparent;
    border: none;
    border-radius: var(--so-radius-sm);
    cursor: pointer;
    transition: all 0.1s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pricing-option-row__action-btn:hover {
    color: var(--so-slate-600);
    background: var(--so-slate-100);
  }

  .pricing-option-row__action-btn--make-default:hover {
    color: var(--so-violet-600);
    background: var(--so-violet-50);
  }

  .pricing-option-row__action-btn--delete:hover {
    color: var(--so-rose-500);
    background: var(--so-rose-50);
  }

  .pricing-option-row__action-btn svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* Add New Option Form */
  .pricing-option-add-form {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--so-violet-50);
    border: 2px dashed var(--so-violet-200);
    border-radius: var(--so-radius-md);
    animation: pricing-option-fade-in 0.2s ease-out;
  }

  @keyframes pricing-option-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pricing-option-add-form__cycle-select {
    font-family: var(--so-font-sans);
    font-size: 0.75rem;
    color: var(--so-slate-700);
    background: var(--so-white);
    border: 1px solid var(--so-violet-200);
    border-radius: var(--so-radius-sm);
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    outline: none;
  }

  .pricing-option-add-form__cycle-select:focus {
    border-color: var(--so-violet-400);
  }

  .pricing-option-add-form__amount-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
  }

  .pricing-option-add-form__currency {
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    color: var(--so-slate-400);
  }

  .pricing-option-add-form__amount-input {
    width: 5rem;
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-800);
    background: var(--so-white);
    border: 1px solid var(--so-violet-200);
    border-radius: var(--so-radius-sm);
    padding: 0.375rem 0.5rem;
    outline: none;
  }

  .pricing-option-add-form__amount-input:focus {
    border-color: var(--so-violet-400);
  }

  .pricing-option-add-form__actions {
    display: flex;
    gap: 0.25rem;
  }

  .pricing-option-add-form__btn {
    padding: 0.375rem 0.625rem;
    font-family: var(--so-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    border-radius: var(--so-radius-sm);
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .pricing-option-add-form__btn--add {
    color: var(--so-white);
    background: var(--so-violet-600);
    border: none;
  }

  .pricing-option-add-form__btn--add:hover:not(:disabled) {
    background: var(--so-violet-700);
  }

  .pricing-option-add-form__btn--add:disabled {
    background: var(--so-slate-300);
    cursor: not-allowed;
  }

  .pricing-option-add-form__btn--cancel {
    color: var(--so-slate-600);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
  }

  .pricing-option-add-form__btn--cancel:hover {
    background: var(--so-slate-50);
  }

  /* Empty State */
  .pricing-options-panel__empty {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    color: var(--so-slate-500);
    font-size: 0.75rem;
  }

  .pricing-options-panel__empty svg {
    width: 1rem;
    height: 1rem;
    color: var(--so-slate-400);
  }
`;

export function TierPricingOptionsPanel({
  tierId,
  pricingOptions,
  dispatch,
}: TierPricingOptionsPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState({
    amount: "",
  });

  const handleAddOption = () => {
    if (!newOption.amount) return;

    dispatch(
      addTierPricingOption({
        tierId,
        pricingOptionId: generateId(),
        amount: parseFloat(newOption.amount),
        currency: "USD",
        isDefault: pricingOptions.length === 0,
        lastModified: new Date().toISOString(),
      }),
    );

    setNewOption({ amount: "" });
    setIsAdding(false);
  };

  const handleUpdateAmount = (optionId: string, amount: string) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return;

    dispatch(
      updateTierPricingOption({
        tierId,
        pricingOptionId: optionId,
        amount: parsedAmount,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleMakeDefault = (optionId: string) => {
    dispatch(
      updateTierPricingOption({
        tierId,
        pricingOptionId: optionId,
        isDefault: true,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleRemoveOption = (optionId: string) => {
    if (pricingOptions.length <= 1) {
      alert("Cannot remove the last pricing option");
      return;
    }
    dispatch(
      removeTierPricingOption({
        tierId,
        pricingOptionId: optionId,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  return (
    <>
      <style>{panelStyles}</style>
      <div className="pricing-options-panel">
        <div className="pricing-options-panel__header">
          <span className="pricing-options-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Pricing Options
          </span>
          {!isAdding && (
            <button
              onClick={() => {
                setNewOption({ amount: "" });
                setIsAdding(true);
              }}
              className="pricing-options-panel__add-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Option
            </button>
          )}
        </div>

        <div className="pricing-options-panel__list">
          {pricingOptions.length === 0 && !isAdding && (
            <div className="pricing-options-panel__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              No pricing options configured. Add billing cycle options to offer
              flexible pricing.
            </div>
          )}

          {pricingOptions.map((option) => (
            <PricingOptionRow
              key={option.id}
              option={option}
              canDelete={pricingOptions.length > 1}
              onUpdateAmount={(amount) => handleUpdateAmount(option.id, amount)}
              onMakeDefault={() => handleMakeDefault(option.id)}
              onRemove={() => handleRemoveOption(option.id)}
            />
          ))}

          {isAdding && (
            <div className="pricing-option-add-form">
              <div className="pricing-option-add-form__amount-group">
                <span className="pricing-option-add-form__currency">$</span>
                <input
                  type="number"
                  value={newOption.amount}
                  onChange={(e) =>
                    setNewOption({ ...newOption, amount: e.target.value })
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="pricing-option-add-form__amount-input"
                  autoFocus
                />
              </div>
              <div className="pricing-option-add-form__actions">
                <button
                  onClick={handleAddOption}
                  disabled={
                    !newOption.amount || parseFloat(newOption.amount) <= 0
                  }
                  className="pricing-option-add-form__btn pricing-option-add-form__btn--add"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewOption({ amount: "" });
                  }}
                  className="pricing-option-add-form__btn pricing-option-add-form__btn--cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface PricingOptionRowProps {
  option: TierPricingOption;
  canDelete: boolean;
  onUpdateAmount: (amount: string) => void;
  onMakeDefault: () => void;
  onRemove: () => void;
}

function PricingOptionRow({
  option,
  canDelete,
  onUpdateAmount,
  onMakeDefault,
  onRemove,
}: PricingOptionRowProps) {
  const [localAmount, setLocalAmount] = useState(
    option.amount?.toString() ?? "",
  );

  const priceDisplay = formatPrice(
    option.amount ?? 0,
    option.currency ?? "USD",
  );

  return (
    <div
      className={`pricing-option-row ${option.isDefault ? "pricing-option-row--default" : ""}`}
    >
      <span className="pricing-option-row__cycle">Option</span>
      <div className="pricing-option-row__amount-group">
        <span className="pricing-option-row__currency">$</span>
        <input
          type="number"
          value={localAmount}
          onChange={(e) => setLocalAmount(e.target.value)}
          onBlur={() => {
            if (localAmount && parseFloat(localAmount) !== option.amount) {
              onUpdateAmount(localAmount);
            }
          }}
          step="0.01"
          className="pricing-option-row__amount-input"
        />
      </div>
      <span className="pricing-option-row__monthly">{priceDisplay}</span>
      <div className="pricing-option-row__actions">
        {option.isDefault ? (
          <span className="pricing-option-row__default-badge">Default</span>
        ) : (
          <button
            onClick={onMakeDefault}
            className="pricing-option-row__action-btn pricing-option-row__action-btn--make-default"
            title="Make default"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        )}
        {canDelete && (
          <button
            onClick={onRemove}
            className="pricing-option-row__action-btn pricing-option-row__action-btn--delete"
            title="Remove"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
