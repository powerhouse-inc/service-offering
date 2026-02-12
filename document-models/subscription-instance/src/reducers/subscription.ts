import type { SubscriptionInstanceSubscriptionOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceSubscriptionOperations: SubscriptionInstanceSubscriptionOperations =
  {
    initializeSubscriptionOperation(state, action) {
      const { input } = action;
      state.customerId = input.customerId || null;
      state.customerName = input.customerName || null;
      state.customerEmail = input.customerEmail || null;
      state.serviceOfferingId = input.serviceOfferingId || null;
      state.tierId = input.tierId || null;
      state.tierName = input.tierName || null;
      state.tierPricingOptionId = input.tierPricingOptionId || null;
      state.autoRenew = input.autoRenew ?? false;
      state.createdAt = input.createdAt;
      state.status = "PENDING";
      state.targetAudienceId = input.targetAudienceId || null;
      state.targetAudienceLabel = input.targetAudienceLabel || null;

      if (input.resourceId) {
        state.resource = {
          id: input.resourceId,
          label: input.resourceLabel || null,
          thumbnailUrl: input.resourceThumbnailUrl || null,
        };
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
      if (input.tierId) state.tierId = input.tierId;
      if (input.tierName) state.tierName = input.tierName;
      if (input.tierPricingOptionId)
        state.tierPricingOptionId = input.tierPricingOptionId;
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

    setTargetAudienceOperation(state, action) {
      state.targetAudienceId = action.input.targetAudienceId;
      state.targetAudienceLabel = action.input.targetAudienceLabel;
    },

    removeTargetAudienceOperation(state, _action) {
      state.targetAudienceId = null;
      state.targetAudienceLabel = null;
    },
  };
