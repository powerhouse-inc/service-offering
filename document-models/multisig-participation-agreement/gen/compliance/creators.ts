import { createAction } from "document-model/core";
import {
  AddComplianceEventInputSchema,
  AmendComplianceEventInputSchema,
  MarkSlaBreachedInputSchema,
} from "../schema/zod.js";
import type {
  AddComplianceEventInput,
  AmendComplianceEventInput,
  MarkSlaBreachedInput,
} from "../types.js";
import type {
  AddComplianceEventAction,
  AmendComplianceEventAction,
  MarkSlaBreachedAction,
} from "./actions.js";

export const addComplianceEvent = (input: AddComplianceEventInput) =>
  createAction<AddComplianceEventAction>(
    "ADD_COMPLIANCE_EVENT",
    { ...input },
    undefined,
    AddComplianceEventInputSchema,
    "global",
  );

export const amendComplianceEvent = (input: AmendComplianceEventInput) =>
  createAction<AmendComplianceEventAction>(
    "AMEND_COMPLIANCE_EVENT",
    { ...input },
    undefined,
    AmendComplianceEventInputSchema,
    "global",
  );

export const markSlaBreached = (input: MarkSlaBreachedInput) =>
  createAction<MarkSlaBreachedAction>(
    "MARK_SLA_BREACHED",
    { ...input },
    undefined,
    MarkSlaBreachedInputSchema,
    "global",
  );
