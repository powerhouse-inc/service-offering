import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  SubscriptionInstanceGlobalState,
  SubscriptionInstanceLocalState,
} from "./types.js";
import type { SubscriptionInstancePHState } from "./types.js";
import { reducer } from "./reducer.js";
import { subscriptionInstanceDocumentType } from "./document-type.js";
import {
  isSubscriptionInstanceDocument,
  assertIsSubscriptionInstanceDocument,
  isSubscriptionInstanceState,
  assertIsSubscriptionInstanceState,
} from "./document-schema.js";

export const initialGlobalState: SubscriptionInstanceGlobalState = {
  customerId: null,
  customerName: null,
  customerEmail: null,
  customerType: null,
  teamMemberCount: null,
  operatorId: null,
  serviceOfferingId: null,
  tierId: null,
  tierName: null,
  tierPricingOptionId: null,
  resource: null,
  status: "PENDING",
  createdAt: null,
  activatedSince: null,
  pausedSince: null,
  expiringSince: null,
  renewalDate: null,
  cancelledSince: null,
  cancellationReason: null,
  autoRenew: false,
  operatorNotes: null,
  budget: null,
  nextBillingDate: null,
  projectedBillAmount: null,
  projectedBillCurrency: null,
  targetAudienceId: null,
  targetAudienceLabel: null,
  services: [],
  serviceGroups: [],
  selectedOptionGroups: [],
  facetSelections: [],
  clientRequests: [],
};
export const initialLocalState: SubscriptionInstanceLocalState = {};

export const utils: DocumentModelUtils<SubscriptionInstancePHState> = {
  fileExtension: "phsi",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = subscriptionInstanceDocumentType;

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
    return isSubscriptionInstanceState(state);
  },
  assertIsStateOfType(state) {
    return assertIsSubscriptionInstanceState(state);
  },
  isDocumentOfType(document) {
    return isSubscriptionInstanceDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsSubscriptionInstanceDocument(document);
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
