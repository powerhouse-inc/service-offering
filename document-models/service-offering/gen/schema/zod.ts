import * as z from "zod";
import type {
  AddFacetBindingInput,
  AddFacetOptionInput,
  AddOnPricingMode,
  AddOptionGroupInput,
  AddOptionGroupTierPricingInput,
  AddRecurringPriceOptionInput,
  AddServiceGroupInput,
  AddServiceGroupTierPricingInput,
  AddServiceInput,
  AddServiceLevelInput,
  AddTargetAudienceInput,
  AddTierInput,
  AddUsageLimitInput,
  BillingCycle,
  BillingCycleDiscount,
  BillingCycleDiscountInput,
  ChangeResourceTemplateInput,
  ClearFinalConfigurationInput,
  DeleteOptionGroupInput,
  DeleteServiceGroupInput,
  DeleteServiceInput,
  DeleteTierInput,
  DiscountRule,
  DiscountRuleInput,
  DiscountType,
  FacetBindingInput,
  FacetTarget,
  FinalAddOnConfig,
  FinalAddOnConfigInput,
  FinalConfiguration,
  FinalOptionGroupConfig,
  FinalOptionGroupConfigInput,
  GroupCostType,
  OptionGroup,
  OptionGroupTierPricing,
  RecurringPriceOption,
  RecurringPriceOptionInput,
  RemoveFacetBindingInput,
  RemoveFacetOptionInput,
  RemoveFacetTargetInput,
  RemoveOptionGroupTierPricingInput,
  RemoveRecurringPriceOptionInput,
  RemoveServiceGroupSetupCostInput,
  RemoveServiceGroupTierPricingInput,
  RemoveServiceLevelInput,
  RemoveTargetAudienceInput,
  RemoveUsageLimitInput,
  ReorderServiceGroupsInput,
  ResolvedDiscount,
  ResolvedDiscountInput,
  ResourceFacetBinding,
  SelectResourceTemplateInput,
  Service,
  ServiceGroup,
  ServiceGroupTierPricing,
  ServiceLevel,
  ServiceLevelBinding,
  ServiceOfferingState,
  ServicePricing,
  ServiceStatus,
  ServiceSubscriptionTier,
  ServiceUsageLimit,
  SetAvailableBillingCyclesInput,
  SetFacetBindingsInput,
  SetFacetTargetInput,
  SetFinalConfigurationInput,
  SetOfferingIdInput,
  SetOperatorInput,
  SetOptionGroupStandalonePricingInput,
  SetServiceGroupSetupCostInput,
  SetTierPricingModeInput,
  SetupCost,
  SetupCostInput,
  SetupCostPerCycle,
  StandalonePricing,
  TargetAudience,
  TierPricingMode,
  UpdateOfferingInfoInput,
  UpdateOfferingStatusInput,
  UpdateOptionGroupInput,
  UpdateOptionGroupTierPricingInput,
  UpdateRecurringPriceOptionInput,
  UpdateServiceGroupInput,
  UpdateServiceInput,
  UpdateServiceLevelInput,
  UpdateTierInput,
  UpdateTierPricingInput,
  UpdateUsageLimitInput,
  UsageResetCycle,
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

export const AddOnPricingModeSchema = z.enum(["STANDALONE", "TIER_DEPENDENT"]);

export const BillingCycleSchema = z.enum([
  "ANNUAL",
  "MONTHLY",
  "ONE_TIME",
  "QUARTERLY",
  "SEMI_ANNUAL",
]);

export const DiscountTypeSchema = z.enum(["FLAT_AMOUNT", "PERCENTAGE"]);

export const GroupCostTypeSchema = z.enum(["RECURRING", "SETUP"]);

export const ServiceLevelSchema = z.enum([
  "CUSTOM",
  "INCLUDED",
  "NOT_APPLICABLE",
  "NOT_INCLUDED",
  "OPTIONAL",
  "VARIABLE",
]);

export const ServiceStatusSchema = z.enum([
  "ACTIVE",
  "COMING_SOON",
  "DEPRECATED",
  "DRAFT",
]);

export const TierPricingModeSchema = z.enum(["CALCULATED", "MANUAL_OVERRIDE"]);

export const UsageResetCycleSchema = z.enum([
  "ANNUAL",
  "DAILY",
  "HOURLY",
  "MONTHLY",
  "NONE",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "WEEKLY",
]);

export function AddFacetBindingInputSchema(): z.ZodObject<
  Properties<AddFacetBindingInput>
> {
  return z.object({
    bindingId: z.string(),
    facetName: z.string(),
    facetType: z.string(),
    lastModified: z.string().datetime(),
    serviceId: z.string(),
    supportedOptions: z.array(z.string()),
  });
}

export function AddFacetOptionInputSchema(): z.ZodObject<
  Properties<AddFacetOptionInput>
> {
  return z.object({
    categoryKey: z.string(),
    lastModified: z.string().datetime(),
    optionId: z.string(),
  });
}

export function AddOptionGroupInputSchema(): z.ZodObject<
  Properties<AddOptionGroupInput>
> {
  return z.object({
    availableBillingCycles: z.array(BillingCycleSchema).nullish(),
    costType: GroupCostTypeSchema.nullish(),
    currency: z.string().nullish(),
    defaultSelected: z.boolean(),
    description: z.string().nullish(),
    id: z.string(),
    isAddOn: z.boolean(),
    lastModified: z.string().datetime(),
    name: z.string(),
    price: z.number().nullish(),
  });
}

export function AddOptionGroupTierPricingInputSchema(): z.ZodObject<
  Properties<AddOptionGroupTierPricingInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    optionGroupId: z.string(),
    recurringPricing: z.array(z.lazy(() => RecurringPriceOptionInputSchema())),
    setupCost: z.lazy(() => SetupCostInputSchema().nullish()),
    setupCostDiscounts: z
      .array(z.lazy(() => BillingCycleDiscountInputSchema()))
      .nullish(),
    tierId: z.string(),
    tierPricingId: z.string(),
  });
}

