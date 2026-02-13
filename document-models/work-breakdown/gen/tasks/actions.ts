import type { Action } from "document-model";
import type {
  AddTaskInput,
  BulkAddTasksInput,
  UpdateTaskInput,
  RemoveTaskInput,
  SetTaskStatusInput,
} from "../types.js";

export type AddTaskAction = Action & { type: "ADD_TASK"; input: AddTaskInput };
export type BulkAddTasksAction = Action & {
  type: "BULK_ADD_TASKS";
  input: BulkAddTasksInput;
};
export type UpdateTaskAction = Action & {
  type: "UPDATE_TASK";
  input: UpdateTaskInput;
};
export type RemoveTaskAction = Action & {
  type: "REMOVE_TASK";
  input: RemoveTaskInput;
};
export type SetTaskStatusAction = Action & {
  type: "SET_TASK_STATUS";
  input: SetTaskStatusInput;
};

export type WorkBreakdownTasksAction =
  | AddTaskAction
  | BulkAddTasksAction
  | UpdateTaskAction
  | RemoveTaskAction
  | SetTaskStatusAction;
