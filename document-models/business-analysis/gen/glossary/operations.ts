import { type SignalDispatch } from "document-model";
import type {
  AddGlossaryTermAction,
  UpdateGlossaryTermAction,
  RemoveGlossaryTermAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisGlossaryOperations {
  addGlossaryTermOperation: (
    state: BusinessAnalysisState,
    action: AddGlossaryTermAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateGlossaryTermOperation: (
    state: BusinessAnalysisState,
    action: UpdateGlossaryTermAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeGlossaryTermOperation: (
    state: BusinessAnalysisState,
    action: RemoveGlossaryTermAction,
    dispatch?: SignalDispatch,
  ) => void;
}
