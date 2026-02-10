import type { ReactNode } from "react";

export type TabId =
  | "scope-facets"
  | "service-catalog"
  | "tier-definition"
  | "the-matrix";

interface Tab {
  id: TabId;
  label: string;
  icon: ReactNode;
  accentColor: string;
}

const tabs: Tab[] = [
  {
    id: "scope-facets",
    label: "Resource Template",
    accentColor: "teal",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "tier-definition",
    label: "Tier Definition",
    accentColor: "amber",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
  },
  {
    id: "service-catalog",
    label: "Service Catalog",
    accentColor: "emerald",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
      </svg>
    ),
  },
  {
    id: "the-matrix",
    label: "The Matrix",
    accentColor: "slate",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <circle cx="8" cy="8" r="2" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="8" cy="16" r="2" />
        <circle cx="16" cy="16" r="2" />
        <path d="M10 8h4M10 16h4M8 10v4M16 10v4" />
      </svg>
    ),
  },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  completedTabs?: TabId[];
}

export function TabNavigation({
  activeTab,
  onTabChange,
  completedTabs = [],
}: TabNavigationProps) {
  const getTabIndex = (tabId: TabId) => tabs.findIndex((t) => t.id === tabId);
  const activeIndex = getTabIndex(activeTab);

  return (
    <>
      <style>{styles}</style>
      <nav className="so-tabs" role="tablist">
        <div className="so-tabs__track">
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            const isPast =
              index < activeIndex || completedTabs.includes(tab.id);

            return (
              <div key={tab.id} className="so-tabs__item-wrapper">
                <button
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(tab.id)}
                  className={`so-tabs__item ${isActive ? "so-tabs__item--active" : ""} ${isPast ? "so-tabs__item--completed" : ""}`}
                  data-accent={tab.accentColor}
                >
                  <span className="so-tabs__icon-ring">
                    <span className="so-tabs__icon">{tab.icon}</span>
                    {isPast && !isActive && (
                      <span className="so-tabs__check">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="so-tabs__label">{tab.label}</span>
                </button>
                {index < tabs.length - 1 && (
                  <div
                    className={`so-tabs__connector ${index < activeIndex ? "so-tabs__connector--active" : ""}`}
                  >
                    <div className="so-tabs__connector-line" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}

const styles = `
  .so-tabs {
    background: white;
    border-radius: var(--so-radius-xl);
    box-shadow: var(--so-shadow-md);
    padding: 20px 32px;
    margin-bottom: 28px;
    border: 1px solid var(--so-slate-100);
  }

  .so-tabs__track {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .so-tabs__item-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .so-tabs__item-wrapper:last-child {
    flex: 0;
  }

  .so-tabs__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--so-transition-base);
    border-radius: var(--so-radius-lg);
  }

  .so-tabs__item:hover {
    background: var(--so-slate-50);
  }

  .so-tabs__icon-ring {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--so-slate-100);
    transition: all var(--so-transition-base);
  }

  .so-tabs__icon {
    width: 24px;
    height: 24px;
    color: var(--so-slate-400);
    transition: all var(--so-transition-base);
  }

  .so-tabs__icon svg {
    width: 100%;
    height: 100%;
  }

  .so-tabs__check {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 20px;
    height: 20px;
    background: var(--so-emerald-500);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    animation: so-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .so-tabs__check svg {
    width: 12px;
    height: 12px;
    color: white;
  }

  @keyframes so-pop-in {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .so-tabs__label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-500);
    white-space: nowrap;
    transition: all var(--so-transition-base);
  }

  .so-tabs__connector {
    flex: 1;
    height: 3px;
    margin: 0 8px;
    margin-bottom: 36px;
    position: relative;
    background: var(--so-slate-200);
    border-radius: 2px;
    overflow: hidden;
  }

  .so-tabs__connector-line {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--so-emerald-500), var(--so-emerald-400));
    border-radius: 2px;
    transition: width var(--so-transition-slow);
  }

  .so-tabs__connector--active .so-tabs__connector-line {
    width: 100%;
  }

  /* Completed state */
  .so-tabs__item--completed .so-tabs__icon-ring {
    background: var(--so-emerald-100);
  }

  .so-tabs__item--completed .so-tabs__icon {
    color: var(--so-emerald-600);
  }

  .so-tabs__item--completed .so-tabs__label {
    color: var(--so-emerald-600);
  }

  /* Active states with accent colors */
  .so-tabs__item--active {
    background: transparent;
  }

  .so-tabs__item--active[data-accent="violet"] .so-tabs__icon-ring {
    background: var(--so-violet-100);
    box-shadow: 0 0 0 4px var(--so-violet-50), 0 4px 12px rgba(139, 92, 246, 0.25);
  }

  .so-tabs__item--active[data-accent="violet"] .so-tabs__icon {
    color: var(--so-violet-600);
  }

  .so-tabs__item--active[data-accent="violet"] .so-tabs__label {
    color: var(--so-violet-700);
    font-weight: 600;
  }

  .so-tabs__item--active[data-accent="teal"] .so-tabs__icon-ring {
    background: #ccfbf1;
    box-shadow: 0 0 0 4px #f0fdfa, 0 4px 12px rgba(20, 184, 166, 0.25);
  }

  .so-tabs__item--active[data-accent="teal"] .so-tabs__icon {
    color: #0d9488;
  }

  .so-tabs__item--active[data-accent="teal"] .so-tabs__label {
    color: #0f766e;
    font-weight: 600;
  }

  .so-tabs__item--active[data-accent="emerald"] .so-tabs__icon-ring {
    background: var(--so-emerald-100);
    box-shadow: 0 0 0 4px var(--so-emerald-50), 0 4px 12px rgba(16, 185, 129, 0.25);
  }

  .so-tabs__item--active[data-accent="emerald"] .so-tabs__icon {
    color: var(--so-emerald-600);
  }

  .so-tabs__item--active[data-accent="emerald"] .so-tabs__label {
    color: var(--so-emerald-700);
    font-weight: 600;
  }

  .so-tabs__item--active[data-accent="amber"] .so-tabs__icon-ring {
    background: var(--so-amber-100);
    box-shadow: 0 0 0 4px var(--so-amber-50), 0 4px 12px rgba(245, 158, 11, 0.25);
  }

  .so-tabs__item--active[data-accent="amber"] .so-tabs__icon {
    color: var(--so-amber-600);
  }

  .so-tabs__item--active[data-accent="amber"] .so-tabs__label {
    color: var(--so-amber-700);
    font-weight: 600;
  }

  .so-tabs__item--active[data-accent="slate"] .so-tabs__icon-ring {
    background: var(--so-slate-200);
    box-shadow: 0 0 0 4px var(--so-slate-100), 0 4px 12px rgba(100, 116, 139, 0.25);
  }

  .so-tabs__item--active[data-accent="slate"] .so-tabs__icon {
    color: var(--so-slate-700);
  }

  .so-tabs__item--active[data-accent="slate"] .so-tabs__label {
    color: var(--so-slate-800);
    font-weight: 600;
  }
`;
