import { createAction } from "document-model/core";
import {
  AddRequirementInputSchema,
  UpdateRequirementInputSchema,
  RemoveRequirementInputSchema,
  SetRequirementStatusInputSchema,
  AddAcceptanceCriterionInputSchema,
  UpdateAcceptanceCriterionInputSchema,
  RemoveAcceptanceCriterionInputSchema,
  LinkRequirementsInputSchema,
  AddRequirementCategoryInputSchema,
  UpdateRequirementCategoryInputSchema,
  RemoveRequirementCategoryInputSchema,
} from "../schema/zod.js";
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

export const addRequirement = (input: AddRequirementInput) =>
  createAction<AddRequirementAction>(
    "ADD_REQUIREMENT",
    { ...input },
    undefined,
    AddRequirementInputSchema,
    "global",
  );

export const updateRequirement = (input: UpdateRequirementInput) =>
  createAction<UpdateRequirementAction>(
    "UPDATE_REQUIREMENT",
    { ...input },
    undefined,
    UpdateRequirementInputSchema,
    "global",
  );

export const removeRequirement = (input: RemoveRequirementInput) =>
  createAction<RemoveRequirementAction>(
    "REMOVE_REQUIREMENT",
    { ...input },
    undefined,
    RemoveRequirementInputSchema,
    "global",
  );

export const setRequirementStatus = (input: SetRequirementStatusInput) =>
  createAction<SetRequirementStatusAction>(
    "SET_REQUIREMENT_STATUS",
    { ...input },
    undefined,
    SetRequirementStatusInputSchema,
    "global",
  );

export const addAcceptanceCriterion = (input: AddAcceptanceCriterionInput) =>
  createAction<AddAcceptanceCriterionAction>(
    "ADD_ACCEPTANCE_CRITERION",
    { ...input },
    undefined,
    AddAcceptanceCriterionInputSchema,
    "global",
  );

export const updateAcceptanceCriterion = (
  input: UpdateAcceptanceCriterionInput,
) =>
  createAction<UpdateAcceptanceCriterionAction>(
    "UPDATE_ACCEPTANCE_CRITERION",
    { ...input },
    undefined,
    UpdateAcceptanceCriterionInputSchema,
    "global",
  );

export const removeAcceptanceCriterion = (
  input: RemoveAcceptanceCriterionInput,
) =>
  createAction<RemoveAcceptanceCriterionAction>(
    "REMOVE_ACCEPTANCE_CRITERION",
    { ...input },
    undefined,
    RemoveAcceptanceCriterionInputSchema,
    "global",
  );

export const linkRequirements = (input: LinkRequirementsInput) =>
  createAction<LinkRequirementsAction>(
    "LINK_REQUIREMENTS",
    { ...input },
    undefined,
    LinkRequirementsInputSchema,
    "global",
  );

export const addRequirementCategory = (input: AddRequirementCategoryInput) =>
  createAction<AddRequirementCategoryAction>(
    "ADD_REQUIREMENT_CATEGORY",
    { ...input },
    undefined,
    AddRequirementCategoryInputSchema,
    "global",
  );

export const updateRequirementCategory = (
  input: UpdateRequirementCategoryInput,
) =>
  createAction<UpdateRequirementCategoryAction>(
    "UPDATE_REQUIREMENT_CATEGORY",
    { ...input },
    undefined,
    UpdateRequirementCategoryInputSchema,
    "global",
  );

export const removeRequirementCategory = (
  input: RemoveRequirementCategoryInput,
) =>
  createAction<RemoveRequirementCategoryAction>(
    "REMOVE_REQUIREMENT_CATEGORY",
    { ...input },
    undefined,
    RemoveRequirementCategoryInputSchema,
    "global",
  );
