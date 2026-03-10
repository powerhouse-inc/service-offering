import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type {
  SubscriptionService,
  ServiceMetric,
} from "../../../document-models/subscription-instance/v1/gen/schema/types.js";
import type { ViewMode } from "../types.js";
import { MetricActions } from "./MetricActions.js";
import { formatCurrency as fmtCurrency } from "./billing-utils.js";

interface ServicesPanelProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

function UsageBar({
  serviceId,
  metric,
  dispatch,
  isOperator,
  customerName,
  currency,
}: {
  serviceId: string;
  metric: ServiceMetric;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  isOperator: boolean;
  customerName?: string | null;
  currency: string;
}) {
  const freeLimit = metric.freeLimit ?? metric.limit ?? 0;
  const paidLimit = metric.paidLimit ?? null;
  const displayLimit = paidLimit ?? freeLimit;

  const percentage =
    displayLimit > 0
      ? Math.min(100, (metric.currentUsage / displayLimit) * 100)
      : 0;

  const freePortion =
    displayLimit > 0 ? Math.min(100, (freeLimit / displayLimit) * 100) : 0;

  const getBarColor = () => {
    if (percentage >= 90) return "si-usage-bar__fill--danger";
    if (percentage >= 75) return "si-usage-bar__fill--warning";
    return "si-usage-bar__fill--normal";
  };

  const isOverFree = metric.currentUsage > freeLimit && freeLimit > 0;

  return (
    <div className="si-metric">
      <div className="si-metric__header">
        <span className="si-metric__name">{metric.name}</span>
        <span className="si-metric__value">
          {metric.currentUsage.toLocaleString()}
          {displayLimit > 0 && ` / ${displayLimit.toLocaleString()}`}
          <span className="si-metric__unit"> {metric.unitName}</span>
        </span>
      </div>
      <div className="si-metric__body">
        {displayLimit > 0 && (
          <div className="si-usage-bar">
            {paidLimit != null && freeLimit > 0 && freeLimit < paidLimit && (
              <div
                className="si-usage-bar__free-marker"
                style={{ left: `${freePortion}%` }}
                title={`${freeLimit.toLocaleString()} free`}
              />
            )}
            <div
              className={`si-usage-bar__fill ${getBarColor()}`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={metric.currentUsage}
              aria-valuemin={0}
              aria-valuemax={displayLimit}
            />
          </div>
        )}
        <MetricActions
          serviceId={serviceId}
          metric={metric}
          dispatch={dispatch}
          isOperator={isOperator}
          customerName={customerName}
        />
      </div>
      {paidLimit != null && freeLimit > 0 && freeLimit !== paidLimit && (
        <p className="si-metric__paid-limit">
          {freeLimit.toLocaleString()} free · {paidLimit.toLocaleString()} max
          {metric.unitCost != null && (
            <span>
              {" · "}overage: {fmtCurrency(metric.unitCost, currency)}/
              {metric.unitName}
            </span>
          )}
        </p>
      )}
      {isOverFree && metric.unitCost != null && (
        <div className="si-metric__overage">
          <strong>{(metric.currentUsage - freeLimit).toLocaleString()}</strong>{" "}
          {metric.unitName} over free limit
        </div>
      )}
      {(metric.nextUsageReset || metric.usageResetPeriod) && (
        <p className="si-metric__reset">
          {metric.usageResetPeriod && (
            <span className="si-metric__reset-period">
              {metric.usageResetPeriod.charAt(0) +
                metric.usageResetPeriod.slice(1).toLowerCase()}{" "}
              reset
            </span>
          )}
          {metric.nextUsageReset && (
            <span>
              {metric.usageResetPeriod ? " · " : "Resets "}
              {new Date(metric.nextUsageReset).toLocaleDateString()}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

interface ServiceCardProps {
  service: SubscriptionService;
  mode: ViewMode;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  customerName?: string | null;
  currency: string;
}

function ServiceCard({
  service,
  mode,
  dispatch,
  customerName,
  currency,
}: ServiceCardProps) {
  return (
    <div className="si-service-card">
      <div className="si-service-card__header">
        <h4 className="si-service-card__name">{service.name || "Service"}</h4>
        {service.customValue && (
          <span className="si-service-card__custom-value">
            {service.customValue}
          </span>
        )}
      </div>

      {service.description && (
        <p className="si-service-card__desc">{service.description}</p>
      )}

      {service.metrics.length > 0 && (
        <div className="si-service-card__metrics">
          {service.metrics.map((metric) => (
            <UsageBar
              key={metric.id}
              serviceId={service.id}
              metric={metric}
              dispatch={dispatch}
              isOperator={mode === "operator"}
              customerName={customerName}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ServicesPanel({
  document,
  dispatch,
  mode,
}: ServicesPanelProps) {
  const state = document.state.global;
  const currency = state.globalCurrency || state.tierCurrency || "USD";

  const allGroupedServiceIds = new Set(
    state.serviceGroups.flatMap((g) => g.services),
  );
  const standaloneServices = state.services.filter(
    (s) => !allGroupedServiceIds.has(s.id),
  );

  const recurringGroups = state.serviceGroups.filter((g) => !g.optional);
  const addonGroups = state.serviceGroups.filter((g) => g.optional);

  const hasRecurring =
    standaloneServices.length > 0 || recurringGroups.length > 0;
  const hasAddons = addonGroups.length > 0;

  const recurringServiceCount =
    standaloneServices.length +
    recurringGroups.reduce((acc, g) => acc + g.services.length, 0);

  const addonServiceCount = addonGroups.reduce(
    (acc, g) => acc + g.services.length,
    0,
  );

  if (!hasRecurring && !hasAddons) {
    return (
      <div className="si-panel">
        <div className="si-panel__header">
          <h3 className="si-panel__title">Services</h3>
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="si-empty__text">No services configured</p>
        </div>
      </div>
    );
  }

  const resolveGroupServices = (serviceIds: string[]) =>
    serviceIds
      .map((id) => state.services.find((s) => s.id === id))
      .filter((s): s is SubscriptionService => s != null);

  return (
    <>
      {hasRecurring && (
        <div className="si-panel">
          <div className="si-panel__header">
            <h3 className="si-panel__title">Recurring Services</h3>
            <span className="si-panel__count">
              {recurringServiceCount} services
            </span>
          </div>

          {standaloneServices.length > 0 && (
            <div className="si-services-grid">
              {standaloneServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  mode={mode}
                  dispatch={dispatch}
                  customerName={state.customerName}
                  currency={currency}
                />
              ))}
            </div>
          )}

          {recurringGroups.map((group) => {
            const groupServices = resolveGroupServices(group.services);
            return (
              <div key={group.id} className="si-service-group">
                <div className="si-service-group__header">
                  <h4 className="si-service-group__name">{group.name}</h4>
                  {group.recurringCost && (
                    <span className="si-service-group__price">
                      {fmtCurrency(
                        group.recurringCost.amount,
                        group.recurringCost.currency,
                      )}
                    </span>
                  )}
                </div>
                <div className="si-services-grid">
                  {groupServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      mode={mode}
                      dispatch={dispatch}
                      customerName={state.customerName}
                      currency={currency}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasAddons && (
        <div className="si-panel">
          <div className="si-panel__header">
            <h3 className="si-panel__title">Add-ons</h3>
            <span className="si-panel__count">
              {addonGroups.length} groups, {addonServiceCount} services
            </span>
          </div>

          {addonGroups.map((group) => {
            const groupServices = resolveGroupServices(group.services);
            return (
              <div key={group.id} className="si-service-group">
                <div className="si-service-group__header">
                  <h4 className="si-service-group__name">{group.name}</h4>
                  <span className="si-badge si-badge--violet si-badge--sm">
                    Optional
                  </span>
                  {group.recurringCost && (
                    <span className="si-service-group__price">
                      {fmtCurrency(
                        group.recurringCost.amount,
                        group.recurringCost.currency,
                      )}
                    </span>
                  )}
                </div>
                <div className="si-services-grid">
                  {groupServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      mode={mode}
                      dispatch={dispatch}
                      customerName={state.customerName}
                      currency={currency}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
