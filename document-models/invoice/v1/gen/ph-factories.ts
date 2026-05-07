/**
 * Factory methods for creating InvoiceDocument instances
 */
import type { PHAuthState, PHDocumentState, PHBaseState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  InvoiceDocument,
  InvoiceGlobalState,
  InvoiceLocalState,
  InvoicePHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): InvoiceGlobalState {
  return {
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
}

export function defaultLocalState(): InvoiceLocalState {
  return {};
}

export function defaultPHState(): InvoicePHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<InvoiceGlobalState>,
): InvoiceGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  } as InvoiceGlobalState;
}

export function createLocalState(
  state?: Partial<InvoiceLocalState>,
): InvoiceLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as InvoiceLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<InvoiceGlobalState>,
  localState?: Partial<InvoiceLocalState>,
): InvoicePHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a InvoiceDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createInvoiceDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<InvoiceGlobalState>;
    local?: Partial<InvoiceLocalState>;
  }>,
): InvoiceDocument {
  const document = utils.createDocument(
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
