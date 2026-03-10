import type {
  BillingCycle,
  OptionGroup,
} from "@powerhousedao/service-offering/document-models/service-offering";

export const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  ANNUAL: 12,
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  SEMI_ANNUAL: "semi-annually",
  ANNUAL: "annually",
};

export const BILLING_CYCLE_SHORT_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Month",
  QUARTERLY: "Quarter",
  SEMI_ANNUAL: "6 Months",
  ANNUAL: "Year",
};

export function formatPrice(amount: number, currency: string = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export const RECURRING_BILLING_CYCLES: BillingCycle[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
];

export interface TierPriceBreakdown {
  groupId: string;
  groupName: string;
  monthlyAmount: number;
  hasPrice: boolean;
}

export interface CalculatedTierPrice {
  monthlyTotal: number;
  cycleTotal: number;
  groupBreakdown: TierPriceBreakdown[];
  missingPriceGroups: string[];
}

function getGroupPriceForTier(
  group: OptionGroup,
  tierId: string,
): { amount: number; hasPrice: boolean } {
  const tierPricing = group.tierDependentPricing?.find(
    (tp) => tp.tierId === tierId,
  );
  if (tierPricing) {
    const amount = tierPricing.amount ?? 0;
    return { amount, hasPrice: amount > 0 };
  }

  const amount = group.standalonePricing?.amount ?? 0;
  return { amount, hasPrice: amount > 0 };
}

export function calculateTierRecurringPrice(
  regularGroups: OptionGroup[],
  billingCycle: BillingCycle,
  tierId?: string,
): CalculatedTierPrice {
  const breakdown: TierPriceBreakdown[] = [];
  const missingPriceGroups: string[] = [];
  let monthlyTotal = 0;

  for (const group of regularGroups) {
    let amount: number;
    let hasPrice: boolean;

    if (tierId) {
      const tierPrice = getGroupPriceForTier(group, tierId);
      amount = tierPrice.amount;
      hasPrice = tierPrice.hasPrice;
    } else {
      const standaloneAmount = group.standalonePricing?.amount ?? 0;
      amount = standaloneAmount;
      hasPrice = standaloneAmount > 0;
    }

    if (!hasPrice) {
      missingPriceGroups.push(group.name);
    }

    monthlyTotal += amount;
    breakdown.push({
      groupId: group.id,
      groupName: group.name,
      monthlyAmount: amount,
      hasPrice,
    });
  }

  const months = BILLING_CYCLE_MONTHS[billingCycle];
  return {
    monthlyTotal,
    cycleTotal: monthlyTotal * months,
    groupBreakdown: breakdown,
    missingPriceGroups,
  };
}

export function calculateEffectiveSetupPrice(setupCost: {
  amount: number;
  discount?: { discountType: string; discountValue: number } | null;
}): {
  baseAmount: number;
  effectiveAmount: number;
  savings: number;
  savingsPercent: number;
  hasDiscount: boolean;
} {
  const baseAmount = setupCost.amount;
  const discount = setupCost.discount;

  if (!discount || discount.discountValue <= 0) {
    return {
      baseAmount,
      effectiveAmount: baseAmount,
      savings: 0,
      savingsPercent: 0,
      hasDiscount: false,
    };
  }

  let effectiveAmount: number;
  if (discount.discountType === "PERCENTAGE") {
    effectiveAmount = baseAmount * (1 - discount.discountValue / 100);
  } else {
    effectiveAmount = baseAmount - discount.discountValue;
  }

  effectiveAmount = Math.max(0, Math.round(effectiveAmount * 100) / 100);
  const savings = Math.round((baseAmount - effectiveAmount) * 100) / 100;
  const savingsPercent =
    baseAmount > 0 ? Math.round((savings / baseAmount) * 100) : 0;

  return {
    baseAmount,
    effectiveAmount,
    savings,
    savingsPercent,
    hasDiscount: true,
  };
}

export function detectMajorityCycle(
  regularGroups: OptionGroup[],
  currentGlobalCycle: BillingCycle,
  groupOverrides?: Record<string, BillingCycle>,
): { majorityCycle: BillingCycle; count: number; total: number } | null {
  const cycleCounts = new Map<BillingCycle, number>();

  if (regularGroups.length === 0) return null;

  for (const group of regularGroups) {
    const effectiveCycle = groupOverrides?.[group.id] || currentGlobalCycle;
    cycleCounts.set(effectiveCycle, (cycleCounts.get(effectiveCycle) || 0) + 1);
  }

  for (const [cycle, count] of cycleCounts) {
    if (count > regularGroups.length / 2 && cycle !== currentGlobalCycle) {
      return { majorityCycle: cycle, count, total: regularGroups.length };
    }
  }

  return null;
}
