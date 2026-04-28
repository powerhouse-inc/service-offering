import { useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "document-models/subscription-instance";
import type { ViewMode } from "../types.js";
import {
  formatCurrency,
  formatDate,
  formatBillingCycleSuffix,
  formatDiscountBadge,
  computeBillingBreakdown,
  type GroupBillingBreakdown,
  type MetricOverage,
  type SetupCostLine,
} from "./billing-utils.js";
import {
  reportSetupPayment,
  reportRecurringPayment,
  reportOveragePayment,
} from "../../../document-models/subscription-instance/v1/gen/service/creators.js";
import { useNowISO } from "./SimulatedClock.js";

interface BillingPanelProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

export function BillingPanel({ document, dispatch, mode }: BillingPanelProps) {
  const state = document.state.global;
  const breakdown = computeBillingBreakdown(state);
  const [setupExpanded, setSetupExpanded] = useState(false);
  const nowISO = useNowISO();

  const hasAnyData =
    state.nextBillingDate ||
    state.totalDebt != null ||
    breakdown.groupBreakdowns.length > 0 ||
    state.services.length > 0 ||
    breakdown.setupLines.length > 0;

  if (!hasAnyData) {
    return (
      <div className="si-panel">
        <div className="si-panel__header">
          <h3 className="si-panel__title">Billing Projection</h3>
        </div>
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
      </div>
    );
  }

  const projectedTotal = breakdown.projectedTotal;
  const currency = breakdown.currency;
  const hasDynamicCosts = breakdown.dynamicTotal > 0;
  const hasFixedCosts = breakdown.fixedTotal > 0;
  // Amount owed = totalDebt - totalCredit (D-7: raw difference, no floor)
  // Overage is only in totalDebt after settlement — don't double-count
  const amountOwed = (state.totalDebt ?? 0) - (state.totalCredit ?? 0);

  return (
    <div className="si-panel">
      {/* Panel Header — SI-R1 */}
      <div className="si-panel__header">
        <h3 className="si-panel__title">Billing Projection</h3>
      </div>

      {/* Billing Status — headline for both client and operator */}
      {state.currentBillingCycleStart && (
        <div className="si-billing-summary">
          {/* Amount Owed — headline number with breakdown */}
          <div
            className={`si-billing-summary__item${amountOwed > 0 ? " si-billing-summary__item--alert" : ""}`}
          >
            <span className="si-billing-summary__label">
              {amountOwed > 0
                ? "Outstanding Balance"
                : amountOwed < 0
                  ? "Credit Balance"
                  : "Balance"}
            </span>
            <span
              className={`si-billing-summary__value ${amountOwed > 0 ? "si-billing-summary__value--danger" : amountOwed < 0 ? "si-billing-summary__value--success" : ""}`}
            >
              {amountOwed === 0
                ? "Paid up"
                : formatCurrency(Math.abs(amountOwed), currency)}
            </span>
            {amountOwed > 0 && (
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--si-slate-500)",
                  marginTop: 2,
                }}
              >
                {(() => {
                  const parts: string[] = [];
                  // Check for unpaid setup costs
                  const unpaidSetup = state.serviceGroups
                    .filter((g) => g.setupCost && !g.setupCost.paymentDate)
                    .reduce((sum, g) => sum + (g.setupCost?.amount ?? 0), 0);
                  if (unpaidSetup > 0)
                    parts.push(
                      `${formatCurrency(unpaidSetup, currency)} setup`,
                    );
                  // Check for recurring (totalDebt includes settled recurring + overage)
                  const totalBilled = state.totalDebt ?? 0;
                  const totalPaid = state.totalCredit ?? 0;
                  const settled = totalBilled - unpaidSetup - totalPaid;
                  if (settled > 0 && unpaidSetup > 0)
                    parts.push(
                      `${formatCurrency(settled, currency)} recurring/overage`,
                    );
                  // If all from one source, show overage breakdown
                  if (parts.length === 0 && breakdown.dynamicTotal > 0) {
                    for (const g of breakdown.groupBreakdowns) {
                      for (const o of g.metricOverages) {
                        parts.push(
                          `${o.excess} ${o.unitName} overage on ${o.metricName}`,
                        );
                      }
                    }
                    for (const o of breakdown.standaloneOverages) {
                      parts.push(
                        `${o.excess} ${o.unitName} overage on ${o.metricName}`,
                      );
                    }
                  }
                  return parts.length > 0 ? parts.join(" + ") : null;
                })()}
              </span>
            )}
          </div>

          {/* Current Cycle */}
          <div className="si-billing-summary__item">
            <span className="si-billing-summary__label">Current Cycle</span>
            <span className="si-billing-summary__value">
              {formatDate(state.currentBillingCycleStart)} —{" "}
              {formatDate(state.nextBillingDate)}
            </span>
          </div>

          {/* Next Payment Due */}
          <div className="si-billing-summary__item">
            <span className="si-billing-summary__label">Next Payment Due</span>
            <span className="si-billing-summary__value">
              {formatDate(state.nextBillingDate)}
            </span>
          </div>

          {/* Billing Cycle */}
          <div className="si-billing-summary__item">
            <span className="si-billing-summary__label">Billing Cycle</span>
            <span className="si-billing-summary__value">
              {breakdown.billingCycle
                ? breakdown.billingCycle.charAt(0) +
                  breakdown.billingCycle.slice(1).toLowerCase()
                : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Cost Projection — what the next settlement will charge */}
      <div className="si-billing-summary">
        <div className="si-billing-summary__item">
          <span className="si-billing-summary__label">Fixed</span>
          <span className="si-billing-summary__value">
            {formatCurrency(breakdown.fixedTotal, currency)}
          </span>
        </div>
        {hasDynamicCosts && (
          <div className="si-billing-summary__item">
            <span className="si-billing-summary__label">Dynamic *</span>
            <span className="si-billing-summary__value si-billing-summary__value--warning">
              {formatCurrency(breakdown.dynamicTotal, currency)}
            </span>
          </div>
        )}
        <div className="si-billing-summary__item">
          <span className="si-billing-summary__label">
            Projected Total{hasDynamicCosts ? " *" : ""}
          </span>
          <span className="si-billing-summary__value si-billing-summary__value--success">
            {formatCurrency(projectedTotal, currency)}
            {breakdown.billingCycle && (
              <span
                style={{
                  fontWeight: 400,
                  fontSize: "0.75rem",
                  color: "var(--si-slate-500)",
                }}
              >
                {formatBillingCycleSuffix(breakdown.billingCycle)}
              </span>
            )}
          </span>
        </div>
        <div className="si-billing-summary__item">
          <span className="si-billing-summary__label">Currency</span>
          <span className="si-billing-summary__value">{currency}</span>
        </div>
      </div>

      {/* SI-R2: Disclaimer */}
      {hasDynamicCosts && (
        <p className="si-billing-disclaimer">
          * Projection based on current usage. Amounts may change with metric
          activity.
        </p>
      )}

      {/* ─── Fixed Costs Section — SI-R3/R5/R7 ─── */}
      {hasFixedCosts && (
        <div className="si-billing-section">
          <div className="si-billing-section-label">
            <span className="si-billing-section-label__text">Fixed Costs</span>
          </div>

          <div className="si-billing-section__lines">
            {breakdown.groupBreakdowns
              .filter((g) => g.recurringAmount != null && g.recurringAmount > 0)
              .map((group) => (
                <GroupFixedCostRow
                  key={group.groupId}
                  group={group}
                  currency={currency}
                />
              ))}

            {/* Standalone services */}
            {state.services
              .filter((svc) => svc.recurringCost)
              .map((svc) => (
                <div key={svc.id} className="si-billing-line">
                  <span className="si-billing-line__name">
                    {svc.name || "Service"}
                    {svc.recurringCost?.billingCycle && (
                      <span className="si-billing-line__cycle">
                        {formatBillingCycleSuffix(
                          svc.recurringCost.billingCycle,
                        )}
                      </span>
                    )}
                  </span>
                  <span className="si-billing-line__amount">
                    {formatCurrency(svc.recurringCost!.amount, currency)}
                  </span>
                </div>
              ))}
          </div>

          <div className="si-billing-section-subtotal">
            <span className="si-billing-section-subtotal__label">
              Fixed Subtotal
            </span>
            <span className="si-billing-section-subtotal__amount">
              {formatCurrency(breakdown.fixedTotal, currency)}
            </span>
          </div>
        </div>
      )}

      {/* ─── Dynamic Costs Section — SI-R3/R5/R7 ─── */}
      {(breakdown.groupBreakdowns.some((g) => g.metricOverages.length > 0) ||
        breakdown.standaloneOverages.length > 0) && (
        <div className="si-billing-section">
          <div className="si-billing-section-label">
            <span className="si-billing-section-label__text">
              Dynamic Costs *
            </span>
          </div>

          <div className="si-billing-section__lines">
            {breakdown.groupBreakdowns
              .filter((g) => g.metricOverages.length > 0)
              .map((group) => (
                <GroupMetricOverageRows
                  key={group.groupId}
                  group={group}
                  currency={currency}
                />
              ))}

            {/* Standalone service overages */}
            {breakdown.standaloneOverages.map((overage) => (
              <MetricOverageRow
                key={overage.metricId}
                overage={overage}
                currency={currency}
              />
            ))}
          </div>

          <div className="si-billing-section-subtotal">
            <span className="si-billing-section-subtotal__label">
              Dynamic Subtotal *
            </span>
            <span className="si-billing-section-subtotal__amount">
              {formatCurrency(breakdown.dynamicTotal, currency)}
            </span>
          </div>
        </div>
      )}

      {/* ─── Total Row ─── */}
      <div className="si-billing-total">
        {hasFixedCosts && hasDynamicCosts && (
          <div className="si-billing-total__breakdown">
            <span className="si-billing-total__detail">
              Fixed {formatCurrency(breakdown.fixedTotal, currency)} + Dynamic{" "}
              {formatCurrency(breakdown.dynamicTotal, currency)}
            </span>
          </div>
        )}
        <div className="si-billing-total__row">
          <span className="si-billing-total__label">
            Total Projected{hasDynamicCosts ? " *" : ""}
          </span>
          <span className="si-billing-total__amount">
            {formatCurrency(projectedTotal, currency)}
            {breakdown.billingCycle && (
              <span className="si-billing-total__cycle">
                {formatBillingCycleSuffix(breakdown.billingCycle)}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ─── Setup Costs Collapsible — SI-R4 ─── */}
      {breakdown.setupLines.length > 0 && (
        <SetupCostsSection
          setupLines={breakdown.setupLines}
          setupTotal={breakdown.setupTotal}
          currency={currency}
          expanded={setupExpanded}
          onToggle={() => setSetupExpanded(!setupExpanded)}
        />
      )}

      {/* ─── Payment Actions (Operator Only) ─── */}
      {mode === "operator" && state.status !== "PENDING" && amountOwed > 0 && (
        <div className="si-billing-section" style={{ marginTop: 16 }}>
          <div className="si-billing-section-label">
            <span className="si-billing-section-label__text">
              Report Payments
            </span>
          </div>

          {/* Setup cost payments per group */}
          {state.serviceGroups
            .filter((g) => g.setupCost && !g.setupCost.paymentDate)
            .map((group) => (
              <div
                key={`setup-${group.id}`}
                className="si-billing-line si-billing-line--setup"
                style={{ marginBottom: 4 }}
              >
                <span className="si-billing-line__name">
                  {group.name} (setup)
                </span>
                <span className="si-billing-line__right">
                  <span className="si-billing-line__amount si-billing-line__amount--setup">
                    {formatCurrency(
                      group.setupCost!.amount,
                      group.setupCost!.currency,
                    )}
                  </span>
                  <button
                    type="button"
                    className="si-btn si-btn--xs si-btn--success"
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      dispatch(
                        reportSetupPayment({
                          serviceId: group.id,
                          paymentDate: nowISO(),
                        }),
                      );
                    }}
                  >
                    Mark Paid
                  </button>
                </span>
              </div>
            ))}

          {/* Recurring cost payments per group */}
          {state.serviceGroups
            .filter((g) => g.recurringCost)
            .map((group) => {
              // Check if already paid this cycle
              const paidThisCycle =
                group.recurringCost!.lastPaymentDate &&
                state.currentBillingCycleStart &&
                group.recurringCost!.lastPaymentDate >=
                  state.currentBillingCycleStart;
              return (
                <div
                  key={`recur-${group.id}`}
                  className="si-billing-line"
                  style={{ marginBottom: 4 }}
                >
                  <span className="si-billing-line__name">
                    {group.name} (recurring{" "}
                    {formatBillingCycleSuffix(
                      group.recurringCost!.billingCycle,
                    )}
                    )
                  </span>
                  <span className="si-billing-line__right">
                    <span
                      className={`si-billing-line__amount${paidThisCycle ? " si-billing-line__amount--paid" : ""}`}
                    >
                      {formatCurrency(
                        group.recurringCost!.amount,
                        group.recurringCost!.currency,
                      )}
                    </span>
                    {paidThisCycle ? (
                      <span className="si-billing-line__paid-tag">Paid</span>
                    ) : (
                      <button
                        type="button"
                        className="si-btn si-btn--xs si-btn--success"
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                          dispatch(
                            reportRecurringPayment({
                              serviceId: group.id,
                              paymentDate: nowISO(),
                            }),
                          );
                        }}
                      >
                        Report Payment
                      </button>
                    )}
                  </span>
                </div>
              );
            })}

          {/* Standalone service payments */}
          {state.services
            .filter((s) => s.recurringCost)
            .map((svc) => (
              <div
                key={`svc-${svc.id}`}
                className="si-billing-line"
                style={{ marginBottom: 4 }}
              >
                <span className="si-billing-line__name">
                  {svc.name || "Service"} (recurring)
                </span>
                <span className="si-billing-line__right">
                  <span className="si-billing-line__amount">
                    {formatCurrency(
                      svc.recurringCost!.amount,
                      svc.recurringCost!.currency,
                    )}
                  </span>
                  <button
                    type="button"
                    className="si-btn si-btn--xs si-btn--success"
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      dispatch(
                        reportRecurringPayment({
                          serviceId: svc.id,
                          paymentDate: nowISO(),
                        }),
                      );
                    }}
                  >
                    Report Payment
                  </button>
                </span>
              </div>
            ))}

          {/* Pay remaining balance (overage/other) */}
          {amountOwed > 0 && (
            <div
              className="si-billing-line"
              style={{
                marginTop: 12,
                paddingTop: 8,
                borderTop: "1px solid var(--si-slate-200)",
              }}
            >
              <span className="si-billing-line__name">Outstanding balance</span>
              <span className="si-billing-line__right">
                <span className="si-billing-line__amount si-billing-line__amount--setup">
                  {formatCurrency(amountOwed, currency)}
                </span>
                <button
                  type="button"
                  className="si-btn si-btn--xs si-btn--success"
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    dispatch(
                      reportOveragePayment({
                        paymentDate: nowISO(),
                        amount: amountOwed,
                      }),
                    );
                  }}
                >
                  Pay Balance
                </button>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function GroupFixedCostRow({
  group,
  currency,
}: {
  group: GroupBillingBreakdown;
  currency: string;
}) {
  return (
    <div className="si-billing-group">
      <div className="si-billing-group__row">
        <span className="si-billing-group__name">
          {group.groupName}
          {group.optional && (
            <span
              className="si-badge si-badge--violet si-badge--sm"
              style={{ marginLeft: 8 }}
            >
              Add-on
            </span>
          )}
          {group.recurringCycle && (
            <span className="si-billing-line__cycle">
              {formatBillingCycleSuffix(group.recurringCycle)}
            </span>
          )}
        </span>
        <span className="si-billing-group__amount-block">
          {group.discount && (
            <>
              <span className="si-billing-group__original">
                {formatCurrency(group.discount.originalAmount, currency)}
              </span>
              <span className="si-billing-group__discount-badge">
                {formatDiscountBadge(group.discount)}
              </span>
            </>
          )}
          <span className="si-billing-group__amount">
            {formatCurrency(
              group.recurringAmount ?? 0,
              group.recurringCurrency,
            )}
          </span>
        </span>
      </div>
    </div>
  );
}

