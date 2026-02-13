import { type SignalDispatch } from "document-model";
import type {
  SubmitFeedbackAction,
  RespondToFeedbackAction,
  ResolveFeedbackAction,
  RemoveFeedbackAction,
} from "./actions.js";
import type { BusinessAnalysisState } from "../types.js";

export interface BusinessAnalysisFeedbackOperations {
  submitFeedbackOperation: (
    state: BusinessAnalysisState,
    action: SubmitFeedbackAction,
    dispatch?: SignalDispatch,
  ) => void;
  respondToFeedbackOperation: (
    state: BusinessAnalysisState,
    action: RespondToFeedbackAction,
    dispatch?: SignalDispatch,
  ) => void;
  resolveFeedbackOperation: (
    state: BusinessAnalysisState,
    action: ResolveFeedbackAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFeedbackOperation: (
    state: BusinessAnalysisState,
    action: RemoveFeedbackAction,
    dispatch?: SignalDispatch,
  ) => void;
}
