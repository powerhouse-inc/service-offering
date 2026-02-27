export type ErrorCode =
  | "AgreementTerminatedError"
  | "DuplicatePolicyLinkIdError"
  | "PolicyLinkNotFoundError"
  | "DuplicateSignerIdError"
  | "SignerNotFoundError"
  | "InvalidStatusTransitionError"
  | "MissingRequiredFieldError"
  | "SignerAlreadySignedError"
  | "TerminateNotActiveError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class AgreementTerminatedError extends Error implements ReducerError {
  errorCode = "AgreementTerminatedError" as ErrorCode;
  constructor(message = "AgreementTerminatedError") {
    super(message);
  }
}

export class DuplicatePolicyLinkIdError extends Error implements ReducerError {
  errorCode = "DuplicatePolicyLinkIdError" as ErrorCode;
  constructor(message = "DuplicatePolicyLinkIdError") {
    super(message);
  }
}

export class PolicyLinkNotFoundError extends Error implements ReducerError {
  errorCode = "PolicyLinkNotFoundError" as ErrorCode;
  constructor(message = "PolicyLinkNotFoundError") {
    super(message);
  }
}

export class DuplicateSignerIdError extends Error implements ReducerError {
  errorCode = "DuplicateSignerIdError" as ErrorCode;
  constructor(message = "DuplicateSignerIdError") {
    super(message);
  }
}

export class SignerNotFoundError extends Error implements ReducerError {
  errorCode = "SignerNotFoundError" as ErrorCode;
  constructor(message = "SignerNotFoundError") {
    super(message);
  }
}

export class InvalidStatusTransitionError
  extends Error
  implements ReducerError
{
  errorCode = "InvalidStatusTransitionError" as ErrorCode;
  constructor(message = "InvalidStatusTransitionError") {
    super(message);
  }
}

export class MissingRequiredFieldError extends Error implements ReducerError {
  errorCode = "MissingRequiredFieldError" as ErrorCode;
  constructor(message = "MissingRequiredFieldError") {
    super(message);
  }
}

export class SignerAlreadySignedError extends Error implements ReducerError {
  errorCode = "SignerAlreadySignedError" as ErrorCode;
  constructor(message = "SignerAlreadySignedError") {
    super(message);
  }
}

export class TerminateNotActiveError extends Error implements ReducerError {
  errorCode = "TerminateNotActiveError" as ErrorCode;
  constructor(message = "TerminateNotActiveError") {
    super(message);
  }
}

export const errors = {
  InitializeMpa: { AgreementTerminatedError },
  SetActiveSigner: { AgreementTerminatedError },
  SetWallet: { AgreementTerminatedError },
  SetProcessDetails: { AgreementTerminatedError },
  AddPolicyLink: { AgreementTerminatedError, DuplicatePolicyLinkIdError },
  RemovePolicyLink: { AgreementTerminatedError, PolicyLinkNotFoundError },
  AddAssociationSigner: { AgreementTerminatedError, DuplicateSignerIdError },
  RemoveAssociationSigner: { AgreementTerminatedError, SignerNotFoundError },
  SubmitForSignature: {
    AgreementTerminatedError,
    InvalidStatusTransitionError,
    MissingRequiredFieldError,
  },
  RecordAssociationSignature: {
    AgreementTerminatedError,
    SignerNotFoundError,
    SignerAlreadySignedError,
  },
  RecordActiveSignerSignature: { AgreementTerminatedError },
  TerminateVoluntary: { TerminateNotActiveError },
  TerminateBreach: { TerminateNotActiveError },
  TerminateKeyCompromise: { TerminateNotActiveError },
};
