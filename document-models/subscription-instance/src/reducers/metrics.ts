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
} from "../../gen/metrics/error.js";
import type { SubscriptionInstanceMetricsOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceMetricsOperations: SubscriptionInstanceMetricsOperations =
  {
    addServiceMetricOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new AddServiceMetricServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      svc.metrics.push({
        id: action.input.metricId,
        name: action.input.name,
        unitName: action.input.unitName,
        limit: action.input.limit || null,
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
                nextBillingDate: action.input.unitCostNextBillingDate || null,
                lastPaymentDate: action.input.unitCostLastPaymentDate || null,
                discount: null,
              }
            : null,
        currentUsage: action.input.currentUsage,
        usageResetPeriod: action.input.usageResetPeriod || null,
        nextUsageReset: action.input.nextUsageReset || null,
      });
    },
    updateMetricOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
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
      if (action.input.limit !== undefined)
        metric.limit = action.input.limit || null;
      if (action.input.usageResetPeriod !== undefined)
        metric.usageResetPeriod = action.input.usageResetPeriod || null;
      if (action.input.nextUsageReset !== undefined)
        metric.nextUsageReset = action.input.nextUsageReset || null;
    },
    updateMetricUsageOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
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
      metric.currentUsage = action.input.currentUsage;
    },
    removeServiceMetricOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
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
    incrementMetricUsageOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
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
      metric.currentUsage += action.input.incrementBy;
    },
    decrementMetricUsageOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
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
  };
