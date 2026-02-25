import { generateId } from "document-model/core";
import type {
  ServiceOfferingState,
  ServiceSubscriptionTier,
  Service as SOService,
  ServiceUsageLimit,
  FinalConfiguration,
  ResolvedDiscount,
} from "../../../document-models/service-offering/gen/schema/types.js";
import type {
  InitializeSubscriptionInput,
  InitializeServiceGroupInput,
  InitializeServiceInput,
  InitializeMetricInput,
  DiscountInfoInitInput,
  BillingCycle as SIBillingCycle,
} from "../../../document-models/subscription-instance/gen/schema/types.js";

export interface MapOfferingOptions {
  /** The service offering state to import from */
  offering: ServiceOfferingState;
  /** The selected tier ID */
  tierId: string;
  /** The selected global billing cycle */
  selectedBillingCycle: SIBillingCycle;
  /** Customer info */
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  /** Timestamp for createdAt */
  createdAt: string;
}

/**
 * Maps a Service Offering state to an InitializeSubscriptionInput.
 * This is a one-time snapshot — the SI lives independently after creation.
 *
 * Logic:
 * 1. Find the selected tier and resolve pricing from finalConfiguration
 * 2. Map offering service groups with tier-specific pricing
 * 3. Map option group configs from finalConfiguration as additional service groups
 * 4. Map add-on configs from finalConfiguration as optional service groups
 * 5. Map remaining standalone services with tier service levels and usage limits
 * 6. Calculate tier price from finalConfig or service group sums (CALCULATED) or manual price
 */
export function mapOfferingToSubscription(
  options: MapOfferingOptions,
): InitializeSubscriptionInput {
  const {
    offering,
    tierId,
    selectedBillingCycle,
    customerId,
    customerName,
    customerEmail,
    createdAt,
  } = options;

  const tier = offering.tiers.find((t) => t.id === tierId);
  if (!tier) {
    throw new Error(`Tier ${tierId} not found in offering`);
  }

  const finalConfig = offering.finalConfiguration;
  const currency = finalConfig?.tierCurrency ?? tier.pricing.currency;
  const pricingMode = tier.pricingMode || "MANUAL_OVERRIDE";

  // Track which services are accounted for in groups
  const groupedServiceIds = new Set<string>();

  // 1. Map offering service groups with tier-specific pricing
  const serviceGroups: InitializeServiceGroupInput[] = mapOfferingServiceGroups(
    offering,
    tier,
    selectedBillingCycle,
    currency,
    groupedServiceIds,
  );

  // 2. Map option group configs from finalConfiguration as service groups
  if (finalConfig) {
    mapFinalConfigGroups(
      offering,
      tier,
      finalConfig,
      currency,
      groupedServiceIds,
      serviceGroups,
    );
  }

  // 3. Map remaining standalone services (not in any group or option group)
  const standaloneServices = offering.services
    .filter((s) => !groupedServiceIds.has(s.id))
    .filter((svc) => {
      const level = tier.serviceLevels.find((sl) => sl.serviceId === svc.id);
      return (
        level &&
        level.level !== "NOT_INCLUDED" &&
        level.level !== "NOT_APPLICABLE"
      );
    })
    .map((svc) => mapServiceToInput(svc, tier, currency, selectedBillingCycle));

  // Calculate tier price
  let tierPrice: number | undefined;
  if (pricingMode === "CALCULATED") {
    tierPrice = serviceGroups.reduce(
      (sum, grp) => sum + (grp.recurringAmount ?? 0),
      0,
    );
  } else {
    tierPrice = finalConfig?.tierBasePrice ?? tier.pricing.amount ?? undefined;
  }

  return {
    customerId: customerId ?? undefined,
    customerName: customerName ?? undefined,
    customerEmail: customerEmail ?? undefined,
    serviceOfferingId: offering.id,
    tierName: tier.name,
    tierPricingOptionId: tier.id,
    tierPrice,
    tierCurrency: currency,
    tierPricingMode: pricingMode,
    selectedBillingCycle,
    globalCurrency: currency,
    autoRenew: true,
    createdAt,
    services: standaloneServices,
    serviceGroups,
  };
}

/**
 * Maps offering service groups to subscription service groups.
 * Finds services by their serviceGroupId and applies tier-specific pricing.
 */
