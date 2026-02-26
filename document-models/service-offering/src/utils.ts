import type {
  ServiceOfferingPHState,
  BillingCycle,
  DiscountType,
  DiscountRule,
  OptionGroup,
  ServiceSubscriptionTier,
} from "../gen/index.js";

// ── Constants ────────────────────────────────────────────────────────────────

export const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  ANNUAL: 12,
  ONE_TIME: 1,
};

// ── Types ────────────────────────────────────────────────────────────────────

export type UserSelection = {
  tierId: string;
  billingCycle: BillingCycle;
  optionGroupIds: string[];
  /** Per-group billing cycle overrides (custom billing mode) */
  groupBillingCycleOverrides?: Record<string, BillingCycle>;
  /** Per-addon billing cycle overrides */
  addonBillingCycleOverrides?: Record<string, BillingCycle>;
};

interface ResolvedDiscountResult {
  discountType: DiscountType;
  discountValue: number;
  originalAmount: number;
  discountedAmount: number;
}

export interface OptionGroupBreakdown {
  optionGroupId: string;
  optionGroupName: string;
  effectiveBillingCycle: BillingCycle;
  monthlyBase: number;
  cycleAmount: number;
  recurringAmount: number;
  currency: string;
  discount: ResolvedDiscountResult | null;
  setupCost: number | null;
  setupCostCurrency: string | null;
  setupCostDiscount: ResolvedDiscountResult | null;
  billingCycleOverridden: boolean;
  discountStripped: boolean;
}

export interface AddOnBreakdown {
  optionGroupId: string;
  optionGroupName: string;
  selectedBillingCycle: BillingCycle;
  monthlyBase: number;
  cycleAmount: number;
  recurringAmount: number;
  currency: string;
  discount: ResolvedDiscountResult | null;
  setupCost: number | null;
  setupCostCurrency: string | null;
  setupCostDiscount: ResolvedDiscountResult | null;
}

