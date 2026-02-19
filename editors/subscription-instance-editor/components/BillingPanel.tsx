import { useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
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

interface BillingPanelProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

export function BillingPanel({ document }: BillingPanelProps) {
  const state = document.state.global;
  const breakdown = computeBillingBreakdown(state);
  const [setupExpanded, setSetupExpanded] = useState(false);

  const hasAnyData =
    state.nextBillingDate ||
    state.projectedBillAmount != null ||
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

  const projectedTotal =
    state.projectedBillAmount != null
      ? state.projectedBillAmount
      : breakdown.projectedTotal;
  const currency = breakdown.currency;
  const hasDynamicCosts = breakdown.dynamicTotal > 0;
  const hasFixedCosts = breakdown.fixedTotal > 0;

  return (
    <div className="si-panel">
      {/* Panel Header — SI-R1 */}
      <div className="si-panel__header">
        <h3 className="si-panel__title">Billing Projection</h3>
      </div>

      {/* Summary Cards — SI-R7: Fixed + Dynamic breakdown */}
      <div className="si-billing-summary">
        <div className="si-billing-summary__item">
          <span className="si-billing-summary__label">Next Payment</span>
          <span className="si-billing-summary__value">
            {formatDate(state.nextBillingDate)}
          </span>
        </div>
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
