import { baseActions } from "document-model";
import {
  facetManagementActions,
  optionManagementActions,
} from "./gen/creators.js";

/** Actions for the Facet document model */

export const actions = {
  ...baseActions,
  ...facetManagementActions,
  ...optionManagementActions,
};
