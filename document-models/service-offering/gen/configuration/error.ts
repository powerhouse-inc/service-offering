export type ErrorCode =
  | "SetConfigTierNotFoundError"
  | "SetConfigOptionGroupNotFoundError"
  | "SetConfigAddOnGroupNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class SetConfigTierNotFoundError extends Error implements ReducerError {
  errorCode = "SetConfigTierNotFoundError" as ErrorCode;
  constructor(message = "SetConfigTierNotFoundError") {
    super(message);
  }
}

export class SetConfigOptionGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetConfigOptionGroupNotFoundError" as ErrorCode;
  constructor(message = "SetConfigOptionGroupNotFoundError") {
    super(message);
  }
}

export class SetConfigAddOnGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetConfigAddOnGroupNotFoundError" as ErrorCode;
  constructor(message = "SetConfigAddOnGroupNotFoundError") {
    super(message);
  }
}

export const errors = {
  SetFinalConfiguration: {
    SetConfigTierNotFoundError,
    SetConfigOptionGroupNotFoundError,
    SetConfigAddOnGroupNotFoundError,
  },
};
