import type { BillingCycle } from "@powerhousedao/service-offering/document-models/service-offering";

// Billing cycle months for monthly-equivalent calculation
export const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  ANNUAL: 12,
  ONE_TIME: 1,
};

// Human-readable billing cycle labels
export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  SEMI_ANNUAL: "semi-annually",
  ANNUAL: "annually",
  ONE_TIME: "one-time",
};

// Short labels for dropdowns
export const BILLING_CYCLE_SHORT_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Month",
  QUARTERLY: "Quarter",
  SEMI_ANNUAL: "6 Months",
  ANNUAL: "Year",
  ONE_TIME: "One Time",
};

// Calculate monthly equivalent price
export function getMonthlyEquivalent(
  amount: number,
  billingCycle: BillingCycle,
): number {
  if (billingCycle === "ONE_TIME") return amount;
  return amount / BILLING_CYCLE_MONTHS[billingCycle];
}

// Format price with currency symbol
export function formatPrice(amount: number, currency: string = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format monthly equivalent display: "$X/mo billed [cycle] at $Y"
// For monthly: just "$X/mo"
export function formatMonthlyEquivalentDisplay(
  amount: number,
  billingCycle: BillingCycle,
  currency: string = "USD",
): string {
  if (billingCycle === "MONTHLY") {
    return `${formatPrice(amount, currency)}/mo`;
  }

  if (billingCycle === "ONE_TIME") {
    return formatPrice(amount, currency);
  }

  const monthlyEquivalent = getMonthlyEquivalent(amount, billingCycle);
  const cycleLabel = BILLING_CYCLE_LABELS[billingCycle];

  return `${formatPrice(monthlyEquivalent, currency)}/mo billed ${cycleLabel} at ${formatPrice(amount, currency)}`;
}

// Get available billing cycles (excluding ONE_TIME for most cases)
export const RECURRING_BILLING_CYCLES: BillingCycle[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
];

export const ALL_BILLING_CYCLES: BillingCycle[] = [
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUAL",
  "ANNUAL",
  "ONE_TIME",
];
