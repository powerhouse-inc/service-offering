import type { PHDocument, PHBaseState } from "document-model";
import type { BusinessAnalysisAction } from "./actions.js";
import type { BusinessAnalysisState as BusinessAnalysisGlobalState } from "./schema/types.js";

type BusinessAnalysisLocalState = Record<PropertyKey, never>;

type BusinessAnalysisPHState = PHBaseState & {
  global: BusinessAnalysisGlobalState;
  local: BusinessAnalysisLocalState;
};
type BusinessAnalysisDocument = PHDocument<BusinessAnalysisPHState>;

export * from "./schema/types.js";

export type {
  BusinessAnalysisGlobalState,
  BusinessAnalysisLocalState,
  BusinessAnalysisPHState,
  BusinessAnalysisAction,
  BusinessAnalysisDocument,
};
