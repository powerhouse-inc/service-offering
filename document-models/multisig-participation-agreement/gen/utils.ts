import type { DocumentModelUtils } from "document-model";
import {
  baseCreateDocument,
  baseSaveToFileHandle,
  baseLoadFromInput,
  defaultBaseState,
  generateId,
} from "document-model/core";
import type {
  MultisigParticipationAgreementGlobalState,
  MultisigParticipationAgreementLocalState,
} from "./types.js";
import type { MultisigParticipationAgreementPHState } from "./types.js";
import { reducer } from "./reducer.js";
import { multisigParticipationAgreementDocumentType } from "./document-type.js";
import {
  isMultisigParticipationAgreementDocument,
  assertIsMultisigParticipationAgreementDocument,
  isMultisigParticipationAgreementState,
  assertIsMultisigParticipationAgreementState,
} from "./document-schema.js";

export const initialGlobalState: MultisigParticipationAgreementGlobalState = {
  templateVersion: null,
  status: "DRAFT",
  associationName: null,
  activeSigner: null,
  wallet: null,
  communicationChannel: null,
  unavailabilityThresholdHours: null,
  policyLinks: [],
  associationSigners: [],
  activeSignerSignature: null,
  complianceEvents: [],
  effectiveDate: null,
  terminationDate: null,
  terminationReason: null,
};
export const initialLocalState: MultisigParticipationAgreementLocalState = {};

export const utils: DocumentModelUtils<MultisigParticipationAgreementPHState> =
  {
    fileExtension: "mpa",
    createState(state) {
      return {
        ...defaultBaseState(),
        global: { ...initialGlobalState, ...state?.global },
        local: { ...initialLocalState, ...state?.local },
      };
    },
    createDocument(state) {
      const document = baseCreateDocument(utils.createState, state);

      document.header.documentType = multisigParticipationAgreementDocumentType;

      // for backwards compatibility, but this is NOT a valid signed document id
      document.header.id = generateId();

      return document;
    },
    saveToFileHandle(document, input) {
      return baseSaveToFileHandle(document, input);
    },
    loadFromInput(input) {
      return baseLoadFromInput(input, reducer);
    },
    isStateOfType(state) {
      return isMultisigParticipationAgreementState(state);
    },
    assertIsStateOfType(state) {
      return assertIsMultisigParticipationAgreementState(state);
    },
    isDocumentOfType(document) {
      return isMultisigParticipationAgreementDocument(document);
    },
    assertIsDocumentOfType(document) {
      return assertIsMultisigParticipationAgreementDocument(document);
    },
  };

export const createDocument = utils.createDocument;
export const createState = utils.createState;
export const saveToFileHandle = utils.saveToFileHandle;
export const loadFromInput = utils.loadFromInput;
export const isStateOfType = utils.isStateOfType;
export const assertIsStateOfType = utils.assertIsStateOfType;
export const isDocumentOfType = utils.isDocumentOfType;
export const assertIsDocumentOfType = utils.assertIsDocumentOfType;
