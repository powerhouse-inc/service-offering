import * as z from "zod";
import type {
  ActivateSubscriptionInput,
  AddServiceFacetSelectionInput,
  AddServiceGroupInput,
  AddServiceInput,
  AddServiceMetricInput,
  AddServiceToGroupInput,
  BillingCycle,
  BudgetCategory,
  CancelSubscriptionInput,
  CustomerType,
  DecrementMetricUsageInput,
  DiscountSource,
  DiscountType,
  FacetSelection,
  GroupCostType,
  IncrementMetricUsageInput,
  InitializeSubscriptionInput,
  PauseSubscriptionInput,
  RemoveBudgetCategoryInput,
  RemoveServiceFacetSelectionInput,
  RemoveServiceFromGroupInput,
  RemoveServiceGroupInput,
  RemoveServiceInput,
  RemoveServiceMetricInput,
  RenewExpiringSubscriptionInput,
  ReportRecurringPaymentInput,
  ReportSetupPaymentInput,
  ResetPeriod,
  ResourceDocument,
  ResumeSubscriptionInput,
  ServiceCost,
  ServiceGroup,
  ServiceMetric,
  SetAutoRenewInput,
  SetBudgetCategoryInput,
  SetCustomerTypeInput,
  SetExpiringInput,
  SetOperatorNotesInput,
  SetRenewalDateInput,
  SetResourceDocumentInput,
  SubscriptionInstanceState,
  SubscriptionService,
  SubscriptionStatus,
  TierPricingMode,
  UpdateBillingProjectionInput,
  UpdateCustomerInfoInput,
  UpdateMetricInput,
  UpdateMetricUsageInput,
  UpdateServiceGroupCostInput,
  UpdateServiceInfoInput,
  UpdateServiceRecurringCostInput,
  UpdateServiceSetupCostInput,
  UpdateSubscriptionStatusInput,
  UpdateTeamMemberCountInput,
  UpdateTierInfoInput,
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

export const BillingCycleSchema = z.enum([
  "ANNUAL",
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
]);

export const CustomerTypeSchema = z.enum(["ENTERPRISE", "INDIVIDUAL", "TEAM"]);

export const DiscountSourceSchema = z.enum(["CUSTOM", "TIER"]);

export const DiscountTypeSchema = z.enum(["FIXED_AMOUNT", "PERCENTAGE"]);

export const GroupCostTypeSchema = z.enum(["RECURRING", "SETUP"]);

export const ResetPeriodSchema = z.enum([
  "ANNUAL",
  "DAILY",
  "MONTHLY",
  "QUARTERLY",
  "WEEKLY",
]);

export const SubscriptionStatusSchema = z.enum([
  "ACTIVE",
  "CANCELLED",
  "DRAFT",
  "EXPIRING",
  "PAUSED",
]);

export const TierPricingModeSchema = z.enum(["CUSTOM", "FIXED", "PER_SEAT"]);

export function ActivateSubscriptionInputSchema(): z.ZodObject<
  Properties<ActivateSubscriptionInput>
> {
  return z.object({
    activatedAt: z.iso.datetime(),
  });
}

export function AddServiceFacetSelectionInputSchema(): z.ZodObject<
  Properties<AddServiceFacetSelectionInput>
> {
  return z.object({
    facetName: z.string(),
    id: z.string(),
    selectedOption: z.string(),
    serviceId: z.string(),
  });
}

export function AddServiceGroupInputSchema(): z.ZodObject<
  Properties<AddServiceGroupInput>
> {
  return z.object({
    costType: GroupCostTypeSchema.nullish(),
    id: z.string(),
    name: z.string(),
    optional: z.boolean(),
  });
}

export function AddServiceInputSchema(): z.ZodObject<
  Properties<AddServiceInput>
> {
  return z.object({
    customValue: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function AddServiceMetricInputSchema(): z.ZodObject<
  Properties<AddServiceMetricInput>
> {
  return z.object({
    freeLimit: z.number().nullish(),
    id: z.string(),
    limit: z.number().nullish(),
    name: z.string(),
    nextUsageReset: z.iso.datetime().nullish(),
    paidLimit: z.number().nullish(),
    serviceId: z.string(),
    unitCost: z.number().nullish(),
    unitName: z.string().nullish(),
    usageResetPeriod: ResetPeriodSchema.nullish(),
  });
}

export function AddServiceToGroupInputSchema(): z.ZodObject<
  Properties<AddServiceToGroupInput>
> {
  return z.object({
    groupId: z.string(),
    serviceId: z.string(),
  });
}

export function BudgetCategorySchema(): z.ZodObject<
  Properties<BudgetCategory>
> {
  return z.object({
    __typename: z.literal("BudgetCategory").optional(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function CancelSubscriptionInputSchema(): z.ZodObject<
  Properties<CancelSubscriptionInput>
> {
  return z.object({
    cancelledAt: z.iso.datetime(),
    reason: z.string().nullish(),
  });
}

export function DecrementMetricUsageInputSchema(): z.ZodObject<
  Properties<DecrementMetricUsageInput>
> {
  return z.object({
    amount: z.number(),
    metricId: z.string(),
    serviceId: z.string(),
  });
}

export function FacetSelectionSchema(): z.ZodObject<
  Properties<FacetSelection>
> {
  return z.object({
    __typename: z.literal("FacetSelection").optional(),
    facetName: z.string(),
    id: z.string(),
    selectedOption: z.string(),
  });
}

export function IncrementMetricUsageInputSchema(): z.ZodObject<
  Properties<IncrementMetricUsageInput>
> {
  return z.object({
    amount: z.number(),
    metricId: z.string(),
    serviceId: z.string(),
  });
}

export function InitializeSubscriptionInputSchema(): z.ZodObject<
  Properties<InitializeSubscriptionInput>
> {
  return z.object({
    createdAt: z.iso.datetime(),
    customerEmail: z.string().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
    globalCurrency: z.string().nullish(),
    operatorId: z.string().nullish(),
    selectedBillingCycle: BillingCycleSchema.nullish(),
    serviceOfferingId: z.string().nullish(),
    tierCurrency: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPrice: z.number().nullish(),
    tierPricingMode: TierPricingModeSchema.nullish(),
    tierPricingOptionId: z.string().nullish(),
  });
}

export function PauseSubscriptionInputSchema(): z.ZodObject<
  Properties<PauseSubscriptionInput>
> {
  return z.object({
    pausedAt: z.iso.datetime(),
  });
}

export function RemoveBudgetCategoryInputSchema(): z.ZodObject<
  Properties<RemoveBudgetCategoryInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveServiceFacetSelectionInputSchema(): z.ZodObject<
  Properties<RemoveServiceFacetSelectionInput>
> {
  return z.object({
    facetSelectionId: z.string(),
    serviceId: z.string(),
  });
}

export function RemoveServiceFromGroupInputSchema(): z.ZodObject<
  Properties<RemoveServiceFromGroupInput>
> {
  return z.object({
    groupId: z.string(),
    serviceId: z.string(),
  });
}

export function RemoveServiceGroupInputSchema(): z.ZodObject<
  Properties<RemoveServiceGroupInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveServiceInputSchema(): z.ZodObject<
  Properties<RemoveServiceInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveServiceMetricInputSchema(): z.ZodObject<
  Properties<RemoveServiceMetricInput>
> {
  return z.object({
    metricId: z.string(),
    serviceId: z.string(),
  });
}

export function RenewExpiringSubscriptionInputSchema(): z.ZodObject<
  Properties<RenewExpiringSubscriptionInput>
> {
  return z.object({
    newRenewalDate: z.iso.datetime().nullish(),
    renewedAt: z.iso.datetime(),
  });
}

export function ReportRecurringPaymentInputSchema(): z.ZodObject<
  Properties<ReportRecurringPaymentInput>
> {
  return z.object({
    paidAmount: z.number(),
    paidAt: z.iso.datetime(),
    serviceId: z.string(),
  });
}

export function ReportSetupPaymentInputSchema(): z.ZodObject<
  Properties<ReportSetupPaymentInput>
> {
  return z.object({
    paidAmount: z.number(),
    paidAt: z.iso.datetime(),
    serviceId: z.string(),
  });
}

export function ResourceDocumentSchema(): z.ZodObject<
  Properties<ResourceDocument>
> {
  return z.object({
    __typename: z.literal("ResourceDocument").optional(),
    documentId: z.string(),
    documentType: z.string(),
  });
}

export function ResumeSubscriptionInputSchema(): z.ZodObject<
  Properties<ResumeSubscriptionInput>
> {
  return z.object({
    resumedAt: z.iso.datetime(),
  });
}

export function ServiceCostSchema(): z.ZodObject<Properties<ServiceCost>> {
  return z.object({
    __typename: z.literal("ServiceCost").optional(),
    amount: z.number(),
    currency: z.string(),
    paidAmount: z.number().nullish(),
    paidAt: z.iso.datetime().nullish(),
  });
}

export function ServiceGroupSchema(): z.ZodObject<Properties<ServiceGroup>> {
  return z.object({
    __typename: z.literal("ServiceGroup").optional(),
    costType: GroupCostTypeSchema.nullish(),
    id: z.string(),
    name: z.string(),
    optional: z.boolean(),
    recurringCost: z.lazy(() => ServiceCostSchema().nullish()),
    services: z.array(z.string()),
    setupCost: z.lazy(() => ServiceCostSchema().nullish()),
  });
}

export function ServiceMetricSchema(): z.ZodObject<Properties<ServiceMetric>> {
  return z.object({
    __typename: z.literal("ServiceMetric").optional(),
    currentUsage: z.number(),
    freeLimit: z.number().nullish(),
    id: z.string(),
    limit: z.number().nullish(),
    name: z.string(),
    nextUsageReset: z.iso.datetime().nullish(),
    paidLimit: z.number().nullish(),
    unitCost: z.number().nullish(),
    unitName: z.string().nullish(),
    usageResetPeriod: ResetPeriodSchema.nullish(),
  });
}

export function SetAutoRenewInputSchema(): z.ZodObject<
  Properties<SetAutoRenewInput>
> {
  return z.object({
    autoRenew: z.boolean(),
  });
}

export function SetBudgetCategoryInputSchema(): z.ZodObject<
  Properties<SetBudgetCategoryInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function SetCustomerTypeInputSchema(): z.ZodObject<
  Properties<SetCustomerTypeInput>
> {
  return z.object({
    customerType: CustomerTypeSchema,
  });
}

export function SetExpiringInputSchema(): z.ZodObject<
  Properties<SetExpiringInput>
> {
  return z.object({
    expiringAt: z.iso.datetime(),
    renewalDate: z.iso.datetime().nullish(),
  });
}

export function SetOperatorNotesInputSchema(): z.ZodObject<
  Properties<SetOperatorNotesInput>
> {
  return z.object({
    notes: z.string().nullish(),
  });
}

export function SetRenewalDateInputSchema(): z.ZodObject<
  Properties<SetRenewalDateInput>
> {
  return z.object({
    renewalDate: z.iso.datetime(),
  });
}

export function SetResourceDocumentInputSchema(): z.ZodObject<
  Properties<SetResourceDocumentInput>
> {
  return z.object({
    documentId: z.string(),
    documentType: z.string(),
  });
}

export function SubscriptionInstanceStateSchema(): z.ZodObject<
  Properties<SubscriptionInstanceState>
> {
  return z.object({
    __typename: z.literal("SubscriptionInstanceState").optional(),
    activatedSince: z.iso.datetime().nullish(),
    autoRenew: z.boolean(),
    budget: z.lazy(() => BudgetCategorySchema().nullish()),
    cancellationReason: z.string().nullish(),
    cancelledSince: z.iso.datetime().nullish(),
    createdAt: z.iso.datetime().nullish(),
    customerEmail: z.string().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
    customerType: CustomerTypeSchema.nullish(),
    expiringSince: z.iso.datetime().nullish(),
    globalCurrency: z.string().nullish(),
    nextBillingDate: z.iso.datetime().nullish(),
    operatorId: z.string().nullish(),
    operatorNotes: z.string().nullish(),
    pausedSince: z.iso.datetime().nullish(),
    projectedBillAmount: z.number().nullish(),
    projectedBillCurrency: z.string().nullish(),
    renewalDate: z.iso.datetime().nullish(),
    resource: z.lazy(() => ResourceDocumentSchema().nullish()),
    selectedBillingCycle: BillingCycleSchema.nullish(),
    serviceGroups: z.array(z.lazy(() => ServiceGroupSchema())),
    serviceOfferingId: z.string().nullish(),
    services: z.array(z.lazy(() => SubscriptionServiceSchema())),
    status: SubscriptionStatusSchema,
    teamMemberCount: z.number().nullish(),
    tierCurrency: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPrice: z.number().nullish(),
    tierPricingMode: TierPricingModeSchema.nullish(),
    tierPricingOptionId: z.string().nullish(),
  });
}

export function SubscriptionServiceSchema(): z.ZodObject<
  Properties<SubscriptionService>
> {
  return z.object({
    __typename: z.literal("SubscriptionService").optional(),
    customValue: z.string().nullish(),
    description: z.string().nullish(),
    facetSelections: z.array(z.lazy(() => FacetSelectionSchema())),
    id: z.string(),
    metrics: z.array(z.lazy(() => ServiceMetricSchema())),
    name: z.string(),
    recurringCost: z.lazy(() => ServiceCostSchema().nullish()),
    setupCost: z.lazy(() => ServiceCostSchema().nullish()),
  });
}

export function UpdateBillingProjectionInputSchema(): z.ZodObject<
  Properties<UpdateBillingProjectionInput>
> {
  return z.object({
    nextBillingDate: z.iso.datetime().nullish(),
    projectedBillAmount: z.number().nullish(),
    projectedBillCurrency: z.string().nullish(),
  });
}

export function UpdateCustomerInfoInputSchema(): z.ZodObject<
  Properties<UpdateCustomerInfoInput>
> {
  return z.object({
    customerEmail: z.string().nullish(),
    customerName: z.string().nullish(),
  });
}

export function UpdateMetricInputSchema(): z.ZodObject<
  Properties<UpdateMetricInput>
> {
  return z.object({
    freeLimit: z.number().nullish(),
    limit: z.number().nullish(),
    metricId: z.string(),
    name: z.string().nullish(),
    nextUsageReset: z.iso.datetime().nullish(),
    paidLimit: z.number().nullish(),
    serviceId: z.string(),
    unitCost: z.number().nullish(),
    unitName: z.string().nullish(),
    usageResetPeriod: ResetPeriodSchema.nullish(),
  });
}

export function UpdateMetricUsageInputSchema(): z.ZodObject<
  Properties<UpdateMetricUsageInput>
> {
  return z.object({
    currentUsage: z.number(),
    metricId: z.string(),
    serviceId: z.string(),
  });
}

export function UpdateServiceGroupCostInputSchema(): z.ZodObject<
  Properties<UpdateServiceGroupCostInput>
> {
  return z.object({
    amount: z.number(),
    costType: GroupCostTypeSchema,
    currency: z.string(),
    groupId: z.string(),
  });
}

export function UpdateServiceInfoInputSchema(): z.ZodObject<
  Properties<UpdateServiceInfoInput>
> {
  return z.object({
    customValue: z.string().nullish(),
    description: z.string().nullish(),
    name: z.string().nullish(),
    serviceId: z.string(),
  });
}

export function UpdateServiceRecurringCostInputSchema(): z.ZodObject<
  Properties<UpdateServiceRecurringCostInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    serviceId: z.string(),
  });
}

export function UpdateServiceSetupCostInputSchema(): z.ZodObject<
  Properties<UpdateServiceSetupCostInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    serviceId: z.string(),
  });
}

export function UpdateSubscriptionStatusInputSchema(): z.ZodObject<
  Properties<UpdateSubscriptionStatusInput>
> {
  return z.object({
    status: SubscriptionStatusSchema,
  });
}

export function UpdateTeamMemberCountInputSchema(): z.ZodObject<
  Properties<UpdateTeamMemberCountInput>
> {
  return z.object({
    teamMemberCount: z.number(),
  });
}

export function UpdateTierInfoInputSchema(): z.ZodObject<
  Properties<UpdateTierInfoInput>
> {
  return z.object({
    selectedBillingCycle: BillingCycleSchema.nullish(),
    tierCurrency: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPrice: z.number().nullish(),
    tierPricingMode: TierPricingModeSchema.nullish(),
    tierPricingOptionId: z.string().nullish(),
  });
}
