import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { FacetPHState } from "document-models/facet";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "document-models/facet";

/** Document model module for the Facet document type */
export const Facet: DocumentModelModule<FacetPHState> = {
  version: 1,
  reducer,
  actions,
  utils,
  documentModel: createState(defaultBaseState(), documentModel),
};
