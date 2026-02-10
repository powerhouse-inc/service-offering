// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { ServiceSubscriptionPHState } from "@powerhousedao/service-offering/document-models/service-subscription";

import { serviceSubscriptionSubscriptionManagementOperations } from "../src/reducers/subscription-management.js";
import { serviceSubscriptionTierSelectionOperations } from "../src/reducers/tier-selection.js";
import { serviceSubscriptionAddOnManagementOperations } from "../src/reducers/add-on-management.js";
import { serviceSubscriptionFacetSelectionOperations } from "../src/reducers/facet-selection.js";
import { serviceSubscriptionBillingProjectionOperations } from "../src/reducers/billing-projection.js";

import {
  InitializeSubscriptionInputSchema,
  ActivateSubscriptionInputSchema,
  CancelSubscriptionInputSchema,
  ExpireSubscriptionInputSchema,
  ChangeTierInputSchema,
  SetPricingInputSchema,
  AddAddonInputSchema,
  RemoveAddonInputSchema,
  SetFacetSelectionInputSchema,
  RemoveFacetSelectionInputSchema,
  UpdateBillingProjectionInputSchema,
  SetCachedSnippetsInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<ServiceSubscriptionPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "INITIALIZE_SUBSCRIPTION": {
      InitializeSubscriptionInputSchema().parse(action.input);

      serviceSubscriptionSubscriptionManagementOperations.initializeSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ACTIVATE_SUBSCRIPTION": {
      ActivateSubscriptionInputSchema().parse(action.input);

      serviceSubscriptionSubscriptionManagementOperations.activateSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CANCEL_SUBSCRIPTION": {
      CancelSubscriptionInputSchema().parse(action.input);

      serviceSubscriptionSubscriptionManagementOperations.cancelSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "EXPIRE_SUBSCRIPTION": {
      ExpireSubscriptionInputSchema().parse(action.input);

      serviceSubscriptionSubscriptionManagementOperations.expireSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CHANGE_TIER": {
      ChangeTierInputSchema().parse(action.input);

      serviceSubscriptionTierSelectionOperations.changeTierOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_PRICING": {
      SetPricingInputSchema().parse(action.input);

      serviceSubscriptionTierSelectionOperations.setPricingOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_ADDON": {
      AddAddonInputSchema().parse(action.input);

      serviceSubscriptionAddOnManagementOperations.addAddonOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_ADDON": {
      RemoveAddonInputSchema().parse(action.input);

      serviceSubscriptionAddOnManagementOperations.removeAddonOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_FACET_SELECTION": {
      SetFacetSelectionInputSchema().parse(action.input);

      serviceSubscriptionFacetSelectionOperations.setFacetSelectionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_FACET_SELECTION": {
      RemoveFacetSelectionInputSchema().parse(action.input);

      serviceSubscriptionFacetSelectionOperations.removeFacetSelectionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_BILLING_PROJECTION": {
      UpdateBillingProjectionInputSchema().parse(action.input);

      serviceSubscriptionBillingProjectionOperations.updateBillingProjectionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_CACHED_SNIPPETS": {
      SetCachedSnippetsInputSchema().parse(action.input);

      serviceSubscriptionBillingProjectionOperations.setCachedSnippetsOperation(
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

export const reducer = createReducer<ServiceSubscriptionPHState>(stateReducer);
