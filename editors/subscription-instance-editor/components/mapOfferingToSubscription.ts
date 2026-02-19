import { generateId } from "document-model/core";
import type {
  ServiceOfferingState,
  ServiceSubscriptionTier,
  ServiceGroup as SOServiceGroup,
  Service as SOService,
  ServiceUsageLimit,
  RecurringPriceOption,
  BillingCycle as SOBillingCycle,
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
 * 1. Find the selected tier
 * 2. For each service group, find the tier-specific pricing for the selected billing cycle
 * 3. Apply billing cycle discounts if any
 * 4. Map services based on service level bindings (INCLUDED, OPTIONAL, CUSTOM, VARIABLE)
 * 5. Map usage limits to metrics with freeLimit/paidLimit
 * 6. Calculate tier price from service group sums (CALCULATED mode) or use manual price
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

  const currency = tier.pricing.currency;
  const pricingMode = tier.pricingMode || "MANUAL_OVERRIDE";

  // Map service groups with their tier-specific pricing
  const serviceGroups = mapServiceGroups(
    offering.serviceGroups,
    tier,
    selectedBillingCycle,
    currency,
  );

  // Map standalone services (not in any group) based on tier service levels
  const standaloneServices = mapStandaloneServices(
    offering.services,
    tier,
    currency,
  );

  // Calculate tier price
  let tierPrice: number | undefined;
  if (pricingMode === "CALCULATED") {
    tierPrice = serviceGroups.reduce((sum, grp) => {
      return sum + (grp.recurringAmount ?? 0);
    }, 0);
  } else {
    tierPrice = tier.pricing.amount ?? undefined;
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

function mapServiceGroups(
  soGroups: SOServiceGroup[],
  tier: ServiceSubscriptionTier,
  selectedBillingCycle: SIBillingCycle,
  globalCurrency: string,
): InitializeServiceGroupInput[] {
  return soGroups.map((group) => {
    // Find tier-specific pricing for this group
    const tierPricing = group.tierPricing.find((tp) => tp.tierId === tier.id);

    // Find the recurring price option matching the selected billing cycle
    let recurringOption: RecurringPriceOption | undefined;
    if (tierPricing) {
      recurringOption = tierPricing.recurringPricing.find(
        (rp) => rp.billingCycle === selectedBillingCycle,
      );
      // Fallback to group's own billing cycle if no match
      if (!recurringOption) {
        recurringOption = tierPricing.recurringPricing.find(
          (rp) => rp.billingCycle === (group.billingCycle as string),
        );
      }
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
        if (rule.discountType === "PERCENTAGE") {
          discountedAmount = originalAmount * (1 - rule.discountValue / 100);
        } else {
          discountedAmount = originalAmount - rule.discountValue;
        }
        discountInput = {
          originalAmount,
          discountType: rule.discountType,
          discountValue: rule.discountValue,
          source: "TIER_INHERITED",
        };
      }
    }

    // Also check if the recurring option itself has a discount
    if (recurringOption?.discount && !discountInput) {
      const originalAmount = recurringOption.amount;
      const d = recurringOption.discount;
      if (d.discountType === "PERCENTAGE") {
        discountedAmount = originalAmount * (1 - d.discountValue / 100);
      } else {
        discountedAmount = originalAmount - d.discountValue;
      }
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

    // Map services in this group based on tier service levels
    const groupServices = mapGroupServices(group.id, tier, globalCurrency);

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
      services: groupServices,
    };
  });
}

function mapGroupServices(
  groupId: string,
  tier: ServiceSubscriptionTier,
  globalCurrency: string,
): InitializeServiceInput[] {
  // Find services that belong to this group via tier service levels
  const relevantLevels = tier.serviceLevels.filter((sl) => {
    // Include services that are INCLUDED, OPTIONAL, CUSTOM, or VARIABLE for this tier
    return (
      sl.level === "INCLUDED" ||
      sl.level === "OPTIONAL" ||
      sl.level === "CUSTOM" ||
      sl.level === "VARIABLE"
    );
  });

  return relevantLevels.map((sl) => {
    // Map usage limits for this service
    const metrics = mapUsageLimits(
      sl.serviceId,
      tier.usageLimits,
      globalCurrency,
    );

    return {
      id: generateId(),
      name: null,
      description: null,
      customValue: sl.customValue ?? null,
      metrics,
    };
  });
}

function mapStandaloneServices(
  soServices: SOService[],
  tier: ServiceSubscriptionTier,
  globalCurrency: string,
): InitializeServiceInput[] {
  // Find services that are NOT in any service group
  const standaloneServices = soServices.filter((s) => !s.serviceGroupId);

  return standaloneServices
    .filter((svc) => {
      // Only include services that have a service level for this tier
      const level = tier.serviceLevels.find((sl) => sl.serviceId === svc.id);
      return (
        level &&
        level.level !== "NOT_INCLUDED" &&
        level.level !== "NOT_APPLICABLE"
      );
    })
    .map((svc) => {
      const level = tier.serviceLevels.find((sl) => sl.serviceId === svc.id);
      const metrics = mapUsageLimits(svc.id, tier.usageLimits, globalCurrency);

      return {
        id: generateId(),
        name: svc.title,
        description: svc.description ?? null,
        customValue: level?.customValue ?? null,
        metrics,
      };
    });
}

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
