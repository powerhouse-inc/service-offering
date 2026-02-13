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

  // Include group-level recurring costs
  for (const group of state.serviceGroups) {
    if (group.recurringCost) {
      serviceLines.push({
        name: `${group.name || "Service Group"}`,
        amount: group.recurringCost.amount,
        currency: group.recurringCost.currency,
        cycle: group.recurringCost.billingCycle || null,
      });
    }
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
        metric.limit != null &&
        metric.currentUsage > metric.limit &&
        metric.unitCost
      ) {
        const excess = metric.currentUsage - metric.limit;
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

  const hasAnyData =
    state.nextBillingDate ||
    state.projectedBillAmount != null ||
    serviceLines.length > 0;

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
            <div style={{ marginBottom: overageLines.length > 0 ? 16 : 0 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--si-slate-500)",
                  marginBottom: 8,
                }}
              >
                Recurring Services
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {serviceLines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "var(--si-slate-50)",
                      borderRadius: "var(--si-radius-sm)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--si-slate-700)" }}>
                      {line.name}
                      {line.cycle && (
                        <span
                          style={{
                            color: "var(--si-slate-400)",
                            fontSize: "0.75rem",
                            marginLeft: 6,
                          }}
                        >
                          / {line.cycle.toLowerCase().replace("_", " ")}
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--si-slate-800)",
                      }}
                    >
                      {formatCurrency(line.amount, line.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overage estimates */}
          {overageLines.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--si-amber-600)",
                  marginBottom: 8,
                }}
              >
                Overage Estimates
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {overageLines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "var(--si-amber-50)",
                      borderRadius: "var(--si-radius-sm)",
                      fontSize: "0.875rem",
                      border: "1px solid var(--si-amber-100)",
                    }}
                  >
                    <span style={{ color: "var(--si-amber-700)" }}>
                      {line.name}
                      <span
                        style={{
                          color: "var(--si-amber-500)",
                          fontSize: "0.75rem",
                          marginLeft: 6,
                        }}
                      >
                        {line.excess} x{" "}
                        {formatCurrency(line.unitCost, line.currency)}
                      </span>
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--si-amber-700)",
                      }}
                    >
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
