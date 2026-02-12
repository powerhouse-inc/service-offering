import type { Action } from "document-model";
import type {
  SetFacetSelectionInput,
  RemoveFacetSelectionInput,
} from "../types.js";

export type SetFacetSelectionAction = Action & {
  type: "SET_FACET_SELECTION";
  input: SetFacetSelectionInput;
};
export type RemoveFacetSelectionAction = Action & {
  type: "REMOVE_FACET_SELECTION";
  input: RemoveFacetSelectionInput;
};

export type SubscriptionInstanceFacetAction =
  | SetFacetSelectionAction
  | RemoveFacetSelectionAction;
