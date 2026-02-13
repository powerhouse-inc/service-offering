import type { Action } from "document-model";
import type {
  AddTemplateInput,
  UpdateTemplateInput,
  RemoveTemplateInput,
  SetTemplateModeInput,
  ApplyTemplateInput,
} from "../types.js";

export type AddTemplateAction = Action & {
  type: "ADD_TEMPLATE";
  input: AddTemplateInput;
};
export type UpdateTemplateAction = Action & {
  type: "UPDATE_TEMPLATE";
  input: UpdateTemplateInput;
};
export type RemoveTemplateAction = Action & {
  type: "REMOVE_TEMPLATE";
  input: RemoveTemplateInput;
};
export type SetTemplateModeAction = Action & {
  type: "SET_TEMPLATE_MODE";
  input: SetTemplateModeInput;
};
export type ApplyTemplateAction = Action & {
  type: "APPLY_TEMPLATE";
  input: ApplyTemplateInput;
};

export type WorkBreakdownTemplatesAction =
  | AddTemplateAction
  | UpdateTemplateAction
  | RemoveTemplateAction
  | SetTemplateModeAction
  | ApplyTemplateAction;
