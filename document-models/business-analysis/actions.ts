import { baseActions } from "document-model";
import {
  projectActions,
  stakeholdersActions,
  requirementsActions,
  processesActions,
  analysisActions,
  kpisActions,
  decisionsActions,
  changesActions,
  deliverablesActions,
  risksActions,
  activityActions,
  scopeActions,
  glossaryActions,
  feedbackActions,
} from "./gen/creators.js";

/** Actions for the BusinessAnalysis document model */

export const actions = {
  ...baseActions,
  ...projectActions,
  ...stakeholdersActions,
  ...requirementsActions,
  ...processesActions,
  ...analysisActions,
  ...kpisActions,
  ...decisionsActions,
  ...changesActions,
  ...deliverablesActions,
  ...risksActions,
  ...activityActions,
  ...scopeActions,
  ...glossaryActions,
  ...feedbackActions,
};
