import {
  useNodesInSelectedDrive,
  useDocumentById,
} from "@powerhousedao/reactor-browser";
import type { PHDocument } from "document-model";
import { onboardingDocName } from "./subscriptionToWorkBreakdown.js";

interface WBDState {
  title?: string | null;
  description?: string | null;
  phase?: string | null;
  steps: WBDStep[];
  prerequisites: WBDPrerequisite[];
  tasks: WBDTask[];
}

interface WBDStep {
  id: string;
  order: number;
  name: string;
  description?: string | null;
  substeps: WBDSubstep[];
}

interface WBDSubstep {
  id: string;
  stepId: string;
  order: number;
  name: string;
  description?: string | null;
}

interface WBDTask {
  id: string;
  name: string;
  stepId: string;
  substepId?: string | null;
  owner: string;
  status?: string | null;
  sequenceOrder: number;
}

interface WBDPrerequisite {
  id: string;
  name: string;
  description?: string | null;
  owner: string;
  scope: string;
  stepId?: string | null;
  status?: string | null;
}

interface Props {
  subscriptionDocId: string;
  customerName?: string | null;
}

export function OnboardingPanel({ subscriptionDocId, customerName }: Props) {
  const nodes = useNodesInSelectedDrive();
  const docName = onboardingDocName(subscriptionDocId);

  const wbdNode = nodes?.find((n) => n.kind === "file" && n.name === docName);

  const [wbdDoc] = useDocumentById(wbdNode?.id ?? null) as [
    (PHDocument & { state: { global: WBDState } }) | undefined,
    unknown,
  ];

  if (!wbdNode) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        No onboarding plan yet. Generate one above.
      </div>
    );
  }

  if (!wbdDoc) {
    return (
      <div className="text-sm text-gray-400 animate-pulse">
        Loading onboarding plan...
      </div>
    );
  }

  const state = wbdDoc.state.global;
  const steps = state.steps ?? [];
  const tasks = state.tasks ?? [];
  const prerequisites = state.prerequisites ?? [];

  const totalTasks = tasks.length + prerequisites.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const metPrereqs = prerequisites.filter((p) => p.status === "MET").length;
  const totalDone = doneTasks + metPrereqs;
  const progressPct =
    totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {state.title ?? `Onboarding — ${customerName ?? "Customer"}`}
        </h2>
        {state.description && (
          <p className="mt-1 text-sm text-gray-500">{state.description}</p>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            {totalDone} of {totalTasks} tasks complete
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((step) => {
            const stepTasks = tasks.filter((t) => t.stepId === step.id);
            const stepPrereqs = prerequisites.filter(
              (p) => p.stepId === step.id,
            );
            const stepDone =
              stepTasks.filter((t) => t.status === "DONE").length +
              stepPrereqs.filter((p) => p.status === "MET").length;
            const stepTotal = stepTasks.length + stepPrereqs.length;
            const stepComplete = stepTotal > 0 && stepDone === stepTotal;

            return (
              <div
                key={step.id}
                className="rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Step header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 ${
                    stepComplete ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        stepComplete
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {stepComplete ? "✓" : step.order}
                    </span>
                    <span className="font-medium text-gray-800">
                      {step.name}
                    </span>
                  </div>
                  {stepTotal > 0 && (
                    <span className="text-xs text-gray-400">
                      {stepDone}/{stepTotal}
                    </span>
                  )}
                </div>

                {/* Prerequisites for this step */}
                {stepPrereqs.length > 0 && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {stepPrereqs.map((prereq) => (
                      <TaskRow
                        key={prereq.id}
                        name={prereq.name}
                        description={prereq.description}
                        owner={prereq.owner}
                        status={prereq.status ?? "NOT_MET"}
                        isPrerequisite
                      />
                    ))}
                  </div>
                )}

                {/* Tasks for this step */}
                {stepTasks.length > 0 && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {stepTasks
                      .slice()
                      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                      .map((task) => (
                        <TaskRow
                          key={task.id}
                          name={task.name}
                          owner={task.owner}
                          status={task.status ?? "PENDING"}
                          isPrerequisite={false}
                        />
                      ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function TaskRow({
  name,
  description,
  owner,
  status,
  isPrerequisite,
}: {
  name: string;
  description?: string | null;
  owner: string;
  status: string;
  isPrerequisite: boolean;
}) {
  const isDone = status === "DONE" || status === "MET";
  const isBlocked = status === "BLOCKED";

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${isDone ? "opacity-60" : ""}`}
    >
      {/* Status indicator */}
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs ${
          isDone
            ? "border-green-400 bg-green-400 text-white"
            : isBlocked
              ? "border-red-300 bg-red-50 text-red-400"
              : isPrerequisite
                ? "border-orange-300 bg-orange-50"
                : "border-gray-300 bg-white"
        }`}
      >
        {isDone ? "✓" : isBlocked ? "!" : ""}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${isDone ? "line-through text-gray-400" : "text-gray-700"}`}
          >
            {name}
          </span>
          {isPrerequisite && (
            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-600">
              Required
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-gray-400 truncate">{description}</p>
        )}
      </div>

      {/* Owner badge */}
      <span
        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
          owner.toLowerCase() === "customer"
            ? "bg-blue-50 text-blue-600"
            : "bg-purple-50 text-purple-600"
        }`}
      >
        {owner}
      </span>
    </div>
  );
}
