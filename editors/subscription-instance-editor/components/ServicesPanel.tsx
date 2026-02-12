import { useState, useCallback } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type {
  ClientRequest,
  Service,
  ServiceGroup,
  ServiceMetric,
} from "../../../document-models/subscription-instance/gen/schema/types.js";
import type { ViewMode } from "../types.js";
import { MetricActions } from "./MetricActions.js";
import { createClientRequest } from "../../../document-models/subscription-instance/gen/requests/creators.js";

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
  pendingRequest,
}: {
  serviceId: string;
  metric: ServiceMetric;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  isOperator: boolean;
  customerName?: string | null;
  pendingRequest?: ClientRequest | null;
}) {
  const effectiveLimit = metric.freeLimit ?? metric.paidLimit;
  const percentage = effectiveLimit
    ? Math.min(100, (metric.currentUsage / effectiveLimit) * 100)
    : 0;

  const getBarColor = () => {
    if (percentage >= 90) return "si-usage-bar__fill--danger";
    if (percentage >= 75) return "si-usage-bar__fill--warning";
    return "si-usage-bar__fill--normal";
  };

  const formatLimit = () => {
    const parts: string[] = [];
    if (metric.freeLimit != null)
      parts.push(`${metric.freeLimit.toLocaleString()} free`);
    if (metric.paidLimit != null)
      parts.push(`${metric.paidLimit.toLocaleString()} max`);
    return parts.length > 0 ? parts.join(" / ") : null;
  };

  const limitLabel = formatLimit();

  // Compute overage for this metric
  const hasOverage =
    metric.freeLimit != null &&
    metric.currentUsage > metric.freeLimit &&
    metric.unitCost != null;
  const overageExcess = hasOverage
    ? metric.currentUsage - metric.freeLimit!
    : 0;
  const overageCost = hasOverage ? overageExcess * metric.unitCost!.amount : 0;

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);

  return (
    <div className="si-metric">
      <div className="si-metric__header">
        <span className="si-metric__name">{metric.name}</span>
        <span className="si-metric__value">
          {metric.currentUsage.toLocaleString()}
          {limitLabel && ` / ${limitLabel}`}
          <span className="si-metric__unit"> {metric.unitName}</span>
        </span>
      </div>
      <div className="si-metric__body">
        {effectiveLimit != null && (
          <div className="si-usage-bar">
            <div
              className={`si-usage-bar__fill ${getBarColor()}`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={metric.currentUsage}
              aria-valuemin={0}
              aria-valuemax={effectiveLimit}
            />
          </div>
        )}
        <MetricActions
          serviceId={serviceId}
          metric={metric}
          dispatch={dispatch}
          isOperator={isOperator}
          customerName={customerName}
          pendingRequest={pendingRequest}
        />
      </div>
      {hasOverage && (
        <div className="si-metric__overage">
          Overage: {overageExcess.toLocaleString()} {metric.unitName} &times;{" "}
          {formatCurrency(metric.unitCost!.amount, metric.unitCost!.currency)} ={" "}
          <strong>
            {formatCurrency(overageCost, metric.unitCost!.currency)}
          </strong>
        </div>
      )}
      {metric.paidLimit != null && !hasOverage && (
        <div
          className="si-metric__paid-limit"
          title="Maximum purchasable limit"
        >
          Paid limit: {metric.paidLimit.toLocaleString()} {metric.unitName}
          {metric.unitCost && (
            <span>
              {" "}
              at{" "}
              {formatCurrency(metric.unitCost.amount, metric.unitCost.currency)}
              /{metric.unitName}
            </span>
          )}
        </div>
      )}
      {(metric.nextUsageReset ||
        (metric.usageResetPeriod && metric.usageResetPeriod !== "NONE")) && (
        <p className="si-metric__reset">
          {metric.usageResetPeriod && metric.usageResetPeriod !== "NONE" && (
            <span className="si-metric__reset-period">
              {metric.usageResetPeriod.charAt(0) +
                metric.usageResetPeriod.slice(1).toLowerCase()}{" "}
              reset
            </span>
          )}
          {metric.nextUsageReset && (
            <span>
              {metric.usageResetPeriod && metric.usageResetPeriod !== "NONE"
                ? " · "
                : "Resets "}
              {new Date(metric.nextUsageReset).toLocaleDateString()}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  mode: ViewMode;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  customerName?: string | null;
  showSetupCost?: boolean;
  clientRequests?: ClientRequest[];
}

function ServiceCard({
  service,
  mode,
  dispatch,
  customerName,
  showSetupCost,
  clientRequests,
}: ServiceCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const formatBillingCycle = (cycle: string) => {
    const labels: Record<string, string> = {
      MONTHLY: "/mo",
      ANNUAL: "/yr",
      QUARTERLY: "/qtr",
      SEMI_ANNUAL: "/6mo",
      ONE_TIME: "",
    };
    return labels[cycle] || "";
  };

  return (
    <div className="si-service-card">
      <div className="si-service-card__header">
        <h4 className="si-service-card__name">{service.name || "Service"}</h4>
        <div className="si-service-card__header-right">
          {service.recurringCost && (
            <span className="si-service-card__price">
              {formatCurrency(
                service.recurringCost.amount,
                service.recurringCost.currency,
              )}
              {formatBillingCycle(service.recurringCost.billingCycle)}
            </span>
          )}
          {!service.recurringCost && service.setupCost && (
            <span
              className="si-service-card__price"
              style={{ color: "var(--si-violet-600)" }}
            >
              {formatCurrency(
                service.setupCost.amount,
                service.setupCost.currency,
              )}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: "var(--si-slate-500)",
                  marginLeft: 4,
                }}
              >
                setup
              </span>
            </span>
          )}
        </div>
      </div>

      {service.description && (
        <p className="si-service-card__desc">{service.description}</p>
      )}

      {/* Setup Cost */}
      {showSetupCost && service.setupCost && service.recurringCost && (
        <div className="si-service-card__setup">
          <span className="si-service-card__setup-label">Setup fee:</span>
          <span className="si-service-card__setup-value">
            {formatCurrency(
              service.setupCost.amount,
              service.setupCost.currency,
            )}
            {service.setupCost.paymentDate ? (
              <span className="si-service-card__paid"> (Paid)</span>
            ) : (
              <span className="si-service-card__pending"> (Pending)</span>
            )}
          </span>
        </div>
      )}

      {/* Standalone setup cost (no recurring) */}
      {showSetupCost && service.setupCost && !service.recurringCost && (
        <div className="si-service-card__setup">
          <span className="si-service-card__setup-label">Status:</span>
          <span className="si-service-card__setup-value">
            {service.setupCost.paymentDate ? (
              <span className="si-service-card__paid">Paid</span>
            ) : (
              <span className="si-service-card__pending">Pending</span>
            )}
          </span>
        </div>
      )}

      {/* Metrics / Usage */}
      {service.metrics.length > 0 && (
        <div className="si-service-card__metrics">
          {service.metrics.map((metric) => {
            const pendingReq = clientRequests?.find(
              (r) => r.status === "PENDING" && r.metricId === metric.id,
            );
            return (
              <UsageBar
                key={metric.id}
                serviceId={service.id}
                metric={metric}
                dispatch={dispatch}
                isOperator={mode === "operator"}
                customerName={customerName}
                pendingRequest={pendingReq}
              />
            );
          })}
        </div>
      )}

      {/* Next billing info */}
      {service.recurringCost?.nextBillingDate && (
        <p className="si-service-card__billing">
          Next billing:{" "}
          {new Date(service.recurringCost.nextBillingDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

interface RequestAddonRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ServiceGroup | null;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
}

function RequestAddonRemovalModal({
  isOpen,
  onClose,
  group,
  dispatch,
}: RequestAddonRemovalModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = useCallback(() => {
    if (!group) return;

    dispatch(
      createClientRequest({
        id: generateId(),
        type: "REMOVE_SERVICE",
        description: `Request to remove add-on: ${group.name}`,
        reason: reason || undefined,
        createdAt: new Date().toISOString(),
        serviceName: group.name,
      }),
    );

    setReason("");
    onClose();
  }, [onClose, group, reason, dispatch]);

  const handleClose = useCallback(() => {
    setReason("");
    onClose();
  }, [onClose]);

  if (!isOpen || !group) return null;

  return (
    <div className="si-modal-overlay" onClick={handleClose}>
      <div className="si-modal" onClick={(e) => e.stopPropagation()}>
        <div className="si-modal__header">
          <h3 className="si-modal__title">Request Add-on Removal</h3>
          <span className="si-modal__subtitle">{group.name}</span>
        </div>
        <div className="si-modal__body">
          <p className="si-modal__message">
            Submit a request to remove the <strong>{group.name}</strong> add-on
            and all its services from your subscription. The operator will
            review your request.
          </p>
          <div className="si-form-group">
            <label className="si-form-label" htmlFor="addon-removal-reason">
              Reason (optional)
            </label>
            <textarea
              id="addon-removal-reason"
              className="si-input si-input--textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you want to remove this add-on..."
              rows={3}
            />
          </div>
        </div>
        <div className="si-modal__footer">
          <button
            type="button"
            className="si-btn si-btn--ghost"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="si-btn si-btn--danger"
            onClick={handleSubmit}
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

export function ServicesPanel({
  document,
  dispatch,
  mode,
}: ServicesPanelProps) {
  const state = document.state.global;

  // Split groups into recurring (non-optional) and add-ons (optional)
  const recurringGroups = state.serviceGroups.filter((g) => !g.optional);
  const addonGroups = state.serviceGroups.filter((g) => g.optional);

  const hasRecurring = state.services.length > 0 || recurringGroups.length > 0;
  const hasAddons = addonGroups.length > 0;

  const [groupToRemove, setGroupToRemove] = useState<ServiceGroup | null>(null);

  const recurringServiceCount =
    state.services.length +
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

  return (
    <>
      {/* Recurring Services */}
      {hasRecurring && (
        <div className="si-panel">
          <div className="si-panel__header">
            <h3 className="si-panel__title">Recurring Services</h3>
            <span className="si-panel__count">
              {recurringServiceCount} services
            </span>
          </div>

          {/* Standalone Services */}
          {state.services.length > 0 && (
            <div className="si-services-grid">
              {state.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  mode={mode}
                  dispatch={dispatch}
                  customerName={state.customerName}
                  showSetupCost={mode === "operator"}
                  clientRequests={state.clientRequests}
                />
              ))}
            </div>
          )}

          {/* Non-optional Service Groups */}
          {recurringGroups.map((group) => (
            <div key={group.id} className="si-service-group">
              <div className="si-service-group__header">
                <h4 className="si-service-group__name">{group.name}</h4>
                {group.billingCycle && (
                  <span className="si-badge si-badge--sky si-badge--sm">
                    {group.billingCycle.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <div className="si-services-grid">
                {group.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    mode={mode}
                    dispatch={dispatch}
                    customerName={state.customerName}
                    showSetupCost={mode === "operator"}
                    clientRequests={state.clientRequests}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add-ons */}
      {hasAddons && (
        <div className="si-panel">
          <div className="si-panel__header">
            <h3 className="si-panel__title">Add-ons</h3>
            <span className="si-panel__count">
              {addonGroups.length} groups, {addonServiceCount} services
            </span>
          </div>

          {addonGroups.map((group) => (
            <div key={group.id} className="si-service-group">
              <div className="si-service-group__header">
                <h4 className="si-service-group__name">{group.name}</h4>
                <span className="si-badge si-badge--violet si-badge--sm">
                  Optional
                </span>
                {group.billingCycle && (
                  <span className="si-badge si-badge--sky si-badge--sm">
                    {group.billingCycle.replace(/_/g, " ")}
                  </span>
                )}
                {mode === "client" && (
                  <button
                    type="button"
                    className="si-btn si-btn--xs si-btn--danger-ghost"
                    style={{ marginLeft: "auto" }}
                    onClick={() => setGroupToRemove(group)}
                  >
                    Request Removal
                  </button>
                )}
              </div>
              <div className="si-services-grid">
                {group.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    mode={mode}
                    dispatch={dispatch}
                    customerName={state.customerName}
                    showSetupCost
                    clientRequests={state.clientRequests}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add-on Removal Request Modal */}
      <RequestAddonRemovalModal
        isOpen={groupToRemove !== null}
        onClose={() => setGroupToRemove(null)}
        group={groupToRemove}
        dispatch={dispatch}
      />
    </>
  );
}
