import {
  UpdateDeliverableNotFoundError,
  RemoveDeliverableNotFoundError,
  SetDeliverableStatusNotFoundError,
} from "../../gen/deliverables/error.js";
import type { BusinessAnalysisDeliverablesOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisDeliverablesOperations: BusinessAnalysisDeliverablesOperations =
  {
    addDeliverableOperation(state, action) {
      state.deliverables.push({
        id: action.input.id,
        name: action.input.name,
        type: action.input.type || null,
        description: action.input.description || null,
        status: "NOT_STARTED",
        assignee: action.input.assignee || null,
        dueDate: action.input.dueDate || null,
        completedAt: null,
        url: action.input.url || null,
        estimatedHours: action.input.estimatedHours || null,
        linkedRequirementIds: action.input.linkedRequirementIds || [],
      });
    },
    updateDeliverableOperation(state, action) {
      const del = state.deliverables.find((d) => d.id === action.input.id);
      if (!del)
        throw new UpdateDeliverableNotFoundError(
          `Deliverable ${action.input.id} not found`,
        );
      if (action.input.name) del.name = action.input.name;
      if (action.input.type) del.type = action.input.type;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        del.description = action.input.description;
      if (action.input.assignee !== undefined && action.input.assignee !== null)
        del.assignee = action.input.assignee;
      if (action.input.dueDate !== undefined && action.input.dueDate !== null)
        del.dueDate = action.input.dueDate;
      if (action.input.url !== undefined && action.input.url !== null)
        del.url = action.input.url;
      if (action.input.linkedRequirementIds)
        del.linkedRequirementIds = action.input.linkedRequirementIds;
      if (
        action.input.estimatedHours !== undefined &&
        action.input.estimatedHours !== null
      )
        del.estimatedHours = action.input.estimatedHours;
    },
    removeDeliverableOperation(state, action) {
      const idx = state.deliverables.findIndex((d) => d.id === action.input.id);
      if (idx === -1)
        throw new RemoveDeliverableNotFoundError(
          `Deliverable ${action.input.id} not found`,
        );
      state.deliverables.splice(idx, 1);
    },
    setDeliverableStatusOperation(state, action) {
      const del = state.deliverables.find((d) => d.id === action.input.id);
      if (!del)
        throw new SetDeliverableStatusNotFoundError(
          `Deliverable ${action.input.id} not found`,
        );
      del.status = action.input.status;
      if (action.input.completedAt) del.completedAt = action.input.completedAt;
    },
  };
