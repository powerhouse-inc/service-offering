import {
  ActivateNotPendingError,
  PauseNotActiveError,
  SetExpiringNotActiveError,
  CancelAlreadyCancelledError,
  ResumeNotPausedError,
  RenewNotExpiringError,
  RemoveBudgetNotFoundError,
} from "../../gen/subscription/error.js";
import type { SubscriptionInstanceSubscriptionOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

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
      if (action.input.resourceId) {
        state.resource = {
          id: action.input.resourceId,
          label: action.input.resourceLabel || null,
          thumbnailUrl: action.input.resourceThumbnailUrl || null,
        };
      }
      state.autoRenew = action.input.autoRenew || false;
      state.createdAt = action.input.createdAt;
      state.status = "PENDING";
      state.services = (action.input.services || []).map((s) => ({
        id: s.id,
        name: s.name || null,
        description: s.description || null,
        customValue: s.customValue || null,
        facetSelections: (s.facetSelections || []).map((fs) => ({
          id: fs.id,
          facetName: fs.facetName,
          selectedOption: fs.selectedOption,
        })),
        setupCost:
          s.setupAmount && s.setupCurrency
            ? {
                amount: s.setupAmount,
                currency: s.setupCurrency,
                billingDate: null,
                paymentDate: null,
              }
            : null,
        recurringCost:
          s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle
            ? {
                amount: s.recurringAmount,
                currency: s.recurringCurrency,
                billingCycle: s.recurringBillingCycle,
                nextBillingDate: null,
                lastPaymentDate: null,
                discount: s.recurringDiscount
                  ? {
                      originalAmount: s.recurringDiscount.originalAmount,
                      discountType: s.recurringDiscount.discountType,
                      discountValue: s.recurringDiscount.discountValue,
                      source: s.recurringDiscount.source,
                    }
                  : null,
              }
            : null,
        metrics: (s.metrics || []).map((m) => ({
          id: m.id,
          name: m.name,
          unitName: m.unitName,
          limit: m.limit || null,
          freeLimit: m.freeLimit || null,
          paidLimit: m.paidLimit || null,
          unitCost:
            m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle
              ? {
                  amount: m.unitCostAmount,
                  currency: m.unitCostCurrency,
                  billingCycle: m.unitCostBillingCycle,
                  nextBillingDate: null,
                  lastPaymentDate: null,
                  discount: null,
                }
              : null,
          currentUsage: m.currentUsage,
          usageResetPeriod: m.usageResetPeriod || null,
          nextUsageReset: null,
        })),
      }));
      state.serviceGroups = (action.input.serviceGroups || []).map((sg) => ({
        id: sg.id,
        name: sg.name,
        optional: sg.optional,
        costType: sg.costType || null,
        setupCost:
          sg.setupAmount && sg.setupCurrency
            ? {
                amount: sg.setupAmount,
                currency: sg.setupCurrency,
                billingDate: sg.setupBillingDate || null,
                paymentDate: null,
              }
            : null,
        recurringCost:
          sg.recurringAmount && sg.recurringCurrency && sg.recurringBillingCycle
            ? {
                amount: sg.recurringAmount,
                currency: sg.recurringCurrency,
                billingCycle: sg.recurringBillingCycle,
                nextBillingDate: null,
                lastPaymentDate: null,
                discount: sg.recurringDiscount
                  ? {
                      originalAmount: sg.recurringDiscount.originalAmount,
                      discountType: sg.recurringDiscount.discountType,
                      discountValue: sg.recurringDiscount.discountValue,
                      source: sg.recurringDiscount.source,
                    }
                  : null,
              }
            : null,
        services: (sg.services || []).map((s) => ({
          id: s.id,
          name: s.name || null,
          description: s.description || null,
          customValue: s.customValue || null,
          facetSelections: (s.facetSelections || []).map((fs) => ({
            id: fs.id,
            facetName: fs.facetName,
            selectedOption: fs.selectedOption,
          })),
          setupCost:
            s.setupAmount && s.setupCurrency
              ? {
                  amount: s.setupAmount,
                  currency: s.setupCurrency,
                  billingDate: null,
                  paymentDate: null,
                }
              : null,
          recurringCost:
            s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle
              ? {
                  amount: s.recurringAmount,
                  currency: s.recurringCurrency,
                  billingCycle: s.recurringBillingCycle,
                  nextBillingDate: null,
                  lastPaymentDate: null,
                  discount: s.recurringDiscount
                    ? {
                        originalAmount: s.recurringDiscount.originalAmount,
                        discountType: s.recurringDiscount.discountType,
                        discountValue: s.recurringDiscount.discountValue,
                        source: s.recurringDiscount.source,
                      }
                    : null,
                }
              : null,
          metrics: (s.metrics || []).map((m) => ({
            id: m.id,
            name: m.name,
            unitName: m.unitName,
            limit: m.limit || null,
            freeLimit: m.freeLimit || null,
            paidLimit: m.paidLimit || null,
            unitCost:
              m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle
                ? {
                    amount: m.unitCostAmount,
                    currency: m.unitCostCurrency,
                    billingCycle: m.unitCostBillingCycle,
                    nextBillingDate: null,
                    lastPaymentDate: null,
                    discount: null,
                  }
                : null,
            currentUsage: m.currentUsage,
            usageResetPeriod: m.usageResetPeriod || null,
            nextUsageReset: null,
          })),
        })),
      }));
    },
    setResourceDocumentOperation(state, action) {
      state.resource = {
        id: action.input.resourceId,
        label: action.input.resourceLabel || null,
        thumbnailUrl: action.input.resourceThumbnailUrl || null,
      };
    },
    updateSubscriptionStatusOperation(state, action) {
      state.status = action.input.status;
    },
    activateSubscriptionOperation(state, action) {
      if (state.status !== "PENDING") {
        throw new ActivateNotPendingError(
          `Cannot activate subscription with status ${state.status}`,
        );
      }
      state.status = "ACTIVE";
      state.activatedSince = action.input.activatedSince;
    },
    pauseSubscriptionOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new PauseNotActiveError(
          `Cannot pause subscription with status ${state.status}`,
        );
      }
      state.status = "PAUSED";
      state.pausedSince = action.input.pausedSince;
    },
    setExpiringOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new SetExpiringNotActiveError(
          `Cannot set expiring on subscription with status ${state.status}`,
        );
      }
      state.status = "EXPIRING";
      state.expiringSince = action.input.expiringSince;
    },
    cancelSubscriptionOperation(state, action) {
      if (state.status === "CANCELLED") {
        throw new CancelAlreadyCancelledError(
          "Subscription is already cancelled",
        );
      }
      state.status = "CANCELLED";
      state.cancelledSince = action.input.cancelledSince;
      state.cancellationReason = action.input.cancellationReason || null;
    },
    resumeSubscriptionOperation(state, _action) {
      if (state.status !== "PAUSED") {
        throw new ResumeNotPausedError(
          `Cannot resume subscription with status ${state.status}`,
        );
      }
      state.status = "ACTIVE";
      state.pausedSince = null;
    },
    renewExpiringSubscriptionOperation(state, action) {
      if (state.status !== "EXPIRING") {
        throw new RenewNotExpiringError(
          `Cannot renew subscription with status ${state.status}`,
        );
      }
      state.status = "ACTIVE";
      state.expiringSince = null;
      state.renewalDate = action.input.newRenewalDate || null;
    },
    setBudgetCategoryOperation(state, action) {
      state.budget = {
        id: action.input.budgetId,
        label: action.input.budgetLabel,
      };
    },
    removeBudgetCategoryOperation(state, action) {
      if (!state.budget || state.budget.id !== action.input.budgetId) {
        throw new RemoveBudgetNotFoundError(
          `Budget category with ID ${action.input.budgetId} not found`,
        );
      }
      state.budget = null;
    },
    updateCustomerInfoOperation(state, action) {
      if (action.input.customerId !== undefined)
        state.customerId = action.input.customerId || null;
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
      if (action.input.nextBillingDate !== undefined)
        state.nextBillingDate = action.input.nextBillingDate || null;
      if (action.input.projectedBillAmount !== undefined)
        state.projectedBillAmount = action.input.projectedBillAmount || null;
      if (action.input.projectedBillCurrency !== undefined)
        state.projectedBillCurrency =
          action.input.projectedBillCurrency || null;
    },
  };
