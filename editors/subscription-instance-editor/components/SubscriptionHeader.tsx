import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ViewMode } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";
import { SubscriptionActions } from "./SubscriptionActions.js";

interface SubscriptionHeaderProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
  mode: ViewMode;
}

export function SubscriptionHeader({
  document,
  dispatch,
  mode,
}: SubscriptionHeaderProps) {
  const state = document.state.global;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="si-header">
      <div className="si-header__main">
        <div className="si-header__title-row">
          <div className="si-header__info">
            {state.resource?.thumbnailUrl && (
              <img
                src={state.resource.thumbnailUrl}
                alt=""
                className="si-header__thumbnail"
              />
            )}
            <div>
              <h1 className="si-header__title">
                {state.resource?.label || state.tierName || "Subscription"}
              </h1>
              {state.tierName && state.resource?.label && (
                <p className="si-header__subtitle">{state.tierName} Tier</p>
              )}
            </div>
          </div>
          <StatusBadge status={state.status} />
        </div>

        <div className="si-header__meta">
          {mode === "operator" && state.customerName && (
            <div className="si-header__meta-item">
              <span className="si-header__meta-label">Customer</span>
              <span className="si-header__meta-value">
                {state.customerName}
              </span>
            </div>
          )}
          {state.createdAt && (
            <div className="si-header__meta-item">
              <span className="si-header__meta-label">Created</span>
              <span className="si-header__meta-value">
                {formatDate(state.createdAt)}
              </span>
            </div>
          )}
          {state.activatedSince && (
            <div className="si-header__meta-item">
              <span className="si-header__meta-label">Active Since</span>
              <span className="si-header__meta-value">
                {formatDate(state.activatedSince)}
              </span>
            </div>
          )}
          {state.renewalDate && (
            <div className="si-header__meta-item">
              <span className="si-header__meta-label">Renewal Date</span>
              <span className="si-header__meta-value">
                {formatDate(state.renewalDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="si-header__stats">
        <div className="si-header__stat">
          <span className="si-header__stat-value">{state.services.length}</span>
          <span className="si-header__stat-label">Services</span>
        </div>
        {state.projectedBillAmount != null && (
          <div className="si-header__stat">
            <span className="si-header__stat-value">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: state.projectedBillCurrency || "USD",
              }).format(state.projectedBillAmount)}
            </span>
            <span className="si-header__stat-label">Next Bill</span>
          </div>
        )}
        {state.nextBillingDate && (
          <div className="si-header__stat">
            <span className="si-header__stat-value">
              {formatDate(state.nextBillingDate)}
            </span>
            <span className="si-header__stat-label">Due Date</span>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="si-header__actions-section">
        <SubscriptionActions
          document={document}
          dispatch={dispatch}
          mode={mode}
        />
      </div>
    </div>
  );
}
