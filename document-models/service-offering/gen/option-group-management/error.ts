export type ErrorCode =
  | "DuplicateOptionGroupIdError"
  | "UpdateOptionGroupNotFoundError"
  | "DeleteOptionGroupNotFoundError"
  | "SetStandaloneOptionGroupNotFoundError"
  | "AddTierPricingOptionGroupNotFoundError"
  | "DuplicateOptionGroupTierPricingIdError"
  | "UpdateTierPricingOptionGroupNotFoundError"
  | "UpdateTierPricingOptionGroupTierNotFoundError"
  | "RemoveTierPricingOptionGroupNotFoundError"
  | "RemoveTierPricingOptionGroupTierNotFoundError"
  | "SetDiscountModeGroupNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateOptionGroupIdError extends Error implements ReducerError {
  errorCode = "DuplicateOptionGroupIdError" as ErrorCode;
  constructor(message = "DuplicateOptionGroupIdError") {
    super(message);
  }
}

export class UpdateOptionGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateOptionGroupNotFoundError" as ErrorCode;
  constructor(message = "UpdateOptionGroupNotFoundError") {
    super(message);
  }
}

export class DeleteOptionGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "DeleteOptionGroupNotFoundError" as ErrorCode;
  constructor(message = "DeleteOptionGroupNotFoundError") {
    super(message);
  }
}

export class SetStandaloneOptionGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetStandaloneOptionGroupNotFoundError" as ErrorCode;
  constructor(message = "SetStandaloneOptionGroupNotFoundError") {
    super(message);
  }
}

export class AddTierPricingOptionGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddTierPricingOptionGroupNotFoundError" as ErrorCode;
  constructor(message = "AddTierPricingOptionGroupNotFoundError") {
    super(message);
  }
}

export class DuplicateOptionGroupTierPricingIdError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateOptionGroupTierPricingIdError" as ErrorCode;
  constructor(message = "DuplicateOptionGroupTierPricingIdError") {
    super(message);
  }
}

export class UpdateTierPricingOptionGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateTierPricingOptionGroupNotFoundError" as ErrorCode;
  constructor(message = "UpdateTierPricingOptionGroupNotFoundError") {
    super(message);
  }
}

export class UpdateTierPricingOptionGroupTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateTierPricingOptionGroupTierNotFoundError" as ErrorCode;
  constructor(message = "UpdateTierPricingOptionGroupTierNotFoundError") {
    super(message);
  }
}

export class RemoveTierPricingOptionGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveTierPricingOptionGroupNotFoundError" as ErrorCode;
  constructor(message = "RemoveTierPricingOptionGroupNotFoundError") {
    super(message);
  }
}

export class RemoveTierPricingOptionGroupTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveTierPricingOptionGroupTierNotFoundError" as ErrorCode;
  constructor(message = "RemoveTierPricingOptionGroupTierNotFoundError") {
    super(message);
  }
}

export class SetDiscountModeGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetDiscountModeGroupNotFoundError" as ErrorCode;
  constructor(message = "SetDiscountModeGroupNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddOptionGroup: { DuplicateOptionGroupIdError },
  UpdateOptionGroup: { UpdateOptionGroupNotFoundError },
  DeleteOptionGroup: { DeleteOptionGroupNotFoundError },
  SetOptionGroupStandalonePricing: { SetStandaloneOptionGroupNotFoundError },
  AddOptionGroupTierPricing: {
    AddTierPricingOptionGroupNotFoundError,
    DuplicateOptionGroupTierPricingIdError,
  },
  UpdateOptionGroupTierPricing: {
    UpdateTierPricingOptionGroupNotFoundError,
    UpdateTierPricingOptionGroupTierNotFoundError,
  },
  RemoveOptionGroupTierPricing: {
    RemoveTierPricingOptionGroupNotFoundError,
    RemoveTierPricingOptionGroupTierNotFoundError,
  },
  SetOptionGroupDiscountMode: { SetDiscountModeGroupNotFoundError },
};
