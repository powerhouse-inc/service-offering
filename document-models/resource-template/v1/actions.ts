import { baseActions } from "document-model";
import {
  resourceTemplateTemplateManagementActions,
  resourceTemplateAudienceManagementActions,
  resourceTemplateFacetTargetingActions,
  resourceTemplateServiceCategoryManagementActions,
  resourceTemplateServiceManagementActions,
  resourceTemplateOptionGroupManagementActions,
  resourceTemplateContentSectionManagementActions,
} from "./gen/creators.js";

/** Actions for the ResourceTemplate document model */

export const actions = {
  ...baseActions,
  ...resourceTemplateTemplateManagementActions,
  ...resourceTemplateAudienceManagementActions,
  ...resourceTemplateFacetTargetingActions,
  ...resourceTemplateServiceCategoryManagementActions,
  ...resourceTemplateServiceManagementActions,
  ...resourceTemplateOptionGroupManagementActions,
  ...resourceTemplateContentSectionManagementActions,
};
