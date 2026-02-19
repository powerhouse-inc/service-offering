import {
  DuplicateServiceGroupIdError,
  ServiceGroupNotFoundError,
  DeleteServiceGroupNotFoundError,
  ReorderServiceGroupNotFoundError,
  AddTierPricingServiceGroupNotFoundError,
  AddPricingTierNotFoundError,
  DuplicateTierPricingIdError,
  SetSetupServiceGroupNotFoundError,
  SetSetupTierPricingNotFoundError,
  RemoveSetupServiceGroupNotFoundError,
  RemoveSetupTierPricingNotFoundError,
  AddRecurringServiceGroupNotFoundError,
  AddRecurringTierPricingNotFoundError,
  DuplicatePriceOptionIdError,
  UpdateRecurringServiceGroupNotFoundError,
  UpdateRecurringTierPricingNotFoundError,
  UpdatePriceOptionNotFoundError,
  RemoveRecurringServiceGroupNotFoundError,
  RemoveRecurringTierPricingNotFoundError,
  RemovePriceOptionNotFoundError,
  RemoveTierPricingServiceGroupNotFoundError,
  RemoveTierPricingNotFoundError,
} from "../../gen/service-group-management/error.js";
import type { ServiceOfferingServiceGroupManagementOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingServiceGroupManagementOperations: ServiceOfferingServiceGroupManagementOperations =
  {
    addServiceGroupOperation(state, action) {
      const existing = state.serviceGroups.find(
        (sg) => sg.id === action.input.id,
      );
      if (existing) {
        throw new DuplicateServiceGroupIdError(
          "A service group with this ID already exists",
        );
      }
      state.serviceGroups.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        billingCycle: action.input.billingCycle,
        displayOrder: action.input.displayOrder || null,
        tierPricing: [],
      });
      state.lastModified = action.input.lastModified;
    },
    updateServiceGroupOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.id,
      );
      if (!serviceGroup) {
        throw new ServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (action.input.name) {
        serviceGroup.name = action.input.name;
      }
      if (
        action.input.description !== undefined &&
        action.input.description !== null
      ) {
        serviceGroup.description = action.input.description;
      }
      if (action.input.billingCycle) {
        serviceGroup.billingCycle = action.input.billingCycle;
      }
      if (
        action.input.displayOrder !== undefined &&
        action.input.displayOrder !== null
      ) {
        serviceGroup.displayOrder = action.input.displayOrder;
      }
      state.lastModified = action.input.lastModified;
    },
    deleteServiceGroupOperation(state, action) {
      const groupIndex = state.serviceGroups.findIndex(
        (sg) => sg.id === action.input.id,
      );
      if (groupIndex === -1) {
        throw new DeleteServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      state.services.forEach((service) => {
        if (service.serviceGroupId === action.input.id) {
          service.serviceGroupId = null;
        }
      });
      state.serviceGroups.splice(groupIndex, 1);
      state.lastModified = action.input.lastModified;
    },
    reorderServiceGroupsOperation(state, action) {
      const reordered = action.input.order.map((id, index) => {
        const group = state.serviceGroups.find((sg) => sg.id === id);
        if (!group) {
          throw new ReorderServiceGroupNotFoundError(
            "Service group with ID " + id + " not found during reorder",
          );
        }
        group.displayOrder = index;
        return group;
      });
      state.serviceGroups = reordered;
      state.lastModified = action.input.lastModified;
    },
    addServiceGroupTierPricingOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.serviceGroupId,
      );
      if (!serviceGroup) {
        throw new AddTierPricingServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      const tier = state.tiers.find((t) => t.id === action.input.tierId);
      if (!tier) {
        throw new AddPricingTierNotFoundError(
          "Tier with the specified ID does not exist",
        );
      }
      if (!serviceGroup.tierPricing) {
        serviceGroup.tierPricing = [];
      }
      const existing = serviceGroup.tierPricing.find(
        (tp) => tp.id === action.input.tierPricingId,
      );
      if (existing) {
        throw new DuplicateTierPricingIdError(
          "Tier pricing with this ID already exists for this service group",
        );
      }
      serviceGroup.tierPricing.push({
        id: action.input.tierPricingId,
        tierId: action.input.tierId,
        setupCostsPerCycle: [],
        recurringPricing: [],
      });
      state.lastModified = action.input.lastModified;
    },
    setServiceGroupSetupCostOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.serviceGroupId,
      );
      if (!serviceGroup) {
        throw new SetSetupServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (!serviceGroup.tierPricing) {
        serviceGroup.tierPricing = [];
      }
      const tierPricing = serviceGroup.tierPricing.find(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (!tierPricing) {
        throw new SetSetupTierPricingNotFoundError(
          "Tier pricing not found for the specified tier in this service group",
        );
      }
      tierPricing.setupCostsPerCycle = [
        {
          id: action.input.tierId,
          billingCycle: "MONTHLY",
          amount: action.input.amount,
          currency: action.input.currency,
        },
      ];
      state.lastModified = action.input.lastModified;
    },
    removeServiceGroupSetupCostOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.serviceGroupId,
      );
      if (!serviceGroup) {
        throw new RemoveSetupServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (!serviceGroup.tierPricing) {
        serviceGroup.tierPricing = [];
      }
      const tierPricing = serviceGroup.tierPricing.find(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (!tierPricing) {
        throw new RemoveSetupTierPricingNotFoundError(
          "Tier pricing not found for the specified tier in this service group",
        );
      }
      tierPricing.setupCostsPerCycle = [];
      state.lastModified = action.input.lastModified;
    },
    addRecurringPriceOptionOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.serviceGroupId,
      );
      if (!serviceGroup) {
        throw new AddRecurringServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (!serviceGroup.tierPricing) {
        serviceGroup.tierPricing = [];
      }
      const tierPricing = serviceGroup.tierPricing.find(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (!tierPricing) {
        throw new AddRecurringTierPricingNotFoundError(
          "Tier pricing not found for the specified tier in this service group",
        );
      }
      const existing = tierPricing.recurringPricing.find(
        (rp) => rp.id === action.input.priceOptionId,
      );
      if (existing) {
        throw new DuplicatePriceOptionIdError(
          "A price option with this ID already exists",
        );
      }
      tierPricing.recurringPricing.push({
        id: action.input.priceOptionId,
        billingCycle: action.input.billingCycle,
        amount: action.input.amount,
        currency: action.input.currency,
        discount: null,
      });
      state.lastModified = action.input.lastModified;
    },
    updateRecurringPriceOptionOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.serviceGroupId,
      );
      if (!serviceGroup) {
        throw new UpdateRecurringServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (!serviceGroup.tierPricing) {
        serviceGroup.tierPricing = [];
      }
      const tierPricing = serviceGroup.tierPricing.find(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (!tierPricing) {
        throw new UpdateRecurringTierPricingNotFoundError(
          "Tier pricing not found for the specified tier in this service group",
        );
      }
      const priceOption = tierPricing.recurringPricing.find(
        (rp) => rp.id === action.input.priceOptionId,
      );
      if (!priceOption) {
        throw new UpdatePriceOptionNotFoundError(
          "Price option with the specified ID does not exist",
        );
      }
      if (action.input.billingCycle) {
        priceOption.billingCycle = action.input.billingCycle;
      }
      if (action.input.amount !== undefined && action.input.amount !== null) {
        priceOption.amount = action.input.amount;
      }
      if (action.input.currency) {
        priceOption.currency = action.input.currency;
      }
      state.lastModified = action.input.lastModified;
    },
    removeRecurringPriceOptionOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.serviceGroupId,
      );
      if (!serviceGroup) {
        throw new RemoveRecurringServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (!serviceGroup.tierPricing) {
        serviceGroup.tierPricing = [];
      }
      const tierPricing = serviceGroup.tierPricing.find(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (!tierPricing) {
        throw new RemoveRecurringTierPricingNotFoundError(
          "Tier pricing not found for the specified tier in this service group",
        );
      }
      const optionIndex = tierPricing.recurringPricing.findIndex(
        (rp) => rp.id === action.input.priceOptionId,
      );
      if (optionIndex === -1) {
        throw new RemovePriceOptionNotFoundError(
          "Price option with the specified ID does not exist",
        );
      }
      tierPricing.recurringPricing.splice(optionIndex, 1);
      state.lastModified = action.input.lastModified;
    },
    removeServiceGroupTierPricingOperation(state, action) {
      const serviceGroup = state.serviceGroups.find(
        (sg) => sg.id === action.input.serviceGroupId,
      );
      if (!serviceGroup) {
        throw new RemoveTierPricingServiceGroupNotFoundError(
          "Service group with the specified ID does not exist",
        );
      }
      if (!serviceGroup.tierPricing) {
        serviceGroup.tierPricing = [];
      }
      const pricingIndex = serviceGroup.tierPricing.findIndex(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (pricingIndex === -1) {
        throw new RemoveTierPricingNotFoundError(
          "Tier pricing not found for the specified tier in this service group",
        );
      }
      serviceGroup.tierPricing.splice(pricingIndex, 1);
      state.lastModified = action.input.lastModified;
    },
  };
