import type { SubscriptionInstanceSubscriptionAction } from "./subscription/actions.js";
import type { SubscriptionInstanceServiceAction } from "./service/actions.js";
import type { SubscriptionInstanceServiceGroupAction } from "./service-group/actions.js";
import type { SubscriptionInstanceMetricsAction } from "./metrics/actions.js";
import type { SubscriptionInstanceCustomerAction } from "./customer/actions.js";
import type { SubscriptionInstanceOptionGroupAction } from "./option-group/actions.js";
import type { SubscriptionInstanceFacetAction } from "./facet/actions.js";
import type { SubscriptionInstanceRequestsAction } from "./requests/actions.js";

export * from "./subscription/actions.js";
export * from "./service/actions.js";
export * from "./service-group/actions.js";
export * from "./metrics/actions.js";
export * from "./customer/actions.js";
export * from "./option-group/actions.js";
export * from "./facet/actions.js";
export * from "./requests/actions.js";

export type SubscriptionInstanceAction =
  | SubscriptionInstanceSubscriptionAction
  | SubscriptionInstanceServiceAction
  | SubscriptionInstanceServiceGroupAction
  | SubscriptionInstanceMetricsAction
  | SubscriptionInstanceCustomerAction
  | SubscriptionInstanceOptionGroupAction
  | SubscriptionInstanceFacetAction
  | SubscriptionInstanceRequestsAction;
