import { baseActions } from "document-model";
import {
  projectActions,
  templatesActions,
  scenarioActions,
  prerequisitesActions,
  tasksActions,
  dependenciesActions,
  notesActions,
  extractionActions,
} from "./gen/creators.js";

/** Actions for the WorkBreakdown document model */

export const actions = {
  ...baseActions,
  ...projectActions,
  ...templatesActions,
  ...scenarioActions,
  ...prerequisitesActions,
  ...tasksActions,
  ...dependenciesActions,
  ...notesActions,
  ...extractionActions,
};
