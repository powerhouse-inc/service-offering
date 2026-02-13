export type ErrorCode =
  | "RespondToFeedbackNotFoundError"
  | "ResolveFeedbackNotFoundError"
  | "RemoveFeedbackNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class RespondToFeedbackNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RespondToFeedbackNotFoundError" as ErrorCode;
  constructor(message = "RespondToFeedbackNotFoundError") {
    super(message);
  }
}

export class ResolveFeedbackNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ResolveFeedbackNotFoundError" as ErrorCode;
  constructor(message = "ResolveFeedbackNotFoundError") {
    super(message);
  }
}

export class RemoveFeedbackNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveFeedbackNotFoundError" as ErrorCode;
  constructor(message = "RemoveFeedbackNotFoundError") {
    super(message);
  }
}

export const errors = {
  RespondToFeedback: { RespondToFeedbackNotFoundError },
  ResolveFeedback: { ResolveFeedbackNotFoundError },
  RemoveFeedback: { RemoveFeedbackNotFoundError },
};
