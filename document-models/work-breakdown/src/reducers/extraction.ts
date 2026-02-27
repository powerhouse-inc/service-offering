import { UpdateExtractionRecordNotFoundError } from "../../gen/extraction/error.js";
import type { WorkBreakdownExtractionOperations } from "../../index.js";

export const workBreakdownExtractionOperations: WorkBreakdownExtractionOperations =
  {
    setAiContextOperation(state, action) {
      state.aiContext = action.input.context || null;
    },

    addExtractionRecordOperation(state, action) {
      state.extractionHistory.push({
        id: action.input.id,
        type: action.input.type,
        status: "PENDING",
        requestedAt: action.input.requestedAt,
        completedAt: null,
        stepsGenerated: null,
        tasksGenerated: null,
        model: action.input.model || null,
        error: null,
        userContext: action.input.userContext || null,
      });
    },

    updateExtractionRecordOperation(state, action) {
      const record = state.extractionHistory.find(
        (r) => r.id === action.input.id,
      );
      if (!record) {
        throw new UpdateExtractionRecordNotFoundError(
          `Extraction record ${action.input.id} not found`,
        );
      }
      record.status = action.input.status;
      if (action.input.completedAt)
        record.completedAt = action.input.completedAt;
      if (
        action.input.stepsGenerated !== undefined &&
        action.input.stepsGenerated !== null
      )
        record.stepsGenerated = action.input.stepsGenerated;
      if (
        action.input.tasksGenerated !== undefined &&
        action.input.tasksGenerated !== null
      )
        record.tasksGenerated = action.input.tasksGenerated;
      if (action.input.error) record.error = action.input.error;
    },

    clearExtractionHistoryOperation(state, action) {
      if (action.input.beforeDate) {
        state.extractionHistory = state.extractionHistory.filter(
          (r) => r.requestedAt >= action.input.beforeDate!,
        );
      } else {
        state.extractionHistory = [];
      }
    },
  };
