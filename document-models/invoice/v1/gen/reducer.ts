/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Reducer, StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model";
import type { InvoicePHState } from "document-models/invoice/v1";

import { invoiceInvoiceOperations } from "../src/reducers/invoice.js";

import {
  InitializeInvoiceInputSchema,
  MarkInvoiceIssuedInputSchema,
  MarkInvoicePaidInputSchema,
  VoidInvoiceInputSchema,
  SetStripeInvoiceIdInputSchema,
  SetInvoiceNotesInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<InvoicePHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "INITIALIZE_INVOICE": {
      InitializeInvoiceInputSchema().parse(action.input);

      invoiceInvoiceOperations.initializeInvoiceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_INVOICE_ISSUED": {
      MarkInvoiceIssuedInputSchema().parse(action.input);

      invoiceInvoiceOperations.markInvoiceIssuedOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "MARK_INVOICE_PAID": {
      MarkInvoicePaidInputSchema().parse(action.input);

      invoiceInvoiceOperations.markInvoicePaidOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "VOID_INVOICE": {
      VoidInvoiceInputSchema().parse(action.input);

      invoiceInvoiceOperations.voidInvoiceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_STRIPE_INVOICE_ID": {
      SetStripeInvoiceIdInputSchema().parse(action.input);

      invoiceInvoiceOperations.setStripeInvoiceIdOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_INVOICE_NOTES": {
      SetInvoiceNotesInputSchema().parse(action.input);

      invoiceInvoiceOperations.setInvoiceNotesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<InvoicePHState> = createReducer(stateReducer);
