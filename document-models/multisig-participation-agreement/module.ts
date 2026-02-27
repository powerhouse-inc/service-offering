import type { DocumentModelModule } from "document-model";
import { createState } from "document-model";
import { defaultBaseState } from "document-model/core";
import type { MultisigParticipationAgreementPHState } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";
import {
  actions,
  documentModel,
  reducer,
  utils,
} from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";

/** Document model module for the Todo List document type */
export const MultisigParticipationAgreement: DocumentModelModule<MultisigParticipationAgreementPHState> =
  {
    version: 1,
    reducer,
    actions,
    utils,
    documentModel: createState(defaultBaseState(), documentModel),
  };
