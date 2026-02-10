import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { SubscriptionInstancePHState } from "@powerhousedao/service-offering/document-models/subscription-instance";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/subscription-instance";

/** Document model module for the Todo List document type */
export const SubscriptionInstance: DocumentModelModule<SubscriptionInstancePHState> =
  {
    version: 1,
    reducer,
    actions,
    utils,
    documentModel: createState(defaultBaseState(), documentModel),
  };
