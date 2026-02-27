export type ErrorCode =
  | "UpdateTemplateNotFoundError"
  | "RemoveTemplateNotFoundError"
  | "ApplyTemplateNotFoundError"
  | "ApplyTemplateStepsExistError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateTemplateNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateTemplateNotFoundError" as ErrorCode;
  constructor(message = "UpdateTemplateNotFoundError") {
    super(message);
  }
}

export class RemoveTemplateNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveTemplateNotFoundError" as ErrorCode;
  constructor(message = "RemoveTemplateNotFoundError") {
    super(message);
  }
}

export class ApplyTemplateNotFoundError extends Error implements ReducerError {
  errorCode = "ApplyTemplateNotFoundError" as ErrorCode;
  constructor(message = "ApplyTemplateNotFoundError") {
    super(message);
  }
}

export class ApplyTemplateStepsExistError
  extends Error
  implements ReducerError
{
  errorCode = "ApplyTemplateStepsExistError" as ErrorCode;
  constructor(message = "ApplyTemplateStepsExistError") {
    super(message);
  }
}

export const errors = {
  UpdateTemplate: { UpdateTemplateNotFoundError },
  RemoveTemplate: { RemoveTemplateNotFoundError },
  ApplyTemplate: { ApplyTemplateNotFoundError, ApplyTemplateStepsExistError },
};
