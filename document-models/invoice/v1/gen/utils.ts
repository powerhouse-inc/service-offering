import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model";
import { reducer } from "./reducer.js";
import { invoiceDocumentType } from "./document-type.js";
import {
  assertIsInvoiceDocument,
  assertIsInvoiceState,
  isInvoiceDocument,
  isInvoiceState,
} from "./document-schema.js";
import type {
  InvoiceGlobalState,
  InvoiceLocalState,
  InvoicePHState,
} from "./types.js";

export const initialGlobalState: InvoiceGlobalState = {
  invoiceNumber: null,
  issuedAt: null,
  dueDate: null,
  status: "DRAFT",
  customerId: null,
  customerName: null,
  customerEmail: null,
  sourceSubscriptionId: null,
  sourceSubscriptionName: null,
  cycleStart: null,
  cycleEnd: null,
  billingCycle: null,
  lineItems: [],
  currency: null,
  subtotal: 0,
  creditApplied: 0,
  totalDue: 0,
  totalPaid: 0,
  stripeInvoiceId: null,
  notes: null,
};
export const initialLocalState: InvoiceLocalState = {};

export const utils: DocumentModelUtils<InvoicePHState> = {
  fileExtension: "inv",
  createState(state) {
    return {
      ...defaultBaseState(),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    const document = baseCreateDocument(utils.createState, state);

    document.header.documentType = invoiceDocumentType;

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
    return isInvoiceState(state);
  },
  assertIsStateOfType(state) {
    return assertIsInvoiceState(state);
  },
  isDocumentOfType(document) {
    return isInvoiceDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsInvoiceDocument(document);
  },
};
