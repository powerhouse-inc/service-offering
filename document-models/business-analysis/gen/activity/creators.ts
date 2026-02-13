import { createAction } from "document-model/core";
import { LogActivityInputSchema } from "../schema/zod.js";
import type { LogActivityInput } from "../types.js";
import type { LogActivityAction } from "./actions.js";

export const logActivity = (input: LogActivityInput) =>
  createAction<LogActivityAction>(
    "LOG_ACTIVITY",
    { ...input },
    undefined,
    LogActivityInputSchema,
    "global",
  );
