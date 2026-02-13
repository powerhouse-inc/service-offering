export type ErrorCode =
  | "UpdateDecisionNotFoundError"
  | "RemoveDecisionNotFoundError"
  | "SetDecisionStatusNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateDecisionNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateDecisionNotFoundError" as ErrorCode;
  constructor(message = "UpdateDecisionNotFoundError") {
    super(message);
  }
}

export class RemoveDecisionNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveDecisionNotFoundError" as ErrorCode;
  constructor(message = "RemoveDecisionNotFoundError") {
    super(message);
  }
}

export class SetDecisionStatusNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetDecisionStatusNotFoundError" as ErrorCode;
  constructor(message = "SetDecisionStatusNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateDecision: { UpdateDecisionNotFoundError },
  RemoveDecision: { RemoveDecisionNotFoundError },
  SetDecisionStatus: { SetDecisionStatusNotFoundError },
};
