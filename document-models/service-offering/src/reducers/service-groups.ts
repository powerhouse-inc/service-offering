import {
  UpdateServiceGroupNotFoundError,
  DeleteServiceGroupNotFoundError,
  AddServiceGroupTierPricingNotFoundError,
  SetServiceGroupSetupCostNotFoundError,
  SetServiceGroupSetupCostTierPricingNotFoundError,
  RemoveServiceGroupSetupCostNotFoundError,
  RemoveServiceGroupSetupCostTierPricingNotFoundError,
  AddRecurringPriceOptionServiceGroupNotFoundError,
  AddRecurringPriceOptionTierPricingNotFoundError,
  UpdateRecurringPriceOptionServiceGroupNotFoundError,
  UpdateRecurringPriceOptionTierPricingNotFoundError,
  UpdateRecurringPriceOptionNotFoundError,
  RemoveRecurringPriceOptionServiceGroupNotFoundError,
  RemoveRecurringPriceOptionTierPricingNotFoundError,
  RemoveServiceGroupTierPricingNotFoundError,
  InvalidSetupDiscountError,
  IncompleteSetupDiscountError,
} from "../../gen/service-groups/error.js";
import type { ServiceOfferingServiceGroupsOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingServiceGroupsOperations: ServiceOfferingServiceGroupsOperations =
  {
    addServiceGroupOperation(state, action) {
      state.serviceGroups.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        billingCycle: action.input.billingCycle,
        displayOrder: action.input.displayOrder || null,
        tierPricing: [],
      });
      state.lastModified = action.input.lastModified;
    },
    updateServiceGroupOperation(state, action) {
      const sg = state.serviceGroups.find((g) => g.id === action.input.id);
      if (!sg) {
        throw new UpdateServiceGroupNotFoundError(
          `Service group with ID ${action.input.id} not found`,
        );
      }
      if (action.input.name) sg.name = action.input.name;
      if (action.input.description !== undefined)
        sg.description = action.input.description || null;
      if (action.input.billingCycle)
        sg.billingCycle = action.input.billingCycle;
      if (action.input.displayOrder !== undefined)
        sg.displayOrder = action.input.displayOrder || null;
      state.lastModified = action.input.lastModified;
    },
    deleteServiceGroupOperation(state, action) {
      const index = state.serviceGroups.findIndex(
        (g) => g.id === action.input.id,
      );
      if (index === -1) {
        throw new DeleteServiceGroupNotFoundError(
          `Service group with ID ${action.input.id} not found`,
        );
      }
      state.serviceGroups.splice(index, 1);
      state.lastModified = action.input.lastModified;
    },
    reorderServiceGroupsOperation(state, action) {
      const ordered: typeof state.serviceGroups = [];
      for (const id of action.input.order) {
        const sg = state.serviceGroups.find((g) => g.id === id);
        if (sg) {
          ordered.push(sg);
        }
      }
      state.serviceGroups = ordered;
      state.lastModified = action.input.lastModified;
    },
    addServiceGroupTierPricingOperation(state, action) {
      const sg = state.serviceGroups.find(
        (g) => g.id === action.input.serviceGroupId,
      );
      if (!sg) {
        throw new AddServiceGroupTierPricingNotFoundError(
          `Service group with ID ${action.input.serviceGroupId} not found`,
        );
      }
      sg.tierPricing.push({
        id: action.input.tierPricingId,
        tierId: action.input.tierId,
        setupCostsPerCycle: [],
        recurringPricing: [],
      });
      state.lastModified = action.input.lastModified;
    },
    setServiceGroupSetupCostOperation(state, action) {
      const sg = state.serviceGroups.find(
        (g) => g.id === action.input.serviceGroupId,
      );
      if (!sg) {
        throw new SetServiceGroupSetupCostNotFoundError(
          `Service group with ID ${action.input.serviceGroupId} not found`,
        );
      }
      const tp = sg.tierPricing.find((t) => t.tierId === action.input.tierId);
      if (!tp) {
        throw new SetServiceGroupSetupCostTierPricingNotFoundError(
          `Tier pricing for tier ${action.input.tierId} not found in service group ${action.input.serviceGroupId}`,
        );
      }
      const hasDiscountType =
        action.input.discountType !== undefined &&
        action.input.discountType !== null;
      const hasDiscountValue =
        action.input.discountValue !== undefined &&
        action.input.discountValue !== null;
      if (hasDiscountType !== hasDiscountValue) {
        throw new IncompleteSetupDiscountError(
          "Both discountType and discountValue must be provided together or both omitted",
        );
      }
      if (hasDiscountValue && action.input.discountValue! < 0) {
        throw new InvalidSetupDiscountError(
          "Discount value cannot be negative",
        );
      }
      if (
        hasDiscountType &&
        action.input.discountType === "PERCENTAGE" &&
        action.input.discountValue! > 100
      ) {
        throw new InvalidSetupDiscountError(
          "Percentage discount cannot exceed 100",
        );
      }
      const existingIndex = tp.setupCostsPerCycle.findIndex(
        (sc) => sc.billingCycle === sg.billingCycle,
      );
      const setupCost = {
        id: `${action.input.serviceGroupId}-${action.input.tierId}-setup`,
        billingCycle: sg.billingCycle,
        amount: action.input.amount,
        currency: action.input.currency,
        discount:
          hasDiscountType && hasDiscountValue
            ? {
                discountType: action.input.discountType!,
                discountValue: action.input.discountValue!,
              }
            : null,
      };
      if (existingIndex !== -1) {
        tp.setupCostsPerCycle[existingIndex] = setupCost;
      } else {
        tp.setupCostsPerCycle.push(setupCost);
      }
      state.lastModified = action.input.lastModified;
    },
    removeServiceGroupSetupCostOperation(state, action) {
      const sg = state.serviceGroups.find(
        (g) => g.id === action.input.serviceGroupId,
      );
      if (!sg) {
        throw new RemoveServiceGroupSetupCostNotFoundError(
          `Service group with ID ${action.input.serviceGroupId} not found`,
        );
      }
      const tp = sg.tierPricing.find((t) => t.tierId === action.input.tierId);
      if (!tp) {
        throw new RemoveServiceGroupSetupCostTierPricingNotFoundError(
          `Tier pricing for tier ${action.input.tierId} not found in service group ${action.input.serviceGroupId}`,
        );
      }
      tp.setupCostsPerCycle = [];
      state.lastModified = action.input.lastModified;
    },
    addRecurringPriceOptionOperation(state, action) {
      const sg = state.serviceGroups.find(
        (g) => g.id === action.input.serviceGroupId,
      );
      if (!sg) {
        throw new AddRecurringPriceOptionServiceGroupNotFoundError(
          `Service group with ID ${action.input.serviceGroupId} not found`,
        );
      }
      const tp = sg.tierPricing.find((t) => t.tierId === action.input.tierId);
      if (!tp) {
        throw new AddRecurringPriceOptionTierPricingNotFoundError(
          `Tier pricing for tier ${action.input.tierId} not found in service group ${action.input.serviceGroupId}`,
        );
      }
      tp.recurringPricing.push({
        id: action.input.priceOptionId,
        billingCycle: action.input.billingCycle,
        amount: action.input.amount,
        currency: action.input.currency,
        discount: null,
      });
      state.lastModified = action.input.lastModified;
    },
    updateRecurringPriceOptionOperation(state, action) {
      const sg = state.serviceGroups.find(
        (g) => g.id === action.input.serviceGroupId,
      );
      if (!sg) {
        throw new UpdateRecurringPriceOptionServiceGroupNotFoundError(
          `Service group with ID ${action.input.serviceGroupId} not found`,
        );
      }
      const tp = sg.tierPricing.find((t) => t.tierId === action.input.tierId);
      if (!tp) {
        throw new UpdateRecurringPriceOptionTierPricingNotFoundError(
          `Tier pricing for tier ${action.input.tierId} not found in service group ${action.input.serviceGroupId}`,
        );
      }
      const rpo = tp.recurringPricing.find(
        (r) => r.id === action.input.priceOptionId,
      );
      if (!rpo) {
        throw new UpdateRecurringPriceOptionNotFoundError(
          `Recurring price option with ID ${action.input.priceOptionId} not found`,
        );
      }
      if (action.input.billingCycle)
        rpo.billingCycle = action.input.billingCycle;
      if (action.input.amount !== undefined && action.input.amount !== null)
        rpo.amount = action.input.amount;
      if (action.input.currency) rpo.currency = action.input.currency;
      if (action.input.discount !== undefined) {
        rpo.discount = action.input.discount
          ? {
              discountType: action.input.discount.discountType,
              discountValue: action.input.discount.discountValue,
            }
          : null;
      }
      state.lastModified = action.input.lastModified;
    },
    removeRecurringPriceOptionOperation(state, action) {
      const sg = state.serviceGroups.find(
        (g) => g.id === action.input.serviceGroupId,
      );
      if (!sg) {
        throw new RemoveRecurringPriceOptionServiceGroupNotFoundError(
          `Service group with ID ${action.input.serviceGroupId} not found`,
        );
      }
      const tp = sg.tierPricing.find((t) => t.tierId === action.input.tierId);
      if (!tp) {
        throw new RemoveRecurringPriceOptionTierPricingNotFoundError(
          `Tier pricing for tier ${action.input.tierId} not found in service group ${action.input.serviceGroupId}`,
        );
      }
      const index = tp.recurringPricing.findIndex(
        (r) => r.id === action.input.priceOptionId,
      );
      if (index !== -1) {
        tp.recurringPricing.splice(index, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    removeServiceGroupTierPricingOperation(state, action) {
      const sg = state.serviceGroups.find(
        (g) => g.id === action.input.serviceGroupId,
      );
      if (!sg) {
        throw new RemoveServiceGroupTierPricingNotFoundError(
          `Service group with ID ${action.input.serviceGroupId} not found`,
        );
      }
      const index = sg.tierPricing.findIndex(
        (t) => t.tierId === action.input.tierId,
      );
      if (index !== -1) {
        sg.tierPricing.splice(index, 1);
      }
      state.lastModified = action.input.lastModified;
    },
  };
