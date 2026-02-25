import type {
  BillingCycle,
  BillingCycleDiscount,
} from "@powerhousedao/service-offering/document-models/service-offering";
import { formatPrice, BILLING_CYCLE_MONTHS } from "./pricing-utils.js";

interface BillingCycleConfigPanelProps {
  tierId: string;
  basePrice: number | null;
  currency: string;
  billingCycleDiscounts: BillingCycleDiscount[];
  isCustomPricing: boolean;
}

const CYCLE_ORDER: BillingCycle[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
];

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  SEMI_ANNUAL: "Semi-Annual",
  ANNUAL: "Annual",
};

const CYCLE_SHORT: Record<string, string> = {
  MONTHLY: "1mo",
  QUARTERLY: "3mo",
  SEMI_ANNUAL: "6mo",
  ANNUAL: "12mo",
};

const panelStyles = `
  .bcp {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--so-slate-200);
  }

  .bcp__header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }

  .bcp__title {
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

  .bcp__title svg {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--so-violet-500);
  }

  .bcp__computed-label {
    font-family: var(--so-font-mono);
    font-size: 0.5625rem;
    font-weight: 500;
    color: var(--so-slate-400);
    background: var(--so-slate-100);
    padding: 0.125rem 0.375rem;
    border-radius: var(--so-radius-sm);
    margin-left: auto;
  }

  .bcp__no-price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    color: var(--so-slate-500);
    font-size: 0.75rem;
  }

  .bcp__no-price svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: var(--so-slate-400);
  }

  .bcp__rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Row container */
  .bcp-row {
    border: 1px solid var(--so-slate-150, var(--so-slate-100));
    border-radius: var(--so-radius-md);
    overflow: hidden;
    transition: all 0.15s ease;
  }

  .bcp-row--active {
    border-color: var(--so-violet-200);
  }

  .bcp-row--disabled {
    opacity: 0.5;
  }

  /* Top part: label + total */
  .bcp-row__top {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    background: var(--so-white);
    cursor: default;
  }

  .bcp-row--active .bcp-row__top {
    background: var(--so-violet-50);
  }

  .bcp-row__cycle-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .bcp-row__cycle-dot--active {
    background: var(--so-violet-500);
  }

  .bcp-row__cycle-dot--inactive {
    background: var(--so-slate-300);
  }

  .bcp-row__label {
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-700);
    flex: 1;
  }

  .bcp-row__total {
    font-family: var(--so-font-mono);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--so-slate-800);
    white-space: nowrap;
  }

  .bcp-row__dash {
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    color: var(--so-slate-300);
    margin-left: auto;
  }

  /* Expanded detail area */
  .bcp-row__detail {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    padding: 0.5rem 0.75rem 0.625rem;
    background: var(--so-slate-50);
    border-top: 1px solid var(--so-slate-100);
  }

  .bcp-row--active .bcp-row__detail {
    background: var(--so-violet-50);
    border-top-color: var(--so-violet-100);
  }

  .bcp-row__detail-col {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .bcp-row__detail-col--price {
    flex: 1;
  }

  .bcp-row__detail-col--discount {
    flex: 1;
  }

  .bcp-row__detail-label {
    font-family: var(--so-font-mono);
    font-size: 0.5625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--so-slate-400);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .bcp-row__detail-label svg {
    width: 0.6875rem;
    height: 0.6875rem;
  }

  .bcp-row__calc {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--so-font-mono);
    font-size: 0.75rem;
    color: var(--so-slate-500);
    padding: 0.25rem 0;
    min-height: 1.75rem;
  }

  .bcp-row__calc-result {
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .bcp-row__discount-display {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: var(--so-font-mono);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-600);
    padding: 0.25rem 0;
    min-height: 1.75rem;
  }

  .bcp-row__discount-display--zero {
    color: var(--so-slate-300);
  }

  /* Effective price line (only when discount > 0) */
  .bcp-row__effective {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: var(--so-emerald-50);
    border-top: 1px solid var(--so-emerald-100);
  }

  .bcp-row__effective-arrow {
    font-size: 0.6875rem;
    color: var(--so-emerald-400);
  }

  .bcp-row__effective-price {
    font-family: var(--so-font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--so-emerald-700);
  }

  .bcp-row__effective-savings {
    font-family: var(--so-font-mono);
    font-size: 0.5625rem;
    font-weight: 600;
    color: var(--so-emerald-600);
    background: var(--so-emerald-100);
    padding: 0.0625rem 0.3125rem;
    border-radius: var(--so-radius-sm);
    margin-left: auto;
  }
`;

