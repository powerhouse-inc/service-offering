import type { Action } from "document-model";
import type {
  SetAiContextInput,
  AddExtractionRecordInput,
  UpdateExtractionRecordInput,
  ClearExtractionHistoryInput,
} from "../types.js";

export type SetAiContextAction = Action & {
  type: "SET_AI_CONTEXT";
  input: SetAiContextInput;
};
export type AddExtractionRecordAction = Action & {
  type: "ADD_EXTRACTION_RECORD";
  input: AddExtractionRecordInput;
};
export type UpdateExtractionRecordAction = Action & {
  type: "UPDATE_EXTRACTION_RECORD";
  input: UpdateExtractionRecordInput;
};
export type ClearExtractionHistoryAction = Action & {
  type: "CLEAR_EXTRACTION_HISTORY";
  input: ClearExtractionHistoryInput;
};

export type WorkBreakdownExtractionAction =
  | SetAiContextAction
  | AddExtractionRecordAction
  | UpdateExtractionRecordAction
  | ClearExtractionHistoryAction;
