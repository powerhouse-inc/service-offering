import { useState } from "react";
import {
  addDocument,
  dispatchActions,
  useSelectedDrive,
  useNodesInSelectedDrive,
} from "@powerhousedao/reactor-browser";
import { generateId } from "document-model/core";
import type { SubscriptionInstanceState } from "@powerhousedao/service-offering/document-models/subscription-instance";
import {
  subscriptionToOnboardingPlan,
  onboardingDocName,
} from "./subscriptionToWorkBreakdown.js";

interface Props {
  subscriptionDocId: string;
  subscription: SubscriptionInstanceState;
}

export function GenerateOnboardingButton({
  subscriptionDocId,
  subscription,
}: Props) {
  const [selectedDrive] = useSelectedDrive();
  const nodes = useNodesInSelectedDrive();
  const docName = onboardingDocName(subscriptionDocId);
  const driveId = selectedDrive?.header.id;

  // Check if onboarding doc already exists
  const existingNode = nodes?.find(
    (n) => n.kind === "file" && n.name === docName,
  );
  const alreadyGenerated = !!existingNode;

  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!driveId) return;
    setIsGenerating(true);

    try {
      const plan = subscriptionToOnboardingPlan(subscription);
      const now = new Date().toISOString();

      // Create the WorkBreakdown document
      const fileNode = await addDocument(
        driveId,
        docName,
        "powerhouse/work-breakdown",
      );

      // Build all operations as a batch
      const actions: object[] = [];

      // Set project info
      actions.push({
        type: "SET_PROJECT_INFO",
        input: { title: plan.title, description: plan.description },
        scope: "global",
      });

      // Set phase to STRUCTURE (already have the plan)
      actions.push({
        type: "SET_PHASE",
        input: { phase: "STRUCTURE", timestamp: now },
        scope: "global",
      });

      // Add steps and substeps
      for (let stepIdx = 0; stepIdx < plan.steps.length; stepIdx++) {
        const step = plan.steps[stepIdx];
        actions.push({
          type: "ADD_STEP",
          input: {
            id: step.id,
            order: stepIdx + 1,
            name: step.name,
            description: step.description,
          },
          scope: "global",
        });

        for (let subIdx = 0; subIdx < step.substeps.length; subIdx++) {
          const sub = step.substeps[subIdx];

          if (sub.isPrerequisite) {
            actions.push({
              type: "ADD_PREREQUISITE",
              input: {
                id: sub.id,
                name: sub.name,
                description: sub.description,
                owner: sub.owner === "customer" ? "Customer" : "Operator",
                scope: "STEP",
                stepId: step.id,
                createdAt: now,
              },
              scope: "global",
            });
          } else {
            actions.push({
              type: "ADD_SUBSTEP",
              input: {
                id: sub.id,
                stepId: step.id,
                order: subIdx + 1,
                name: sub.name,
                description: sub.description,
              },
              scope: "global",
            });

            actions.push({
              type: "ADD_TASK",
              input: {
                id: generateId(),
                name: sub.name,
                description: sub.description,
                owner: sub.owner === "customer" ? "Customer" : "Operator",
                stepId: step.id,
                substepId: sub.id,
                sequenceOrder: subIdx + 1,
                source: "MANUAL",
                createdAt: now,
              },
              scope: "global",
            });
          }
        }
      }

      // Dispatch all actions to the new WBD document using its ID directly
      await dispatchActions(actions as any, fileNode.id);
    } finally {
      setIsGenerating(false);
    }
  }

  if (alreadyGenerated) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
        <span className="text-green-500">✓</span>
        Onboarding plan generated
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin">⟳</span>
          Generating...
        </>
      ) : (
        <>
          <span>⚡</span>
          Generate Onboarding Plan
        </>
      )}
    </button>
  );
}
