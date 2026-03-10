import { type SignalDispatch } from "document-model";
import type {
  AddContentSectionAction,
  UpdateContentSectionAction,
  DeleteContentSectionAction,
  ReorderContentSectionsAction,
} from "./actions.js";
import type { ResourceTemplateState } from "../types.js";

export interface ResourceTemplateContentSectionManagementOperations {
  addContentSectionOperation: (
    state: ResourceTemplateState,
    action: AddContentSectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateContentSectionOperation: (
    state: ResourceTemplateState,
    action: UpdateContentSectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteContentSectionOperation: (
    state: ResourceTemplateState,
    action: DeleteContentSectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderContentSectionsOperation: (
    state: ResourceTemplateState,
    action: ReorderContentSectionsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
