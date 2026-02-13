import type { Action } from "document-model";
import type {
  AddAnalysisInput,
  UpdateAnalysisInput,
  RemoveAnalysisInput,
  AddAnalysisEntryInput,
  UpdateAnalysisEntryInput,
  RemoveAnalysisEntryInput,
} from "../types.js";

export type AddAnalysisAction = Action & {
  type: "ADD_ANALYSIS";
  input: AddAnalysisInput;
};
export type UpdateAnalysisAction = Action & {
  type: "UPDATE_ANALYSIS";
  input: UpdateAnalysisInput;
};
export type RemoveAnalysisAction = Action & {
  type: "REMOVE_ANALYSIS";
  input: RemoveAnalysisInput;
};
export type AddAnalysisEntryAction = Action & {
  type: "ADD_ANALYSIS_ENTRY";
  input: AddAnalysisEntryInput;
};
export type UpdateAnalysisEntryAction = Action & {
  type: "UPDATE_ANALYSIS_ENTRY";
  input: UpdateAnalysisEntryInput;
};
export type RemoveAnalysisEntryAction = Action & {
  type: "REMOVE_ANALYSIS_ENTRY";
  input: RemoveAnalysisEntryInput;
};

export type BusinessAnalysisAnalysisAction =
  | AddAnalysisAction
  | UpdateAnalysisAction
  | RemoveAnalysisAction
  | AddAnalysisEntryAction
  | UpdateAnalysisEntryAction
  | RemoveAnalysisEntryAction;
