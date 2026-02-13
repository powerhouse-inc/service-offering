import { type SignalDispatch } from "document-model";
import type {
  AddChangeRequestAction,
  UpdateChangeRequestAction,
  SetChangeRequestStatusAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisChangesOperations {
  addChangeRequestOperation: (
    state: BusinessAnalysisState,
    action: AddChangeRequestAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateChangeRequestOperation: (
    state: BusinessAnalysisState,
    action: UpdateChangeRequestAction,
    dispatch?: SignalDispatch,
  ) => void;
  setChangeRequestStatusOperation: (
    state: BusinessAnalysisState,
    action: SetChangeRequestStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
}
