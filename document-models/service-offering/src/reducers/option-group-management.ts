import {
  SetStandaloneOptionGroupNotFoundError,
  AddTierPricingOptionGroupNotFoundError,
  DuplicateOptionGroupTierPricingIdError,
  UpdateTierPricingOptionGroupNotFoundError,
  UpdateTierPricingOptionGroupTierNotFoundError,
  RemoveTierPricingOptionGroupNotFoundError,
  RemoveTierPricingOptionGroupTierNotFoundError,
  SetDiscountModeGroupNotFoundError,
} from "../../gen/option-group-management/error.js";
import type { ServiceOfferingOptionGroupManagementOperations } from "@powerhousedao/service-offering/document-models/service-offering";

export const serviceOfferingOptionGroupManagementOperations: ServiceOfferingOptionGroupManagementOperations =
  {
    addOptionGroupOperation(state, action) {
      state.optionGroups.push({
        id: action.input.id,
        name: action.input.name,
        description: action.input.description || null,
        isAddOn: action.input.isAddOn,
        defaultSelected: action.input.defaultSelected,
        pricingMode: null,
        standalonePricing: null,
        tierDependentPricing: [],
        costType: action.input.costType || null,
        availableBillingCycles: action.input.availableBillingCycles || [],
        billingCycleDiscounts: [],
        discountMode: null,
        price: action.input.price || null,
        currency: action.input.currency || null,
      });
      state.lastModified = action.input.lastModified;
    },
    updateOptionGroupOperation(state, action) {
      const optionGroup = state.optionGroups.find(
        (og) => og.id === action.input.id,
      );
      if (optionGroup) {
        if (action.input.name) {
          optionGroup.name = action.input.name;
        }
        if (
          action.input.description !== undefined &&
          action.input.description !== null
        ) {
          optionGroup.description = action.input.description;
        }
        if (
          action.input.isAddOn !== undefined &&
          action.input.isAddOn !== null
        ) {
          optionGroup.isAddOn = action.input.isAddOn;
        }
        if (
          action.input.defaultSelected !== undefined &&
          action.input.defaultSelected !== null
        ) {
          optionGroup.defaultSelected = action.input.defaultSelected;
        }
        if (action.input.costType !== undefined) {
          optionGroup.costType = action.input.costType || null;
        }
        if (action.input.availableBillingCycles !== undefined) {
          optionGroup.availableBillingCycles =
            action.input.availableBillingCycles || [];
        }
        if (action.input.price !== undefined) {
          optionGroup.price = action.input.price || null;
        }
        if (action.input.currency !== undefined) {
          optionGroup.currency = action.input.currency || null;
        }
      }
      state.lastModified = action.input.lastModified;
    },
    deleteOptionGroupOperation(state, action) {
      const optionGroupIndex = state.optionGroups.findIndex(
        (og) => og.id === action.input.id,
      );
      if (optionGroupIndex !== -1) {
        state.tiers.forEach((tier) => {
          tier.serviceLevels.forEach((sl) => {
            if (sl.optionGroupId === action.input.id) {
              sl.optionGroupId = null;
            }
          });
        });
        state.optionGroups.splice(optionGroupIndex, 1);
      }
      state.lastModified = action.input.lastModified;
    },
    setOptionGroupStandalonePricingOperation(state, action) {
      const optionGroup = state.optionGroups.find(
        (og) => og.id === action.input.optionGroupId,
      );
      if (!optionGroup) {
        throw new SetStandaloneOptionGroupNotFoundError(
          "Option group with the specified ID does not exist",
        );
      }
      optionGroup.pricingMode = "STANDALONE";
      optionGroup.standalonePricing = {
        setupCost: action.input.setupCost || null,
        recurringPricing: action.input.recurringPricing.map((rp) => ({
          ...rp,
          discount: null,
        })),
      };
      optionGroup.tierDependentPricing = [];
      // Set billing cycle discounts if provided as extra field
      const extraInput = action.input as Record<string, unknown>;
      if (Array.isArray(extraInput.billingCycleDiscounts)) {
        optionGroup.billingCycleDiscounts =
          extraInput.billingCycleDiscounts as typeof optionGroup.billingCycleDiscounts;
      }
      state.lastModified = action.input.lastModified;
    },
    addOptionGroupTierPricingOperation(state, action) {
      const optionGroup = state.optionGroups.find(
        (og) => og.id === action.input.optionGroupId,
      );
      if (!optionGroup) {
        throw new AddTierPricingOptionGroupNotFoundError(
          "Option group with the specified ID does not exist",
        );
      }
      optionGroup.pricingMode = "TIER_DEPENDENT";
      optionGroup.standalonePricing = null;
      if (!optionGroup.tierDependentPricing) {
        optionGroup.tierDependentPricing = [];
      }
      const existing = optionGroup.tierDependentPricing.find(
        (tp) => tp.id === action.input.tierPricingId,
      );
      if (existing) {
        throw new DuplicateOptionGroupTierPricingIdError(
          "Tier pricing with this ID already exists for this option group",
        );
      }
      optionGroup.tierDependentPricing.push({
        id: action.input.tierPricingId,
        tierId: action.input.tierId,
        setupCost: action.input.setupCost || null,
        recurringPricing: action.input.recurringPricing.map((rp) => ({
          ...rp,
          discount: rp.discount || null,
        })),
      });
      state.lastModified = action.input.lastModified;
    },
    updateOptionGroupTierPricingOperation(state, action) {
      const optionGroup = state.optionGroups.find(
        (og) => og.id === action.input.optionGroupId,
      );
      if (!optionGroup) {
        throw new UpdateTierPricingOptionGroupNotFoundError(
          "Option group with the specified ID does not exist",
        );
      }
      if (!optionGroup.tierDependentPricing) {
        optionGroup.tierDependentPricing = [];
      }
      const tierPricing = optionGroup.tierDependentPricing.find(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (!tierPricing) {
        throw new UpdateTierPricingOptionGroupTierNotFoundError(
          "Tier pricing not found for the specified tier in this option group",
        );
      }
      if (action.input.setupCost !== undefined) {
        tierPricing.setupCost = action.input.setupCost || null;
      }
      if (action.input.recurringPricing) {
        tierPricing.recurringPricing = action.input.recurringPricing.map(
          (rp) => ({
            ...rp,
            discount: rp.discount || null,
          }),
        );
      }
      state.lastModified = action.input.lastModified;
    },
    removeOptionGroupTierPricingOperation(state, action) {
      const optionGroup = state.optionGroups.find(
        (og) => og.id === action.input.optionGroupId,
      );
      if (!optionGroup) {
        throw new RemoveTierPricingOptionGroupNotFoundError(
          "Option group with the specified ID does not exist",
        );
      }
      if (!optionGroup.tierDependentPricing) {
        optionGroup.tierDependentPricing = [];
      }
      const pricingIndex = optionGroup.tierDependentPricing.findIndex(
        (tp) => tp.tierId === action.input.tierId,
      );
      if (pricingIndex === -1) {
        throw new RemoveTierPricingOptionGroupTierNotFoundError(
          "Tier pricing not found for the specified tier in this option group",
        );
      }
      optionGroup.tierDependentPricing.splice(pricingIndex, 1);
      state.lastModified = action.input.lastModified;
    },
    setOptionGroupDiscountModeOperation(state, action) {
      const optionGroup = state.optionGroups.find(
        (og) => og.id === action.input.optionGroupId,
      );
      if (!optionGroup) {
        throw new SetDiscountModeGroupNotFoundError(
          "Option group with the specified ID does not exist",
        );
      }
      optionGroup.discountMode = action.input.discountMode;
      state.lastModified = action.input.lastModified;
    },
  };
