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
} from "../../../document-models/subscription-instance/v1/gen/subscription/creators.js";
import { setCustomerType } from "../../../document-models/subscription-instance/v1/gen/customer/creators.js";

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

    if (!document.state.global.customerId) {
      dispatch(
        initializeSubscription({
          createdAt: oneMonthAgo,
          customerId: `phid:customer:${generateId()}`,
          customerName: "Acme Corporation",
          customerEmail: "billing@acme.example.com",
          tierName: "Professional",
          tierPricingOptionId: generateId(),
          tierPrice: 726,
          tierCurrency: "USD",
          tierPricingMode: "FIXED",
          selectedBillingCycle: "MONTHLY",
          globalCurrency: "USD",
        }),
      );
    }

    dispatch(
      activateSubscription({
        activatedAt: oneMonthAgo,
      }),
    );

    dispatch(setRenewalDate({ renewalDate: twoMonthsFromNow }));

    dispatch(
      setCustomerType({
        customerType: "TEAM",
      }),
    );

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
