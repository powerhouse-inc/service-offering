/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isResourceTemplateDocument,
  setSetupServices,
  SetSetupServicesInputSchema,
  setRecurringServices,
  SetRecurringServicesInputSchema,
} from "@powerhousedao/service-offering/document-models/resource-template";

describe("ServiceCategoryManagement Operations", () => {
  it("should handle setSetupServices operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetSetupServicesInputSchema());

    const updatedDocument = reducer(document, setSetupServices(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_SETUP_SERVICES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle setRecurringServices operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetRecurringServicesInputSchema());

    const updatedDocument = reducer(document, setRecurringServices(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_RECURRING_SERVICES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
