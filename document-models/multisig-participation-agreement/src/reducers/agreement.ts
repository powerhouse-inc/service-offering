import {
  AgreementTerminatedError,
  DuplicatePolicyLinkIdError,
  DuplicateSignerIdError,
  InvalidStatusTransitionError,
  MissingRequiredFieldError,
  PolicyLinkNotFoundError,
  SignerAlreadySignedError,
  SignerNotFoundError,
  TerminateNotActiveError,
} from "../../gen/agreement/error.js";
import type { MultisigParticipationAgreementAgreementOperations } from "@powerhousedao/service-offering/document-models/multisig-participation-agreement";

export const multisigParticipationAgreementAgreementOperations: MultisigParticipationAgreementAgreementOperations =
  {
    initializeMpaOperation(state, action) {
      if (state.status && state.status !== "DRAFT") {
        throw new AgreementTerminatedError(
          "Cannot reinitialize a non-draft MPA",
        );
      }
      state.templateVersion = action.input.templateVersion || null;
      state.associationName = action.input.associationName || null;
      state.status = "DRAFT";
    },

    setActiveSignerOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      state.activeSigner = {
        type: action.input.type as any,
        name: action.input.name || null,
        isAnonymous:
          action.input.isAnonymous !== undefined &&
          action.input.isAnonymous !== null
            ? action.input.isAnonymous
            : false,
        citizenship: action.input.citizenship || null,
        residenceCountry: action.input.residenceCountry || null,
        incorporationCity: action.input.incorporationCity || null,
        incorporationCountry: action.input.incorporationCountry || null,
      };
    },

    setWalletOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      if (!state.wallet) {
        state.wallet = {
          numberOfKeys: null,
          decisionQuorum: null,
          signaturePlatform: null,
          walletAddresses: [],
        };
      }
      if (
        action.input.numberOfKeys !== undefined &&
        action.input.numberOfKeys !== null
      )
        state.wallet.numberOfKeys = action.input.numberOfKeys;
      if (
        action.input.decisionQuorum !== undefined &&
        action.input.decisionQuorum !== null
      )
        state.wallet.decisionQuorum = action.input.decisionQuorum;
      if (action.input.signaturePlatform)
        state.wallet.signaturePlatform = action.input.signaturePlatform;
      if (action.input.walletAddresses)
        state.wallet.walletAddresses = action.input.walletAddresses;
    },

    setProcessDetailsOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      if (action.input.communicationChannel)
        state.communicationChannel = action.input.communicationChannel;
      if (
        action.input.unavailabilityThresholdHours !== undefined &&
        action.input.unavailabilityThresholdHours !== null
      )
        state.unavailabilityThresholdHours =
          action.input.unavailabilityThresholdHours;
    },

    addPolicyLinkOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      const existing = state.policyLinks.find((l) => l.id === action.input.id);
      if (existing) {
        throw new DuplicatePolicyLinkIdError(
          `Policy link with id ${action.input.id} already exists`,
        );
      }
      state.policyLinks.push({
        id: action.input.id,
        label: action.input.label || null,
        url: action.input.url || null,
        snapshotDate: action.input.snapshotDate,
      });
    },

    removePolicyLinkOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      const idx = state.policyLinks.findIndex((l) => l.id === action.input.id);
      if (idx === -1) {
        throw new PolicyLinkNotFoundError(
          `Policy link with id ${action.input.id} not found`,
        );
      }
      state.policyLinks.splice(idx, 1);
    },

    addAssociationSignerOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      const existing = state.associationSigners.find(
        (s) => s.id === action.input.id,
      );
      if (existing) {
        throw new DuplicateSignerIdError(
          `Association signer with id ${action.input.id} already exists`,
        );
      }
      state.associationSigners.push({
        id: action.input.id,
        name: action.input.name || null,
        function: action.input.function || null,
        signature: null,
      });
    },

    removeAssociationSignerOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      const idx = state.associationSigners.findIndex(
        (s) => s.id === action.input.id,
      );
      if (idx === -1) {
        throw new SignerNotFoundError(
          `Association signer with id ${action.input.id} not found`,
        );
      }
      state.associationSigners.splice(idx, 1);
    },

    submitForSignatureOperation(state, _action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      if (state.status !== "DRAFT") {
        throw new InvalidStatusTransitionError(
          `Cannot submit for signature from status ${state.status}`,
        );
      }
      if (!state.associationName)
        throw new MissingRequiredFieldError("associationName is required");
      if (!state.activeSigner || !state.activeSigner.name)
        throw new MissingRequiredFieldError("activeSigner.name is required");
      if (!state.wallet || !state.wallet.numberOfKeys)
        throw new MissingRequiredFieldError("wallet.numberOfKeys is required");
      if (!state.wallet.decisionQuorum)
        throw new MissingRequiredFieldError(
          "wallet.decisionQuorum is required",
        );
      if (!state.wallet.signaturePlatform)
        throw new MissingRequiredFieldError(
          "wallet.signaturePlatform is required",
        );
      if (!state.communicationChannel)
        throw new MissingRequiredFieldError("communicationChannel is required");
      if (!state.unavailabilityThresholdHours)
        throw new MissingRequiredFieldError(
          "unavailabilityThresholdHours is required",
        );
      if (state.associationSigners.length === 0)
        throw new MissingRequiredFieldError(
          "at least one associationSigner is required",
        );
      state.status = "PENDING_SIGNATURE";
    },

    recordAssociationSignatureOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      const signer = state.associationSigners.find(
        (s) => s.id === action.input.signerId,
      );
      if (!signer) {
        throw new SignerNotFoundError(
          `Association signer with id ${action.input.signerId} not found`,
        );
      }
      if (signer.signature) {
        throw new SignerAlreadySignedError(
          `Association signer ${action.input.signerId} has already signed`,
        );
      }
      signer.signature = {
        place: action.input.place || null,
        date: action.input.date,
        eSignaturePlatform: action.input.eSignaturePlatform,
        eSignatureReference: action.input.eSignatureReference,
        eSignatureTimestamp: action.input.eSignatureTimestamp,
      };
    },

    recordActiveSignerSignatureOperation(state, action) {
      if (state.status === "TERMINATED") {
        throw new AgreementTerminatedError("Cannot modify a terminated MPA");
      }
      state.activeSignerSignature = {
        place: action.input.place || null,
        date: action.input.date,
        eSignaturePlatform: action.input.eSignaturePlatform,
        eSignatureReference: action.input.eSignatureReference,
        eSignatureTimestamp: action.input.eSignatureTimestamp,
      };
      const allAssociationSigned =
        state.associationSigners.length > 0 &&
        state.associationSigners.every((s) => s.signature !== null);
      if (allAssociationSigned) {
        state.status = "ACTIVE";
        state.effectiveDate = action.input.effectiveDate;
      }
    },

    terminateVoluntaryOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new TerminateNotActiveError(
          `Cannot terminate MPA with status ${state.status}`,
        );
      }
      state.status = "TERMINATED";
      state.terminationDate = action.input.terminationDate;
      state.terminationReason = action.input.terminationReason || null;
    },

    terminateBreachOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new TerminateNotActiveError(
          `Cannot terminate MPA with status ${state.status}`,
        );
      }
      state.status = "TERMINATED";
      state.terminationDate = action.input.terminationDate;
      state.terminationReason = action.input.terminationReason;
    },

    terminateKeyCompromiseOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new TerminateNotActiveError(
          `Cannot terminate MPA with status ${state.status}`,
        );
      }
      state.status = "TERMINATED";
      state.terminationDate = action.input.terminationDate;
      state.terminationReason = "Key compromise";
    },
  };
