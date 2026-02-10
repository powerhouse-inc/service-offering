import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { ServiceSubscriptionPHState } from "@powerhousedao/service-offering/document-models/service-subscription";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/service-subscription";

/** Document model module for the Todo List document type */
export const ServiceSubscription: DocumentModelModule<ServiceSubscriptionPHState> =
  {
    version: 1,
    reducer,
    actions,
    utils,
    documentModel: createState(defaultBaseState(), documentModel),
  };
