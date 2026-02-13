import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  logActivity,
  LogActivityInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("ActivityOperations", () => {
  it("should handle logActivity operation", () => {
    const document = utils.createDocument();
    const input = generateMock(LogActivityInputSchema());

    const updatedDocument = reducer(document, logActivity(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "LOG_ACTIVITY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
