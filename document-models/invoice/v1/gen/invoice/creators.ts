import { createAction } from "document-model";
import {
  InitializeInvoiceInputSchema,
  MarkInvoiceIssuedInputSchema,
  MarkInvoicePaidInputSchema,
  VoidInvoiceInputSchema,
  SetStripeInvoiceIdInputSchema,
  SetInvoiceNotesInputSchema,
} from "../schema/zod.js";
import type {
  InitializeInvoiceInput,
  MarkInvoiceIssuedInput,
  MarkInvoicePaidInput,
  VoidInvoiceInput,
  SetStripeInvoiceIdInput,
  SetInvoiceNotesInput,
} from "../types.js";
import type {
  InitializeInvoiceAction,
  MarkInvoiceIssuedAction,
  MarkInvoicePaidAction,
  VoidInvoiceAction,
  SetStripeInvoiceIdAction,
  SetInvoiceNotesAction,
} from "./actions.js";

export const initializeInvoice = (input: InitializeInvoiceInput) =>
  createAction<InitializeInvoiceAction>(
    "INITIALIZE_INVOICE",
    { ...input },
    undefined,
    InitializeInvoiceInputSchema,
    "global",
  );

export const markInvoiceIssued = (input: MarkInvoiceIssuedInput) =>
  createAction<MarkInvoiceIssuedAction>(
    "MARK_INVOICE_ISSUED",
    { ...input },
    undefined,
    MarkInvoiceIssuedInputSchema,
    "global",
  );

export const markInvoicePaid = (input: MarkInvoicePaidInput) =>
  createAction<MarkInvoicePaidAction>(
    "MARK_INVOICE_PAID",
    { ...input },
    undefined,
    MarkInvoicePaidInputSchema,
    "global",
  );

export const voidInvoice = (input: VoidInvoiceInput) =>
  createAction<VoidInvoiceAction>(
    "VOID_INVOICE",
    { ...input },
    undefined,
    VoidInvoiceInputSchema,
    "global",
  );

export const setStripeInvoiceId = (input: SetStripeInvoiceIdInput) =>
  createAction<SetStripeInvoiceIdAction>(
    "SET_STRIPE_INVOICE_ID",
    { ...input },
    undefined,
    SetStripeInvoiceIdInputSchema,
    "global",
  );

export const setInvoiceNotes = (input: SetInvoiceNotesInput) =>
  createAction<SetInvoiceNotesAction>(
    "SET_INVOICE_NOTES",
    { ...input },
    undefined,
    SetInvoiceNotesInputSchema,
    "global",
  );
