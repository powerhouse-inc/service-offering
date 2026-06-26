import { type BaseSubgraph } from "@powerhousedao/reactor-api";
import type { IReactorClient } from "@powerhousedao/reactor";
import type { PHDocument } from "document-model";
import type {
  ResourceTemplateDocument,
  TemplateStatus,
} from "document-models/resource-template";
import type {
  ServiceOfferingDocument,
  ServiceStatus,
  BillingCycle,
} from "document-models/service-offering";
import {
  getUserSelectionPriceBreakdown,
  type UserSelection,
  type PriceBreakdown,
} from "document-models/service-offering";
import { createAction, generateId } from "document-model/core";
import { addFile } from "@powerhousedao/shared/document-drive";
import type {
  FileNode,
  DocumentDriveDocument,
} from "@powerhousedao/shared/document-drive";
import {
  ResourceInstance,
  SubscriptionInstance,
} from "document-models";
import { mapOfferingToSubscription } from "../../editors/subscription-instance-editor/components/mapOfferingToSubscription.js";

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

interface BillingCycleOverrideInput {
  groupId: string;
  billingCycle: string;
}

interface UserSelectionInput {
  tierId: string;
  billingCycle: string;
  optionGroupIds: string[];
  groupBillingCycleOverrides?: BillingCycleOverrideInput[];
  addonBillingCycleOverrides?: BillingCycleOverrideInput[];
}

interface CreateProductInstancesInput {
  serviceOfferingId: string;
  name: string;
  teamName: string;
  customerEmail?: string;
  userSelection: UserSelectionInput;
}

