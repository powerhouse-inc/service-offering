import type { ServiceSubscriptionBillingProjectionOperations } from "@powerhousedao/service-offering/document-models/service-subscription";

export const serviceSubscriptionBillingProjectionOperations: ServiceSubscriptionBillingProjectionOperations =
  {
    updateBillingProjectionOperation(state, action) {
      state.nextBillingDate = action.input.nextBillingDate || null;
      state.projectedBillAmount = action.input.projectedBillAmount || null;
      state.projectedBillCurrency = action.input.projectedBillCurrency || null;
      state.lastModified = action.input.lastModified;
    },
    setCachedSnippetsOperation(state, action) {
      if (action.input.customerName !== undefined) {
        state.customerName = action.input.customerName || null;
      }
      if (action.input.serviceOfferingTitle !== undefined) {
        state.serviceOfferingTitle = action.input.serviceOfferingTitle || null;
      }
      state.lastModified = action.input.lastModified;
    },
  };
