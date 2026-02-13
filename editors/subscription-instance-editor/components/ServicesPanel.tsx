import { useState, useCallback } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type {
  Service,
  ServiceMetric,
} from "../../../document-models/subscription-instance/gen/schema/types.js";
import type { ViewMode } from "../types.js";
import { MetricActions } from "./MetricActions.js";

// Note: createClientRequest from requests module has been removed.
// Service request functionality is disabled until the module is re-implemented.

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
}: {
  serviceId: string;
  metric: ServiceMetric;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  isOperator: boolean;
  customerName?: string | null;
}) {
  const percentage = metric.limit
    ? Math.min(100, (metric.currentUsage / metric.limit) * 100)
    : 0;

  const getBarColor = () => {
    if (percentage >= 90) return "si-usage-bar__fill--danger";
    if (percentage >= 75) return "si-usage-bar__fill--warning";
    return "si-usage-bar__fill--normal";
  };

  return (
    <div className="si-metric">
      <div className="si-metric__header">
        <span className="si-metric__name">{metric.name}</span>
        <span className="si-metric__value">
          {metric.currentUsage.toLocaleString()}
          {metric.limit && ` / ${metric.limit.toLocaleString()}`}
          <span className="si-metric__unit"> {metric.unitName}</span>
        </span>
      </div>
      <div className="si-metric__body">
        {metric.limit && (
          <div className="si-usage-bar">
            <div
              className={`si-usage-bar__fill ${getBarColor()}`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={metric.currentUsage}
              aria-valuemin={0}
              aria-valuemax={metric.limit}
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
      {metric.nextUsageReset && (
        <p className="si-metric__reset">
          Resets {new Date(metric.nextUsageReset).toLocaleDateString()}
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
  onRequestRemove?: (service: Service) => void;
}

function ServiceCard({
  service,
  mode,
  dispatch,
  customerName,
  onRequestRemove,
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
        <div className="si-service-card__name-row">
          <h4 className="si-service-card__name">{service.name || "Service"}</h4>
          {service.customValue && (
            <span className="si-badge si-badge--blue si-badge--sm">
              {service.customValue}
            </span>
          )}
        </div>
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
        </div>
      </div>

      {service.facetSelections.length > 0 && (
        <div className="si-service-card__facets">
          {service.facetSelections.map((facet) => (
            <span
              key={facet.id}
              className="si-badge si-badge--slate si-badge--xs"
              title={facet.facetName}
            >
              {facet.facetName}: {facet.selectedOption}
            </span>
          ))}
        </div>
      )}

      {service.description && (
        <p className="si-service-card__desc">{service.description}</p>
      )}

      {/* Setup Cost - Operator view shows payment status */}
      {mode === "operator" && service.setupCost && (
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

      {/* Metrics / Usage */}
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
            />
          ))}
        </div>
      )}

      {/* Next billing info */}
      {service.recurringCost?.nextBillingDate && (
        <p className="si-service-card__billing">
          Next billing:{" "}
          {new Date(service.recurringCost.nextBillingDate).toLocaleDateString()}
        </p>
      )}

      {/* Client action - request removal */}
      {mode === "client" && onRequestRemove && (
        <div className="si-service-card__actions">
          <button
            type="button"
            className="si-btn si-btn--xs si-btn--danger-ghost"
            onClick={() => onRequestRemove(service)}
          >
            Request Removal
          </button>
        </div>
      )}
    </div>
  );
}

interface RequestServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  requestType: "ADD_SERVICE" | "REMOVE_SERVICE";
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  customerName?: string | null;
}

function RequestServiceModal({
  isOpen,
  onClose,
  service,
  requestType,
}: RequestServiceModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = useCallback(() => {
    // Requests module has been removed - functionality disabled
    console.warn("Service request functionality is currently disabled");

    setReason("");
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    setReason("");
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const isRemove = requestType === "REMOVE_SERVICE";
  const title = isRemove ? "Request Service Removal" : "Request Add-on";
  const subtitle = service?.name || "Service";

  return (
    <div className="si-modal-overlay" onClick={handleClose}>
      <div className="si-modal" onClick={(e) => e.stopPropagation()}>
        <div className="si-modal__header">
          <h3 className="si-modal__title">{title}</h3>
          <span className="si-modal__subtitle">{subtitle}</span>
        </div>
        <div className="si-modal__body">
          <p className="si-modal__message">
            {isRemove
              ? "Submit a request to remove this service from your subscription. The operator will review your request."
              : "Submit a request to add this service to your subscription. The operator will review your request."}
          </p>
          <div className="si-form-group">
            <label className="si-form-label" htmlFor="service-request-reason">
              Reason (optional)
            </label>
            <textarea
              id="service-request-reason"
              className="si-input si-input--textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isRemove
                  ? "Explain why you want to remove this service..."
                  : "Explain why you need this service..."
              }
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
            className={
              isRemove ? "si-btn si-btn--danger" : "si-btn si-btn--primary"
            }
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
  const hasServices = state.services.length > 0;
  const hasServiceGroups = state.serviceGroups.length > 0;

  const [serviceToRemove, setServiceToRemove] = useState<Service | null>(null);

  const handleRequestRemove = useCallback((service: Service) => {
    setServiceToRemove(service);
  }, []);

  if (!hasServices && !hasServiceGroups) {
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
      <div className="si-panel">
        <div className="si-panel__header">
          <h3 className="si-panel__title">Services</h3>
          <span className="si-panel__count">
            {state.services.length +
              state.serviceGroups.reduce(
                (acc, g) => acc + g.services.length,
                0,
              )}{" "}
            total
          </span>
        </div>

        {/* Standalone Services */}
        {hasServices && (
          <div className="si-services-grid">
            {state.services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                mode={mode}
                dispatch={dispatch}
                customerName={state.customerName}
                onRequestRemove={handleRequestRemove}
              />
            ))}
          </div>
        )}

        {/* Service Groups */}
        {hasServiceGroups &&
          state.serviceGroups.map((group) => (
            <div key={group.id} className="si-service-group">
              <div className="si-service-group__header">
                <div className="si-service-group__header-left">
                  <h4 className="si-service-group__name">{group.name}</h4>
                  {group.optional && (
                    <span className="si-badge si-badge--slate si-badge--sm">
                      Optional
                    </span>
                  )}
                </div>
                {group.recurringCost && (
                  <span className="si-service-group__price">
                    +
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: group.recurringCost.currency || "USD",
                    }).format(group.recurringCost.amount)}
                    {(
                      {
                        MONTHLY: "/mo",
                        ANNUAL: "/yr",
                        QUARTERLY: "/qtr",
                        SEMI_ANNUAL: "/6mo",
                        ONE_TIME: "",
                      } as Record<string, string>
                    )[group.recurringCost.billingCycle] || ""}
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
                    onRequestRemove={handleRequestRemove}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Service Request Modal */}
      <RequestServiceModal
        isOpen={serviceToRemove !== null}
        onClose={() => setServiceToRemove(null)}
        service={serviceToRemove}
        requestType="REMOVE_SERVICE"
        dispatch={dispatch}
        customerName={state.customerName}
      />
    </>
  );
}
