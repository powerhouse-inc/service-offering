import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { workBreakdownDocumentType } from "./document-type.js";
import { WorkBreakdownStateSchema } from "./schema/zod.js";
import type { WorkBreakdownDocument, WorkBreakdownPHState } from "./types.js";

/** Schema for validating the header object of a WorkBreakdown document */
export const WorkBreakdownDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(workBreakdownDocumentType),
  });

/** Schema for validating the state object of a WorkBreakdown document */
export const WorkBreakdownPHStateSchema = BaseDocumentStateSchema.extend({
  global: WorkBreakdownStateSchema(),
});

export const WorkBreakdownDocumentSchema = z.object({
  header: WorkBreakdownDocumentHeaderSchema,
  state: WorkBreakdownPHStateSchema,
  initialState: WorkBreakdownPHStateSchema,
});

/** Simple helper function to check if a state object is a WorkBreakdown document state object */
export function isWorkBreakdownState(
  state: unknown,
): state is WorkBreakdownPHState {
  return WorkBreakdownPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a WorkBreakdown document state object */
export function assertIsWorkBreakdownState(
  state: unknown,
): asserts state is WorkBreakdownPHState {
  WorkBreakdownPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a WorkBreakdown document */
export function isWorkBreakdownDocument(
  document: unknown,
): document is WorkBreakdownDocument {
  return WorkBreakdownDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a WorkBreakdown document */
export function assertIsWorkBreakdownDocument(
  document: unknown,
): asserts document is WorkBreakdownDocument {
  WorkBreakdownDocumentSchema.parse(document);
}
