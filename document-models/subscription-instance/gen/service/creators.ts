import { createAction } from "document-model/core";
import {
  AddServiceInputSchema,
  RemoveServiceInputSchema,
  UpdateServiceSetupCostInputSchema,
  UpdateServiceRecurringCostInputSchema,
  ReportSetupPaymentInputSchema,
  ReportRecurringPaymentInputSchema,
  UpdateServiceInfoInputSchema,
  UpdateServiceLevelInputSchema,
} from "../schema/zod.js";
import type {
  AddServiceInput,
  RemoveServiceInput,
  UpdateServiceSetupCostInput,
  UpdateServiceRecurringCostInput,
  ReportSetupPaymentInput,
  ReportRecurringPaymentInput,
  UpdateServiceInfoInput,
  UpdateServiceLevelInput,
} from "../types.js";
import type {
  AddServiceAction,
  RemoveServiceAction,
  UpdateServiceSetupCostAction,
  UpdateServiceRecurringCostAction,
  ReportSetupPaymentAction,
  ReportRecurringPaymentAction,
  UpdateServiceInfoAction,
  UpdateServiceLevelAction,
} from "./actions.js";

export const addService = (input: AddServiceInput) =>
  createAction<AddServiceAction>(
    "ADD_SERVICE",
    { ...input },
    undefined,
    AddServiceInputSchema,
    "global",
  );

export const removeService = (input: RemoveServiceInput) =>
  createAction<RemoveServiceAction>(
    "REMOVE_SERVICE",
    { ...input },
    undefined,
    RemoveServiceInputSchema,
    "global",
  );

export const updateServiceSetupCost = (input: UpdateServiceSetupCostInput) =>
  createAction<UpdateServiceSetupCostAction>(
    "UPDATE_SERVICE_SETUP_COST",
    { ...input },
    undefined,
    UpdateServiceSetupCostInputSchema,
    "global",
  );

export const updateServiceRecurringCost = (
  input: UpdateServiceRecurringCostInput,
) =>
  createAction<UpdateServiceRecurringCostAction>(
    "UPDATE_SERVICE_RECURRING_COST",
    { ...input },
    undefined,
    UpdateServiceRecurringCostInputSchema,
    "global",
  );

export const reportSetupPayment = (input: ReportSetupPaymentInput) =>
  createAction<ReportSetupPaymentAction>(
    "REPORT_SETUP_PAYMENT",
    { ...input },
    undefined,
    ReportSetupPaymentInputSchema,
    "global",
  );

export const reportRecurringPayment = (input: ReportRecurringPaymentInput) =>
  createAction<ReportRecurringPaymentAction>(
    "REPORT_RECURRING_PAYMENT",
    { ...input },
    undefined,
    ReportRecurringPaymentInputSchema,
    "global",
  );

export const updateServiceInfo = (input: UpdateServiceInfoInput) =>
  createAction<UpdateServiceInfoAction>(
    "UPDATE_SERVICE_INFO",
    { ...input },
    undefined,
    UpdateServiceInfoInputSchema,
    "global",
  );

export const updateServiceLevel = (input: UpdateServiceLevelInput) =>
  createAction<UpdateServiceLevelAction>(
    "UPDATE_SERVICE_LEVEL",
    { ...input },
    undefined,
    UpdateServiceLevelInputSchema,
    "global",
  );
