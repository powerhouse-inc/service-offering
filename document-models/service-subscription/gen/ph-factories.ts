/**
 * Factory methods for creating ServiceSubscriptionDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  ServiceSubscriptionDocument,
  ServiceSubscriptionLocalState,
  ServiceSubscriptionGlobalState,
  ServiceSubscriptionPHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): ServiceSubscriptionGlobalState {
  return {
    id: "",
    customerId: "",
    customerName: null,
    serviceOfferingId: "",
    serviceOfferingTitle: null,
    resourceTemplateId: "",
    selectedTierId: "",
    status: "PENDING",
    autoRenew: true,
    pricing: null,
    selectedAddons: [],
    facetSelections: [],
    startDate: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelledAt: null,
    cancellationReason: null,
    cancelEffectiveDate: null,
    nextBillingDate: null,
    projectedBillAmount: null,
    projectedBillCurrency: null,
    createdAt: "1970-01-01T00:00:00.000Z",
    lastModified: "1970-01-01T00:00:00.000Z",
  };
}

export function defaultLocalState(): ServiceSubscriptionLocalState {
  return {};
}

export function defaultPHState(): ServiceSubscriptionPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<ServiceSubscriptionGlobalState>,
): ServiceSubscriptionGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as ServiceSubscriptionGlobalState;
}

export function createLocalState(
  state?: Partial<ServiceSubscriptionLocalState>,
): ServiceSubscriptionLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as ServiceSubscriptionLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<ServiceSubscriptionGlobalState>,
  localState?: Partial<ServiceSubscriptionLocalState>,
): ServiceSubscriptionPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a ServiceSubscriptionDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createServiceSubscriptionDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<ServiceSubscriptionGlobalState>;
    local?: Partial<ServiceSubscriptionLocalState>;
  }>,
): ServiceSubscriptionDocument {
  const document = createDocument(
    state
      ? createState(
          createBaseState(state.auth, state.document),
          state.global,
          state.local,
        )
      : undefined,
  );

  return document;
}
