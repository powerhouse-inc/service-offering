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

export type AddFacetOptionInput = {
  categoryKey: Scalars["String"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  optionId: Scalars["String"]["input"];
};

export type AddOnPricingMode = "STANDALONE" | "TIER_DEPENDENT";

export type AddOptionGroupInput = {
  defaultSelected: Scalars["Boolean"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  isAddOn: Scalars["Boolean"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  name: Scalars["String"]["input"];
};

export type AddOptionGroupTierPricingInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type AddServiceInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  displayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  isSetupFormation?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  title: Scalars["String"]["input"];
};

export type AddServiceLevelInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  level: Scalars["String"]["input"];
  serviceId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type AddTierInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  isCustomPricing?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  name: Scalars["String"]["input"];
};

export type AddUsageLimitInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  limit: Scalars["Int"]["input"];
  name: Scalars["String"]["input"];
  tierId: Scalars["OID"]["input"];
  unit?: InputMaybe<Scalars["String"]["input"]>;
};

export type BillingCycle = "ANNUAL" | "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL";

export type BillingCycleDiscount = {
  cycle: BillingCycle;
  discountType: DiscountType;
  discountValue: Scalars["Float"]["output"];
};

export type BillingCycleDiscountInput = {
  cycle: BillingCycle;
  discountType: DiscountType;
  discountValue: Scalars["Float"]["input"];
};

export type ChangeResourceTemplateInput = {
  lastModified: Scalars["DateTime"]["input"];
  resourceTemplateId: Scalars["PHID"]["input"];
};

export type DeleteOptionGroupInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type DeleteServiceInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type DeleteTierInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type DiscountMode = "INHERIT_TIER" | "OWN_DISCOUNTS";

export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE";

export type FacetTarget = {
  categoryKey: Scalars["String"]["output"];
  categoryLabel: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  selectedOptions: Array<Scalars["String"]["output"]>;
};

export type GroupCostType = "RECURRING" | "SETUP";

export type OptionGroup = {
  availableBillingCycles: Array<BillingCycle>;
  billingCycleDiscounts: Array<BillingCycleDiscount>;
  costType: Maybe<GroupCostType>;
  currency: Maybe<Scalars["Currency"]["output"]>;
  defaultSelected: Scalars["Boolean"]["output"];
  description: Maybe<Scalars["String"]["output"]>;
  discountMode: Maybe<DiscountMode>;
  id: Scalars["OID"]["output"];
  isAddOn: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  price: Maybe<Scalars["Amount_Money"]["output"]>;
  pricingMode: AddOnPricingMode;
  standalonePricing: Maybe<TierPricing>;
  tierDependentPricing: Array<TierDependentPricing>;
};

export type RemoveFacetOptionInput = {
  categoryKey: Scalars["String"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  optionId: Scalars["String"]["input"];
};

export type RemoveFacetTargetInput = {
  categoryKey: Scalars["String"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type RemoveOptionGroupTierPricingInput = {
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type RemoveServiceLevelInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type RemoveUsageLimitInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type SelectResourceTemplateInput = {
  lastModified: Scalars["DateTime"]["input"];
  resourceTemplateId: Scalars["PHID"]["input"];
};

export type Service = {
  description: Maybe<Scalars["String"]["output"]>;
  displayOrder: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  isSetupFormation: Scalars["Boolean"]["output"];
  optionGroupId: Maybe<Scalars["OID"]["output"]>;
  title: Scalars["String"]["output"];
};

export type ServiceOfferingState = {
  availableBillingCycles: Array<BillingCycle>;
  description: Maybe<Scalars["String"]["output"]>;
  facetTargets: Array<FacetTarget>;
  id: Scalars["PHID"]["output"];
  infoLink: Maybe<Scalars["URL"]["output"]>;
  lastModified: Scalars["DateTime"]["output"];
  operatorId: Scalars["PHID"]["output"];
  optionGroups: Array<OptionGroup>;
  resourceTemplateId: Maybe<Scalars["PHID"]["output"]>;
  services: Array<Service>;
  status: ServiceStatus;
  summary: Scalars["String"]["output"];
  thumbnailUrl: Maybe<Scalars["URL"]["output"]>;
  tiers: Array<ServiceSubscriptionTier>;
  title: Scalars["String"]["output"];
};

export type ServiceStatus = "ACTIVE" | "COMING_SOON" | "DEPRECATED" | "DRAFT";

export type ServiceSubscriptionTier = {
  billingCycleDiscounts: Array<BillingCycleDiscount>;
  defaultBillingCycle: Maybe<BillingCycle>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  isCustomPricing: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  pricing: Maybe<TierPricing>;
  pricingMode: TierPricingMode;
  serviceLevels: Array<TierServiceLevel>;
  usageLimits: Array<UsageLimit>;
};

export type SetAvailableBillingCyclesInput = {
  billingCycles: Array<BillingCycle>;
  lastModified: Scalars["DateTime"]["input"];
};

export type SetFacetTargetInput = {
  categoryKey: Scalars["String"]["input"];
  categoryLabel: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  selectedOptions: Array<Scalars["String"]["input"]>;
};

export type SetOfferingIdInput = {
  id: Scalars["PHID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type SetOperatorInput = {
  lastModified: Scalars["DateTime"]["input"];
  operatorId: Scalars["PHID"]["input"];
};

export type SetOptionGroupDiscountModeInput = {
  discountMode: DiscountMode;
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId: Scalars["OID"]["input"];
};

export type SetOptionGroupStandalonePricingInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId: Scalars["OID"]["input"];
};

export type SetTierBillingCycleDiscountsInput = {
  discounts: Array<BillingCycleDiscountInput>;
  lastModified: Scalars["DateTime"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type SetTierDefaultBillingCycleInput = {
  defaultBillingCycle: BillingCycle;
  lastModified: Scalars["DateTime"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type SetTierPricingModeInput = {
  lastModified: Scalars["DateTime"]["input"];
  pricingMode: TierPricingMode;
  tierId: Scalars["OID"]["input"];
};

export type TierDependentPricing = {
  amount: Scalars["Amount_Money"]["output"];
  currency: Scalars["Currency"]["output"];
  tierId: Scalars["OID"]["output"];
};

export type TierPricing = {
  amount: Scalars["Amount_Money"]["output"];
  currency: Scalars["Currency"]["output"];
};

export type TierPricingMode = "CUSTOM" | "FIXED" | "PER_SEAT";

export type TierServiceLevel = {
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  level: Scalars["String"]["output"];
  serviceId: Scalars["OID"]["output"];
};

export type UpdateOfferingInfoInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  infoLink?: InputMaybe<Scalars["URL"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  summary?: InputMaybe<Scalars["String"]["input"]>;
  thumbnailUrl?: InputMaybe<Scalars["URL"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateOfferingStatusInput = {
  lastModified: Scalars["DateTime"]["input"];
  status: ServiceStatus;
};

export type UpdateOptionGroupInput = {
  defaultSelected?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  isAddOn?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateOptionGroupTierPricingInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type UpdateServiceInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  displayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  isSetupFormation?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateServiceLevelInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  level?: InputMaybe<Scalars["String"]["input"]>;
  tierId: Scalars["OID"]["input"];
};

export type UpdateTierInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  isCustomPricing?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateTierPricingInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type UpdateUsageLimitInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  tierId: Scalars["OID"]["input"];
  unit?: InputMaybe<Scalars["String"]["input"]>;
};

export type UsageLimit = {
  id: Scalars["OID"]["output"];
  limit: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  unit: Maybe<Scalars["String"]["output"]>;
};
