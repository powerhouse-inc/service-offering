export type ErrorCode =
  | "UpdateRiskNotFoundError"
  | "RemoveRiskNotFoundError"
  | "SetRiskStatusNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateRiskNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateRiskNotFoundError" as ErrorCode;
  constructor(message = "UpdateRiskNotFoundError") {
    super(message);
  }
}

export class RemoveRiskNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveRiskNotFoundError" as ErrorCode;
  constructor(message = "RemoveRiskNotFoundError") {
    super(message);
  }
}

export class SetRiskStatusNotFoundError extends Error implements ReducerError {
  errorCode = "SetRiskStatusNotFoundError" as ErrorCode;
  constructor(message = "SetRiskStatusNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateRisk: { UpdateRiskNotFoundError },
  RemoveRisk: { RemoveRiskNotFoundError },
  SetRiskStatus: { SetRiskStatusNotFoundError },
};
