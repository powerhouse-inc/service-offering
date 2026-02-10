import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { ServiceOfferingPHState } from "@powerhousedao/service-offering/document-models/service-offering";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/service-offering";

/** Document model module for the Todo List document type */
export const ServiceOffering: DocumentModelModule<ServiceOfferingPHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
