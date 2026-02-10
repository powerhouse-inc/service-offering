export type ErrorCode = "SubscriptionStillActiveError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class SubscriptionStillActiveError
  extends Error
  implements ReducerError
{
  errorCode = "SubscriptionStillActiveError" as ErrorCode;
  constructor(message = "SubscriptionStillActiveError") {
    super(message);
  }
}

export const errors = {
  ExpireSubscription: { SubscriptionStillActiveError },
};
