import type { Task } from "../../../document-models/work-breakdown/gen/schema/types.js";

interface Props {
  tasks: Task[];
}

export function ReadinessFooter({ tasks }: Props) {
  // Calculate global readiness using weighted progress
  let weightedSum = 0;
  let blockedCount = 0;
  for (const t of tasks) {
    const s = t.status ?? "PENDING";
    if (s === "DONE") weightedSum += 1;
    else if (s === "IN_PROGRESS") weightedSum += 0.5;
    if (s === "BLOCKED") blockedCount++;
  }
  const readiness =
    tasks.length > 0 ? Math.round((weightedSum / tasks.length) * 100) : 0;

  return (
    <div className="wbg-footer">
      <div className="wbg-footer__stat">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--wbg-indigo)"
          strokeWidth={1.5}
        >
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <div className="wbg-footer__stat-info">
          <span className="wbg-footer__stat-label">GLOBAL READINESS</span>
          <span className="wbg-footer__stat-value">{readiness}%</span>
        </div>
      </div>

      <div className="wbg-footer__stat wbg-footer__stat--blockers">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--wbg-rose)"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        <div className="wbg-footer__stat-info">
          <span className="wbg-footer__stat-label">CRITICAL BLOCKERS</span>
          <span className="wbg-footer__stat-value wbg-footer__stat-value--danger">
            {blockedCount}
          </span>
        </div>
      </div>
    </div>
  );
}
