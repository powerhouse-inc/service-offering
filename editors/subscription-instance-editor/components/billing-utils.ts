import type {
  SubscriptionInstanceState,
  ServiceMetric,
} from "../../../document-models/subscription-instance/v1/gen/schema/types.js";

// ─── Formatting ─────────────────────────────────────────────

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const BILLING_CYCLE_SUFFIX: Record<string, string> = {
  MONTHLY: "/mo",
  QUARTERLY: "/qtr",
  SEMI_ANNUAL: "/6mo",
  ANNUAL: "/yr",
  ONE_TIME: "",
};

export function formatBillingCycleSuffix(
  cycle: string | null | undefined,
): string {
  if (!cycle) return "";
  return BILLING_CYCLE_SUFFIX[cycle] || "";
}

export const BILLING_CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  SEMI_ANNUAL: "semi-annually",
  ANNUAL: "annually",
  ONE_TIME: "one-time",
};

// ─── Discount display ───────────────────────────────────────

export function formatDiscountBadge(discount: {
  discountType: string;
  discountValue: number;
}): string {
  if (discount.discountType === "PERCENTAGE") {
    return `${discount.discountValue}% off`;
  }
  return `${formatCurrency(discount.discountValue, "USD")} off`;
}

export function getDiscountSourceLabel(source: string): string {
  switch (source) {
    case "TIER_INHERITED":
      return "Tier discount";
    case "GROUP_INDEPENDENT":
      return "Group discount";
    case "BUNDLE":
      return "Bundle discount";
    default:
      return "Discount";
  }
}

// ─── Overage calculation ────────────────────────────────────

export interface MetricOverage {
  metricId: string;
  metricName: string;
  unitName: string;
  currentUsage: number;
  freeLimit: number;
  paidLimit: number | null;
  excess: number;
  unitCostAmount: number;
  unitCostCurrency: string;
  projectedCost: number;
}

export function computeMetricOverage(
  metric: ServiceMetric,
  currency: string = "USD",
): MetricOverage | null {
  const freeLimit = metric.freeLimit ?? metric.limit ?? 0;
  const paidLimit = metric.paidLimit ?? null;

  if (freeLimit <= 0 && paidLimit == null) return null;
  if (metric.currentUsage <= freeLimit) return null;
  if (metric.unitCost == null) return null;

  const excess = metric.currentUsage - freeLimit;
  const projectedCost = excess * metric.unitCost;

  return {
    metricId: metric.id,
    metricName: metric.name,
    unitName: metric.unitName ?? "units",
    currentUsage: metric.currentUsage,
    freeLimit,
    paidLimit,
    excess,
    unitCostAmount: metric.unitCost,
    unitCostCurrency: currency,
    projectedCost,
  };
}

// ─── Group billing breakdown ────────────────────────────────

export interface GroupBillingBreakdown {
  groupId: string;
  groupName: string;
  optional: boolean;
  recurringAmount: number | null;
  recurringCurrency: string;
  metricOverages: MetricOverage[];
  dynamicTotal: number;
}

export interface SetupCostLine {
  name: string;
  amount: number;
  currency: string;
  paid: boolean;
  source: "group" | "service";
}

export interface BillingBreakdown {
  currency: string;
  fixedTotal: number;
  dynamicTotal: number;
  projectedTotal: number;
  standaloneFixedTotal: number;
  groupBreakdowns: GroupBillingBreakdown[];
  standaloneOverages: MetricOverage[];
  setupLines: SetupCostLine[];
  setupTotal: number;
  billingCycle: string | null;
}

export function computeBillingBreakdown(
  state: SubscriptionInstanceState,
): BillingBreakdown {
  const currency = state.globalCurrency || state.tierCurrency || "USD";
  const billingCycle = state.selectedBillingCycle || null;

  const groupBreakdowns: GroupBillingBreakdown[] = [];
  const setupLines: SetupCostLine[] = [];

  const allGroupedServiceIds = new Set<string>();
  for (const group of state.serviceGroups) {
    for (const svcId of group.services) {
      allGroupedServiceIds.add(svcId);
    }
  }

  for (const group of state.serviceGroups) {
    const metricOverages: MetricOverage[] = [];
    const groupServiceIds = new Set(group.services);
    const groupServices = state.services.filter((svc) =>
      groupServiceIds.has(svc.id),
    );

    for (const svc of groupServices) {
      for (const metric of svc.metrics) {
        const overage = computeMetricOverage(metric, currency);
        if (overage) metricOverages.push(overage);
      }
    }

    const dynamicTotal = metricOverages.reduce(
      (sum, o) => sum + o.projectedCost,
      0,
    );

    groupBreakdowns.push({
      groupId: group.id,
      groupName: group.name,
      optional: group.optional,
      recurringAmount: group.recurringCost?.amount ?? null,
      recurringCurrency: group.recurringCost?.currency ?? currency,
      metricOverages,
      dynamicTotal,
    });

    if (group.setupCost) {
      setupLines.push({
        name: group.name,
        amount: group.setupCost.amount,
        currency: group.setupCost.currency,
        paid: !!group.setupCost.paidAt,
        source: "group",
      });
    }

    for (const svc of groupServices) {
      if (svc.setupCost) {
        setupLines.push({
          name: `${svc.name || "Service"} (${group.name})`,
          amount: svc.setupCost.amount,
          currency: svc.setupCost.currency,
          paid: !!svc.setupCost.paidAt,
          source: "service",
        });
      }
    }
  }

  const standaloneOverages: MetricOverage[] = [];
  let standaloneFixedTotal = 0;

  for (const svc of state.services) {
    if (allGroupedServiceIds.has(svc.id)) continue;
    if (svc.recurringCost) {
      standaloneFixedTotal += svc.recurringCost.amount;
    }
    for (const metric of svc.metrics) {
      const overage = computeMetricOverage(metric, currency);
      if (overage) standaloneOverages.push(overage);
    }
    if (svc.setupCost) {
      setupLines.push({
        name: svc.name || "Service",
        amount: svc.setupCost.amount,
        currency: svc.setupCost.currency,
        paid: !!svc.setupCost.paidAt,
        source: "service",
      });
    }
  }

  const fixedTotal =
    groupBreakdowns.reduce((sum, g) => sum + (g.recurringAmount ?? 0), 0) +
    standaloneFixedTotal;
  const dynamicTotal =
    groupBreakdowns.reduce((sum, g) => sum + g.dynamicTotal, 0) +
    standaloneOverages.reduce((sum, o) => sum + o.projectedCost, 0);
  const projectedTotal = fixedTotal + dynamicTotal;
  const setupTotal = setupLines.reduce((sum, l) => sum + l.amount, 0);

  return {
    currency,
    fixedTotal,
    dynamicTotal,
    projectedTotal,
    standaloneFixedTotal,
    groupBreakdowns,
    standaloneOverages,
    setupLines,
    setupTotal,
    billingCycle,
  };
}
