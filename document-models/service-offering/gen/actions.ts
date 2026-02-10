import type { ServiceOfferingServiceManagementAction } from "./service-management/actions.js";
import type { ServiceOfferingTierManagementAction } from "./tier-management/actions.js";
import type { ServiceOfferingOfferingManagementAction } from "./offering-management/actions.js";
import type { ServiceOfferingOptionGroupManagementAction } from "./option-group-management/actions.js";
import type { ServiceOfferingServiceGroupManagementAction } from "./service-group-management/actions.js";

export * from "./service-management/actions.js";
export * from "./tier-management/actions.js";
export * from "./offering-management/actions.js";
export * from "./option-group-management/actions.js";
export * from "./service-group-management/actions.js";

export type ServiceOfferingAction =
  | ServiceOfferingServiceManagementAction
  | ServiceOfferingTierManagementAction
  | ServiceOfferingOfferingManagementAction
  | ServiceOfferingOptionGroupManagementAction
  | ServiceOfferingServiceGroupManagementAction;
