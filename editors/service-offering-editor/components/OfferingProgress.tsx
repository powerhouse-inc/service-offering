import { useMemo, useState, useRef, useEffect } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  ServiceStatus,
} from "@powerhousedao/service-offering/document-models/service-offering";
import { updateOfferingStatus } from "../../../document-models/service-offering/gen/offering/creators.js";
import type { TabId } from "./TabNavigation.js";

interface OfferingProgressProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

interface ProgressStep {
  id: TabId;
  label: string;
  isComplete: boolean;
  details: string;
}

// Helper to check if matrix is reasonably complete
function hasCompleteMatrix(
  state: ServiceOfferingDocument["state"]["global"],
): boolean {
  if (state.services.length === 0 || state.tiers.length === 0) return false;

  // Check if at least 50% of services have tier assignments
  const servicesWithLevels = state.services.filter((service) =>
    state.tiers.some((tier) =>
      tier.serviceLevels.some((sl) => sl.serviceId === service.id),
    ),
  ).length;

  return servicesWithLevels >= Math.ceil(state.services.length * 0.5);
}

function getMatrixCompletionText(
  state: ServiceOfferingDocument["state"]["global"],
): string {
  if (state.services.length === 0 || state.tiers.length === 0) {
    return "Add services and tiers first";
  }

  const servicesWithLevels = state.services.filter((service) =>
    state.tiers.some((tier) =>
      tier.serviceLevels.some((sl) => sl.serviceId === service.id),
    ),
  ).length;

  return `${servicesWithLevels}/${state.services.length} services configured`;
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; badgeClass: string; description: string }
> = {
  DRAFT: {
    label: "Draft",
    badgeClass: "offering-progress__status-badge--draft",
    description: "Not visible on Achra",
  },
  COMING_SOON: {
    label: "Coming Soon",
    badgeClass: "offering-progress__status-badge--coming-soon",
    description: "Visible on Achra as coming soon",
  },
  ACTIVE: {
    label: "Active",
    badgeClass: "offering-progress__status-badge--active",
    description: "Live on Achra",
  },
  DEPRECATED: {
    label: "Deprecated",
    badgeClass: "offering-progress__status-badge--deprecated",
    description: "Marked as deprecated on Achra",
  },
};

const STATUS_ORDER: ServiceStatus[] = [
  "DRAFT",
  "COMING_SOON",
  "ACTIVE",
  "DEPRECATED",
];

// Transitions that require confirmation (publishing / going live)
function needsConfirmation(
  from: ServiceStatus,
  to: ServiceStatus,
): { title: string; message: string } | null {
  if (from === "DRAFT" && to === "COMING_SOON") {
    return {
      title: "Publish as Coming Soon?",
      message:
        'This service offering will be visible on Achra with a "Coming Soon" status. Subscribers won\'t be able to sign up yet.',
    };
  }
  if (from === "DRAFT" && to === "ACTIVE") {
    return {
      title: "Go Live on Achra?",
      message:
        "This service offering will be published and available for subscribers on Achra immediately.",
    };
  }
  if (from === "COMING_SOON" && to === "ACTIVE") {
    return {
      title: "Go Live on Achra?",
      message:
        'This service offering will change from "Coming Soon" to fully active. Subscribers will be able to sign up.',
    };
  }
  return null;
}

