/**
 * Factory methods for creating MultisigParticipationAgreementDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  MultisigParticipationAgreementDocument,
  MultisigParticipationAgreementLocalState,
  MultisigParticipationAgreementGlobalState,
  MultisigParticipationAgreementPHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): MultisigParticipationAgreementGlobalState {
  return {
    templateVersion: null,
    status: "DRAFT",
    associationName: null,
    activeSigner: null,
    wallet: null,
    communicationChannel: null,
    unavailabilityThresholdHours: null,
    policyLinks: [],
    associationSigners: [],
    activeSignerSignature: null,
    complianceEvents: [],
    effectiveDate: null,
    terminationDate: null,
    terminationReason: null,
  };
}

export function defaultLocalState(): MultisigParticipationAgreementLocalState {
  return {};
}

export function defaultPHState(): MultisigParticipationAgreementPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<MultisigParticipationAgreementGlobalState>,
): MultisigParticipationAgreementGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as MultisigParticipationAgreementGlobalState;
}

export function createLocalState(
  state?: Partial<MultisigParticipationAgreementLocalState>,
): MultisigParticipationAgreementLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as MultisigParticipationAgreementLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<MultisigParticipationAgreementGlobalState>,
  localState?: Partial<MultisigParticipationAgreementLocalState>,
): MultisigParticipationAgreementPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a MultisigParticipationAgreementDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createMultisigParticipationAgreementDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<MultisigParticipationAgreementGlobalState>;
    local?: Partial<MultisigParticipationAgreementLocalState>;
  }>,
): MultisigParticipationAgreementDocument {
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
