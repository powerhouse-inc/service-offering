import {
  TemplateAlreadySelectedError,
  NoTemplateSelectedError,
  TemplateMismatchError,
} from "../../gen/offering-management/error.js";
import type { ServiceOfferingOfferingManagementOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingOfferingManagementOperations: ServiceOfferingOfferingManagementOperations =
  {
    updateOfferingInfoOperation(state, action) {
      if (action.input.title) {
        state.title = action.input.title;
      }
      if (action.input.summary) {
        state.summary = action.input.summary;
      }
      if (action.input.description !== undefined) {
        state.description = action.input.description || null;
      }
      if (action.input.thumbnailUrl !== undefined) {
        state.thumbnailUrl = action.input.thumbnailUrl || null;
      }
      if (action.input.infoLink !== undefined) {
        state.infoLink = action.input.infoLink || null;
      }
      state.lastModified = action.input.lastModified;
    },
    updateOfferingStatusOperation(state, action) {
      state.status = action.input.status;
      state.lastModified = action.input.lastModified;
    },
    setOperatorOperation(state, action) {
      state.operatorId = action.input.operatorId;
      state.lastModified = action.input.lastModified;
    },
    setOfferingIdOperation(state, action) {
      state.id = action.input.id;
      state.lastModified = action.input.lastModified;
    },
    addTargetAudienceOperation(state, action) {
      state.targetAudiences.push({
        id: action.input.id,
        label: action.input.label,
        color: action.input.color || null,
      });
      state.lastModified = action.input.lastModified;
    },
    removeTargetAudienceOperation(state, action) {
      const audienceIndex = state.targetAudiences.findIndex(
        (a) => a.id === action.input.id,
      );
      if (audienceIndex !== -1) {
        state.targetAudiences.splice(audienceIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    setFacetTargetOperation(state, action) {
      const existingIndex = state.facetTargets.findIndex(
        (ft) => ft.categoryKey === action.input.categoryKey,
      );
      if (existingIndex !== -1) {
        state.facetTargets[existingIndex] = {
          id: action.input.id,
          categoryKey: action.input.categoryKey,
          categoryLabel: action.input.categoryLabel,
          selectedOptions: action.input.selectedOptions,
        };
      } else {
        state.facetTargets.push({
          id: action.input.id,
          categoryKey: action.input.categoryKey,
          categoryLabel: action.input.categoryLabel,
          selectedOptions: action.input.selectedOptions,
        });
      }
      state.lastModified = action.input.lastModified;
    },
    removeFacetTargetOperation(state, action) {
      const targetIndex = state.facetTargets.findIndex(
        (ft) => ft.categoryKey === action.input.categoryKey,
      );
      if (targetIndex !== -1) {
        state.facetTargets.splice(targetIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    addFacetOptionOperation(state, action) {
      const facetTarget = state.facetTargets.find(
        (ft) => ft.categoryKey === action.input.categoryKey,
      );
      if (
        facetTarget &&
        !facetTarget.selectedOptions.includes(action.input.optionId)
      ) {
        facetTarget.selectedOptions.push(action.input.optionId);
      }
      state.lastModified = action.input.lastModified;
    },
    removeFacetOptionOperation(state, action) {
      const facetTarget = state.facetTargets.find(
        (ft) => ft.categoryKey === action.input.categoryKey,
      );

      if (facetTarget) {
        const optionIndex = facetTarget.selectedOptions.indexOf(
          action.input.optionId,
        );
        if (optionIndex !== -1) {
          facetTarget.selectedOptions.splice(optionIndex, 1);
        }
      }
      state.lastModified = action.input.lastModified;
    },
    selectResourceTemplateOperation(state, action) {
      if (state.resourceTemplateId) {
        throw new TemplateAlreadySelectedError(
          "A resource template has already been selected. Use CHANGE_RESOURCE_TEMPLATE to change it.",
        );
      }
      state.resourceTemplateId = action.input.resourceTemplateId;
      state.lastModified = action.input.lastModified;
    },
    changeResourceTemplateOperation(state, action) {
      if (!state.resourceTemplateId) {
        throw new NoTemplateSelectedError(
          "No resource template has been selected yet. Use SELECT_RESOURCE_TEMPLATE first.",
        );
      }
      if (state.resourceTemplateId !== action.input.previousTemplateId) {
        throw new TemplateMismatchError(
          "The previous template ID does not match the currently selected template.",
        );
      }
      state.resourceTemplateId = action.input.newTemplateId;
      state.lastModified = action.input.lastModified;
    },
  };
