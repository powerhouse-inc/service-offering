import type { ServiceOfferingOptionGroupManagementOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingOptionGroupManagementOperations: ServiceOfferingOptionGroupManagementOperations =
  {
    addOptionGroupOperation(state, action) {
      state.optionGroups.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        isAddOn: action.input.isAddOn,
        defaultSelected: action.input.defaultSelected,
        costType: action.input.costType || null,
        billingCycle: action.input.billingCycle || null,
        price: action.input.price || null,
        currency: action.input.currency || null,
      });
      state.lastModified = action.input.lastModified;
    },
    updateOptionGroupOperation(state, action) {
      const optionGroup = state.optionGroups.find(
        (og) => og.id === action.input.id,
      );
      if (optionGroup) {
        if (action.input.name) {
          optionGroup.name = action.input.name;
        }
        if (
          action.input.description !== undefined &&
          action.input.description !== null
        ) {
          optionGroup.description = action.input.description;
        }
        if (
          action.input.isAddOn !== undefined &&
          action.input.isAddOn !== null
        ) {
          optionGroup.isAddOn = action.input.isAddOn;
        }
        if (
          action.input.defaultSelected !== undefined &&
          action.input.defaultSelected !== null
        ) {
          optionGroup.defaultSelected = action.input.defaultSelected;
        }
        if (action.input.costType !== undefined) {
          optionGroup.costType = action.input.costType || null;
        }
        if (action.input.billingCycle !== undefined) {
          optionGroup.billingCycle = action.input.billingCycle || null;
        }
        if (action.input.price !== undefined) {
          optionGroup.price = action.input.price || null;
        }
        if (action.input.currency !== undefined) {
          optionGroup.currency = action.input.currency || null;
        }
      }
      state.lastModified = action.input.lastModified;
    },
    deleteOptionGroupOperation(state, action) {
      const optionGroupIndex = state.optionGroups.findIndex(
        (og) => og.id === action.input.id,
      );
      if (optionGroupIndex !== -1) {
        state.tiers.forEach((tier) => {
          tier.serviceLevels.forEach((sl) => {
            if (sl.optionGroupId === action.input.id) {
              sl.optionGroupId = null;
            }
          });
        });
        state.optionGroups.splice(optionGroupIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
  };
