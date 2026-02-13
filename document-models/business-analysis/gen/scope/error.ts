export type ErrorCode =
  | "UpdateAssumptionNotFoundError"
  | "RemoveAssumptionNotFoundError"
  | "SetAssumptionStatusNotFoundError"
  | "UpdateScopeItemNotFoundError"
  | "RemoveScopeItemNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateAssumptionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateAssumptionNotFoundError" as ErrorCode;
  constructor(message = "UpdateAssumptionNotFoundError") {
    super(message);
  }
}

export class RemoveAssumptionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveAssumptionNotFoundError" as ErrorCode;
  constructor(message = "RemoveAssumptionNotFoundError") {
    super(message);
  }
}

export class SetAssumptionStatusNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetAssumptionStatusNotFoundError" as ErrorCode;
  constructor(message = "SetAssumptionStatusNotFoundError") {
    super(message);
  }
}

export class UpdateScopeItemNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateScopeItemNotFoundError" as ErrorCode;
  constructor(message = "UpdateScopeItemNotFoundError") {
    super(message);
  }
}

export class RemoveScopeItemNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveScopeItemNotFoundError" as ErrorCode;
  constructor(message = "RemoveScopeItemNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateAssumption: { UpdateAssumptionNotFoundError },
  RemoveAssumption: { RemoveAssumptionNotFoundError },
  SetAssumptionStatus: { SetAssumptionStatusNotFoundError },
  UpdateScopeItem: { UpdateScopeItemNotFoundError },
  RemoveScopeItem: { RemoveScopeItemNotFoundError },
};
