import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceOfferingDocument,
  setFinalConfiguration,
  clearFinalConfiguration,
  SetFinalConfigurationInputSchema,
  ClearFinalConfigurationInputSchema,
} from "@powerhousedao/service-offering/document-models/service-offering";

describe("ConfigurationOperations", () => {
  it("should handle setFinalConfiguration operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFinalConfigurationInputSchema());

    const updatedDocument = reducer(document, setFinalConfiguration(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FINAL_CONFIGURATION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle clearFinalConfiguration operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ClearFinalConfigurationInputSchema());

    const updatedDocument = reducer(document, clearFinalConfiguration(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CLEAR_FINAL_CONFIGURATION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
