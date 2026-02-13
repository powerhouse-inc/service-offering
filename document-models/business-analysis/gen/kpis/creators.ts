import { createAction } from "document-model/core";
import {
  AddKpiInputSchema,
  UpdateKpiInputSchema,
  RemoveKpiInputSchema,
  RecordKpiMeasurementInputSchema,
  SetKpiStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddKpiInput,
  UpdateKpiInput,
  RemoveKpiInput,
  RecordKpiMeasurementInput,
  SetKpiStatusInput,
} from "../types.js";
import type {
  AddKpiAction,
  UpdateKpiAction,
  RemoveKpiAction,
  RecordKpiMeasurementAction,
  SetKpiStatusAction,
} from "./actions.js";

export const addKpi = (input: AddKpiInput) =>
  createAction<AddKpiAction>(
    "ADD_KPI",
    { ...input },
    undefined,
    AddKpiInputSchema,
    "global",
  );

export const updateKpi = (input: UpdateKpiInput) =>
  createAction<UpdateKpiAction>(
    "UPDATE_KPI",
    { ...input },
    undefined,
    UpdateKpiInputSchema,
    "global",
  );

export const removeKpi = (input: RemoveKpiInput) =>
  createAction<RemoveKpiAction>(
    "REMOVE_KPI",
    { ...input },
    undefined,
    RemoveKpiInputSchema,
    "global",
  );

export const recordKpiMeasurement = (input: RecordKpiMeasurementInput) =>
  createAction<RecordKpiMeasurementAction>(
    "RECORD_KPI_MEASUREMENT",
    { ...input },
    undefined,
    RecordKpiMeasurementInputSchema,
    "global",
  );

export const setKpiStatus = (input: SetKpiStatusInput) =>
  createAction<SetKpiStatusAction>(
    "SET_KPI_STATUS",
    { ...input },
    undefined,
    SetKpiStatusInputSchema,
    "global",
  );
