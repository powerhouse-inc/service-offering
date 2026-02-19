export type ErrorCode =
  | "DuplicateServiceGroupIdError"
  | "ServiceGroupNotFoundError"
  | "DeleteServiceGroupNotFoundError"
  | "ReorderServiceGroupNotFoundError"
  | "AddTierPricingServiceGroupNotFoundError"
  | "AddPricingTierNotFoundError"
  | "DuplicateTierPricingIdError"
  | "SetSetupServiceGroupNotFoundError"
  | "SetSetupTierPricingNotFoundError"
  | "RemoveSetupServiceGroupNotFoundError"
  | "RemoveSetupTierPricingNotFoundError"
  | "AddRecurringServiceGroupNotFoundError"
  | "AddRecurringTierPricingNotFoundError"
  | "DuplicatePriceOptionIdError"
  | "UpdateRecurringServiceGroupNotFoundError"
  | "UpdateRecurringTierPricingNotFoundError"
  | "UpdatePriceOptionNotFoundError"
  | "RemoveRecurringServiceGroupNotFoundError"
  | "RemoveRecurringTierPricingNotFoundError"
  | "RemovePriceOptionNotFoundError"
  | "RemoveTierPricingServiceGroupNotFoundError"
  | "RemoveTierPricingNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateServiceGroupIdError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateServiceGroupIdError" as ErrorCode;
  constructor(message = "DuplicateServiceGroupIdError") {
    super(message);
  }
}

export class ServiceGroupNotFoundError extends Error implements ReducerError {
  errorCode = "ServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "ServiceGroupNotFoundError") {
    super(message);
  }
}

export class DeleteServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "DeleteServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "DeleteServiceGroupNotFoundError") {
    super(message);
  }
}

export class ReorderServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ReorderServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "ReorderServiceGroupNotFoundError") {
    super(message);
  }
}

export class AddTierPricingServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddTierPricingServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "AddTierPricingServiceGroupNotFoundError") {
    super(message);
  }
}

export class AddPricingTierNotFoundError extends Error implements ReducerError {
  errorCode = "AddPricingTierNotFoundError" as ErrorCode;
  constructor(message = "AddPricingTierNotFoundError") {
    super(message);
  }
}

export class DuplicateTierPricingIdError extends Error implements ReducerError {
  errorCode = "DuplicateTierPricingIdError" as ErrorCode;
  constructor(message = "DuplicateTierPricingIdError") {
    super(message);
  }
}

export class SetSetupServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetSetupServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "SetSetupServiceGroupNotFoundError") {
    super(message);
  }
}

export class SetSetupTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetSetupTierPricingNotFoundError" as ErrorCode;
  constructor(message = "SetSetupTierPricingNotFoundError") {
    super(message);
  }
}

export class RemoveSetupServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveSetupServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "RemoveSetupServiceGroupNotFoundError") {
    super(message);
  }
}

export class RemoveSetupTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveSetupTierPricingNotFoundError" as ErrorCode;
  constructor(message = "RemoveSetupTierPricingNotFoundError") {
    super(message);
  }
}

export class AddRecurringServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddRecurringServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "AddRecurringServiceGroupNotFoundError") {
    super(message);
  }
}

export class AddRecurringTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddRecurringTierPricingNotFoundError" as ErrorCode;
  constructor(message = "AddRecurringTierPricingNotFoundError") {
    super(message);
  }
}

export class DuplicatePriceOptionIdError extends Error implements ReducerError {
  errorCode = "DuplicatePriceOptionIdError" as ErrorCode;
  constructor(message = "DuplicatePriceOptionIdError") {
    super(message);
  }
}

export class UpdateRecurringServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateRecurringServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "UpdateRecurringServiceGroupNotFoundError") {
    super(message);
  }
}

export class UpdateRecurringTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateRecurringTierPricingNotFoundError" as ErrorCode;
  constructor(message = "UpdateRecurringTierPricingNotFoundError") {
    super(message);
  }
}

export class UpdatePriceOptionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdatePriceOptionNotFoundError" as ErrorCode;
  constructor(message = "UpdatePriceOptionNotFoundError") {
    super(message);
  }
}

export class RemoveRecurringServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveRecurringServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "RemoveRecurringServiceGroupNotFoundError") {
    super(message);
  }
}

export class RemoveRecurringTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveRecurringTierPricingNotFoundError" as ErrorCode;
  constructor(message = "RemoveRecurringTierPricingNotFoundError") {
    super(message);
  }
}

export class RemovePriceOptionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemovePriceOptionNotFoundError" as ErrorCode;
  constructor(message = "RemovePriceOptionNotFoundError") {
    super(message);
  }
}

export class RemoveTierPricingServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveTierPricingServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "RemoveTierPricingServiceGroupNotFoundError") {
    super(message);
  }
}

export class RemoveTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveTierPricingNotFoundError" as ErrorCode;
  constructor(message = "RemoveTierPricingNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddServiceGroup: { DuplicateServiceGroupIdError },
  UpdateServiceGroup: { ServiceGroupNotFoundError },
  DeleteServiceGroup: { DeleteServiceGroupNotFoundError },
  ReorderServiceGroups: { ReorderServiceGroupNotFoundError },
  AddServiceGroupTierPricing: {
    AddTierPricingServiceGroupNotFoundError,
    AddPricingTierNotFoundError,
    DuplicateTierPricingIdError,
  },
  SetServiceGroupSetupCost: {
    SetSetupServiceGroupNotFoundError,
    SetSetupTierPricingNotFoundError,
  },
  RemoveServiceGroupSetupCost: {
    RemoveSetupServiceGroupNotFoundError,
    RemoveSetupTierPricingNotFoundError,
  },
  AddRecurringPriceOption: {
    AddRecurringServiceGroupNotFoundError,
    AddRecurringTierPricingNotFoundError,
    DuplicatePriceOptionIdError,
  },
  UpdateRecurringPriceOption: {
    UpdateRecurringServiceGroupNotFoundError,
    UpdateRecurringTierPricingNotFoundError,
    UpdatePriceOptionNotFoundError,
  },
  RemoveRecurringPriceOption: {
    RemoveRecurringServiceGroupNotFoundError,
    RemoveRecurringTierPricingNotFoundError,
    RemovePriceOptionNotFoundError,
  },
  RemoveServiceGroupTierPricing: {
    RemoveTierPricingServiceGroupNotFoundError,
    RemoveTierPricingNotFoundError,
  },
};
