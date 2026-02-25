// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { ServiceOfferingPHState } from "@powerhousedao/service-offering/document-models/service-offering";

import { serviceOfferingOfferingOperations } from "../src/reducers/offering.js";
import { serviceOfferingServicesOperations } from "../src/reducers/services.js";
import { serviceOfferingTiersOperations } from "../src/reducers/tiers.js";
import { serviceOfferingOptionGroupsOperations } from "../src/reducers/option-groups.js";
import { serviceOfferingServiceGroupsOperations } from "../src/reducers/service-groups.js";
import { serviceOfferingConfigurationOperations } from "../src/reducers/configuration.js";

import {
  UpdateOfferingInfoInputSchema,
  UpdateOfferingStatusInputSchema,
  SetOperatorInputSchema,
  SetOfferingIdInputSchema,
  AddTargetAudienceInputSchema,
  RemoveTargetAudienceInputSchema,
  SetFacetTargetInputSchema,
  RemoveFacetTargetInputSchema,
  AddFacetOptionInputSchema,
  RemoveFacetOptionInputSchema,
  SelectResourceTemplateInputSchema,
  ChangeResourceTemplateInputSchema,
  SetAvailableBillingCyclesInputSchema,
  SetFacetBindingsInputSchema,
  AddServiceInputSchema,
  UpdateServiceInputSchema,
  DeleteServiceInputSchema,
  AddFacetBindingInputSchema,
  RemoveFacetBindingInputSchema,
  AddTierInputSchema,
  UpdateTierInputSchema,
  UpdateTierPricingInputSchema,
  DeleteTierInputSchema,
  AddServiceLevelInputSchema,
  UpdateServiceLevelInputSchema,
  RemoveServiceLevelInputSchema,
  AddUsageLimitInputSchema,
  UpdateUsageLimitInputSchema,
  RemoveUsageLimitInputSchema,
  SetTierPricingModeInputSchema,
  AddOptionGroupInputSchema,
  UpdateOptionGroupInputSchema,
  DeleteOptionGroupInputSchema,
  SetOptionGroupStandalonePricingInputSchema,
  AddOptionGroupTierPricingInputSchema,
  UpdateOptionGroupTierPricingInputSchema,
  RemoveOptionGroupTierPricingInputSchema,
  AddServiceGroupInputSchema,
  UpdateServiceGroupInputSchema,
  DeleteServiceGroupInputSchema,
  ReorderServiceGroupsInputSchema,
  AddServiceGroupTierPricingInputSchema,
  SetServiceGroupSetupCostInputSchema,
  RemoveServiceGroupSetupCostInputSchema,
  AddRecurringPriceOptionInputSchema,
  UpdateRecurringPriceOptionInputSchema,
  RemoveRecurringPriceOptionInputSchema,
  RemoveServiceGroupTierPricingInputSchema,
  SetFinalConfigurationInputSchema,
  ClearFinalConfigurationInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<ServiceOfferingPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "UPDATE_OFFERING_INFO": {
      UpdateOfferingInfoInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.updateOfferingInfoOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_OFFERING_STATUS": {
      UpdateOfferingStatusInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.updateOfferingStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_OPERATOR": {
      SetOperatorInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.setOperatorOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_OFFERING_ID": {
      SetOfferingIdInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.setOfferingIdOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_TARGET_AUDIENCE": {
      AddTargetAudienceInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.addTargetAudienceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_TARGET_AUDIENCE": {
      RemoveTargetAudienceInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.removeTargetAudienceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_FACET_TARGET": {
      SetFacetTargetInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.setFacetTargetOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_FACET_TARGET": {
      RemoveFacetTargetInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.removeFacetTargetOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_FACET_OPTION": {
      AddFacetOptionInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.addFacetOptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_FACET_OPTION": {
      RemoveFacetOptionInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.removeFacetOptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SELECT_RESOURCE_TEMPLATE": {
      SelectResourceTemplateInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.selectResourceTemplateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CHANGE_RESOURCE_TEMPLATE": {
      ChangeResourceTemplateInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.changeResourceTemplateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_AVAILABLE_BILLING_CYCLES": {
      SetAvailableBillingCyclesInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.setAvailableBillingCyclesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_FACET_BINDINGS": {
      SetFacetBindingsInputSchema().parse(action.input);

      serviceOfferingOfferingOperations.setFacetBindingsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE": {
      AddServiceInputSchema().parse(action.input);

      serviceOfferingServicesOperations.addServiceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SERVICE": {
      UpdateServiceInputSchema().parse(action.input);

      serviceOfferingServicesOperations.updateServiceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_SERVICE": {
      DeleteServiceInputSchema().parse(action.input);

      serviceOfferingServicesOperations.deleteServiceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_FACET_BINDING": {
      AddFacetBindingInputSchema().parse(action.input);

      serviceOfferingServicesOperations.addFacetBindingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_FACET_BINDING": {
      RemoveFacetBindingInputSchema().parse(action.input);

      serviceOfferingServicesOperations.removeFacetBindingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_TIER": {
      AddTierInputSchema().parse(action.input);

      serviceOfferingTiersOperations.addTierOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_TIER": {
      UpdateTierInputSchema().parse(action.input);

      serviceOfferingTiersOperations.updateTierOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_TIER_PRICING": {
      UpdateTierPricingInputSchema().parse(action.input);

      serviceOfferingTiersOperations.updateTierPricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_TIER": {
      DeleteTierInputSchema().parse(action.input);

      serviceOfferingTiersOperations.deleteTierOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE_LEVEL": {
      AddServiceLevelInputSchema().parse(action.input);

      serviceOfferingTiersOperations.addServiceLevelOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SERVICE_LEVEL": {
      UpdateServiceLevelInputSchema().parse(action.input);

      serviceOfferingTiersOperations.updateServiceLevelOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SERVICE_LEVEL": {
      RemoveServiceLevelInputSchema().parse(action.input);

      serviceOfferingTiersOperations.removeServiceLevelOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_USAGE_LIMIT": {
      AddUsageLimitInputSchema().parse(action.input);

      serviceOfferingTiersOperations.addUsageLimitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_USAGE_LIMIT": {
      UpdateUsageLimitInputSchema().parse(action.input);

      serviceOfferingTiersOperations.updateUsageLimitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_USAGE_LIMIT": {
      RemoveUsageLimitInputSchema().parse(action.input);

      serviceOfferingTiersOperations.removeUsageLimitOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_TIER_PRICING_MODE": {
      SetTierPricingModeInputSchema().parse(action.input);

      serviceOfferingTiersOperations.setTierPricingModeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_OPTION_GROUP": {
      AddOptionGroupInputSchema().parse(action.input);

      serviceOfferingOptionGroupsOperations.addOptionGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_OPTION_GROUP": {
      UpdateOptionGroupInputSchema().parse(action.input);

      serviceOfferingOptionGroupsOperations.updateOptionGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_OPTION_GROUP": {
      DeleteOptionGroupInputSchema().parse(action.input);

      serviceOfferingOptionGroupsOperations.deleteOptionGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_OPTION_GROUP_STANDALONE_PRICING": {
      SetOptionGroupStandalonePricingInputSchema().parse(action.input);

      serviceOfferingOptionGroupsOperations.setOptionGroupStandalonePricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_OPTION_GROUP_TIER_PRICING": {
      AddOptionGroupTierPricingInputSchema().parse(action.input);

      serviceOfferingOptionGroupsOperations.addOptionGroupTierPricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_OPTION_GROUP_TIER_PRICING": {
      UpdateOptionGroupTierPricingInputSchema().parse(action.input);

      serviceOfferingOptionGroupsOperations.updateOptionGroupTierPricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_OPTION_GROUP_TIER_PRICING": {
      RemoveOptionGroupTierPricingInputSchema().parse(action.input);

      serviceOfferingOptionGroupsOperations.removeOptionGroupTierPricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE_GROUP": {
      AddServiceGroupInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.addServiceGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SERVICE_GROUP": {
      UpdateServiceGroupInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.updateServiceGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DELETE_SERVICE_GROUP": {
      DeleteServiceGroupInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.deleteServiceGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REORDER_SERVICE_GROUPS": {
      ReorderServiceGroupsInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.reorderServiceGroupsOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE_GROUP_TIER_PRICING": {
      AddServiceGroupTierPricingInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.addServiceGroupTierPricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_SERVICE_GROUP_SETUP_COST": {
      SetServiceGroupSetupCostInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.setServiceGroupSetupCostOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SERVICE_GROUP_SETUP_COST": {
      RemoveServiceGroupSetupCostInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.removeServiceGroupSetupCostOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_RECURRING_PRICE_OPTION": {
      AddRecurringPriceOptionInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.addRecurringPriceOptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_RECURRING_PRICE_OPTION": {
      UpdateRecurringPriceOptionInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.updateRecurringPriceOptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_RECURRING_PRICE_OPTION": {
      RemoveRecurringPriceOptionInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.removeRecurringPriceOptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SERVICE_GROUP_TIER_PRICING": {
      RemoveServiceGroupTierPricingInputSchema().parse(action.input);

      serviceOfferingServiceGroupsOperations.removeServiceGroupTierPricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_FINAL_CONFIGURATION": {
      SetFinalConfigurationInputSchema().parse(action.input);

      serviceOfferingConfigurationOperations.setFinalConfigurationOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CLEAR_FINAL_CONFIGURATION": {
      ClearFinalConfigurationInputSchema().parse(action.input);

      serviceOfferingConfigurationOperations.clearFinalConfigurationOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer = createReducer<ServiceOfferingPHState>(stateReducer);
