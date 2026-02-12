import type { Action } from "document-model";
import type {
  CreateClientRequestInput,
  ApproveRequestInput,
  RejectRequestInput,
} from "../types.js";

export type CreateClientRequestAction = Action & {
  type: "CREATE_CLIENT_REQUEST";
  input: CreateClientRequestInput;
};
export type ApproveRequestAction = Action & {
  type: "APPROVE_REQUEST";
  input: ApproveRequestInput;
};
export type RejectRequestAction = Action & {
  type: "REJECT_REQUEST";
  input: RejectRequestInput;
};

export type SubscriptionInstanceRequestsAction =
  | CreateClientRequestAction
  | ApproveRequestAction
  | RejectRequestAction;
