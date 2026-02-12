import type { SubscriptionInstanceFacetOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceFacetOperations: SubscriptionInstanceFacetOperations =
  {
    setFacetSelectionOperation(state, action) {
      const { input } = action;
      const existingIndex = state.facetSelections.findIndex(
        (f) => f.categoryKey === input.categoryKey,
      );

      const facetSelection = {
        id: input.id,
        categoryKey: input.categoryKey,
        categoryLabel: input.categoryLabel,
        selectedOptions: input.selectedOptions,
      };

      if (existingIndex !== -1) {
        state.facetSelections[existingIndex] = facetSelection;
      } else {
        state.facetSelections.push(facetSelection);
      }
    },

    removeFacetSelectionOperation(state, action) {
      const index = state.facetSelections.findIndex(
        (f) => f.categoryKey === action.input.categoryKey,
      );
      if (index !== -1) {
        state.facetSelections.splice(index, 1);
      }
    },
  };
