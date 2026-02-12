import { type SignalDispatch } from "document-model";
import type {
  SetFacetSelectionAction,
  RemoveFacetSelectionAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceFacetOperations {
  setFacetSelectionOperation: (
    state: SubscriptionInstanceState,
    action: SetFacetSelectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetSelectionOperation: (
    state: SubscriptionInstanceState,
    action: RemoveFacetSelectionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
