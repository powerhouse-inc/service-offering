import {
  UpdateGlossaryTermNotFoundError,
  RemoveGlossaryTermNotFoundError,
} from "../../gen/glossary/error.js";
import type { BusinessAnalysisGlossaryOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisGlossaryOperations: BusinessAnalysisGlossaryOperations =
  {
    addGlossaryTermOperation(state, action) {
      state.glossary.push({
        id: action.input.id,
        term: action.input.term,
        definition: action.input.definition,
        context: action.input.context || null,
        aliases: action.input.aliases || [],
        linkedRequirementIds: action.input.linkedRequirementIds || [],
        createdAt: action.input.createdAt,
      });
    },
    updateGlossaryTermOperation(state, action) {
      const t = state.glossary.find((t) => t.id === action.input.id);
      if (!t)
        throw new UpdateGlossaryTermNotFoundError(
          `Glossary term ${action.input.id} not found`,
        );
      if (action.input.term) t.term = action.input.term;
      if (action.input.definition) t.definition = action.input.definition;
      if (action.input.context !== undefined && action.input.context !== null)
        t.context = action.input.context;
      if (action.input.aliases) t.aliases = action.input.aliases;
      if (action.input.linkedRequirementIds)
        t.linkedRequirementIds = action.input.linkedRequirementIds;
    },
    removeGlossaryTermOperation(state, action) {
      const idx = state.glossary.findIndex((t) => t.id === action.input.id);
      if (idx === -1)
        throw new RemoveGlossaryTermNotFoundError(
          `Glossary term ${action.input.id} not found`,
        );
      state.glossary.splice(idx, 1);
    },
  };
