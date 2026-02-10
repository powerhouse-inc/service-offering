import * as z from "zod";
import type {
  ActivateSubscriptionInput,
  AddAddonInput,
  CancelSubscriptionInput,
  ChangeTierInput,
  ExpireSubscriptionInput,
  FacetSelection,
  InitializeSubscriptionInput,
  RemoveAddonInput,
  RemoveFacetSelectionInput,
  SelectedAddon,
  ServiceSubscriptionState,
  SetCachedSnippetsInput,
  SetFacetSelectionInput,
  SetPricingInput,
  SubscriptionPricing,
  UpdateBillingProjectionInput,
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

export const SubscriptionStatusSchema = z.enum([
  "ACTIVE",
  "EXPIRED",
  "PENDING",
]);

export function ActivateSubscriptionInputSchema(): z.ZodObject<
  Properties<ActivateSubscriptionInput>
> {
  return z.object({
    currentPeriodEnd: z.string().datetime(),
    currentPeriodStart: z.string().datetime(),
    lastModified: z.string().datetime(),
    startDate: z.string().datetime(),
  });
}

export function AddAddonInputSchema(): z.ZodObject<Properties<AddAddonInput>> {
  return z.object({
    addedAt: z.string().datetime(),
    id: z.string(),
    lastModified: z.string().datetime(),
    optionGroupId: z.string(),
  });
}

export function CancelSubscriptionInputSchema(): z.ZodObject<
  Properties<CancelSubscriptionInput>
> {
  return z.object({
    cancelEffectiveDate: z.string().datetime().nullish(),
    cancelledAt: z.string().datetime(),
    lastModified: z.string().datetime(),
    reason: z.string().nullish(),
  });
}

export function ChangeTierInputSchema(): z.ZodObject<
  Properties<ChangeTierInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    newTierId: z.string(),
  });
}

export function ExpireSubscriptionInputSchema(): z.ZodObject<
  Properties<ExpireSubscriptionInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
  });
}

export function FacetSelectionSchema(): z.ZodObject<
  Properties<FacetSelection>
> {
  return z.object({
    __typename: z.literal("FacetSelection").optional(),
    categoryKey: z.string(),
    id: z.string(),
    selectedOptionId: z.string(),
  });
}

export function InitializeSubscriptionInputSchema(): z.ZodObject<
  Properties<InitializeSubscriptionInput>
> {
  return z.object({
    createdAt: z.string().datetime(),
    customerId: z.string(),
    customerName: z.string().nullish(),
    id: z.string(),
    lastModified: z.string().datetime(),
    resourceTemplateId: z.string(),
    selectedTierId: z.string(),
    serviceOfferingId: z.string(),
    serviceOfferingTitle: z.string().nullish(),
  });
}

export function RemoveAddonInputSchema(): z.ZodObject<
  Properties<RemoveAddonInput>
> {
  return z.object({
    id: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function RemoveFacetSelectionInputSchema(): z.ZodObject<
  Properties<RemoveFacetSelectionInput>
> {
  return z.object({
    categoryKey: z.string(),
    lastModified: z.string().datetime(),
  });
}

export function SelectedAddonSchema(): z.ZodObject<Properties<SelectedAddon>> {
  return z.object({
    __typename: z.literal("SelectedAddon").optional(),
    addedAt: z.string().datetime(),
    id: z.string(),
    optionGroupId: z.string(),
  });
}

export function ServiceSubscriptionStateSchema(): z.ZodObject<
  Properties<ServiceSubscriptionState>
> {
  return z.object({
    __typename: z.literal("ServiceSubscriptionState").optional(),
    autoRenew: z.boolean(),
    cancelEffectiveDate: z.string().datetime().nullish(),
    cancellationReason: z.string().nullish(),
    cancelledAt: z.string().datetime().nullish(),
    createdAt: z.string().datetime(),
    currentPeriodEnd: z.string().datetime().nullish(),
    currentPeriodStart: z.string().datetime().nullish(),
    customerId: z.string(),
    customerName: z.string().nullish(),
    facetSelections: z.array(z.lazy(() => FacetSelectionSchema())),
    id: z.string(),
    lastModified: z.string().datetime(),
    nextBillingDate: z.string().datetime().nullish(),
    pricing: z.lazy(() => SubscriptionPricingSchema().nullish()),
    projectedBillAmount: z.number().nullish(),
    projectedBillCurrency: z.string().nullish(),
    resourceTemplateId: z.string(),
    selectedAddons: z.array(z.lazy(() => SelectedAddonSchema())),
    selectedTierId: z.string(),
    serviceOfferingId: z.string(),
    serviceOfferingTitle: z.string().nullish(),
    startDate: z.string().datetime().nullish(),
    status: SubscriptionStatusSchema,
  });
}

export function SetCachedSnippetsInputSchema(): z.ZodObject<
  Properties<SetCachedSnippetsInput>
> {
  return z.object({
    customerName: z.string().nullish(),
    lastModified: z.string().datetime(),
    serviceOfferingTitle: z.string().nullish(),
  });
}

export function SetFacetSelectionInputSchema(): z.ZodObject<
  Properties<SetFacetSelectionInput>
> {
  return z.object({
    categoryKey: z.string(),
    id: z.string(),
    lastModified: z.string().datetime(),
    selectedOptionId: z.string(),
  });
}

export function SetPricingInputSchema(): z.ZodObject<
  Properties<SetPricingInput>
> {
  return z.object({
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    lastModified: z.string().datetime(),
    setupFee: z.number().nullish(),
  });
}

export function SubscriptionPricingSchema(): z.ZodObject<
  Properties<SubscriptionPricing>
> {
  return z.object({
    __typename: z.literal("SubscriptionPricing").optional(),
    amount: z.number(),
    billingCycle: BillingCycleSchema,
    currency: z.string(),
    setupFee: z.number().nullish(),
  });
}

export function UpdateBillingProjectionInputSchema(): z.ZodObject<
  Properties<UpdateBillingProjectionInput>
> {
  return z.object({
    lastModified: z.string().datetime(),
    nextBillingDate: z.string().datetime().nullish(),
    projectedBillAmount: z.number().nullish(),
    projectedBillCurrency: z.string().nullish(),
  });
}
