import { generateId } from "document-model/core";
import type {
  BillingCycle,
  SetFinalConfigurationInput,
  ResolvedDiscountInput,
  PriceBreakdown,
  OptionGroupBreakdown,
  AddOnBreakdown,
} from "@powerhousedao/service-offering/document-models/service-offering";

export interface ResolveConfigParams {
  breakdown: PriceBreakdown;
  activeBillingCycle: BillingCycle;
}

function toResolvedDiscountInput(
  d: {
    discountType: string;
    discountValue: number;
    originalAmount: number;
    discountedAmount: number;
  } | null,
): ResolvedDiscountInput | null {
  if (!d || d.discountValue <= 0) return null;
  return {
    discountType: d.discountType as ResolvedDiscountInput["discountType"],
    discountValue: d.discountValue,
    originalAmount: d.originalAmount,
    discountedAmount: d.discountedAmount,
  };
}

function mapOptionGroup(b: OptionGroupBreakdown) {
  return {
    id: generateId(),
    optionGroupId: b.optionGroupId,
    effectiveBillingCycle: b.effectiveBillingCycle,
    billingCycleOverridden: b.billingCycleOverridden,
    discountStripped: b.discountStripped,
    recurringAmount: b.recurringAmount,
    currency: b.currency,
    discount: toResolvedDiscountInput(b.discount),
    setupCost: b.setupCost,
    setupCostCurrency: b.setupCostCurrency,
    setupCostDiscount: toResolvedDiscountInput(b.setupCostDiscount),
  };
}

function mapAddOn(b: AddOnBreakdown) {
  return {
    id: generateId(),
    optionGroupId: b.optionGroupId,
    selectedBillingCycle: b.selectedBillingCycle,
    recurringAmount: b.recurringAmount,
    currency: b.currency,
    discount: toResolvedDiscountInput(b.discount),
    setupCost: b.setupCost,
    setupCostCurrency: b.setupCostCurrency,
    setupCostDiscount: toResolvedDiscountInput(b.setupCostDiscount),
  };
}

export function resolveConfiguration(
  params: ResolveConfigParams,
): SetFinalConfigurationInput {
  const { breakdown, activeBillingCycle } = params;

  return {
    selectedTierId: breakdown.tierId,
    selectedBillingCycle: activeBillingCycle,
    tierBasePrice: breakdown.tierCycleTotal,
    tierCurrency: breakdown.tierCurrency,
    optionGroupConfigs: [
      ...breakdown.optionGroupBreakdowns.map(mapOptionGroup),
      ...breakdown.setupGroupBreakdowns.map(mapOptionGroup),
    ],
    addOnConfigs: breakdown.addOnBreakdowns.map(mapAddOn),
    lastModified: new Date().toISOString(),
  };
}