export function AddRecurringPriceOptionInputSchema(): z.ZodObject<
  Properties<AddRecurringPriceOptionInput>
> {
  return z.object({
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    lastModified: z.string().datetime(),
    priceOptionId: z.string(),
    serviceGroupId: z.string(),
    tierId: z.string(),
  });
}

export function AddServiceGroupInputSchema(): z.ZodObject<
  Properties<AddServiceGroupInput>
> {
  return z.object({
    billingCycle: BillingCycleSchema,
    description: z.string().nullish(),
    displayOrder: z.number().nullish(),
    id: z.string(),
    lastModified: z.string().datetime(),
    name: z.string(),
  });
}

export function AddServiceGroupTierPricingInputSchema(): z.ZodObject<
  Properties<AddServiceGroupTierPricingInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    serviceGroupId: z.string(),
    tierId: z.string(),
    tierPricingId: z.string(),
  });
}

export function AddServiceInputSchema(): z.ZodObject<
  Properties<AddServiceInput>
> {
  return z.object({
    description: z.string().nullish(),
    displayOrder: z.number().nullish(),
    id: z.string(),
    isSetupFormation: z.boolean().nullish(),
    lastModified: z.string().datetime(),
    optionGroupId: z.string().nullish(),
    serviceGroupId: z.string().nullish(),
    title: z.string(),
  });
}

export function AddServiceLevelInputSchema(): z.ZodObject<
  Properties<AddServiceLevelInput>
> {
  return z.object({
    customValue: z.string().nullish(),
    lastModified: z.string().datetime(),
    level: ServiceLevelSchema,
    optionGroupId: z.string().nullish(),
    serviceId: z.string(),
    serviceLevelId: z.string(),
    tierId: z.string(),
  });
}

export function AddTargetAudienceInputSchema(): z.ZodObject<
  Properties<AddTargetAudienceInput>
