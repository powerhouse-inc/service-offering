import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  addService,
  removeService,
  updateServiceSetupCost,
  updateServiceRecurringCost,
  reportSetupPayment,
  reportRecurringPayment,
  updateServiceInfo,
  AddServiceInputSchema,
  RemoveServiceInputSchema,
  UpdateServiceSetupCostInputSchema,
  UpdateServiceRecurringCostInputSchema,
  ReportSetupPaymentInputSchema,
  ReportRecurringPaymentInputSchema,
  UpdateServiceInfoInputSchema,
  updateServiceLevel,
  UpdateServiceLevelInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

describe("ServiceOperations", () => {
  it("should handle addService operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceInputSchema());

    const updatedDocument = reducer(document, addService(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeService operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceInputSchema());

    const updatedDocument = reducer(document, removeService(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceSetupCost operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceSetupCostInputSchema());

    const updatedDocument = reducer(document, updateServiceSetupCost(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_SETUP_COST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceRecurringCost operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceRecurringCostInputSchema());

    const updatedDocument = reducer(
      document,
      updateServiceRecurringCost(input),
    );

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_RECURRING_COST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reportSetupPayment operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReportSetupPaymentInputSchema());

    const updatedDocument = reducer(document, reportSetupPayment(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REPORT_SETUP_PAYMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reportRecurringPayment operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReportRecurringPaymentInputSchema());

    const updatedDocument = reducer(document, reportRecurringPayment(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REPORT_RECURRING_PAYMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceInfoInputSchema());

    const updatedDocument = reducer(document, updateServiceInfo(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceLevel operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceLevelInputSchema());

    const updatedDocument = reducer(document, updateServiceLevel(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_LEVEL",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
