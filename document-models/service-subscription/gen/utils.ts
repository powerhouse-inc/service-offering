import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  ServiceSubscriptionGlobalState,
  ServiceSubscriptionLocalState,
} from "./types.js";
import type { ServiceSubscriptionPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { serviceSubscriptionDocumentType } from "./document-type.js";
import {
  isServiceSubscriptionDocument,
  assertIsServiceSubscriptionDocument,
  isServiceSubscriptionState,
  assertIsServiceSubscriptionState,
} from "./document-schema.js";

export const initialGlobalState: ServiceSubscriptionGlobalState = {
  id: "",
  customerId: "",
  customerName: null,
  serviceOfferingId: "",
  serviceOfferingTitle: null,
  resourceTemplateId: "",
  selectedTierId: "",
  status: "PENDING",
  autoRenew: true,
  pricing: null,
  selectedAddons: [],
  facetSelections: [],
  startDate: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelledAt: null,
  cancellationReason: null,
  cancelEffectiveDate: null,
  nextBillingDate: null,
  projectedBillAmount: null,
  projectedBillCurrency: null,
  createdAt: "1970-01-01T00:00:00.000Z",
  lastModified: "1970-01-01T00:00:00.000Z",
};
export const initialLocalState: ServiceSubscriptionLocalState = {};

export const utils: DocumentModelUtils<ServiceSubscriptionPHState> = {
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

    document.header.documentType = serviceSubscriptionDocumentType;

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
    return isServiceSubscriptionState(state);
  },
  assertIsStateOfType(state) {
    return assertIsServiceSubscriptionState(state);
  },
  isDocumentOfType(document) {
    return isServiceSubscriptionDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsServiceSubscriptionDocument(document);
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