> {
  return z.object({
    color: z.string().nullish(),
    id: z.string(),
    label: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function AddTierInputSchema(): z.ZodObject<Properties<AddTierInput>> {
  return z.object({
    amount: z.number().nullish(),
    currency: z.string(),
    description: z.string().nullish(),
    id: z.string(),
    isCustomPricing: z.boolean().nullish(),
    lastModified: z.string().datetime(),
    name: z.string(),
  });
}

export function AddUsageLimitInputSchema(): z.ZodObject<
  Properties<AddUsageLimitInput>
> {
  return z.object({
    freeLimit: z.number().nullish(),
    lastModified: z.string().datetime(),
    limitId: z.string(),
    metric: z.string(),
    notes: z.string().nullish(),
    paidLimit: z.number().nullish(),
    resetCycle: UsageResetCycleSchema.nullish(),
    serviceId: z.string(),
    tierId: z.string(),
    unitName: z.string().nullish(),
    unitPrice: z.number().nullish(),
    unitPriceCurrency: z.string().nullish(),
  });
}

export function BillingCycleDiscountSchema(): z.ZodObject<
  Properties<BillingCycleDiscount>
> {
  return z.object({
    __typename: z.literal("BillingCycleDiscount").optional(),
    billingCycle: BillingCycleSchema,
    discountRule: z.lazy(() => DiscountRuleSchema()),
  });
}

export function BillingCycleDiscountInputSchema(): z.ZodObject<
  Properties<BillingCycleDiscountInput>
> {
  return z.object({
    billingCycle: BillingCycleSchema,
    discountRule: z.lazy(() => DiscountRuleInputSchema()),
  });
}

export function ChangeResourceTemplateInputSchema(): z.ZodObject<
  Properties<ChangeResourceTemplateInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    newTemplateId: z.string(),
    previousTemplateId: z.string(),
  });
}

export function ClearFinalConfigurationInputSchema(): z.ZodObject<
  Properties<ClearFinalConfigurationInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
  });
}

export function DeleteOptionGroupInputSchema(): z.ZodObject<
  Properties<DeleteOptionGroupInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function DeleteServiceGroupInputSchema(): z.ZodObject<
  Properties<DeleteServiceGroupInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function DeleteServiceInputSchema(): z.ZodObject<
  Properties<DeleteServiceInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function DeleteTierInputSchema(): z.ZodObject<
  Properties<DeleteTierInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function DiscountRuleSchema(): z.ZodObject<Properties<DiscountRule>> {
  return z.object({
    __typename: z.literal("DiscountRule").optional(),
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
  });
}

export function DiscountRuleInputSchema(): z.ZodObject<
  Properties<DiscountRuleInput>
> {
  return z.object({
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
  });
}

export function FacetBindingInputSchema(): z.ZodObject<
  Properties<FacetBindingInput>
> {
  return z.object({
    facetName: z.string(),
    facetType: z.string(),
    id: z.string(),
    supportedOptions: z.array(z.string()),
  });
}

export function FacetTargetSchema(): z.ZodObject<Properties<FacetTarget>> {
  return z.object({
    __typename: z.literal("FacetTarget").optional(),
    categoryKey: z.string(),
    categoryLabel: z.string(),
    id: z.string(),
    selectedOptions: z.array(z.string()),
  });
}

export function FinalAddOnConfigSchema(): z.ZodObject<
  Properties<FinalAddOnConfig>
> {
  return z.object({
    __typename: z.literal("FinalAddOnConfig").optional(),
    currency: z.string().nullish(),
    discount: z.lazy(() => ResolvedDiscountSchema().nullish()),
    id: z.string(),
    optionGroupId: z.string(),
    recurringAmount: z.number().nullish(),
    selectedBillingCycle: BillingCycleSchema,
    setupCost: z.number().nullish(),
    setupCostCurrency: z.string().nullish(),
    setupCostDiscount: z.lazy(() => ResolvedDiscountSchema().nullish()),
  });
}

export function FinalAddOnConfigInputSchema(): z.ZodObject<
  Properties<FinalAddOnConfigInput>
> {
  return z.object({
    currency: z.string().nullish(),
    discount: z.lazy(() => ResolvedDiscountInputSchema().nullish()),
    id: z.string(),
    optionGroupId: z.string(),
    recurringAmount: z.number().nullish(),
    selectedBillingCycle: BillingCycleSchema,
    setupCost: z.number().nullish(),
    setupCostCurrency: z.string().nullish(),
    setupCostDiscount: z.lazy(() => ResolvedDiscountInputSchema().nullish()),
  });
}

