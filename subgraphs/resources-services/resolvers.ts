import { BaseSubgraph } from "@powerhousedao/reactor-api";
import type { PHDocument } from "document-model";
import type {
  ResourceTemplateDocument,
  TemplateStatus,
} from "@powerhousedao/service-offering/document-models/resource-template";
import type {
  ServiceOfferingDocument,
  ServiceStatus,
  BillingCycle,
} from "@powerhousedao/service-offering/document-models/service-offering";
import { createAction, generateId } from "document-model/core";
import { addFile } from "document-drive";
import type { FileNode } from "document-drive";
import {
  ResourceInstanceV1,
  SubscriptionInstanceV1,
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

export const getResolvers = (subgraph: BaseSubgraph): Record<string, unknown> => {
  const reactor = subgraph.reactor;
  const reactorClient = subgraph.reactorClient;

  return {
    Query: {
      resourceTemplates: async (
        _: unknown,
        args: { filter?: ResourceTemplatesFilter },
      ) => {
        const { id, status, operatorId } = args.filter || {};

        // If filtering by specific id, fetch directly
        if (id) {
          try {
            const result = await reactorClient.find({ type: "powerhouse/resource-template", ids: [id] });
            const docs = result.results as ResourceTemplateDocument[];
            if (docs.length === 0) return [];

            const doc = docs[0];
            const state = doc.state.global;
            if (status && status.length > 0 && !status.includes(state.status)) {
              return [];
            }
            if (operatorId && state.operatorId !== operatorId) {
              return [];
            }
            return [mapResourceTemplateState(state, doc)];
          } catch {
            return [];
          }
        }

        // Find all resource template documents
        const result = await reactorClient.find({ type: "powerhouse/resource-template" });
        const docs = result.results as ResourceTemplateDocument[];

        const resourceTemplates: ReturnType<typeof mapResourceTemplateState>[] = [];

        for (const doc of docs) {
          const state = doc.state.global;

          if (status && status.length > 0 && !status.includes(state.status)) {
            continue;
          }
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

        // If filtering by specific id, fetch directly
        if (id) {
          try {
            const result = await reactorClient.find({ type: "powerhouse/service-offering", ids: [id] });
            const docs = result.results as ServiceOfferingDocument[];
            if (docs.length === 0) return [];

            const doc = docs[0];
            const state = doc.state.global;
            if (status && status.length > 0 && !status.includes(state.status)) {
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
          } catch {
            return [];
          }
        }

        // Find all service offering documents
        const result = await reactorClient.find({ type: "powerhouse/service-offering" });
        const docs = result.results as ServiceOfferingDocument[];

        const serviceOfferings: ReturnType<typeof mapServiceOfferingState>[] = [];

        for (const doc of docs) {
          const state = doc.state.global;

          if (status && status.length > 0 && !status.includes(state.status)) {
            continue;
          }
          if (operatorId && state.operatorId !== operatorId) {
            continue;
          }
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

        // Find the selected tier
        const selectedTier = serviceOfferingState.tiers.find(
          (t) => t.id === userSelection.tierId,
        );
        if (!selectedTier) {
          return {
            success: false,
            data: null,
            errors: ["Selected tier not found in service offering"],
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
          const teamBuilderAdminDrive = await reactor.addDrive({
            global: {
              name: teamName,
              icon: "https://cdn-icons-png.flaticon.com/512/6020/6020347.png",
            },
            id: generateId(),
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
              name: `${parsedTeamName} Builder Profile`,
              parentFolder: teamBuilderAdminDrive.state.global.nodes?.find(
                (node) => node.kind === "folder",
              )?.parentFolder,
            }),
          );

          await reactor.addAction(
            builderProfileDoc.header.id,
            createAction(
              "UPDATE_PROFILE",
              { name: parsedTeamName },
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
          await reactor.addActions(teamBuilderAdminDrive.header.id, [
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
          await reactor.addActions(operatorDrive.header.id, [
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
            reactor,
            resourceInstanceDoc.header.id,
            resourceTemplateId,
            operatorProfileId, // operator profile id
            builderProfileDoc.header.id, // customer id
            parsedTeamName, // customer name from builder profile
          );

          const now = new Date().toISOString();

          await reactor.addAction(
            subscriptionInstanceDoc.header.id,
            SubscriptionInstanceV1.actions.initializeSubscription({
              createdAt: now,
              customerId: builderProfileDoc.header.id,
              customerName: name,
              customerEmail,
              serviceOfferingId,
              tierName: selectedTier.name,
              tierPricingOptionId: selectedTier.id,
              tierPrice: selectedTier.pricing?.amount ?? undefined,
              tierCurrency: selectedTier.pricing?.currency ?? "USD",
              tierPricingMode: selectedTier.pricingMode,
              selectedBillingCycle: userSelection.billingCycle as BillingCycle,
              globalCurrency: selectedTier.pricing?.currency ?? "USD",
            }),
          );

          const projectedAmount = selectedTier.pricing?.amount;
          if (projectedAmount != null) {
            await reactor.addAction(
              subscriptionInstanceDoc.header.id,
              SubscriptionInstanceV1.actions.updateBillingProjection({
                projectedBillAmount: projectedAmount,
                projectedBillCurrency: selectedTier.pricing?.currency || "USD",
              }),
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
  reactor: BaseSubgraph["reactor"],
  resourceInstanceDocId: string,
  resourceTemplateId: string,
  operatorId: string,
  customerId: string,
  customerName: string,
) {
  const resourceTemplateDoc =
    await reactor.getDocument<ResourceTemplateDocument>(resourceTemplateId);
  if (!resourceTemplateDoc) return;

  const templateState = resourceTemplateDoc.state.global;

  // Initialize instance with basic info from template
  await reactor.addAction(
    resourceInstanceDocId,
    ResourceInstanceV1.actions.initializeInstance({
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
  );

  // Populate facet configuration from template's facetTargets
  for (const facetTarget of templateState.facetTargets) {
    if (facetTarget.selectedOptions.length > 0) {
      await reactor.addAction(
        resourceInstanceDocId,
        ResourceInstanceV1.actions.setInstanceFacet({
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
      pricingMode: tier.pricingMode,
      pricing: tier.pricing
        ? {
            amount: tier.pricing.amount,
            currency: tier.pricing.currency,
          }
        : null,
      defaultBillingCycle: tier.defaultBillingCycle || null,
      billingCycleDiscounts: tier.billingCycleDiscounts.map((d) => ({
        cycle: d.cycle,
        discountType: d.discountType,
        discountValue: d.discountValue,
      })),
      serviceLevels: tier.serviceLevels.map((level) => ({
        id: level.id,
        serviceId: level.serviceId,
        level: level.level,
        description: level.description || null,
      })),
      usageLimits: tier.usageLimits.map((limit) => ({
        id: limit.id,
        name: limit.name,
        limit: limit.limit,
        unit: limit.unit || null,
      })),
    })),
    optionGroups: state.optionGroups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || null,
      isAddOn: group.isAddOn,
      defaultSelected: group.defaultSelected,
      pricingMode: group.pricingMode,
      standalonePricing: group.standalonePricing
        ? {
            amount: group.standalonePricing.amount,
            currency: group.standalonePricing.currency,
          }
        : null,
      tierDependentPricing: (group.tierDependentPricing || []).map((tp) => ({
        tierId: tp.tierId,
        amount: tp.amount,
        currency: tp.currency,
      })),
      costType: group.costType || null,
      availableBillingCycles: group.availableBillingCycles || [],
      billingCycleDiscounts: group.billingCycleDiscounts.map((d) => ({
        cycle: d.cycle,
        discountType: d.discountType,
        discountValue: d.discountValue,
      })),
      discountMode: group.discountMode || null,
      price: group.price ?? null,
      currency: group.currency || null,
    })),
  };
}

/**
 * Find the drive that contains a given resource template document.
 * Uses reactorClient to find the parent drive.
 */
async function getOperatorDrive(
  reactorClient: BaseSubgraph["reactorClient"],
  resourceTemplateId: string,
) {
  const result = await reactorClient.getParents(resourceTemplateId);
  const parentDrive = result.results.find(
    (doc) => doc.header.documentType === "powerhouse/document-drive",
  );
  return parentDrive as
    | (PHDocument & { state: { global: { nodes: FileNode[] } } })
    | undefined;
}
