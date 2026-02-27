import type { ModelBinding } from "./SpecModeContext.js";

/**
 * Pre-derived ModelBinding definitions for the service-offering document model.
 *
 * These are the "free" spec annotations — derived from:
 *   - document-models/service-offering/gen/document-model.ts (schema + operations)
 *   - Each editor component's actual state reads
 *
 * When new document models are added, add their bindings here.
 * Future: auto-generate this file from gen/document-model.ts.
 */

const MODEL_ID = "powerhouse/service-offering";
const MODEL_NAME = "Service Offering";
const EXTENSION = ".phs";

const RT_MODEL_ID = "powerhouse/resource-template";
const RT_MODEL_NAME = "Resource Template";
const RT_EXTENSION = "";

// ─── Shared mutation lists per module ────────────────────────────────────────

const SERVICES_MUTATIONS = [
  "addService",
  "updateService",
  "deleteService",
  "addFacetBinding",
  "removeFacetBinding",
];

const TIERS_MUTATIONS = [
  "addTier",
  "updateTier",
  "updateTierPricing",
  "deleteTier",
  "addServiceLevel",
  "updateServiceLevel",
  "removeServiceLevel",
  "addUsageLimit",
  "updateUsageLimit",
  "removeUsageLimit",
  "setTierDefaultBillingCycle",
  "setTierBillingCycleDiscounts",
  "setTierPricingMode",
];

const OPTION_GROUP_MUTATIONS = [
  "addOptionGroup",
  "updateOptionGroup",
  "deleteOptionGroup",
  "setOptionGroupStandalonePricing",
  "addOptionGroupTierPricing",
  "updateOptionGroupTierPricing",
  "removeOptionGroupTierPricing",
  "setOptionGroupDiscountMode",
];

// ─── Helper: build a flat GQL read query from field paths ────────────────────

function buildQuery(
  queryName: string,
  operationName: string,
  fields: { fieldPath: string }[],
): string {
  const fieldLines = fields
    .map((f) => {
      const parts = f.fieldPath.split(".");
      if (parts.length === 1) return `    ${parts[0]}`;
      // Nested: render as a sub-selection (v1: flat, one level deep)
      return `    ${parts[0]} {\n      ${parts.slice(1).join("\n      ")}\n    }`;
    })
    .join("\n");

  return `query ${queryName}($id: ID!) {\n  ${operationName}(id: $id) {\n${fieldLines}\n  }\n}`;
}

// ─── Per-tab binding definitions ─────────────────────────────────────────────

export const SCOPE_FACETS_BINDINGS: ModelBinding[] = [
  {
    modelId: MODEL_ID,
    modelName: MODEL_NAME,
    extension: EXTENSION,
    fields: [
      { fieldPath: "resourceTemplateId", gqlType: "PHID" },
      { fieldPath: "facetTargets", gqlType: "[FacetTarget!]!" },
      { fieldPath: "operatorId", gqlType: "PHID" },
    ],
    readQuery: buildQuery("GetScopeFacets", "serviceOffering", [
      { fieldPath: "resourceTemplateId" },
      { fieldPath: "facetTargets" },
      { fieldPath: "operatorId" },
    ]),
    mutations: [
      "selectResourceTemplate",
      "changeResourceTemplate",
      "setOperator",
      "setFacetTarget",
      "removeFacetTarget",
      "addFacetOption",
      "removeFacetOption",
    ],
  },
  {
    modelId: RT_MODEL_ID,
    modelName: RT_MODEL_NAME,
    extension: RT_EXTENSION,
    fields: [
      { fieldPath: "id", gqlType: "PHID!" },
      { fieldPath: "title", gqlType: "String!" },
      { fieldPath: "operatorId", gqlType: "PHID!" },
      { fieldPath: "facetTargets", gqlType: "[FacetTarget!]!" },
      { fieldPath: "services", gqlType: "[Service!]!" },
      { fieldPath: "optionGroups", gqlType: "[OptionGroup!]!" },
    ],
    readQuery: buildQuery("GetResourceTemplate", "resourceTemplate", [
      { fieldPath: "id" },
      { fieldPath: "title" },
      { fieldPath: "operatorId" },
      { fieldPath: "facetTargets" },
      { fieldPath: "services" },
      { fieldPath: "optionGroups" },
    ]),
    mutations: [
      "updateTemplateInfo",
      "updateTemplateStatus",
      "setOperator",
      "setTemplateId",
      "setFacetTarget",
      "removeFacetTarget",
      "addService",
      "updateService",
      "deleteService",
      "addOptionGroup",
      "updateOptionGroup",
      "deleteOptionGroup",
    ],
  },
];

