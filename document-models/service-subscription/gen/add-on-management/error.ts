export type ErrorCode = "DuplicateAddonIdError" | "AddonNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateAddonIdError extends Error implements ReducerError {
  errorCode = "DuplicateAddonIdError" as ErrorCode;
  constructor(message = "DuplicateAddonIdError") {
    super(message);
  }
}

export class AddonNotFoundError extends Error implements ReducerError {
  errorCode = "AddonNotFoundError" as ErrorCode;
  constructor(message = "AddonNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddAddon: { DuplicateAddonIdError },
  RemoveAddon: { AddonNotFoundError },
};
