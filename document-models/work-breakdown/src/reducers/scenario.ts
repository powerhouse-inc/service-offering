import {
  UpdateInputNotFoundError,
  RemoveInputNotFoundError,
  UpdateStepNotFoundError,
  RemoveStepNotFoundError,
  AddSubstepStepNotFoundError,
  UpdateSubstepNotFoundError,
  RemoveSubstepNotFoundError,
} from "../../gen/scenario/error.js";
import type { WorkBreakdownScenarioOperations } from "../../index.js";

export const workBreakdownScenarioOperations: WorkBreakdownScenarioOperations =
  {
    addInputOperation(state, action) {
      state.inputs.push({
        id: action.input.id,
        rawContent: action.input.rawContent,
        source: action.input.source || null,
        submittedBy: action.input.submittedBy || null,
        createdAt: action.input.createdAt,
      });
    },
    updateInputOperation(state, action) {
      const inp = state.inputs.find((i) => i.id === action.input.id);
      if (!inp)
        throw new UpdateInputNotFoundError(
          `Input ${action.input.id} not found`,
        );
      if (action.input.rawContent) inp.rawContent = action.input.rawContent;
      if (action.input.source !== undefined && action.input.source !== null)
        inp.source = action.input.source;
      if (
        action.input.submittedBy !== undefined &&
        action.input.submittedBy !== null
      )
        inp.submittedBy = action.input.submittedBy;
    },
    removeInputOperation(state, action) {
      const idx = state.inputs.findIndex((i) => i.id === action.input.id);
      if (idx === -1)
        throw new RemoveInputNotFoundError(
          `Input ${action.input.id} not found`,
        );
      state.inputs.splice(idx, 1);
    },
    addStepOperation(state, action) {
      state.steps.push({
        id: action.input.id,
        order: action.input.order,
        name: action.input.name,
        description: action.input.description || null,
        substeps: [],
        templateStepId: action.input.templateStepId || null,
      });
    },
    updateStepOperation(state, action) {
      const step = state.steps.find((s) => s.id === action.input.id);
      if (!step)
        throw new UpdateStepNotFoundError(`Step ${action.input.id} not found`);
      if (action.input.name) step.name = action.input.name;
      if (action.input.order !== undefined && action.input.order !== null)
        step.order = action.input.order;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        step.description = action.input.description;
    },
    removeStepOperation(state, action) {
      const idx = state.steps.findIndex((s) => s.id === action.input.id);
      if (idx === -1)
        throw new RemoveStepNotFoundError(`Step ${action.input.id} not found`);
      state.steps.splice(idx, 1);
      const stepId = action.input.id;
      state.tasks = state.tasks.filter((t) => t.stepId !== stepId);
      state.prerequisites = state.prerequisites.filter(
        (p) => p.stepId !== stepId,
      );
    },
    addSubstepOperation(state, action) {
      const step = state.steps.find((s) => s.id === action.input.stepId);
      if (!step)
        throw new AddSubstepStepNotFoundError(
          `Step ${action.input.stepId} not found`,
        );
      step.substeps.push({
        id: action.input.id,
        stepId: action.input.stepId,
        order: action.input.order,
        name: action.input.name,
        description: action.input.description || null,
        acceptanceCriteria: action.input.acceptanceCriteria || null,
      });
    },
    updateSubstepOperation(state, action) {
      const step = state.steps.find((s) => s.id === action.input.stepId);
      if (!step)
        throw new UpdateSubstepNotFoundError(
          `Step ${action.input.stepId} not found`,
        );
      const sub = step.substeps.find((ss) => ss.id === action.input.id);
      if (!sub)
        throw new UpdateSubstepNotFoundError(
          `Substep ${action.input.id} not found in step ${action.input.stepId}`,
        );
      if (action.input.name) sub.name = action.input.name;
      if (action.input.order !== undefined && action.input.order !== null)
        sub.order = action.input.order;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        sub.description = action.input.description;
      if (
        action.input.acceptanceCriteria !== undefined &&
        action.input.acceptanceCriteria !== null
      )
        sub.acceptanceCriteria = action.input.acceptanceCriteria;
    },
    removeSubstepOperation(state, action) {
      const step = state.steps.find((s) => s.id === action.input.stepId);
      if (!step)
        throw new RemoveSubstepNotFoundError(
          `Step ${action.input.stepId} not found`,
        );
      const idx = step.substeps.findIndex((ss) => ss.id === action.input.id);
      if (idx === -1)
        throw new RemoveSubstepNotFoundError(
          `Substep ${action.input.id} not found in step ${action.input.stepId}`,
        );
      step.substeps.splice(idx, 1);
    },
  };
