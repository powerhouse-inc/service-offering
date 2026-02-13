import type { DocumentModelModule } from "document-model";
import { BusinessAnalysis } from "./business-analysis/module.js";
import { Facet } from "./facet/module.js";
import { ResourceInstance } from "./resource-instance/module.js";
import { ResourceTemplate } from "./resource-template/module.js";
import { ServiceOffering } from "./service-offering/module.js";
import { ServiceSubscription } from "./service-subscription/module.js";
import { SubscriptionInstance } from "./subscription-instance/module.js";
import { WorkBreakdown } from "./work-breakdown/module.js";

export const documentModels: DocumentModelModule<any>[] = [
  BusinessAnalysis,
  Facet,
  ResourceInstance,
  ResourceTemplate,
  ServiceOffering,
  ServiceSubscription,
  SubscriptionInstance,
  WorkBreakdown,
];
