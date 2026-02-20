import { formatPrice } from "./pricing-utils.js";

interface BudgetIndicatorProps {
  budget: number;
  allocated: number;
  currency?: string;
}

const budgetStyles = `
  .budget-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    border-radius: var(--so-radius-sm);
    font-size: 0.6875rem;
    border: 1px solid var(--so-slate-200);
    background: var(--so-slate-50);
  }

  .budget-indicator--warning {
    border-color: var(--so-amber-200);
    background: var(--so-amber-50);
  }

  .budget-indicator--over {
    border-color: var(--so-rose-200);
    background: var(--so-rose-50);
  }

  .budget-indicator__bar-wrap {
    flex: 1;
    height: 0.375rem;
    background: var(--so-slate-200);
    border-radius: 9999px;
    overflow: hidden;
  }

  .budget-indicator__bar-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.3s ease;
  }

  .budget-indicator__bar-fill--ok {
    background: var(--so-emerald-500);
  }

  .budget-indicator__bar-fill--warning {
    background: var(--so-amber-500);
  }

  .budget-indicator__bar-fill--over {
    background: var(--so-rose-500);
  }

  .budget-indicator__label {
    white-space: nowrap;
    color: var(--so-slate-600);
  }

  .budget-indicator--warning .budget-indicator__label {
    color: var(--so-amber-700);
  }

  .budget-indicator--over .budget-indicator__label {
    color: var(--so-rose-700);
  }

  .budget-indicator__value {
    font-family: var(--so-font-mono);
    font-weight: 600;
  }
`;

export function BudgetIndicator({
  budget,
  allocated,
  currency = "USD",
}: BudgetIndicatorProps) {
  if (budget <= 0) return null;

  const remaining = budget - allocated;
  const pct = Math.min((allocated / budget) * 100, 100);
  const isWarning = pct >= 80 && pct <= 100;
  const isOver = allocated > budget;

  const containerClass = isOver
    ? "budget-indicator budget-indicator--over"
    : isWarning
      ? "budget-indicator budget-indicator--warning"
      : "budget-indicator";

  const fillClass = isOver
    ? "budget-indicator__bar-fill budget-indicator__bar-fill--over"
    : isWarning
      ? "budget-indicator__bar-fill budget-indicator__bar-fill--warning"
      : "budget-indicator__bar-fill budget-indicator__bar-fill--ok";

  return (
    <>
      <style>{budgetStyles}</style>
      <div className={containerClass}>
        <span className="budget-indicator__label">
          <span className="budget-indicator__value">
            {formatPrice(allocated, currency)}
          </span>
          {" / "}
          {formatPrice(budget, currency)}
        </span>
        <div className="budget-indicator__bar-wrap">
          <div className={fillClass} style={{ width: `${pct}%` }} />
        </div>
        <span className="budget-indicator__label">
          {isOver ? (
            <>
              <span className="budget-indicator__value">
                +{formatPrice(allocated - budget, currency)}
              </span>{" "}
              over
            </>
          ) : (
            <>
              <span className="budget-indicator__value">
                {formatPrice(remaining, currency)}
              </span>{" "}
              left
            </>
          )}
        </span>
      </div>
    </>
  );
}