export function FinalConfigurationSchema(): z.ZodObject<
  Properties<FinalConfiguration>
> {
  return z.object({
    __typename: z.literal("FinalConfiguration").optional(),
    addOnConfigs: z.array(z.lazy(() => FinalAddOnConfigSchema())),
    lastModified: z.string().datetime(),
    optionGroupConfigs: z.array(z.lazy(() => FinalOptionGroupConfigSchema())),
    selectedBillingCycle: BillingCycleSchema,
    selectedTierId: z.string(),
    tierBasePrice: z.number().nullish(),
    tierCurrency: z.string(),
  });
}

export function FinalOptionGroupConfigSchema(): z.ZodObject<
  Properties<FinalOptionGroupConfig>
> {
  return z.object({
    __typename: z.literal("FinalOptionGroupConfig").optional(),
    billingCycleOverridden: z.boolean(),
    currency: z.string().nullish(),
    discount: z.lazy(() => ResolvedDiscountSchema().nullish()),
    discountStripped: z.boolean(),
    effectiveBillingCycle: BillingCycleSchema,
    id: z.string(),
    optionGroupId: z.string(),
    recurringAmount: z.number().nullish(),
    setupCost: z.number().nullish(),
    setupCostCurrency: z.string().nullish(),
    setupCostDiscount: z.lazy(() => ResolvedDiscountSchema().nullish()),
  });
}

export function FinalOptionGroupConfigInputSchema(): z.ZodObject<
  Properties<FinalOptionGroupConfigInput>
> {
  return z.object({
    billingCycleOverridden: z.boolean(),
    currency: z.string().nullish(),
    discount: z.lazy(() => ResolvedDiscountInputSchema().nullish()),
    discountStripped: z.boolean(),
    effectiveBillingCycle: BillingCycleSchema,
    id: z.string(),
    optionGroupId: z.string(),
    recurringAmount: z.number().nullish(),
    setupCost: z.number().nullish(),
    setupCostCurrency: z.string().nullish(),
    setupCostDiscount: z.lazy(() => ResolvedDiscountInputSchema().nullish()),
  });
}

export function OptionGroupSchema(): z.ZodObject<Properties<OptionGroup>> {
  return z.object({
    __typename: z.literal("OptionGroup").optional(),
    availableBillingCycles: z.array(BillingCycleSchema),
    billingCycleDiscounts: z.array(z.lazy(() => BillingCycleDiscountSchema())),
    costType: GroupCostTypeSchema.nullish(),
    currency: z.string().nullish(),
    defaultSelected: z.boolean(),
    description: z.string().nullish(),
    id: z.string(),
    isAddOn: z.boolean(),
    name: z.string(),
    price: z.number().nullish(),
    pricingMode: AddOnPricingModeSchema.nullish(),
    standalonePricing: z.lazy(() => StandalonePricingSchema().nullish()),
    tierDependentPricing: z
      .array(z.lazy(() => OptionGroupTierPricingSchema()))
      .nullish(),
  });
}

export function OptionGroupTierPricingSchema(): z.ZodObject<
  Properties<OptionGroupTierPricing>
> {
  return z.object({
    __typename: z.literal("OptionGroupTierPricing").optional(),
    id: z.string(),
    recurringPricing: z.array(z.lazy(() => RecurringPriceOptionSchema())),
    setupCost: z.lazy(() => SetupCostSchema().nullish()),
    setupCostDiscounts: z.array(z.lazy(() => BillingCycleDiscountSchema())),
    tierId: z.string(),
  });
}

export function RecurringPriceOptionSchema(): z.ZodObject<
  Properties<RecurringPriceOption>
> {
  return z.object({
    __typename: z.literal("RecurringPriceOption").optional(),
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    discount: z.lazy(() => DiscountRuleSchema().nullish()),
    id: z.string(),
  });
}

export function RecurringPriceOptionInputSchema(): z.ZodObject<
  Properties<RecurringPriceOptionInput>
