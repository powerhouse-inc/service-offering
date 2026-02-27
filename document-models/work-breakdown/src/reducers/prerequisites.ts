import {
  UpdatePrerequisiteNotFoundError,
  RemovePrerequisiteNotFoundError,
  SetPrerequisiteStatusNotFoundError,
} from "../../gen/prerequisites/error.js";
import type { WorkBreakdownPrerequisitesOperations } from "../../index.js";

export const workBreakdownPrerequisitesOperations: WorkBreakdownPrerequisitesOperations =
  {
    addPrerequisiteOperation(state, action) {
      state.prerequisites.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        owner: action.input.owner,
        scope: action.input.scope,
        stepId: action.input.stepId || null,
        status: null,
        notes: action.input.notes || null,
        createdAt: action.input.createdAt,
      });
    },
    updatePrerequisiteOperation(state, action) {
      const prereq = state.prerequisites.find((p) => p.id === action.input.id);
      if (!prereq)
        throw new UpdatePrerequisiteNotFoundError(
          `Prerequisite ${action.input.id} not found`,
        );
      if (action.input.name) prereq.name = action.input.name;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        prereq.description = action.input.description;
      if (action.input.owner) prereq.owner = action.input.owner;
      if (action.input.notes !== undefined && action.input.notes !== null)
        prereq.notes = action.input.notes;
    },
    removePrerequisiteOperation(state, action) {
      const idx = state.prerequisites.findIndex(
        (p) => p.id === action.input.id,
      );
      if (idx === -1)
        throw new RemovePrerequisiteNotFoundError(
          `Prerequisite ${action.input.id} not found`,
        );
      state.prerequisites.splice(idx, 1);
    },
    setPrerequisiteStatusOperation(state, action) {
      const prereq = state.prerequisites.find((p) => p.id === action.input.id);
      if (!prereq)
        throw new SetPrerequisiteStatusNotFoundError(
          `Prerequisite ${action.input.id} not found`,
        );
      prereq.status = action.input.status;
    },
  };
