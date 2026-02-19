export type ErrorCode = "UpdateExtractionRecordNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateExtractionRecordNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateExtractionRecordNotFoundError" as ErrorCode;
  constructor(message = "UpdateExtractionRecordNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateExtractionRecord: { UpdateExtractionRecordNotFoundError },
};