> {
  return z.object({
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    discount: z.lazy(() => DiscountRuleInputSchema().nullish()),
    id: z.string(),
  });
}

export function RemoveFacetBindingInputSchema(): z.ZodObject<
  Properties<RemoveFacetBindingInput>
> {
  return z.object({
    bindingId: z.string(),
    lastModified: z.string().datetime(),
    serviceId: z.string(),
  });
}

export function RemoveFacetOptionInputSchema(): z.ZodObject<
  Properties<RemoveFacetOptionInput>
> {
  return z.object({
    categoryKey: z.string(),
    lastModified: z.string().datetime(),
    optionId: z.string(),
  });
}

export function RemoveFacetTargetInputSchema(): z.ZodObject<
  Properties<RemoveFacetTargetInput>
> {
  return z.object({
    categoryKey: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function RemoveOptionGroupTierPricingInputSchema(): z.ZodObject<
  Properties<RemoveOptionGroupTierPricingInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    optionGroupId: z.string(),
    tierId: z.string(),
  });
}

export function RemoveRecurringPriceOptionInputSchema(): z.ZodObject<
  Properties<RemoveRecurringPriceOptionInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    priceOptionId: z.string(),
    serviceGroupId: z.string(),
    tierId: z.string(),
  });
}

export function RemoveServiceGroupSetupCostInputSchema(): z.ZodObject<
  Properties<RemoveServiceGroupSetupCostInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    serviceGroupId: z.string(),
    tierId: z.string(),
  });
}

export function RemoveServiceGroupTierPricingInputSchema(): z.ZodObject<
  Properties<RemoveServiceGroupTierPricingInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    serviceGroupId: z.string(),
    tierId: z.string(),
  });
}

export function RemoveServiceLevelInputSchema(): z.ZodObject<
  Properties<RemoveServiceLevelInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    serviceLevelId: z.string(),
    tierId: z.string(),
  });
}

export function RemoveTargetAudienceInputSchema(): z.ZodObject<
  Properties<RemoveTargetAudienceInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function RemoveUsageLimitInputSchema(): z.ZodObject<
  Properties<RemoveUsageLimitInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    limitId: z.string(),
    tierId: z.string(),
  });
}

export function ReorderServiceGroupsInputSchema(): z.ZodObject<
  Properties<ReorderServiceGroupsInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    order: z.array(z.string()),
  });
}

export function ResolvedDiscountSchema(): z.ZodObject<
  Properties<ResolvedDiscount>
> {
  return z.object({
    __typename: z.literal("ResolvedDiscount").optional(),
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
    discountedAmount: z.number(),
    originalAmount: z.number(),
  });
}

export function ResolvedDiscountInputSchema(): z.ZodObject<
  Properties<ResolvedDiscountInput>
> {
  return z.object({
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
    discountedAmount: z.number(),
    originalAmount: z.number(),
  });
}

export function ResourceFacetBindingSchema(): z.ZodObject<
  Properties<ResourceFacetBinding>
> {
  return z.object({
    __typename: z.literal("ResourceFacetBinding").optional(),
    facetName: z.string(),
    facetType: z.string(),
    id: z.string(),
    supportedOptions: z.array(z.string()),
  });
}

export function SelectResourceTemplateInputSchema(): z.ZodObject<
  Properties<SelectResourceTemplateInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    resourceTemplateId: z.string(),
  });
}

export function ServiceSchema(): z.ZodObject<Properties<Service>> {
  return z.object({
    __typename: z.literal("Service").optional(),
    description: z.string().nullish(),
    displayOrder: z.number().nullish(),
    id: z.string(),
    isSetupFormation: z.boolean(),
    optionGroupId: z.string().nullish(),
    serviceGroupId: z.string().nullish(),
    title: z.string(),
  });
}

export function ServiceGroupSchema(): z.ZodObject<Properties<ServiceGroup>> {
  return z.object({
    __typename: z.literal("ServiceGroup").optional(),
    billingCycle: BillingCycleSchema,
    description: z.string().nullish(),
    displayOrder: z.number().nullish(),
    id: z.string(),
    name: z.string(),
    tierPricing: z.array(z.lazy(() => ServiceGroupTierPricingSchema())),
  });
}

