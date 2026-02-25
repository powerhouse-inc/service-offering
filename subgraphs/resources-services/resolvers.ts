import { type ISubgraph } from "@powerhousedao/reactor-api";
import type { PHDocument } from "document-model";
import type {
  ResourceTemplateDocument,
  TemplateStatus,
} from "@powerhousedao/service-offering/document-models/resource-template";
import type {
  ServiceOfferingDocument,
  ServiceStatus,
} from "@powerhousedao/service-offering/document-models/service-offering";
import { createAction } from "document-model/core";
import { addFile } from "document-drive";
import {
  ResourceInstance,
  SubscriptionInstance,
} from "@powerhousedao/service-offering/document-models";

// Filter types
interface ResourceTemplatesFilter {
  id?: string;
  status?: TemplateStatus[];
  operatorId?: string;
}

interface ServiceOfferingsFilter {
  id?: string;
  status?: ServiceStatus[];
  operatorId?: string;
  resourceTemplateId?: string;
}

interface CreateProductInstancesInput {
  serviceOfferingId: string;
  name: string;
  teamName: string;
}

export const getResolvers = (subgraph: ISubgraph): Record<string, unknown> => {
  const reactor = subgraph.reactor;

  return {
    Query: {
      resourceTemplates: async (
        _: unknown,
        args: { filter?: ResourceTemplatesFilter },
      ) => {
        const { id, status, operatorId } = args.filter || {};

        // If filtering by specific id, try to fetch directly
        if (id) {
          try {
            const doc = await reactor.getDocument<ResourceTemplateDocument>(id);
            if (
              doc &&
              doc.header.documentType === "powerhouse/resource-template"
            ) {
              const state = doc.state.global;
              // Check status filter if provided
              if (
                status &&
                status.length > 0 &&
                !status.includes(state.status)
              ) {
                return [];
              }
              // Check operatorId filter if provided
              if (operatorId && state.operatorId !== operatorId) {
                return [];
              }
              return [mapResourceTemplateState(state, doc)];
            }
          } catch {
            // Document not found
          }
          return [];
        }

        // Scan all drives for resource template documents
        const drives = await reactor.getDrives();
        const resourceTemplates: ReturnType<typeof mapResourceTemplateState>[] =
          [];

        for (const driveId of drives) {
          try {
            const docIds = await reactor.getDocuments(driveId);
            const docs = await Promise.all(
              docIds.map(async (docId) => {
                try {
                  return await reactor.getDocument<PHDocument>(docId);
                } catch {
                  return null;
                }
              }),
            );

            for (const doc of docs) {
              if (
                doc &&
                doc.header.documentType === "powerhouse/resource-template"
              ) {
                const resourceDoc = doc as ResourceTemplateDocument;
                const state = resourceDoc.state.global;

                // Apply status filter if provided
                if (
                  status &&
                  status.length > 0 &&
                  !status.includes(state.status)
                ) {
                  continue;
                }

                // Apply operatorId filter if provided
                if (operatorId && state.operatorId !== operatorId) {
                  continue;
                }

                resourceTemplates.push(mapResourceTemplateState(state, doc));
              }
            }
          } catch (error) {
            console.warn(`Failed to inspect drive ${driveId}:`, error);
          }
        }

        return resourceTemplates;
      },

      serviceOfferings: async (
        _: unknown,
        args: { filter?: ServiceOfferingsFilter },
      ) => {
        const { id, status, operatorId, resourceTemplateId } =
          args.filter || {};

        // If filtering by specific id, try to fetch directly
        if (id) {
          try {
            const doc = await reactor.getDocument<ServiceOfferingDocument>(id);
            if (
              doc &&
              doc.header.documentType === "powerhouse/service-offering"
            ) {
              const state = doc.state.global;
              // Check status filter if provided
              if (
                status &&
                status.length > 0 &&
                !status.includes(state.status)
              ) {
                return [];
              }
              // Check operatorId filter if provided
              if (operatorId && state.operatorId !== operatorId) {
                return [];
              }
              // Check resourceTemplateId filter if provided
              if (
                resourceTemplateId &&
                state.resourceTemplateId !== resourceTemplateId
              ) {
                return [];
              }
              return [mapServiceOfferingState(state, doc)];
            }
          } catch {
            // Document not found
          }
          return [];
        }

        // Scan all drives for service offering documents
        const drives = await reactor.getDrives();
        const serviceOfferings: ReturnType<typeof mapServiceOfferingState>[] =
          [];

        for (const driveId of drives) {
          try {
            const docIds = await reactor.getDocuments(driveId);
            const docs = await Promise.all(
              docIds.map(async (docId) => {
                try {
                  return await reactor.getDocument<PHDocument>(docId);
                } catch {
                  return null;
                }
              }),
            );

            for (const doc of docs) {
              if (
                doc &&
                doc.header.documentType === "powerhouse/service-offering"
              ) {
                const offeringDoc = doc as ServiceOfferingDocument;
                const state = offeringDoc.state.global;

                // Apply status filter if provided
                if (
                  status &&
                  status.length > 0 &&
                  !status.includes(state.status)
                ) {
                  continue;
                }

                // Apply operatorId filter if provided
                if (operatorId && state.operatorId !== operatorId) {
                  continue;
                }

                // Apply resourceTemplateId filter if provided
                if (
                  resourceTemplateId &&
                  state.resourceTemplateId !== resourceTemplateId
                ) {
                  continue;
                }

                serviceOfferings.push(mapServiceOfferingState(state, doc));
              }
            }
          } catch (error) {
            console.warn(`Failed to inspect drive ${driveId}:`, error);
          }
        }

        return serviceOfferings;
      },
    },
    Mutation: {
      createProductInstances: async (
        _: unknown,
        args: { input: CreateProductInstancesInput },
      ) => {
        const { input } = args;
        const { serviceOfferingId, name, teamName } = input;

        // Validate input
        if (!serviceOfferingId) {
          return {
            success: false,
            data: null,
            errors: ["Service offering ID is required"],
          };
        }

        if (!name) {
          return { success: false, data: null, errors: ["Name is required"] };
        }

        if (!teamName) {
          return {
            success: false,
            data: null,
            errors: ["Team name is required"],
          };
        }

        // Fetch the service offering to get resourceTemplateId and finalConfiguration
        const serviceOfferingDoc =
          await reactor.getDocument<ServiceOfferingDocument>(serviceOfferingId);
        if (!serviceOfferingDoc) {
          return {
            success: false,
            data: null,
            errors: ["Service offering not found"],
          };
        }

        const serviceOfferingState = serviceOfferingDoc.state.global;
        const resourceTemplateId = serviceOfferingState.resourceTemplateId;
        if (!resourceTemplateId) {
          return {
            success: false,
            data: null,
            errors: ["Service offering has no associated resource template"],
          };
        }

        const finalConfiguration = serviceOfferingState.finalConfiguration;
        if (!finalConfiguration) {
          return {
            success: false,
            data: null,
            errors: ["Service offering has no final configuration"],
          };
        }

        const parsedTeamName = teamName.toLowerCase().replace(/ /g, "-");
        const parsedName = name.toLowerCase().replace(/ /g, "-");

        try {
          // create team-builder-admin drive
          const teamBuilderAdminDrive = await reactor.addDrive({
            global: {
              name: teamName,
              icon: "https://cdn-icons-png.flaticon.com/512/6020/6020347.png",
            },
            id: parsedTeamName,
            slug: parsedTeamName,
            preferredEditor: "builder-team-admin",
          });

          // create builder-profile doc inside the team-builder-admin drive
          const builderProfileDoc = await reactor.addDocument(
            "powerhouse/builder-profile",
          );

          await reactor.addAction(
            teamBuilderAdminDrive.header.id,
            addFile({
              documentType: "powerhouse/builder-profile",
              id: builderProfileDoc.header.id,
              name: `${parsedName} Builder Profile`,
              parentFolder: teamBuilderAdminDrive.state.global.nodes?.find(
                (node) => node.kind === "folder",
              )?.parentFolder,
            }),
          );

          await reactor.addAction(
            builderProfileDoc.header.id,
            createAction(
              "UPDATE_PROFILE",
              { name },
              undefined,
              undefined,
              "global",
            ),
          );

          // create resource-instance and subscription-instance docs
          const resourceInstanceDoc = await reactor.addDocument(
            "powerhouse/resource-instance",
          );
          const subscriptionInstanceDoc = await reactor.addDocument(
            "powerhouse/subscription-instance",
          );

          // resolve parent folders for both drives
          const teamParentFolder =
            teamBuilderAdminDrive.state.global.nodes?.find(
              (node) => node.kind === "folder",
            )?.parentFolder;

          const operatorDrive = await getOperatorDrive(
            reactor,
            resourceTemplateId,
          );
          if (!operatorDrive) {
            throw new Error(
              `Operator drive not found for resource template ${resourceTemplateId}`,
            );
          }

          const operatorParentFolder = operatorDrive.state.global.nodes?.find(
            (node) => node.kind === "folder",
          )?.parentFolder;

          // batch add resource-instance and subscription-instance to team-builder-admin drive
          await reactor.addActions(teamBuilderAdminDrive.header.id, [
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedName} Resource Instance`,
              parentFolder: teamParentFolder,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedName} Subscription Instance`,
              parentFolder: teamParentFolder,
            }),
          ]);

          // batch add resource-instance and subscription-instance to operator drive
          await reactor.addActions(operatorDrive.header.id, [
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedName} Resource Instance`,
              parentFolder: operatorParentFolder,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedName} Subscription Instance`,
              parentFolder: operatorParentFolder,
            }),
          ]);

          // populate documents after all files are added to both drives
          await populateResourceInstance(
            reactor,
            resourceInstanceDoc.header.id,
            resourceTemplateId,
            builderProfileDoc.header.id,
            name,
          );

          const now = new Date().toISOString();

          // find the selected tier to get its name and pricing details
          const selectedTier = serviceOfferingState.tiers.find(
            (t) => t.id === finalConfiguration.selectedTierId,
          );

          await reactor.addAction(
            subscriptionInstanceDoc.header.id,
            SubscriptionInstance.actions.initializeSubscription({
              customerId: builderProfileDoc.header.id,
              customerName: name,
              serviceOfferingId,
              resourceId: resourceInstanceDoc.header.id,
              resourceLabel: name,
              resourceThumbnailUrl: serviceOfferingState.thumbnailUrl,
              tierName: selectedTier?.name || null,
              tierPrice: selectedTier?.pricing?.amount ?? null,
              tierCurrency: selectedTier?.pricing?.currency || null,
              tierPricingMode: selectedTier?.pricingMode || null,
              selectedBillingCycle:
                finalConfiguration.selectedBillingCycle || null,
              globalCurrency: finalConfiguration.tierCurrency || null,
              createdAt: now,
            }),
          );

          return {
            success: true,
            data: {
              linkToDrive: getDriveLink(teamBuilderAdminDrive.header.id),
            },
            errors: [],
          };
        } catch (error) {
          console.error("Failed to create product instances:", error);
          return {
            success: false,
            data: null,
            errors: [
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            ],
          };
        }
      },
    },
  };
};

