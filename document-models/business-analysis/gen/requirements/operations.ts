import { type SignalDispatch } from "document-model";
import type {
  AddRequirementAction,
  UpdateRequirementAction,
  RemoveRequirementAction,
  SetRequirementStatusAction,
  AddAcceptanceCriterionAction,
  UpdateAcceptanceCriterionAction,
  RemoveAcceptanceCriterionAction,
  LinkRequirementsAction,
  AddRequirementCategoryAction,
  UpdateRequirementCategoryAction,
  RemoveRequirementCategoryAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisRequirementsOperations {
  addRequirementOperation: (
    state: BusinessAnalysisState,
    action: AddRequirementAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRequirementOperation: (
    state: BusinessAnalysisState,
    action: UpdateRequirementAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRequirementOperation: (
    state: BusinessAnalysisState,
    action: RemoveRequirementAction,
    dispatch?: SignalDispatch,
  ) => void;
  setRequirementStatusOperation: (
    state: BusinessAnalysisState,
    action: SetRequirementStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  addAcceptanceCriterionOperation: (
    state: BusinessAnalysisState,
    action: AddAcceptanceCriterionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateAcceptanceCriterionOperation: (
    state: BusinessAnalysisState,
    action: UpdateAcceptanceCriterionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAcceptanceCriterionOperation: (
    state: BusinessAnalysisState,
    action: RemoveAcceptanceCriterionAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkRequirementsOperation: (
    state: BusinessAnalysisState,
    action: LinkRequirementsAction,
    dispatch?: SignalDispatch,
  ) => void;
  addRequirementCategoryOperation: (
    state: BusinessAnalysisState,
    action: AddRequirementCategoryAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRequirementCategoryOperation: (
    state: BusinessAnalysisState,
    action: UpdateRequirementCategoryAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRequirementCategoryOperation: (
    state: BusinessAnalysisState,
    action: RemoveRequirementCategoryAction,
    dispatch?: SignalDispatch,
  ) => void;
}