function mapOfferingServiceGroups(
  offering: ServiceOfferingState,
  tier: ServiceSubscriptionTier,
  selectedBillingCycle: SIBillingCycle,
  globalCurrency: string,
  groupedServiceIds: Set<string>,
): InitializeServiceGroupInput[] {
  return offering.serviceGroups.map((group) => {
    // Find services that belong to this service group
    const groupServices = offering.services.filter(
      (s) => s.serviceGroupId === group.id,
    );
    groupServices.forEach((s) => groupedServiceIds.add(s.id));

    // Find tier-specific pricing for this group
    const tierPricing = group.tierPricing.find((tp) => tp.tierId === tier.id);

    // Find the recurring price option matching the selected billing cycle
    let recurringOption = tierPricing?.recurringPricing.find(
      (rp) => rp.billingCycle === selectedBillingCycle,
    );
    if (!recurringOption) {
      recurringOption = tierPricing?.recurringPricing.find(
        (rp) => rp.billingCycle === (group.billingCycle as string),
      );
    }

    // Apply billing cycle discount from tier if applicable
    let discountedAmount = recurringOption?.amount;
    let discountInput: DiscountInfoInitInput | undefined;

    if (recurringOption && tier.billingCycleDiscounts.length > 0) {
      const cycleDiscount = tier.billingCycleDiscounts.find(
        (d) => d.billingCycle === selectedBillingCycle,
      );
      if (cycleDiscount) {
        const originalAmount = recurringOption.amount;
        const rule = cycleDiscount.discountRule;
        discountedAmount =
          rule.discountType === "PERCENTAGE"
            ? originalAmount * (1 - rule.discountValue / 100)
            : originalAmount - rule.discountValue;
        discountInput = {
          originalAmount,
          discountType: rule.discountType,
          discountValue: rule.discountValue,
          source: "TIER_INHERITED",
        };
      }
    }

    // Fallback to the recurring option's own discount
    if (recurringOption?.discount && !discountInput) {
      const originalAmount = recurringOption.amount;
      const d = recurringOption.discount;
      discountedAmount =
        d.discountType === "PERCENTAGE"
          ? originalAmount * (1 - d.discountValue / 100)
          : originalAmount - d.discountValue;
      discountInput = {
        originalAmount,
        discountType: d.discountType,
        discountValue: d.discountValue,
        source: "GROUP_INDEPENDENT",
      };
    }

    // Find setup cost for the selected billing cycle
    let setupAmount: number | undefined;
    let setupCurrency: string | undefined;
    if (tierPricing) {
      const setupCostOption = tierPricing.setupCostsPerCycle.find(
        (sc) => sc.billingCycle === selectedBillingCycle,
      );
      if (setupCostOption) {
        setupAmount = setupCostOption.amount;
        setupCurrency = setupCostOption.currency;
      }
    }

    // Map services in this group
    const mappedServices = groupServices
      .filter((svc) => {
        const level = tier.serviceLevels.find((sl) => sl.serviceId === svc.id);
        return (
          !level ||
          (level.level !== "NOT_INCLUDED" && level.level !== "NOT_APPLICABLE")
        );
      })
      .map((svc) =>
        mapServiceToInput(
          svc,
          tier,
          globalCurrency,
          (recurringOption?.billingCycle ??
            group.billingCycle) as SIBillingCycle,
        ),
      );

    return {
      id: generateId(),
      name: group.name,
      optional: false,
      costType: "RECURRING",
      setupAmount,
      setupCurrency,
      recurringAmount: discountedAmount,
      recurringCurrency: recurringOption?.currency ?? globalCurrency,
      recurringBillingCycle: (recurringOption?.billingCycle ??
        group.billingCycle) as SIBillingCycle,
      recurringDiscount: discountInput,
      services: mappedServices,
    };
  });
}

/**
 * Maps finalConfiguration option group configs and add-on configs
 * into subscription service groups.
 */
