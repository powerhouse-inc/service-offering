import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { ResourceTemplatePHState } from "@powerhousedao/service-offering/document-models/resource-template";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/resource-template";

/** Document model module for the Todo List document type */
export const ResourceTemplate: DocumentModelModule<ResourceTemplatePHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
