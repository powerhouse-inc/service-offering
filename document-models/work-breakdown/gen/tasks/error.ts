export type ErrorCode =
  | "UpdateTaskNotFoundError"
  | "RemoveTaskNotFoundError"
  | "SetTaskStatusNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateTaskNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateTaskNotFoundError" as ErrorCode;
  constructor(message = "UpdateTaskNotFoundError") {
    super(message);
  }
}

export class RemoveTaskNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveTaskNotFoundError" as ErrorCode;
  constructor(message = "RemoveTaskNotFoundError") {
    super(message);
  }
}

export class SetTaskStatusNotFoundError extends Error implements ReducerError {
  errorCode = "SetTaskStatusNotFoundError" as ErrorCode;
  constructor(message = "SetTaskStatusNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateTask: { UpdateTaskNotFoundError },
  RemoveTask: { RemoveTaskNotFoundError },
  SetTaskStatus: { SetTaskStatusNotFoundError },
};
