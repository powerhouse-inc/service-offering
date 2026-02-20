import { useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingAction,
  ServiceGroup,
  DiscountType,
} from "@powerhousedao/service-offering/document-models/service-offering";
import { setServiceGroupSetupCost } from "../../../document-models/service-offering/gen/creators.js";
import { formatPrice, calculateEffectiveSetupPrice } from "./pricing-utils.js";

interface ServiceGroupSetupCostPanelProps {
  tierId: string;
  serviceGroups: ServiceGroup[];
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

export function ServiceGroupSetupCostPanel({
  tierId,
  serviceGroups,
  dispatch,
}: ServiceGroupSetupCostPanelProps) {
  // Only show groups that have tier pricing for this tier
  const groupsWithTierPricing = serviceGroups.filter((sg) =>
    sg.tierPricing.some((tp) => tp.tierId === tierId),
  );

  if (groupsWithTierPricing.length === 0) return null;

  return (
    <>
      <style>{panelStyles}</style>
      <div className="sgsc">
        <div className="sgsc__header">
          <span className="sgsc__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
            Setup Costs by Service Group
          </span>
        </div>

        <div className="sgsc__rows">
          {groupsWithTierPricing.map((sg) => {
            const tierPricing = sg.tierPricing.find(
              (tp) => tp.tierId === tierId,
            );
            if (!tierPricing) return null;

            const setupCost = tierPricing.setupCostsPerCycle.find(
              (sc) => sc.billingCycle === sg.billingCycle,
            );

            return (
              <SetupCostRow
                key={sg.id}
                serviceGroup={sg}
                tierId={tierId}
                amount={setupCost?.amount ?? null}
                currency={setupCost?.currency ?? "USD"}
                discountType={setupCost?.discount?.discountType ?? null}
                discountValue={setupCost?.discount?.discountValue ?? null}
                setupCost={setupCost ?? null}
                dispatch={dispatch}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

interface SetupCostRowProps {
  serviceGroup: ServiceGroup;
  tierId: string;
  amount: number | null;
  currency: string;
  discountType: DiscountType | null;
  discountValue: number | null;
  setupCost: {
    amount: number;
    billingCycle: string;
    currency: string;
    discount?: { discountType: DiscountType; discountValue: number } | null;
  } | null;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

function SetupCostRow({
  serviceGroup,
  tierId,
  amount,
  currency,
  discountType,
  discountValue,
  setupCost,
  dispatch,
}: SetupCostRowProps) {
  const [localAmount, setLocalAmount] = useState(amount?.toString() ?? "");
  const [localDiscountType, setLocalDiscountType] = useState<DiscountType>(
    discountType ?? "FLAT_AMOUNT",
  );
  const [localDiscountValue, setLocalDiscountValue] = useState(
    discountValue?.toString() ?? "",
  );

  const hasDiscount =
    localDiscountValue !== "" && parseFloat(localDiscountValue) > 0;

  const handleSave = () => {
    const parsedAmount = parseFloat(localAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const parsedDiscount = parseFloat(localDiscountValue);
    const hasValidDiscount = !isNaN(parsedDiscount) && parsedDiscount > 0;

    dispatch(
      setServiceGroupSetupCost({
        serviceGroupId: serviceGroup.id,
        tierId,
        amount: parsedAmount,
        currency,
        discountType: hasValidDiscount ? localDiscountType : undefined,
        discountValue: hasValidDiscount ? parsedDiscount : undefined,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  // Calculate effective price for display
  const effective =
    setupCost && setupCost.discount
      ? calculateEffectiveSetupPrice(setupCost)
      : null;

  return (
    <div className="sgsc-row">
      <div className="sgsc-row__top">
        <span className="sgsc-row__group-name">{serviceGroup.name}</span>
        <span className="sgsc-row__cycle-badge">
          {serviceGroup.billingCycle}
        </span>
      </div>

      <div className="sgsc-row__fields">
        <div className="sgsc-row__field">
          <span className="sgsc-row__label">Base Amount</span>
          <div className="sgsc-row__input-wrap">
            <span className="sgsc-row__prefix">$</span>
            <input
              type="number"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              onBlur={handleSave}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="sgsc-row__input"
            />
          </div>
        </div>

        <div className="sgsc-row__field">
          <span className="sgsc-row__label">Discount</span>
          <div className="sgsc-row__discount-row">
            <select
              value={localDiscountType}
              onChange={(e) => {
                setLocalDiscountType(e.target.value as DiscountType);
                if (localDiscountValue && parseFloat(localDiscountValue) > 0) {
                  // Re-save with new type on next blur
                }
              }}
              className="sgsc-row__select"
            >
              <option value="FLAT_AMOUNT">Flat ($)</option>
              <option value="PERCENTAGE">Percent (%)</option>
            </select>
            <div className="sgsc-row__input-wrap sgsc-row__input-wrap--discount">
              <span className="sgsc-row__prefix">
                {localDiscountType === "PERCENTAGE" ? "%" : "- $"}
              </span>
              <input
                type="number"
                value={localDiscountValue}
                onChange={(e) => setLocalDiscountValue(e.target.value)}
                onBlur={handleSave}
                placeholder="0"
                step="0.01"
                min="0"
                max={localDiscountType === "PERCENTAGE" ? "100" : undefined}
                className="sgsc-row__input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Effective price display */}
      {effective && effective.hasDiscount && (
        <div className="sgsc-row__effective">
          <span className="sgsc-row__effective-arrow">&rarr;</span>
          <span className="sgsc-row__base-struck">
            {formatPrice(effective.baseAmount, currency)}
          </span>
          <span className="sgsc-row__effective-price">
            {formatPrice(effective.effectiveAmount, currency)}
          </span>
          {effective.savingsPercent > 0 && (
            <span className="sgsc-row__savings">
              save {formatPrice(effective.savings, currency)} (
              {effective.savingsPercent}% off)
            </span>
          )}
        </div>
      )}

      {/* Show current stored value when discount is being typed but not yet saved */}
      {!effective?.hasDiscount && hasDiscount && localAmount && (
        <div className="sgsc-row__hint">
          Save to see effective price preview
        </div>
      )}
    </div>
  );
}

const panelStyles = `
  .sgsc {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--so-slate-200);
  }

  .sgsc__header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }

  .sgsc__title {
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

  .sgsc__title svg {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--so-violet-500);
  }

  .sgsc__rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sgsc-row {
    border: 1px solid var(--so-slate-150, var(--so-slate-100));
    border-radius: var(--so-radius-md);
    overflow: hidden;
  }

  .sgsc-row__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--so-slate-50);
  }

  .sgsc-row__group-name {
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .sgsc-row__cycle-badge {
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    padding: 0.125rem 0.375rem;
    background: var(--so-slate-100);
    color: var(--so-slate-500);
    border-radius: var(--so-radius-sm);
    text-transform: lowercase;
  }

  .sgsc-row__fields {
    display: flex;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem 0.625rem;
  }

  .sgsc-row__field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sgsc-row__label {
    font-family: var(--so-font-mono);
    font-size: 0.5625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--so-slate-400);
  }

  .sgsc-row__input-wrap {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    padding: 0.25rem 0.5rem;
    min-height: 1.75rem;
  }

  .sgsc-row__input-wrap:focus-within {
    border-color: var(--so-violet-300);
    box-shadow: 0 0 0 2px var(--so-violet-100);
  }

  .sgsc-row__prefix {
    font-family: var(--so-font-mono);
    font-size: 0.75rem;
    color: var(--so-slate-400);
    user-select: none;
    white-space: nowrap;
  }

  .sgsc-row__input {
    width: 4rem;
    font-family: var(--so-font-mono);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-800);
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
  }

  .sgsc-row__input::placeholder {
    color: var(--so-slate-300);
  }

  .sgsc-row__discount-row {
    display: flex;
    gap: 0.375rem;
    align-items: stretch;
  }

  .sgsc-row__select {
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    color: var(--so-slate-600);
    background: var(--so-white);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    padding: 0.25rem 0.375rem;
    cursor: pointer;
    outline: none;
  }

  .sgsc-row__select:focus {
    border-color: var(--so-violet-300);
  }

  .sgsc-row__input-wrap--discount {
    flex: 1;
  }

  .sgsc-row__effective {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: var(--so-emerald-50);
    border-top: 1px solid var(--so-emerald-100);
    flex-wrap: wrap;
  }

  .sgsc-row__effective-arrow {
    font-size: 0.6875rem;
    color: var(--so-emerald-400);
  }

  .sgsc-row__base-struck {
    font-family: var(--so-font-mono);
    font-size: 0.75rem;
    color: var(--so-slate-400);
    text-decoration: line-through;
  }

  .sgsc-row__effective-price {
    font-family: var(--so-font-mono);
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--so-emerald-700);
  }

  .sgsc-row__savings {
    font-family: var(--so-font-mono);
    font-size: 0.5625rem;
    font-weight: 600;
    color: var(--so-emerald-600);
    background: var(--so-emerald-100);
    padding: 0.0625rem 0.3125rem;
    border-radius: var(--so-radius-sm);
    margin-left: auto;
  }

  .sgsc-row__hint {
    padding: 0.25rem 0.75rem 0.375rem;
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    color: var(--so-slate-400);
    font-style: italic;
  }
`;
