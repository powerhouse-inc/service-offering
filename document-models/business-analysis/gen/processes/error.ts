export type ErrorCode =
  | "UpdateProcessNotFoundError"
  | "RemoveProcessNotFoundError"
  | "AddProcessStepProcessNotFoundError"
  | "UpdateProcessStepNotFoundError"
  | "RemoveProcessStepNotFoundError"
  | "ReorderProcessStepsProcessNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateProcessNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateProcessNotFoundError" as ErrorCode;
  constructor(message = "UpdateProcessNotFoundError") {
    super(message);
  }
}

export class RemoveProcessNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveProcessNotFoundError" as ErrorCode;
  constructor(message = "RemoveProcessNotFoundError") {
    super(message);
  }
}

export class AddProcessStepProcessNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddProcessStepProcessNotFoundError" as ErrorCode;
  constructor(message = "AddProcessStepProcessNotFoundError") {
    super(message);
  }
}

export class UpdateProcessStepNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateProcessStepNotFoundError" as ErrorCode;
  constructor(message = "UpdateProcessStepNotFoundError") {
    super(message);
  }
}

export class RemoveProcessStepNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveProcessStepNotFoundError" as ErrorCode;
  constructor(message = "RemoveProcessStepNotFoundError") {
    super(message);
  }
}

export class ReorderProcessStepsProcessNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ReorderProcessStepsProcessNotFoundError" as ErrorCode;
  constructor(message = "ReorderProcessStepsProcessNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateProcess: { UpdateProcessNotFoundError },
  RemoveProcess: { RemoveProcessNotFoundError },
  AddProcessStep: { AddProcessStepProcessNotFoundError },
  UpdateProcessStep: { UpdateProcessStepNotFoundError },
  RemoveProcessStep: { RemoveProcessStepNotFoundError },
  ReorderProcessSteps: { ReorderProcessStepsProcessNotFoundError },
};
