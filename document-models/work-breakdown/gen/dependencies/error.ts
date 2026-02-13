export type ErrorCode =
  | "UpdateDependencyNotFoundError"
  | "RemoveDependencyNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateDependencyNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateDependencyNotFoundError" as ErrorCode;
  constructor(message = "UpdateDependencyNotFoundError") {
    super(message);
  }
}

export class RemoveDependencyNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveDependencyNotFoundError" as ErrorCode;
  constructor(message = "RemoveDependencyNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateDependency: { UpdateDependencyNotFoundError },
  RemoveDependency: { RemoveDependencyNotFoundError },
};
