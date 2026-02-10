import {
  AddPricingOptionTierNotFoundError,
  UpdatePricingOptionTierNotFoundError,
  PricingOptionNotFoundError,
  RemovePricingOptionTierNotFoundError,
  RemovePricingOptionNotFoundError,
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
        pricingOptions: [],
        isCustomPricing: action.input.isCustomPricing || false,
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
    addTierPricingOptionOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (!tier) {
        throw new AddPricingOptionTierNotFoundError(
          "Tier with the specified ID does not exist",
        );
      }
      const isDefault =
        action.input.isDefault || tier.pricingOptions.length === 0;
      if (isDefault) {
        tier.pricingOptions.forEach((po) => {
          po.isDefault = false;
        });
      }
      tier.pricingOptions.push({
        id: action.input.pricingOptionId,
        amount: action.input.amount,
        currency: action.input.currency,
        isDefault: isDefault,
      });
      state.lastModified = action.input.lastModified;
    },
    updateTierPricingOptionOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (!tier) {
        throw new UpdatePricingOptionTierNotFoundError(
          "Tier with the specified ID does not exist",
        );
      }
      const pricingOption = tier.pricingOptions.find(
        (po) => po.id === action.input.pricingOptionId,
      );
      if (!pricingOption) {
        throw new PricingOptionNotFoundError(
          "Pricing option with the specified ID does not exist",
        );
      }
      if (action.input.amount !== undefined && action.input.amount !== null) {
        pricingOption.amount = action.input.amount;
      }
      if (action.input.currency) {
        pricingOption.currency = action.input.currency;
      }
      if (action.input.isDefault === true) {
        tier.pricingOptions.forEach((po) => {
          po.isDefault = false;
        });
        pricingOption.isDefault = true;
      }
      state.lastModified = action.input.lastModified;
    },
    removeTierPricingOptionOperation(state, action) {
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (!tier) {
        throw new RemovePricingOptionTierNotFoundError(
          "Tier with the specified ID does not exist",
        );
      }
      const optionIndex = tier.pricingOptions.findIndex(
        (po) => po.id === action.input.pricingOptionId,
      );
      if (optionIndex === -1) {
        throw new RemovePricingOptionNotFoundError(
          "Pricing option with the specified ID does not exist",
        );
      }
      const wasDefault = tier.pricingOptions[optionIndex].isDefault;
      tier.pricingOptions.splice(optionIndex, 1);
      if (wasDefault && tier.pricingOptions.length > 0) {
        tier.pricingOptions[0].isDefault = true;
      }
      state.lastModified = action.input.lastModified;
    },
  };