export function ServiceGroupTierPricingSchema(): z.ZodObject<
  Properties<ServiceGroupTierPricing>
> {
  return z.object({
    __typename: z.literal("ServiceGroupTierPricing").optional(),
    id: z.string(),
    recurringPricing: z.array(z.lazy(() => RecurringPriceOptionSchema())),
    setupCostsPerCycle: z.array(z.lazy(() => SetupCostPerCycleSchema())),
    tierId: z.string(),
  });
}

export function ServiceLevelBindingSchema(): z.ZodObject<
  Properties<ServiceLevelBinding>
> {
  return z.object({
    __typename: z.literal("ServiceLevelBinding").optional(),
    customValue: z.string().nullish(),
    id: z.string(),
    level: ServiceLevelSchema,
    optionGroupId: z.string().nullish(),
    serviceId: z.string(),
  });
}

export function ServiceOfferingStateSchema(): z.ZodObject<
  Properties<ServiceOfferingState>
> {
  return z.object({
    __typename: z.literal("ServiceOfferingState").optional(),
    availableBillingCycles: z.array(BillingCycleSchema),
    description: z.string().nullish(),
    facetBindings: z.array(z.lazy(() => ResourceFacetBindingSchema())),
    facetTargets: z.array(z.lazy(() => FacetTargetSchema())),
    finalConfiguration: z.lazy(() => FinalConfigurationSchema().nullish()),
    id: z.string(),
    infoLink: z.string().url().nullish(),
    lastModified: z.string().datetime(),
    operatorId: z.string(),
    optionGroups: z.array(z.lazy(() => OptionGroupSchema())),
    resourceTemplateId: z.string().nullish(),
    serviceGroups: z.array(z.lazy(() => ServiceGroupSchema())),
    services: z.array(z.lazy(() => ServiceSchema())),
    status: ServiceStatusSchema,
    summary: z.string(),
    targetAudiences: z.array(z.lazy(() => TargetAudienceSchema())),
    thumbnailUrl: z.string().url().nullish(),
    tiers: z.array(z.lazy(() => ServiceSubscriptionTierSchema())),
    title: z.string(),
  });
}

export function ServicePricingSchema(): z.ZodObject<
  Properties<ServicePricing>
> {
  return z.object({
    __typename: z.literal("ServicePricing").optional(),
    amount: z.number().nullish(),
    currency: z.string(),
  });
}

export function ServiceSubscriptionTierSchema(): z.ZodObject<
  Properties<ServiceSubscriptionTier>
> {
  return z.object({
    __typename: z.literal("ServiceSubscriptionTier").optional(),
    description: z.string().nullish(),
    id: z.string(),
    isCustomPricing: z.boolean(),
    name: z.string(),
    pricing: z.lazy(() => ServicePricingSchema()),
    pricingMode: TierPricingModeSchema.nullish(),
    serviceLevels: z.array(z.lazy(() => ServiceLevelBindingSchema())),
    usageLimits: z.array(z.lazy(() => ServiceUsageLimitSchema())),
  });
}

export function ServiceUsageLimitSchema(): z.ZodObject<
  Properties<ServiceUsageLimit>
> {
  return z.object({
    __typename: z.literal("ServiceUsageLimit").optional(),
    freeLimit: z.number().nullish(),
    id: z.string(),
    metric: z.string(),
    notes: z.string().nullish(),
    paidLimit: z.number().nullish(),
    resetCycle: UsageResetCycleSchema.nullish(),
    serviceId: z.string(),
    unitName: z.string().nullish(),
    unitPrice: z.number().nullish(),
    unitPriceCurrency: z.string().nullish(),
  });
}

export function SetAvailableBillingCyclesInputSchema(): z.ZodObject<
  Properties<SetAvailableBillingCyclesInput>
> {
  return z.object({
    billingCycles: z.array(BillingCycleSchema),
    lastModified: z.string().datetime(),
  });
}

export function SetFacetBindingsInputSchema(): z.ZodObject<
  Properties<SetFacetBindingsInput>
