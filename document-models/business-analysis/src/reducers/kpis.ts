import {
  UpdateKpiNotFoundError,
  RemoveKpiNotFoundError,
  RecordKpiMeasurementKpiNotFoundError,
  SetKpiStatusNotFoundError,
} from "../../gen/kpis/error.js";
import type { BusinessAnalysisKpisOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisKpisOperations: BusinessAnalysisKpisOperations = {
  addKpiOperation(state, action) {
    state.kpis.push({
      id: action.input.id,
      name: action.input.name,
      description: action.input.description || null,
      targetValue: action.input.targetValue ?? null,
      currentValue: null,
      unit: action.input.unit || null,
      frequency: action.input.frequency || null,
      owner: action.input.owner || null,
      status: "NOT_MEASURED",
      measurements: [],
      linkedRequirementIds: action.input.linkedRequirementIds || [],
      createdAt: action.input.createdAt,
    });
  },
  updateKpiOperation(state, action) {
    const k = state.kpis.find((k) => k.id === action.input.id);
    if (!k)
      throw new UpdateKpiNotFoundError(`KPI ${action.input.id} not found`);
    if (action.input.name) k.name = action.input.name;
    if (
      action.input.description !== undefined &&
      action.input.description !== null
    )
      k.description = action.input.description;
    if (
      action.input.targetValue !== undefined &&
      action.input.targetValue !== null
    )
      k.targetValue = action.input.targetValue;
    if (action.input.unit !== undefined && action.input.unit !== null)
      k.unit = action.input.unit;
    if (action.input.frequency) k.frequency = action.input.frequency;
    if (action.input.owner !== undefined && action.input.owner !== null)
      k.owner = action.input.owner;
    if (action.input.linkedRequirementIds)
      k.linkedRequirementIds = action.input.linkedRequirementIds;
  },
  removeKpiOperation(state, action) {
    const idx = state.kpis.findIndex((k) => k.id === action.input.id);
    if (idx === -1)
      throw new RemoveKpiNotFoundError(`KPI ${action.input.id} not found`);
    state.kpis.splice(idx, 1);
  },
  recordKpiMeasurementOperation(state, action) {
    const k = state.kpis.find((k) => k.id === action.input.kpiId);
    if (!k)
      throw new RecordKpiMeasurementKpiNotFoundError(
        `KPI ${action.input.kpiId} not found`,
      );
    k.measurements.push({
      id: action.input.id,
      value: action.input.value,
      recordedAt: action.input.recordedAt,
      notes: action.input.notes || null,
    });
    k.currentValue = action.input.value;
  },
  setKpiStatusOperation(state, action) {
    const k = state.kpis.find((k) => k.id === action.input.id);
    if (!k)
      throw new SetKpiStatusNotFoundError(`KPI ${action.input.id} not found`);
    k.status = action.input.status;
  },
};
