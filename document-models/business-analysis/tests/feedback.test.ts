import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  submitFeedback,
  respondToFeedback,
  resolveFeedback,
  removeFeedback,
  SubmitFeedbackInputSchema,
  RespondToFeedbackInputSchema,
  ResolveFeedbackInputSchema,
  RemoveFeedbackInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("FeedbackOperations", () => {
  it("should handle submitFeedback operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SubmitFeedbackInputSchema());

    const updatedDocument = reducer(document, submitFeedback(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SUBMIT_FEEDBACK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle respondToFeedback operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RespondToFeedbackInputSchema());

    const updatedDocument = reducer(document, respondToFeedback(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RESPOND_TO_FEEDBACK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle resolveFeedback operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ResolveFeedbackInputSchema());

    const updatedDocument = reducer(document, resolveFeedback(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RESOLVE_FEEDBACK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeFeedback operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFeedbackInputSchema());

    const updatedDocument = reducer(document, removeFeedback(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FEEDBACK",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