export const getResolvers = (
  subgraph: BaseSubgraph,
): Record<string, unknown> => {
  const { reactorClient } = subgraph;

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
            const doc =
              await reactorClient.get<ResourceTemplateDocument>(id);
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
        const { results: docs } = await reactorClient.find({
          type: "powerhouse/resource-template",
        });
        const resourceTemplates: ReturnType<typeof mapResourceTemplateState>[] =
          [];

        for (const doc of docs) {
          const resourceDoc = doc as ResourceTemplateDocument;
          const state = resourceDoc.state.global;

          // Apply status filter if provided
          if (status && status.length > 0 && !status.includes(state.status)) {
            continue;
          }

          // Apply operatorId filter if provided
          if (operatorId && state.operatorId !== operatorId) {
            continue;
          }

          resourceTemplates.push(mapResourceTemplateState(state, doc));
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
            const doc =
              await reactorClient.get<ServiceOfferingDocument>(id);
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
        const { results: docs } = await reactorClient.find({
          type: "powerhouse/service-offering",
        });
        const serviceOfferings: ReturnType<typeof mapServiceOfferingState>[] =
          [];

        for (const doc of docs) {
          const offeringDoc = doc as ServiceOfferingDocument;
          const state = offeringDoc.state.global;

          // Apply status filter if provided
          if (status && status.length > 0 && !status.includes(state.status)) {
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

        return serviceOfferings;
      },
    },
    Mutation: {
      createProductInstances: async (
        _: unknown,
        args: { input: CreateProductInstancesInput },
      ) => {
        const { input } = args;
        const { serviceOfferingId, name, teamName, customerEmail } = input;

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

        // Validate name lengths
        if (name.length > 64) {
          return {
            success: false,
            data: null,
            errors: ["Name must be 64 characters or less"],
          };
        }

        if (teamName.length > 64) {
          return {
            success: false,
            data: null,
            errors: ["Team name must be 64 characters or less"],
          };
        }

        // Validate names contain only allowed characters (letters, numbers, spaces, hyphens, underscores)
        const validNamePattern = /^[a-zA-Z0-9 _-]+$/;

        if (!validNamePattern.test(name)) {
          return {
            success: false,
            data: null,
            errors: [
              "Name can only contain letters, numbers, spaces, hyphens, and underscores",
            ],
          };
        }

        if (!validNamePattern.test(teamName)) {
          return {
            success: false,
            data: null,
            errors: [
              "Team name can only contain letters, numbers, spaces, hyphens, and underscores",
            ],
          };
        }

        // Validate userSelection
        const { userSelection } = input;
        if (!userSelection) {
          return {
            success: false,
            data: null,
            errors: ["User selection is required"],
          };
        }

        if (!userSelection.tierId) {
          return {
            success: false,
            data: null,
            errors: ["Tier ID is required in user selection"],
          };
        }

        if (!userSelection.billingCycle) {
          return {
            success: false,
            data: null,
            errors: ["Billing cycle is required in user selection"],
          };
        }

        // Fetch the service offering
        const serviceOfferingDoc =
          await reactorClient.get<ServiceOfferingDocument>(serviceOfferingId);
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

        // Convert GraphQL overrides to Record<string, BillingCycle>
        const groupBillingCycleOverrides: Record<string, BillingCycle> = {};
        for (const o of userSelection.groupBillingCycleOverrides ?? []) {
          groupBillingCycleOverrides[o.groupId] =
            o.billingCycle as BillingCycle;
        }
        const addonBillingCycleOverrides: Record<string, BillingCycle> = {};
        for (const o of userSelection.addonBillingCycleOverrides ?? []) {
          addonBillingCycleOverrides[o.groupId] =
            o.billingCycle as BillingCycle;
        }

        // Compute price breakdown from user selection
        const selection: UserSelection = {
          tierId: userSelection.tierId,
          billingCycle: userSelection.billingCycle as BillingCycle,
          optionGroupIds: userSelection.optionGroupIds ?? [],
          groupBillingCycleOverrides,
          addonBillingCycleOverrides,
        };

        let priceBreakdown: PriceBreakdown;
        try {
          priceBreakdown = getUserSelectionPriceBreakdown(
            serviceOfferingDoc.state,
            selection,
          );
        } catch (error) {
          return {
            success: false,
            data: null,
            errors: [
              error instanceof Error
                ? error.message
                : "Failed to compute price breakdown from user selection",
            ],
          };
        }

        // Sanitize names for use as drive id/slug: lowercase, trim, collapse whitespace, replace spaces with hyphens
        const parsedTeamName = teamName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/_/g, "-");
        const parsedName = name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/_/g, "-");

        try {
          // create team-builder-admin drive
          const teamBuilderAdminDrive = await reactorClient.drives.create({
            global: {
              name: teamName,
              icon: "https://cdn-icons-png.flaticon.com/512/6020/6020347.png",
            },
            id: generateId(),
            slug: parsedTeamName,
            preferredEditor: "builder-team-admin",
          });

          // create builder-profile doc inside the team-builder-admin drive
          const builderProfileDoc = await reactorClient.createEmpty(
            "powerhouse/builder-profile",
          );

          await reactorClient.execute(teamBuilderAdminDrive.header.id, "main", [
            addFile({
              documentType: "powerhouse/builder-profile",
              id: builderProfileDoc.header.id,
              name: `${parsedTeamName} Builder Profile`,
              parentFolder: teamBuilderAdminDrive.state.global.nodes?.find(
                (node) => node.kind === "folder",
              )?.parentFolder,
            }),
          ]);

          await reactorClient.execute(builderProfileDoc.header.id, "main", [
            createAction(
              "UPDATE_PROFILE",
              { name: parsedTeamName },
              undefined,
              undefined,
              "global",
            ),
          ]);

          // create resource-instance and subscription-instance docs
          const resourceInstanceDoc = await reactorClient.createEmpty(
            "powerhouse/resource-instance",
          );
          const subscriptionInstanceDoc = await reactorClient.createEmpty(
            "powerhouse/subscription-instance",
          );

          // resolve parent folders for both drives
          const teamParentFolder =
            teamBuilderAdminDrive.state.global.nodes?.find(
              (node) => node.kind === "folder",
            )?.parentFolder;

          const operatorDrive = await getOperatorDrive(
            reactorClient,
            resourceTemplateId,
          );
          if (!operatorDrive) {
            throw new Error(
              `Operator drive not found for resource template ${resourceTemplateId}`,
            );
          }

          // get operator profile id from operator drive
          const operatorProfileId = operatorDrive.state.global.nodes
            .filter((node): node is FileNode => node.kind === "file")
            .find(
              (node) => node.documentType === "powerhouse/builder-profile",
            )?.id;

          if (!operatorProfileId) {
            throw new Error(
              `Operator profile not found for drive ${operatorDrive.header.id}`,
            );
          }

          const operatorParentFolder = operatorDrive.state.global.nodes.find(
            (node) => node.kind === "folder",
          )?.parentFolder;

          // batch add resource-instance and subscription-instance to team-builder-admin drive
          await reactorClient.execute(teamBuilderAdminDrive.header.id, "main", [
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedTeamName} Resource Instance`,
              parentFolder: teamParentFolder,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedTeamName} Subscription Instance`,
              parentFolder: teamParentFolder,
            }),
          ]);

          // batch add resource-instance and subscription-instance to operator drive
          await reactorClient.execute(operatorDrive.header.id, "main", [
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedTeamName} Resource Instance`,
              parentFolder: operatorParentFolder,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedTeamName} Subscription Instance`,
              parentFolder: operatorParentFolder,
            }),
          ]);

          // populate documents after all files are added to both drives
          await populateResourceInstance(
            reactorClient,
            resourceInstanceDoc.header.id,
            resourceTemplateId,
            operatorProfileId, // operator profile id
            builderProfileDoc.header.id, // customer id
            parsedTeamName, // customer name from builder profile
          );

          const now = new Date().toISOString();

          const subscriptionInput = mapOfferingToSubscription({
            offering: serviceOfferingState,
            tierId: priceBreakdown.tierId,
            selectedBillingCycle: priceBreakdown.billingCycle,
            customerId: builderProfileDoc.header.id,
            customerName: name,
            customerEmail,
            createdAt: now,
            priceBreakdown,
          });

          await reactorClient.execute(
            subscriptionInstanceDoc.header.id,
            "main",
            [
              SubscriptionInstance.actions.initializeSubscription({
                ...subscriptionInput,
                resourceId: resourceInstanceDoc.header.id,
                resourceLabel: parsedTeamName,
                resourceThumbnailUrl: serviceOfferingState.thumbnailUrl,
              }),
            ],
          );

          // Set billing projection from tier price
          const projectedAmount =
            subscriptionInput.tierPrice ?? priceBreakdown.tierCycleTotal;
          if (projectedAmount != null) {
            await reactorClient.execute(
              subscriptionInstanceDoc.header.id,
              "main",
              [
                SubscriptionInstance.actions.updateBillingProjection({
                  projectedBillAmount: projectedAmount,
                  projectedBillCurrency: priceBreakdown.tierCurrency || "USD",
                }),
              ],
            );
          }

          return {
            success: true,
            data: {
              linkToDrive: getDriveLink(parsedTeamName),
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
 * Uses the drive slug in the switchboard URL path.
 */
function getDriveLink(driveSlug: string): string {
  const baseUri = process.env.BASE_URI || "";

  if (baseUri.includes("-dev.")) {
    return `https://connect-dev.powerhouse.xyz/?driveUrl=https://switchboard-dev.powerhouse.xyz/d/${driveSlug}`;
  }

  if (baseUri.includes("-staging.")) {
    return `https://connect-staging.powerhouse.xyz/?driveUrl=https://switchboard-staging.powerhouse.xyz/d/${driveSlug}`;
  }

  if (baseUri && !baseUri.includes("localhost")) {
    return `https://connect.powerhouse.xyz/?driveUrl=https://switchboard.powerhouse.xyz/d/${driveSlug}`;
  }

  return `http://localhost:3000/?driveUrl=http://localhost:4001/d/${driveSlug}`;
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
  reactorClient: IReactorClient,
  resourceInstanceDocId: string,
  resourceTemplateId: string,
  operatorId: string,
  customerId: string,
  customerName: string,
) {
  const resourceTemplateDoc =
    await reactorClient.get<ResourceTemplateDocument>(resourceTemplateId);
  if (!resourceTemplateDoc) return;

  const templateState = resourceTemplateDoc.state.global;

  // Initialize instance with basic info from template
  await reactorClient.execute(resourceInstanceDocId, "main", [
    ResourceInstance.actions.initializeInstance({
      operatorId,
      operatorDocumentType: "powerhouse/builder-profile",
      resourceTemplateId,
      customerId,
      customerName,
      templateName: templateState.title,
      thumbnailUrl: templateState.thumbnailUrl,
      infoLink: templateState.infoLink,
      description: templateState.description,
    }),
  ]);

  // Populate facet configuration from template's facetTargets
  for (const facetTarget of templateState.facetTargets) {
    if (facetTarget.selectedOptions.length > 0) {
      await reactorClient.execute(resourceInstanceDocId, "main", [
        ResourceInstance.actions.setInstanceFacet({
          id: facetTarget.id,
          categoryKey: facetTarget.categoryKey,
          categoryLabel: facetTarget.categoryLabel,
          selectedOption: facetTarget.selectedOptions[0],
        }),
      ]);
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
    availableBillingCycles: state.availableBillingCycles,
    facetTargets: state.facetTargets.map((facet) => ({
      id: facet.id,
      categoryKey: facet.categoryKey,
      categoryLabel: facet.categoryLabel,
      selectedOptions: facet.selectedOptions,
    })),
    services: state.services.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description || null,
      displayOrder: service.displayOrder ?? null,
      isSetupFormation: service.isSetupFormation,
      optionGroupId: service.optionGroupId || null,
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
      billingCycleDiscounts: tier.billingCycleDiscounts.map((d) => ({
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
      billingCycleDiscounts: group.billingCycleDiscounts.map((d) => ({
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
  };
}

async function getOperatorDrive(
  reactorClient: IReactorClient,
  resourceTemplateId: string,
) {
  const { results: drives } = await reactorClient.find({
    type: "powerhouse/document-drive",
  });
  const operatorDrive = drives.find((drive: PHDocument) => {
    const driveDoc = drive as DocumentDriveDocument;
    return driveDoc.state.global.nodes.some(
      (node) => node.id === resourceTemplateId,
    );
  });
  return operatorDrive
    ? (operatorDrive as DocumentDriveDocument)
    : undefined;
}
