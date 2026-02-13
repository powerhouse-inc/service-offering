import { createAction } from "document-model/core";
import {
  AddTemplateInputSchema,
  UpdateTemplateInputSchema,
  RemoveTemplateInputSchema,
  SetTemplateModeInputSchema,
  ApplyTemplateInputSchema,
} from "../schema/zod.js";
import type {
  AddTemplateInput,
  UpdateTemplateInput,
  RemoveTemplateInput,
  SetTemplateModeInput,
  ApplyTemplateInput,
} from "../types.js";
import type {
  AddTemplateAction,
  UpdateTemplateAction,
  RemoveTemplateAction,
  SetTemplateModeAction,
  ApplyTemplateAction,
} from "./actions.js";

export const addTemplate = (input: AddTemplateInput) =>
  createAction<AddTemplateAction>(
    "ADD_TEMPLATE",
    { ...input },
    undefined,
    AddTemplateInputSchema,
    "global",
  );

export const updateTemplate = (input: UpdateTemplateInput) =>
  createAction<UpdateTemplateAction>(
    "UPDATE_TEMPLATE",
    { ...input },
    undefined,
    UpdateTemplateInputSchema,
    "global",
  );

export const removeTemplate = (input: RemoveTemplateInput) =>
  createAction<RemoveTemplateAction>(
    "REMOVE_TEMPLATE",
    { ...input },
    undefined,
    RemoveTemplateInputSchema,
    "global",
  );

export const setTemplateMode = (input: SetTemplateModeInput) =>
  createAction<SetTemplateModeAction>(
    "SET_TEMPLATE_MODE",
    { ...input },
    undefined,
    SetTemplateModeInputSchema,
    "global",
  );

export const applyTemplate = (input: ApplyTemplateInput) =>
  createAction<ApplyTemplateAction>(
    "APPLY_TEMPLATE",
    { ...input },
    undefined,
    ApplyTemplateInputSchema,
    "global",
  );
