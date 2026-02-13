import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  BusinessAnalysisGlobalState,
  BusinessAnalysisLocalState,
} from "./types.js";
import type { BusinessAnalysisPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { businessAnalysisDocumentType } from "./document-type.js";
import {
  isBusinessAnalysisDocument,
  assertIsBusinessAnalysisDocument,
  isBusinessAnalysisState,
  assertIsBusinessAnalysisState,
} from "./document-schema.js";

export const initialGlobalState: BusinessAnalysisGlobalState = {
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
export const initialLocalState: BusinessAnalysisLocalState = {};

export const utils: DocumentModelUtils<BusinessAnalysisPHState> = {
  fileExtension: "ba",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = businessAnalysisDocumentType;

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
    return isBusinessAnalysisState(state);
  },
  assertIsStateOfType(state) {
    return assertIsBusinessAnalysisState(state);
  },
  isDocumentOfType(document) {
    return isBusinessAnalysisDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsBusinessAnalysisDocument(document);
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
