import type { Action } from "document-model";
import type {
  AddRequirementInput,
  UpdateRequirementInput,
  RemoveRequirementInput,
  SetRequirementStatusInput,
  AddAcceptanceCriterionInput,
  UpdateAcceptanceCriterionInput,
  RemoveAcceptanceCriterionInput,
  LinkRequirementsInput,
  AddRequirementCategoryInput,
  UpdateRequirementCategoryInput,
  RemoveRequirementCategoryInput,
} from "../types.js";

export type AddRequirementAction = Action & {
  type: "ADD_REQUIREMENT";
  input: AddRequirementInput;
};
export type UpdateRequirementAction = Action & {
  type: "UPDATE_REQUIREMENT";
  input: UpdateRequirementInput;
};
export type RemoveRequirementAction = Action & {
  type: "REMOVE_REQUIREMENT";
  input: RemoveRequirementInput;
};
export type SetRequirementStatusAction = Action & {
  type: "SET_REQUIREMENT_STATUS";
  input: SetRequirementStatusInput;
};
export type AddAcceptanceCriterionAction = Action & {
  type: "ADD_ACCEPTANCE_CRITERION";
  input: AddAcceptanceCriterionInput;
};
export type UpdateAcceptanceCriterionAction = Action & {
  type: "UPDATE_ACCEPTANCE_CRITERION";
  input: UpdateAcceptanceCriterionInput;
};
export type RemoveAcceptanceCriterionAction = Action & {
  type: "REMOVE_ACCEPTANCE_CRITERION";
  input: RemoveAcceptanceCriterionInput;
};
export type LinkRequirementsAction = Action & {
  type: "LINK_REQUIREMENTS";
  input: LinkRequirementsInput;
};
export type AddRequirementCategoryAction = Action & {
  type: "ADD_REQUIREMENT_CATEGORY";
  input: AddRequirementCategoryInput;
};
export type UpdateRequirementCategoryAction = Action & {
  type: "UPDATE_REQUIREMENT_CATEGORY";
  input: UpdateRequirementCategoryInput;
};
export type RemoveRequirementCategoryAction = Action & {
  type: "REMOVE_REQUIREMENT_CATEGORY";
  input: RemoveRequirementCategoryInput;
};

export type BusinessAnalysisRequirementsAction =
  | AddRequirementAction
  | UpdateRequirementAction
  | RemoveRequirementAction
  | SetRequirementStatusAction
  | AddAcceptanceCriterionAction
  | UpdateAcceptanceCriterionAction
  | RemoveAcceptanceCriterionAction
  | LinkRequirementsAction
  | AddRequirementCategoryAction
  | UpdateRequirementCategoryAction
  | RemoveRequirementCategoryAction;
