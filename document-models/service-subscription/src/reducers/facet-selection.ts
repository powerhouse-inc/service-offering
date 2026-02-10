import type { ServiceSubscriptionFacetSelectionOperations } from "@powerhousedao/service-offering/document-models/service-subscription";

export const serviceSubscriptionFacetSelectionOperations: ServiceSubscriptionFacetSelectionOperations =
  {
    setFacetSelectionOperation(state, action) {
      const existingIndex = state.facetSelections.findIndex(
        (fs) => fs.categoryKey === action.input.categoryKey,
      );
      if (existingIndex !== -1) {
        state.facetSelections[existingIndex] = {
          id: action.input.id,
          categoryKey: action.input.categoryKey,
          selectedOptionId: action.input.selectedOptionId,
        };
      } else {
        state.facetSelections.push({
          id: action.input.id,
          categoryKey: action.input.categoryKey,
          selectedOptionId: action.input.selectedOptionId,
        });
      }
      state.lastModified = action.input.lastModified;
    },
    removeFacetSelectionOperation(state, action) {
      const selectionIndex = state.facetSelections.findIndex(
        (fs) => fs.categoryKey === action.input.categoryKey,
      );
      if (selectionIndex !== -1) {
        state.facetSelections.splice(selectionIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
  };
