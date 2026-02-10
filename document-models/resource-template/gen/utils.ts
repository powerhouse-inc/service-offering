import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  ResourceTemplateGlobalState,
  ResourceTemplateLocalState,
} from "./types.js";
import type { ResourceTemplatePHState } from "./types.js";
import { reducer } from "./reducer.js";
import { resourceTemplateDocumentType } from "./document-type.js";
import {
  isResourceTemplateDocument,
  assertIsResourceTemplateDocument,
  isResourceTemplateState,
  assertIsResourceTemplateState,
} from "./document-schema.js";

export const initialGlobalState: ResourceTemplateGlobalState = {
  id: "",
  operatorId: "",
  title: "",
  summary: "",
  description: null,
  thumbnailUrl: null,
  infoLink: null,
  status: "DRAFT",
  lastModified: "1970-01-01T00:00:00.000Z",
  targetAudiences: [],
  setupServices: [],
  recurringServices: [],
  facetTargets: [],
  services: [],
  optionGroups: [],
  faqFields: [],
  contentSections: [],
};
export const initialLocalState: ResourceTemplateLocalState = {};

export const utils: DocumentModelUtils<ResourceTemplatePHState> = {
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

    document.header.documentType = resourceTemplateDocumentType;

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
    return isResourceTemplateState(state);
  },
  assertIsStateOfType(state) {
    return assertIsResourceTemplateState(state);
  },
  isDocumentOfType(document) {
    return isResourceTemplateDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsResourceTemplateDocument(document);
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
