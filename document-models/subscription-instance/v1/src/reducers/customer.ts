import type { SubscriptionInstanceCustomerOperations } from "@powerhousedao/service-offering/document-models/subscription-instance/v1";

export const subscriptionInstanceCustomerOperations: SubscriptionInstanceCustomerOperations =
  {
    setCustomerTypeOperation(state, action) {
      state.customerType = action.input.customerType;
    },
    updateTeamMemberCountOperation(state, action) {
      state.teamMemberCount = action.input.teamMemberCount;
    },
  };
