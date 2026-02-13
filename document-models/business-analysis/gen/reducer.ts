// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { BusinessAnalysisPHState } from "@powerhousedao/service-offering/document-models/business-analysis";

import { businessAnalysisProjectOperations } from "../src/reducers/project.js";
import { businessAnalysisStakeholdersOperations } from "../src/reducers/stakeholders.js";
import { businessAnalysisRequirementsOperations } from "../src/reducers/requirements.js";
import { businessAnalysisProcessesOperations } from "../src/reducers/processes.js";
import { businessAnalysisAnalysisOperations } from "../src/reducers/analysis.js";
import { businessAnalysisKpisOperations } from "../src/reducers/kpis.js";
import { businessAnalysisDecisionsOperations } from "../src/reducers/decisions.js";
import { businessAnalysisChangesOperations } from "../src/reducers/changes.js";
import { businessAnalysisDeliverablesOperations } from "../src/reducers/deliverables.js";
import { businessAnalysisRisksOperations } from "../src/reducers/risks.js";
import { businessAnalysisActivityOperations } from "../src/reducers/activity.js";
import { businessAnalysisScopeOperations } from "../src/reducers/scope.js";
import { businessAnalysisGlossaryOperations } from "../src/reducers/glossary.js";
import { businessAnalysisFeedbackOperations } from "../src/reducers/feedback.js";

