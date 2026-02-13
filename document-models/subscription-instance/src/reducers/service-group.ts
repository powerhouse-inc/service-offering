import type { RecurringCost, SetupCost } from "../../gen/schema/types.js";
import type { SubscriptionInstanceServiceGroupOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceServiceGroupOperations: SubscriptionInstanceServiceGroupOperations =
  {
    addServiceGroupOperation(state, action) {
      const { input } = action;
      state.serviceGroups.push({
        id: input.groupId,
        name: input.name,
        optional: input.optional,
        billingCycle: input.billingCycle || null,
        optionGroupId: input.optionGroupId || null,
        displayOrder: input.displayOrder ?? null,
        services: [],
      });
    },

    removeServiceGroupOperation(state, action) {
      const index = state.serviceGroups.findIndex(
        (g) => g.id === action.input.groupId,
      );
      if (index !== -1) {
        state.serviceGroups.splice(index, 1);
      }
    },

    addServiceToGroupOperation(state, action) {
      const { input } = action;
      const group = state.serviceGroups.find((g) => g.id === input.groupId);
      if (group) {
        let setupCost: SetupCost | null = null;
        if (input.setupAmount && input.setupCurrency) {
          setupCost = {
            amount: input.setupAmount,
            currency: input.setupCurrency,
            billingDate: input.setupBillingDate || null,
            paymentDate: input.setupPaymentDate || null,
          };
        }

        let recurringCost: RecurringCost | null = null;
        if (
          input.recurringAmount &&
          input.recurringCurrency &&
          input.recurringBillingCycle
        ) {
          recurringCost = {
            amount: input.recurringAmount,
            currency: input.recurringCurrency,
            billingCycle: input.recurringBillingCycle,
            nextBillingDate: input.recurringNextBillingDate || null,
            lastPaymentDate: input.recurringLastPaymentDate || null,
          };
        }

        group.services.push({
          id: input.serviceId,
          name: input.name || null,
          description: input.description || null,
          serviceLevel: input.serviceLevel || null,
          customValue: input.customValue || null,
          facetLabel: input.facetLabel || null,
          isSetupService: input.isSetupService ?? null,
          displayOrder: input.displayOrder ?? null,
          setupCost,
          recurringCost,
          metrics: [],
        });
      }
    },

    removeServiceFromGroupOperation(state, action) {
      const { input } = action;
      const group = state.serviceGroups.find((g) => g.id === input.groupId);
      if (group) {
        const serviceIndex = group.services.findIndex(
          (s) => s.id === input.serviceId,
        );
        if (serviceIndex !== -1) {
          group.services.splice(serviceIndex, 1);
        }
      }
    },
  };
