export type ErrorCode =
  | "DuplicateTargetAudienceIdError"
  | "TargetAudienceNotFoundError"
  | "FacetTargetNotFoundError"
  | "AddFacetOptionTargetNotFoundError"
  | "TemplateAlreadySelectedError"
  | "NoTemplateSelectedError"
  | "TemplateMismatchError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateTargetAudienceIdError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateTargetAudienceIdError" as ErrorCode;
  constructor(message = "DuplicateTargetAudienceIdError") {
    super(message);
  }
}

export class TargetAudienceNotFoundError extends Error implements ReducerError {
  errorCode = "TargetAudienceNotFoundError" as ErrorCode;
  constructor(message = "TargetAudienceNotFoundError") {
    super(message);
  }
}

export class FacetTargetNotFoundError extends Error implements ReducerError {
  errorCode = "FacetTargetNotFoundError" as ErrorCode;
  constructor(message = "FacetTargetNotFoundError") {
    super(message);
  }
}

export class AddFacetOptionTargetNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddFacetOptionTargetNotFoundError" as ErrorCode;
  constructor(message = "AddFacetOptionTargetNotFoundError") {
    super(message);
  }
}

export class TemplateAlreadySelectedError
  extends Error
  implements ReducerError
{
  errorCode = "TemplateAlreadySelectedError" as ErrorCode;
  constructor(message = "TemplateAlreadySelectedError") {
    super(message);
  }
}

export class NoTemplateSelectedError extends Error implements ReducerError {
  errorCode = "NoTemplateSelectedError" as ErrorCode;
  constructor(message = "NoTemplateSelectedError") {
    super(message);
  }
}

export class TemplateMismatchError extends Error implements ReducerError {
  errorCode = "TemplateMismatchError" as ErrorCode;
  constructor(message = "TemplateMismatchError") {
    super(message);
  }
}

export const errors = {
  AddTargetAudience: { DuplicateTargetAudienceIdError },
  RemoveTargetAudience: { TargetAudienceNotFoundError },
  RemoveFacetTarget: { FacetTargetNotFoundError },
  AddFacetOption: { AddFacetOptionTargetNotFoundError },
  SelectResourceTemplate: { TemplateAlreadySelectedError },
  ChangeResourceTemplate: { NoTemplateSelectedError, TemplateMismatchError },
};
