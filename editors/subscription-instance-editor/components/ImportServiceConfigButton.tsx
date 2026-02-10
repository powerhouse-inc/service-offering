import { useCallback } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import { updateTierInfo } from "../../../document-models/subscription-instance/gen/subscription/creators.js";
import { addService } from "../../../document-models/subscription-instance/gen/service/creators.js";
import { addServiceMetric } from "../../../document-models/subscription-instance/gen/metrics/creators.js";

// Mock service offering configuration (simulates what would come from a Service Offering document)
const MOCK_SERVICE_OFFERING = {
  title: "Cloud Platform Services",
  services: [
    {
      id: "svc-compute",
      title: "Cloud Compute",
      description: "Scalable virtual machines with automatic load balancing",
    },
    {
      id: "svc-storage",
      title: "Object Storage",
      description: "Unlimited cloud storage with CDN integration",
    },
    {
      id: "svc-database",
      title: "Managed Database",
      description: "PostgreSQL with automatic backups and failover",
    },
    {
      id: "svc-cdn",
      title: "Global CDN",
      description: "Content delivery network with edge caching",
    },
    {
      id: "svc-security",
      title: "Security Suite",
      description: "DDoS protection and Web Application Firewall",
    },
  ],
  tier: {
    id: "tier-professional",
    name: "Professional",
    // Services included in this tier
    includedServices: [
      "svc-compute",
      "svc-storage",
      "svc-database",
      "svc-cdn",
      "svc-security",
    ],
    // Usage limits/metrics for this tier
    usageLimits: [
      {
        serviceId: "svc-compute",
        metric: "vCPU Hours",
        unitName: "hours",
        limit: 2000,
        resetPeriod: "MONTHLY" as const,
      },
      {
        serviceId: "svc-compute",
        metric: "RAM GB-Hours",
        unitName: "GB-hours",
        limit: 5000,
        resetPeriod: "MONTHLY" as const,
      },
      {
        serviceId: "svc-compute",
        metric: "Active Instances",
        unitName: "instances",
        limit: 20,
        resetPeriod: null,
      },
      {
        serviceId: "svc-storage",
        metric: "Storage Used",
        unitName: "GB",
        limit: 1000,
        resetPeriod: null,
      },
      {
        serviceId: "svc-storage",
        metric: "Bandwidth Out",
        unitName: "GB",
        limit: 500,
        resetPeriod: "MONTHLY" as const,
      },
      {
        serviceId: "svc-storage",
        metric: "API Requests",
        unitName: "requests",
        limit: 500000,
        resetPeriod: "MONTHLY" as const,
      },
      {
        serviceId: "svc-database",
        metric: "Database Size",
        unitName: "GB",
        limit: 100,
        resetPeriod: null,
      },
      {
        serviceId: "svc-database",
        metric: "Connections",
        unitName: "connections",
        limit: 100,
        resetPeriod: null,
      },
      {
        serviceId: "svc-cdn",
        metric: "Edge Requests",
        unitName: "M requests",
        limit: 50,
        resetPeriod: "MONTHLY" as const,
      },
      {
        serviceId: "svc-security",
        metric: "WAF Rules",
        unitName: "rules",
        limit: 100,
        resetPeriod: null,
      },
    ],
  },
};

interface ImportServiceConfigButtonProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
}

export function ImportServiceConfigButton({
  document,
  dispatch,
}: ImportServiceConfigButtonProps) {
  const hasServices = document.state.global.services.length > 0;

  const importServiceConfig = useCallback(() => {
    const offering = MOCK_SERVICE_OFFERING;
    const tier = offering.tier;

    // Update tier info on subscription
    dispatch(
      updateTierInfo({
        tierName: tier.name,
        tierPricingOptionId: tier.id,
      }),
    );

    // Create a map of old service IDs to new service IDs
    const serviceIdMap = new Map<string, string>();

    // Import services (without billing amounts - config only)
    offering.services.forEach((service) => {
      // Only import services that are included in the tier
      if (!tier.includedServices.includes(service.id)) return;

      const newServiceId = generateId();
      serviceIdMap.set(service.id, newServiceId);

      dispatch(
        addService({
          serviceId: newServiceId,
          name: service.title,
          description: service.description,
          // No amounts - these will be set when subscription is active
        }),
      );
    });

    // Import usage limits as metrics (with 0 current usage - config only)
    tier.usageLimits.forEach((limit) => {
      const newServiceId = serviceIdMap.get(limit.serviceId);
      if (!newServiceId) return;

      dispatch(
        addServiceMetric({
          serviceId: newServiceId,
          metricId: generateId(),
          name: limit.metric,
          unitName: limit.unitName,
          currentUsage: 0, // No usage yet - just configuration
          limit: limit.limit,
          usageResetPeriod: limit.resetPeriod ?? undefined,
          // No cost amounts - these will be set when subscription is active
        }),
      );
    });
  }, [dispatch]);

  return (
    <button
      type="button"
      className="si-btn si-btn--secondary"
      onClick={importServiceConfig}
      title={
        hasServices
          ? "Import additional service configuration"
          : "Import service configuration (without billing)"
      }
    >
      <svg
        className="si-btn__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
      {hasServices ? "Import More Config" : "Import Service Config"}
    </button>
  );
}
