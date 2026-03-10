import type { SubscriptionInstanceSubscriptionOperations } from "@powerhousedao/service-offering/document-models/subscription-instance/v1";

export const subscriptionInstanceSubscriptionOperations: SubscriptionInstanceSubscriptionOperations =
  {
    initializeSubscriptionOperation(state, action) {
      state.customerId = action.input.customerId || null;
      state.customerName = action.input.customerName || null;
      state.customerEmail = action.input.customerEmail || null;
      state.serviceOfferingId = action.input.serviceOfferingId || null;
      state.tierName = action.input.tierName || null;
      state.tierPricingOptionId = action.input.tierPricingOptionId || null;
      state.tierPrice = action.input.tierPrice || null;
      state.tierCurrency = action.input.tierCurrency || null;
      state.tierPricingMode = action.input.tierPricingMode || null;
      state.selectedBillingCycle = action.input.selectedBillingCycle || null;
      state.globalCurrency = action.input.globalCurrency || null;
      state.autoRenew = false;
      state.createdAt = action.input.createdAt;
      state.status = "DRAFT";
      state.services = [];
      state.serviceGroups = [];
    },
    setResourceDocumentOperation(state, action) {
      state.resource = {
        documentId: action.input.documentId,
        documentType: action.input.documentType,
      };
    },
    updateSubscriptionStatusOperation(state, action) {
      state.status = action.input.status;
    },
    activateSubscriptionOperation(state, action) {
      if (state.status === "DRAFT") {
        state.status = "ACTIVE";
        state.activatedSince = action.input.activatedAt;
      }
    },
    pauseSubscriptionOperation(state, action) {
      if (state.status === "ACTIVE") {
        state.status = "PAUSED";
        state.pausedSince = action.input.pausedAt;
      }
    },
    setExpiringOperation(state, action) {
      if (state.status === "ACTIVE") {
        state.status = "EXPIRING";
        state.expiringSince = action.input.expiringAt;
      }
    },
    cancelSubscriptionOperation(state, action) {
      if (state.status !== "CANCELLED") {
        state.status = "CANCELLED";
        state.cancelledSince = action.input.cancelledAt;
        state.cancellationReason = action.input.reason || null;
      }
    },
    resumeSubscriptionOperation(state, _action) {
      if (state.status === "PAUSED") {
        state.status = "ACTIVE";
        state.pausedSince = null;
      }
    },
    renewExpiringSubscriptionOperation(state, action) {
      if (state.status === "EXPIRING") {
        state.status = "ACTIVE";
        state.expiringSince = null;
        state.renewalDate = action.input.newRenewalDate || null;
      }
    },
    setBudgetCategoryOperation(state, action) {
      state.budget = {
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
      };
    },
    removeBudgetCategoryOperation(state, action) {
      if (state.budget && state.budget.id === action.input.id) {
        state.budget = null;
      }
    },
    updateCustomerInfoOperation(state, action) {
      if (action.input.customerName !== undefined)
        state.customerName = action.input.customerName || null;
      if (action.input.customerEmail !== undefined)
        state.customerEmail = action.input.customerEmail || null;
    },
    updateTierInfoOperation(state, action) {
      if (action.input.tierName !== undefined)
        state.tierName = action.input.tierName || null;
      if (action.input.tierPricingOptionId !== undefined)
        state.tierPricingOptionId = action.input.tierPricingOptionId || null;
      if (action.input.tierPrice !== undefined)
        state.tierPrice = action.input.tierPrice || null;
      if (action.input.tierCurrency !== undefined)
        state.tierCurrency = action.input.tierCurrency || null;
      if (action.input.tierPricingMode !== undefined)
        state.tierPricingMode = action.input.tierPricingMode || null;
      if (action.input.selectedBillingCycle !== undefined)
        state.selectedBillingCycle = action.input.selectedBillingCycle || null;
    },
    setOperatorNotesOperation(state, action) {
      state.operatorNotes = action.input.notes || null;
    },
    setAutoRenewOperation(state, action) {
      state.autoRenew = action.input.autoRenew;
    },
    setRenewalDateOperation(state, action) {
      state.renewalDate = action.input.renewalDate;
    },
    updateBillingProjectionOperation(state, action) {
      if (action.input.nextBillingDate !== undefined)
        state.nextBillingDate = action.input.nextBillingDate || null;
      if (action.input.projectedBillAmount !== undefined)
        state.projectedBillAmount = action.input.projectedBillAmount || null;
      if (action.input.projectedBillCurrency !== undefined)
        state.projectedBillCurrency =
          action.input.projectedBillCurrency || null;
    },
  };
