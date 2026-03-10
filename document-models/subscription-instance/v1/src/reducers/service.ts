import type { SubscriptionInstanceServiceOperations } from "@powerhousedao/service-offering/document-models/subscription-instance/v1";

export const subscriptionInstanceServiceOperations: SubscriptionInstanceServiceOperations =
  {
    addServiceOperation(state, action) {
      state.services.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        customValue: action.input.customValue || null,
        facetSelections: [],
        setupCost: null,
        recurringCost: null,
        metrics: [],
      });
    },
    removeServiceOperation(state, action) {
      const index = state.services.findIndex((s) => s.id === action.input.id);
      if (index !== -1) {
        state.services.splice(index, 1);
      }
    },
    updateServiceSetupCostOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc) {
        svc.setupCost = {
          amount: action.input.amount,
          currency: action.input.currency,
          paidAmount: svc.setupCost?.paidAmount ?? null,
          paidAt: svc.setupCost?.paidAt ?? null,
        };
      }
    },
    updateServiceRecurringCostOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc) {
        svc.recurringCost = {
          amount: action.input.amount,
          currency: action.input.currency,
          paidAmount: svc.recurringCost?.paidAmount ?? null,
          paidAt: svc.recurringCost?.paidAt ?? null,
        };
      }
    },
    reportSetupPaymentOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc?.setupCost) {
        svc.setupCost.paidAmount = action.input.paidAmount;
        svc.setupCost.paidAt = action.input.paidAt;
      }
    },
    reportRecurringPaymentOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc?.recurringCost) {
        svc.recurringCost.paidAmount = action.input.paidAmount;
        svc.recurringCost.paidAt = action.input.paidAt;
      }
    },
    updateServiceInfoOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc) {
        if (action.input.name !== undefined)
          svc.name = action.input.name ?? svc.name;
        if (action.input.description !== undefined)
          svc.description = action.input.description ?? null;
        if (action.input.customValue !== undefined)
          svc.customValue = action.input.customValue ?? null;
      }
    },
    addServiceFacetSelectionOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc) {
        svc.facetSelections.push({
          id: action.input.id,
          facetName: action.input.facetName,
          selectedOption: action.input.selectedOption,
        });
      }
    },
    removeServiceFacetSelectionOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc) {
        const index = svc.facetSelections.findIndex(
          (fs) => fs.id === action.input.facetSelectionId,
        );
        if (index !== -1) {
          svc.facetSelections.splice(index, 1);
        }
      }
    },
  };
