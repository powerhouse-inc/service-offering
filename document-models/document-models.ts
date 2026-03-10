import type { DocumentModelModule } from "document-model";
import { Facet as FacetV1 } from "./facet/v1/module.js";
import { ResourceInstance as ResourceInstanceV1 } from "./resource-instance/v1/module.js";
import { ResourceTemplate as ResourceTemplateV1 } from "./resource-template/v1/module.js";
import { ServiceOffering as ServiceOfferingV1 } from "./service-offering/v1/module.js";
import { SubscriptionInstance as SubscriptionInstanceV1 } from "./subscription-instance/v1/module.js";

export const documentModels: DocumentModelModule<any>[] = [
  FacetV1,
  ResourceInstanceV1,
  ResourceTemplateV1,
  ServiceOfferingV1,
  SubscriptionInstanceV1,
];
