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
    createProductInstances(
      input: CreateProductInstancesInput!
    ): CreateProductInstancesOutput
  }

  input CreateProductInstancesInput {
    serviceOfferingId: PHID!
    name: String!
    teamName: String!
    customerEmail: EmailAddress
    userSelection: UserSelectionInput!
  }

  input UserSelectionInput {
    tierId: OID!
    billingCycle: RSBillingCycle!
    optionGroupIds: [OID!]!
    groupBillingCycleOverrides: [BillingCycleOverrideInput!]
    addonBillingCycleOverrides: [BillingCycleOverrideInput!]
  }

  input BillingCycleOverrideInput {
    groupId: OID!
    billingCycle: RSBillingCycle!
  }

  type CreateProductInstancesOutput {
    success: Boolean!
    data: JSONObject
    errors: [String!]!
  }

  # ============ Filters ============

  input RSResourceTemplatesFilter {
    id: PHID
    status: [RSTemplateStatus!]
    operatorId: PHID
  }

  input RSServiceOfferingsFilter {
    id: PHID
    status: [RSServiceStatus!]
    operatorId: PHID
    resourceTemplateId: PHID
  }

  # ============ Resource Template Types ============

  enum RSTemplateStatus {
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
    faqFields: [RSFaqField!]!
    contentSections: [RSContentSection!]!
  }

  type RSTargetAudience {
    id: OID!
    label: String!
    color: String
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

  type RSResourceFacetBinding {
    id: OID!
    facetName: String!
    facetType: PHID!
    supportedOptions: [OID!]!
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
    availableBillingCycles: [RSBillingCycle!]!
    facetTargets: [RSFacetTarget!]!
    services: [RSOfferingService!]!
    tiers: [RSServiceSubscriptionTier!]!
    optionGroups: [RSOfferingOptionGroup!]!
  }

  enum RSServiceStatus {
    DRAFT
    COMING_SOON
    ACTIVE
    DEPRECATED
  }

  type RSFacetTarget {
    id: OID!
    categoryKey: String!
    categoryLabel: String!
    selectedOptions: [String!]!
  }

  # ---------- Primitives ----------

  enum RSDiscountType {
    PERCENTAGE
    FIXED_AMOUNT
  }

  enum RSBillingCycle {
    MONTHLY
    QUARTERLY
    SEMI_ANNUAL
    ANNUAL
  }

  type RSBillingCycleDiscount {
    cycle: RSBillingCycle!
    discountType: RSDiscountType!
    discountValue: Float!
  }

  type RSPricing {
    amount: Amount_Money!
    currency: Currency!
  }

  enum RSDiscountMode {
    INHERIT_TIER
    OWN_DISCOUNTS
  }

  # ---------- Services ----------

  type RSOfferingService {
    id: OID!
    title: String!
    description: String
    displayOrder: Int
    isSetupFormation: Boolean!
    optionGroupId: OID
  }

  # ---------- Tiers ----------

  enum RSTierPricingMode {
    CUSTOM
    FIXED
    PER_SEAT
  }

  type RSServiceSubscriptionTier {
    id: OID!
    name: String!
    description: String
    isCustomPricing: Boolean!
    pricingMode: RSTierPricingMode!
    pricing: RSPricing
    defaultBillingCycle: RSBillingCycle
    billingCycleDiscounts: [RSBillingCycleDiscount!]!
    serviceLevels: [RSServiceLevelBinding!]!
    usageLimits: [RSUsageLimit!]!
  }

  type RSServiceLevelBinding {
    id: OID!
    serviceId: OID!
    level: String!
    description: String
  }

  type RSUsageLimit {
    id: OID!
    name: String!
    limit: Int!
    unit: String
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
    pricingMode: RSAddOnPricingMode!
    standalonePricing: RSPricing
    tierDependentPricing: [RSTierDependentPricing!]!
    costType: RSGroupCostType
    availableBillingCycles: [RSBillingCycle!]!
    billingCycleDiscounts: [RSBillingCycleDiscount!]!
    discountMode: RSDiscountMode
    price: Amount_Money
    currency: Currency
  }

  type RSTierDependentPricing {
    tierId: OID!
    amount: Amount_Money!
    currency: Currency!
  }
`;
