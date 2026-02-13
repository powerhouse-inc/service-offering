import {
  UpdateAssumptionNotFoundError,
  RemoveAssumptionNotFoundError,
  SetAssumptionStatusNotFoundError,
  UpdateScopeItemNotFoundError,
  RemoveScopeItemNotFoundError,
} from "../../gen/scope/error.js";
import type { BusinessAnalysisScopeOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisScopeOperations: BusinessAnalysisScopeOperations =
  {
    addAssumptionOperation(state, action) {
      state.assumptions.push({
        id: action.input.id,
        description: action.input.description,
        category: action.input.category || null,
        notes: action.input.notes || null,
        status: "ACTIVE",
        linkedRequirementIds: action.input.linkedRequirementIds || [],
        createdAt: action.input.createdAt,
        validatedAt: null,
        validatedBy: null,
      });
    },
    updateAssumptionOperation(state, action) {
      const a = state.assumptions.find((a) => a.id === action.input.id);
      if (!a)
        throw new UpdateAssumptionNotFoundError(
          `Assumption ${action.input.id} not found`,
        );
      if (action.input.description) a.description = action.input.description;
      if (action.input.category !== undefined && action.input.category !== null)
        a.category = action.input.category;
      if (action.input.notes !== undefined && action.input.notes !== null)
        a.notes = action.input.notes;
      if (action.input.linkedRequirementIds)
        a.linkedRequirementIds = action.input.linkedRequirementIds;
    },
    removeAssumptionOperation(state, action) {
      const idx = state.assumptions.findIndex((a) => a.id === action.input.id);
      if (idx === -1)
        throw new RemoveAssumptionNotFoundError(
          `Assumption ${action.input.id} not found`,
        );
      state.assumptions.splice(idx, 1);
    },
    setAssumptionStatusOperation(state, action) {
      const a = state.assumptions.find((a) => a.id === action.input.id);
      if (!a)
        throw new SetAssumptionStatusNotFoundError(
          `Assumption ${action.input.id} not found`,
        );
      a.status = action.input.status;
      if (action.input.validatedAt) a.validatedAt = action.input.validatedAt;
      if (action.input.validatedBy) a.validatedBy = action.input.validatedBy;
    },
    addScopeItemOperation(state, action) {
      state.scopeItems.push({
        id: action.input.id,
        description: action.input.description,
        type: action.input.type,
        rationale: action.input.rationale || null,
        linkedRequirementIds: action.input.linkedRequirementIds || [],
        createdAt: action.input.createdAt,
      });
    },
    updateScopeItemOperation(state, action) {
      const s = state.scopeItems.find((s) => s.id === action.input.id);
      if (!s)
        throw new UpdateScopeItemNotFoundError(
          `Scope item ${action.input.id} not found`,
        );
      if (action.input.description) s.description = action.input.description;
      if (action.input.type) s.type = action.input.type;
      if (
        action.input.rationale !== undefined &&
        action.input.rationale !== null
      )
        s.rationale = action.input.rationale;
      if (action.input.linkedRequirementIds)
        s.linkedRequirementIds = action.input.linkedRequirementIds;
    },
    removeScopeItemOperation(state, action) {
      const idx = state.scopeItems.findIndex((s) => s.id === action.input.id);
      if (idx === -1)
        throw new RemoveScopeItemNotFoundError(
          `Scope item ${action.input.id} not found`,
        );
      state.scopeItems.splice(idx, 1);
    },
  };
