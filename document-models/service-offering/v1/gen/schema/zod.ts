import * as z from "zod";
import type {
  AddFacetOptionInput,
  AddOnPricingMode,
  AddOptionGroupInput,
  AddOptionGroupTierPricingInput,
  AddServiceInput,
  AddServiceLevelInput,
  AddTierInput,
  AddUsageLimitInput,
  BillingCycle,
  BillingCycleDiscount,
  BillingCycleDiscountInput,
  ChangeResourceTemplateInput,
  DeleteOptionGroupInput,
  DeleteServiceInput,
  DeleteTierInput,
  DiscountMode,
  DiscountType,
  FacetTarget,
  GroupCostType,
  OptionGroup,
  RemoveFacetOptionInput,
  RemoveFacetTargetInput,
  RemoveOptionGroupTierPricingInput,
  RemoveServiceLevelInput,
  RemoveUsageLimitInput,
  SelectResourceTemplateInput,
  Service,
  ServiceOfferingState,
  ServiceStatus,
  ServiceSubscriptionTier,
  SetAvailableBillingCyclesInput,
  SetFacetTargetInput,
  SetOfferingIdInput,
  SetOperatorInput,
  SetOptionGroupDiscountModeInput,
  SetOptionGroupStandalonePricingInput,
  SetTierBillingCycleDiscountsInput,
  SetTierDefaultBillingCycleInput,
  SetTierPricingModeInput,
  TierDependentPricing,
  TierPricing,
  TierPricingMode,
  TierServiceLevel,
  UpdateOfferingInfoInput,
  UpdateOfferingStatusInput,
  UpdateOptionGroupInput,
  UpdateOptionGroupTierPricingInput,
  UpdateServiceInput,
  UpdateServiceLevelInput,
  UpdateTierInput,
  UpdateTierPricingInput,
  UpdateUsageLimitInput,
  UsageLimit,
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
  "QUARTERLY",
  "SEMI_ANNUAL",
]);

export const DiscountModeSchema = z.enum(["INHERIT_TIER", "OWN_DISCOUNTS"]);

export const DiscountTypeSchema = z.enum(["FIXED_AMOUNT", "PERCENTAGE"]);

export const GroupCostTypeSchema = z.enum(["RECURRING", "SETUP"]);

export const ServiceStatusSchema = z.enum([
  "ACTIVE",
  "COMING_SOON",
  "DEPRECATED",
  "DRAFT",
]);

export const TierPricingModeSchema = z.enum(["CUSTOM", "FIXED", "PER_SEAT"]);

export function AddFacetOptionInputSchema(): z.ZodObject<
  Properties<AddFacetOptionInput>
> {
  return z.object({
    categoryKey: z.string(),
    lastModified: z.iso.datetime(),
    optionId: z.string(),
  });
}

export function AddOptionGroupInputSchema(): z.ZodObject<
  Properties<AddOptionGroupInput>
> {
  return z.object({
    defaultSelected: z.boolean(),
    description: z.string().nullish(),
    id: z.string(),
    isAddOn: z.boolean(),
    lastModified: z.iso.datetime(),
    name: z.string(),
  });
}

export function AddOptionGroupTierPricingInputSchema(): z.ZodObject<
  Properties<AddOptionGroupTierPricingInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    lastModified: z.iso.datetime(),
    optionGroupId: z.string(),
    tierId: z.string(),
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
    lastModified: z.iso.datetime(),
    optionGroupId: z.string().nullish(),
    title: z.string(),
  });
}

export function AddServiceLevelInputSchema(): z.ZodObject<
  Properties<AddServiceLevelInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    lastModified: z.iso.datetime(),
    level: z.string(),
    serviceId: z.string(),
    tierId: z.string(),
  });
}

export function AddTierInputSchema(): z.ZodObject<Properties<AddTierInput>> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    isCustomPricing: z.boolean().nullish(),
    lastModified: z.iso.datetime(),
    name: z.string(),
  });
}

export function AddUsageLimitInputSchema(): z.ZodObject<
  Properties<AddUsageLimitInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
    limit: z.number(),
    name: z.string(),
    tierId: z.string(),
    unit: z.string().nullish(),
  });
}

export function BillingCycleDiscountSchema(): z.ZodObject<
  Properties<BillingCycleDiscount>
> {
  return z.object({
    __typename: z.literal("BillingCycleDiscount").optional(),
    cycle: BillingCycleSchema,
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
  });
}

export function BillingCycleDiscountInputSchema(): z.ZodObject<
  Properties<BillingCycleDiscountInput>
> {
  return z.object({
    cycle: BillingCycleSchema,
    discountType: DiscountTypeSchema,
    discountValue: z.number(),
  });
}

export function ChangeResourceTemplateInputSchema(): z.ZodObject<
  Properties<ChangeResourceTemplateInput>
