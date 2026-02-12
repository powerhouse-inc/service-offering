import * as z from "zod";
import type {
  ActivateSubscriptionInput,
  AddSelectedOptionGroupInput,
  AddServiceGroupInput,
  AddServiceInput,
  AddServiceMetricInput,
  AddServiceToGroupInput,
  ApproveRequestInput,
  BillingCycle,
  BudgetCategory,
  CancelSubscriptionInput,
  ClientRequest,
  CreateClientRequestInput,
  CustomerType,
  DecrementMetricUsageInput,
  GroupCostType,
  IncrementMetricUsageInput,
  InitializeSubscriptionInput,
  PauseSubscriptionInput,
  RecurringCost,
  RejectRequestInput,
  RemoveBudgetCategoryInput,
  RemoveFacetSelectionInput,
  RemoveSelectedOptionGroupInput,
  RemoveServiceFromGroupInput,
  RemoveServiceGroupInput,
  RemoveServiceInput,
  RemoveServiceMetricInput,
  RemoveTargetAudienceInput,
  RenewExpiringSubscriptionInput,
  ReportRecurringPaymentInput,
  ReportSetupPaymentInput,
  RequestStatus,
  RequestType,
  ResetPeriod,
  ResourceDocument,
  ResumeSubscriptionInput,
  SelectedOptionGroup,
  Service,
  ServiceGroup,
  ServiceLevel,
  ServiceMetric,
  SetAutoRenewInput,
  SetBudgetCategoryInput,
  SetCustomerTypeInput,
  SetExpiringInput,
  SetFacetSelectionInput,
  SetOperatorNotesInput,
  SetRenewalDateInput,
  SetResourceDocumentInput,
  SetTargetAudienceInput,
  SetupCost,
  SubscriptionFacetSelection,
  SubscriptionInstanceState,
  SubscriptionStatus,
  UpdateBillingProjectionInput,
  UpdateCustomerInfoInput,
  UpdateMetricInput,
  UpdateMetricUsageInput,
  UpdateServiceInfoInput,
  UpdateServiceLevelInput,
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
  "ONE_TIME",
  "QUARTERLY",
  "SEMI_ANNUAL",
]);

export const CustomerTypeSchema = z.enum(["INDIVIDUAL", "TEAM"]);

export const GroupCostTypeSchema = z.enum(["RECURRING", "SETUP"]);

export const RequestStatusSchema = z.enum(["APPROVED", "PENDING", "REJECTED"]);

export const RequestTypeSchema = z.enum([
  "GENERAL",
  "INCREASE_LIMIT",
  "REMOVE_OPTION",
  "REMOVE_SERVICE",
]);

export const ResetPeriodSchema = z.enum([
  "ANNUAL",
  "DAILY",
  "HOURLY",
  "MONTHLY",
  "NONE",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "WEEKLY",
]);

export const ServiceLevelSchema = z.enum([
  "CUSTOM",
  "INCLUDED",
  "NOT_APPLICABLE",
  "NOT_INCLUDED",
  "OPTIONAL",
  "VARIABLE",
]);

export const SubscriptionStatusSchema = z.enum([
  "ACTIVE",
  "CANCELLED",
  "EXPIRING",
  "PAUSED",
  "PENDING",
]);

export function ActivateSubscriptionInputSchema(): z.ZodObject<
  Properties<ActivateSubscriptionInput>
> {
  return z.object({
    activatedSince: z.string().datetime(),
  });
}

export function AddSelectedOptionGroupInputSchema(): z.ZodObject<
  Properties<AddSelectedOptionGroupInput>
> {
  return z.object({
    billingCycle: BillingCycleSchema.nullish(),
    costType: GroupCostTypeSchema.nullish(),
    currency: z.string().nullish(),
    id: z.string(),
    isAddOn: z.boolean(),
    name: z.string(),
    optionGroupId: z.string(),
    price: z.number().nullish(),
  });
}

export function AddServiceGroupInputSchema(): z.ZodObject<
  Properties<AddServiceGroupInput>
> {
  return z.object({
    billingCycle: BillingCycleSchema.nullish(),
    groupId: z.string(),
    name: z.string(),
    optional: z.boolean(),
  });
}

export function AddServiceInputSchema(): z.ZodObject<
  Properties<AddServiceInput>
