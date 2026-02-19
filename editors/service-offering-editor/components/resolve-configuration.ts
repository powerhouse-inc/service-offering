import { generateId } from "document-model/core";
import type {
  BillingCycle,
  DiscountType,
  OptionGroup,
  ServiceGroup,
  ServiceSubscriptionTier,
  SetFinalConfigurationInput,
  ResolvedDiscountInput,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  BILLING_CYCLE_MONTHS,
  resolveGroupDiscountForTier,
  getGroupPriceForTier,
  calculateTierRecurringPrice,
  calculateEffectiveSetupPrice,
} from "./pricing-utils.js";

export interface ResolveConfigParams {
  tiers: ServiceSubscriptionTier[];
  selectedTierIdx: number;
  activeBillingCycle: BillingCycle;
  regularGroups: OptionGroup[];
  setupGroups: OptionGroup[];
  addonGroups: OptionGroup[];
  groupBillingCycles: Record<string, BillingCycle>;
  addonBillingCycles: Record<string, BillingCycle>;
  enabledAddonIds: Set<string>;
  serviceGroups: ServiceGroup[];
}

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
): ResolvedDiscountInput {
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

export function resolveConfiguration(
  params: ResolveConfigParams,
): SetFinalConfigurationInput | null {
  const {
    tiers,
    selectedTierIdx,
    activeBillingCycle,
    regularGroups,
    setupGroups,
    addonGroups,
    groupBillingCycles,
    addonBillingCycles,
    enabledAddonIds,
    serviceGroups,
  } = params;

  const tier = tiers[selectedTierIdx] as ServiceSubscriptionTier | undefined;
  if (!tier) return null;

  const cycleMonths = BILLING_CYCLE_MONTHS[activeBillingCycle];

  // Tier base price: sum of regular groups' monthly prices * cycle months
  const tierCalc = calculateTierRecurringPrice(
    regularGroups,
    "MONTHLY",
    tier.id,
  );
  const tierMonthlyBase = tierCalc.monthlyTotal;
  const tierCycleTotal = tierMonthlyBase * cycleMonths;

  // Tier currency: from tier pricing or fallback USD
  const tierCurrency = tier.pricing.currency || "USD";

  // Tier discount from billingCycleDiscounts
  const tierDiscountEntry = tier.billingCycleDiscounts.find(
    (d) => d.billingCycle === activeBillingCycle,
  );
  let tierDiscount: ResolvedDiscountInput | null = null;

  if (
    tierDiscountEntry?.discountRule &&
    tierDiscountEntry.discountRule.discountValue > 0
  ) {
    const { discountType, discountValue } = tierDiscountEntry.discountRule;
    tierDiscount = buildResolvedDiscount(
      tierCycleTotal,
      discountType,
      discountValue,
    );
  }

  // Regular groups → optionGroupConfigs
  const optionGroupConfigs = regularGroups.map((group) => {
    const effectiveBillingCycle =
      groupBillingCycles[group.id] || activeBillingCycle;
    const billingCycleOverridden = effectiveBillingCycle !== activeBillingCycle;
    const effectiveMonths = BILLING_CYCLE_MONTHS[effectiveBillingCycle];

    const { amount: monthlyBase } = getGroupPriceForTier(group, tier.id);
    const cycleAmount = monthlyBase * effectiveMonths;
    const currency = group.currency || "USD";

    // Resolve discount with inheritance logic
    const resolved = resolveGroupDiscountForTier(
      group,
      tier.id,
      effectiveBillingCycle,
      tier,
      undefined,
      tierMonthlyBase,
    );

    const discountStripped =
      billingCycleOverridden &&
      group.discountMode !== "INDEPENDENT" &&
      !resolved;

    let recurringAmount = cycleAmount;
    let discount: ResolvedDiscountInput | null = null;

    if (resolved) {
      const { discountType, discountValue } = resolved.discountRule;
      discount = buildResolvedDiscount(
        cycleAmount,
        discountType,
        discountValue,
      );
      recurringAmount = discount.discountedAmount;
    }

    // Setup cost from tier-dependent pricing
    let setupCost: number | null = null;
    let setupCostCurrency: string | null = null;
    let setupCostDiscount: ResolvedDiscountInput | null = null;

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
        // Fallback to generic setup cost discount
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
          (sc) => sc.billingCycle === activeBillingCycle,
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

    return {
      id: generateId(),
      optionGroupId: group.id,
      effectiveBillingCycle,
      billingCycleOverridden,
      discountStripped,
      recurringAmount,
      currency,
      discount,
      setupCost,
      setupCostCurrency,
      setupCostDiscount,
    };
  });

  // Setup groups → also into optionGroupConfigs (recurring = 0, setup cost with billing-cycle discount)
  const setupGroupConfigs = setupGroups.map((group) => {
    const currency = group.currency || "USD";
    let setupCost: number | null = null;
    let setupCostCurrency: string | null = null;
    let setupCostDiscount: ResolvedDiscountInput | null = null;

    const tierPricing = group.tierDependentPricing?.find(
      (tp) => tp.tierId === tier.id,
    );

    // Use group.price as base if no tier-specific setup cost
    const baseAmount = tierPricing?.setupCost?.amount ?? group.price ?? 0;
    if (baseAmount > 0) {
      setupCostCurrency =
        tierPricing?.setupCost?.currency || group.currency || "USD";
      setupCost = baseAmount;

      // Check billing-cycle-aware setupCostDiscounts
      const cycleSetupDiscount = tierPricing?.setupCostDiscounts?.find(
        (d) => d.billingCycle === activeBillingCycle,
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
        // Fallback to generic setup cost discount
        setupCostDiscount = buildResolvedDiscount(
          baseAmount,
          tierPricing.setupCost.discount.discountType,
          tierPricing.setupCost.discount.discountValue,
        );
        setupCost = setupCostDiscount.discountedAmount;
      }
    }

    return {
      id: generateId(),
      optionGroupId: group.id,
      effectiveBillingCycle: activeBillingCycle,
      billingCycleOverridden: false,
      discountStripped: false,
      recurringAmount: 0,
      currency,
      discount: null,
      setupCost,
      setupCostCurrency,
      setupCostDiscount,
    };
  });

  // Enabled add-ons → addOnConfigs
  const addOnConfigs = addonGroups
    .filter((g) => enabledAddonIds.has(g.id))
    .map((group) => {
      const selectedBillingCycle =
        addonBillingCycles[group.id] || activeBillingCycle;
      const effectiveMonths = BILLING_CYCLE_MONTHS[selectedBillingCycle];
      const currency = group.currency || "USD";

      const { amount: monthlyBase } = getGroupPriceForTier(group, tier.id);
      const cycleAmount = monthlyBase * effectiveMonths;

      // Resolve discount
      const resolved = resolveGroupDiscountForTier(
        group,
        tier.id,
        selectedBillingCycle,
        tier,
        undefined,
        tierMonthlyBase,
      );

      let recurringAmount = cycleAmount;
      let discount: ResolvedDiscountInput | null = null;

      if (resolved) {
        const { discountType, discountValue } = resolved.discountRule;
        discount = buildResolvedDiscount(
          cycleAmount,
          discountType,
          discountValue,
        );
        recurringAmount = discount.discountedAmount;
      }

      // Add-on setup cost from standalonePricing
      let setupCost: number | null = null;
      let setupCostCurrency: string | null = null;
      let setupCostDiscount: ResolvedDiscountInput | null = null;

      const sc = group.standalonePricing?.setupCost;
      if (sc && sc.amount > 0) {
        setupCostCurrency = sc.currency || currency;
        const effectiveSetup = calculateEffectiveSetupPrice(sc);
        setupCost = effectiveSetup.effectiveAmount;

        if (effectiveSetup.hasDiscount && sc.discount) {
          setupCostDiscount = buildResolvedDiscount(
            sc.amount,
            sc.discount.discountType,
            sc.discount.discountValue,
          );
        }
      }

      return {
        id: generateId(),
        optionGroupId: group.id,
        selectedBillingCycle,
        recurringAmount,
        currency,
        discount,
        setupCost,
        setupCostCurrency,
        setupCostDiscount,
      };
    });

  return {
    selectedTierId: tier.id,
    selectedBillingCycle: activeBillingCycle,
    tierBasePrice: tierCycleTotal,
    tierCurrency,
    tierDiscount,
    optionGroupConfigs: [...optionGroupConfigs, ...setupGroupConfigs],
    addOnConfigs,
    lastModified: new Date().toISOString(),
  };
}
