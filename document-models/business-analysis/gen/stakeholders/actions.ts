import type { Action } from "document-model";
import type {
  AddStakeholderInput,
  UpdateStakeholderInput,
  RemoveStakeholderInput,
  SetEngagementLevelInput,
} from "../types.js";

export type AddStakeholderAction = Action & {
  type: "ADD_STAKEHOLDER";
  input: AddStakeholderInput;
};
export type UpdateStakeholderAction = Action & {
  type: "UPDATE_STAKEHOLDER";
  input: UpdateStakeholderInput;
};
export type RemoveStakeholderAction = Action & {
  type: "REMOVE_STAKEHOLDER";
  input: RemoveStakeholderInput;
};
export type SetEngagementLevelAction = Action & {
  type: "SET_ENGAGEMENT_LEVEL";
  input: SetEngagementLevelInput;
};

export type BusinessAnalysisStakeholdersAction =
  | AddStakeholderAction
  | UpdateStakeholderAction
  | RemoveStakeholderAction
  | SetEngagementLevelAction;