function GroupMetricOverageRows({
  group,
  currency,
}: {
  group: GroupBillingBreakdown;
  currency: string;
}) {
  return (
    <div className="si-billing-group-metrics">
      <div className="si-billing-group-metrics__header">{group.groupName}</div>
      {group.metricOverages.map((overage) => (
        <MetricOverageRow
          key={overage.metricId}
          overage={overage}
          currency={currency}
        />
      ))}
    </div>
  );
}

function MetricOverageRow({
  overage,
  currency,
}: {
  overage: MetricOverage;
  currency: string;
}) {
  return (
    <div className="si-billing-metric">
      <div className="si-billing-metric__info">
        <span className="si-billing-metric__name">{overage.metricName}</span>
        <span className="si-billing-metric__usage">
          {overage.currentUsage.toLocaleString()}/
          {overage.freeLimit.toLocaleString()} free
        </span>
      </div>
      <div className="si-billing-metric__right">
        <span className="si-billing-metric__calc">
          {overage.excess.toLocaleString()} x{" "}
          {formatCurrency(overage.unitCostAmount, currency)}
        </span>
        <span className="si-billing-metric__projection">
          {formatCurrency(overage.projectedCost, currency)}
        </span>
      </div>
    </div>
  );
}

function SetupCostsSection({
  setupLines,
  setupTotal,
  currency,
  expanded,
  onToggle,
}: {
  setupLines: SetupCostLine[];
  setupTotal: number;
  currency: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const unpaidCount = setupLines.filter((l) => !l.paid).length;

  return (
    <div className="si-billing-setup">
      <button
        type="button"
        className="si-billing-setup__toggle"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="si-billing-setup__toggle-left">
          <svg
            className="si-billing-setup__chevron"
            data-expanded={expanded}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Setup Costs</span>
          <span className="si-billing-setup__count">
            {setupLines.length} item{setupLines.length !== 1 ? "s" : ""}
            {unpaidCount > 0 && (
              <span className="si-billing-setup__unpaid">
                {" "}
                ({unpaidCount} unpaid)
              </span>
            )}
          </span>
        </span>
        <span className="si-billing-setup__total">
          {formatCurrency(setupTotal, currency)}
        </span>
      </button>

      {expanded && (
        <div className="si-billing-setup__content">
          {setupLines.map((line, idx) => (
            <div key={idx} className="si-billing-line si-billing-line--setup">
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
      )}
    </div>
  );
}
