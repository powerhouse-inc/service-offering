export type ErrorCode =
  | "AgreementTerminatedError"
  | "EventNotFoundError"
  | "EventAlreadySupersededError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class AgreementTerminatedError extends Error implements ReducerError {
  errorCode = "AgreementTerminatedError" as ErrorCode;
  constructor(message = "AgreementTerminatedError") {
    super(message);
  }
}

export class EventNotFoundError extends Error implements ReducerError {
  errorCode = "EventNotFoundError" as ErrorCode;
  constructor(message = "EventNotFoundError") {
    super(message);
  }
}

export class EventAlreadySupersededError extends Error implements ReducerError {
  errorCode = "EventAlreadySupersededError" as ErrorCode;
  constructor(message = "EventAlreadySupersededError") {
    super(message);
  }
}

export const errors = {
  AddComplianceEvent: { AgreementTerminatedError },
  AmendComplianceEvent: { EventNotFoundError, EventAlreadySupersededError },
  MarkSlaBreached: { EventNotFoundError },
};
