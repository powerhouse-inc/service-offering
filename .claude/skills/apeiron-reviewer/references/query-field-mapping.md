# Query Field Mapping

Consumer-specific field lists for subgraph queries. Only include fields that are populated and relevant.

## How to Generate a Consumer Query

1. Read `subgraphs/resources-services/schema.ts` for available types
2. Read `subgraphs/resources-services/resolvers.ts` for what's actually mapped
3. Cross-reference with live document state via MCP `getDocument`
4. Exclude dead weight with explicit comments
5. Date-stamp the verification

### Format

```graphql
# <queryName> — <consumer> (last verified: YYYY-MM-DD)
# Excluded: <field> (<reason>), <field> (<reason>)
query ConsumerSpecificQuery($id: PHID!) {
  queryName(filter: { id: $id }) {
    id
    title
    # ... only live, relevant fields
  }
}
```

---

## Service Offering — Full Query

Last verified: 2026-03-03 against SO-Final branch.

**Excluded from query:**
- `targetAudiences` — removed from offering, lives on resource-template only
- `serviceGroups` — removed, all pricing via optionGroups
- `facetBindings` — removed, facets handled by facetTargets
- `finalConfiguration` — computed snapshot, not needed for catalog display (include if consumer needs pre-computed pricing)

**Remaining dead weight in subgraph schema (cleanup pending):**
- `RSResourceFacetBinding` type — defined but unreferenced after service cleanup
- `facetBindings` on `RSService` (resource-template side) — not mapped in resolver

```graphql
# serviceOfferings — ACHRA Storefront (last verified: 2026-03-03)
query ServiceOfferings {
  serviceOfferings {
    id
    operatorId
    resourceTemplateId
    title
    summary
    description
    thumbnailUrl
    infoLink
    status
    lastModified
    availableBillingCycles
    facetTargets {
      id
      categoryKey
      categoryLabel
      selectedOptions
    }
    services {
      id
      title
      description
      displayOrder
      isSetupFormation
      optionGroupId
    }
    tiers {
      id
      name
      description
      isCustomPricing
      pricingMode
      pricing {
        amount
        currency
      }
      defaultBillingCycle
      billingCycleDiscounts {
        billingCycle
        discountRule {
          discountType
          discountValue
        }
      }
      serviceLevels {
        id
        serviceId
        level
        customValue
        optionGroupId
      }
      usageLimits {
        id
        serviceId
        metric
        unitName
        freeLimit
        paidLimit
        resetCycle
        notes
        unitPrice
        unitPriceCurrency
      }
    }
    optionGroups {
      id
      name
      description
      isAddOn
      defaultSelected
      pricingMode
      standalonePricing {
        setupCost {
          amount
          currency
          discount {
            discountType
            discountValue
          }
        }
        recurringPricing {
          id
          billingCycle
          amount
          currency
          discount {
            discountType
            discountValue
          }
        }
      }
      tierDependentPricing {
        id
        tierId
        setupCost {
          amount
          currency
          discount {
            discountType
            discountValue
          }
        }
        setupCostDiscounts {
          billingCycle
          discountRule {
            discountType
            discountValue
          }
        }
        recurringPricing {
          id
          billingCycle
          amount
          currency
          discount {
            discountType
            discountValue
          }
        }
      }
      costType
      availableBillingCycles
      billingCycleDiscounts {
        billingCycle
        discountRule {
          discountType
          discountValue
        }
      }
      discountMode
      price
      currency
    }
  }
}
```

## Resource Template — Full Query

Last verified: 2026-03-03.

```graphql
# resourceTemplates — ACHRA Storefront (last verified: 2026-03-03)
query ResourceTemplates {
  resourceTemplates {
    id
    operatorId
    title
    summary
    description
    thumbnailUrl
    infoLink
    status
    lastModified
    targetAudiences {
      id
      label
      color
    }
    setupServices
    recurringServices
    facetTargets {
      id
      categoryKey
      categoryLabel
      selectedOptions
    }
    services {
      id
      title
      description
      displayOrder
      parentServiceId
      isSetupFormation
      optionGroupId
    }
    optionGroups {
      id
      name
      description
      isAddOn
      defaultSelected
    }
    faqFields {
      id
      question
      answer
      displayOrder
    }
    contentSections {
      id
      title
      content
      displayOrder
    }
  }
}
```

## createProductInstances Mutation

Last verified: 2026-03-03 against SO-Final branch.

```graphql
mutation CreateProductInstances($input: CreateProductInstancesInput!) {
  createProductInstances(input: $input) {
    success
    data
    errors
  }
}

# Input shape:
# {
#   serviceOfferingId: PHID!
#   name: String!
#   teamName: String!
#   customerEmail: EmailAddress
#   userSelection: {
#     tierId: OID!
#     billingCycle: RSBillingCycle!
#     optionGroupIds: [OID!]!
#     groupBillingCycleOverrides: [{ groupId: OID!, billingCycle: RSBillingCycle! }]
#     addonBillingCycleOverrides: [{ groupId: OID!, billingCycle: RSBillingCycle! }]
#   }
# }
```
