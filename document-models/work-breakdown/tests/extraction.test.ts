import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  setAiContext,
  addExtractionRecord,
  updateExtractionRecord,
  clearExtractionHistory,
} from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  reducer,
  utils,
  isWorkBreakdownDocument,
  setAiContext,
  addExtractionRecord,
  updateExtractionRecord,
  clearExtractionHistory,
} from "wbd/document-models/work-breakdown";

describe("ExtractionOperations", () => {
  it("should handle setAiContext operation", () => {
    const document = utils.createDocument();

    const updatedDocument = reducer(
      document,
      setAiContext({ context: "Focus on security tasks" }),
    );

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_AI_CONTEXT",
    );
    expect(updatedDocument.state.global.aiContext).toBe(
      "Focus on security tasks",
    );
  });

  it("should clear aiContext when set to null", () => {
    const document = utils.createDocument();

    let updated = reducer(document, setAiContext({ context: "Some context" }));
    updated = reducer(updated, setAiContext({ context: null }));

    expect(updated.state.global.aiContext).toBeNull();
  });

  it("should handle addExtractionRecord operation", () => {
    const document = utils.createDocument();
    const now = new Date().toISOString();

    const updatedDocument = reducer(
      document,
      addExtractionRecord({
        id: "ext-1",
        type: "SCENARIO",
        requestedAt: now,
        model: "claude-sonnet-4-5-20250929",
        userContext: "Focus on infrastructure",
      }),
    );

    expect(isWorkBreakdownDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.state.global.extractionHistory).toHaveLength(1);

    const record = updatedDocument.state.global.extractionHistory[0];
    expect(record.id).toBe("ext-1");
    expect(record.type).toBe("SCENARIO");
    expect(record.status).toBe("PENDING");
    expect(record.model).toBe("claude-sonnet-4-5-20250929");
    expect(record.userContext).toBe("Focus on infrastructure");
    expect(record.completedAt).toBeNull();
    expect(record.error).toBeNull();
  });

  it("should handle updateExtractionRecord operation on success", () => {
    const document = utils.createDocument();
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 5000).toISOString();

    let updated = reducer(
      document,
      addExtractionRecord({
        id: "ext-1",
        type: "SCENARIO",
        requestedAt: now,
      }),
    );

    updated = reducer(
      updated,
      updateExtractionRecord({
        id: "ext-1",
        status: "COMPLETED",
        completedAt: later,
        stepsGenerated: 5,
      }),
    );

    const record = updated.state.global.extractionHistory[0];
    expect(record.status).toBe("COMPLETED");
    expect(record.completedAt).toBe(later);
    expect(record.stepsGenerated).toBe(5);
  });

  it("should handle updateExtractionRecord operation on failure", () => {
    const document = utils.createDocument();
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 5000).toISOString();

    let updated = reducer(
      document,
      addExtractionRecord({
        id: "ext-2",
        type: "TASK",
        requestedAt: now,
      }),
    );

    updated = reducer(
      updated,
      updateExtractionRecord({
        id: "ext-2",
        status: "FAILED",
        completedAt: later,
        error: "API rate limit exceeded",
      }),
    );

    const record = updated.state.global.extractionHistory[0];
    expect(record.status).toBe("FAILED");
    expect(record.error).toBe("API rate limit exceeded");
  });

  it("should error when updating non-existent extraction record", () => {
    const document = utils.createDocument();

    const updated = reducer(
      document,
      updateExtractionRecord({
        id: "does-not-exist",
        status: "COMPLETED",
      }),
    );

    expect(updated.operations.global[0].error).toBe(
      "Extraction record does-not-exist not found",
    );
    // State should not be mutated
    expect(updated.state.global.extractionHistory).toHaveLength(0);
  });

  it("should handle clearExtractionHistory - clear all", () => {
    const document = utils.createDocument();
    const now = new Date().toISOString();

    let updated = reducer(
      document,
      addExtractionRecord({ id: "ext-1", type: "SCENARIO", requestedAt: now }),
    );
    updated = reducer(
      updated,
      addExtractionRecord({ id: "ext-2", type: "TASK", requestedAt: now }),
    );

    expect(updated.state.global.extractionHistory).toHaveLength(2);

    updated = reducer(updated, clearExtractionHistory({}));

    expect(updated.state.global.extractionHistory).toHaveLength(0);
  });

  it("should handle clearExtractionHistory - filter by beforeDate", () => {
    const document = utils.createDocument();
    const old = "2025-01-01T00:00:00.000Z";
    const recent = "2025-06-01T00:00:00.000Z";

    let updated = reducer(
      document,
      addExtractionRecord({
        id: "ext-old",
        type: "SCENARIO",
        requestedAt: old,
      }),
    );
    updated = reducer(
      updated,
      addExtractionRecord({ id: "ext-new", type: "TASK", requestedAt: recent }),
    );

    updated = reducer(
      updated,
      clearExtractionHistory({ beforeDate: "2025-03-01T00:00:00.000Z" }),
    );

    expect(updated.state.global.extractionHistory).toHaveLength(1);
    expect(updated.state.global.extractionHistory[0].id).toBe("ext-new");
  });
});
