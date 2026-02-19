import {
  SetDefaultCycleTierNotFoundError,
  SetCycleDiscountsTierNotFoundError,
  SetPricingModeTierNotFoundError,
} from "../../gen/tier-management/error.js";
import type { ServiceOfferingTierManagementOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingTierManagementOperations: ServiceOfferingTierManagementOperations =
  {
    addTierOperation(state, action) {
      state.tiers.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        serviceLevels: [],
        usageLimits: [],
        pricing: {
          amount: action.input.amount || null,
          currency: action.input.currency,
        },
        isCustomPricing: action.input.isCustomPricing || false,
        pricingMode: null,
        defaultBillingCycle: null,
        billingCycleDiscounts: [],
      });
      state.lastModified = action.input.lastModified;
    },
    updateTierOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.id);
      if (tier) {
        if (action.input.name) {
          tier.name = action.input.name;
        }
        if (
          action.input.description !== undefined &&
          action.input.description !== null
        ) {
          tier.description = action.input.description;
        }
        if (
          action.input.isCustomPricing !== undefined &&
          action.input.isCustomPricing !== null
        ) {
          tier.isCustomPricing = action.input.isCustomPricing;
        }
      }
      state.lastModified = action.input.lastModified;
    },
    updateTierPricingOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (tier) {
        if (action.input.amount !== undefined) {
          tier.pricing.amount = action.input.amount;
        }
        if (action.input.currency) {
          tier.pricing.currency = action.input.currency;
        }
      }
      state.lastModified = action.input.lastModified;
    },
    deleteTierOperation(state, action) {
      const tierIndex = state.tiers.findIndex((t) => t.id === action.input.id);
      if (tierIndex !== -1) {
        state.tiers.splice(tierIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    addServiceLevelOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (tier) {
        tier.serviceLevels.push({
          id: action.input.serviceLevelId,
          serviceId: action.input.serviceId,
          level: action.input.level,
          optionGroupId: action.input.optionGroupId || null,
          customValue: action.input.customValue || null,
        });
      }
      state.lastModified = action.input.lastModified;
    },
    updateServiceLevelOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (tier) {
        const serviceLevel = tier.serviceLevels.find(
          (sl) => sl.id === action.input.serviceLevelId,
        );
        if (serviceLevel) {
          if (action.input.level) {
            serviceLevel.level = action.input.level;
          }
          if (action.input.optionGroupId !== undefined) {
            serviceLevel.optionGroupId = action.input.optionGroupId || null;
          }
          if (action.input.customValue !== undefined) {
            serviceLevel.customValue = action.input.customValue || null;
          }
        }
      }
      state.lastModified = action.input.lastModified;
    },
    removeServiceLevelOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (tier) {
        const serviceLevelIndex = tier.serviceLevels.findIndex(
          (sl) => sl.id === action.input.serviceLevelId,
        );
        if (serviceLevelIndex !== -1) {
          tier.serviceLevels.splice(serviceLevelIndex, 1);
        }
      }
      state.lastModified = action.input.lastModified;
    },
    addUsageLimitOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (tier) {
        tier.usageLimits.push({
          id: action.input.limitId,
          serviceId: action.input.serviceId,
          metric: action.input.metric,
          unitName: action.input.unitName || null,
          freeLimit: action.input.freeLimit ?? null,
          paidLimit: action.input.paidLimit ?? null,
          resetCycle: action.input.resetCycle || null,
          notes: action.input.notes || null,
          unitPrice: action.input.unitPrice ?? null,
          unitPriceCurrency: action.input.unitPriceCurrency || null,
        });
      }
      state.lastModified = action.input.lastModified;
    },
    updateUsageLimitOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (tier) {
        const usageLimit = tier.usageLimits.find(
          (ul) => ul.id === action.input.limitId,
        );
        if (usageLimit) {
          if (action.input.metric) {
            usageLimit.metric = action.input.metric;
          }
          if (action.input.unitName !== undefined) {
            usageLimit.unitName = action.input.unitName || null;
          }
          if (action.input.freeLimit !== undefined) {
            usageLimit.freeLimit = action.input.freeLimit ?? null;
          }
          if (action.input.paidLimit !== undefined) {
            usageLimit.paidLimit = action.input.paidLimit ?? null;
          }
          if (action.input.resetCycle !== undefined) {
            usageLimit.resetCycle = action.input.resetCycle || null;
          }
          if (action.input.notes !== undefined) {
            usageLimit.notes = action.input.notes || null;
          }
          if (action.input.unitPrice !== undefined) {
            usageLimit.unitPrice = action.input.unitPrice ?? null;
          }
          if (action.input.unitPriceCurrency !== undefined) {
            usageLimit.unitPriceCurrency =
              action.input.unitPriceCurrency || null;
          }
        }
      }
      state.lastModified = action.input.lastModified;
    },
    removeUsageLimitOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (tier) {
        const limitIndex = tier.usageLimits.findIndex(
          (ul) => ul.id === action.input.limitId,
        );
        if (limitIndex !== -1) {
          tier.usageLimits.splice(limitIndex, 1);
        }
      }
      state.lastModified = action.input.lastModified;
    },
    setTierDefaultBillingCycleOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (!tier) {
        throw new SetDefaultCycleTierNotFoundError(
          "Tier with the specified ID does not exist",
        );
      }
      tier.defaultBillingCycle = action.input.defaultBillingCycle;
      state.lastModified = action.input.lastModified;
    },
    setTierBillingCycleDiscountsOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (!tier) {
        throw new SetCycleDiscountsTierNotFoundError(
          "Tier with the specified ID does not exist",
        );
      }
      tier.billingCycleDiscounts = action.input.discounts;
      state.lastModified = action.input.lastModified;
    },
    setTierPricingModeOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (!tier) {
        throw new SetPricingModeTierNotFoundError(
          "Tier with the specified ID does not exist",
        );
      }
      tier.pricingMode = action.input.pricingMode;
      state.lastModified = action.input.lastModified;
    },
  };
