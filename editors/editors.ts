import type { EditorModule } from "document-model";
import { BusinessAnalysisEditor } from "./business-analysis-editor/module.js";
import { ResourceInstanceEditor } from "./resource-instance-editor/module.js";
import { ResourceTemplateEditor } from "./resource-template-editor/module.js";
import { ServiceOfferingEditor } from "./service-offering-editor/module.js";
import { SubscriptionInstanceEditor } from "./subscription-instance-editor/module.js";

export const editors: EditorModule[] = [
  BusinessAnalysisEditor,
  ResourceInstanceEditor,
  ResourceTemplateEditor,
  ServiceOfferingEditor,
  SubscriptionInstanceEditor,
];
