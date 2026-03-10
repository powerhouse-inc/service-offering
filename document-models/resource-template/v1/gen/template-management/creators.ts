import { createAction } from "document-model/core";
import {
  UpdateTemplateInfoInputSchema,
  UpdateTemplateStatusInputSchema,
  SetOperatorInputSchema,
  SetTemplateIdInputSchema,
} from "../schema/zod.js";
import type {
  UpdateTemplateInfoInput,
  UpdateTemplateStatusInput,
  SetOperatorInput,
  SetTemplateIdInput,
} from "../types.js";
import type {
  UpdateTemplateInfoAction,
  UpdateTemplateStatusAction,
  SetOperatorAction,
  SetTemplateIdAction,
} from "./actions.js";

export const updateTemplateInfo = (input: UpdateTemplateInfoInput) =>
  createAction<UpdateTemplateInfoAction>(
    "UPDATE_TEMPLATE_INFO",
    { ...input },
    undefined,
    UpdateTemplateInfoInputSchema,
    "global",
  );

export const updateTemplateStatus = (input: UpdateTemplateStatusInput) =>
  createAction<UpdateTemplateStatusAction>(
    "UPDATE_TEMPLATE_STATUS",
    { ...input },
    undefined,
    UpdateTemplateStatusInputSchema,
    "global",
  );

export const setOperator = (input: SetOperatorInput) =>
  createAction<SetOperatorAction>(
    "SET_OPERATOR",
    { ...input },
    undefined,
    SetOperatorInputSchema,
    "global",
  );

export const setTemplateId = (input: SetTemplateIdInput) =>
  createAction<SetTemplateIdAction>(
    "SET_TEMPLATE_ID",
    { ...input },
    undefined,
    SetTemplateIdInputSchema,
    "global",
  );
