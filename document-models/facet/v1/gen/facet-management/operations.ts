import { type SignalDispatch } from "document-model";
import type {
  SetFacetNameAction,
  SetFacetDescriptionAction,
} from "./actions.js";
import type { FacetState } from "../types.js";

export interface FacetFacetManagementOperations {
  setFacetNameOperation: (
    state: FacetState,
    action: SetFacetNameAction,
    dispatch?: SignalDispatch,
  ) => void;
  setFacetDescriptionOperation: (
    state: FacetState,
    action: SetFacetDescriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
