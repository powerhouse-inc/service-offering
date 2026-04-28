import {
  ActivateNotPendingError,
  PauseNotActiveError,
  SetExpiringNotActiveError,
  CancelAlreadyCancelledError,
  ResumeNotPausedError,
  RenewNotExpiringError,
  RemoveBudgetNotFoundError,
  NoBillingCycleActiveError,
  SettlementDateBeforeCycleStartError,
} from "../../gen/subscription/error.js";
import { calculateNextBillingDate, calculateOverageCost } from "../utils.js";
import type { SubscriptionInstanceSubscriptionOperations } from "document-models/subscription-instance/v1";

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
                paymentDate: null,
              }
            : null,
        recurringCost:
          s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle
            ? {
                amount: s.recurringAmount,
                currency: s.recurringCurrency,
                billingCycle: s.recurringBillingCycle,
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
          freeLimit: m.freeLimit || null,
          paidLimit: m.paidLimit || null,
          unitCost:
            m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle
              ? {
                  amount: m.unitCostAmount,
                  currency: m.unitCostCurrency,
                  billingCycle: m.unitCostBillingCycle,
                  lastPaymentDate: null,
                  discount: null,
                }
              : null,
          currentUsage: m.currentUsage,
          metricType: m.metricType,
          accrualCycle: m.accrualCycle,
          lastAccrualDate: m.lastAccrualDate || null,
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
                paymentDate: null,
              }
            : null,
        recurringCost:
          sg.recurringAmount && sg.recurringCurrency && sg.recurringBillingCycle
            ? {
                amount: sg.recurringAmount,
                currency: sg.recurringCurrency,
                billingCycle: sg.recurringBillingCycle,
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
                  paymentDate: null,
                }
              : null,
          recurringCost:
            s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle
              ? {
                  amount: s.recurringAmount,
                  currency: s.recurringCurrency,
                  billingCycle: s.recurringBillingCycle,
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
            freeLimit: m.freeLimit || null,
            paidLimit: m.paidLimit || null,
            unitCost:
              m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle
                ? {
                    amount: m.unitCostAmount,
                    currency: m.unitCostCurrency,
                    billingCycle: m.unitCostBillingCycle,
                    lastPaymentDate: null,
                    discount: null,
                  }
                : null,
            currentUsage: m.currentUsage,
            metricType: m.metricType,
            accrualCycle: m.accrualCycle,
            lastAccrualDate: m.lastAccrualDate || null,
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
    activateSubscriptionOperation(state, action) {
      if (state.status !== "PENDING") {
        throw new ActivateNotPendingError(
          `Cannot activate subscription with status ${state.status}`,
        );
      }
      state.status = "ACTIVE";
      state.activatedSince = action.input.activatedSince;

      // Anchor every metric's accrual clock to the activation moment.
      // Without this, the first ACCRUE_METRIC_USAGE call would have to seed
      // `lastAccrualDate` itself, masking the real "first period boundary."
      for (const svc of state.services) {
        for (const metric of svc.metrics) {
          if (!metric.lastAccrualDate) {
            metric.lastAccrualDate = action.input.activatedSince;
          }
        }
      }
      for (const group of state.serviceGroups) {
        for (const svc of group.services) {
          for (const metric of svc.metrics) {
            if (!metric.lastAccrualDate) {
              metric.lastAccrualDate = action.input.activatedSince;
            }
          }
        }
      }

      // D-4, BA-5: Initialize billing state on activation
      state.currentBillingCycleStart = action.input.activatedSince;
      if (state.selectedBillingCycle) {
        state.nextBillingDate = calculateNextBillingDate(
          action.input.activatedSince,
          state.selectedBillingCycle,
        );
      }

      // Calculate initial debt: setup costs + first cycle recurring costs
      let initialDebt = 0;
      for (const group of state.serviceGroups) {
        if (group.setupCost) initialDebt += group.setupCost.amount;
        if (group.recurringCost) initialDebt += group.recurringCost.amount;
        for (const svc of group.services) {
          if (svc.setupCost) initialDebt += svc.setupCost.amount;
          if (svc.recurringCost) initialDebt += svc.recurringCost.amount;
        }
      }
      for (const svc of state.services) {
        if (svc.setupCost) initialDebt += svc.setupCost.amount;
        if (svc.recurringCost) initialDebt += svc.recurringCost.amount;
      }
      state.totalDebt = initialDebt;
      state.totalCredit = 0;
      state.currentCycleOverage = 0;
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
    resumeSubscriptionOperation(state, action) {
      if (state.status !== "PAUSED") {
        throw new ResumeNotPausedError(
          `Cannot resume subscription with status ${state.status}`,
        );
      }
      // D-5: paused days don't accrue. Shift each metric's lastAccrualDate
      // forward by the pause duration so post-resume accruals align with
      // billed time, not wall time.
      const pausedSince = state.pausedSince;
      const resumeAt = action.input.timestamp;
      if (pausedSince && resumeAt > pausedSince) {
        const pauseMs =
          new Date(resumeAt).getTime() - new Date(pausedSince).getTime();
        function shiftMetrics(metrics: (typeof state.services)[0]["metrics"]) {
          for (const metric of metrics) {
            if (metric.lastAccrualDate) {
              const shifted = new Date(
                new Date(metric.lastAccrualDate).getTime() + pauseMs,
              );
              metric.lastAccrualDate = shifted.toISOString();
            }
          }
        }
        for (const svc of state.services) {
          shiftMetrics(svc.metrics);
        }
        for (const group of state.serviceGroups) {
          for (const svc of group.services) {
            shiftMetrics(svc.metrics);
          }
        }
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

      // D-9: Initialize billing state for new cycle
      // Cycle starts from nextBillingDate (fixed boundaries per D-4)
      state.currentBillingCycleStart = state.nextBillingDate;
      if (state.nextBillingDate && state.selectedBillingCycle) {
        state.nextBillingDate = calculateNextBillingDate(
          state.nextBillingDate,
          state.selectedBillingCycle,
        );
      }

      // Add recurring costs for the new cycle to totalDebt
      for (const group of state.serviceGroups) {
        if (group.recurringCost) {
          state.totalDebt = (state.totalDebt ?? 0) + group.recurringCost.amount;
        }
      }
      for (const svc of state.services) {
        if (svc.recurringCost) {
          state.totalDebt = (state.totalDebt ?? 0) + svc.recurringCost.amount;
        }
      }

      // Reset the running tally — preserved through EXPIRING is now closed.
      state.currentCycleOverage = 0;

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
    settleBillingCycleOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new NoBillingCycleActiveError(
          `Cannot settle billing cycle when status is ${state.status}`,
        );
      }
      if (
        state.currentBillingCycleStart &&
        action.input.settlementDate < state.currentBillingCycleStart
      ) {
        throw new SettlementDateBeforeCycleStartError(
          "Settlement date is before the current billing cycle start",
        );
      }

      // Force-accrue every metric on every settlement (spec §4.3).
      // Billing cycle is the hard stop — no carryover, no time-extrapolation.
      // Reset rule is driven by metricType, not by accrualCycle matching.
      //
      // D-4 late-settlement cap: when settlement runs *after* the cycle
      // boundary (operator was lagging), the overage window does NOT extend
      // past `nextBillingDate`. Record `lastAccrualDate` at the cycle
      // boundary so the next cycle starts from the right anchor and
      // post-boundary usage is counted against the new cycle, not this one.
      const billingCycle = state.selectedBillingCycle || "MONTHLY";
      const settlementDate = action.input.settlementDate;
      const effectiveAccrualDate =
        state.nextBillingDate && settlementDate > state.nextBillingDate
          ? state.nextBillingDate
          : settlementDate;
      function forceAccrue(metrics: (typeof state.services)[0]["metrics"]) {
        for (const metric of metrics) {
          const cost = calculateOverageCost(metric);
          if (cost > 0) {
            state.totalDebt = (state.totalDebt ?? 0) + cost;
            state.currentCycleOverage = (state.currentCycleOverage ?? 0) + cost;
          }
          if (metric.metricType === "CUMULATIVE") {
            metric.currentUsage = 0;
          }
          metric.lastAccrualDate = effectiveAccrualDate;
        }
      }

      for (const svc of state.services) {
        forceAccrue(svc.metrics);
      }
      for (const group of state.serviceGroups) {
        for (const svc of group.services) {
          forceAccrue(svc.metrics);
        }
      }

      if (state.autoRenew) {
        // Add next cycle recurring costs to totalDebt
        for (const group of state.serviceGroups) {
          if (group.recurringCost) {
            state.totalDebt =
              (state.totalDebt ?? 0) + group.recurringCost.amount;
          }
        }
        for (const svc of state.services) {
          if (svc.recurringCost) {
            state.totalDebt = (state.totalDebt ?? 0) + svc.recurringCost.amount;
          }
        }
        // Advance cycle boundaries (D-4: fixed boundaries)
        state.currentBillingCycleStart = state.nextBillingDate;
        if (state.nextBillingDate) {
          state.nextBillingDate = calculateNextBillingDate(
            state.nextBillingDate,
            billingCycle,
          );
        }
        // Reset the running tally — last cycle's dynamic charges are now
        // part of the settled invoice. New cycle starts at zero.
        state.currentCycleOverage = 0;
      } else {
        state.status = "EXPIRING";
        state.expiringSince = action.input.settlementDate;
        // Preserve currentCycleOverage so the operator can see what's still
        // owed for this final cycle.
      }
    },
  };
