export type ErrorCode =
  | "UpdateChangeRequestNotFoundError"
  | "SetChangeRequestStatusNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateChangeRequestNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateChangeRequestNotFoundError" as ErrorCode;
  constructor(message = "UpdateChangeRequestNotFoundError") {
    super(message);
  }
}

export class SetChangeRequestStatusNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetChangeRequestStatusNotFoundError" as ErrorCode;
  constructor(message = "SetChangeRequestStatusNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateChangeRequest: { UpdateChangeRequestNotFoundError },
  SetChangeRequestStatus: { SetChangeRequestStatusNotFoundError },
};