export function OfferingProgress({
  document,
  dispatch,
  activeTab,
  onTabChange,
}: OfferingProgressProps) {
  const state = document.state.global;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ServiceStatus | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleStatusSelect = (newStatus: ServiceStatus) => {
    setDropdownOpen(false);
    if (newStatus === state.status) return;

    const confirmation = needsConfirmation(state.status, newStatus);
    if (confirmation) {
      setPendingStatus(newStatus);
    } else {
      dispatch(
        updateOfferingStatus({
          status: newStatus,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const confirmStatusChange = () => {
    if (!pendingStatus) return;
    dispatch(
      updateOfferingStatus({
        status: pendingStatus,
        lastModified: new Date().toISOString(),
      }),
    );
    setPendingStatus(null);
  };

  const cancelStatusChange = () => {
    setPendingStatus(null);
  };

  const currentConfig = STATUS_CONFIG[state.status];
  const pendingConfig = pendingStatus ? STATUS_CONFIG[pendingStatus] : null;
  const pendingConfirmation = pendingStatus
    ? needsConfirmation(state.status, pendingStatus)
    : null;

  const steps: ProgressStep[] = useMemo(
    () => [
      {
        id: "scope-facets" as TabId,
        label: "Template",
        isComplete: !!state.resourceTemplateId,
        details: state.resourceTemplateId
          ? `${state.facetTargets.length} facets configured`
          : "Select a template",
      },
      {
        id: "tier-definition" as TabId,
        label: "Tiers",
        isComplete: state.tiers.length >= 2,
        details:
          state.tiers.length > 0
            ? `${state.tiers.length} tier${state.tiers.length !== 1 ? "s" : ""} defined`
            : "Define pricing tiers",
      },
      {
        id: "service-catalog" as TabId,
        label: "Services",
        isComplete: state.services.length >= 1,
        details:
          state.services.length > 0
            ? `${state.services.length} service${state.services.length !== 1 ? "s" : ""} created`
            : "Add your services",
      },
      {
        id: "the-matrix" as TabId,
        label: "Matrix",
        isComplete: hasCompleteMatrix(state),
        details: getMatrixCompletionText(state),
      },
    ],
    [state],
  );

  const completedCount = steps.filter((s) => s.isComplete).length;
  const totalPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <>
      <style>{progressStyles}</style>
      <div className="offering-progress">
        <div className="offering-progress__header">
          <div className="offering-progress__percent-wrap">
            <span className="offering-progress__percent">{totalPercent}%</span>
            <span className="offering-progress__label">Complete</span>
          </div>
          <div className="offering-progress__actions">
            <div className="offering-progress__status-select" ref={dropdownRef}>
              <button
                className={`offering-progress__status-badge ${currentConfig.badgeClass}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {state.status === "ACTIVE" && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ width: 10, height: 10 }}
                  >
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                )}
                {currentConfig.label}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{
                    width: 12,
                    height: 12,
                    marginLeft: 2,
                    transition: "transform 0.15s ease",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="offering-progress__dropdown">
                  {STATUS_ORDER.map((status) => {
                    const config = STATUS_CONFIG[status];
                    const isCurrent = status === state.status;
                    return (
                      <button
                        key={status}
                        className={`offering-progress__dropdown-item ${isCurrent ? "offering-progress__dropdown-item--current" : ""}`}
                        onClick={() => handleStatusSelect(status)}
                      >
                        <span className="offering-progress__dropdown-label">
                          {config.label}
                        </span>
                        <span className="offering-progress__dropdown-desc">
                          {config.description}
                        </span>
                        {isCurrent && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="offering-progress__dropdown-check"
                          >
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="offering-progress__bar">
          <div
            className="offering-progress__fill"
            style={{ width: `${totalPercent}%` }}
          />
        </div>
        <div className="offering-progress__steps">
          {steps.map((step, i) => {
            const isActive = step.id === activeTab;

            return (
              <button
                key={step.id}
                onClick={() => onTabChange(step.id)}
                className={`
                  offering-progress__step
                  ${step.isComplete ? "offering-progress__step--complete" : ""}
                  ${isActive ? "offering-progress__step--active" : ""}
                `}
              >
                <div className="offering-progress__step-indicator">
                  {step.isComplete ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <div className="offering-progress__step-text">
                  <span className="offering-progress__step-label">
                    {step.label}
                  </span>
                  <span className="offering-progress__step-details">
                    {step.details}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingStatus && pendingConfirmation && pendingConfig && (
        <div
          className="offering-progress__overlay"
          onClick={cancelStatusChange}
        >
          <div
            className="offering-progress__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="offering-progress__modal-title">
              {pendingConfirmation.title}
            </h3>
            <p className="offering-progress__modal-message">
              {pendingConfirmation.message}
            </p>
            <div className="offering-progress__modal-status-change">
              <span
                className={`offering-progress__status-badge ${currentConfig.badgeClass}`}
              >
                {currentConfig.label}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 20, height: 20, color: "var(--so-slate-400)" }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span
                className={`offering-progress__status-badge ${pendingConfig.badgeClass}`}
              >
                {pendingConfig.label}
              </span>
            </div>
            <div className="offering-progress__modal-actions">
              <button
                className="offering-progress__modal-btn offering-progress__modal-btn--cancel"
                onClick={cancelStatusChange}
              >
                Cancel
              </button>
              <button
                className="offering-progress__modal-btn offering-progress__modal-btn--confirm"
                onClick={confirmStatusChange}
              >
                {pendingStatus === "ACTIVE" ? "Go Live" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const progressStyles = `
  .offering-progress {
    background: white;
    border-radius: var(--so-radius-lg);
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    box-shadow: var(--so-shadow-sm);
    border: 1px solid var(--so-slate-100);
  }

  .offering-progress__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .offering-progress__percent-wrap {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .offering-progress__percent {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--so-violet-600);
    font-family: var(--so-font-mono);
  }

  .offering-progress__label {
    font-size: 0.75rem;
    color: var(--so-slate-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .offering-progress__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .offering-progress__status-select {
    position: relative;
  }

  .offering-progress__status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    font-family: var(--so-font-sans);
    transition: all 0.15s ease;
  }

  .offering-progress__status-badge:hover {
    filter: brightness(0.95);
  }

  .offering-progress__status-badge--draft {
    background: var(--so-slate-100);
    color: var(--so-slate-600);
  }

  .offering-progress__status-badge--coming-soon {
    background: var(--so-amber-100);
    color: var(--so-amber-700);
  }

  .offering-progress__status-badge--active {
    background: var(--so-emerald-50);
    color: var(--so-emerald-600);
  }

  .offering-progress__status-badge--active svg:first-child {
    animation: progress-pulse 2s ease-in-out infinite;
  }

  .offering-progress__status-badge--deprecated {
    background: var(--so-rose-50);
    color: var(--so-rose-600);
  }

  @keyframes progress-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Status Dropdown */
  .offering-progress__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    width: 220px;
    background: white;
    border-radius: var(--so-radius-md);
    box-shadow: var(--so-shadow-lg);
    border: 1px solid var(--so-slate-200);
    padding: 4px;
    z-index: 50;
    animation: progress-dropdown-in 0.15s ease-out;
  }

  @keyframes progress-dropdown-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .offering-progress__dropdown-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: transparent;
    border-radius: var(--so-radius-sm);
    cursor: pointer;
    text-align: left;
    font-family: var(--so-font-sans);
    transition: background 0.1s ease;
  }

  .offering-progress__dropdown-item:hover {
    background: var(--so-slate-50);
  }

  .offering-progress__dropdown-item--current {
    background: var(--so-violet-50);
  }

  .offering-progress__dropdown-item--current:hover {
    background: var(--so-violet-50);
  }

  .offering-progress__dropdown-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-slate-800);
  }

  .offering-progress__dropdown-desc {
    font-size: 0.6875rem;
    color: var(--so-slate-400);
  }

  .offering-progress__dropdown-check {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 14px;
    height: 14px;
    color: var(--so-violet-500);
  }

  /* Confirmation Modal */
  .offering-progress__overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: progress-overlay-in 0.2s ease-out;
  }

  @keyframes progress-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .offering-progress__modal {
    background: white;
    border-radius: var(--so-radius-lg);
    padding: 1.5rem;
    max-width: 400px;
    width: 90%;
    box-shadow: var(--so-shadow-xl);
    animation: progress-modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes progress-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .offering-progress__modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--so-slate-800);
    margin: 0 0 0.5rem;
  }

  .offering-progress__modal-message {
    font-size: 0.875rem;
    color: var(--so-slate-500);
    line-height: 1.5;
    margin: 0 0 1.25rem;
  }

  .offering-progress__modal-status-change {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    margin-bottom: 1.25rem;
  }

  .offering-progress__modal-status-change .offering-progress__status-badge {
    cursor: default;
  }

  .offering-progress__modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .offering-progress__modal-btn {
    padding: 0.5rem 1.25rem;
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: var(--so-font-sans);
    border: none;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .offering-progress__modal-btn--cancel {
    background: var(--so-slate-100);
    color: var(--so-slate-600);
  }

  .offering-progress__modal-btn--cancel:hover {
    background: var(--so-slate-200);
  }

  .offering-progress__modal-btn--confirm {
    background: linear-gradient(135deg, var(--so-emerald-500), var(--so-emerald-600));
    color: white;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  }

  .offering-progress__modal-btn--confirm:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
  }

  .offering-progress__modal-btn--confirm:active {
    transform: translateY(0);
  }

  .offering-progress__bar {
    height: 8px;
    background: var(--so-slate-100);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .offering-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--so-violet-500), var(--so-emerald-500));
    border-radius: 100px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .offering-progress__steps {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .offering-progress__step {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .offering-progress__step:hover {
    background: var(--so-slate-50);
  }

  .offering-progress__step--active {
    background: var(--so-violet-50);
  }

  .offering-progress__step-indicator {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--so-slate-200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--so-slate-500);
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .offering-progress__step--complete .offering-progress__step-indicator {
    background: var(--so-emerald-500);
    color: white;
  }

  .offering-progress__step--complete .offering-progress__step-indicator svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .offering-progress__step--active .offering-progress__step-indicator {
    background: var(--so-violet-500);
    color: white;
    box-shadow: 0 0 0 3px var(--so-violet-100);
  }

  .offering-progress__step-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .offering-progress__step-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .offering-progress__step--active .offering-progress__step-label {
    color: var(--so-violet-700);
  }

  .offering-progress__step-details {
    font-size: 0.6875rem;
    color: var(--so-slate-400);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .offering-progress__step--complete .offering-progress__step-details {
    color: var(--so-emerald-600);
  }

  @media (max-width: 768px) {
    .offering-progress__steps {
      flex-wrap: wrap;
    }

    .offering-progress__step {
      flex: 1 1 45%;
    }
  }
`;
