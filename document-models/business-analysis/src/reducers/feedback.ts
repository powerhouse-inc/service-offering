import {
  RespondToFeedbackNotFoundError,
  ResolveFeedbackNotFoundError,
  RemoveFeedbackNotFoundError,
} from "../../gen/feedback/error.js";
import type { BusinessAnalysisFeedbackOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisFeedbackOperations: BusinessAnalysisFeedbackOperations =
  {
    submitFeedbackOperation(state, action) {
      state.feedback.push({
        id: action.input.id,
        stakeholderId: action.input.stakeholderId,
        entityId: action.input.entityId,
        entityType: action.input.entityType,
        type: action.input.type,
        content: action.input.content,
        createdAt: action.input.createdAt,
        status: "PENDING",
        analystResponse: null,
        resolvedAt: null,
      });
    },
    respondToFeedbackOperation(state, action) {
      const fb = state.feedback.find((f) => f.id === action.input.id);
      if (!fb)
        throw new RespondToFeedbackNotFoundError(
          `Feedback ${action.input.id} not found`,
        );
      fb.analystResponse = action.input.analystResponse;
      fb.status = "ACKNOWLEDGED";
    },
    resolveFeedbackOperation(state, action) {
      const fb = state.feedback.find((f) => f.id === action.input.id);
      if (!fb)
        throw new ResolveFeedbackNotFoundError(
          `Feedback ${action.input.id} not found`,
        );
      fb.status = action.input.status;
      fb.resolvedAt = action.input.resolvedAt;
      if (action.input.analystResponse)
        fb.analystResponse = action.input.analystResponse;
    },
    removeFeedbackOperation(state, action) {
      const idx = state.feedback.findIndex((f) => f.id === action.input.id);
      if (idx === -1)
        throw new RemoveFeedbackNotFoundError(
          `Feedback ${action.input.id} not found`,
        );
      state.feedback.splice(idx, 1);
    },
  };
