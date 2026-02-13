import {
  UpdateDecisionNotFoundError,
  RemoveDecisionNotFoundError,
  SetDecisionStatusNotFoundError,
} from "../../gen/decisions/error.js";
import type { BusinessAnalysisDecisionsOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisDecisionsOperations: BusinessAnalysisDecisionsOperations =
  {
    addDecisionOperation(state, action) {
      state.decisions.push({
        id: action.input.id,
        title: action.input.title,
        description: action.input.description || null,
        status: "PROPOSED",
        outcome: null,
        rationale: null,
        alternatives: action.input.alternatives || [],
        stakeholderIds: action.input.stakeholderIds || [],
        linkedRequirementIds: action.input.linkedRequirementIds || [],
        decidedAt: null,
        createdAt: action.input.createdAt,
      });
    },
    updateDecisionOperation(state, action) {
      const d = state.decisions.find((d) => d.id === action.input.id);
      if (!d)
        throw new UpdateDecisionNotFoundError(
          `Decision ${action.input.id} not found`,
        );
      if (action.input.title) d.title = action.input.title;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        d.description = action.input.description;
      if (action.input.outcome !== undefined && action.input.outcome !== null)
        d.outcome = action.input.outcome;
      if (
        action.input.rationale !== undefined &&
        action.input.rationale !== null
      )
        d.rationale = action.input.rationale;
      if (action.input.alternatives) d.alternatives = action.input.alternatives;
      if (action.input.stakeholderIds)
        d.stakeholderIds = action.input.stakeholderIds;
      if (action.input.linkedRequirementIds)
        d.linkedRequirementIds = action.input.linkedRequirementIds;
    },
    removeDecisionOperation(state, action) {
      const idx = state.decisions.findIndex((d) => d.id === action.input.id);
      if (idx === -1)
        throw new RemoveDecisionNotFoundError(
          `Decision ${action.input.id} not found`,
        );
      state.decisions.splice(idx, 1);
    },
    setDecisionStatusOperation(state, action) {
      const d = state.decisions.find((d) => d.id === action.input.id);
      if (!d)
        throw new SetDecisionStatusNotFoundError(
          `Decision ${action.input.id} not found`,
        );
      d.status = action.input.status;
      if (action.input.decidedAt) d.decidedAt = action.input.decidedAt;
    },
  };
