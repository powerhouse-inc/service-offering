import { baseActions } from "document-model";
import {
  instanceManagementActions,
  configurationManagementActions,
} from "./gen/creators.js";

/** Actions for the ResourceInstance document model */

export const actions = {
  ...baseActions,
  ...instanceManagementActions,
  ...configurationManagementActions,
};
