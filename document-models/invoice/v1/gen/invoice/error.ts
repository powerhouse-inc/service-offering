export type ErrorCode =
  | "InvoiceAlreadyInitializedError"
  | "InvoiceNotDraftError"
  | "InvoiceNotIssuedError"
  | "InvoicePaidInvalidAmountError"
  | "InvoiceAlreadyVoidError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvoiceAlreadyInitializedError
  extends Error
  implements ReducerError
{
  errorCode = "InvoiceAlreadyInitializedError" as ErrorCode;
  constructor(message = "InvoiceAlreadyInitializedError") {
    super(message);
  }
}

export class InvoiceNotDraftError extends Error implements ReducerError {
  errorCode = "InvoiceNotDraftError" as ErrorCode;
  constructor(message = "InvoiceNotDraftError") {
    super(message);
  }
}

export class InvoiceNotIssuedError extends Error implements ReducerError {
  errorCode = "InvoiceNotIssuedError" as ErrorCode;
  constructor(message = "InvoiceNotIssuedError") {
    super(message);
  }
}

export class InvoicePaidInvalidAmountError
  extends Error
  implements ReducerError
{
  errorCode = "InvoicePaidInvalidAmountError" as ErrorCode;
  constructor(message = "InvoicePaidInvalidAmountError") {
    super(message);
  }
}

export class InvoiceAlreadyVoidError extends Error implements ReducerError {
  errorCode = "InvoiceAlreadyVoidError" as ErrorCode;
  constructor(message = "InvoiceAlreadyVoidError") {
    super(message);
  }
}

export const errors = {
  InitializeInvoice: { InvoiceAlreadyInitializedError },
  MarkInvoiceIssued: { InvoiceNotDraftError },
  MarkInvoicePaid: { InvoiceNotIssuedError, InvoicePaidInvalidAmountError },
  VoidInvoice: { InvoiceAlreadyVoidError },
};
