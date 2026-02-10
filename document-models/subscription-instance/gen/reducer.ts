// TODO: remove eslint-disable rules once refactor is done
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { StateReducer } from "document-model";
import { isDocumentAction, createReducer } from "document-model/core";
import type { SubscriptionInstancePHState } from "@powerhousedao/service-offering/document-models/subscription-instance";

import { subscriptionInstanceSubscriptionOperations } from "../src/reducers/subscription.js";
import { subscriptionInstanceServiceOperations } from "../src/reducers/service.js";
import { subscriptionInstanceServiceGroupOperations } from "../src/reducers/service-group.js";
import { subscriptionInstanceMetricsOperations } from "../src/reducers/metrics.js";
import { subscriptionInstanceCustomerOperations } from "../src/reducers/customer.js";

import {
  InitializeSubscriptionInputSchema,
  SetResourceDocumentInputSchema,
  UpdateSubscriptionStatusInputSchema,
  ActivateSubscriptionInputSchema,
  PauseSubscriptionInputSchema,
  SetExpiringInputSchema,
  CancelSubscriptionInputSchema,
  ResumeSubscriptionInputSchema,
  RenewExpiringSubscriptionInputSchema,
  SetBudgetCategoryInputSchema,
  RemoveBudgetCategoryInputSchema,
  UpdateCustomerInfoInputSchema,
  UpdateTierInfoInputSchema,
  SetOperatorNotesInputSchema,
  SetAutoRenewInputSchema,
  SetRenewalDateInputSchema,
  UpdateBillingProjectionInputSchema,
  AddServiceInputSchema,
  RemoveServiceInputSchema,
  UpdateServiceSetupCostInputSchema,
  UpdateServiceRecurringCostInputSchema,
  ReportSetupPaymentInputSchema,
  ReportRecurringPaymentInputSchema,
  UpdateServiceInfoInputSchema,
  AddServiceGroupInputSchema,
  RemoveServiceGroupInputSchema,
  AddServiceToGroupInputSchema,
  RemoveServiceFromGroupInputSchema,
  AddServiceMetricInputSchema,
  UpdateMetricInputSchema,
  UpdateMetricUsageInputSchema,
  RemoveServiceMetricInputSchema,
  IncrementMetricUsageInputSchema,
  DecrementMetricUsageInputSchema,
  SetCustomerTypeInputSchema,
  UpdateTeamMemberCountInputSchema,
} from "./schema/zod.js";

const stateReducer: StateReducer<SubscriptionInstancePHState> = (
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

      subscriptionInstanceSubscriptionOperations.initializeSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_RESOURCE_DOCUMENT": {
      SetResourceDocumentInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.setResourceDocumentOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SUBSCRIPTION_STATUS": {
      UpdateSubscriptionStatusInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.updateSubscriptionStatusOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ACTIVATE_SUBSCRIPTION": {
      ActivateSubscriptionInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.activateSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "PAUSE_SUBSCRIPTION": {
      PauseSubscriptionInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.pauseSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_EXPIRING": {
      SetExpiringInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.setExpiringOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "CANCEL_SUBSCRIPTION": {
      CancelSubscriptionInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.cancelSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RESUME_SUBSCRIPTION": {
      ResumeSubscriptionInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.resumeSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "RENEW_EXPIRING_SUBSCRIPTION": {
      RenewExpiringSubscriptionInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.renewExpiringSubscriptionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_BUDGET_CATEGORY": {
      SetBudgetCategoryInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.setBudgetCategoryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_BUDGET_CATEGORY": {
      RemoveBudgetCategoryInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.removeBudgetCategoryOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_CUSTOMER_INFO": {
      UpdateCustomerInfoInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.updateCustomerInfoOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_TIER_INFO": {
      UpdateTierInfoInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.updateTierInfoOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_OPERATOR_NOTES": {
      SetOperatorNotesInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.setOperatorNotesOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_AUTO_RENEW": {
      SetAutoRenewInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.setAutoRenewOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_RENEWAL_DATE": {
      SetRenewalDateInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.setRenewalDateOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_BILLING_PROJECTION": {
      UpdateBillingProjectionInputSchema().parse(action.input);

      subscriptionInstanceSubscriptionOperations.updateBillingProjectionOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE": {
      AddServiceInputSchema().parse(action.input);

      subscriptionInstanceServiceOperations.addServiceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SERVICE": {
      RemoveServiceInputSchema().parse(action.input);

      subscriptionInstanceServiceOperations.removeServiceOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SERVICE_SETUP_COST": {
      UpdateServiceSetupCostInputSchema().parse(action.input);

      subscriptionInstanceServiceOperations.updateServiceSetupCostOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SERVICE_RECURRING_COST": {
      UpdateServiceRecurringCostInputSchema().parse(action.input);

      subscriptionInstanceServiceOperations.updateServiceRecurringCostOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REPORT_SETUP_PAYMENT": {
      ReportSetupPaymentInputSchema().parse(action.input);

      subscriptionInstanceServiceOperations.reportSetupPaymentOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REPORT_RECURRING_PAYMENT": {
      ReportRecurringPaymentInputSchema().parse(action.input);

      subscriptionInstanceServiceOperations.reportRecurringPaymentOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_SERVICE_INFO": {
      UpdateServiceInfoInputSchema().parse(action.input);

      subscriptionInstanceServiceOperations.updateServiceInfoOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE_GROUP": {
      AddServiceGroupInputSchema().parse(action.input);

      subscriptionInstanceServiceGroupOperations.addServiceGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SERVICE_GROUP": {
      RemoveServiceGroupInputSchema().parse(action.input);

      subscriptionInstanceServiceGroupOperations.removeServiceGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE_TO_GROUP": {
      AddServiceToGroupInputSchema().parse(action.input);

      subscriptionInstanceServiceGroupOperations.addServiceToGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SERVICE_FROM_GROUP": {
      RemoveServiceFromGroupInputSchema().parse(action.input);

      subscriptionInstanceServiceGroupOperations.removeServiceFromGroupOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "ADD_SERVICE_METRIC": {
      AddServiceMetricInputSchema().parse(action.input);

      subscriptionInstanceMetricsOperations.addServiceMetricOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_METRIC": {
      UpdateMetricInputSchema().parse(action.input);

      subscriptionInstanceMetricsOperations.updateMetricOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_METRIC_USAGE": {
      UpdateMetricUsageInputSchema().parse(action.input);

      subscriptionInstanceMetricsOperations.updateMetricUsageOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "REMOVE_SERVICE_METRIC": {
      RemoveServiceMetricInputSchema().parse(action.input);

      subscriptionInstanceMetricsOperations.removeServiceMetricOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "INCREMENT_METRIC_USAGE": {
      IncrementMetricUsageInputSchema().parse(action.input);

      subscriptionInstanceMetricsOperations.incrementMetricUsageOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "DECREMENT_METRIC_USAGE": {
      DecrementMetricUsageInputSchema().parse(action.input);

      subscriptionInstanceMetricsOperations.decrementMetricUsageOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "SET_CUSTOMER_TYPE": {
      SetCustomerTypeInputSchema().parse(action.input);

      subscriptionInstanceCustomerOperations.setCustomerTypeOperation(
        (state as any)[action.scope],
        action as any,
        dispatch,
      );

      break;
    }

    case "UPDATE_TEAM_MEMBER_COUNT": {
      UpdateTeamMemberCountInputSchema().parse(action.input);

      subscriptionInstanceCustomerOperations.updateTeamMemberCountOperation(
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

export const reducer = createReducer<SubscriptionInstancePHState>(stateReducer);
