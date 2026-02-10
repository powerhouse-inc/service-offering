import type { ResourceTemplateServiceCategoryManagementOperations } from "@powerhousedao/service-offering/document-models/resource-template";

export const resourceTemplateServiceCategoryManagementOperations: ResourceTemplateServiceCategoryManagementOperations =
  {
    setSetupServicesOperation(state, action) {
      state.setupServices = action.input.services;
      state.lastModified = action.input.lastModified;
    },
    setRecurringServicesOperation(state, action) {
      state.recurringServices = action.input.services;
      state.lastModified = action.input.lastModified;
    },
  };
