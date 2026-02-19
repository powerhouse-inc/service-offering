import {
  UpdateTaskNotFoundError,
  RemoveTaskNotFoundError,
  SetTaskStatusNotFoundError,
} from "../../gen/tasks/error.js";
import type { WorkBreakdownTasksOperations } from "@powerhousedao/service-offering/document-models/work-breakdown";

export const workBreakdownTasksOperations: WorkBreakdownTasksOperations = {
  addTaskOperation(state, action) {
    state.tasks.push({
      id: action.input.id,
      name: action.input.name,
      description: action.input.description || null,
      owner: action.input.owner,
      status: null,
      source: action.input.source,
      extractionContext: action.input.extractionContext || null,
      stepId: action.input.stepId,
      substepId: action.input.substepId || null,
      sequenceOrder: action.input.sequenceOrder,
      notes: action.input.notes || null,
      blockedReason: null,
      blockedByItemId: null,
      createdAt: action.input.createdAt,
    });
  },
  bulkAddTasksOperation(state, action) {
    for (const t of action.input.tasks) {
      state.tasks.push({
        id: t.id,
        name: t.name,
        description: t.description || null,
        owner: t.owner,
        status: null,
        source: t.source,
        extractionContext: t.extractionContext || null,
        stepId: t.stepId,
        substepId: t.substepId || null,
        sequenceOrder: t.sequenceOrder,
        notes: t.notes || null,
        blockedReason: null,
        blockedByItemId: null,
        createdAt: t.createdAt,
      });
    }
  },
  updateTaskOperation(state, action) {
    const task = state.tasks.find((t) => t.id === action.input.id);
    if (!task)
      throw new UpdateTaskNotFoundError(`Task ${action.input.id} not found`);
    if (action.input.name) task.name = action.input.name;
    if (
      action.input.description !== undefined &&
      action.input.description !== null
    )
      task.description = action.input.description;
    if (action.input.owner) task.owner = action.input.owner;
    if (action.input.stepId) task.stepId = action.input.stepId;
    if (action.input.substepId !== undefined && action.input.substepId !== null)
      task.substepId = action.input.substepId;
    if (
      action.input.sequenceOrder !== undefined &&
      action.input.sequenceOrder !== null
    )
      task.sequenceOrder = action.input.sequenceOrder;
    if (action.input.notes !== undefined && action.input.notes !== null)
      task.notes = action.input.notes;
  },
  removeTaskOperation(state, action) {
    const idx = state.tasks.findIndex((t) => t.id === action.input.id);
    if (idx === -1)
      throw new RemoveTaskNotFoundError(`Task ${action.input.id} not found`);
    state.tasks.splice(idx, 1);
  },
  setTaskStatusOperation(state, action) {
    const task = state.tasks.find((t) => t.id === action.input.id);
    if (!task)
      throw new SetTaskStatusNotFoundError(`Task ${action.input.id} not found`);
    task.status = action.input.status;
    if (action.input.status === "BLOCKED") {
      task.blockedReason = action.input.blockedReason || null;
      task.blockedByItemId = action.input.blockedByItemId || null;
      if (action.input.blockedReason) {
        task.notes = `[BLOCKED] ${action.input.blockedReason}`;
      }
    } else {
      task.blockedReason = null;
      task.blockedByItemId = null;
    }
  },
};
