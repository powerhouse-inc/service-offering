import { type SignalDispatch } from "document-model";
import type {
  InitializeInvoiceAction,
  MarkInvoiceIssuedAction,
  MarkInvoicePaidAction,
  VoidInvoiceAction,
  SetStripeInvoiceIdAction,
  SetInvoiceNotesAction,
} from "./actions.js";
import type { InvoiceState } from "../types.js";

export interface InvoiceInvoiceOperations {
  initializeInvoiceOperation: (
    state: InvoiceState,
    action: InitializeInvoiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  markInvoiceIssuedOperation: (
    state: InvoiceState,
    action: MarkInvoiceIssuedAction,
    dispatch?: SignalDispatch,
  ) => void;
  markInvoicePaidOperation: (
    state: InvoiceState,
    action: MarkInvoicePaidAction,
    dispatch?: SignalDispatch,
  ) => void;
  voidInvoiceOperation: (
    state: InvoiceState,
    action: VoidInvoiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  setStripeInvoiceIdOperation: (
    state: InvoiceState,
    action: SetStripeInvoiceIdAction,
    dispatch?: SignalDispatch,
  ) => void;
  setInvoiceNotesOperation: (
    state: InvoiceState,
    action: SetInvoiceNotesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
