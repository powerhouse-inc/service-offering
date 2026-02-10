import { useState } from "react";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  updateOfferingInfo,
  updateOfferingStatus,
  setOperator,
  setOfferingId,
} from "../../../document-models/service-offering/gen/creators.js";

interface OfferingInfoProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

export function OfferingInfo({ document, dispatch }: OfferingInfoProps) {
  const { state } = document;
  const globalState = state.global;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: globalState.id || "",
    title: globalState.title || "",
    summary: globalState.summary || "",
    infoLink: globalState.infoLink || "",
    operatorId: globalState.operatorId || "",
  });

  const handleSave = () => {
    if (formData.id && formData.id !== globalState.id) {
      dispatch(
        setOfferingId({
          id: formData.id,
          lastModified: new Date().toISOString(),
        }),
      );
    }

    if (
      formData.title !== globalState.title ||
      formData.summary !== globalState.summary ||
      formData.infoLink !== globalState.infoLink
    ) {
      dispatch(
        updateOfferingInfo({
          title: formData.title || undefined,
          summary: formData.summary || undefined,
          infoLink: formData.infoLink || undefined,
          lastModified: new Date().toISOString(),
        }),
      );
    }

    if (formData.operatorId && formData.operatorId !== globalState.operatorId) {
      dispatch(
        setOperator({
          operatorId: formData.operatorId,
          lastModified: new Date().toISOString(),
        }),
      );
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      id: globalState.id || "",
      title: globalState.title || "",
      summary: globalState.summary || "",
      infoLink: globalState.infoLink || "",
      operatorId: globalState.operatorId || "",
    });
    setIsEditing(false);
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    COMING_SOON: "bg-blue-100 text-blue-800",
    ACTIVE: "bg-green-100 text-green-800",
    DEPRECATED: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Offering Information
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[globalState.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {globalState.status}
          </span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offering ID (PHID)
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="phid:offering-..."
              disabled={!!globalState.id}
            />
            {globalState.id && (
              <p className="text-sm text-gray-500 mt-1">
                ID cannot be changed once set
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Powerhouse Operational Services"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your service offering..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Info Link (URL)
            </label>
            <input
              type="url"
              value={formData.infoLink}
              onChange={(e) =>
                setFormData({ ...formData, infoLink: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator ID (PHID)
            </label>
            <input
              type="text"
              value={formData.operatorId}
              onChange={(e) =>
                setFormData({ ...formData, operatorId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="phid:operator-..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {globalState.id && (
            <div>
              <span className="text-sm font-medium text-gray-500">ID:</span>
              <p className="text-gray-900 font-mono text-sm">
                {globalState.id}
              </p>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-gray-500">Title:</span>
            <p className="text-gray-900">{globalState.title || "Not set"}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Summary:</span>
            <p className="text-gray-900">{globalState.summary || "Not set"}</p>
          </div>

          {globalState.infoLink && (
            <div>
              <span className="text-sm font-medium text-gray-500">
                Info Link:
              </span>
              <a
                href={globalState.infoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {globalState.infoLink}
              </a>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-gray-500">Operator:</span>
            <p className="text-gray-900 font-mono text-sm">
              {globalState.operatorId || "Not set"}
            </p>
          </div>

          {globalState.lastModified && (
            <div>
              <span className="text-sm font-medium text-gray-500">
                Last Modified:
              </span>
              <p className="text-gray-900 text-sm">
                {new Date(globalState.lastModified).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Change Section */}
      {!isEditing && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Change Status
          </label>
          <div className="flex items-center gap-2">
            {["DRAFT", "COMING_SOON", "ACTIVE", "DEPRECATED"].map((status) => (
              <button
                key={status}
                onClick={() =>
                  dispatch(
                    updateOfferingStatus({
                      status: status as any,
                      lastModified: new Date().toISOString(),
                    }),
                  )
                }
                disabled={globalState.status === status}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  globalState.status === status
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
