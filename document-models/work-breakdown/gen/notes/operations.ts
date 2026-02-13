import { type SignalDispatch } from "document-model";
import type { AddNoteAction, RemoveNoteAction } from "./actions.js";
import type { WorkBreakdownState } from "../types.js";

export interface WorkBreakdownNotesOperations {
  addNoteOperation: (
    state: WorkBreakdownState,
    action: AddNoteAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeNoteOperation: (
    state: WorkBreakdownState,
    action: RemoveNoteAction,
    dispatch?: SignalDispatch,
  ) => void;
}
