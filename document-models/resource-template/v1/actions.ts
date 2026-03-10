import { baseActions } from "document-model";
import {
  templateManagementActions,
  audienceManagementActions,
  facetTargetingActions,
  serviceCategoryManagementActions,
  serviceManagementActions,
  optionGroupManagementActions,
  contentSectionManagementActions,
} from "./gen/creators.js";

/** Actions for the ResourceTemplate document model */

export const actions = {
  ...baseActions,
  ...templateManagementActions,
  ...audienceManagementActions,
  ...facetTargetingActions,
  ...serviceCategoryManagementActions,
  ...serviceManagementActions,
  ...optionGroupManagementActions,
  ...contentSectionManagementActions,
};
