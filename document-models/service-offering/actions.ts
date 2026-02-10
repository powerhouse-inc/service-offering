import { baseActions } from "document-model";
import {
  serviceManagementActions,
  tierManagementActions,
  offeringManagementActions,
  optionGroupManagementActions,
  serviceGroupManagementActions,
} from "./gen/creators.js";

/** Actions for the ServiceOffering document model */

export const actions = {
  ...baseActions,
  ...serviceManagementActions,
  ...tierManagementActions,
  ...offeringManagementActions,
  ...optionGroupManagementActions,
  ...serviceGroupManagementActions,
};
