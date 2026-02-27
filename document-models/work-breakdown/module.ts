import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { WorkBreakdownPHState } from "./index.js";
import { actions, documentModel, reducer, utils } from "./index.js";

/** Document model module for the WorkBreakdown document type */
export const WorkBreakdown: DocumentModelModule<WorkBreakdownPHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
