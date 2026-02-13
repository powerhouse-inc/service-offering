import {
  UpdateProcessNotFoundError,
  RemoveProcessNotFoundError,
  AddProcessStepProcessNotFoundError,
  UpdateProcessStepNotFoundError,
  RemoveProcessStepNotFoundError,
  ReorderProcessStepsProcessNotFoundError,
} from "../../gen/processes/error.js";
import type { BusinessAnalysisProcessesOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisProcessesOperations: BusinessAnalysisProcessesOperations =
  {
    addProcessOperation(state, action) {
      state.processes.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        type: action.input.type,
        owner: action.input.owner || null,
        steps: [],
        painPoints: [],
        improvements: [],
        linkedRequirementIds: [],
        createdAt: action.input.createdAt,
      });
    },
    updateProcessOperation(state, action) {
      const p = state.processes.find((p) => p.id === action.input.id);
      if (!p)
        throw new UpdateProcessNotFoundError(
          `Process ${action.input.id} not found`,
        );
      if (action.input.name) p.name = action.input.name;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        p.description = action.input.description;
      if (action.input.type) p.type = action.input.type;
      if (action.input.owner !== undefined && action.input.owner !== null)
        p.owner = action.input.owner;
      if (action.input.painPoints) p.painPoints = action.input.painPoints;
      if (action.input.improvements) p.improvements = action.input.improvements;
      if (action.input.linkedRequirementIds)
        p.linkedRequirementIds = action.input.linkedRequirementIds;
    },
    removeProcessOperation(state, action) {
      const idx = state.processes.findIndex((p) => p.id === action.input.id);
      if (idx === -1)
        throw new RemoveProcessNotFoundError(
          `Process ${action.input.id} not found`,
        );
      state.processes.splice(idx, 1);
    },
    addProcessStepOperation(state, action) {
      const p = state.processes.find((p) => p.id === action.input.processId);
      if (!p)
        throw new AddProcessStepProcessNotFoundError(
          `Process ${action.input.processId} not found`,
        );
      p.steps.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        actor: action.input.actor || null,
        order: action.input.order,
        type: action.input.type || null,
        duration: action.input.duration || null,
        automatable: action.input.automatable ?? null,
      });
    },
    updateProcessStepOperation(state, action) {
      const p = state.processes.find((p) => p.id === action.input.processId);
      if (!p)
        throw new UpdateProcessStepNotFoundError(
          `Process ${action.input.processId} not found`,
        );
      const step = p.steps.find((s) => s.id === action.input.id);
      if (!step)
        throw new UpdateProcessStepNotFoundError(
          `Step ${action.input.id} not found`,
        );
      if (action.input.name) step.name = action.input.name;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        step.description = action.input.description;
      if (action.input.actor !== undefined && action.input.actor !== null)
        step.actor = action.input.actor;
      if (action.input.order !== undefined && action.input.order !== null)
        step.order = action.input.order;
      if (action.input.type) step.type = action.input.type;
      if (action.input.duration !== undefined && action.input.duration !== null)
        step.duration = action.input.duration;
      if (
        action.input.automatable !== undefined &&
        action.input.automatable !== null
      )
        step.automatable = action.input.automatable;
    },
    removeProcessStepOperation(state, action) {
      const p = state.processes.find((p) => p.id === action.input.processId);
      if (!p)
        throw new RemoveProcessStepNotFoundError(
          `Process ${action.input.processId} not found`,
        );
      const stepIdx = p.steps.findIndex((s) => s.id === action.input.id);
      if (stepIdx === -1)
        throw new RemoveProcessStepNotFoundError(
          `Step ${action.input.id} not found`,
        );
      p.steps.splice(stepIdx, 1);
    },
    reorderProcessStepsOperation(state, action) {
      const p = state.processes.find((p) => p.id === action.input.processId);
      if (!p)
        throw new ReorderProcessStepsProcessNotFoundError(
          `Process ${action.input.processId} not found`,
        );
      const reordered = action.input.order
        .map((id: string, idx: number) => {
          const step = p.steps.find((s) => s.id === id);
          if (step) step.order = idx;
          return step;
        })
        .filter((s): s is NonNullable<typeof s> => Boolean(s));
      p.steps.length = 0;
      reordered.forEach((s) => p.steps.push(s));
    },
  };
