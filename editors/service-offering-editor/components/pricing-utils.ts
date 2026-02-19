import type {
  BillingCycle,
  BillingCycleDiscount,
  DiscountMode,
  DiscountRule,
  OptionGroup,
  ServiceSubscriptionTier,
} from "@powerhousedao/service-offering/document-models/service-offering";

// Billing cycle months for monthly-equivalent calculation
export const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  ANNUAL: 12,
  ONE_TIME: 1,
};

// Human-readable billing cycle labels
export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  SEMI_ANNUAL: "semi-annually",
  ANNUAL: "annually",
  ONE_TIME: "one-time",
};

// Short labels for dropdowns
export const BILLING_CYCLE_SHORT_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Month",
  QUARTERLY: "Quarter",
  SEMI_ANNUAL: "6 Months",
  ANNUAL: "Year",
  ONE_TIME: "One Time",
};

// Calculate monthly equivalent price
export function getMonthlyEquivalent(
  amount: number,
  billingCycle: BillingCycle,
): number {
  if (billingCycle === "ONE_TIME") return amount;
  return amount / BILLING_CYCLE_MONTHS[billingCycle];
}

// Format price with currency symbol
export function formatPrice(amount: number, currency: string = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format monthly equivalent display: "$X/mo billed [cycle] at $Y"
// For monthly: just "$X/mo"
export function formatMonthlyEquivalentDisplay(
  amount: number,
  billingCycle: BillingCycle,
  currency: string = "USD",
): string {
  if (billingCycle === "MONTHLY") {
    return `${formatPrice(amount, currency)}/mo`;
  }

  if (billingCycle === "ONE_TIME") {
    return formatPrice(amount, currency);
  }

  const monthlyEquivalent = getMonthlyEquivalent(amount, billingCycle);
  const cycleLabel = BILLING_CYCLE_LABELS[billingCycle];

  return `${formatPrice(monthlyEquivalent, currency)}/mo billed ${cycleLabel} at ${formatPrice(amount, currency)}`;
}

// Get available billing cycles (excluding ONE_TIME for most cases)
export const RECURRING_BILLING_CYCLES: BillingCycle[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
];

export const ALL_BILLING_CYCLES: BillingCycle[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
  "ONE_TIME",
];

// Discount cascade resolution: SG discount → Tier discount → null
// Returns the resolved discount rule and its source for transparency
export function resolveGroupDiscount(
  groupDiscounts: BillingCycleDiscount[],
  effectiveCycle: BillingCycle,
  tier: ServiceSubscriptionTier | null,
): { discountRule: DiscountRule; source: "group" | "tier" } | null {
  // 1. Check service group's own discounts first
  const sgDiscount = groupDiscounts.find(
    (d) => d.billingCycle === effectiveCycle,
  );
  if (sgDiscount && sgDiscount.discountRule.discountValue > 0) {
    return { discountRule: sgDiscount.discountRule, source: "group" };
  }

  // 2. Fall back to tier-level discounts
  if (tier) {
    const tierDiscount = tier.billingCycleDiscounts.find(
      (d) => d.billingCycle === effectiveCycle,
    );
    if (tierDiscount && tierDiscount.discountRule.discountValue > 0) {
      return { discountRule: tierDiscount.discountRule, source: "tier" };
    }
  }

  // 3. No discount
  return null;
}

// Get independent discount from a group's tierDependentPricing for a specific tier+cycle
export function getGroupIndependentDiscount(
  group: OptionGroup,
  tierId: string,
  cycle: BillingCycle,
): DiscountRule | null {
  const tierPricing = group.tierDependentPricing?.find(
    (tp) => tp.tierId === tierId,
  );
  if (!tierPricing) return null;
  const rp = tierPricing.recurringPricing?.find(
    (p) => p.billingCycle === cycle,
  );
  if (rp?.discount && rp.discount.discountValue > 0) {
    return rp.discount;
  }
  return null;
}

// Resolved discount with optional metadata about the original tier flat amount
export interface ResolvedGroupDiscount {
  discountRule: DiscountRule;
  source: "group" | "tier";
  /** Present when a tier FLAT_AMOUNT was converted to equivalent PERCENTAGE */
  originalTierFlat?: number;
}

// Mode-aware discount resolution
// When INDEPENDENT: reads from group's billingCycleDiscounts then tierDependentPricing[].recurringPricing[].discount
// When INHERIT_TIER (or null for regular groups, or global mode): uses tier's billingCycleDiscounts
// Add-ons with unset discountMode default to own discounts (don't inherit tier)
// Pass forceInherit=true in global billing mode to always use tier discounts for regular groups
// tierMonthlyBase: sum of all regular group monthly prices for this tier (needed for flat→percentage conversion)
export function resolveGroupDiscountForTier(
  group: OptionGroup,
  tierId: string,
  effectiveCycle: BillingCycle,
  tier: ServiceSubscriptionTier | null,
  forceInherit?: boolean,
  tierMonthlyBase?: number,
): ResolvedGroupDiscount | null {
  // Use own discounts when:
  // - Explicit INDEPENDENT mode (always respected, even with forceInherit)
  // - Add-on with unset discountMode (add-ons don't inherit tier by default)
  const useOwnDiscounts =
    group.discountMode === "INDEPENDENT" ||
    (group.isAddOn && group.discountMode !== "INHERIT_TIER");

  if (useOwnDiscounts) {
    // Check group-level billingCycleDiscounts (STANDALONE add-ons store discounts here)
    const groupDiscount = group.billingCycleDiscounts?.find(
      (d) => d.billingCycle === effectiveCycle,
    );
    if (groupDiscount && groupDiscount.discountRule.discountValue > 0) {
      return { discountRule: groupDiscount.discountRule, source: "group" };
    }
    // Check tier-dependent pricing discounts (TIER_DEPENDENT groups store discounts here)
    const independentDiscount = getGroupIndependentDiscount(
      group,
      tierId,
      effectiveCycle,
    );
    if (independentDiscount) {
      return { discountRule: independentDiscount, source: "group" };
    }
    return null;
  }

  // INHERIT_TIER (or null = default for regular groups): use tier's billing cycle discounts
  if (tier) {
    const tierDiscount = tier.billingCycleDiscounts.find(
      (d) => d.billingCycle === effectiveCycle,
    );
    if (tierDiscount && tierDiscount.discountRule.discountValue > 0) {
      const { discountRule } = tierDiscount;

      // Convert FLAT_AMOUNT to equivalent PERCENTAGE so each group applies
      // the same rate and group prices sum to the tier's discounted price
      if (
        discountRule.discountType === "FLAT_AMOUNT" &&
        tierMonthlyBase &&
        tierMonthlyBase > 0
      ) {
        const cycleMonths = BILLING_CYCLE_MONTHS[effectiveCycle];
        const tierCycleBase = tierMonthlyBase * cycleMonths;
        const equivalentPercentage =
          (discountRule.discountValue / tierCycleBase) * 100;
        return {
          discountRule: {
            discountType: "PERCENTAGE",
            discountValue: equivalentPercentage,
          },
          source: "tier",
          originalTierFlat: discountRule.discountValue,
        };
      }

      return { discountRule, source: "tier" };
    }
  }

  return null;
}

// Get the monthly recurring price for a specific group-tier pair
// Reads from tierDependentPricing first, falls back to standalonePricing
export function getGroupPriceForTier(
  group: OptionGroup,
  tierId: string,
): { amount: number; hasPrice: boolean } {
  // Check tier-dependent pricing first
  const tierPricing = group.tierDependentPricing?.find(
    (tp) => tp.tierId === tierId,
  );
  if (tierPricing) {
    const monthlyPricing = tierPricing.recurringPricing?.find(
      (p) => p.billingCycle === "MONTHLY",
    );
    const amount = monthlyPricing?.amount ?? 0;
    return { amount, hasPrice: monthlyPricing != null && amount > 0 };
  }

  // Fall back to standalone pricing (backward compatibility)
  const monthlyPricing = group.standalonePricing?.recurringPricing?.find(
    (p) => p.billingCycle === "MONTHLY",
  );
  const amount = monthlyPricing?.amount ?? 0;
  return { amount, hasPrice: monthlyPricing != null && amount > 0 };
}

// Calculate tier recurring price from regular OptionGroup prices
// Regular groups = costType !== "SETUP" && !isAddOn
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
      // Legacy: no tierId, read from standalone
      const monthlyPricing = group.standalonePricing?.recurringPricing?.find(
        (p) => p.billingCycle === "MONTHLY",
      );
      amount = monthlyPricing?.amount ?? 0;
      hasPrice = monthlyPricing != null && amount > 0;
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

// Detect billing cycle majority among regular groups
// Returns suggestion when >50% of groups share a cycle different from current global
// groupOverrides: runtime cycle overrides keyed by group.id (from UI state)
export function detectMajorityCycle(
  regularGroups: OptionGroup[],
  currentGlobalCycle: BillingCycle,
  groupOverrides?: Record<string, BillingCycle>,
): { majorityCycle: BillingCycle; count: number; total: number } | null {
  const cycleCounts = new Map<BillingCycle, number>();

  if (regularGroups.length === 0) return null;

  for (const group of regularGroups) {
    // Effective cycle: override if set, otherwise global
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
