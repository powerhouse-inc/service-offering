import { generateMock } from "@powerhousedao/codegen";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isMultisigParticipationAgreementDocument,
  addComplianceEvent,
  amendComplianceEvent,
  markSlaBreached,
  AddComplianceEventInputSchema,
  AmendComplianceEventInputSchema,
  MarkSlaBreachedInputSchema,
} from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";

describe("ComplianceOperations", () => {
  it("should handle addComplianceEvent operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddComplianceEventInputSchema());

    const updatedDocument = reducer(document, addComplianceEvent(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_COMPLIANCE_EVENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle amendComplianceEvent operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AmendComplianceEventInputSchema());

    const updatedDocument = reducer(document, amendComplianceEvent(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "AMEND_COMPLIANCE_EVENT",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle markSlaBreached operation", () => {
    const document = utils.createDocument();
    const input = generateMock(MarkSlaBreachedInputSchema());

    const updatedDocument = reducer(document, markSlaBreached(input));

    expect(isMultisigParticipationAgreementDocument(updatedDocument)).toBe(
      true,
    );
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "MARK_SLA_BREACHED",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
