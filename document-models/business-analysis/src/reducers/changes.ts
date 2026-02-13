import {
  UpdateChangeRequestNotFoundError,
  SetChangeRequestStatusNotFoundError,
} from "../../gen/changes/error.js";
import type { BusinessAnalysisChangesOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisChangesOperations: BusinessAnalysisChangesOperations =
  {
    addChangeRequestOperation(state, action) {
      state.changeRequests.push({
        id: action.input.id,
        title: action.input.title,
        description: action.input.description || null,
        requestedBy: action.input.requestedBy || null,
        status: "SUBMITTED",
        impact: action.input.impact || null,
        impactAnalysis: action.input.impactAnalysis || null,
        affectedRequirementIds: action.input.affectedRequirementIds || [],
        resolution: null,
        createdAt: action.input.createdAt,
        resolvedAt: null,
      });
    },
    updateChangeRequestOperation(state, action) {
      const cr = state.changeRequests.find((c) => c.id === action.input.id);
      if (!cr)
        throw new UpdateChangeRequestNotFoundError(
          `Change request ${action.input.id} not found`,
        );
      if (action.input.title) cr.title = action.input.title;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        cr.description = action.input.description;
      if (action.input.impact) cr.impact = action.input.impact;
      if (
        action.input.impactAnalysis !== undefined &&
        action.input.impactAnalysis !== null
      )
        cr.impactAnalysis = action.input.impactAnalysis;
      if (action.input.affectedRequirementIds)
        cr.affectedRequirementIds = action.input.affectedRequirementIds;
    },
    setChangeRequestStatusOperation(state, action) {
      const cr = state.changeRequests.find((c) => c.id === action.input.id);
      if (!cr)
        throw new SetChangeRequestStatusNotFoundError(
          `Change request ${action.input.id} not found`,
        );
      cr.status = action.input.status;
      if (
        action.input.resolution !== undefined &&
        action.input.resolution !== null
      )
        cr.resolution = action.input.resolution;
      if (action.input.resolvedAt) cr.resolvedAt = action.input.resolvedAt;
    },
  };
