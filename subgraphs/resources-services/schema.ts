import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  """
  Subgraph definition for Resource Templates and Service Offerings
  """
  type Query {
    resourceTemplates(filter: RSResourceTemplatesFilter): [RSResourceTemplate!]!
    serviceOfferings(filter: RSServiceOfferingsFilter): [RSServiceOffering!]!
  }

  type Mutation {
    createResourceInstances(
      input: CreateResourceInstancesInput!
    ): CreateResourceInstancesOutput
  }

  input CreateResourceInstancesInput {
    resourceTemplateId: PHID!
    name: String!
    teamName: String!
  }

  type CreateResourceInstancesOutput {
    success: Boolean!
    data: JSONObject
    errors: [String!]!
  }

  # ============ Filters ============

  input RSResourceTemplatesFilter {
    id: PHID
    status: [RSTemplateStatusInput!]
    operatorId: PHID
  }

  input RSServiceOfferingsFilter {
    id: PHID
    status: [RSServiceStatus!]
    operatorId: PHID
    resourceTemplateId: PHID
  }

  # ============ Resource Template Types ============

  enum RSTemplateStatusInput {
    DRAFT
    COMING_SOON
    ACTIVE
    DEPRECATED
  }

  type RSResourceTemplate {
    id: PHID!
    operatorId: PHID!
    title: String!
    summary: String!
    description: String
    thumbnailUrl: URL
    infoLink: URL
    status: RSTemplateStatus!
    lastModified: DateTime!
    targetAudiences: [RSTargetAudience!]!
    setupServices: [String!]!
    recurringServices: [String!]!
    facetTargets: [RSFacetTarget!]!
    services: [RSService!]!
    optionGroups: [RSOptionGroup!]!
    faqFields: [RSFaqField!]
    contentSections: [RSContentSection!]!
  }

  enum RSTemplateStatus {
    DRAFT
    COMING_SOON
    ACTIVE
    DEPRECATED
  }

  type RSTargetAudience {
    id: OID!
    label: String!
    color: String
  }

  type RSOfferingFacetTarget {
    id: OID!
    categoryKey: String!
    categoryLabel: String!
    selectedOptions: [String!]!
  }

  type RSService {
    id: OID!
    title: String!
    description: String
    displayOrder: Int
    parentServiceId: OID
    isSetupFormation: Boolean!
    optionGroupId: OID
    facetBindings: [RSResourceFacetBinding!]!
  }

  type RSOptionGroup {
    id: OID!
    name: String!
    description: String
    isAddOn: Boolean!
    defaultSelected: Boolean!
  }

  type RSFaqField {
    id: OID!
    question: String
    answer: String
    displayOrder: Int!
  }

  type RSContentSection {
    id: OID!
    title: String!
    content: String!
    displayOrder: Int!
  }

  # ============ Service Offering Types ============

  type RSServiceOffering {
    id: PHID!
    operatorId: PHID!
    resourceTemplateId: PHID
    title: String!
    summary: String!
    description: String
    thumbnailUrl: URL
    infoLink: URL
    status: RSServiceStatus!
    lastModified: DateTime!
    targetAudiences: [RSOfferingTargetAudience!]!
    facetTargets: [RSOfferingFacetTarget!]!
    serviceGroups: [RSServiceGroup!]!
    services: [RSOfferingService!]!
    tiers: [RSServiceSubscriptionTier!]!
    optionGroups: [RSOfferingOptionGroup!]!
    finalConfiguration: RSFinalConfiguration
  }

  enum RSServiceStatus {
    DRAFT
    COMING_SOON
    ACTIVE
    DEPRECATED
  }

  type RSOfferingTargetAudience {
    id: OID!
    label: String!
    color: String
  }

  type RSFacetTarget {
    id: OID!
    categoryKey: String!
    categoryLabel: String!
    selectedOptions: [String!]!
  }

  # ---------- Discount & Pricing Primitives ----------

  enum RSDiscountType {
    PERCENTAGE
    FLAT_AMOUNT
  }

  type RSDiscountRule {
    discountType: RSDiscountType!
    discountValue: Float!
  }

  type RSBillingCycleDiscount {
    billingCycle: RSBillingCycle!
    discountRule: RSDiscountRule!
  }

  type RSSetupCost {
    amount: Amount_Money!
    currency: Currency!
    discount: RSDiscountRule
  }

  type RSSetupCostPerCycle {
    id: OID!
    billingCycle: RSBillingCycle!
    amount: Amount_Money!
    currency: Currency!
    discount: RSDiscountRule
  }

  type RSRecurringPriceOption {
    id: OID!
    billingCycle: RSBillingCycle!
    amount: Amount_Money!
    currency: Currency!
    discount: RSDiscountRule
  }

  # ---------- Service Groups ----------

  type RSServiceGroup {
    id: OID!
    name: String!
    description: String
    billingCycle: RSBillingCycle!
    displayOrder: Int
    tierPricing: [RSServiceGroupTierPricing!]!
  }

  type RSServiceGroupTierPricing {
    id: OID!
    tierId: OID!
    setupCostsPerCycle: [RSSetupCostPerCycle!]!
    recurringPricing: [RSRecurringPriceOption!]!
  }

  # ---------- Services ----------

  type RSOfferingService {
    id: OID!
    title: String!
    description: String
    displayOrder: Int
    serviceGroupId: OID
    isSetupFormation: Boolean!
    optionGroupId: OID
    facetBindings: [RSResourceFacetBinding!]!
  }

  type RSResourceFacetBinding {
    id: OID!
    facetName: String!
    facetType: PHID!
    supportedOptions: [OID!]!
  }

  # ---------- Tiers ----------

  enum RSTierPricingMode {
    CALCULATED
    MANUAL_OVERRIDE
  }

  type RSServiceSubscriptionTier {
    id: OID!
    name: String!
    description: String
    isCustomPricing: Boolean!
    pricingMode: RSTierPricingMode
    pricing: RSServicePricing!
    serviceLevels: [RSServiceLevelBinding!]!
    usageLimits: [RSServiceUsageLimit!]!
  }

  type RSServicePricing {
    amount: Amount_Money
    currency: Currency!
  }

  enum RSBillingCycle {
    MONTHLY
    QUARTERLY
    SEMI_ANNUAL
    ANNUAL
    ONE_TIME
  }

  type RSServiceLevelBinding {
    id: OID!
    serviceId: OID!
    level: RSServiceLevel!
    customValue: String
    optionGroupId: OID
  }

  enum RSServiceLevel {
    INCLUDED
    NOT_INCLUDED
    OPTIONAL
    CUSTOM
    VARIABLE
    NOT_APPLICABLE
  }

  type RSServiceUsageLimit {
    id: OID!
    serviceId: OID!
    metric: String!
    unitName: String
    freeLimit: Int
    paidLimit: Int
    resetCycle: RSUsageResetCycle
    notes: String
    unitPrice: Amount_Money
    unitPriceCurrency: Currency
  }

  enum RSUsageResetCycle {
    NONE
    HOURLY
    DAILY
    WEEKLY
    MONTHLY
    QUARTERLY
    SEMI_ANNUAL
    ANNUAL
  }

  # ---------- Option Groups ----------

  enum RSAddOnPricingMode {
    TIER_DEPENDENT
    STANDALONE
  }

  enum RSGroupCostType {
    RECURRING
    SETUP
  }

  type RSOfferingOptionGroup {
    id: OID!
    name: String!
    description: String
    isAddOn: Boolean!
    defaultSelected: Boolean!
    pricingMode: RSAddOnPricingMode
    standalonePricing: RSStandalonePricing
    tierDependentPricing: [RSOptionGroupTierPricing!]
    costType: RSGroupCostType
    availableBillingCycles: [RSBillingCycle!]!
    price: Amount_Money
    currency: Currency
  }

  type RSStandalonePricing {
    setupCost: RSSetupCost
    recurringPricing: [RSRecurringPriceOption!]!
  }

  type RSOptionGroupTierPricing {
    id: OID!
    tierId: OID!
    setupCost: RSSetupCost
    setupCostDiscounts: [RSBillingCycleDiscount!]!
    recurringPricing: [RSRecurringPriceOption!]!
  }

  # ---------- Final Configuration ----------

  type RSResolvedDiscount {
    discountType: RSDiscountType!
    discountValue: Float!
    originalAmount: Amount_Money!
    discountedAmount: Amount_Money!
  }

  type RSFinalOptionGroupConfig {
    id: OID!
    optionGroupId: OID!
    effectiveBillingCycle: RSBillingCycle!
    billingCycleOverridden: Boolean!
    discountStripped: Boolean!
    recurringAmount: Amount_Money
    currency: Currency
    discount: RSResolvedDiscount
    setupCost: Amount_Money
    setupCostCurrency: Currency
    setupCostDiscount: RSResolvedDiscount
  }

  type RSFinalAddOnConfig {
    id: OID!
    optionGroupId: OID!
    selectedBillingCycle: RSBillingCycle!
    recurringAmount: Amount_Money
    currency: Currency
    discount: RSResolvedDiscount
    setupCost: Amount_Money
    setupCostCurrency: Currency
    setupCostDiscount: RSResolvedDiscount
  }

  type RSFinalConfiguration {
    selectedTierId: OID!
    selectedBillingCycle: RSBillingCycle!
    tierBasePrice: Amount_Money
    tierCurrency: Currency!
    optionGroupConfigs: [RSFinalOptionGroupConfig!]!
    addOnConfigs: [RSFinalAddOnConfig!]!
    lastModified: DateTime!
  }
`;
