import type { WorkBreakdownProjectAction } from "./project/actions.js";
import type { WorkBreakdownTemplatesAction } from "./templates/actions.js";
import type { WorkBreakdownScenarioAction } from "./scenario/actions.js";
import type { WorkBreakdownPrerequisitesAction } from "./prerequisites/actions.js";
import type { WorkBreakdownTasksAction } from "./tasks/actions.js";
import type { WorkBreakdownDependenciesAction } from "./dependencies/actions.js";
import type { WorkBreakdownNotesAction } from "./notes/actions.js";
import type { WorkBreakdownExtractionAction } from "./extraction/actions.js";

export * from "./project/actions.js";
export * from "./templates/actions.js";
export * from "./scenario/actions.js";
export * from "./prerequisites/actions.js";
export * from "./tasks/actions.js";
export * from "./dependencies/actions.js";
export * from "./notes/actions.js";
export * from "./extraction/actions.js";

export type WorkBreakdownAction =
  | WorkBreakdownProjectAction
  | WorkBreakdownTemplatesAction
  | WorkBreakdownScenarioAction
  | WorkBreakdownPrerequisitesAction
  | WorkBreakdownTasksAction
  | WorkBreakdownDependenciesAction
  | WorkBreakdownNotesAction
  | WorkBreakdownExtractionAction;
