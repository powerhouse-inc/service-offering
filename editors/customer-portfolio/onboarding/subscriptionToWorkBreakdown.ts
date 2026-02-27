/**
 * Maps a SubscriptionInstance state to WorkBreakdown document operations.
 *
 * Naming convention for WBD doc: `onboarding-{subscriptionDocId}`
 * This allows the portfolio app to locate it without storing a reference.
 */

import type { SubscriptionInstanceState } from "@powerhousedao/service-offering/document-models/subscription-instance";

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  substeps: OnboardingSubstep[];
}

export interface OnboardingSubstep {
  id: string;
  name: string;
  description: string;
  owner: "operator" | "customer";
  isPrerequisite: boolean;
}

export interface OnboardingPlan {
  title: string;
  description: string;
  steps: OnboardingStep[];
}

/**
 * Derives a structured onboarding plan from a subscription instance.
 * Each service group becomes a step, each service becomes a substep.
 * Setup costs → customer prerequisites; recurring services → operator tasks.
 */
export function subscriptionToOnboardingPlan(
  subscription: SubscriptionInstanceState,
): OnboardingPlan {
  const customerName = subscription.customerName ?? "Customer";
  const tierName = subscription.tierName ?? "Subscription";

  const steps: OnboardingStep[] = [];

  // Always add a kickoff step first
  steps.push({
    id: "step-kickoff",
    name: "Kickoff & Documentation",
    description: "Initial onboarding setup and document collection.",
    substeps: [
      {
        id: "sub-welcome",
        name: "Welcome & introduction call",
        description: `Schedule kickoff call with ${customerName} to walk through the onboarding process.`,
        owner: "operator",
        isPrerequisite: false,
      },
      {
        id: "sub-docs",
        name: "Collect required documents",
        description:
          "Customer provides: ID documents, legal entity details, signing authority confirmation.",
        owner: "customer",
        isPrerequisite: true,
      },
      {
        id: "sub-access",
        name: "Set up platform access",
        description: `Grant ${customerName} access to the Powerhouse platform and relevant drives.`,
        owner: "operator",
        isPrerequisite: false,
      },
    ],
  });

  // Map service groups → steps
  for (const group of subscription.serviceGroups) {
    const substeps: OnboardingSubstep[] = [];

    // Setup cost → customer must confirm/pay
    if (group.setupCost) {
      substeps.push({
        id: `sub-${group.id}-setup`,
        name: `Confirm setup payment`,
        description: `${customerName} confirms one-time setup payment of ${group.setupCost.amount} ${group.setupCost.currency}.`,
        owner: "customer",
        isPrerequisite: true,
      });
    }

    // Each service in the group → operator task
    for (const service of group.services) {
      substeps.push({
        id: `sub-${service.id}`,
        name: service.name ?? "Service setup",
        description:
          service.description ??
          `Configure and activate ${service.name} for ${customerName}.`,
        owner: "operator",
        isPrerequisite: false,
      });
    }

    if (substeps.length > 0) {
      steps.push({
        id: `step-${group.id}`,
        name: group.name,
        description: `Setup and activation of ${group.name} services.`,
        substeps,
      });
    }
  }

  // Flat services (not in groups)
  const flatServices = subscription.services;
  if (flatServices.length > 0) {
    steps.push({
      id: "step-additional",
      name: "Additional Services",
      description: "Additional services included in your subscription.",
      substeps: flatServices.map((service) => ({
        id: `sub-${service.id}`,
        name: service.name ?? "Service setup",
        description:
          service.description ??
          `Configure ${service.name} for ${customerName}.`,
        owner: "operator" as const,
        isPrerequisite: false,
      })),
    });
  }

  // Always add a go-live step
  steps.push({
    id: "step-golive",
    name: "Go-Live & Handover",
    description: "Final verification and handover to active operations.",
    substeps: [
      {
        id: "sub-verify",
        name: "Verify all services active",
        description: "Operator confirms all services are configured and live.",
        owner: "operator",
        isPrerequisite: false,
      },
      {
        id: "sub-handover",
        name: "Customer acceptance sign-off",
        description: `${customerName} confirms all services are working as expected.`,
        owner: "customer",
        isPrerequisite: false,
      },
    ],
  });

  return {
    title: `Onboarding — ${customerName} (${tierName})`,
    description: `Onboarding plan for ${customerName} on the ${tierName} tier. Generated from subscription configuration.`,
    steps,
  };
}

/** Naming convention: WBD doc name for a given subscription doc ID */
export function onboardingDocName(subscriptionDocId: string): string {
  return `onboarding-${subscriptionDocId}`;
}
