import type {
  InitializeServiceInput,
  RecurringCost,
  Service,
  SetupCost,
} from "../../gen/schema/types.js";
import type { SubscriptionInstanceSubscriptionOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

function buildServiceFromInput(svc: InitializeServiceInput): Service {
  let setupCost: SetupCost | null = null;
  if (svc.setupAmount && svc.setupCurrency) {
    setupCost = {
      amount: svc.setupAmount,
      currency: svc.setupCurrency,
      billingDate: null,
      paymentDate: null,
    };
  }

  let recurringCost: RecurringCost | null = null;
  if (
    svc.recurringAmount &&
    svc.recurringCurrency &&
    svc.recurringBillingCycle
  ) {
    recurringCost = {
      amount: svc.recurringAmount,
      currency: svc.recurringCurrency,
      billingCycle: svc.recurringBillingCycle,
      nextBillingDate: null,
      lastPaymentDate: null,
    };
  }

  return {
    id: svc.id,
    name: svc.name || null,
    description: svc.description || null,
    customValue: svc.customValue || null,
    facetSelections: (svc.facetSelections || []).map((f) => ({
      id: f.id,
      facetName: f.facetName,
      selectedOption: f.selectedOption,
    })),
    setupCost,
    recurringCost,
    metrics: (svc.metrics || []).map((m) => ({
      id: m.id,
      name: m.name,
      unitName: m.unitName,
      limit: m.limit || null,
      currentUsage: m.currentUsage,
      usageResetPeriod: m.usageResetPeriod || null,
      nextUsageReset: null,
      unitCost:
        m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle
          ? {
              amount: m.unitCostAmount,
              currency: m.unitCostCurrency,
              billingCycle: m.unitCostBillingCycle,
              nextBillingDate: null,
              lastPaymentDate: null,
            }
          : null,
    })),
  };
}

export const subscriptionInstanceSubscriptionOperations: SubscriptionInstanceSubscriptionOperations =
  {
    initializeSubscriptionOperation(state, action) {
      const { input } = action;
      state.customerId = input.customerId || null;
      state.customerName = input.customerName || null;
      state.customerEmail = input.customerEmail || null;
      state.serviceOfferingId = input.serviceOfferingId || null;
      state.tierName = input.tierName || null;
      state.tierPricingOptionId = input.tierPricingOptionId || null;
      state.tierPrice = input.tierPrice || null;
      state.tierCurrency = input.tierCurrency || null;
      state.autoRenew = input.autoRenew ?? false;
      state.createdAt = input.createdAt;
      state.status = "PENDING";

      if (input.resourceId) {
        state.resource = {
          id: input.resourceId,
          label: input.resourceLabel || null,
          thumbnailUrl: input.resourceThumbnailUrl || null,
        };
      }

      if (input.services) {
        for (const svc of input.services) {
          state.services.push(buildServiceFromInput(svc));
        }
      }

      if (input.serviceGroups) {
        for (const grp of input.serviceGroups) {
          let recurringCost: RecurringCost | null = null;
          if (
            grp.recurringAmount &&
            grp.recurringCurrency &&
            grp.recurringBillingCycle
          ) {
            recurringCost = {
              amount: grp.recurringAmount,
              currency: grp.recurringCurrency,
              billingCycle: grp.recurringBillingCycle,
              nextBillingDate: null,
              lastPaymentDate: null,
            };
          }
          state.serviceGroups.push({
            id: grp.id,
            name: grp.name,
            optional: grp.optional,
            recurringCost,
            services: (grp.services || []).map(buildServiceFromInput),
          });
        }
      }
    },

    setResourceDocumentOperation(state, action) {
      const { input } = action;
      state.resource = {
        id: input.resourceId,
        label: input.resourceLabel || null,
        thumbnailUrl: input.resourceThumbnailUrl || null,
      };
    },

    updateSubscriptionStatusOperation(state, action) {
      state.status = action.input.status;
    },

    activateSubscriptionOperation(state, action) {
      state.status = "ACTIVE";
      state.activatedSince = action.input.activatedSince;
      state.pausedSince = null;
      state.expiringSince = null;
    },

    pauseSubscriptionOperation(state, action) {
      state.status = "PAUSED";
      state.pausedSince = action.input.pausedSince;
    },

    setExpiringOperation(state, action) {
      state.status = "EXPIRING";
      state.expiringSince = action.input.expiringSince;
    },

    cancelSubscriptionOperation(state, action) {
      state.status = "CANCELLED";
      state.cancelledSince = action.input.cancelledSince;
      state.cancellationReason = action.input.cancellationReason || null;
    },

    resumeSubscriptionOperation(state, _action) {
      state.status = "ACTIVE";
      state.pausedSince = null;
    },

    renewExpiringSubscriptionOperation(state, action) {
      state.status = "ACTIVE";
      state.expiringSince = null;
      if (action.input.newRenewalDate) {
        state.renewalDate = action.input.newRenewalDate;
      }
    },

    setBudgetCategoryOperation(state, action) {
      state.budget = {
        id: action.input.budgetId,
        label: action.input.budgetLabel,
      };
    },

    removeBudgetCategoryOperation(state, _action) {
      state.budget = null;
    },

    updateCustomerInfoOperation(state, action) {
      const { input } = action;
      if (input.customerId) state.customerId = input.customerId;
      if (input.customerName) state.customerName = input.customerName;
      if (input.customerEmail) state.customerEmail = input.customerEmail;
    },

    updateTierInfoOperation(state, action) {
      const { input } = action;
      if (input.tierName) state.tierName = input.tierName;
      if (input.tierPricingOptionId)
        state.tierPricingOptionId = input.tierPricingOptionId;
      if (input.tierPrice !== undefined && input.tierPrice !== null)
        state.tierPrice = input.tierPrice;
      if (input.tierCurrency) state.tierCurrency = input.tierCurrency;
    },

    setOperatorNotesOperation(state, action) {
      state.operatorNotes = action.input.operatorNotes || null;
    },

    setAutoRenewOperation(state, action) {
      state.autoRenew = action.input.autoRenew;
    },

    setRenewalDateOperation(state, action) {
      state.renewalDate = action.input.renewalDate;
    },

    updateBillingProjectionOperation(state, action) {
      if (action.input.nextBillingDate) {
        state.nextBillingDate = action.input.nextBillingDate;
      }
      if (action.input.projectedBillAmount !== undefined) {
        state.projectedBillAmount = action.input.projectedBillAmount ?? null;
      }
      if (action.input.projectedBillCurrency) {
        state.projectedBillCurrency = action.input.projectedBillCurrency;
      }
    },
  };
