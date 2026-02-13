export type ErrorCode =
  | "UpdateGlossaryTermNotFoundError"
  | "RemoveGlossaryTermNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateGlossaryTermNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateGlossaryTermNotFoundError" as ErrorCode;
  constructor(message = "UpdateGlossaryTermNotFoundError") {
    super(message);
  }
}

export class RemoveGlossaryTermNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveGlossaryTermNotFoundError" as ErrorCode;
  constructor(message = "RemoveGlossaryTermNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateGlossaryTerm: { UpdateGlossaryTermNotFoundError },
  RemoveGlossaryTerm: { RemoveGlossaryTermNotFoundError },
};
