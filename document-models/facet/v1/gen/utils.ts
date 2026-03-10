import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type { FacetGlobalState, FacetLocalState } from "./types.js";
import type { FacetPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { facetDocumentType } from "./document-type.js";
import {
  isFacetDocument,
  assertIsFacetDocument,
  isFacetState,
  assertIsFacetState,
} from "./document-schema.js";

export const initialGlobalState: FacetGlobalState = {
  id: "",
  name: "",
  description: null,
  lastModified: "1970-01-01T00:00:00.000Z",
  options: [],
};
export const initialLocalState: FacetLocalState = {};

export const utils: DocumentModelUtils<FacetPHState> = {
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

    document.header.documentType = facetDocumentType;

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
    return isFacetState(state);
  },
  assertIsStateOfType(state) {
    return assertIsFacetState(state);
  },
  isDocumentOfType(document) {
    return isFacetDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsFacetDocument(document);
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
