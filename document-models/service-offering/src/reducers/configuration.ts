import {
  SetConfigTierNotFoundError,
  SetConfigOptionGroupNotFoundError,
  SetConfigAddOnGroupNotFoundError,
} from "../../gen/configuration/error.js";
import type { ResolvedDiscountInput } from "../../gen/schema/types.js";
import type { ServiceOfferingConfigurationOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingConfigurationOperations: ServiceOfferingConfigurationOperations =
  {
    setFinalConfigurationOperation(state, action) {
      const tier = state.tiers.find(
        (t) => t.id === action.input.selectedTierId,
      );
      if (!tier) {
        throw new SetConfigTierNotFoundError(
          `Tier with ID ${action.input.selectedTierId} not found`,
        );
      }
      for (const ogConfig of action.input.optionGroupConfigs) {
        const og = state.optionGroups.find(
          (g) => g.id === ogConfig.optionGroupId,
        );
        if (!og) {
          throw new SetConfigOptionGroupNotFoundError(
            `Option group with ID ${ogConfig.optionGroupId} not found`,
          );
        }
      }
      for (const addonConfig of action.input.addOnConfigs) {
        const og = state.optionGroups.find(
          (g) => g.id === addonConfig.optionGroupId,
        );
        if (!og) {
          throw new SetConfigAddOnGroupNotFoundError(
            `Option group (add-on) with ID ${addonConfig.optionGroupId} not found`,
          );
        }
      }
      const mapDiscount = (d: ResolvedDiscountInput | null | undefined) =>
        d
          ? {
              discountType: d.discountType,
              discountValue: d.discountValue,
              originalAmount: d.originalAmount,
              discountedAmount: d.discountedAmount,
            }
          : null;
      state.finalConfiguration = {
        selectedTierId: action.input.selectedTierId,
        selectedBillingCycle: action.input.selectedBillingCycle,
        tierBasePrice: action.input.tierBasePrice || null,
        tierCurrency: action.input.tierCurrency,
        optionGroupConfigs: action.input.optionGroupConfigs.map((ogc) => ({
          id: ogc.id,
          optionGroupId: ogc.optionGroupId,
          effectiveBillingCycle: ogc.effectiveBillingCycle,
          billingCycleOverridden: ogc.billingCycleOverridden,
          discountStripped: ogc.discountStripped,
          recurringAmount: ogc.recurringAmount || null,
          currency: ogc.currency || null,
          discount: mapDiscount(ogc.discount),
          setupCost: ogc.setupCost || null,
          setupCostCurrency: ogc.setupCostCurrency || null,
          setupCostDiscount: mapDiscount(ogc.setupCostDiscount),
        })),
        addOnConfigs: action.input.addOnConfigs.map((ac) => ({
          id: ac.id,
          optionGroupId: ac.optionGroupId,
          selectedBillingCycle: ac.selectedBillingCycle,
          recurringAmount: ac.recurringAmount || null,
          currency: ac.currency || null,
          discount: mapDiscount(ac.discount),
          setupCost: ac.setupCost || null,
          setupCostCurrency: ac.setupCostCurrency || null,
          setupCostDiscount: mapDiscount(ac.setupCostDiscount),
        })),
        lastModified: action.input.lastModified,
      };
    },
    clearFinalConfigurationOperation(state) {
      state.finalConfiguration = null;
    },
  };
