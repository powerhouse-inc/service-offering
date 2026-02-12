import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  ServiceSubscriptionTier,
  Service,
  ServiceLevelBinding,
  ServiceUsageLimit,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  addTier,
  deleteTier,
  addServiceLevel,
  updateServiceLevel,
  removeServiceLevel,
  addUsageLimit,
  removeUsageLimit,
} from "../../../document-models/service-offering/gen/creators.js";

interface TiersListProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

export function TiersList({ document, dispatch }: TiersListProps) {
  const { state } = document;
  const globalState = state.global;
  const tiers = globalState.tiers ?? [];
  const services = globalState.services ?? [];
  const [isAdding, setIsAdding] = useState(false);
  const [expandedTierId, setExpandedTierId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "USD",
  });

  const handleAddTier = () => {
    if (!formData.name || !formData.amount) return;

    dispatch(
      addTier({
        id: generateId(),
        name: formData.name,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        lastModified: new Date().toISOString(),
      }),
    );

    setFormData({
      name: "",
      description: "",
      amount: "",
      currency: "USD",
    });
    setIsAdding(false);
  };

  const handleDeleteTier = (tierId: string) => {
    if (confirm("Are you sure you want to delete this tier?")) {
      dispatch(
        deleteTier({
          id: tierId,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const handleAddServiceLevel = (tierId: string, serviceId: string) => {
    dispatch(
      addServiceLevel({
        tierId,
        serviceLevelId: generateId(),
        serviceId,
        level: "INCLUDED",
        optionGroupId: undefined,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleUpdateServiceLevel = (
    tierId: string,
    serviceLevelId: string,
    level: string,
  ) => {
    dispatch(
      updateServiceLevel({
        tierId,
        serviceLevelId,
        level: level as any,
        optionGroupId: undefined,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleRemoveServiceLevel = (tierId: string, serviceLevelId: string) => {
    dispatch(
      removeServiceLevel({
        tierId,
        serviceLevelId,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleAddUsageLimit = (tierId: string) => {
    const metric = prompt(
      "Enter metric name (e.g., 'Number of Contributors'):",
    );
    if (!metric) return;

    const serviceId = services[0]?.id || "";
    if (!serviceId) {
      alert("Please add a service first before adding usage limits.");
      return;
    }

    const limitStr = prompt("Enter limit (leave empty for unlimited):");
    const limit = limitStr ? parseInt(limitStr) : undefined;

    dispatch(
      addUsageLimit({
        tierId,
        limitId: generateId(),
        serviceId,
        metric,
        freeLimit: limit,
        resetCycle: "MONTHLY",
        notes: undefined,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleRemoveUsageLimit = (tierId: string, limitId: string) => {
    dispatch(
      removeUsageLimit({
        tierId,
        limitId,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const getServiceLevelColor = (level: string) => {
    switch (level) {
      case "INCLUDED":
        return "bg-green-100 text-green-800";
      case "OPTIONAL":
        return "bg-blue-100 text-blue-800";
      case "NOT_INCLUDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Subscription Tiers
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Tier
          </button>
        )}
      </div>

      {/* Add Tier Form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">New Tier</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Basic, Professional, Enterprise"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="200"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tier description..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleAddTier}
              disabled={!formData.name || !formData.amount}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Tier
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setFormData({
                  name: "",
                  description: "",
                  amount: "",
                  currency: "USD",
                });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tiers List */}
      {tiers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tiers added yet</p>
          <p className="text-sm">Click "Add Tier" to create your first tier</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tiers.map((tier: ServiceSubscriptionTier) => (
            <div
              key={tier.id}
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              {/* Tier Header */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {tier.name}
                    </h3>
                    {tier.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {tier.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {tier.pricing.currency} {tier.pricing.amount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedTierId(
                          expandedTierId === tier.id ? null : tier.id,
                        )
                      }
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      {expandedTierId === tier.id ? "Collapse" : "Expand"}
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Tier Details (Expanded) */}
              {expandedTierId === tier.id && (
                <div className="p-4 space-y-4">
                  {/* Service Levels */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Service Levels
                      </h4>
                      {services.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddServiceLevel(tier.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="text-sm px-2 py-1 border border-gray-300 rounded-md"
                          defaultValue=""
                        >
                          <option value="">+ Add Service</option>
                          {services
                            .filter(
                              (s) =>
                                !(tier.serviceLevels ?? []).some(
                                  (sl) => sl.serviceId === s.id,
                                ),
                            )
                            .map((service: Service) => (
                              <option key={service.id} value={service.id}>
                                {service.title}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>

                    {(tier.serviceLevels ?? []).length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No services configured for this tier
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(tier.serviceLevels ?? []).map(
                          (sl: ServiceLevelBinding) => {
                            const service = services.find(
                              (s: Service) => s.id === sl.serviceId,
                            );
                            return (
                              <div
                                key={sl.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                              >
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {service?.title || "Unknown Service"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <select
                                    value={sl.level}
                                    onChange={(e) =>
                                      handleUpdateServiceLevel(
                                        tier.id,
                                        sl.id,
                                        e.target.value,
                                      )
                                    }
                                    className={`text-sm px-2 py-1 rounded-md border-0 ${getServiceLevelColor(sl.level)}`}
                                  >
                                    <option value="INCLUDED">Included</option>
                                    <option value="OPTIONAL">Optional</option>
                                    <option value="NOT_INCLUDED">
                                      Not Included
                                    </option>
                                  </select>
                                  <button
                                    onClick={() =>
                                      handleRemoveServiceLevel(tier.id, sl.id)
                                    }
                                    className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded-md"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>

                  {/* Usage Limits */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Usage Limits
                      </h4>
                      <button
                        onClick={() => handleAddUsageLimit(tier.id)}
                        className="text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md"
                      >
                        + Add Limit
                      </button>
                    </div>

                    {(tier.usageLimits ?? []).length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No usage limits configured
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(tier.usageLimits ?? []).map(
                          (limit: ServiceUsageLimit) => (
                            <div
                              key={limit.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {limit.metric}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">
                                  {limit.freeLimit
                                    ? `Up to ${limit.freeLimit}`
                                    : "Unlimited"}
                                </span>
                                {limit.resetCycle && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    /{" "}
                                    {limit.resetCycle === "NONE"
                                      ? "One-time"
                                      : limit.resetCycle}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() =>
                                  handleRemoveUsageLimit(tier.id, limit.id)
                                }
                                className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded-md"
                              >
                                Remove
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
