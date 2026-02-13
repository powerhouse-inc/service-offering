import { useState, useMemo } from "react";
import type { BusinessAnalysisDocument } from "@powerhousedao/service-offering/document-models/business-analysis";
import type {
  Requirement,
  BusinessProcess,
  Risk,
  Decision,
  Deliverable,
  Kpi,
  RequirementType,
} from "../../../document-models/business-analysis/gen/schema/types.js";

interface Props {
  document: BusinessAnalysisDocument;
}

type ViewMode = "matrix" | "coverage";

const ENTITY_COLUMNS = [
  "Processes",
  "Risks",
  "Decisions",
  "Deliverables",
  "KPIs",
] as const;

type _EntityColumn = (typeof ENTITY_COLUMNS)[number];

const REQUIREMENT_TYPES: RequirementType[] = [
  "FUNCTIONAL",
  "NON_FUNCTIONAL",
  "BUSINESS_RULE",
  "CONSTRAINT",
  "USER_STORY",
];

interface RequirementLinks {
  Processes: number;
  Risks: number;
  Decisions: number;
  Deliverables: number;
  KPIs: number;
  total: number;
}

function buildLinkMap(
  requirements: Requirement[],
  processes: BusinessProcess[],
  risks: Risk[],
  decisions: Decision[],
  deliverables: Deliverable[],
  kpis: Kpi[],
): Map<string, RequirementLinks> {
  const map = new Map<string, RequirementLinks>();

  for (const req of requirements) {
    map.set(req.id, {
      Processes: 0,
      Risks: 0,
      Decisions: 0,
      Deliverables: 0,
      KPIs: 0,
      total: 0,
    });
  }

  // Requirements link TO processes via linkedProcessIds
  for (const req of requirements) {
    const entry = map.get(req.id);
    if (entry) {
      entry.Processes = req.linkedProcessIds.length;
    }
  }

  // Processes link BACK to requirements via linkedRequirementIds
  for (const proc of processes) {
    for (const reqId of proc.linkedRequirementIds) {
      const entry = map.get(reqId);
      if (entry && entry.Processes === 0) {
        // Only count if not already counted from the requirement side
        entry.Processes += 1;
      }
    }
  }

  // Risks reference requirements via linkedRequirementIds
  for (const risk of risks) {
    for (const reqId of risk.linkedRequirementIds) {
      const entry = map.get(reqId);
      if (entry) {
        entry.Risks += 1;
      }
    }
  }

  // Decisions reference requirements via linkedRequirementIds
  for (const decision of decisions) {
    for (const reqId of decision.linkedRequirementIds) {
      const entry = map.get(reqId);
      if (entry) {
        entry.Decisions += 1;
      }
    }
  }

  // Deliverables reference requirements via linkedRequirementIds
  for (const deliverable of deliverables) {
    for (const reqId of deliverable.linkedRequirementIds) {
      const entry = map.get(reqId);
      if (entry) {
        entry.Deliverables += 1;
      }
    }
  }

  // KPIs reference requirements via linkedRequirementIds
  for (const kpi of kpis) {
    for (const reqId of kpi.linkedRequirementIds) {
      const entry = map.get(reqId);
      if (entry) {
        entry.KPIs += 1;
      }
    }
  }

  // Compute totals
  for (const entry of map.values()) {
    entry.total =
      entry.Processes +
      entry.Risks +
      entry.Decisions +
      entry.Deliverables +
      entry.KPIs;
  }

  return map;
}

