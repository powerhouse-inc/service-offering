import * as z from "zod";
import type {
  ActivateInstanceInput,
  ApplyConfigurationChangesInput,
  ConfirmInstanceInput,
  InitializeInstanceInput,
  InstanceFacet,
  InstanceStatus,
  RemoveInstanceFacetInput,
  ReportProvisioningCompletedInput,
  ReportProvisioningFailedInput,
  ReportProvisioningStartedInput,
  ResourceInstanceState,
  ResourceProfile,
  ResumeAfterMaintenanceInput,
  ResumeAfterPaymentInput,
  SetInstanceFacetInput,
  SetResourceProfileInput,
  SuspendForMaintenanceInput,
  SuspendForNonPaymentInput,
  SuspendInstanceInput,
  SuspensionType,
  TerminateInstanceInput,
  UpdateInstanceFacetInput,
  UpdateInstanceInfoInput,
  UpdateInstanceStatusInput,
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

export const InstanceStatusSchema = z.enum([
  "ACTIVE",
  "DRAFT",
  "PROVISIONING",
  "SUSPENDED",
  "TERMINATED",
]);

export const SuspensionTypeSchema = z.enum([
  "MAINTENANCE",
  "NON_PAYMENT",
  "OTHER",
]);

export function ActivateInstanceInputSchema(): z.ZodObject<
  Properties<ActivateInstanceInput>
> {
  return z.object({
    activatedAt: z.string().datetime(),
  });
}

export function ApplyConfigurationChangesInputSchema(): z.ZodObject<
  Properties<ApplyConfigurationChangesInput>
> {
  return z.object({
    addFacets: z.array(z.lazy(() => SetInstanceFacetInputSchema())).nullish(),
    appliedAt: z.string().datetime(),
    changeDescription: z.string().nullish(),
    removeFacetKeys: z.array(z.string()).nullish(),
    updateFacets: z
      .array(z.lazy(() => UpdateInstanceFacetInputSchema()))
      .nullish(),
  });
}

export function ConfirmInstanceInputSchema(): z.ZodObject<
  Properties<ConfirmInstanceInput>
> {
  return z.object({
    confirmedAt: z.string().datetime(),
  });
}

export function InitializeInstanceInputSchema(): z.ZodObject<
  Properties<InitializeInstanceInput>
> {
  return z.object({
    customerId: z.string().nullish(),
    description: z.string().nullish(),
    infoLink: z.string().url().nullish(),
    name: z.string().nullish(),
    profileDocumentType: z.string(),
    profileId: z.string(),
    resourceTemplateId: z.string().nullish(),
    thumbnailUrl: z.string().url().nullish(),
  });
}

export function InstanceFacetSchema(): z.ZodObject<Properties<InstanceFacet>> {
  return z.object({
    __typename: z.literal("InstanceFacet").optional(),
    categoryKey: z.string(),
    categoryLabel: z.string(),
    id: z.string(),
    selectedOption: z.string(),
  });
}

export function RemoveInstanceFacetInputSchema(): z.ZodObject<
  Properties<RemoveInstanceFacetInput>
> {
  return z.object({
    categoryKey: z.string(),
  });
}

export function ReportProvisioningCompletedInputSchema(): z.ZodObject<
  Properties<ReportProvisioningCompletedInput>
> {
  return z.object({
    completedAt: z.string().datetime(),
  });
}

export function ReportProvisioningFailedInputSchema(): z.ZodObject<
  Properties<ReportProvisioningFailedInput>
> {
  return z.object({
    failedAt: z.string().datetime(),
    failureReason: z.string(),
  });
}

export function ReportProvisioningStartedInputSchema(): z.ZodObject<
  Properties<ReportProvisioningStartedInput>
> {
  return z.object({
    startedAt: z.string().datetime(),
  });
}

export function ResourceInstanceStateSchema(): z.ZodObject<
  Properties<ResourceInstanceState>
> {
  return z.object({
    __typename: z.literal("ResourceInstanceState").optional(),
    activatedAt: z.string().datetime().nullish(),
    configuration: z.array(z.lazy(() => InstanceFacetSchema())),
    confirmedAt: z.string().datetime().nullish(),
    customerId: z.string().nullish(),
    description: z.string().nullish(),
    infoLink: z.string().url().nullish(),
    name: z.string().nullish(),
    profile: z.lazy(() => ResourceProfileSchema().nullish()),
    provisioningCompletedAt: z.string().datetime().nullish(),
    provisioningFailureReason: z.string().nullish(),
    provisioningStartedAt: z.string().datetime().nullish(),
    resourceTemplateId: z.string().nullish(),
    resumedAt: z.string().datetime().nullish(),
    status: InstanceStatusSchema,
    suspendedAt: z.string().datetime().nullish(),
    suspensionDetails: z.string().nullish(),
    suspensionReason: z.string().nullish(),
    suspensionType: SuspensionTypeSchema.nullish(),
    terminatedAt: z.string().datetime().nullish(),
    terminationReason: z.string().nullish(),
    thumbnailUrl: z.string().url().nullish(),
  });
}

export function ResourceProfileSchema(): z.ZodObject<
  Properties<ResourceProfile>
> {
  return z.object({
    __typename: z.literal("ResourceProfile").optional(),
    documentType: z.string(),
    id: z.string(),
  });
}

export function ResumeAfterMaintenanceInputSchema(): z.ZodObject<
  Properties<ResumeAfterMaintenanceInput>
> {
  return z.object({
    resumedAt: z.string().datetime(),
  });
}

export function ResumeAfterPaymentInputSchema(): z.ZodObject<
  Properties<ResumeAfterPaymentInput>
> {
  return z.object({
    paymentReference: z.string().nullish(),
    resumedAt: z.string().datetime(),
  });
}

export function SetInstanceFacetInputSchema(): z.ZodObject<
  Properties<SetInstanceFacetInput>
> {
  return z.object({
    categoryKey: z.string(),
    categoryLabel: z.string(),
    id: z.string(),
    selectedOption: z.string(),
  });
}

export function SetResourceProfileInputSchema(): z.ZodObject<
  Properties<SetResourceProfileInput>
> {
  return z.object({
    profileDocumentType: z.string(),
    profileId: z.string(),
  });
}

export function SuspendForMaintenanceInputSchema(): z.ZodObject<
  Properties<SuspendForMaintenanceInput>
> {
  return z.object({
    estimatedDuration: z.string().nullish(),
    maintenanceType: z.string().nullish(),
    suspendedAt: z.string().datetime(),
  });
}

export function SuspendForNonPaymentInputSchema(): z.ZodObject<
  Properties<SuspendForNonPaymentInput>
> {
  return z.object({
    daysPastDue: z.number().nullish(),
    outstandingAmount: z.number().nullish(),
    suspendedAt: z.string().datetime(),
  });
}

export function SuspendInstanceInputSchema(): z.ZodObject<
  Properties<SuspendInstanceInput>
> {
  return z.object({
    reason: z.string().nullish(),
    suspendedAt: z.string().datetime(),
  });
}

export function TerminateInstanceInputSchema(): z.ZodObject<
  Properties<TerminateInstanceInput>
> {
  return z.object({
    reason: z.string(),
    terminatedAt: z.string().datetime(),
  });
}

export function UpdateInstanceFacetInputSchema(): z.ZodObject<
  Properties<UpdateInstanceFacetInput>
> {
  return z.object({
    categoryKey: z.string(),
    categoryLabel: z.string().nullish(),
    selectedOption: z.string().nullish(),
  });
}

export function UpdateInstanceInfoInputSchema(): z.ZodObject<
  Properties<UpdateInstanceInfoInput>
> {
  return z.object({
    description: z.string().nullish(),
    infoLink: z.string().url().nullish(),
    name: z.string().nullish(),
    thumbnailUrl: z.string().url().nullish(),
  });
}

export function UpdateInstanceStatusInputSchema(): z.ZodObject<
  Properties<UpdateInstanceStatusInput>
> {
  return z.object({
    status: InstanceStatusSchema,
  });
}
