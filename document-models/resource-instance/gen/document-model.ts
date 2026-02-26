import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  description:
    "Document model for an instantiated resource. Represents a customer's configured resource instance based on template and facet selections.",
  extension: "",
  id: "powerhouse/resource-instance",
  name: "ResourceInstance",
  specifications: [
    {
      changeLog: [],
      modules: [
        {
          description: "Operations for managing resource instance lifecycle",
          id: "instance-management",
          name: "Instance Management",
          operations: [
            {
              description: "Initializes a new resource instance",
              errors: [],
              examples: [],
              id: "initialize-instance",
              name: "INITIALIZE_INSTANCE",
              reducer:
                'state.operatorProfile = {\n    id: action.input.operatorId,\n    documentType: action.input.operatorDocumentType\n};\nstate.resourceTemplateId = action.input.resourceTemplateId || null;\nstate.customerId = action.input.customerId || null;\nstate.customerName = action.input.customerName || null;\nstate.templateName = action.input.templateName || null;\nstate.operatorName = action.input.operatorName || null;\nstate.name = action.input.name || null;\nstate.thumbnailUrl = action.input.thumbnailUrl || null;\nstate.infoLink = action.input.infoLink || null;\nstate.description = action.input.description || null;\nstate.status = "DRAFT";',
              schema:
                "input InitializeInstanceInput {\n    operatorId: PHID!\n    operatorDocumentType: String!\n    resourceTemplateId: PHID\n    customerId: PHID\n    customerName: String\n    templateName: String\n    operatorName: String\n    thumbnailUrl: URL\n    infoLink: URL\n    description: String\n}",
              scope: "global",
              template: "Initializes a new resource instance",
            },
            {
              description: "Updates instance information fields",
              errors: [],
              examples: [],
              id: "update-instance-info",
              name: "UPDATE_INSTANCE_INFO",
              reducer:
                "if (action.input.name) state.name = action.input.name;\nif (action.input.thumbnailUrl) state.thumbnailUrl = action.input.thumbnailUrl;\nif (action.input.infoLink) state.infoLink = action.input.infoLink;\nif (action.input.description) state.description = action.input.description;",
              schema:
                "input UpdateInstanceInfoInput {\n    name: String\n    thumbnailUrl: URL\n    infoLink: URL\n    description: String\n}",
              scope: "global",
              template: "Updates instance information fields",
            },
            {
              description:
                "Sets the operator profile reference for this resource instance",
              errors: [],
              examples: [],
              id: "set-resource-profile",
              name: "SET_OPERATOR_PROFILE",
              reducer:
                "state.operatorProfile = {\n    id: action.input.operatorId,\n    documentType: action.input.operatorDocumentType\n};",
              schema:
                "input SetOperatorProfileInput {\n    operatorId: PHID!\n    operatorName: String\n}",
              scope: "global",
              template: "Sets the resource profile reference",
            },
            {
              description: "Updates the instance status",
              errors: [],
              examples: [],
              id: "update-instance-status",
              name: "UPDATE_INSTANCE_STATUS",
              reducer: "state.status = action.input.status;",
              schema:
                "input UpdateInstanceStatusInput {\n    status: InstanceStatus!\n}",
              scope: "global",
              template: "Updates the instance status",
            },
            {
              description:
                "Confirms the instance configuration and moves to provisioning",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION",
                  description: "Can only confirm instances in DRAFT status",
                  id: "invalid-status-transition-error",
                  name: "InvalidStatusTransitionError",
                  template: "",
                },
              ],
              examples: [],
              id: "confirm-instance",
              name: "CONFIRM_INSTANCE",
              reducer:
                'if (state.status !== "DRAFT") {\n    throw new InvalidStatusTransitionError("Can only confirm instances in DRAFT status");\n}\nstate.status = "PROVISIONING";\nstate.confirmedAt = action.input.confirmedAt;',
              schema:
                "input ConfirmInstanceInput {\n    confirmedAt: DateTime!\n}",
              scope: "global",
              template:
                "Confirms the instance configuration and moves to provisioning",
            },
            {
              description: "Reports that provisioning has started",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_REPORT_PROVISIONING_STARTED",
                  description:
                    "Can only report provisioning started for instances in PROVISIONING status",
                  id: "invalid-status-report-prov-started",
                  name: "InvalidStatusTransitionReportProvisioningStartedError",
                  template: "",
                },
              ],
              examples: [],
              id: "report-provisioning-started",
              name: "REPORT_PROVISIONING_STARTED",
              reducer:
                'if (state.status !== "PROVISIONING") {\n    throw new InvalidStatusTransitionReportProvisioningStartedError("Can only report provisioning started for instances in PROVISIONING status");\n}\nstate.provisioningStartedAt = action.input.startedAt;',
              schema:
                "input ReportProvisioningStartedInput {\n    startedAt: DateTime!\n}",
              scope: "global",
              template: "Reports that provisioning has started",
            },
            {
              description:
                "Reports that provisioning has completed successfully",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_REPORT_PROVISIONING_COMPLETED",
                  description:
                    "Can only report provisioning completed for instances in PROVISIONING status",
                  id: "invalid-status-report-prov-completed",
                  name: "InvalidStatusTransitionReportProvisioningCompletedError",
                  template: "",
                },
              ],
              examples: [],
              id: "report-provisioning-completed",
              name: "REPORT_PROVISIONING_COMPLETED",
              reducer:
                'if (state.status !== "PROVISIONING") {\n    throw new InvalidStatusTransitionReportProvisioningCompletedError("Can only report provisioning completed for instances in PROVISIONING status");\n}\nstate.provisioningCompletedAt = action.input.completedAt;',
              schema:
                "input ReportProvisioningCompletedInput {\n    completedAt: DateTime!\n}",
              scope: "global",
              template: "Reports that provisioning has completed successfully",
            },
            {
              description: "Reports that provisioning has failed",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_REPORT_PROVISIONING_FAILED",
                  description:
                    "Can only report provisioning failed for instances in PROVISIONING status",
                  id: "invalid-status-report-prov-failed",
                  name: "InvalidStatusTransitionReportProvisioningFailedError",
                  template: "",
                },
              ],
              examples: [],
              id: "report-provisioning-failed",
              name: "REPORT_PROVISIONING_FAILED",
              reducer:
                'if (state.status !== "PROVISIONING") {\n    throw new InvalidStatusTransitionReportProvisioningFailedError("Can only report provisioning failed for instances in PROVISIONING status");\n}\nstate.provisioningFailureReason = action.input.failureReason;\nstate.status = "DRAFT";',
              schema:
                "input ReportProvisioningFailedInput {\n    failedAt: DateTime!\n    failureReason: String!\n}",
              scope: "global",
              template: "Reports that provisioning has failed",
            },
            {
              description: "Marks the instance as active/ready",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_ACTIVATE_INSTANCE",
                  description:
                    "Can only activate instances in PROVISIONING status",
                  id: "invalid-status-activate",
                  name: "InvalidStatusTransitionActivateInstanceError",
                  template: "",
                },
                {
                  code: "PROVISIONING_NOT_COMPLETED",
                  description:
                    "Must report provisioning completed before activating",
                  id: "provisioning-not-completed",
                  name: "ProvisioningNotCompletedError",
                  template: "",
                },
              ],
              examples: [],
              id: "activate-instance",
              name: "ACTIVATE_INSTANCE",
              reducer:
                'if (state.status !== "PROVISIONING") {\n    throw new InvalidStatusTransitionActivateInstanceError("Can only activate instances in PROVISIONING status");\n}\nif (!state.provisioningCompletedAt) {\n    throw new ProvisioningNotCompletedError("Must report provisioning completed before activating");\n}\nstate.status = "ACTIVE";\nstate.activatedAt = action.input.activatedAt;',
              schema:
                "input ActivateInstanceInput {\n    activatedAt: DateTime!\n}",
              scope: "global",
              template: "Marks the instance as active/ready",
            },
            {
              description: "Suspends an active instance due to non-payment",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_SUSPEND_FOR_NON_PAYMENT",
                  description: "Can only suspend ACTIVE instances",
                  id: "invalid-status-suspend-nonpay",
                  name: "InvalidStatusTransitionSuspendForNonPaymentError",
                  template: "",
                },
              ],
              examples: [],
              id: "suspend-for-non-payment",
              name: "SUSPEND_FOR_NON_PAYMENT",
              reducer:
                'if (state.status !== "ACTIVE") {\n    throw new InvalidStatusTransitionSuspendForNonPaymentError("Can only suspend ACTIVE instances");\n}\nstate.status = "SUSPENDED";\nstate.suspendedAt = action.input.suspendedAt;\nstate.suspensionType = "NON_PAYMENT";\nstate.suspensionReason = "Non-payment";\nconst details = [];\nif (action.input.outstandingAmount) {\n    details.push(`Outstanding: ${action.input.outstandingAmount}`);\n}\nif (action.input.daysPastDue) {\n    details.push(`Days past due: ${action.input.daysPastDue}`);\n}\nstate.suspensionDetails = details.join(", ") || null;',
              schema:
                "input SuspendForNonPaymentInput {\n    suspendedAt: DateTime!\n    outstandingAmount: Amount_Money\n    daysPastDue: Int\n}",
              scope: "global",
              template: "Suspends an active instance due to non-payment",
            },
            {
              description: "Suspends an active instance for maintenance",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_SUSPEND_FOR_MAINTENANCE",
                  description: "Can only suspend ACTIVE instances",
                  id: "invalid-status-suspend-maintenance",
                  name: "InvalidStatusTransitionSuspendForMaintenanceError",
                  template: "",
                },
              ],
              examples: [],
              id: "suspend-for-maintenance",
              name: "SUSPEND_FOR_MAINTENANCE",
              reducer:
                'if (state.status !== "ACTIVE") {\n    throw new InvalidStatusTransitionSuspendForMaintenanceError("Can only suspend ACTIVE instances");\n}\nstate.status = "SUSPENDED";\nstate.suspendedAt = action.input.suspendedAt;\nstate.suspensionType = "MAINTENANCE";\nstate.suspensionReason = "Scheduled maintenance";\nconst details = [];\nif (action.input.maintenanceType) {\n    details.push(`Type: ${action.input.maintenanceType}`);\n}\nif (action.input.estimatedDuration) {\n    details.push(`Duration: ${action.input.estimatedDuration}`);\n}\nstate.suspensionDetails = details.join(", ") || null;',
              schema:
                "input SuspendForMaintenanceInput {\n    suspendedAt: DateTime!\n    estimatedDuration: String\n    maintenanceType: String\n}",
              scope: "global",
              template: "Suspends an active instance for maintenance",
            },
            {
              description:
                "Resumes a suspended instance after payment received",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_RESUME_AFTER_PAYMENT",
                  description: "Can only resume SUSPENDED instances",
                  id: "invalid-status-resume-payment",
                  name: "InvalidStatusTransitionResumeAfterPaymentError",
                  template: "",
                },
                {
                  code: "INVALID_SUSPENSION_TYPE",
                  description:
                    "This operation is for NON_PAYMENT suspensions only",
                  id: "invalid-suspension-type",
                  name: "InvalidSuspensionTypeError",
                  template: "",
                },
              ],
              examples: [],
              id: "resume-after-payment",
              name: "RESUME_AFTER_PAYMENT",
              reducer:
                'if (state.status !== "SUSPENDED") {\n    throw new InvalidStatusTransitionResumeAfterPaymentError("Can only resume SUSPENDED instances");\n}\nif (state.suspensionType !== "NON_PAYMENT") {\n    throw new InvalidSuspensionTypeError("This operation is for NON_PAYMENT suspensions only");\n}\nstate.status = "ACTIVE";\nstate.resumedAt = action.input.resumedAt;',
              schema:
                "input ResumeAfterPaymentInput {\n    resumedAt: DateTime!\n    paymentReference: String\n}",
              scope: "global",
              template: "Resumes a suspended instance after payment received",
            },
            {
              description:
                "Resumes a suspended instance after maintenance completed",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_RESUME_AFTER_MAINTENANCE",
                  description: "Can only resume SUSPENDED instances",
                  id: "invalid-status-resume-maintenance",
                  name: "InvalidStatusTransitionResumeAfterMaintenanceError",
                  template: "",
                },
                {
                  code: "INVALID_SUSPENSION_TYPE_RESUME_AFTER_MAINTENANCE",
                  description:
                    "This operation is for MAINTENANCE suspensions only",
                  id: "invalid-suspension-type-maintenance",
                  name: "InvalidSuspensionTypeResumeAfterMaintenanceError",
                  template: "",
                },
              ],
              examples: [],
              id: "resume-after-maintenance",
              name: "RESUME_AFTER_MAINTENANCE",
              reducer:
                'if (state.status !== "SUSPENDED") {\n    throw new InvalidStatusTransitionResumeAfterMaintenanceError("Can only resume SUSPENDED instances");\n}\nif (state.suspensionType !== "MAINTENANCE") {\n    throw new InvalidSuspensionTypeResumeAfterMaintenanceError("This operation is for MAINTENANCE suspensions only");\n}\nstate.status = "ACTIVE";\nstate.resumedAt = action.input.resumedAt;',
              schema:
                "input ResumeAfterMaintenanceInput {\n    resumedAt: DateTime!\n}",
              scope: "global",
              template:
                "Resumes a suspended instance after maintenance completed",
            },
            {
              description:
                "Suspends the resource instance (deprecated - use specific suspension operations)",
              errors: [
                {
                  code: "INVALID_STATUS_TRANSITION_SUSPEND_INSTANCE",
                  description: "Can only suspend ACTIVE instances",
                  id: "invalid-status-suspend-instance",
                  name: "InvalidStatusTransitionSuspendInstanceError",
                  template: "",
                },
              ],
              examples: [],
              id: "suspend-instance",
              name: "SUSPEND_INSTANCE",
              reducer:
                'if (state.status !== "ACTIVE") {\n    throw new InvalidStatusTransitionSuspendInstanceError("Can only suspend ACTIVE instances");\n}\nstate.status = "SUSPENDED";\nstate.suspendedAt = action.input.suspendedAt;\nstate.suspensionType = "OTHER";\nstate.suspensionReason = action.input.reason || null;',
              schema:
                "input SuspendInstanceInput {\n    suspendedAt: DateTime!\n    reason: String\n}",
              scope: "global",
              template:
                "Suspends the resource instance (deprecated - use specific suspension operations)",
            },
            {
              description: "Terminates the resource instance (not reversible)",
              errors: [
                {
                  code: "ALREADY_TERMINATED",
                  description:
                    "Instance is already terminated and cannot be terminated again",
                  id: "already-terminated",
                  name: "AlreadyTerminatedError",
                  template: "",
                },
              ],
              examples: [],
              id: "terminate-instance",
              name: "TERMINATE_INSTANCE",
              reducer:
                'if (state.status === "TERMINATED") {\n    throw new AlreadyTerminatedError("Instance is already terminated and cannot be terminated again");\n}\nstate.status = "TERMINATED";\nstate.terminatedAt = action.input.terminatedAt;\nstate.terminationReason = action.input.reason;',
              schema:
                "input TerminateInstanceInput {\n    terminatedAt: DateTime!\n    reason: String!\n}",
              scope: "global",
              template: "Terminates the resource instance (not reversible)",
            },
          ],
        },
        {
          description: "Operations for managing instance facet configuration",
          id: "configuration-management",
          name: "Configuration Management",
          operations: [
            {
              description: "Sets a facet selection for the instance",
              errors: [
                {
                  code: "CONFIGURATION_LOCKED",
                  description:
                    "Cannot modify configuration while instance is ACTIVE",
                  id: "config-locked",
                  name: "ConfigurationLockedError",
                  template: "",
                },
              ],
              examples: [],
              id: "set-instance-facet",
              name: "SET_INSTANCE_FACET",
              reducer:
                'if (state.status === "ACTIVE") {\n    throw new ConfigurationLockedError("Cannot modify configuration while instance is ACTIVE");\n}\nconst existingIndex = state.configuration.findIndex(c => c.categoryKey === action.input.categoryKey);\nif (existingIndex !== -1) {\n    state.configuration[existingIndex] = {\n        id: action.input.id,\n        categoryKey: action.input.categoryKey,\n        categoryLabel: action.input.categoryLabel,\n        selectedOption: action.input.selectedOption\n    };\n} else {\n    state.configuration.push({\n        id: action.input.id,\n        categoryKey: action.input.categoryKey,\n        categoryLabel: action.input.categoryLabel,\n        selectedOption: action.input.selectedOption\n    });\n}',
              schema:
                "input SetInstanceFacetInput {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOption: String!\n}",
              scope: "global",
              template: "Sets a facet selection for the instance",
            },
            {
              description: "Removes a facet selection from the instance",
              errors: [
                {
                  code: "CONFIGURATION_LOCKED_REMOVE_INSTANCE_FACET",
                  description:
                    "Cannot modify configuration while instance is ACTIVE",
                  id: "config-locked-remove",
                  name: "ConfigurationLockedRemoveInstanceFacetError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-instance-facet",
              name: "REMOVE_INSTANCE_FACET",
              reducer:
                'if (state.status === "ACTIVE") {\n    throw new ConfigurationLockedRemoveInstanceFacetError("Cannot modify configuration while instance is ACTIVE");\n}\nconst facetIndex = state.configuration.findIndex(c => c.categoryKey === action.input.categoryKey);\nif (facetIndex !== -1) {\n    state.configuration.splice(facetIndex, 1);\n}',
              schema:
                "input RemoveInstanceFacetInput {\n    categoryKey: String!\n}",
              scope: "global",
              template: "Removes a facet selection from the instance",
            },
            {
              description: "Updates an existing facet selection",
              errors: [
                {
                  code: "CONFIGURATION_LOCKED_UPDATE_INSTANCE_FACET",
                  description:
                    "Cannot modify configuration while instance is ACTIVE",
                  id: "config-locked-update",
                  name: "ConfigurationLockedUpdateInstanceFacetError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-instance-facet",
              name: "UPDATE_INSTANCE_FACET",
              reducer:
                'if (state.status === "ACTIVE") {\n    throw new ConfigurationLockedUpdateInstanceFacetError("Cannot modify configuration while instance is ACTIVE");\n}\nconst facetIndex = state.configuration.findIndex(c => c.categoryKey === action.input.categoryKey);\nif (facetIndex !== -1) {\n    if (action.input.selectedOption) {\n        state.configuration[facetIndex].selectedOption = action.input.selectedOption;\n    }\n    if (action.input.categoryLabel) {\n        state.configuration[facetIndex].categoryLabel = action.input.categoryLabel;\n    }\n}',
              schema:
                "input UpdateInstanceFacetInput {\n    categoryKey: String!\n    selectedOption: String\n    categoryLabel: String\n}",
              scope: "global",
              template: "Updates an existing facet selection",
            },
            {
              description:
                "Applies multiple configuration changes in one operation",
              errors: [
                {
                  code: "CONFIGURATION_LOCKED_APPLY_CONFIGURATION_CHANGES",
                  description:
                    "Cannot modify configuration while instance is ACTIVE. Suspend the instance first.",
                  id: "config-locked-apply",
                  name: "ConfigurationLockedApplyConfigurationChangesError",
                  template: "",
                },
              ],
              examples: [],
              id: "apply-configuration-changes",
              name: "APPLY_CONFIGURATION_CHANGES",
              reducer:
                'if (state.status === "ACTIVE") {\n    throw new ConfigurationLockedApplyConfigurationChangesError("Cannot modify configuration while instance is ACTIVE. Suspend the instance first.");\n}\naction.input.removeFacetKeys?.forEach(categoryKey => {\n    const index = state.configuration.findIndex(f => f.categoryKey === categoryKey);\n    if (index !== -1) state.configuration.splice(index, 1);\n});\naction.input.updateFacets?.forEach(update => {\n    const facet = state.configuration.find(f => f.categoryKey === update.categoryKey);\n    if (facet) {\n        if (update.selectedOption) facet.selectedOption = update.selectedOption;\n        if (update.categoryLabel) facet.categoryLabel = update.categoryLabel;\n    }\n});\naction.input.addFacets?.forEach(newFacet => {\n    state.configuration.push({\n        id: newFacet.id,\n        categoryKey: newFacet.categoryKey,\n        categoryLabel: newFacet.categoryLabel,\n        selectedOption: newFacet.selectedOption\n    });\n});',
              schema:
                "input ApplyConfigurationChangesInput {\n    appliedAt: DateTime!\n    changeDescription: String\n    addFacets: [SetInstanceFacetInput!]\n    updateFacets: [UpdateInstanceFacetInput!]\n    removeFacetKeys: [String!]\n}",
              scope: "global",
              template:
                "Applies multiple configuration changes in one operation",
            },
          ],
        },
      ],
      state: {
        global: {
          examples: [],
          initialValue:
            '{\n  "resourceTemplateId": null,\n  "customerId": null,\n  "customerName": null,\n  "templateName": null,\n  "thumbnailUrl": null,\n  "infoLink": null,\n  "description": null,\n  "operatorProfile": null,\n  "status": "DRAFT",\n  "configuration": [],\n  "confirmedAt": null,\n  "provisioningStartedAt": null,\n  "provisioningCompletedAt": null,\n  "provisioningFailureReason": null,\n  "activatedAt": null,\n  "suspendedAt": null,\n  "suspensionType": null,\n  "suspensionReason": null,\n  "suspensionDetails": null,\n  "resumedAt": null,\n  "terminatedAt": null,\n  "terminationReason": null\n}',
          schema:
            "type ResourceInstanceState {\n    resourceTemplateId: PHID\n    customerId: PHID\n    customerName: String\n    templateName: String\n    thumbnailUrl: URL\n    infoLink: URL\n    description: String\n    operatorProfile: OperatorProfile\n    status: InstanceStatus!\n    configuration: [InstanceFacet!]!\n    confirmedAt: DateTime\n    provisioningStartedAt: DateTime\n    provisioningCompletedAt: DateTime\n    provisioningFailureReason: String\n    activatedAt: DateTime\n    suspendedAt: DateTime\n    suspensionType: SuspensionType\n    suspensionReason: String\n    suspensionDetails: String\n    resumedAt: DateTime\n    terminatedAt: DateTime\n    terminationReason: String\n}\n\ntype OperatorProfile {\n    id: PHID!\n    operatorName: String\n}\n\nenum InstanceStatus {\n    DRAFT\n    PROVISIONING\n    ACTIVE\n    SUSPENDED\n    TERMINATED\n}\n\nenum SuspensionType {\n    NON_PAYMENT\n    MAINTENANCE\n    OTHER\n}\n\ntype InstanceFacet {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOption: String!\n}",
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
