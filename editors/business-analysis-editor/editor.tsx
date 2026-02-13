import { useState, lazy, Suspense, useEffect, useRef, useMemo } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedBusinessAnalysisDocument } from "../../document-models/business-analysis/hooks.js";
import { DashboardOverview } from "./components/DashboardOverview.js";
import type { BusinessAnalysisState } from "../../document-models/business-analysis/gen/schema/types.js";

/* Lazy-load all non-default tab components (bundle-dynamic-imports) */
const RequirementsBoard = lazy(() =>
  import("./components/RequirementsBoard.js").then((m) => ({
    default: m.RequirementsBoard,
  })),
);
const StakeholderPanel = lazy(() =>
  import("./components/StakeholderPanel.js").then((m) => ({
    default: m.StakeholderPanel,
  })),
);
const RiskRegister = lazy(() =>
  import("./components/RiskRegister.js").then((m) => ({
    default: m.RiskRegister,
  })),
);
const DecisionLog = lazy(() =>
  import("./components/DecisionLog.js").then((m) => ({
    default: m.DecisionLog,
  })),
);
const DeliverablesTracker = lazy(() =>
  import("./components/DeliverablesTracker.js").then((m) => ({
    default: m.DeliverablesTracker,
  })),
);
const ProcessesPanel = lazy(() =>
  import("./components/ProcessesPanel.js").then((m) => ({
    default: m.ProcessesPanel,
  })),
);
const AnalysesPanel = lazy(() =>
  import("./components/AnalysesPanel.js").then((m) => ({
    default: m.AnalysesPanel,
  })),
);
const KpiDashboard = lazy(() =>
  import("./components/KpiDashboard.js").then((m) => ({
    default: m.KpiDashboard,
  })),
);
const ChangeRequestsPanel = lazy(() =>
  import("./components/ChangeRequestsPanel.js").then((m) => ({
    default: m.ChangeRequestsPanel,
  })),
);
const ScopeAssumptions = lazy(() =>
  import("./components/ScopeAssumptions.js").then((m) => ({
    default: m.ScopeAssumptions,
  })),
);
const GlossaryPanel = lazy(() =>
  import("./components/GlossaryPanel.js").then((m) => ({
    default: m.GlossaryPanel,
  })),
);
const TraceabilityMatrix = lazy(() =>
  import("./components/TraceabilityMatrix.js").then((m) => ({
    default: m.TraceabilityMatrix,
  })),
);
const FeedbackInbox = lazy(() =>
  import("./components/FeedbackInbox.js").then((m) => ({
    default: m.FeedbackInbox,
  })),
);

type ViewMode = "analyst" | "stakeholder";

type TabId =
  | "overview"
  | "requirements"
  | "stakeholders"
  | "risks"
  | "decisions"
  | "deliverables"
  | "processes"
  | "analyses"
  | "kpis"
  | "changes"
  | "scope"
  | "glossary"
  | "traceability"
  | "feedback";

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
}

interface TabGroup {
  label: string;
  tabs: TabDef[];
}

