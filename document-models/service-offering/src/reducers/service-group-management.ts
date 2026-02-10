import {
  DuplicateServiceGroupIdError,
  ServiceGroupNotFoundError,
  DeleteServiceGroupNotFoundError,
  ReorderServiceGroupNotFoundError,
} from "../../gen/service-group-management/error.js";
import type { ServiceOfferingServiceGroupManagementOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingServiceGroupManagementOperations: ServiceOfferingServiceGroupManagementOperations =
  {
    addServiceGroupOperation(state, action) {
      const existing = state.serviceGroups.find(
        (sg) => sg.id === action.input.id,
      );
      if (existing) {
        throw new DuplicateServiceGroupIdError(
          "A service group with this ID already exists",
        );
      }
      state.serviceGroups.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        billingCycle: action.input.billingCycle,
        displayOrder: action.input.displayOrder || null,
      });
      state.lastModified = action.input.lastModified;
    },
    updateServiceGroupOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.id,
      );
      if (!serviceGroup) {
        throw new ServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (action.input.name) {
        serviceGroup.name = action.input.name;
      }
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      ) {
        serviceGroup.description = action.input.description;
      }
      if (action.input.billingCycle) {
        serviceGroup.billingCycle = action.input.billingCycle;
      }
      if (
        action.input.displayOrder !== undefined &&
        action.input.displayOrder !== null
      ) {
        serviceGroup.displayOrder = action.input.displayOrder;
      }
      state.lastModified = action.input.lastModified;
    },
    deleteServiceGroupOperation(state, action) {
      const groupIndex = state.serviceGroups.findIndex(
        (sg) => sg.id === action.input.id,
      );
      if (groupIndex === -1) {
        throw new DeleteServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      state.services.forEach((service) => {
        if (service.serviceGroupId === action.input.id) {
          service.serviceGroupId = null;
        }
      });
      state.serviceGroups.splice(groupIndex, 1);
      state.lastModified = action.input.lastModified;
    },
    reorderServiceGroupsOperation(state, action) {
      const reordered = action.input.order.map((id, index) => {
        const group = state.serviceGroups.find((sg) => sg.id === id);
        if (!group) {
          throw new ReorderServiceGroupNotFoundError(
            "Service group with ID " + id + " not found during reorder",
          );
        }
        group.displayOrder = index;
        return group;
      });
      state.serviceGroups = reordered;
      state.lastModified = action.input.lastModified;
    },
  };
