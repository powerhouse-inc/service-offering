import type {
  DiscountInfo,
  RecurringCost,
  SetupCost,
} from "../../gen/schema/types.js";
import type { SubscriptionInstanceServiceGroupOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceServiceGroupOperations: SubscriptionInstanceServiceGroupOperations =
  {
    addServiceGroupOperation(state, action) {
      const { input } = action;
      let setupCost: SetupCost | null = null;
      if (input.setupAmount && input.setupCurrency) {
        setupCost = {
          amount: input.setupAmount,
          currency: input.setupCurrency,
          billingDate: input.setupBillingDate || null,
          paymentDate: null,
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
          nextBillingDate: null,
          lastPaymentDate: null,
          discount,
        };
      }
      state.serviceGroups.push({
        id: input.groupId,
        name: input.name,
        optional: input.optional,
        costType: input.costType || null,
        setupCost,
        recurringCost,
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
            discount: null,
          };
        }

        group.services.push({
          id: input.serviceId,
          name: input.name || null,
          description: input.description || null,
          customValue: input.customValue || null,
          facetSelections: [],
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
    updateServiceGroupCostOperation(state, action) {
      const { input } = action;
      const group = state.serviceGroups.find((g) => g.id === input.groupId);
      if (group) {
        // Update setup cost
        if (input.setupAmount && input.setupCurrency) {
          if (!group.setupCost) {
            group.setupCost = {
              amount: input.setupAmount,
              currency: input.setupCurrency,
              billingDate: input.setupBillingDate || null,
              paymentDate: null,
            };
          } else {
            group.setupCost.amount = input.setupAmount;
            group.setupCost.currency = input.setupCurrency;
            if (input.setupBillingDate)
              group.setupCost.billingDate = input.setupBillingDate;
          }
        }
        // Update recurring cost
        if (
          input.recurringAmount &&
          input.recurringCurrency &&
          input.recurringBillingCycle
        ) {
          if (!group.recurringCost) {
            group.recurringCost = {
              amount: input.recurringAmount,
              currency: input.recurringCurrency,
              billingCycle: input.recurringBillingCycle,
              nextBillingDate: null,
              lastPaymentDate: null,
              discount: null,
            };
          } else {
            group.recurringCost.amount = input.recurringAmount;
            group.recurringCost.currency = input.recurringCurrency;
            group.recurringCost.billingCycle = input.recurringBillingCycle;
          }
        }
      }
    },
  };
