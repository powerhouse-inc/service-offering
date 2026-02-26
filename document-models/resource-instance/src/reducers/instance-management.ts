import type { ResourceInstanceInstanceManagementOperations } from "@powerhousedao/service-offering/document-models/resource-instance";

export const resourceInstanceInstanceManagementOperations: ResourceInstanceInstanceManagementOperations =
  {
    initializeInstanceOperation(state, action) {
      state.operatorProfile = {
        id: action.input.operatorId,
        operatorName: action.input.operatorName || null,
      };
      state.resourceTemplateId = action.input.resourceTemplateId || null;
      state.customerId = action.input.customerId || null;
      state.customerName = action.input.customerName || null;
      state.templateName = action.input.templateName || null;
      state.thumbnailUrl = action.input.thumbnailUrl || null;
      state.infoLink = action.input.infoLink || null;
      state.description = action.input.description || null;
      state.status = "DRAFT";
    },
    updateInstanceInfoOperation(state, action) {
      if (action.input.thumbnailUrl)
        state.thumbnailUrl = action.input.thumbnailUrl;
      if (action.input.infoLink) state.infoLink = action.input.infoLink;
      if (action.input.description)
        state.description = action.input.description;
    },
    setOperatorProfileOperation(state, action) {
      state.operatorProfile = {
        id: action.input.operatorId,
        operatorName: action.input.operatorName || null,
      };
    },
    updateInstanceStatusOperation(state, action) {
      state.status = action.input.status;
    },
    confirmInstanceOperation(state, action) {
      state.confirmedAt = action.input.confirmedAt;
    },
    reportProvisioningStartedOperation(state, action) {
      state.status = "PROVISIONING";
      state.provisioningStartedAt = action.input.startedAt;
    },
    reportProvisioningCompletedOperation(state, action) {
      state.provisioningCompletedAt = action.input.completedAt;
    },
    reportProvisioningFailedOperation(state, action) {
      state.provisioningFailureReason = action.input.failureReason;
    },
    activateInstanceOperation(state, action) {
      state.status = "ACTIVE";
      state.activatedAt = action.input.activatedAt;
    },
    suspendForNonPaymentOperation(state, action) {
      state.status = "SUSPENDED";
      state.suspendedAt = action.input.suspendedAt;
      state.suspensionType = "NON_PAYMENT";
      const details: string[] = [];
      if (
        action.input.outstandingAmount !== undefined &&
        action.input.outstandingAmount !== null
      ) {
        details.push(`Outstanding: ${action.input.outstandingAmount}`);
      }
      if (
        action.input.daysPastDue !== undefined &&
        action.input.daysPastDue !== null
      ) {
        details.push(`Days past due: ${action.input.daysPastDue}`);
      }
      state.suspensionDetails = details.length > 0 ? details.join(", ") : null;
      state.suspensionReason = "Non-payment";
    },
    suspendForMaintenanceOperation(state, action) {
      state.status = "SUSPENDED";
      state.suspendedAt = action.input.suspendedAt;
      state.suspensionType = "MAINTENANCE";
      const details: string[] = [];
      if (action.input.estimatedDuration) {
        details.push(`Duration: ${action.input.estimatedDuration}`);
      }
      if (action.input.maintenanceType) {
        details.push(`Type: ${action.input.maintenanceType}`);
      }
      state.suspensionDetails = details.length > 0 ? details.join(", ") : null;
      state.suspensionReason = "Maintenance";
    },
    resumeAfterPaymentOperation(state, action) {
      state.status = "ACTIVE";
      state.resumedAt = action.input.resumedAt;
      state.suspendedAt = null;
      state.suspensionType = null;
      state.suspensionReason = null;
      state.suspensionDetails = null;
    },
    resumeAfterMaintenanceOperation(state, action) {
      state.status = "ACTIVE";
      state.resumedAt = action.input.resumedAt;
      state.suspendedAt = null;
      state.suspensionType = null;
      state.suspensionReason = null;
      state.suspensionDetails = null;
    },
    suspendInstanceOperation(state, action) {
      state.status = "SUSPENDED";
      state.suspendedAt = action.input.suspendedAt;
      state.suspensionType = "OTHER";
      state.suspensionReason = action.input.reason || null;
      state.suspensionDetails = null;
    },
    terminateInstanceOperation(state, action) {
      state.status = "TERMINATED";
      state.terminatedAt = action.input.terminatedAt;
      state.terminationReason = action.input.reason;
    },
  };
