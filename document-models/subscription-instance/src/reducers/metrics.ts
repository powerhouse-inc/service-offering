import type { RecurringCost, ServiceMetric } from "../../gen/schema/types.js";
import type { SubscriptionInstanceMetricsOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceMetricsOperations: SubscriptionInstanceMetricsOperations =
  {
    addServiceMetricOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        let unitCost: RecurringCost | null = null;
        if (
          input.unitCostAmount &&
          input.unitCostCurrency &&
          input.unitCostBillingCycle
        ) {
          unitCost = {
            amount: input.unitCostAmount,
            currency: input.unitCostCurrency,
            billingCycle: input.unitCostBillingCycle,
            nextBillingDate: input.unitCostNextBillingDate || null,
            lastPaymentDate: input.unitCostLastPaymentDate || null,
            discount: null,
          };
        }

        const metric: ServiceMetric = {
          id: input.metricId,
          name: input.name,
          unitName: input.unitName,
          limit: input.limit ?? null,
          freeLimit: input.freeLimit ?? null,
          paidLimit: input.paidLimit ?? null,
          currentUsage: input.currentUsage,
          usageResetPeriod: input.usageResetPeriod || null,
          nextUsageReset: input.nextUsageReset || null,
          unitCost,
        };

        service.metrics.push(metric);
      }
    },

    updateMetricOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        const metric = service.metrics.find((m) => m.id === input.metricId);
        if (metric) {
          if (input.name) metric.name = input.name;
          if (input.unitName) metric.unitName = input.unitName;
          if (input.limit !== undefined && input.limit !== null)
            metric.limit = input.limit;
          if (input.usageResetPeriod)
            metric.usageResetPeriod = input.usageResetPeriod;
          if (input.nextUsageReset)
            metric.nextUsageReset = input.nextUsageReset;
        }
      }
    },

    updateMetricUsageOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        const metric = service.metrics.find((m) => m.id === input.metricId);
        if (metric) {
          metric.currentUsage = input.currentUsage;
        }
      }
    },

    removeServiceMetricOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        const metricIndex = service.metrics.findIndex(
          (m) => m.id === input.metricId,
        );
        if (metricIndex !== -1) {
          service.metrics.splice(metricIndex, 1);
        }
      }
    },

    incrementMetricUsageOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        const metric = service.metrics.find((m) => m.id === input.metricId);
        if (metric) {
          metric.currentUsage += input.incrementBy;
        }
      }
    },

    decrementMetricUsageOperation(state, action) {
      const { input } = action;
      const service = state.services.find((s) => s.id === input.serviceId);
      if (service) {
        const metric = service.metrics.find((m) => m.id === input.metricId);
        if (metric) {
          metric.currentUsage = Math.max(
            0,
            metric.currentUsage - input.decrementBy,
          );
        }
      }
    },
  };