export function TraceabilityMatrix({ document }: Props) {
  const s = document.state.global;
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const linkMap = useMemo(
    () =>
      buildLinkMap(
        s.requirements,
        s.processes,
        s.risks,
        s.decisions,
        s.deliverables,
        s.kpis,
      ),
    [s.requirements, s.processes, s.risks, s.decisions, s.deliverables, s.kpis],
  );

  const filteredRequirements = useMemo(
    () =>
      typeFilter
        ? s.requirements.filter((r) => r.type === typeFilter)
        : s.requirements,
    [s.requirements, typeFilter],
  );

  const linkedCount = useMemo(() => {
    let count = 0;
    for (const req of filteredRequirements) {
      const links = linkMap.get(req.id);
      if (links && links.total > 0) {
        count += 1;
      }
    }
    return count;
  }, [filteredRequirements, linkMap]);

  const orphanRequirements = useMemo(
    () =>
      filteredRequirements.filter((req) => {
        const links = linkMap.get(req.id);
        return !links || links.total === 0;
      }),
    [filteredRequirements, linkMap],
  );

  const coveragePct =
    filteredRequirements.length > 0
      ? Math.round((linkedCount / filteredRequirements.length) * 100)
      : 0;

  const mostConnected = useMemo(
    () =>
      [...filteredRequirements]
        .map((req) => ({
          requirement: req,
          links: linkMap.get(req.id) || {
            Processes: 0,
            Risks: 0,
            Decisions: 0,
            Deliverables: 0,
            KPIs: 0,
            total: 0,
          },
        }))
        .filter((item) => item.links.total > 0)
        .sort((a, b) => b.links.total - a.links.total),
    [filteredRequirements, linkMap],
  );

  if (s.requirements.length === 0) {
    return (
      <div className="ba-panel-empty">
        <svg
          className="ba-panel-empty__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
        <p className="ba-panel-empty__text">No requirements to trace yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="ba-stats">
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{filteredRequirements.length}</div>
          <div className="ba-stat__label">Requirements</div>
        </div>
        <div className="ba-stat ba-stat--teal">
          <div className="ba-stat__value">{coveragePct}%</div>
          <div className="ba-stat__label">Coverage</div>
        </div>
        <div className="ba-stat ba-stat--amber">
          <div className="ba-stat__value">{orphanRequirements.length}</div>
          <div className="ba-stat__label">Orphaned</div>
        </div>
      </div>

      {/* Controls */}
      <div className="ba-card">
        <div className="ba-card__header">
          <h3 className="ba-card__title">Traceability Matrix</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="ba-filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {REQUIREMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 0 }}>
              <button
                className={`ba-btn ba-btn--sm ${viewMode === "matrix" ? "ba-btn--primary" : "ba-btn--secondary"}`}
                onClick={() => setViewMode("matrix")}
                type="button"
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                Matrix
              </button>
              <button
                className={`ba-btn ba-btn--sm ${viewMode === "coverage" ? "ba-btn--primary" : "ba-btn--secondary"}`}
                onClick={() => setViewMode("coverage")}
                type="button"
                style={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
              >
                Coverage
              </button>
            </div>
          </div>
        </div>
        <div className="ba-card__body" style={{ padding: 0 }}>
          {viewMode === "matrix" ? (
            <MatrixView requirements={filteredRequirements} linkMap={linkMap} />
          ) : (
            <CoverageView
              requirements={filteredRequirements}
              orphanRequirements={orphanRequirements}
              mostConnected={mostConnected}
              linkedCount={linkedCount}
              coveragePct={coveragePct}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MatrixView({
  requirements,
  linkMap,
}: {
  requirements: Requirement[];
  linkMap: Map<string, RequirementLinks>;
}) {
  if (requirements.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "var(--ba-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        No requirements match the current filter.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ba-table">
        <thead>
          <tr>
            <th>Requirement</th>
            {ENTITY_COLUMNS.map((col) => (
              <th key={col} style={{ textAlign: "center", minWidth: 90 }}>
                {col}
              </th>
            ))}
            <th style={{ textAlign: "center", minWidth: 60 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((req) => {
            const links = linkMap.get(req.id);
            return (
              <tr key={req.id}>
                <td>
                  <div className="ba-table__title">
                    {req.code ? (
                      <span
                        style={{
                          fontFamily: "var(--ba-mono)",
                          fontSize: "0.75rem",
                          color: "var(--ba-teal-600)",
                          marginRight: 6,
                        }}
                      >
                        {req.code}
                      </span>
                    ) : null}
                    {req.title}
                  </div>
                  <div className="ba-table__sub">
                    {req.type.replace(/_/g, " ")}
                  </div>
                </td>
                {ENTITY_COLUMNS.map((col) => {
                  const count = links ? links[col] : 0;
                  return (
                    <td key={col} style={{ textAlign: "center" }}>
                      {count > 0 ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "var(--ba-teal-500)",
                              flexShrink: 0,
                            }}
                          />
                          {count > 1 ? (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                fontFamily: "var(--ba-mono)",
                                color: "var(--ba-text)",
                              }}
                            >
                              {count}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--ba-slate-100)",
                          }}
                        />
                      )}
                    </td>
                  );
                })}
                <td style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      fontFamily: "var(--ba-mono)",
                      color:
                        links && links.total > 0
                          ? "var(--ba-teal-600)"
                          : "var(--ba-text-muted)",
                    }}
                  >
                    {links ? links.total : 0}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CoverageView({
  requirements,
  orphanRequirements,
  mostConnected,
  linkedCount,
  coveragePct,
}: {
  requirements: Requirement[];
  orphanRequirements: Requirement[];
  mostConnected: Array<{
    requirement: Requirement;
    links: RequirementLinks;
  }>;
  linkedCount: number;
  coveragePct: number;
}) {
  return (
    <div style={{ padding: 24 }}>
      {/* Summary stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: 16,
            background: "var(--ba-slate-50)",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              fontFamily: "var(--ba-mono)",
              color: "var(--ba-text)",
            }}
          >
            {requirements.length}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--ba-text-secondary)",
              marginTop: 2,
            }}
          >
            Total Requirements
          </div>
        </div>
        <div
          style={{
            padding: 16,
            background: "var(--ba-slate-50)",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              fontFamily: "var(--ba-mono)",
              color: "var(--ba-teal-600)",
            }}
          >
            {linkedCount}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--ba-text-secondary)",
              marginTop: 2,
            }}
          >
            Linked Requirements
          </div>
        </div>
        <div
          style={{
            padding: 16,
            background: "var(--ba-slate-50)",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              fontFamily: "var(--ba-mono)",
              color:
                orphanRequirements.length > 0
                  ? "var(--ba-amber-500)"
                  : "var(--ba-emerald-500)",
            }}
          >
            {orphanRequirements.length}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--ba-text-secondary)",
              marginTop: 2,
            }}
          >
            Orphan Requirements
          </div>
        </div>
      </div>

      {/* Coverage bar */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--ba-text)",
            }}
          >
            Coverage
          </span>
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              fontFamily: "var(--ba-mono)",
              color: "var(--ba-teal-600)",
            }}
          >
            {coveragePct}%
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: "var(--ba-slate-100)",
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${coveragePct}%`,
              height: "100%",
              background:
                coveragePct >= 80
                  ? "var(--ba-emerald-500)"
                  : coveragePct >= 50
                    ? "var(--ba-teal-500)"
                    : "var(--ba-amber-500)",
              borderRadius: 5,
              transition: "width 300ms ease",
            }}
          />
        </div>
      </div>

      {/* Orphan requirements */}
      {orphanRequirements.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--ba-text)",
              marginBottom: 10,
            }}
          >
            Orphan Requirements
            <span
              style={{
                fontWeight: 400,
                fontSize: "0.75rem",
                color: "var(--ba-text-muted)",
                marginLeft: 6,
              }}
            >
              (no links to processes, risks, decisions, deliverables, or KPIs)
            </span>
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {orphanRequirements.map((req) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "var(--ba-slate-50)",
                  borderRadius: 6,
                  borderLeft: "3px solid var(--ba-amber-500)",
                }}
              >
                {req.code && (
                  <span
                    style={{
                      fontFamily: "var(--ba-mono)",
                      fontSize: "0.75rem",
                      color: "var(--ba-teal-600)",
                      fontWeight: 600,
                    }}
                  >
                    {req.code}
                  </span>
                )}
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ba-text)",
                    flex: 1,
                  }}
                >
                  {req.title}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--ba-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {req.type.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most connected */}
      {mostConnected.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--ba-text)",
              marginBottom: 10,
            }}
          >
            Most Connected Requirements
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {mostConnected.slice(0, 10).map(({ requirement: req, links }) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: "var(--ba-slate-50)",
                  borderRadius: 6,
                  borderLeft: "3px solid var(--ba-teal-500)",
                }}
              >
                {req.code && (
                  <span
                    style={{
                      fontFamily: "var(--ba-mono)",
                      fontSize: "0.75rem",
                      color: "var(--ba-teal-600)",
                      fontWeight: 600,
                    }}
                  >
                    {req.code}
                  </span>
                )}
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--ba-text)",
                    flex: 1,
                  }}
                >
                  {req.title}
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  {ENTITY_COLUMNS.map((col) =>
                    links[col] > 0 ? (
                      <span
                        key={col}
                        title={col}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: "0.6875rem",
                          color: "var(--ba-text-secondary)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "var(--ba-teal-500)",
                          }}
                        />
                        {links[col]}
                      </span>
                    ) : null,
                  )}
                  <span
                    style={{
                      fontFamily: "var(--ba-mono)",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "var(--ba-teal-600)",
                      marginLeft: 4,
                      minWidth: 20,
                      textAlign: "right",
                    }}
                  >
                    {links.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
