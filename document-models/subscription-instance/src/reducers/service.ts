import type {
  DiscountInfo,
  RecurringCost,
  SetupCost,
} from "../../gen/schema/types.js";
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
        let discount: DiscountInfo | null = null;
        if (input.recurringDiscount) {
          discount = {
            originalAmount: input.recurringDiscount.originalAmount,
            discountType: input.recurringDiscount.discountType,
            discountValue: input.recurringDiscount.discountValue,
            source: input.recurringDiscount.source,
          };
        }
        recurringCost = {
          amount: input.recurringAmount,
          currency: input.recurringCurrency,
          billingCycle: input.recurringBillingCycle,
          nextBillingDate: input.recurringNextBillingDate || null,
          lastPaymentDate: input.recurringLastPaymentDate || null,
          discount,
        };
      }

      state.services.push({
        id: input.serviceId,
        name: input.name || null,
        description: input.description || null,
        customValue: input.customValue || null,
        facetSelections: [],
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
            discount: null,
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
        if (input.customValue !== undefined && input.customValue !== null)
          service.customValue = input.customValue;
      }
    },
    addServiceFacetSelectionOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        service.facetSelections.push({
          id: input.facetSelectionId,
          facetName: input.facetName,
          selectedOption: input.selectedOption,
        });
      }
    },
    removeServiceFacetSelectionOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        const index = service.facetSelections.findIndex(
          (f) => f.id === input.facetSelectionId,
        );
        if (index !== -1) service.facetSelections.splice(index, 1);
      }
    },
  };