/**
 * Build a link to a drive based on the current environment.
 * Mirrors the logic from editors/shared/graphql.ts for server-side use.
 */
function getDriveLink(driveId: string): string {
  const baseUri = process.env.BASE_URI || "";

  if (baseUri.includes("-dev.")) {
    return `https://connect-dev.powerhouse.xyz/?driveUrl=https://switchboard-dev.powerhouse.xyz/d/${driveId}`;
  }

  if (baseUri.includes("-staging.")) {
    return `https://connect-staging.powerhouse.xyz/?driveUrl=https://switchboard-staging.powerhouse.xyz/d/${driveId}`;
  }

  if (baseUri && !baseUri.includes("localhost")) {
    return `https://connect.powerhouse.xyz/?driveUrl=https://switchboard.powerhouse.xyz/d/${driveId}`;
  }

  return `http://localhost:3000/?driveUrl=http://localhost:4001/d/${driveId}`;
}

/**
 * Map ResourceTemplateState from document model to GraphQL response
 */
function mapResourceTemplateState(
  state: ResourceTemplateDocument["state"]["global"],
  doc: PHDocument,
) {
  return {
    id: doc.header.id,
    operatorId: state.operatorId,
    title: state.title,
    summary: state.summary,
    description: state.description || null,
    thumbnailUrl: state.thumbnailUrl || null,
    infoLink: state.infoLink || null,
    status: state.status,
    lastModified: state.lastModified,
    targetAudiences: state.targetAudiences.map((audience) => ({
      id: audience.id,
      label: audience.label,
      color: audience.color || null,
    })),
    setupServices: state.setupServices,
    recurringServices: state.recurringServices,
    facetTargets: state.facetTargets.map((facet) => ({
      id: facet.id,
      categoryKey: facet.categoryKey,
      categoryLabel: facet.categoryLabel,
      selectedOptions: facet.selectedOptions,
    })),
    services: (state.services || []).map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description || null,
      displayOrder: service.displayOrder ?? null,
      parentServiceId: service.parentServiceId || null,
      isSetupFormation: service.isSetupFormation,
      optionGroupId: service.optionGroupId || null,
      facetBindings: (service.facetBindings || []).map((binding) => ({
        id: binding.id,
        facetName: binding.facetName,
        facetType: binding.facetType,
        supportedOptions: binding.supportedOptions,
      })),
    })),
    optionGroups: (state.optionGroups || []).map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || null,
      isAddOn: group.isAddOn,
      defaultSelected: group.defaultSelected,
    })),
    faqFields: (state.faqFields || []).map((faq) => ({
      id: faq.id,
      question: faq.question || null,
      answer: faq.answer || null,
      displayOrder: faq.displayOrder,
    })),
    contentSections: state.contentSections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      displayOrder: section.displayOrder,
    })),
  };
}

