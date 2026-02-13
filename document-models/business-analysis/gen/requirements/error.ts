export type ErrorCode =
  | "UpdateRequirementNotFoundError"
  | "RemoveRequirementNotFoundError"
  | "SetRequirementStatusNotFoundError"
  | "AddAcceptanceCriterionRequirementNotFoundError"
  | "UpdateAcceptanceCriterionNotFoundError"
  | "RemoveAcceptanceCriterionNotFoundError"
  | "LinkRequirementsNotFoundError"
  | "UpdateRequirementCategoryNotFoundError"
  | "RemoveRequirementCategoryNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateRequirementNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateRequirementNotFoundError" as ErrorCode;
  constructor(message = "UpdateRequirementNotFoundError") {
    super(message);
  }
}

export class RemoveRequirementNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveRequirementNotFoundError" as ErrorCode;
  constructor(message = "RemoveRequirementNotFoundError") {
    super(message);
  }
}

export class SetRequirementStatusNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetRequirementStatusNotFoundError" as ErrorCode;
  constructor(message = "SetRequirementStatusNotFoundError") {
    super(message);
  }
}

export class AddAcceptanceCriterionRequirementNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddAcceptanceCriterionRequirementNotFoundError" as ErrorCode;
  constructor(message = "AddAcceptanceCriterionRequirementNotFoundError") {
    super(message);
  }
}

export class UpdateAcceptanceCriterionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateAcceptanceCriterionNotFoundError" as ErrorCode;
  constructor(message = "UpdateAcceptanceCriterionNotFoundError") {
    super(message);
  }
}

export class RemoveAcceptanceCriterionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveAcceptanceCriterionNotFoundError" as ErrorCode;
  constructor(message = "RemoveAcceptanceCriterionNotFoundError") {
    super(message);
  }
}

export class LinkRequirementsNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "LinkRequirementsNotFoundError" as ErrorCode;
  constructor(message = "LinkRequirementsNotFoundError") {
    super(message);
  }
}

export class UpdateRequirementCategoryNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateRequirementCategoryNotFoundError" as ErrorCode;
  constructor(message = "UpdateRequirementCategoryNotFoundError") {
    super(message);
  }
}

export class RemoveRequirementCategoryNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveRequirementCategoryNotFoundError" as ErrorCode;
  constructor(message = "RemoveRequirementCategoryNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateRequirement: { UpdateRequirementNotFoundError },
  RemoveRequirement: { RemoveRequirementNotFoundError },
  SetRequirementStatus: { SetRequirementStatusNotFoundError },
  AddAcceptanceCriterion: { AddAcceptanceCriterionRequirementNotFoundError },
  UpdateAcceptanceCriterion: { UpdateAcceptanceCriterionNotFoundError },
  RemoveAcceptanceCriterion: { RemoveAcceptanceCriterionNotFoundError },
  LinkRequirements: { LinkRequirementsNotFoundError },
  UpdateRequirementCategory: { UpdateRequirementCategoryNotFoundError },
  RemoveRequirementCategory: { RemoveRequirementCategoryNotFoundError },
};
