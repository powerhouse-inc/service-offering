/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isResourceInstanceDocument,
  initializeInstance,
  InitializeInstanceInputSchema,
  updateInstanceStatus,
  UpdateInstanceStatusInputSchema,
  activateInstance,
  ActivateInstanceInputSchema,
  suspendInstance,
  SuspendInstanceInputSchema,
  terminateInstance,
  TerminateInstanceInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-instance";

describe("InstanceManagement Operations", () => {
  it("should handle initializeInstance operation", () => {
    const document = utils.createDocument();
    const input = generateMock(InitializeInstanceInputSchema());

    const updatedDocument = reducer(document, initializeInstance(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "INITIALIZE_INSTANCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle updateInstanceStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateInstanceStatusInputSchema());

    const updatedDocument = reducer(document, updateInstanceStatus(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_INSTANCE_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle activateInstance operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ActivateInstanceInputSchema());

    const updatedDocument = reducer(document, activateInstance(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ACTIVATE_INSTANCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle suspendInstance operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SuspendInstanceInputSchema());

    const updatedDocument = reducer(document, suspendInstance(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SUSPEND_INSTANCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle terminateInstance operation", () => {
    const document = utils.createDocument();
    const input = generateMock(TerminateInstanceInputSchema());

    const updatedDocument = reducer(document, terminateInstance(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "TERMINATE_INSTANCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
