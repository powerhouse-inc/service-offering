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
  activatedAt: Scalars["DateTime"]["input"];
};

export type AddServiceFacetSelectionInput = {
  facetName: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  selectedOption: Scalars["String"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type AddServiceGroupInput = {
  costType?: InputMaybe<GroupCostType>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  optional: Scalars["Boolean"]["input"];
};

export type AddServiceInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
};

export type AddServiceMetricInput = {
  freeLimit?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  name: Scalars["String"]["input"];
  nextUsageReset?: InputMaybe<Scalars["DateTime"]["input"]>;
  paidLimit?: InputMaybe<Scalars["Int"]["input"]>;
  serviceId: Scalars["OID"]["input"];
  unitCost?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  unitName?: InputMaybe<Scalars["String"]["input"]>;
  usageResetPeriod?: InputMaybe<ResetPeriod>;
};

export type AddServiceToGroupInput = {
  groupId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type BillingCycle = "ANNUAL" | "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL";

export type BudgetCategory = {
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
};

export type CancelSubscriptionInput = {
  cancelledAt: Scalars["DateTime"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type CustomerType = "ENTERPRISE" | "INDIVIDUAL" | "TEAM";

export type DecrementMetricUsageInput = {
  amount: Scalars["Int"]["input"];
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type DiscountSource = "CUSTOM" | "TIER";

export type DiscountType = "FIXED_AMOUNT" | "PERCENTAGE";

export type FacetSelection = {
  facetName: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  selectedOption: Scalars["String"]["output"];
};

export type GroupCostType = "RECURRING" | "SETUP";

export type IncrementMetricUsageInput = {
  amount: Scalars["Int"]["input"];
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type InitializeSubscriptionInput = {
  createdAt: Scalars["DateTime"]["input"];
  customerEmail?: InputMaybe<Scalars["String"]["input"]>;
  customerId?: InputMaybe<Scalars["PHID"]["input"]>;
  customerName?: InputMaybe<Scalars["String"]["input"]>;
  globalCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  operatorId?: InputMaybe<Scalars["PHID"]["input"]>;
  selectedBillingCycle?: InputMaybe<BillingCycle>;
  serviceOfferingId?: InputMaybe<Scalars["PHID"]["input"]>;
  tierCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  tierName?: InputMaybe<Scalars["String"]["input"]>;
  tierPrice?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  tierPricingMode?: InputMaybe<TierPricingMode>;
  tierPricingOptionId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type PauseSubscriptionInput = {
  pausedAt: Scalars["DateTime"]["input"];
};

export type RemoveBudgetCategoryInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveServiceFacetSelectionInput = {
  facetSelectionId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type RemoveServiceFromGroupInput = {
  groupId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type RemoveServiceGroupInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveServiceInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveServiceMetricInput = {
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type RenewExpiringSubscriptionInput = {
  newRenewalDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  renewedAt: Scalars["DateTime"]["input"];
};

export type ReportRecurringPaymentInput = {
  paidAmount: Scalars["Amount_Money"]["input"];
  paidAt: Scalars["DateTime"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type ReportSetupPaymentInput = {
  paidAmount: Scalars["Amount_Money"]["input"];
  paidAt: Scalars["DateTime"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type ResetPeriod =
  | "ANNUAL"
  | "DAILY"
  | "MONTHLY"
  | "QUARTERLY"
  | "WEEKLY";

export type ResourceDocument = {
  documentId: Scalars["PHID"]["output"];
  documentType: Scalars["String"]["output"];
};

export type ResumeSubscriptionInput = {
  resumedAt: Scalars["DateTime"]["input"];
};

export type ServiceCost = {
  amount: Scalars["Amount_Money"]["output"];
  currency: Scalars["Currency"]["output"];
  paidAmount: Maybe<Scalars["Amount_Money"]["output"]>;
  paidAt: Maybe<Scalars["DateTime"]["output"]>;
};

export type ServiceGroup = {
  costType: Maybe<GroupCostType>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  optional: Scalars["Boolean"]["output"];
  recurringCost: Maybe<ServiceCost>;
  services: Array<Scalars["OID"]["output"]>;
  setupCost: Maybe<ServiceCost>;
};

export type ServiceMetric = {
  currentUsage: Scalars["Int"]["output"];
  freeLimit: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  limit: Maybe<Scalars["Int"]["output"]>;
  name: Scalars["String"]["output"];
  nextUsageReset: Maybe<Scalars["DateTime"]["output"]>;
  paidLimit: Maybe<Scalars["Int"]["output"]>;
  unitCost: Maybe<Scalars["Amount_Money"]["output"]>;
  unitName: Maybe<Scalars["String"]["output"]>;
  usageResetPeriod: Maybe<ResetPeriod>;
};

export type SetAutoRenewInput = {
  autoRenew: Scalars["Boolean"]["input"];
};

export type SetBudgetCategoryInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
};

export type SetCustomerTypeInput = {
  customerType: CustomerType;
};

export type SetExpiringInput = {
  expiringAt: Scalars["DateTime"]["input"];
  renewalDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type SetOperatorNotesInput = {
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetRenewalDateInput = {
  renewalDate: Scalars["DateTime"]["input"];
};

export type SetResourceDocumentInput = {
  documentId: Scalars["PHID"]["input"];
  documentType: Scalars["String"]["input"];
};

export type SubscriptionInstanceState = {
  activatedSince: Maybe<Scalars["DateTime"]["output"]>;
  autoRenew: Scalars["Boolean"]["output"];
  budget: Maybe<BudgetCategory>;
  cancellationReason: Maybe<Scalars["String"]["output"]>;
  cancelledSince: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  customerEmail: Maybe<Scalars["String"]["output"]>;
  customerId: Maybe<Scalars["PHID"]["output"]>;
  customerName: Maybe<Scalars["String"]["output"]>;
  customerType: Maybe<CustomerType>;
  expiringSince: Maybe<Scalars["DateTime"]["output"]>;
  globalCurrency: Maybe<Scalars["Currency"]["output"]>;
  nextBillingDate: Maybe<Scalars["DateTime"]["output"]>;
  operatorId: Maybe<Scalars["PHID"]["output"]>;
  operatorNotes: Maybe<Scalars["String"]["output"]>;
  pausedSince: Maybe<Scalars["DateTime"]["output"]>;
  projectedBillAmount: Maybe<Scalars["Amount_Money"]["output"]>;
  projectedBillCurrency: Maybe<Scalars["Currency"]["output"]>;
  renewalDate: Maybe<Scalars["DateTime"]["output"]>;
  resource: Maybe<ResourceDocument>;
  selectedBillingCycle: Maybe<BillingCycle>;
  serviceGroups: Array<ServiceGroup>;
  serviceOfferingId: Maybe<Scalars["PHID"]["output"]>;
  services: Array<SubscriptionService>;
  status: SubscriptionStatus;
  teamMemberCount: Maybe<Scalars["Int"]["output"]>;
  tierCurrency: Maybe<Scalars["Currency"]["output"]>;
  tierName: Maybe<Scalars["String"]["output"]>;
  tierPrice: Maybe<Scalars["Amount_Money"]["output"]>;
  tierPricingMode: Maybe<TierPricingMode>;
  tierPricingOptionId: Maybe<Scalars["OID"]["output"]>;
};

export type SubscriptionService = {
  customValue: Maybe<Scalars["String"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  facetSelections: Array<FacetSelection>;
  id: Scalars["OID"]["output"];
  metrics: Array<ServiceMetric>;
  name: Scalars["String"]["output"];
  recurringCost: Maybe<ServiceCost>;
  setupCost: Maybe<ServiceCost>;
};

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "DRAFT"
  | "EXPIRING"
  | "PAUSED";

export type TierPricingMode = "CUSTOM" | "FIXED" | "PER_SEAT";

export type UpdateBillingProjectionInput = {
  nextBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  projectedBillAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  projectedBillCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type UpdateCustomerInfoInput = {
  customerEmail?: InputMaybe<Scalars["String"]["input"]>;
  customerName?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateMetricInput = {
  freeLimit?: InputMaybe<Scalars["Int"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  metricId: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  nextUsageReset?: InputMaybe<Scalars["DateTime"]["input"]>;
  paidLimit?: InputMaybe<Scalars["Int"]["input"]>;
  serviceId: Scalars["OID"]["input"];
  unitCost?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  unitName?: InputMaybe<Scalars["String"]["input"]>;
  usageResetPeriod?: InputMaybe<ResetPeriod>;
};

export type UpdateMetricUsageInput = {
  currentUsage: Scalars["Int"]["input"];
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type UpdateServiceGroupCostInput = {
  amount: Scalars["Amount_Money"]["input"];
  costType: GroupCostType;
  currency: Scalars["Currency"]["input"];
  groupId: Scalars["OID"]["input"];
};

export type UpdateServiceInfoInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  serviceId: Scalars["OID"]["input"];
};

export type UpdateServiceRecurringCostInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type UpdateServiceSetupCostInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type UpdateSubscriptionStatusInput = {
  status: SubscriptionStatus;
};

export type UpdateTeamMemberCountInput = {
  teamMemberCount: Scalars["Int"]["input"];
};

export type UpdateTierInfoInput = {
  selectedBillingCycle?: InputMaybe<BillingCycle>;
  tierCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  tierName?: InputMaybe<Scalars["String"]["input"]>;
  tierPrice?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  tierPricingMode?: InputMaybe<TierPricingMode>;
  tierPricingOptionId?: InputMaybe<Scalars["OID"]["input"]>;
};
