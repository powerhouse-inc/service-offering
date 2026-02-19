import type { ServiceOfferingServiceManagementOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingServiceManagementOperations: ServiceOfferingServiceManagementOperations =
  {
    addServiceOperation(state, action) {
      state.services.push({
        id: action.input.id,
        title: action.input.title,
        description: action.input.description || null,
        serviceGroupId: action.input.serviceGroupId || null,
        displayOrder: action.input.displayOrder ?? null,
        isSetupFormation: action.input.isSetupFormation || false,
        optionGroupId: action.input.optionGroupId || null,
        facetBindings: [],
      });
      state.lastModified = action.input.lastModified;
    },
    updateServiceOperation(state, action) {
      const service = state.services.find((s) => s.id === action.input.id);
      if (service) {
        if (action.input.title) {
          service.title = action.input.title;
        }
        if (
          action.input.description !== undefined &&
          action.input.description !== null
        ) {
          service.description = action.input.description;
        }
        if (action.input.serviceGroupId !== undefined) {
          service.serviceGroupId = action.input.serviceGroupId || null;
        }
        if (
          action.input.displayOrder !== undefined &&
          action.input.displayOrder !== null
        ) {
          service.displayOrder = action.input.displayOrder;
        }
        if (
          action.input.isSetupFormation !== undefined &&
          action.input.isSetupFormation !== null
        ) {
          service.isSetupFormation = action.input.isSetupFormation;
        }
        if (action.input.optionGroupId !== undefined) {
          service.optionGroupId = action.input.optionGroupId || null;
        }
      }
      state.lastModified = action.input.lastModified;
    },
    deleteServiceOperation(state, action) {
      const serviceIndex = state.services.findIndex(
        (s) => s.id === action.input.id,
      );
      if (serviceIndex !== -1) {
        state.tiers.forEach((tier) => {
          tier.serviceLevels = tier.serviceLevels.filter(
            (sl) => sl.serviceId !== action.input.id,
          );
        });
        state.services.splice(serviceIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    addFacetBindingOperation(state, action) {
      const service = state.services.find(
        (s) => s.id === action.input.serviceId,
      );
      if (service) {
        service.facetBindings.push({
          id: action.input.bindingId,
          facetName: action.input.facetName,
          facetType: action.input.facetType,
          supportedOptions: action.input.supportedOptions,
        });
      }
      state.lastModified = action.input.lastModified;
    },
    removeFacetBindingOperation(state, action) {
      const service = state.services.find(
        (s) => s.id === action.input.serviceId,
      );
      if (service) {
        const bindingIndex = service.facetBindings.findIndex(
          (fb) => fb.id === action.input.bindingId,
        );
        if (bindingIndex !== -1) {
          service.facetBindings.splice(bindingIndex, 1);
        }
      }
      state.lastModified = action.input.lastModified;
    },
  };
