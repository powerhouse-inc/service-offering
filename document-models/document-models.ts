import type { DocumentModelModule } from "document-model";
import { Facet } from "./facet/module.js";
import { MultisigParticipationAgreement } from "./multisig-participation-agreement/module.js";
import { ResourceInstance } from "./resource-instance/module.js";
import { ResourceTemplate } from "./resource-template/module.js";
import { ServiceOffering } from "./service-offering/module.js";
import { SubscriptionInstance } from "./subscription-instance/module.js";

export const documentModels: DocumentModelModule<any>[] = [
  Facet,
  MultisigParticipationAgreement,
  ResourceInstance,
  ResourceTemplate,
  ServiceOffering,
  SubscriptionInstance,
];
