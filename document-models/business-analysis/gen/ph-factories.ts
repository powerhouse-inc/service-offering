/**
 * Factory methods for creating BusinessAnalysisDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  BusinessAnalysisDocument,
  BusinessAnalysisLocalState,
  BusinessAnalysisGlobalState,
  BusinessAnalysisPHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): BusinessAnalysisGlobalState {
  return {
    projectName: null,
    projectDescription: null,
    projectPhase: null,
    projectStatus: null,
    startDate: null,
    targetEndDate: null,
    organization: null,
    sponsor: null,
    stakeholders: [],
    requirements: [],
    requirementCategories: [],
    processes: [],
    analyses: [],
    kpis: [],
    decisions: [],
    changeRequests: [],
    deliverables: [],
    risks: [],
    activityLog: [],
    assumptions: [],
    scopeItems: [],
    glossary: [],
    feedback: [],
  };
}

export function defaultLocalState(): BusinessAnalysisLocalState {
  return {};
}

export function defaultPHState(): BusinessAnalysisPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<BusinessAnalysisGlobalState>,
): BusinessAnalysisGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as BusinessAnalysisGlobalState;
}

export function createLocalState(
  state?: Partial<BusinessAnalysisLocalState>,
): BusinessAnalysisLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as BusinessAnalysisLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<BusinessAnalysisGlobalState>,
  localState?: Partial<BusinessAnalysisLocalState>,
): BusinessAnalysisPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a BusinessAnalysisDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createBusinessAnalysisDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<BusinessAnalysisGlobalState>;
    local?: Partial<BusinessAnalysisLocalState>;
  }>,
): BusinessAnalysisDocument {
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
