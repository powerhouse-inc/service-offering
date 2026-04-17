import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/subscription-instance",
  name: "SubscriptionInstance",
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  extension: "",
  description:
    "Tracks an individual subscription instance for a service offering, including customer info, tier selection, billing, services, service groups, and usage metrics.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "type SubscriptionInstanceState {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    customerType: CustomerType\n    teamMemberCount: Int\n    operatorId: PHID\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    resource: ResourceDocument\n    status: SubscriptionStatus!\n    createdAt: DateTime\n    activatedSince: DateTime\n    pausedSince: DateTime\n    expiringSince: DateTime\n    renewalDate: DateTime\n    cancelledSince: DateTime\n    cancellationReason: String\n    autoRenew: Boolean!\n    operatorNotes: String\n    budget: BudgetCategory\n    nextBillingDate: DateTime\n    currentBillingCycleStart: DateTime\n    totalDebt: Amount_Money\n    totalCredit: Amount_Money\n    services: [Service!]!\n    serviceGroups: [ServiceGroup!]!\n}\n\nenum TierPricingMode {\n    CALCULATED\n    MANUAL_OVERRIDE\n}\n\nenum CustomerType {\n    INDIVIDUAL\n    TEAM\n}\n\nenum GroupCostType {\n    RECURRING\n    SETUP\n}\n\nenum SubscriptionStatus {\n    PENDING\n    ACTIVE\n    PAUSED\n    EXPIRING\n    CANCELLED\n}\n\nenum DiscountType {\n    PERCENTAGE\n    FLAT_AMOUNT\n}\n\nenum DiscountSource {\n    TIER_INHERITED\n    GROUP_INDEPENDENT\n    BUNDLE\n}\n\nenum BillingCycle {\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n    ONE_TIME\n}\n\nenum ResetPeriod {\n    HOURLY\n    DAILY\n    WEEKLY\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n}\n\ntype DiscountInfo {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ntype SetupCost {\n    amount: Amount_Money!\n    currency: Currency!\n    billingDate: DateTime\n    paymentDate: DateTime\n}\n\ntype RecurringCost {\n    amount: Amount_Money!\n    currency: Currency!\n    billingCycle: BillingCycle!\n    nextBillingDate: DateTime\n    lastPaymentDate: DateTime\n    discount: DiscountInfo\n}\n\ntype ResourceDocument {\n    id: PHID!\n    label: String\n    thumbnailUrl: URL\n}\n\ntype BudgetCategory {\n    id: OID!\n    label: String!\n}\n\ntype ServiceFacetSelection {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ntype ServiceMetric {\n    id: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    unitCost: RecurringCost\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}\n\ntype Service {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [ServiceFacetSelection!]!\n    setupCost: SetupCost\n    recurringCost: RecurringCost\n    metrics: [ServiceMetric!]!\n}\n\ntype ServiceGroup {\n    id: OID!\n    optional: Boolean!\n    name: String!\n    costType: GroupCostType\n    setupCost: SetupCost\n    recurringCost: RecurringCost\n    services: [Service!]!\n}",
          examples: [],
          initialValue:
            '{"customerId":null,"customerName":null,"customerEmail":null,"customerType":null,"teamMemberCount":null,"operatorId":null,"serviceOfferingId":null,"tierName":null,"tierPricingOptionId":null,"tierPrice":null,"tierCurrency":null,"tierPricingMode":null,"selectedBillingCycle":null,"globalCurrency":null,"resource":null,"status":"PENDING","createdAt":null,"activatedSince":null,"pausedSince":null,"expiringSince":null,"renewalDate":null,"cancelledSince":null,"cancellationReason":null,"autoRenew":false,"operatorNotes":null,"budget":null,"nextBillingDate":null,"currentBillingCycleStart":null,"totalDebt":null,"totalCredit":null,"services":[],"serviceGroups":[]}',
        },
      },
      modules: [
        {
          id: "mod-subscription",
          name: "subscription",
          operations: [
            {
              id: "op-initialize-subscription",
              name: "INITIALIZE_SUBSCRIPTION",
              scope: "global",
              errors: [],
              schema:
                "input InitializeFacetSelectionInput {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ninput DiscountInfoInitInput {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ninput InitializeMetricInput {\n    id: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n}\n\ninput InitializeServiceInput {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [InitializeFacetSelectionInput!]\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountInfoInitInput\n    metrics: [InitializeMetricInput!]\n}\n\ninput InitializeServiceGroupInput {\n    id: OID!\n    name: String!\n    optional: Boolean!\n    costType: GroupCostType\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountInfoInitInput\n    services: [InitializeServiceInput!]\n}\n\ninput InitializeSubscriptionInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    resourceId: PHID\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n    autoRenew: Boolean\n    createdAt: DateTime!\n    services: [InitializeServiceInput!]\n    serviceGroups: [InitializeServiceGroupInput!]\n}",
              reducer:
                'state.customerId = action.input.customerId || null;\nstate.customerName = action.input.customerName || null;\nstate.customerEmail = action.input.customerEmail || null;\nstate.serviceOfferingId = action.input.serviceOfferingId || null;\nstate.tierName = action.input.tierName || null;\nstate.tierPricingOptionId = action.input.tierPricingOptionId || null;\nstate.tierPrice = action.input.tierPrice || null;\nstate.tierCurrency = action.input.tierCurrency || null;\nstate.tierPricingMode = action.input.tierPricingMode || null;\nstate.selectedBillingCycle = action.input.selectedBillingCycle || null;\nstate.globalCurrency = action.input.globalCurrency || null;\nif (action.input.resourceId) {\n  state.resource = {\n    id: action.input.resourceId,\n    label: action.input.resourceLabel || null,\n    thumbnailUrl: action.input.resourceThumbnailUrl || null,\n  };\n}\nstate.autoRenew = action.input.autoRenew || false;\nstate.createdAt = action.input.createdAt;\nstate.status = "PENDING";\nstate.services = (action.input.services || []).map((s) => ({\n  id: s.id,\n  name: s.name || null,\n  description: s.description || null,\n  customValue: s.customValue || null,\n  facetSelections: (s.facetSelections || []).map((fs) => ({\n    id: fs.id,\n    facetName: fs.facetName,\n    selectedOption: fs.selectedOption,\n  })),\n  setupCost: s.setupAmount && s.setupCurrency ? {\n    amount: s.setupAmount,\n    currency: s.setupCurrency,\n    billingDate: null,\n    paymentDate: null,\n  } : null,\n  recurringCost: s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle ? {\n    amount: s.recurringAmount,\n    currency: s.recurringCurrency,\n    billingCycle: s.recurringBillingCycle,\n    nextBillingDate: null,\n    lastPaymentDate: null,\n    discount: s.recurringDiscount ? {\n      originalAmount: s.recurringDiscount.originalAmount,\n      discountType: s.recurringDiscount.discountType,\n      discountValue: s.recurringDiscount.discountValue,\n      source: s.recurringDiscount.source,\n    } : null,\n  } : null,\n  metrics: (s.metrics || []).map((m) => ({\n    id: m.id,\n    name: m.name,\n    unitName: m.unitName,\n    limit: m.limit || null,\n    freeLimit: m.freeLimit || null,\n    paidLimit: m.paidLimit || null,\n    unitCost: m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle ? {\n      amount: m.unitCostAmount,\n      currency: m.unitCostCurrency,\n      billingCycle: m.unitCostBillingCycle,\n      nextBillingDate: null,\n      lastPaymentDate: null,\n      discount: null,\n    } : null,\n    currentUsage: m.currentUsage,\n    usageResetPeriod: m.usageResetPeriod || null,\n    nextUsageReset: null,\n  })),\n}));\nstate.serviceGroups = (action.input.serviceGroups || []).map((sg) => ({\n  id: sg.id,\n  name: sg.name,\n  optional: sg.optional,\n  costType: sg.costType || null,\n  setupCost: sg.setupAmount && sg.setupCurrency ? {\n    amount: sg.setupAmount,\n    currency: sg.setupCurrency,\n    billingDate: sg.setupBillingDate || null,\n    paymentDate: null,\n  } : null,\n  recurringCost: sg.recurringAmount && sg.recurringCurrency && sg.recurringBillingCycle ? {\n    amount: sg.recurringAmount,\n    currency: sg.recurringCurrency,\n    billingCycle: sg.recurringBillingCycle,\n    nextBillingDate: null,\n    lastPaymentDate: null,\n    discount: sg.recurringDiscount ? {\n      originalAmount: sg.recurringDiscount.originalAmount,\n      discountType: sg.recurringDiscount.discountType,\n      discountValue: sg.recurringDiscount.discountValue,\n      source: sg.recurringDiscount.source,\n    } : null,\n  } : null,\n  services: (sg.services || []).map((s) => ({\n    id: s.id,\n    name: s.name || null,\n    description: s.description || null,\n    customValue: s.customValue || null,\n    facetSelections: (s.facetSelections || []).map((fs) => ({\n      id: fs.id,\n      facetName: fs.facetName,\n      selectedOption: fs.selectedOption,\n    })),\n    setupCost: s.setupAmount && s.setupCurrency ? {\n      amount: s.setupAmount,\n      currency: s.setupCurrency,\n      billingDate: null,\n      paymentDate: null,\n    } : null,\n    recurringCost: s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle ? {\n      amount: s.recurringAmount,\n      currency: s.recurringCurrency,\n      billingCycle: s.recurringBillingCycle,\n      nextBillingDate: null,\n      lastPaymentDate: null,\n      discount: s.recurringDiscount ? {\n        originalAmount: s.recurringDiscount.originalAmount,\n        discountType: s.recurringDiscount.discountType,\n        discountValue: s.recurringDiscount.discountValue,\n        source: s.recurringDiscount.source,\n      } : null,\n    } : null,\n    metrics: (s.metrics || []).map((m) => ({\n      id: m.id,\n      name: m.name,\n      unitName: m.unitName,\n      limit: m.limit || null,\n      freeLimit: m.freeLimit || null,\n      paidLimit: m.paidLimit || null,\n      unitCost: m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle ? {\n        amount: m.unitCostAmount,\n        currency: m.unitCostCurrency,\n        billingCycle: m.unitCostBillingCycle,\n        nextBillingDate: null,\n        lastPaymentDate: null,\n        discount: null,\n      } : null,\n      currentUsage: m.currentUsage,\n      usageResetPeriod: m.usageResetPeriod || null,\n      nextUsageReset: null,\n    })),\n  })),\n}));',
              examples: [],
              template: "Initialize a subscription from a service offering",
              description: "Initialize a subscription from a service offering",
            },
            {
              id: "op-set-resource-document",
              name: "SET_RESOURCE_DOCUMENT",
              scope: "global",
              errors: [],
              schema:
                "input SetResourceDocumentInput {\n    resourceId: PHID!\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n}",
              reducer:
                "state.resource = {\n  id: action.input.resourceId,\n  label: action.input.resourceLabel || null,\n  thumbnailUrl: action.input.resourceThumbnailUrl || null,\n};",
              examples: [],
              template: "Link a resource document to the subscription",
              description: "Link a resource document to the subscription",
            },
            {
              id: "op-update-subscription-status",
              name: "UPDATE_SUBSCRIPTION_STATUS",
              scope: "global",
              errors: [],
              schema:
                "input UpdateSubscriptionStatusInput {\n    status: SubscriptionStatus!\n}",
              reducer: "state.status = action.input.status;",
              examples: [],
              template: "Directly update the subscription status",
              description: "Directly update the subscription status",
            },
            {
              id: "op-activate-subscription",
              name: "ACTIVATE_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-activate-not-pending",
                  code: "ACTIVATE_NOT_PENDING",
                  name: "ActivateNotPendingError",
                  template: "",
                  description:
                    "Subscription must be in PENDING status to activate",
                },
              ],
              schema:
                "input ActivateSubscriptionInput {\n    activatedSince: DateTime!\n}",
              reducer:
                'if (state.status !== "PENDING") {\n  throw new ActivateNotPendingError(`Cannot activate subscription with status ${state.status}`);\n}\nstate.status = "ACTIVE";\nstate.activatedSince = action.input.activatedSince;\n\nstate.currentBillingCycleStart = action.input.activatedSince;\nconst BILLING_CYCLE_DAYS = { MONTHLY: 30, QUARTERLY: 91, SEMI_ANNUAL: 182, ANNUAL: 365, ONE_TIME: 0 };\nconst cycleDays = state.selectedBillingCycle ? BILLING_CYCLE_DAYS[state.selectedBillingCycle] || 30 : 30;\nif (cycleDays > 0) {\n  const d = new Date(action.input.activatedSince);\n  d.setDate(d.getDate() + cycleDays);\n  state.nextBillingDate = d.toISOString();\n}\n\nstate.totalDebt = 0;\nstate.totalCredit = 0;\n\nlet initialDebt = 0;\nfor (const group of state.serviceGroups) {\n  if (group.setupCost) initialDebt += group.setupCost.amount;\n  if (group.recurringCost) initialDebt += group.recurringCost.amount;\n  for (const svc of group.services) {\n    if (svc.setupCost) initialDebt += svc.setupCost.amount;\n    if (svc.recurringCost) initialDebt += svc.recurringCost.amount;\n  }\n}\nfor (const svc of state.services) {\n  if (svc.setupCost) initialDebt += svc.setupCost.amount;\n  if (svc.recurringCost) initialDebt += svc.recurringCost.amount;\n}\nstate.totalDebt = initialDebt;',
              examples: [],
              template: "Activate a pending subscription",
              description: "Activate a pending subscription",
            },
            {
              id: "op-pause-subscription",
              name: "PAUSE_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-pause-not-active",
                  code: "PAUSE_NOT_ACTIVE",
                  name: "PauseNotActiveError",
                  template: "",
                  description: "Subscription must be in ACTIVE status to pause",
                },
              ],
              schema:
                "input PauseSubscriptionInput {\n    pausedSince: DateTime!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new PauseNotActiveError(`Cannot pause subscription with status ${state.status}`);\n}\nstate.status = "PAUSED";\nstate.pausedSince = action.input.pausedSince;',
              examples: [],
              template: "Pause an active subscription",
              description: "Pause an active subscription",
            },
            {
              id: "op-set-expiring",
              name: "SET_EXPIRING",
              scope: "global",
              errors: [
                {
                  id: "err-set-expiring-not-active",
                  code: "SET_EXPIRING_NOT_ACTIVE",
                  name: "SetExpiringNotActiveError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input SetExpiringInput {\n    expiringSince: DateTime!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SetExpiringNotActiveError(`Cannot set expiring on subscription with status ${state.status}`);\n}\nstate.status = "EXPIRING";\nstate.expiringSince = action.input.expiringSince;',
              examples: [],
              template: "Mark subscription as expiring",
              description: "Mark subscription as expiring",
            },
            {
              id: "op-cancel-subscription",
              name: "CANCEL_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-cancel-already-cancelled",
                  code: "CANCEL_ALREADY_CANCELLED",
                  name: "CancelAlreadyCancelledError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input CancelSubscriptionInput {\n    cancelledSince: DateTime!\n    cancellationReason: String\n}",
              reducer:
                'if (state.status === "CANCELLED") {\n  throw new CancelAlreadyCancelledError("Subscription is already cancelled");\n}\nstate.status = "CANCELLED";\nstate.cancelledSince = action.input.cancelledSince;\nstate.cancellationReason = action.input.cancellationReason || null;',
              examples: [],
              template: "Cancel a subscription with optional reason",
              description: "Cancel a subscription with optional reason",
            },
            {
              id: "op-resume-subscription",
              name: "RESUME_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-resume-not-paused",
                  code: "RESUME_NOT_PAUSED",
                  name: "ResumeNotPausedError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input ResumeSubscriptionInput {\n    timestamp: DateTime!\n}",
              reducer:
                'if (state.status !== "PAUSED") {\n  throw new ResumeNotPausedError(`Cannot resume subscription with status ${state.status}`);\n}\nstate.status = "ACTIVE";\nstate.pausedSince = null;',
              examples: [],
              template: "Resume a paused subscription",
              description: "Resume a paused subscription",
            },
            {
              id: "op-renew-expiring-subscription",
              name: "RENEW_EXPIRING_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-renew-not-expiring",
                  code: "RENEW_NOT_EXPIRING",
                  name: "RenewNotExpiringError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input RenewExpiringSubscriptionInput {\n    timestamp: DateTime!\n    newRenewalDate: DateTime\n}",
              reducer:
                'if (state.status !== "EXPIRING") {\n  throw new RenewNotExpiringError(`Cannot renew subscription with status ${state.status}`);\n}\nstate.status = "ACTIVE";\nstate.expiringSince = null;\n\nstate.currentBillingCycleStart = state.nextBillingDate;\nconst BILLING_CYCLE_DAYS = { MONTHLY: 30, QUARTERLY: 91, SEMI_ANNUAL: 182, ANNUAL: 365, ONE_TIME: 0 };\nconst cycleDays = state.selectedBillingCycle ? BILLING_CYCLE_DAYS[state.selectedBillingCycle] || 30 : 30;\nif (state.nextBillingDate && cycleDays > 0) {\n  const d = new Date(state.nextBillingDate);\n  d.setDate(d.getDate() + cycleDays);\n  state.nextBillingDate = d.toISOString();\n}\n\nfor (const group of state.serviceGroups) {\n  if (group.recurringCost) {\n    state.totalDebt = (state.totalDebt ?? 0) + group.recurringCost.amount;\n  }\n}\nfor (const svc of state.services) {\n  if (svc.recurringCost) {\n    state.totalDebt = (state.totalDebt ?? 0) + svc.recurringCost.amount;\n  }\n}\n\nstate.renewalDate = action.input.newRenewalDate || null;',
              examples: [],
              template: "Renew an expiring subscription",
              description: "Renew an expiring subscription",
            },
            {
              id: "op-set-budget-category",
              name: "SET_BUDGET_CATEGORY",
              scope: "global",
              errors: [],
              schema:
                "input SetBudgetCategoryInput {\n    budgetId: OID!\n    budgetLabel: String!\n}",
              reducer:
                "state.budget = {\n  id: action.input.budgetId,\n  label: action.input.budgetLabel,\n};",
              examples: [],
              template: "Assign a budget category",
              description: "Assign a budget category",
            },
            {
              id: "op-remove-budget-category",
              name: "REMOVE_BUDGET_CATEGORY",
              scope: "global",
              errors: [
                {
                  id: "err-remove-budget-not-found",
                  code: "REMOVE_BUDGET_NOT_FOUND",
                  name: "RemoveBudgetNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input RemoveBudgetCategoryInput {\n    budgetId: OID!\n}",
              reducer:
                "if (!state.budget || state.budget.id !== action.input.budgetId) {\n  throw new RemoveBudgetNotFoundError(`Budget category with ID ${action.input.budgetId} not found`);\n}\nstate.budget = null;",
              examples: [],
              template: "Remove budget category",
              description: "Remove budget category",
            },
            {
              id: "op-update-customer-info",
              name: "UPDATE_CUSTOMER_INFO",
              scope: "global",
              errors: [],
              schema:
                "input UpdateCustomerInfoInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n}",
              reducer:
                "if (action.input.customerId !== undefined) state.customerId = action.input.customerId || null;\nif (action.input.customerName !== undefined) state.customerName = action.input.customerName || null;\nif (action.input.customerEmail !== undefined) state.customerEmail = action.input.customerEmail || null;",
              examples: [],
              template: "Update customer details",
              description: "Update customer details",
            },
            {
              id: "op-update-tier-info",
              name: "UPDATE_TIER_INFO",
              scope: "global",
              errors: [],
              schema:
                "input UpdateTierInfoInput {\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n}",
              reducer:
                "if (action.input.tierName !== undefined) state.tierName = action.input.tierName || null;\nif (action.input.tierPricingOptionId !== undefined) state.tierPricingOptionId = action.input.tierPricingOptionId || null;\nif (action.input.tierPrice !== undefined) state.tierPrice = action.input.tierPrice || null;\nif (action.input.tierCurrency !== undefined) state.tierCurrency = action.input.tierCurrency || null;\nif (action.input.tierPricingMode !== undefined) state.tierPricingMode = action.input.tierPricingMode || null;",
              examples: [],
              template: "Update tier selection and pricing",
              description: "Update tier selection and pricing",
            },
            {
              id: "op-set-operator-notes",
              name: "SET_OPERATOR_NOTES",
              scope: "global",
              errors: [],
              schema:
                "input SetOperatorNotesInput {\n    operatorNotes: String\n}",
              reducer:
                "state.operatorNotes = action.input.operatorNotes || null;",
              examples: [],
              template: "Set operator notes",
              description: "Set operator notes",
            },
            {
              id: "op-set-auto-renew",
              name: "SET_AUTO_RENEW",
              scope: "global",
              errors: [],
              schema: "input SetAutoRenewInput {\n    autoRenew: Boolean!\n}",
              reducer: "state.autoRenew = action.input.autoRenew;",
              examples: [],
              template: "Toggle auto-renewal",
              description: "Toggle auto-renewal",
            },
            {
              id: "op-set-renewal-date",
              name: "SET_RENEWAL_DATE",
              scope: "global",
              errors: [],
              schema:
                "input SetRenewalDateInput {\n    renewalDate: DateTime!\n}",
              reducer: "state.renewalDate = action.input.renewalDate;",
              examples: [],
              template: "Set renewal date",
              description: "Set renewal date",
            },
            {
              id: "op-settle-billing-cycle",
              name: "SETTLE_BILLING_CYCLE",
              description:
                "Settle the current billing cycle \u2014 calculate overage, reset metrics, advance or expire",
              schema:
                "input SettleBillingCycleInput {\n    settlementDate: DateTime!\n}",
              template: "Settle the current billing cycle",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new NoBillingCycleActiveError(`Cannot settle billing cycle when status is ${state.status}`);\n}\nif (state.currentBillingCycleStart && action.input.settlementDate < state.currentBillingCycleStart) {\n  throw new SettlementDateBeforeCycleStartError("Settlement date is before the current billing cycle start");\n}\n\nconst endDate = state.nextBillingDate && action.input.settlementDate > state.nextBillingDate\n  ? state.nextBillingDate\n  : action.input.settlementDate;\n\nconst RESET_HIERARCHY = ["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"];\nconst cycleIndex = state.selectedBillingCycle ? RESET_HIERARCHY.indexOf(state.selectedBillingCycle) : -1;\n\nfunction processMetrics(metrics) {\n  for (const metric of metrics) {\n    if (metric.unitCost) {\n      const freeLimit = metric.freeLimit ?? 0;\n      let overage = Math.max(0, metric.currentUsage - freeLimit);\n      if (metric.paidLimit) {\n        overage = Math.min(overage, metric.paidLimit - freeLimit);\n      }\n      const cost = overage * metric.unitCost.amount;\n      if (cost > 0) {\n        state.totalDebt = (state.totalDebt ?? 0) + cost;\n      }\n    }\n    if (metric.usageResetPeriod) {\n      const metricIndex = RESET_HIERARCHY.indexOf(metric.usageResetPeriod);\n      if (metricIndex !== -1 && cycleIndex !== -1 && metricIndex <= cycleIndex) {\n        metric.currentUsage = 0;\n      }\n    }\n  }\n}\n\nfor (const svc of state.services) {\n  processMetrics(svc.metrics);\n}\nfor (const group of state.serviceGroups) {\n  for (const svc of group.services) {\n    processMetrics(svc.metrics);\n  }\n}\n\nif (state.autoRenew) {\n  for (const group of state.serviceGroups) {\n    if (group.recurringCost) {\n      state.totalDebt = (state.totalDebt ?? 0) + group.recurringCost.amount;\n    }\n  }\n  for (const svc of state.services) {\n    if (svc.recurringCost) {\n      state.totalDebt = (state.totalDebt ?? 0) + svc.recurringCost.amount;\n    }\n  }\n  state.currentBillingCycleStart = state.nextBillingDate;\n  const BILLING_CYCLE_DAYS = { MONTHLY: 30, QUARTERLY: 91, SEMI_ANNUAL: 182, ANNUAL: 365, ONE_TIME: 0 };\n  const days = BILLING_CYCLE_DAYS[state.selectedBillingCycle] || 30;\n  if (state.nextBillingDate && days > 0) {\n    const d = new Date(state.nextBillingDate);\n    d.setDate(d.getDate() + days);\n    state.nextBillingDate = d.toISOString();\n  }\n} else {\n  state.status = "EXPIRING";\n  state.expiringSince = action.input.settlementDate;\n}',
              errors: [
                {
                  id: "err-no-billing-cycle-active",
                  name: "NoBillingCycleActiveError",
                  code: "NO_BILLING_CYCLE_ACTIVE",
                  description: "Subscription status is not ACTIVE",
                  template: "",
                },
                {
                  id: "err-settlement-date-before-cycle-start",
                  name: "SettlementDateBeforeCycleStartError",
                  code: "SETTLEMENT_DATE_BEFORE_CYCLE_START",
                  description:
                    "Settlement date is before the current billing cycle start date",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
          description:
            "Subscription lifecycle, customer info, tier, billing, and general management operations",
        },
        {
          id: "mod-service",
          name: "service",
          operations: [
            {
              id: "op-add-service",
              name: "ADD_SERVICE",
              scope: "global",
              errors: [
                {
                  id: "err-not-active-add-service",
                  name: "SubscriptionNotActiveAddServiceError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_ADD_SERVICE",
                  description:
                    "Status must be PENDING or ACTIVE to add a service",
                  template: "",
                },
              ],
              schema:
                "input DiscountServiceInfoInput {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ninput AddServiceInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    setupPaymentDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringNextBillingDate: DateTime\n    recurringLastPaymentDate: DateTime\n    recurringDiscount: DiscountServiceInfoInput\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveAddServiceError(`Cannot add service when status is ${state.status}`);\n}\nconst service = {\n  id: action.input.serviceId,\n  name: action.input.name || null,\n  description: action.input.description || null,\n  customValue: action.input.customValue || null,\n  facetSelections: [],\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: action.input.setupPaymentDate || null,\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: action.input.recurringNextBillingDate || null,\n    lastPaymentDate: action.input.recurringLastPaymentDate || null,\n    discount: action.input.recurringDiscount ? {\n      originalAmount: action.input.recurringDiscount.originalAmount,\n      discountType: action.input.recurringDiscount.discountType,\n      discountValue: action.input.recurringDiscount.discountValue,\n      source: action.input.recurringDiscount.source,\n    } : null,\n  } : null,\n  metrics: [],\n};\nstate.services.push(service);',
              examples: [],
              template: "Add a standalone service",
              description: "Add a standalone service",
            },
            {
              id: "op-remove-service",
              name: "REMOVE_SERVICE",
              scope: "global",
              errors: [
                {
                  id: "err-remove-service-not-found",
                  code: "REMOVE_SERVICE_NOT_FOUND",
                  name: "RemoveServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-remove-service",
                  name: "SubscriptionNotActiveRemoveServiceError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_REMOVE_SERVICE",
                  description:
                    "Status must be PENDING or ACTIVE to remove a service",
                  template: "",
                },
              ],
              schema: "input RemoveServiceInput {\n    serviceId: OID!\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveRemoveServiceError(`Cannot remove service when status is ${state.status}`);\n}\nconst index = state.services.findIndex((s) => s.id === action.input.serviceId);\nif (index === -1) {\n  throw new RemoveServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nstate.services.splice(index, 1);',
              examples: [],
              template: "Remove a standalone service",
              description: "Remove a standalone service",
            },
            {
              id: "op-update-service-setup-cost",
              name: "UPDATE_SERVICE_SETUP_COST",
              scope: "global",
              errors: [
                {
                  id: "err-update-service-setup-cost-not-found",
                  code: "UPDATE_SERVICE_SETUP_COST_NOT_FOUND",
                  name: "UpdateServiceSetupCostNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceSetupCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n    billingDate: DateTime\n    paymentDate: DateTime\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceSetupCostNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.amount && action.input.currency) {\n  svc.setupCost = {\n    amount: action.input.amount,\n    currency: action.input.currency,\n    billingDate: action.input.billingDate || null,\n    paymentDate: action.input.paymentDate || null,\n  };\n} else if (svc.setupCost) {\n  if (action.input.amount) svc.setupCost.amount = action.input.amount;\n  if (action.input.currency) svc.setupCost.currency = action.input.currency;\n  if (action.input.billingDate !== undefined) svc.setupCost.billingDate = action.input.billingDate || null;\n  if (action.input.paymentDate !== undefined) svc.setupCost.paymentDate = action.input.paymentDate || null;\n}",
              examples: [],
              template: "Update setup cost for a service",
              description: "Update setup cost for a service",
            },
            {
              id: "op-update-service-recurring-cost",
              name: "UPDATE_SERVICE_RECURRING_COST",
              scope: "global",
              errors: [
                {
                  id: "err-update-service-recurring-cost-not-found",
                  code: "UPDATE_SERVICE_RECURRING_COST_NOT_FOUND",
                  name: "UpdateServiceRecurringCostNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceRecurringCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n    billingCycle: BillingCycle\n    nextBillingDate: DateTime\n    lastPaymentDate: DateTime\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceRecurringCostNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.amount && action.input.currency && action.input.billingCycle) {\n  svc.recurringCost = {\n    amount: action.input.amount,\n    currency: action.input.currency,\n    billingCycle: action.input.billingCycle,\n    nextBillingDate: action.input.nextBillingDate || null,\n    lastPaymentDate: action.input.lastPaymentDate || null,\n    discount: svc.recurringCost?.discount || null,\n  };\n} else if (svc.recurringCost) {\n  if (action.input.amount) svc.recurringCost.amount = action.input.amount;\n  if (action.input.currency) svc.recurringCost.currency = action.input.currency;\n  if (action.input.billingCycle) svc.recurringCost.billingCycle = action.input.billingCycle;\n  if (action.input.nextBillingDate !== undefined) svc.recurringCost.nextBillingDate = action.input.nextBillingDate || null;\n  if (action.input.lastPaymentDate !== undefined) svc.recurringCost.lastPaymentDate = action.input.lastPaymentDate || null;\n}",
              examples: [],
              template: "Update recurring cost for a service",
              description: "Update recurring cost for a service",
            },
            {
              id: "op-report-setup-payment",
              name: "REPORT_SETUP_PAYMENT",
              scope: "global",
              errors: [
                {
                  id: "err-report-setup-payment-not-found",
                  code: "REPORT_SETUP_PAYMENT_NOT_FOUND",
                  name: "ReportSetupPaymentServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-report-setup-already-paid",
                  name: "ReportSetupPaymentAlreadyPaidError",
                  code: "REPORT_SETUP_PAYMENT_ALREADY_PAID",
                  description: "Setup cost has already been paid",
                  template: "",
                },
                {
                  id: "err-report-setup-no-cost",
                  name: "ReportSetupPaymentNoCostError",
                  code: "REPORT_SETUP_PAYMENT_NO_COST",
                  description: "No setup cost found for the given entity",
                  template: "",
                },
              ],
              schema:
                "input ReportSetupPaymentInput {\n    serviceId: OID!\n    paymentDate: DateTime!\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nconst directGroup = state.serviceGroups.find((g) => g.id === action.input.serviceId);\nif (!svc && !directGroup) {\n  throw new ReportSetupPaymentServiceNotFoundError(`Service or group with ID ${action.input.serviceId} not found`);\n}\nfunction findGroup(serviceId) {\n  for (const group of state.serviceGroups) {\n    if (group.services.some((s) => s.id === serviceId)) return group;\n  }\n  return undefined;\n}\nconst targetGroup = directGroup ?? findGroup(action.input.serviceId);\nconst setupEntity = (svc?.setupCost ? svc : null) || (targetGroup?.setupCost ? targetGroup : null);\nif (!setupEntity || !setupEntity.setupCost) {\n  throw new ReportSetupPaymentNoCostError(`No setup cost found for ID ${action.input.serviceId}`);\n}\nif (setupEntity.setupCost.paymentDate) {\n  throw new ReportSetupPaymentAlreadyPaidError(`Setup cost for ID ${action.input.serviceId} is already paid`);\n}\nsetupEntity.setupCost.paymentDate = action.input.paymentDate;\nstate.totalCredit = (state.totalCredit ?? 0) + setupEntity.setupCost.amount;",
              examples: [],
              template: "Record a setup payment",
              description: "Record a setup payment",
            },
            {
              id: "op-report-recurring-payment",
              name: "REPORT_RECURRING_PAYMENT",
              scope: "global",
              errors: [
                {
                  id: "err-report-recurring-payment-not-found",
                  code: "REPORT_RECURRING_PAYMENT_NOT_FOUND",
                  name: "ReportRecurringPaymentServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-report-recurring-already-paid-cycle",
                  name: "ReportRecurringPaymentAlreadyPaidThisCycleError",
                  code: "REPORT_RECURRING_PAYMENT_ALREADY_PAID_THIS_CYCLE",
                  description:
                    "Recurring cost has already been paid this billing cycle",
                  template: "",
                },
                {
                  id: "err-report-recurring-no-cost",
                  name: "ReportRecurringPaymentNoCostError",
                  code: "REPORT_RECURRING_PAYMENT_NO_COST",
                  description: "No recurring cost found for the given entity",
                  template: "",
                },
              ],
              schema:
                "input ReportRecurringPaymentInput {\n    serviceId: OID!\n    paymentDate: DateTime!\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nconst directGroup = state.serviceGroups.find((g) => g.id === action.input.serviceId);\nif (!svc && !directGroup) {\n  throw new ReportRecurringPaymentServiceNotFoundError(`Service or group with ID ${action.input.serviceId} not found`);\n}\nfunction findGroup(serviceId) {\n  for (const group of state.serviceGroups) {\n    if (group.services.some((s) => s.id === serviceId)) return group;\n  }\n  return undefined;\n}\nconst targetGroup = directGroup ?? findGroup(action.input.serviceId);\nconst recurringEntity = (svc?.recurringCost ? svc : null) || (targetGroup?.recurringCost ? targetGroup : null);\nif (!recurringEntity || !recurringEntity.recurringCost) {\n  throw new ReportRecurringPaymentNoCostError(`No recurring cost found for ID ${action.input.serviceId}`);\n}\nif (recurringEntity.recurringCost.lastPaymentDate && state.currentBillingCycleStart && recurringEntity.recurringCost.lastPaymentDate >= state.currentBillingCycleStart) {\n  throw new ReportRecurringPaymentAlreadyPaidThisCycleError(`Recurring cost for ID ${action.input.serviceId} already paid this cycle`);\n}\nrecurringEntity.recurringCost.lastPaymentDate = action.input.paymentDate;\nstate.totalCredit = (state.totalCredit ?? 0) + recurringEntity.recurringCost.amount;",
              examples: [],
              template: "Record a recurring payment",
              description: "Record a recurring payment",
            },
            {
              id: "op-update-service-info",
              name: "UPDATE_SERVICE_INFO",
              scope: "global",
              errors: [
                {
                  id: "err-update-service-info-not-found",
                  code: "UPDATE_SERVICE_INFO_NOT_FOUND",
                  name: "UpdateServiceInfoNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceInfoInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceInfoNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.name !== undefined) svc.name = action.input.name || null;\nif (action.input.description !== undefined) svc.description = action.input.description || null;\nif (action.input.customValue !== undefined) svc.customValue = action.input.customValue || null;",
              examples: [],
              template: "Update service name, description, custom value",
              description: "Update service name, description, custom value",
            },
            {
              id: "op-add-service-facet-selection",
              name: "ADD_SERVICE_FACET_SELECTION",
              scope: "global",
              errors: [
                {
                  id: "err-add-facet-service-not-found",
                  code: "ADD_FACET_SERVICE_NOT_FOUND",
                  name: "AddServiceFacetSelectionServiceNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input AddServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n    facetName: String!\n    selectedOption: String!\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new AddServiceFacetSelectionServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nsvc.facetSelections.push({\n  id: action.input.facetSelectionId,\n  facetName: action.input.facetName,\n  selectedOption: action.input.selectedOption,\n});",
              examples: [],
              template: "Add facet selection to a service",
              description: "Add facet selection to a service",
            },
            {
              id: "op-remove-service-facet-selection",
              name: "REMOVE_SERVICE_FACET_SELECTION",
              scope: "global",
              errors: [
                {
                  id: "err-remove-facet-service-not-found",
                  code: "REMOVE_FACET_SERVICE_NOT_FOUND",
                  name: "RemoveServiceFacetSelectionServiceNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input RemoveServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new RemoveServiceFacetSelectionServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst index = svc.facetSelections.findIndex((fs) => fs.id === action.input.facetSelectionId);\nif (index !== -1) {\n  svc.facetSelections.splice(index, 1);\n}",
              examples: [],
              template: "Remove facet selection from a service",
              description: "Remove facet selection from a service",
            },
            {
              id: "op-report-overage-payment",
              name: "REPORT_OVERAGE_PAYMENT",
              description:
                "Report a payment against outstanding overage or remaining balance. Amount constrained to not exceed amount owed.",
              schema:
                "input ReportOveragePaymentInput {\n    paymentDate: DateTime!\n    amount: Amount_Money!\n}",
              template: "Report an overage or balance payment",
              reducer:
                'if (action.input.amount <= 0) {\n  throw new ReportOveragePaymentInvalidAmountError("Payment amount must be greater than zero");\n}\nconst currentOwed = (state.totalDebt ?? 0) - (state.totalCredit ?? 0);\nif (action.input.amount > currentOwed) {\n  throw new ReportOveragePaymentExceedsDebtError(`Payment amount ${action.input.amount} exceeds outstanding balance ${currentOwed}`);\n}\nstate.totalCredit = (state.totalCredit ?? 0) + action.input.amount;',
              errors: [
                {
                  id: "err-overage-exceeds-debt",
                  name: "ReportOveragePaymentExceedsDebtError",
                  code: "REPORT_OVERAGE_PAYMENT_EXCEEDS_DEBT",
                  description: "Payment amount exceeds the outstanding balance",
                  template: "",
                },
                {
                  id: "err-overage-invalid-amount",
                  name: "ReportOveragePaymentInvalidAmountError",
                  code: "REPORT_OVERAGE_PAYMENT_INVALID_AMOUNT",
                  description: "Payment amount must be greater than zero",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
          description:
            "Standalone service CRUD, cost management, facet selections, and payment tracking",
        },
        {
          id: "mod-service-group",
          name: "service-group",
          operations: [
            {
              id: "op-add-service-group",
              name: "ADD_SERVICE_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-structural-add-group",
                  name: "StructuralChangeNotAllowedAddGroupError",
                  code: "STRUCTURAL_CHANGE_NOT_ALLOWED_ADD_GROUP",
                  description:
                    "Status must be PENDING for structural changes \u2014 cannot add service groups to an active subscription",
                  template: "",
                },
              ],
              schema:
                "input AddServiceGroupInput {\n    groupId: OID!\n    name: String!\n    optional: Boolean!\n    costType: GroupCostType\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountServiceInfoInput\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new StructuralChangeNotAllowedAddGroupError(`Cannot add service group when status is ${state.status}`);\n}\nstate.serviceGroups.push({\n  id: action.input.groupId,\n  name: action.input.name,\n  optional: action.input.optional,\n  costType: action.input.costType || null,\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: null,\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: null,\n    lastPaymentDate: null,\n    discount: action.input.recurringDiscount ? {\n      originalAmount: action.input.recurringDiscount.originalAmount,\n      discountType: action.input.recurringDiscount.discountType,\n      discountValue: action.input.recurringDiscount.discountValue,\n      source: action.input.recurringDiscount.source,\n    } : null,\n  } : null,\n  services: [],\n});\nif (state.status === "ACTIVE" && action.input.recurringAmount && state.currentBillingCycleStart && state.nextBillingDate) {\n  const cycleStart = new Date(state.currentBillingCycleStart).getTime();\n  const cycleEnd = new Date(state.nextBillingDate).getTime();\n  const now = Date.now();\n  const totalDays = (cycleEnd - cycleStart) / (1000 * 60 * 60 * 24);\n  const remainingDays = (cycleEnd - now) / (1000 * 60 * 60 * 24);\n  if (totalDays > 0 && remainingDays > 0) {\n    const proratedCost = (remainingDays / totalDays) * action.input.recurringAmount;\n    state.totalDebt = (state.totalDebt ?? 0) + proratedCost;\n  }\n}\nif (state.status === "ACTIVE" && action.input.setupAmount) {\n  state.totalDebt = (state.totalDebt ?? 0) + action.input.setupAmount;\n}',
              examples: [],
              template: "Add a service group",
              description: "Add a service group",
            },
            {
              id: "op-remove-service-group",
              name: "REMOVE_SERVICE_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-remove-group-not-found",
                  code: "REMOVE_GROUP_NOT_FOUND",
                  name: "RemoveServiceGroupNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-structural-remove-group",
                  name: "StructuralChangeNotAllowedRemoveGroupError",
                  code: "STRUCTURAL_CHANGE_NOT_ALLOWED_REMOVE_GROUP",
                  description:
                    "Status must be PENDING for structural changes \u2014 cannot remove service groups from an active subscription",
                  template: "",
                },
              ],
              schema: "input RemoveServiceGroupInput {\n    groupId: OID!\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new StructuralChangeNotAllowedRemoveGroupError(`Cannot remove service group when status is ${state.status}`);\n}\nconst index = state.serviceGroups.findIndex((g) => g.id === action.input.groupId);\nif (index === -1) {\n  throw new RemoveServiceGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nconst group = state.serviceGroups[index];\nif (state.status === "ACTIVE" && group.recurringCost && state.currentBillingCycleStart && state.nextBillingDate) {\n  const cycleStart = new Date(state.currentBillingCycleStart).getTime();\n  const cycleEnd = new Date(state.nextBillingDate).getTime();\n  const now = Date.now();\n  const totalDays = (cycleEnd - cycleStart) / (1000 * 60 * 60 * 24);\n  const remainingDays = (cycleEnd - now) / (1000 * 60 * 60 * 24);\n  if (totalDays > 0 && remainingDays > 0) {\n    const proratedCredit = (remainingDays / totalDays) * group.recurringCost.amount;\n    state.totalCredit = (state.totalCredit ?? 0) + proratedCredit;\n  }\n}\nstate.serviceGroups.splice(index, 1);',
              examples: [],
              template: "Remove a service group",
              description: "Remove a service group",
            },
            {
              id: "op-add-service-to-group",
              name: "ADD_SERVICE_TO_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-add-to-group-not-found",
                  code: "ADD_TO_GROUP_NOT_FOUND",
                  name: "AddServiceToGroupGroupNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-add-to-group",
                  name: "SubscriptionNotActiveAddToGroupError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_ADD_TO_GROUP",
                  description:
                    "Status must be PENDING or ACTIVE to add a service to a group",
                  template: "",
                },
              ],
              schema:
                "input AddServiceToGroupInput {\n    groupId: OID!\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    setupPaymentDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringNextBillingDate: DateTime\n    recurringLastPaymentDate: DateTime\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveAddToGroupError(`Cannot add service to group when status is ${state.status}`);\n}\nconst group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new AddServiceToGroupGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\ngroup.services.push({\n  id: action.input.serviceId,\n  name: action.input.name || null,\n  description: action.input.description || null,\n  customValue: action.input.customValue || null,\n  facetSelections: [],\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: action.input.setupPaymentDate || null,\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: action.input.recurringNextBillingDate || null,\n    lastPaymentDate: action.input.recurringLastPaymentDate || null,\n    discount: null,\n  } : null,\n  metrics: [],\n});',
              examples: [],
              template: "Add a service to a group",
              description: "Add a service to a group",
            },
            {
              id: "op-remove-service-from-group",
              name: "REMOVE_SERVICE_FROM_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-remove-from-group-not-found",
                  code: "REMOVE_FROM_GROUP_NOT_FOUND",
                  name: "RemoveServiceFromGroupGroupNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-remove-from-group-service-not-found",
                  code: "REMOVE_FROM_GROUP_SERVICE_NOT_FOUND",
                  name: "RemoveServiceFromGroupServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-remove-from-group",
                  name: "SubscriptionNotActiveRemoveFromGroupError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_REMOVE_FROM_GROUP",
                  description:
                    "Status must be PENDING or ACTIVE to remove a service from a group",
                  template: "",
                },
              ],
              schema:
                "input RemoveServiceFromGroupInput {\n    groupId: OID!\n    serviceId: OID!\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveRemoveFromGroupError(`Cannot remove service from group when status is ${state.status}`);\n}\nconst group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new RemoveServiceFromGroupGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nconst index = group.services.findIndex((s) => s.id === action.input.serviceId);\nif (index === -1) {\n  throw new RemoveServiceFromGroupServiceNotFoundError(`Service with ID ${action.input.serviceId} not found in group ${action.input.groupId}`);\n}\ngroup.services.splice(index, 1);',
              examples: [],
              template: "Remove a service from a group",
              description: "Remove a service from a group",
            },
            {
              id: "op-update-service-group-cost",
              name: "UPDATE_SERVICE_GROUP_COST",
              scope: "global",
              errors: [
                {
                  id: "err-update-group-cost-not-found",
                  code: "UPDATE_GROUP_COST_NOT_FOUND",
                  name: "UpdateServiceGroupCostNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceGroupCostInput {\n    groupId: OID!\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n}",
              reducer:
                "const group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new UpdateServiceGroupCostNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nif (action.input.setupAmount && action.input.setupCurrency) {\n  group.setupCost = {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null,\n    paymentDate: group.setupCost?.paymentDate || null,\n  };\n} else if (group.setupCost) {\n  if (action.input.setupAmount) group.setupCost.amount = action.input.setupAmount;\n  if (action.input.setupCurrency) group.setupCost.currency = action.input.setupCurrency;\n  if (action.input.setupBillingDate !== undefined) group.setupCost.billingDate = action.input.setupBillingDate || null;\n}\nif (action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle) {\n  group.recurringCost = {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: group.recurringCost?.nextBillingDate || null,\n    lastPaymentDate: group.recurringCost?.lastPaymentDate || null,\n    discount: group.recurringCost?.discount || null,\n  };\n} else if (group.recurringCost) {\n  if (action.input.recurringAmount) group.recurringCost.amount = action.input.recurringAmount;\n  if (action.input.recurringCurrency) group.recurringCost.currency = action.input.recurringCurrency;\n  if (action.input.recurringBillingCycle) group.recurringCost.billingCycle = action.input.recurringBillingCycle;\n}",
              examples: [],
              template: "Update group setup and recurring costs",
              description: "Update group setup and recurring costs",
            },
          ],
          description:
            "Service group management and grouped service operations",
        },
        {
          id: "mod-metrics",
          name: "metrics",
          operations: [
            {
              id: "op-add-service-metric",
              name: "ADD_SERVICE_METRIC",
              scope: "global",
              errors: [
                {
                  id: "err-add-metric-service-not-found",
                  code: "ADD_METRIC_SERVICE_NOT_FOUND",
                  name: "AddServiceMetricServiceNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input AddServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n    unitCostNextBillingDate: DateTime\n    unitCostLastPaymentDate: DateTime\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new AddServiceMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nsvc.metrics.push({\n  id: action.input.metricId,\n  name: action.input.name,\n  unitName: action.input.unitName,\n  limit: action.input.limit || null,\n  freeLimit: action.input.freeLimit || null,\n  paidLimit: action.input.paidLimit || null,\n  unitCost: action.input.unitCostAmount && action.input.unitCostCurrency && action.input.unitCostBillingCycle ? {\n    amount: action.input.unitCostAmount,\n    currency: action.input.unitCostCurrency,\n    billingCycle: action.input.unitCostBillingCycle,\n    nextBillingDate: action.input.unitCostNextBillingDate || null,\n    lastPaymentDate: action.input.unitCostLastPaymentDate || null,\n    discount: null,\n  } : null,\n  currentUsage: action.input.currentUsage,\n  usageResetPeriod: action.input.usageResetPeriod || null,\n  nextUsageReset: action.input.nextUsageReset || null,\n});",
              examples: [],
              template: "Add a metric to a service",
              description: "Add a metric to a service",
            },
            {
              id: "op-update-metric",
              name: "UPDATE_METRIC",
              scope: "global",
              errors: [
                {
                  id: "err-update-metric-service-not-found",
                  code: "UPDATE_METRIC_SERVICE_NOT_FOUND",
                  name: "UpdateMetricServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-update-metric-not-found",
                  code: "UPDATE_METRIC_NOT_FOUND",
                  name: "UpdateMetricNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String\n    unitName: String\n    limit: Int\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new UpdateMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new UpdateMetricNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nif (action.input.name) metric.name = action.input.name;\nif (action.input.unitName) metric.unitName = action.input.unitName;\nif (action.input.limit !== undefined) metric.limit = action.input.limit || null;\nif (action.input.usageResetPeriod !== undefined) metric.usageResetPeriod = action.input.usageResetPeriod || null;\nif (action.input.nextUsageReset !== undefined) metric.nextUsageReset = action.input.nextUsageReset || null;",
              examples: [],
              template: "Update metric configuration",
              description: "Update metric configuration",
            },
            {
              id: "op-update-metric-usage",
              name: "UPDATE_METRIC_USAGE",
              scope: "global",
              errors: [
                {
                  id: "err-update-usage-service-not-found",
                  code: "UPDATE_USAGE_SERVICE_NOT_FOUND",
                  name: "UpdateMetricUsageServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-update-usage-metric-not-found",
                  code: "UPDATE_USAGE_METRIC_NOT_FOUND",
                  name: "UpdateMetricUsageNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-update-usage",
                  name: "SubscriptionNotActiveUpdateUsageError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_UPDATE_USAGE",
                  description: "Status must be ACTIVE to update metric usage",
                  template: "",
                },
              ],
              schema:
                "input UpdateMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    currentUsage: Int!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveUpdateUsageError(`Cannot update metric usage when status is ${state.status}`);\n}\nfunction findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new UpdateMetricUsageServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new UpdateMetricUsageNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nmetric.currentUsage = metric.paidLimit != null ? Math.min(action.input.currentUsage, metric.paidLimit) : action.input.currentUsage;',
              examples: [],
              template: "Set metric usage directly",
              description: "Set metric usage directly",
            },
            {
              id: "op-remove-service-metric",
              name: "REMOVE_SERVICE_METRIC",
              scope: "global",
              errors: [
                {
                  id: "err-remove-metric-service-not-found",
                  code: "REMOVE_METRIC_SERVICE_NOT_FOUND",
                  name: "RemoveServiceMetricServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-remove-metric-not-found",
                  code: "REMOVE_METRIC_NOT_FOUND",
                  name: "RemoveServiceMetricNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input RemoveServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new RemoveServiceMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst index = svc.metrics.findIndex((m) => m.id === action.input.metricId);\nif (index === -1) {\n  throw new RemoveServiceMetricNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nsvc.metrics.splice(index, 1);",
              examples: [],
              template: "Remove a metric from a service",
              description: "Remove a metric from a service",
            },
            {
              id: "op-increment-metric-usage",
              name: "INCREMENT_METRIC_USAGE",
              scope: "global",
              errors: [
                {
                  id: "err-increment-service-not-found",
                  code: "INCREMENT_SERVICE_NOT_FOUND",
                  name: "IncrementMetricUsageServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-increment-metric-not-found",
                  code: "INCREMENT_METRIC_NOT_FOUND",
                  name: "IncrementMetricUsageNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-increment-usage",
                  name: "SubscriptionNotActiveIncrementUsageError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_INCREMENT_USAGE",
                  description:
                    "Status must be ACTIVE to increment metric usage",
                  template: "",
                },
              ],
              schema:
                "input IncrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    incrementBy: Int!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveIncrementUsageError(`Cannot increment metric usage when status is ${state.status}`);\n}\nfunction findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new IncrementMetricUsageServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new IncrementMetricUsageNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nconst newUsage = metric.currentUsage + action.input.incrementBy;\nmetric.currentUsage = metric.paidLimit != null ? Math.min(newUsage, metric.paidLimit) : newUsage;',
              examples: [],
              template: "Increment usage counter",
              description: "Increment usage counter",
            },
            {
              id: "op-decrement-metric-usage",
              name: "DECREMENT_METRIC_USAGE",
              scope: "global",
              errors: [
                {
                  id: "err-decrement-service-not-found",
                  code: "DECREMENT_SERVICE_NOT_FOUND",
                  name: "DecrementMetricUsageServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-decrement-metric-not-found",
                  code: "DECREMENT_METRIC_NOT_FOUND",
                  name: "DecrementMetricUsageNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-decrement-usage",
                  name: "SubscriptionNotActiveDecrementUsageError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_DECREMENT_USAGE",
                  description:
                    "Status must be ACTIVE to decrement metric usage",
                  template: "",
                },
              ],
              schema:
                "input DecrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    decrementBy: Int!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveDecrementUsageError(`Cannot decrement metric usage when status is ${state.status}`);\n}\nfunction findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new DecrementMetricUsageServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new DecrementMetricUsageNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nmetric.currentUsage -= action.input.decrementBy;',
              examples: [],
              template: "Decrement usage counter",
              description: "Decrement usage counter",
            },
            {
              id: "op-reset-metric-cycle",
              name: "RESET_METRIC_CYCLE",
              description:
                "Reset a metric's usage and charge overage when its independent reset cycle elapses. Triggered by processor/cron or operator, independent of billing cycle settlement.",
              schema:
                "input ResetMetricCycleInput {\n    serviceId: OID!\n    metricId: OID!\n    resetDate: DateTime!\n}",
              template: "Reset metric usage cycle and charge overage",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveResetMetricCycleError(`Cannot reset metric cycle when status is ${state.status}`);\n}\nfunction findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new ResetMetricCycleServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new ResetMetricCycleMetricNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nif (metric.unitCost) {\n  const freeLimit = metric.freeLimit ?? 0;\n  let overage = Math.max(0, metric.currentUsage - freeLimit);\n  if (metric.paidLimit) {\n    overage = Math.min(overage, metric.paidLimit - freeLimit);\n  }\n  const cost = overage * metric.unitCost.amount;\n  if (cost > 0) {\n    state.totalDebt = (state.totalDebt ?? 0) + cost;\n  }\n}\nmetric.currentUsage = 0;',
              errors: [
                {
                  id: "err-not-active-reset-metric-cycle",
                  name: "SubscriptionNotActiveResetMetricCycleError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_RESET_METRIC_CYCLE",
                  description: "Status must be ACTIVE to reset metric cycle",
                  template: "",
                },
                {
                  id: "err-reset-metric-service-not-found",
                  name: "ResetMetricCycleServiceNotFoundError",
                  code: "RESET_METRIC_CYCLE_SERVICE_NOT_FOUND",
                  description: "Service not found",
                  template: "",
                },
                {
                  id: "err-reset-metric-not-found",
                  name: "ResetMetricCycleMetricNotFoundError",
                  code: "RESET_METRIC_CYCLE_METRIC_NOT_FOUND",
                  description: "Metric not found",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
          description: "Service metric tracking and usage management",
        },
        {
          id: "mod-customer",
          name: "customer",
          operations: [
            {
              id: "op-set-customer-type",
              name: "SET_CUSTOMER_TYPE",
              scope: "global",
              errors: [],
              schema:
                "input SetCustomerTypeInput {\n    customerType: CustomerType!\n    teamMemberCount: Int\n}",
              reducer:
                "state.customerType = action.input.customerType;\nstate.teamMemberCount = action.input.teamMemberCount || null;",
              examples: [],
              template: "Set customer type (individual/team)",
              description: "Set customer type (individual/team)",
            },
            {
              id: "op-update-team-member-count",
              name: "UPDATE_TEAM_MEMBER_COUNT",
              scope: "global",
              errors: [],
              schema:
                "input UpdateTeamMemberCountInput {\n    teamMemberCount: Int!\n}",
              reducer: "state.teamMemberCount = action.input.teamMemberCount;",
              examples: [],
              template: "Update team member count",
              description: "Update team member count",
            },
          ],
          description: "Customer type and team member management",
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
