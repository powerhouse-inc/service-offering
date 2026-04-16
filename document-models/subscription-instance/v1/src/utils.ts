import type {
  ServiceMetric,
  Service,
  ServiceGroup,
  SubscriptionInstanceState,
} from "../gen/schema/types.js";

// ─── Constants ──────────────────────────────────────────────

export const BILLING_CYCLE_DAYS: Record<string, number> = {
  MONTHLY: 30,
  QUARTERLY: 91,
  SEMI_ANNUAL: 182,
  ANNUAL: 365,
  ONE_TIME: 0,
};

const RESET_HIERARCHY = [
  "HOURLY",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
];

// ─── Date helpers ───────────────────────────────────────────

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
}

// ─── Core billing functions ─────────────────────────────────

/**
 * Adds the billing cycle duration to a date.
 * Returns ISO date string.
 */
export function calculateNextBillingDate(
  fromDate: string,
  billingCycle: string,
): string {
  const days = BILLING_CYCLE_DAYS[billingCycle] || 30;
  if (days <= 0) return fromDate;
  const d = new Date(fromDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Core proration formula: (remainingDays / totalCycleDays) × amount
 *
 * D-1: mid-cycle add = prorated debit
 * D-2: mid-cycle remove = prorated credit (same formula, reversed direction)
 */
export function calculateProratedCost(
  amount: number,
  cycleStart: string,
  cycleEnd: string,
  effectiveDate: string,
): number {
  const totalDays = daysBetween(cycleStart, cycleEnd);
  const remainingDays = daysBetween(effectiveDate, cycleEnd);
  if (totalDays <= 0 || remainingDays <= 0) return 0;
  return (remainingDays / totalDays) * amount;
}

/**
 * Per-metric overage cost.
 * Formula: max(0, currentUsage - freeLimit) × unitCost.amount
 * Capped at (paidLimit - freeLimit) if paidLimit is defined.
 */
export function calculateOverageCost(metric: {
  currentUsage: number;
  freeLimit?: number | null;
  paidLimit?: number | null;
  unitCost?: { amount: number } | null;
}): number {
  if (!metric.unitCost) return 0;
  const freeLimit = metric.freeLimit ?? 0;
  let overage = Math.max(0, metric.currentUsage - freeLimit);
  if (metric.paidLimit) {
    overage = Math.min(overage, metric.paidLimit - freeLimit);
  }
  return overage * metric.unitCost.amount;
}

/**
 * Sum overage across all metrics in all services (flat + grouped).
 */
export function calculateTotalOverage(
  services: readonly Service[],
  serviceGroups: readonly ServiceGroup[],
): number {
  let total = 0;
  for (const svc of services) {
    for (const metric of svc.metrics) {
      total += calculateOverageCost(metric);
    }
  }
  for (const group of serviceGroups) {
    for (const svc of group.services) {
      for (const metric of svc.metrics) {
        total += calculateOverageCost(metric);
      }
    }
  }
  return total;
}

/**
 * Returns totalDebt - totalCredit.
 * Can be negative (credit surplus per D-7). No floor.
 */
export function calculateAmountOwed(state: {
  totalDebt?: number | null;
  totalCredit?: number | null;
}): number {
  return (state.totalDebt ?? 0) - (state.totalCredit ?? 0);
}

/**
 * What would the bill be if we settled right now.
 * = amountOwed + projected overage from current usage.
 */
export function calculateUnsettledBill(
  state: SubscriptionInstanceState,
): number {
  return (
    calculateAmountOwed(state) +
    calculateTotalOverage(state.services, state.serviceGroups)
  );
}

/**
 * Whether a metric's usageResetPeriod should reset at settlement.
 * Returns true if the metric's reset period matches the billing cycle
 * or is a subdivision of it (e.g., MONTHLY resets on QUARTERLY settlement).
 */
export function shouldResetMetric(
  metric: { usageResetPeriod?: string | null },
  billingCycle: string,
): boolean {
  if (!metric.usageResetPeriod) return false;
  const metricIndex = RESET_HIERARCHY.indexOf(metric.usageResetPeriod);
  const cycleIndex = RESET_HIERARCHY.indexOf(billingCycle);
  if (metricIndex === -1 || cycleIndex === -1) return false;
  return metricIndex <= cycleIndex;
}
