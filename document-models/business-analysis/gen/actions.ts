import type { BusinessAnalysisProjectAction } from "./project/actions.js";
import type { BusinessAnalysisStakeholdersAction } from "./stakeholders/actions.js";
import type { BusinessAnalysisRequirementsAction } from "./requirements/actions.js";
import type { BusinessAnalysisProcessesAction } from "./processes/actions.js";
import type { BusinessAnalysisAnalysisAction } from "./analysis/actions.js";
import type { BusinessAnalysisKpisAction } from "./kpis/actions.js";
import type { BusinessAnalysisDecisionsAction } from "./decisions/actions.js";
import type { BusinessAnalysisChangesAction } from "./changes/actions.js";
import type { BusinessAnalysisDeliverablesAction } from "./deliverables/actions.js";
import type { BusinessAnalysisRisksAction } from "./risks/actions.js";
import type { BusinessAnalysisActivityAction } from "./activity/actions.js";
import type { BusinessAnalysisScopeAction } from "./scope/actions.js";
import type { BusinessAnalysisGlossaryAction } from "./glossary/actions.js";
import type { BusinessAnalysisFeedbackAction } from "./feedback/actions.js";

export * from "./project/actions.js";
export * from "./stakeholders/actions.js";
export * from "./requirements/actions.js";
export * from "./processes/actions.js";
export * from "./analysis/actions.js";
export * from "./kpis/actions.js";
export * from "./decisions/actions.js";
export * from "./changes/actions.js";
export * from "./deliverables/actions.js";
export * from "./risks/actions.js";
export * from "./activity/actions.js";
export * from "./scope/actions.js";
export * from "./glossary/actions.js";
export * from "./feedback/actions.js";

export type BusinessAnalysisAction =
  | BusinessAnalysisProjectAction
  | BusinessAnalysisStakeholdersAction
  | BusinessAnalysisRequirementsAction
  | BusinessAnalysisProcessesAction
  | BusinessAnalysisAnalysisAction
  | BusinessAnalysisKpisAction
  | BusinessAnalysisDecisionsAction
  | BusinessAnalysisChangesAction
  | BusinessAnalysisDeliverablesAction
  | BusinessAnalysisRisksAction
  | BusinessAnalysisActivityAction
  | BusinessAnalysisScopeAction
  | BusinessAnalysisGlossaryAction
  | BusinessAnalysisFeedbackAction;
