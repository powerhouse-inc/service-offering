import type {
  ServiceOfferingState,
  ServiceSubscriptionTier,
} from "../../../document-models/service-offering/v1/gen/schema/types.js";
import type {
  InitializeSubscriptionInput,
  BillingCycle as SIBillingCycle,
} from "../../../document-models/subscription-instance/v1/gen/schema/types.js";

export interface MapOfferingOptions {
  offering: ServiceOfferingState;
  tierId: string;
  selectedBillingCycle: SIBillingCycle;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
}

/**
 * Maps a Service Offering state to an InitializeSubscriptionInput.
 * This creates the basic subscription shell — services and groups
 * must be added via separate actions after initialization.
 */
export function mapOfferingToSubscription(
  options: MapOfferingOptions,
): InitializeSubscriptionInput {
  const {
    offering,
    tierId,
    selectedBillingCycle,
    customerId,
    customerName,
    customerEmail,
    createdAt,
  } = options;

  const tier = offering.tiers.find((t) => t.id === tierId);
  if (!tier) {
    throw new Error(`Tier ${tierId} not found in offering`);
  }

  const currency = tier.pricing?.currency ?? "USD";
  const pricingMode = tier.pricingMode;
  const tierPrice = tier.pricing?.amount ?? undefined;

  return {
    customerId: customerId ?? undefined,
    customerName: customerName ?? undefined,
    customerEmail: customerEmail ?? undefined,
    serviceOfferingId: offering.id,
    tierName: tier.name,
    tierPricingOptionId: tier.id,
    tierPrice,
    tierCurrency: currency,
    tierPricingMode: pricingMode,
    selectedBillingCycle,
    globalCurrency: currency,
    createdAt,
  };
}
