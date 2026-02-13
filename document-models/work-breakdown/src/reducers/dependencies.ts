import {
  UpdateDependencyNotFoundError,
  RemoveDependencyNotFoundError,
} from "../../gen/dependencies/error.js";
import type { WorkBreakdownDependenciesOperations } from "@powerhousedao/service-offering/document-models/work-breakdown";

export const workBreakdownDependenciesOperations: WorkBreakdownDependenciesOperations =
  {
    addDependencyOperation(state, action) {
      state.dependencies.push({
        id: action.input.id,
        sourceId: action.input.sourceId,
        sourceType: action.input.sourceType,
        targetId: action.input.targetId,
        targetType: action.input.targetType,
        description: action.input.description || null,
      });
    },
    updateDependencyOperation(state, action) {
      const dep = state.dependencies.find((d) => d.id === action.input.id);
      if (!dep)
        throw new UpdateDependencyNotFoundError(
          `Dependency ${action.input.id} not found`,
        );
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        dep.description = action.input.description;
    },
    removeDependencyOperation(state, action) {
      const idx = state.dependencies.findIndex((d) => d.id === action.input.id);
      if (idx === -1)
        throw new RemoveDependencyNotFoundError(
          `Dependency ${action.input.id} not found`,
        );
      state.dependencies.splice(idx, 1);
    },
  };
