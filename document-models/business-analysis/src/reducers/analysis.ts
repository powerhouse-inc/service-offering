import {
  UpdateAnalysisNotFoundError,
  RemoveAnalysisNotFoundError,
  AddAnalysisEntryAnalysisNotFoundError,
  UpdateAnalysisEntryNotFoundError,
  RemoveAnalysisEntryNotFoundError,
} from "../../gen/analysis/error.js";
import type { BusinessAnalysisAnalysisOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisAnalysisOperations: BusinessAnalysisAnalysisOperations =
  {
    addAnalysisOperation(state, action) {
      state.analyses.push({
        id: action.input.id,
        name: action.input.name,
        type: action.input.type,
        entries: [],
        summary: action.input.summary || null,
        createdAt: action.input.createdAt,
      });
    },
    updateAnalysisOperation(state, action) {
      const a = state.analyses.find((a) => a.id === action.input.id);
      if (!a)
        throw new UpdateAnalysisNotFoundError(
          `Analysis ${action.input.id} not found`,
        );
      if (action.input.name) a.name = action.input.name;
      if (action.input.type) a.type = action.input.type;
      if (action.input.summary !== undefined && action.input.summary !== null)
        a.summary = action.input.summary;
    },
    removeAnalysisOperation(state, action) {
      const idx = state.analyses.findIndex((a) => a.id === action.input.id);
      if (idx === -1)
        throw new RemoveAnalysisNotFoundError(
          `Analysis ${action.input.id} not found`,
        );
      state.analyses.splice(idx, 1);
    },
    addAnalysisEntryOperation(state, action) {
      const a = state.analyses.find((a) => a.id === action.input.analysisId);
      if (!a)
        throw new AddAnalysisEntryAnalysisNotFoundError(
          `Analysis ${action.input.analysisId} not found`,
        );
      a.entries.push({
        id: action.input.id,
        category: action.input.category,
        content: action.input.content,
        impact: action.input.impact || null,
        likelihood: action.input.likelihood || null,
        notes: action.input.notes || null,
      });
    },
    updateAnalysisEntryOperation(state, action) {
      const a = state.analyses.find((a) => a.id === action.input.analysisId);
      if (!a)
        throw new UpdateAnalysisEntryNotFoundError(
          `Analysis ${action.input.analysisId} not found`,
        );
      const e = a.entries.find((e) => e.id === action.input.id);
      if (!e)
        throw new UpdateAnalysisEntryNotFoundError(
          `Entry ${action.input.id} not found`,
        );
      if (action.input.category) e.category = action.input.category;
      if (action.input.content) e.content = action.input.content;
      if (action.input.impact !== undefined && action.input.impact !== null)
        e.impact = action.input.impact;
      if (
        action.input.likelihood !== undefined &&
        action.input.likelihood !== null
      )
        e.likelihood = action.input.likelihood;
      if (action.input.notes !== undefined && action.input.notes !== null)
        e.notes = action.input.notes;
    },
    removeAnalysisEntryOperation(state, action) {
      const a = state.analyses.find((a) => a.id === action.input.analysisId);
      if (!a)
        throw new RemoveAnalysisEntryNotFoundError(
          `Analysis ${action.input.analysisId} not found`,
        );
      const eIdx = a.entries.findIndex((e) => e.id === action.input.id);
      if (eIdx === -1)
        throw new RemoveAnalysisEntryNotFoundError(
          `Entry ${action.input.id} not found`,
        );
      a.entries.splice(eIdx, 1);
    },
  };
