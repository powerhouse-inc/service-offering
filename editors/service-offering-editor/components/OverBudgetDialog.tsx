import { formatPrice } from "./pricing-utils.js";

interface OverBudgetDialogProps {
  manualBudget: number;
  calculatedTotal: number;
  currency?: string;
  onUpdatePrice: () => void;
  onKeepManual: () => void;
}

const dialogStyles = `
  .over-budget-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .over-budget-dialog {
    background: var(--so-white);
    border-radius: var(--so-radius-lg);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    max-width: 26rem;
    width: 100%;
    padding: 1.5rem;
  }

  .over-budget-dialog__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .over-budget-dialog__icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--so-amber-500);
  }

  .over-budget-dialog__title {
    font-family: var(--so-font-sans);
    font-size: 1rem;
    font-weight: 600;
    color: var(--so-slate-900);
  }

  .over-budget-dialog__body {
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    color: var(--so-slate-600);
    line-height: 1.5;
    margin-bottom: 1.25rem;
  }

  .over-budget-dialog__comparison {
    display: flex;
    justify-content: space-between;
    padding: 0.625rem;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    margin-top: 0.75rem;
  }

  .over-budget-dialog__price-col {
    text-align: center;
  }

  .over-budget-dialog__price-label {
    display: block;
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--so-slate-500);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.25rem;
  }

  .over-budget-dialog__price-value {
    font-family: var(--so-font-mono);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--so-slate-900);
  }

  .over-budget-dialog__price-value--over {
    color: var(--so-rose-600);
  }

  .over-budget-dialog__arrow {
    display: flex;
    align-items: center;
    color: var(--so-slate-400);
  }

  .over-budget-dialog__actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .over-budget-dialog__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.625rem 1rem;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 500;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all var(--so-transition-fast);
    border: 1px solid transparent;
  }

  .over-budget-dialog__btn--primary {
    background: var(--so-violet-600);
    color: var(--so-white);
  }

  .over-budget-dialog__btn--primary:hover {
    background: var(--so-violet-700);
  }

  .over-budget-dialog__btn--secondary {
    background: transparent;
    color: var(--so-slate-600);
    border-color: var(--so-slate-200);
  }

  .over-budget-dialog__btn--secondary:hover {
    background: var(--so-slate-50);
    border-color: var(--so-slate-300);
  }
`;

export function OverBudgetDialog({
  manualBudget,
  calculatedTotal,
  currency = "USD",
  onUpdatePrice,
  onKeepManual,
}: OverBudgetDialogProps) {
  const overage = calculatedTotal - manualBudget;

  return (
    <>
      <style>{dialogStyles}</style>
      <div
        className="over-budget-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onKeepManual();
        }}
      >
        <div className="over-budget-dialog">
          <div className="over-budget-dialog__header">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="over-budget-dialog__icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="over-budget-dialog__title">
              Service groups exceed tier price
            </span>
          </div>

          <div className="over-budget-dialog__body">
            The sum of service group prices (
            {formatPrice(calculatedTotal, currency)}/mo) exceeds the manual tier
            price by <strong>{formatPrice(overage, currency)}</strong>.
            <div className="over-budget-dialog__comparison">
              <div className="over-budget-dialog__price-col">
                <span className="over-budget-dialog__price-label">
                  Tier Price
                </span>
                <span className="over-budget-dialog__price-value">
                  {formatPrice(manualBudget, currency)}
                </span>
              </div>
              <div className="over-budget-dialog__arrow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <div className="over-budget-dialog__price-col">
                <span className="over-budget-dialog__price-label">
                  Actual Sum
                </span>
                <span className="over-budget-dialog__price-value over-budget-dialog__price-value--over">
                  {formatPrice(calculatedTotal, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="over-budget-dialog__actions">
            <button
              type="button"
              className="over-budget-dialog__btn over-budget-dialog__btn--primary"
              onClick={onUpdatePrice}
            >
              Update tier price to {formatPrice(calculatedTotal, currency)}
            </button>
            <button
              type="button"
              className="over-budget-dialog__btn over-budget-dialog__btn--secondary"
              onClick={onKeepManual}
            >
              Keep manual price (show warning)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
