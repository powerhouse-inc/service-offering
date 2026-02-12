import { useState, useCallback } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ClientRequest } from "../../../document-models/subscription-instance/gen/schema/types.js";
import type { ViewMode } from "../types.js";
import {
  approveRequest,
  rejectRequest,
} from "../../../document-models/subscription-instance/gen/requests/creators.js";

interface PendingRequestsPanelProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

const requestTypeLabels: Record<string, string> = {
  REMOVE_SERVICE: "Remove Service",
  INCREASE_LIMIT: "Increase Limit",
  REMOVE_OPTION: "Remove Add-on",
  GENERAL: "General Request",
};

const statusColors: Record<string, string> = {
  PENDING: "color: var(--si-amber-600)",
  APPROVED: "color: var(--si-emerald-600)",
  REJECTED: "color: var(--si-rose-600)",
};

function RequestCard({
  request,
  mode,
  onApprove,
  onReject,
}: {
  request: ClientRequest;
  mode: ViewMode;
  onApprove: (request: ClientRequest) => void;
  onReject: (request: ClientRequest) => void;
}) {
  const isPending = request.status === "PENDING";
  const isResolved = !isPending;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const contextLabel = () => {
    if (request.serviceName) return request.serviceName;
    if (request.metricName) return request.metricName;
    if (request.optionGroupName) return request.optionGroupName;
    return null;
  };

  return (
    <div
      className={`si-request-card${isResolved ? " si-request-card--processed" : ""}`}
    >
      <div className="si-request-card__header">
        <span className="si-request-card__type">
          {requestTypeLabels[request.type] || request.type}
        </span>
        <span
          className="si-request-card__status"
          style={
            statusColors[request.status]
              ? { color: statusColors[request.status].split(": ")[1] }
              : undefined
          }
        >
          {request.status}
        </span>
      </div>

      <div className="si-request-card__body">
        <span className="si-request-card__info">
          {contextLabel() || request.description}
        </span>
        <span className="si-request-card__time">
          {formatDate(request.createdAt)}
        </span>
      </div>

      {request.requestedValue != null && (
        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--si-slate-600)",
            marginBottom: 8,
          }}
        >
          Requested value:{" "}
          <strong>{request.requestedValue.toLocaleString()}</strong>
        </div>
      )}

      {request.reason && (
        <div className="si-request-card__reason">{request.reason}</div>
      )}

      {request.operatorResponse && (
        <div className="si-request-card__response">
          Operator: {request.operatorResponse}
        </div>
      )}

      {isPending && mode === "operator" && (
        <div className="si-request-card__actions">
          <button
            type="button"
            className="si-btn si-btn--sm si-btn--success"
            onClick={() => onApprove(request)}
          >
            Approve
          </button>
          <button
            type="button"
            className="si-btn si-btn--sm si-btn--danger"
            onClick={() => onReject(request)}
          >
            Reject
          </button>
        </div>
      )}

      {isResolved && request.resolvedAt && (
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--si-slate-400)",
            marginTop: 4,
          }}
        >
          Resolved {formatDate(request.resolvedAt)}
        </div>
      )}
    </div>
  );
}

