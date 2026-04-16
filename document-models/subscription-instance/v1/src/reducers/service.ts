import {
  RemoveServiceNotFoundError,
  UpdateServiceSetupCostNotFoundError,
  UpdateServiceRecurringCostNotFoundError,
  ReportSetupPaymentServiceNotFoundError,
  ReportRecurringPaymentServiceNotFoundError,
  UpdateServiceInfoNotFoundError,
  AddServiceFacetSelectionServiceNotFoundError,
  RemoveServiceFacetSelectionServiceNotFoundError,
  SubscriptionNotActiveAddServiceError,
  SubscriptionNotActiveRemoveServiceError,
} from "../../gen/service/error.js";
import { findServiceById, findGroupByServiceId } from "../utils.js";
import type { SubscriptionInstanceServiceOperations } from "document-models/subscription-instance/v1";

export const subscriptionInstanceServiceOperations: SubscriptionInstanceServiceOperations =
  {
    addServiceOperation(state, action) {
      // D-6: Status guard — PENDING or ACTIVE only
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveAddServiceError(
          `Cannot add service when status is ${state.status}`,
        );
      }
      const service = {
        id: action.input.serviceId,
        name: action.input.name || null,
        description: action.input.description || null,
        customValue: action.input.customValue || null,
        facetSelections: [],
        setupCost:
          action.input.setupAmount && action.input.setupCurrency
            ? {
                amount: action.input.setupAmount,
                currency: action.input.setupCurrency,
                billingDate: action.input.setupBillingDate || null,
                paymentDate: action.input.setupPaymentDate || null,
              }
            : null,
        recurringCost:
          action.input.recurringAmount &&
          action.input.recurringCurrency &&
          action.input.recurringBillingCycle
            ? {
                amount: action.input.recurringAmount,
                currency: action.input.recurringCurrency,
                billingCycle: action.input.recurringBillingCycle,
                nextBillingDate: action.input.recurringNextBillingDate || null,
                lastPaymentDate: action.input.recurringLastPaymentDate || null,
                discount: action.input.recurringDiscount
                  ? {
                      originalAmount:
                        action.input.recurringDiscount.originalAmount,
                      discountType: action.input.recurringDiscount.discountType,
                      discountValue:
                        action.input.recurringDiscount.discountValue,
                      source: action.input.recurringDiscount.source,
                    }
                  : null,
              }
            : null,
        metrics: [],
      };
      state.services.push(service);
      // No proration — standalone services don't carry pricing at this level.
      // Proration applies at the service GROUP level (D-1 revised).
    },
    removeServiceOperation(state, action) {
      // D-6: Status guard — PENDING or ACTIVE only
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveRemoveServiceError(
          `Cannot remove service when status is ${state.status}`,
        );
      }
      const index = state.services.findIndex(
        (s) => s.id === action.input.serviceId,
      );
      if (index === -1) {
        throw new RemoveServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      // No proration — standalone services don't carry pricing.
      // Proration applies at the service GROUP level (D-2 revised).
      state.services.splice(index, 1);
    },
    updateServiceSetupCostOperation(state, action) {
      // D-6: Cost updates only in PENDING (setup phase)
      if (state.status !== "PENDING") return;
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new UpdateServiceSetupCostNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      if (action.input.amount && action.input.currency) {
        svc.setupCost = {
          amount: action.input.amount,
          currency: action.input.currency,
          billingDate: action.input.billingDate || null,
          paymentDate: action.input.paymentDate || null,
        };
      } else if (svc.setupCost) {
        if (action.input.amount) svc.setupCost.amount = action.input.amount;
        if (action.input.currency)
          svc.setupCost.currency = action.input.currency;
        if (action.input.billingDate !== undefined)
          svc.setupCost.billingDate = action.input.billingDate || null;
        if (action.input.paymentDate !== undefined)
          svc.setupCost.paymentDate = action.input.paymentDate || null;
      }
    },
    updateServiceRecurringCostOperation(state, action) {
      // D-6: Cost updates only in PENDING (setup phase)
      if (state.status !== "PENDING") return;
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new UpdateServiceRecurringCostNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      if (
        action.input.amount &&
        action.input.currency &&
        action.input.billingCycle
      ) {
        svc.recurringCost = {
          amount: action.input.amount,
          currency: action.input.currency,
          billingCycle: action.input.billingCycle,
          nextBillingDate: action.input.nextBillingDate || null,
          lastPaymentDate: action.input.lastPaymentDate || null,
          discount: svc.recurringCost?.discount || null,
        };
      } else if (svc.recurringCost) {
        if (action.input.amount) svc.recurringCost.amount = action.input.amount;
        if (action.input.currency)
          svc.recurringCost.currency = action.input.currency;
        if (action.input.billingCycle)
          svc.recurringCost.billingCycle = action.input.billingCycle;
        if (action.input.nextBillingDate !== undefined)
          svc.recurringCost.nextBillingDate =
            action.input.nextBillingDate || null;
        if (action.input.lastPaymentDate !== undefined)
          svc.recurringCost.lastPaymentDate =
            action.input.lastPaymentDate || null;
      }
    },
    reportSetupPaymentOperation(state, action) {
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new ReportSetupPaymentServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      // Mark payment on the service's setup cost if it has one
      if (svc.setupCost) {
        svc.setupCost.paymentDate = action.input.paymentDate;
      }
      // Also mark payment on the parent group's setup cost if applicable
      const group = findGroupByServiceId(
        action.input.serviceId,
        state.serviceGroups,
      );
      if (group?.setupCost) {
        group.setupCost.paymentDate = action.input.paymentDate;
      }
      // D-3: Update totalCredit with payment amount
      state.totalCredit = (state.totalCredit ?? 0) + action.input.amount;
    },
    reportRecurringPaymentOperation(state, action) {
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new ReportRecurringPaymentServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      // Mark payment on the service's recurring cost if it has one
      if (svc.recurringCost) {
        svc.recurringCost.lastPaymentDate = action.input.paymentDate;
      }
      // Also mark payment on the parent group's recurring cost if applicable
      const group = findGroupByServiceId(
        action.input.serviceId,
        state.serviceGroups,
      );
      if (group?.recurringCost) {
        group.recurringCost.lastPaymentDate = action.input.paymentDate;
      }
      // D-3: Update totalCredit with payment amount
      state.totalCredit = (state.totalCredit ?? 0) + action.input.amount;
    },
    updateServiceInfoOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new UpdateServiceInfoNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      if (action.input.name !== undefined) svc.name = action.input.name || null;
      if (action.input.description !== undefined)
        svc.description = action.input.description || null;
      if (action.input.customValue !== undefined)
        svc.customValue = action.input.customValue || null;
    },
    addServiceFacetSelectionOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new AddServiceFacetSelectionServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      svc.facetSelections.push({
        id: action.input.facetSelectionId,
        facetName: action.input.facetName,
        selectedOption: action.input.selectedOption,
      });
    },
    removeServiceFacetSelectionOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new RemoveServiceFacetSelectionServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const index = svc.facetSelections.findIndex(
        (fs) => fs.id === action.input.facetSelectionId,
      );
      if (index !== -1) {
        svc.facetSelections.splice(index, 1);
      }
    },
  };
