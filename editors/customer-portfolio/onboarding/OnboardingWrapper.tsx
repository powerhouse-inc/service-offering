import { useState } from "react";
import {
  useSelectedNode,
  useSelectedDocumentId,
  useDocumentById,
} from "@powerhousedao/reactor-browser";
import type { PHDocument } from "document-model";
import type { SubscriptionInstanceState } from "@powerhousedao/service-offering/document-models/subscription-instance";
import { GenerateOnboardingButton } from "./GenerateOnboardingButton.js";
import { OnboardingPanel } from "./OnboardingPanel.js";

type Tab = "document" | "onboarding";

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps the document editor for subscription-instance documents.
 * Adds an "Onboarding" tab that shows/generates the linked WorkBreakdown plan.
 */
export function OnboardingWrapper({ children }: Props) {
  const selectedNode = useSelectedNode();
  const selectedDocId = useSelectedDocumentId();
  const [activeTab, setActiveTab] = useState<Tab>("document");

  const [doc] = useDocumentById(selectedDocId ?? null) as [
    (PHDocument & { state: { global: SubscriptionInstanceState } }) | undefined,
    unknown,
  ];

  // Only show onboarding tab for subscription-instance documents
  const isSubscription =
    selectedNode &&
    "documentType" in selectedNode &&
    selectedNode.documentType === "powerhouse/subscription-instance";

  if (!isSubscription || !selectedDocId) {
    return <>{children}</>;
  }

  const subscription = doc?.state.global;

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-gray-200 bg-white px-4">
        <TabButton
          label="Document"
          active={activeTab === "document"}
          onClick={() => setActiveTab("document")}
        />
        <TabButton
          label="⚡ Onboarding"
          active={activeTab === "onboarding"}
          onClick={() => setActiveTab("onboarding")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "document" ? (
          <div className="h-full">{children}</div>
        ) : (
          <div className="p-6 space-y-6">
            {subscription && (
              <>
                <GenerateOnboardingButton
                  subscriptionDocId={selectedDocId}
                  subscription={subscription}
                />
                <OnboardingPanel
                  subscriptionDocId={selectedDocId}
                  customerName={subscription.customerName}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}
