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
  DiscountInfo,
  DiscountInfoInitInput,
  DiscountServiceInfoInput,
  DiscountSource,
  DiscountType,
  GroupCostType,
  IncrementMetricUsageInput,
  InitializeFacetSelectionInput,
  InitializeMetricInput,
  InitializeServiceGroupInput,
  InitializeServiceInput,
  InitializeSubscriptionInput,
  PauseSubscriptionInput,
  RecurringCost,
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
  Service,
  ServiceFacetSelection,
  ServiceGroup,
  ServiceMetric,
  SetAutoRenewInput,
  SetBudgetCategoryInput,
  SetCustomerTypeInput,
  SetExpiringInput,
  SetOperatorNotesInput,
  SetRenewalDateInput,
  SetResourceDocumentInput,
  SetupCost,
  SubscriptionInstanceState,
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
  "ONE_TIME",
  "QUARTERLY",
  "SEMI_ANNUAL",
]);

export const CustomerTypeSchema = z.enum(["INDIVIDUAL", "TEAM"]);

export const DiscountSourceSchema = z.enum([
  "BUNDLE",
  "GROUP_INDEPENDENT",
  "TIER_INHERITED",
]);

export const DiscountTypeSchema = z.enum(["FLAT_AMOUNT", "PERCENTAGE"]);

export const GroupCostTypeSchema = z.enum(["RECURRING", "SETUP"]);

export const ResetPeriodSchema = z.enum([
  "ANNUAL",
  "DAILY",
  "HOURLY",
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "WEEKLY",
]);

export const SubscriptionStatusSchema = z.enum([
  "ACTIVE",
  "CANCELLED",
  "EXPIRING",
  "PAUSED",
  "PENDING",
]);

export const TierPricingModeSchema = z.enum(["CALCULATED", "MANUAL_OVERRIDE"]);

export function ActivateSubscriptionInputSchema(): z.ZodObject<
  Properties<ActivateSubscriptionInput>
> {
  return z.object({
    activatedSince: z.string().datetime(),
  });
}

export function AddServiceFacetSelectionInputSchema(): z.ZodObject<
  Properties<AddServiceFacetSelectionInput>
> {
  return z.object({
    facetName: z.string(),
    facetSelectionId: z.string(),
    selectedOption: z.string(),
    serviceId: z.string(),
  });
}

export function AddServiceGroupInputSchema(): z.ZodObject<
  Properties<AddServiceGroupInput>
