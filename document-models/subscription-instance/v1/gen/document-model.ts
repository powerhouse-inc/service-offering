import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/subscription-instance",
  name: "SubscriptionInstance",
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  extension: "phsi",
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
            "type SubscriptionInstanceState {\n    customerId: PHID\n    customerName: String\n    customerEmail: String\n    customerType: CustomerType\n    teamMemberCount: Int\n    operatorId: PHID\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    resource: ResourceDocument\n    status: SubscriptionStatus!\n    createdAt: DateTime\n    activatedSince: DateTime\n    pausedSince: DateTime\n    expiringSince: DateTime\n    renewalDate: DateTime\n    cancelledSince: DateTime\n    cancellationReason: String\n    autoRenew: Boolean!\n    operatorNotes: String\n    budget: BudgetCategory\n    nextBillingDate: DateTime\n    projectedBillAmount: Amount_Money\n    projectedBillCurrency: Currency\n    services: [SubscriptionService!]!\n    serviceGroups: [ServiceGroup!]!\n}\n\ntype ResourceDocument {\n    documentId: PHID!\n    documentType: String!\n}\n\ntype BudgetCategory {\n    id: OID!\n    name: String!\n    description: String\n}\n\nenum CustomerType {\n    INDIVIDUAL\n    TEAM\n    ENTERPRISE\n}\n\nenum TierPricingMode {\n    FIXED\n    PER_SEAT\n    CUSTOM\n}\n\nenum BillingCycle {\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n}\n\nenum SubscriptionStatus {\n    DRAFT\n    ACTIVE\n    PAUSED\n    EXPIRING\n    CANCELLED\n}\n\nenum DiscountType {\n    PERCENTAGE\n    FIXED_AMOUNT\n}\n\nenum DiscountSource {\n    TIER\n    CUSTOM\n}\n\nenum GroupCostType {\n    SETUP\n    RECURRING\n}\n\nenum ResetPeriod {\n    DAILY\n    WEEKLY\n    MONTHLY\n    QUARTERLY\n    ANNUAL\n}\n\ntype SubscriptionService {\n    id: OID!\n    name: String!\n    description: String\n    customValue: String\n    facetSelections: [FacetSelection!]!\n    setupCost: ServiceCost\n    recurringCost: ServiceCost\n    metrics: [ServiceMetric!]!\n}\n\ntype FacetSelection {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ntype ServiceCost {\n    amount: Amount_Money!\n    currency: Currency!\n    paidAmount: Amount_Money\n    paidAt: DateTime\n}\n\ntype ServiceMetric {\n    id: OID!\n    name: String!\n    unitName: String\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    unitCost: Amount_Money\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}\n\ntype ServiceGroup {\n    id: OID!\n    optional: Boolean!\n    name: String!\n    costType: GroupCostType\n    setupCost: ServiceCost\n    recurringCost: ServiceCost\n    services: [OID!]!\n}",
          examples: [],
          initialValue:
            '{"customerId": null, "customerName": null, "customerEmail": null, "customerType": null, "teamMemberCount": null, "operatorId": null, "serviceOfferingId": null, "tierName": null, "tierPricingOptionId": null, "tierPrice": null, "tierCurrency": null, "tierPricingMode": null, "selectedBillingCycle": null, "globalCurrency": null, "resource": null, "status": "DRAFT", "createdAt": null, "activatedSince": null, "pausedSince": null, "expiringSince": null, "renewalDate": null, "cancelledSince": null, "cancellationReason": null, "autoRenew": false, "operatorNotes": null, "budget": null, "nextBillingDate": null, "projectedBillAmount": null, "projectedBillCurrency": null, "services": [], "serviceGroups": []}',
        },
      },
      modules: [
        {
          id: "subscription",
          name: "Subscription",
          description: "Operations for managing subscription lifecycle",
          operations: [
            {
              id: "initialize-subscription",
              name: "INITIALIZE_SUBSCRIPTION",
              description: "Initializes a subscription",
              schema:
                "input InitializeSubscriptionInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: String\n    operatorId: PHID\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    createdAt: DateTime!\n}",
              template: "Initializes a subscription",
              reducer:
                'state.customerId = action.input.customerId || null;\nstate.customerName = action.input.customerName || null;\nstate.customerEmail = action.input.customerEmail || null;\nstate.operatorId = action.input.operatorId || null;\nstate.serviceOfferingId = action.input.serviceOfferingId || null;\nstate.tierName = action.input.tierName || null;\nstate.tierPricingOptionId = action.input.tierPricingOptionId || null;\nstate.tierPrice = action.input.tierPrice || null;\nstate.tierCurrency = action.input.tierCurrency || null;\nstate.tierPricingMode = action.input.tierPricingMode || null;\nstate.selectedBillingCycle = action.input.selectedBillingCycle || null;\nstate.globalCurrency = action.input.globalCurrency || null;\nstate.createdAt = action.input.createdAt;\nstate.status = "DRAFT";',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-resource-document",
              name: "SET_RESOURCE_DOCUMENT",
              description: "Sets the resource document reference",
              schema:
                "input SetResourceDocumentInput {\n    documentId: PHID!\n    documentType: String!\n}",
              template: "Sets the resource document reference",
              reducer:
                "state.resource = { documentId: action.input.documentId, documentType: action.input.documentType };",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-subscription-status",
              name: "UPDATE_SUBSCRIPTION_STATUS",
              description: "Updates subscription status",
              schema:
                "input UpdateSubscriptionStatusInput {\n    status: SubscriptionStatus!\n}",
              template: "Updates subscription status",
              reducer: "state.status = action.input.status;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "activate-subscription",
              name: "ACTIVATE_SUBSCRIPTION",
              description: "Activates the subscription",
              schema:
                "input ActivateSubscriptionInput {\n    activatedAt: DateTime!\n}",
              template: "Activates the subscription",
              reducer:
                'state.status = "ACTIVE";\nstate.activatedSince = action.input.activatedAt;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "pause-subscription",
              name: "PAUSE_SUBSCRIPTION",
              description: "Pauses the subscription",
              schema:
                "input PauseSubscriptionInput {\n    pausedAt: DateTime!\n}",
              template: "Pauses the subscription",
              reducer:
                'state.status = "PAUSED";\nstate.pausedSince = action.input.pausedAt;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-expiring",
              name: "SET_EXPIRING",
              description: "Sets expiring status",
              schema:
                "input SetExpiringInput {\n    expiringAt: DateTime!\n    renewalDate: DateTime\n}",
              template: "Sets expiring status",
              reducer:
                'state.status = "EXPIRING";\nstate.expiringSince = action.input.expiringAt;\nif (action.input.renewalDate) state.renewalDate = action.input.renewalDate;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "cancel-subscription",
              name: "CANCEL_SUBSCRIPTION",
              description: "Cancels the subscription",
              schema:
                "input CancelSubscriptionInput {\n    cancelledAt: DateTime!\n    reason: String\n}",
              template: "Cancels the subscription",
              reducer:
                'state.status = "CANCELLED";\nstate.cancelledSince = action.input.cancelledAt;\nstate.cancellationReason = action.input.reason || null;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "resume-subscription",
              name: "RESUME_SUBSCRIPTION",
              description: "Resumes the subscription",
              schema:
                "input ResumeSubscriptionInput {\n    resumedAt: DateTime!\n}",
              template: "Resumes the subscription",
              reducer:
                'state.status = "ACTIVE";\nstate.activatedSince = action.input.resumedAt;\nstate.pausedSince = null;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "renew-expiring-subscription",
              name: "RENEW_EXPIRING_SUBSCRIPTION",
              description: "Renews an expiring subscription",
              schema:
                "input RenewExpiringSubscriptionInput {\n    renewedAt: DateTime!\n    newRenewalDate: DateTime\n}",
              template: "Renews an expiring subscription",
              reducer:
                'state.status = "ACTIVE";\nstate.activatedSince = action.input.renewedAt;\nstate.expiringSince = null;\nif (action.input.newRenewalDate) state.renewalDate = action.input.newRenewalDate;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-budget-category",
              name: "SET_BUDGET_CATEGORY",
              description: "Sets the budget category",
              schema:
                "input SetBudgetCategoryInput {\n    id: OID!\n    name: String!\n    description: String\n}",
              template: "Sets the budget category",
              reducer:
                "state.budget = { id: action.input.id, name: action.input.name, description: action.input.description || null };",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-budget-category",
              name: "REMOVE_BUDGET_CATEGORY",
              description: "Removes the budget category",
              schema: "input RemoveBudgetCategoryInput {\n    id: OID!\n}",
              template: "Removes the budget category",
              reducer: "state.budget = null;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-customer-info",
              name: "UPDATE_CUSTOMER_INFO",
              description: "Updates customer info",
              schema:
                "input UpdateCustomerInfoInput {\n    customerName: String\n    customerEmail: String\n}",
              template: "Updates customer info",
              reducer:
                "if (action.input.customerName) state.customerName = action.input.customerName;\nif (action.input.customerEmail) state.customerEmail = action.input.customerEmail;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-tier-info",
              name: "UPDATE_TIER_INFO",
              description: "Updates tier info",
              schema:
                "input UpdateTierInfoInput {\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n}",
              template: "Updates tier info",
              reducer:
                "if (action.input.tierName) state.tierName = action.input.tierName;\nif (action.input.tierPricingOptionId) state.tierPricingOptionId = action.input.tierPricingOptionId;\nif (action.input.tierPrice) state.tierPrice = action.input.tierPrice;\nif (action.input.tierCurrency) state.tierCurrency = action.input.tierCurrency;\nif (action.input.tierPricingMode) state.tierPricingMode = action.input.tierPricingMode;\nif (action.input.selectedBillingCycle) state.selectedBillingCycle = action.input.selectedBillingCycle;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-operator-notes",
              name: "SET_OPERATOR_NOTES",
              description: "Sets operator notes",
              schema: "input SetOperatorNotesInput {\n    notes: String\n}",
              template: "Sets operator notes",
              reducer: "state.operatorNotes = action.input.notes || null;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-auto-renew",
              name: "SET_AUTO_RENEW",
              description: "Sets auto-renew flag",
              schema: "input SetAutoRenewInput {\n    autoRenew: Boolean!\n}",
              template: "Sets auto-renew flag",
              reducer: "state.autoRenew = action.input.autoRenew;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-renewal-date",
              name: "SET_RENEWAL_DATE",
              description: "Sets the renewal date",
              schema:
                "input SetRenewalDateInput {\n    renewalDate: DateTime!\n}",
              template: "Sets the renewal date",
              reducer: "state.renewalDate = action.input.renewalDate;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-billing-projection",
              name: "UPDATE_BILLING_PROJECTION",
              description: "Updates billing projection",
              schema:
                "input UpdateBillingProjectionInput {\n    nextBillingDate: DateTime\n    projectedBillAmount: Amount_Money\n    projectedBillCurrency: Currency\n}",
              template: "Updates billing projection",
              reducer:
                "if (action.input.nextBillingDate) state.nextBillingDate = action.input.nextBillingDate;\nif (action.input.projectedBillAmount) state.projectedBillAmount = action.input.projectedBillAmount;\nif (action.input.projectedBillCurrency) state.projectedBillCurrency = action.input.projectedBillCurrency;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "service",
          name: "Service",
          description: "Operations for managing subscription services",
          operations: [
            {
              id: "add-service",
              name: "ADD_SERVICE",
              description: "Adds a service to the subscription",
              schema:
                "input AddServiceInput {\n    id: OID!\n    name: String!\n    description: String\n    customValue: String\n}",
              template: "Adds a service to the subscription",
              reducer:
                "state.services.push({ id: action.input.id, name: action.input.name, description: action.input.description || null, customValue: action.input.customValue || null, facetSelections: [], setupCost: null, recurringCost: null, metrics: [] });",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-service",
              name: "REMOVE_SERVICE",
              description: "Removes a service from the subscription",
              schema: "input RemoveServiceInput {\n    id: OID!\n}",
              template: "Removes a service from the subscription",
              reducer:
                "const serviceIndex = state.services.findIndex(s => s.id === action.input.id);\nif (serviceIndex !== -1) { state.services.splice(serviceIndex, 1); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-service-setup-cost",
              name: "UPDATE_SERVICE_SETUP_COST",
              description: "Updates service setup cost",
              schema:
                "input UpdateServiceSetupCostInput {\n    serviceId: OID!\n    amount: Amount_Money!\n    currency: Currency!\n}",
              template: "Updates service setup cost",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) { service.setupCost = { amount: action.input.amount, currency: action.input.currency, paidAmount: null, paidAt: null }; }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-service-recurring-cost",
              name: "UPDATE_SERVICE_RECURRING_COST",
              description: "Updates service recurring cost",
              schema:
                "input UpdateServiceRecurringCostInput {\n    serviceId: OID!\n    amount: Amount_Money!\n    currency: Currency!\n}",
              template: "Updates service recurring cost",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) { service.recurringCost = { amount: action.input.amount, currency: action.input.currency, paidAmount: null, paidAt: null }; }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "report-setup-payment",
              name: "REPORT_SETUP_PAYMENT",
              description: "Reports a setup payment",
              schema:
                "input ReportSetupPaymentInput {\n    serviceId: OID!\n    paidAmount: Amount_Money!\n    paidAt: DateTime!\n}",
              template: "Reports a setup payment",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service && service.setupCost) { service.setupCost.paidAmount = action.input.paidAmount; service.setupCost.paidAt = action.input.paidAt; }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "report-recurring-payment",
              name: "REPORT_RECURRING_PAYMENT",
              description: "Reports a recurring payment",
              schema:
                "input ReportRecurringPaymentInput {\n    serviceId: OID!\n    paidAmount: Amount_Money!\n    paidAt: DateTime!\n}",
              template: "Reports a recurring payment",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service && service.recurringCost) { service.recurringCost.paidAmount = action.input.paidAmount; service.recurringCost.paidAt = action.input.paidAt; }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-service-info",
              name: "UPDATE_SERVICE_INFO",
              description: "Updates service info",
              schema:
                "input UpdateServiceInfoInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n}",
              template: "Updates service info",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    if (action.input.name) service.name = action.input.name;\n    if (action.input.description !== undefined) service.description = action.input.description || null;\n    if (action.input.customValue !== undefined) service.customValue = action.input.customValue || null;\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "add-service-facet-selection",
              name: "ADD_SERVICE_FACET_SELECTION",
              description: "Adds a facet selection to a service",
              schema:
                "input AddServiceFacetSelectionInput {\n    serviceId: OID!\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}",
              template: "Adds a facet selection to a service",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) { service.facetSelections.push({ id: action.input.id, facetName: action.input.facetName, selectedOption: action.input.selectedOption }); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-service-facet-selection",
              name: "REMOVE_SERVICE_FACET_SELECTION",
              description: "Removes a facet selection",
              schema:
                "input RemoveServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n}",
              template: "Removes a facet selection",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const fsIndex = service.facetSelections.findIndex(fs => fs.id === action.input.facetSelectionId);\n    if (fsIndex !== -1) { service.facetSelections.splice(fsIndex, 1); }\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "service-group",
          name: "Service Group",
          description: "Operations for managing service groups",
          operations: [
            {
              id: "add-service-group",
              name: "ADD_SERVICE_GROUP",
              description: "Adds a service group",
              schema:
                "input AddServiceGroupInput {\n    id: OID!\n    name: String!\n    optional: Boolean!\n    costType: GroupCostType\n}",
              template: "Adds a service group",
              reducer:
                "state.serviceGroups.push({ id: action.input.id, name: action.input.name, optional: action.input.optional, costType: action.input.costType || null, setupCost: null, recurringCost: null, services: [] });",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-service-group",
              name: "REMOVE_SERVICE_GROUP",
              description: "Removes a service group",
              schema: "input RemoveServiceGroupInput {\n    id: OID!\n}",
              template: "Removes a service group",
              reducer:
                "const groupIndex = state.serviceGroups.findIndex(g => g.id === action.input.id);\nif (groupIndex !== -1) { state.serviceGroups.splice(groupIndex, 1); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "add-service-to-group",
              name: "ADD_SERVICE_TO_GROUP",
              description: "Adds a service to a group",
              schema:
                "input AddServiceToGroupInput {\n    groupId: OID!\n    serviceId: OID!\n}",
              template: "Adds a service to a group",
              reducer:
                "const group = state.serviceGroups.find(g => g.id === action.input.groupId);\nif (group && !group.services.includes(action.input.serviceId)) { group.services.push(action.input.serviceId); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-service-from-group",
              name: "REMOVE_SERVICE_FROM_GROUP",
              description: "Removes a service from a group",
              schema:
                "input RemoveServiceFromGroupInput {\n    groupId: OID!\n    serviceId: OID!\n}",
              template: "Removes a service from a group",
              reducer:
                "const group = state.serviceGroups.find(g => g.id === action.input.groupId);\nif (group) {\n    const sIndex = group.services.indexOf(action.input.serviceId);\n    if (sIndex !== -1) { group.services.splice(sIndex, 1); }\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-service-group-cost",
              name: "UPDATE_SERVICE_GROUP_COST",
              description: "Updates service group cost",
              schema:
                "input UpdateServiceGroupCostInput {\n    groupId: OID!\n    costType: GroupCostType!\n    amount: Amount_Money!\n    currency: Currency!\n}",
              template: "Updates service group cost",
              reducer:
                'const group = state.serviceGroups.find(g => g.id === action.input.groupId);\nif (group) {\n    group.costType = action.input.costType;\n    const cost = { amount: action.input.amount, currency: action.input.currency, paidAmount: null, paidAt: null };\n    if (action.input.costType === "SETUP") { group.setupCost = cost; } else { group.recurringCost = cost; }\n}',
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "metrics",
          name: "Metrics",
          description: "Operations for managing service metrics and usage",
          operations: [
            {
              id: "add-service-metric",
              name: "ADD_SERVICE_METRIC",
              description: "Adds a metric to a service",
              schema:
                "input AddServiceMetricInput {\n    serviceId: OID!\n    id: OID!\n    name: String!\n    unitName: String\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    unitCost: Amount_Money\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}",
              template: "Adds a metric to a service",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) { service.metrics.push({ id: action.input.id, name: action.input.name, unitName: action.input.unitName || null, limit: action.input.limit || null, freeLimit: action.input.freeLimit || null, paidLimit: action.input.paidLimit || null, unitCost: action.input.unitCost || null, currentUsage: 0, usageResetPeriod: action.input.usageResetPeriod || null, nextUsageReset: action.input.nextUsageReset || null }); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-metric",
              name: "UPDATE_METRIC",
              description: "Updates a metric",
              schema:
                "input UpdateMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String\n    unitName: String\n    limit: Int\n    freeLimit: Int\n    paidLimit: Int\n    unitCost: Amount_Money\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}",
              template: "Updates a metric",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const metric = service.metrics.find(m => m.id === action.input.metricId);\n    if (metric) {\n        if (action.input.name) metric.name = action.input.name;\n        if (action.input.unitName !== undefined) metric.unitName = action.input.unitName || null;\n        if (action.input.limit !== undefined) metric.limit = action.input.limit;\n        if (action.input.freeLimit !== undefined) metric.freeLimit = action.input.freeLimit;\n        if (action.input.paidLimit !== undefined) metric.paidLimit = action.input.paidLimit;\n        if (action.input.unitCost !== undefined) metric.unitCost = action.input.unitCost;\n        if (action.input.usageResetPeriod !== undefined) metric.usageResetPeriod = action.input.usageResetPeriod;\n        if (action.input.nextUsageReset !== undefined) metric.nextUsageReset = action.input.nextUsageReset;\n    }\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-metric-usage",
              name: "UPDATE_METRIC_USAGE",
              description: "Updates metric usage",
              schema:
                "input UpdateMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentUsage: Int!\n}",
              template: "Updates metric usage",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const metric = service.metrics.find(m => m.id === action.input.metricId);\n    if (metric) { metric.currentUsage = action.input.currentUsage; }\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-service-metric",
              name: "REMOVE_SERVICE_METRIC",
              description: "Removes a metric",
              schema:
                "input RemoveServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n}",
              template: "Removes a metric",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const mIndex = service.metrics.findIndex(m => m.id === action.input.metricId);\n    if (mIndex !== -1) { service.metrics.splice(mIndex, 1); }\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "increment-metric-usage",
              name: "INCREMENT_METRIC_USAGE",
              description: "Increments metric usage",
              schema:
                "input IncrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    amount: Int!\n}",
              template: "Increments metric usage",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const metric = service.metrics.find(m => m.id === action.input.metricId);\n    if (metric) { metric.currentUsage += action.input.amount; }\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "decrement-metric-usage",
              name: "DECREMENT_METRIC_USAGE",
              description: "Decrements metric usage",
              schema:
                "input DecrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    amount: Int!\n}",
              template: "Decrements metric usage",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const metric = service.metrics.find(m => m.id === action.input.metricId);\n    if (metric) { metric.currentUsage = Math.max(0, metric.currentUsage - action.input.amount); }\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "customer",
          name: "Customer",
          description: "Operations for managing customer info",
          operations: [
            {
              id: "set-customer-type",
              name: "SET_CUSTOMER_TYPE",
              description: "Sets the customer type",
              schema:
                "input SetCustomerTypeInput {\n    customerType: CustomerType!\n}",
              template: "Sets the customer type",
              reducer: "state.customerType = action.input.customerType;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-team-member-count",
              name: "UPDATE_TEAM_MEMBER_COUNT",
              description: "Updates team member count",
              schema:
                "input UpdateTeamMemberCountInput {\n    teamMemberCount: Int!\n}",
              template: "Updates team member count",
              reducer: "state.teamMemberCount = action.input.teamMemberCount;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
