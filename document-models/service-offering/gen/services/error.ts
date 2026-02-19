export type ErrorCode =
  | "UpdateServiceNotFoundError"
  | "DeleteServiceNotFoundError"
  | "AddFacetBindingServiceNotFoundError"
  | "RemoveFacetBindingServiceNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateServiceNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateServiceNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceNotFoundError") {
    super(message);
  }
}

export class DeleteServiceNotFoundError extends Error implements ReducerError {
  errorCode = "DeleteServiceNotFoundError" as ErrorCode;
  constructor(message = "DeleteServiceNotFoundError") {
    super(message);
  }
}

export class AddFacetBindingServiceNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddFacetBindingServiceNotFoundError" as ErrorCode;
  constructor(message = "AddFacetBindingServiceNotFoundError") {
    super(message);
  }
}

export class RemoveFacetBindingServiceNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveFacetBindingServiceNotFoundError" as ErrorCode;
  constructor(message = "RemoveFacetBindingServiceNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateService: { UpdateServiceNotFoundError },
  DeleteService: { DeleteServiceNotFoundError },
  AddFacetBinding: { AddFacetBindingServiceNotFoundError },
  RemoveFacetBinding: { RemoveFacetBindingServiceNotFoundError },
};
