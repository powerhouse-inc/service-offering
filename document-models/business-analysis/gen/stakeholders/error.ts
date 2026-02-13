export type ErrorCode =
  | "UpdateStakeholderNotFoundError"
  | "RemoveStakeholderNotFoundError"
  | "EngagementStakeholderNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateStakeholderNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateStakeholderNotFoundError" as ErrorCode;
  constructor(message = "UpdateStakeholderNotFoundError") {
    super(message);
  }
}

export class RemoveStakeholderNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveStakeholderNotFoundError" as ErrorCode;
  constructor(message = "RemoveStakeholderNotFoundError") {
    super(message);
  }
}

export class EngagementStakeholderNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "EngagementStakeholderNotFoundError" as ErrorCode;
  constructor(message = "EngagementStakeholderNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateStakeholder: { UpdateStakeholderNotFoundError },
  RemoveStakeholder: { RemoveStakeholderNotFoundError },
  SetEngagementLevel: { EngagementStakeholderNotFoundError },
};
