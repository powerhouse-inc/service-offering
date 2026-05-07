import type { Action } from "document-model";
import type {
  InitializeInvoiceInput,
  MarkInvoiceIssuedInput,
  MarkInvoicePaidInput,
  VoidInvoiceInput,
  SetStripeInvoiceIdInput,
  SetInvoiceNotesInput,
} from "../types.js";

export type InitializeInvoiceAction = Action & {
  type: "INITIALIZE_INVOICE";
  input: InitializeInvoiceInput;
};
export type MarkInvoiceIssuedAction = Action & {
  type: "MARK_INVOICE_ISSUED";
  input: MarkInvoiceIssuedInput;
};
export type MarkInvoicePaidAction = Action & {
  type: "MARK_INVOICE_PAID";
  input: MarkInvoicePaidInput;
};
export type VoidInvoiceAction = Action & {
  type: "VOID_INVOICE";
  input: VoidInvoiceInput;
};
export type SetStripeInvoiceIdAction = Action & {
  type: "SET_STRIPE_INVOICE_ID";
  input: SetStripeInvoiceIdInput;
};
export type SetInvoiceNotesAction = Action & {
  type: "SET_INVOICE_NOTES";
  input: SetInvoiceNotesInput;
};

export type InvoiceInvoiceAction =
  | InitializeInvoiceAction
  | MarkInvoiceIssuedAction
  | MarkInvoicePaidAction
  | VoidInvoiceAction
  | SetStripeInvoiceIdAction
  | SetInvoiceNotesAction;
