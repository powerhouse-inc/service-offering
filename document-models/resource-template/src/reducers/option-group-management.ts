import type { ResourceTemplateOptionGroupManagementOperations } from "@powerhousedao/service-offering/document-models/resource-template";

export const resourceTemplateOptionGroupManagementOperations: ResourceTemplateOptionGroupManagementOperations =
  {
    addOptionGroupOperation(state, action) {
      state.optionGroups.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        isAddOn: action.input.isAddOn,
        defaultSelected: action.input.defaultSelected,
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
        if (action.input.description !== undefined) {
          optionGroup.description = action.input.description || null;
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
      }
      state.lastModified = action.input.lastModified;
    },
    deleteOptionGroupOperation(state, action) {
      const optionGroupIndex = state.optionGroups.findIndex(
        (og) => og.id === action.input.id,
      );
      if (optionGroupIndex !== -1) {
        state.services.forEach((service) => {
          if (service.optionGroupId === action.input.id) {
            service.optionGroupId = null;
          }
        });
        state.optionGroups.splice(optionGroupIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    addFaqOperation(state, action) {
      if (!state.faqFields) {
        state.faqFields = [];
      }
      state.faqFields.push({
        id: action.input.id,
        question: action.input.question || null,
        answer: action.input.answer || null,
        displayOrder: action.input.displayOrder,
      });
    },
    updateFaqOperation(state, action) {
      if (!state.faqFields) return;
      const faqField = state.faqFields.find((f) => f.id === action.input.id);
      if (faqField) {
        if (action.input.question !== undefined) {
          faqField.question = action.input.question || null;
        }
        if (action.input.answer !== undefined) {
          faqField.answer = action.input.answer || null;
        }
      }
    },
    deleteFaqOperation(state, action) {
      if (!state.faqFields) return;
      const faqIndex = state.faqFields.findIndex(
        (f) => f.id === action.input.id,
      );
      if (faqIndex !== -1) {
        state.faqFields.splice(faqIndex, 1);
      }
    },
    reorderFaqsOperation(state, action) {
      action.input.faqIds.forEach((id, index) => {
        const faq = state.faqFields?.find((f) => f.id === id);
        if (faq) {
          faq.displayOrder = index;
        }
      });
      state.lastModified = action.input.lastModified;
    },
  };
