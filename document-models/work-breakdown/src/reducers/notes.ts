import { RemoveNoteNotFoundError } from "../../gen/notes/error.js";
import type { WorkBreakdownNotesOperations } from "../../index.js";

export const workBreakdownNotesOperations: WorkBreakdownNotesOperations = {
  addNoteOperation(state, action) {
    state.notes.push({
      id: action.input.id,
      phase: action.input.phase,
      content: action.input.content,
      createdAt: action.input.createdAt,
    });
  },
  removeNoteOperation(state, action) {
    const idx = state.notes.findIndex((n) => n.id === action.input.id);
    if (idx === -1)
      throw new RemoveNoteNotFoundError(`Note ${action.input.id} not found`);
    state.notes.splice(idx, 1);
  },
};