const ALL_TABS: TabDef[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "requirements",
    label: "Requirements",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    id: "stakeholders",
    label: "Stakeholders",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "processes",
    label: "Processes",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    id: "risks",
    label: "Risks",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  {
    id: "decisions",
    label: "Decisions",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "deliverables",
    label: "Deliverables",
    icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    id: "analyses",
    label: "Analyses",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    id: "kpis",
    label: "KPIs",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    id: "changes",
    label: "Changes",
    icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  },
  {
    id: "scope",
    label: "Scope",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    id: "glossary",
    label: "Glossary",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    id: "traceability",
    label: "Traceability",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
];

const TAB_MAP = new Map(ALL_TABS.map((t) => [t.id, t]));

/** Grouped tab layout for analyst mode (Hick's Law — reduce cognitive load) */
const TAB_GROUPS: TabGroup[] = [
  {
    label: "Core",
    tabs: ["overview", "requirements", "stakeholders"].map(
      (id) => TAB_MAP.get(id as TabId)!,
    ),
  },
  {
    label: "Governance",
    tabs: ["risks", "decisions", "changes", "scope"].map(
      (id) => TAB_MAP.get(id as TabId)!,
    ),
  },
  {
    label: "Execution",
    tabs: ["deliverables", "processes", "kpis"].map(
      (id) => TAB_MAP.get(id as TabId)!,
    ),
  },
  {
    label: "Quality",
    tabs: ["analyses", "traceability", "glossary", "feedback"].map(
      (id) => TAB_MAP.get(id as TabId)!,
    ),
  },
];

/** Stakeholder mode shows a focused subset (reduces 14 tabs to 5) */
const STAKEHOLDER_TABS: TabId[] = [
  "overview",
  "requirements",
  "deliverables",
  "kpis",
  "feedback",
];

/**
 * Returns actionable item count for tab badges (Zeigarnik Effect).
 * Shows items needing attention rather than raw totals.
 */
function getActionableCount(
  tabId: TabId,
  state: BusinessAnalysisState,
): number {
  switch (tabId) {
    case "requirements":
      return state.requirements.filter((r) => r.status === "DRAFT").length;
    case "risks":
      return state.risks.filter(
        (r) => r.status !== "RESOLVED" && r.status !== "ACCEPTED",
      ).length;
    case "decisions":
      return state.decisions.filter(
        (d) => d.status === "PROPOSED" || d.status === "UNDER_DISCUSSION",
      ).length;
    case "deliverables":
      return state.deliverables.filter(
        (d) => d.status !== "DELIVERED" && d.status !== "APPROVED",
      ).length;
    case "changes":
      return state.changeRequests.filter(
        (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW",
      ).length;
    case "kpis":
      return state.kpis.filter(
        (k) => k.status === "AT_RISK" || k.status === "OFF_TRACK",
      ).length;
    case "feedback":
      return state.feedback.filter((f) => f.status === "PENDING").length;
    case "scope":
      return state.assumptions.filter((a) => !a.status || a.status === "ACTIVE")
        .length;
    default:
      return 0;
  }
}

/** Suspense loading fallback */
const TabLoading = (
  <div className="ba-panel-empty">
    <div className="ba-loading-spinner" />
    <p className="ba-panel-empty__text">Loading...</p>
  </div>
);

export default function Editor() {
  const [document, dispatch] = useSelectedBusinessAnalysisDocument();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [viewMode, setViewMode] = useState<ViewMode>("analyst");
  const navRef = useRef<HTMLElement>(null);
  const [navOverflow, setNavOverflow] = useState<
    "left" | "right" | "both" | "none"
  >("none");

  // Detect nav scroll overflow for scroll indicators
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const checkOverflow = () => {
      const { scrollLeft, scrollWidth, clientWidth } = nav;
      const hasLeft = scrollLeft > 4;
      const hasRight = scrollLeft + clientWidth < scrollWidth - 4;
      if (hasLeft && hasRight) setNavOverflow("both");
      else if (hasLeft) setNavOverflow("left");
      else if (hasRight) setNavOverflow("right");
      else setNavOverflow("none");
    };
    checkOverflow();
    nav.addEventListener("scroll", checkOverflow, { passive: true });
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(nav);
    return () => {
      nav.removeEventListener("scroll", checkOverflow);
      ro.disconnect();
    };
  }, [viewMode]);

  // Preload component on tab hover (bundle-preload — perceived speed)
  const preloadTab = (tabId: TabId) => {
    switch (tabId) {
      case "requirements":
        import("./components/RequirementsBoard.js");
        break;
      case "stakeholders":
        import("./components/StakeholderPanel.js");
        break;
      case "risks":
        import("./components/RiskRegister.js");
        break;
      case "decisions":
        import("./components/DecisionLog.js");
        break;
      case "deliverables":
        import("./components/DeliverablesTracker.js");
        break;
      case "processes":
        import("./components/ProcessesPanel.js");
        break;
      case "analyses":
        import("./components/AnalysesPanel.js");
        break;
      case "kpis":
        import("./components/KpiDashboard.js");
        break;
      case "changes":
        import("./components/ChangeRequestsPanel.js");
        break;
      case "scope":
        import("./components/ScopeAssumptions.js");
        break;
      case "glossary":
        import("./components/GlossaryPanel.js");
        break;
      case "traceability":
        import("./components/TraceabilityMatrix.js");
        break;
      case "feedback":
        import("./components/FeedbackInbox.js");
        break;
    }
  };

  // When switching to stakeholder mode, reset to valid tab if current is not visible
  useEffect(() => {
    if (viewMode === "stakeholder" && !STAKEHOLDER_TABS.includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [viewMode, activeTab]);

  if (!document) {
    return (
      <div className="ba-editor">
        {StyleTag}
        <div className="ba-empty">
          <svg
            className="ba-empty__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="ba-empty__title">No analysis selected</h2>
          <p className="ba-empty__sub">
            Select a business analysis document to begin
          </p>
        </div>
      </div>
    );
  }

  const state = document.state.global;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview document={document} dispatch={dispatch} />;
      case "requirements":
        return <RequirementsBoard document={document} dispatch={dispatch} />;
      case "stakeholders":
        return <StakeholderPanel document={document} dispatch={dispatch} />;
      case "processes":
        return <ProcessesPanel document={document} dispatch={dispatch} />;
      case "risks":
        return <RiskRegister document={document} dispatch={dispatch} />;
      case "decisions":
        return <DecisionLog document={document} dispatch={dispatch} />;
      case "deliverables":
        return <DeliverablesTracker document={document} dispatch={dispatch} />;
      case "analyses":
        return <AnalysesPanel document={document} dispatch={dispatch} />;
      case "kpis":
        return <KpiDashboard document={document} dispatch={dispatch} />;
      case "changes":
        return <ChangeRequestsPanel document={document} dispatch={dispatch} />;
      case "scope":
        return <ScopeAssumptions document={document} dispatch={dispatch} />;
      case "glossary":
        return <GlossaryPanel document={document} dispatch={dispatch} />;
      case "traceability":
        return <TraceabilityMatrix document={document} />;
      case "feedback":
        return (
          <FeedbackInbox
            document={document}
            dispatch={dispatch}
            viewMode={viewMode}
          />
        );
      default:
        return null;
    }
  };

  /** Render a single tab button */
  const renderTab = (tab: TabDef) => {
    const count = getActionableCount(tab.id, state);
    const isAttention = count > 0;
    return (
      <button
        key={tab.id}
        className={`ba-nav__tab ${activeTab === tab.id ? "ba-nav__tab--active" : ""}`}
        onClick={() => setActiveTab(tab.id)}
        onMouseEnter={() => preloadTab(tab.id)}
        type="button"
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`ba-tabpanel-${tab.id}`}
        id={`ba-tab-${tab.id}`}
      >
        <svg
          className="ba-nav__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
        </svg>
        <span>{tab.label}</span>
        {isAttention ? (
          <span className="ba-nav__count ba-nav__count--attention">
            {count}
          </span>
        ) : null}
      </button>
    );
  };

  /** Compute visible tab groups or flat list based on view mode */
  const visibleGroups = useMemo(() => {
    if (viewMode === "stakeholder") {
      const stakeholderTabs = STAKEHOLDER_TABS.map((id) => TAB_MAP.get(id)!);
      return [{ label: "", tabs: stakeholderTabs }];
    }
    return TAB_GROUPS;
  }, [viewMode]);

  const navClasses = [
    "ba-nav",
    navOverflow === "right" || navOverflow === "both"
      ? "ba-nav--fade-right"
      : "",
    navOverflow === "left" || navOverflow === "both" ? "ba-nav--fade-left" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ba-editor">
      {StyleTag}
      <DocumentToolbar />

      <div className="ba-editor__container">
        {/* Project Header */}
        <header className="ba-header">
          <div className="ba-header__top">
            <div className="ba-header__info">
              <h1 className="ba-header__title">
                {state.projectName || "Untitled Analysis"}
              </h1>
              {state.organization ? (
                <span className="ba-header__org">{state.organization}</span>
              ) : null}
            </div>
            <div className="ba-header__badges">
              {state.projectPhase ? (
                <span
                  className={`ba-badge ba-badge--phase-${state.projectPhase.toLowerCase()}`}
                >
                  {state.projectPhase.replace(/_/g, " ")}
                </span>
              ) : null}
              {state.projectStatus ? (
                <span
                  className={`ba-badge ba-badge--status ba-badge--status-${state.projectStatus.toLowerCase()}`}
                >
                  {state.projectStatus.replace(/_/g, " ")}
                </span>
              ) : null}
              <div
                className="ba-view-toggle"
                role="radiogroup"
                aria-label="View mode"
              >
                <button
                  className={`ba-view-toggle__btn ${viewMode === "analyst" ? "ba-view-toggle__btn--active" : ""}`}
                  onClick={() => setViewMode("analyst")}
                  role="radio"
                  aria-checked={viewMode === "analyst"}
                  type="button"
                >
                  Analyst
                </button>
                <button
                  className={`ba-view-toggle__btn ${viewMode === "stakeholder" ? "ba-view-toggle__btn--active" : ""}`}
                  onClick={() => setViewMode("stakeholder")}
                  role="radio"
                  aria-checked={viewMode === "stakeholder"}
                  type="button"
                >
                  Stakeholder
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation — grouped with separators */}
        <nav
          className={navClasses}
          role="tablist"
          aria-label="Analysis sections"
          ref={navRef}
        >
          {visibleGroups.map((group, gi) => (
            <div key={group.label || gi} className="ba-nav__group">
              {group.label ? (
                <span className="ba-nav__group-label">{group.label}</span>
              ) : null}
              {group.tabs.map((tab) => renderTab(tab))}
            </div>
          ))}
        </nav>

        {/* Tab Content */}
        <div
          className="ba-content"
          role="tabpanel"
          id={`ba-tabpanel-${activeTab}`}
          aria-labelledby={`ba-tab-${activeTab}`}
        >
          <Suspense fallback={TabLoading}>{renderContent()}</Suspense>
        </div>
      </div>
    </div>
  );
}

const editorStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .ba-editor {
    --ba-font: 'Space Grotesk', system-ui, sans-serif;
    --ba-mono: 'JetBrains Mono', 'SF Mono', monospace;

    --ba-bg: #f7f6f3;
    --ba-surface: #ffffff;
    --ba-surface-alt: #faf9f7;
    --ba-border: #e8e6e1;
    --ba-border-strong: #d4d1cb;

    --ba-text: #2d3142;
    --ba-text-secondary: #6b7280;
    --ba-text-muted: #9ca3af;

    --ba-teal-50: #f0fdfa;
    --ba-teal-100: #ccfbf1;
    --ba-teal-200: #99f6e4;
    --ba-teal-500: #14b8a6;
    --ba-teal-600: #0d9488;
    --ba-teal-700: #0f766e;
    --ba-teal-800: #115e59;

    --ba-amber-50: #fffbeb;
    --ba-amber-100: #fef3c7;
    --ba-amber-500: #f59e0b;
    --ba-amber-600: #d97706;
    --ba-amber-700: #b45309;

    --ba-rose-50: #fff1f2;
    --ba-rose-100: #ffe4e6;
    --ba-rose-500: #f43f5e;
    --ba-rose-600: #e11d48;
    --ba-rose-700: #be123c;

    --ba-emerald-50: #ecfdf5;
    --ba-emerald-100: #d1fae5;
    --ba-emerald-500: #10b981;
    --ba-emerald-600: #059669;
    --ba-emerald-700: #047857;

    --ba-indigo-50: #eef2ff;
    --ba-indigo-100: #e0e7ff;
    --ba-indigo-500: #6366f1;
    --ba-indigo-600: #4f46e5;
    --ba-indigo-700: #4338ca;

    --ba-slate-50: #f8fafc;
    --ba-slate-100: #f1f5f9;
    --ba-slate-200: #e2e8f0;
    --ba-slate-300: #cbd5e1;
    --ba-slate-400: #94a3b8;
    --ba-slate-500: #64748b;
    --ba-slate-600: #475569;
    --ba-slate-700: #334155;
    --ba-slate-800: #1e293b;

    --ba-radius-sm: 6px;
    --ba-radius-md: 10px;
    --ba-radius-lg: 14px;

    --ba-shadow-sm: 0 1px 2px rgba(45, 49, 66, 0.04);
    --ba-shadow-md: 0 4px 12px rgba(45, 49, 66, 0.06), 0 1px 3px rgba(45, 49, 66, 0.04);
    --ba-shadow-lg: 0 10px 30px rgba(45, 49, 66, 0.08), 0 2px 8px rgba(45, 49, 66, 0.04);

    --ba-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);

    font-family: var(--ba-font);
    background: var(--ba-bg);
    color: var(--ba-text);
    min-height: 100%;
    overflow-y: auto;
    -webkit-font-smoothing: antialiased;
  }

  .ba-editor *, .ba-editor *::before, .ba-editor *::after {
    box-sizing: border-box;
  }

  .ba-editor__container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 20px 32px 48px;
  }

  /* Empty State */
  .ba-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
  }

  .ba-empty__icon {
    width: 64px;
    height: 64px;
    color: var(--ba-slate-300);
    margin-bottom: 16px;
  }

  .ba-empty__title {
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--ba-slate-700);
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .ba-empty__sub {
    font-size: 0.9375rem;
    color: var(--ba-text-muted);
    margin: 0;
  }

  /* Header */
  .ba-header {
    margin-bottom: 4px;
  }

  .ba-header__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .ba-header__info {
    display: flex;
    align-items: baseline;
    gap: 16px;
    flex-wrap: wrap;
  }

  .ba-header__title {
    font-size: 1.625rem;
    font-weight: 700;
    color: var(--ba-text);
    margin: 0;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  .ba-header__org {
    font-size: 0.875rem;
    color: var(--ba-text-secondary);
    font-weight: 500;
  }

  .ba-header__badges {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    align-items: center;
  }

  /* Badges */
  .ba-badge {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-radius: 100px;
    white-space: nowrap;
  }

  .ba-badge--phase-discovery { background: var(--ba-indigo-100); color: var(--ba-indigo-700); }
  .ba-badge--phase-elicitation { background: var(--ba-teal-100); color: var(--ba-teal-700); }
  .ba-badge--phase-analysis { background: var(--ba-amber-100); color: var(--ba-amber-700); }
  .ba-badge--phase-design { background: var(--ba-indigo-100); color: var(--ba-indigo-700); }
  .ba-badge--phase-validation { background: var(--ba-emerald-100); color: var(--ba-emerald-700); }
  .ba-badge--phase-implementation { background: var(--ba-teal-100); color: var(--ba-teal-800); }
  .ba-badge--phase-closed { background: var(--ba-slate-200); color: var(--ba-slate-600); }

  .ba-badge--status { border: 1px solid transparent; }
  .ba-badge--status-not_started { background: var(--ba-slate-100); color: var(--ba-slate-600); }
  .ba-badge--status-in_progress { background: var(--ba-teal-50); color: var(--ba-teal-700); border-color: var(--ba-teal-200); }
  .ba-badge--status-on_hold { background: var(--ba-amber-50); color: var(--ba-amber-700); border-color: var(--ba-amber-100); }
  .ba-badge--status-completed { background: var(--ba-emerald-50); color: var(--ba-emerald-700); border-color: var(--ba-emerald-100); }
  .ba-badge--status-cancelled { background: var(--ba-rose-50); color: var(--ba-rose-700); border-color: var(--ba-rose-100); }

  /* Nav Tabs — grouped with scroll indicators */
  .ba-nav {
    display: flex;
    gap: 2px;
    padding: 4px;
    background: var(--ba-surface);
    border-radius: var(--ba-radius-lg);
    box-shadow: var(--ba-shadow-sm);
    border: 1px solid var(--ba-border);
    margin-bottom: 24px;
    overflow-x: auto;
    scrollbar-width: none;
    position: relative;
  }

  .ba-nav::-webkit-scrollbar { display: none; }

  /* Scroll fade indicators */
  .ba-nav--fade-right {
    mask-image: linear-gradient(to right, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
  }

  .ba-nav--fade-left {
    mask-image: linear-gradient(to left, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to left, black 85%, transparent 100%);
  }

  .ba-nav--fade-right.ba-nav--fade-left {
    mask-image: linear-gradient(to right, transparent 0%, black 10%, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 85%, transparent 100%);
  }

  /* Tab groups */
  .ba-nav__group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .ba-nav__group + .ba-nav__group {
    margin-left: 4px;
    padding-left: 8px;
    border-left: 1px solid var(--ba-border);
  }

  .ba-nav__group-label {
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ba-text-muted);
    padding: 0 6px;
    white-space: nowrap;
    user-select: none;
  }

  .ba-nav__tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-family: var(--ba-font);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--ba-text-secondary);
    background: transparent;
    border: none;
    border-radius: var(--ba-radius-md);
    cursor: pointer;
    transition: all var(--ba-transition);
    white-space: nowrap;
    min-height: 44px;
  }

  .ba-nav__tab:hover {
    color: var(--ba-text);
    background: var(--ba-surface-alt);
  }

  .ba-nav__tab--active {
    color: var(--ba-teal-700);
    background: var(--ba-teal-50);
    font-weight: 600;
  }

  .ba-nav__tab--active:hover {
    color: var(--ba-teal-700);
    background: var(--ba-teal-50);
  }

  .ba-nav__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .ba-nav__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: 0.6875rem;
    font-weight: 600;
    background: var(--ba-slate-100);
    color: var(--ba-slate-600);
    border-radius: 10px;
  }

  .ba-nav__count--attention {
    background: var(--ba-rose-100);
    color: var(--ba-rose-700);
  }

  /* Content */
  .ba-content {
    animation: ba-fade-in 200ms ease-out;
  }

  @keyframes ba-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Respect motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .ba-content { animation: none; }
    .ba-nav__tab { transition: none; }
    .ba-kanban__card { transition: none; }
    .ba-input { transition: none; }
    .ba-btn { transition: none; }
    .ba-view-toggle__btn { transition: none; }
    .ba-inline-edit__btn { transition: none; }
  }

  /* Loading spinner for Suspense */
  .ba-loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ba-border);
    border-top-color: var(--ba-teal-500);
    border-radius: 50%;
    animation: ba-spin 600ms linear infinite;
    margin-bottom: 12px;
  }

  @keyframes ba-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ba-loading-spinner { animation: none; border-top-color: var(--ba-teal-500); opacity: 0.5; }
  }

  /* Shared Card */
  .ba-card {
    background: var(--ba-surface);
    border-radius: var(--ba-radius-lg);
    border: 1px solid var(--ba-border);
    box-shadow: var(--ba-shadow-sm);
  }

  .ba-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--ba-border);
  }

  .ba-card__title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--ba-text);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .ba-card__body {
    padding: 20px 24px;
  }

  /* Buttons */
  .ba-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    font-family: var(--ba-font);
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: var(--ba-radius-md);
    border: none;
    cursor: pointer;
    transition: all var(--ba-transition);
    min-height: 36px;
  }

  .ba-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ba-btn--primary {
    background: var(--ba-teal-600);
    color: white;
  }

  .ba-btn--primary:hover:not(:disabled) {
    background: var(--ba-teal-700);
  }

  .ba-btn--secondary {
    background: var(--ba-slate-100);
    color: var(--ba-slate-700);
  }

  .ba-btn--secondary:hover:not(:disabled) {
    background: var(--ba-slate-200);
  }

  .ba-btn--ghost {
    background: transparent;
    color: var(--ba-text-secondary);
    padding: 6px 10px;
  }

  .ba-btn--ghost:hover:not(:disabled) {
    background: var(--ba-slate-100);
    color: var(--ba-text);
  }

  .ba-btn--danger {
    background: var(--ba-rose-50);
    color: var(--ba-rose-600);
  }

  .ba-btn--danger:hover:not(:disabled) {
    background: var(--ba-rose-100);
  }

  .ba-btn--sm {
    padding: 6px 12px;
    font-size: 0.75rem;
    min-height: 32px;
  }

  .ba-btn__icon {
    width: 16px;
    height: 16px;
  }

  /* Inputs */
  .ba-input {
    width: 100%;
    padding: 10px 14px;
    font-family: var(--ba-font);
    font-size: 0.875rem;
    color: var(--ba-text);
    background: var(--ba-surface);
    border: 1.5px solid var(--ba-border);
    border-radius: var(--ba-radius-md);
    transition: border-color var(--ba-transition), box-shadow var(--ba-transition);
  }

  .ba-input:hover {
    border-color: var(--ba-border-strong);
  }

  .ba-input:focus {
    outline: none;
    border-color: var(--ba-teal-500);
    box-shadow: 0 0 0 3px var(--ba-teal-50);
  }

  .ba-input::placeholder {
    color: var(--ba-text-muted);
  }

  .ba-input--sm {
    padding: 6px 10px;
    font-size: 0.8125rem;
  }

  .ba-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .ba-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    padding-right: 32px;
    cursor: pointer;
  }

  .ba-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ba-text-secondary);
    margin-bottom: 6px;
  }

  .ba-form-group {
    margin-bottom: 16px;
  }

  .ba-form-group:last-child {
    margin-bottom: 0;
  }

  .ba-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* Modal — with dialog role support */
  .ba-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(45, 49, 66, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    backdrop-filter: blur(2px);
  }

  .ba-modal {
    background: var(--ba-surface);
    border-radius: var(--ba-radius-lg);
    box-shadow: var(--ba-shadow-lg);
    max-width: 520px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
  }

  .ba-modal__header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--ba-border);
  }

  .ba-modal__title {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--ba-text);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .ba-modal__body {
    padding: 20px 24px;
  }

  .ba-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid var(--ba-border);
    background: var(--ba-surface-alt);
    border-radius: 0 0 var(--ba-radius-lg) var(--ba-radius-lg);
  }

  /* Status badges */
  .ba-status {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 100px;
  }

  .ba-status--draft { background: var(--ba-slate-100); color: var(--ba-slate-600); }
  .ba-status--under_review { background: var(--ba-amber-100); color: var(--ba-amber-700); }
  .ba-status--approved { background: var(--ba-emerald-100); color: var(--ba-emerald-700); }
  .ba-status--implemented { background: var(--ba-teal-100); color: var(--ba-teal-700); }
  .ba-status--verified { background: var(--ba-indigo-100); color: var(--ba-indigo-700); }
  .ba-status--rejected { background: var(--ba-rose-100); color: var(--ba-rose-700); }
  .ba-status--deferred { background: var(--ba-slate-200); color: var(--ba-slate-600); }

  .ba-status--identified { background: var(--ba-amber-100); color: var(--ba-amber-700); }
  .ba-status--mitigating { background: var(--ba-teal-100); color: var(--ba-teal-700); }
  .ba-status--resolved { background: var(--ba-emerald-100); color: var(--ba-emerald-700); }
  .ba-status--accepted { background: var(--ba-slate-100); color: var(--ba-slate-600); }
  .ba-status--escalated { background: var(--ba-rose-100); color: var(--ba-rose-700); }

  .ba-status--proposed { background: var(--ba-indigo-100); color: var(--ba-indigo-700); }
  .ba-status--under_discussion { background: var(--ba-amber-100); color: var(--ba-amber-700); }
  .ba-status--decided { background: var(--ba-emerald-100); color: var(--ba-emerald-700); }
  .ba-status--reversed { background: var(--ba-rose-100); color: var(--ba-rose-700); }

  .ba-status--not_started { background: var(--ba-slate-100); color: var(--ba-slate-600); }
  .ba-status--in_progress { background: var(--ba-teal-100); color: var(--ba-teal-700); }
  .ba-status--delivered { background: var(--ba-emerald-100); color: var(--ba-emerald-700); }

  .ba-status--submitted { background: var(--ba-indigo-100); color: var(--ba-indigo-700); }

  /* Priority badges */
  .ba-priority {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-radius: 4px;
  }

  .ba-priority--must_have { background: var(--ba-rose-100); color: var(--ba-rose-700); }
  .ba-priority--should_have { background: var(--ba-amber-100); color: var(--ba-amber-700); }
  .ba-priority--could_have { background: var(--ba-teal-100); color: var(--ba-teal-700); }
  .ba-priority--wont_have { background: var(--ba-slate-100); color: var(--ba-slate-600); }

  /* Risk level */
  .ba-risk-level {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-radius: 4px;
  }

  .ba-risk-level--critical { background: var(--ba-rose-100); color: var(--ba-rose-700); }
  .ba-risk-level--high { background: var(--ba-amber-100); color: var(--ba-amber-700); }
  .ba-risk-level--medium { background: #fef9c3; color: #a16207; }
  .ba-risk-level--low { background: var(--ba-emerald-100); color: var(--ba-emerald-700); }

  /* Type badges */
  .ba-type-badge {
    display: inline-flex;
    padding: 2px 8px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 4px;
    font-family: var(--ba-mono);
  }

  .ba-type-badge--functional { background: var(--ba-teal-100); color: var(--ba-teal-700); }
  .ba-type-badge--non_functional { background: var(--ba-indigo-100); color: var(--ba-indigo-700); }
  .ba-type-badge--user_story { background: #fce7f3; color: #9d174d; }
  .ba-type-badge--business_rule { background: var(--ba-amber-100); color: var(--ba-amber-700); }
  .ba-type-badge--constraint { background: var(--ba-slate-200); color: var(--ba-slate-700); }

  /* Stat cards — compact (pushes content above fold) */
  .ba-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .ba-stat {
    background: var(--ba-surface);
    border: 1px solid var(--ba-border);
    border-radius: var(--ba-radius-md);
    padding: 12px 16px;
  }

  .ba-stat__value {
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--ba-text);
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 2px;
  }

  .ba-stat__label {
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--ba-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ba-stat--teal .ba-stat__value { color: var(--ba-teal-600); }
  .ba-stat--amber .ba-stat__value { color: var(--ba-amber-600); }
  .ba-stat--rose .ba-stat__value { color: var(--ba-rose-600); }
  .ba-stat--emerald .ba-stat__value { color: var(--ba-emerald-600); }
  .ba-stat--indigo .ba-stat__value { color: var(--ba-indigo-600); }

  /* Table */
  .ba-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
  }

  .ba-table th {
    text-align: left;
    padding: 10px 16px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ba-text-secondary);
    background: var(--ba-surface-alt);
    border-bottom: 1px solid var(--ba-border);
  }

  .ba-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--ba-border);
    color: var(--ba-text);
    vertical-align: top;
  }

  .ba-table tr:last-child td {
    border-bottom: none;
  }

  .ba-table tr:hover td {
    background: var(--ba-surface-alt);
  }

  .ba-table__title {
    font-weight: 600;
    color: var(--ba-text);
  }

  .ba-table__sub {
    font-size: 0.75rem;
    color: var(--ba-text-secondary);
    margin-top: 2px;
  }

  .ba-table__actions {
    display: flex;
    gap: 4px;
  }

  /* Empty state within panels */
  .ba-panel-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 24px;
    text-align: center;
  }

  .ba-panel-empty__icon {
    width: 48px;
    height: 48px;
    color: var(--ba-slate-300);
    margin-bottom: 12px;
  }

  .ba-panel-empty__text {
    font-size: 0.875rem;
    color: var(--ba-text-secondary);
    margin: 0 0 16px;
  }

  /* Grid layout helpers */
  .ba-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (max-width: 768px) {
    .ba-grid-2 {
      grid-template-columns: 1fr;
    }

    .ba-form-row {
      grid-template-columns: 1fr;
    }

    .ba-nav {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  /* Mono text helper */
  .ba-mono {
    font-family: var(--ba-mono);
    font-size: 0.8125rem;
  }

  /* Tag/chip */
  .ba-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 0.6875rem;
    font-weight: 500;
    background: var(--ba-slate-100);
    color: var(--ba-slate-600);
    border-radius: 4px;
  }

  .ba-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  /* Section */
  .ba-section {
    margin-bottom: 24px;
  }

  .ba-section:last-child {
    margin-bottom: 0;
  }

  .ba-section__title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ba-text-secondary);
    margin: 0 0 12px;
  }

  /* Inline edit — improved touch target */
  .ba-inline-edit {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ba-inline-edit__value {
    flex: 1;
    min-width: 0;
  }

  .ba-inline-edit__btn {
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--ba-text-muted);
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--ba-transition);
  }

  .ba-inline-edit__btn:hover {
    color: var(--ba-teal-600);
    background: var(--ba-teal-50);
  }

  .ba-inline-edit__btn svg {
    width: 14px;
    height: 14px;
  }

  /* Kanban */
  .ba-kanban {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }

  .ba-kanban__col {
    min-width: 260px;
    max-width: 300px;
    flex: 1;
  }

  .ba-kanban__col-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--ba-surface);
    border: 1px solid var(--ba-border);
    border-radius: var(--ba-radius-md) var(--ba-radius-md) 0 0;
  }

  .ba-kanban__col-title {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ba-text-secondary);
  }

  .ba-kanban__col-count {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--ba-text-muted);
    background: var(--ba-slate-100);
    padding: 1px 7px;
    border-radius: 8px;
  }

  .ba-kanban__col-body {
    background: var(--ba-surface-alt);
    border: 1px solid var(--ba-border);
    border-top: none;
    border-radius: 0 0 var(--ba-radius-md) var(--ba-radius-md);
    padding: 8px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ba-kanban__card {
    background: var(--ba-surface);
    border: 1px solid var(--ba-border);
    border-radius: var(--ba-radius-sm);
    padding: 12px;
    cursor: pointer;
    transition: all var(--ba-transition);
  }

  .ba-kanban__card:hover {
    border-color: var(--ba-teal-200);
    box-shadow: var(--ba-shadow-md);
  }

  .ba-kanban__card-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ba-text);
    margin: 0 0 6px;
    line-height: 1.3;
  }

  .ba-kanban__card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .ba-kanban__card-code {
    font-family: var(--ba-mono);
    font-size: 0.625rem;
    color: var(--ba-text-muted);
  }

  /* Filter bar */
  .ba-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .ba-filter-select {
    padding: 6px 28px 6px 10px;
    font-family: var(--ba-font);
    font-size: 0.8125rem;
    color: var(--ba-text);
    background: var(--ba-surface);
    border: 1px solid var(--ba-border);
    border-radius: var(--ba-radius-sm);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
    background-size: 14px;
    cursor: pointer;
    min-height: 34px;
  }

  .ba-filter-select:focus {
    outline: none;
    border-color: var(--ba-teal-500);
    box-shadow: 0 0 0 2px var(--ba-teal-50);
  }

  /* View mode toggle */
  .ba-view-toggle {
    display: inline-flex;
    background: var(--ba-slate-100);
    border-radius: var(--ba-radius-md);
    padding: 2px;
    gap: 2px;
  }

  .ba-view-toggle__btn {
    padding: 5px 14px;
    font-family: var(--ba-font);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ba-text-secondary);
    background: transparent;
    border: none;
    border-radius: calc(var(--ba-radius-md) - 2px);
    cursor: pointer;
    transition: all var(--ba-transition);
    white-space: nowrap;
  }

  .ba-view-toggle__btn:hover {
    color: var(--ba-text);
  }

  .ba-view-toggle__btn--active {
    background: var(--ba-surface);
    color: var(--ba-teal-700);
    box-shadow: var(--ba-shadow-sm);
  }
`;

/** Hoisted style element (rendering-hoist-jsx — avoid recreating on every render) */
const StyleTag = <style>{editorStyles}</style>;
