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
  activatedSince: Scalars["DateTime"]["input"];
};

export type AddServiceFacetSelectionInput = {
  facetName: Scalars["String"]["input"];
  facetSelectionId: Scalars["OID"]["input"];
  selectedOption: Scalars["String"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type AddServiceGroupInput = {
  costType?: InputMaybe<GroupCostType>;
  groupId: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  optional: Scalars["Boolean"]["input"];
  recurringAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  recurringBillingCycle?: InputMaybe<BillingCycle>;
  recurringCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  recurringDiscount?: InputMaybe<DiscountInfoInput>;
  setupAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  setupBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  setupCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type AddServiceInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  recurringAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  recurringBillingCycle?: InputMaybe<BillingCycle>;
  recurringCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  recurringDiscount?: InputMaybe<DiscountInfoInput>;
  recurringLastPaymentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  recurringNextBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  serviceId: Scalars["OID"]["input"];
  setupAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  setupBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  setupCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  setupPaymentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type AddServiceMetricInput = {
  currentUsage: Scalars["Int"]["input"];
  freeLimit?: InputMaybe<Scalars["Int"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  metricId: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  nextUsageReset?: InputMaybe<Scalars["DateTime"]["input"]>;
  paidLimit?: InputMaybe<Scalars["Int"]["input"]>;
  serviceId: Scalars["OID"]["input"];
  unitCostAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  unitCostBillingCycle?: InputMaybe<BillingCycle>;
  unitCostCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  unitCostLastPaymentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  unitCostNextBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  unitName: Scalars["String"]["input"];
  usageResetPeriod?: InputMaybe<ResetPeriod>;
};

export type AddServiceToGroupInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  groupId: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  recurringAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  recurringBillingCycle?: InputMaybe<BillingCycle>;
  recurringCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  recurringLastPaymentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  recurringNextBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  serviceId: Scalars["OID"]["input"];
  setupAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  setupBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  setupCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  setupPaymentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type BillingCycle =
  | "ANNUAL"
  | "MONTHLY"
  | "ONE_TIME"
  | "QUARTERLY"
  | "SEMI_ANNUAL";

export type BudgetCategory = {
  id: Scalars["OID"]["output"];
  label: Scalars["String"]["output"];
};

export type CancelSubscriptionInput = {
  cancellationReason?: InputMaybe<Scalars["String"]["input"]>;
  cancelledSince: Scalars["DateTime"]["input"];
};

export type CustomerType = "INDIVIDUAL" | "TEAM";

export type DiscountInfo = {
  discountType: DiscountType;
  discountValue: Scalars["Float"]["output"];
  originalAmount: Scalars["Amount_Money"]["output"];
  source: DiscountSource;
};

export type DiscountInfoInput = {
  discountType: DiscountType;
  discountValue: Scalars["Float"]["input"];
  originalAmount: Scalars["Amount_Money"]["input"];
  source: DiscountSource;
};

export type DiscountSource = "BUNDLE" | "GROUP_INDEPENDENT" | "TIER_INHERITED";

export type DiscountType = "FLAT_AMOUNT" | "PERCENTAGE";

export type GroupCostType = "RECURRING" | "SETUP";

export type DecrementMetricUsageInput = {
  currentTime: Scalars["DateTime"]["input"];
  decrementBy: Scalars["Int"]["input"];
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type IncrementMetricUsageInput = {
  currentTime: Scalars["DateTime"]["input"];
  incrementBy: Scalars["Int"]["input"];
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type InitializeFacetSelectionInput = {
  facetName: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  selectedOption: Scalars["String"]["input"];
};

export type InitializeMetricInput = {
  currentUsage: Scalars["Int"]["input"];
  freeLimit?: InputMaybe<Scalars["Int"]["input"]>;
  id: Scalars["OID"]["input"];
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  name: Scalars["String"]["input"];
  paidLimit?: InputMaybe<Scalars["Int"]["input"]>;
  unitCostAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  unitCostBillingCycle?: InputMaybe<BillingCycle>;
  unitCostCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  unitName: Scalars["String"]["input"];
  usageResetPeriod?: InputMaybe<ResetPeriod>;
};

export type InitializeServiceGroupInput = {
  costType?: InputMaybe<GroupCostType>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  optional: Scalars["Boolean"]["input"];
  recurringAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  recurringBillingCycle?: InputMaybe<BillingCycle>;
  recurringCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  recurringDiscount?: InputMaybe<DiscountInfoInput>;
  services?: InputMaybe<Array<InitializeServiceInput>>;
  setupAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  setupBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  setupCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type InitializeServiceInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  facetSelections?: InputMaybe<Array<InitializeFacetSelectionInput>>;
  id: Scalars["OID"]["input"];
  metrics?: InputMaybe<Array<InitializeMetricInput>>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  recurringAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  recurringBillingCycle?: InputMaybe<BillingCycle>;
  recurringCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  recurringDiscount?: InputMaybe<DiscountInfoInput>;
  setupAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  setupCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type InitializeSubscriptionInput = {
  autoRenew?: InputMaybe<Scalars["Boolean"]["input"]>;
  createdAt: Scalars["DateTime"]["input"];
  customerEmail?: InputMaybe<Scalars["EmailAddress"]["input"]>;
  customerId?: InputMaybe<Scalars["PHID"]["input"]>;
  customerName?: InputMaybe<Scalars["String"]["input"]>;
  globalCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  resourceId?: InputMaybe<Scalars["PHID"]["input"]>;
  resourceLabel?: InputMaybe<Scalars["String"]["input"]>;
  resourceThumbnailUrl?: InputMaybe<Scalars["URL"]["input"]>;
  selectedBillingCycle?: InputMaybe<BillingCycle>;
  serviceGroups?: InputMaybe<Array<InitializeServiceGroupInput>>;
  serviceOfferingId?: InputMaybe<Scalars["PHID"]["input"]>;
  services?: InputMaybe<Array<InitializeServiceInput>>;
  tierCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  tierName?: InputMaybe<Scalars["String"]["input"]>;
  tierPrice?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  tierPricingMode?: InputMaybe<TierPricingMode>;
  tierPricingOptionId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type PauseSubscriptionInput = {
  pausedSince: Scalars["DateTime"]["input"];
};

export type RecurringCost = {
  amount: Scalars["Amount_Money"]["output"];
  billingCycle: BillingCycle;
  currency: Scalars["Currency"]["output"];
  discount: Maybe<DiscountInfo>;
  lastPaymentDate: Maybe<Scalars["DateTime"]["output"]>;
  nextBillingDate: Maybe<Scalars["DateTime"]["output"]>;
};

export type RemoveBudgetCategoryInput = {
  budgetId: Scalars["OID"]["input"];
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
  groupId: Scalars["OID"]["input"];
};

export type RemoveServiceInput = {
  serviceId: Scalars["OID"]["input"];
};

export type RemoveServiceMetricInput = {
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type RenewExpiringSubscriptionInput = {
  newRenewalDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  timestamp: Scalars["DateTime"]["input"];
};

export type ReportRecurringPaymentInput = {
  paymentDate: Scalars["DateTime"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type ReportSetupPaymentInput = {
  paymentDate: Scalars["DateTime"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type ResetPeriod =
  | "ANNUAL"
  | "DAILY"
  | "HOURLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMI_ANNUAL"
  | "WEEKLY";

export type ResourceDocument = {
  id: Scalars["PHID"]["output"];
  label: Maybe<Scalars["String"]["output"]>;
  thumbnailUrl: Maybe<Scalars["URL"]["output"]>;
};

export type ResumeSubscriptionInput = {
  timestamp: Scalars["DateTime"]["input"];
};

export type Service = {
  customValue: Maybe<Scalars["String"]["output"]>;
  description: Maybe<Scalars["String"]["output"]>;
  facetSelections: Array<ServiceFacetSelection>;
  id: Scalars["OID"]["output"];
  metrics: Array<ServiceMetric>;
  name: Maybe<Scalars["String"]["output"]>;
  recurringCost: Maybe<RecurringCost>;
  setupCost: Maybe<SetupCost>;
};

export type ServiceFacetSelection = {
  facetName: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  selectedOption: Scalars["String"]["output"];
};

export type ServiceGroup = {
  costType: Maybe<GroupCostType>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  optional: Scalars["Boolean"]["output"];
  recurringCost: Maybe<RecurringCost>;
  services: Array<Service>;
  setupCost: Maybe<SetupCost>;
};

export type ServiceMetric = {
  currentUsage: Scalars["Int"]["output"];
  freeLimit: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["OID"]["output"];
  limit: Maybe<Scalars["Int"]["output"]>;
  name: Scalars["String"]["output"];
  nextUsageReset: Maybe<Scalars["DateTime"]["output"]>;
  paidLimit: Maybe<Scalars["Int"]["output"]>;
  unitCost: Maybe<RecurringCost>;
  unitName: Scalars["String"]["output"];
  usageResetPeriod: Maybe<ResetPeriod>;
};

export type SetAutoRenewInput = {
  autoRenew: Scalars["Boolean"]["input"];
};

export type SetBudgetCategoryInput = {
  budgetId: Scalars["OID"]["input"];
  budgetLabel: Scalars["String"]["input"];
};

export type SetCustomerTypeInput = {
  customerType: CustomerType;
  teamMemberCount?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SetExpiringInput = {
  expiringSince: Scalars["DateTime"]["input"];
};

export type SetOperatorNotesInput = {
  operatorNotes?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetRenewalDateInput = {
  renewalDate: Scalars["DateTime"]["input"];
};

export type SetResourceDocumentInput = {
  resourceId: Scalars["PHID"]["input"];
  resourceLabel?: InputMaybe<Scalars["String"]["input"]>;
  resourceThumbnailUrl?: InputMaybe<Scalars["URL"]["input"]>;
};

export type SetupCost = {
  amount: Scalars["Amount_Money"]["output"];
  billingDate: Maybe<Scalars["DateTime"]["output"]>;
  currency: Scalars["Currency"]["output"];
  paymentDate: Maybe<Scalars["DateTime"]["output"]>;
};

export type SubscriptionInstanceState = {
  activatedSince: Maybe<Scalars["DateTime"]["output"]>;
  autoRenew: Scalars["Boolean"]["output"];
  budget: Maybe<BudgetCategory>;
  cancellationReason: Maybe<Scalars["String"]["output"]>;
  cancelledSince: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Maybe<Scalars["DateTime"]["output"]>;
  customerEmail: Maybe<Scalars["EmailAddress"]["output"]>;
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
  services: Array<Service>;
  status: SubscriptionStatus;
  teamMemberCount: Maybe<Scalars["Int"]["output"]>;
  tierCurrency: Maybe<Scalars["Currency"]["output"]>;
  tierName: Maybe<Scalars["String"]["output"]>;
  tierPrice: Maybe<Scalars["Amount_Money"]["output"]>;
  tierPricingMode: Maybe<TierPricingMode>;
  tierPricingOptionId: Maybe<Scalars["OID"]["output"]>;
};

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRING"
  | "PAUSED"
  | "PENDING";

export type TierPricingMode = "CALCULATED" | "MANUAL_OVERRIDE";

export type UpdateBillingProjectionInput = {
  nextBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  projectedBillAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  projectedBillCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type UpdateCustomerInfoInput = {
  customerEmail?: InputMaybe<Scalars["EmailAddress"]["input"]>;
  customerId?: InputMaybe<Scalars["PHID"]["input"]>;
  customerName?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateMetricInput = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  metricId: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  nextUsageReset?: InputMaybe<Scalars["DateTime"]["input"]>;
  serviceId: Scalars["OID"]["input"];
  unitName?: InputMaybe<Scalars["String"]["input"]>;
  usageResetPeriod?: InputMaybe<ResetPeriod>;
};

export type UpdateMetricUsageInput = {
  currentTime: Scalars["DateTime"]["input"];
  currentUsage: Scalars["Int"]["input"];
  metricId: Scalars["OID"]["input"];
  serviceId: Scalars["OID"]["input"];
};

export type UpdateServiceGroupCostInput = {
  groupId: Scalars["OID"]["input"];
  recurringAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  recurringBillingCycle?: InputMaybe<BillingCycle>;
  recurringCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  setupAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  setupBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  setupCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
};

export type UpdateServiceInfoInput = {
  customValue?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  serviceId: Scalars["OID"]["input"];
};

export type UpdateServiceRecurringCostInput = {
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  billingCycle?: InputMaybe<BillingCycle>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  lastPaymentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  nextBillingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  serviceId: Scalars["OID"]["input"];
};

export type UpdateServiceSetupCostInput = {
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  billingDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  paymentDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  serviceId: Scalars["OID"]["input"];
};

export type UpdateSubscriptionStatusInput = {
  status: SubscriptionStatus;
};

export type UpdateTeamMemberCountInput = {
  teamMemberCount: Scalars["Int"]["input"];
};

export type UpdateTierInfoInput = {
  tierCurrency?: InputMaybe<Scalars["Currency"]["input"]>;
  tierName?: InputMaybe<Scalars["String"]["input"]>;
  tierPrice?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  tierPricingMode?: InputMaybe<TierPricingMode>;
  tierPricingOptionId?: InputMaybe<Scalars["OID"]["input"]>;
};
