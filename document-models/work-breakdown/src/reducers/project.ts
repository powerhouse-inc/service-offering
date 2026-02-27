import type { WorkBreakdownProjectOperations } from "../../index.js";

export const workBreakdownProjectOperations: WorkBreakdownProjectOperations = {
  setProjectInfoOperation(state, action) {
    if (action.input.title !== undefined && action.input.title !== null)
      state.title = action.input.title;
    if (
      action.input.description !== undefined &&
      action.input.description !== null
    )
      state.description = action.input.description;
  },
  setPhaseOperation(state, action) {
    state.phase = action.input.phase;
  },
  setStatusOperation(state, action) {
    state.status = action.input.status;
  },
};
