import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isBusinessAnalysisDocument,
  addKpi,
  updateKpi,
  removeKpi,
  recordKpiMeasurement,
  setKpiStatus,
  AddKpiInputSchema,
  UpdateKpiInputSchema,
  RemoveKpiInputSchema,
  RecordKpiMeasurementInputSchema,
  SetKpiStatusInputSchema,
} from "@powerhousedao/service-offering/document-models/business-analysis";

describe("KpisOperations", () => {
  it("should handle addKpi operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddKpiInputSchema());

    const updatedDocument = reducer(document, addKpi(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("ADD_KPI");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateKpi operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateKpiInputSchema());

    const updatedDocument = reducer(document, updateKpi(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("UPDATE_KPI");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeKpi operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveKpiInputSchema());

    const updatedDocument = reducer(document, removeKpi(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe("REMOVE_KPI");
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle recordKpiMeasurement operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RecordKpiMeasurementInputSchema());

    const updatedDocument = reducer(document, recordKpiMeasurement(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RECORD_KPI_MEASUREMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setKpiStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetKpiStatusInputSchema());

    const updatedDocument = reducer(document, setKpiStatus(input));

    expect(isBusinessAnalysisDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_KPI_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
