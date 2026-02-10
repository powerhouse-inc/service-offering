import { type SignalDispatch } from "document-model";
import type {
  AddTargetAudienceAction,
  RemoveTargetAudienceAction,
} from "./actions.js";
import type { ResourceTemplateState } from "../types.js";

export interface ResourceTemplateAudienceManagementOperations {
  addTargetAudienceOperation: (
    state: ResourceTemplateState,
    action: AddTargetAudienceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeTargetAudienceOperation: (
    state: ResourceTemplateState,
    action: RemoveTargetAudienceAction,
    dispatch?: SignalDispatch,
  ) => void;
}
