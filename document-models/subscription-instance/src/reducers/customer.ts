import type { SubscriptionInstanceCustomerOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceCustomerOperations: SubscriptionInstanceCustomerOperations =
  {
    setCustomerTypeOperation(state, action) {
      state.customerType = action.input.customerType;
      state.teamMemberCount = action.input.teamMemberCount || null;
    },
    updateTeamMemberCountOperation(state, action) {
      state.teamMemberCount = action.input.teamMemberCount;
    },
  };