function ResponseModal({
  isOpen,
  onClose,
  onSubmit,
  actionType,
  request,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: string) => void;
  actionType: "approve" | "reject";
  request: ClientRequest | null;
}) {
  const [response, setResponse] = useState("");

  const handleSubmit = useCallback(() => {
    onSubmit(response);
    setResponse("");
  }, [onSubmit, response]);

  const handleClose = useCallback(() => {
    setResponse("");
    onClose();
  }, [onClose]);

  if (!isOpen || !request) return null;

  const isApprove = actionType === "approve";

  return (
    <div className="si-modal-overlay" onClick={handleClose}>
      <div
        className="si-modal si-modal--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="si-modal__header">
          <h3 className="si-modal__title">
            {isApprove ? "Approve Request" : "Reject Request"}
          </h3>
          <span className="si-modal__subtitle">
            {requestTypeLabels[request.type] || request.type}
            {request.serviceName ? ` — ${request.serviceName}` : ""}
            {request.metricName ? ` — ${request.metricName}` : ""}
            {request.optionGroupName ? ` — ${request.optionGroupName}` : ""}
          </span>
        </div>
        <div className="si-modal__body">
          <div className="si-request-details">
            <div className="si-request-detail">
              <span className="si-request-detail__label">Description</span>
              <span className="si-request-detail__value">
                {request.description}
              </span>
            </div>
            {request.reason && (
              <div className="si-request-detail">
                <span className="si-request-detail__label">Reason</span>
                <span className="si-request-detail__value">
                  {request.reason}
                </span>
              </div>
            )}
            {request.requestedValue != null && (
              <div className="si-request-detail">
                <span className="si-request-detail__label">
                  Requested Value
                </span>
                <span className="si-request-detail__value">
                  {request.requestedValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <div className="si-form-group">
            <label className="si-form-label" htmlFor="operator-response">
              Response (optional)
            </label>
            <textarea
              id="operator-response"
              className="si-input si-input--textarea"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={
                isApprove
                  ? "Add a note about the approval..."
                  : "Explain why this request is being rejected..."
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
              isApprove ? "si-btn si-btn--success" : "si-btn si-btn--danger"
            }
            onClick={handleSubmit}
          >
            {isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PendingRequestsPanel({
  document,
  dispatch,
  mode,
}: PendingRequestsPanelProps) {
  const requests = document.state.global.clientRequests;

  const [modalRequest, setModalRequest] = useState<ClientRequest | null>(null);
  const [modalAction, setModalAction] = useState<"approve" | "reject">(
    "approve",
  );

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const resolvedRequests = requests.filter((r) => r.status !== "PENDING");

  const handleApprove = useCallback((request: ClientRequest) => {
    setModalRequest(request);
    setModalAction("approve");
  }, []);

  const handleReject = useCallback((request: ClientRequest) => {
    setModalRequest(request);
    setModalAction("reject");
  }, []);

  const handleModalSubmit = useCallback(
    (response: string) => {
      if (!modalRequest) return;
      const now = new Date().toISOString();
      if (modalAction === "approve") {
        dispatch(
          approveRequest({
            requestId: modalRequest.id,
            resolvedAt: now,
            operatorResponse: response || undefined,
          }),
        );
      } else {
        dispatch(
          rejectRequest({
            requestId: modalRequest.id,
            resolvedAt: now,
            operatorResponse: response || undefined,
          }),
        );
      }
      setModalRequest(null);
    },
    [dispatch, modalRequest, modalAction],
  );

  if (requests.length === 0) {
    return null;
  }

  return (
    <>
      <div className="si-panel">
        <div className="si-panel__header">
          <h3 className="si-panel__title">
            {mode === "operator" ? "Client Requests" : "My Requests"}
            {pendingRequests.length > 0 && (
              <span className="si-panel__badge si-panel__badge--warning">
                {pendingRequests.length}
              </span>
            )}
          </h3>
          <span className="si-panel__count">{requests.length} total</span>
        </div>

        {pendingRequests.length > 0 && (
          <div className="si-requests-list">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                mode={mode}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

        {pendingRequests.length === 0 && (
          <p className="si-panel__empty">No pending requests</p>
        )}

        {resolvedRequests.length > 0 && (
          <div className="si-requests-history">
            <h4 className="si-requests-history__title">History</h4>
            <div className="si-requests-list si-requests-list--compact">
              {resolvedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  mode={mode}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ResponseModal
        isOpen={modalRequest !== null}
        onClose={() => setModalRequest(null)}
        onSubmit={handleModalSubmit}
        actionType={modalAction}
        request={modalRequest}
      />
    </>
  );
}
