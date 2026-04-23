import {
  AddServiceMetricServiceNotFoundError,
  UpdateMetricServiceNotFoundError,
  UpdateMetricNotFoundError,
  UpdateMetricUsageServiceNotFoundError,
  UpdateMetricUsageNotFoundError,
  RemoveServiceMetricServiceNotFoundError,
  RemoveServiceMetricNotFoundError,
  IncrementMetricUsageServiceNotFoundError,
  IncrementMetricUsageNotFoundError,
  DecrementMetricUsageServiceNotFoundError,
  DecrementMetricUsageNotFoundError,
  SubscriptionNotActiveUpdateUsageError,
  SubscriptionNotActiveIncrementUsageError,
  SubscriptionNotActiveDecrementUsageError,
  SubscriptionNotActiveAccrueMetricUsageError,
  AccrueMetricUsageServiceNotFoundError,
  AccrueMetricUsageMetricNotFoundError,
} from "../../gen/metrics/error.js";
import { calculateOverageCost, findServiceById } from "../utils.js";
import type { SubscriptionInstanceMetricsOperations } from "document-models/subscription-instance/v1";

export const subscriptionInstanceMetricsOperations: SubscriptionInstanceMetricsOperations =
  {
    addServiceMetricOperation(state, action) {
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new AddServiceMetricServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      svc.metrics.push({
        id: action.input.metricId,
        name: action.input.name,
        unitName: action.input.unitName,
        freeLimit: action.input.freeLimit || null,
        paidLimit: action.input.paidLimit || null,
        unitCost:
          action.input.unitCostAmount &&
          action.input.unitCostCurrency &&
          action.input.unitCostBillingCycle
            ? {
                amount: action.input.unitCostAmount,
                currency: action.input.unitCostCurrency,
                billingCycle: action.input.unitCostBillingCycle,
                lastPaymentDate: null,
                discount: null,
              }
            : null,
        currentUsage: action.input.currentUsage,
        metricType: action.input.metricType,
        accrualCycle: action.input.accrualCycle,
      });
    },
    updateMetricOperation(state, action) {
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new UpdateMetricServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const metric = svc.metrics.find((m) => m.id === action.input.metricId);
      if (!metric) {
        throw new UpdateMetricNotFoundError(
          `Metric with ID ${action.input.metricId} not found`,
        );
      }
      if (action.input.name) metric.name = action.input.name;
      if (action.input.unitName) metric.unitName = action.input.unitName;
      if (action.input.freeLimit !== undefined)
        metric.freeLimit = action.input.freeLimit || null;
      if (action.input.paidLimit !== undefined)
        metric.paidLimit = action.input.paidLimit || null;
      if (action.input.metricType) metric.metricType = action.input.metricType;
      if (action.input.accrualCycle)
        metric.accrualCycle = action.input.accrualCycle;
    },
    updateMetricUsageOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveUpdateUsageError(
          `Cannot update metric usage when status is ${state.status}`,
        );
      }
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new UpdateMetricUsageServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const metric = svc.metrics.find((m) => m.id === action.input.metricId);
      if (!metric) {
        throw new UpdateMetricUsageNotFoundError(
          `Metric with ID ${action.input.metricId} not found`,
        );
      }
      if (action.input.isAdjustment === true) {
        metric.currentUsage = action.input.currentUsage;
      } else {
        metric.currentUsage =
          metric.paidLimit != null
            ? Math.min(action.input.currentUsage, metric.paidLimit)
            : action.input.currentUsage;
      }
    },
    removeServiceMetricOperation(state, action) {
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new RemoveServiceMetricServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const index = svc.metrics.findIndex(
        (m) => m.id === action.input.metricId,
      );
      if (index === -1) {
        throw new RemoveServiceMetricNotFoundError(
          `Metric with ID ${action.input.metricId} not found`,
        );
      }
      svc.metrics.splice(index, 1);
    },
    // DEPRECATED: prefer UPDATE_METRIC_USAGE with an absolute value. Retained
    // pending external-consumer audit (spec §4.5 / §10 Q4).
    incrementMetricUsageOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveIncrementUsageError(
          `Cannot increment metric usage when status is ${state.status}`,
        );
      }
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new IncrementMetricUsageServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const metric = svc.metrics.find((m) => m.id === action.input.metricId);
      if (!metric) {
        throw new IncrementMetricUsageNotFoundError(
          `Metric with ID ${action.input.metricId} not found`,
        );
      }
      const newUsage = metric.currentUsage + action.input.incrementBy;
      metric.currentUsage =
        metric.paidLimit != null
          ? Math.min(newUsage, metric.paidLimit)
          : newUsage;
    },
    // DEPRECATED: see incrementMetricUsageOperation note.
    decrementMetricUsageOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveDecrementUsageError(
          `Cannot decrement metric usage when status is ${state.status}`,
        );
      }
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new DecrementMetricUsageServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const metric = svc.metrics.find((m) => m.id === action.input.metricId);
      if (!metric) {
        throw new DecrementMetricUsageNotFoundError(
          `Metric with ID ${action.input.metricId} not found`,
        );
      }
      metric.currentUsage -= action.input.decrementBy;
    },
    accrueMetricUsageOperation(state, action) {
      if (state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveAccrueMetricUsageError(
          `Cannot accrue metric usage when status is ${state.status}`,
        );
      }
      const svc = findServiceById(
        action.input.serviceId,
        state.services,
        state.serviceGroups,
      );
      if (!svc) {
        throw new AccrueMetricUsageServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const metric = svc.metrics.find((m) => m.id === action.input.metricId);
      if (!metric) {
        throw new AccrueMetricUsageMetricNotFoundError(
          `Metric with ID ${action.input.metricId} not found`,
        );
      }
      const cost = calculateOverageCost(metric);
      if (cost > 0) {
        state.totalDebt = (state.totalDebt ?? 0) + cost;
      }
      if (metric.metricType === "CUMULATIVE") {
        metric.currentUsage = 0;
      }
    },
  };