> {
  return z.object({
    costType: GroupCostTypeSchema.nullish(),
    groupId: z.string(),
    name: z.string(),
    optional: z.boolean(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    recurringDiscount: z.lazy(() => DiscountServiceInfoInputSchema().nullish()),
    setupAmount: z.number().nullish(),
    setupBillingDate: z.string().datetime().nullish(),
    setupCurrency: z.string().nullish(),
  });
}

export function AddServiceInputSchema(): z.ZodObject<
  Properties<AddServiceInput>
> {
  return z.object({
    customValue: z.string().nullish(),
    description: z.string().nullish(),
    name: z.string().nullish(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    recurringDiscount: z.lazy(() => DiscountServiceInfoInputSchema().nullish()),
    recurringLastPaymentDate: z.string().datetime().nullish(),
    recurringNextBillingDate: z.string().datetime().nullish(),
    serviceId: z.string(),
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
    limit: z.number().nullish(),
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
    customValue: z.string().nullish(),
    description: z.string().nullish(),
    groupId: z.string(),
    name: z.string().nullish(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    recurringLastPaymentDate: z.string().datetime().nullish(),
    recurringNextBillingDate: z.string().datetime().nullish(),
    serviceId: z.string(),
    setupAmount: z.number().nullish(),
    setupBillingDate: z.string().datetime().nullish(),
    setupCurrency: z.string().nullish(),
    setupPaymentDate: z.string().datetime().nullish(),
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

export function DiscountInfoSchema(): z.ZodObject<Properties<DiscountInfo>> {
  return z.object({
    __typename: z.literal("DiscountInfo").optional(),
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
    originalAmount: z.number(),
    source: DiscountSourceSchema,
  });
}

export function DiscountInfoInitInputSchema(): z.ZodObject<
  Properties<DiscountInfoInitInput>
> {
  return z.object({
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
    originalAmount: z.number(),
    source: DiscountSourceSchema,
  });
}

export function DiscountServiceInfoInputSchema(): z.ZodObject<
  Properties<DiscountServiceInfoInput>
> {
  return z.object({
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
    originalAmount: z.number(),
    source: DiscountSourceSchema,
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

export function InitializeFacetSelectionInputSchema(): z.ZodObject<
  Properties<InitializeFacetSelectionInput>
> {
  return z.object({
    facetName: z.string(),
    id: z.string(),
    selectedOption: z.string(),
  });
}

export function InitializeMetricInputSchema(): z.ZodObject<
  Properties<InitializeMetricInput>
> {
  return z.object({
    currentUsage: z.number(),
    freeLimit: z.number().nullish(),
    id: z.string(),
    limit: z.number().nullish(),
    name: z.string(),
    paidLimit: z.number().nullish(),
    unitCostAmount: z.number().nullish(),
    unitCostBillingCycle: BillingCycleSchema.nullish(),
    unitCostCurrency: z.string().nullish(),
    unitName: z.string(),
    usageResetPeriod: ResetPeriodSchema.nullish(),
  });
}

export function InitializeServiceGroupInputSchema(): z.ZodObject<
  Properties<InitializeServiceGroupInput>
> {
  return z.object({
    costType: GroupCostTypeSchema.nullish(),
    id: z.string(),
    name: z.string(),
    optional: z.boolean(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    recurringDiscount: z.lazy(() => DiscountInfoInitInputSchema().nullish()),
    services: z.array(z.lazy(() => InitializeServiceInputSchema())).nullish(),
    setupAmount: z.number().nullish(),
    setupBillingDate: z.string().datetime().nullish(),
    setupCurrency: z.string().nullish(),
  });
}

export function InitializeServiceInputSchema(): z.ZodObject<
  Properties<InitializeServiceInput>
> {
  return z.object({
    customValue: z.string().nullish(),
    description: z.string().nullish(),
    facetSelections: z
      .array(z.lazy(() => InitializeFacetSelectionInputSchema()))
      .nullish(),
    id: z.string(),
    metrics: z.array(z.lazy(() => InitializeMetricInputSchema())).nullish(),
    name: z.string().nullish(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    recurringDiscount: z.lazy(() => DiscountInfoInitInputSchema().nullish()),
    setupAmount: z.number().nullish(),
    setupCurrency: z.string().nullish(),
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
    globalCurrency: z.string().nullish(),
    resourceId: z.string().nullish(),
    resourceLabel: z.string().nullish(),
    resourceThumbnailUrl: z.string().url().nullish(),
    selectedBillingCycle: BillingCycleSchema.nullish(),
    serviceGroups: z
      .array(z.lazy(() => InitializeServiceGroupInputSchema()))
      .nullish(),
    serviceOfferingId: z.string().nullish(),
    services: z.array(z.lazy(() => InitializeServiceInputSchema())).nullish(),
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
    pausedSince: z.string().datetime(),
  });
}

export function RecurringCostSchema(): z.ZodObject<Properties<RecurringCost>> {
  return z.object({
    __typename: z.literal("RecurringCost").optional(),
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    discount: z.lazy(() => DiscountInfoSchema().nullish()),
    lastPaymentDate: z.string().datetime().nullish(),
    nextBillingDate: z.string().datetime().nullish(),
  });
}

export function RemoveBudgetCategoryInputSchema(): z.ZodObject<
  Properties<RemoveBudgetCategoryInput>
> {
  return z.object({
    budgetId: z.string(),
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

export function ServiceSchema(): z.ZodObject<Properties<Service>> {
  return z.object({
    __typename: z.literal("Service").optional(),
    customValue: z.string().nullish(),
    description: z.string().nullish(),
    facetSelections: z.array(z.lazy(() => ServiceFacetSelectionSchema())),
    id: z.string(),
    metrics: z.array(z.lazy(() => ServiceMetricSchema())),
    name: z.string().nullish(),
    recurringCost: z.lazy(() => RecurringCostSchema().nullish()),
    setupCost: z.lazy(() => SetupCostSchema().nullish()),
  });
}

export function ServiceFacetSelectionSchema(): z.ZodObject<
  Properties<ServiceFacetSelection>
> {
  return z.object({
    __typename: z.literal("ServiceFacetSelection").optional(),
    facetName: z.string(),
    id: z.string(),
    selectedOption: z.string(),
  });
}

export function ServiceGroupSchema(): z.ZodObject<Properties<ServiceGroup>> {
  return z.object({
    __typename: z.literal("ServiceGroup").optional(),
    costType: GroupCostTypeSchema.nullish(),
    id: z.string(),
    name: z.string(),
    optional: z.boolean(),
    recurringCost: z.lazy(() => RecurringCostSchema().nullish()),
    services: z.array(z.lazy(() => ServiceSchema())),
    setupCost: z.lazy(() => SetupCostSchema().nullish()),
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

export function SetupCostSchema(): z.ZodObject<Properties<SetupCost>> {
  return z.object({
    __typename: z.literal("SetupCost").optional(),
    amount: z.number(),
    billingDate: z.string().datetime().nullish(),
    currency: z.string(),
    paymentDate: z.string().datetime().nullish(),
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
    createdAt: z.string().datetime().nullish(),
    customerEmail: z.string().email().nullish(),
    customerId: z.string().nullish(),
    customerName: z.string().nullish(),
    customerType: CustomerTypeSchema.nullish(),
    expiringSince: z.string().datetime().nullish(),
    globalCurrency: z.string().nullish(),
    nextBillingDate: z.string().datetime().nullish(),
    operatorId: z.string().nullish(),
    operatorNotes: z.string().nullish(),
    pausedSince: z.string().datetime().nullish(),
    projectedBillAmount: z.number().nullish(),
    projectedBillCurrency: z.string().nullish(),
    renewalDate: z.string().datetime().nullish(),
    resource: z.lazy(() => ResourceDocumentSchema().nullish()),
    selectedBillingCycle: BillingCycleSchema.nullish(),
    serviceGroups: z.array(z.lazy(() => ServiceGroupSchema())),
    serviceOfferingId: z.string().nullish(),
    services: z.array(z.lazy(() => ServiceSchema())),
    status: SubscriptionStatusSchema,
    teamMemberCount: z.number().nullish(),
    tierCurrency: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPrice: z.number().nullish(),
    tierPricingMode: TierPricingModeSchema.nullish(),
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
    limit: z.number().nullish(),
    metricId: z.string(),
    name: z.string().nullish(),
    nextUsageReset: z.string().datetime().nullish(),
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

export function UpdateServiceGroupCostInputSchema(): z.ZodObject<
  Properties<UpdateServiceGroupCostInput>
> {
  return z.object({
    groupId: z.string(),
    recurringAmount: z.number().nullish(),
    recurringBillingCycle: BillingCycleSchema.nullish(),
    recurringCurrency: z.string().nullish(),
    setupAmount: z.number().nullish(),
    setupBillingDate: z.string().datetime().nullish(),
    setupCurrency: z.string().nullish(),
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
    tierCurrency: z.string().nullish(),
    tierName: z.string().nullish(),
    tierPrice: z.number().nullish(),
    tierPricingMode: TierPricingModeSchema.nullish(),
    tierPricingOptionId: z.string().nullish(),
  });
}
