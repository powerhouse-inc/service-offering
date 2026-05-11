import { generateMock } from "document-model";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isInvoiceDocument,
  initializeInvoice,
  markInvoiceIssued,
  markInvoicePaid,
  voidInvoice,
  setStripeInvoiceId,
  setInvoiceNotes,
  InitializeInvoiceInputSchema,
  MarkInvoiceIssuedInputSchema,
  MarkInvoicePaidInputSchema,
  VoidInvoiceInputSchema,
  SetStripeInvoiceIdInputSchema,
  SetInvoiceNotesInputSchema,
} from "document-models/invoice/v1";

describe("InvoiceOperations", () => {
  it("should handle initializeInvoice operation", () => {
    const document = utils.createDocument();
    const input = generateMock(InitializeInvoiceInputSchema());

    const updatedDocument = reducer(document, initializeInvoice(input));

    expect(isInvoiceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "INITIALIZE_INVOICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markInvoiceIssued operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkInvoiceIssuedInputSchema());

    const updatedDocument = reducer(document, markInvoiceIssued(input));

    expect(isInvoiceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_INVOICE_ISSUED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markInvoicePaid operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkInvoicePaidInputSchema());

    const updatedDocument = reducer(document, markInvoicePaid(input));

    expect(isInvoiceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_INVOICE_PAID",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle voidInvoice operation", () => {
    const document = utils.createDocument();
    const input = generateMock(VoidInvoiceInputSchema());

    const updatedDocument = reducer(document, voidInvoice(input));

    expect(isInvoiceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "VOID_INVOICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setStripeInvoiceId operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetStripeInvoiceIdInputSchema());

    const updatedDocument = reducer(document, setStripeInvoiceId(input));

    expect(isInvoiceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_STRIPE_INVOICE_ID",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setInvoiceNotes operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetInvoiceNotesInputSchema());

    const updatedDocument = reducer(document, setInvoiceNotes(input));

    expect(isInvoiceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_INVOICE_NOTES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
