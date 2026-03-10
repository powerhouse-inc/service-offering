import type { ServiceOfferingTiersOperations } from "@powerhousedao/service-offering/document-models/service-offering/v1";

export const serviceOfferingTiersOperations: ServiceOfferingTiersOperations = {
  addTierOperation(state, action) {
    state.tiers.push({
      id: action.input.id,
      name: action.input.name,
      description: action.input.description || null,
      isCustomPricing: action.input.isCustomPricing || false,
      pricingMode: "FIXED",
      pricing: null,
      defaultBillingCycle: null,
      billingCycleDiscounts: [],
      serviceLevels: [],
      usageLimits: [],
    });
    state.lastModified = action.input.lastModified;
  },
  updateTierOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.id);
    if (tier) {
      if (action.input.name) tier.name = action.input.name;
      if (action.input.description !== undefined)
        tier.description = action.input.description || null;
      if (
        action.input.isCustomPricing !== undefined &&
        action.input.isCustomPricing !== null
      )
        tier.isCustomPricing = action.input.isCustomPricing;
    }
    state.lastModified = action.input.lastModified;
  },
  updateTierPricingOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      if (!tier.pricing) {
        tier.pricing = {
          amount: action.input.amount,
          currency: action.input.currency,
        };
      } else {
        tier.pricing.amount = action.input.amount;
        tier.pricing.currency = action.input.currency;
      }
    }
    state.lastModified = action.input.lastModified;
  },
  deleteTierOperation(state, action) {
    const index = state.tiers.findIndex((t) => t.id === action.input.id);
    if (index !== -1) {
      state.tiers.splice(index, 1);
    }
    state.lastModified = action.input.lastModified;
  },
  addServiceLevelOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      tier.serviceLevels.push({
        id: action.input.id,
        serviceId: action.input.serviceId,
        level: action.input.level,
        description: action.input.description || null,
      });
    }
    state.lastModified = action.input.lastModified;
  },
  updateServiceLevelOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      const sl = tier.serviceLevels.find((s) => s.id === action.input.id);
      if (sl) {
        if (action.input.level) sl.level = action.input.level;
        if (action.input.description !== undefined)
          sl.description = action.input.description || null;
      }
    }
    state.lastModified = action.input.lastModified;
  },
  removeServiceLevelOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      const index = tier.serviceLevels.findIndex(
        (s) => s.id === action.input.id,
      );
      if (index !== -1) {
        tier.serviceLevels.splice(index, 1);
      }
    }
    state.lastModified = action.input.lastModified;
  },
  addUsageLimitOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      tier.usageLimits.push({
        id: action.input.id,
        name: action.input.name,
        limit: action.input.limit,
        unit: action.input.unit || null,
      });
    }
    state.lastModified = action.input.lastModified;
  },
  updateUsageLimitOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      const ul = tier.usageLimits.find((u) => u.id === action.input.id);
      if (ul) {
        if (action.input.limit !== undefined && action.input.limit !== null)
          ul.limit = action.input.limit;
        if (action.input.name !== undefined && action.input.name !== null)
          ul.name = action.input.name;
        if (action.input.unit !== undefined)
          ul.unit = action.input.unit || null;
      }
    }
    state.lastModified = action.input.lastModified;
  },
  removeUsageLimitOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      const index = tier.usageLimits.findIndex((u) => u.id === action.input.id);
      if (index !== -1) {
        tier.usageLimits.splice(index, 1);
      }
    }
    state.lastModified = action.input.lastModified;
  },
  setTierPricingModeOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      tier.pricingMode = action.input.pricingMode;
    }
    state.lastModified = action.input.lastModified;
  },
  setTierDefaultBillingCycleOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      tier.defaultBillingCycle = action.input.defaultBillingCycle;
    }
    state.lastModified = action.input.lastModified;
  },
  setTierBillingCycleDiscountsOperation(state, action) {
    const tier = state.tiers.find((t) => t.id === action.input.tierId);
    if (tier) {
      tier.billingCycleDiscounts = action.input.discounts.map((d) => ({
        cycle: d.cycle,
        discountType: d.discountType,
        discountValue: d.discountValue,
      }));
    }
    state.lastModified = action.input.lastModified;
  },
};
