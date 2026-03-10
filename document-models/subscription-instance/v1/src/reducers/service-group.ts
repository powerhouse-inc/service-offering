import type { SubscriptionInstanceServiceGroupOperations } from "@powerhousedao/service-offering/document-models/subscription-instance/v1";

export const subscriptionInstanceServiceGroupOperations: SubscriptionInstanceServiceGroupOperations =
  {
    addServiceGroupOperation(state, action) {
      state.serviceGroups.push({
        id: action.input.id,
        name: action.input.name,
        optional: action.input.optional,
        costType: action.input.costType || null,
        setupCost: null,
        recurringCost: null,
        services: [],
      });
    },
    removeServiceGroupOperation(state, action) {
      const index = state.serviceGroups.findIndex(
        (g) => g.id === action.input.id,
      );
      if (index !== -1) {
        state.serviceGroups.splice(index, 1);
      }
    },
    addServiceToGroupOperation(state, action) {
      const group = state.serviceGroups.find(
        (g) => g.id === action.input.groupId,
      );
      if (group && !group.services.includes(action.input.serviceId)) {
        group.services.push(action.input.serviceId);
      }
    },
    removeServiceFromGroupOperation(state, action) {
      const group = state.serviceGroups.find(
        (g) => g.id === action.input.groupId,
      );
      if (group) {
        const index = group.services.indexOf(action.input.serviceId);
        if (index !== -1) {
          group.services.splice(index, 1);
        }
      }
    },
    updateServiceGroupCostOperation(state, action) {
      const group = state.serviceGroups.find(
        (g) => g.id === action.input.groupId,
      );
      if (group) {
        if (action.input.costType === "SETUP") {
          group.setupCost = {
            amount: action.input.amount,
            currency: action.input.currency,
            paidAmount: group.setupCost?.paidAmount ?? null,
            paidAt: group.setupCost?.paidAt ?? null,
          };
        } else {
          group.recurringCost = {
            amount: action.input.amount,
            currency: action.input.currency,
            paidAmount: group.recurringCost?.paidAmount ?? null,
            paidAt: group.recurringCost?.paidAt ?? null,
          };
        }
      }
    },
  };
