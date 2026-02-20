import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import type { ViewMode } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";
import { SubscriptionActions } from "./SubscriptionActions.js";

function DueCountdown({ date, label }: { date: string; label: string }) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const daysAway = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getCountdownColor = () => {
    if (daysAway <= 0) return "var(--si-rose-600)";
    if (daysAway <= 7) return "var(--si-rose-600)";
    if (daysAway <= 14) return "var(--si-amber-600)";
    return undefined;
  };

  const getCountdownLabel = () => {
    if (daysAway <= 0) return "Overdue";
    if (daysAway === 1) return "Tomorrow";
    return `${daysAway} days`;
  };

  return (
    <div className="si-header__stat">
      <span className="si-header__stat-value">{formatDate(date)}</span>
      <span className="si-header__stat-label">
        {label}
        <span
          className="si-header__stat-countdown"
          style={
            getCountdownColor() ? { color: getCountdownColor() } : undefined
          }
        >
          {" "}
          ({getCountdownLabel()})
        </span>
      </span>
    </div>
  );
}

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
          <div className="si-header__meta-item">
            <span className="si-header__meta-label">Auto-Renew</span>
            <span
              className="si-header__meta-value"
              style={{
                color: state.autoRenew
                  ? "var(--si-emerald-600)"
                  : "var(--si-slate-400)",
              }}
            >
              {state.autoRenew ? "Enabled" : "Disabled"}
            </span>
          </div>
          {state.pausedSince && state.status === "PAUSED" && (
            <div className="si-header__meta-item">
              <span className="si-header__meta-label">Paused Since</span>
              <span
                className="si-header__meta-value"
                style={{ color: "var(--si-amber-600)" }}
              >
                {formatDate(state.pausedSince)}
              </span>
            </div>
          )}
          {state.expiringSince && state.status === "EXPIRING" && (
            <div className="si-header__meta-item">
              <span className="si-header__meta-label">Expiring Since</span>
              <span
                className="si-header__meta-value"
                style={{ color: "var(--si-orange-600)" }}
              >
                {formatDate(state.expiringSince)}
              </span>
            </div>
          )}
          {state.cancelledSince && state.status === "CANCELLED" && (
            <div className="si-header__meta-item">
              <span className="si-header__meta-label">Cancelled</span>
              <span
                className="si-header__meta-value"
                style={{ color: "var(--si-rose-600)" }}
              >
                {formatDate(state.cancelledSince)}
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
                currency:
                  state.globalCurrency || state.projectedBillCurrency || "USD",
              }).format(state.projectedBillAmount)}
            </span>
            <span className="si-header__stat-label">Projected Bill</span>
          </div>
        )}
        {state.nextBillingDate && (
          <DueCountdown date={state.nextBillingDate} label="Due Date" />
        )}
        {state.renewalDate && (
          <DueCountdown date={state.renewalDate} label="Renewal" />
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
