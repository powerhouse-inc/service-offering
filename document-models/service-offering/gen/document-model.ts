import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  description:
    "Document model for defining operator service offerings with subscription tiers, multi-billing cycle pricing options, facet bindings, usage limits with overage pricing, for the ACHRA Marketplace.",
  extension: "",
  id: "powerhouse/service-offering",
  name: "ServiceOffering",
  specifications: [
    {
      changeLog: [],
      modules: [
        {
          description: "Operations for managing services in the offering",
          id: "service-management",
          name: "Service Management",
          operations: [
            {
              description: "Adds a new service to the offering",
              errors: [
                {
                  code: "DUPLICATE_SERVICE_ID",
                  description: "A service with this ID already exists",
                  id: "duplicate-service-id",
                  name: "DuplicateServiceIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-service",
              name: "ADD_SERVICE",
              reducer:
                "state.services.push({\n    id: action.input.id,\n    title: action.input.title,\n    description: action.input.description || null,\n    serviceGroupId: action.input.serviceGroupId || null,\n    displayOrder: action.input.displayOrder || null,\n    isSetupFormation: action.input.isSetupFormation || false,\n    optionGroupId: action.input.optionGroupId || null,\n    costType: action.input.costType || null,\n    price: action.input.price || null,\n    currency: action.input.currency || null,\n    facetBindings: []\n});\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddServiceInput {\n    id: OID!\n    title: String!\n    description: String\n    serviceGroupId: OID\n    displayOrder: Int\n    isSetupFormation: Boolean\n    optionGroupId: OID\n    costType: ServiceCostType\n    price: Amount_Money\n    currency: Currency\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds a new service to the offering",
            },
            {
              description: "Updates an existing service",
              errors: [
                {
                  code: "UPDATE_SERVICE_NOT_FOUND",
                  description: "Service with the specified ID does not exist",
                  id: "service-not-found",
                  name: "UpdateServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-service",
              name: "UPDATE_SERVICE",
              reducer:
                "const service = state.services.find(s => s.id === action.input.id);\nif (service) {\n    if (action.input.title) {\n        service.title = action.input.title;\n    }\n    if (action.input.description !== undefined && action.input.description !== null) {\n        service.description = action.input.description;\n    }\n    if (action.input.serviceGroupId !== undefined) {\n        service.serviceGroupId = action.input.serviceGroupId || null;\n    }\n    if (action.input.displayOrder !== undefined && action.input.displayOrder !== null) {\n        service.displayOrder = action.input.displayOrder;\n    }\n    if (action.input.isSetupFormation !== undefined && action.input.isSetupFormation !== null) {\n        service.isSetupFormation = action.input.isSetupFormation;\n    }\n    if (action.input.optionGroupId !== undefined) {\n        service.optionGroupId = action.input.optionGroupId || null;\n    }\n    if (action.input.costType !== undefined) {\n        service.costType = action.input.costType || null;\n    }\n    if (action.input.price !== undefined) {\n        service.price = action.input.price || null;\n    }\n    if (action.input.currency !== undefined) {\n        service.currency = action.input.currency || null;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateServiceInput {\n    id: OID!\n    title: String\n    description: String\n    serviceGroupId: OID\n    displayOrder: Int\n    isSetupFormation: Boolean\n    optionGroupId: OID\n    costType: ServiceCostType\n    price: Amount_Money\n    currency: Currency\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates an existing service",
            },
            {
              description: "Removes a service from the offering",
              errors: [
                {
                  code: "DELETE_SERVICE_NOT_FOUND",
                  description: "Service with the specified ID does not exist",
                  id: "service-not-found-delete",
                  name: "DeleteServiceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "delete-service",
              name: "DELETE_SERVICE",
              reducer:
                "const serviceIndex = state.services.findIndex(s => s.id === action.input.id);\nif (serviceIndex !== -1) {\n    state.tiers.forEach(tier => {\n        tier.serviceLevels = tier.serviceLevels.filter(sl => sl.serviceId !== action.input.id);\n    });\n    state.services.splice(serviceIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input DeleteServiceInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a service from the offering",
            },
            {
              description: "Adds a facet binding to a service",
              errors: [
                {
                  code: "ADD_FACET_SERVICE_NOT_FOUND",
                  description: "Service with the specified ID does not exist",
                  id: "service-not-found-facet",
                  name: "AddFacetServiceNotFoundError",
                  template: "",
                },
                {
                  code: "DUPLICATE_BINDING_ID",
                  description: "A facet binding with this ID already exists",
                  id: "duplicate-binding-id",
                  name: "DuplicateBindingIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-facet-binding",
              name: "ADD_FACET_BINDING",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    service.facetBindings.push({\n        id: action.input.bindingId,\n        facetName: action.input.facetName,\n        facetType: action.input.facetType,\n        supportedOptions: action.input.supportedOptions\n    });\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddFacetBindingInput {\n    serviceId: OID!\n    bindingId: OID!\n    facetName: String!\n    facetType: PHID!\n    supportedOptions: [OID!]!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds a facet binding to a service",
            },
            {
              description: "Removes a facet binding from a service",
              errors: [
                {
                  code: "REMOVE_FACET_SERVICE_NOT_FOUND",
                  description: "Service with the specified ID does not exist",
                  id: "service-not-found-remove-binding",
                  name: "RemoveFacetServiceNotFoundError",
                  template: "",
                },
                {
                  code: "BINDING_NOT_FOUND",
                  description:
                    "Facet binding with the specified ID does not exist",
                  id: "binding-not-found",
                  name: "BindingNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-facet-binding",
              name: "REMOVE_FACET_BINDING",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const bindingIndex = service.facetBindings.findIndex(fb => fb.id === action.input.bindingId);\n    if (bindingIndex !== -1) {\n        service.facetBindings.splice(bindingIndex, 1);\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveFacetBindingInput {\n    serviceId: OID!\n    bindingId: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a facet binding from a service",
            },
          ],
        },
        {
          description: "Operations for managing subscription tiers",
          id: "tier-management",
          name: "Tier Management",
          operations: [
            {
              description: "Adds a new subscription tier",
              errors: [
                {
                  code: "DUPLICATE_TIER_ID",
                  description: "A tier with this ID already exists",
                  id: "duplicate-tier-id",
                  name: "DuplicateTierIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-tier",
              name: "ADD_TIER",
              reducer:
                "state.tiers.push({\n    id: action.input.id,\n    name: action.input.name,\n    description: action.input.description || null,\n    serviceLevels: [],\n    usageLimits: [],\n    pricing: {\n        amount: action.input.amount || null,\n        currency: action.input.currency\n    },\n    pricingOptions: [],\n    isCustomPricing: action.input.isCustomPricing || false\n});\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddTierInput {\n    id: OID!\n    name: String!\n    description: String\n    amount: Amount_Money\n    currency: Currency!\n    isCustomPricing: Boolean\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds a new subscription tier",
            },
            {
              description: "Updates an existing tier",
              errors: [
                {
                  code: "UPDATE_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found",
                  name: "UpdateTierNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-tier",
              name: "UPDATE_TIER",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.id);\nif (tier) {\n    if (action.input.name) {\n        tier.name = action.input.name;\n    }\n    if (action.input.description !== undefined && action.input.description !== null) {\n        tier.description = action.input.description;\n    }\n    if (action.input.isCustomPricing !== undefined && action.input.isCustomPricing !== null) {\n        tier.isCustomPricing = action.input.isCustomPricing;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateTierInput {\n    id: OID!\n    name: String\n    description: String\n    isCustomPricing: Boolean\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates an existing tier",
            },
            {
              description: "Updates pricing for a tier",
              errors: [
                {
                  code: "UPDATE_PRICING_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-pricing",
                  name: "UpdatePricingTierNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-tier-pricing",
              name: "UPDATE_TIER_PRICING",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (tier) {\n    if (action.input.amount !== undefined) {\n        tier.pricing.amount = action.input.amount;\n    }\n    if (action.input.currency) {\n        tier.pricing.currency = action.input.currency;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateTierPricingInput {\n    tierId: OID!\n    amount: Amount_Money\n    currency: Currency\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates pricing for a tier",
            },
            {
              description: "Removes a tier from the offering",
              errors: [
                {
                  code: "DELETE_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-delete",
                  name: "DeleteTierNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "delete-tier",
              name: "DELETE_TIER",
              reducer:
                "const tierIndex = state.tiers.findIndex(t => t.id === action.input.id);\nif (tierIndex !== -1) {\n    state.tiers.splice(tierIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input DeleteTierInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a tier from the offering",
            },
            {
              description:
                "Adds a pricing option with a specific billing cycle to a tier",
              errors: [
                {
                  code: "ADD_PRICING_OPTION_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "add-pricing-option-tier-not-found",
                  name: "AddPricingOptionTierNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-tier-pricing-option",
              name: "ADD_TIER_PRICING_OPTION",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (!tier) {\n    throw new AddPricingOptionTierNotFoundError('Tier with the specified ID does not exist');\n}\nconst isDefault = action.input.isDefault || tier.pricingOptions.length === 0;\nif (isDefault) {\n    tier.pricingOptions.forEach(po => { po.isDefault = false; });\n}\ntier.pricingOptions.push({\n    id: action.input.pricingOptionId,\n    amount: action.input.amount,\n    currency: action.input.currency,\n    isDefault: isDefault\n});\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddTierPricingOptionInput {\n    tierId: OID!\n    pricingOptionId: OID!\n    amount: Amount_Money!\n    currency: Currency!\n    isDefault: Boolean\n    lastModified: DateTime!\n}",
              scope: "global",
              template:
                "Adds a pricing option with a specific billing cycle to a tier",
            },
            {
              description: "Updates a pricing option for a tier",
              errors: [
                {
                  code: "UPDATE_PRICING_OPTION_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "update-pricing-option-tier-not-found",
                  name: "UpdatePricingOptionTierNotFoundError",
                  template: "",
                },
                {
                  code: "PRICING_OPTION_NOT_FOUND",
                  description:
                    "Pricing option with the specified ID does not exist",
                  id: "pricing-option-not-found",
                  name: "PricingOptionNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-tier-pricing-option",
              name: "UPDATE_TIER_PRICING_OPTION",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (!tier) {\n    throw new UpdatePricingOptionTierNotFoundError('Tier with the specified ID does not exist');\n}\nconst pricingOption = tier.pricingOptions.find(po => po.id === action.input.pricingOptionId);\nif (!pricingOption) {\n    throw new PricingOptionNotFoundError('Pricing option with the specified ID does not exist');\n}\nif (action.input.amount !== undefined && action.input.amount !== null) {\n    pricingOption.amount = action.input.amount;\n}\nif (action.input.currency) {\n    pricingOption.currency = action.input.currency;\n}\nif (action.input.isDefault === true) {\n    tier.pricingOptions.forEach(po => { po.isDefault = false; });\n    pricingOption.isDefault = true;\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateTierPricingOptionInput {\n    tierId: OID!\n    pricingOptionId: OID!\n    amount: Amount_Money\n    currency: Currency\n    isDefault: Boolean\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates a pricing option for a tier",
            },
            {
              description: "Removes a pricing option from a tier",
              errors: [
                {
                  code: "REMOVE_PRICING_OPTION_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "remove-pricing-option-tier-not-found",
                  name: "RemovePricingOptionTierNotFoundError",
                  template: "",
                },
                {
                  code: "REMOVE_PRICING_OPTION_NOT_FOUND",
                  description:
                    "Pricing option with the specified ID does not exist",
                  id: "remove-pricing-option-not-found",
                  name: "RemovePricingOptionNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-tier-pricing-option",
              name: "REMOVE_TIER_PRICING_OPTION",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (!tier) {\n    throw new RemovePricingOptionTierNotFoundError('Tier with the specified ID does not exist');\n}\nconst optionIndex = tier.pricingOptions.findIndex(po => po.id === action.input.pricingOptionId);\nif (optionIndex === -1) {\n    throw new RemovePricingOptionNotFoundError('Pricing option with the specified ID does not exist');\n}\nconst wasDefault = tier.pricingOptions[optionIndex].isDefault;\ntier.pricingOptions.splice(optionIndex, 1);\nif (wasDefault && tier.pricingOptions.length > 0) {\n    tier.pricingOptions[0].isDefault = true;\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveTierPricingOptionInput {\n    tierId: OID!\n    pricingOptionId: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a pricing option from a tier",
            },
            {
              description: "Adds a service level binding to a tier",
              errors: [
                {
                  code: "ADD_SERVICE_LEVEL_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-service-level",
                  name: "AddServiceLevelTierNotFoundError",
                  template: "",
                },
                {
                  code: "DUPLICATE_SERVICE_LEVEL_ID",
                  description: "A service level with this ID already exists",
                  id: "duplicate-service-level-id",
                  name: "DuplicateServiceLevelIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-service-level",
              name: "ADD_SERVICE_LEVEL",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (tier) {\n    tier.serviceLevels.push({\n        id: action.input.serviceLevelId,\n        serviceId: action.input.serviceId,\n        level: action.input.level,\n        optionGroupId: action.input.optionGroupId || null,\n        customValue: action.input.customValue || null\n    });\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddServiceLevelInput {\n    tierId: OID!\n    serviceLevelId: OID!\n    serviceId: OID!\n    level: ServiceLevel!\n    optionGroupId: OID\n    customValue: String\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds a service level binding to a tier",
            },
            {
              description: "Updates a service level binding",
              errors: [
                {
                  code: "UPDATE_SERVICE_LEVEL_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-update-sl",
                  name: "UpdateServiceLevelTierNotFoundError",
                  template: "",
                },
                {
                  code: "UPDATE_SERVICE_LEVEL_NOT_FOUND",
                  description:
                    "Service level with the specified ID does not exist",
                  id: "service-level-not-found",
                  name: "UpdateServiceLevelNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-service-level",
              name: "UPDATE_SERVICE_LEVEL",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (tier) {\n    const serviceLevel = tier.serviceLevels.find(sl => sl.id === action.input.serviceLevelId);\n    if (serviceLevel) {\n        if (action.input.level) {\n            serviceLevel.level = action.input.level;\n        }\n        if (action.input.optionGroupId !== undefined) {\n            serviceLevel.optionGroupId = action.input.optionGroupId || null;\n        }\n        if (action.input.customValue !== undefined) {\n            serviceLevel.customValue = action.input.customValue || null;\n        }\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateServiceLevelInput {\n    tierId: OID!\n    serviceLevelId: OID!\n    level: ServiceLevel\n    optionGroupId: OID\n    customValue: String\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates a service level binding",
            },
            {
              description: "Removes a service level binding from a tier",
              errors: [
                {
                  code: "REMOVE_SERVICE_LEVEL_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-remove-sl",
                  name: "RemoveServiceLevelTierNotFoundError",
                  template: "",
                },
                {
                  code: "REMOVE_SERVICE_LEVEL_NOT_FOUND",
                  description:
                    "Service level with the specified ID does not exist",
                  id: "service-level-not-found-remove",
                  name: "RemoveServiceLevelNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-service-level",
              name: "REMOVE_SERVICE_LEVEL",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (tier) {\n    const serviceLevelIndex = tier.serviceLevels.findIndex(sl => sl.id === action.input.serviceLevelId);\n    if (serviceLevelIndex !== -1) {\n        tier.serviceLevels.splice(serviceLevelIndex, 1);\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveServiceLevelInput {\n    tierId: OID!\n    serviceLevelId: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a service level binding from a tier",
            },
            {
              description:
                "Adds a usage limit to a tier with optional overage pricing",
              errors: [
                {
                  code: "ADD_USAGE_LIMIT_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-usage-limit",
                  name: "AddUsageLimitTierNotFoundError",
                  template: "",
                },
                {
                  code: "DUPLICATE_USAGE_LIMIT_ID",
                  description: "A usage limit with this ID already exists",
                  id: "duplicate-usage-limit-id",
                  name: "DuplicateUsageLimitIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-usage-limit",
              name: "ADD_USAGE_LIMIT",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (tier) {\n    tier.usageLimits.push({\n        id: action.input.limitId,\n        serviceId: action.input.serviceId,\n        metric: action.input.metric,\n        unitName: action.input.unitName || null,\n        freeLimit: action.input.freeLimit || null,\n        paidLimit: action.input.paidLimit || null,\n        resetCycle: action.input.resetCycle || null,\n        notes: action.input.notes || null,\n        unitPrice: action.input.unitPrice || null,\n        unitPriceCurrency: action.input.unitPriceCurrency || null\n    });\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddUsageLimitInput {\n    tierId: OID!\n    limitId: OID!\n    serviceId: OID!\n    metric: String!\n    unitName: String\n    freeLimit: Int\n    paidLimit: Int\n    resetCycle: UsageResetCycle\n    notes: String\n    unitPrice: Amount_Money\n    unitPriceCurrency: Currency\n    lastModified: DateTime!\n}",
              scope: "global",
              template:
                "Adds a usage limit to a tier with optional overage pricing",
            },
            {
              description: "Updates a usage limit including overage pricing",
              errors: [
                {
                  code: "UPDATE_USAGE_LIMIT_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-update-limit",
                  name: "UpdateUsageLimitTierNotFoundError",
                  template: "",
                },
                {
                  code: "UPDATE_USAGE_LIMIT_NOT_FOUND",
                  description:
                    "Usage limit with the specified ID does not exist",
                  id: "usage-limit-not-found",
                  name: "UpdateUsageLimitNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-usage-limit",
              name: "UPDATE_USAGE_LIMIT",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (tier) {\n    const usageLimit = tier.usageLimits.find(ul => ul.id === action.input.limitId);\n    if (usageLimit) {\n        if (action.input.metric) {\n            usageLimit.metric = action.input.metric;\n        }\n        if (action.input.unitName !== undefined) {\n            usageLimit.unitName = action.input.unitName || null;\n        }\n        if (action.input.freeLimit !== undefined && action.input.freeLimit !== null) {\n            usageLimit.freeLimit = action.input.freeLimit;\n        }\n        if (action.input.paidLimit !== undefined && action.input.paidLimit !== null) {\n            usageLimit.paidLimit = action.input.paidLimit;\n        }\n        if (action.input.resetCycle !== undefined) {\n            usageLimit.resetCycle = action.input.resetCycle || null;\n        }\n        if (action.input.notes !== undefined) {\n            usageLimit.notes = action.input.notes || null;\n        }\n        if (action.input.unitPrice !== undefined) {\n            usageLimit.unitPrice = action.input.unitPrice || null;\n        }\n        if (action.input.unitPriceCurrency !== undefined) {\n            usageLimit.unitPriceCurrency = action.input.unitPriceCurrency || null;\n        }\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateUsageLimitInput {\n    tierId: OID!\n    limitId: OID!\n    metric: String\n    unitName: String\n    freeLimit: Int\n    paidLimit: Int\n    resetCycle: UsageResetCycle\n    notes: String\n    unitPrice: Amount_Money\n    unitPriceCurrency: Currency\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates a usage limit including overage pricing",
            },
            {
              description: "Removes a usage limit from a tier",
              errors: [
                {
                  code: "REMOVE_USAGE_LIMIT_TIER_NOT_FOUND",
                  description: "Tier with the specified ID does not exist",
                  id: "tier-not-found-remove-limit",
                  name: "RemoveUsageLimitTierNotFoundError",
                  template: "",
                },
                {
                  code: "REMOVE_USAGE_LIMIT_NOT_FOUND",
                  description:
                    "Usage limit with the specified ID does not exist",
                  id: "usage-limit-not-found-remove",
                  name: "RemoveUsageLimitNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-usage-limit",
              name: "REMOVE_USAGE_LIMIT",
              reducer:
                "const tier = state.tiers.find(t => t.id === action.input.tierId);\nif (tier) {\n    const limitIndex = tier.usageLimits.findIndex(ul => ul.id === action.input.limitId);\n    if (limitIndex !== -1) {\n        tier.usageLimits.splice(limitIndex, 1);\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveUsageLimitInput {\n    tierId: OID!\n    limitId: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a usage limit from a tier",
            },
          ],
        },
        {
          description: "Operations for managing offering metadata",
          id: "offering-management",
          name: "Offering Management",
          operations: [
            {
              description: "Updates offering title, summary, and info link",
              errors: [],
              examples: [],
              id: "update-offering-info",
              name: "UPDATE_OFFERING_INFO",
              reducer:
                "if (action.input.title) {\n    state.title = action.input.title;\n}\nif (action.input.summary) {\n    state.summary = action.input.summary;\n}\nif (action.input.description !== undefined) {\n    state.description = action.input.description || null;\n}\nif (action.input.thumbnailUrl !== undefined) {\n    state.thumbnailUrl = action.input.thumbnailUrl || null;\n}\nif (action.input.infoLink !== undefined) {\n    state.infoLink = action.input.infoLink || null;\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateOfferingInfoInput {\n    title: String\n    summary: String\n    description: String\n    thumbnailUrl: URL\n    infoLink: URL\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates offering title, summary, and info link",
            },
            {
              description: "Updates the offering status",
              errors: [],
              examples: [],
              id: "update-offering-status",
              name: "UPDATE_OFFERING_STATUS",
              reducer:
                "state.status = action.input.status;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateOfferingStatusInput {\n    status: ServiceStatus!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates the offering status",
            },
            {
              description: "Sets the operator for this offering",
              errors: [],
              examples: [],
              id: "set-operator",
              name: "SET_OPERATOR",
              reducer:
                "state.operatorId = action.input.operatorId;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input SetOperatorInput {\n    operatorId: PHID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Sets the operator for this offering",
            },
            {
              description: "Sets the unique identifier for the offering",
              errors: [],
              examples: [],
              id: "set-offering-id",
              name: "SET_OFFERING_ID",
              reducer:
                "state.id = action.input.id;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input SetOfferingIdInput {\n    id: PHID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Sets the unique identifier for the offering",
            },
            {
              description: "Adds a target audience tag to the offering",
              errors: [
                {
                  code: "DUPLICATE_TARGET_AUDIENCE_ID",
                  description: "A target audience with this ID already exists",
                  id: "duplicate-target-audience-id",
                  name: "DuplicateTargetAudienceIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-target-audience",
              name: "ADD_TARGET_AUDIENCE",
              reducer:
                "state.targetAudiences.push({\n    id: action.input.id,\n    label: action.input.label,\n    color: action.input.color || null\n});\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddTargetAudienceInput {\n    id: OID!\n    label: String!\n    color: String\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds a target audience tag to the offering",
            },
            {
              description: "Removes a target audience tag from the offering",
              errors: [
                {
                  code: "TARGET_AUDIENCE_NOT_FOUND",
                  description:
                    "Target audience with the specified ID does not exist",
                  id: "target-audience-not-found",
                  name: "TargetAudienceNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-target-audience",
              name: "REMOVE_TARGET_AUDIENCE",
              reducer:
                "const audienceIndex = state.targetAudiences.findIndex(a => a.id === action.input.id);\nif (audienceIndex !== -1) {\n    state.targetAudiences.splice(audienceIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveTargetAudienceInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a target audience tag from the offering",
            },
            {
              description: "Sets or updates facet targeting for a category",
              errors: [],
              examples: [],
              id: "set-facet-target",
              name: "SET_FACET_TARGET",
              reducer:
                "const existingIndex = state.facetTargets.findIndex(ft => ft.categoryKey === action.input.categoryKey);\nif (existingIndex !== -1) {\n    state.facetTargets[existingIndex] = {\n        id: action.input.id,\n        categoryKey: action.input.categoryKey,\n        categoryLabel: action.input.categoryLabel,\n        selectedOptions: action.input.selectedOptions\n    };\n} else {\n    state.facetTargets.push({\n        id: action.input.id,\n        categoryKey: action.input.categoryKey,\n        categoryLabel: action.input.categoryLabel,\n        selectedOptions: action.input.selectedOptions\n    });\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input SetFacetTargetInput {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOptions: [String!]!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Sets or updates facet targeting for a category",
            },
            {
              description: "Removes facet targeting for a category",
              errors: [
                {
                  code: "FACET_TARGET_NOT_FOUND",
                  description:
                    "Facet target for the specified category does not exist",
                  id: "facet-target-not-found",
                  name: "FacetTargetNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "remove-facet-target",
              name: "REMOVE_FACET_TARGET",
              reducer:
                "const targetIndex = state.facetTargets.findIndex(ft => ft.categoryKey === action.input.categoryKey);\nif (targetIndex !== -1) {\n    state.facetTargets.splice(targetIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveFacetTargetInput {\n    categoryKey: String!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes facet targeting for a category",
            },
            {
              description: "Adds an option to a facet target",
              errors: [
                {
                  code: "FACET_TARGET_NOT_FOUND_ADD_OPTION",
                  description:
                    "Facet target for the specified category does not exist",
                  id: "add-facet-option-not-found",
                  name: "AddFacetOptionTargetNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-facet-option",
              name: "ADD_FACET_OPTION",
              reducer:
                "const facetTarget = state.facetTargets.find(ft => ft.categoryKey === action.input.categoryKey);\nif (facetTarget && !facetTarget.selectedOptions.includes(action.input.optionId)) {\n    facetTarget.selectedOptions.push(action.input.optionId);\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddFacetOptionInput {\n    categoryKey: String!\n    optionId: String!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds an option to a facet target",
            },
            {
              description: "Removes an option from a facet target",
              errors: [],
              examples: [],
              id: "remove-facet-option",
              name: "REMOVE_FACET_OPTION",
              reducer:
                "const facetTarget = state.facetTargets.find(\n  (ft) => ft.categoryKey === action.input.categoryKey\n);\n\nif (facetTarget) {\n  const optionIndex = facetTarget.selectedOptions.indexOf(action.input.optionId);\n  if (optionIndex !== -1) {\n    facetTarget.selectedOptions.splice(optionIndex, 1);\n  }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input RemoveFacetOptionInput {\n    categoryKey: String!\n    optionId: String!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes an option from a facet target",
            },
            {
              description:
                "Selects a resource template for this service offering",
              errors: [
                {
                  code: "TEMPLATE_ALREADY_SELECTED",
                  description:
                    "A resource template has already been selected. Use CHANGE_RESOURCE_TEMPLATE to change it.",
                  id: "template-already-selected",
                  name: "TemplateAlreadySelectedError",
                  template: "",
                },
              ],
              examples: [],
              id: "select-resource-template",
              name: "SELECT_RESOURCE_TEMPLATE",
              reducer:
                "if (state.resourceTemplateId) {\n    throw new TemplateAlreadySelectedError('A resource template has already been selected. Use CHANGE_RESOURCE_TEMPLATE to change it.');\n}\nstate.resourceTemplateId = action.input.resourceTemplateId;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input SelectResourceTemplateInput {\n    resourceTemplateId: PHID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Selects a resource template for this service offering",
            },
            {
              description:
                "Changes the resource template for this service offering",
              errors: [
                {
                  code: "NO_TEMPLATE_SELECTED",
                  description:
                    "No resource template has been selected yet. Use SELECT_RESOURCE_TEMPLATE first.",
                  id: "no-template-selected",
                  name: "NoTemplateSelectedError",
                  template: "",
                },
                {
                  code: "TEMPLATE_MISMATCH",
                  description:
                    "The previous template ID does not match the currently selected template.",
                  id: "template-mismatch",
                  name: "TemplateMismatchError",
                  template: "",
                },
              ],
              examples: [],
              id: "change-resource-template",
              name: "CHANGE_RESOURCE_TEMPLATE",
              reducer:
                "if (!state.resourceTemplateId) {\n    throw new NoTemplateSelectedError('No resource template has been selected yet. Use SELECT_RESOURCE_TEMPLATE first.');\n}\nif (state.resourceTemplateId !== action.input.previousTemplateId) {\n    throw new TemplateMismatchError('The previous template ID does not match the currently selected template.');\n}\nstate.resourceTemplateId = action.input.newTemplateId;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input ChangeResourceTemplateInput {\n    previousTemplateId: PHID!\n    newTemplateId: PHID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template:
                "Changes the resource template for this service offering",
            },
          ],
        },
        {
          description:
            "Operations for managing option groups (selectable add-on sections)",
          id: "option-group-management",
          name: "Option Group Management",
          operations: [
            {
              description: "Adds a new option group to the offering",
              errors: [
                {
                  code: "DUPLICATE_OPTION_GROUP_ID",
                  description: "An option group with this ID already exists",
                  id: "duplicate-option-group-id",
                  name: "DuplicateOptionGroupIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-option-group",
              name: "ADD_OPTION_GROUP",
              reducer:
                "state.optionGroups.push({\n    id: action.input.id,\n    name: action.input.name,\n    description: action.input.description || null,\n    isAddOn: action.input.isAddOn,\n    defaultSelected: action.input.defaultSelected,\n    costType: action.input.costType || null,\n    billingCycle: action.input.billingCycle || null,\n    price: action.input.price || null,\n    currency: action.input.currency || null\n});\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddOptionGroupInput {\n    id: OID!\n    name: String!\n    description: String\n    isAddOn: Boolean!\n    defaultSelected: Boolean!\n    costType: GroupCostType\n    billingCycle: BillingCycle\n    price: Amount_Money\n    currency: Currency\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Adds a new option group to the offering",
            },
            {
              description: "Updates an existing option group",
              errors: [
                {
                  code: "UPDATE_OPTION_GROUP_NOT_FOUND",
                  description:
                    "Option group with the specified ID does not exist",
                  id: "option-group-not-found",
                  name: "UpdateOptionGroupNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-option-group",
              name: "UPDATE_OPTION_GROUP",
              reducer:
                "const optionGroup = state.optionGroups.find(og => og.id === action.input.id);\nif (optionGroup) {\n    if (action.input.name) {\n        optionGroup.name = action.input.name;\n    }\n    if (action.input.description !== undefined && action.input.description !== null) {\n        optionGroup.description = action.input.description;\n    }\n    if (action.input.isAddOn !== undefined && action.input.isAddOn !== null) {\n        optionGroup.isAddOn = action.input.isAddOn;\n    }\n    if (action.input.defaultSelected !== undefined && action.input.defaultSelected !== null) {\n        optionGroup.defaultSelected = action.input.defaultSelected;\n    }\n    if (action.input.costType !== undefined) {\n        optionGroup.costType = action.input.costType || null;\n    }\n    if (action.input.billingCycle !== undefined) {\n        optionGroup.billingCycle = action.input.billingCycle || null;\n    }\n    if (action.input.price !== undefined) {\n        optionGroup.price = action.input.price || null;\n    }\n    if (action.input.currency !== undefined) {\n        optionGroup.currency = action.input.currency || null;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateOptionGroupInput {\n    id: OID!\n    name: String\n    description: String\n    isAddOn: Boolean\n    defaultSelected: Boolean\n    costType: GroupCostType\n    billingCycle: BillingCycle\n    price: Amount_Money\n    currency: Currency\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates an existing option group",
            },
            {
              description: "Removes an option group from the offering",
              errors: [
                {
                  code: "DELETE_OPTION_GROUP_NOT_FOUND",
                  description:
                    "Option group with the specified ID does not exist",
                  id: "option-group-not-found-delete",
                  name: "DeleteOptionGroupNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "delete-option-group",
              name: "DELETE_OPTION_GROUP",
              reducer:
                "const optionGroupIndex = state.optionGroups.findIndex(og => og.id === action.input.id);\nif (optionGroupIndex !== -1) {\n    state.tiers.forEach(tier => {\n        tier.serviceLevels.forEach(sl => {\n            if (sl.optionGroupId === action.input.id) {\n                sl.optionGroupId = null;\n            }\n        });\n    });\n    state.optionGroups.splice(optionGroupIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input DeleteOptionGroupInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes an option group from the offering",
            },
          ],
        },
        {
          description:
            "Operations for managing service groups that organize core services with billing cycles",
          id: "service-group-management",
          name: "Service Group Management",
          operations: [
            {
              description:
                "Adds a new service group to organize core services with a billing cycle",
              errors: [
                {
                  code: "DUPLICATE_SERVICE_GROUP_ID",
                  description: "A service group with this ID already exists",
                  id: "duplicate-service-group-id",
                  name: "DuplicateServiceGroupIdError",
                  template: "",
                },
              ],
              examples: [],
              id: "add-service-group",
              name: "ADD_SERVICE_GROUP",
              reducer:
                "const existing = state.serviceGroups.find(sg => sg.id === action.input.id);\nif (existing) {\n    throw new DuplicateServiceGroupIdError('A service group with this ID already exists');\n}\nstate.serviceGroups.push({\n    id: action.input.id,\n    name: action.input.name,\n    description: action.input.description || null,\n    billingCycle: action.input.billingCycle,\n    displayOrder: action.input.displayOrder || null\n});\nstate.lastModified = action.input.lastModified;",
              schema:
                "input AddServiceGroupInput {\n    id: OID!\n    name: String!\n    description: String\n    billingCycle: BillingCycle!\n    displayOrder: Int\n    lastModified: DateTime!\n}",
              scope: "global",
              template:
                "Adds a new service group to organize core services with a billing cycle",
            },
            {
              description: "Updates an existing service group",
              errors: [
                {
                  code: "SERVICE_GROUP_NOT_FOUND",
                  description:
                    "Service group with the specified ID does not exist",
                  id: "service-group-not-found",
                  name: "ServiceGroupNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "update-service-group",
              name: "UPDATE_SERVICE_GROUP",
              reducer:
                "const serviceGroup = state.serviceGroups.find(sg => sg.id === action.input.id);\nif (!serviceGroup) {\n    throw new ServiceGroupNotFoundError('Service group with the specified ID does not exist');\n}\nif (action.input.name) {\n    serviceGroup.name = action.input.name;\n}\nif (action.input.description !== undefined && action.input.description !== null) {\n    serviceGroup.description = action.input.description;\n}\nif (action.input.billingCycle) {\n    serviceGroup.billingCycle = action.input.billingCycle;\n}\nif (action.input.displayOrder !== undefined && action.input.displayOrder !== null) {\n    serviceGroup.displayOrder = action.input.displayOrder;\n}\nstate.lastModified = action.input.lastModified;",
              schema:
                "input UpdateServiceGroupInput {\n    id: OID!\n    name: String\n    description: String\n    billingCycle: BillingCycle\n    displayOrder: Int\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Updates an existing service group",
            },
            {
              description: "Removes a service group and unlinks its services",
              errors: [
                {
                  code: "DELETE_SERVICE_GROUP_NOT_FOUND",
                  description:
                    "Service group with the specified ID does not exist",
                  id: "delete-service-group-not-found",
                  name: "DeleteServiceGroupNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "delete-service-group",
              name: "DELETE_SERVICE_GROUP",
              reducer:
                "const groupIndex = state.serviceGroups.findIndex(sg => sg.id === action.input.id);\nif (groupIndex === -1) {\n    throw new DeleteServiceGroupNotFoundError('Service group with the specified ID does not exist');\n}\nstate.services.forEach(service => {\n    if (service.serviceGroupId === action.input.id) {\n        service.serviceGroupId = null;\n    }\n});\nstate.serviceGroups.splice(groupIndex, 1);\nstate.lastModified = action.input.lastModified;",
              schema:
                "input DeleteServiceGroupInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Removes a service group and unlinks its services",
            },
            {
              description: "Changes the display order of service groups",
              errors: [
                {
                  code: "SERVICE_GROUP_NOT_FOUND_REORDER",
                  description: "Service group not found during reorder",
                  id: "reorder-service-group-not-found",
                  name: "ReorderServiceGroupNotFoundError",
                  template: "",
                },
              ],
              examples: [],
              id: "reorder-service-groups",
              name: "REORDER_SERVICE_GROUPS",
              reducer:
                "const reordered = action.input.order.map((id, index) => {\n    const group = state.serviceGroups.find(sg => sg.id === id);\n    if (!group) {\n        throw new ServiceGroupNotFoundError('Service group with ID ' + id + ' not found during reorder');\n    }\n    group.displayOrder = index;\n    return group;\n});\nstate.serviceGroups = reordered;\nstate.lastModified = action.input.lastModified;",
              schema:
                "input ReorderServiceGroupsInput {\n    order: [OID!]!\n    lastModified: DateTime!\n}",
              scope: "global",
              template: "Changes the display order of service groups",
            },
          ],
        },
      ],
      state: {
        global: {
          examples: [],
          initialValue:
            '{\n    "id": "",\n    "operatorId": "",\n    "resourceTemplateId": null,\n    "title": "",\n    "summary": "",\n    "description": null,\n    "thumbnailUrl": null,\n    "infoLink": null,\n    "status": "DRAFT",\n    "lastModified": "1970-01-01T00:00:00.000Z",\n    "targetAudiences": [],\n    "facetTargets": [],\n    "serviceGroups": [],\n    "services": [],\n    "tiers": [],\n    "optionGroups": []\n}',
          schema:
            "type ServiceOfferingState {\n    id: PHID!\n    operatorId: PHID!\n    resourceTemplateId: PHID\n    title: String!\n    summary: String!\n    description: String\n    thumbnailUrl: URL\n    infoLink: URL\n    status: ServiceStatus!\n    lastModified: DateTime!\n    targetAudiences: [TargetAudience!]!\n    facetTargets: [FacetTarget!]!\n    serviceGroups: [ServiceGroup!]!\n    services: [Service!]!\n    tiers: [ServiceSubscriptionTier!]!\n    optionGroups: [OptionGroup!]!\n}\n\nenum ServiceStatus {\n    DRAFT\n    COMING_SOON\n    ACTIVE\n    DEPRECATED\n}\n\ntype TargetAudience {\n    id: OID!\n    label: String!\n    color: String\n}\n\ntype FacetTarget {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOptions: [String!]!\n}\n\ntype ServiceGroup {\n    id: OID!\n    name: String!\n    description: String\n    billingCycle: BillingCycle!\n    displayOrder: Int\n}\n\ntype Service {\n    id: OID!\n    title: String!\n    description: String\n    displayOrder: Int\n    serviceGroupId: OID\n    isSetupFormation: Boolean!\n    optionGroupId: OID\n    costType: ServiceCostType\n    price: Amount_Money\n    currency: Currency\n    facetBindings: [ResourceFacetBinding!]!\n}\n\nenum ServiceCostType {\n    RECURRING\n    SETUP\n}\n\ntype ResourceFacetBinding {\n    id: OID!\n    facetName: String!\n    facetType: PHID!\n    supportedOptions: [OID!]!\n}\n\ntype ServiceSubscriptionTier {\n    id: OID!\n    name: String!\n    description: String\n    isCustomPricing: Boolean!\n    pricing: ServicePricing!\n    pricingOptions: [TierPricingOption!]!\n    serviceLevels: [ServiceLevelBinding!]!\n    usageLimits: [ServiceUsageLimit!]!\n}\n\ntype ServicePricing {\n    amount: Amount_Money\n    currency: Currency!\n}\n\ntype TierPricingOption {\n    id: OID!\n    amount: Amount_Money!\n    currency: Currency!\n    isDefault: Boolean!\n}\n\nenum BillingCycle {\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n    ONE_TIME\n}\n\ntype ServiceLevelBinding {\n    id: OID!\n    serviceId: OID!\n    level: ServiceLevel!\n    customValue: String\n    optionGroupId: OID\n}\n\nenum ServiceLevel {\n    INCLUDED\n    NOT_INCLUDED\n    OPTIONAL\n    CUSTOM\n    VARIABLE\n    NOT_APPLICABLE\n}\n\ntype ServiceUsageLimit {\n    id: OID!\n    serviceId: OID!\n    metric: String!\n    unitName: String\n    freeLimit: Int\n    paidLimit: Int\n    resetCycle: UsageResetCycle\n    notes: String\n    unitPrice: Amount_Money\n    unitPriceCurrency: Currency\n}\n\nenum UsageResetCycle {\n    DAILY\n    WEEKLY\n    MONTHLY\n}\n\ntype OptionGroup {\n    id: OID!\n    name: String!\n    description: String\n    isAddOn: Boolean!\n    defaultSelected: Boolean!\n    costType: GroupCostType\n    billingCycle: BillingCycle\n    price: Amount_Money\n    currency: Currency\n}\n\nenum GroupCostType {\n    RECURRING\n    SETUP\n}",
        },
        local: {
          examples: [],
          initialValue: "",
          schema: "",
        },
      },
      version: 1,
    },
  ],
};
