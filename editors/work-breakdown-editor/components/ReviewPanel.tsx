import type { WorkBreakdownDocument } from "@powerhousedao/service-offering/document-models/work-breakdown";

interface Props {
  document: WorkBreakdownDocument;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function ReviewPanel({ document }: Props) {
  const state = document.state.global;

  // Calculate statistics
  const stats = {
    inputs: state.inputs.length,
    steps: state.steps.length,
    substeps: state.steps.reduce((sum, step) => sum + step.substeps.length, 0),
    prerequisites: state.prerequisites.length,
    prerequisitesMet: state.prerequisites.filter((p) => p.status === "MET")
      .length,
    tasks: state.tasks.length,
    tasksCompleted: state.tasks.filter((t) => t.status === "DONE").length,
    dependencies: state.dependencies.length,
    notes: state.notes.length,
  };

  // Readiness checks
  const checks = [
    {
      label: "Project Metadata",
      status: state.title && state.description ? "PASS" : "WARN",
      message:
        state.title && state.description
          ? "Title and description are set"
          : "Consider adding a title and description",
    },
    {
      label: "Stakeholder Inputs",
      status: stats.inputs > 0 ? "PASS" : "WARN",
      message:
        stats.inputs > 0
          ? `${stats.inputs} input(s) captured`
          : "No stakeholder inputs captured",
    },
    {
      label: "Demo Scenario",
      status: stats.steps > 0 ? "PASS" : "FAIL",
      message:
        stats.steps > 0
          ? `${stats.steps} step(s) with ${stats.substeps} substep(s)`
          : "No demo steps defined",
    },
    {
      label: "Prerequisites",
      status:
        stats.prerequisites === 0
          ? "WARN"
          : stats.prerequisitesMet === stats.prerequisites
            ? "PASS"
            : "WARN",
      message:
        stats.prerequisites === 0
          ? "No prerequisites defined"
          : `${stats.prerequisitesMet}/${stats.prerequisites} prerequisites met`,
    },
    {
      label: "Tasks",
      status: stats.tasks > 0 ? "PASS" : "WARN",
      message:
        stats.tasks > 0
          ? `${stats.tasksCompleted}/${stats.tasks} tasks completed`
          : "No tasks defined",
    },
    {
      label: "Dependencies",
      status: stats.dependencies > 0 ? "PASS" : "INFO",
      message:
        stats.dependencies > 0
          ? `${stats.dependencies} dependencies mapped`
          : "No dependencies defined (optional)",
    },
  ];

  const overallReadiness =
    checks.filter((c) => c.status === "PASS").length / checks.length;
  const readinessPercent = Math.round(overallReadiness * 100);

  const hasBlockers = checks.some((c) => c.status === "FAIL");

  return (
    <div className="wb-panel">
      <div className="wb-panel__header">
        <div>
          <h2 className="wb-panel__title">Review & Validation</h2>
          <p className="wb-panel__subtitle">
            Verify completeness before marking the breakdown as complete
          </p>
        </div>
      </div>

      {/* Overall readiness score */}
      <div
        className="wb-card"
        style={{
          marginBottom: 24,
          background: hasBlockers
            ? "var(--wb-rose-50)"
            : readinessPercent >= 80
              ? "var(--wb-emerald-50)"
              : "var(--wb-amber-50)",
        }}
      >
        <div className="wb-card__body" style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: hasBlockers
                ? "var(--wb-rose-600)"
                : readinessPercent >= 80
                  ? "var(--wb-emerald-600)"
                  : "var(--wb-amber-600)",
            }}
          >
            {readinessPercent}%
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            {hasBlockers
              ? "Blockers Present"
              : readinessPercent >= 80
                ? "Ready for Completion"
                : "Needs Attention"}
          </div>
        </div>
      </div>

      {/* Readiness checks */}
      <div style={{ marginBottom: 24 }}>
        <h3
          className="wb-panel__title"
          style={{ fontSize: 14, marginBottom: 12 }}
        >
          Readiness Checks
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {checks.map((check, i) => (
            <div key={i} className="wb-card">
              <div className="wb-card__header">
                <h4 className="wb-card__title">{check.label}</h4>
                <span
                  className={`wb-status wb-status--${check.status.toLowerCase()}`}
                  style={{
                    background:
                      check.status === "PASS"
                        ? "var(--wb-emerald-100)"
                        : check.status === "FAIL"
                          ? "var(--wb-rose-100)"
                          : check.status === "WARN"
                            ? "var(--wb-amber-100)"
                            : "var(--wb-sky-100)",
                    color:
                      check.status === "PASS"
                        ? "var(--wb-emerald-700)"
                        : check.status === "FAIL"
                          ? "var(--wb-rose-700)"
                          : check.status === "WARN"
                            ? "var(--wb-amber-700)"
                            : "var(--wb-sky-700)",
                  }}
                >
                  {check.status}
                </span>
              </div>
              <div className="wb-card__body">
                <p style={{ margin: 0, fontSize: 13 }}>{check.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary statistics */}
      <div style={{ marginBottom: 24 }}>
        <h3
          className="wb-panel__title"
          style={{ fontSize: 14, marginBottom: 12 }}
        >
          Summary Statistics
        </h3>
        <div className="wb-grid-4">
          <div className="wb-stat">
            <div className="wb-stat__value">{stats.inputs}</div>
            <div className="wb-stat__label">Inputs</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{stats.steps}</div>
            <div className="wb-stat__label">Steps</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{stats.substeps}</div>
            <div className="wb-stat__label">Substeps</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">
              {stats.prerequisitesMet}/{stats.prerequisites}
            </div>
            <div className="wb-stat__label">Prerequisites</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">
              {stats.tasksCompleted}/{stats.tasks}
            </div>
            <div className="wb-stat__label">Tasks</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{stats.dependencies}</div>
            <div className="wb-stat__label">Dependencies</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">{stats.notes}</div>
            <div className="wb-stat__label">Notes</div>
          </div>
          <div className="wb-stat">
            <div className="wb-stat__value">
              {state.phase ? formatLabel(state.phase) : "—"}
            </div>
            <div className="wb-stat__label">Phase</div>
          </div>
        </div>
      </div>

      {/* Template info */}
      {state.appliedTemplateId ? (
        <div style={{ marginBottom: 24 }}>
          <h3
            className="wb-panel__title"
            style={{ fontSize: 14, marginBottom: 12 }}
          >
            Template Applied
          </h3>
          <div className="wb-card">
            <div className="wb-card__body">
              <p style={{ margin: 0, fontSize: 13 }}>
                Template ID:{" "}
                <span className="wb-mono">{state.appliedTemplateId}</span>
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                Mode:{" "}
                <span
                  className={`wb-status wb-status--${state.templateMode?.toLowerCase()}`}
                >
                  {state.templateMode
                    ? formatLabel(state.templateMode)
                    : "NONE"}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action recommendations */}
      <div>
        <h3
          className="wb-panel__title"
          style={{ fontSize: 14, marginBottom: 12 }}
        >
          Next Steps
        </h3>
        <div className="wb-card">
          <div className="wb-card__body">
            {hasBlockers ? (
              <>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                  ❌ Cannot complete — blockers present
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13 }}>
                  Address the FAIL items above before marking this breakdown as
                  complete.
                </p>
              </>
            ) : readinessPercent >= 80 ? (
              <>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                  ✅ Ready to complete
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13 }}>
                  This breakdown meets the minimum requirements. Review the
                  checks above and finalize the review when ready.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                  ⚠️ Review warnings
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 13 }}>
                  Address the WARN items above to improve completeness. While
                  not blocking, these areas may need attention.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
