export type ErrorCode =
  | "ActivateNotPendingError"
  | "PauseNotActiveError"
  | "SetExpiringNotActiveError"
  | "CancelAlreadyCancelledError"
  | "ResumeNotPausedError"
  | "RenewNotExpiringError"
  | "RemoveBudgetNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ActivateNotPendingError extends Error implements ReducerError {
  errorCode = "ActivateNotPendingError" as ErrorCode;
  constructor(message = "ActivateNotPendingError") {
    super(message);
  }
}

export class PauseNotActiveError extends Error implements ReducerError {
  errorCode = "PauseNotActiveError" as ErrorCode;
  constructor(message = "PauseNotActiveError") {
    super(message);
  }
}

export class SetExpiringNotActiveError extends Error implements ReducerError {
  errorCode = "SetExpiringNotActiveError" as ErrorCode;
  constructor(message = "SetExpiringNotActiveError") {
    super(message);
  }
}

export class CancelAlreadyCancelledError extends Error implements ReducerError {
  errorCode = "CancelAlreadyCancelledError" as ErrorCode;
  constructor(message = "CancelAlreadyCancelledError") {
    super(message);
  }
}

export class ResumeNotPausedError extends Error implements ReducerError {
  errorCode = "ResumeNotPausedError" as ErrorCode;
  constructor(message = "ResumeNotPausedError") {
    super(message);
  }
}

export class RenewNotExpiringError extends Error implements ReducerError {
  errorCode = "RenewNotExpiringError" as ErrorCode;
  constructor(message = "RenewNotExpiringError") {
    super(message);
  }
}

export class RemoveBudgetNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveBudgetNotFoundError" as ErrorCode;
  constructor(message = "RemoveBudgetNotFoundError") {
    super(message);
  }
}

export const errors = {
  ActivateSubscription: { ActivateNotPendingError },
  PauseSubscription: { PauseNotActiveError },
  SetExpiring: { SetExpiringNotActiveError },
  CancelSubscription: { CancelAlreadyCancelledError },
  ResumeSubscription: { ResumeNotPausedError },
  RenewExpiringSubscription: { RenewNotExpiringError },
  RemoveBudgetCategory: { RemoveBudgetNotFoundError },
};
