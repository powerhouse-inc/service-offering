export type ErrorCode =
  | "UpdateServiceGroupNotFoundError"
  | "DeleteServiceGroupNotFoundError"
  | "AddServiceGroupTierPricingNotFoundError"
  | "SetServiceGroupSetupCostNotFoundError"
  | "SetServiceGroupSetupCostTierPricingNotFoundError"
  | "RemoveServiceGroupSetupCostNotFoundError"
  | "RemoveServiceGroupSetupCostTierPricingNotFoundError"
  | "AddRecurringPriceOptionServiceGroupNotFoundError"
  | "AddRecurringPriceOptionTierPricingNotFoundError"
  | "UpdateRecurringPriceOptionServiceGroupNotFoundError"
  | "UpdateRecurringPriceOptionTierPricingNotFoundError"
  | "UpdateRecurringPriceOptionNotFoundError"
  | "RemoveRecurringPriceOptionServiceGroupNotFoundError"
  | "RemoveRecurringPriceOptionTierPricingNotFoundError"
  | "RemoveServiceGroupTierPricingNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class UpdateServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceGroupNotFoundError") {
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

export class AddServiceGroupTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddServiceGroupTierPricingNotFoundError" as ErrorCode;
  constructor(message = "AddServiceGroupTierPricingNotFoundError") {
    super(message);
  }
}

export class SetServiceGroupSetupCostNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetServiceGroupSetupCostNotFoundError" as ErrorCode;
  constructor(message = "SetServiceGroupSetupCostNotFoundError") {
    super(message);
  }
}

export class SetServiceGroupSetupCostTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "SetServiceGroupSetupCostTierPricingNotFoundError" as ErrorCode;
  constructor(message = "SetServiceGroupSetupCostTierPricingNotFoundError") {
    super(message);
  }
}

export class RemoveServiceGroupSetupCostNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceGroupSetupCostNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceGroupSetupCostNotFoundError") {
    super(message);
  }
}

export class RemoveServiceGroupSetupCostTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode =
    "RemoveServiceGroupSetupCostTierPricingNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceGroupSetupCostTierPricingNotFoundError") {
    super(message);
  }
}

export class AddRecurringPriceOptionServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddRecurringPriceOptionServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "AddRecurringPriceOptionServiceGroupNotFoundError") {
    super(message);
  }
}

export class AddRecurringPriceOptionTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddRecurringPriceOptionTierPricingNotFoundError" as ErrorCode;
  constructor(message = "AddRecurringPriceOptionTierPricingNotFoundError") {
    super(message);
  }
}

export class UpdateRecurringPriceOptionServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode =
    "UpdateRecurringPriceOptionServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "UpdateRecurringPriceOptionServiceGroupNotFoundError") {
    super(message);
  }
}

export class UpdateRecurringPriceOptionTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateRecurringPriceOptionTierPricingNotFoundError" as ErrorCode;
  constructor(message = "UpdateRecurringPriceOptionTierPricingNotFoundError") {
    super(message);
  }
}

export class UpdateRecurringPriceOptionNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateRecurringPriceOptionNotFoundError" as ErrorCode;
  constructor(message = "UpdateRecurringPriceOptionNotFoundError") {
    super(message);
  }
}

export class RemoveRecurringPriceOptionServiceGroupNotFoundError
  extends Error
  implements ReducerError
{
  errorCode =
    "RemoveRecurringPriceOptionServiceGroupNotFoundError" as ErrorCode;
  constructor(message = "RemoveRecurringPriceOptionServiceGroupNotFoundError") {
    super(message);
  }
}

export class RemoveRecurringPriceOptionTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveRecurringPriceOptionTierPricingNotFoundError" as ErrorCode;
  constructor(message = "RemoveRecurringPriceOptionTierPricingNotFoundError") {
    super(message);
  }
}

export class RemoveServiceGroupTierPricingNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceGroupTierPricingNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceGroupTierPricingNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateServiceGroup: { UpdateServiceGroupNotFoundError },
  DeleteServiceGroup: { DeleteServiceGroupNotFoundError },
  AddServiceGroupTierPricing: { AddServiceGroupTierPricingNotFoundError },
  SetServiceGroupSetupCost: {
    SetServiceGroupSetupCostNotFoundError,
    SetServiceGroupSetupCostTierPricingNotFoundError,
  },
  RemoveServiceGroupSetupCost: {
    RemoveServiceGroupSetupCostNotFoundError,
    RemoveServiceGroupSetupCostTierPricingNotFoundError,
  },
  AddRecurringPriceOption: {
    AddRecurringPriceOptionServiceGroupNotFoundError,
    AddRecurringPriceOptionTierPricingNotFoundError,
  },
  UpdateRecurringPriceOption: {
    UpdateRecurringPriceOptionServiceGroupNotFoundError,
    UpdateRecurringPriceOptionTierPricingNotFoundError,
    UpdateRecurringPriceOptionNotFoundError,
  },
  RemoveRecurringPriceOption: {
    RemoveRecurringPriceOptionServiceGroupNotFoundError,
    RemoveRecurringPriceOptionTierPricingNotFoundError,
  },
  RemoveServiceGroupTierPricing: { RemoveServiceGroupTierPricingNotFoundError },
};
