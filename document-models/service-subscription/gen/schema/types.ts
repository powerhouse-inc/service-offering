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

export type ActivateSubscriptionInput = {
  currentPeriodEnd: Scalars["DateTime"]["input"];
  currentPeriodStart: Scalars["DateTime"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  startDate: Scalars["DateTime"]["input"];
};

export type AddAddonInput = {
  addedAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  optionGroupId: Scalars["OID"]["input"];
};

export type BillingCycle =
  | "ANNUAL"
  | "MONTHLY"
  | "ONE_TIME"
  | "QUARTERLY"
  | "SEMI_ANNUAL";

export type CancelSubscriptionInput = {
  cancelEffectiveDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  cancelledAt: Scalars["DateTime"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type ChangeTierInput = {
  lastModified: Scalars["DateTime"]["input"];
  newTierId: Scalars["OID"]["input"];
};

export type ExpireSubscriptionInput = {
  lastModified: Scalars["DateTime"]["input"];
};

export type FacetSelection = {
  categoryKey: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  selectedOptionId: Scalars["String"]["output"];
};

export type InitializeSubscriptionInput = {
  createdAt: Scalars["DateTime"]["input"];
  customerId: Scalars["PHID"]["input"];
  customerName?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["PHID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  resourceTemplateId: Scalars["PHID"]["input"];
  selectedTierId: Scalars["OID"]["input"];
  serviceOfferingId: Scalars["PHID"]["input"];
  serviceOfferingTitle?: InputMaybe<Scalars["String"]["input"]>;
};

export type RemoveAddonInput = {
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type RemoveFacetSelectionInput = {
  categoryKey: Scalars["String"]["input"];
  lastModified: Scalars["DateTime"]["input"];
};

export type SelectedAddon = {
  addedAt: Scalars["DateTime"]["output"];
  id: Scalars["OID"]["output"];
  optionGroupId: Scalars["OID"]["output"];
};

export type ServiceSubscriptionState = {
  autoRenew: Scalars["Boolean"]["output"];
  cancelEffectiveDate: Maybe<Scalars["DateTime"]["output"]>;
  cancellationReason: Maybe<Scalars["String"]["output"]>;
  cancelledAt: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  currentPeriodEnd: Maybe<Scalars["DateTime"]["output"]>;
  currentPeriodStart: Maybe<Scalars["DateTime"]["output"]>;
  customerId: Scalars["PHID"]["output"];
  customerName: Maybe<Scalars["String"]["output"]>;
  facetSelections: Array<FacetSelection>;
  id: Scalars["PHID"]["output"];
  lastModified: Scalars["DateTime"]["output"];
  nextBillingDate: Maybe<Scalars["DateTime"]["output"]>;
  pricing: Maybe<SubscriptionPricing>;
  projectedBillAmount: Maybe<Scalars["Amount_Money"]["output"]>;
  projectedBillCurrency: Maybe<Scalars["Currency"]["output"]>;
  resourceTemplateId: Scalars["PHID"]["output"];
  selectedAddons: Array<SelectedAddon>;
  selectedTierId: Scalars["OID"]["output"];
  serviceOfferingId: Scalars["PHID"]["output"];
  serviceOfferingTitle: Maybe<Scalars["String"]["output"]>;
  startDate: Maybe<Scalars["DateTime"]["output"]>;
  status: SubscriptionStatus;
};

export type SetCachedSnippetsInput = {
  customerName?: InputMaybe<Scalars["String"]["input"]>;
  lastModified: Scalars["DateTime"]["input"];
  serviceOfferingTitle?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetFacetSelectionInput = {
  categoryKey: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  selectedOptionId: Scalars["String"]["input"];
};

export type SetPricingInput = {
  amount: Scalars["Amount_Money"]["input"];
  billingCycle: BillingCycle;
  currency: Scalars["Currency"]["input"];
  lastModified: Scalars["DateTime"]["input"];
  setupFee?: InputMaybe<Scalars["Amount_Money"]["input"]>;
};

export type SubscriptionPricing = {
  amount: Scalars["Amount_Money"]["output"];
  billingCycle: BillingCycle;
  currency: Scalars["Currency"]["output"];
  setupFee: Maybe<Scalars["Amount_Money"]["output"]>;
};

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "PENDING";

export type UpdateBillingProjectionInput = {
  lastModified: Scalars["DateTime"]["input"];
  nextBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  projectedBillAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  projectedBillCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};
