export type ErrorCode = "InvalidTierChangeError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidTierChangeError extends Error implements ReducerError {
  errorCode = "InvalidTierChangeError" as ErrorCode;
  constructor(message = "InvalidTierChangeError") {
    super(message);
  }
}

export const errors = {
  ChangeTier: { InvalidTierChangeError },
};