export const SERVICE_CATALOG_BINDINGS: ModelBinding[] = [
  {
    modelId: MODEL_ID,
    modelName: MODEL_NAME,
    extension: EXTENSION,
    fields: [
      { fieldPath: "services", gqlType: "[Service!]!" },
      { fieldPath: "optionGroups", gqlType: "[OptionGroup!]!" },
      { fieldPath: "tiers", gqlType: "[ServiceSubscriptionTier!]!" },
    ],
    readQuery: buildQuery("GetServiceCatalog", "serviceOffering", [
      { fieldPath: "services" },
      { fieldPath: "optionGroups" },
      { fieldPath: "tiers" },
    ]),
    mutations: [...SERVICES_MUTATIONS, ...OPTION_GROUP_MUTATIONS],
  },
];

export const TIER_DEFINITION_BINDINGS: ModelBinding[] = [
  {
    modelId: MODEL_ID,
    modelName: MODEL_NAME,
    extension: EXTENSION,
    fields: [
      { fieldPath: "tiers", gqlType: "[ServiceSubscriptionTier!]!" },
      { fieldPath: "optionGroups", gqlType: "[OptionGroup!]!" },
      {
        fieldPath: "availableBillingCycles",
        gqlType: "[BillingCycle!]!",
      },
    ],
    readQuery: buildQuery("GetTierDefinition", "serviceOffering", [
      { fieldPath: "tiers" },
      { fieldPath: "optionGroups" },
      { fieldPath: "availableBillingCycles" },
    ]),
    mutations: [...TIERS_MUTATIONS, "setAvailableBillingCycles"],
  },
];

export const THE_MATRIX_BINDINGS: ModelBinding[] = [
  {
    modelId: MODEL_ID,
    modelName: MODEL_NAME,
    extension: EXTENSION,
    fields: [
      { fieldPath: "services", gqlType: "[Service!]!" },
      {
        fieldPath: "tiers.serviceLevels",
        gqlType: "[ServiceLevelBinding!]!",
      },
      { fieldPath: "tiers.usageLimits", gqlType: "[ServiceUsageLimit!]!" },
      { fieldPath: "optionGroups", gqlType: "[OptionGroup!]!" },
      { fieldPath: "finalConfiguration", gqlType: "FinalConfiguration" },
    ],
    readQuery: buildQuery("GetMatrix", "serviceOffering", [
      { fieldPath: "services" },
      { fieldPath: "tiers" },
      { fieldPath: "optionGroups" },
      { fieldPath: "finalConfiguration" },
    ]),
    mutations: [
      "addServiceLevel",
      "updateServiceLevel",
      "removeServiceLevel",
      "addUsageLimit",
      "updateUsageLimit",
      "removeUsageLimit",
      "setFinalConfiguration",
    ],
  },
];

export const OFFERING_INFO_BINDINGS: ModelBinding[] = [
  {
    modelId: MODEL_ID,
    modelName: MODEL_NAME,
    extension: EXTENSION,
    fields: [
      { fieldPath: "id", gqlType: "PHID" },
      { fieldPath: "title", gqlType: "String!" },
      { fieldPath: "summary", gqlType: "String!" },
      { fieldPath: "operatorId", gqlType: "PHID" },
      { fieldPath: "infoLink", gqlType: "URL" },
      { fieldPath: "status", gqlType: "ServiceStatus!" },
    ],
    readQuery: buildQuery("GetOfferingInfo", "serviceOffering", [
      { fieldPath: "id" },
      { fieldPath: "title" },
      { fieldPath: "summary" },
      { fieldPath: "operatorId" },
      { fieldPath: "infoLink" },
      { fieldPath: "status" },
    ]),
    mutations: [
      "setOfferingId",
      "updateOfferingInfo",
      "updateOfferingStatus",
      "setOperator",
    ],
  },
];
