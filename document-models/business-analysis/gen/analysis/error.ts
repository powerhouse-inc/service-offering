export type ErrorCode =
  | "UpdateAnalysisNotFoundError"
  | "RemoveAnalysisNotFoundError"
  | "AddAnalysisEntryAnalysisNotFoundError"
  | "UpdateAnalysisEntryNotFoundError"
  | "RemoveAnalysisEntryNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateAnalysisNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateAnalysisNotFoundError" as ErrorCode;
  constructor(message = "UpdateAnalysisNotFoundError") {
    super(message);
  }
}

export class RemoveAnalysisNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveAnalysisNotFoundError" as ErrorCode;
  constructor(message = "RemoveAnalysisNotFoundError") {
    super(message);
  }
}

export class AddAnalysisEntryAnalysisNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddAnalysisEntryAnalysisNotFoundError" as ErrorCode;
  constructor(message = "AddAnalysisEntryAnalysisNotFoundError") {
    super(message);
  }
}

export class UpdateAnalysisEntryNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateAnalysisEntryNotFoundError" as ErrorCode;
  constructor(message = "UpdateAnalysisEntryNotFoundError") {
    super(message);
  }
}

export class RemoveAnalysisEntryNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveAnalysisEntryNotFoundError" as ErrorCode;
  constructor(message = "RemoveAnalysisEntryNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateAnalysis: { UpdateAnalysisNotFoundError },
  RemoveAnalysis: { RemoveAnalysisNotFoundError },
  AddAnalysisEntry: { AddAnalysisEntryAnalysisNotFoundError },
  UpdateAnalysisEntry: { UpdateAnalysisEntryNotFoundError },
  RemoveAnalysisEntry: { RemoveAnalysisEntryNotFoundError },
};
