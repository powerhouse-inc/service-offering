import { useMemo, useState, useRef, useEffect } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  ServiceStatus,
} from "@powerhousedao/service-offering/document-models/service-offering";
import { updateOfferingStatus } from "../../../document-models/service-offering/gen/offering/creators.js";
import type { TabId } from "../editor.js";
import "./OfferingProgress.css";

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
  explainer: string;
}

// Only count services that belong to an existing group
function getGroupedServices(state: ServiceOfferingDocument["state"]["global"]) {
  const existingGroupIds = new Set(state.optionGroups?.map((g) => g.id) ?? []);
  return state.services.filter(
    (s) => s.optionGroupId && existingGroupIds.has(s.optionGroupId),
  );
}

// Helper to check if matrix is reasonably complete
export function hasCompleteMatrix(
  state: ServiceOfferingDocument["state"]["global"],
): boolean {
  const grouped = getGroupedServices(state);
  if (grouped.length === 0 || state.tiers.length === 0) return false;

  // Check if at least 50% of grouped services have tier assignments
  const servicesWithLevels = grouped.filter((service) =>
    state.tiers.some((tier) =>
      tier.serviceLevels.some((sl) => sl.serviceId === service.id),
    ),
  ).length;

  return servicesWithLevels >= Math.ceil(grouped.length * 0.5);
}

function getMatrixCompletionText(
  state: ServiceOfferingDocument["state"]["global"],
): string {
  const grouped = getGroupedServices(state);
  if (grouped.length === 0 || state.tiers.length === 0) {
    return "Add services and tiers first";
  }

  const servicesWithLevels = grouped.filter((service) =>
    state.tiers.some((tier) =>
      tier.serviceLevels.some((sl) => sl.serviceId === service.id),
    ),
  ).length;

  return `${servicesWithLevels}/${grouped.length} services configured`;
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

  const steps: ProgressStep[] = useMemo(() => {
    const groupCount = state.optionGroups?.length ?? 0;
    const existingGroupIds = new Set(
      state.optionGroups?.map((g) => g.id) ?? [],
    );
    const groupedServiceCount = state.services.filter(
      (s) => s.optionGroupId && existingGroupIds.has(s.optionGroupId),
    ).length;
    return [
      {
        id: "scope-facets" as TabId,
        label: "Product",
        isComplete: !!state.resourceTemplateId,
        details: state.resourceTemplateId
          ? `${state.facetTargets.length} facets configured`
          : "Select a product to continue",
        explainer: state.resourceTemplateId
          ? "Product selected — configure facets if needed"
          : "Choose a product to define scope and available services",
      },
      {
        id: "tier-definition" as TabId,
        label: "Tiers",
        isComplete: state.tiers.length >= 2,
        details:
          state.tiers.length >= 2
            ? `${state.tiers.length} tiers defined`
            : `Add at least ${2 - state.tiers.length} more tier${2 - state.tiers.length !== 1 ? "s" : ""} to continue`,
        explainer:
          state.tiers.length >= 2
            ? "Set billing cycles and tier pricing"
            : "Create at least 2 pricing tiers for your offering",
      },
      {
        id: "service-catalog" as TabId,
        label: "Services",
        isComplete: groupedServiceCount >= 1,
        details:
          groupedServiceCount >= 1
            ? `${groupedServiceCount} service${groupedServiceCount !== 1 ? "s" : ""} in ${groupCount} group${groupCount !== 1 ? "s" : ""}`
            : "Add at least 1 service to a group to continue",
        explainer:
          groupedServiceCount >= 1
            ? "Organize services into groups and set pricing"
            : "Add services and organize them into option groups",
      },
      {
        id: "the-matrix" as TabId,
        label: "Matrix",
        isComplete: hasCompleteMatrix(state),
        details: getMatrixCompletionText(state),
        explainer: hasCompleteMatrix(state)
          ? "Review tier assignments, pricing, and usage metrics"
          : "Assign services to tiers and configure pricing",
      },
    ];
  }, [state]);

  const totalPercent = useMemo(() => {
    const count = steps.filter((s) => s.isComplete).length;
    return Math.round((count / steps.length) * 100);
  }, [steps]);

  return (
    <>
      <div className="offering-progress">
        <div className="offering-progress__header">
          <div className="offering-progress__percent-wrap">
            {totalPercent < 100 ? (
              <>
                <span className="offering-progress__percent">
                  {totalPercent}%
                </span>
                <span className="offering-progress__label">Complete</span>
              </>
            ) : (
              <span className="offering-progress__guidance">
                Review pricing in the Matrix and set usage metrics
              </span>
            )}
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
                  <span className="offering-progress__step-explainer">
                    {step.explainer}
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
