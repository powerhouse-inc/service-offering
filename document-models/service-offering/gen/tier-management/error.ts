export type ErrorCode =
  | "DuplicateTierIdError"
  | "UpdateTierNotFoundError"
  | "UpdatePricingTierNotFoundError"
  | "DeleteTierNotFoundError"
  | "AddPricingOptionTierNotFoundError"
  | "UpdatePricingOptionTierNotFoundError"
  | "PricingOptionNotFoundError"
  | "RemovePricingOptionTierNotFoundError"
  | "RemovePricingOptionNotFoundError"
  | "AddServiceLevelTierNotFoundError"
  | "DuplicateServiceLevelIdError"
  | "UpdateServiceLevelTierNotFoundError"
  | "UpdateServiceLevelNotFoundError"
  | "RemoveServiceLevelTierNotFoundError"
  | "RemoveServiceLevelNotFoundError"
  | "AddUsageLimitTierNotFoundError"
  | "DuplicateUsageLimitIdError"
  | "UpdateUsageLimitTierNotFoundError"
  | "UpdateUsageLimitNotFoundError"
  | "RemoveUsageLimitTierNotFoundError"
  | "RemoveUsageLimitNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateTierIdError extends Error implements ReducerError {
  errorCode = "DuplicateTierIdError" as ErrorCode;
  constructor(message = "DuplicateTierIdError") {
    super(message);
  }
}

export class UpdateTierNotFoundError extends Error implements ReducerError {
  errorCode = "UpdateTierNotFoundError" as ErrorCode;
  constructor(message = "UpdateTierNotFoundError") {
    super(message);
  }
}

export class UpdatePricingTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdatePricingTierNotFoundError" as ErrorCode;
  constructor(message = "UpdatePricingTierNotFoundError") {
    super(message);
  }
}

export class DeleteTierNotFoundError extends Error implements ReducerError {
  errorCode = "DeleteTierNotFoundError" as ErrorCode;
  constructor(message = "DeleteTierNotFoundError") {
    super(message);
  }
}

export class AddPricingOptionTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddPricingOptionTierNotFoundError" as ErrorCode;
  constructor(message = "AddPricingOptionTierNotFoundError") {
    super(message);
  }
}

export class UpdatePricingOptionTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdatePricingOptionTierNotFoundError" as ErrorCode;
  constructor(message = "UpdatePricingOptionTierNotFoundError") {
    super(message);
  }
}

export class PricingOptionNotFoundError extends Error implements ReducerError {
  errorCode = "PricingOptionNotFoundError" as ErrorCode;
  constructor(message = "PricingOptionNotFoundError") {
    super(message);
  }
}

export class RemovePricingOptionTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemovePricingOptionTierNotFoundError" as ErrorCode;
  constructor(message = "RemovePricingOptionTierNotFoundError") {
    super(message);
  }
}

export class RemovePricingOptionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemovePricingOptionNotFoundError" as ErrorCode;
  constructor(message = "RemovePricingOptionNotFoundError") {
    super(message);
  }
}

export class AddServiceLevelTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddServiceLevelTierNotFoundError" as ErrorCode;
  constructor(message = "AddServiceLevelTierNotFoundError") {
    super(message);
  }
}

export class DuplicateServiceLevelIdError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateServiceLevelIdError" as ErrorCode;
  constructor(message = "DuplicateServiceLevelIdError") {
    super(message);
  }
}

export class UpdateServiceLevelTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateServiceLevelTierNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceLevelTierNotFoundError") {
    super(message);
  }
}

export class UpdateServiceLevelNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateServiceLevelNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceLevelNotFoundError") {
    super(message);
  }
}

export class RemoveServiceLevelTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceLevelTierNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceLevelTierNotFoundError") {
    super(message);
  }
}

export class RemoveServiceLevelNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceLevelNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceLevelNotFoundError") {
    super(message);
  }
}

export class AddUsageLimitTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddUsageLimitTierNotFoundError" as ErrorCode;
  constructor(message = "AddUsageLimitTierNotFoundError") {
    super(message);
  }
}

export class DuplicateUsageLimitIdError extends Error implements ReducerError {
  errorCode = "DuplicateUsageLimitIdError" as ErrorCode;
  constructor(message = "DuplicateUsageLimitIdError") {
    super(message);
  }
}

export class UpdateUsageLimitTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateUsageLimitTierNotFoundError" as ErrorCode;
  constructor(message = "UpdateUsageLimitTierNotFoundError") {
    super(message);
  }
}

export class UpdateUsageLimitNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateUsageLimitNotFoundError" as ErrorCode;
  constructor(message = "UpdateUsageLimitNotFoundError") {
    super(message);
  }
}

export class RemoveUsageLimitTierNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveUsageLimitTierNotFoundError" as ErrorCode;
  constructor(message = "RemoveUsageLimitTierNotFoundError") {
    super(message);
  }
}

export class RemoveUsageLimitNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveUsageLimitNotFoundError" as ErrorCode;
  constructor(message = "RemoveUsageLimitNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddTier: { DuplicateTierIdError },
  UpdateTier: { UpdateTierNotFoundError },
  UpdateTierPricing: { UpdatePricingTierNotFoundError },
  DeleteTier: { DeleteTierNotFoundError },
  AddTierPricingOption: { AddPricingOptionTierNotFoundError },
  UpdateTierPricingOption: {
    UpdatePricingOptionTierNotFoundError,
    PricingOptionNotFoundError,
  },
  RemoveTierPricingOption: {
    RemovePricingOptionTierNotFoundError,
    RemovePricingOptionNotFoundError,
  },
  AddServiceLevel: {
    AddServiceLevelTierNotFoundError,
    DuplicateServiceLevelIdError,
  },
  UpdateServiceLevel: {
    UpdateServiceLevelTierNotFoundError,
    UpdateServiceLevelNotFoundError,
  },
  RemoveServiceLevel: {
    RemoveServiceLevelTierNotFoundError,
    RemoveServiceLevelNotFoundError,
  },
  AddUsageLimit: { AddUsageLimitTierNotFoundError, DuplicateUsageLimitIdError },
  UpdateUsageLimit: {
    UpdateUsageLimitTierNotFoundError,
    UpdateUsageLimitNotFoundError,
  },
  RemoveUsageLimit: {
    RemoveUsageLimitTierNotFoundError,
    RemoveUsageLimitNotFoundError,
  },
};
