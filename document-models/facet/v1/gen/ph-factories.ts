/**
 * Factory methods for creating FacetDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  FacetDocument,
  FacetLocalState,
  FacetGlobalState,
  FacetPHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): FacetGlobalState {
  return {
    id: "",
    name: "",
    description: null,
    lastModified: "1970-01-01T00:00:00.000Z",
    options: [],
  };
}

export function defaultLocalState(): FacetLocalState {
  return {};
}

export function defaultPHState(): FacetPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<FacetGlobalState>,
): FacetGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as FacetGlobalState;
}

export function createLocalState(
  state?: Partial<FacetLocalState>,
): FacetLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as FacetLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<FacetGlobalState>,
  localState?: Partial<FacetLocalState>,
): FacetPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a FacetDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createFacetDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<FacetGlobalState>;
    local?: Partial<FacetLocalState>;
  }>,
): FacetDocument {
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
