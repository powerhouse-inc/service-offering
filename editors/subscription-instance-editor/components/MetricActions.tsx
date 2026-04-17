import { useState, useCallback } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { SubscriptionInstanceAction } from "document-models/subscription-instance";
import type { ServiceMetric } from "../../../document-models/subscription-instance/v1/gen/schema/types.js";
import {
  incrementMetricUsage,
  decrementMetricUsage,
  updateMetric,
  resetMetricCycle,
} from "../../../document-models/subscription-instance/v1/gen/metrics/creators.js";

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
  const [adjustAmount, setAdjustAmount] = useState("1");

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

  // Client request functionality removed - no longer supported
  // const handleRequestLimitIncrease = useCallback(() => { ... }, [...]);

  // SI-R8: Operator view mirrors client with subtle edit affordance
  if (isOperator) {
    return (
      <>
        <div className="si-metric-actions">
          <button
            type="button"
            className="si-metric-btn si-metric-btn--edit"
            onClick={() => setShowAdjustModal(true)}
            aria-label={`Edit ${metric.name} usage`}
            title="Adjust usage"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          {metric.usageResetPeriod && metric.currentUsage > 0 && (
            <button
              type="button"
              className="si-metric-btn si-metric-btn--verify"
              onClick={() => {
                dispatch(
                  resetMetricCycle({
                    serviceId,
                    metricId: metric.id,
                    resetDate: new Date().toISOString(),
                  }),
                );
              }}
              aria-label={`Reset ${metric.name} cycle`}
              title={`Reset ${metric.usageResetPeriod.toLowerCase()} cycle — charges overage and resets to 0`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
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
                  {metric.paidLimit != null && (
                    <span>Limit: {metric.paidLimit.toLocaleString()}</span>
                  )}
                </div>
                {/* Quick +/- buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <button
                    type="button"
                    className="si-btn si-btn--sm si-btn--ghost"
                    onClick={() => {
                      handleDecrement(1);
                      setShowAdjustModal(false);
                    }}
                    disabled={metric.currentUsage <= 0}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    className="si-btn si-btn--sm si-btn--ghost"
                    onClick={() => {
                      handleIncrement(1);
                      setShowAdjustModal(false);
                    }}
                  >
                    +1
                  </button>
                </div>
                <div className="si-form-group">
                  <label className="si-form-label" htmlFor="adjust-amount">
                    Custom Adjustment (+ or -)
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

  // Client view - no direct actions
  return null;
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
  const [limit, setLimit] = useState(metric.paidLimit?.toString() || "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const parsedLimit = limit ? parseInt(limit, 10) : null;

      dispatch(
        updateMetric({
          serviceId,
          metricId: metric.id,
          paidLimit: parsedLimit,
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
