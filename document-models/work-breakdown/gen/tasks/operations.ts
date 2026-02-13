import { type SignalDispatch } from "document-model";
import type {
  AddTaskAction,
  BulkAddTasksAction,
  UpdateTaskAction,
  RemoveTaskAction,
  SetTaskStatusAction,
} from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownTasksOperations {
  addTaskOperation: (
    state: WorkBreakdownState,
    action: AddTaskAction,
    dispatch?: SignalDispatch,
  ) => void;
  bulkAddTasksOperation: (
    state: WorkBreakdownState,
    action: BulkAddTasksAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTaskOperation: (
    state: WorkBreakdownState,
    action: UpdateTaskAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeTaskOperation: (
    state: WorkBreakdownState,
    action: RemoveTaskAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTaskStatusOperation: (
    state: WorkBreakdownState,
    action: SetTaskStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
