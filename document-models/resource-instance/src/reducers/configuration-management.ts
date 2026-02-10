import type { ResourceInstanceConfigurationManagementOperations } from "@powerhousedao/service-offering/document-models/resource-instance";

export const resourceInstanceConfigurationManagementOperations: ResourceInstanceConfigurationManagementOperations =
  {
    setInstanceFacetOperation(state, action) {
      const existingIndex = state.configuration.findIndex(
        (f) => f.categoryKey === action.input.categoryKey,
      );
      const facet = {
        id: action.input.id,
        categoryKey: action.input.categoryKey,
        categoryLabel: action.input.categoryLabel,
        selectedOption: action.input.selectedOption,
      };
      if (existingIndex !== -1) {
        state.configuration[existingIndex] = facet;
      } else {
        state.configuration.push(facet);
      }
    },
    removeInstanceFacetOperation(state, action) {
      const facetIndex = state.configuration.findIndex(
        (f) => f.categoryKey === action.input.categoryKey,
      );
      if (facetIndex !== -1) {
        state.configuration.splice(facetIndex, 1);
      }
    },
    updateInstanceFacetOperation(state, action) {
      const facet = state.configuration.find(
        (f) => f.categoryKey === action.input.categoryKey,
      );
      if (facet) {
        if (action.input.selectedOption)
          facet.selectedOption = action.input.selectedOption;
        if (action.input.categoryLabel)
          facet.categoryLabel = action.input.categoryLabel;
      }
    },
    applyConfigurationChangesOperation(state, action) {
      // Add new facets
      if (action.input.addFacets) {
        for (const facetInput of action.input.addFacets) {
          const existingIndex = state.configuration.findIndex(
            (f) => f.categoryKey === facetInput.categoryKey,
          );
          const facet = {
            id: facetInput.id,
            categoryKey: facetInput.categoryKey,
            categoryLabel: facetInput.categoryLabel,
            selectedOption: facetInput.selectedOption,
          };
          if (existingIndex !== -1) {
            state.configuration[existingIndex] = facet;
          } else {
            state.configuration.push(facet);
          }
        }
      }

      // Update existing facets
      if (action.input.updateFacets) {
        for (const update of action.input.updateFacets) {
          const facet = state.configuration.find(
            (f) => f.categoryKey === update.categoryKey,
          );
          if (facet) {
            if (update.selectedOption)
              facet.selectedOption = update.selectedOption;
            if (update.categoryLabel)
              facet.categoryLabel = update.categoryLabel;
          }
        }
      }

      // Remove facets by key
      if (action.input.removeFacetKeys) {
        for (const key of action.input.removeFacetKeys) {
          const index = state.configuration.findIndex(
            (f) => f.categoryKey === key,
          );
          if (index !== -1) {
            state.configuration.splice(index, 1);
          }
        }
      }
    },
  };
