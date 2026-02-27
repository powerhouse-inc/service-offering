export type ErrorCode = "RemoveNoteNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class RemoveNoteNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveNoteNotFoundError" as ErrorCode;
  constructor(message = "RemoveNoteNotFoundError") {
    super(message);
  }
}

export const errors = {
  RemoveNote: { RemoveNoteNotFoundError },
};
