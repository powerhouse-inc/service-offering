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

    // 1. Initialize subscription with full service group structure
    //    Pricing lives at the SERVICE GROUP level, not per-service
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
          tierPrice: 726,
          tierCurrency: "USD",
          tierPricingMode: "CALCULATED",
          selectedBillingCycle: "MONTHLY",
          globalCurrency: "USD",
          autoRenew: true,
          serviceGroups: [
            // === Core Infrastructure (recurring, group-level price: $726/mo) ===
            {
              id: generateId(),
              name: "Core Infrastructure",
              optional: false,
              costType: "RECURRING",
              recurringAmount: 726,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              setupAmount: 500,
              setupCurrency: "USD",
              services: [
                {
                  id: generateId(),
                  name: "Cloud Compute",
                  description:
                    "Scalable virtual machines with automatic load balancing",
                  metrics: [
                    {
                      id: generateId(),
                      name: "vCPU Hours",
                      unitName: "hours",
                      currentUsage: 1250,
                      freeLimit: 1000,
                      paidLimit: 2000,
                      unitCostAmount: 0.05,
                      unitCostCurrency: "USD",
                      unitCostBillingCycle: "MONTHLY",
                      usageResetPeriod: "MONTHLY",
                    },
                    {
                      id: generateId(),
                      name: "RAM GB-Hours",
                      unitName: "GB-hours",
                      currentUsage: 3200,
                      freeLimit: 3000,
                      paidLimit: 5000,
                      usageResetPeriod: "MONTHLY",
                    },
                    {
                      id: generateId(),
                      name: "Active Instances",
                      unitName: "instances",
                      currentUsage: 8,
                      freeLimit: 10,
                      paidLimit: 20,
                    },
                  ],
                },
                {
                  id: generateId(),
                  name: "Object Storage",
                  description: "Unlimited cloud storage with CDN integration",
                  metrics: [
                    {
                      id: generateId(),
                      name: "Storage Used",
                      unitName: "GB",
                      currentUsage: 450,
                      freeLimit: 500,
                      paidLimit: 2000,
                      unitCostAmount: 0.02,
                      unitCostCurrency: "USD",
                      unitCostBillingCycle: "MONTHLY",
                    },
                    {
                      id: generateId(),
                      name: "Bandwidth Out",
                      unitName: "GB",
                      currentUsage: 280,
                      freeLimit: 500,
                      usageResetPeriod: "MONTHLY",
                    },
                    {
                      id: generateId(),
                      name: "API Requests",
                      unitName: "requests",
                      currentUsage: 125000,
                      freeLimit: 100000,
                      paidLimit: 500000,
                      unitCostAmount: 0.001,
                      unitCostCurrency: "USD",
                      unitCostBillingCycle: "MONTHLY",
                      usageResetPeriod: "MONTHLY",
                    },
                  ],
                },
                {
                  id: generateId(),
                  name: "Managed Database",
                  description: "PostgreSQL with automatic backups and failover",
                  metrics: [
                    {
                      id: generateId(),
                      name: "Database Size",
                      unitName: "GB",
                      currentUsage: 85,
                      freeLimit: 50,
                      paidLimit: 100,
                      unitCostAmount: 0.5,
                      unitCostCurrency: "USD",
                      unitCostBillingCycle: "MONTHLY",
                    },
                    {
                      id: generateId(),
                      name: "Connections",
                      unitName: "connections",
                      currentUsage: 45,
                      freeLimit: 50,
                      paidLimit: 100,
                    },
                  ],
                },
                {
                  id: generateId(),
                  name: "Global CDN",
                  description: "Content delivery network with edge caching",
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
                      freeLimit: 10,
                      paidLimit: 50,
                      unitCostAmount: 5,
                      unitCostCurrency: "USD",
                      unitCostBillingCycle: "MONTHLY",
                      usageResetPeriod: "MONTHLY",
                    },
                  ],
                },
              ],
            },
            // === Security Suite (optional add-on, group-level price: $178/mo) ===
            {
              id: generateId(),
              name: "Security Suite",
              optional: true,
              costType: "RECURRING",
              recurringAmount: 178,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              setupAmount: 750,
              setupCurrency: "USD",
              services: [
                {
                  id: generateId(),
                  name: "DDoS Protection",
                  description:
                    "Advanced DDoS mitigation with real-time monitoring",
                },
                {
                  id: generateId(),
                  name: "WAF",
                  description: "Web Application Firewall with custom rules",
                },
                {
                  id: generateId(),
                  name: "Security Audit & Onboarding",
                  description: "Initial security assessment and configuration",
                },
              ],
            },
            // === Premium Support (optional add-on, group-level price: $498/mo) ===
            {
              id: generateId(),
              name: "Premium Support",
              optional: true,
              costType: "RECURRING",
              recurringAmount: 498,
              recurringCurrency: "USD",
              recurringBillingCycle: "MONTHLY",
              setupAmount: 1200,
              setupCurrency: "USD",
              services: [
                {
                  id: generateId(),
                  name: "24/7 Priority Support",
                  description:
                    "Direct access to senior engineers with 15-min response time",
                },
                {
                  id: generateId(),
                  name: "Dedicated Account Manager",
                  description:
                    "Personal account manager for strategic guidance",
                },
                {
                  id: generateId(),
                  name: "Team Onboarding Workshop",
                  description:
                    "Customized training sessions for your engineering team",
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
    // Core: $726/mo + Security: $178/mo + Support: $498/mo = $1,402/mo
    // Plus metric overages: vCPU 250 × $0.05 = $12.50, API 25k × $0.001 = $25, DB 35 × $0.50 = $17.50, Edge 2M × $5 = $10
    dispatch(
      updateBillingProjection({
        nextBillingDate: oneMonthFromNow,
        projectedBillAmount: 1467,
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
