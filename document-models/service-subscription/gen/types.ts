import type { PHDocument, PHBaseState } from "document-model";
import type { ServiceSubscriptionAction } from "./actions.js";
import type { ServiceSubscriptionState as ServiceSubscriptionGlobalState } from "./schema/types.js";

type ServiceSubscriptionLocalState = Record<PropertyKey, never>;

type ServiceSubscriptionPHState = PHBaseState & {
  global: ServiceSubscriptionGlobalState;
  local: ServiceSubscriptionLocalState;
};
type ServiceSubscriptionDocument = PHDocument<ServiceSubscriptionPHState>;

export * from "./schema/types.js";

export type {
  ServiceSubscriptionGlobalState,
  ServiceSubscriptionLocalState,
  ServiceSubscriptionPHState,
  ServiceSubscriptionAction,
  ServiceSubscriptionDocument,
};
