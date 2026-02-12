import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ViewMode } from "../types.js";

interface BillingPanelProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

export function BillingPanel({ document }: BillingPanelProps) {
  const state = document.state.global;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Compute service-level billing breakdown from services
  const serviceLines: Array<{
    name: string;
    amount: number;
    currency: string;
    cycle: string | null;
  }> = [];

  for (const svc of state.services) {
    if (svc.recurringCost) {
      serviceLines.push({
        name: svc.name || "Unnamed Service",
        amount: svc.recurringCost.amount,
        currency: svc.recurringCost.currency,
        cycle: svc.recurringCost.billingCycle || null,
      });
    }
  }

  // Include group services
  for (const group of state.serviceGroups) {
    for (const svc of group.services) {
      if (svc.recurringCost) {
        serviceLines.push({
          name: `${svc.name || "Unnamed"} (${group.name || "Group"})`,
          amount: svc.recurringCost.amount,
          currency: svc.recurringCost.currency,
          cycle: svc.recurringCost.billingCycle || null,
        });
      }
    }
  }

  // Include recurring option group costs
  for (const og of state.selectedOptionGroups) {
    if (og.costType === "RECURRING" && og.price != null && og.currency) {
      serviceLines.push({
        name: `${og.name} (add-on)`,
        amount: og.price,
        currency: og.currency,
        cycle: og.billingCycle || null,
      });
    }
  }

  // Compute setup cost lines
  const setupLines: Array<{
    name: string;
    amount: number;
    currency: string;
    paid: boolean;
  }> = [];

  for (const svc of state.services) {
    if (svc.setupCost) {
      setupLines.push({
        name: svc.name || "Unnamed Service",
        amount: svc.setupCost.amount,
        currency: svc.setupCost.currency,
        paid: !!svc.setupCost.paymentDate,
      });
    }
  }

  for (const group of state.serviceGroups) {
    for (const svc of group.services) {
      if (svc.setupCost) {
        setupLines.push({
          name: `${svc.name || "Unnamed"} (${group.name || "Group"})`,
          amount: svc.setupCost.amount,
          currency: svc.setupCost.currency,
          paid: !!svc.setupCost.paymentDate,
        });
      }
    }
  }

  // Include option group setup costs
  for (const og of state.selectedOptionGroups) {
    if (og.costType === "SETUP" && og.price != null && og.currency) {
      setupLines.push({
        name: og.name,
        amount: og.price,
        currency: og.currency,
        paid: false,
      });
    }
  }

  // Compute overage estimates from metrics
  const overageLines: Array<{
    name: string;
    excess: number;
    unitCost: number;
    currency: string;
    total: number;
  }> = [];

  for (const svc of state.services) {
    for (const metric of svc.metrics) {
      if (
        metric.freeLimit != null &&
        metric.currentUsage > metric.freeLimit &&
        metric.unitCost
      ) {
        const excess = metric.currentUsage - metric.freeLimit;
        const total = excess * metric.unitCost.amount;
        overageLines.push({
          name: `${metric.name} overage`,
          excess,
          unitCost: metric.unitCost.amount,
          currency: metric.unitCost.currency,
          total,
        });
      }
    }
  }

  const computedTotal = serviceLines.reduce((sum, l) => sum + l.amount, 0);
  const overageTotal = overageLines.reduce((sum, l) => sum + l.total, 0);
  const projectedTotal =
    state.projectedBillAmount != null
      ? state.projectedBillAmount
      : computedTotal + overageTotal;
  const projectedCurrency =
    state.projectedBillCurrency || serviceLines[0]?.currency || "USD";

  const setupTotal = setupLines.reduce((sum, l) => sum + l.amount, 0);

  const hasAnyData =
    state.nextBillingDate ||
    state.projectedBillAmount != null ||
    serviceLines.length > 0 ||
    setupLines.length > 0;

  return (
    <div className="si-panel">
      <div className="si-panel__header">
        <h3 className="si-panel__title">Billing Projection</h3>
      </div>

      {!hasAnyData ? (
        <div className="si-empty">
          <svg
            className="si-empty__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
            />
          </svg>
          <p className="si-empty__text">No billing data yet</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="si-billing-summary">
            <div className="si-billing-summary__item">
              <span className="si-billing-summary__label">Next Payment</span>
              <span className="si-billing-summary__value">
                {formatDate(state.nextBillingDate)}
              </span>
            </div>
            <div className="si-billing-summary__item">
              <span className="si-billing-summary__label">
                Projected Amount
              </span>
              <span className="si-billing-summary__value si-billing-summary__value--warning">
                {formatCurrency(projectedTotal, projectedCurrency)}
              </span>
            </div>
            <div className="si-billing-summary__item">
              <span className="si-billing-summary__label">Currency</span>
              <span className="si-billing-summary__value">
                {projectedCurrency}
              </span>
            </div>
          </div>

          {/* Line-by-line breakdown */}
          {serviceLines.length > 0 && (
            <div className="si-billing-section">
              <div className="si-billing-section__title">
                Recurring Services
              </div>
              <div className="si-billing-section__lines">
                {serviceLines.map((line, idx) => (
                  <div key={idx} className="si-billing-line">
                    <span className="si-billing-line__name">
                      {line.name}
                      {line.cycle && (
                        <span className="si-billing-line__cycle">
                          / {line.cycle.toLowerCase().replace("_", " ")}
                        </span>
                      )}
                    </span>
                    <span className="si-billing-line__amount">
                      {formatCurrency(line.amount, line.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup costs */}
          {setupLines.length > 0 && (
            <div className="si-billing-section">
              <div className="si-billing-section__title si-billing-section__title--setup">
                <span>Setup Costs</span>
                <span className="si-billing-section__total">
                  {formatCurrency(setupTotal, setupLines[0]?.currency || "USD")}
                </span>
              </div>
              <div className="si-billing-section__lines">
                {setupLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="si-billing-line si-billing-line--setup"
                  >
                    <span className="si-billing-line__name">{line.name}</span>
                    <span className="si-billing-line__right">
                      {line.paid && (
                        <span className="si-billing-line__paid-tag">Paid</span>
                      )}
                      <span
                        className={`si-billing-line__amount ${
                          line.paid
                            ? "si-billing-line__amount--paid"
                            : "si-billing-line__amount--setup"
                        }`}
                      >
                        {formatCurrency(line.amount, line.currency)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overage estimates */}
          {overageLines.length > 0 && (
            <div className="si-billing-section">
              <div className="si-billing-section__title si-billing-section__title--overage">
                Overage Estimates
              </div>
              <div className="si-billing-section__lines">
                {overageLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="si-billing-line si-billing-line--overage"
                  >
                    <span className="si-billing-line__name si-billing-line__name--overage">
                      {line.name}
                      <span className="si-billing-line__calc">
                        {line.excess} x{" "}
                        {formatCurrency(line.unitCost, line.currency)}
                      </span>
                    </span>
                    <span className="si-billing-line__amount si-billing-line__amount--overage">
                      {formatCurrency(line.total, line.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
