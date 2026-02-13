import type { BusinessAnalysisProjectOperations } from "@powerhousedao/service-offering/document-models/business-analysis";

export const businessAnalysisProjectOperations: BusinessAnalysisProjectOperations =
  {
    setProjectInfoOperation(state, action) {
      if (
        action.input.projectName !== undefined &&
        action.input.projectName !== null
      )
        state.projectName = action.input.projectName;
      if (
        action.input.projectDescription !== undefined &&
        action.input.projectDescription !== null
      )
        state.projectDescription = action.input.projectDescription;
      if (
        action.input.organization !== undefined &&
        action.input.organization !== null
      )
        state.organization = action.input.organization;
      if (action.input.sponsor !== undefined && action.input.sponsor !== null)
        state.sponsor = action.input.sponsor;
      if (
        action.input.startDate !== undefined &&
        action.input.startDate !== null
      )
        state.startDate = action.input.startDate;
      if (
        action.input.targetEndDate !== undefined &&
        action.input.targetEndDate !== null
      )
        state.targetEndDate = action.input.targetEndDate;
    },
    setProjectPhaseOperation(state, action) {
      state.projectPhase = action.input.phase;
    },
    setProjectStatusOperation(state, action) {
      state.projectStatus = action.input.status;
    },
  };
