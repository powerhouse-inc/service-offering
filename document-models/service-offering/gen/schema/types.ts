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

export type AddFacetBindingInput = {
  bindingId: Scalars["OID"]["input"];
  facetName: Scalars["String"]["input"];
  facetType: Scalars["PHID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  serviceId: Scalars["OID"]["input"];
  supportedOptions: Array<Scalars["OID"]["input"]>;
};

export type AddFacetOptionInput = {
  categoryKey: Scalars["String"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  optionId: Scalars["String"]["input"];
};

export type AddOptionGroupInput = {
  billingCycle?: InputMaybe<BillingCycle>;
  costType?: InputMaybe<GroupCostType>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  defaultSelected: Scalars["Boolean"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  isAddOn: Scalars["Boolean"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  name: Scalars["String"]["input"];
  price?: InputMaybe<Scalars["Amount_Money"]["input"]>;
};

export type AddServiceGroupInput = {
  billingCycle: BillingCycle;
  description?: InputMaybe<Scalars["String"]["input"]>;
  displayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  name: Scalars["String"]["input"];
};

export type AddServiceInput = {
  costType?: InputMaybe<ServiceCostType>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  displayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  isSetupFormation?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  price?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  serviceGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  title: Scalars["String"]["input"];
};

export type AddServiceLevelInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  level: ServiceLevel;
  optionGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  serviceId: Scalars["OID"]["input"];
  serviceLevelId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type AddTargetAudienceInput = {
  color?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  label: Scalars["String"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type AddTierInput = {
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  currency: Scalars["Currency"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  isCustomPricing?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  name: Scalars["String"]["input"];
};

export type AddTierPricingOptionInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  isDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  pricingOptionId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type AddUsageLimitInput = {
  freeLimit?: InputMaybe<Scalars["Int"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  limitId: Scalars["OID"]["input"];
  metric: Scalars["String"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  paidLimit?: InputMaybe<Scalars["Int"]["input"]>;
  resetCycle?: InputMaybe<UsageResetCycle>;
  serviceId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
  unitName?: InputMaybe<Scalars["String"]["input"]>;
  unitPrice?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  unitPriceCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type BillingCycle =
  | "ANNUAL"
  | "MONTHLY"
  | "ONE_TIME"
  | "QUARTERLY"
  | "SEMI_ANNUAL";

export type ChangeResourceTemplateInput = {
  lastModified: Scalars["DateTime"]["input"];
  newTemplateId: Scalars["PHID"]["input"];
  previousTemplateId: Scalars["PHID"]["input"];
};

export type DeleteOptionGroupInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type DeleteServiceGroupInput = {
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

export type FacetTarget = {
  categoryKey: Scalars["String"]["output"];
  categoryLabel: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  selectedOptions: Array<Scalars["String"]["output"]>;
};

export type GroupCostType = "RECURRING" | "SETUP";

export type OptionGroup = {
  billingCycle: Maybe<BillingCycle>;
  costType: Maybe<GroupCostType>;
  currency: Maybe<Scalars["Currency"]["output"]>;
  defaultSelected: Scalars["Boolean"]["output"];
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  isAddOn: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  price: Maybe<Scalars["Amount_Money"]["output"]>;
};

export type RemoveFacetBindingInput = {
  bindingId: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  serviceId: Scalars["OID"]["input"];
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

export type RemoveServiceLevelInput = {
  lastModified: Scalars["DateTime"]["input"];
  serviceLevelId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type RemoveTargetAudienceInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type RemoveTierPricingOptionInput = {
  lastModified: Scalars["DateTime"]["input"];
  pricingOptionId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type RemoveUsageLimitInput = {
  lastModified: Scalars["DateTime"]["input"];
  limitId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type ReorderServiceGroupsInput = {
  lastModified: Scalars["DateTime"]["input"];
  order: Array<Scalars["OID"]["input"]>;
};

export type ResourceFacetBinding = {
  facetName: Scalars["String"]["output"];
  facetType: Scalars["PHID"]["output"];
  id: Scalars["OID"]["output"];
  supportedOptions: Array<Scalars["OID"]["output"]>;
};

export type SelectResourceTemplateInput = {
  lastModified: Scalars["DateTime"]["input"];
  resourceTemplateId: Scalars["PHID"]["input"];
};

export type Service = {
  costType: Maybe<ServiceCostType>;
  currency: Maybe<Scalars["Currency"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  displayOrder: Maybe<Scalars["Int"]["output"]>;
  facetBindings: Array<ResourceFacetBinding>;
  id: Scalars["OID"]["output"];
  isSetupFormation: Scalars["Boolean"]["output"];
  optionGroupId: Maybe<Scalars["OID"]["output"]>;
  price: Maybe<Scalars["Amount_Money"]["output"]>;
  serviceGroupId: Maybe<Scalars["OID"]["output"]>;
  title: Scalars["String"]["output"];
};

export type ServiceCostType = "RECURRING" | "SETUP";

export type ServiceGroup = {
  billingCycle: BillingCycle;
  description: Maybe<Scalars["String"]["output"]>;
  displayOrder: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
};

export type ServiceLevel =
  | "CUSTOM"
  | "INCLUDED"
  | "NOT_APPLICABLE"
  | "NOT_INCLUDED"
  | "OPTIONAL"
  | "VARIABLE";

export type ServiceLevelBinding = {
  customValue: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  level: ServiceLevel;
  optionGroupId: Maybe<Scalars["OID"]["output"]>;
  serviceId: Scalars["OID"]["output"];
};

export type ServiceOfferingState = {
  description: Maybe<Scalars["String"]["output"]>;
  facetTargets: Array<FacetTarget>;
  id: Scalars["PHID"]["output"];
  infoLink: Maybe<Scalars["URL"]["output"]>;
  lastModified: Scalars["DateTime"]["output"];
  operatorId: Scalars["PHID"]["output"];
  optionGroups: Array<OptionGroup>;
  resourceTemplateId: Maybe<Scalars["PHID"]["output"]>;
  serviceGroups: Array<ServiceGroup>;
  services: Array<Service>;
  status: ServiceStatus;
  summary: Scalars["String"]["output"];
  targetAudiences: Array<TargetAudience>;
  thumbnailUrl: Maybe<Scalars["URL"]["output"]>;
  tiers: Array<ServiceSubscriptionTier>;
  title: Scalars["String"]["output"];
};

export type ServicePricing = {
  amount: Maybe<Scalars["Amount_Money"]["output"]>;
  currency: Scalars["Currency"]["output"];
};

export type ServiceStatus = "ACTIVE" | "COMING_SOON" | "DEPRECATED" | "DRAFT";

export type ServiceSubscriptionTier = {
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  isCustomPricing: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  pricing: ServicePricing;
  pricingOptions: Array<TierPricingOption>;
  serviceLevels: Array<ServiceLevelBinding>;
  usageLimits: Array<ServiceUsageLimit>;
};

export type ServiceUsageLimit = {
  freeLimit: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  metric: Scalars["String"]["output"];
  notes: Maybe<Scalars["String"]["output"]>;
  paidLimit: Maybe<Scalars["Int"]["output"]>;
  resetCycle: Maybe<UsageResetCycle>;
  serviceId: Scalars["OID"]["output"];
  unitName: Maybe<Scalars["String"]["output"]>;
  unitPrice: Maybe<Scalars["Amount_Money"]["output"]>;
  unitPriceCurrency: Maybe<Scalars["Currency"]["output"]>;
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

export type TargetAudience = {
  color: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  label: Scalars["String"]["output"];
};

export type TierPricingOption = {
  amount: Scalars["Amount_Money"]["output"];
  currency: Scalars["Currency"]["output"];
  id: Scalars["OID"]["output"];
  isDefault: Scalars["Boolean"]["output"];
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
  billingCycle?: InputMaybe<BillingCycle>;
  costType?: InputMaybe<GroupCostType>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  defaultSelected?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  isAddOn?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["Amount_Money"]["input"]>;
};

export type UpdateServiceGroupInput = {
  billingCycle?: InputMaybe<BillingCycle>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  displayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateServiceInput = {
  costType?: InputMaybe<ServiceCostType>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  displayOrder?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  isSetupFormation?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  price?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  serviceGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateServiceLevelInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  level?: InputMaybe<ServiceLevel>;
  optionGroupId?: InputMaybe<Scalars["OID"]["input"]>;
  serviceLevelId: Scalars["OID"]["input"];
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
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type UpdateTierPricingOptionInput = {
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  isDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  pricingOptionId: Scalars["OID"]["input"];
  tierId: Scalars["OID"]["input"];
};

export type UpdateUsageLimitInput = {
  freeLimit?: InputMaybe<Scalars["Int"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  limitId: Scalars["OID"]["input"];
  metric?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  paidLimit?: InputMaybe<Scalars["Int"]["input"]>;
  resetCycle?: InputMaybe<UsageResetCycle>;
  tierId: Scalars["OID"]["input"];
  unitName?: InputMaybe<Scalars["String"]["input"]>;
  unitPrice?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  unitPriceCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type UsageResetCycle = "DAILY" | "MONTHLY" | "WEEKLY";
