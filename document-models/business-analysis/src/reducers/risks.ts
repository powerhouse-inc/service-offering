import {
  UpdateRiskNotFoundError,
  RemoveRiskNotFoundError,
  SetRiskStatusNotFoundError,
} from "../../gen/risks/error.js";
import type { BusinessAnalysisRisksOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisRisksOperations: BusinessAnalysisRisksOperations =
  {
    addRiskOperation(state, action) {
      state.risks.push({
        id: action.input.id,
        title: action.input.title,
        description: action.input.description || null,
        probability: action.input.probability || null,
        impact: action.input.impact || null,
        status: "IDENTIFIED",
        mitigation: action.input.mitigation || null,
        owner: action.input.owner || null,
        linkedRequirementIds: action.input.linkedRequirementIds || [],
        createdAt: action.input.createdAt,
      });
    },
    updateRiskOperation(state, action) {
      const risk = state.risks.find((r) => r.id === action.input.id);
      if (!risk)
        throw new UpdateRiskNotFoundError(`Risk ${action.input.id} not found`);
      if (action.input.title) risk.title = action.input.title;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        risk.description = action.input.description;
      if (action.input.probability) risk.probability = action.input.probability;
      if (action.input.impact) risk.impact = action.input.impact;
      if (
        action.input.mitigation !== undefined &&
        action.input.mitigation !== null
      )
        risk.mitigation = action.input.mitigation;
      if (action.input.owner !== undefined && action.input.owner !== null)
        risk.owner = action.input.owner;
      if (action.input.linkedRequirementIds)
        risk.linkedRequirementIds = action.input.linkedRequirementIds;
    },
    removeRiskOperation(state, action) {
      const idx = state.risks.findIndex((r) => r.id === action.input.id);
      if (idx === -1)
        throw new RemoveRiskNotFoundError(`Risk ${action.input.id} not found`);
      state.risks.splice(idx, 1);
    },
    setRiskStatusOperation(state, action) {
      const risk = state.risks.find((r) => r.id === action.input.id);
      if (!risk)
        throw new SetRiskStatusNotFoundError(
          `Risk ${action.input.id} not found`,
        );
      risk.status = action.input.status;
    },
  };
