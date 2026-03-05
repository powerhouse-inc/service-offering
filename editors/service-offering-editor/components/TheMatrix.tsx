import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { generateId } from "document-model/core";
import {
  type DocumentDispatch,
  usePHToast,
} from "@powerhousedao/reactor-browser";
import {
  type ServiceOfferingDocument,
  type ServiceOfferingAction,
  type Service,
  type ServiceSubscriptionTier,
  type ServiceLevel,
  type ServiceLevelBinding,
  type OptionGroup,
  type ServiceUsageLimit,
  type BillingCycle,
  type UsageResetCycle,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  BILLING_CYCLE_SHORT_LABELS,
  BILLING_CYCLE_LABELS,
  BILLING_CYCLE_MONTHS,
  RECURRING_BILLING_CYCLES,
  formatPrice,
  detectMajorityCycle,
} from "./pricing-utils.js";
import {
  addServiceLevel,
  updateServiceLevel,
  addUsageLimit,
  updateUsageLimit,
  removeUsageLimit,
  addService,
  updateService,
} from "../../../document-models/service-offering/gen/creators.js";
import {
  getUserSelectionPriceBreakdown,
  type PriceBreakdown,
  type OptionGroupBreakdown,
  type AddOnBreakdown,
} from "../../../document-models/service-offering/index.js";
import { InfoIcon } from "./InfoIcon.js";
import { ConfirmDialog } from "./ConfirmDialog.js";
import "./TheMatrix.css";

interface TheMatrixProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

const SERVICE_LEVELS: {
  value: ServiceLevel;
  label: string;
  shortLabel: string;
  color: string;
}[] = [
  {
    value: "INCLUDED",
    label: "Included",
    shortLabel: "✓",
    color: "var(--so-emerald-600)",
  },
  {
    value: "OPTIONAL",
    label: "Optional",
    shortLabel: "Optional",
    color: "var(--so-sky-600)",
  },
  {
    value: "NOT_INCLUDED",
    label: "Not Included",
    shortLabel: "—",
    color: "var(--so-slate-400)",
  },
  {
    value: "NOT_APPLICABLE",
    label: "Not Applicable",
    shortLabel: "/",
    color: "var(--so-slate-300)",
  },
  {
    value: "CUSTOM",
    label: "Custom",
    shortLabel: "Custom",
    color: "var(--so-amber-600)",
  },
  {
    value: "VARIABLE",
    label: "Variable",
    shortLabel: "#",
    color: "var(--so-violet-600)",
  },
];

const UNGROUPED_ID = "__ungrouped__";

