import type { RecurringCost, SetupCost } from "../../gen/schema/types.js";
import type { SubscriptionInstanceServiceOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceServiceOperations: SubscriptionInstanceServiceOperations =
  {
    addServiceOperation(state, action) {
      const { input } = action;

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

      state.services.push({
        id: input.serviceId,
        name: input.name || null,
        description: input.description || null,
        setupCost,
        recurringCost,
        metrics: [],
      });
    },

    removeServiceOperation(state, action) {
      const index = state.services.findIndex(
        (s) => s.id === action.input.serviceId,
      );
      if (index !== -1) {
        state.services.splice(index, 1);
      }
    },

    updateServiceSetupCostOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        if (
          input.amount !== undefined &&
          input.amount !== null &&
          input.currency
        ) {
          service.setupCost = {
            amount: input.amount,
            currency: input.currency,
            billingDate: input.billingDate || null,
            paymentDate: input.paymentDate || null,
          };
        } else if (service.setupCost) {
          if (input.billingDate)
            service.setupCost.billingDate = input.billingDate;
          if (input.paymentDate)
            service.setupCost.paymentDate = input.paymentDate;
        }
      }
    },

    updateServiceRecurringCostOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        if (
          input.amount !== undefined &&
          input.amount !== null &&
          input.currency &&
          input.billingCycle
        ) {
          service.recurringCost = {
            amount: input.amount,
            currency: input.currency,
            billingCycle: input.billingCycle,
            nextBillingDate: input.nextBillingDate || null,
            lastPaymentDate: input.lastPaymentDate || null,
          };
        } else if (service.recurringCost) {
          if (input.nextBillingDate)
            service.recurringCost.nextBillingDate = input.nextBillingDate;
          if (input.lastPaymentDate)
            service.recurringCost.lastPaymentDate = input.lastPaymentDate;
        }
      }
    },

    reportSetupPaymentOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service && service.setupCost) {
        service.setupCost.paymentDate = input.paymentDate;
      }
    },

    reportRecurringPaymentOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service && service.recurringCost) {
        service.recurringCost.lastPaymentDate = input.paymentDate;
      }
    },

    updateServiceInfoOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        if (input.name) service.name = input.name;
        if (input.description) service.description = input.description;
      }
    },
  };
