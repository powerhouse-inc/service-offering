import { createAction } from "document-model/core";
import {
  AddTaskInputSchema,
  BulkAddTasksInputSchema,
  UpdateTaskInputSchema,
  RemoveTaskInputSchema,
  SetTaskStatusInputSchema,
} from "../schema/zod.js";
import type {
  AddTaskInput,
  BulkAddTasksInput,
  UpdateTaskInput,
  RemoveTaskInput,
  SetTaskStatusInput,
} from "../types.js";
import type {
  AddTaskAction,
  BulkAddTasksAction,
  UpdateTaskAction,
  RemoveTaskAction,
  SetTaskStatusAction,
} from "./actions.js";

export const addTask = (input: AddTaskInput) =>
  createAction<AddTaskAction>(
    "ADD_TASK",
    { ...input },
    undefined,
    AddTaskInputSchema,
    "global",
  );

export const bulkAddTasks = (input: BulkAddTasksInput) =>
  createAction<BulkAddTasksAction>(
    "BULK_ADD_TASKS",
    { ...input },
    undefined,
    BulkAddTasksInputSchema,
    "global",
  );

export const updateTask = (input: UpdateTaskInput) =>
  createAction<UpdateTaskAction>(
    "UPDATE_TASK",
    { ...input },
    undefined,
    UpdateTaskInputSchema,
    "global",
  );

export const removeTask = (input: RemoveTaskInput) =>
  createAction<RemoveTaskAction>(
    "REMOVE_TASK",
    { ...input },
    undefined,
    RemoveTaskInputSchema,
    "global",
  );

export const setTaskStatus = (input: SetTaskStatusInput) =>
  createAction<SetTaskStatusAction>(
    "SET_TASK_STATUS",
    { ...input },
    undefined,
    SetTaskStatusInputSchema,
    "global",
  );
