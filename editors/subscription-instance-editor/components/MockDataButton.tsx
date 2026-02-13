import { useCallback } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
} from "@powerhousedao/service-offering/document-models/subscription-instance";
import {
  initializeSubscription,
  activateSubscription,
  setRenewalDate,
  updateBillingProjection,
} from "../../../document-models/subscription-instance/gen/subscription/creators.js";
import { setCustomerType } from "../../../document-models/subscription-instance/gen/customer/creators.js";

interface MockDataButtonProps {
  document: SubscriptionInstanceDocument;
  dispatch: DocumentDispatch<SubscriptionInstanceAction>;
}

export function MockDataButton({ document, dispatch }: MockDataButtonProps) {
  const hasData =
    document.state.global.services.length > 0 ||
    document.state.global.serviceGroups.length > 0;

  const populateMockData = useCallback(() => {
    const oneMonthAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const oneMonthFromNow = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const twoMonthsFromNow = new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Pre-generate all IDs
    const service1Id = generateId();
    const service2Id = generateId();
    const service3Id = generateId();
    const service4Id = generateId();
    const addonGroup1Id = generateId();
    const addonGroup2Id = generateId();

    // 1. Initialize subscription with all services and groups in a single dispatch
    if (!document.state.global.customerId) {
      dispatch(
        initializeSubscription({
          createdAt: oneMonthAgo,
          customerId: `phid:customer:${generateId()}`,
          customerName: "Acme Corporation",
          customerEmail: "billing@acme.example.com",
          resourceId: `phid:resource:${generateId()}`,
          resourceLabel: "Enterprise Cloud Platform",
          tierName: "Professional",
          tierPricingOptionId: generateId(),
          tierPrice: 200,
          tierCurrency: "USD",
          autoRenew: true,
          services: [
            {
              id: service1Id,
              name: "Cloud Compute",
              description:
                "Scalable virtual machines with automatic load balancing",
              customValue: "INCLUDED",
              recurringAmount: 299,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              setupAmount: 500,
              setupCurrency: "USD",
              facetSelections: [
                {
                  id: generateId(),
                  facetName: "Region",
                  selectedOption: "US-East",
                },
              ],
              metrics: [
                {
                  id: generateId(),
                  name: "vCPU Hours",
                  unitName: "hours",
                  currentUsage: 1250,
                  limit: 2000,
                  usageResetPeriod: "MONTHLY",
                  unitCostAmount: 0.05,
                  unitCostCurrency: "USD",
                  unitCostBillingCycle: "MONTHLY",
                },
                {
                  id: generateId(),
                  name: "RAM GB-Hours",
                  unitName: "GB-hours",
                  currentUsage: 3200,
                  limit: 5000,
                  usageResetPeriod: "MONTHLY",
                },
                {
                  id: generateId(),
                  name: "Active Instances",
                  unitName: "instances",
                  currentUsage: 8,
                  limit: 20,
                },
              ],
            },
            {
              id: service2Id,
              name: "Object Storage",
              description: "Unlimited cloud storage with CDN integration",
              customValue: "INCLUDED",
              recurringAmount: 149,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              metrics: [
                {
                  id: generateId(),
                  name: "Storage Used",
                  unitName: "GB",
                  currentUsage: 450,
                  limit: 1000,
                  unitCostAmount: 0.02,
                  unitCostCurrency: "USD",
                  unitCostBillingCycle: "MONTHLY",
                },
                {
                  id: generateId(),
                  name: "Bandwidth Out",
                  unitName: "GB",
                  currentUsage: 280,
                  limit: 500,
                  usageResetPeriod: "MONTHLY",
                },
                {
                  id: generateId(),
                  name: "API Requests",
                  unitName: "requests",
                  currentUsage: 125000,
                  limit: 500000,
                  usageResetPeriod: "MONTHLY",
                },
              ],
            },
            {
              id: service3Id,
              name: "Managed Database",
              description: "PostgreSQL with automatic backups and failover",
              customValue: "BASIC",
              recurringAmount: 199,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              setupAmount: 250,
              setupCurrency: "USD",
              metrics: [
                {
                  id: generateId(),
                  name: "Database Size",
                  unitName: "GB",
                  currentUsage: 85,
                  limit: 100,
                },
                {
                  id: generateId(),
                  name: "Connections",
                  unitName: "connections",
                  currentUsage: 45,
                  limit: 100,
                },
              ],
            },
            {
              id: service4Id,
              name: "Global CDN",
              description: "Content delivery network with edge caching",
              customValue: "INCLUDED",
              recurringAmount: 79,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              metrics: [
                {
                  id: generateId(),
                  name: "Cache Hit Rate",
                  unitName: "%",
                  currentUsage: 94,
                  limit: 100,
                },
                {
                  id: generateId(),
                  name: "Edge Requests",
                  unitName: "M requests",
                  currentUsage: 12,
                  limit: 50,
                  usageResetPeriod: "MONTHLY",
                },
              ],
            },
          ],
          serviceGroups: [
            {
              id: addonGroup1Id,
              name: "Security Suite",
              optional: true,
              recurringAmount: 50,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              services: [
                {
                  id: generateId(),
                  name: "DDoS Protection",
                  description:
                    "Advanced DDoS mitigation with real-time monitoring",
                  customValue: "INCLUDED",
                  recurringAmount: 99,
                  recurringCurrency: "USD",
                  recurringBillingCycle: "MONTHLY",
                },
                {
                  id: generateId(),
                  name: "WAF",
                  description: "Web Application Firewall with custom rules",
                  customValue: "INCLUDED",
                  recurringAmount: 79,
                  recurringCurrency: "USD",
                  recurringBillingCycle: "MONTHLY",
                },
              ],
            },
            {
              id: addonGroup2Id,
              name: "Premium Support",
              optional: true,
              recurringAmount: 200,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              services: [
                {
                  id: generateId(),
                  name: "24/7 Priority Support",
                  description:
                    "Direct access to senior engineers with 15-min response time",
                  customValue: "INCLUDED",
                  recurringAmount: 299,
                  recurringCurrency: "USD",
                  recurringBillingCycle: "MONTHLY",
                },
                {
                  id: generateId(),
                  name: "Dedicated Account Manager",
                  description:
                    "Personal account manager for strategic guidance",
                  customValue: "INCLUDED",
                  recurringAmount: 199,
                  recurringCurrency: "USD",
                  recurringBillingCycle: "MONTHLY",
                },
              ],
            },
          ],
        }),
      );
    }

    // 2. Activate subscription
    dispatch(
      activateSubscription({
        activatedSince: oneMonthAgo,
      }),
    );

    // 3. Set renewal date
    dispatch(setRenewalDate({ renewalDate: twoMonthsFromNow }));

    // 4. Set customer type
    dispatch(
      setCustomerType({
        customerType: "TEAM",
        teamMemberCount: 12,
      }),
    );

    // 5. Billing projection
    // Core: 299 + 149 + 199 + 79 = 726
    // Groups: 50 + 200 = 250
    // Group services: 99 + 79 + 299 + 199 = 676
    // Total: 726 + 250 + 676 = 1652
    dispatch(
      updateBillingProjection({
        nextBillingDate: oneMonthFromNow,
        projectedBillAmount: 1652,
        projectedBillCurrency: "USD",
      }),
    );
  }, [document.state.global.customerId, dispatch]);

  return (
    <button
      type="button"
      className="si-btn si-btn--secondary"
      onClick={populateMockData}
      title={hasData ? "Add more mock data" : "Populate with example data"}
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
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
      {hasData ? "Add More Data" : "Populate Mock Data"}
    </button>
  );
}
