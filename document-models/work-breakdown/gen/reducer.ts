// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { WorkBreakdownPHState } from "@powerhousedao/service-offering/document-models/work-breakdown";

import { workBreakdownProjectOperations } from "../src/reducers/project.js";
import { workBreakdownTemplatesOperations } from "../src/reducers/templates.js";
import { workBreakdownScenarioOperations } from "../src/reducers/scenario.js";
import { workBreakdownPrerequisitesOperations } from "../src/reducers/prerequisites.js";
import { workBreakdownTasksOperations } from "../src/reducers/tasks.js";
import { workBreakdownDependenciesOperations } from "../src/reducers/dependencies.js";
import { workBreakdownNotesOperations } from "../src/reducers/notes.js";
import { workBreakdownExtractionOperations } from "../src/reducers/extraction.js";

import {
  SetProjectInfoInputSchema,
  SetPhaseInputSchema,
  SetStatusInputSchema,
  AddTemplateInputSchema,
  UpdateTemplateInputSchema,
  RemoveTemplateInputSchema,
  SetTemplateModeInputSchema,
  ApplyTemplateInputSchema,
  AddInputInputSchema,
  UpdateInputInputSchema,
  RemoveInputInputSchema,
  AddStepInputSchema,
  UpdateStepInputSchema,
  RemoveStepInputSchema,
  AddSubstepInputSchema,
  UpdateSubstepInputSchema,
  RemoveSubstepInputSchema,
  AddPrerequisiteInputSchema,
  UpdatePrerequisiteInputSchema,
  RemovePrerequisiteInputSchema,
  SetPrerequisiteStatusInputSchema,
  AddTaskInputSchema,
  BulkAddTasksInputSchema,
  UpdateTaskInputSchema,
  RemoveTaskInputSchema,
  SetTaskStatusInputSchema,
  AddDependencyInputSchema,
  UpdateDependencyInputSchema,
  RemoveDependencyInputSchema,
  AddNoteInputSchema,
  RemoveNoteInputSchema,
  SetAiContextInputSchema,
  AddExtractionRecordInputSchema,
  UpdateExtractionRecordInputSchema,
  ClearExtractionHistoryInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<WorkBreakdownPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_PROJECT_INFO": {
      SetProjectInfoInputSchema().parse(action.input);

      workBreakdownProjectOperations.setProjectInfoOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PHASE": {
      SetPhaseInputSchema().parse(action.input);

      workBreakdownProjectOperations.setPhaseOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_STATUS": {
      SetStatusInputSchema().parse(action.input);

      workBreakdownProjectOperations.setStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_TEMPLATE": {
      AddTemplateInputSchema().parse(action.input);

      workBreakdownTemplatesOperations.addTemplateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_TEMPLATE": {
      UpdateTemplateInputSchema().parse(action.input);

      workBreakdownTemplatesOperations.updateTemplateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_TEMPLATE": {
      RemoveTemplateInputSchema().parse(action.input);

      workBreakdownTemplatesOperations.removeTemplateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_TEMPLATE_MODE": {
      SetTemplateModeInputSchema().parse(action.input);

      workBreakdownTemplatesOperations.setTemplateModeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "APPLY_TEMPLATE": {
      ApplyTemplateInputSchema().parse(action.input);

      workBreakdownTemplatesOperations.applyTemplateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_INPUT": {
      AddInputInputSchema().parse(action.input);

      workBreakdownScenarioOperations.addInputOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_INPUT": {
      UpdateInputInputSchema().parse(action.input);

      workBreakdownScenarioOperations.updateInputOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_INPUT": {
      RemoveInputInputSchema().parse(action.input);

      workBreakdownScenarioOperations.removeInputOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_STEP": {
      AddStepInputSchema().parse(action.input);

      workBreakdownScenarioOperations.addStepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_STEP": {
      UpdateStepInputSchema().parse(action.input);

      workBreakdownScenarioOperations.updateStepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_STEP": {
      RemoveStepInputSchema().parse(action.input);

      workBreakdownScenarioOperations.removeStepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SUBSTEP": {
      AddSubstepInputSchema().parse(action.input);

      workBreakdownScenarioOperations.addSubstepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SUBSTEP": {
      UpdateSubstepInputSchema().parse(action.input);

      workBreakdownScenarioOperations.updateSubstepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SUBSTEP": {
      RemoveSubstepInputSchema().parse(action.input);

      workBreakdownScenarioOperations.removeSubstepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_PREREQUISITE": {
      AddPrerequisiteInputSchema().parse(action.input);

      workBreakdownPrerequisitesOperations.addPrerequisiteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_PREREQUISITE": {
      UpdatePrerequisiteInputSchema().parse(action.input);

      workBreakdownPrerequisitesOperations.updatePrerequisiteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_PREREQUISITE": {
      RemovePrerequisiteInputSchema().parse(action.input);

      workBreakdownPrerequisitesOperations.removePrerequisiteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PREREQUISITE_STATUS": {
      SetPrerequisiteStatusInputSchema().parse(action.input);

      workBreakdownPrerequisitesOperations.setPrerequisiteStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_TASK": {
      AddTaskInputSchema().parse(action.input);

      workBreakdownTasksOperations.addTaskOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "BULK_ADD_TASKS": {
      BulkAddTasksInputSchema().parse(action.input);

      workBreakdownTasksOperations.bulkAddTasksOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_TASK": {
      UpdateTaskInputSchema().parse(action.input);

      workBreakdownTasksOperations.updateTaskOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_TASK": {
      RemoveTaskInputSchema().parse(action.input);

      workBreakdownTasksOperations.removeTaskOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_TASK_STATUS": {
      SetTaskStatusInputSchema().parse(action.input);

      workBreakdownTasksOperations.setTaskStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_DEPENDENCY": {
      AddDependencyInputSchema().parse(action.input);

      workBreakdownDependenciesOperations.addDependencyOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_DEPENDENCY": {
      UpdateDependencyInputSchema().parse(action.input);

      workBreakdownDependenciesOperations.updateDependencyOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_DEPENDENCY": {
      RemoveDependencyInputSchema().parse(action.input);

      workBreakdownDependenciesOperations.removeDependencyOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_NOTE": {
      AddNoteInputSchema().parse(action.input);

      workBreakdownNotesOperations.addNoteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_NOTE": {
      RemoveNoteInputSchema().parse(action.input);

      workBreakdownNotesOperations.removeNoteOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_AI_CONTEXT": {
      SetAiContextInputSchema().parse(action.input);

      workBreakdownExtractionOperations.setAiContextOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_EXTRACTION_RECORD": {
      AddExtractionRecordInputSchema().parse(action.input);

      workBreakdownExtractionOperations.addExtractionRecordOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_EXTRACTION_RECORD": {
      UpdateExtractionRecordInputSchema().parse(action.input);

      workBreakdownExtractionOperations.updateExtractionRecordOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CLEAR_EXTRACTION_HISTORY": {
      ClearExtractionHistoryInputSchema().parse(action.input);

      workBreakdownExtractionOperations.clearExtractionHistoryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer = createReducer<WorkBreakdownPHState>(stateReducer);
