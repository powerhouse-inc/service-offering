import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  WorkBreakdownGlobalState,
  WorkBreakdownLocalState,
} from "./types.js";
import type { WorkBreakdownPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { workBreakdownDocumentType } from "./document-type.js";
import {
  isWorkBreakdownDocument,
  assertIsWorkBreakdownDocument,
  isWorkBreakdownState,
  assertIsWorkBreakdownState,
} from "./document-schema.js";

export const initialGlobalState: WorkBreakdownGlobalState = {
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
export const initialLocalState: WorkBreakdownLocalState = {};

export const utils: DocumentModelUtils<WorkBreakdownPHState> = {
  fileExtension: "phwb",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = workBreakdownDocumentType;

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
    return isWorkBreakdownState(state);
  },
  assertIsStateOfType(state) {
    return assertIsWorkBreakdownState(state);
  },
  isDocumentOfType(document) {
    return isWorkBreakdownDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsWorkBreakdownDocument(document);
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
