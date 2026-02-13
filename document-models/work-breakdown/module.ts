import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { WorkBreakdownPHState } from "@powerhousedao/service-offering/document-models/work-breakdown";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/work-breakdown";

/** Document model module for the Todo List document type */
export const WorkBreakdown: DocumentModelModule<WorkBreakdownPHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