function mapFinalConfigGroups(
  offering: ServiceOfferingState,
  tier: ServiceSubscriptionTier,
  finalConfig: FinalConfiguration,
  globalCurrency: string,
  groupedServiceIds: Set<string>,
  serviceGroups: InitializeServiceGroupInput[],
): void {
  // Non-add-on option groups
  for (const ogConfig of finalConfig.optionGroupConfigs) {
    const og = offering.optionGroups.find(
      (g) => g.id === ogConfig.optionGroupId,
    );
    if (!og || og.isAddOn) continue;

    const services = offering.services.filter((s) => s.optionGroupId === og.id);
    if (services.length === 0) continue;
    services.forEach((s) => groupedServiceIds.add(s.id));

    serviceGroups.push({
      id: generateId(),
      name: og.name,
      optional: false,
      costType: og.costType ?? undefined,
      recurringAmount: ogConfig.recurringAmount ?? undefined,
      recurringCurrency: ogConfig.currency ?? globalCurrency,
      recurringBillingCycle: ogConfig.effectiveBillingCycle as SIBillingCycle,
      recurringDiscount: mapResolvedDiscount(
        ogConfig.discount,
        og.discountMode === "INHERIT_TIER"
          ? "TIER_INHERITED"
          : "GROUP_INDEPENDENT",
      ),
      setupAmount: ogConfig.setupCost ?? undefined,
      setupCurrency: ogConfig.setupCostCurrency ?? undefined,
      services: services.map((svc) =>
        mapServiceToInput(
          svc,
          tier,
          globalCurrency,
          ogConfig.effectiveBillingCycle as SIBillingCycle,
        ),
      ),
    });
  }

  // Add-on option groups
  for (const aoConfig of finalConfig.addOnConfigs) {
    const og = offering.optionGroups.find(
      (g) => g.id === aoConfig.optionGroupId,
    );
    if (!og) continue;

    const services = offering.services.filter((s) => s.optionGroupId === og.id);
    if (services.length === 0) continue;
    services.forEach((s) => groupedServiceIds.add(s.id));

    serviceGroups.push({
      id: generateId(),
      name: og.name,
      optional: true,
      costType: og.costType ?? undefined,
      recurringAmount: aoConfig.recurringAmount ?? undefined,
      recurringCurrency: aoConfig.currency ?? globalCurrency,
      recurringBillingCycle: aoConfig.selectedBillingCycle as SIBillingCycle,
      recurringDiscount: mapResolvedDiscount(
        aoConfig.discount,
        og.discountMode === "INHERIT_TIER"
          ? "TIER_INHERITED"
          : "GROUP_INDEPENDENT",
      ),
      setupAmount: aoConfig.setupCost ?? undefined,
      setupCurrency: aoConfig.setupCostCurrency ?? undefined,
      services: services.map((svc) =>
        mapServiceToInput(
          svc,
          tier,
          globalCurrency,
          aoConfig.selectedBillingCycle as SIBillingCycle,
        ),
      ),
    });
  }
}

/**
 * Maps a single service from the offering to an InitializeServiceInput.
 * Includes name, description, customValue from tier service levels,
 * billing cycle, and usage metrics.
 */
function mapServiceToInput(
  svc: SOService,
  tier: ServiceSubscriptionTier,
  globalCurrency: string,
  billingCycle: SIBillingCycle,
): InitializeServiceInput {
  const level = tier.serviceLevels.find((sl) => sl.serviceId === svc.id);
  const metrics = mapUsageLimits(svc.id, tier.usageLimits, globalCurrency);

  return {
    id: generateId(),
    name: svc.title,
    description: svc.description ?? null,
    customValue: level?.customValue ?? null,
    recurringBillingCycle: billingCycle,
    metrics,
  };
}

/**
 * Maps a ResolvedDiscount from the offering to a DiscountInfoInitInput,
 * or returns undefined if no discount.
 */
function mapResolvedDiscount(
  discount: ResolvedDiscount | null | undefined,
  source: "TIER_INHERITED" | "GROUP_INDEPENDENT",
): DiscountInfoInitInput | undefined {
  if (!discount) return undefined;
  return {
    originalAmount: discount.originalAmount,
    discountType: discount.discountType,
    discountValue: discount.discountValue,
    source,
  };
}

/**
 * Maps usage limits from the tier to InitializeMetricInput for a given service.
 */
function mapUsageLimits(
  serviceId: string,
  usageLimits: ServiceUsageLimit[],
  globalCurrency: string,
): InitializeMetricInput[] {
  const limits = usageLimits.filter((ul) => ul.serviceId === serviceId);

  return limits.map((ul) => {
    // Map SO's UsageResetCycle to SI's ResetPeriod (skip "NONE")
    const usageResetPeriod =
      ul.resetCycle && ul.resetCycle !== "NONE"
        ? (ul.resetCycle as InitializeMetricInput["usageResetPeriod"])
        : undefined;

    return {
      id: generateId(),
      name: ul.metric,
      unitName: ul.unitName ?? "units",
      limit: ul.freeLimit ?? ul.paidLimit ?? null,
      freeLimit: ul.freeLimit ?? null,
      paidLimit: ul.paidLimit ?? null,
      currentUsage: 0,
      usageResetPeriod,
      unitCostAmount: ul.unitPrice ?? undefined,
      unitCostCurrency: ul.unitPriceCurrency ?? globalCurrency,
      unitCostBillingCycle: usageResetPeriod ? ("MONTHLY" as const) : undefined,
    };
  });
}
