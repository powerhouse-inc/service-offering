import { baseActions } from "document-model";
import { invoiceInvoiceActions } from "./gen/creators.js";

/** Actions for the Invoice document model */

export const actions = { ...baseActions, ...invoiceInvoiceActions };
