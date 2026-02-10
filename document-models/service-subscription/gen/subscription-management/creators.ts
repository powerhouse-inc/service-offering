import { createAction } from "document-model/core";
import {
  InitializeSubscriptionInputSchema,
  ActivateSubscriptionInputSchema,
  CancelSubscriptionInputSchema,
  ExpireSubscriptionInputSchema,
} from "../schema/zod.js";
import type {
  InitializeSubscriptionInput,
  ActivateSubscriptionInput,
  CancelSubscriptionInput,
  ExpireSubscriptionInput,
} from "../types.js";
import type {
  InitializeSubscriptionAction,
  ActivateSubscriptionAction,
  CancelSubscriptionAction,
  ExpireSubscriptionAction,
} from "./actions.js";

export const initializeSubscription = (input: InitializeSubscriptionInput) =>
  createAction<InitializeSubscriptionAction>(
    "INITIALIZE_SUBSCRIPTION",
    { ...input },
    undefined,
    InitializeSubscriptionInputSchema,
    "global",
  );

export const activateSubscription = (input: ActivateSubscriptionInput) =>
  createAction<ActivateSubscriptionAction>(
    "ACTIVATE_SUBSCRIPTION",
    { ...input },
    undefined,
    ActivateSubscriptionInputSchema,
    "global",
  );

export const cancelSubscription = (input: CancelSubscriptionInput) =>
  createAction<CancelSubscriptionAction>(
    "CANCEL_SUBSCRIPTION",
    { ...input },
    undefined,
    CancelSubscriptionInputSchema,
    "global",
  );

export const expireSubscription = (input: ExpireSubscriptionInput) =>
  createAction<ExpireSubscriptionAction>(
    "EXPIRE_SUBSCRIPTION",
    { ...input },
    undefined,
    ExpireSubscriptionInputSchema,
    "global",
  );
