export type ErrorCode =
  | "UpdatePrerequisiteNotFoundError"
  | "RemovePrerequisiteNotFoundError"
  | "SetPrerequisiteStatusNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdatePrerequisiteNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdatePrerequisiteNotFoundError" as ErrorCode;
  constructor(message = "UpdatePrerequisiteNotFoundError") {
    super(message);
  }
}

export class RemovePrerequisiteNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemovePrerequisiteNotFoundError" as ErrorCode;
  constructor(message = "RemovePrerequisiteNotFoundError") {
    super(message);
  }
}

export class SetPrerequisiteStatusNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetPrerequisiteStatusNotFoundError" as ErrorCode;
  constructor(message = "SetPrerequisiteStatusNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdatePrerequisite: { UpdatePrerequisiteNotFoundError },
  RemovePrerequisite: { RemovePrerequisiteNotFoundError },
  SetPrerequisiteStatus: { SetPrerequisiteStatusNotFoundError },
};
