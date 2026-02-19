/**
 * Factory methods for creating WorkBreakdownDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  WorkBreakdownDocument,
  WorkBreakdownLocalState,
  WorkBreakdownGlobalState,
  WorkBreakdownPHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): WorkBreakdownGlobalState {
  return {
    aiContext: null,
    title: null,
    description: null,
    phase: "CAPTURE",
    status: "NOT_STARTED",
    templateMode: "NONE",
    appliedTemplateId: null,
    templates: [],
    inputs: [],
    steps: [],
    prerequisites: [],
    tasks: [],
    dependencies: [],
    notes: [],
    extractionHistory: [],
  };
}

export function defaultLocalState(): WorkBreakdownLocalState {
  return {};
}

export function defaultPHState(): WorkBreakdownPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<WorkBreakdownGlobalState>,
): WorkBreakdownGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as WorkBreakdownGlobalState;
}

export function createLocalState(
  state?: Partial<WorkBreakdownLocalState>,
): WorkBreakdownLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as WorkBreakdownLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<WorkBreakdownGlobalState>,
  localState?: Partial<WorkBreakdownLocalState>,
): WorkBreakdownPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a WorkBreakdownDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createWorkBreakdownDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<WorkBreakdownGlobalState>;
    local?: Partial<WorkBreakdownLocalState>;
  }>,
): WorkBreakdownDocument {
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
