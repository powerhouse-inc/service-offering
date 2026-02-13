import { createAction } from "document-model/core";
import {
  SubmitFeedbackInputSchema,
  RespondToFeedbackInputSchema,
  ResolveFeedbackInputSchema,
  RemoveFeedbackInputSchema,
} from "../schema/zod.js";
import type {
  SubmitFeedbackInput,
  RespondToFeedbackInput,
  ResolveFeedbackInput,
  RemoveFeedbackInput,
} from "../types.js";
import type {
  SubmitFeedbackAction,
  RespondToFeedbackAction,
  ResolveFeedbackAction,
  RemoveFeedbackAction,
} from "./actions.js";

export const submitFeedback = (input: SubmitFeedbackInput) =>
  createAction<SubmitFeedbackAction>(
    "SUBMIT_FEEDBACK",
    { ...input },
    undefined,
    SubmitFeedbackInputSchema,
    "global",
  );

export const respondToFeedback = (input: RespondToFeedbackInput) =>
  createAction<RespondToFeedbackAction>(
    "RESPOND_TO_FEEDBACK",
    { ...input },
    undefined,
    RespondToFeedbackInputSchema,
    "global",
  );

export const resolveFeedback = (input: ResolveFeedbackInput) =>
  createAction<ResolveFeedbackAction>(
    "RESOLVE_FEEDBACK",
    { ...input },
    undefined,
    ResolveFeedbackInputSchema,
    "global",
  );

export const removeFeedback = (input: RemoveFeedbackInput) =>
  createAction<RemoveFeedbackAction>(
    "REMOVE_FEEDBACK",
    { ...input },
    undefined,
    RemoveFeedbackInputSchema,
    "global",
  );
