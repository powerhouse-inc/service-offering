import type { BusinessAnalysisActivityOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisActivityOperations: BusinessAnalysisActivityOperations =
  {
    logActivityOperation(state, action) {
      state.activityLog.push({
        id: action.input.id,
        action: action.input.action,
        entityType: action.input.entityType || null,
        entityId: action.input.entityId || null,
        description: action.input.description || null,
        timestamp: action.input.timestamp,
      });
    },
  };
