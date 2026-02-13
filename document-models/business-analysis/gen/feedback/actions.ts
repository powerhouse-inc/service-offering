import type { Action } from "document-model";
import type {
  SubmitFeedbackInput,
  RespondToFeedbackInput,
  ResolveFeedbackInput,
  RemoveFeedbackInput,
} from "../types.js";

export type SubmitFeedbackAction = Action & {
  type: "SUBMIT_FEEDBACK";
  input: SubmitFeedbackInput;
};
export type RespondToFeedbackAction = Action & {
  type: "RESPOND_TO_FEEDBACK";
  input: RespondToFeedbackInput;
};
export type ResolveFeedbackAction = Action & {
  type: "RESOLVE_FEEDBACK";
  input: ResolveFeedbackInput;
};
export type RemoveFeedbackAction = Action & {
  type: "REMOVE_FEEDBACK";
  input: RemoveFeedbackInput;
};

export type BusinessAnalysisFeedbackAction =
  | SubmitFeedbackAction
  | RespondToFeedbackAction
  | ResolveFeedbackAction
  | RemoveFeedbackAction;
