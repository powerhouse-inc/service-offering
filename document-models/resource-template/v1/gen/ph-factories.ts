/**
 * Factory methods for creating ResourceTemplateDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model/core";
import type {
  ResourceTemplateDocument,
  ResourceTemplateLocalState,
  ResourceTemplateGlobalState,
  ResourceTemplatePHState,
} from "./types.js";
import { createDocument } from "./utils.js";

export function defaultGlobalState(): ResourceTemplateGlobalState {
  return {
    id: null,
    operatorId: null,
    title: "",
    summary: "",
    description: null,
    thumbnailUrl: null,
    infoLink: null,
    status: "DRAFT",
    lastModified: null,
    targetAudiences: [],
    setupServices: [],
    recurringServices: [],
    facetTargets: [],
    services: [],
    optionGroups: [],
    faqFields: [],
    contentSections: [],
  };
}

export function defaultLocalState(): ResourceTemplateLocalState {
  return {};
}

export function defaultPHState(): ResourceTemplatePHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<ResourceTemplateGlobalState>,
): ResourceTemplateGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as ResourceTemplateGlobalState;
}

export function createLocalState(
  state?: Partial<ResourceTemplateLocalState>,
): ResourceTemplateLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as ResourceTemplateLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<ResourceTemplateGlobalState>,
  localState?: Partial<ResourceTemplateLocalState>,
): ResourceTemplatePHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a ResourceTemplateDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createResourceTemplateDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<ResourceTemplateGlobalState>;
    local?: Partial<ResourceTemplateLocalState>;
  }>,
): ResourceTemplateDocument {
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
