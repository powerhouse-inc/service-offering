import type { SubscriptionInstanceServiceGroupOperations } from "document-models/subscription-instance/v1";
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

export const subscriptionInstanceServiceGroupOperations: SubscriptionInstanceServiceGroupOperations =
  {
    addServiceGroupOperation(state, action) {
      // D-6: Structural changes — PENDING only
      if (state.status !== "PENDING") {
        throw new StructuralChangeNotAllowedAddGroupError(
          `Cannot add service group when status is ${state.status} — structural changes only allowed in PENDING`,
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
    },
    removeServiceGroupOperation(state, action) {
      // D-6: Structural changes — PENDING only
      if (state.status !== "PENDING") {
        throw new StructuralChangeNotAllowedRemoveGroupError(
          `Cannot remove service group when status is ${state.status} — structural changes only allowed in PENDING`,
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

      // D-1: Mid-cycle proration — add prorated cost to totalDebt
      if (
        state.status === "ACTIVE" &&
        action.input.effectiveDate &&
        action.input.recurringAmount &&
        state.currentBillingCycleStart &&
        state.nextBillingDate
      ) {
        const proratedCost = calculateProratedCost(
          action.input.recurringAmount,
          state.currentBillingCycleStart,
          state.nextBillingDate,
          action.input.effectiveDate,
        );
        if (proratedCost > 0) {
          state.totalDebt = (state.totalDebt ?? 0) + proratedCost;
        }
      }
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
      const svc = group.services[index];

      // D-2: Mid-cycle proration — add prorated credit to totalCredit
      if (
        state.status === "ACTIVE" &&
        action.input.effectiveDate &&
        svc.recurringCost &&
        state.currentBillingCycleStart &&
        state.nextBillingDate
      ) {
        const proratedCredit = calculateProratedCost(
          svc.recurringCost.amount,
          state.currentBillingCycleStart,
          state.nextBillingDate,
          action.input.effectiveDate,
        );
        if (proratedCredit > 0) {
          state.totalCredit = (state.totalCredit ?? 0) + proratedCredit;
        }
      }

      group.services.splice(index, 1);
    },
    updateServiceGroupCostOperation(state, action) {
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
