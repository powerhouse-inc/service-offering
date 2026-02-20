import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isServiceOfferingDocument,
  addServiceGroup,
  updateServiceGroup,
  deleteServiceGroup,
  reorderServiceGroups,
  addServiceGroupTierPricing,
  setServiceGroupSetupCost,
  removeServiceGroupSetupCost,
  addRecurringPriceOption,
  updateRecurringPriceOption,
  removeRecurringPriceOption,
  removeServiceGroupTierPricing,
  AddServiceGroupInputSchema,
  UpdateServiceGroupInputSchema,
  DeleteServiceGroupInputSchema,
  ReorderServiceGroupsInputSchema,
  AddServiceGroupTierPricingInputSchema,
  SetServiceGroupSetupCostInputSchema,
  RemoveServiceGroupSetupCostInputSchema,
  AddRecurringPriceOptionInputSchema,
  UpdateRecurringPriceOptionInputSchema,
  RemoveRecurringPriceOptionInputSchema,
  RemoveServiceGroupTierPricingInputSchema,
} from "@powerhousedao/service-offering/document-models/service-offering";

describe("ServiceGroupsOperations", () => {
  it("should handle addServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceGroupInputSchema());

    const updatedDocument = reducer(document, addServiceGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceGroupInputSchema());

    const updatedDocument = reducer(document, updateServiceGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle deleteServiceGroup operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DeleteServiceGroupInputSchema());

    const updatedDocument = reducer(document, deleteServiceGroup(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DELETE_SERVICE_GROUP",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle reorderServiceGroups operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ReorderServiceGroupsInputSchema());

    const updatedDocument = reducer(document, reorderServiceGroups(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REORDER_SERVICE_GROUPS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addServiceGroupTierPricing operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceGroupTierPricingInputSchema());

    const updatedDocument = reducer(
      document,
      addServiceGroupTierPricing(input),
    );

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE_GROUP_TIER_PRICING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setServiceGroupSetupCost operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetServiceGroupSetupCostInputSchema());

    const updatedDocument = reducer(document, setServiceGroupSetupCost(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_SERVICE_GROUP_SETUP_COST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeServiceGroupSetupCost operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceGroupSetupCostInputSchema());

    const updatedDocument = reducer(
      document,
      removeServiceGroupSetupCost(input),
    );

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE_GROUP_SETUP_COST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addRecurringPriceOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddRecurringPriceOptionInputSchema());

    const updatedDocument = reducer(document, addRecurringPriceOption(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_RECURRING_PRICE_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateRecurringPriceOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateRecurringPriceOptionInputSchema());

    const updatedDocument = reducer(
      document,
      updateRecurringPriceOption(input),
    );

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_RECURRING_PRICE_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeRecurringPriceOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveRecurringPriceOptionInputSchema());

    const updatedDocument = reducer(
      document,
      removeRecurringPriceOption(input),
    );

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_RECURRING_PRICE_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeServiceGroupTierPricing operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceGroupTierPricingInputSchema());

    const updatedDocument = reducer(
      document,
      removeServiceGroupTierPricing(input),
    );

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE_GROUP_TIER_PRICING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
