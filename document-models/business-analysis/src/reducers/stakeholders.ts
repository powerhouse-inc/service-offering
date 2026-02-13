import { UpdateStakeholderNotFoundError } from "../../gen/stakeholders/error.js";
import { RemoveStakeholderNotFoundError } from "../../gen/stakeholders/error.js";
import { EngagementStakeholderNotFoundError } from "../../gen/stakeholders/error.js";
import type { BusinessAnalysisStakeholdersOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisStakeholdersOperations: BusinessAnalysisStakeholdersOperations =
  {
    addStakeholderOperation(state, action) {
      state.stakeholders.push({
        id: action.input.id,
        name: action.input.name,
        role: action.input.role || null,
        organization: action.input.organization || null,
        email: action.input.email || null,
        influence: action.input.influence || null,
        interest: action.input.interest || null,
        engagementLevel: action.input.engagementLevel || null,
        notes: action.input.notes || null,
        createdAt: action.input.createdAt,
      });
    },
    updateStakeholderOperation(state, action) {
      const idx = state.stakeholders.findIndex((s) => s.id === action.input.id);
      if (idx === -1)
        throw new UpdateStakeholderNotFoundError(
          `Stakeholder ${action.input.id} not found`,
        );
      const s = state.stakeholders[idx];
      if (action.input.name) s.name = action.input.name;
      if (action.input.role !== undefined && action.input.role !== null)
        s.role = action.input.role;
      if (
        action.input.organization !== undefined &&
        action.input.organization !== null
      )
        s.organization = action.input.organization;
      if (action.input.email !== undefined && action.input.email !== null)
        s.email = action.input.email;
      if (action.input.influence) s.influence = action.input.influence;
      if (action.input.interest) s.interest = action.input.interest;
      if (action.input.notes !== undefined && action.input.notes !== null)
        s.notes = action.input.notes;
    },
    removeStakeholderOperation(state, action) {
      const idx = state.stakeholders.findIndex((s) => s.id === action.input.id);
      if (idx === -1)
        throw new RemoveStakeholderNotFoundError(
          `Stakeholder ${action.input.id} not found`,
        );
      state.stakeholders.splice(idx, 1);
    },
    setEngagementLevelOperation(state, action) {
      const s = state.stakeholders.find((s) => s.id === action.input.id);
      if (!s)
        throw new EngagementStakeholderNotFoundError(
          `Stakeholder ${action.input.id} not found`,
        );
      s.engagementLevel = action.input.engagementLevel;
    },
  };
