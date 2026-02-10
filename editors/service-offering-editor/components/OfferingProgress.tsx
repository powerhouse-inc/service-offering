import { useMemo } from "react";
import type { ServiceOfferingDocument } from "@powerhousedao/service-offering/document-models/service-offering";
import type { TabId } from "./TabNavigation.js";

interface OfferingProgressProps {
  document: ServiceOfferingDocument;
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

export function OfferingProgress({
  document,
  activeTab,
  onTabChange,
}: OfferingProgressProps) {
  const state = document.state.global;

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
          {totalPercent === 100 && (
            <span className="offering-progress__ready-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
              Ready to publish
            </span>
          )}
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

  .offering-progress__ready-badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: var(--so-emerald-50);
    color: var(--so-emerald-600);
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 100px;
    animation: progress-badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .offering-progress__ready-badge svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  @keyframes progress-badge-pop {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
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
