import type { SubscriptionInstanceMetricsOperations } from "@powerhousedao/service-offering/document-models/subscription-instance/v1";


export const subscriptionInstanceMetricsOperations: SubscriptionInstanceMetricsOperations =
  {
    addServiceMetricOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc) {
        svc.metrics.push({
          id: action.input.id,
          name: action.input.name,
          unitName: action.input.unitName || null,
          limit: action.input.limit ?? null,
          freeLimit: action.input.freeLimit ?? null,
          paidLimit: action.input.paidLimit ?? null,
          unitCost: action.input.unitCost ?? null,
          currentUsage: 0,
          usageResetPeriod: action.input.usageResetPeriod || null,
          nextUsageReset: action.input.nextUsageReset || null,
        });
      }
    },
    updateMetricOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      const metric = svc?.metrics.find((m) => m.id === action.input.metricId);
      if (metric) {
        if (action.input.name !== undefined)
          metric.name = action.input.name ?? metric.name;
        if (action.input.unitName !== undefined)
          metric.unitName = action.input.unitName ?? null;
        if (action.input.limit !== undefined)
          metric.limit = action.input.limit ?? null;
        if (action.input.freeLimit !== undefined)
          metric.freeLimit = action.input.freeLimit ?? null;
        if (action.input.paidLimit !== undefined)
          metric.paidLimit = action.input.paidLimit ?? null;
        if (action.input.unitCost !== undefined)
          metric.unitCost = action.input.unitCost ?? null;
        if (action.input.usageResetPeriod !== undefined)
          metric.usageResetPeriod = action.input.usageResetPeriod ?? null;
        if (action.input.nextUsageReset !== undefined)
          metric.nextUsageReset = action.input.nextUsageReset ?? null;
      }
    },
    updateMetricUsageOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      const metric = svc?.metrics.find((m) => m.id === action.input.metricId);
      if (metric) {
        metric.currentUsage = action.input.currentUsage;
      }
    },
    removeServiceMetricOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (svc) {
        const index = svc.metrics.findIndex(
          (m) => m.id === action.input.metricId,
        );
        if (index !== -1) {
          svc.metrics.splice(index, 1);
        }
      }
    },
    incrementMetricUsageOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      const metric = svc?.metrics.find((m) => m.id === action.input.metricId);
      if (metric) {
        metric.currentUsage += action.input.amount;
      }
    },
    decrementMetricUsageOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      const metric = svc?.metrics.find((m) => m.id === action.input.metricId);
      if (metric) {
        metric.currentUsage -= action.input.amount;
      }
    },
  };