export interface PriceBreakdown {
  tierId: string;
  tierName: string;
  billingCycle: BillingCycle;
  tierMonthlyBase: number;
  tierCycleTotal: number;
  tierCurrency: string;
  optionGroupBreakdowns: OptionGroupBreakdown[];
  setupGroupBreakdowns: OptionGroupBreakdown[];
  addOnBreakdowns: AddOnBreakdown[];
  totals: {
    recurringTotal: number;
    setupTotal: number;
    addOnRecurringTotal: number;
    addOnSetupTotal: number;
    grandRecurringTotal: number;
    grandSetupTotal: number;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function applyDiscount(
  baseAmount: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  if (discountType === "PERCENTAGE") {
    return baseAmount * (1 - discountValue / 100);
  }
  return Math.max(0, baseAmount - discountValue);
}

function buildResolvedDiscount(
  originalAmount: number,
  discountType: DiscountType,
  discountValue: number,
): ResolvedDiscountResult {
  const discountedAmount =
    Math.round(
      applyDiscount(originalAmount, discountType, discountValue) * 100,
    ) / 100;
  return {
    discountType,
    discountValue,
    originalAmount,
    discountedAmount,
  };
}

/**
 * Get the monthly recurring price for a group–tier pair.
 * Reads from tierDependentPricing first, falls back to standalonePricing.
 */
function getGroupPriceForTier(
  group: OptionGroup,
  tierId: string,
): { amount: number; hasPrice: boolean } {
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

  const monthlyPricing = group.standalonePricing?.recurringPricing?.find(
    (p) => p.billingCycle === "MONTHLY",
  );
  const amount = monthlyPricing?.amount ?? 0;
  return { amount, hasPrice: monthlyPricing != null && amount > 0 };
}

/**
 * Get independent discount from a group's tierDependentPricing for a specific tier+cycle.
 */
function getGroupIndependentDiscount(
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

/**
 * Resolve the group-level discount for the given billing cycle.
 * Checks group's billingCycleDiscounts first, then tier-dependent pricing discounts.
 */
function resolveGroupDiscountForTier(
  group: OptionGroup,
  tierId: string,
  effectiveCycle: BillingCycle,
): { discountRule: DiscountRule; source: "group" } | null {
  const groupDiscount = group.billingCycleDiscounts?.find(
    (d) => d.billingCycle === effectiveCycle,
  );
  if (groupDiscount && groupDiscount.discountRule.discountValue > 0) {
    return { discountRule: groupDiscount.discountRule, source: "group" };
  }
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

/**
 * Compute a regular option group's price breakdown for the given tier and billing cycle.
 */
function computeRegularGroupBreakdown(
  group: OptionGroup,
  tier: ServiceSubscriptionTier,
  effectiveBillingCycle: BillingCycle,
  globalBillingCycle: BillingCycle,
  serviceGroups: ServiceOfferingPHState["global"]["serviceGroups"],
): OptionGroupBreakdown {
  const { amount: monthlyBase } = getGroupPriceForTier(group, tier.id);
  const months = BILLING_CYCLE_MONTHS[effectiveBillingCycle];
  const cycleAmount = monthlyBase * months;
  const currency = group.currency || "USD";
  const billingCycleOverridden = effectiveBillingCycle !== globalBillingCycle;

  // Resolve group-level discount
  const resolved = resolveGroupDiscountForTier(
    group,
    tier.id,
    effectiveBillingCycle,
  );

  let recurringAmount = cycleAmount;
  let discount: ResolvedDiscountResult | null = null;

  if (resolved) {
    const { discountType, discountValue } = resolved.discountRule;
    discount = buildResolvedDiscount(cycleAmount, discountType, discountValue);
    recurringAmount = discount.discountedAmount;
  }

  // Setup cost from tier-dependent pricing
  let setupCost: number | null = null;
  let setupCostCurrency: string | null = null;
  let setupCostDiscount: ResolvedDiscountResult | null = null;

  const tierPricing = group.tierDependentPricing?.find(
    (tp) => tp.tierId === tier.id,
  );
  if (tierPricing?.setupCost && tierPricing.setupCost.amount > 0) {
    const sc = tierPricing.setupCost;
    setupCostCurrency = sc.currency || currency;
    setupCost = sc.amount;

    // Check billing-cycle-aware setupCostDiscounts first
    const cycleSetupDiscount = tierPricing.setupCostDiscounts?.find(
      (d) => d.billingCycle === effectiveBillingCycle,
    );
    if (
      cycleSetupDiscount?.discountRule &&
      cycleSetupDiscount.discountRule.discountValue > 0
    ) {
      setupCostDiscount = buildResolvedDiscount(
        sc.amount,
        cycleSetupDiscount.discountRule.discountType,
        cycleSetupDiscount.discountRule.discountValue,
      );
      setupCost = setupCostDiscount.discountedAmount;
    } else if (sc.discount && sc.discount.discountValue > 0) {
      setupCostDiscount = buildResolvedDiscount(
        sc.amount,
        sc.discount.discountType,
        sc.discount.discountValue,
      );
      setupCost = setupCostDiscount.discountedAmount;
    }
  }

  // Also check serviceGroups for setup costs per cycle
  if (setupCost === null) {
    for (const sg of serviceGroups) {
      const sgTp = sg.tierPricing.find((tp) => tp.tierId === tier.id);
      if (!sgTp) continue;
      const sgSetup = sgTp.setupCostsPerCycle.find(
        (sc) => sc.billingCycle === effectiveBillingCycle,
      );
      if (sgSetup && sgSetup.amount > 0) {
        setupCostCurrency = sgSetup.currency || "USD";
        setupCost = sgSetup.amount;

        if (sgSetup.discount && sgSetup.discount.discountValue > 0) {
          setupCostDiscount = buildResolvedDiscount(
            sgSetup.amount,
            sgSetup.discount.discountType,
            sgSetup.discount.discountValue,
          );
          setupCost = setupCostDiscount.discountedAmount;
        }
        break;
      }
    }
  }

  const discountStripped = billingCycleOverridden && !resolved;

  return {
    optionGroupId: group.id,
    optionGroupName: group.name,
    effectiveBillingCycle: effectiveBillingCycle,
    monthlyBase,
    cycleAmount,
    recurringAmount,
    currency,
    discount,
    setupCost,
    setupCostCurrency,
    setupCostDiscount,
    billingCycleOverridden,
    discountStripped,
  };
}

/**
 * Compute a setup-only option group's breakdown (recurring = 0, setup cost only).
 */
function computeSetupGroupBreakdown(
  group: OptionGroup,
  tier: ServiceSubscriptionTier,
  billingCycle: BillingCycle,
): OptionGroupBreakdown {
  const currency = group.currency || "USD";
  let setupCost: number | null = null;
  let setupCostCurrency: string | null = null;
  let setupCostDiscount: ResolvedDiscountResult | null = null;

  const tierPricing = group.tierDependentPricing?.find(
    (tp) => tp.tierId === tier.id,
  );

  const baseAmount = tierPricing?.setupCost?.amount ?? group.price ?? 0;
  if (baseAmount > 0) {
    setupCostCurrency =
      tierPricing?.setupCost?.currency || group.currency || "USD";
    setupCost = baseAmount;

    const cycleSetupDiscount = tierPricing?.setupCostDiscounts?.find(
      (d) => d.billingCycle === billingCycle,
    );
    if (
      cycleSetupDiscount?.discountRule &&
      cycleSetupDiscount.discountRule.discountValue > 0
    ) {
      setupCostDiscount = buildResolvedDiscount(
        baseAmount,
        cycleSetupDiscount.discountRule.discountType,
        cycleSetupDiscount.discountRule.discountValue,
      );
      setupCost = setupCostDiscount.discountedAmount;
    } else if (
      tierPricing?.setupCost?.discount &&
      tierPricing.setupCost.discount.discountValue > 0
    ) {
      setupCostDiscount = buildResolvedDiscount(
        baseAmount,
        tierPricing.setupCost.discount.discountType,
        tierPricing.setupCost.discount.discountValue,
      );
      setupCost = setupCostDiscount.discountedAmount;
    }
  }

  return {
    optionGroupId: group.id,
    optionGroupName: group.name,
    effectiveBillingCycle: billingCycle,
    monthlyBase: 0,
    cycleAmount: 0,
    recurringAmount: 0,
    currency,
    discount: null,
    setupCost,
    setupCostCurrency,
    setupCostDiscount,
    billingCycleOverridden: false,
    discountStripped: false,
  };
}

/**
 * Compute an add-on option group's breakdown.
 */
function computeAddOnBreakdown(
  group: OptionGroup,
  tier: ServiceSubscriptionTier,
  billingCycle: BillingCycle,
): AddOnBreakdown {
  const months = BILLING_CYCLE_MONTHS[billingCycle];
  const currency = group.currency || "USD";

  const { amount: monthlyBase } = getGroupPriceForTier(group, tier.id);
  const cycleAmount = monthlyBase * months;

  // Resolve group-level discount
  const resolved = resolveGroupDiscountForTier(group, tier.id, billingCycle);

  let recurringAmount = cycleAmount;
  let discount: ResolvedDiscountResult | null = null;

  if (resolved) {
    const { discountType, discountValue } = resolved.discountRule;
    discount = buildResolvedDiscount(cycleAmount, discountType, discountValue);
    recurringAmount = discount.discountedAmount;
  }

  // Add-on setup cost from standalonePricing
  let setupCost: number | null = null;
  let setupCostCurrency: string | null = null;
  let setupCostDiscount: ResolvedDiscountResult | null = null;

  const sc = group.standalonePricing?.setupCost;
  if (sc && sc.amount > 0) {
    setupCostCurrency = sc.currency || currency;
    setupCost = sc.amount;

    if (sc.discount && sc.discount.discountValue > 0) {
      const effectiveAmount = Math.max(
        0,
        Math.round(
          applyDiscount(
            sc.amount,
            sc.discount.discountType,
            sc.discount.discountValue,
          ) * 100,
        ) / 100,
      );
      setupCost = effectiveAmount;
      setupCostDiscount = buildResolvedDiscount(
        sc.amount,
        sc.discount.discountType,
        sc.discount.discountValue,
      );
    }
  }

  return {
    optionGroupId: group.id,
    optionGroupName: group.name,
    selectedBillingCycle: billingCycle,
    monthlyBase,
    cycleAmount,
    recurringAmount,
    currency,
    discount,
    setupCost,
    setupCostCurrency,
    setupCostDiscount,
  };
}

// ── Main utility ─────────────────────────────────────────────────────────────

/**
 * Compute a full price breakdown for a user's selection.
 *
 * @param state  - The ServiceOffering document state
 * @param selection - The user's choices: tier, billing cycle, and enabled add-on group IDs
 * @returns A complete price breakdown mirroring the logic in TheMatrix / resolveConfiguration
 */
export function getUserSelectionPriceBreakdown(
  state: ServiceOfferingPHState,
  selection: UserSelection,
): PriceBreakdown {
  const { tiers, optionGroups, serviceGroups } = state.global;
  const billingCycle = selection.billingCycle;

  const tier = tiers.find((t) => t.id === selection.tierId);
  if (!tier) {
    throw new Error(`Tier ${selection.tierId} not found`);
  }

  const enabledAddonIds = new Set(selection.optionGroupIds);

  // Classify option groups
  const regularGroups = optionGroups.filter(
    (g) => !g.isAddOn && g.costType !== "SETUP",
  );
  const setupGroups = optionGroups.filter(
    (g) => !g.isAddOn && g.costType === "SETUP",
  );
  const enabledAddons = optionGroups.filter(
    (g) => g.isAddOn && enabledAddonIds.has(g.id),
  );

  // Tier base price: sum of regular groups' monthly prices
  const cycleMonths = BILLING_CYCLE_MONTHS[billingCycle];
  let tierMonthlyBase = 0;
  for (const group of regularGroups) {
    tierMonthlyBase += getGroupPriceForTier(group, tier.id).amount;
  }
  const tierCycleTotal = tierMonthlyBase * cycleMonths;

  const tierCurrency = tier.pricing.currency || "USD";

  // Regular group breakdowns (with per-group billing cycle overrides)
  const optionGroupBreakdowns = regularGroups.map((group) => {
    const effectiveCycle =
      selection.groupBillingCycleOverrides?.[group.id] ?? billingCycle;
    return computeRegularGroupBreakdown(
      group,
      tier,
      effectiveCycle,
      billingCycle,
      serviceGroups,
    );
  });

  // Setup group breakdowns
  const setupGroupBreakdowns = setupGroups.map((group) =>
    computeSetupGroupBreakdown(group, tier, billingCycle),
  );

  // Add-on breakdowns (with per-addon billing cycle overrides)
  const addOnBreakdowns = enabledAddons.map((group) => {
    const addonCycle =
      selection.addonBillingCycleOverrides?.[group.id] ?? billingCycle;
    return computeAddOnBreakdown(group, tier, addonCycle);
  });

  // Totals
  let recurringTotal = 0;
  let setupTotal = 0;
  for (const b of optionGroupBreakdowns) {
    recurringTotal += b.recurringAmount;
    if (b.setupCost !== null) setupTotal += b.setupCost;
  }
  for (const b of setupGroupBreakdowns) {
    if (b.setupCost !== null) setupTotal += b.setupCost;
  }

  let addOnRecurringTotal = 0;
  let addOnSetupTotal = 0;
  for (const b of addOnBreakdowns) {
    addOnRecurringTotal += b.recurringAmount;
    if (b.setupCost !== null) addOnSetupTotal += b.setupCost;
  }

  return {
    tierId: tier.id,
    tierName: tier.name,
    billingCycle,
    tierMonthlyBase,
    tierCycleTotal,
    tierCurrency,
    optionGroupBreakdowns,
    setupGroupBreakdowns,
    addOnBreakdowns,
    totals: {
      recurringTotal: Math.round(recurringTotal * 100) / 100,
      setupTotal: Math.round(setupTotal * 100) / 100,
      addOnRecurringTotal: Math.round(addOnRecurringTotal * 100) / 100,
      addOnSetupTotal: Math.round(addOnSetupTotal * 100) / 100,
      grandRecurringTotal:
        Math.round((recurringTotal + addOnRecurringTotal) * 100) / 100,
      grandSetupTotal: Math.round((setupTotal + addOnSetupTotal) * 100) / 100,
    },
  };
}

const utils = {
  getUserSelectionPriceBreakdown,
};
export default utils;
