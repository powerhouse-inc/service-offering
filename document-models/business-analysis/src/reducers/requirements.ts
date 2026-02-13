import {
  UpdateRequirementNotFoundError,
  RemoveRequirementNotFoundError,
  SetRequirementStatusNotFoundError,
  AddAcceptanceCriterionRequirementNotFoundError,
  UpdateAcceptanceCriterionNotFoundError,
  RemoveAcceptanceCriterionNotFoundError,
  LinkRequirementsNotFoundError,
  UpdateRequirementCategoryNotFoundError,
  RemoveRequirementCategoryNotFoundError,
} from "../../gen/requirements/error.js";
import type { BusinessAnalysisRequirementsOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisRequirementsOperations: BusinessAnalysisRequirementsOperations =
  {
    addRequirementOperation(state, action) {
      state.requirements.push({
        id: action.input.id,
        code: action.input.code || null,
        title: action.input.title,
        description: action.input.description || null,
        type: action.input.type,
        priority: action.input.priority || null,
        status: "DRAFT",
        categoryId: action.input.categoryId || null,
        source: action.input.source || null,
        rationale: action.input.rationale || null,
        acceptanceCriteria: [],
        linkedRequirementIds: [],
        linkedProcessIds: [],
        stakeholderIds: action.input.stakeholderIds || [],
        tags: action.input.tags || [],
        parentRequirementId: action.input.parentRequirementId || null,
        effort: action.input.effort || null,
        createdAt: action.input.createdAt,
        updatedAt: null,
      });
    },
    updateRequirementOperation(state, action) {
      const idx = state.requirements.findIndex((r) => r.id === action.input.id);
      if (idx === -1)
        throw new UpdateRequirementNotFoundError(
          `Requirement ${action.input.id} not found`,
        );
      const r = state.requirements[idx];
      if (action.input.code !== undefined && action.input.code !== null)
        r.code = action.input.code;
      if (action.input.title) r.title = action.input.title;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        r.description = action.input.description;
      if (action.input.type) r.type = action.input.type;
      if (action.input.priority) r.priority = action.input.priority;
      if (
        action.input.categoryId !== undefined &&
        action.input.categoryId !== null
      )
        r.categoryId = action.input.categoryId;
      if (action.input.source !== undefined && action.input.source !== null)
        r.source = action.input.source;
      if (
        action.input.rationale !== undefined &&
        action.input.rationale !== null
      )
        r.rationale = action.input.rationale;
      if (action.input.stakeholderIds)
        r.stakeholderIds = action.input.stakeholderIds;
      if (action.input.tags) r.tags = action.input.tags;
      if (
        action.input.parentRequirementId !== undefined &&
        action.input.parentRequirementId !== null
      )
        r.parentRequirementId = action.input.parentRequirementId;
      if (action.input.effort !== undefined && action.input.effort !== null)
        r.effort = action.input.effort;
      r.updatedAt = action.input.updatedAt;
    },
    removeRequirementOperation(state, action) {
      const idx = state.requirements.findIndex((r) => r.id === action.input.id);
      if (idx === -1)
        throw new RemoveRequirementNotFoundError(
          `Requirement ${action.input.id} not found`,
        );
      state.requirements.splice(idx, 1);
    },
    setRequirementStatusOperation(state, action) {
      const r = state.requirements.find((r) => r.id === action.input.id);
      if (!r)
        throw new SetRequirementStatusNotFoundError(
          `Requirement ${action.input.id} not found`,
        );
      r.status = action.input.status;
      r.updatedAt = action.input.updatedAt;
    },
    addAcceptanceCriterionOperation(state, action) {
      const r = state.requirements.find(
        (r) => r.id === action.input.requirementId,
      );
      if (!r)
        throw new AddAcceptanceCriterionRequirementNotFoundError(
          `Requirement ${action.input.requirementId} not found`,
        );
      r.acceptanceCriteria.push({
        id: action.input.id,
        description: action.input.description,
        verified: false,
      });
    },
    updateAcceptanceCriterionOperation(state, action) {
      const r = state.requirements.find(
        (r) => r.id === action.input.requirementId,
      );
      if (!r)
        throw new UpdateAcceptanceCriterionNotFoundError(
          `Requirement ${action.input.requirementId} not found`,
        );
      const ac = r.acceptanceCriteria.find((a) => a.id === action.input.id);
      if (!ac)
        throw new UpdateAcceptanceCriterionNotFoundError(
          `Acceptance criterion ${action.input.id} not found`,
        );
      if (action.input.description) ac.description = action.input.description;
      if (action.input.verified !== undefined && action.input.verified !== null)
        ac.verified = action.input.verified;
    },
    removeAcceptanceCriterionOperation(state, action) {
      const r = state.requirements.find(
        (r) => r.id === action.input.requirementId,
      );
      if (!r)
        throw new RemoveAcceptanceCriterionNotFoundError(
          `Requirement ${action.input.requirementId} not found`,
        );
      const acIdx = r.acceptanceCriteria.findIndex(
        (a) => a.id === action.input.id,
      );
      if (acIdx === -1)
        throw new RemoveAcceptanceCriterionNotFoundError(
          `Acceptance criterion ${action.input.id} not found`,
        );
      r.acceptanceCriteria.splice(acIdx, 1);
    },
    linkRequirementsOperation(state, action) {
      const r = state.requirements.find((r) => r.id === action.input.id);
      if (!r)
        throw new LinkRequirementsNotFoundError(
          `Requirement ${action.input.id} not found`,
        );
      if (action.input.linkedRequirementIds)
        r.linkedRequirementIds = action.input.linkedRequirementIds;
      if (action.input.linkedProcessIds)
        r.linkedProcessIds = action.input.linkedProcessIds;
    },
    addRequirementCategoryOperation(state, action) {
      state.requirementCategories.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        color: action.input.color || null,
      });
    },
    updateRequirementCategoryOperation(state, action) {
      const cat = state.requirementCategories.find(
        (c) => c.id === action.input.id,
      );
      if (!cat)
        throw new UpdateRequirementCategoryNotFoundError(
          `Category ${action.input.id} not found`,
        );
      if (action.input.name) cat.name = action.input.name;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        cat.description = action.input.description;
      if (action.input.color !== undefined && action.input.color !== null)
        cat.color = action.input.color;
    },
    removeRequirementCategoryOperation(state, action) {
      const idx = state.requirementCategories.findIndex(
        (c) => c.id === action.input.id,
      );
      if (idx === -1)
        throw new RemoveRequirementCategoryNotFoundError(
          `Category ${action.input.id} not found`,
        );
      state.requirementCategories.splice(idx, 1);
    },
  };
