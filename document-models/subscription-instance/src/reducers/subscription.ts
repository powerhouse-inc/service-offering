import type {
  DiscountInfo,
  RecurringCost,
  Service,
  ServiceGroup,
  ServiceMetric,
  SetupCost,
} from "../../gen/schema/types.js";
import type { SubscriptionInstanceSubscriptionOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceSubscriptionOperations: SubscriptionInstanceSubscriptionOperations =
  {
    initializeSubscriptionOperation(state, action) {
      const { input } = action;
      state.customerId = input.customerId || null;
      state.customerName = input.customerName || null;
      state.customerEmail = input.customerEmail || null;
      state.serviceOfferingId = input.serviceOfferingId || null;
      state.tierName = input.tierName || null;
      state.tierPricingOptionId = input.tierPricingOptionId || null;
      state.tierPrice = input.tierPrice ?? null;
      state.tierCurrency = input.tierCurrency || null;
      state.tierPricingMode = input.tierPricingMode || null;
      state.selectedBillingCycle = input.selectedBillingCycle || null;
      state.globalCurrency = input.globalCurrency || null;
      state.autoRenew = input.autoRenew ?? false;
      state.createdAt = input.createdAt;
      state.status = "PENDING";

      if (input.resourceId) {
        state.resource = {
          id: input.resourceId,
          label: input.resourceLabel || null,
          thumbnailUrl: input.resourceThumbnailUrl || null,
        };
      }

      if (input.services) {
        for (const svc of input.services) {
          let svcDiscount: DiscountInfo | null = null;
          if (svc.recurringDiscount) {
            svcDiscount = {
              originalAmount: svc.recurringDiscount.originalAmount,
              discountType: svc.recurringDiscount.discountType,
              discountValue: svc.recurringDiscount.discountValue,
              source: svc.recurringDiscount.source,
            };
          }
          let svcSetup: SetupCost | null = null;
          if (svc.setupAmount && svc.setupCurrency) {
            svcSetup = {
              amount: svc.setupAmount,
              currency: svc.setupCurrency,
              billingDate: null,
              paymentDate: null,
            };
          }
          let svcRecurring: RecurringCost | null = null;
          if (
            svc.recurringAmount &&
            svc.recurringCurrency &&
            svc.recurringBillingCycle
          ) {
            svcRecurring = {
              amount: svc.recurringAmount,
              currency: svc.recurringCurrency,
              billingCycle: svc.recurringBillingCycle,
              nextBillingDate: null,
              lastPaymentDate: null,
              discount: svcDiscount,
            };
          }
          const metrics: ServiceMetric[] = (svc.metrics || []).map((m) => ({
            id: m.id,
            name: m.name,
            unitName: m.unitName,
            limit: m.limit ?? null,
            freeLimit: m.freeLimit ?? null,
            paidLimit: m.paidLimit ?? null,
            currentUsage: m.currentUsage,
            usageResetPeriod: m.usageResetPeriod || null,
            nextUsageReset: null,
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
          }));
          state.services.push({
            id: svc.id,
            name: svc.name || null,
            description: svc.description || null,
            customValue: svc.customValue || null,
            facetSelections: (svc.facetSelections || []).map((f) => ({
              id: f.id,
              facetName: f.facetName,
              selectedOption: f.selectedOption,
            })),
            setupCost: svcSetup,
            recurringCost: svcRecurring,
            metrics,
          });
        }
      }

      if (input.serviceGroups) {
        for (const grp of input.serviceGroups) {
          let grpDiscount: DiscountInfo | null = null;
          if (grp.recurringDiscount) {
            grpDiscount = {
              originalAmount: grp.recurringDiscount.originalAmount,
              discountType: grp.recurringDiscount.discountType,
              discountValue: grp.recurringDiscount.discountValue,
              source: grp.recurringDiscount.source,
            };
          }
          let grpSetup: SetupCost | null = null;
          if (grp.setupAmount && grp.setupCurrency) {
            grpSetup = {
              amount: grp.setupAmount,
              currency: grp.setupCurrency,
              billingDate: grp.setupBillingDate || null,
              paymentDate: null,
            };
          }
          let grpRecurring: RecurringCost | null = null;
          if (
            grp.recurringAmount &&
            grp.recurringCurrency &&
            grp.recurringBillingCycle
          ) {
            grpRecurring = {
              amount: grp.recurringAmount,
              currency: grp.recurringCurrency,
              billingCycle: grp.recurringBillingCycle,
              nextBillingDate: null,
              lastPaymentDate: null,
              discount: grpDiscount,
            };
          }
          const groupServices: Service[] = (grp.services || []).map((svc) => {
            let svcD: DiscountInfo | null = null;
            if (svc.recurringDiscount) {
              svcD = {
                originalAmount: svc.recurringDiscount.originalAmount,
                discountType: svc.recurringDiscount.discountType,
                discountValue: svc.recurringDiscount.discountValue,
                source: svc.recurringDiscount.source,
              };
            }
            return {
              id: svc.id,
              name: svc.name || null,
              description: svc.description || null,
              customValue: svc.customValue || null,
              facetSelections: (svc.facetSelections || []).map((f) => ({
                id: f.id,
                facetName: f.facetName,
                selectedOption: f.selectedOption,
              })),
              setupCost:
                svc.setupAmount && svc.setupCurrency
                  ? {
                      amount: svc.setupAmount,
                      currency: svc.setupCurrency,
                      billingDate: null,
                      paymentDate: null,
                    }
                  : null,
              recurringCost:
                svc.recurringAmount &&
                svc.recurringCurrency &&
                svc.recurringBillingCycle
                  ? {
                      amount: svc.recurringAmount,
                      currency: svc.recurringCurrency,
                      billingCycle: svc.recurringBillingCycle,
                      nextBillingDate: null,
                      lastPaymentDate: null,
                      discount: svcD,
                    }
                  : null,
              metrics: (svc.metrics || []).map((m) => ({
                id: m.id,
                name: m.name,
                unitName: m.unitName,
                limit: m.limit ?? null,
                freeLimit: m.freeLimit ?? null,
                paidLimit: m.paidLimit ?? null,
                currentUsage: m.currentUsage,
                usageResetPeriod: m.usageResetPeriod || null,
                nextUsageReset: null,
                unitCost:
                  m.unitCostAmount &&
                  m.unitCostCurrency &&
                  m.unitCostBillingCycle
                    ? {
                        amount: m.unitCostAmount,
                        currency: m.unitCostCurrency,
                        billingCycle: m.unitCostBillingCycle,
                        nextBillingDate: null,
                        lastPaymentDate: null,
                        discount: null,
                      }
                    : null,
              })),
            };
          });
          const serviceGroup: ServiceGroup = {
            id: grp.id,
            name: grp.name,
            optional: grp.optional,
            costType: grp.costType || null,
            setupCost: grpSetup,
            recurringCost: grpRecurring,
            services: groupServices,
          };
          state.serviceGroups.push(serviceGroup);
        }
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
      if (input.tierName) state.tierName = input.tierName;
      if (input.tierPricingOptionId)
        state.tierPricingOptionId = input.tierPricingOptionId;
      if (input.tierPrice !== undefined && input.tierPrice !== null)
        state.tierPrice = input.tierPrice;
      if (input.tierCurrency) state.tierCurrency = input.tierCurrency;
      if (input.tierPricingMode) state.tierPricingMode = input.tierPricingMode;
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
  };
