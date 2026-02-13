import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  addTask,
  bulkAddTasks,
  updateTask,
  removeTask,
  setTaskStatus,
  AddTaskInputSchema,
  BulkAddTasksInputSchema,
  UpdateTaskInputSchema,
  RemoveTaskInputSchema,
  SetTaskStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/work-breakdown";

describe("TasksOperations", () => {
  it("should handle addTask operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddTaskInputSchema());

    const updatedDocument = reducer(document, addTask(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_TASK");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle bulkAddTasks operation", () => {
    const document = utils.createDocument();
    const input = generateMock(BulkAddTasksInputSchema());

    const updatedDocument = reducer(document, bulkAddTasks(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "BULK_ADD_TASKS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateTask operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateTaskInputSchema());

    const updatedDocument = reducer(document, updateTask(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_TASK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeTask operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveTaskInputSchema());

    const updatedDocument = reducer(document, removeTask(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_TASK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setTaskStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetTaskStatusInputSchema());

    const updatedDocument = reducer(document, setTaskStatus(input));

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_TASK_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
