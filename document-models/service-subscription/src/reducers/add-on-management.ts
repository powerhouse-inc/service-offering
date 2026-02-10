import type { ServiceSubscriptionAddOnManagementOperations } from "@powerhousedao/service-offering/document-models/service-subscription";

export const serviceSubscriptionAddOnManagementOperations: ServiceSubscriptionAddOnManagementOperations =
  {
    addAddonOperation(state, action) {
      state.selectedAddons.push({
        id: action.input.id,
        optionGroupId: action.input.optionGroupId,
        addedAt: action.input.addedAt,
      });
      state.lastModified = action.input.lastModified;
    },
    removeAddonOperation(state, action) {
      const addonIndex = state.selectedAddons.findIndex(
        (a) => a.id === action.input.id,
      );
      if (addonIndex !== -1) {
        state.selectedAddons.splice(addonIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
  };
