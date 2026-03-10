import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/resource-instance",
  name: "ResourceInstance",
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  extension: "",
  description:
    "Document model for an instantiated resource. Represents a customer's configured resource instance based on template and facet selections.",
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
            "type ResourceInstanceState {\n    resourceTemplateId: PHID\n    customerId: PHID\n    customerName: String\n    templateName: String\n    name: String\n    thumbnailUrl: URL\n    infoLink: URL\n    description: String\n    operatorProfile: OperatorProfile\n    operatorName: String\n    status: InstanceStatus!\n    configuration: [InstanceFacet!]!\n    confirmedAt: DateTime\n    provisioningStartedAt: DateTime\n    provisioningCompletedAt: DateTime\n    provisioningFailureReason: String\n    activatedAt: DateTime\n    suspendedAt: DateTime\n    suspensionType: SuspensionType\n    suspensionReason: String\n    suspensionDetails: String\n    resumedAt: DateTime\n    terminatedAt: DateTime\n    terminationReason: String\n}\n\ntype OperatorProfile {\n    id: PHID!\n    operatorName: String\n}\n\nenum InstanceStatus {\n    DRAFT\n    PROVISIONING\n    ACTIVE\n    SUSPENDED\n    TERMINATED\n}\n\nenum SuspensionType {\n    NON_PAYMENT\n    MAINTENANCE\n    OTHER\n}\n\ntype InstanceFacet {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOption: String!\n}",
          examples: [],
          initialValue:
            '{"resourceTemplateId": null, "customerId": null, "customerName": null, "templateName": null, "name": null, "thumbnailUrl": null, "infoLink": null, "description": null, "operatorProfile": null, "operatorName": null, "status": "DRAFT", "configuration": [], "confirmedAt": null, "provisioningStartedAt": null, "provisioningCompletedAt": null, "provisioningFailureReason": null, "activatedAt": null, "suspendedAt": null, "suspensionType": null, "suspensionReason": null, "suspensionDetails": null, "resumedAt": null, "terminatedAt": null, "terminationReason": null}',
        },
      },
      modules: [
        {
          id: "instance-management",
          name: "Instance Management",
          description: "Operations for managing resource instance lifecycle",
          operations: [
            {
              id: "initialize-instance",
              name: "INITIALIZE_INSTANCE",
              description: "Initializes a new resource instance",
              schema:
                "input InitializeInstanceInput {\n    operatorId: PHID!\n    operatorDocumentType: String!\n    resourceTemplateId: PHID\n    customerId: PHID\n    customerName: String\n    templateName: String\n    operatorName: String\n    name: String\n    thumbnailUrl: URL\n    infoLink: URL\n    description: String\n}",
              template: "Initializes a new resource instance",
              reducer:
                'state.operatorProfile = { id: action.input.operatorId, operatorName: action.input.operatorName || null };\nstate.resourceTemplateId = action.input.resourceTemplateId || null;\nstate.customerId = action.input.customerId || null;\nstate.customerName = action.input.customerName || null;\nstate.templateName = action.input.templateName || null;\nstate.operatorName = action.input.operatorName || null;\nstate.name = action.input.name || null;\nstate.thumbnailUrl = action.input.thumbnailUrl || null;\nstate.infoLink = action.input.infoLink || null;\nstate.description = action.input.description || null;\nstate.status = "DRAFT";',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-instance-info",
              name: "UPDATE_INSTANCE_INFO",
              description: "Updates instance info fields",
              schema:
                "input UpdateInstanceInfoInput {\n    name: String\n    thumbnailUrl: URL\n    infoLink: URL\n    description: String\n}",
              template: "Updates instance info fields",
              reducer:
                "if (action.input.name) state.name = action.input.name;\nif (action.input.thumbnailUrl) state.thumbnailUrl = action.input.thumbnailUrl;\nif (action.input.infoLink) state.infoLink = action.input.infoLink;\nif (action.input.description) state.description = action.input.description;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "set-operator-profile",
              name: "SET_OPERATOR_PROFILE",
              description: "Sets the operator profile",
              schema:
                "input SetOperatorProfileInput {\n    operatorId: PHID!\n    operatorName: String\n}",
              template: "Sets the operator profile",
              reducer:
                "state.operatorProfile = { id: action.input.operatorId, operatorName: action.input.operatorName || null };",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "confirm-instance",
              name: "CONFIRM_INSTANCE",
              description: "Confirms the instance",
              schema:
                "input ConfirmInstanceInput {\n    confirmedAt: DateTime!\n}",
              template: "Confirms the instance",
              reducer: "state.confirmedAt = action.input.confirmedAt;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "report-provisioning-started",
              name: "REPORT_PROVISIONING_STARTED",
              description: "Reports provisioning started",
              schema:
                "input ReportProvisioningStartedInput {\n    startedAt: DateTime!\n}",
              template: "Reports provisioning started",
              reducer:
                'state.status = "PROVISIONING";\nstate.provisioningStartedAt = action.input.startedAt;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "report-provisioning-completed",
              name: "REPORT_PROVISIONING_COMPLETED",
              description: "Reports provisioning completed",
              schema:
                "input ReportProvisioningCompletedInput {\n    completedAt: DateTime!\n}",
              template: "Reports provisioning completed",
              reducer:
                "state.provisioningCompletedAt = action.input.completedAt;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "report-provisioning-failed",
              name: "REPORT_PROVISIONING_FAILED",
              description: "Reports provisioning failed",
              schema:
                "input ReportProvisioningFailedInput {\n    failedAt: DateTime!\n    failureReason: String!\n}",
              template: "Reports provisioning failed",
              reducer:
                "state.provisioningFailureReason = action.input.failureReason;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "activate-instance",
              name: "ACTIVATE_INSTANCE",
              description: "Activates the instance",
              schema:
                "input ActivateInstanceInput {\n    activatedAt: DateTime!\n}",
              template: "Activates the instance",
              reducer:
                'state.status = "ACTIVE";\nstate.activatedAt = action.input.activatedAt;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "suspend-for-non-payment",
              name: "SUSPEND_FOR_NON_PAYMENT",
              description: "Suspends for non-payment",
              schema:
                "input SuspendForNonPaymentInput {\n    suspendedAt: DateTime!\n    outstandingAmount: Amount_Money\n    daysPastDue: Int\n}",
              template: "Suspends for non-payment",
              reducer:
                'state.status = "SUSPENDED";\nstate.suspendedAt = action.input.suspendedAt;\nstate.suspensionType = "NON_PAYMENT";\nconst details: string[] = [];\nif (action.input.outstandingAmount !== undefined && action.input.outstandingAmount !== null) details.push(`Outstanding: ${action.input.outstandingAmount}`);\nif (action.input.daysPastDue !== undefined && action.input.daysPastDue !== null) details.push(`Days past due: ${action.input.daysPastDue}`);\nstate.suspensionDetails = details.length > 0 ? details.join(", ") : null;\nstate.suspensionReason = "Non-payment";',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "suspend-for-maintenance",
              name: "SUSPEND_FOR_MAINTENANCE",
              description: "Suspends for maintenance",
              schema:
                "input SuspendForMaintenanceInput {\n    suspendedAt: DateTime!\n    estimatedDuration: String\n    maintenanceType: String\n}",
              template: "Suspends for maintenance",
              reducer:
                'state.status = "SUSPENDED";\nstate.suspendedAt = action.input.suspendedAt;\nstate.suspensionType = "MAINTENANCE";\nconst details: string[] = [];\nif (action.input.estimatedDuration) details.push(`Duration: ${action.input.estimatedDuration}`);\nif (action.input.maintenanceType) details.push(`Type: ${action.input.maintenanceType}`);\nstate.suspensionDetails = details.length > 0 ? details.join(", ") : null;\nstate.suspensionReason = "Maintenance";',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "resume-after-payment",
              name: "RESUME_AFTER_PAYMENT",
              description: "Resumes after payment",
              schema:
                "input ResumeAfterPaymentInput {\n    resumedAt: DateTime!\n    paymentReference: String\n}",
              template: "Resumes after payment",
              reducer:
                'state.status = "ACTIVE";\nstate.resumedAt = action.input.resumedAt;\nstate.suspendedAt = null;\nstate.suspensionType = null;\nstate.suspensionReason = null;\nstate.suspensionDetails = null;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "resume-after-maintenance",
              name: "RESUME_AFTER_MAINTENANCE",
              description: "Resumes after maintenance",
              schema:
                "input ResumeAfterMaintenanceInput {\n    resumedAt: DateTime!\n}",
              template: "Resumes after maintenance",
              reducer:
                'state.status = "ACTIVE";\nstate.resumedAt = action.input.resumedAt;\nstate.suspendedAt = null;\nstate.suspensionType = null;\nstate.suspensionReason = null;\nstate.suspensionDetails = null;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "suspend-instance",
              name: "SUSPEND_INSTANCE",
              description: "Suspends the instance",
              schema:
                "input SuspendInstanceInput {\n    suspendedAt: DateTime!\n    reason: String\n}",
              template: "Suspends the instance",
              reducer:
                'state.status = "SUSPENDED";\nstate.suspendedAt = action.input.suspendedAt;\nstate.suspensionType = "OTHER";\nstate.suspensionReason = action.input.reason || null;\nstate.suspensionDetails = null;',
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "terminate-instance",
              name: "TERMINATE_INSTANCE",
              description: "Terminates the instance",
              schema:
                "input TerminateInstanceInput {\n    terminatedAt: DateTime!\n    reason: String!\n}",
              template: "Terminates the instance",
              reducer:
                'state.status = "TERMINATED";\nstate.terminatedAt = action.input.terminatedAt;\nstate.terminationReason = action.input.reason;',
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "configuration-management",
          name: "Configuration Management",
          description: "Operations for managing instance facet configuration",
          operations: [
            {
              id: "set-instance-facet",
              name: "SET_INSTANCE_FACET",
              description: "Sets an instance facet",
              schema:
                "input SetInstanceFacetInput {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOption: String!\n}",
              template: "Sets an instance facet",
              reducer:
                "const existingIndex = state.configuration.findIndex(f => f.categoryKey === action.input.categoryKey);\nconst facet = { id: action.input.id, categoryKey: action.input.categoryKey, categoryLabel: action.input.categoryLabel, selectedOption: action.input.selectedOption };\nif (existingIndex !== -1) { state.configuration[existingIndex] = facet; } else { state.configuration.push(facet); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "remove-instance-facet",
              name: "REMOVE_INSTANCE_FACET",
              description: "Removes an instance facet",
              schema:
                "input RemoveInstanceFacetInput {\n    categoryKey: String!\n}",
              template: "Removes an instance facet",
              reducer:
                "const facetIndex = state.configuration.findIndex(f => f.categoryKey === action.input.categoryKey);\nif (facetIndex !== -1) { state.configuration.splice(facetIndex, 1); }",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "update-instance-facet",
              name: "UPDATE_INSTANCE_FACET",
              description: "Updates an instance facet",
              schema:
                "input UpdateInstanceFacetInput {\n    categoryKey: String!\n    selectedOption: String\n    categoryLabel: String\n}",
              template: "Updates an instance facet",
              reducer:
                "const facet = state.configuration.find(f => f.categoryKey === action.input.categoryKey);\nif (facet) {\n    if (action.input.selectedOption) facet.selectedOption = action.input.selectedOption;\n    if (action.input.categoryLabel) facet.categoryLabel = action.input.categoryLabel;\n}",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "apply-configuration-changes",
              name: "APPLY_CONFIGURATION_CHANGES",
              description: "Applies batch configuration changes",
              schema:
                "input ApplyConfigurationChangesInput {\n    appliedAt: DateTime!\n    changeDescription: String\n    addFacets: [SetInstanceFacetInput!]\n    updateFacets: [UpdateInstanceFacetInput!]\n    removeFacetKeys: [String!]\n}",
              template: "Applies batch configuration changes",
              reducer:
                "if (action.input.addFacets) {\n    for (const facetInput of action.input.addFacets) {\n        const existingIndex = state.configuration.findIndex(f => f.categoryKey === facetInput.categoryKey);\n        const facet = { id: facetInput.id, categoryKey: facetInput.categoryKey, categoryLabel: facetInput.categoryLabel, selectedOption: facetInput.selectedOption };\n        if (existingIndex !== -1) { state.configuration[existingIndex] = facet; } else { state.configuration.push(facet); }\n    }\n}\nif (action.input.updateFacets) {\n    for (const update of action.input.updateFacets) {\n        const facet = state.configuration.find(f => f.categoryKey === update.categoryKey);\n        if (facet) {\n            if (update.selectedOption) facet.selectedOption = update.selectedOption;\n            if (update.categoryLabel) facet.categoryLabel = update.categoryLabel;\n        }\n    }\n}\nif (action.input.removeFacetKeys) {\n    for (const key of action.input.removeFacetKeys) {\n        const index = state.configuration.findIndex(f => f.categoryKey === key);\n        if (index !== -1) { state.configuration.splice(index, 1); }\n    }\n}",
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
