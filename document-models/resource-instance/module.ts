import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { ResourceInstancePHState } from "@powerhousedao/service-offering/document-models/resource-instance";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/resource-instance";

/** Document model module for the Todo List document type */
export const ResourceInstance: DocumentModelModule<ResourceInstancePHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
