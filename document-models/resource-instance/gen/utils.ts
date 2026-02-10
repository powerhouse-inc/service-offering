import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  ResourceInstanceGlobalState,
  ResourceInstanceLocalState,
} from "./types.js";
import type { ResourceInstancePHState } from "./types.js";
import { reducer } from "./reducer.js";
import { resourceInstanceDocumentType } from "./document-type.js";
import {
  isResourceInstanceDocument,
  assertIsResourceInstanceDocument,
  isResourceInstanceState,
  assertIsResourceInstanceState,
} from "./document-schema.js";

export const initialGlobalState: ResourceInstanceGlobalState = {
  resourceTemplateId: null,
  customerId: null,
  name: null,
  thumbnailUrl: null,
  infoLink: null,
  description: null,
  profile: null,
  status: "DRAFT",
  configuration: [],
  confirmedAt: null,
  provisioningStartedAt: null,
  provisioningCompletedAt: null,
  provisioningFailureReason: null,
  activatedAt: null,
  suspendedAt: null,
  suspensionType: null,
  suspensionReason: null,
  suspensionDetails: null,
  resumedAt: null,
  terminatedAt: null,
  terminationReason: null,
};
export const initialLocalState: ResourceInstanceLocalState = {};

export const utils: DocumentModelUtils<ResourceInstancePHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = resourceInstanceDocumentType;

    // for backwards compatibility, but this is NOT a valid signed document id
    document.header.id = generateId();

    return document;
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInput(input, reducer);
  },
  isStateOfType(state) {
    return isResourceInstanceState(state);
  },
  assertIsStateOfType(state) {
    return assertIsResourceInstanceState(state);
  },
  isDocumentOfType(document) {
    return isResourceInstanceDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsResourceInstanceDocument(document);
  },
};

export const createDocument = utils.createDocument;
export const createState = utils.createState;
export const saveToFileHandle = utils.saveToFileHandle;
export const loadFromInput = utils.loadFromInput;
export const isStateOfType = utils.isStateOfType;
export const assertIsStateOfType = utils.assertIsStateOfType;
export const isDocumentOfType = utils.isDocumentOfType;
export const assertIsDocumentOfType = utils.assertIsDocumentOfType;