> {
  return z.object({
    description: z.string().nullish(),
    name: z.string().nullish(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    recurringLastPaymentDate: z.string().datetime().nullish(),
    recurringNextBillingDate: z.string().datetime().nullish(),
    serviceId: z.string(),
    serviceLevel: ServiceLevelSchema.nullish(),
    setupAmount: z.number().nullish(),
    setupBillingDate: z.string().datetime().nullish(),
    setupCurrency: z.string().nullish(),
    setupPaymentDate: z.string().datetime().nullish(),
  });
}

export function AddServiceMetricInputSchema(): z.ZodObject<
  Properties<AddServiceMetricInput>
> {
  return z.object({
    currentUsage: z.number(),
    freeLimit: z.number().nullish(),
    metricId: z.string(),
    name: z.string(),
    nextUsageReset: z.string().datetime().nullish(),
    paidLimit: z.number().nullish(),
    serviceId: z.string(),
    unitCostAmount: z.number().nullish(),
    unitCostBillingCycle: BillingCycleSchema.nullish(),
    unitCostCurrency: z.string().nullish(),
    unitCostLastPaymentDate: z.string().datetime().nullish(),
    unitCostNextBillingDate: z.string().datetime().nullish(),
    unitName: z.string(),
    usageResetPeriod: ResetPeriodSchema.nullish(),
  });
}

export function AddServiceToGroupInputSchema(): z.ZodObject<
  Properties<AddServiceToGroupInput>
> {
  return z.object({
    description: z.string().nullish(),
    groupId: z.string(),
    name: z.string().nullish(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    recurringLastPaymentDate: z.string().datetime().nullish(),
    recurringNextBillingDate: z.string().datetime().nullish(),
    serviceId: z.string(),
    serviceLevel: ServiceLevelSchema.nullish(),
    setupAmount: z.number().nullish(),
    setupBillingDate: z.string().datetime().nullish(),
    setupCurrency: z.string().nullish(),
    setupPaymentDate: z.string().datetime().nullish(),
  });
}

export function ApproveRequestInputSchema(): z.ZodObject<
  Properties<ApproveRequestInput>
> {
  return z.object({
    operatorResponse: z.string().nullish(),
    requestId: z.string(),
    resolvedAt: z.string().datetime(),
  });
}

export function BudgetCategorySchema(): z.ZodObject<
  Properties<BudgetCategory>
> {
  return z.object({
    __typename: z.literal("BudgetCategory").optional(),
    id: z.string(),
    label: z.string(),
  });
}

export function CancelSubscriptionInputSchema(): z.ZodObject<
  Properties<CancelSubscriptionInput>
> {
  return z.object({
    cancellationReason: z.string().nullish(),
    cancelledSince: z.string().datetime(),
  });
}

export function ClientRequestSchema(): z.ZodObject<Properties<ClientRequest>> {
  return z.object({
    __typename: z.literal("ClientRequest").optional(),
    createdAt: z.string().datetime(),
    description: z.string(),
    id: z.string(),
    metricId: z.string().nullish(),
    metricName: z.string().nullish(),
    operatorResponse: z.string().nullish(),
    optionGroupId: z.string().nullish(),
    optionGroupName: z.string().nullish(),
    reason: z.string().nullish(),
    requestedValue: z.number().nullish(),
    resolvedAt: z.string().datetime().nullish(),
    serviceId: z.string().nullish(),
    serviceName: z.string().nullish(),
    status: RequestStatusSchema,
    type: RequestTypeSchema,
  });
}

export function CreateClientRequestInputSchema(): z.ZodObject<
  Properties<CreateClientRequestInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    description: z.string(),
    id: z.string(),
    metricId: z.string().nullish(),
    metricName: z.string().nullish(),
    optionGroupId: z.string().nullish(),
    optionGroupName: z.string().nullish(),
    reason: z.string().nullish(),
    requestedValue: z.number().nullish(),
    serviceId: z.string().nullish(),
    serviceName: z.string().nullish(),
    type: RequestTypeSchema,
  });
}

export function DecrementMetricUsageInputSchema(): z.ZodObject<
  Properties<DecrementMetricUsageInput>
