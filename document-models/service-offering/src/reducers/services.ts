import {
  UpdateServiceNotFoundError,
  DeleteServiceNotFoundError,
} from "../../gen/services/error.js";
import type { ServiceOfferingServicesOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingServicesOperations: ServiceOfferingServicesOperations =
  {
    addServiceOperation(state, action) {
      state.services.push({
        id: action.input.id,
        title: action.input.title,
        description: action.input.description || null,
        serviceGroupId: action.input.serviceGroupId || null,
        displayOrder: action.input.displayOrder || null,
        isSetupFormation: action.input.isSetupFormation || false,
        optionGroupId: action.input.optionGroupId || null,
      });
      state.lastModified = action.input.lastModified;
    },
    updateServiceOperation(state, action) {
      const service = state.services.find((s) => s.id === action.input.id);
      if (!service) {
        throw new UpdateServiceNotFoundError(
          `Service with ID ${action.input.id} not found`,
        );
      }
      if (action.input.title) service.title = action.input.title;
      if (action.input.description !== undefined)
        service.description = action.input.description || null;
      if (action.input.serviceGroupId !== undefined)
        service.serviceGroupId = action.input.serviceGroupId || null;
      if (action.input.displayOrder !== undefined)
        service.displayOrder = action.input.displayOrder || null;
      if (
        action.input.isSetupFormation !== undefined &&
        action.input.isSetupFormation !== null
      )
        service.isSetupFormation = action.input.isSetupFormation;
      if (action.input.optionGroupId !== undefined)
        service.optionGroupId = action.input.optionGroupId || null;
      state.lastModified = action.input.lastModified;
    },
    deleteServiceOperation(state, action) {
      const index = state.services.findIndex((s) => s.id === action.input.id);
      if (index === -1) {
        throw new DeleteServiceNotFoundError(
          `Service with ID ${action.input.id} not found`,
        );
      }
      state.services.splice(index, 1);
      state.lastModified = action.input.lastModified;
    },
    addFacetBindingOperation(state, action) {
      // facetBindings now live at state level, not per-service
      // serviceId is kept in input for backward compatibility but not used for lookup
      state.facetBindings.push({
        id: action.input.bindingId,
        facetName: action.input.facetName,
        facetType: action.input.facetType,
        supportedOptions: action.input.supportedOptions,
      });
      state.lastModified = action.input.lastModified;
    },
    removeFacetBindingOperation(state, action) {
      const bindingIndex = state.facetBindings.findIndex(
        (fb) => fb.id === action.input.bindingId,
      );
      if (bindingIndex !== -1) {
        state.facetBindings.splice(bindingIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
  };
