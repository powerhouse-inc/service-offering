import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  initializeSubscription,
  setResourceDocument,
  updateSubscriptionStatus,
  activateSubscription,
  pauseSubscription,
  setExpiring,
  cancelSubscription,
  resumeSubscription,
  renewExpiringSubscription,
  setBudgetCategory,
  removeBudgetCategory,
  updateCustomerInfo,
  updateTierInfo,
  setOperatorNotes,
  setAutoRenew,
  setRenewalDate,
  updateBillingProjection,
  InitializeSubscriptionInputSchema,
  SetResourceDocumentInputSchema,
  UpdateSubscriptionStatusInputSchema,
  ActivateSubscriptionInputSchema,
  PauseSubscriptionInputSchema,
  SetExpiringInputSchema,
  CancelSubscriptionInputSchema,
  ResumeSubscriptionInputSchema,
  RenewExpiringSubscriptionInputSchema,
  SetBudgetCategoryInputSchema,
  RemoveBudgetCategoryInputSchema,
  UpdateCustomerInfoInputSchema,
  UpdateTierInfoInputSchema,
  SetOperatorNotesInputSchema,
  SetAutoRenewInputSchema,
  SetRenewalDateInputSchema,
  UpdateBillingProjectionInputSchema,
  setTargetAudience,
  removeTargetAudience,
  SetTargetAudienceInputSchema,
  RemoveTargetAudienceInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

// Note: setOperatorInfo has been removed from the document model

describe("SubscriptionOperations", () => {
  it("should handle initializeSubscription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(InitializeSubscriptionInputSchema());

    const updatedDocument = reducer(document, initializeSubscription(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "INITIALIZE_SUBSCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setResourceDocument operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetResourceDocumentInputSchema());

    const updatedDocument = reducer(document, setResourceDocument(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_RESOURCE_DOCUMENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateSubscriptionStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateSubscriptionStatusInputSchema());

    const updatedDocument = reducer(document, updateSubscriptionStatus(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SUBSCRIPTION_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle activateSubscription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ActivateSubscriptionInputSchema());

    const updatedDocument = reducer(document, activateSubscription(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ACTIVATE_SUBSCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle pauseSubscription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(PauseSubscriptionInputSchema());

    const updatedDocument = reducer(document, pauseSubscription(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "PAUSE_SUBSCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setExpiring operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetExpiringInputSchema());

    const updatedDocument = reducer(document, setExpiring(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_EXPIRING",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle cancelSubscription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(CancelSubscriptionInputSchema());

    const updatedDocument = reducer(document, cancelSubscription(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CANCEL_SUBSCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle resumeSubscription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ResumeSubscriptionInputSchema());

    const updatedDocument = reducer(document, resumeSubscription(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RESUME_SUBSCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle renewExpiringSubscription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RenewExpiringSubscriptionInputSchema());

    const updatedDocument = reducer(document, renewExpiringSubscription(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "RENEW_EXPIRING_SUBSCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setBudgetCategory operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetBudgetCategoryInputSchema());

    const updatedDocument = reducer(document, setBudgetCategory(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_BUDGET_CATEGORY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeBudgetCategory operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveBudgetCategoryInputSchema());

    const updatedDocument = reducer(document, removeBudgetCategory(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_BUDGET_CATEGORY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateCustomerInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateCustomerInfoInputSchema());

    const updatedDocument = reducer(document, updateCustomerInfo(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_CUSTOMER_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateTierInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateTierInfoInputSchema());

    const updatedDocument = reducer(document, updateTierInfo(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_TIER_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setOperatorNotes operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetOperatorNotesInputSchema());

    const updatedDocument = reducer(document, setOperatorNotes(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_OPERATOR_NOTES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setAutoRenew operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetAutoRenewInputSchema());

    const updatedDocument = reducer(document, setAutoRenew(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_AUTO_RENEW",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setRenewalDate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetRenewalDateInputSchema());

    const updatedDocument = reducer(document, setRenewalDate(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_RENEWAL_DATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  // Note: setOperatorInfo test removed - operation no longer exists

  it("should handle updateBillingProjection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateBillingProjectionInputSchema());

    const updatedDocument = reducer(document, updateBillingProjection(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_BILLING_PROJECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setTargetAudience operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetTargetAudienceInputSchema());

    const updatedDocument = reducer(document, setTargetAudience(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_TARGET_AUDIENCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeTargetAudience operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveTargetAudienceInputSchema());

    const updatedDocument = reducer(document, removeTargetAudience(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_TARGET_AUDIENCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
