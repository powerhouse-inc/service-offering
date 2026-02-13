import { type SignalDispatch } from "document-model";
import type { LogActivityAction } from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisActivityOperations {
  logActivityOperation: (
    state: BusinessAnalysisState,
    action: LogActivityAction,
    dispatch?: SignalDispatch,
  ) => void;
}
