import { useState, useCallback } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ViewMode } from "../types.js";
import {
  activateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  renewExpiringSubscription,
} from "../../../document-models/subscription-instance/gen/subscription/creators.js";

interface SubscriptionActionsProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  showReasonInput?: boolean;
  reason?: string;
  onReasonChange?: (reason: string) => void;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  showReasonInput,
  reason,
  onReasonChange,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const buttonClass =
    confirmVariant === "danger"
      ? "si-btn si-btn--danger"
      : confirmVariant === "warning"
        ? "si-btn si-btn--warning"
        : "si-btn si-btn--primary";

  return (
    <div className="si-modal-overlay" onClick={onCancel}>
      <div className="si-modal" onClick={(e) => e.stopPropagation()}>
        <div className="si-modal__header">
          <h3 className="si-modal__title">{title}</h3>
        </div>
        <div className="si-modal__body">
          <p className="si-modal__message">{message}</p>
          {showReasonInput && (
            <textarea
              className="si-input si-input--textarea"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => onReasonChange?.(e.target.value)}
            />
          )}
        </div>
        <div className="si-modal__footer">
          <button
            type="button"
            className="si-btn si-btn--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="button" className={buttonClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionActions({
  document,
  dispatch,
  mode,
}: SubscriptionActionsProps) {
  const state = document.state.global;
  const [confirmAction, setConfirmAction] = useState<
    "pause" | "cancel" | "resume" | "renew" | null
  >(null);
  const [reason, setReason] = useState("");

  // Operator direct actions
  const handleActivate = useCallback(() => {
    dispatch(
      activateSubscription({
        activatedSince: new Date().toISOString(),
      }),
    );
  }, [dispatch]);

  const handleOperatorPause = useCallback(() => {
    dispatch(
      pauseSubscription({
        pausedSince: new Date().toISOString(),
      }),
    );
    setConfirmAction(null);
  }, [dispatch]);

  const handleOperatorResume = useCallback(() => {
    dispatch(
      resumeSubscription({
        timestamp: new Date().toISOString(),
      }),
    );
    setConfirmAction(null);
  }, [dispatch]);

  const handleOperatorCancel = useCallback(() => {
    dispatch(
      cancelSubscription({
        cancelledSince: new Date().toISOString(),
        cancellationReason: reason || null,
      }),
    );
    setConfirmAction(null);
    setReason("");
  }, [dispatch, reason]);

  const handleOperatorRenew = useCallback(() => {
    dispatch(
      renewExpiringSubscription({
        timestamp: new Date().toISOString(),
      }),
    );
    setConfirmAction(null);
  }, [dispatch]);

  const handleConfirm = useCallback(() => {
    switch (confirmAction) {
      case "pause":
        handleOperatorPause();
        break;
      case "resume":
        handleOperatorResume();
        break;
      case "cancel":
        handleOperatorCancel();
        break;
      case "renew":
        handleOperatorRenew();
        break;
    }
  }, [
    confirmAction,
    handleOperatorPause,
    handleOperatorResume,
    handleOperatorCancel,
    handleOperatorRenew,
  ]);

  const isPending = state.status === "PENDING";
  const isActive = state.status === "ACTIVE";
  const isPaused = state.status === "PAUSED";
  const isExpiring = state.status === "EXPIRING";
  const isCancelled = state.status === "CANCELLED";

  return (
    <>
      <div className="si-actions">
        {/* Status Actions - contextual based on current status */}
        {mode === "operator" && (
          <div className="si-actions__buttons">
            {isPending && (
              <button
                type="button"
                className="si-btn si-btn--sm si-btn--success"
                onClick={handleActivate}
              >
                <svg
                  className="si-btn__icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Activate
              </button>
            )}

            {isActive && (
              <button
                type="button"
                className="si-btn si-btn--sm si-btn--warning"
                onClick={() => setConfirmAction("pause")}
              >
                <svg
                  className="si-btn__icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Pause
              </button>
            )}

            {isPaused && (
              <button
                type="button"
                className="si-btn si-btn--sm si-btn--success"
                onClick={() => setConfirmAction("resume")}
              >
                <svg
                  className="si-btn__icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Resume
              </button>
            )}

            {isExpiring && (
              <button
                type="button"
                className="si-btn si-btn--sm si-btn--primary"
                onClick={() => setConfirmAction("renew")}
              >
                <svg
                  className="si-btn__icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Renew
              </button>
            )}

            {!isCancelled && (
              <button
                type="button"
                className="si-btn si-btn--sm si-btn--danger-ghost"
                onClick={() => setConfirmAction("cancel")}
              >
                <svg
                  className="si-btn__icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modals - operator only */}
      <ConfirmModal
        isOpen={confirmAction === "pause"}
        title="Pause Subscription"
        message="Are you sure you want to pause this subscription? Services will be temporarily suspended."
        confirmLabel="Pause Subscription"
        confirmVariant="warning"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setReason("");
        }}
      />

      <ConfirmModal
        isOpen={confirmAction === "resume"}
        title="Resume Subscription"
        message="Are you sure you want to resume this subscription? Services will be reactivated."
        confirmLabel="Resume Subscription"
        confirmVariant="primary"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setReason("");
        }}
      />

      <ConfirmModal
        isOpen={confirmAction === "cancel"}
        title="Cancel Subscription"
        message="Are you sure you want to cancel this subscription? This action cannot be undone."
        confirmLabel="Cancel Subscription"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setReason("");
        }}
        showReasonInput={true}
        reason={reason}
        onReasonChange={setReason}
      />

      <ConfirmModal
        isOpen={confirmAction === "renew"}
        title="Renew Subscription"
        message="This will renew the expiring subscription and set it back to active status."
        confirmLabel="Renew Subscription"
        confirmVariant="primary"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}
