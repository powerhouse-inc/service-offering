import type { Action } from "document-model";
import type {
  UpdateTemplateInfoInput,
  UpdateTemplateStatusInput,
  SetOperatorInput,
  SetTemplateIdInput,
} from "../types.js";

export type UpdateTemplateInfoAction = Action & {
  type: "UPDATE_TEMPLATE_INFO";
  input: UpdateTemplateInfoInput;
};
export type UpdateTemplateStatusAction = Action & {
  type: "UPDATE_TEMPLATE_STATUS";
  input: UpdateTemplateStatusInput;
};
export type SetOperatorAction = Action & {
  type: "SET_OPERATOR";
  input: SetOperatorInput;
};
export type SetTemplateIdAction = Action & {
  type: "SET_TEMPLATE_ID";
  input: SetTemplateIdInput;
};

export type ResourceTemplateTemplateManagementAction =
  | UpdateTemplateInfoAction
  | UpdateTemplateStatusAction
  | SetOperatorAction
  | SetTemplateIdAction;
