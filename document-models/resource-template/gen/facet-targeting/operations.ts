import { type SignalDispatch } from "document-model";
import type {
  SetFacetTargetAction,
  RemoveFacetTargetAction,
  AddFacetOptionAction,
  RemoveFacetOptionAction,
} from "./actions.js";
import type { ResourceTemplateState } from "../types.js";

export interface ResourceTemplateFacetTargetingOperations {
  setFacetTargetOperation: (
    state: ResourceTemplateState,
    action: SetFacetTargetAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetTargetOperation: (
    state: ResourceTemplateState,
    action: RemoveFacetTargetAction,
    dispatch?: SignalDispatch,
  ) => void;
  addFacetOptionOperation: (
    state: ResourceTemplateState,
    action: AddFacetOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetOptionOperation: (
    state: ResourceTemplateState,
    action: RemoveFacetOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
