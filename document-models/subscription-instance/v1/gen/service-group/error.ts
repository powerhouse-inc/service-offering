export type ErrorCode =
  | "RemoveServiceGroupNotFoundError"
  | "AddServiceToGroupGroupNotFoundError"
  | "RemoveServiceFromGroupGroupNotFoundError"
  | "RemoveServiceFromGroupServiceNotFoundError"
  | "UpdateServiceGroupCostNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class RemoveServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceGroupNotFoundError") {
    super(message);
  }
}

export class AddServiceToGroupGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddServiceToGroupGroupNotFoundError" as ErrorCode;
  constructor(message = "AddServiceToGroupGroupNotFoundError") {
    super(message);
  }
}

export class RemoveServiceFromGroupGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceFromGroupGroupNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceFromGroupGroupNotFoundError") {
    super(message);
  }
}

export class RemoveServiceFromGroupServiceNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceFromGroupServiceNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceFromGroupServiceNotFoundError") {
    super(message);
  }
}

export class UpdateServiceGroupCostNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateServiceGroupCostNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceGroupCostNotFoundError") {
    super(message);
  }
}

export const errors = {
  RemoveServiceGroup: { RemoveServiceGroupNotFoundError },
  AddServiceToGroup: { AddServiceToGroupGroupNotFoundError },
  RemoveServiceFromGroup: {
    RemoveServiceFromGroupGroupNotFoundError,
    RemoveServiceFromGroupServiceNotFoundError,
  },
  UpdateServiceGroupCost: { UpdateServiceGroupCostNotFoundError },
};