import {
  SetProjectInfoInputSchema,
  SetProjectPhaseInputSchema,
  SetProjectStatusInputSchema,
  AddStakeholderInputSchema,
  UpdateStakeholderInputSchema,
  RemoveStakeholderInputSchema,
  SetEngagementLevelInputSchema,
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
  AddProcessInputSchema,
  UpdateProcessInputSchema,
  RemoveProcessInputSchema,
  AddProcessStepInputSchema,
  UpdateProcessStepInputSchema,
  RemoveProcessStepInputSchema,
  ReorderProcessStepsInputSchema,
  AddAnalysisInputSchema,
  UpdateAnalysisInputSchema,
  RemoveAnalysisInputSchema,
  AddAnalysisEntryInputSchema,
  UpdateAnalysisEntryInputSchema,
  RemoveAnalysisEntryInputSchema,
  AddKpiInputSchema,
  UpdateKpiInputSchema,
  RemoveKpiInputSchema,
  RecordKpiMeasurementInputSchema,
  SetKpiStatusInputSchema,
  AddDecisionInputSchema,
  UpdateDecisionInputSchema,
  RemoveDecisionInputSchema,
  SetDecisionStatusInputSchema,
  AddChangeRequestInputSchema,
  UpdateChangeRequestInputSchema,
  SetChangeRequestStatusInputSchema,
  AddDeliverableInputSchema,
  UpdateDeliverableInputSchema,
  RemoveDeliverableInputSchema,
  SetDeliverableStatusInputSchema,
  AddRiskInputSchema,
  UpdateRiskInputSchema,
  RemoveRiskInputSchema,
  SetRiskStatusInputSchema,
  LogActivityInputSchema,
  AddAssumptionInputSchema,
  UpdateAssumptionInputSchema,
  RemoveAssumptionInputSchema,
  SetAssumptionStatusInputSchema,
  AddScopeItemInputSchema,
  UpdateScopeItemInputSchema,
  RemoveScopeItemInputSchema,
  AddGlossaryTermInputSchema,
  UpdateGlossaryTermInputSchema,
  RemoveGlossaryTermInputSchema,
  SubmitFeedbackInputSchema,
  RespondToFeedbackInputSchema,
  ResolveFeedbackInputSchema,
  RemoveFeedbackInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<BusinessAnalysisPHState> = (
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

      businessAnalysisProjectOperations.setProjectInfoOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PROJECT_PHASE": {
      SetProjectPhaseInputSchema().parse(action.input);

      businessAnalysisProjectOperations.setProjectPhaseOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PROJECT_STATUS": {
      SetProjectStatusInputSchema().parse(action.input);

      businessAnalysisProjectOperations.setProjectStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_STAKEHOLDER": {
      AddStakeholderInputSchema().parse(action.input);

      businessAnalysisStakeholdersOperations.addStakeholderOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_STAKEHOLDER": {
      UpdateStakeholderInputSchema().parse(action.input);

      businessAnalysisStakeholdersOperations.updateStakeholderOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_STAKEHOLDER": {
      RemoveStakeholderInputSchema().parse(action.input);

      businessAnalysisStakeholdersOperations.removeStakeholderOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_ENGAGEMENT_LEVEL": {
      SetEngagementLevelInputSchema().parse(action.input);

      businessAnalysisStakeholdersOperations.setEngagementLevelOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_REQUIREMENT": {
      AddRequirementInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.addRequirementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_REQUIREMENT": {
      UpdateRequirementInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.updateRequirementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_REQUIREMENT": {
      RemoveRequirementInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.removeRequirementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_REQUIREMENT_STATUS": {
      SetRequirementStatusInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.setRequirementStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ACCEPTANCE_CRITERION": {
      AddAcceptanceCriterionInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.addAcceptanceCriterionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_ACCEPTANCE_CRITERION": {
      UpdateAcceptanceCriterionInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.updateAcceptanceCriterionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ACCEPTANCE_CRITERION": {
      RemoveAcceptanceCriterionInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.removeAcceptanceCriterionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LINK_REQUIREMENTS": {
      LinkRequirementsInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.linkRequirementsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_REQUIREMENT_CATEGORY": {
      AddRequirementCategoryInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.addRequirementCategoryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_REQUIREMENT_CATEGORY": {
      UpdateRequirementCategoryInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.updateRequirementCategoryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_REQUIREMENT_CATEGORY": {
      RemoveRequirementCategoryInputSchema().parse(action.input);

      businessAnalysisRequirementsOperations.removeRequirementCategoryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_PROCESS": {
      AddProcessInputSchema().parse(action.input);

      businessAnalysisProcessesOperations.addProcessOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_PROCESS": {
      UpdateProcessInputSchema().parse(action.input);

      businessAnalysisProcessesOperations.updateProcessOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_PROCESS": {
      RemoveProcessInputSchema().parse(action.input);

      businessAnalysisProcessesOperations.removeProcessOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_PROCESS_STEP": {
      AddProcessStepInputSchema().parse(action.input);

      businessAnalysisProcessesOperations.addProcessStepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_PROCESS_STEP": {
      UpdateProcessStepInputSchema().parse(action.input);

      businessAnalysisProcessesOperations.updateProcessStepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_PROCESS_STEP": {
      RemoveProcessStepInputSchema().parse(action.input);

      businessAnalysisProcessesOperations.removeProcessStepOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REORDER_PROCESS_STEPS": {
      ReorderProcessStepsInputSchema().parse(action.input);

      businessAnalysisProcessesOperations.reorderProcessStepsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ANALYSIS": {
      AddAnalysisInputSchema().parse(action.input);

      businessAnalysisAnalysisOperations.addAnalysisOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_ANALYSIS": {
      UpdateAnalysisInputSchema().parse(action.input);

      businessAnalysisAnalysisOperations.updateAnalysisOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ANALYSIS": {
      RemoveAnalysisInputSchema().parse(action.input);

      businessAnalysisAnalysisOperations.removeAnalysisOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ANALYSIS_ENTRY": {
      AddAnalysisEntryInputSchema().parse(action.input);

      businessAnalysisAnalysisOperations.addAnalysisEntryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_ANALYSIS_ENTRY": {
      UpdateAnalysisEntryInputSchema().parse(action.input);

      businessAnalysisAnalysisOperations.updateAnalysisEntryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ANALYSIS_ENTRY": {
      RemoveAnalysisEntryInputSchema().parse(action.input);

      businessAnalysisAnalysisOperations.removeAnalysisEntryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_KPI": {
      AddKpiInputSchema().parse(action.input);

      businessAnalysisKpisOperations.addKpiOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_KPI": {
      UpdateKpiInputSchema().parse(action.input);

      businessAnalysisKpisOperations.updateKpiOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_KPI": {
      RemoveKpiInputSchema().parse(action.input);

      businessAnalysisKpisOperations.removeKpiOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RECORD_KPI_MEASUREMENT": {
      RecordKpiMeasurementInputSchema().parse(action.input);

      businessAnalysisKpisOperations.recordKpiMeasurementOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_KPI_STATUS": {
      SetKpiStatusInputSchema().parse(action.input);

      businessAnalysisKpisOperations.setKpiStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_DECISION": {
      AddDecisionInputSchema().parse(action.input);

      businessAnalysisDecisionsOperations.addDecisionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_DECISION": {
      UpdateDecisionInputSchema().parse(action.input);

      businessAnalysisDecisionsOperations.updateDecisionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_DECISION": {
      RemoveDecisionInputSchema().parse(action.input);

      businessAnalysisDecisionsOperations.removeDecisionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_DECISION_STATUS": {
      SetDecisionStatusInputSchema().parse(action.input);

      businessAnalysisDecisionsOperations.setDecisionStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_CHANGE_REQUEST": {
      AddChangeRequestInputSchema().parse(action.input);

      businessAnalysisChangesOperations.addChangeRequestOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_CHANGE_REQUEST": {
      UpdateChangeRequestInputSchema().parse(action.input);

      businessAnalysisChangesOperations.updateChangeRequestOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_CHANGE_REQUEST_STATUS": {
      SetChangeRequestStatusInputSchema().parse(action.input);

      businessAnalysisChangesOperations.setChangeRequestStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_DELIVERABLE": {
      AddDeliverableInputSchema().parse(action.input);

      businessAnalysisDeliverablesOperations.addDeliverableOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_DELIVERABLE": {
      UpdateDeliverableInputSchema().parse(action.input);

      businessAnalysisDeliverablesOperations.updateDeliverableOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_DELIVERABLE": {
      RemoveDeliverableInputSchema().parse(action.input);

      businessAnalysisDeliverablesOperations.removeDeliverableOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_DELIVERABLE_STATUS": {
      SetDeliverableStatusInputSchema().parse(action.input);

      businessAnalysisDeliverablesOperations.setDeliverableStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_RISK": {
      AddRiskInputSchema().parse(action.input);

      businessAnalysisRisksOperations.addRiskOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_RISK": {
      UpdateRiskInputSchema().parse(action.input);

      businessAnalysisRisksOperations.updateRiskOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_RISK": {
      RemoveRiskInputSchema().parse(action.input);

      businessAnalysisRisksOperations.removeRiskOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_RISK_STATUS": {
      SetRiskStatusInputSchema().parse(action.input);

      businessAnalysisRisksOperations.setRiskStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "LOG_ACTIVITY": {
      LogActivityInputSchema().parse(action.input);

      businessAnalysisActivityOperations.logActivityOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ASSUMPTION": {
      AddAssumptionInputSchema().parse(action.input);

      businessAnalysisScopeOperations.addAssumptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_ASSUMPTION": {
      UpdateAssumptionInputSchema().parse(action.input);

      businessAnalysisScopeOperations.updateAssumptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ASSUMPTION": {
      RemoveAssumptionInputSchema().parse(action.input);

      businessAnalysisScopeOperations.removeAssumptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_ASSUMPTION_STATUS": {
      SetAssumptionStatusInputSchema().parse(action.input);

      businessAnalysisScopeOperations.setAssumptionStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SCOPE_ITEM": {
      AddScopeItemInputSchema().parse(action.input);

      businessAnalysisScopeOperations.addScopeItemOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SCOPE_ITEM": {
      UpdateScopeItemInputSchema().parse(action.input);

      businessAnalysisScopeOperations.updateScopeItemOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SCOPE_ITEM": {
      RemoveScopeItemInputSchema().parse(action.input);

      businessAnalysisScopeOperations.removeScopeItemOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_GLOSSARY_TERM": {
      AddGlossaryTermInputSchema().parse(action.input);

      businessAnalysisGlossaryOperations.addGlossaryTermOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_GLOSSARY_TERM": {
      UpdateGlossaryTermInputSchema().parse(action.input);

      businessAnalysisGlossaryOperations.updateGlossaryTermOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_GLOSSARY_TERM": {
      RemoveGlossaryTermInputSchema().parse(action.input);

      businessAnalysisGlossaryOperations.removeGlossaryTermOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SUBMIT_FEEDBACK": {
      SubmitFeedbackInputSchema().parse(action.input);

      businessAnalysisFeedbackOperations.submitFeedbackOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RESPOND_TO_FEEDBACK": {
      RespondToFeedbackInputSchema().parse(action.input);

      businessAnalysisFeedbackOperations.respondToFeedbackOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RESOLVE_FEEDBACK": {
      ResolveFeedbackInputSchema().parse(action.input);

      businessAnalysisFeedbackOperations.resolveFeedbackOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_FEEDBACK": {
      RemoveFeedbackInputSchema().parse(action.input);

      businessAnalysisFeedbackOperations.removeFeedbackOperation(
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

export const reducer = createReducer<BusinessAnalysisPHState>(stateReducer);
