import { createAction } from "document-model/core";
import {
  CreateClientRequestInputSchema,
  ApproveRequestInputSchema,
  RejectRequestInputSchema,
} from "../schema/zod.js";
import type {
  CreateClientRequestInput,
  ApproveRequestInput,
  RejectRequestInput,
} from "../types.js";
import type {
  CreateClientRequestAction,
  ApproveRequestAction,
  RejectRequestAction,
} from "./actions.js";

export const createClientRequest = (input: CreateClientRequestInput) =>
  createAction<CreateClientRequestAction>(
    "CREATE_CLIENT_REQUEST",
    { ...input },
    undefined,
    CreateClientRequestInputSchema,
    "global",
  );

export const approveRequest = (input: ApproveRequestInput) =>
  createAction<ApproveRequestAction>(
    "APPROVE_REQUEST",
    { ...input },
    undefined,
    ApproveRequestInputSchema,
    "global",
  );

export const rejectRequest = (input: RejectRequestInput) =>
  createAction<RejectRequestAction>(
    "REJECT_REQUEST",
    { ...input },
    undefined,
    RejectRequestInputSchema,
    "global",
  );
