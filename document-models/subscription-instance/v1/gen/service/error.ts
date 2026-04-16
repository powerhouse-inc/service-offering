export type ErrorCode =
  | "SubscriptionNotActiveAddServiceError"
  | "RemoveServiceNotFoundError"
  | "SubscriptionNotActiveRemoveServiceError"
  | "UpdateServiceSetupCostNotFoundError"
  | "UpdateServiceRecurringCostNotFoundError"
  | "ReportSetupPaymentServiceNotFoundError"
  | "ReportRecurringPaymentServiceNotFoundError"
  | "UpdateServiceInfoNotFoundError"
  | "AddServiceFacetSelectionServiceNotFoundError"
  | "RemoveServiceFacetSelectionServiceNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class SubscriptionNotActiveAddServiceError
  extends Error
  implements ReducerError
{
  errorCode = "SubscriptionNotActiveAddServiceError" as ErrorCode;
  constructor(message = "SubscriptionNotActiveAddServiceError") {
    super(message);
  }
}

export class RemoveServiceNotFoundError extends Error implements ReducerError {
  errorCode = "RemoveServiceNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceNotFoundError") {
    super(message);
  }
}

export class SubscriptionNotActiveRemoveServiceError
  extends Error
  implements ReducerError
{
  errorCode = "SubscriptionNotActiveRemoveServiceError" as ErrorCode;
  constructor(message = "SubscriptionNotActiveRemoveServiceError") {
    super(message);
  }
}

export class UpdateServiceSetupCostNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateServiceSetupCostNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceSetupCostNotFoundError") {
    super(message);
  }
}

export class UpdateServiceRecurringCostNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateServiceRecurringCostNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceRecurringCostNotFoundError") {
    super(message);
  }
}

export class ReportSetupPaymentServiceNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ReportSetupPaymentServiceNotFoundError" as ErrorCode;
  constructor(message = "ReportSetupPaymentServiceNotFoundError") {
    super(message);
  }
}

export class ReportRecurringPaymentServiceNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ReportRecurringPaymentServiceNotFoundError" as ErrorCode;
  constructor(message = "ReportRecurringPaymentServiceNotFoundError") {
    super(message);
  }
}

export class UpdateServiceInfoNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "UpdateServiceInfoNotFoundError" as ErrorCode;
  constructor(message = "UpdateServiceInfoNotFoundError") {
    super(message);
  }
}

export class AddServiceFacetSelectionServiceNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "AddServiceFacetSelectionServiceNotFoundError" as ErrorCode;
  constructor(message = "AddServiceFacetSelectionServiceNotFoundError") {
    super(message);
  }
}

export class RemoveServiceFacetSelectionServiceNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "RemoveServiceFacetSelectionServiceNotFoundError" as ErrorCode;
  constructor(message = "RemoveServiceFacetSelectionServiceNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddService: { SubscriptionNotActiveAddServiceError },
  RemoveService: {
    RemoveServiceNotFoundError,
    SubscriptionNotActiveRemoveServiceError,
  },
  UpdateServiceSetupCost: { UpdateServiceSetupCostNotFoundError },
  UpdateServiceRecurringCost: { UpdateServiceRecurringCostNotFoundError },
  ReportSetupPayment: { ReportSetupPaymentServiceNotFoundError },
  ReportRecurringPayment: { ReportRecurringPaymentServiceNotFoundError },
  UpdateServiceInfo: { UpdateServiceInfoNotFoundError },
  AddServiceFacetSelection: { AddServiceFacetSelectionServiceNotFoundError },
  RemoveServiceFacetSelection: {
    RemoveServiceFacetSelectionServiceNotFoundError,
  },
};
