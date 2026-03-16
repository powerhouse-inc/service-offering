import { PHDocumentController } from "document-model/core";
import { Facet } from "../module.js";
import type { FacetAction, FacetPHState } from "./types.js";

export const FacetController = PHDocumentController.forDocumentModel<
  FacetPHState,
  FacetAction
>(Facet);
