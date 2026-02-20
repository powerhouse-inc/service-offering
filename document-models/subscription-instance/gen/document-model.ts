import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  description:
    "Tracks an individual subscription instance for a service offering, including customer info, tier selection, billing, services, service groups, and usage metrics.",
  extension: "phsi",
  id: "powerhouse/subscription-instance",
  name: "SubscriptionInstance",
  specifications: [
    {
      changeLog: [],
      modules: [
        {
          description:
            "Subscription lifecycle, customer info, tier, billing, and general management operations",
          id: "mod-subscription",
          name: "subscription",
          operations: [
            {
              description: "Initialize a subscription from a service offering",
              errors: [],
              examples: [],
              id: "op-initialize-subscription",
              name: "INITIALIZE_SUBSCRIPTION",
              reducer:
                'state.customerId = action.input.customerId || null;\nstate.customerName = action.input.customerName || null;\nstate.customerEmail = action.input.customerEmail || null;\nstate.serviceOfferingId = action.input.serviceOfferingId || null;\nstate.tierName = action.input.tierName || null;\nstate.tierPricingOptionId = action.input.tierPricingOptionId || null;\nstate.tierPrice = action.input.tierPrice || null;\nstate.tierCurrency = action.input.tierCurrency || null;\nstate.tierPricingMode = action.input.tierPricingMode || null;\nstate.selectedBillingCycle = action.input.selectedBillingCycle || null;\nstate.globalCurrency = action.input.globalCurrency || null;\nif (action.input.resourceId) {\n  state.resource = {\n    id: action.input.resourceId,\n    label: action.input.resourceLabel || null,\n    thumbnailUrl: action.input.resourceThumbnailUrl || null,\n  };\n}\nstate.autoRenew = action.input.autoRenew || false;\nstate.createdAt = action.input.createdAt;\nstate.status = "PENDING";\nstate.services = (action.input.services || []).map((s) => ({\n  id: s.id,\n  name: s.name || null,\n  description: s.description || null,\n  customValue: s.customValue || null,\n  facetSelections: (s.facetSelections || []).map((fs) => ({\n    id: fs.id,\n    facetName: fs.facetName,\n    selectedOption: fs.selectedOption,\n  })),\n  setupCost: s.setupAmount && s.setupCurrency ? {\n    amount: s.setupAmount,\n    currency: s.setupCurrency,\n    billingDate: null,\n    paymentDate: null,\n  } : null,\n  recurringCost: s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle ? {\n    amount: s.recurringAmount,\n    currency: s.recurringCurrency,\n    billingCycle: s.recurringBillingCycle,\n    nextBillingDate: null,\n    lastPaymentDate: null,\n    discount: s.recurringDiscount ? {\n      originalAmount: s.recurringDiscount.originalAmount,\n      discountType: s.recurringDiscount.discountType,\n      discountValue: s.recurringDiscount.discountValue,\n      source: s.recurringDiscount.source,\n    } : null,\n  } : null,\n  metrics: (s.metrics || []).map((m) => ({\n    id: m.id,\n    name: m.name,\n    unitName: m.unitName,\n    limit: m.limit || null,\n    freeLimit: m.freeLimit || null,\n    paidLimit: m.paidLimit || null,\n    unitCost: m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle ? {\n      amount: m.unitCostAmount,\n      currency: m.unitCostCurrency,\n      billingCycle: m.unitCostBillingCycle,\n      nextBillingDate: null,\n      lastPaymentDate: null,\n      discount: null,\n    } : null,\n    currentUsage: m.currentUsage,\n    usageResetPeriod: m.usageResetPeriod || null,\n    nextUsageReset: null,\n  })),\n}));\nstate.serviceGroups = (action.input.serviceGroups || []).map((sg) => ({\n  id: sg.id,\n  name: sg.name,\n  optional: sg.optional,\n  costType: sg.costType || null,\n  setupCost: sg.setupAmount && sg.setupCurrency ? {\n    amount: sg.setupAmount,\n    currency: sg.setupCurrency,\n    billingDate: sg.setupBillingDate || null,\n    paymentDate: null,\n  } : null,\n  recurringCost: sg.recurringAmount && sg.recurringCurrency && sg.recurringBillingCycle ? {\n    amount: sg.recurringAmount,\n    currency: sg.recurringCurrency,\n    billingCycle: sg.recurringBillingCycle,\n    nextBillingDate: null,\n    lastPaymentDate: null,\n    discount: sg.recurringDiscount ? {\n      originalAmount: sg.recurringDiscount.originalAmount,\n      discountType: sg.recurringDiscount.discountType,\n      discountValue: sg.recurringDiscount.discountValue,\n      source: sg.recurringDiscount.source,\n    } : null,\n  } : null,\n  services: (sg.services || []).map((s) => ({\n    id: s.id,\n    name: s.name || null,\n    description: s.description || null,\n    customValue: s.customValue || null,\n    facetSelections: (s.facetSelections || []).map((fs) => ({\n      id: fs.id,\n      facetName: fs.facetName,\n      selectedOption: fs.selectedOption,\n    })),\n    setupCost: s.setupAmount && s.setupCurrency ? {\n      amount: s.setupAmount,\n      currency: s.setupCurrency,\n      billingDate: null,\n      paymentDate: null,\n    } : null,\n    recurringCost: s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle ? {\n      amount: s.recurringAmount,\n      currency: s.recurringCurrency,\n      billingCycle: s.recurringBillingCycle,\n      nextBillingDate: null,\n      lastPaymentDate: null,\n      discount: s.recurringDiscount ? {\n        originalAmount: s.recurringDiscount.originalAmount,\n        discountType: s.recurringDiscount.discountType,\n        discountValue: s.recurringDiscount.discountValue,\n        source: s.recurringDiscount.source,\n      } : null,\n    } : null,\n    metrics: (s.metrics || []).map((m) => ({\n      id: m.id,\n      name: m.name,\n      unitName: m.unitName,\n      limit: m.limit || null,\n      freeLimit: m.freeLimit || null,\n      paidLimit: m.paidLimit || null,\n      unitCost: m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle ? {\n        amount: m.unitCostAmount,\n        currency: m.unitCostCurrency,\n        billingCycle: m.unitCostBillingCycle,\n        nextBillingDate: null,\n        lastPaymentDate: null,\n        discount: null,\n      } : null,\n      currentUsage: m.currentUsage,\n      usageResetPeriod: m.usageResetPeriod || null,\n      nextUsageReset: null,\n    })),\n  })),\n}));',
              schema:
                "input InitializeFacetSelectionInput {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ninput DiscountInfoInitInput {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ninput InitializeMetricInput {\n    id: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n}\n\ninput InitializeServiceInput {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [InitializeFacetSelectionInput!]\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountInfoInitInput\n    metrics: [InitializeMetricInput!]\n}\n\ninput InitializeServiceGroupInput {\n    id: OID!\n    name: String!\n    optional: Boolean!\n    costType: GroupCostType\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountInfoInitInput\n    services: [InitializeServiceInput!]\n}\n\ninput InitializeSubscriptionInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    resourceId: PHID\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n    autoRenew: Boolean\n    createdAt: DateTime!\n    services: [InitializeServiceInput!]\n    serviceGroups: [InitializeServiceGroupInput!]\n}",
              scope: "global",
              template: "Initialize a subscription from a service offering",
            },
            {
              description: "Link a resource document to the subscription",
              errors: [],
              examples: [],
              id: "op-set-resource-document",
              name: "SET_RESOURCE_DOCUMENT",
              reducer:
                "state.resource = {\n  id: action.input.resourceId,\n  label: action.input.resourceLabel || null,\n  thumbnailUrl: action.input.resourceThumbnailUrl || null,\n};",
              schema:
                "input SetResourceDocumentInput {\n    resourceId: PHID!\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n}",
              scope: "global",
              template: "Link a resource document to the subscription",
            },
            {
              description: "Directly update the subscription status",
              errors: [],
              examples: [],
              id: "op-update-subscription-status",
              name: "UPDATE_SUBSCRIPTION_STATUS",
              reducer: "state.status = action.input.status;",
              schema:
                "input UpdateSubscriptionStatusInput {\n    status: SubscriptionStatus!\n}",
              scope: "global",
              template: "Directly update the subscription status",
            },
            {
              description: "Activate a pending subscription",
              errors: [
                {
                  code: "ACTIVATE_NOT_PENDING",
                  description:
                    "Subscription must be in PENDING status to activate",
                  id: "err-activate-not-pending",
                  name: "ActivateNotPendingError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-activate-subscription",
              name: "ACTIVATE_SUBSCRIPTION",
              reducer:
                'if (state.status !== "PENDING") {\n  throw new ActivateNotPendingError(`Cannot activate subscription with status ${state.status}`);\n}\nstate.status = "ACTIVE";\nstate.activatedSince = action.input.activatedSince;',
              schema:
                "input ActivateSubscriptionInput {\n    activatedSince: DateTime!\n}",
              scope: "global",
              template: "Activate a pending subscription",
            },
            {
              description: "Pause an active subscription",
              errors: [
                {
                  code: "PAUSE_NOT_ACTIVE",
                  description: "Subscription must be in ACTIVE status to pause",
                  id: "err-pause-not-active",
                  name: "PauseNotActiveError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-pause-subscription",
              name: "PAUSE_SUBSCRIPTION",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new PauseNotActiveError(`Cannot pause subscription with status ${state.status}`);\n}\nstate.status = "PAUSED";\nstate.pausedSince = action.input.pausedSince;',
              schema:
                "input PauseSubscriptionInput {\n    pausedSince: DateTime!\n}",
              scope: "global",
              template: "Pause an active subscription",
            },
            {
              description: "Mark subscription as expiring",
              errors: [
                {
                  code: "SET_EXPIRING_NOT_ACTIVE",
                  description:
                    "Subscription must be in ACTIVE status to set as expiring",
                  id: "err-set-expiring-not-active",
                  name: "SetExpiringNotActiveError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-set-expiring",
              name: "SET_EXPIRING",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SetExpiringNotActiveError(`Cannot set expiring on subscription with status ${state.status}`);\n}\nstate.status = "EXPIRING";\nstate.expiringSince = action.input.expiringSince;',
              schema:
                "input SetExpiringInput {\n    expiringSince: DateTime!\n}",
              scope: "global",
              template: "Mark subscription as expiring",
            },
            {
              description: "Cancel a subscription with optional reason",
              errors: [
                {
                  code: "CANCEL_ALREADY_CANCELLED",
                  description: "Subscription is already cancelled",
                  id: "err-cancel-already-cancelled",
                  name: "CancelAlreadyCancelledError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-cancel-subscription",
              name: "CANCEL_SUBSCRIPTION",
              reducer:
                'if (state.status === "CANCELLED") {\n  throw new CancelAlreadyCancelledError("Subscription is already cancelled");\n}\nstate.status = "CANCELLED";\nstate.cancelledSince = action.input.cancelledSince;\nstate.cancellationReason = action.input.cancellationReason || null;',
              schema:
                "input CancelSubscriptionInput {\n    cancelledSince: DateTime!\n    cancellationReason: String\n}",
              scope: "global",
              template: "Cancel a subscription with optional reason",
            },
            {
              description: "Resume a paused subscription",
              errors: [
                {
                  code: "RESUME_NOT_PAUSED",
                  description:
                    "Subscription must be in PAUSED status to resume",
                  id: "err-resume-not-paused",
                  name: "ResumeNotPausedError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-resume-subscription",
              name: "RESUME_SUBSCRIPTION",
              reducer:
                'if (state.status !== "PAUSED") {\n  throw new ResumeNotPausedError(`Cannot resume subscription with status ${state.status}`);\n}\nstate.status = "ACTIVE";\nstate.pausedSince = null;',
              schema:
                "input ResumeSubscriptionInput {\n    timestamp: DateTime!\n}",
              scope: "global",
              template: "Resume a paused subscription",
            },
            {
              description: "Renew an expiring subscription",
              errors: [
                {
                  code: "RENEW_NOT_EXPIRING",
                  description:
                    "Subscription must be in EXPIRING status to renew",
                  id: "err-renew-not-expiring",
                  name: "RenewNotExpiringError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-renew-expiring-subscription",
              name: "RENEW_EXPIRING_SUBSCRIPTION",
              reducer:
                'if (state.status !== "EXPIRING") {\n  throw new RenewNotExpiringError(`Cannot renew subscription with status ${state.status}`);\n}\nstate.status = "ACTIVE";\nstate.expiringSince = null;\nstate.renewalDate = action.input.newRenewalDate || null;',
              schema:
                "input RenewExpiringSubscriptionInput {\n    timestamp: DateTime!\n    newRenewalDate: DateTime\n}",
              scope: "global",
              template: "Renew an expiring subscription",
            },
            {
              description: "Assign a budget category",
              errors: [],
              examples: [],
              id: "op-set-budget-category",
              name: "SET_BUDGET_CATEGORY",
              reducer:
                "state.budget = {\n  id: action.input.budgetId,\n  label: action.input.budgetLabel,\n};",
              schema:
                "input SetBudgetCategoryInput {\n    budgetId: OID!\n    budgetLabel: String!\n}",
              scope: "global",
              template: "Assign a budget category",
            },
            {
              description: "Remove budget category",
              errors: [
                {
                  code: "REMOVE_BUDGET_NOT_FOUND",
                  description: "Budget category not found or ID mismatch",
                  id: "err-remove-budget-not-found",
                  name: "RemoveBudgetNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-remove-budget-category",
              name: "REMOVE_BUDGET_CATEGORY",
              reducer:
                "if (!state.budget || state.budget.id !== action.input.budgetId) {\n  throw new RemoveBudgetNotFoundError(`Budget category with ID ${action.input.budgetId} not found`);\n}\nstate.budget = null;",
              schema:
                "input RemoveBudgetCategoryInput {\n    budgetId: OID!\n}",
              scope: "global",
              template: "Remove budget category",
            },
            {
              description: "Update customer details",
              errors: [],
              examples: [],
              id: "op-update-customer-info",
              name: "UPDATE_CUSTOMER_INFO",
              reducer:
                "if (action.input.customerId !== undefined) state.customerId = action.input.customerId || null;\nif (action.input.customerName !== undefined) state.customerName = action.input.customerName || null;\nif (action.input.customerEmail !== undefined) state.customerEmail = action.input.customerEmail || null;",
              schema:
                "input UpdateCustomerInfoInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n}",
              scope: "global",
              template: "Update customer details",
            },
            {
              description: "Update tier selection and pricing",
              errors: [],
              examples: [],
              id: "op-update-tier-info",
              name: "UPDATE_TIER_INFO",
              reducer:
                "if (action.input.tierName !== undefined) state.tierName = action.input.tierName || null;\nif (action.input.tierPricingOptionId !== undefined) state.tierPricingOptionId = action.input.tierPricingOptionId || null;\nif (action.input.tierPrice !== undefined) state.tierPrice = action.input.tierPrice || null;\nif (action.input.tierCurrency !== undefined) state.tierCurrency = action.input.tierCurrency || null;\nif (action.input.tierPricingMode !== undefined) state.tierPricingMode = action.input.tierPricingMode || null;",
              schema:
                "input UpdateTierInfoInput {\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n}",
              scope: "global",
              template: "Update tier selection and pricing",
            },
            {
              description: "Set operator notes",
              errors: [],
              examples: [],
              id: "op-set-operator-notes",
              name: "SET_OPERATOR_NOTES",
              reducer:
                "state.operatorNotes = action.input.operatorNotes || null;",
              schema:
                "input SetOperatorNotesInput {\n    operatorNotes: String\n}",
              scope: "global",
              template: "Set operator notes",
            },
            {
              description: "Toggle auto-renewal",
              errors: [],
              examples: [],
              id: "op-set-auto-renew",
              name: "SET_AUTO_RENEW",
              reducer: "state.autoRenew = action.input.autoRenew;",
              schema: "input SetAutoRenewInput {\n    autoRenew: Boolean!\n}",
              scope: "global",
              template: "Toggle auto-renewal",
            },
            {
              description: "Set renewal date",
              errors: [],
              examples: [],
              id: "op-set-renewal-date",
              name: "SET_RENEWAL_DATE",
              reducer: "state.renewalDate = action.input.renewalDate;",
              schema:
                "input SetRenewalDateInput {\n    renewalDate: DateTime!\n}",
              scope: "global",
              template: "Set renewal date",
            },
            {
              description: "Update billing projections",
              errors: [],
              examples: [],
              id: "op-update-billing-projection",
              name: "UPDATE_BILLING_PROJECTION",
              reducer:
                "if (action.input.nextBillingDate !== undefined) state.nextBillingDate = action.input.nextBillingDate || null;\nif (action.input.projectedBillAmount !== undefined) state.projectedBillAmount = action.input.projectedBillAmount || null;\nif (action.input.projectedBillCurrency !== undefined) state.projectedBillCurrency = action.input.projectedBillCurrency || null;",
              schema:
                "input UpdateBillingProjectionInput {\n    nextBillingDate: DateTime\n    projectedBillAmount: Amount_Money\n    projectedBillCurrency: Currency\n}",
              scope: "global",
              template: "Update billing projections",
            },
          ],
        },
        {
          description:
            "Standalone service CRUD, cost management, facet selections, and payment tracking",
          id: "mod-service",
          name: "service",
          operations: [
            {
              description: "Add a standalone service",
              errors: [],
              examples: [],
              id: "op-add-service",
              name: "ADD_SERVICE",
              reducer:
                "const service = {\n  id: action.input.serviceId,\n  name: action.input.name || null,\n  description: action.input.description || null,\n  customValue: action.input.customValue || null,\n  facetSelections: [],\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: action.input.setupPaymentDate || null,\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: action.input.recurringNextBillingDate || null,\n    lastPaymentDate: action.input.recurringLastPaymentDate || null,\n    discount: action.input.recurringDiscount ? {\n      originalAmount: action.input.recurringDiscount.originalAmount,\n      discountType: action.input.recurringDiscount.discountType,\n      discountValue: action.input.recurringDiscount.discountValue,\n      source: action.input.recurringDiscount.source,\n    } : null,\n  } : null,\n  metrics: [],\n};\nstate.services.push(service);",
              schema:
                "input AddServiceInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    setupPaymentDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringNextBillingDate: DateTime\n    recurringLastPaymentDate: DateTime\n    recurringDiscount: DiscountServiceInfoInput\n}",
              scope: "global",
              template: "Add a standalone service",
            },
            {
              description: "Remove a standalone service",
              errors: [
                {
                  code: "REMOVE_SERVICE_NOT_FOUND",
                  description: "Service not found",
                  id: "err-remove-service-not-found",
                  name: "RemoveServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-remove-service",
              name: "REMOVE_SERVICE",
              reducer:
                "const index = state.services.findIndex((s) => s.id === action.input.serviceId);\nif (index === -1) {\n  throw new RemoveServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nstate.services.splice(index, 1);",
              schema: "input RemoveServiceInput {\n    serviceId: OID!\n}",
              scope: "global",
              template: "Remove a standalone service",
            },
            {
              description: "Update setup cost for a service",
              errors: [
                {
                  code: "UPDATE_SERVICE_SETUP_COST_NOT_FOUND",
                  description: "Service not found for setup cost update",
                  id: "err-update-service-setup-cost-not-found",
                  name: "UpdateServiceSetupCostNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-update-service-setup-cost",
              name: "UPDATE_SERVICE_SETUP_COST",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceSetupCostNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.amount && action.input.currency) {\n  svc.setupCost = {\n    amount: action.input.amount,\n    currency: action.input.currency,\n    billingDate: action.input.billingDate || null,\n    paymentDate: action.input.paymentDate || null,\n  };\n} else if (svc.setupCost) {\n  if (action.input.amount) svc.setupCost.amount = action.input.amount;\n  if (action.input.currency) svc.setupCost.currency = action.input.currency;\n  if (action.input.billingDate !== undefined) svc.setupCost.billingDate = action.input.billingDate || null;\n  if (action.input.paymentDate !== undefined) svc.setupCost.paymentDate = action.input.paymentDate || null;\n}",
              schema:
                "input UpdateServiceSetupCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n    billingDate: DateTime\n    paymentDate: DateTime\n}",
              scope: "global",
              template: "Update setup cost for a service",
            },
            {
              description: "Update recurring cost for a service",
              errors: [
                {
                  code: "UPDATE_SERVICE_RECURRING_COST_NOT_FOUND",
                  description: "Service not found for recurring cost update",
                  id: "err-update-service-recurring-cost-not-found",
                  name: "UpdateServiceRecurringCostNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-update-service-recurring-cost",
              name: "UPDATE_SERVICE_RECURRING_COST",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceRecurringCostNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.amount && action.input.currency && action.input.billingCycle) {\n  svc.recurringCost = {\n    amount: action.input.amount,\n    currency: action.input.currency,\n    billingCycle: action.input.billingCycle,\n    nextBillingDate: action.input.nextBillingDate || null,\n    lastPaymentDate: action.input.lastPaymentDate || null,\n    discount: svc.recurringCost?.discount || null,\n  };\n} else if (svc.recurringCost) {\n  if (action.input.amount) svc.recurringCost.amount = action.input.amount;\n  if (action.input.currency) svc.recurringCost.currency = action.input.currency;\n  if (action.input.billingCycle) svc.recurringCost.billingCycle = action.input.billingCycle;\n  if (action.input.nextBillingDate !== undefined) svc.recurringCost.nextBillingDate = action.input.nextBillingDate || null;\n  if (action.input.lastPaymentDate !== undefined) svc.recurringCost.lastPaymentDate = action.input.lastPaymentDate || null;\n}",
              schema:
                "input UpdateServiceRecurringCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n    billingCycle: BillingCycle\n    nextBillingDate: DateTime\n    lastPaymentDate: DateTime\n}",
              scope: "global",
              template: "Update recurring cost for a service",
            },
            {
              description: "Record a setup payment",
              errors: [
                {
                  code: "REPORT_SETUP_PAYMENT_NOT_FOUND",
                  description: "Service not found for setup payment",
                  id: "err-report-setup-payment-not-found",
                  name: "ReportSetupPaymentServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-report-setup-payment",
              name: "REPORT_SETUP_PAYMENT",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new ReportSetupPaymentServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (svc.setupCost) {\n  svc.setupCost.paymentDate = action.input.paymentDate;\n}",
              schema:
                "input ReportSetupPaymentInput {\n    serviceId: OID!\n    paymentDate: DateTime!\n}",
              scope: "global",
              template: "Record a setup payment",
            },
            {
              description: "Record a recurring payment",
              errors: [
                {
                  code: "REPORT_RECURRING_PAYMENT_NOT_FOUND",
                  description: "Service not found for recurring payment",
                  id: "err-report-recurring-payment-not-found",
                  name: "ReportRecurringPaymentServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-report-recurring-payment",
              name: "REPORT_RECURRING_PAYMENT",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new ReportRecurringPaymentServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (svc.recurringCost) {\n  svc.recurringCost.lastPaymentDate = action.input.paymentDate;\n}",
              schema:
                "input ReportRecurringPaymentInput {\n    serviceId: OID!\n    paymentDate: DateTime!\n}",
              scope: "global",
              template: "Record a recurring payment",
            },
            {
              description: "Update service name, description, custom value",
              errors: [
                {
                  code: "UPDATE_SERVICE_INFO_NOT_FOUND",
                  description: "Service not found for info update",
                  id: "err-update-service-info-not-found",
                  name: "UpdateServiceInfoNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-update-service-info",
              name: "UPDATE_SERVICE_INFO",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceInfoNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.name !== undefined) svc.name = action.input.name || null;\nif (action.input.description !== undefined) svc.description = action.input.description || null;\nif (action.input.customValue !== undefined) svc.customValue = action.input.customValue || null;",
              schema:
                "input UpdateServiceInfoInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n}",
              scope: "global",
              template: "Update service name, description, custom value",
            },
            {
              description: "Add facet selection to a service",
              errors: [
                {
                  code: "ADD_FACET_SERVICE_NOT_FOUND",
                  description: "Service not found for facet selection",
                  id: "err-add-facet-service-not-found",
                  name: "AddServiceFacetSelectionServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-add-service-facet-selection",
              name: "ADD_SERVICE_FACET_SELECTION",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new AddServiceFacetSelectionServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nsvc.facetSelections.push({\n  id: action.input.facetSelectionId,\n  facetName: action.input.facetName,\n  selectedOption: action.input.selectedOption,\n});",
              schema:
                "input AddServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n    facetName: String!\n    selectedOption: String!\n}",
              scope: "global",
              template: "Add facet selection to a service",
            },
            {
              description: "Remove facet selection from a service",
              errors: [
                {
                  code: "REMOVE_FACET_SERVICE_NOT_FOUND",
                  description: "Service not found for facet selection removal",
                  id: "err-remove-facet-service-not-found",
                  name: "RemoveServiceFacetSelectionServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-remove-service-facet-selection",
              name: "REMOVE_SERVICE_FACET_SELECTION",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new RemoveServiceFacetSelectionServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst index = svc.facetSelections.findIndex((fs) => fs.id === action.input.facetSelectionId);\nif (index !== -1) {\n  svc.facetSelections.splice(index, 1);\n}",
              schema:
                "input RemoveServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n}",
              scope: "global",
              template: "Remove facet selection from a service",
            },
          ],
        },
        {
          description:
            "Service group management and grouped service operations",
          id: "mod-service-group",
          name: "service-group",
          operations: [
            {
              description: "Add a service group",
              errors: [],
              examples: [],
              id: "op-add-service-group",
              name: "ADD_SERVICE_GROUP",
              reducer:
                "state.serviceGroups.push({\n  id: action.input.groupId,\n  name: action.input.name,\n  optional: action.input.optional,\n  costType: action.input.costType || null,\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: null,\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: null,\n    lastPaymentDate: null,\n    discount: action.input.recurringDiscount ? {\n      originalAmount: action.input.recurringDiscount.originalAmount,\n      discountType: action.input.recurringDiscount.discountType,\n      discountValue: action.input.recurringDiscount.discountValue,\n      source: action.input.recurringDiscount.source,\n    } : null,\n  } : null,\n  services: [],\n});",
              schema:
                "input DiscountServiceInfoInput {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ninput AddServiceGroupInput {\n    groupId: OID!\n    name: String!\n    optional: Boolean!\n    costType: GroupCostType\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountServiceInfoInput\n}",
              scope: "global",
              template: "Add a service group",
            },
            {
              description: "Remove a service group",
              errors: [
                {
                  code: "REMOVE_GROUP_NOT_FOUND",
                  description: "Service group not found",
                  id: "err-remove-group-not-found",
                  name: "RemoveServiceGroupNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-remove-service-group",
              name: "REMOVE_SERVICE_GROUP",
              reducer:
                "const index = state.serviceGroups.findIndex((g) => g.id === action.input.groupId);\nif (index === -1) {\n  throw new RemoveServiceGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nstate.serviceGroups.splice(index, 1);",
              schema: "input RemoveServiceGroupInput {\n    groupId: OID!\n}",
              scope: "global",
              template: "Remove a service group",
            },
            {
              description: "Add a service to a group",
              errors: [
                {
                  code: "ADD_TO_GROUP_NOT_FOUND",
                  description: "Service group not found when adding service",
                  id: "err-add-to-group-not-found",
                  name: "AddServiceToGroupGroupNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-add-service-to-group",
              name: "ADD_SERVICE_TO_GROUP",
              reducer:
                "const group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new AddServiceToGroupGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\ngroup.services.push({\n  id: action.input.serviceId,\n  name: action.input.name || null,\n  description: action.input.description || null,\n  customValue: action.input.customValue || null,\n  facetSelections: [],\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: action.input.setupPaymentDate || null,\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: action.input.recurringNextBillingDate || null,\n    lastPaymentDate: action.input.recurringLastPaymentDate || null,\n    discount: null,\n  } : null,\n  metrics: [],\n});",
              schema:
                "input AddServiceToGroupInput {\n    groupId: OID!\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    setupPaymentDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringNextBillingDate: DateTime\n    recurringLastPaymentDate: DateTime\n}",
              scope: "global",
              template: "Add a service to a group",
            },
            {
              description: "Remove a service from a group",
              errors: [
                {
                  code: "REMOVE_FROM_GROUP_NOT_FOUND",
                  description: "Service group not found when removing service",
                  id: "err-remove-from-group-not-found",
                  name: "RemoveServiceFromGroupGroupNotFoundError",
                  template: "",
                },
                {
                  code: "REMOVE_FROM_GROUP_SERVICE_NOT_FOUND",
                  description: "Service not found in the group",
                  id: "err-remove-from-group-service-not-found",
                  name: "RemoveServiceFromGroupServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-remove-service-from-group",
              name: "REMOVE_SERVICE_FROM_GROUP",
              reducer:
                "const group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new RemoveServiceFromGroupGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nconst index = group.services.findIndex((s) => s.id === action.input.serviceId);\nif (index === -1) {\n  throw new RemoveServiceFromGroupServiceNotFoundError(`Service with ID ${action.input.serviceId} not found in group ${action.input.groupId}`);\n}\ngroup.services.splice(index, 1);",
              schema:
                "input RemoveServiceFromGroupInput {\n    groupId: OID!\n    serviceId: OID!\n}",
              scope: "global",
              template: "Remove a service from a group",
            },
            {
              description: "Update group setup and recurring costs",
              errors: [
                {
                  code: "UPDATE_GROUP_COST_NOT_FOUND",
                  description: "Service group not found for cost update",
                  id: "err-update-group-cost-not-found",
                  name: "UpdateServiceGroupCostNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-update-service-group-cost",
              name: "UPDATE_SERVICE_GROUP_COST",
              reducer:
                "const group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new UpdateServiceGroupCostNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nif (action.input.setupAmount && action.input.setupCurrency) {\n  group.setupCost = {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: group.setupCost?.paymentDate || null,\n  };\n} else if (group.setupCost) {\n  if (action.input.setupAmount) group.setupCost.amount = action.input.setupAmount;\n  if (action.input.setupCurrency) group.setupCost.currency = action.input.setupCurrency;\n  if (action.input.setupBillingDate !== undefined) group.setupCost.billingDate = action.input.setupBillingDate || null;\n}\nif (action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle) {\n  group.recurringCost = {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: group.recurringCost?.nextBillingDate || null,\n    lastPaymentDate: group.recurringCost?.lastPaymentDate || null,\n    discount: group.recurringCost?.discount || null,\n  };\n} else if (group.recurringCost) {\n  if (action.input.recurringAmount) group.recurringCost.amount = action.input.recurringAmount;\n  if (action.input.recurringCurrency) group.recurringCost.currency = action.input.recurringCurrency;\n  if (action.input.recurringBillingCycle) group.recurringCost.billingCycle = action.input.recurringBillingCycle;\n}",
              schema:
                "input UpdateServiceGroupCostInput {\n    groupId: OID!\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n}",
              scope: "global",
              template: "Update group setup and recurring costs",
            },
          ],
        },
        {
          description: "Service metric tracking and usage management",
          id: "mod-metrics",
          name: "metrics",
          operations: [
            {
              description: "Add a metric to a service",
              errors: [
                {
                  code: "ADD_METRIC_SERVICE_NOT_FOUND",
                  description: "Service not found when adding metric",
                  id: "err-add-metric-service-not-found",
                  name: "AddServiceMetricServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-add-service-metric",
              name: "ADD_SERVICE_METRIC",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new AddServiceMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nsvc.metrics.push({\n  id: action.input.metricId,\n  name: action.input.name,\n  unitName: action.input.unitName,\n  limit: action.input.limit || null,\n  freeLimit: action.input.freeLimit || null,\n  paidLimit: action.input.paidLimit || null,\n  unitCost: action.input.unitCostAmount && action.input.unitCostCurrency && action.input.unitCostBillingCycle ? {\n    amount: action.input.unitCostAmount,\n    currency: action.input.unitCostCurrency,\n    billingCycle: action.input.unitCostBillingCycle,\n    nextBillingDate: action.input.unitCostNextBillingDate || null,\n    lastPaymentDate: action.input.unitCostLastPaymentDate || null,\n    discount: null,\n  } : null,\n  currentUsage: action.input.currentUsage,\n  usageResetPeriod: action.input.usageResetPeriod || null,\n  nextUsageReset: action.input.nextUsageReset || null,\n});",
              schema:
                "input AddServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n    unitCostNextBillingDate: DateTime\n    unitCostLastPaymentDate: DateTime\n}",
              scope: "global",
              template: "Add a metric to a service",
            },
            {
              description: "Update metric configuration",
              errors: [
                {
                  code: "UPDATE_METRIC_SERVICE_NOT_FOUND",
                  description: "Service not found for metric update",
                  id: "err-update-metric-service-not-found",
                  name: "UpdateMetricServiceNotFoundError",
                  template: "",
                },
                {
                  code: "UPDATE_METRIC_NOT_FOUND",
                  description: "Metric not found",
                  id: "err-update-metric-not-found",
                  name: "UpdateMetricNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-update-metric",
              name: "UPDATE_METRIC",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new UpdateMetricNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nif (action.input.name) metric.name = action.input.name;\nif (action.input.unitName) metric.unitName = action.input.unitName;\nif (action.input.limit !== undefined) metric.limit = action.input.limit || null;\nif (action.input.usageResetPeriod !== undefined) metric.usageResetPeriod = action.input.usageResetPeriod || null;\nif (action.input.nextUsageReset !== undefined) metric.nextUsageReset = action.input.nextUsageReset || null;",
              schema:
                "input UpdateMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String\n    unitName: String\n    limit: Int\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}",
              scope: "global",
              template: "Update metric configuration",
            },
            {
              description: "Set metric usage directly",
              errors: [
                {
                  code: "UPDATE_USAGE_SERVICE_NOT_FOUND",
                  description: "Service not found for usage update",
                  id: "err-update-usage-service-not-found",
                  name: "UpdateMetricUsageServiceNotFoundError",
                  template: "",
                },
                {
                  code: "UPDATE_USAGE_METRIC_NOT_FOUND",
                  description: "Metric not found for usage update",
                  id: "err-update-usage-metric-not-found",
                  name: "UpdateMetricUsageNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-update-metric-usage",
              name: "UPDATE_METRIC_USAGE",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateMetricUsageServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new UpdateMetricUsageNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nmetric.currentUsage = action.input.currentUsage;",
              schema:
                "input UpdateMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    currentUsage: Int!\n}",
              scope: "global",
              template: "Set metric usage directly",
            },
            {
              description: "Remove a metric from a service",
              errors: [
                {
                  code: "REMOVE_METRIC_SERVICE_NOT_FOUND",
                  description: "Service not found for metric removal",
                  id: "err-remove-metric-service-not-found",
                  name: "RemoveServiceMetricServiceNotFoundError",
                  template: "",
                },
                {
                  code: "REMOVE_METRIC_NOT_FOUND",
                  description: "Metric not found for removal",
                  id: "err-remove-metric-not-found",
                  name: "RemoveServiceMetricNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-remove-service-metric",
              name: "REMOVE_SERVICE_METRIC",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new RemoveServiceMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst index = svc.metrics.findIndex((m) => m.id === action.input.metricId);\nif (index === -1) {\n  throw new RemoveServiceMetricNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nsvc.metrics.splice(index, 1);",
              schema:
                "input RemoveServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n}",
              scope: "global",
              template: "Remove a metric from a service",
            },
            {
              description: "Increment usage counter",
              errors: [
                {
                  code: "INCREMENT_SERVICE_NOT_FOUND",
                  description: "Service not found for increment",
                  id: "err-increment-service-not-found",
                  name: "IncrementMetricUsageServiceNotFoundError",
                  template: "",
                },
                {
                  code: "INCREMENT_METRIC_NOT_FOUND",
                  description: "Metric not found for increment",
                  id: "err-increment-metric-not-found",
                  name: "IncrementMetricUsageNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-increment-metric-usage",
              name: "INCREMENT_METRIC_USAGE",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new IncrementMetricUsageServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new IncrementMetricUsageNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nmetric.currentUsage += action.input.incrementBy;",
              schema:
                "input IncrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    incrementBy: Int!\n}",
              scope: "global",
              template: "Increment usage counter",
            },
            {
              description: "Decrement usage counter",
              errors: [
                {
                  code: "DECREMENT_SERVICE_NOT_FOUND",
                  description: "Service not found for decrement",
                  id: "err-decrement-service-not-found",
                  name: "DecrementMetricUsageServiceNotFoundError",
                  template: "",
                },
                {
                  code: "DECREMENT_METRIC_NOT_FOUND",
                  description: "Metric not found for decrement",
                  id: "err-decrement-metric-not-found",
                  name: "DecrementMetricUsageNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "op-decrement-metric-usage",
              name: "DECREMENT_METRIC_USAGE",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new DecrementMetricUsageServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new DecrementMetricUsageNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nmetric.currentUsage -= action.input.decrementBy;",
              schema:
                "input DecrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    decrementBy: Int!\n}",
              scope: "global",
              template: "Decrement usage counter",
            },
          ],
        },
        {
          description: "Customer type and team member management",
          id: "mod-customer",
          name: "customer",
          operations: [
            {
              description: "Set customer type (individual/team)",
              errors: [],
              examples: [],
              id: "op-set-customer-type",
              name: "SET_CUSTOMER_TYPE",
              reducer:
                "state.customerType = action.input.customerType;\nstate.teamMemberCount = action.input.teamMemberCount || null;",
              schema:
                "input SetCustomerTypeInput {\n    customerType: CustomerType!\n    teamMemberCount: Int\n}",
              scope: "global",
              template: "Set customer type (individual/team)",
            },
            {
              description: "Update team member count",
              errors: [],
              examples: [],
              id: "op-update-team-member-count",
              name: "UPDATE_TEAM_MEMBER_COUNT",
              reducer: "state.teamMemberCount = action.input.teamMemberCount;",
              schema:
                "input UpdateTeamMemberCountInput {\n    teamMemberCount: Int!\n}",
              scope: "global",
              template: "Update team member count",
            },
          ],
        },
      ],
      state: {
        global: {
          examples: [],
          initialValue:
            '{"customerId":null,"customerName":null,"customerEmail":null,"customerType":null,"teamMemberCount":null,"operatorId":null,"serviceOfferingId":null,"tierName":null,"tierPricingOptionId":null,"tierPrice":null,"tierCurrency":null,"tierPricingMode":null,"selectedBillingCycle":null,"globalCurrency":null,"resource":null,"status":"PENDING","createdAt":null,"activatedSince":null,"pausedSince":null,"expiringSince":null,"renewalDate":null,"cancelledSince":null,"cancellationReason":null,"autoRenew":false,"operatorNotes":null,"budget":null,"nextBillingDate":null,"projectedBillAmount":null,"projectedBillCurrency":null,"services":[],"serviceGroups":[]}',
          schema:
            "type SubscriptionInstanceState {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    customerType: CustomerType\n    teamMemberCount: Int\n    operatorId: PHID\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    resource: ResourceDocument\n    status: SubscriptionStatus!\n    createdAt: DateTime\n    activatedSince: DateTime\n    pausedSince: DateTime\n    expiringSince: DateTime\n    renewalDate: DateTime\n    cancelledSince: DateTime\n    cancellationReason: String\n    autoRenew: Boolean!\n    operatorNotes: String\n    budget: BudgetCategory\n    nextBillingDate: DateTime\n    projectedBillAmount: Amount_Money\n    projectedBillCurrency: Currency\n    services: [Service!]!\n    serviceGroups: [ServiceGroup!]!\n}\n\nenum TierPricingMode {\n    CALCULATED\n    MANUAL_OVERRIDE\n}\n\nenum CustomerType {\n    INDIVIDUAL\n    TEAM\n}\n\nenum GroupCostType {\n    RECURRING\n    SETUP\n}\n\nenum SubscriptionStatus {\n    PENDING\n    ACTIVE\n    PAUSED\n    EXPIRING\n    CANCELLED\n}\n\nenum DiscountType {\n    PERCENTAGE\n    FLAT_AMOUNT\n}\n\nenum DiscountSource {\n    TIER_INHERITED\n    GROUP_INDEPENDENT\n    BUNDLE\n}\n\nenum BillingCycle {\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n    ONE_TIME\n}\n\nenum ResetPeriod {\n    HOURLY\n    DAILY\n    WEEKLY\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n}\n\ntype DiscountInfo {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ntype SetupCost {\n    amount: Amount_Money!\n    currency: Currency!\n    billingDate: DateTime\n    paymentDate: DateTime\n}\n\ntype RecurringCost {\n    amount: Amount_Money!\n    currency: Currency!\n    billingCycle: BillingCycle!\n    nextBillingDate: DateTime\n    lastPaymentDate: DateTime\n    discount: DiscountInfo\n}\n\ntype ResourceDocument {\n    id: PHID!\n    label: String\n    thumbnailUrl: URL\n}\n\ntype BudgetCategory {\n    id: OID!\n    label: String!\n}\n\ntype ServiceFacetSelection {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ntype ServiceMetric {\n    id: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    unitCost: RecurringCost\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}\n\ntype Service {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [ServiceFacetSelection!]!\n    setupCost: SetupCost\n    recurringCost: RecurringCost\n    metrics: [ServiceMetric!]!\n}\n\ntype ServiceGroup {\n    id: OID!\n    optional: Boolean!\n    name: String!\n    costType: GroupCostType\n    setupCost: SetupCost\n    recurringCost: RecurringCost\n    services: [Service!]!\n}\n\n",
        },
        local: {
          examples: [],
          initialValue: "",
          schema: "",
        },
      },
      version: 1,
    },
  ],
};
