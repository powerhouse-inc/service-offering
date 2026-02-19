import { baseActions } from "document-model";
import {
  offeringActions,
  servicesActions,
  tiersActions,
  optionGroupsActions,
  serviceGroupsActions,
  configurationActions,
} from "./gen/creators.js";

/** Actions for the ServiceOffering document model */

export const actions = {
  ...baseActions,
  ...offeringActions,
  ...servicesActions,
  ...tiersActions,
  ...optionGroupsActions,
  ...serviceGroupsActions,
  ...configurationActions,
};
