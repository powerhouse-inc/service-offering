import * as z from "zod";
import type {
  ActiveSigner,
  AddAssociationSignerInput,
  AddComplianceEventInput,
  AddPolicyLinkInput,
  AmendComplianceEventInput,
  AssociationSigner,
  ComplianceEvent,
  ComplianceEventType,
  InitializeMpaInput,
  MpaStatus,
  MarkSlaBreachedInput,
  MultisigParticipationAgreementState,
  PolicyLink,
  RecordActiveSignerSignatureInput,
  RecordAssociationSignatureInput,
  RemoveAssociationSignerInput,
  RemovePolicyLinkInput,
  SetActiveSignerInput,
  SetProcessDetailsInput,
  SetWalletInput,
  SignatureRecord,
  SignerType,
  SubmitForSignatureInput,
  TerminateBreachInput,
  TerminateKeyCompromiseInput,
  TerminateVoluntaryInput,
  WalletDescription,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const ComplianceEventTypeSchema = z.enum([
  "AML_KYC_REQUEST",
  "AML_KYC_RESPONSE",
  "CONFLICT_OF_INTEREST_DISCLOSURE",
  "COORDINATION_RESPONSE",
  "DISPUTE_RESOLUTION",
  "KEY_COMPROMISE_REPLACEMENT_COMPLETED",
  "KEY_COMPROMISE_REPORTED",
  "SIGNATURE_REQUEST_RESPONSE",
  "UNAVAILABILITY_NOTICE",
]);

export const MpaStatusSchema = z.enum([
  "ACTIVE",
  "DRAFT",
  "PENDING_SIGNATURE",
  "TERMINATED",
]);

export const SignerTypeSchema = z.enum(["LEGAL_ENTITY", "NATURAL_PERSON"]);

export function ActiveSignerSchema(): z.ZodObject<Properties<ActiveSigner>> {
  return z.object({
    __typename: z.literal("ActiveSigner").optional(),
    citizenship: z.string().nullish(),
    incorporationCity: z.string().nullish(),
    incorporationCountry: z.string().nullish(),
    isAnonymous: z.boolean().nullish(),
    name: z.string().nullish(),
    residenceCountry: z.string().nullish(),
    type: SignerTypeSchema,
  });
}

export function AddAssociationSignerInputSchema(): z.ZodObject<
  Properties<AddAssociationSignerInput>
> {
  return z.object({
    function: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
  });
}

export function AddComplianceEventInputSchema(): z.ZodObject<
  Properties<AddComplianceEventInput>
> {
  return z.object({
    description: z.string().nullish(),
    enteredAt: z.string().datetime(),
    enteredBy: z.string().nullish(),
    id: z.string(),
    occurredAt: z.string().datetime(),
    slaDeadlineHours: z.number().nullish(),
    type: z.string(),
  });
}

export function AddPolicyLinkInputSchema(): z.ZodObject<
  Properties<AddPolicyLinkInput>
> {
  return z.object({
    id: z.string(),
    label: z.string().nullish(),
    snapshotDate: z.string().datetime(),
    url: z.string().nullish(),
  });
}

export function AmendComplianceEventInputSchema(): z.ZodObject<
  Properties<AmendComplianceEventInput>
> {
  return z.object({
    amendmentReason: z.string(),
    description: z.string().nullish(),
    enteredAt: z.string().datetime(),
    enteredBy: z.string().nullish(),
    newEventId: z.string(),
    occurredAt: z.string().datetime(),
    slaDeadlineHours: z.number().nullish(),
    supersedes: z.string(),
    type: z.string(),
  });
}

export function AssociationSignerSchema(): z.ZodObject<
  Properties<AssociationSigner>
> {
  return z.object({
    __typename: z.literal("AssociationSigner").optional(),
    function: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    signature: z.lazy(() => SignatureRecordSchema().nullish()),
  });
}

export function ComplianceEventSchema(): z.ZodObject<
  Properties<ComplianceEvent>
> {
  return z.object({
    __typename: z.literal("ComplianceEvent").optional(),
    amendmentReason: z.string().nullish(),
    description: z.string().nullish(),
    enteredAt: z.string().datetime(),
    enteredBy: z.string().nullish(),
    id: z.string(),
    occurredAt: z.string().datetime(),
    slaBreached: z.boolean().nullish(),
    slaDeadlineAt: z.string().datetime().nullish(),
    slaDeadlineHours: z.number().nullish(),
    supersededById: z.string().nullish(),
    supersedes: z.string().nullish(),
    type: ComplianceEventTypeSchema,
  });
}

export function InitializeMpaInputSchema(): z.ZodObject<
  Properties<InitializeMpaInput>
> {
  return z.object({
    associationName: z.string().nullish(),
    templateVersion: z.string().nullish(),
  });
}

export function MarkSlaBreachedInputSchema(): z.ZodObject<
  Properties<MarkSlaBreachedInput>
> {
  return z.object({
    eventId: z.string(),
  });
}

export function MultisigParticipationAgreementStateSchema(): z.ZodObject<
  Properties<MultisigParticipationAgreementState>
> {
  return z.object({
    __typename: z.literal("MultisigParticipationAgreementState").optional(),
    activeSigner: z.lazy(() => ActiveSignerSchema().nullish()),
    activeSignerSignature: z.lazy(() => SignatureRecordSchema().nullish()),
    associationName: z.string().nullish(),
    associationSigners: z.array(z.lazy(() => AssociationSignerSchema())),
    communicationChannel: z.string().nullish(),
    complianceEvents: z.array(z.lazy(() => ComplianceEventSchema())),
    effectiveDate: z.string().datetime().nullish(),
    policyLinks: z.array(z.lazy(() => PolicyLinkSchema())),
    status: MpaStatusSchema.nullish(),
    templateVersion: z.string().nullish(),
    terminationDate: z.string().datetime().nullish(),
    terminationReason: z.string().nullish(),
    unavailabilityThresholdHours: z.number().nullish(),
    wallet: z.lazy(() => WalletDescriptionSchema().nullish()),
  });
}

export function PolicyLinkSchema(): z.ZodObject<Properties<PolicyLink>> {
  return z.object({
    __typename: z.literal("PolicyLink").optional(),
    id: z.string(),
    label: z.string().nullish(),
    snapshotDate: z.string().datetime().nullish(),
    url: z.string().url().nullish(),
  });
}

export function RecordActiveSignerSignatureInputSchema(): z.ZodObject<
  Properties<RecordActiveSignerSignatureInput>
> {
  return z.object({
    date: z.string().datetime(),
    eSignaturePlatform: z.string(),
    eSignatureReference: z.string(),
    eSignatureTimestamp: z.string().datetime(),
    effectiveDate: z.string().datetime(),
    place: z.string().nullish(),
  });
}

export function RecordAssociationSignatureInputSchema(): z.ZodObject<
  Properties<RecordAssociationSignatureInput>
> {
  return z.object({
    date: z.string().datetime(),
    eSignaturePlatform: z.string(),
    eSignatureReference: z.string(),
    eSignatureTimestamp: z.string().datetime(),
    place: z.string().nullish(),
    signerId: z.string(),
  });
}

export function RemoveAssociationSignerInputSchema(): z.ZodObject<
  Properties<RemoveAssociationSignerInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemovePolicyLinkInputSchema(): z.ZodObject<
  Properties<RemovePolicyLinkInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetActiveSignerInputSchema(): z.ZodObject<
  Properties<SetActiveSignerInput>
> {
  return z.object({
    citizenship: z.string().nullish(),
    incorporationCity: z.string().nullish(),
    incorporationCountry: z.string().nullish(),
    isAnonymous: z.boolean().nullish(),
    name: z.string().nullish(),
    residenceCountry: z.string().nullish(),
    type: z.string(),
  });
}

export function SetProcessDetailsInputSchema(): z.ZodObject<
  Properties<SetProcessDetailsInput>
> {
  return z.object({
    communicationChannel: z.string().nullish(),
    unavailabilityThresholdHours: z.number().nullish(),
  });
}

export function SetWalletInputSchema(): z.ZodObject<
  Properties<SetWalletInput>
> {
  return z.object({
    decisionQuorum: z.number().nullish(),
    numberOfKeys: z.number().nullish(),
    signaturePlatform: z.string().nullish(),
    walletAddresses: z.array(z.string()).nullish(),
  });
}

export function SignatureRecordSchema(): z.ZodObject<
  Properties<SignatureRecord>
> {
  return z.object({
    __typename: z.literal("SignatureRecord").optional(),
    date: z.string().datetime().nullish(),
    eSignaturePlatform: z.string().nullish(),
    eSignatureReference: z.string().nullish(),
    eSignatureTimestamp: z.string().datetime().nullish(),
    place: z.string().nullish(),
  });
}

export function SubmitForSignatureInputSchema(): z.ZodObject<
  Properties<SubmitForSignatureInput>
> {
  return z.object({
    _placeholder: z.boolean().nullish(),
  });
}

export function TerminateBreachInputSchema(): z.ZodObject<
  Properties<TerminateBreachInput>
> {
  return z.object({
    terminationDate: z.string().datetime(),
    terminationReason: z.string(),
  });
}

export function TerminateKeyCompromiseInputSchema(): z.ZodObject<
  Properties<TerminateKeyCompromiseInput>
> {
  return z.object({
    terminationDate: z.string().datetime(),
  });
}

export function TerminateVoluntaryInputSchema(): z.ZodObject<
  Properties<TerminateVoluntaryInput>
> {
  return z.object({
    terminationDate: z.string().datetime(),
    terminationReason: z.string().nullish(),
  });
}

export function WalletDescriptionSchema(): z.ZodObject<
  Properties<WalletDescription>
> {
  return z.object({
    __typename: z.literal("WalletDescription").optional(),
    decisionQuorum: z.number().nullish(),
    numberOfKeys: z.number().nullish(),
    signaturePlatform: z.string().nullish(),
    walletAddresses: z.array(z.string()),
  });
}