> {
  return z.object({
    lastModified: z.iso.datetime(),
    resourceTemplateId: z.string(),
  });
}

export function DeleteOptionGroupInputSchema(): z.ZodObject<
  Properties<DeleteOptionGroupInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
  });
}

export function DeleteServiceInputSchema(): z.ZodObject<
  Properties<DeleteServiceInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
  });
}

export function DeleteTierInputSchema(): z.ZodObject<
  Properties<DeleteTierInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
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

export function OptionGroupSchema(): z.ZodObject<Properties<OptionGroup>> {
  return z.object({
    __typename: z.literal("OptionGroup").optional(),
    availableBillingCycles: z.array(BillingCycleSchema),
    billingCycleDiscounts: z.array(z.lazy(() => BillingCycleDiscountSchema())),
    costType: GroupCostTypeSchema.nullish(),
    currency: z.string().nullish(),
    defaultSelected: z.boolean(),
    description: z.string().nullish(),
    discountMode: DiscountModeSchema.nullish(),
    id: z.string(),
    isAddOn: z.boolean(),
    name: z.string(),
    price: z.number().nullish(),
    pricingMode: AddOnPricingModeSchema,
    standalonePricing: z.lazy(() => TierPricingSchema().nullish()),
    tierDependentPricing: z.array(z.lazy(() => TierDependentPricingSchema())),
  });
}

export function RemoveFacetOptionInputSchema(): z.ZodObject<
  Properties<RemoveFacetOptionInput>
> {
  return z.object({
    categoryKey: z.string(),
    lastModified: z.iso.datetime(),
    optionId: z.string(),
  });
}

export function RemoveFacetTargetInputSchema(): z.ZodObject<
  Properties<RemoveFacetTargetInput>
> {
  return z.object({
    categoryKey: z.string(),
    lastModified: z.iso.datetime(),
  });
}

export function RemoveOptionGroupTierPricingInputSchema(): z.ZodObject<
  Properties<RemoveOptionGroupTierPricingInput>
> {
  return z.object({
    lastModified: z.iso.datetime(),
    optionGroupId: z.string(),
    tierId: z.string(),
  });
}

export function RemoveServiceLevelInputSchema(): z.ZodObject<
  Properties<RemoveServiceLevelInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
    tierId: z.string(),
  });
}

export function RemoveUsageLimitInputSchema(): z.ZodObject<
  Properties<RemoveUsageLimitInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
    tierId: z.string(),
  });
}

export function SelectResourceTemplateInputSchema(): z.ZodObject<
  Properties<SelectResourceTemplateInput>
> {
  return z.object({
    lastModified: z.iso.datetime(),
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
    title: z.string(),
  });
}

export function ServiceOfferingStateSchema(): z.ZodObject<
  Properties<ServiceOfferingState>
> {
  return z.object({
    __typename: z.literal("ServiceOfferingState").optional(),
    availableBillingCycles: z.array(BillingCycleSchema),
    description: z.string().nullish(),
    facetTargets: z.array(z.lazy(() => FacetTargetSchema())),
    id: z.string(),
    infoLink: z.url().nullish(),
    lastModified: z.iso.datetime(),
    operatorId: z.string(),
    optionGroups: z.array(z.lazy(() => OptionGroupSchema())),
    resourceTemplateId: z.string().nullish(),
    services: z.array(z.lazy(() => ServiceSchema())),
    status: ServiceStatusSchema,
    summary: z.string(),
    thumbnailUrl: z.url().nullish(),
    tiers: z.array(z.lazy(() => ServiceSubscriptionTierSchema())),
    title: z.string(),
  });
}

export function ServiceSubscriptionTierSchema(): z.ZodObject<
  Properties<ServiceSubscriptionTier>
> {
  return z.object({
    __typename: z.literal("ServiceSubscriptionTier").optional(),
    billingCycleDiscounts: z.array(z.lazy(() => BillingCycleDiscountSchema())),
    defaultBillingCycle: BillingCycleSchema.nullish(),
    description: z.string().nullish(),
    id: z.string(),
    isCustomPricing: z.boolean(),
    name: z.string(),
    pricing: z.lazy(() => TierPricingSchema().nullish()),
    pricingMode: TierPricingModeSchema,
    serviceLevels: z.array(z.lazy(() => TierServiceLevelSchema())),
    usageLimits: z.array(z.lazy(() => UsageLimitSchema())),
  });
}

export function SetAvailableBillingCyclesInputSchema(): z.ZodObject<
  Properties<SetAvailableBillingCyclesInput>
> {
  return z.object({
    billingCycles: z.array(BillingCycleSchema),
    lastModified: z.iso.datetime(),
  });
}

export function SetFacetTargetInputSchema(): z.ZodObject<
  Properties<SetFacetTargetInput>
> {
  return z.object({
    categoryKey: z.string(),
    categoryLabel: z.string(),
    id: z.string(),
    lastModified: z.iso.datetime(),
    selectedOptions: z.array(z.string()),
  });
}