/**
 * Populate a resource-instance document with data from a resource-template.
 * Initializes basic info and sets facet configuration from template facetTargets.
 */
async function populateResourceInstance(
  reactor: ISubgraph["reactor"],
  resourceInstanceDocId: string,
  resourceTemplateId: string,
  profileId: string,
  name: string,
) {
  const resourceTemplateDoc =
    await reactor.getDocument<ResourceTemplateDocument>(resourceTemplateId);
  if (!resourceTemplateDoc) return;

  const templateState = resourceTemplateDoc.state.global;

  // Initialize instance with basic info from template
  await reactor.addAction(
    resourceInstanceDocId,
    ResourceInstance.actions.initializeInstance({
      profileId,
      profileDocumentType: "powerhouse/builder-profile",
      resourceTemplateId,
      customerId: null,
      name,
      thumbnailUrl: templateState.thumbnailUrl,
      infoLink: templateState.infoLink,
      description: templateState.description,
    }),
  );

  // Populate facet configuration from template's facetTargets
  for (const facetTarget of templateState.facetTargets) {
    if (facetTarget.selectedOptions.length > 0) {
      await reactor.addAction(
        resourceInstanceDocId,
        ResourceInstance.actions.setInstanceFacet({
          id: facetTarget.id,
          categoryKey: facetTarget.categoryKey,
          categoryLabel: facetTarget.categoryLabel,
          selectedOption: facetTarget.selectedOptions[0],
        }),
      );
    }
  }
}

