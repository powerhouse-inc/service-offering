import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  author: {
    name: "Powerhouse",
    website: "",
  },
  description:
    "Tracks subscription instances for customers including services, usage metrics, and billing projections",
  extension: "phsi",
  id: "powerhouse/subscription-instance",
  name: "Subscription Instance",
  specifications: [
    {
      changeLog: [],
      modules: [
        {
          description: "Core subscription lifecycle management",
          id: "subscription",
          name: "Subscription",
          operations: [
            {
              description:
                "Initialize a new subscription with customer and offering details",
              errors: [],
              examples: [],
              id: "INITIALIZE_SUBSCRIPTION",
              name: "INITIALIZE_SUBSCRIPTION",
              reducer:
                'const { input } = action;\nstate.customerId = input.customerId || null;\nstate.customerName = input.customerName || null;\nstate.customerEmail = input.customerEmail || null;\nstate.serviceOfferingId = input.serviceOfferingId || null;\nstate.tierName = input.tierName || null;\nstate.tierPricingOptionId = input.tierPricingOptionId || null;\nstate.tierPrice = input.tierPrice || null;\nstate.tierCurrency = input.tierCurrency || null;\nstate.autoRenew = input.autoRenew ?? false;\nstate.createdAt = input.createdAt;\nstate.status = "PENDING";\nif (input.resourceId) {\n  state.resource = {\n    id: input.resourceId,\n    label: input.resourceLabel || null,\n    thumbnailUrl: input.resourceThumbnailUrl || null,\n  };\n}\nif (input.services) {\n  for (const svc of input.services) {\n    state.services.push({\n      id: svc.id,\n      name: svc.name || null,\n      description: svc.description || null,\n      customValue: svc.customValue || null,\n      facetSelections: (svc.facetSelections || []).map(f => ({ id: f.id, facetName: f.facetName, selectedOption: f.selectedOption })),\n      setupCost: svc.setupAmount && svc.setupCurrency ? { amount: svc.setupAmount, currency: svc.setupCurrency, billingDate: null, paymentDate: null } : null,\n      recurringCost: svc.recurringAmount && svc.recurringCurrency && svc.recurringBillingCycle ? { amount: svc.recurringAmount, currency: svc.recurringCurrency, billingCycle: svc.recurringBillingCycle, nextBillingDate: null, lastPaymentDate: null } : null,\n      metrics: (svc.metrics || []).map(m => ({ id: m.id, name: m.name, unitName: m.unitName, limit: m.limit || null, currentUsage: m.currentUsage, usageResetPeriod: m.usageResetPeriod || null, nextUsageReset: null, unitCost: m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle ? { amount: m.unitCostAmount, currency: m.unitCostCurrency, billingCycle: m.unitCostBillingCycle, nextBillingDate: null, lastPaymentDate: null } : null })),\n    });\n  }\n}\nif (input.serviceGroups) {\n  for (const grp of input.serviceGroups) {\n    const groupServices = (grp.services || []).map(svc => ({\n      id: svc.id,\n      name: svc.name || null,\n      description: svc.description || null,\n      customValue: svc.customValue || null,\n      facetSelections: (svc.facetSelections || []).map(f => ({ id: f.id, facetName: f.facetName, selectedOption: f.selectedOption })),\n      setupCost: svc.setupAmount && svc.setupCurrency ? { amount: svc.setupAmount, currency: svc.setupCurrency, billingDate: null, paymentDate: null } : null,\n      recurringCost: svc.recurringAmount && svc.recurringCurrency && svc.recurringBillingCycle ? { amount: svc.recurringAmount, currency: svc.recurringCurrency, billingCycle: svc.recurringBillingCycle, nextBillingDate: null, lastPaymentDate: null } : null,\n      metrics: (svc.metrics || []).map(m => ({ id: m.id, name: m.name, unitName: m.unitName, limit: m.limit || null, currentUsage: m.currentUsage, usageResetPeriod: m.usageResetPeriod || null, nextUsageReset: null, unitCost: m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle ? { amount: m.unitCostAmount, currency: m.unitCostCurrency, billingCycle: m.unitCostBillingCycle, nextBillingDate: null, lastPaymentDate: null } : null })),\n    }));\n    state.serviceGroups.push({\n      id: grp.id,\n      name: grp.name,\n      optional: grp.optional,\n      recurringCost: grp.recurringAmount && grp.recurringCurrency && grp.recurringBillingCycle ? { amount: grp.recurringAmount, currency: grp.recurringCurrency, billingCycle: grp.recurringBillingCycle, nextBillingDate: null, lastPaymentDate: null } : null,\n      services: groupServices,\n    });\n  }\n}',
              schema:
                "input InitializeFacetSelectionInput {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ninput InitializeMetricInput {\n    id: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n}\n\ninput InitializeServiceInput {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [InitializeFacetSelectionInput!]\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    metrics: [InitializeMetricInput!]\n}\n\ninput InitializeServiceGroupInput {\n    id: OID!\n    name: String!\n    optional: Boolean!\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    services: [InitializeServiceInput!]\n}\n\ninput InitializeSubscriptionInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    resourceId: PHID\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n    autoRenew: Boolean\n    createdAt: DateTime!\n    services: [InitializeServiceInput!]\n    serviceGroups: [InitializeServiceGroupInput!]\n}",
              scope: "global",
              template:
                "Initialize a new subscription with customer and offering details",
            },
            {
              description: "Set or update the resource document reference",
              errors: [],
              examples: [],
              id: "SET_RESOURCE_DOCUMENT",
              name: "SET_RESOURCE_DOCUMENT",
              reducer: "",
              schema:
                "input SetResourceDocumentInput {\n    resourceId: PHID!\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n}",
              scope: "global",
              template: "Set or update the resource document reference",
            },
            {
              description: "Update the subscription status directly",
              errors: [],
              examples: [],
              id: "UPDATE_SUBSCRIPTION_STATUS",
              name: "UPDATE_SUBSCRIPTION_STATUS",
              reducer: "",
              schema:
                "input UpdateSubscriptionStatusInput {\n    status: SubscriptionStatus!\n}",
              scope: "global",
              template: "Update the subscription status directly",
            },
            {
              description: "Activate a pending subscription",
              errors: [],
              examples: [],
              id: "ACTIVATE_SUBSCRIPTION",
              name: "ACTIVATE_SUBSCRIPTION",
              reducer: "",
              schema:
                "input ActivateSubscriptionInput {\n    activatedSince: DateTime!\n}",
              scope: "global",
              template: "Activate a pending subscription",
            },
            {
              description: "Pause an active subscription",
              errors: [],
              examples: [],
              id: "PAUSE_SUBSCRIPTION",
              name: "PAUSE_SUBSCRIPTION",
              reducer: "",
              schema:
                "input PauseSubscriptionInput {\n    pausedSince: DateTime!\n}",
              scope: "global",
              template: "Pause an active subscription",
            },
            {
              description: "Mark subscription as expiring",
              errors: [],
              examples: [],
              id: "SET_EXPIRING",
              name: "SET_EXPIRING",
              reducer: "",
              schema:
                "input SetExpiringInput {\n    expiringSince: DateTime!\n}",
              scope: "global",
              template: "Mark subscription as expiring",
            },
            {
              description: "Cancel a subscription",
              errors: [],
              examples: [],
              id: "CANCEL_SUBSCRIPTION",
              name: "CANCEL_SUBSCRIPTION",
              reducer: "",
              schema:
                "input CancelSubscriptionInput {\n    cancelledSince: DateTime!\n    cancellationReason: String\n}",
              scope: "global",
              template: "Cancel a subscription",
            },
            {
              description: "Resume a paused subscription",
              errors: [],
              examples: [],
              id: "RESUME_SUBSCRIPTION",
              name: "RESUME_SUBSCRIPTION",
              reducer: "",
              schema:
                "input ResumeSubscriptionInput {\n    timestamp: DateTime!\n}",
              scope: "global",
              template: "Resume a paused subscription",
            },
            {
              description: "Renew an expiring subscription",
              errors: [],
              examples: [],
              id: "RENEW_EXPIRING_SUBSCRIPTION",
              name: "RENEW_EXPIRING_SUBSCRIPTION",
              reducer: "",
              schema:
                "input RenewExpiringSubscriptionInput {\n    timestamp: DateTime!\n    newRenewalDate: DateTime\n}",
              scope: "global",
              template: "Renew an expiring subscription",
            },
            {
              description: "Set the budget category for the subscription",
              errors: [],
              examples: [],
              id: "SET_BUDGET_CATEGORY",
              name: "SET_BUDGET_CATEGORY",
              reducer: "",
              schema:
                "input SetBudgetCategoryInput {\n    budgetId: OID!\n    budgetLabel: String!\n}",
              scope: "global",
              template: "Set the budget category for the subscription",
            },
            {
              description: "Remove the budget category from the subscription",
              errors: [],
              examples: [],
              id: "REMOVE_BUDGET_CATEGORY",
              name: "REMOVE_BUDGET_CATEGORY",
              reducer: "",
              schema:
                "input RemoveBudgetCategoryInput {\n    budgetId: OID!\n}",
              scope: "global",
              template: "Remove the budget category from the subscription",
            },
            {
              description: "Update customer information",
              errors: [],
              examples: [],
              id: "UPDATE_CUSTOMER_INFO",
              name: "UPDATE_CUSTOMER_INFO",
              reducer: "",
              schema:
                "input UpdateCustomerInfoInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n}",
              scope: "global",
              template: "Update customer information",
            },
            {
              description: "Update tier information",
              errors: [],
              examples: [],
              id: "UPDATE_TIER_INFO",
              name: "UPDATE_TIER_INFO",
              reducer:
                "const { input } = action;\nif (input.tierName) state.tierName = input.tierName;\nif (input.tierPricingOptionId) state.tierPricingOptionId = input.tierPricingOptionId;\nif (input.tierPrice !== undefined && input.tierPrice !== null) state.tierPrice = input.tierPrice;\nif (input.tierCurrency) state.tierCurrency = input.tierCurrency;",
              schema:
                "input UpdateTierInfoInput {\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n}",
              scope: "global",
              template: "Update tier information",
            },
            {
              description: "Set operator notes for the subscription",
              errors: [],
              examples: [],
              id: "SET_OPERATOR_NOTES",
              name: "SET_OPERATOR_NOTES",
              reducer: "",
              schema:
                "input SetOperatorNotesInput {\n    operatorNotes: String\n}",
              scope: "global",
              template: "Set operator notes for the subscription",
            },
            {
              description: "Set auto-renew preference",
              errors: [],
              examples: [],
              id: "SET_AUTO_RENEW",
              name: "SET_AUTO_RENEW",
              reducer: "",
              schema: "input SetAutoRenewInput {\n    autoRenew: Boolean!\n}",
              scope: "global",
              template: "Set auto-renew preference",
            },
            {
              description: "Set the renewal date",
              errors: [],
              examples: [],
              id: "SET_RENEWAL_DATE",
              name: "SET_RENEWAL_DATE",
              reducer: "",
              schema:
                "input SetRenewalDateInput {\n    renewalDate: DateTime!\n}",
              scope: "global",
              template: "Set the renewal date",
            },
            {
              description: "Update billing projection fields",
              errors: [],
              examples: [],
              id: "UPDATE_BILLING_PROJECTION",
              name: "UPDATE_BILLING_PROJECTION",
              reducer: "",
              schema:
                "input UpdateBillingProjectionInput {\n    nextBillingDate: DateTime\n    projectedBillAmount: Amount_Money\n    projectedBillCurrency: Currency\n}",
              scope: "global",
              template: "Update billing projection fields",
            },
          ],
        },
        {
          description: "Service management within subscriptions",
          id: "service",
          name: "Service",
          operations: [
            {
              description: "Add a new service to the subscription",
              errors: [],
              examples: [],
              id: "ADD_SERVICE",
              name: "ADD_SERVICE",
              reducer:
                "const { input } = action;\nlet setupCost = null;\nif (input.setupAmount && input.setupCurrency) {\n  setupCost = { amount: input.setupAmount, currency: input.setupCurrency, billingDate: input.setupBillingDate || null, paymentDate: input.setupPaymentDate || null };\n}\nlet recurringCost = null;\nif (input.recurringAmount && input.recurringCurrency && input.recurringBillingCycle) {\n  recurringCost = { amount: input.recurringAmount, currency: input.recurringCurrency, billingCycle: input.recurringBillingCycle, nextBillingDate: input.recurringNextBillingDate || null, lastPaymentDate: input.recurringLastPaymentDate || null };\n}\nstate.services.push({ id: input.serviceId, name: input.name || null, description: input.description || null, customValue: input.customValue || null, facetSelections: [], setupCost, recurringCost, metrics: [] });",
              schema:
                "input AddServiceInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    setupPaymentDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringNextBillingDate: DateTime\n    recurringLastPaymentDate: DateTime\n}",
              scope: "global",
              template: "Add a new service to the subscription",
            },
            {
              description: "Remove a service from the subscription",
              errors: [],
              examples: [],
              id: "REMOVE_SERVICE",
              name: "REMOVE_SERVICE",
              reducer: "",
              schema: "input RemoveServiceInput {\n    serviceId: OID!\n}",
              scope: "global",
              template: "Remove a service from the subscription",
            },
            {
              description: "Update the setup cost of a service",
              errors: [],
              examples: [],
              id: "UPDATE_SERVICE_SETUP_COST",
              name: "UPDATE_SERVICE_SETUP_COST",
              reducer: "",
              schema:
                "input UpdateServiceSetupCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n    billingDate: DateTime\n    paymentDate: DateTime\n}",
              scope: "global",
              template: "Update the setup cost of a service",
            },
            {
              description: "Update the recurring cost of a service",
              errors: [],
              examples: [],
              id: "UPDATE_SERVICE_RECURRING_COST",
              name: "UPDATE_SERVICE_RECURRING_COST",
              reducer: "",
              schema:
                "input UpdateServiceRecurringCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n    billingCycle: BillingCycle\n    nextBillingDate: DateTime\n    lastPaymentDate: DateTime\n}",
              scope: "global",
              template: "Update the recurring cost of a service",
            },
            {
              description: "Report a setup payment for a service",
              errors: [],
              examples: [],
              id: "REPORT_SETUP_PAYMENT",
              name: "REPORT_SETUP_PAYMENT",
              reducer: "",
              schema:
                "input ReportSetupPaymentInput {\n    serviceId: OID!\n    paymentDate: DateTime!\n}",
              scope: "global",
              template: "Report a setup payment for a service",
            },
            {
              description: "Report a recurring payment for a service",
              errors: [],
              examples: [],
              id: "REPORT_RECURRING_PAYMENT",
              name: "REPORT_RECURRING_PAYMENT",
              reducer: "",
              schema:
                "input ReportRecurringPaymentInput {\n    serviceId: OID!\n    paymentDate: DateTime!\n}",
              scope: "global",
              template: "Report a recurring payment for a service",
            },
            {
              description: "Update service name, description and custom value",
              errors: [],
              examples: [],
              id: "UPDATE_SERVICE_INFO",
              name: "UPDATE_SERVICE_INFO",
              reducer:
                "const { input } = action;\nconst service = state.services.find(s => s.id === input.serviceId);\nif (service) {\n  if (input.name) service.name = input.name;\n  if (input.description) service.description = input.description;\n  if (input.customValue !== undefined && input.customValue !== null) service.customValue = input.customValue;\n}",
              schema:
                "input UpdateServiceInfoInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n}",
              scope: "global",
              template: "Update service name, description and custom value",
            },
            {
              description: "Add a facet selection to a service",
              errors: [],
              examples: [],
              id: "ADD_SERVICE_FACET_SELECTION",
              name: "ADD_SERVICE_FACET_SELECTION",
              reducer:
                "const { input } = action;\nconst service = state.services.find(s => s.id === input.serviceId);\nif (service) {\n  service.facetSelections.push({ id: input.facetSelectionId, facetName: input.facetName, selectedOption: input.selectedOption });\n}",
              schema:
                "input AddServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n    facetName: String!\n    selectedOption: String!\n}",
              scope: "global",
              template: "Add a facet selection to a service",
            },
            {
              description: "Remove a facet selection from a service",
              errors: [],
              examples: [],
              id: "REMOVE_SERVICE_FACET_SELECTION",
              name: "REMOVE_SERVICE_FACET_SELECTION",
              reducer:
                "const { input } = action;\nconst service = state.services.find(s => s.id === input.serviceId);\nif (service) {\n  const index = service.facetSelections.findIndex(f => f.id === input.facetSelectionId);\n  if (index !== -1) service.facetSelections.splice(index, 1);\n}",
              schema:
                "input RemoveServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n}",
              scope: "global",
              template: "Remove a facet selection from a service",
            },
          ],
        },
        {
          description: "Service group management",
          id: "service-group",
          name: "Service Group",
          operations: [
            {
              description: "Add a new service group",
              errors: [],
              examples: [],
              id: "ADD_SERVICE_GROUP",
              name: "ADD_SERVICE_GROUP",
              reducer:
                "const { input } = action;\nlet recurringCost = null;\nif (input.recurringAmount && input.recurringCurrency && input.recurringBillingCycle) {\n  recurringCost = { amount: input.recurringAmount, currency: input.recurringCurrency, billingCycle: input.recurringBillingCycle, nextBillingDate: null, lastPaymentDate: null };\n}\nstate.serviceGroups.push({ id: input.groupId, name: input.name, optional: input.optional, recurringCost, services: [] });",
              schema:
                "input AddServiceGroupInput {\n    groupId: OID!\n    name: String!\n    optional: Boolean!\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n}",
              scope: "global",
              template: "Add a new service group",
            },
            {
              description: "Remove a service group",
              errors: [],
              examples: [],
              id: "REMOVE_SERVICE_GROUP",
              name: "REMOVE_SERVICE_GROUP",
              reducer: "",
              schema: "input RemoveServiceGroupInput {\n    groupId: OID!\n}",
              scope: "global",
              template: "Remove a service group",
            },
            {
              description: "Add a service to a group",
              errors: [],
              examples: [],
              id: "ADD_SERVICE_TO_GROUP",
              name: "ADD_SERVICE_TO_GROUP",
              reducer:
                "const { input } = action;\nconst group = state.serviceGroups.find(g => g.id === input.groupId);\nif (group) {\n  let setupCost = null;\n  if (input.setupAmount && input.setupCurrency) {\n    setupCost = { amount: input.setupAmount, currency: input.setupCurrency, billingDate: input.setupBillingDate || null, paymentDate: input.setupPaymentDate || null };\n  }\n  let recurringCost = null;\n  if (input.recurringAmount && input.recurringCurrency && input.recurringBillingCycle) {\n    recurringCost = { amount: input.recurringAmount, currency: input.recurringCurrency, billingCycle: input.recurringBillingCycle, nextBillingDate: input.recurringNextBillingDate || null, lastPaymentDate: input.recurringLastPaymentDate || null };\n  }\n  group.services.push({ id: input.serviceId, name: input.name || null, description: input.description || null, customValue: input.customValue || null, facetSelections: [], setupCost, recurringCost, metrics: [] });\n}",
              schema:
                "input AddServiceToGroupInput {\n    groupId: OID!\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    setupBillingDate: DateTime\n    setupPaymentDate: DateTime\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringNextBillingDate: DateTime\n    recurringLastPaymentDate: DateTime\n}",
              scope: "global",
              template: "Add a service to a group",
            },
            {
              description: "Remove a service from a group",
              errors: [],
              examples: [],
              id: "REMOVE_SERVICE_FROM_GROUP",
              name: "REMOVE_SERVICE_FROM_GROUP",
              reducer: "",
              schema:
                "input RemoveServiceFromGroupInput {\n    groupId: OID!\n    serviceId: OID!\n}",
              scope: "global",
              template: "Remove a service from a group",
            },
            {
              description: "Update the recurring cost of a service group",
              errors: [],
              examples: [],
              id: "UPDATE_SERVICE_GROUP_COST",
              name: "UPDATE_SERVICE_GROUP_COST",
              reducer:
                "const { input } = action;\nconst group = state.serviceGroups.find(g => g.id === input.groupId);\nif (group) {\n  if (input.recurringAmount && input.recurringCurrency && input.recurringBillingCycle) {\n    group.recurringCost = { amount: input.recurringAmount, currency: input.recurringCurrency, billingCycle: input.recurringBillingCycle, nextBillingDate: null, lastPaymentDate: null };\n  }\n}",
              schema:
                "input UpdateServiceGroupCostInput {\n    groupId: OID!\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n}",
              scope: "global",
              template: "Update the recurring cost of a service group",
            },
          ],
        },
        {
          description: "Service metrics tracking",
          id: "metrics",
          name: "Metrics",
          operations: [
            {
              description: "Add a metric to a service",
              errors: [],
              examples: [],
              id: "ADD_SERVICE_METRIC",
              name: "ADD_SERVICE_METRIC",
              reducer: "",
              schema:
                "input AddServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n    unitCostNextBillingDate: DateTime\n    unitCostLastPaymentDate: DateTime\n}",
              scope: "global",
              template: "Add a metric to a service",
            },
            {
              description: "Update metric properties",
              errors: [],
              examples: [],
              id: "UPDATE_METRIC",
              name: "UPDATE_METRIC",
              reducer: "",
              schema:
                "input UpdateMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String\n    unitName: String\n    limit: Int\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}",
              scope: "global",
              template: "Update metric properties",
            },
            {
              description: "Update current usage for a metric",
              errors: [],
              examples: [],
              id: "UPDATE_METRIC_USAGE",
              name: "UPDATE_METRIC_USAGE",
              reducer: "",
              schema:
                "input UpdateMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    currentUsage: Int!\n}",
              scope: "global",
              template: "Update current usage for a metric",
            },
            {
              description: "Remove a metric from a service",
              errors: [],
              examples: [],
              id: "REMOVE_SERVICE_METRIC",
              name: "REMOVE_SERVICE_METRIC",
              reducer: "",
              schema:
                "input RemoveServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n}",
              scope: "global",
              template: "Remove a metric from a service",
            },
            {
              description: "Increment metric usage by a specified amount",
              errors: [],
              examples: [],
              id: "INCREMENT_METRIC_USAGE",
              name: "INCREMENT_METRIC_USAGE",
              reducer: "",
              schema:
                "input IncrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    incrementBy: Int!\n}",
              scope: "global",
              template: "Increment metric usage by a specified amount",
            },
            {
              description: "Decrement metric usage by a specified amount",
              errors: [],
              examples: [],
              id: "DECREMENT_METRIC_USAGE",
              name: "DECREMENT_METRIC_USAGE",
              reducer: "",
              schema:
                "input DecrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    decrementBy: Int!\n}",
              scope: "global",
              template: "Decrement metric usage by a specified amount",
            },
          ],
        },
        {
          description: "Customer profile management",
          id: "customer",
          name: "Customer",
          operations: [
            {
              description: "Set customer type (individual or team)",
              errors: [],
              examples: [],
              id: "SET_CUSTOMER_TYPE",
              name: "SET_CUSTOMER_TYPE",
              reducer: "",
              schema:
                "input SetCustomerTypeInput {\n    customerType: CustomerType!\n    teamMemberCount: Int\n}",
              scope: "global",
              template: "Set customer type (individual or team)",
            },
            {
              description: "Update team member count",
              errors: [],
              examples: [],
              id: "UPDATE_TEAM_MEMBER_COUNT",
              name: "UPDATE_TEAM_MEMBER_COUNT",
              reducer: "",
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
            '{"customerId":null,"customerName":null,"customerEmail":null,"customerType":null,"teamMemberCount":null,"operatorId":null,"serviceOfferingId":null,"tierName":null,"tierPricingOptionId":null,"tierPrice":null,"tierCurrency":null,"resource":null,"status":"PENDING","createdAt":null,"activatedSince":null,"pausedSince":null,"expiringSince":null,"renewalDate":null,"cancelledSince":null,"cancellationReason":null,"autoRenew":false,"operatorNotes":null,"budget":null,"nextBillingDate":null,"projectedBillAmount":null,"projectedBillCurrency":null,"services":[],"serviceGroups":[]}',
          schema:
            "type SubscriptionInstanceState {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    customerType: CustomerType\n    teamMemberCount: Int\n    operatorId: PHID\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    resource: ResourceDocument\n    status: SubscriptionStatus!\n    createdAt: DateTime\n    activatedSince: DateTime\n    pausedSince: DateTime\n    expiringSince: DateTime\n    renewalDate: DateTime\n    cancelledSince: DateTime\n    cancellationReason: String\n    autoRenew: Boolean!\n    operatorNotes: String\n    budget: BudgetCategory\n    nextBillingDate: DateTime\n    projectedBillAmount: Amount_Money\n    projectedBillCurrency: Currency\n    services: [Service!]!\n    serviceGroups: [ServiceGroup!]!\n}\n\nenum CustomerType {\n    INDIVIDUAL\n    TEAM\n}\n\ntype ServiceGroup {\n    id: OID!\n    optional: Boolean!\n    name: String!\n    recurringCost: RecurringCost\n    services: [Service!]!\n}\n\ntype ResourceDocument {\n    id: PHID!\n    label: String\n    thumbnailUrl: URL\n}\n\nenum SubscriptionStatus {\n    PENDING\n    ACTIVE\n    PAUSED\n    EXPIRING\n    CANCELLED\n}\n\ntype RecurringCost {\n    amount: Amount_Money!\n    currency: Currency!\n    billingCycle: BillingCycle!\n    nextBillingDate: DateTime\n    lastPaymentDate: DateTime\n}\n\ntype SetupCost {\n    amount: Amount_Money!\n    currency: Currency!\n    billingDate: DateTime\n    paymentDate: DateTime\n}\n\nenum BillingCycle {\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n    ONE_TIME\n}\n\ntype BudgetCategory {\n    id: OID!\n    label: String!\n}\n\ntype Service {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [ServiceFacetSelection!]!\n    setupCost: SetupCost\n    recurringCost: RecurringCost\n    metrics: [ServiceMetric!]!\n}\n\ntype ServiceFacetSelection {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ntype ServiceMetric {\n    id: OID!\n    name: String!\n    unitName: String!\n    limit: Int\n    unitCost: RecurringCost\n    currentUsage: Int!\n    usageResetPeriod: ResetPeriod\n    nextUsageReset: DateTime\n}\n\nenum ResetPeriod {\n    HOURLY\n    DAILY\n    WEEKLY\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n}",
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