> {
  return z.object({
    currentTime: z.string().datetime(),
    decrementBy: z.number(),
    metricId: z.string(),
    serviceId: z.string(),
  });
}

export function IncrementMetricUsageInputSchema(): z.ZodObject<
  Properties<IncrementMetricUsageInput>
> {
  return z.object({
    currentTime: z.string().datetime(),
    incrementBy: z.number(),
    metricId: z.string(),
    serviceId: z.string(),
  });
}

export function InitializeSubscriptionInputSchema(): z.ZodObject<
  Properties<InitializeSubscriptionInput>
> {
  return z.object({
    autoRenew: z.boolean().nullish(),
    createdAt: z.string().datetime(),
    customerEmail: z.string().email().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
    resourceId: z.string().nullish(),
    resourceLabel: z.string().nullish(),
    resourceThumbnailUrl: z.string().url().nullish(),
    serviceOfferingId: z.string().nullish(),
    targetAudienceId: z.string().nullish(),
    targetAudienceLabel: z.string().nullish(),
    tierId: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPricingOptionId: z.string().nullish(),
  });
}

export function PauseSubscriptionInputSchema(): z.ZodObject<
  Properties<PauseSubscriptionInput>
> {
  return z.object({
    pausedSince: z.string().datetime(),
  });
}

export function RecurringCostSchema(): z.ZodObject<Properties<RecurringCost>> {
  return z.object({
    __typename: z.literal("RecurringCost").optional(),
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    lastPaymentDate: z.string().datetime().nullish(),
    nextBillingDate: z.string().datetime().nullish(),
  });
}

export function RejectRequestInputSchema(): z.ZodObject<
  Properties<RejectRequestInput>
> {
  return z.object({
    operatorResponse: z.string().nullish(),
    requestId: z.string(),
    resolvedAt: z.string().datetime(),
  });
}

export function RemoveBudgetCategoryInputSchema(): z.ZodObject<
  Properties<RemoveBudgetCategoryInput>
> {
  return z.object({
    budgetId: z.string(),
  });
}

export function RemoveFacetSelectionInputSchema(): z.ZodObject<
  Properties<RemoveFacetSelectionInput>
> {
  return z.object({
    categoryKey: z.string(),
  });
}

export function RemoveSelectedOptionGroupInputSchema(): z.ZodObject<
  Properties<RemoveSelectedOptionGroupInput>
> {
  return z.object({
    id: z.string(),
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
    groupId: z.string(),
  });
}

export function RemoveServiceInputSchema(): z.ZodObject<
  Properties<RemoveServiceInput>
