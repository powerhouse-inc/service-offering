import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { multisigParticipationAgreementDocumentType } from "./document-type.js";
import { MultisigParticipationAgreementStateSchema } from "./schema/zod.js";
import type {
  MultisigParticipationAgreementDocument,
  MultisigParticipationAgreementPHState,
} from "./types.js";

/** Schema for validating the header object of a MultisigParticipationAgreement document */
export const MultisigParticipationAgreementDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(multisigParticipationAgreementDocumentType),
  });

/** Schema for validating the state object of a MultisigParticipationAgreement document */
export const MultisigParticipationAgreementPHStateSchema =
  BaseDocumentStateSchema.extend({
    global: MultisigParticipationAgreementStateSchema(),
  });

export const MultisigParticipationAgreementDocumentSchema = z.object({
  header: MultisigParticipationAgreementDocumentHeaderSchema,
  state: MultisigParticipationAgreementPHStateSchema,
  initialState: MultisigParticipationAgreementPHStateSchema,
});

/** Simple helper function to check if a state object is a MultisigParticipationAgreement document state object */
export function isMultisigParticipationAgreementState(
  state: unknown,
): state is MultisigParticipationAgreementPHState {
  return MultisigParticipationAgreementPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a MultisigParticipationAgreement document state object */
export function assertIsMultisigParticipationAgreementState(
  state: unknown,
): asserts state is MultisigParticipationAgreementPHState {
  MultisigParticipationAgreementPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a MultisigParticipationAgreement document */
export function isMultisigParticipationAgreementDocument(
  document: unknown,
): document is MultisigParticipationAgreementDocument {
  return MultisigParticipationAgreementDocumentSchema.safeParse(document)
    .success;
}

/** Simple helper function to assert that a document is a MultisigParticipationAgreement document */
export function assertIsMultisigParticipationAgreementDocument(
  document: unknown,
): asserts document is MultisigParticipationAgreementDocument {
  MultisigParticipationAgreementDocumentSchema.parse(document);
}