> {
  return z.object({
    facetBindings: z.array(z.lazy(() => FacetBindingInputSchema())),
    lastModified: z.string().datetime(),
  });
}

export function SetFacetTargetInputSchema(): z.ZodObject<
  Properties<SetFacetTargetInput>
> {
  return z.object({
    categoryKey: z.string(),
    categoryLabel: z.string(),
    id: z.string(),
    lastModified: z.string().datetime(),
    selectedOptions: z.array(z.string()),
  });
}

export function SetFinalConfigurationInputSchema(): z.ZodObject<
  Properties<SetFinalConfigurationInput>
> {
  return z.object({
    addOnConfigs: z.array(z.lazy(() => FinalAddOnConfigInputSchema())),
    lastModified: z.string().datetime(),
    optionGroupConfigs: z.array(
      z.lazy(() => FinalOptionGroupConfigInputSchema()),
    ),
    selectedBillingCycle: BillingCycleSchema,
    selectedTierId: z.string(),
    tierBasePrice: z.number().nullish(),
    tierCurrency: z.string(),
  });
}

export function SetOfferingIdInputSchema(): z.ZodObject<
  Properties<SetOfferingIdInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function SetOperatorInputSchema(): z.ZodObject<
  Properties<SetOperatorInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    operatorId: z.string(),
  });
}

export function SetOptionGroupStandalonePricingInputSchema(): z.ZodObject<
  Properties<SetOptionGroupStandalonePricingInput>
> {
  return z.object({
    billingCycleDiscounts: z
      .array(z.lazy(() => BillingCycleDiscountInputSchema()))
      .nullish(),
    lastModified: z.string().datetime(),
    optionGroupId: z.string(),
    recurringPricing: z.array(z.lazy(() => RecurringPriceOptionInputSchema())),
    setupCost: z.lazy(() => SetupCostInputSchema().nullish()),
  });
}

export function SetServiceGroupSetupCostInputSchema(): z.ZodObject<
  Properties<SetServiceGroupSetupCostInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    discountType: DiscountTypeSchema.nullish(),
    discountValue: z.number().nullish(),
    lastModified: z.string().datetime(),
    serviceGroupId: z.string(),
    tierId: z.string(),
  });
}

export function SetTierPricingModeInputSchema(): z.ZodObject<
  Properties<SetTierPricingModeInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    pricingMode: TierPricingModeSchema,
    tierId: z.string(),
  });
}

export function SetupCostSchema(): z.ZodObject<Properties<SetupCost>> {
  return z.object({
    __typename: z.literal("SetupCost").optional(),
    amount: z.number(),
    currency: z.string(),
    discount: z.lazy(() => DiscountRuleSchema().nullish()),
  });
}

export function SetupCostInputSchema(): z.ZodObject<
  Properties<SetupCostInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    discount: z.lazy(() => DiscountRuleInputSchema().nullish()),
  });
}

export function SetupCostPerCycleSchema(): z.ZodObject<
  Properties<SetupCostPerCycle>
> {
  return z.object({
    __typename: z.literal("SetupCostPerCycle").optional(),
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    discount: z.lazy(() => DiscountRuleSchema().nullish()),
    id: z.string(),
  });
}

export function StandalonePricingSchema(): z.ZodObject<
  Properties<StandalonePricing>
> {
  return z.object({
    __typename: z.literal("StandalonePricing").optional(),
    recurringPricing: z.array(z.lazy(() => RecurringPriceOptionSchema())),
    setupCost: z.lazy(() => SetupCostSchema().nullish()),
  });
}

export function TargetAudienceSchema(): z.ZodObject<
  Properties<TargetAudience>
> {
  return z.object({
    __typename: z.literal("TargetAudience").optional(),
    color: z.string().nullish(),
    id: z.string(),
    label: z.string(),
  });
}

export function UpdateOfferingInfoInputSchema(): z.ZodObject<
  Properties<UpdateOfferingInfoInput>
