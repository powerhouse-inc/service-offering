import type { SubscriptionInstanceCustomerOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceCustomerOperations: SubscriptionInstanceCustomerOperations =
  {
    setCustomerTypeOperation(state, action) {
      const { input } = action;
      state.customerType = input.customerType;
      if (
        input.teamMemberCount !== undefined &&
        input.teamMemberCount !== null
      ) {
        state.teamMemberCount = input.teamMemberCount;
      }
    },

    updateTeamMemberCountOperation(state, action) {
      state.teamMemberCount = action.input.teamMemberCount;
    },
  };
