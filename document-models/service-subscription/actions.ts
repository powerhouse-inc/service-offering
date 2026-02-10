import { baseActions } from "document-model";
import {
  subscriptionManagementActions,
  tierSelectionActions,
  addOnManagementActions,
  facetSelectionActions,
  billingProjectionActions,
} from "./gen/creators.js";

/** Actions for the ServiceSubscription document model */

export const actions = {
  ...baseActions,
  ...subscriptionManagementActions,
  ...tierSelectionActions,
  ...addOnManagementActions,
  ...facetSelectionActions,
  ...billingProjectionActions,
};