> {
  return z.object({
    description: z.string().nullish(),
    infoLink: z.string().url().nullish(),
    lastModified: z.string().datetime(),
    summary: z.string().nullish(),
    thumbnailUrl: z.string().url().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateOfferingStatusInputSchema(): z.ZodObject<
  Properties<UpdateOfferingStatusInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    status: ServiceStatusSchema,
  });
}

export function UpdateOptionGroupInputSchema(): z.ZodObject<
  Properties<UpdateOptionGroupInput>
> {
  return z.object({
    availableBillingCycles: z.array(BillingCycleSchema).nullish(),
    costType: GroupCostTypeSchema.nullish(),
    currency: z.string().nullish(),
    defaultSelected: z.boolean().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    isAddOn: z.boolean().nullish(),
    lastModified: z.string().datetime(),
    name: z.string().nullish(),
    price: z.number().nullish(),
  });
}

export function UpdateOptionGroupTierPricingInputSchema(): z.ZodObject<
  Properties<UpdateOptionGroupTierPricingInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    optionGroupId: z.string(),
    recurringPricing: z
      .array(z.lazy(() => RecurringPriceOptionInputSchema()))
      .nullish(),
    setupCost: z.lazy(() => SetupCostInputSchema().nullish()),
    setupCostDiscounts: z
      .array(z.lazy(() => BillingCycleDiscountInputSchema()))
      .nullish(),
    tierId: z.string(),
  });
}

export function UpdateRecurringPriceOptionInputSchema(): z.ZodObject<
  Properties<UpdateRecurringPriceOptionInput>
> {
  return z.object({
    amount: z.number().nullish(),
    billingCycle: BillingCycleSchema.nullish(),
    currency: z.string().nullish(),
    discount: z.lazy(() => DiscountRuleInputSchema().nullish()),
    lastModified: z.string().datetime(),
    priceOptionId: z.string(),
    serviceGroupId: z.string(),
    tierId: z.string(),
  });
}

export function UpdateServiceGroupInputSchema(): z.ZodObject<
  Properties<UpdateServiceGroupInput>
> {
  return z.object({
    billingCycle: BillingCycleSchema.nullish(),
    description: z.string().nullish(),
    displayOrder: z.number().nullish(),
    id: z.string(),
    lastModified: z.string().datetime(),
    name: z.string().nullish(),
  });
}

export function UpdateServiceInputSchema(): z.ZodObject<
  Properties<UpdateServiceInput>
> {
  return z.object({
    description: z.string().nullish(),
    displayOrder: z.number().nullish(),
    id: z.string(),
    isSetupFormation: z.boolean().nullish(),
    lastModified: z.string().datetime(),
    optionGroupId: z.string().nullish(),
    serviceGroupId: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateServiceLevelInputSchema(): z.ZodObject<
  Properties<UpdateServiceLevelInput>
> {
  return z.object({
    customValue: z.string().nullish(),
    lastModified: z.string().datetime(),
    level: ServiceLevelSchema.nullish(),
    optionGroupId: z.string().nullish(),
    serviceLevelId: z.string(),
    tierId: z.string(),
  });
}

export function UpdateTierInputSchema(): z.ZodObject<
  Properties<UpdateTierInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    isCustomPricing: z.boolean().nullish(),
    lastModified: z.string().datetime(),
    name: z.string().nullish(),
  });
}

export function UpdateTierPricingInputSchema(): z.ZodObject<
  Properties<UpdateTierPricingInput>
> {
  return z.object({
    amount: z.number().nullish(),
    currency: z.string().nullish(),
    lastModified: z.string().datetime(),
    tierId: z.string(),
  });
}

export function UpdateUsageLimitInputSchema(): z.ZodObject<
  Properties<UpdateUsageLimitInput>
> {
  return z.object({
    freeLimit: z.number().nullish(),
    lastModified: z.string().datetime(),
    limitId: z.string(),
    metric: z.string().nullish(),
    notes: z.string().nullish(),
    paidLimit: z.number().nullish(),
    resetCycle: UsageResetCycleSchema.nullish(),
    tierId: z.string(),
    unitName: z.string().nullish(),
    unitPrice: z.number().nullish(),
    unitPriceCurrency: z.string().nullish(),
  });
}
