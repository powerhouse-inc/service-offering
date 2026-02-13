import type { PHDocument, PHBaseState } from "document-model";
import type { WorkBreakdownAction } from "./actions.js";
import type { WorkBreakdownState as WorkBreakdownGlobalState } from "./schema/types.js";

type WorkBreakdownLocalState = Record<PropertyKey, never>;

type WorkBreakdownPHState = PHBaseState & {
  global: WorkBreakdownGlobalState;
  local: WorkBreakdownLocalState;
};
type WorkBreakdownDocument = PHDocument<WorkBreakdownPHState>;

export * from "./schema/types.js";

export type {
  WorkBreakdownGlobalState,
  WorkBreakdownLocalState,
  WorkBreakdownPHState,
  WorkBreakdownAction,
  WorkBreakdownDocument,
};
