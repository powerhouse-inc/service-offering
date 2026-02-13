import {
  UpdateTemplateNotFoundError,
  RemoveTemplateNotFoundError,
  ApplyTemplateNotFoundError,
  ApplyTemplateStepsExistError,
} from "../../gen/templates/error.js";
import type { WorkBreakdownTemplatesOperations } from "@powerhousedao/service-offering/document-models/work-breakdown";

export const workBreakdownTemplatesOperations: WorkBreakdownTemplatesOperations =
  {
    addTemplateOperation(state, action) {
      state.templates.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        domain: action.input.domain || null,
        steps: (action.input.steps || []).map((s) => ({
          id: s.id,
          order: s.order,
          name: s.name,
          description: s.description || null,
          substeps: (s.substeps || []).map((ss) => ({
            id: ss.id,
            order: ss.order,
            name: ss.name,
            description: ss.description || null,
          })),
        })),
        createdAt: action.input.createdAt,
      });
    },
    updateTemplateOperation(state, action) {
      const tpl = state.templates.find((t) => t.id === action.input.id);
      if (!tpl)
        throw new UpdateTemplateNotFoundError(
          `Template ${action.input.id} not found`,
        );
      if (action.input.name) tpl.name = action.input.name;
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      )
        tpl.description = action.input.description;
      if (action.input.domain !== undefined && action.input.domain !== null)
        tpl.domain = action.input.domain;
    },
    removeTemplateOperation(state, action) {
      const idx = state.templates.findIndex((t) => t.id === action.input.id);
      if (idx === -1)
        throw new RemoveTemplateNotFoundError(
          `Template ${action.input.id} not found`,
        );
      state.templates.splice(idx, 1);
    },
    setTemplateModeOperation(state, action) {
      state.templateMode = action.input.mode;
    },
    applyTemplateOperation(state, action) {
      const template = state.templates.find(
        (t) => t.id === action.input.templateId,
      );
      if (!template)
        throw new ApplyTemplateNotFoundError(
          `Template ${action.input.templateId} not found`,
        );
      if (state.steps.length > 0)
        throw new ApplyTemplateStepsExistError(
          "Steps already exist. Remove existing steps before applying a template.",
        );
      for (const ts of template.steps) {
        state.steps.push({
          id: ts.id,
          order: ts.order,
          name: ts.name,
          description: ts.description || null,
          substeps: (ts.substeps || []).map((ss) => ({
            id: ss.id,
            stepId: ts.id,
            order: ss.order,
            name: ss.name,
            description: ss.description || null,
            acceptanceCriteria: null,
          })),
          templateStepId: ts.id,
        });
      }
      state.appliedTemplateId = action.input.templateId;
    },
  };
