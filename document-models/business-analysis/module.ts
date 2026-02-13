import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { BusinessAnalysisPHState } from "@powerhousedao/service-offering/document-models/business-analysis";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/business-analysis";

/** Document model module for the Todo List document type */
export const BusinessAnalysis: DocumentModelModule<BusinessAnalysisPHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
