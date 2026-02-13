export type ErrorCode =
  | "UpdateDeliverableNotFoundError"
  | "RemoveDeliverableNotFoundError"
  | "SetDeliverableStatusNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateDeliverableNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateDeliverableNotFoundError" as ErrorCode;
  constructor(message = "UpdateDeliverableNotFoundError") {
    super(message);
  }
}

export class RemoveDeliverableNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveDeliverableNotFoundError" as ErrorCode;
  constructor(message = "RemoveDeliverableNotFoundError") {
    super(message);
  }
}

export class SetDeliverableStatusNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetDeliverableStatusNotFoundError" as ErrorCode;
  constructor(message = "SetDeliverableStatusNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateDeliverable: { UpdateDeliverableNotFoundError },
  RemoveDeliverable: { RemoveDeliverableNotFoundError },
  SetDeliverableStatus: { SetDeliverableStatusNotFoundError },
};
