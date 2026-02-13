import { type SignalDispatch } from "document-model";
import type {
  AddStakeholderAction,
  UpdateStakeholderAction,
  RemoveStakeholderAction,
  SetEngagementLevelAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisStakeholdersOperations {
  addStakeholderOperation: (
    state: BusinessAnalysisState,
    action: AddStakeholderAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateStakeholderOperation: (
    state: BusinessAnalysisState,
    action: UpdateStakeholderAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeStakeholderOperation: (
    state: BusinessAnalysisState,
    action: RemoveStakeholderAction,
    dispatch?: SignalDispatch,
  ) => void;
  setEngagementLevelOperation: (
    state: BusinessAnalysisState,
    action: SetEngagementLevelAction,
    dispatch?: SignalDispatch,
  ) => void;
}
