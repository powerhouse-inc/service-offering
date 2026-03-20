import type { BaseSubgraph } from "@powerhousedao/reactor-api";
import type { PHDocument } from "document-model";
import type { IReactorClient } from "@powerhousedao/reactor";
import type { ResourceTemplateDocument } from "../../document-models/resource-template/v1/gen/types.js";
import type { TemplateStatus } from "../../document-models/resource-template/v1/gen/schema/types.js";
import type { ServiceOfferingDocument } from "../../document-models/service-offering/v1/gen/types.js";
import type {
  ServiceStatus,
  BillingCycle,
} from "../../document-models/service-offering/v1/gen/schema/types.js";
import {
  getUserSelectionPriceBreakdown,
  type UserSelection,
  type PriceBreakdown,
} from "../../document-models/service-offering/v1/src/utils.js";
import { createAction, generateId } from "document-model/core";
import { addFile, addFolder, driveCreateDocument } from "document-drive";
import type { DocumentDriveDocument, FileNode, Node } from "document-drive";
import { ResourceInstance } from "../../document-models/resource-instance/v1/module.js";
import { SubscriptionInstance } from "../../document-models/subscription-instance/v1/module.js";
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
  const reactorClient = subgraph.reactorClient;

  return {
    Query: {
      resourceTemplates: async (
        _: unknown,
        args: { filter?: ResourceTemplatesFilter },
      ) => {
        const { id, status, operatorId } = args.filter || {};
        const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);

        // If filtering by specific id, try to fetch directly
        if (id) {
          try {
            const doc = await reactorClient.get<ResourceTemplateDocument>(id);
            if (
              doc &&
              doc.header.documentType === "powerhouse/resource-template" &&
              !doc.state.document.isDeleted &&
              !deletedDriveDocIds.has(doc.header.id)
            ) {
              const state = doc.state.global;
              if (
                status &&
                status.length > 0 &&
                !status.includes(state.status)
              ) {
                return [];
              }
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

        // Find all resource template documents
        const { results: docs } = await reactorClient.find({
          type: "powerhouse/resource-template",
        });

        const resourceTemplates: ReturnType<typeof mapResourceTemplateState>[] =
          [];

        for (const doc of docs) {
          // Skip docs from soft-deleted drives or soft-deleted documents
          if (deletedDriveDocIds.has(doc.header.id)) continue;
          if (doc.state.document.isDeleted) continue;

          const resourceDoc = doc as ResourceTemplateDocument;
          const state = resourceDoc.state.global;

          // Skip documents missing required fields
          if (!state.operatorId) continue;

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
        const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);

        // If filtering by specific id, try to fetch directly
        if (id) {
          try {
            const doc = await reactorClient.get<ServiceOfferingDocument>(id);
            if (
              doc &&
              doc.header.documentType === "powerhouse/service-offering" &&
              !doc.state.document.isDeleted &&
              !deletedDriveDocIds.has(doc.header.id)
            ) {
              const state = doc.state.global;
              if (
                status &&
                status.length > 0 &&
                !status.includes(state.status)
              ) {
                return [];
              }
              if (operatorId && state.operatorId !== operatorId) {
                return [];
              }
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

        // Find all service offering documents
        const { results: docs } = await reactorClient.find({
          type: "powerhouse/service-offering",
        });

        const serviceOfferings: ReturnType<typeof mapServiceOfferingState>[] =
          [];

        for (const doc of docs) {
          // Skip docs from soft-deleted drives or soft-deleted documents
          if (deletedDriveDocIds.has(doc.header.id)) continue;
          if (doc.state.document.isDeleted) continue;

          const offeringDoc = doc as ServiceOfferingDocument;
          const state = offeringDoc.state.global;

          // Skip documents missing required fields
          if (!state.operatorId) continue;

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
        const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);
        const serviceOfferingDoc =
          await reactorClient.get<ServiceOfferingDocument>(serviceOfferingId);
        if (
          !serviceOfferingDoc ||
          (serviceOfferingDoc as PHDocument).state.document.isDeleted ||
          deletedDriveDocIds.has(serviceOfferingDoc.header.id)
        ) {
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

        try {
          // create team-builder-admin drive
          const driveDoc = driveCreateDocument();
          driveDoc.header.name = teamName;
          driveDoc.state.global.name = teamName;
          driveDoc.state.global.icon =
            "https://cdn-icons-png.flaticon.com/512/6020/6020347.png";
          driveDoc.header.slug = parsedTeamName;
          if (!driveDoc.header.meta) driveDoc.header.meta = {};
          driveDoc.header.meta.preferredEditor = "builder-team-admin";
          const teamBuilderAdminDrive =
            await reactorClient.create<DocumentDriveDocument>(driveDoc);

          const driveId = teamBuilderAdminDrive.header.id;

          // create documents as children of the drive so Connect can sync them
          const builderProfileDoc = await reactorClient.createEmpty(
            "powerhouse/builder-profile",
            { parentIdentifier: driveId },
          );
          const resourceInstanceDoc = await reactorClient.createEmpty(
            "powerhouse/resource-instance",
            { parentIdentifier: driveId },
          );
          const subscriptionInstanceDoc = await reactorClient.createEmpty(
            "powerhouse/subscription-instance",
            { parentIdentifier: driveId },
          );

          // create "Service Subscriptions" folder and organize files in team drive
          const teamServiceSubsFolderId = generateId();

          await reactorClient.execute(driveId, "main", [
            addFolder({
              id: teamServiceSubsFolderId,
              name: "Service Subscriptions",
            }),
            addFile({
              documentType: "powerhouse/builder-profile",
              id: builderProfileDoc.header.id,
              name: `${parsedTeamName} Builder Profile`,
            }),
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedTeamName} Resource Instance`,
              parentFolder: teamServiceSubsFolderId,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedTeamName} Subscription Instance`,
              parentFolder: teamServiceSubsFolderId,
            }),
          ]);

          // update builder profile
          await reactorClient.execute(builderProfileDoc.header.id, "main", [
            createAction(
              "UPDATE_PROFILE",
              { name: parsedTeamName },
              undefined,
              undefined,
              "global",
            ),
          ]);

          // find operator drive and add references there too
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
            .filter((node: Node): node is FileNode => node.kind === "file")
            .find(
              (node: FileNode) =>
                node.documentType === "powerhouse/builder-profile",
            )?.id;

          if (!operatorProfileId) {
            throw new Error(
              `Operator profile not found for drive ${operatorDrive.header.id}`,
            );
          }

          // find or create "Service Subscriptions" folder in the operator drive
          let serviceSubscriptionsFolderId =
            operatorDrive.state.global.nodes.find(
              (node: Node) =>
                node.kind === "folder" && node.name === "Service Subscriptions",
            )?.id;

          if (!serviceSubscriptionsFolderId) {
            serviceSubscriptionsFolderId = generateId();
            await reactorClient.execute(operatorDrive.header.id, "main", [
              addFolder({
                id: serviceSubscriptionsFolderId,
                name: "Service Subscriptions",
              }),
            ]);
          }

          // create a team folder inside "Service Subscriptions" for this team's docs
          const teamFolderId = generateId();

          // add reactor-level relationships so Connect syncs the child documents
          // (createEmpty guarantees CREATE_DOCUMENT is persisted before this runs)
          await reactorClient.addChildren(operatorDrive.header.id, [
            resourceInstanceDoc.header.id,
            subscriptionInstanceDoc.header.id,
          ]);

          // add team folder and file references to operator drive
          await reactorClient.execute(operatorDrive.header.id, "main", [
            addFolder({
              id: teamFolderId,
              name: teamName,
              parentFolder: serviceSubscriptionsFolderId,
            }),
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedTeamName} Resource Instance`,
              parentFolder: teamFolderId,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedTeamName} Subscription Instance`,
              parentFolder: teamFolderId,
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
            tierId: selection.tierId,
            selectedBillingCycle: selection.billingCycle,
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
  const baseUri =
    typeof process !== "undefined" ? process.env.BASE_URI || "" : "";

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
    targetAudiences: (state.targetAudiences || []).map((audience) => ({
      id: audience.id,
      label: audience.label,
      color: audience.color || null,
    })),
    setupServices: state.setupServices || [],
    recurringServices: state.recurringServices || [],
    facetTargets: (state.facetTargets || []).map((facet) => ({
      id: facet.id,
      categoryKey: facet.categoryKey,
      categoryLabel: facet.categoryLabel,
      selectedOptions: facet.selectedOptions || [],
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
        supportedOptions: binding.supportedOptions || [],
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
    contentSections: (state.contentSections || []).map((section) => ({
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
    availableBillingCycles: state.availableBillingCycles || [],
    facetTargets: (state.facetTargets || []).map((facet) => ({
      id: facet.id,
      categoryKey: facet.categoryKey,
      categoryLabel: facet.categoryLabel,
      selectedOptions: facet.selectedOptions || [],
    })),
    services: (state.services || []).map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description || null,
      displayOrder: service.displayOrder ?? null,
      isSetupFormation: service.isSetupFormation,
      optionGroupId: service.optionGroupId || null,
    })),
    tiers: (state.tiers || []).map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description || null,
      isCustomPricing: tier.isCustomPricing,
      pricingMode: tier.pricingMode || null,
      pricing: {
        amount: tier.pricing?.amount ?? null,
        currency: tier.pricing?.currency ?? "USD",
      },
      defaultBillingCycle: tier.defaultBillingCycle || null,
      billingCycleDiscounts: (tier.billingCycleDiscounts || []).map((d) => ({
        billingCycle: d.billingCycle,
        discountRule: {
          discountType: d.discountRule?.discountType,
          discountValue: d.discountRule?.discountValue,
        },
      })),
      serviceLevels: (tier.serviceLevels || []).map((level) => ({
        id: level.id,
        serviceId: level.serviceId,
        level: level.level,
        customValue: level.customValue || null,
        optionGroupId: level.optionGroupId || null,
      })),
      usageLimits: (tier.usageLimits || []).map((limit) => ({
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
    optionGroups: (state.optionGroups || []).map((group) => ({
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
            discountType: d.discountRule?.discountType,
            discountValue: d.discountRule?.discountValue,
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
          discountType: d.discountRule?.discountType,
          discountValue: d.discountRule?.discountValue,
        },
      })),
      discountMode: group.discountMode || null,
      price: group.price ?? null,
      currency: group.currency || null,
    })),
  };
}

/**
 * Returns a Set of document IDs that belong to soft-deleted drives.
 * Documents inside a deleted drive should not be returned by queries.
 */
async function getDeletedDriveDocIds(
  reactorClient: IReactorClient,
): Promise<Set<string>> {
  const { results: drives } = await reactorClient.find({
    type: "powerhouse/document-drive",
  });

  const ids = new Set<string>();
  for (const drive of drives) {
    if (!drive.state.document.isDeleted) continue;
    const driveDoc = drive as DocumentDriveDocument;
    for (const node of driveDoc.state.global.nodes) {
      if (node.kind === "file") {
        ids.add(node.id);
      }
    }
  }
  return ids;
}

async function getOperatorDrive(
  reactorClient: IReactorClient,
  resourceTemplateId: string,
): Promise<DocumentDriveDocument | undefined> {
  // Find all drives
  const { results: drives } = await reactorClient.find({
    type: "powerhouse/document-drive",
  });

  for (const drive of drives) {
    // Skip soft-deleted drives
    if (drive.state.document.isDeleted) continue;

    const driveDoc = drive as DocumentDriveDocument;
    // Check if this drive contains the resource template as a child
    const { results: children } = await reactorClient.getChildren(
      driveDoc.header.id,
    );
    const hasTemplate = children.some(
      (child: PHDocument) => child.header.id === resourceTemplateId,
    );
    if (hasTemplate) {
      return driveDoc;
    }
  }

  return undefined;
}
