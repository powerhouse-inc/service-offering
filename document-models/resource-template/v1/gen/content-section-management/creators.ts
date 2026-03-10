import { createAction } from "document-model/core";
import {
  AddContentSectionInputSchema,
  UpdateContentSectionInputSchema,
  DeleteContentSectionInputSchema,
  ReorderContentSectionsInputSchema,
} from "../schema/zod.js";
import type {
  AddContentSectionInput,
  UpdateContentSectionInput,
  DeleteContentSectionInput,
  ReorderContentSectionsInput,
} from "../types.js";
import type {
  AddContentSectionAction,
  UpdateContentSectionAction,
  DeleteContentSectionAction,
  ReorderContentSectionsAction,
} from "./actions.js";

export const addContentSection = (input: AddContentSectionInput) =>
  createAction<AddContentSectionAction>(
    "ADD_CONTENT_SECTION",
    { ...input },
    undefined,
    AddContentSectionInputSchema,
    "global",
  );

export const updateContentSection = (input: UpdateContentSectionInput) =>
  createAction<UpdateContentSectionAction>(
    "UPDATE_CONTENT_SECTION",
    { ...input },
    undefined,
    UpdateContentSectionInputSchema,
    "global",
  );

export const deleteContentSection = (input: DeleteContentSectionInput) =>
  createAction<DeleteContentSectionAction>(
    "DELETE_CONTENT_SECTION",
    { ...input },
    undefined,
    DeleteContentSectionInputSchema,
    "global",
  );

export const reorderContentSections = (input: ReorderContentSectionsInput) =>
  createAction<ReorderContentSectionsAction>(
    "REORDER_CONTENT_SECTIONS",
    { ...input },
    undefined,
    ReorderContentSectionsInputSchema,
    "global",
  );
