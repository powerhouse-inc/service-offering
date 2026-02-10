import type { ServiceSubscriptionTierSelectionOperations } from "@powerhousedao/service-offering/document-models/service-subscription";

export const serviceSubscriptionTierSelectionOperations: ServiceSubscriptionTierSelectionOperations =
  {
    changeTierOperation(state, action) {
      state.selectedTierId = action.input.newTierId;
      state.lastModified = action.input.lastModified;
    },
    setPricingOperation(state, action) {
      state.pricing = {
        amount: action.input.amount,
        currency: action.input.currency,
        billingCycle: action.input.billingCycle,
        setupFee: action.input.setupFee || null,
      };
      state.lastModified = action.input.lastModified;
    },
  };
