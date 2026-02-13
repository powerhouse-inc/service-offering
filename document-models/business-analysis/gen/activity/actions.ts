import type { Action } from "document-model";
import type { LogActivityInput } from "../types.js";

export type LogActivityAction = Action & {
  type: "LOG_ACTIVITY";
  input: LogActivityInput;
};

export type BusinessAnalysisActivityAction = LogActivityAction;
