import type { ServiceOfferingOptionGroupsOperations } from "@powerhousedao/service-offering/document-models/service-offering/v1";

export const serviceOfferingOptionGroupsOperations: ServiceOfferingOptionGroupsOperations =
  {
    addOptionGroupOperation(state, action) {
      state.optionGroups.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        isAddOn: action.input.isAddOn,
        defaultSelected: action.input.defaultSelected,
        pricingMode: "STANDALONE",
        standalonePricing: null,
        tierDependentPricing: [],
        costType: null,
        availableBillingCycles: [],
        billingCycleDiscounts: [],
        price: null,
        currency: null,
        discountMode: null,
      });
      state.lastModified = action.input.lastModified;
    },
    updateOptionGroupOperation(state, action) {
      const og = state.optionGroups.find((g) => g.id === action.input.id);
      if (og) {
        if (action.input.name) og.name = action.input.name;
        if (action.input.description !== undefined)
          og.description = action.input.description || null;
        if (action.input.isAddOn !== undefined && action.input.isAddOn !== null)
          og.isAddOn = action.input.isAddOn;
        if (
          action.input.defaultSelected !== undefined &&
          action.input.defaultSelected !== null
        )
          og.defaultSelected = action.input.defaultSelected;
      }
      state.lastModified = action.input.lastModified;
    },
    deleteOptionGroupOperation(state, action) {
      const index = state.optionGroups.findIndex(
        (g) => g.id === action.input.id,
      );
      if (index !== -1) {
        state.optionGroups.splice(index, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    setOptionGroupStandalonePricingOperation(state, action) {
      const og = state.optionGroups.find(
        (g) => g.id === action.input.optionGroupId,
      );
      if (og) {
        og.pricingMode = "STANDALONE";
        og.standalonePricing = {
          amount: action.input.amount,
          currency: action.input.currency,
        };
      }
      state.lastModified = action.input.lastModified;
    },
    addOptionGroupTierPricingOperation(state, action) {
      const og = state.optionGroups.find(
        (g) => g.id === action.input.optionGroupId,
      );
      if (og) {
        og.pricingMode = "TIER_DEPENDENT";
        og.tierDependentPricing.push({
          tierId: action.input.tierId,
          amount: action.input.amount,
          currency: action.input.currency,
        });
      }
      state.lastModified = action.input.lastModified;
    },
    updateOptionGroupTierPricingOperation(state, action) {
      const og = state.optionGroups.find(
        (g) => g.id === action.input.optionGroupId,
      );
      if (og) {
        const tp = og.tierDependentPricing.find(
          (t) => t.tierId === action.input.tierId,
        );
        if (tp) {
          tp.amount = action.input.amount;
          tp.currency = action.input.currency;
        }
      }
      state.lastModified = action.input.lastModified;
    },
    removeOptionGroupTierPricingOperation(state, action) {
      const og = state.optionGroups.find(
        (g) => g.id === action.input.optionGroupId,
      );
      if (og) {
        const index = og.tierDependentPricing.findIndex(
          (t) => t.tierId === action.input.tierId,
        );
        if (index !== -1) {
          og.tierDependentPricing.splice(index, 1);
        }
      }
      state.lastModified = action.input.lastModified;
    },
    setOptionGroupDiscountModeOperation(state, action) {
      const og = state.optionGroups.find(
        (g) => g.id === action.input.optionGroupId,
      );
      if (og) {
        og.discountMode = action.input.discountMode;
      }
      state.lastModified = action.input.lastModified;
    },
  };