export function BillingCycleConfigPanel({
  basePrice,
  currency,
  billingCycleDiscounts,
  isCustomPricing,
}: BillingCycleConfigPanelProps) {
  if (isCustomPricing) return null;

  const hasBasePrice = basePrice !== null && basePrice > 0;

  const isCycleEnabled = (cycle: BillingCycle): boolean => {
    if (cycle === "MONTHLY") return true;
    return billingCycleDiscounts.some((d) => d.billingCycle === cycle);
  };

  const getDiscountValue = (cycle: BillingCycle): number => {
    const entry = billingCycleDiscounts.find((d) => d.billingCycle === cycle);
    return entry?.discountRule?.discountValue ?? 0;
  };

  const getCycleTotal = (cycle: BillingCycle): number | null => {
    if (!hasBasePrice) return null;
    return basePrice * BILLING_CYCLE_MONTHS[cycle];
  };

  return (
    <>
      <style>{panelStyles}</style>
      <div className="bcp">
        <div className="bcp__header">
          <span className="bcp__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Billing Cycles & Discounts
          </span>
          <span className="bcp__computed-label">
            Computed from service groups
          </span>
        </div>

        {!hasBasePrice && (
          <div className="bcp__no-price">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Discounts will appear here once service groups set pricing for this
            tier.
          </div>
        )}

        <div className="bcp__rows">
          {CYCLE_ORDER.map((cycle) => {
            const enabled = isCycleEnabled(cycle);
            const isMonthly = cycle === "MONTHLY";
            const total = getCycleTotal(cycle);
            const discount = getDiscountValue(cycle);

            return (
              <BillingCycleRow
                key={cycle}
                label={CYCLE_LABELS[cycle]}
                shortLabel={CYCLE_SHORT[cycle]}
                enabled={enabled}
                isMonthly={isMonthly}
                basePrice={basePrice}
                total={total}
                discount={discount}
                currency={currency}
                hasBasePrice={hasBasePrice}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

interface BillingCycleRowProps {
  label: string;
  shortLabel: string;
  enabled: boolean;
  isMonthly: boolean;
  basePrice: number | null;
  total: number | null;
  discount: number;
  currency: string;
  hasBasePrice: boolean;
}

function BillingCycleRow({
  label,
  shortLabel,
  enabled,
  isMonthly,
  basePrice,
  total,
  discount,
  currency,
  hasBasePrice,
}: BillingCycleRowProps) {
  const effectivePrice =
    total !== null && discount > 0 ? Math.max(0, total - discount) : null;

  const savingsPercent =
    total !== null && total > 0 && discount > 0
      ? Math.round((discount / total) * 100)
      : 0;

  const currencySymbol = currency === "USD" ? "$" : currency;

  const rowClass = [
    "bcp-row",
    enabled ? "bcp-row--active" : "",
    !hasBasePrice && !isMonthly ? "bcp-row--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClass}>
      {/* Top: dot + label + total */}
      <div className="bcp-row__top">
        <span
          className={`bcp-row__cycle-dot ${enabled ? "bcp-row__cycle-dot--active" : "bcp-row__cycle-dot--inactive"}`}
        />
        <span className="bcp-row__label">{label}</span>
        {enabled && total !== null ? (
          <span className="bcp-row__total">{formatPrice(total, currency)}</span>
        ) : (
          !enabled && <span className="bcp-row__dash">--</span>
        )}
      </div>

      {/* Detail: standard price calc + discount display (read-only) */}
      {enabled && hasBasePrice && (
        <div className="bcp-row__detail">
          <div className="bcp-row__detail-col bcp-row__detail-col--price">
            <span className="bcp-row__detail-label">Standard Price</span>
            <div className="bcp-row__calc">
              <span>
                {currencySymbol}
                {basePrice} &times; {shortLabel}
              </span>
              <span className="bcp-row__calc-result">
                {formatPrice(total ?? 0, currency)}
              </span>
            </div>
          </div>
          <div className="bcp-row__detail-col bcp-row__detail-col--discount">
            <span className="bcp-row__detail-label">
              Flat Discount
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </span>
            <div
              className={`bcp-row__discount-display ${discount === 0 ? "bcp-row__discount-display--zero" : ""}`}
            >
              - {currencySymbol}
              {discount > 0 ? discount.toLocaleString() : "0"}
            </div>
          </div>
        </div>
      )}

      {/* Effective price bar (only when discount > 0) */}
      {effectivePrice !== null && discount > 0 && (
        <div className="bcp-row__effective">
          <span className="bcp-row__effective-arrow">&rarr;</span>
          <span className="bcp-row__effective-price">
            {formatPrice(effectivePrice, currency)}
          </span>
          {savingsPercent > 0 && (
            <span className="bcp-row__effective-savings">
              {savingsPercent}% off
            </span>
          )}
        </div>
      )}
    </div>
  );
}
