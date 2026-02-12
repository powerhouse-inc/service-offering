import type { SubscriptionInstanceOptionGroupOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceOptionGroupOperations: SubscriptionInstanceOptionGroupOperations =
  {
    addSelectedOptionGroupOperation(state, action) {
      const { input } = action;
      state.selectedOptionGroups.push({
        id: input.id,
        optionGroupId: input.optionGroupId,
        name: input.name,
        isAddOn: input.isAddOn,
        costType: input.costType || null,
        billingCycle: input.billingCycle || null,
        price: input.price ?? null,
        currency: input.currency || null,
      });
    },

    removeSelectedOptionGroupOperation(state, action) {
      const index = state.selectedOptionGroups.findIndex(
        (g) => g.id === action.input.id,
      );
      if (index !== -1) {
        state.selectedOptionGroups.splice(index, 1);
      }
    },
  };
