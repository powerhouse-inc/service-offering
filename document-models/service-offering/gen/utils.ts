import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  ServiceOfferingGlobalState,
  ServiceOfferingLocalState,
} from "./types.js";
import type { ServiceOfferingPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { serviceOfferingDocumentType } from "./document-type.js";
import {
  isServiceOfferingDocument,
  assertIsServiceOfferingDocument,
  isServiceOfferingState,
  assertIsServiceOfferingState,
} from "./document-schema.js";

export const initialGlobalState: ServiceOfferingGlobalState = {
  id: "",
  operatorId: "",
  resourceTemplateId: null,
  title: "",
  summary: "",
  description: null,
  thumbnailUrl: null,
  infoLink: null,
  status: "DRAFT",
  lastModified: "2024-01-01T00:00:00Z",
  targetAudiences: [],
  facetTargets: [],
  serviceGroups: [],
  services: [],
  tiers: [],
  optionGroups: [],
};
export const initialLocalState: ServiceOfferingLocalState = {};

export const utils: DocumentModelUtils<ServiceOfferingPHState> = {
  fileExtension: "phso",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = serviceOfferingDocumentType;

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
    return isServiceOfferingState(state);
  },
  assertIsStateOfType(state) {
    return assertIsServiceOfferingState(state);
  },
  isDocumentOfType(document) {
    return isServiceOfferingDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsServiceOfferingDocument(document);
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
