import { useState } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  Service,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  addService,
  updateService,
  deleteService,
} from "../../../document-models/service-offering/gen/creators.js";

interface ServicesListProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

export function ServicesList({ document, dispatch }: ServicesListProps) {
  const { state } = document;
  const globalState = state.global;
  const services = globalState.services ?? [];
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleAdd = () => {
    if (!formData.title) return;

    dispatch(
      addService({
        id: generateId(),
        title: formData.title,
        description: formData.description || undefined,
        lastModified: new Date().toISOString(),
      }),
    );

    setFormData({ title: "", description: "" });
    setIsAdding(false);
  };

  const handleUpdate = (serviceId: string) => {
    dispatch(
      updateService({
        id: serviceId,
        title: formData.title || undefined,
        description: formData.description || undefined,
        lastModified: new Date().toISOString(),
      }),
    );

    setFormData({ title: "", description: "" });
    setEditingId(null);
  };

  const handleDelete = (serviceId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this service? This will also remove all tier bindings for this service.",
      )
    ) {
      dispatch(
        deleteService({
          id: serviceId,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const startEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      description: service.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", description: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Services</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Service
          </button>
        )}
      </div>

      {/* Add Service Form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            New Service
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Legal Entity Incorporation"
              />
            </div>

            <div>
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
                placeholder="Service description..."
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                disabled={!formData.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Service
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ title: "", description: "" });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No services added yet</p>
          <p className="text-sm">
            Click "Add Service" to define your first service
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service: Service) => (
            <div
              key={service.id}
              className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition-colors"
            >
              {editingId === service.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(service.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {service.title}
                      </h3>
                      {service.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {service.description}
                        </p>
                      )}
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">
                          ID:{" "}
                        </span>
                        <span className="text-xs font-mono text-gray-600">
                          {service.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEdit(service)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {services.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Services can be bound to resource facets and
            assigned to subscription tiers. Configure tier bindings in the Tiers
            section below.
          </p>
        </div>
      )}
    </div>
  );
}
