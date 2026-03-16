import { PHDocumentController } from "document-model/core";
import { ResourceTemplate } from "../module.js";
import type {
  ResourceTemplateAction,
  ResourceTemplatePHState,
} from "./types.js";

export const ResourceTemplateController = PHDocumentController.forDocumentModel<
  ResourceTemplatePHState,
  ResourceTemplateAction
>(ResourceTemplate);
