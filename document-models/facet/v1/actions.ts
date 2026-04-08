import { baseActions } from "document-model";
import {
  facetFacetManagementActions,
  facetOptionManagementActions,
} from "./gen/creators.js";

/** Actions for the Facet document model */

export const actions = {
  ...baseActions,
  ...facetFacetManagementActions,
  ...facetOptionManagementActions,
};
