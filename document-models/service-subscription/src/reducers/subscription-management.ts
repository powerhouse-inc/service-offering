import type { ServiceSubscriptionSubscriptionManagementOperations } from "@powerhousedao/service-offering/document-models/service-subscription";

export const serviceSubscriptionSubscriptionManagementOperations: ServiceSubscriptionSubscriptionManagementOperations =
  {
    initializeSubscriptionOperation(state, action) {
      state.id = action.input.id;
      state.customerId = action.input.customerId;
      state.customerName = action.input.customerName || null;
      state.serviceOfferingId = action.input.serviceOfferingId;
      state.serviceOfferingTitle = action.input.serviceOfferingTitle || null;
      state.resourceTemplateId = action.input.resourceTemplateId;
      state.selectedTierId = action.input.selectedTierId;
      state.status = "PENDING";
      state.autoRenew = true;
      state.createdAt = action.input.createdAt;
      state.lastModified = action.input.lastModified;
    },
    activateSubscriptionOperation(state, action) {
      state.status = "ACTIVE";
      state.startDate = action.input.startDate;
      state.currentPeriodStart = action.input.currentPeriodStart;
      state.currentPeriodEnd = action.input.currentPeriodEnd;
      state.lastModified = action.input.lastModified;
    },
    cancelSubscriptionOperation(state, action) {
      state.autoRenew = false;
      state.cancelledAt = action.input.cancelledAt;
      state.cancelEffectiveDate = action.input.cancelEffectiveDate || null;
      state.cancellationReason = action.input.reason || null;
      state.lastModified = action.input.lastModified;
    },
    expireSubscriptionOperation(state, action) {
      if (!state.autoRenew) {
        state.status = "EXPIRED";
      }
      state.lastModified = action.input.lastModified;
    },
  };
