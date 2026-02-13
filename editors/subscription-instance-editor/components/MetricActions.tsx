import { useState, useCallback } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SubscriptionInstanceAction } from "@powerhousedao/service-offering/document-models/subscription-instance";
import type {
  ServiceMetric,
  ClientRequest,
} from "../../../document-models/subscription-instance/gen/schema/types.js";
import {
  incrementMetricUsage,
  decrementMetricUsage,
  updateMetric,
} from "../../../document-models/subscription-instance/gen/metrics/creators.js";
import { createClientRequest } from "../../../document-models/subscription-instance/gen/requests/creators.js";

interface MetricActionsProps {
  serviceId: string;
  metric: ServiceMetric;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  isOperator: boolean;
  customerName?: string | null;
  pendingRequest?: ClientRequest | null;
}

export function MetricActions({
  serviceId,
  metric,
  dispatch,
  isOperator,
  pendingRequest,
}: MetricActionsProps) {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("1");
  const [requestedLimit, setRequestedLimit] = useState(
    metric.freeLimit?.toString() || "",
  );
  const [requestReason, setRequestReason] = useState("");

  const handleIncrement = useCallback(
    (amount: number = 1) => {
      dispatch(
        incrementMetricUsage({
          serviceId,
          metricId: metric.id,
          incrementBy: amount,
          currentTime: new Date().toISOString(),
        }),
      );
    },
    [dispatch, serviceId, metric.id],
  );

  const handleDecrement = useCallback(
    (amount: number = 1) => {
      dispatch(
        decrementMetricUsage({
          serviceId,
          metricId: metric.id,
          decrementBy: amount,
          currentTime: new Date().toISOString(),
        }),
      );
    },
    [dispatch, serviceId, metric.id],
  );

  const handleAdjust = useCallback(() => {
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount === 0) return;

    if (amount > 0) {
      handleIncrement(amount);
    } else {
      handleDecrement(Math.abs(amount));
    }
    setShowAdjustModal(false);
    setAdjustAmount("1");
  }, [adjustAmount, handleIncrement, handleDecrement]);

  const handleRequestLimitIncrease = useCallback(() => {
    const newLimit = parseInt(requestedLimit, 10);
    if (isNaN(newLimit) || newLimit <= 0) return;

    dispatch(
      createClientRequest({
        id: generateId(),
        type: "INCREASE_LIMIT",
        description: `Increase ${metric.name} limit from ${metric.freeLimit?.toLocaleString() ?? "unlimited"} to ${newLimit.toLocaleString()}`,
        reason: requestReason || undefined,
        createdAt: new Date().toISOString(),
        serviceId,
        metricId: metric.id,
        metricName: metric.name,
        requestedValue: newLimit,
      }),
    );

    setShowRequestModal(false);
    setRequestedLimit(metric.freeLimit?.toString() || "");
    setRequestReason("");
  }, [requestedLimit, metric, requestReason, dispatch, serviceId]);

  // Operator view - direct manipulation
  if (isOperator) {
    return (
      <>
        <div className="si-metric-actions">
          <button
            type="button"
            className="si-metric-btn si-metric-btn--minus"
            onClick={() => handleDecrement(1)}
            disabled={metric.currentUsage <= 0}
            aria-label={`Decrease ${metric.name} by 1`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            className="si-metric-btn si-metric-btn--adjust"
            onClick={() => setShowAdjustModal(true)}
            aria-label={`Adjust ${metric.name}`}
            title="Adjust usage"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          <button
            type="button"
            className="si-metric-btn si-metric-btn--plus"
            onClick={() => handleIncrement(1)}
            aria-label={`Increase ${metric.name} by 1`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Operator Adjust Modal */}
        {showAdjustModal && (
          <div
            className="si-modal-overlay"
            onClick={() => setShowAdjustModal(false)}
          >
            <div
              className="si-modal si-modal--sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="si-modal__header">
                <h3 className="si-modal__title">Adjust Usage</h3>
                <span className="si-modal__subtitle">{metric.name}</span>
              </div>
              <div className="si-modal__body">
                <div className="si-metric-adjust-info">
                  <span>Current: {metric.currentUsage.toLocaleString()}</span>
                  {metric.freeLimit && (
                    <span>Limit: {metric.freeLimit.toLocaleString()}</span>
                  )}
                </div>
                <div className="si-form-group">
                  <label className="si-form-label" htmlFor="adjust-amount">
                    Adjustment (+ or -)
                  </label>
                  <input
                    id="adjust-amount"
                    type="number"
                    className="si-input si-input--center"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="si-metric-adjust-preview">
                  New value:{" "}
                  <strong>
                    {Math.max(
                      0,
                      metric.currentUsage + (parseInt(adjustAmount, 10) || 0),
                    ).toLocaleString()}
                  </strong>{" "}
                  {metric.unitName}
                </div>
              </div>
              <div className="si-modal__footer">
                <button
                  type="button"
                  className="si-btn si-btn--ghost"
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="si-btn si-btn--primary"
                  onClick={handleAdjust}
                  disabled={!adjustAmount || parseInt(adjustAmount, 10) === 0}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Client view - only show request button if there's a limit
  if (!metric.freeLimit) return null;

  const formatCost = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);

  const parsedLimit = parseInt(requestedLimit, 10);
  const hasOverageProjection =
    !isNaN(parsedLimit) &&
    metric.unitCost != null &&
    parsedLimit > (metric.freeLimit || 0);
  const overageUnits = hasOverageProjection
    ? parsedLimit - (metric.freeLimit || 0)
    : 0;
  const projectedOverageCost = hasOverageProjection
    ? overageUnits * metric.unitCost!.amount
    : 0;

  return (
    <>
      <div className="si-metric-actions si-metric-actions--client">
        {pendingRequest ? (
          <span
            className="si-metric-pending-tag"
            title="Limit increase request pending"
          >
            Pending
          </span>
        ) : (
          <button
            type="button"
            className="si-metric-btn si-metric-btn--request"
            onClick={() => setShowRequestModal(true)}
            aria-label={`Request limit increase for ${metric.name}`}
            title="Request limit increase"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Client Request Modal */}
      {showRequestModal && (
        <div
          className="si-modal-overlay"
          onClick={() => setShowRequestModal(false)}
        >
          <div
            className="si-modal si-modal--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="si-modal__header">
              <h3 className="si-modal__title">Request Limit Increase</h3>
              <span className="si-modal__subtitle">{metric.name}</span>
            </div>
            <div className="si-modal__body">
              <div className="si-metric-adjust-info">
                <span>
                  Current Usage: {metric.currentUsage.toLocaleString()}{" "}
                  {metric.unitName}
                </span>
                <span>
                  Included Free: {metric.freeLimit.toLocaleString()}{" "}
                  {metric.unitName}
                </span>
              </div>
              {metric.paidLimit != null && (
                <div className="si-metric-limit-highlight">
                  <span className="si-metric-limit-highlight__label">
                    Absolute Usage Limit
                  </span>
                  <span className="si-metric-limit-highlight__value">
                    {metric.paidLimit.toLocaleString()} {metric.unitName}
                  </span>
                  <span className="si-metric-limit-highlight__note">
                    Defined in your tier
                  </span>
                </div>
              )}
              {metric.unitCost && (
                <div className="si-metric-adjust-info si-metric-adjust-info--cost">
                  <span>
                    Overage cost (above {metric.freeLimit.toLocaleString()}{" "}
                    {metric.unitName}):{" "}
                    {formatCost(
                      metric.unitCost.amount,
                      metric.unitCost.currency,
                    )}
                    /{metric.unitName}
                  </span>
                </div>
              )}
              <div className="si-form-group">
                <label className="si-form-label" htmlFor="requested-limit">
                  Requested New Limit ({metric.unitName})
                </label>
                <input
                  id="requested-limit"
                  type="number"
                  className="si-input si-input--center"
                  value={requestedLimit}
                  onChange={(e) => setRequestedLimit(e.target.value)}
                  placeholder="Enter requested limit"
                  min={metric.freeLimit + 1}
                  max={metric.paidLimit ?? undefined}
                />
              </div>
              {hasOverageProjection && (
                <div className="si-overage-preview">
                  <div className="si-overage-preview__title">
                    Cost Projection
                  </div>
                  <div className="si-overage-preview__row">
                    <span>Overage units</span>
                    <span>
                      {overageUnits.toLocaleString()} {metric.unitName}
                    </span>
                  </div>
                  <div className="si-overage-preview__row si-overage-preview__row--total">
                    <span>Estimated charge</span>
                    <span>
                      {formatCost(
                        projectedOverageCost,
                        metric.unitCost!.currency,
                      )}
                      {metric.unitCost!.billingCycle
                        ? ` / ${metric.unitCost!.billingCycle.toLowerCase().replace("_", " ")}`
                        : ""}
                    </span>
                  </div>
                  {metric.paidLimit != null &&
                    parsedLimit > metric.paidLimit && (
                      <div className="si-overage-preview__warning">
                        Exceeds maximum paid limit of{" "}
                        {metric.paidLimit.toLocaleString()} {metric.unitName}
                      </div>
                    )}
                </div>
              )}
              <div className="si-form-group">
                <label className="si-form-label" htmlFor="request-reason">
                  Reason (optional)
                </label>
                <textarea
                  id="request-reason"
                  className="si-input si-input--textarea"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Explain why you need a higher limit..."
                  rows={3}
                />
              </div>
            </div>
            <div className="si-modal__footer">
              <button
                type="button"
                className="si-btn si-btn--ghost"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="si-btn si-btn--primary"
                onClick={handleRequestLimitIncrease}
                disabled={
                  !requestedLimit ||
                  parseInt(requestedLimit, 10) <= (metric.freeLimit || 0) ||
                  (metric.paidLimit != null &&
                    parseInt(requestedLimit, 10) > metric.paidLimit)
                }
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface UpdateMetricLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  metric: ServiceMetric;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
}

export function UpdateMetricLimitModal({
  isOpen,
  onClose,
  serviceId,
  metric,
  dispatch,
}: UpdateMetricLimitModalProps) {
  const [limit, setLimit] = useState(metric.freeLimit?.toString() || "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const parsedLimit = limit ? parseInt(limit, 10) : null;

      dispatch(
        updateMetric({
          serviceId,
          metricId: metric.id,
          freeLimit: parsedLimit,
        }),
      );

      onClose();
    },
    [limit, serviceId, metric.id, dispatch, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="si-modal-overlay" onClick={onClose}>
      <div
        className="si-modal si-modal--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="si-modal__header">
          <h3 className="si-modal__title">Update Metric Limit</h3>
          <span className="si-modal__subtitle">{metric.name}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="si-modal__body">
            <div className="si-form-group">
              <label className="si-form-label" htmlFor="metric-limit">
                New Limit ({metric.unitName})
              </label>
              <input
                id="metric-limit"
                type="number"
                className="si-input"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="Leave empty for unlimited"
                min="0"
              />
            </div>
          </div>
          <div className="si-modal__footer">
            <button
              type="button"
              className="si-btn si-btn--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="si-btn si-btn--primary">
              Update Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
