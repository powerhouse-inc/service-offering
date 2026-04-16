import {
  RemoveServiceGroupNotFoundError,
  AddServiceToGroupGroupNotFoundError,
  RemoveServiceFromGroupGroupNotFoundError,
  RemoveServiceFromGroupServiceNotFoundError,
  UpdateServiceGroupCostNotFoundError,
  StructuralChangeNotAllowedAddGroupError,
  StructuralChangeNotAllowedRemoveGroupError,
  SubscriptionNotActiveAddToGroupError,
  SubscriptionNotActiveRemoveFromGroupError,
} from "../../gen/service-group/error.js";
import { calculateProratedCost } from "../utils.js";
import type { SubscriptionInstanceServiceGroupOperations } from "document-models/subscription-instance/v1";

export const subscriptionInstanceServiceGroupOperations: SubscriptionInstanceServiceGroupOperations =
  {
    addServiceGroupOperation(state, action) {
      // D-6 revised: PENDING or ACTIVE — groups carry pricing, proration applies
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new StructuralChangeNotAllowedAddGroupError(
          `Cannot add service group when status is ${state.status}`,
        );
      }
      state.serviceGroups.push({
        id: action.input.groupId,
        name: action.input.name,
        optional: action.input.optional,
        costType: action.input.costType || null,
        setupCost:
          action.input.setupAmount && action.input.setupCurrency
            ? {
                amount: action.input.setupAmount,
                currency: action.input.setupCurrency,
                billingDate: action.input.setupBillingDate || null,
                paymentDate: null,
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
                nextBillingDate: null,
                lastPaymentDate: null,
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
        services: [],
      });

      // D-1: Mid-cycle proration on the GROUP's recurring cost
      if (
        state.status === "ACTIVE" &&
        action.input.recurringAmount &&
        state.currentBillingCycleStart &&
        state.nextBillingDate
      ) {
        const proratedCost = calculateProratedCost(
          action.input.recurringAmount,
          state.currentBillingCycleStart,
          state.nextBillingDate,
          new Date().toISOString(),
        );
        if (proratedCost > 0) {
          state.totalDebt = (state.totalDebt ?? 0) + proratedCost;
        }
      }
      // Setup cost added to debt immediately if ACTIVE
      if (state.status === "ACTIVE" && action.input.setupAmount) {
        state.totalDebt = (state.totalDebt ?? 0) + action.input.setupAmount;
      }
    },
    removeServiceGroupOperation(state, action) {
      // D-6 revised: PENDING or ACTIVE — removal creates prorated credit
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new StructuralChangeNotAllowedRemoveGroupError(
          `Cannot remove service group when status is ${state.status}`,
        );
      }
      const index = state.serviceGroups.findIndex(
        (g) => g.id === action.input.groupId,
      );
      if (index === -1) {
        throw new RemoveServiceGroupNotFoundError(
          `Service group with ID ${action.input.groupId} not found`,
        );
      }
      const group = state.serviceGroups[index];

      // D-2: Mid-cycle prorated credit on the GROUP's recurring cost
      if (
        state.status === "ACTIVE" &&
        group.recurringCost &&
        state.currentBillingCycleStart &&
        state.nextBillingDate
      ) {
        const proratedCredit = calculateProratedCost(
          group.recurringCost.amount,
          state.currentBillingCycleStart,
          state.nextBillingDate,
          new Date().toISOString(),
        );
        if (proratedCredit > 0) {
          state.totalCredit = (state.totalCredit ?? 0) + proratedCredit;
        }
      }

      state.serviceGroups.splice(index, 1);
    },
    addServiceToGroupOperation(state, action) {
      // D-6: Status guard — PENDING or ACTIVE only
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveAddToGroupError(
          `Cannot add service to group when status is ${state.status}`,
        );
      }
      const group = state.serviceGroups.find(
        (g) => g.id === action.input.groupId,
      );
      if (!group) {
        throw new AddServiceToGroupGroupNotFoundError(
          `Service group with ID ${action.input.groupId} not found`,
        );
      }
      group.services.push({
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
                discount: null,
              }
            : null,
        metrics: [],
      });
      // No proration here — services don't carry pricing, groups do (D-1 revised)
    },
    removeServiceFromGroupOperation(state, action) {
      // D-6: Status guard — PENDING or ACTIVE only
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveRemoveFromGroupError(
          `Cannot remove service from group when status is ${state.status}`,
        );
      }
      const group = state.serviceGroups.find(
        (g) => g.id === action.input.groupId,
      );
      if (!group) {
        throw new RemoveServiceFromGroupGroupNotFoundError(
          `Service group with ID ${action.input.groupId} not found`,
        );
      }
      const index = group.services.findIndex(
        (s) => s.id === action.input.serviceId,
      );
      if (index === -1) {
        throw new RemoveServiceFromGroupServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found in group ${action.input.groupId}`,
        );
      }
      // No proration here — services don't carry pricing, groups do (D-2 revised)
      group.services.splice(index, 1);
    },
    updateServiceGroupCostOperation(state, action) {
      // D-6: Cost updates only in PENDING (setup phase)
      if (state.status !== "PENDING") return;
      const group = state.serviceGroups.find(
        (g) => g.id === action.input.groupId,
      );
      if (!group) {
        throw new UpdateServiceGroupCostNotFoundError(
          `Service group with ID ${action.input.groupId} not found`,
        );
      }
      if (action.input.setupAmount && action.input.setupCurrency) {
        group.setupCost = {
          amount: action.input.setupAmount,
          currency: action.input.setupCurrency,
          billingDate: action.input.setupBillingDate || null,
          paymentDate: group.setupCost?.paymentDate || null,
        };
      } else if (group.setupCost) {
        if (action.input.setupAmount)
          group.setupCost.amount = action.input.setupAmount;
        if (action.input.setupCurrency)
          group.setupCost.currency = action.input.setupCurrency;
        if (action.input.setupBillingDate !== undefined)
          group.setupCost.billingDate = action.input.setupBillingDate || null;
      }
      if (
        action.input.recurringAmount &&
        action.input.recurringCurrency &&
        action.input.recurringBillingCycle
      ) {
        group.recurringCost = {
          amount: action.input.recurringAmount,
          currency: action.input.recurringCurrency,
          billingCycle: action.input.recurringBillingCycle,
          nextBillingDate: group.recurringCost?.nextBillingDate || null,
          lastPaymentDate: group.recurringCost?.lastPaymentDate || null,
          discount: group.recurringCost?.discount || null,
        };
      } else if (group.recurringCost) {
        if (action.input.recurringAmount)
          group.recurringCost.amount = action.input.recurringAmount;
        if (action.input.recurringCurrency)
          group.recurringCost.currency = action.input.recurringCurrency;
        if (action.input.recurringBillingCycle)
          group.recurringCost.billingCycle = action.input.recurringBillingCycle;
      }
    },
  };
