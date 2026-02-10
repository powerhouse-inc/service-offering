export type ErrorCode =
  | "DuplicateServiceGroupIdError"
  | "ServiceGroupNotFoundError"
  | "DeleteServiceGroupNotFoundError"
  | "ReorderServiceGroupNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateServiceGroupIdError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateServiceGroupIdError" as ErrorCode;
  constructor(message = "DuplicateServiceGroupIdError") {
    super(message);
  }
}

export class ServiceGroupNotFoundError extends Error implements ReducerError {
  errorCode = "ServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "ServiceGroupNotFoundError") {
    super(message);
  }
}

export class DeleteServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "DeleteServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "DeleteServiceGroupNotFoundError") {
    super(message);
  }
}

export class ReorderServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ReorderServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "ReorderServiceGroupNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddServiceGroup: { DuplicateServiceGroupIdError },
  UpdateServiceGroup: { ServiceGroupNotFoundError },
  DeleteServiceGroup: { DeleteServiceGroupNotFoundError },
  ReorderServiceGroups: { ReorderServiceGroupNotFoundError },
};