export function SetOfferingIdInputSchema(): z.ZodObject<
  Properties<SetOfferingIdInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
  });
}

export function SetOperatorInputSchema(): z.ZodObject<
  Properties<SetOperatorInput>
> {
  return z.object({
    lastModified: z.iso.datetime(),
    operatorId: z.string(),
  });
}

export function SetOptionGroupDiscountModeInputSchema(): z.ZodObject<
  Properties<SetOptionGroupDiscountModeInput>
> {
  return z.object({
    discountMode: DiscountModeSchema,
    lastModified: z.iso.datetime(),
    optionGroupId: z.string(),
  });
}

export function SetOptionGroupStandalonePricingInputSchema(): z.ZodObject<
  Properties<SetOptionGroupStandalonePricingInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    lastModified: z.iso.datetime(),
    optionGroupId: z.string(),
  });
}

export function SetTierBillingCycleDiscountsInputSchema(): z.ZodObject<
  Properties<SetTierBillingCycleDiscountsInput>
> {
  return z.object({
    discounts: z.array(z.lazy(() => BillingCycleDiscountInputSchema())),
    lastModified: z.iso.datetime(),
    tierId: z.string(),
  });
}

export function SetTierDefaultBillingCycleInputSchema(): z.ZodObject<
  Properties<SetTierDefaultBillingCycleInput>
> {
  return z.object({
    defaultBillingCycle: BillingCycleSchema,
    lastModified: z.iso.datetime(),
    tierId: z.string(),
  });
}

export function SetTierPricingModeInputSchema(): z.ZodObject<
  Properties<SetTierPricingModeInput>
> {
  return z.object({
    lastModified: z.iso.datetime(),
    pricingMode: TierPricingModeSchema,
    tierId: z.string(),
  });
}

export function TierDependentPricingSchema(): z.ZodObject<
  Properties<TierDependentPricing>
> {
  return z.object({
    __typename: z.literal("TierDependentPricing").optional(),
    amount: z.number(),
    currency: z.string(),
    tierId: z.string(),
  });
}

export function TierPricingSchema(): z.ZodObject<Properties<TierPricing>> {
  return z.object({
    __typename: z.literal("TierPricing").optional(),
    amount: z.number(),
    currency: z.string(),
  });
}

export function TierServiceLevelSchema(): z.ZodObject<
  Properties<TierServiceLevel>
> {
  return z.object({
    __typename: z.literal("TierServiceLevel").optional(),
    description: z.string().nullish(),
    id: z.string(),
    level: z.string(),
    serviceId: z.string(),
  });
}

export function UpdateOfferingInfoInputSchema(): z.ZodObject<
  Properties<UpdateOfferingInfoInput>
> {
  return z.object({
    description: z.string().nullish(),
    infoLink: z.url().nullish(),
    lastModified: z.iso.datetime(),
    summary: z.string().nullish(),
    thumbnailUrl: z.url().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateOfferingStatusInputSchema(): z.ZodObject<
  Properties<UpdateOfferingStatusInput>
> {
  return z.object({
    lastModified: z.iso.datetime(),
    status: ServiceStatusSchema,
  });
}

export function UpdateOptionGroupInputSchema(): z.ZodObject<
  Properties<UpdateOptionGroupInput>
> {
  return z.object({
    defaultSelected: z.boolean().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    isAddOn: z.boolean().nullish(),
    lastModified: z.iso.datetime(),
    name: z.string().nullish(),
  });
}

export function UpdateOptionGroupTierPricingInputSchema(): z.ZodObject<
  Properties<UpdateOptionGroupTierPricingInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    lastModified: z.iso.datetime(),
    optionGroupId: z.string(),
    tierId: z.string(),
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
    lastModified: z.iso.datetime(),
    optionGroupId: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateServiceLevelInputSchema(): z.ZodObject<
  Properties<UpdateServiceLevelInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    lastModified: z.iso.datetime(),
    level: z.string().nullish(),
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
    lastModified: z.iso.datetime(),
    name: z.string().nullish(),
  });
}

export function UpdateTierPricingInputSchema(): z.ZodObject<
  Properties<UpdateTierPricingInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    lastModified: z.iso.datetime(),
    tierId: z.string(),
  });
}

export function UpdateUsageLimitInputSchema(): z.ZodObject<
  Properties<UpdateUsageLimitInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.iso.datetime(),
    limit: z.number().nullish(),
    name: z.string().nullish(),
    tierId: z.string(),
    unit: z.string().nullish(),
  });
}

export function UsageLimitSchema(): z.ZodObject<Properties<UsageLimit>> {
  return z.object({
    __typename: z.literal("UsageLimit").optional(),
    id: z.string(),
    limit: z.number(),
    name: z.string(),
    unit: z.string().nullish(),
  });
}
