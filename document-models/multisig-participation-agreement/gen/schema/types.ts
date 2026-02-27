export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  Attachment: { input: string; output: string };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type ActiveSigner = {
  citizenship: Maybe<Scalars["String"]["output"]>;
  incorporationCity: Maybe<Scalars["String"]["output"]>;
  incorporationCountry: Maybe<Scalars["String"]["output"]>;
  isAnonymous: Maybe<Scalars["Boolean"]["output"]>;
  name: Maybe<Scalars["String"]["output"]>;
  residenceCountry: Maybe<Scalars["String"]["output"]>;
  type: SignerType;
};

export type AddAssociationSignerInput = {
  function?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddComplianceEventInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  enteredAt: Scalars["DateTime"]["input"];
  enteredBy?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  occurredAt: Scalars["DateTime"]["input"];
  slaDeadlineHours?: InputMaybe<Scalars["Int"]["input"]>;
  type: Scalars["String"]["input"];
};

export type AddPolicyLinkInput = {
  id: Scalars["OID"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
  snapshotDate: Scalars["DateTime"]["input"];
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type AmendComplianceEventInput = {
  amendmentReason: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  enteredAt: Scalars["DateTime"]["input"];
  enteredBy?: InputMaybe<Scalars["String"]["input"]>;
  newEventId: Scalars["OID"]["input"];
  occurredAt: Scalars["DateTime"]["input"];
  slaDeadlineHours?: InputMaybe<Scalars["Int"]["input"]>;
  supersedes: Scalars["OID"]["input"];
  type: Scalars["String"]["input"];
};

export type AssociationSigner = {
  function: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  signature: Maybe<SignatureRecord>;
};

export type ComplianceEvent = {
  amendmentReason: Maybe<Scalars["String"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  enteredAt: Scalars["DateTime"]["output"];
  enteredBy: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  occurredAt: Scalars["DateTime"]["output"];
  slaBreached: Maybe<Scalars["Boolean"]["output"]>;
  slaDeadlineAt: Maybe<Scalars["DateTime"]["output"]>;
  slaDeadlineHours: Maybe<Scalars["Int"]["output"]>;
  supersededById: Maybe<Scalars["OID"]["output"]>;
  supersedes: Maybe<Scalars["OID"]["output"]>;
  type: ComplianceEventType;
};

export type ComplianceEventType =
  | "AML_KYC_REQUEST"
  | "AML_KYC_RESPONSE"
  | "CONFLICT_OF_INTEREST_DISCLOSURE"
  | "COORDINATION_RESPONSE"
  | "DISPUTE_RESOLUTION"
  | "KEY_COMPROMISE_REPLACEMENT_COMPLETED"
  | "KEY_COMPROMISE_REPORTED"
  | "SIGNATURE_REQUEST_RESPONSE"
  | "UNAVAILABILITY_NOTICE";

export type InitializeMpaInput = {
  associationName?: InputMaybe<Scalars["String"]["input"]>;
  templateVersion?: InputMaybe<Scalars["String"]["input"]>;
};

export type MpaStatus = "ACTIVE" | "DRAFT" | "PENDING_SIGNATURE" | "TERMINATED";

export type MarkSlaBreachedInput = {
  eventId: Scalars["OID"]["input"];
};

export type MultisigParticipationAgreementState = {
  activeSigner: Maybe<ActiveSigner>;
  activeSignerSignature: Maybe<SignatureRecord>;
  associationName: Maybe<Scalars["String"]["output"]>;
  associationSigners: Array<AssociationSigner>;
  communicationChannel: Maybe<Scalars["String"]["output"]>;
  complianceEvents: Array<ComplianceEvent>;
  effectiveDate: Maybe<Scalars["DateTime"]["output"]>;
  policyLinks: Array<PolicyLink>;
  status: Maybe<MpaStatus>;
  templateVersion: Maybe<Scalars["String"]["output"]>;
  terminationDate: Maybe<Scalars["DateTime"]["output"]>;
  terminationReason: Maybe<Scalars["String"]["output"]>;
  unavailabilityThresholdHours: Maybe<Scalars["Int"]["output"]>;
  wallet: Maybe<WalletDescription>;
};

export type PolicyLink = {
  id: Scalars["OID"]["output"];
  label: Maybe<Scalars["String"]["output"]>;
  snapshotDate: Maybe<Scalars["DateTime"]["output"]>;
  url: Maybe<Scalars["URL"]["output"]>;
};

export type RecordActiveSignerSignatureInput = {
  date: Scalars["DateTime"]["input"];
  eSignaturePlatform: Scalars["String"]["input"];
  eSignatureReference: Scalars["String"]["input"];
  eSignatureTimestamp: Scalars["DateTime"]["input"];
  effectiveDate: Scalars["DateTime"]["input"];
  place?: InputMaybe<Scalars["String"]["input"]>;
};

export type RecordAssociationSignatureInput = {
  date: Scalars["DateTime"]["input"];
  eSignaturePlatform: Scalars["String"]["input"];
  eSignatureReference: Scalars["String"]["input"];
  eSignatureTimestamp: Scalars["DateTime"]["input"];
  place?: InputMaybe<Scalars["String"]["input"]>;
  signerId: Scalars["OID"]["input"];
};

export type RemoveAssociationSignerInput = {
  id: Scalars["OID"]["input"];
};

export type RemovePolicyLinkInput = {
  id: Scalars["OID"]["input"];
};

export type SetActiveSignerInput = {
  citizenship?: InputMaybe<Scalars["String"]["input"]>;
  incorporationCity?: InputMaybe<Scalars["String"]["input"]>;
  incorporationCountry?: InputMaybe<Scalars["String"]["input"]>;
  isAnonymous?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  residenceCountry?: InputMaybe<Scalars["String"]["input"]>;
  type: Scalars["String"]["input"];
};

export type SetProcessDetailsInput = {
  communicationChannel?: InputMaybe<Scalars["String"]["input"]>;
  unavailabilityThresholdHours?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SetWalletInput = {
  decisionQuorum?: InputMaybe<Scalars["Int"]["input"]>;
  numberOfKeys?: InputMaybe<Scalars["Int"]["input"]>;
  signaturePlatform?: InputMaybe<Scalars["String"]["input"]>;
  walletAddresses?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type SignatureRecord = {
  date: Maybe<Scalars["DateTime"]["output"]>;
  eSignaturePlatform: Maybe<Scalars["String"]["output"]>;
  eSignatureReference: Maybe<Scalars["String"]["output"]>;
  eSignatureTimestamp: Maybe<Scalars["DateTime"]["output"]>;
  place: Maybe<Scalars["String"]["output"]>;
};

export type SignerType = "LEGAL_ENTITY" | "NATURAL_PERSON";

export type SubmitForSignatureInput = {
  _placeholder?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type TerminateBreachInput = {
  terminationDate: Scalars["DateTime"]["input"];
  terminationReason: Scalars["String"]["input"];
};

export type TerminateKeyCompromiseInput = {
  terminationDate: Scalars["DateTime"]["input"];
};

export type TerminateVoluntaryInput = {
  terminationDate: Scalars["DateTime"]["input"];
  terminationReason?: InputMaybe<Scalars["String"]["input"]>;
};

export type WalletDescription = {
  decisionQuorum: Maybe<Scalars["Int"]["output"]>;
  numberOfKeys: Maybe<Scalars["Int"]["output"]>;
  signaturePlatform: Maybe<Scalars["String"]["output"]>;
  walletAddresses: Array<Scalars["String"]["output"]>;
};
