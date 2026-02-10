import { useState, useCallback } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SubscriptionInstanceAction } from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ServiceMetric } from "../../../document-models/subscription-instance/gen/schema/types.js";
import {
  incrementMetricUsage,
  decrementMetricUsage,
  updateMetric,
} from "../../../document-models/subscription-instance/gen/metrics/creators.js";

// Note: createClientRequest from requests module has been removed.
// Client request for limit increase is disabled until the module is re-implemented.

interface MetricActionsProps {
  serviceId: string;
  metric: ServiceMetric;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  isOperator: boolean;
  customerName?: string | null;
}

export function MetricActions({
  serviceId,
  metric,
  dispatch,
  isOperator,
}: MetricActionsProps) {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("1");
  const [requestedLimit, setRequestedLimit] = useState(
    metric.limit?.toString() || "",
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

    // Requests module has been removed - functionality disabled
    console.warn("Limit increase request functionality is currently disabled");

    setShowRequestModal(false);
    setRequestedLimit(metric.limit?.toString() || "");
    setRequestReason("");
  }, [requestedLimit, metric.limit]);

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
                  {metric.limit && (
                    <span>Limit: {metric.limit.toLocaleString()}</span>
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
  if (!metric.limit) return null;

  return (
    <>
      <div className="si-metric-actions si-metric-actions--client">
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
                  Current Usage: {metric.currentUsage.toLocaleString()}
                </span>
                <span>Current Limit: {metric.limit.toLocaleString()}</span>
              </div>
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
                  min={metric.limit + 1}
                />
              </div>
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
                  parseInt(requestedLimit, 10) <= (metric.limit || 0)
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
  const [limit, setLimit] = useState(metric.limit?.toString() || "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const parsedLimit = limit ? parseInt(limit, 10) : null;

      dispatch(
        updateMetric({
          serviceId,
          metricId: metric.id,
          limit: parsedLimit,
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
