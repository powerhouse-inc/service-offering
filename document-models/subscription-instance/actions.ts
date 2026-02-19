import { baseActions } from "document-model";
import {
  subscriptionActions,
  serviceActions,
  serviceGroupActions,
  metricsActions,
  customerActions,
} from "./gen/creators.js";

/** Actions for the SubscriptionInstance document model */

export const actions = {
  ...baseActions,
  ...subscriptionActions,
  ...serviceActions,
  ...serviceGroupActions,
  ...metricsActions,
  ...customerActions,
};
