export type ErrorCode =
  | "UpdateInputNotFoundError"
  | "RemoveInputNotFoundError"
  | "UpdateStepNotFoundError"
  | "RemoveStepNotFoundError"
  | "AddSubstepStepNotFoundError"
  | "UpdateSubstepNotFoundError"
  | "RemoveSubstepNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateInputNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateInputNotFoundError" as ErrorCode;
  constructor(message = "UpdateInputNotFoundError") {
    super(message);
  }
}

export class RemoveInputNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveInputNotFoundError" as ErrorCode;
  constructor(message = "RemoveInputNotFoundError") {
    super(message);
  }
}

export class UpdateStepNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateStepNotFoundError" as ErrorCode;
  constructor(message = "UpdateStepNotFoundError") {
    super(message);
  }
}

export class RemoveStepNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveStepNotFoundError" as ErrorCode;
  constructor(message = "RemoveStepNotFoundError") {
    super(message);
  }
}

export class AddSubstepStepNotFoundError extends Error implements ReducerError {
  errorCode = "AddSubstepStepNotFoundError" as ErrorCode;
  constructor(message = "AddSubstepStepNotFoundError") {
    super(message);
  }
}

export class UpdateSubstepNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateSubstepNotFoundError" as ErrorCode;
  constructor(message = "UpdateSubstepNotFoundError") {
    super(message);
  }
}

export class RemoveSubstepNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveSubstepNotFoundError" as ErrorCode;
  constructor(message = "RemoveSubstepNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateInput: { UpdateInputNotFoundError },
  RemoveInput: { RemoveInputNotFoundError },
  UpdateStep: { UpdateStepNotFoundError },
  RemoveStep: { RemoveStepNotFoundError },
  AddSubstep: { AddSubstepStepNotFoundError },
  UpdateSubstep: { UpdateSubstepNotFoundError },
  RemoveSubstep: { RemoveSubstepNotFoundError },
};
