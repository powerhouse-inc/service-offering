import { generateMock } from "@powerhousedao/common/utils";
import { generateId } from "document-model/core";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  initializeSubscription,
  addServiceMetric,
  updateMetric,
  updateMetricUsage,
  removeServiceMetric,
  incrementMetricUsage,
  decrementMetricUsage,
  AddServiceMetricInputSchema,
  UpdateMetricInputSchema,
  UpdateMetricUsageInputSchema,
  RemoveServiceMetricInputSchema,
  IncrementMetricUsageInputSchema,
  DecrementMetricUsageInputSchema,
} from "@powerhousedao/service-offering/document-models/subscription-instance/v1";

/** Creates a document with a service group containing a service with a metric. */
function createDocWithServiceGroup() {
  const serviceId = generateId();
  const metricId = generateId();
  const groupId = generateId();

  let doc = utils.createDocument();
  doc = reducer(
    doc,
    initializeSubscription({
      createdAt: new Date().toISOString(),
      customerName: "Test",
      selectedBillingCycle: "MONTHLY",
      globalCurrency: "USD",
      autoRenew: true,
      serviceGroups: [
        {
          id: groupId,
          name: "Test Group",
          optional: false,
          services: [
            {
              id: serviceId,
              name: "Test Service",
              metrics: [
                {
                  id: metricId,
                  name: "API Calls",
                  unitName: "calls",
                  currentUsage: 100,
                  freeLimit: 50,
                  paidLimit: 200,
                },
              ],
            },
          ],
        },
      ],
    }),
  );

  return { doc, serviceId, metricId, groupId };
}

describe("MetricsOperations", () => {
  it("should handle addServiceMetric operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceMetricInputSchema());

    const updatedDocument = reducer(document, addServiceMetric(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE_METRIC",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateMetric operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateMetricInputSchema());

    const updatedDocument = reducer(document, updateMetric(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_METRIC",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateMetricUsage operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateMetricUsageInputSchema());

    const updatedDocument = reducer(document, updateMetricUsage(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_METRIC_USAGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeServiceMetric operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceMetricInputSchema());

    const updatedDocument = reducer(document, removeServiceMetric(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE_METRIC",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle incrementMetricUsage operation", () => {
    const document = utils.createDocument();
    const input = generateMock(IncrementMetricUsageInputSchema());

    const updatedDocument = reducer(document, incrementMetricUsage(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "INCREMENT_METRIC_USAGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle decrementMetricUsage operation", () => {
    const document = utils.createDocument();
    const input = generateMock(DecrementMetricUsageInputSchema());

    const updatedDocument = reducer(document, decrementMetricUsage(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "DECREMENT_METRIC_USAGE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  describe("service group metric operations", () => {
    it("should increment metric usage for a service inside a service group", () => {
      const { doc, serviceId, metricId } = createDocWithServiceGroup();

      const updatedDoc = reducer(
        doc,
        incrementMetricUsage({
          serviceId,
          metricId,
          incrementBy: 10,
          currentTime: new Date().toISOString(),
        }),
      );

      const metric =
        updatedDoc.state.global.serviceGroups[0].services[0].metrics[0];
      expect(metric.currentUsage).toBe(110);
      expect(updatedDoc.operations.global[1].error).toBeUndefined();
    });

    it("should decrement metric usage for a service inside a service group", () => {
      const { doc, serviceId, metricId } = createDocWithServiceGroup();

      const updatedDoc = reducer(
        doc,
        decrementMetricUsage({
          serviceId,
          metricId,
          decrementBy: 25,
          currentTime: new Date().toISOString(),
        }),
      );

      const metric =
        updatedDoc.state.global.serviceGroups[0].services[0].metrics[0];
      expect(metric.currentUsage).toBe(75);
      expect(updatedDoc.operations.global[1].error).toBeUndefined();
    });

    it("should set metric usage for a service inside a service group", () => {
      const { doc, serviceId, metricId } = createDocWithServiceGroup();

      const updatedDoc = reducer(
        doc,
        updateMetricUsage({
          serviceId,
          metricId,
          currentUsage: 999,
          currentTime: new Date().toISOString(),
        }),
      );

      const metric =
        updatedDoc.state.global.serviceGroups[0].services[0].metrics[0];
      expect(metric.currentUsage).toBe(999);
      expect(updatedDoc.operations.global[1].error).toBeUndefined();
    });

    it("should return error for non-existent service in service group", () => {
      const { doc, metricId } = createDocWithServiceGroup();

      const updatedDoc = reducer(
        doc,
        incrementMetricUsage({
          serviceId: "non-existent-id",
          metricId,
          incrementBy: 1,
          currentTime: new Date().toISOString(),
        }),
      );

      expect(updatedDoc.operations.global[1].error).toBe(
        "Service with ID non-existent-id not found",
      );
    });
  });
});
