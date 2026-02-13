import {
  BaseDocumentHeaderSchema,
  BaseDocumentStateSchema,
} from "document-model";
import { z } from "zod";
import { businessAnalysisDocumentType } from "./document-type.js";
import { BusinessAnalysisStateSchema } from "./schema/zod.js";
import type {
  BusinessAnalysisDocument,
  BusinessAnalysisPHState,
} from "./types.js";

/** Schema for validating the header object of a BusinessAnalysis document */
export const BusinessAnalysisDocumentHeaderSchema =
  BaseDocumentHeaderSchema.extend({
    documentType: z.literal(businessAnalysisDocumentType),
  });

/** Schema for validating the state object of a BusinessAnalysis document */
export const BusinessAnalysisPHStateSchema = BaseDocumentStateSchema.extend({
  global: BusinessAnalysisStateSchema(),
});

export const BusinessAnalysisDocumentSchema = z.object({
  header: BusinessAnalysisDocumentHeaderSchema,
  state: BusinessAnalysisPHStateSchema,
  initialState: BusinessAnalysisPHStateSchema,
});

/** Simple helper function to check if a state object is a BusinessAnalysis document state object */
export function isBusinessAnalysisState(
  state: unknown,
): state is BusinessAnalysisPHState {
  return BusinessAnalysisPHStateSchema.safeParse(state).success;
}

/** Simple helper function to assert that a document state object is a BusinessAnalysis document state object */
export function assertIsBusinessAnalysisState(
  state: unknown,
): asserts state is BusinessAnalysisPHState {
  BusinessAnalysisPHStateSchema.parse(state);
}

/** Simple helper function to check if a document is a BusinessAnalysis document */
export function isBusinessAnalysisDocument(
  document: unknown,
): document is BusinessAnalysisDocument {
  return BusinessAnalysisDocumentSchema.safeParse(document).success;
}

/** Simple helper function to assert that a document is a BusinessAnalysis document */
export function assertIsBusinessAnalysisDocument(
  document: unknown,
): asserts document is BusinessAnalysisDocument {
  BusinessAnalysisDocumentSchema.parse(document);
}