/**
 * Map a DiscountRule to the GraphQL shape, or null
 */
function mapDiscountRule(
  rule: { discountType: string; discountValue: number } | null | undefined,
) {
  if (!rule) return null;
  return {
    discountType: rule.discountType,
    discountValue: rule.discountValue,
  };
}

/**
 * Map a ResolvedDiscount to the GraphQL shape, or null
 */
function mapResolvedDiscount(
  d:
    | {
        discountType: string;
        discountValue: number;
        originalAmount: number;
        discountedAmount: number;
      }
    | null
    | undefined,
) {
  if (!d) return null;
  return {
    discountType: d.discountType,
    discountValue: d.discountValue,
    originalAmount: d.originalAmount,
    discountedAmount: d.discountedAmount,
  };
}

/**
 * Map ServiceOfferingState from document model to GraphQL response
 */
function mapServiceOfferingState(
  state: ServiceOfferingDocument["state"]["global"],
  doc: PHDocument,
) {
  return {
    id: doc.header.id,
    operatorId: state.operatorId,
    resourceTemplateId: state.resourceTemplateId || null,
    title: state.title,
    summary: state.summary,
    description: state.description || null,
    thumbnailUrl: state.thumbnailUrl || null,
    infoLink: state.infoLink || null,
    status: state.status,
    lastModified: state.lastModified,
    targetAudiences: state.targetAudiences.map((audience) => ({
      id: audience.id,
      label: audience.label,
      color: audience.color || null,
    })),
    facetTargets: state.facetTargets.map((facet) => ({
      id: facet.id,
      categoryKey: facet.categoryKey,
      categoryLabel: facet.categoryLabel,
      selectedOptions: facet.selectedOptions,
    })),
    serviceGroups: (state.serviceGroups || []).map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || null,
      billingCycle: group.billingCycle,
      displayOrder: group.displayOrder ?? null,
      discountMode: group.discountMode || null,
      tierPricing: (group.tierPricing || []).map((tp) => ({
        id: tp.id,
        tierId: tp.tierId,
        setupCostsPerCycle: (tp.setupCostsPerCycle || []).map((sc) => ({
          id: sc.id,
          billingCycle: sc.billingCycle,
          amount: sc.amount,
          currency: sc.currency,
          discount: mapDiscountRule(sc.discount),
        })),
        recurringPricing: (tp.recurringPricing || []).map((rp) => ({
          id: rp.id,
          billingCycle: rp.billingCycle,
          amount: rp.amount,
          currency: rp.currency,
          discount: mapDiscountRule(rp.discount),
        })),
      })),
    })),
    services: state.services.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description || null,
      displayOrder: service.displayOrder ?? null,
      serviceGroupId: service.serviceGroupId || null,
      isSetupFormation: service.isSetupFormation,
      optionGroupId: service.optionGroupId || null,
      facetBindings: (service.facetBindings || []).map((binding) => ({
        id: binding.id,
        facetName: binding.facetName,
        facetType: binding.facetType,
        supportedOptions: binding.supportedOptions,
      })),
    })),
    tiers: state.tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description || null,
      isCustomPricing: tier.isCustomPricing,
      pricingMode: tier.pricingMode || null,
      pricing: {
        amount: tier.pricing.amount ?? null,
        currency: tier.pricing.currency,
      },
      defaultBillingCycle: tier.defaultBillingCycle || null,
      billingCycleDiscounts: (tier.billingCycleDiscounts || []).map((d) => ({
        billingCycle: d.billingCycle,
        discountRule: {
          discountType: d.discountRule.discountType,
          discountValue: d.discountRule.discountValue,
        },
      })),
      serviceLevels: tier.serviceLevels.map((level) => ({
        id: level.id,
        serviceId: level.serviceId,
        level: level.level,
        customValue: level.customValue || null,
        optionGroupId: level.optionGroupId || null,
      })),
      usageLimits: tier.usageLimits.map((limit) => ({
        id: limit.id,
        serviceId: limit.serviceId,
        metric: limit.metric,
        unitName: limit.unitName || null,
        freeLimit: limit.freeLimit ?? null,
        paidLimit: limit.paidLimit ?? null,
        resetCycle: limit.resetCycle || null,
        notes: limit.notes || null,
        unitPrice: limit.unitPrice ?? null,
        unitPriceCurrency: limit.unitPriceCurrency || null,
      })),
    })),
    optionGroups: state.optionGroups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || null,
      isAddOn: group.isAddOn,
      defaultSelected: group.defaultSelected,
      pricingMode: group.pricingMode || null,
      standalonePricing: group.standalonePricing
        ? {
            setupCost: group.standalonePricing.setupCost
              ? {
                  amount: group.standalonePricing.setupCost.amount,
                  currency: group.standalonePricing.setupCost.currency,
                  discount: mapDiscountRule(
                    group.standalonePricing.setupCost.discount,
                  ),
                }
              : null,
            recurringPricing: (
              group.standalonePricing.recurringPricing || []
            ).map((rp) => ({
              id: rp.id,
              billingCycle: rp.billingCycle,
              amount: rp.amount,
              currency: rp.currency,
              discount: mapDiscountRule(rp.discount),
            })),
          }
        : null,
      tierDependentPricing: (group.tierDependentPricing || []).map((tp) => ({
        id: tp.id,
        tierId: tp.tierId,
        setupCost: tp.setupCost
          ? {
              amount: tp.setupCost.amount,
              currency: tp.setupCost.currency,
              discount: mapDiscountRule(tp.setupCost.discount),
            }
          : null,
        setupCostDiscounts: (tp.setupCostDiscounts || []).map((d) => ({
          billingCycle: d.billingCycle,
          discountRule: {
            discountType: d.discountRule.discountType,
            discountValue: d.discountRule.discountValue,
          },
        })),
        recurringPricing: (tp.recurringPricing || []).map((rp) => ({
          id: rp.id,
          billingCycle: rp.billingCycle,
          amount: rp.amount,
          currency: rp.currency,
          discount: mapDiscountRule(rp.discount),
        })),
      })),
      costType: group.costType || null,
      availableBillingCycles: group.availableBillingCycles || [],
      billingCycleDiscounts: (group.billingCycleDiscounts || []).map((d) => ({
        billingCycle: d.billingCycle,
        discountRule: {
          discountType: d.discountRule.discountType,
          discountValue: d.discountRule.discountValue,
        },
      })),
      discountMode: group.discountMode || null,
      price: group.price ?? null,
      currency: group.currency || null,
    })),
    finalConfiguration: state.finalConfiguration
      ? {
          selectedTierId: state.finalConfiguration.selectedTierId,
          selectedBillingCycle: state.finalConfiguration.selectedBillingCycle,
          tierBasePrice: state.finalConfiguration.tierBasePrice ?? null,
          tierCurrency: state.finalConfiguration.tierCurrency,
          tierDiscount: mapResolvedDiscount(
            state.finalConfiguration.tierDiscount,
          ),
          optionGroupConfigs: state.finalConfiguration.optionGroupConfigs.map(
            (ogc) => ({
              id: ogc.id,
              optionGroupId: ogc.optionGroupId,
              effectiveBillingCycle: ogc.effectiveBillingCycle,
              billingCycleOverridden: ogc.billingCycleOverridden,
              discountStripped: ogc.discountStripped,
              recurringAmount: ogc.recurringAmount ?? null,
              currency: ogc.currency || null,
              discount: mapResolvedDiscount(ogc.discount),
              setupCost: ogc.setupCost ?? null,
              setupCostCurrency: ogc.setupCostCurrency || null,
              setupCostDiscount: mapResolvedDiscount(ogc.setupCostDiscount),
            }),
          ),
          addOnConfigs: state.finalConfiguration.addOnConfigs.map((aoc) => ({
            id: aoc.id,
            optionGroupId: aoc.optionGroupId,
            selectedBillingCycle: aoc.selectedBillingCycle,
            recurringAmount: aoc.recurringAmount ?? null,
            currency: aoc.currency || null,
            discount: mapResolvedDiscount(aoc.discount),
            setupCost: aoc.setupCost ?? null,
            setupCostCurrency: aoc.setupCostCurrency || null,
            setupCostDiscount: mapResolvedDiscount(aoc.setupCostDiscount),
          })),
          lastModified: state.finalConfiguration.lastModified,
        }
      : null,
  };
}

async function getOperatorDrive(
  reactor: ISubgraph["reactor"],
  resourceTemplateId: string,
) {
  const drives = await reactor.getDrives();
  const results = await Promise.all(
    drives.map(async (drive) => {
      const docIds = await reactor.getDocuments(drive);
      return docIds.includes(resourceTemplateId) ? drive : null;
    }),
  );
  const driveId = results.find((id) => id !== null);
  return driveId ? reactor.getDrive(driveId) : undefined;
}
