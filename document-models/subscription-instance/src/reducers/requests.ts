import type { SubscriptionInstanceRequestsOperations } from "@powerhousedao/service-offering/document-models/subscription-instance";

export const subscriptionInstanceRequestsOperations: SubscriptionInstanceRequestsOperations =
  {
    createClientRequestOperation(state, action) {
      const { input } = action;
      state.clientRequests.push({
        id: input.id,
        type: input.type,
        status: "PENDING",
        description: input.description,
        reason: input.reason || null,
        createdAt: input.createdAt,
        resolvedAt: null,
        operatorResponse: null,
        serviceId: input.serviceId || null,
        serviceName: input.serviceName || null,
        metricId: input.metricId || null,
        metricName: input.metricName || null,
        requestedValue: input.requestedValue ?? null,
        optionGroupId: input.optionGroupId || null,
        optionGroupName: input.optionGroupName || null,
      });
    },

    approveRequestOperation(state, action) {
      const { input } = action;
      const request = state.clientRequests.find(
        (r) => r.id === input.requestId,
      );
      if (request) {
        request.status = "APPROVED";
        request.resolvedAt = input.resolvedAt;
        request.operatorResponse = input.operatorResponse || null;
      }
    },

    rejectRequestOperation(state, action) {
      const { input } = action;
      const request = state.clientRequests.find(
        (r) => r.id === input.requestId,
      );
      if (request) {
        request.status = "REJECTED";
        request.resolvedAt = input.resolvedAt;
        request.operatorResponse = input.operatorResponse || null;
      }
    },
  };