> {
  return z.object({
    serviceId: z.string(),
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

export function RemoveTargetAudienceInputSchema(): z.ZodObject<
  Properties<RemoveTargetAudienceInput>
> {
  return z.object({
    targetAudienceId: z.string(),
  });
}

export function RenewExpiringSubscriptionInputSchema(): z.ZodObject<
  Properties<RenewExpiringSubscriptionInput>
> {
  return z.object({
    newRenewalDate: z.string().datetime().nullish(),
    timestamp: z.string().datetime(),
  });
}

export function ReportRecurringPaymentInputSchema(): z.ZodObject<
  Properties<ReportRecurringPaymentInput>
> {
  return z.object({
    paymentDate: z.string().datetime(),
    serviceId: z.string(),
  });
}

export function ReportSetupPaymentInputSchema(): z.ZodObject<
  Properties<ReportSetupPaymentInput>
> {
  return z.object({
    paymentDate: z.string().datetime(),
    serviceId: z.string(),
  });
}

export function ResourceDocumentSchema(): z.ZodObject<
  Properties<ResourceDocument>
> {
  return z.object({
    __typename: z.literal("ResourceDocument").optional(),
    id: z.string(),
    label: z.string().nullish(),
    thumbnailUrl: z.string().url().nullish(),
  });
}

export function ResumeSubscriptionInputSchema(): z.ZodObject<
  Properties<ResumeSubscriptionInput>
> {
  return z.object({
    timestamp: z.string().datetime(),
  });
}

export function SelectedOptionGroupSchema(): z.ZodObject<
  Properties<SelectedOptionGroup>
> {
  return z.object({
    __typename: z.literal("SelectedOptionGroup").optional(),
    billingCycle: BillingCycleSchema.nullish(),
    costType: GroupCostTypeSchema.nullish(),
    currency: z.string().nullish(),
    id: z.string(),
    isAddOn: z.boolean(),
    name: z.string(),
    optionGroupId: z.string(),
    price: z.number().nullish(),
  });
}

export function ServiceSchema(): z.ZodObject<Properties<Service>> {
  return z.object({
    __typename: z.literal("Service").optional(),
    description: z.string().nullish(),
    id: z.string(),
    metrics: z.array(z.lazy(() => ServiceMetricSchema())),
    name: z.string().nullish(),
    recurringCost: z.lazy(() => RecurringCostSchema().nullish()),
    serviceLevel: ServiceLevelSchema.nullish(),
    setupCost: z.lazy(() => SetupCostSchema().nullish()),
  });
}

export function ServiceGroupSchema(): z.ZodObject<Properties<ServiceGroup>> {
  return z.object({
    __typename: z.literal("ServiceGroup").optional(),
    billingCycle: BillingCycleSchema.nullish(),
    id: z.string(),
    name: z.string(),
    optional: z.boolean(),
    services: z.array(z.lazy(() => ServiceSchema())),
  });
}

export function ServiceMetricSchema(): z.ZodObject<Properties<ServiceMetric>> {
  return z.object({
    __typename: z.literal("ServiceMetric").optional(),
    currentUsage: z.number(),
    freeLimit: z.number().nullish(),
    id: z.string(),
    name: z.string(),
    nextUsageReset: z.string().datetime().nullish(),
    paidLimit: z.number().nullish(),
    unitCost: z.lazy(() => RecurringCostSchema().nullish()),
    unitName: z.string(),
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
    budgetId: z.string(),
    budgetLabel: z.string(),
  });
}

export function SetCustomerTypeInputSchema(): z.ZodObject<
  Properties<SetCustomerTypeInput>
> {
  return z.object({
    customerType: CustomerTypeSchema,
    teamMemberCount: z.number().nullish(),
  });
}

export function SetExpiringInputSchema(): z.ZodObject<
  Properties<SetExpiringInput>
> {
  return z.object({
    expiringSince: z.string().datetime(),
  });
}

export function SetFacetSelectionInputSchema(): z.ZodObject<
  Properties<SetFacetSelectionInput>
> {
  return z.object({
    categoryKey: z.string(),
    categoryLabel: z.string(),
    id: z.string(),
    selectedOptions: z.array(z.string()),
  });
}

export function SetOperatorNotesInputSchema(): z.ZodObject<
  Properties<SetOperatorNotesInput>
> {
  return z.object({
    operatorNotes: z.string().nullish(),
  });
}

export function SetRenewalDateInputSchema(): z.ZodObject<
  Properties<SetRenewalDateInput>
> {
  return z.object({
    renewalDate: z.string().datetime(),
  });
}

export function SetResourceDocumentInputSchema(): z.ZodObject<
  Properties<SetResourceDocumentInput>
> {
  return z.object({
    resourceId: z.string(),
    resourceLabel: z.string().nullish(),
    resourceThumbnailUrl: z.string().url().nullish(),
  });
}

export function SetTargetAudienceInputSchema(): z.ZodObject<
  Properties<SetTargetAudienceInput>
> {
  return z.object({
    targetAudienceId: z.string(),
    targetAudienceLabel: z.string(),
  });
}

export function SetupCostSchema(): z.ZodObject<Properties<SetupCost>> {
  return z.object({
    __typename: z.literal("SetupCost").optional(),
    amount: z.number(),
    billingDate: z.string().datetime().nullish(),
    currency: z.string(),
    paymentDate: z.string().datetime().nullish(),
  });
}

export function SubscriptionFacetSelectionSchema(): z.ZodObject<
  Properties<SubscriptionFacetSelection>
> {
  return z.object({
    __typename: z.literal("SubscriptionFacetSelection").optional(),
    categoryKey: z.string(),
    categoryLabel: z.string(),
    id: z.string(),
    selectedOptions: z.array(z.string()),
  });
}

export function SubscriptionInstanceStateSchema(): z.ZodObject<
  Properties<SubscriptionInstanceState>
> {
  return z.object({
    __typename: z.literal("SubscriptionInstanceState").optional(),
    activatedSince: z.string().datetime().nullish(),
    autoRenew: z.boolean(),
    budget: z.lazy(() => BudgetCategorySchema().nullish()),
    cancellationReason: z.string().nullish(),
    cancelledSince: z.string().datetime().nullish(),
    clientRequests: z.array(z.lazy(() => ClientRequestSchema())),
    createdAt: z.string().datetime().nullish(),
    customerEmail: z.string().email().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
    customerType: CustomerTypeSchema.nullish(),
    expiringSince: z.string().datetime().nullish(),
    facetSelections: z.array(z.lazy(() => SubscriptionFacetSelectionSchema())),
    nextBillingDate: z.string().datetime().nullish(),
    operatorId: z.string().nullish(),
    operatorNotes: z.string().nullish(),
    pausedSince: z.string().datetime().nullish(),
    projectedBillAmount: z.number().nullish(),
    projectedBillCurrency: z.string().nullish(),
    renewalDate: z.string().datetime().nullish(),
    resource: z.lazy(() => ResourceDocumentSchema().nullish()),
    selectedOptionGroups: z.array(z.lazy(() => SelectedOptionGroupSchema())),
    serviceGroups: z.array(z.lazy(() => ServiceGroupSchema())),
    serviceOfferingId: z.string().nullish(),
    services: z.array(z.lazy(() => ServiceSchema())),
    status: SubscriptionStatusSchema,
    targetAudienceId: z.string().nullish(),
    targetAudienceLabel: z.string().nullish(),
    teamMemberCount: z.number().nullish(),
    tierId: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPricingOptionId: z.string().nullish(),
  });
}

export function UpdateBillingProjectionInputSchema(): z.ZodObject<
  Properties<UpdateBillingProjectionInput>
> {
  return z.object({
    nextBillingDate: z.string().datetime().nullish(),
    projectedBillAmount: z.number().nullish(),
    projectedBillCurrency: z.string().nullish(),
  });
}

export function UpdateCustomerInfoInputSchema(): z.ZodObject<
  Properties<UpdateCustomerInfoInput>
> {
  return z.object({
    customerEmail: z.string().email().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
  });
}

export function UpdateMetricInputSchema(): z.ZodObject<
  Properties<UpdateMetricInput>
> {
  return z.object({
    freeLimit: z.number().nullish(),
    metricId: z.string(),
    name: z.string().nullish(),
    nextUsageReset: z.string().datetime().nullish(),
    paidLimit: z.number().nullish(),
    serviceId: z.string(),
    unitName: z.string().nullish(),
    usageResetPeriod: ResetPeriodSchema.nullish(),
  });
}

export function UpdateMetricUsageInputSchema(): z.ZodObject<
  Properties<UpdateMetricUsageInput>
> {
  return z.object({
    currentTime: z.string().datetime(),
    currentUsage: z.number(),
    metricId: z.string(),
    serviceId: z.string(),
  });
}

export function UpdateServiceInfoInputSchema(): z.ZodObject<
  Properties<UpdateServiceInfoInput>
> {
  return z.object({
    description: z.string().nullish(),
    name: z.string().nullish(),
    serviceId: z.string(),
  });
}

export function UpdateServiceLevelInputSchema(): z.ZodObject<
  Properties<UpdateServiceLevelInput>
> {
  return z.object({
    serviceId: z.string(),
    serviceLevel: ServiceLevelSchema,
  });
}

export function UpdateServiceRecurringCostInputSchema(): z.ZodObject<
  Properties<UpdateServiceRecurringCostInput>
> {
  return z.object({
    amount: z.number().nullish(),
    billingCycle: BillingCycleSchema.nullish(),
    currency: z.string().nullish(),
    lastPaymentDate: z.string().datetime().nullish(),
    nextBillingDate: z.string().datetime().nullish(),
    serviceId: z.string(),
  });
}

export function UpdateServiceSetupCostInputSchema(): z.ZodObject<
  Properties<UpdateServiceSetupCostInput>
> {
  return z.object({
    amount: z.number().nullish(),
    billingDate: z.string().datetime().nullish(),
    currency: z.string().nullish(),
    paymentDate: z.string().datetime().nullish(),
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
    tierId: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPricingOptionId: z.string().nullish(),
  });
}