export function TheMatrix({ document, dispatch }: TheMatrixProps) {
  const { state } = document;
  const services = state.global.services ?? [];
  const tiers = state.global.tiers ?? [];
  const optionGroups = state.global.optionGroups ?? [];
  const toast = usePHToast();

  // Get selected facets from the offering document's facetTargets
  const offeringFacetTargets = state.global.facetTargets ?? [];

  // Build facet categories from the SERVICE OFFERING's selected facet targets
  // This ensures only the options selected in the offering's facet targeting appear in the Matrix
  const facetCategories = useMemo(() => {
    const categories: Record<
      string,
      { label: string; options: { id: string; label: string }[] }
    > = {};

    offeringFacetTargets.forEach((facet) => {
      categories[facet.categoryKey] = {
        label: facet.categoryLabel,
        options: facet.selectedOptions.map((option) => ({
          id: option.toLowerCase().replace(/\s+/g, "-"),
          label: option,
        })),
      };
    });

    return categories;
  }, [offeringFacetTargets]);

  const [enabledOptionalGroups, setEnabledOptionalGroups] = useState<
    Set<string>
  >(() => {
    return new Set(
      optionGroups.filter((g) => g.defaultSelected).map((g) => g.id),
    );
  });

  const [selectedCell, setSelectedCell] = useState<{
    serviceId: string;
    tierId: string;
  } | null>(null);

  const [addServiceModal, setAddServiceModal] = useState<{
    groupId: string;
    isSetupFormation: boolean;
  } | null>(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceSelectedTiers, setNewServiceSelectedTiers] = useState<
    Set<string>
  >(new Set());

  // Edit service modal state
  const [editServiceModal, setEditServiceModal] = useState<Service | null>(
    null,
  );
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceDescription, setEditServiceDescription] = useState("");
  const [editServiceSelectedTiers, setEditServiceSelectedTiers] = useState<
    Set<string>
  >(new Set());

  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);

  // Global billing cycle view - lets users see prices/discounts for different cycles
  const [activeBillingCycle, setActiveBillingCycle] =
    useState<BillingCycle>("MONTHLY");

  // Per-addon billing cycle state (add-ons have independent cycle selection)
  const [addonBillingCycles, setAddonBillingCycles] = useState<
    Record<string, BillingCycle>
  >({});

  // Per-group billing cycle state (non-addon service groups can select their own cycle)
  const [groupBillingCycles, setGroupBillingCycles] = useState<
    Record<string, BillingCycle>
  >({});

  // Detect CUSTOM billing mode: any non-addon group has a cycle different from global
  const isCustomBillingMode = useMemo(() => {
    const overrides = Object.values(groupBillingCycles);
    if (overrides.length === 0) return false;
    return overrides.some((cycle) => cycle !== activeBillingCycle);
  }, [groupBillingCycles, activeBillingCycle]);

  // Billing cycle majority detection (state only — memo goes after regularGroups is defined)
  const [majorityDismissed, setMajorityDismissed] = useState(false);

  // Handle group cycle override with majority-based auto-remerge
  const handleGroupCycleChange = useCallback(
    (groupId: string, newCycle: BillingCycle) => {
      setGroupBillingCycles((prev) => {
        const updated = { ...prev, [groupId]: newCycle };
        // Count total regular (non-setup, non-addon) groups
        const totalRegular = optionGroups.filter(
          (g) => g.costType !== "SETUP" && !g.isAddOn,
        ).length;
        if (totalRegular === 0) {
          return updated;
        }
        // Compute effective cycle for each regular group
        const cycleCounts = new Map<BillingCycle, number>();
        for (const g of optionGroups) {
          if (g.costType === "SETUP" || g.isAddOn) continue;
          const effective = updated[g.id] || activeBillingCycle;
          cycleCounts.set(effective, (cycleCounts.get(effective) || 0) + 1);
        }
        // Check for majority (>50%) on a NEW cycle different from the global
        for (const [cycle, count] of cycleCounts) {
          if (count > totalRegular / 2 && cycle !== activeBillingCycle) {
            // New majority found — adopt as global and clear overrides
            setTimeout(() => {
              setActiveBillingCycle(cycle);
              setGroupBillingCycles({});
            }, 0);
            return prev;
          }
        }
        return updated;
      });
    },
    [activeBillingCycle, optionGroups],
  );

  // When switching to a global cycle, reset all group overrides (exit Custom mode)
  const handleGlobalCycleChange = useCallback((cycle: BillingCycle) => {
    setActiveBillingCycle(cycle);
    setGroupBillingCycles({});
  }, []);

  // Copy current UserSelectionInput to clipboard for mutation testing
  const handleCopyUserSelection = useCallback(() => {
    const selectedTier = tiers[selectedTierIdx];
    if (!selectedTier) return;

    const groupOverrides = Object.entries(groupBillingCycles)
      .filter(([, cycle]) => cycle !== activeBillingCycle)
      .map(([groupId, billingCycle]) => ({ groupId, billingCycle }));

    const addonOverrides = Object.entries(addonBillingCycles)
      .filter(([groupId]) => enabledOptionalGroups.has(groupId))
      .filter(([, cycle]) => cycle !== activeBillingCycle)
      .map(([groupId, billingCycle]) => ({ groupId, billingCycle }));

    const userSelection = {
      tierId: selectedTier.id,
      billingCycle: activeBillingCycle,
      optionGroupIds: [...enabledOptionalGroups],
      ...(groupOverrides.length > 0 && {
        groupBillingCycleOverrides: groupOverrides,
      }),
      ...(addonOverrides.length > 0 && {
        addonBillingCycleOverrides: addonOverrides,
      }),
    };

    const mutationPayload = JSON.stringify(userSelection, null, 2);
    navigator.clipboard.writeText(mutationPayload).then(
      () =>
        toast?.("UserSelectionInput copied to clipboard!", { type: "success" }),
      () => toast?.("Failed to copy to clipboard", { type: "error" }),
    );
  }, [
    tiers,
    selectedTierIdx,
    activeBillingCycle,
    enabledOptionalGroups,
    groupBillingCycles,
    addonBillingCycles,
    toast,
  ]);

  // Initialize selected facets from offering's facet targets
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      offeringFacetTargets.forEach((facet) => {
        if (facet.selectedOptions.length > 0) {
          initial[facet.categoryKey] = facet.selectedOptions[0]
            .toLowerCase()
            .replace(/\s+/g, "-");
        }
      });
      return initial;
    },
  );

  // Metric editing modal state
  const [metricModal, setMetricModal] = useState<{
    serviceId: string;
    metric: string | null; // null means adding new metric
  } | null>(null);
  const [metricName, setMetricName] = useState("");
  const [metricLimits, setMetricLimits] = useState<Record<string, string>>({});
  const [metricEnabledTiers, setMetricEnabledTiers] = useState<Set<string>>(
    new Set(),
  );
  // Per-tier overage pricing for metric modal
  const [metricOveragePrices, setMetricOveragePrices] = useState<
    Record<string, string>
  >({});
  // Unit name for the metric (e.g., "entity", "user", "API call")
  const [metricUnitName, setMetricUnitName] = useState("");
  // Per-tier paid limits for the metric modal (dual limits: freeLimit + paidLimit)
  const [metricPaidLimits, setMetricPaidLimits] = useState<
    Record<string, string>
  >({});
  // Reset cycle for the metric (shared across tiers)
  const [metricResetCycle, setMetricResetCycle] =
    useState<UsageResetCycle>("MONTHLY");

  // Destructive action confirmation state
  const [pendingRemoveMetric, setPendingRemoveMetric] = useState<{
    serviceId: string;
    metric: string;
  } | null>(null);

  const getServiceGroup = (service: Service): string | null => {
    // Services now have optionGroupId directly on them
    return service.optionGroupId || null;
  };

  const groupedServices = useMemo(() => {
    const groups: Map<string, Service[]> = new Map();
    optionGroups.forEach((g) => groups.set(g.id, []));
    groups.set(UNGROUPED_ID, []);

    services.forEach((service) => {
      const groupId = getServiceGroup(service) || UNGROUPED_ID;
      const groupServices = groups.get(groupId) || [];
      groupServices.push(service);
      groups.set(groupId, groupServices);
    });

    // Sort services within each group by displayOrder
    groups.forEach((groupServices, _groupId) => {
      groupServices.sort((a, b) => {
        const orderA = a.displayOrder ?? 999;
        const orderB = b.displayOrder ?? 999;
        return orderA - orderB;
      });
    });

    return groups;
  }, [services, tiers, optionGroups]);

  const setupGroups = useMemo(() => {
    return optionGroups.filter((g) => g.costType === "SETUP");
  }, [optionGroups]);

  const regularGroups = useMemo(() => {
    return optionGroups.filter((g) => g.costType !== "SETUP" && !g.isAddOn);
  }, [optionGroups]);

  // Billing cycle majority suggestion: suggest switching when >50% of groups share a different cycle
  const majorityResult = useMemo(
    () =>
      detectMajorityCycle(
        regularGroups,
        activeBillingCycle,
        groupBillingCycles,
      ),
    [regularGroups, activeBillingCycle, groupBillingCycles],
  );

  // Global billing cycle bar: driven by the offering's availableBillingCycles
  const availableCyclesForSelectedTier = useMemo(() => {
    const globalCycles = state.global.availableBillingCycles ?? [];
    if (globalCycles.length === 0) {
      return RECURRING_BILLING_CYCLES;
    }
    return RECURRING_BILLING_CYCLES.filter((c) => globalCycles.includes(c));
  }, [state.global.availableBillingCycles]);

  const addonGroups = useMemo(() => {
    return optionGroups.filter((g) => g.isAddOn);
  }, [optionGroups]);

  // Precompute price breakdowns for all tiers using the centralized utility
  const tierBreakdowns = useMemo((): PriceBreakdown[] => {
    const addonIds = [...enabledOptionalGroups];
    return tiers.map((tier) =>
      getUserSelectionPriceBreakdown(state, {
        tierId: tier.id,
        billingCycle: activeBillingCycle,
        optionGroupIds: addonIds,
        groupBillingCycleOverrides: groupBillingCycles,
        addonBillingCycleOverrides: addonBillingCycles,
      }),
    );
  }, [
    tiers,
    optionGroups,
    activeBillingCycle,
    enabledOptionalGroups,
    groupBillingCycles,
    addonBillingCycles,
  ]);

  const ungroupedSetupServices = useMemo(() => {
    return (groupedServices.get(UNGROUPED_ID) || []).filter(
      (s) => s.isSetupFormation,
    );
  }, [groupedServices]);

  const ungroupedRegularServices = useMemo(() => {
    return (groupedServices.get(UNGROUPED_ID) || []).filter(
      (s) => !s.isSetupFormation,
    );
  }, [groupedServices]);

  const getServiceLevelForTier = (
    serviceId: string,
    tier: ServiceSubscriptionTier,
  ) => {
    return tier.serviceLevels.find((sl) => sl.serviceId === serviceId);
  };

  const getUniqueMetricsForService = (serviceId: string): string[] => {
    const metricsSet = new Set<string>();
    tiers.forEach((tier) => {
      tier.usageLimits
        .filter((ul) => ul.serviceId === serviceId)
        .forEach((ul) => metricsSet.add(ul.metric));
    });
    return Array.from(metricsSet);
  };

  // Incomplete services detection - services not assigned to any tier
  const incompleteServices = useMemo(() => {
    if (tiers.length === 0) return [];

    return services.filter((service) => {
      // Check if service is included in at least one tier
      const isIncludedAnywhere = tiers.some((tier) =>
        tier.serviceLevels.some(
          (sl) => sl.serviceId === service.id && sl.level === "INCLUDED",
        ),
      );
      return !isIncludedAnywhere;
    });
  }, [services, tiers]);

  const getUsageLimitForMetric = (
    serviceId: string,
    metric: string,
    tier: ServiceSubscriptionTier,
  ): ServiceUsageLimit | undefined => {
    return tier.usageLimits.find(
      (ul) => ul.serviceId === serviceId && ul.metric === metric,
    );
  };

  // Derive tier display pricing from precomputed breakdown
  const getTierDisplayPrice = (
    tierIdx: number,
  ): {
    amount: number;
    monthlyEquivalent: number;
    billedTotal: number;
    hasDiscount: boolean;
    savingsPercent: number;
    discountLabel: string;
  } => {
    const breakdown = tierBreakdowns[tierIdx];
    const months = BILLING_CYCLE_MONTHS[activeBillingCycle];
    const undiscountedTotal =
      breakdown.tierCycleTotal +
      breakdown.addOnBreakdowns.reduce((s, a) => s + a.cycleAmount, 0);
    const discountedTotal = breakdown.totals.grandRecurringTotal;
    const monthlyEq =
      months > 0
        ? Math.round((discountedTotal / months) * 100) / 100
        : discountedTotal;
    const savingsPercent =
      undiscountedTotal > 0
        ? Math.round(
            ((undiscountedTotal - discountedTotal) / undiscountedTotal) * 100,
          )
        : 0;
    return {
      amount: discountedTotal,
      monthlyEquivalent: monthlyEq,
      billedTotal: discountedTotal,
      hasDiscount: savingsPercent > 0,
      savingsPercent,
      discountLabel: savingsPercent > 0 ? `SAVE ${savingsPercent}%` : "",
    };
  };

  const handleSetServiceLevel = (
    serviceId: string,
    tierId: string,
    level: ServiceLevel,
    existingLevelId?: string,
    optionGroupId?: string,
  ) => {
    if (existingLevelId) {
      dispatch(
        updateServiceLevel({
          tierId,
          serviceLevelId: existingLevelId,
          level,
          lastModified: new Date().toISOString(),
        }),
      );
    } else {
      dispatch(
        addServiceLevel({
          tierId,
          serviceLevelId: generateId(),
          serviceId,
          level,
          optionGroupId,
          lastModified: new Date().toISOString(),
        }),
      );
    }
  };

  const toggleOptionalGroup = (groupId: string) => {
    setEnabledOptionalGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleAddService = () => {
    if (!addServiceModal || !newServiceName.trim()) return;

    const newServiceId = generateId();
    const now = new Date().toISOString();

    // Add the service with optionGroupId directly on the service
    dispatch(
      addService({
        id: newServiceId,
        title: newServiceName.trim(),
        description: newServiceDescription.trim() || null,
        isSetupFormation: addServiceModal.isSetupFormation,
        optionGroupId:
          addServiceModal.groupId !== UNGROUPED_ID
            ? addServiceModal.groupId
            : undefined,
        lastModified: now,
      }),
    );

    // Create ServiceLevelBindings for each selected tier
    newServiceSelectedTiers.forEach((tierId) => {
      dispatch(
        addServiceLevel({
          tierId,
          serviceLevelId: generateId(),
          serviceId: newServiceId,
          level: "INCLUDED",
          optionGroupId:
            addServiceModal.groupId !== UNGROUPED_ID
              ? addServiceModal.groupId
              : undefined,
          lastModified: now,
        }),
      );
    });

    setNewServiceName("");
    setNewServiceDescription("");
    setNewServiceSelectedTiers(new Set());
    setAddServiceModal(null);
  };

  const openAddServiceModal = (groupId: string, isSetupFormation: boolean) => {
    setAddServiceModal({ groupId, isSetupFormation });
    setNewServiceName("");
    setNewServiceDescription("");
    setNewServiceSelectedTiers(new Set());
  };

  const openEditServiceModal = (service: Service) => {
    setEditServiceModal(service);
    setEditServiceName(service.title);
    setEditServiceDescription(service.description || "");
    // Initialize selected tiers based on current service levels
    const includedTiers = new Set<string>();
    tiers.forEach((tier) => {
      const serviceLevel = tier.serviceLevels.find(
        (sl) => sl.serviceId === service.id,
      );
      if (serviceLevel && serviceLevel.level === "INCLUDED") {
        includedTiers.add(tier.id);
      }
    });
    setEditServiceSelectedTiers(includedTiers);
  };

  const handleSaveEditService = () => {
    if (!editServiceModal || !editServiceName.trim()) return;
    const now = new Date().toISOString();

    // Update service name/description
    dispatch(
      updateService({
        id: editServiceModal.id,
        title: editServiceName.trim(),
        description: editServiceDescription.trim() || null,
        lastModified: now,
      }),
    );

    // Update tier assignments
    tiers.forEach((tier) => {
      const existingLevel = tier.serviceLevels.find(
        (sl) => sl.serviceId === editServiceModal.id,
      );
      const shouldBeIncluded = editServiceSelectedTiers.has(tier.id);

      if (shouldBeIncluded && !existingLevel) {
        // Add to tier
        dispatch(
          addServiceLevel({
            tierId: tier.id,
            serviceLevelId: generateId(),
            serviceId: editServiceModal.id,
            level: "INCLUDED",
            optionGroupId: editServiceModal.optionGroupId || undefined,
            lastModified: now,
          }),
        );
      } else if (
        shouldBeIncluded &&
        existingLevel &&
        existingLevel.level !== "INCLUDED"
      ) {
        // Update to included
        dispatch(
          updateServiceLevel({
            tierId: tier.id,
            serviceLevelId: existingLevel.id,
            level: "INCLUDED",
            lastModified: now,
          }),
        );
      } else if (
        !shouldBeIncluded &&
        existingLevel &&
        existingLevel.level === "INCLUDED"
      ) {
        // Remove from tier (set to NOT_INCLUDED)
        dispatch(
          updateServiceLevel({
            tierId: tier.id,
            serviceLevelId: existingLevel.id,
            level: "NOT_INCLUDED",
            lastModified: now,
          }),
        );
      }
    });

    setEditServiceModal(null);
    setEditServiceName("");
    setEditServiceDescription("");
    setEditServiceSelectedTiers(new Set());
  };

  // Metric modal handlers
  const handleAddMetric = (serviceId: string) => {
    setMetricModal({ serviceId, metric: null });
    setMetricName("");
    // Initialize limits for all tiers to empty string
    const initialLimits: Record<string, string> = {};
    const initialPaidLimits: Record<string, string> = {};
    const initialOveragePrices: Record<string, string> = {};
    // Only enable tiers where the service is INCLUDED
    const includedTierIds = new Set<string>();
    tiers.forEach((tier) => {
      initialLimits[tier.id] = "";
      initialPaidLimits[tier.id] = "";
      initialOveragePrices[tier.id] = "";
      const binding = tier.serviceLevels.find(
        (sl) => sl.serviceId === serviceId,
      );
      if (binding && binding.level === "INCLUDED") {
        includedTierIds.add(tier.id);
      }
    });
    setMetricLimits(initialLimits);
    setMetricPaidLimits(initialPaidLimits);
    setMetricEnabledTiers(includedTierIds);
    // Reset per-tier overage pricing and unit name
    setMetricOveragePrices(initialOveragePrices);
    setMetricUnitName("");
    // Default to NONE for setup/formation services, MONTHLY otherwise
    const service = services.find((s) => s.id === serviceId);
    setMetricResetCycle(service?.isSetupFormation ? "NONE" : "MONTHLY");
  };

  const handleEditMetric = (serviceId: string, metric: string) => {
    setMetricModal({ serviceId, metric });
    setMetricName(metric);
    // Initialize limits with existing values and track which tiers have this metric
    const existingLimits: Record<string, string> = {};
    const existingPaidLimits: Record<string, string> = {};
    const existingOveragePrices: Record<string, string> = {};
    const enabledTiers = new Set<string>();
    let existingUnitName = "";
    let existingResetCycle: UsageResetCycle = "MONTHLY";
    tiers.forEach((tier) => {
      const usageLimit = tier.usageLimits.find(
        (ul) => ul.serviceId === serviceId && ul.metric === metric,
      );
      // Load value from either limit (numeric) or notes (string)
      existingLimits[tier.id] =
        usageLimit?.freeLimit?.toString() || usageLimit?.notes || "";
      existingPaidLimits[tier.id] = usageLimit?.paidLimit?.toString() || "";
      // Load per-tier overage pricing
      existingOveragePrices[tier.id] = usageLimit?.unitPrice?.toString() || "";
      if (usageLimit) {
        enabledTiers.add(tier.id);
        // Get unit name from first tier that has it
        if (!existingUnitName && usageLimit.unitName) {
          existingUnitName = usageLimit.unitName;
        }
        // Get reset cycle from first tier that has it
        if (usageLimit.resetCycle) {
          existingResetCycle = usageLimit.resetCycle;
        }
      }
    });
    setMetricLimits(existingLimits);
    setMetricPaidLimits(existingPaidLimits);
    setMetricEnabledTiers(enabledTiers);
    setMetricOveragePrices(existingOveragePrices);
    setMetricUnitName(existingUnitName);
    setMetricResetCycle(existingResetCycle);
  };

  const handleRemoveMetric = (serviceId: string, metric: string) => {
    setPendingRemoveMetric({ serviceId, metric });
  };

  const confirmRemoveMetric = () => {
    if (!pendingRemoveMetric) return;
    const { serviceId, metric } = pendingRemoveMetric;
    // Remove this metric from all tiers
    tiers.forEach((tier) => {
      const usageLimit = tier.usageLimits.find(
        (ul) => ul.serviceId === serviceId && ul.metric === metric,
      );
      if (usageLimit) {
        dispatch(
          removeUsageLimit({
            tierId: tier.id,
            limitId: usageLimit.id,
            lastModified: new Date().toISOString(),
          }),
        );
      }
    });
    setPendingRemoveMetric(null);
  };

  // Arrow button handler for service reordering
  const handleReorderService = (
    serviceId: string,
    direction: "up" | "down",
    groupServices: Service[],
  ) => {
    // Sort services by displayOrder for consistent ordering
    const sortedServices = [...groupServices].sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });

    const currentIndex = sortedServices.findIndex((s) => s.id === serviceId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= sortedServices.length) return;

    const now = new Date().toISOString();

    // Swap the two services
    const currentService = sortedServices[currentIndex];
    const swapService = sortedServices[newIndex];

    dispatch(
      updateService({
        id: currentService.id,
        displayOrder: newIndex,
        lastModified: now,
      }),
    );

    dispatch(
      updateService({
        id: swapService.id,
        displayOrder: currentIndex,
        lastModified: now,
      }),
    );
  };

  const handleSaveMetric = () => {
    if (!metricModal || !metricName.trim()) return;

    const { serviceId, metric: originalMetric } = metricModal;
    const now = new Date().toISOString();

    tiers.forEach((tier) => {
      const isEnabled = metricEnabledTiers.has(tier.id);
      const limitValue = metricLimits[tier.id];
      const existingLimit = originalMetric
        ? tier.usageLimits.find(
            (ul) => ul.serviceId === serviceId && ul.metric === originalMetric,
          )
        : null;

      // Check if value is numeric or string
      const parsedLimit = limitValue ? parseInt(limitValue, 10) : null;
      const isNumeric = parsedLimit !== null && !isNaN(parsedLimit);

      // Parse paid limit
      const paidLimitValue = metricPaidLimits[tier.id];
      const parsedPaidLimit = paidLimitValue
        ? parseInt(paidLimitValue, 10)
        : null;
      const isPaidNumeric = parsedPaidLimit !== null && !isNaN(parsedPaidLimit);

      // Get per-tier overage pricing
      const tierOveragePrice = metricOveragePrices[tier.id];
      const parsedOveragePrice = tierOveragePrice
        ? parseFloat(tierOveragePrice)
        : null;
      const hasOveragePricing =
        parsedOveragePrice !== null && !isNaN(parsedOveragePrice);

      if (existingLimit && !isEnabled) {
        // Remove limit - tier was disabled
        dispatch(
          removeUsageLimit({
            tierId: tier.id,
            limitId: existingLimit.id,
            lastModified: now,
          }),
        );
      } else if (existingLimit && isEnabled) {
        // Update existing limit - use limit for numeric values, notes for strings
        dispatch(
          updateUsageLimit({
            tierId: tier.id,
            limitId: existingLimit.id,
            metric: metricName.trim(),
            unitName: metricUnitName.trim() || undefined,
            freeLimit: isNumeric ? parsedLimit : null,
            paidLimit: isPaidNumeric ? parsedPaidLimit : null,
            notes: !isNumeric && limitValue ? limitValue.trim() : null,
            resetCycle: metricResetCycle,
            unitPrice: hasOveragePricing ? parsedOveragePrice : null,
            unitPriceCurrency: hasOveragePricing ? "USD" : undefined,
            lastModified: now,
          }),
        );
      } else if (!existingLimit && isEnabled) {
        // Add new limit - use limit for numeric values, notes for strings
        dispatch(
          addUsageLimit({
            tierId: tier.id,
            limitId: generateId(),
            serviceId,
            metric: metricName.trim(),
            unitName: metricUnitName.trim() || undefined,
            freeLimit: isNumeric ? parsedLimit : null,
            paidLimit: isPaidNumeric ? parsedPaidLimit : null,
            notes: !isNumeric && limitValue ? limitValue.trim() : null,
            resetCycle: metricResetCycle,
            unitPrice: hasOveragePricing ? parsedOveragePrice : undefined,
            unitPriceCurrency: hasOveragePricing ? "USD" : undefined,
            lastModified: now,
          }),
        );
      }
    });

    setMetricModal(null);
    setMetricName("");
    setMetricLimits({});
    setMetricPaidLimits({});
    setMetricEnabledTiers(new Set());
    setMetricOveragePrices({});
    setMetricUnitName("");
    setMetricResetCycle("MONTHLY");
  };

  const getLevelDisplay = (
    serviceLevel: ServiceLevelBinding | undefined,
  ): { label: string; color: string } => {
    if (!serviceLevel) return { label: "—", color: "var(--so-slate-300)" };

    const level = serviceLevel.level;
    const config = SERVICE_LEVELS.find((l) => l.value === level);

    if (level === "CUSTOM" && serviceLevel.customValue) {
      return {
        label: serviceLevel.customValue,
        color: config?.color || "var(--so-amber-600)",
      };
    }

    return {
      label: config?.shortLabel || level,
      color: config?.color || "var(--so-slate-600)",
    };
  };

  if (services.length === 0 || tiers.length === 0) {
    return (
      <>
        <div className="matrix">
          <div className="matrix__empty">
            <svg
              className="matrix__empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <h3 className="matrix__empty-title">Matrix Not Ready</h3>
            <p className="matrix__empty-text">
              {services.length === 0 && tiers.length === 0
                ? "Add services in the Service Catalog and tiers in Tier Definition to configure the matrix."
                : services.length === 0
                  ? "Add services in the Service Catalog to configure the matrix."
                  : "Add tiers in Tier Definition to configure the matrix."}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="matrix">
        {/* Facet Selector - Dynamic from Resource Template */}
        {Object.keys(facetCategories).length > 0 && (
          <div className="matrix__facets">
            <div className="matrix__facets-row">
              {Object.entries(facetCategories).map(([key, category]) => (
                <div key={key} className="matrix__facet-group">
                  <span className="matrix__facet-label">{category.label}</span>
                  {category.options.length <= 3 ? (
                    <div className="matrix__toggle-group">
                      {category.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setSelectedFacets((prev) => ({
                              ...prev,
                              [key]: option.id,
                            }))
                          }
                          className={`matrix__toggle-btn ${
                            selectedFacets[key] === option.id
                              ? "matrix__toggle-btn--active"
                              : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <select
                      value={
                        selectedFacets[key] || category.options[0]?.id || ""
                      }
                      onChange={(e) =>
                        setSelectedFacets((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="matrix__facet-select"
                    >
                      {category.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incomplete Services Warning */}
        {incompleteServices.length > 0 && (
          <div className="matrix__incomplete-warning">
            <div className="matrix__incomplete-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="matrix__incomplete-content">
              <span className="matrix__incomplete-title">
                {incompleteServices.length} service
                {incompleteServices.length !== 1 ? "s" : ""} not configured
              </span>
              <span className="matrix__incomplete-text">
                The following services are not included in any tier:{" "}
                <strong>
                  {incompleteServices
                    .slice(0, 3)
                    .map((s) => s.title)
                    .join(", ")}
                </strong>
                {incompleteServices.length > 3 &&
                  ` and ${incompleteServices.length - 3} more`}
              </span>
            </div>
          </div>
        )}

        {/* Billing Cycle Selector */}
        <div className="matrix__billing-cycle-bar">
          <span className="matrix__billing-cycle-label">
            Set Subscription Plan & Billing Cycle:
          </span>
          <div className="matrix__billing-cycle-tabs">
            {availableCyclesForSelectedTier.map((cycle) => (
              <button
                key={cycle}
                onClick={() => handleGlobalCycleChange(cycle)}
                className={`matrix__billing-cycle-tab ${!isCustomBillingMode && activeBillingCycle === cycle ? "matrix__billing-cycle-tab--active" : ""}`}
              >
                {BILLING_CYCLE_SHORT_LABELS[cycle]}
              </button>
            ))}
            {isCustomBillingMode && (
              <span className="matrix__billing-cycle-tab matrix__billing-cycle-tab--custom matrix__billing-cycle-tab--active">
                Custom
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopyUserSelection}
            className="matrix__copy-selection-btn"
            title="Copy current UserSelectionInput as JSON for mutation testing"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Selection
          </button>
        </div>

        {majorityResult && !majorityDismissed && (
          <div className="matrix__majority-banner">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="matrix__majority-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="matrix__majority-text">
              {majorityResult.count} of {majorityResult.total} service groups
              use{" "}
              <strong>
                {BILLING_CYCLE_SHORT_LABELS[majorityResult.majorityCycle]}
              </strong>{" "}
              billing.
            </span>
            <button
              type="button"
              className="matrix__majority-btn matrix__majority-btn--switch"
              onClick={() => {
                handleGlobalCycleChange(majorityResult.majorityCycle);
                setMajorityDismissed(true);
              }}
            >
              Switch to{" "}
              {BILLING_CYCLE_SHORT_LABELS[majorityResult.majorityCycle]}
            </button>
            <button
              type="button"
              className="matrix__majority-btn matrix__majority-btn--dismiss"
              onClick={() => setMajorityDismissed(true)}
            >
              Keep current
            </button>
          </div>
        )}

        <div className="matrix__table-wrap">
          <table className="matrix__table">
            <thead>
              <tr>
                <th className="matrix__corner-cell">
                  <InfoIcon
                    content="INCLUDED: part of the tier. OPTIONAL: available as add-on. NOT_INCLUDED: not available in this tier. CUSTOM/VARIABLE: negotiated pricing."
                    side="right"
                  />
                </th>
                {tiers.map((tier, idx) => {
                  const cyclePrice = tier.isCustomPricing
                    ? null
                    : getTierDisplayPrice(idx);

                  return (
                    <th
                      key={tier.id}
                      onClick={() => {
                        setSelectedTierIdx(idx);
                      }}
                      className={`matrix__tier-header ${
                        idx === selectedTierIdx
                          ? "matrix__tier-header--selected"
                          : ""
                      }`}
                    >
                      <div className="matrix__tier-header-inner">
                        <div className="matrix__tier-radio" />
                        <span className="matrix__tier-name">{tier.name}</span>
                        {tier.isCustomPricing ? (
                          <span className="matrix__tier-price">Custom</span>
                        ) : cyclePrice ? (
                          <>
                            <span className="matrix__tier-price-main">
                              {formatPrice(
                                cyclePrice.monthlyEquivalent,
                                tierBreakdowns[idx].tierCurrency,
                              )}
                              <span className="matrix__tier-price-unit">
                                /mo
                              </span>
                            </span>
                            {!isCustomBillingMode &&
                              activeBillingCycle !== "MONTHLY" && (
                                <span className="matrix__tier-billed">
                                  Billed{" "}
                                  {formatPrice(
                                    cyclePrice.billedTotal,
                                    tierBreakdowns[idx].tierCurrency,
                                  )}{" "}
                                  {BILLING_CYCLE_LABELS[activeBillingCycle]}
                                </span>
                              )}
                            {!isCustomBillingMode &&
                              cyclePrice.hasDiscount &&
                              cyclePrice.savingsPercent > 0 && (
                                <span className="matrix__tier-discount-badge">
                                  SAVE {cyclePrice.savingsPercent}%
                                </span>
                              )}
                          </>
                        ) : (
                          <span className="matrix__tier-price">—</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={tiers.length + 1}
                  className="matrix__section-header"
                >
                  Service Catalog
                </td>
              </tr>

              {/* Setup & Formation category header */}
              {(setupGroups.length > 0 ||
                ungroupedSetupServices.length > 0) && (
                <tr>
                  <td
                    colSpan={tiers.length + 1}
                    className="matrix__category-header"
                  >
                    <span className="matrix__category-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      >
                        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                        <path d="M9 21v-6h6v6" />
                        <path d="M9 7h.01M9 11h.01M15 7h.01M15 11h.01" />
                      </svg>
                    </span>
                    Setup & Formation
                  </td>
                </tr>
              )}

              {setupGroups.map((group) => (
                <ServiceGroupSection
                  key={group.id}
                  group={group}
                  services={groupedServices.get(group.id) || []}
                  tiers={tiers}
                  isSetupFormation={true}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  onAddService={openAddServiceModal}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                  activeBillingCycle={activeBillingCycle}
                />
              ))}

              {ungroupedSetupServices.length > 0 && (
                <ServiceGroupSection
                  key="ungrouped-setup"
                  group={{
                    id: UNGROUPED_ID,
                    name: "Setup & Formation",
                    description: null,
                    isAddOn: false,
                    defaultSelected: true,
                    availableBillingCycles: [],
                    billingCycleDiscounts: [],
                    costType: null,
                    currency: null,
                    price: null,
                    pricingMode: null,
                    standalonePricing: null,
                    tierDependentPricing: null,
                    discountMode: null,
                  }}
                  services={ungroupedSetupServices}
                  tiers={tiers}
                  isSetupFormation={true}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                  activeBillingCycle={activeBillingCycle}
                />
              )}

              {/* Recurring Services category header */}
              {(regularGroups.length > 0 ||
                ungroupedRegularServices.length > 0) && (
                <tr>
                  <td
                    colSpan={tiers.length + 1}
                    className="matrix__category-header"
                  >
                    <span className="matrix__category-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    </span>
                    Recurring Services
                  </td>
                </tr>
              )}

              {regularGroups.map((group) => (
                <ServiceGroupSection
                  key={group.id}
                  group={group}
                  services={groupedServices.get(group.id) || []}
                  tiers={tiers}
                  isSetupFormation={false}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  onAddService={openAddServiceModal}
                  selectedTierIdx={selectedTierIdx}
                  dispatch={dispatch}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                  activeBillingCycle={activeBillingCycle}
                  groupActiveCycle={groupBillingCycles[group.id]}
                  onGroupCycleChange={(cycle) =>
                    handleGroupCycleChange(group.id, cycle)
                  }
                  groupBreakdown={tierBreakdowns[
                    selectedTierIdx
                  ]?.optionGroupBreakdowns.find(
                    (b) => b.optionGroupId === group.id,
                  )}
                />
              ))}

              {ungroupedRegularServices.length > 0 && (
                <ServiceGroupSection
                  key="ungrouped-regular"
                  group={{
                    id: UNGROUPED_ID,
                    name: "Recurring Services",
                    description: null,
                    isAddOn: false,
                    defaultSelected: true,
                    availableBillingCycles: [],
                    billingCycleDiscounts: [],
                    costType: null,
                    currency: null,
                    price: null,
                    pricingMode: null,
                    standalonePricing: null,
                    tierDependentPricing: null,
                    discountMode: null,
                  }}
                  services={ungroupedRegularServices}
                  tiers={tiers}
                  isSetupFormation={false}
                  isOptional={false}
                  isEnabled={true}
                  onToggle={() => {}}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                  activeBillingCycle={activeBillingCycle}
                />
              )}

              <tr className="matrix__total-row">
                <td>SUBTOTAL</td>
                {tiers.map((tier, idx) => {
                  if (tier.isCustomPricing) {
                    return (
                      <td key={tier.id} style={{ textAlign: "center" }}>
                        Custom
                      </td>
                    );
                  }
                  const groupSum = tierBreakdowns[idx].tierMonthlyBase;
                  const tierPrice = tier.pricing.amount ?? 0;
                  const isCalculated = tier.pricingMode === "CALCULATED";
                  const currency = tier.pricing.currency || "USD";
                  const isOver =
                    !isCalculated && tierPrice > 0 && groupSum > tierPrice;

                  return (
                    <td key={tier.id} style={{ textAlign: "center" }}>
                      <div className="matrix__subtotal-cell">
                        <span className="matrix__subtotal-tier-price">
                          {formatPrice(
                            isCalculated ? groupSum : tierPrice,
                            currency,
                          )}
                        </span>
                        {isCalculated && (
                          <span
                            className="matrix__calculated-badge"
                            title="Calculated from service groups"
                          >
                            calc
                          </span>
                        )}
                        {!isCalculated &&
                          groupSum > 0 &&
                          tierPrice > 0 &&
                          groupSum !== tierPrice && (
                            <span
                              className={`matrix__subtotal-comparison ${isOver ? "matrix__subtotal-comparison--over" : "matrix__subtotal-comparison--under"}`}
                            >
                              {isOver
                                ? `Groups: ${formatPrice(groupSum, currency)} (+${formatPrice(groupSum - tierPrice, currency)})`
                                : `Groups: ${formatPrice(groupSum, currency)}`}
                            </span>
                          )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {addonGroups.map((group) => (
                <ServiceGroupSection
                  key={group.id}
                  group={group}
                  services={groupedServices.get(group.id) || []}
                  tiers={tiers}
                  isSetupFormation={false}
                  isOptional={true}
                  isEnabled={enabledOptionalGroups.has(group.id)}
                  onToggle={() => toggleOptionalGroup(group.id)}
                  getServiceLevelForTier={getServiceLevelForTier}
                  getUniqueMetricsForService={getUniqueMetricsForService}
                  getUsageLimitForMetric={getUsageLimitForMetric}
                  getLevelDisplay={getLevelDisplay}
                  selectedCell={selectedCell}
                  setSelectedCell={setSelectedCell}
                  handleSetServiceLevel={handleSetServiceLevel}
                  dispatch={dispatch}
                  onAddService={openAddServiceModal}
                  selectedTierIdx={selectedTierIdx}
                  onAddMetric={handleAddMetric}
                  onEditMetric={handleEditMetric}
                  onRemoveMetric={handleRemoveMetric}
                  onEditService={openEditServiceModal}
                  onReorderService={handleReorderService}
                  activeBillingCycle={activeBillingCycle}
                  addonActiveCycle={addonBillingCycles[group.id] || "MONTHLY"}
                  onAddonCycleChange={(cycle) => {
                    setAddonBillingCycles((prev) => ({
                      ...prev,
                      [group.id]: cycle,
                    }));
                  }}
                  groupBreakdown={tierBreakdowns[
                    selectedTierIdx
                  ]?.addOnBreakdowns.find((b) => b.optionGroupId === group.id)}
                />
              ))}
            </tbody>
          </table>

          {/* Grand Total - Sticky at bottom of scroll container */}
          <div className="matrix__grand-total-sticky">
            <table className="matrix__table">
              <tbody>
                {/* 1. Recurring Tier Price — global mode: single row; custom mode: per-group rows */}
                {!isCustomBillingMode ? (
                  <tr className="matrix__grand-total-row">
                    <td>
                      Recurring Tier Price
                      <InfoIcon content="Shows the calculated total for a client selecting this tier with the current billing cycle. Includes base price + included services + optional add-ons." />
                      <span className="matrix__grand-total-cycle">
                        /
                        {BILLING_CYCLE_SHORT_LABELS[
                          activeBillingCycle
                        ].toLowerCase()}
                      </span>
                    </td>
                    {tiers.map((tier, idx) => {
                      const breakdown = tierBreakdowns[idx];
                      const discountedTotal =
                        breakdown.totals.grandRecurringTotal;
                      const undiscountedTotal =
                        breakdown.tierCycleTotal +
                        breakdown.addOnBreakdowns.reduce(
                          (s, a) => s + a.cycleAmount,
                          0,
                        );
                      const savingsPct =
                        undiscountedTotal > 0
                          ? Math.round(
                              ((undiscountedTotal - discountedTotal) /
                                undiscountedTotal) *
                                100,
                            )
                          : 0;
                      return (
                        <td
                          key={tier.id}
                          className={
                            idx === selectedTierIdx
                              ? "matrix__grand-total-cell--selected"
                              : ""
                          }
                          style={{ textAlign: "center" }}
                        >
                          {idx === selectedTierIdx ? (
                            tier.isCustomPricing ? (
                              "Custom"
                            ) : (
                              <>
                                {formatPrice(
                                  discountedTotal,
                                  breakdown.tierCurrency,
                                )}
                                {savingsPct > 0 && (
                                  <span className="matrix__discount-tag">
                                    SAVE {savingsPct}%
                                  </span>
                                )}
                              </>
                            )
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ) : (
                  /* Custom billing mode: itemized per-group rows from breakdown */
                  tierBreakdowns[selectedTierIdx]?.optionGroupBreakdowns.map(
                    (ogb) => (
                      <tr
                        key={`group-${ogb.optionGroupId}`}
                        className="matrix__grand-total-row"
                      >
                        <td>
                          {ogb.optionGroupName}
                          <span className="matrix__grand-total-cycle">
                            /
                            {BILLING_CYCLE_SHORT_LABELS[
                              ogb.effectiveBillingCycle
                            ].toLowerCase()}
                          </span>
                        </td>
                        {tiers.map((tier, idx) => (
                          <td
                            key={tier.id}
                            className={
                              idx === selectedTierIdx
                                ? "matrix__grand-total-cell--selected"
                                : ""
                            }
                            style={{ textAlign: "center" }}
                          >
                            {idx === selectedTierIdx ? (
                              tier.isCustomPricing ? (
                                "Custom"
                              ) : ogb.monthlyBase > 0 ? (
                                <>
                                  {formatPrice(
                                    ogb.recurringAmount,
                                    ogb.currency,
                                  )}
                                  {ogb.discount &&
                                    ogb.discount.discountValue > 0 && (
                                      <span className="matrix__discount-tag">
                                        SAVE{" "}
                                        {Math.round(
                                          ogb.discount.discountType ===
                                            "PERCENTAGE"
                                            ? ogb.discount.discountValue
                                            : ogb.cycleAmount > 0
                                              ? ((ogb.cycleAmount -
                                                  ogb.recurringAmount) /
                                                  ogb.cycleAmount) *
                                                100
                                              : 0,
                                        )}
                                        %
                                      </span>
                                    )}
                                </>
                              ) : (
                                "—"
                              )
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    ),
                  )
                )}

                {/* 2. Recurring Add-on Prices from breakdown */}
                {tierBreakdowns[selectedTierIdx]?.addOnBreakdowns
                  .filter((ab) => ab.monthlyBase > 0)
                  .map((ab) => (
                    <tr
                      key={`addon-recurring-${ab.optionGroupId}`}
                      className="matrix__grand-total-row matrix__grand-total-row--addon"
                    >
                      <td>
                        + {ab.optionGroupName}
                        <span className="matrix__grand-total-cycle">
                          /
                          {BILLING_CYCLE_SHORT_LABELS[
                            ab.selectedBillingCycle
                          ].toLowerCase()}
                        </span>
                      </td>
                      {tiers.map((tier, idx) => (
                        <td
                          key={tier.id}
                          className={
                            idx === selectedTierIdx
                              ? "matrix__grand-total-cell--selected"
                              : ""
                          }
                          style={{ textAlign: "center" }}
                        >
                          {idx === selectedTierIdx ? (
                            <>
                              +{formatPrice(ab.recurringAmount, ab.currency)}
                              {ab.discount && ab.discount.discountValue > 0 && (
                                <span className="matrix__discount-tag">
                                  SAVE{" "}
                                  {Math.round(
                                    ab.discount.discountType === "PERCENTAGE"
                                      ? ab.discount.discountValue
                                      : ab.cycleAmount > 0
                                        ? ((ab.cycleAmount -
                                            ab.recurringAmount) /
                                            ab.cycleAmount) *
                                          100
                                        : 0,
                                  )}
                                  %
                                </span>
                              )}
                            </>
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* 3. Add-on Setup Costs from breakdown */}
                {tierBreakdowns[selectedTierIdx]?.addOnBreakdowns
                  .filter((ab) => ab.setupCost !== null && ab.setupCost > 0)
                  .map((ab) => (
                    <tr
                      key={`addon-setup-${ab.optionGroupId}`}
                      className="matrix__grand-total-row matrix__grand-total-row--addon"
                    >
                      <td>
                        + {ab.optionGroupName}{" "}
                        <span className="matrix__grand-total-cycle">
                          (one-time setup)
                        </span>
                      </td>
                      {tiers.map((tier, idx) => (
                        <td
                          key={tier.id}
                          className={
                            idx === selectedTierIdx
                              ? "matrix__grand-total-cell--selected"
                              : ""
                          }
                          style={{ textAlign: "center" }}
                        >
                          {idx === selectedTierIdx
                            ? `${formatPrice(
                                ab.setupCost!,
                                ab.setupCostCurrency || "USD",
                              )} one-time`
                            : null}
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* 4. Setup & Formation Fees from breakdown */}
                {(() => {
                  const setupBds =
                    tierBreakdowns[selectedTierIdx]?.setupGroupBreakdowns ?? [];
                  const totalSetupBase = setupBds.reduce(
                    (sum, s) =>
                      sum +
                      (s.setupCostDiscount?.originalAmount ?? s.setupCost ?? 0),
                    0,
                  );
                  const totalSetupEffective = setupBds.reduce(
                    (sum, s) => sum + (s.setupCost ?? 0),
                    0,
                  );
                  if (totalSetupBase === 0) return null;
                  const hasDiscount = totalSetupEffective !== totalSetupBase;
                  return (
                    <tr className="matrix__grand-total-row matrix__grand-total-row--setup">
                      <td>+ Setup & Formation Fees</td>
                      {tiers.map((tier, idx) => (
                        <td
                          key={tier.id}
                          className={
                            idx === selectedTierIdx
                              ? "matrix__grand-total-cell--selected"
                              : ""
                          }
                          style={{ textAlign: "center" }}
                        >
                          {idx === selectedTierIdx
                            ? hasDiscount
                              ? `${formatPrice(totalSetupEffective, "USD")} one-time`
                              : `${formatPrice(totalSetupBase, "USD")} one-time`
                            : null}
                        </td>
                      ))}
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {selectedCell && (
          <ServiceLevelDetailPanel
            serviceId={selectedCell.serviceId}
            tierId={selectedCell.tierId}
            services={services}
            tiers={tiers}
            optionGroups={optionGroups}
            dispatch={dispatch}
            onClose={() => setSelectedCell(null)}
          />
        )}

        {addServiceModal && (
          <div className="matrix__modal-overlay">
            <div className="matrix__modal matrix__modal--wide">
              <h3 className="matrix__modal-title">Add New Service</h3>

              {/* Service Name */}
              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Service Name</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Enter service name"
                  className="matrix__modal-input"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Description (optional)
                </label>
                <textarea
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={2}
                  className="matrix__modal-textarea"
                />
              </div>

              {/* Tier Selection */}
              {tiers.length > 0 && (
                <div className="matrix__modal-field">
                  <label className="matrix__modal-label">
                    Include in Tiers
                  </label>
                  <div className="matrix__modal-tier-grid">
                    {tiers.map((tier) => {
                      const isSelected = newServiceSelectedTiers.has(tier.id);
                      return (
                        <label
                          key={tier.id}
                          className={`matrix__modal-tier-option ${isSelected ? "matrix__modal-tier-option--selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSet = new Set(newServiceSelectedTiers);
                              if (e.target.checked) {
                                newSet.add(tier.id);
                              } else {
                                newSet.delete(tier.id);
                              }
                              setNewServiceSelectedTiers(newSet);
                            }}
                            className="matrix__modal-tier-checkbox"
                          />
                          <span className="matrix__modal-tier-name">
                            {tier.name}
                          </span>
                          {tier.pricing.amount !== null && (
                            <span className="matrix__modal-tier-price">
                              ${tier.pricing.amount}/mo
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {newServiceSelectedTiers.size === 0 && (
                    <p className="matrix__modal-tier-hint">
                      Select at least one tier to include this service
                    </p>
                  )}
                </div>
              )}

              <p className="matrix__modal-hint">
                This service will be added to{" "}
                <strong>
                  {addServiceModal.groupId !== UNGROUPED_ID
                    ? optionGroups.find((g) => g.id === addServiceModal.groupId)
                        ?.name || "Unknown Group"
                    : "Ungrouped Services"}
                </strong>{" "}
                as a{" "}
                {addServiceModal.isSetupFormation
                  ? "Setup/Formation"
                  : "Recurring"}{" "}
                service.
              </p>

              <div className="matrix__modal-actions">
                <button
                  onClick={() => {
                    setAddServiceModal(null);
                    setNewServiceName("");
                    setNewServiceDescription("");
                    setNewServiceSelectedTiers(new Set());
                  }}
                  className="matrix__modal-btn matrix__modal-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  disabled={
                    !newServiceName.trim() || newServiceSelectedTiers.size === 0
                  }
                  className="matrix__modal-btn matrix__modal-btn--primary"
                >
                  Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {editServiceModal && (
          <div className="matrix__modal-overlay">
            <div className="matrix__modal matrix__modal--wide">
              <h3 className="matrix__modal-title">Edit Service</h3>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Service Name</label>
                <input
                  type="text"
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  placeholder="Enter service name"
                  className="matrix__modal-input"
                  autoFocus
                />
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Description (optional)
                </label>
                <textarea
                  value={editServiceDescription}
                  onChange={(e) => setEditServiceDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={2}
                  className="matrix__modal-textarea"
                />
              </div>

              {/* Tier Selection */}
              {tiers.length > 0 && (
                <div className="matrix__modal-field">
                  <label className="matrix__modal-label">
                    Include in Tiers
                  </label>
                  <div className="matrix__modal-tier-grid">
                    {tiers.map((tier) => {
                      const isSelected = editServiceSelectedTiers.has(tier.id);
                      return (
                        <label
                          key={tier.id}
                          className={`matrix__modal-tier-option ${isSelected ? "matrix__modal-tier-option--selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSet = new Set(editServiceSelectedTiers);
                              if (e.target.checked) {
                                newSet.add(tier.id);
                              } else {
                                newSet.delete(tier.id);
                              }
                              setEditServiceSelectedTiers(newSet);
                            }}
                            className="matrix__modal-tier-checkbox"
                          />
                          <span className="matrix__modal-tier-name">
                            {tier.name}
                          </span>
                          {tier.pricing.amount !== null && (
                            <span className="matrix__modal-tier-price">
                              ${tier.pricing.amount}/mo
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="matrix__modal-actions">
                <button
                  onClick={() => {
                    setEditServiceModal(null);
                    setEditServiceName("");
                    setEditServiceDescription("");
                    setEditServiceSelectedTiers(new Set());
                  }}
                  className="matrix__modal-btn matrix__modal-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditService}
                  disabled={!editServiceName.trim()}
                  className="matrix__modal-btn matrix__modal-btn--primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Metric Edit Modal */}
        {metricModal && (
          <div className="matrix__modal-overlay">
            <div className="matrix__modal matrix__modal--wide">
              <h3 className="matrix__modal-title">
                {metricModal.metric ? "Edit Metric" : "Add Metric"}
              </h3>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Metric Name</label>
                <input
                  type="text"
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  placeholder="e.g., Number of Entities, API Calls, Storage"
                  className="matrix__modal-input"
                  autoFocus
                />
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Unit Name (Optional)
                </label>
                <input
                  type="text"
                  value={metricUnitName}
                  onChange={(e) => setMetricUnitName(e.target.value)}
                  placeholder="e.g., entity, user, API call, GB"
                  className="matrix__modal-input"
                />
                <p
                  className="matrix__modal-hint"
                  style={{ marginTop: "0.375rem" }}
                >
                  Used for overage pricing (e.g., "$50/entity above free limit")
                </p>
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">Reset Cycle</label>
                <select
                  value={metricResetCycle}
                  onChange={(e) =>
                    setMetricResetCycle(e.target.value as UsageResetCycle)
                  }
                  className="matrix__modal-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="NONE">None (One-time)</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
                <p
                  className="matrix__modal-hint"
                  style={{ marginTop: "0.375rem" }}
                >
                  How often usage limits reset. Use "None" for one-time setup
                  costs.
                </p>
              </div>

              <div className="matrix__modal-field">
                <label className="matrix__modal-label">
                  Pricing Tiers & Values
                </label>
                <p
                  className="matrix__modal-hint"
                  style={{ marginBottom: "0.75rem" }}
                >
                  Enable the metric for each tier and set values.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {tiers.map((tier) => {
                    const isEnabled = metricEnabledTiers.has(tier.id);
                    const tierOveragePrice = metricOveragePrices[tier.id] || "";
                    return (
                      <div
                        key={tier.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          borderRadius: "6px",
                          background: isEnabled
                            ? "rgba(124, 58, 237, 0.05)"
                            : "#f8fafc",
                          border: isEnabled
                            ? "1px solid rgba(124, 58, 237, 0.2)"
                            : "1px solid #e2e8f0",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: "pointer",
                              minWidth: "120px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                setMetricEnabledTiers((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) {
                                    next.add(tier.id);
                                  } else {
                                    next.delete(tier.id);
                                  }
                                  return next;
                                });
                              }}
                              style={{
                                width: "16px",
                                height: "16px",
                                accentColor: "#7c3aed",
                                cursor: "pointer",
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 600,
                                color: isEnabled ? "#334155" : "#94a3b8",
                                fontSize: "0.875rem",
                              }}
                            >
                              {tier.name}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={metricLimits[tier.id] || ""}
                            onChange={(e) =>
                              setMetricLimits((prev) => ({
                                ...prev,
                                [tier.id]: e.target.value,
                              }))
                            }
                            placeholder={isEnabled ? "Free limit" : "—"}
                            className="matrix__modal-input"
                            disabled={!isEnabled}
                            style={{
                              flex: 1,
                              opacity: isEnabled ? 1 : 0.5,
                              cursor: isEnabled ? "text" : "not-allowed",
                            }}
                          />
                          <input
                            type="text"
                            value={metricPaidLimits[tier.id] || ""}
                            onChange={(e) =>
                              setMetricPaidLimits((prev) => ({
                                ...prev,
                                [tier.id]: e.target.value,
                              }))
                            }
                            placeholder={isEnabled ? "Paid limit" : "—"}
                            className="matrix__modal-input"
                            disabled={!isEnabled}
                            style={{
                              flex: 1,
                              opacity: isEnabled ? 1 : 0.5,
                              cursor: isEnabled ? "text" : "not-allowed",
                            }}
                          />
                        </div>
                        {/* Per-tier overage pricing */}
                        {isEnabled && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginLeft: "1.75rem",
                              padding: "0.5rem 0.75rem",
                              background: "rgba(255,255,255,0.6)",
                              borderRadius: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Overage price:
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--so-font-mono)",
                                fontSize: "0.8125rem",
                                color: "#64748b",
                              }}
                            >
                              $
                            </span>
                            <input
                              type="number"
                              value={tierOveragePrice}
                              onChange={(e) =>
                                setMetricOveragePrices((prev) => ({
                                  ...prev,
                                  [tier.id]: e.target.value,
                                }))
                              }
                              placeholder="0.00"
                              step="0.01"
                              style={{
                                width: "4rem",
                                fontFamily: "var(--so-font-mono)",
                                fontSize: "0.8125rem",
                                fontWeight: 500,
                                color: "#0f172a",
                                background: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                padding: "0.25rem 0.375rem",
                                outline: "none",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                color: "#64748b",
                              }}
                            >
                              per {metricUnitName || "unit"} above free limit
                              {metricResetCycle && metricResetCycle !== "NONE"
                                ? ` / ${metricResetCycle.toLowerCase()}`
                                : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="matrix__modal-actions">
                <button
                  onClick={() => {
                    setMetricModal(null);
                    setMetricName("");
                    setMetricUnitName("");
                    setMetricLimits({});
                    setMetricPaidLimits({});
                    setMetricEnabledTiers(new Set());
                    setMetricOveragePrices({});
                    setMetricResetCycle("MONTHLY");
                  }}
                  className="matrix__modal-btn matrix__modal-btn--cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMetric}
                  disabled={!metricName.trim() || metricEnabledTiers.size === 0}
                  className="matrix__modal-btn matrix__modal-btn--primary"
                >
                  {metricModal.metric ? "Save Changes" : "Add Metric"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {pendingRemoveMetric && (
        <ConfirmDialog
          title="Remove this metric?"
          message="This will delete the usage metric and its limits from all tiers. This action cannot be undone."
          confirmLabel="Remove Metric"
          variant="danger"
          onConfirm={confirmRemoveMetric}
          onCancel={() => setPendingRemoveMetric(null)}
        />
      )}
    </>
  );
}

interface ServiceGroupSectionProps {
  group: OptionGroup;
  services: Service[];
  tiers: ServiceSubscriptionTier[];
  isSetupFormation: boolean;
  isOptional: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  getServiceLevelForTier: (
    serviceId: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceLevelBinding | undefined;
  getUniqueMetricsForService: (serviceId: string) => string[];
  getUsageLimitForMetric: (
    serviceId: string,
    metric: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceUsageLimit | undefined;
  getLevelDisplay: (serviceLevel: ServiceLevelBinding | undefined) => {
    label: string;
    color: string;
  };
  selectedCell: { serviceId: string; tierId: string } | null;
  setSelectedCell: (cell: { serviceId: string; tierId: string } | null) => void;
  handleSetServiceLevel: (
    serviceId: string,
    tierId: string,
    level: ServiceLevel,
    existingLevelId?: string,
    optionGroupId?: string,
  ) => void;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onAddService?: (groupId: string, isSetupFormation: boolean) => void;
  selectedTierIdx: number;
  onAddMetric: (serviceId: string) => void;
  onEditMetric: (serviceId: string, metric: string) => void;
  onRemoveMetric: (serviceId: string, metric: string) => void;
  onEditService: (service: Service) => void;
  onReorderService: (
    serviceId: string,
    direction: "up" | "down",
    groupServices: Service[],
  ) => void;
  activeBillingCycle: BillingCycle;
  addonActiveCycle?: BillingCycle;
  onAddonCycleChange?: (cycle: BillingCycle) => void;
  groupActiveCycle?: BillingCycle;
  onGroupCycleChange?: (cycle: BillingCycle) => void;
  groupBreakdown?: OptionGroupBreakdown | AddOnBreakdown | null;
}

function ServiceGroupSection({
  group,
  services,
  tiers,
  isSetupFormation,
  isOptional,
  isEnabled,
  onToggle,
  getServiceLevelForTier,
  getUniqueMetricsForService,
  getUsageLimitForMetric,
  getLevelDisplay,
  selectedCell,
  setSelectedCell,
  onAddService,
  selectedTierIdx,
  onAddMetric,
  onEditMetric,
  onRemoveMetric,
  onEditService,
  onReorderService,
  activeBillingCycle,
  addonActiveCycle,
  onAddonCycleChange: _onAddonCycleChange,
  groupActiveCycle,
  onGroupCycleChange: _onGroupCycleChange,
  groupBreakdown,
}: ServiceGroupSectionProps) {
  const showGroup = services.length > 0 || onAddService;
  if (!showGroup) return null;

  // Add-ons follow the global billing cycle (no independent cycle tabs);
  // regular groups can have a per-group override in custom billing mode.
  const effectiveBillingCycle = group.isAddOn
    ? activeBillingCycle
    : groupActiveCycle || activeBillingCycle;

  const headerClass = isSetupFormation
    ? "matrix__group-header--setup"
    : isOptional
      ? "matrix__group-header--optional"
      : "matrix__group-header--regular";

  const rowClass = isSetupFormation
    ? "matrix__service-row--setup"
    : isOptional
      ? "matrix__service-row--optional"
      : "matrix__service-row--regular";

  return (
    <>
      <tr className={`matrix__group-header ${headerClass}`}>
        <td className={`matrix__group-header-sticky ${headerClass}`}>
          <div className="matrix__group-header-inner">
            {isOptional && (
              <button
                onClick={onToggle}
                className={`matrix__group-toggle ${isEnabled ? "matrix__group-toggle--on" : "matrix__group-toggle--off"}`}
              >
                <span className="matrix__group-toggle-knob" />
              </button>
            )}
            <div className="matrix__group-name-block">
              <span className="matrix__group-name">{group.name}</span>
              {group.isAddOn && (
                <span className="matrix__group-subtitle">Optional Add-on</span>
              )}
            </div>
            {/* Group pricing: price + billing cycle tabs + discount + setup cost */}
            {!isSetupFormation &&
              (() => {
                if (!groupBreakdown) return null;
                const { monthlyBase, recurringAmount, discount, currency } =
                  groupBreakdown;
                if (monthlyBase <= 0 && !group.standalonePricing?.setupCost)
                  return null;
                const setupCost = group.standalonePricing?.setupCost;
                const months = BILLING_CYCLE_MONTHS[effectiveBillingCycle];
                const monthlyEq =
                  months > 0
                    ? Math.round((recurringAmount / months) * 100) / 100
                    : recurringAmount;
                const savingsPct =
                  discount && discount.originalAmount > 0
                    ? Math.round(
                        ((discount.originalAmount - discount.discountedAmount) /
                          discount.originalAmount) *
                          100,
                      )
                    : 0;
                return (
                  <div className="matrix__addon-pricing-bar">
                    {monthlyBase > 0 && (
                      <span className="matrix__addon-price">
                        {formatPrice(
                          effectiveBillingCycle === "MONTHLY"
                            ? monthlyBase
                            : monthlyEq,
                          currency,
                        )}
                        /mo
                      </span>
                    )}
                    {effectiveBillingCycle !== "MONTHLY" && monthlyBase > 0 && (
                      <span className="matrix__addon-billed">
                        Billed {formatPrice(recurringAmount, currency)}{" "}
                        {BILLING_CYCLE_LABELS[effectiveBillingCycle]}
                      </span>
                    )}
                    {savingsPct > 0 && (
                      <span className="matrix__addon-discount">
                        SAVE {Math.round(savingsPct)}%
                      </span>
                    )}
                    {setupCost && setupCost.amount > 0 && (
                      <span className="matrix__addon-setup">
                        +{" "}
                        {formatPrice(
                          setupCost.amount,
                          setupCost.currency || "USD",
                        )}{" "}
                        Setup
                      </span>
                    )}
                  </div>
                );
              })()}
          </div>
        </td>
        <td
          colSpan={tiers.length}
          className={headerClass}
          style={{ textAlign: "center" }}
        >
          <span
            className={`matrix__group-badge ${
              isSetupFormation || !isOptional
                ? "matrix__group-badge--included"
                : "matrix__group-badge--optional"
            }`}
          >
            {isSetupFormation
              ? "INCLUDED"
              : isOptional
                ? "OPTIONAL"
                : "INCLUDED"}
          </span>
        </td>
      </tr>

      {services.map((service) => {
        const metrics = getUniqueMetricsForService(service.id);

        return (
          <ServiceRowWithMetrics
            key={service.id}
            service={service}
            metrics={metrics}
            tiers={tiers}
            rowClass={rowClass}
            getServiceLevelForTier={getServiceLevelForTier}
            getUsageLimitForMetric={getUsageLimitForMetric}
            getLevelDisplay={getLevelDisplay}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            selectedTierIdx={selectedTierIdx}
            onAddMetric={onAddMetric}
            onEditMetric={onEditMetric}
            onRemoveMetric={onRemoveMetric}
            onEditService={onEditService}
            onReorderService={onReorderService}
            groupServices={services}
            serviceIndex={services.indexOf(service)}
          />
        );
      })}

      {onAddService && group.id !== "__ungrouped__" && (
        <tr className={`matrix__add-service-row ${rowClass}`}>
          <td className={rowClass}>
            <button
              onClick={() => onAddService(group.id, isSetupFormation)}
              className="matrix__add-service-btn"
            >
              <svg
                className="matrix__add-service-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add a Service
            </button>
          </td>
          <td colSpan={tiers.length} className={rowClass} />
        </tr>
      )}

      {isSetupFormation &&
        (() => {
          const basePrice = group.price ?? 0;
          if (basePrice === 0) {
            return (
              <tr className="matrix__setup-total-row">
                <td>TOTAL SETUP FEE</td>
                <td colSpan={tiers.length} style={{ textAlign: "center" }}>
                  No setup fee configured
                </td>
              </tr>
            );
          }
          const selectedTier = tiers[selectedTierIdx] ?? null;
          const tierPricing = selectedTier
            ? group.tierDependentPricing?.find(
                (tp) => tp.tierId === selectedTier.id,
              )
            : null;
          const cycleDiscount = tierPricing?.setupCostDiscounts?.find(
            (d) => d.billingCycle === activeBillingCycle,
          );
          const genericDiscount = tierPricing?.setupCost?.discount;
          const discount = cycleDiscount?.discountRule ?? genericDiscount;
          let effectivePrice = basePrice;
          if (discount && discount.discountValue > 0) {
            if (discount.discountType === "PERCENTAGE") {
              effectivePrice = basePrice * (1 - discount.discountValue / 100);
            } else {
              effectivePrice = Math.max(0, basePrice - discount.discountValue);
            }
            effectivePrice = Math.round(effectivePrice * 100) / 100;
          }
          const curr = group.currency || "USD";
          const hasDiscount = effectivePrice !== basePrice;
          return (
            <tr className="matrix__setup-total-row">
              <td>TOTAL SETUP FEE</td>
              <td colSpan={tiers.length} style={{ textAlign: "center" }}>
                {hasDiscount ? (
                  <>
                    <span
                      style={{
                        textDecoration: "line-through",
                        opacity: 0.5,
                        marginRight: 6,
                      }}
                    >
                      {formatPrice(basePrice, curr)}
                    </span>
                    {formatPrice(effectivePrice, curr)} flat fee
                    {discount?.discountType === "PERCENTAGE"
                      ? ` (${discount.discountValue}% off)`
                      : ` (${formatPrice(discount?.discountValue ?? 0, curr)} off)`}
                  </>
                ) : (
                  `${formatPrice(basePrice, curr)} flat fee (applied to all ${
                    tiers.some((t) => {
                      const tp = group.tierDependentPricing?.find(
                        (p) => p.tierId === t.id,
                      );
                      const monthlyAmt = tp?.recurringPricing?.find(
                        (r) => r.billingCycle === "MONTHLY",
                      )?.amount;
                      return !monthlyAmt || monthlyAmt === 0;
                    })
                      ? "priced "
                      : ""
                  }tiers)`
                )}
              </td>
            </tr>
          );
        })()}

      {isOptional &&
        (() => {
          const baseMonthly = isEnabled
            ? (groupBreakdown?.monthlyBase ?? 0)
            : 0;
          const adjustedTotal = isEnabled
            ? (groupBreakdown?.recurringAmount ?? 0)
            : 0;
          const setupCost = isEnabled
            ? (group.standalonePricing?.setupCost?.amount ?? 0)
            : 0;
          const billingLabel = `/${BILLING_CYCLE_SHORT_LABELS[effectiveBillingCycle].toLowerCase()}`;
          const currency = groupBreakdown?.currency || group.currency || "USD";

          return (
            <tr className={`matrix__total-row ${headerClass}`}>
              <td className={headerClass}>SUBTOTAL</td>
              <td colSpan={tiers.length} style={{ textAlign: "center" }}>
                {isEnabled && (baseMonthly > 0 || setupCost > 0) ? (
                  <>
                    {baseMonthly > 0 &&
                      `+${formatPrice(adjustedTotal, currency)}${billingLabel}`}
                    {baseMonthly > 0 && setupCost > 0 && " + "}
                    {setupCost > 0 &&
                      `${formatPrice(setupCost, currency)} setup`}
                  </>
                ) : isEnabled ? (
                  "Included"
                ) : (
                  "—"
                )}
              </td>
            </tr>
          );
        })()}
    </>
  );
}

interface ServiceRowWithMetricsProps {
  service: Service;
  metrics: string[];
  tiers: ServiceSubscriptionTier[];
  rowClass: string;
  getServiceLevelForTier: (
    serviceId: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceLevelBinding | undefined;
  getUsageLimitForMetric: (
    serviceId: string,
    metric: string,
    tier: ServiceSubscriptionTier,
  ) => ServiceUsageLimit | undefined;
  getLevelDisplay: (serviceLevel: ServiceLevelBinding | undefined) => {
    label: string;
    color: string;
  };
  selectedCell: { serviceId: string; tierId: string } | null;
  setSelectedCell: (cell: { serviceId: string; tierId: string } | null) => void;
  selectedTierIdx: number;
  onAddMetric: (serviceId: string) => void;
  onEditMetric: (serviceId: string, metric: string) => void;
  onRemoveMetric: (serviceId: string, metric: string) => void;
  onEditService: (service: Service) => void;
  onReorderService: (
    serviceId: string,
    direction: "up" | "down",
    groupServices: Service[],
  ) => void;
  groupServices: Service[];
  serviceIndex: number;
}

function ServiceRowWithMetrics({
  service,
  metrics,
  tiers,
  rowClass,
  getServiceLevelForTier,
  getUsageLimitForMetric,
  getLevelDisplay,
  selectedCell,
  setSelectedCell,
  selectedTierIdx,
  onAddMetric,
  onEditMetric,
  onRemoveMetric,
  onEditService,
  onReorderService,
  groupServices,
  serviceIndex,
}: ServiceRowWithMetricsProps) {
  const isFirst = serviceIndex === 0;
  const isLast = serviceIndex === groupServices.length - 1;

  return (
    <>
      <tr className={`matrix__service-row ${rowClass}`}>
        <td className={`matrix__service-cell ${rowClass}`}>
          <div className="matrix__service-cell-wrapper">
            {/* Reorder arrows */}
            <div className="matrix__reorder-buttons">
              <button
                className="matrix__reorder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReorderService(service.id, "up", groupServices);
                }}
                disabled={isFirst}
                title="Move up"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
              <button
                className="matrix__reorder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReorderService(service.id, "down", groupServices);
                }}
                disabled={isLast}
                title="Move down"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            <button
              className="matrix__service-title matrix__service-title--clickable"
              onClick={(e) => {
                e.stopPropagation();
                onEditService(service);
              }}
              title="Click to edit service"
            >
              {service.title}
            </button>
            {service.isSetupFormation && (
              <span className="matrix__service-setup-badge">Setup</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddMetric(service.id);
              }}
              className="matrix__add-metric-btn"
              title="Add metric to this service"
            >
              + Metric
            </button>
          </div>
        </td>
        {tiers.map((tier, tierIdx) => {
          const serviceLevel = getServiceLevelForTier(service.id, tier);
          const display = getLevelDisplay(serviceLevel);
          const isSelected =
            selectedCell?.serviceId === service.id &&
            selectedCell?.tierId === tier.id;
          const isNotIncluded =
            !serviceLevel || serviceLevel.level === "NOT_INCLUDED";

          // Find next tier that has this service included (for upgrade hint)
          const nextTierWithService = isNotIncluded
            ? tiers.slice(tierIdx + 1).find((t) => {
                const sl = getServiceLevelForTier(service.id, t);
                return sl && sl.level === "INCLUDED";
              })
            : null;

          return (
            <td
              key={tier.id}
              className={`matrix__level-cell ${
                isSelected ? "matrix__level-cell--selected" : ""
              } ${tierIdx === selectedTierIdx ? "matrix__level-cell--highlight" : ""} ${
                isNotIncluded ? "matrix__level-cell--not-included" : ""
              }`}
              onClick={() =>
                setSelectedCell(
                  isSelected
                    ? null
                    : { serviceId: service.id, tierId: tier.id },
                )
              }
            >
              <span
                className={`matrix__level-value ${isNotIncluded ? "matrix__level-value--not-included" : ""}`}
                style={{ color: display.color }}
              >
                {display.label}
              </span>
              {/* Loss Aversion: Show upgrade hint for NOT_INCLUDED */}
              {isNotIncluded && nextTierWithService && (
                <span className="matrix__upgrade-hint">
                  In {nextTierWithService.name} →
                </span>
              )}
            </td>
          );
        })}
      </tr>

      {metrics.map((metric) => (
        <tr
          key={`${service.id}-${metric}`}
          className={`matrix__metric-row ${rowClass}`}
          onClick={() => onEditMetric(service.id, metric)}
        >
          <td className={`matrix__metric-cell ${rowClass}`}>
            <div className="matrix__metric-name-wrapper">
              <span className="matrix__metric-name">{metric}</span>
              <div className="matrix__metric-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMetric(service.id, metric);
                  }}
                  className="matrix__metric-btn matrix__metric-btn--edit"
                  title="Edit metric"
                >
                  <svg
                    className="matrix__metric-btn-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMetric(service.id, metric);
                  }}
                  className="matrix__metric-btn matrix__metric-btn--remove"
                  title="Remove metric"
                >
                  <svg
                    className="matrix__metric-btn-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </td>
          {tiers.map((tier, tierIdx) => {
            const usageLimit = getUsageLimitForMetric(service.id, metric, tier);

            return (
              <td
                key={tier.id}
                className={`matrix__metric-value-cell ${
                  tierIdx === selectedTierIdx
                    ? "matrix__level-cell--highlight"
                    : ""
                }`}
              >
                <div className="matrix__metric-card">
                  {usageLimit ? (
                    <>
                      <div className="matrix__metric-card-row">
                        <span className="matrix__metric-card-label">
                          Included
                        </span>
                        <span className="matrix__metric-card-value">
                          {usageLimit.freeLimit != null ? (
                            <>
                              <strong>
                                {usageLimit.freeLimit}
                                {usageLimit.unitName
                                  ? ` ${usageLimit.unitName}`
                                  : ""}
                              </strong>
                              {usageLimit.resetCycle &&
                                usageLimit.resetCycle !== "NONE" && (
                                  <span className="matrix__metric-card-cycle">
                                    {" "}
                                    / {usageLimit.resetCycle.toLowerCase()}
                                  </span>
                                )}
                            </>
                          ) : (
                            <strong>{usageLimit.notes || "Unlimited"}</strong>
                          )}
                        </span>
                      </div>
                      {usageLimit.unitPrice != null && (
                        <div className="matrix__metric-card-row matrix__metric-card-row--overage">
                          <span className="matrix__metric-card-label">
                            Overage
                          </span>
                          <span className="matrix__metric-card-value matrix__metric-card-value--overage">
                            {formatPrice(
                              usageLimit.unitPrice,
                              usageLimit.unitPriceCurrency || "USD",
                            )}
                            <span className="matrix__metric-card-cycle">
                              {" "}
                              / extra
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="matrix__metric-empty">—</span>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

interface ServiceLevelDetailPanelProps {
  serviceId: string;
  tierId: string;
  services: Service[];
  tiers: ServiceSubscriptionTier[];
  optionGroups: OptionGroup[];
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onClose: () => void;
}

function ServiceLevelDetailPanel({
  serviceId,
  tierId,
  services,
  tiers,
  optionGroups: _optionGroups,
  dispatch,
  onClose,
}: ServiceLevelDetailPanelProps) {
  const service = services.find((s) => s.id === serviceId);
  const tier = tiers.find((t) => t.id === tierId);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Scroll lock when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus trap - keep focus inside the panel
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, []);

  // Click outside to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const serviceLevel = service
    ? tier?.serviceLevels.find((sl) => sl.serviceId === serviceId)
    : undefined;
  const usageLimits = service
    ? tier?.usageLimits.filter((ul) => ul.serviceId === serviceId) || []
    : [];

  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetric, setNewMetric] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [customValue, setCustomValue] = useState(
    serviceLevel?.customValue || "",
  );

  if (!service || !tier) return null;

  const handleAddLimit = () => {
    if (!newMetric.trim()) return;
    const parsedLimit = newLimit ? parseInt(newLimit, 10) : null;
    const isNumeric = parsedLimit !== null && !isNaN(parsedLimit);
    dispatch(
      addUsageLimit({
        tierId: tier.id,
        limitId: generateId(),
        serviceId: service.id,
        metric: newMetric.trim(),
        freeLimit: isNumeric ? parsedLimit : undefined,
        notes: !isNumeric && newLimit ? newLimit.trim() : undefined,
        resetCycle: "MONTHLY",
        lastModified: new Date().toISOString(),
      }),
    );
    setNewMetric("");
    setNewLimit("");
    setIsAddingMetric(false);
  };

  const handleRemoveLimit = (limitId: string) => {
    dispatch(
      removeUsageLimit({
        tierId: tier.id,
        limitId,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  return (
    <div
      ref={overlayRef}
      className="matrix__panel-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      <div ref={panelRef} className="matrix__panel">
        <div className="matrix__panel-header">
          <div className="matrix__panel-header-top">
            <span className="matrix__panel-tier">{tier.name} Tier</span>
            <button onClick={onClose} className="matrix__panel-close">
              <svg
                className="matrix__panel-close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <h3 id="panel-title" className="matrix__panel-title">
            {service.title}
          </h3>
        </div>

        <div className="matrix__panel-body">
          <div>
            <div className="matrix__panel-limits-header">
              <label
                className="matrix__panel-section-label"
                style={{ marginBottom: 0 }}
              >
                Metrics
              </label>
              <button
                onClick={() => setIsAddingMetric(true)}
                className="matrix__panel-add-btn"
              >
                + Add Metric
              </button>
            </div>

            {usageLimits.map((limit) => (
              <MetricLimitItem
                key={limit.id}
                limit={limit}
                tierId={tier.id}
                dispatch={dispatch}
                onRemove={() => handleRemoveLimit(limit.id)}
              />
            ))}

            {usageLimits.length === 0 && !isAddingMetric && (
              <p className="matrix__panel-empty-text">
                No metrics added yet. Metrics will appear as nested rows under
                this service in the matrix.
              </p>
            )}

            {isAddingMetric && (
              <div className="matrix__panel-edit-form">
                <div>
                  <label className="matrix__panel-edit-label">
                    Metric Name
                  </label>
                  <input
                    type="text"
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                    placeholder="e.g., API Calls, Storage, Users"
                    className="matrix__panel-input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="matrix__panel-edit-label">Value</label>
                  <input
                    type="text"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder="e.g., 100, Unlimited, Custom"
                    className="matrix__panel-input"
                  />
                  <p className="matrix__panel-edit-hint">
                    Enter a value or leave empty
                  </p>
                </div>
                <div className="matrix__panel-edit-actions">
                  <button
                    onClick={handleAddLimit}
                    disabled={!newMetric.trim()}
                    className="matrix__panel-edit-btn matrix__panel-edit-btn--primary"
                  >
                    Add Metric
                  </button>
                  <button
                    onClick={() => {
                      setNewMetric("");
                      setNewLimit("");
                      setIsAddingMetric(false);
                    }}
                    className="matrix__panel-edit-btn matrix__panel-edit-btn--secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="matrix__panel-footer">
          <button onClick={onClose} className="matrix__panel-done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricLimitItemProps {
  limit: ServiceUsageLimit;
  tierId: string;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
  onRemove: () => void;
}

function MetricLimitItem({
  limit,
  tierId,
  dispatch,
  onRemove,
}: MetricLimitItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMetric, setEditMetric] = useState(limit.metric);
  const [editUnitName, setEditUnitName] = useState(limit.unitName || "");
  const [editLimit, setEditLimit] = useState(
    limit.freeLimit?.toString() || limit.notes || "",
  );
  const [editPaidLimit, setEditPaidLimit] = useState(
    limit.paidLimit?.toString() || "",
  );
  const [editResetCycle, setEditResetCycle] = useState<UsageResetCycle>(
    limit.resetCycle || "MONTHLY",
  );
  // Overage pricing state
  const [editUnitPrice, setEditUnitPrice] = useState(
    limit.unitPrice?.toString() || "",
  );
  const [editUnitPriceCurrency] = useState(limit.unitPriceCurrency || "USD");

  const handleSave = () => {
    const parsedLimit = editLimit ? parseInt(editLimit, 10) : null;
    const isNumeric = parsedLimit !== null && !isNaN(parsedLimit);
    const parsedPaidLimit = editPaidLimit ? parseInt(editPaidLimit, 10) : null;
    const isPaidNumeric = parsedPaidLimit !== null && !isNaN(parsedPaidLimit);
    const parsedUnitPrice = editUnitPrice ? parseFloat(editUnitPrice) : null;
    dispatch(
      updateUsageLimit({
        tierId,
        limitId: limit.id,
        metric: editMetric.trim() || limit.metric,
        unitName: editUnitName.trim() || undefined,
        freeLimit: isNumeric ? parsedLimit : undefined,
        paidLimit: isPaidNumeric ? parsedPaidLimit : undefined,
        notes: !isNumeric && editLimit ? editLimit.trim() : undefined,
        resetCycle: editResetCycle,
        unitPrice: parsedUnitPrice,
        unitPriceCurrency: parsedUnitPrice ? editUnitPriceCurrency : undefined,
        lastModified: new Date().toISOString(),
      }),
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditMetric(limit.metric);
    setEditUnitName(limit.unitName || "");
    setEditLimit(limit.freeLimit?.toString() || limit.notes || "");
    setEditPaidLimit(limit.paidLimit?.toString() || "");
    setEditResetCycle(limit.resetCycle || "MONTHLY");
    setEditUnitPrice(limit.unitPrice?.toString() || "");
    setIsEditing(false);
  };

  // Format overage display string
  const getOverageDisplay = () => {
    if (!limit.unitPrice) return null;
    const unitLabel = limit.unitName || "unit";
    return `+${formatPrice(limit.unitPrice, limit.unitPriceCurrency || "USD")} per ${unitLabel}`;
  };

  const overageDisplay = getOverageDisplay();

  if (isEditing) {
    return (
      <div className="matrix__panel-edit-form">
        <div>
          <label className="matrix__panel-edit-label">Metric Name</label>
          <input
            type="text"
            value={editMetric}
            onChange={(e) => setEditMetric(e.target.value)}
            placeholder="e.g., Number of Entities"
            className="matrix__panel-input"
            autoFocus
          />
        </div>
        <div>
          <label className="matrix__panel-edit-label">Unit Name</label>
          <input
            type="text"
            value={editUnitName}
            onChange={(e) => setEditUnitName(e.target.value)}
            placeholder="e.g., entity, credit card, contractor"
            className="matrix__panel-input"
          />
          <p className="matrix__panel-edit-hint">
            Used for overage pricing display (e.g., "$50 per entity")
          </p>
        </div>
        <div>
          <label className="matrix__panel-edit-label">Free Limit</label>
          <input
            type="text"
            value={editLimit}
            onChange={(e) => setEditLimit(e.target.value)}
            placeholder="e.g., 100, Unlimited, Custom"
            className="matrix__panel-input"
          />
          <p className="matrix__panel-edit-hint">
            Included free limit for this tier
          </p>
        </div>
        <div>
          <label className="matrix__panel-edit-label">Paid Limit</label>
          <input
            type="text"
            value={editPaidLimit}
            onChange={(e) => setEditPaidLimit(e.target.value)}
            placeholder="e.g., 500, 1000"
            className="matrix__panel-input"
          />
          <p className="matrix__panel-edit-hint">
            Maximum paid usage beyond the free limit (optional)
          </p>
        </div>
        <div>
          <label className="matrix__panel-edit-label">Reset Cycle</label>
          <select
            value={editResetCycle}
            onChange={(e) =>
              setEditResetCycle(e.target.value as UsageResetCycle)
            }
            className="matrix__panel-input"
            style={{ cursor: "pointer" }}
          >
            <option value="NONE">None (One-time)</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
        <div className="matrix__panel-overage-section">
          <label className="matrix__panel-edit-label">
            Overage Pricing (Optional)
          </label>
          <p
            className="matrix__panel-edit-hint"
            style={{ marginBottom: "0.5rem" }}
          >
            Set a price for usage beyond the included limit
          </p>
          <div className="matrix__panel-overage-row">
            <div className="matrix__panel-overage-price">
              <span className="matrix__panel-overage-currency">$</span>
              <input
                type="number"
                value={editUnitPrice}
                onChange={(e) => setEditUnitPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="matrix__panel-overage-input"
              />
            </div>
            <span className="matrix__panel-overage-label">
              per {editUnitName || "unit"}
            </span>
          </div>
        </div>
        <div className="matrix__panel-edit-actions">
          <button
            onClick={handleSave}
            className="matrix__panel-edit-btn matrix__panel-edit-btn--primary"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="matrix__panel-edit-btn matrix__panel-edit-btn--secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="matrix__panel-limit-item">
      <div
        className="matrix__panel-limit-content"
        onClick={() => setIsEditing(true)}
      >
        <div className="matrix__panel-limit-metric">{limit.metric}</div>
        <div className="matrix__panel-limit-value-group">
          <div className="matrix__panel-limit-value">
            {limit.freeLimit != null
              ? `Free: ${limit.freeLimit}${limit.paidLimit != null ? ` / Paid: ${limit.paidLimit}` : ""}`
              : (limit.notes ?? "—")}
          </div>
          {limit.resetCycle && (
            <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
              Resets {limit.resetCycle.toLowerCase()}
            </div>
          )}
          {overageDisplay && (
            <div className="matrix__panel-limit-overage">{overageDisplay}</div>
          )}
        </div>
      </div>
      <div className="matrix__panel-limit-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="matrix__panel-limit-btn matrix__panel-limit-btn--edit"
          title="Edit metric"
        >
          <svg
            className="matrix__panel-limit-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
        <button
          onClick={onRemove}
          className="matrix__panel-limit-btn matrix__panel-limit-btn--remove"
          title="Remove metric"
        >
          <svg
            className="matrix__panel-limit-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
