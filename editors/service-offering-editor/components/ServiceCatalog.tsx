import { useState, useMemo, useEffect } from "react";
import { generateId } from "document-model/core";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type {
  ServiceOfferingDocument,
  ServiceOfferingAction,
  Service,
  OptionGroup,
  BillingCycle,
  GroupCostType,
  DiscountType,
} from "@powerhousedao/service-offering/document-models/service-offering";
import {
  BILLING_CYCLE_SHORT_LABELS,
  BILLING_CYCLE_MONTHS,
  formatPrice,
  calculateEffectiveSetupPrice,
} from "./pricing-utils.js";
import {
  addService,
  updateService,
  deleteService,
  addOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  addServiceLevel,
  removeServiceLevel,
  setOptionGroupStandalonePricing,
  addOptionGroupTierPricing,
  updateOptionGroupTierPricing,
} from "../../../document-models/service-offering/gen/creators.js";
import { InfoIcon } from "./InfoIcon.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

// Service Templates - Common services to reduce friction (Default Effect + Reduced Activation Energy)
interface ServiceTemplate {
  title: string;
  description: string;
  category: "setup" | "recurring" | "addon";
  icon: string;
}

const SERVICE_TEMPLATES: Record<string, ServiceTemplate[]> = {
  "Setup & Formation": [
    {
      title: "Swiss association entity",
      description: "Legal entity formation as a Swiss association",
      category: "setup",
      icon: "🏛️",
    },
    {
      title: "Registered address (Zug)",
      description: "Official registered address in Zug, Switzerland",
      category: "setup",
      icon: "📍",
    },
    {
      title: "Legal document templates",
      description: "Access to standardized legal document templates",
      category: "setup",
      icon: "📋",
    },
  ],
  "Operations & Finance": [
    {
      title: "Invoice management",
      description: "Professional invoice processing and management",
      category: "recurring",
      icon: "📄",
    },
    {
      title: "Annual tax filing",
      description: "Yearly tax preparation and filing services",
      category: "recurring",
      icon: "💰",
    },
    {
      title: "Monthly accounting & close",
      description: "Monthly bookkeeping and financial close",
      category: "recurring",
      icon: "📊",
    },
  ],
  "Contributor & Payments": [
    {
      title: "Contributor operations",
      description: "Management of contributor payments and operations",
      category: "recurring",
      icon: "👥",
    },
    {
      title: "Multi-currency payouts",
      description: "Support for payments in multiple currencies",
      category: "recurring",
      icon: "💱",
    },
    {
      title: "Multiple entities",
      description: "Support for managing multiple legal entities",
      category: "recurring",
      icon: "🏢",
    },
  ],
  "Support & Advisory": [
    {
      title: "Dedicated ops support",
      description: "Dedicated operations support team",
      category: "addon",
      icon: "🎯",
    },
    {
      title: "Dedicated account manager",
      description: "Personal point of contact for all needs",
      category: "addon",
      icon: "👤",
    },
  ],
};
import type { ServiceSubscriptionTier } from "../../../document-models/service-offering/gen/schema/types.js";
import "./ServiceCatalog.css";

interface ServiceCatalogProps {
  document: ServiceOfferingDocument;
  dispatch: DocumentDispatch<ServiceOfferingAction>;
}

export function ServiceCatalog({ document, dispatch }: ServiceCatalogProps) {
  const { state } = document;
  const services = state.global.services ?? [];
  const optionGroups = state.global.optionGroups ?? [];
  const tiers = state.global.tiers ?? [];

  // Local UI state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({ title: "", description: "" });
  const [selectedTierIds, setSelectedTierIds] = useState<Set<string>>(
    new Set(),
  );

  // Edit group modal state
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupType, setEditGroupType] = useState<
    "setup" | "recurring" | "addon"
  >("recurring");
  const [editGroupPrice, setEditGroupPrice] = useState("");
  const [editGroupBillingCycles, setEditGroupBillingCycles] = useState<
    BillingCycle[]
  >(["MONTHLY"]);
  const [editGroupPricingMode, setEditGroupPricingMode] = useState<
    "STANDALONE" | "TIER_DEPENDENT" | null
  >(null);
  const [editGroupSetupCost, setEditGroupSetupCost] = useState("");
  const [editGroupBasePrice, setEditGroupBasePrice] = useState("");
  const [editGroupDiscounts, setEditGroupDiscounts] = useState<
    Record<BillingCycle, string>
  >({
    MONTHLY: "",
    QUARTERLY: "",
    SEMI_ANNUAL: "",
    ANNUAL: "",
    ONE_TIME: "",
  });

  // Per-tier pricing state for edit modal
  const [editTierTab, setEditTierTab] = useState<string | null>(null);
  const [editTierPrices, setEditTierPrices] = useState<Record<string, string>>(
    {},
  );
  const [editTierSetupCosts, setEditTierSetupCosts] = useState<
    Record<string, string>
  >({});
  const [editTierDiscounts, setEditTierDiscounts] = useState<
    Record<string, Record<BillingCycle, string>>
  >({});

  // Per-tier setup fee discounts: tierId → billingCycle → { discountType, discountValue }
  const [editSetupTierDiscounts, setEditSetupTierDiscounts] = useState<
    Record<
      string,
      Record<
        BillingCycle,
        { discountType: DiscountType; discountValue: string }
      >
    >
  >({});

  // Service templates quick-add state
  const [showServiceTemplates, setShowServiceTemplates] = useState(false);

  // Destructive action confirmation state
  const [pendingDeleteGroupId, setPendingDeleteGroupId] = useState<
    string | null
  >(null);
  const [pendingDeleteServiceId, setPendingDeleteServiceId] = useState<
    string | null
  >(null);

  // Get services that belong to a specific group (via service.optionGroupId)
  const getServicesForGroup = (groupId: string): Service[] => {
    return services.filter((s) => s.optionGroupId === groupId);
  };

  // Get ungrouped services (services without an optionGroupId)
  const ungroupedServices = useMemo(() => {
    return services.filter((s) => !s.optionGroupId);
  }, [services]);

  // Categorize option groups based on schema costType
  const setupGroups = useMemo(() => {
    return optionGroups.filter((g) => g.costType === "SETUP");
  }, [optionGroups]);

  const regularGroups = useMemo(() => {
    return optionGroups.filter((g) => g.costType !== "SETUP" && !g.isAddOn);
  }, [optionGroups]);

  const addonGroups = useMemo(() => {
    return optionGroups.filter((g) => g.isAddOn);
  }, [optionGroups]);

  const handleAddNewGroup = () => {
    const groupId = generateId();
    const inheritedCycles: BillingCycle[] =
      state.global.availableBillingCycles?.length > 0
        ? [...state.global.availableBillingCycles]
        : ["MONTHLY"];

    dispatch(
      addOptionGroup({
        id: groupId,
        name: "New Group",
        isAddOn: false,
        defaultSelected: true,
        costType: "RECURRING" as GroupCostType,
        availableBillingCycles: inheritedCycles,
        lastModified: new Date().toISOString(),
      }),
    );

    // Construct minimal group shape to open Edit modal immediately
    // (handleOpenEditGroup reads from the group object, not from state)
    const newGroup = {
      id: groupId,
      name: "New Group",
      isAddOn: false,
      defaultSelected: true,
      costType: "RECURRING",
      availableBillingCycles: inheritedCycles,
      price: null,
      pricingMode: null,
      standalonePricing: null,
      tierDependentPricing: [],
      billingCycleDiscounts: [],
      services: [],
    } as unknown as OptionGroup;

    handleOpenEditGroup(newGroup);
    setSelectedGroupId(groupId);
  };

  const handleDeleteGroup = (groupId: string) => {
    setPendingDeleteGroupId(groupId);
  };

  const confirmDeleteGroup = () => {
    if (!pendingDeleteGroupId) return;
    dispatch(
      deleteOptionGroup({
        id: pendingDeleteGroupId,
        lastModified: new Date().toISOString(),
      }),
    );
    if (selectedGroupId === pendingDeleteGroupId) {
      setSelectedGroupId(null);
    }
    setPendingDeleteGroupId(null);
  };

  const handleOpenEditGroup = (group: OptionGroup) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    const groupType =
      group.costType === "SETUP"
        ? "setup"
        : group.isAddOn
          ? "addon"
          : "recurring";
    setEditGroupType(groupType);
    setEditGroupPrice(group.price?.toString() || "");

    // Initialize per-tier setup fee discounts from tier-dependent pricing
    const SUBSCRIPTION_CYCLES: BillingCycle[] = [
      "MONTHLY",
      "QUARTERLY",
      "SEMI_ANNUAL",
      "ANNUAL",
    ];
    const setupTierDiscounts: Record<
      string,
      Record<
        BillingCycle,
        { discountType: DiscountType; discountValue: string }
      >
    > = {};
    for (const tier of tiers) {
      const emptyDiscounts = Object.fromEntries(
        SUBSCRIPTION_CYCLES.map((c) => [
          c,
          { discountType: "PERCENTAGE" as DiscountType, discountValue: "" },
        ]),
      ) as Record<
        BillingCycle,
        { discountType: DiscountType; discountValue: string }
      >;
      const tierPricingEntry = group.tierDependentPricing?.find(
        (tp) => tp.tierId === tier.id,
      );
      if (tierPricingEntry?.setupCostDiscounts) {
        tierPricingEntry.setupCostDiscounts.forEach((d) => {
          if (d.billingCycle && d.discountRule) {
            emptyDiscounts[d.billingCycle] = {
              discountType: d.discountRule.discountType,
              discountValue: d.discountRule.discountValue?.toString() || "",
            };
          }
        });
      }
      setupTierDiscounts[tier.id] = emptyDiscounts;
    }
    setEditSetupTierDiscounts(setupTierDiscounts);

    setEditGroupBillingCycles(
      group.availableBillingCycles?.length > 0
        ? group.availableBillingCycles
        : ["MONTHLY"],
    );

    // Determine pricing mode: regular groups always per-tier, add-ons use their mode
    const isRegular = groupType === "recurring";
    if (isRegular && tiers.length > 0) {
      setEditGroupPricingMode("TIER_DEPENDENT");
    } else if (group.isAddOn) {
      setEditGroupPricingMode(group.pricingMode || "STANDALONE");
    } else {
      setEditGroupPricingMode("STANDALONE");
    }

    // Initialize standalone pricing (for add-ons in STANDALONE mode or fallback)
    setEditGroupSetupCost(
      group.standalonePricing?.setupCost?.amount?.toString() || "",
    );
    const monthlyPricing = group.standalonePricing?.recurringPricing?.find(
      (p) => p.billingCycle === "MONTHLY",
    );
    setEditGroupBasePrice(monthlyPricing?.amount?.toString() || "");

    // Initialize per-group billing cycle discounts (flat amount only)
    const discounts: Record<BillingCycle, string> = {
      MONTHLY: "",
      QUARTERLY: "",
      SEMI_ANNUAL: "",
      ANNUAL: "",
      ONE_TIME: "",
    };
    group.billingCycleDiscounts?.forEach((d) => {
      if (d.billingCycle && d.discountRule?.discountValue) {
        discounts[d.billingCycle] = d.discountRule.discountValue.toString();
      }
    });
    setEditGroupDiscounts(discounts);

    // Initialize per-tier pricing state
    const tierPrices: Record<string, string> = {};
    const tierSetupCosts: Record<string, string> = {};
    const tierDiscounts: Record<string, Record<BillingCycle, string>> = {};

    for (const tier of tiers) {
      const tierPricingEntry = group.tierDependentPricing?.find(
        (tp) => tp.tierId === tier.id,
      );
      const tierMonthlyPricing = tierPricingEntry?.recurringPricing?.find(
        (p) => p.billingCycle === "MONTHLY",
      );
      // If no tier pricing exists but group has standalone pricing, use standalone as starting point
      if (tierPricingEntry) {
        tierPrices[tier.id] = tierMonthlyPricing?.amount?.toString() || "";
        tierSetupCosts[tier.id] =
          tierPricingEntry.setupCost?.amount?.toString() || "";
      } else if (monthlyPricing) {
        // Pre-fill from standalone as migration aid
        tierPrices[tier.id] = monthlyPricing.amount?.toString() || "";
        tierSetupCosts[tier.id] =
          group.standalonePricing?.setupCost?.amount?.toString() || "";
      } else {
        tierPrices[tier.id] = "";
        tierSetupCosts[tier.id] = "";
      }

      // Per-tier discounts: populate from tierDependentPricing[].recurringPricing[].discount
      const tierDiscountValues: Record<BillingCycle, string> = {
        MONTHLY: "",
        QUARTERLY: "",
        SEMI_ANNUAL: "",
        ANNUAL: "",
        ONE_TIME: "",
      };
      if (tierPricingEntry) {
        tierPricingEntry.recurringPricing?.forEach((rp) => {
          if (rp.discount && rp.discount.discountValue > 0) {
            tierDiscountValues[rp.billingCycle] =
              rp.discount.discountValue.toString();
          }
        });
      }
      tierDiscounts[tier.id] = tierDiscountValues;
    }

    setEditTierPrices(tierPrices);
    setEditTierSetupCosts(tierSetupCosts);
    setEditTierDiscounts(tierDiscounts);
    setEditTierTab(tiers.length > 0 ? tiers[0].id : null);
  };

  const handleSaveGroupEdit = () => {
    if (!editingGroup || !editGroupName.trim()) return;

    const isSetup = editGroupType === "setup";
    const isAddOn = editGroupType === "addon";
    const costType: GroupCostType = isSetup ? "SETUP" : "RECURRING";
    const price = editGroupPrice ? parseFloat(editGroupPrice) : null;

    // Update the option group in the document
    dispatch(
      updateOptionGroup({
        id: editingGroup.id,
        name: editGroupName.trim(),
        isAddOn,
        defaultSelected: !isAddOn,
        costType,
        availableBillingCycles: isSetup ? ["ONE_TIME"] : editGroupBillingCycles,
        price: price ?? undefined,
        currency: price ? "USD" : undefined,
        lastModified: new Date().toISOString(),
      }),
    );

    // Save setup pricing: base cost via standalone, per-tier discounts via tier pricing
    if (isSetup && price && price > 0) {
      const now = new Date().toISOString();
      // Store base setup cost via standalone pricing
      dispatch(
        setOptionGroupStandalonePricing({
          optionGroupId: editingGroup.id,
          setupCost: { amount: price, currency: "USD" },
          recurringPricing: [],
          lastModified: now,
        }),
      );

      // Store per-tier setup fee discounts
      for (const tier of tiers) {
        if (tier.isCustomPricing) continue;
        const tierDiscountEntries = editSetupTierDiscounts[tier.id];
        const setupCostDiscounts = Object.entries(tierDiscountEntries || {})
          .filter(([, d]) => parseFloat(d.discountValue) > 0)
          .map(([cycle, d]) => ({
            billingCycle: cycle as BillingCycle,
            discountRule: {
              discountType: "PERCENTAGE" as const,
              discountValue: parseFloat(d.discountValue),
            },
          }));

        const existingTierPricing = editingGroup.tierDependentPricing?.find(
          (tp) => tp.tierId === tier.id,
        );
        if (existingTierPricing) {
          dispatch(
            updateOptionGroupTierPricing({
              optionGroupId: editingGroup.id,
              tierId: tier.id,
              setupCost: { amount: price, currency: "USD" },
              setupCostDiscounts,
              recurringPricing: [],
              lastModified: now,
            }),
          );
        } else {
          dispatch(
            addOptionGroupTierPricing({
              optionGroupId: editingGroup.id,
              tierPricingId: generateId(),
              tierId: tier.id,
              setupCost: { amount: price, currency: "USD" },
              setupCostDiscounts,
              recurringPricing: [],
              lastModified: now,
            }),
          );
        }
      }
    }

    // Save pricing based on mode
    if (!isSetup && editGroupPricingMode === "TIER_DEPENDENT") {
      // Per-tier pricing: dispatch addOptionGroupTierPricing or updateOptionGroupTierPricing per tier
      const now = new Date().toISOString();
      for (const tier of tiers) {
        if (tier.isCustomPricing) continue; // Skip custom tiers

        const baseMonthly = parseFloat(editTierPrices[tier.id]) || 0;
        const setupCostVal = parseFloat(editTierSetupCosts[tier.id]) || 0;
        const setupCost =
          setupCostVal > 0
            ? { amount: setupCostVal, currency: "USD" as const }
            : undefined;

        const recurringPricing = editGroupBillingCycles
          .filter(() => baseMonthly > 0)
          .map((cycle) => {
            const discountPct =
              parseFloat(editTierDiscounts[tier.id]?.[cycle] || "0") || 0;
            return {
              id: generateId(),
              billingCycle: cycle,
              amount: baseMonthly,
              currency: "USD" as const,
              discount:
                discountPct > 0
                  ? {
                      discountType: "PERCENTAGE" as const,
                      discountValue: discountPct,
                    }
                  : undefined,
            };
          });

        const existingTierPricing = editingGroup.tierDependentPricing?.find(
          (tp) => tp.tierId === tier.id,
        );

        if (existingTierPricing) {
          dispatch(
            updateOptionGroupTierPricing({
              optionGroupId: editingGroup.id,
              tierId: tier.id,
              setupCost,
              recurringPricing,
              lastModified: now,
            }),
          );
        } else {
          dispatch(
            addOptionGroupTierPricing({
              optionGroupId: editingGroup.id,
              tierPricingId: generateId(),
              tierId: tier.id,
              setupCost,
              recurringPricing,
              lastModified: now,
            }),
          );
        }
      }
    } else if (!isSetup && editGroupPricingMode === "STANDALONE") {
      // Standalone pricing (add-ons or groups with no tiers)
      const setupCost =
        editGroupSetupCost && parseFloat(editGroupSetupCost) > 0
          ? {
              amount: parseFloat(editGroupSetupCost),
              currency: "USD" as const,
            }
          : undefined;

      const baseMonthly = parseFloat(editGroupBasePrice) || 0;
      const recurringPricing = editGroupBillingCycles
        .filter(() => baseMonthly > 0)
        .map((cycle) => ({
          id: generateId(),
          billingCycle: cycle,
          amount: baseMonthly,
          currency: "USD" as const,
        }));

      const billingCycleDiscounts = editGroupBillingCycles
        .map((cycle) => {
          const discountPct = parseFloat(editGroupDiscounts[cycle]) || 0;
          return {
            billingCycle: cycle,
            discountRule: {
              discountType: "PERCENTAGE" as const,
              discountValue: discountPct,
            },
          };
        })
        .filter((d) => d.discountRule.discountValue > 0);

      dispatch(
        setOptionGroupStandalonePricing({
          optionGroupId: editingGroup.id,
          setupCost,
          recurringPricing,
          billingCycleDiscounts,
          lastModified: new Date().toISOString(),
        }),
      );
    }

    // Update all services in this group to reflect the new setup status
    const groupServices = getServicesForGroup(editingGroup.id);
    groupServices.forEach((service) => {
      if (service.isSetupFormation !== isSetup) {
        dispatch(
          updateService({
            id: service.id,
            isSetupFormation: isSetup,
            lastModified: new Date().toISOString(),
          }),
        );
      }
    });

    setEditingGroup(null);
  };

  const handleAddService = () => {
    if (!newService.title.trim()) return;

    const serviceId = generateId();
    const now = new Date().toISOString();

    // Determine if this is a setup service based on the selected group's costType
    const isSetupFormation = selectedGroup?.costType === "SETUP";

    // Add the service with optionGroupId directly on the service
    dispatch(
      addService({
        id: serviceId,
        title: newService.title.trim(),
        description: newService.description.trim() || undefined,
        isSetupFormation,
        optionGroupId: selectedGroupId || undefined,
        lastModified: now,
      }),
    );

    // Create ServiceLevelBindings for each selected tier
    selectedTierIds.forEach((tierId) => {
      dispatch(
        addServiceLevel({
          serviceLevelId: generateId(),
          serviceId,
          tierId,
          level: "INCLUDED",
          optionGroupId: selectedGroupId || undefined,
          lastModified: now,
        }),
      );
    });

    setNewService({ title: "", description: "" });
    setSelectedTierIds(new Set());
    setIsAddingService(false);
  };

  // Quick-add service from template (reduces activation energy)
  const handleAddFromTemplate = (template: ServiceTemplate) => {
    if (!selectedGroupId) return;

    const serviceId = generateId();
    const now = new Date().toISOString();

    const isSetupFormation = selectedGroup?.costType === "SETUP";

    dispatch(
      addService({
        id: serviceId,
        title: template.title,
        description: template.description,
        isSetupFormation,
        optionGroupId: selectedGroupId,
        lastModified: now,
      }),
    );

    // Auto-include in all tiers for convenience (can be changed later)
    tiers.forEach((tier) => {
      dispatch(
        addServiceLevel({
          serviceLevelId: generateId(),
          serviceId,
          tierId: tier.id,
          level: "INCLUDED",
          optionGroupId: selectedGroupId,
          lastModified: now,
        }),
      );
    });

    setShowServiceTemplates(false);
  };

  const handleUpdateService = (
    service: Service,
    updates: Partial<
      Pick<
        Service,
        "title" | "description" | "isSetupFormation" | "optionGroupId"
      >
    >,
  ) => {
    dispatch(
      updateService({
        id: service.id,
        ...updates,
        lastModified: new Date().toISOString(),
      }),
    );
  };

  const handleToggleTier = (
    serviceId: string,
    tierId: string,
    isIncluded: boolean,
  ) => {
    const now = new Date().toISOString();
    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) return;

    // Find existing service level binding for this service-tier combo
    const existingBinding = tier.serviceLevels.find(
      (sl) => sl.serviceId === serviceId,
    );

    if (isIncluded) {
      // Add or update service level binding
      if (existingBinding) {
        // Service level exists, might need to update it if level changed
        // (for now we just use INCLUDED)
      } else {
        // Create new service level binding
        const service = services.find((s) => s.id === serviceId);
        dispatch(
          addServiceLevel({
            serviceLevelId: generateId(),
            serviceId,
            tierId,
            level: "INCLUDED",
            optionGroupId: service?.optionGroupId || undefined,
            lastModified: now,
          }),
        );
      }
    } else {
      // Remove service level binding
      if (existingBinding) {
        dispatch(
          removeServiceLevel({
            serviceLevelId: existingBinding.id,
            tierId,
            lastModified: now,
          }),
        );
      }
    }
  };

  const handleDeleteService = (serviceId: string) => {
    setPendingDeleteServiceId(serviceId);
  };

  const confirmDeleteService = () => {
    if (!pendingDeleteServiceId) return;
    dispatch(
      deleteService({
        id: pendingDeleteServiceId,
        lastModified: new Date().toISOString(),
      }),
    );
    setPendingDeleteServiceId(null);
  };

  // Get displayed services based on selection
  const displayedServices = useMemo(() => {
    if (selectedGroupId) {
      return getServicesForGroup(selectedGroupId);
    }
    return ungroupedServices;
  }, [selectedGroupId, services, ungroupedServices]);

  // Get selected group info
  const selectedGroup = selectedGroupId
    ? optionGroups.find((g) => g.id === selectedGroupId)
    : null;

  return (
    <>
      {/* Edit Group Modal */}
      {editingGroup && (
        <div
          className="catalog__modal-overlay"
          onClick={() => setEditingGroup(null)}
        >
          <div className="catalog__modal" onClick={(e) => e.stopPropagation()}>
            <div className="catalog__modal-header">
              <h3 className="catalog__modal-title">
                Edit Group
                <InfoIcon content="Standalone: same price for all tiers. Tier-Dependent: different price per tier. Choose Tier-Dependent when you want to offer volume discounts at higher tiers." />
              </h3>
              <button
                onClick={() => setEditingGroup(null)}
                className="catalog__modal-close"
                aria-label="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="catalog__modal-body">
              <div className="catalog__field">
                <label className="catalog__label">Group Name</label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="catalog__input"
                  autoFocus
                />
              </div>
              <div className="catalog__type-selector">
                <span className="catalog__type-label">Category</span>
                <div className="catalog__type-buttons">
                  {[
                    { type: "setup" as const, label: "Setup", color: "amber" },
                    {
                      type: "recurring" as const,
                      label: "Recurring",
                      color: "emerald",
                    },
                    {
                      type: "addon" as const,
                      label: "Add-on",
                      color: "violet",
                    },
                  ].map(({ type, label, color }) => (
                    <button
                      key={type}
                      onClick={() => setEditGroupType(type)}
                      className={`catalog__type-btn catalog__type-btn--${color} ${editGroupType === type ? "catalog__type-btn--active" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {editGroupType !== "setup" && (
                <div className="catalog__field">
                  <label className="catalog__label">
                    Available Billing Cycles
                  </label>
                  <div className="catalog__checkbox-group">
                    {(
                      Object.entries(BILLING_CYCLE_SHORT_LABELS) as [
                        BillingCycle,
                        string,
                      ][]
                    )
                      .filter(([value]) => value !== "ONE_TIME")
                      .map(([value, label]) => (
                        <label key={value} className="catalog__checkbox-label">
                          <input
                            type="checkbox"
                            checked={editGroupBillingCycles.includes(value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditGroupBillingCycles([
                                  ...editGroupBillingCycles,
                                  value,
                                ]);
                              } else {
                                setEditGroupBillingCycles(
                                  editGroupBillingCycles.filter(
                                    (c) => c !== value,
                                  ),
                                );
                              }
                            }}
                            className="catalog__checkbox"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Per-Tier Pricing (regular groups with tiers) */}
              {editGroupType === "recurring" &&
                editGroupPricingMode === "TIER_DEPENDENT" &&
                tiers.length > 0 && (
                  <>
                    {/* Tier Tab Bar */}
                    <div className="catalog__tier-tabs">
                      {tiers.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => setEditTierTab(tier.id)}
                          className={`catalog__tier-tab ${editTierTab === tier.id ? "catalog__tier-tab--active" : ""} ${tier.isCustomPricing ? "catalog__tier-tab--custom" : ""}`}
                        >
                          {tier.name}
                          {tier.isCustomPricing && (
                            <span className="catalog__tier-tab-badge">
                              Custom
                            </span>
                          )}
                          {!tier.isCustomPricing &&
                            editTierPrices[tier.id] &&
                            parseFloat(editTierPrices[tier.id]) > 0 && (
                              <span className="catalog__tier-tab-price">
                                {formatPrice(
                                  parseFloat(editTierPrices[tier.id]),
                                )}
                              </span>
                            )}
                          {!tier.isCustomPricing &&
                            (!editTierPrices[tier.id] ||
                              parseFloat(editTierPrices[tier.id]) <= 0) && (
                              <span className="catalog__tier-tab-warning">
                                $0
                              </span>
                            )}
                        </button>
                      ))}
                    </div>

                    {/* Active Tier Tab Content */}
                    {editTierTab &&
                      (() => {
                        const activeTier = tiers.find(
                          (t) => t.id === editTierTab,
                        );
                        if (!activeTier) return null;

                        // Custom tier: no price input
                        if (activeTier.isCustomPricing) {
                          return (
                            <div className="catalog__tier-custom-note">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                width="16"
                                height="16"
                              >
                                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>
                                Price negotiated per customer. No group-level
                                price input for custom tiers.
                              </span>
                            </div>
                          );
                        }

                        const tierBase =
                          parseFloat(editTierPrices[activeTier.id]) || 0;
                        const tierAmount = activeTier.pricing.amount ?? 0;

                        // Budget: sum of other groups' prices for this tier
                        const otherGroupsTotal = regularGroups
                          .filter(
                            (g) => editingGroup && g.id !== editingGroup.id,
                          )
                          .reduce((sum, g) => {
                            const tp = g.tierDependentPricing?.find(
                              (p) => p.tierId === activeTier.id,
                            );
                            const mp = tp?.recurringPricing?.find(
                              (p) => p.billingCycle === "MONTHLY",
                            );
                            if (mp) return sum + (mp.amount ?? 0);
                            // Fallback to standalone
                            const sp =
                              g.standalonePricing?.recurringPricing?.find(
                                (p) => p.billingCycle === "MONTHLY",
                              );
                            return sum + (sp?.amount ?? 0);
                          }, 0);
                        const projectedTotal = otherGroupsTotal + tierBase;

                        return (
                          <div className="catalog__tier-panel">
                            {/* Recurring Price for this tier */}
                            <div className="catalog__field">
                              <label className="catalog__label">
                                Recurring Price ({activeTier.name})
                              </label>
                              <div className="catalog__fee-input-wrapper">
                                <span className="catalog__fee-prefix">$</span>
                                <input
                                  type="number"
                                  value={editTierPrices[activeTier.id] || ""}
                                  onChange={(e) =>
                                    setEditTierPrices({
                                      ...editTierPrices,
                                      [activeTier.id]: e.target.value,
                                    })
                                  }
                                  placeholder="0.00"
                                  className="catalog__fee-input"
                                  step="0.01"
                                />
                              </div>
                            </div>

                            {/* Budget indicator — only in MANUAL_OVERRIDE mode (CALCULATED tier has no fixed budget) */}
                            {tierAmount > 0 &&
                              activeTier.pricingMode !== "CALCULATED" && (
                                <div className="catalog__tier-budget">
                                  <span className="catalog__tier-budget-title">
                                    {activeTier.name} budget:{" "}
                                    {formatPrice(projectedTotal)}/mo of{" "}
                                    {formatPrice(tierAmount)}/mo
                                  </span>
                                  <div className="catalog__tier-budget-row">
                                    <div className="catalog__tier-budget-bar">
                                      <div
                                        className={`catalog__tier-budget-fill ${projectedTotal > tierAmount ? "catalog__tier-budget-fill--over" : ""}`}
                                        style={{
                                          width: `${Math.min((projectedTotal / tierAmount) * 100, 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <span
                                      className={`catalog__tier-budget-amount ${projectedTotal > tierAmount ? "catalog__tier-budget-amount--over" : ""}`}
                                    >
                                      {formatPrice(projectedTotal)} /{" "}
                                      {formatPrice(tierAmount)}
                                      {projectedTotal > tierAmount && (
                                        <span className="catalog__tier-budget-warn">
                                          {" "}
                                          +
                                          {formatPrice(
                                            projectedTotal - tierAmount,
                                          )}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}

                            {/* Setup Cost for this tier */}
                            <div className="catalog__field">
                              <label className="catalog__label">
                                Setup Cost (one-time)
                              </label>
                              <div className="catalog__fee-input-wrapper">
                                <span className="catalog__fee-prefix">$</span>
                                <input
                                  type="number"
                                  value={
                                    editTierSetupCosts[activeTier.id] || ""
                                  }
                                  onChange={(e) =>
                                    setEditTierSetupCosts({
                                      ...editTierSetupCosts,
                                      [activeTier.id]: e.target.value,
                                    })
                                  }
                                  placeholder="0.00"
                                  className="catalog__fee-input"
                                  step="0.01"
                                />
                              </div>
                            </div>

                            {/* Billing Cycles & Discounts for this tier */}
                            {editGroupBillingCycles.length > 0 &&
                              tierBase > 0 && (
                                <div className="catalog__field">
                                  <label className="catalog__label">
                                    Billing Cycles & Discounts
                                  </label>
                                  <div className="catalog__addon-cycles">
                                    {editGroupBillingCycles.map((cycle) => {
                                      const months =
                                        BILLING_CYCLE_MONTHS[cycle];
                                      const total = tierBase * months;
                                      const isMonthly = cycle === "MONTHLY";
                                      const cycleLabel = {
                                        MONTHLY: "Monthly",
                                        QUARTERLY: "Quarterly",
                                        SEMI_ANNUAL: "Semi-Annual",
                                        ANNUAL: "Annual",
                                        ONE_TIME: "One-Time",
                                      }[cycle];

                                      // Percentage discount from user input (always editable)
                                      const discountPct =
                                        parseFloat(
                                          editTierDiscounts[activeTier.id]?.[
                                            cycle
                                          ] || "0",
                                        ) || 0;

                                      let effective: number | null = null;
                                      let savingsPct = 0;

                                      if (discountPct > 0) {
                                        effective =
                                          total * (1 - discountPct / 100);
                                        savingsPct = Math.round(discountPct);
                                      }

                                      return (
                                        <div
                                          key={cycle}
                                          className="catalog__addon-cycle-row catalog__addon-cycle-row--active"
                                        >
                                          <div className="catalog__addon-cycle-top">
                                            <span className="catalog__addon-cycle-label">
                                              {cycleLabel}
                                            </span>
                                            <span className="catalog__addon-cycle-total">
                                              {formatPrice(total, "USD")}
                                            </span>
                                          </div>
                                          {!isMonthly && (
                                            <div className="catalog__addon-cycle-detail">
                                              <div className="catalog__addon-cycle-calc">
                                                <span className="catalog__addon-cycle-calc-label">
                                                  Standard Price
                                                </span>
                                                <span className="catalog__addon-cycle-calc-formula">
                                                  ${tierBase} &times; {months}mo
                                                  <span className="catalog__addon-cycle-calc-result">
                                                    {formatPrice(total, "USD")}
                                                  </span>
                                                </span>
                                              </div>
                                              <div className="catalog__addon-cycle-discount-col">
                                                <span className="catalog__addon-cycle-calc-label">
                                                  Discount
                                                </span>
                                                <div className="catalog__discount-flat catalog__discount-flat--compact">
                                                  <input
                                                    type="number"
                                                    value={
                                                      editTierDiscounts[
                                                        activeTier.id
                                                      ]?.[cycle] || ""
                                                    }
                                                    onChange={(e) => {
                                                      const updated = {
                                                        ...editTierDiscounts,
                                                      };
                                                      updated[activeTier.id] = {
                                                        ...updated[
                                                          activeTier.id
                                                        ],
                                                        [cycle]: e.target.value,
                                                      };
                                                      setEditTierDiscounts(
                                                        updated,
                                                      );
                                                    }}
                                                    placeholder="0"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    className="catalog__discount-input"
                                                  />
                                                  <span className="catalog__discount-suffix">
                                                    %
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          {effective !== null && (
                                            <div className="catalog__addon-cycle-effective">
                                              <span className="catalog__addon-cycle-effective-arrow">
                                                &rarr;
                                              </span>
                                              <span className="catalog__addon-cycle-effective-price">
                                                {formatPrice(effective, "USD")}
                                              </span>
                                              {savingsPct > 0 && (
                                                <span className="catalog__addon-cycle-effective-savings">
                                                  {formatPrice(
                                                    total - effective,
                                                    "USD",
                                                  )}{" "}
                                                  off ({savingsPct}%)
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })()}
                  </>
                )}

              {/* Standalone Pricing (add-ons or groups without tiers) */}
              {editGroupType !== "setup" &&
                editGroupPricingMode === "STANDALONE" && (
                  <>
                    {/* Recurring Price (base monthly) */}
                    <div className="catalog__field">
                      <label className="catalog__label">Recurring Price</label>
                      <div className="catalog__fee-input-wrapper">
                        <span className="catalog__fee-prefix">$</span>
                        <input
                          type="number"
                          value={editGroupBasePrice}
                          onChange={(e) =>
                            setEditGroupBasePrice(e.target.value)
                          }
                          placeholder="0.00"
                          className="catalog__fee-input"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Setup Cost */}
                    <div className="catalog__field">
                      <label className="catalog__label">
                        Setup Cost (one-time)
                      </label>
                      <div className="catalog__fee-input-wrapper">
                        <span className="catalog__fee-prefix">$</span>
                        <input
                          type="number"
                          value={editGroupSetupCost}
                          onChange={(e) =>
                            setEditGroupSetupCost(e.target.value)
                          }
                          placeholder="0.00"
                          className="catalog__fee-input"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Billing Cycles & Discounts */}
                    {editGroupBillingCycles.length > 0 && (
                      <div className="catalog__field">
                        <label className="catalog__label">
                          Billing Cycles & Discounts
                        </label>
                        <div className="catalog__addon-cycles">
                          {editGroupBillingCycles.map((cycle) => {
                            const base = parseFloat(editGroupBasePrice) || 0;
                            const months = BILLING_CYCLE_MONTHS[cycle];
                            const total = base > 0 ? base * months : null;
                            const discountPct =
                              parseFloat(editGroupDiscounts[cycle]) || 0;
                            const effective =
                              total !== null && discountPct > 0
                                ? total * (1 - discountPct / 100)
                                : null;
                            const savingsPct = Math.round(discountPct);
                            const isMonthly = cycle === "MONTHLY";
                            const cycleLabel = {
                              MONTHLY: "Monthly",
                              QUARTERLY: "Quarterly",
                              SEMI_ANNUAL: "Semi-Annual",
                              ANNUAL: "Annual",
                              ONE_TIME: "One-Time",
                            }[cycle];
                            const shortLabel = `${months}mo`;

                            return (
                              <div
                                key={cycle}
                                className={`catalog__addon-cycle-row ${base > 0 ? "catalog__addon-cycle-row--active" : ""}`}
                              >
                                <div className="catalog__addon-cycle-top">
                                  <span className="catalog__addon-cycle-label">
                                    {cycleLabel}
                                  </span>
                                  {total !== null ? (
                                    <span className="catalog__addon-cycle-total">
                                      {formatPrice(total, "USD")}
                                    </span>
                                  ) : (
                                    <span className="catalog__addon-cycle-dash">
                                      --
                                    </span>
                                  )}
                                </div>
                                {base > 0 && (
                                  <div className="catalog__addon-cycle-detail">
                                    {!isMonthly && (
                                      <div className="catalog__addon-cycle-calc">
                                        <span className="catalog__addon-cycle-calc-label">
                                          Standard Price
                                        </span>
                                        <span className="catalog__addon-cycle-calc-formula">
                                          ${base} &times; {shortLabel}
                                          <span className="catalog__addon-cycle-calc-result">
                                            {formatPrice(total ?? 0, "USD")}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                    <div className="catalog__addon-cycle-discount-col">
                                      <span className="catalog__addon-cycle-calc-label">
                                        Discount
                                      </span>
                                      <div className="catalog__discount-flat catalog__discount-flat--compact">
                                        <input
                                          type="number"
                                          value={editGroupDiscounts[cycle]}
                                          onChange={(e) =>
                                            setEditGroupDiscounts({
                                              ...editGroupDiscounts,
                                              [cycle]: e.target.value,
                                            })
                                          }
                                          placeholder="0"
                                          step="0.1"
                                          min="0"
                                          max="100"
                                          className="catalog__discount-input"
                                        />
                                        <span className="catalog__discount-suffix">
                                          %
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {effective !== null && discountPct > 0 && (
                                  <div className="catalog__addon-cycle-effective">
                                    <span className="catalog__addon-cycle-effective-arrow">
                                      &rarr;
                                    </span>
                                    <span className="catalog__addon-cycle-effective-price">
                                      {formatPrice(effective, "USD")}
                                    </span>
                                    {savingsPct > 0 && (
                                      <span className="catalog__addon-cycle-effective-savings">
                                        {savingsPct}% off
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

              {editGroupType === "setup" && (
                <>
                  <div className="catalog__fee-field">
                    <span className="catalog__fee-label">One-time Fee</span>
                    <div className="catalog__fee-input-wrapper">
                      <span className="catalog__fee-prefix">$</span>
                      <input
                        type="number"
                        value={editGroupPrice}
                        onChange={(e) => setEditGroupPrice(e.target.value)}
                        placeholder="0"
                        className="catalog__fee-input"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Per-tier setup fee discounts */}
                  {tiers.length > 0 && parseFloat(editGroupPrice) > 0 && (
                    <div className="catalog__setup-tier-discounts">
                      <span className="catalog__fee-label">
                        Setup Fee Discounts by Tier & Billing Cycle
                      </span>
                      <div className="catalog__tier-tabs">
                        {tiers.map((tier) => (
                          <button
                            key={tier.id}
                            onClick={() => setEditTierTab(tier.id)}
                            className={`catalog__tier-tab ${editTierTab === tier.id ? "catalog__tier-tab--active" : ""} ${tier.isCustomPricing ? "catalog__tier-tab--custom" : ""}`}
                          >
                            {tier.name}
                            {tier.isCustomPricing && (
                              <span className="catalog__tier-tab-badge">
                                Custom
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {editTierTab &&
                        (() => {
                          const activeTier = tiers.find(
                            (t) => t.id === editTierTab,
                          );
                          if (!activeTier) return null;

                          if (activeTier.isCustomPricing) {
                            return (
                              <div className="catalog__tier-custom-note">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  width="16"
                                  height="16"
                                >
                                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                  Custom pricing tier — discounts negotiated per
                                  customer.
                                </span>
                              </div>
                            );
                          }

                          const baseAmount = parseFloat(editGroupPrice) || 0;
                          const SETUP_CYCLES: BillingCycle[] = [
                            "MONTHLY",
                            "QUARTERLY",
                            "SEMI_ANNUAL",
                            "ANNUAL",
                          ];
                          const cycleLabels: Record<string, string> = {
                            MONTHLY: "Monthly",
                            QUARTERLY: "Quarterly",
                            SEMI_ANNUAL: "Semi-Annual",
                            ANNUAL: "Annual",
                          };

                          return (
                            <div className="catalog__setup-cycle-grid">
                              {SETUP_CYCLES.map((cycle) => {
                                const entry =
                                  editSetupTierDiscounts[activeTier.id]?.[
                                    cycle
                                  ];
                                const dType = "PERCENTAGE" as const;
                                const dValue = entry?.discountValue || "";
                                const parsedValue = parseFloat(dValue) || 0;

                                // Compute effective price
                                let effectiveAmount = baseAmount;
                                let savings = 0;
                                let savingsPct = 0;
                                if (parsedValue > 0 && baseAmount > 0) {
                                  const result = calculateEffectiveSetupPrice({
                                    amount: baseAmount,
                                    discount: {
                                      discountType: dType,
                                      discountValue: parsedValue,
                                    },
                                  });
                                  effectiveAmount = result.effectiveAmount;
                                  savings = result.savings;
                                  savingsPct = result.savingsPercent;
                                }

                                return (
                                  <div
                                    key={cycle}
                                    className="catalog__setup-cycle-row"
                                  >
                                    <div className="catalog__setup-cycle-header">
                                      <span className="catalog__setup-cycle-label">
                                        {cycleLabels[cycle]} subscription
                                      </span>
                                      <span className="catalog__setup-cycle-base">
                                        {formatPrice(baseAmount, "USD")}
                                      </span>
                                    </div>
                                    <div className="catalog__setup-cycle-controls">
                                      <span className="catalog__discount-label">
                                        Discount
                                      </span>
                                      <div className="catalog__fee-input-wrapper catalog__fee-input-wrapper--discount">
                                        <input
                                          type="number"
                                          value={dValue}
                                          onChange={(e) => {
                                            const updated = {
                                              ...editSetupTierDiscounts,
                                            };
                                            updated[activeTier.id] = {
                                              ...updated[activeTier.id],
                                              [cycle]: {
                                                ...updated[activeTier.id]?.[
                                                  cycle
                                                ],
                                                discountValue: e.target.value,
                                              },
                                            };
                                            setEditSetupTierDiscounts(updated);
                                          }}
                                          placeholder="0"
                                          className="catalog__fee-input"
                                          step="0.01"
                                          min="0"
                                          max="100"
                                        />
                                        <span className="catalog__discount-suffix">
                                          %
                                        </span>
                                      </div>
                                    </div>
                                    {parsedValue > 0 && baseAmount > 0 && (
                                      <div className="catalog__setup-effective">
                                        <span className="catalog__setup-effective-arrow">
                                          &rarr;
                                        </span>
                                        <span className="catalog__setup-effective-base">
                                          {formatPrice(baseAmount, "USD")}
                                        </span>
                                        <span className="catalog__setup-effective-price">
                                          {formatPrice(effectiveAmount, "USD")}
                                        </span>
                                        {savingsPct > 0 && (
                                          <span className="catalog__setup-effective-savings">
                                            save {formatPrice(savings, "USD")} (
                                            {savingsPct}% off)
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="catalog__modal-footer">
              <button
                onClick={() => setEditingGroup(null)}
                className="catalog__btn catalog__btn--secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGroupEdit}
                disabled={!editGroupName.trim()}
                className="catalog__btn catalog__btn--primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="catalog">
        {/* Service Groups Sidebar */}
        <aside className="catalog__sidebar">
          <div className="catalog__sidebar-header">
            <h2 className="catalog__sidebar-title">
              Service Groups
              <InfoIcon content="Option Groups bundle related services together. They can be setup fees (one-time), recurring charges, or add-ons that clients select independently." />
            </h2>
            <button
              onClick={handleAddNewGroup}
              className="catalog__add-btn"
              aria-label="Add group"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="catalog__groups">
            {/* Setup & Formation Groups */}
            {setupGroups.length > 0 && (
              <GroupSection
                title="Setup & Formation"
                color="amber"
                groups={setupGroups}
                selectedGroupId={selectedGroupId}
                getServicesForGroup={getServicesForGroup}
                onSelect={setSelectedGroupId}
                onEdit={handleOpenEditGroup}
                onDelete={handleDeleteGroup}
              />
            )}

            {/* Recurring Services Groups */}
            {regularGroups.length > 0 && (
              <GroupSection
                title="Recurring Services"
                color="emerald"
                groups={regularGroups}
                selectedGroupId={selectedGroupId}
                getServicesForGroup={getServicesForGroup}
                onSelect={setSelectedGroupId}
                onEdit={handleOpenEditGroup}
                onDelete={handleDeleteGroup}
              />
            )}

            {/* Add-on Groups */}
            {addonGroups.length > 0 && (
              <GroupSection
                title="Optional Add-ons"
                color="violet"
                groups={addonGroups}
                selectedGroupId={selectedGroupId}
                getServicesForGroup={getServicesForGroup}
                onSelect={setSelectedGroupId}
                onEdit={handleOpenEditGroup}
                onDelete={handleDeleteGroup}
              />
            )}

            {/* Ungrouped services */}
            {ungroupedServices.length > 0 && (
              <div className="catalog__section">
                <button
                  onClick={() => setSelectedGroupId(null)}
                  className={`catalog__ungrouped-btn ${selectedGroupId === null ? "catalog__ungrouped-btn--active" : ""}`}
                >
                  <span className="catalog__ungrouped-name">
                    Ungrouped Services
                  </span>
                  <span className="catalog__ungrouped-count">
                    {ungroupedServices.length} services
                  </span>
                </button>
              </div>
            )}

            {/* Empty state */}
            {optionGroups.length === 0 && ungroupedServices.length === 0 && (
              <div className="catalog__empty">
                <p className="catalog__empty-title">No service groups yet</p>
                <p className="catalog__empty-text">Click + to create a group</p>
              </div>
            )}
          </div>
        </aside>

        {/* Services List */}
        <main className="catalog__main">
          <div className="catalog__main-header">
            <div className="catalog__main-info">
              <h2 className="catalog__main-title">
                {selectedGroup?.name || "Ungrouped Services"}
              </h2>
              <p className="catalog__main-subtitle">
                {selectedGroup?.costType === "SETUP" ? (
                  <span className="catalog__main-meta">
                    <span className="catalog__badge catalog__badge--amber">
                      Setup & Formation
                    </span>
                    {selectedGroup.price != null
                      ? `One-time fee: $${selectedGroup.price}`
                      : "Included in tier price"}
                  </span>
                ) : selectedGroup?.isAddOn ? (
                  <span className="catalog__main-meta">
                    Optional add-on group
                    {selectedGroup.availableBillingCycles.map((cycle) => (
                      <span
                        key={cycle}
                        className="catalog__badge catalog__badge--violet"
                        style={{ marginLeft: 8 }}
                      >
                        {BILLING_CYCLE_SHORT_LABELS[cycle]}
                      </span>
                    ))}
                    {selectedGroup.price != null && (
                      <span className="catalog__fee-display">
                        ${selectedGroup.price}
                      </span>
                    )}
                  </span>
                ) : selectedGroup ? (
                  <span className="catalog__main-meta">
                    Included in subscription
                    {selectedGroup.availableBillingCycles.map((cycle) => (
                      <span
                        key={cycle}
                        className="catalog__badge catalog__badge--emerald"
                        style={{ marginLeft: 8 }}
                      >
                        {BILLING_CYCLE_SHORT_LABELS[cycle]}
                      </span>
                    ))}
                  </span>
                ) : (
                  "Services not assigned to any group"
                )}
              </p>
            </div>
            {selectedGroupId && (
              <div className="catalog__header-actions">
                <button
                  onClick={() => setShowServiceTemplates(!showServiceTemplates)}
                  className="catalog__btn catalog__btn--secondary"
                  title="Quick-add from templates"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Templates
                </button>
                <button
                  onClick={() => setIsAddingService(true)}
                  className="catalog__btn catalog__btn--primary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Add Service
                </button>
              </div>
            )}
          </div>

          {/* Service Templates Quick-Add Panel */}
          {showServiceTemplates && selectedGroupId && (
            <div className="catalog__templates-panel">
              <div className="catalog__templates-header">
                <h3 className="catalog__templates-title">
                  Quick Add from Templates
                </h3>
                <button
                  onClick={() => setShowServiceTemplates(false)}
                  className="catalog__templates-close"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="catalog__templates-hint">
                Click any template to instantly add it to this group. Services
                will be included in all tiers by default.
              </p>
              <div className="catalog__templates-grid">
                {Object.entries(SERVICE_TEMPLATES).map(
                  ([category, templates]) => (
                    <div key={category} className="catalog__template-category">
                      <h4 className="catalog__template-category-title">
                        {category}
                      </h4>
                      <div className="catalog__template-items">
                        {templates.map((template, idx) => {
                          // Check if service already exists
                          const alreadyExists = services.some(
                            (s) =>
                              s.title.toLowerCase() ===
                              template.title.toLowerCase(),
                          );
                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                !alreadyExists &&
                                handleAddFromTemplate(template)
                              }
                              disabled={alreadyExists}
                              className={`catalog__template-item ${alreadyExists ? "catalog__template-item--exists" : ""}`}
                            >
                              <span className="catalog__template-icon">
                                {template.icon}
                              </span>
                              <div className="catalog__template-info">
                                <span className="catalog__template-name">
                                  {template.title}
                                </span>
                                <span className="catalog__template-desc">
                                  {template.description}
                                </span>
                              </div>
                              {alreadyExists && (
                                <span className="catalog__template-badge">
                                  Added
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {!selectedGroupId && (
            <div className="catalog__notice catalog__notice--info">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
              <p>
                Select a service group from the sidebar to add services.
                Services must belong to a group to be properly managed.
              </p>
            </div>
          )}

          {isAddingService && selectedGroupId && (
            <div className="catalog__add-service-form">
              <div className="catalog__field">
                <label className="catalog__label">Service Name</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) =>
                    setNewService({ ...newService, title: e.target.value })
                  }
                  placeholder="Enter service name..."
                  className="catalog__input"
                  autoFocus
                />
              </div>
              <div className="catalog__field">
                <label className="catalog__label">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter description..."
                  rows={2}
                  className="catalog__textarea"
                />
              </div>

              {/* Tier Selection */}
              {tiers.length > 0 && (
                <div className="catalog__field">
                  <label className="catalog__label">Include in Tiers</label>
                  <div className="catalog__tier-grid">
                    {tiers.map((tier) => {
                      const isSelected = selectedTierIds.has(tier.id);
                      return (
                        <label
                          key={tier.id}
                          className={`catalog__tier-option ${isSelected ? "catalog__tier-option--selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSet = new Set(selectedTierIds);
                              if (e.target.checked) {
                                newSet.add(tier.id);
                              } else {
                                newSet.delete(tier.id);
                              }
                              setSelectedTierIds(newSet);
                            }}
                            className="catalog__tier-checkbox"
                          />
                          <span className="catalog__tier-name">
                            {tier.name}
                          </span>
                          {tier.pricing.amount !== null && (
                            <span className="catalog__tier-price">
                              ${tier.pricing.amount}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {selectedTierIds.size === 0 && (
                    <p className="catalog__tier-hint">
                      Select at least one tier to include this service
                    </p>
                  )}
                </div>
              )}

              {tiers.length === 0 && (
                <div className="catalog__notice catalog__notice--warning">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>
                    No tiers defined yet. Define tiers in the Tier Definition
                    tab first to specify which tiers include this service.
                  </p>
                </div>
              )}

              <div className="catalog__form-actions">
                <button
                  onClick={handleAddService}
                  disabled={!newService.title.trim()}
                  className="catalog__btn catalog__btn--primary"
                >
                  Add Service
                </button>
                <button
                  onClick={() => {
                    setIsAddingService(false);
                    setNewService({ title: "", description: "" });
                    setSelectedTierIds(new Set());
                  }}
                  className="catalog__btn catalog__btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {displayedServices.length === 0 ? (
            <div className="catalog__services-empty">
              <div className="catalog__services-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="catalog__services-empty-title">
                No services in this group
              </h3>
              <p className="catalog__services-empty-text">
                {selectedGroupId
                  ? 'Click "Add Service" to create a new service.'
                  : "Select a group to manage its services."}
              </p>
            </div>
          ) : (
            <div className="catalog__services-list">
              {displayedServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  tiers={tiers}
                  optionGroups={optionGroups}
                  onUpdate={handleUpdateService}
                  onDelete={() => handleDeleteService(service.id)}
                  onToggleTier={handleToggleTier}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {pendingDeleteGroupId && (
        <ConfirmDialog
          title="Delete this group?"
          message="Services in this group will become ungrouped. This action cannot be undone."
          confirmLabel="Delete Group"
          variant="danger"
          onConfirm={confirmDeleteGroup}
          onCancel={() => setPendingDeleteGroupId(null)}
        />
      )}

      {pendingDeleteServiceId && (
        <ConfirmDialog
          title="Delete this service?"
          message="This will remove the service and any associated tier bindings. This action cannot be undone."
          confirmLabel="Delete Service"
          variant="danger"
          onConfirm={confirmDeleteService}
          onCancel={() => setPendingDeleteServiceId(null)}
        />
      )}
    </>
  );
}

interface GroupSectionProps {
  title: string;
  color: string;
  groups: OptionGroup[];
  selectedGroupId: string | null;
  getServicesForGroup: (groupId: string) => Service[];
  onSelect: (groupId: string) => void;
  onEdit: (group: OptionGroup) => void;
  onDelete: (groupId: string) => void;
}

function GroupSection({
  title,
  color,
  groups,
  selectedGroupId,
  getServicesForGroup,
  onSelect,
  onEdit,
  onDelete,
}: GroupSectionProps) {
  return (
    <div className="catalog__section">
      <div className="catalog__section-header">
        <span
          className={`catalog__section-dot catalog__section-dot--${color}`}
        />
        <span className="catalog__section-title">{title}</span>
      </div>
      <div className="catalog__section-items">
        {groups.map((group) => (
          <GroupButton
            key={group.id}
            group={group}
            serviceCount={getServicesForGroup(group.id).length}
            isSelected={selectedGroupId === group.id}
            onSelect={() => onSelect(group.id)}
            onEdit={() => onEdit(group)}
            onDelete={() => onDelete(group.id)}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}

interface GroupButtonProps {
  group: OptionGroup;
  serviceCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  color: string;
}

function GroupButton({
  group,
  serviceCount,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  color,
}: GroupButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSetup = group.costType === "SETUP";

  return (
    <div
      className="catalog__group-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onSelect}
        className={`catalog__group-btn catalog__group-btn--${color} ${isSelected ? "catalog__group-btn--active" : ""}`}
      >
        <div className="catalog__group-info">
          <span className="catalog__group-name">{group.name}</span>
          {isSetup && (
            <span className="catalog__group-tag catalog__group-tag--amber">
              SETUP
            </span>
          )}
          {group.isAddOn && (
            <span className="catalog__group-tag catalog__group-tag--violet">
              OPTIONAL
            </span>
          )}
          {group.availableBillingCycles.length > 0 && !isSetup && (
            <span className="catalog__group-tag catalog__group-tag--emerald">
              {group.availableBillingCycles
                .map((c) => BILLING_CYCLE_SHORT_LABELS[c])
                .join(", ")}
            </span>
          )}
        </div>
        <div className="catalog__group-meta">
          <span>
            {serviceCount} services
            {serviceCount === 0 && (
              <span className="catalog__validation-hint"> — add services</span>
            )}
          </span>
          {group.costType === "SETUP" && group.price != null && (
            <span className="catalog__group-fee">
              {formatPrice(group.price, "USD")}
            </span>
          )}
          {group.isAddOn && group.price != null && (
            <span className="catalog__group-fee">
              {formatPrice(group.price, "USD")}
            </span>
          )}
          {!isSetup &&
            !group.isAddOn &&
            (() => {
              const monthlyPrice =
                group.tierDependentPricing?.[0]?.recurringPricing?.find(
                  (p) => p.billingCycle === "MONTHLY",
                )?.amount ??
                group.standalonePricing?.recurringPricing?.find(
                  (p) => p.billingCycle === "MONTHLY",
                )?.amount;
              return monthlyPrice != null && monthlyPrice > 0 ? (
                <span className="catalog__group-fee">
                  {formatPrice(monthlyPrice, "USD")}/mo
                </span>
              ) : null;
            })()}
        </div>
      </button>
      {isHovered && (
        <div className="catalog__group-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="catalog__group-action catalog__group-action--edit"
            aria-label="Edit group"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="catalog__group-action catalog__group-action--delete"
            aria-label="Delete group"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  tiers: ServiceSubscriptionTier[];
  optionGroups: OptionGroup[];
  onUpdate: (
    service: Service,
    updates: Partial<
      Pick<
        Service,
        "title" | "description" | "isSetupFormation" | "optionGroupId"
      >
    >,
  ) => void;
  onDelete: () => void;
  onToggleTier: (
    serviceId: string,
    tierId: string,
    isIncluded: boolean,
  ) => void;
}

function ServiceCard({
  service,
  tiers,
  optionGroups,
  onUpdate,
  onDelete,
  onToggleTier,
}: ServiceCardProps) {
  const [localTitle, setLocalTitle] = useState(service.title);
  const [localDescription, setLocalDescription] = useState(
    service.description || "",
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local state when service changes
  useEffect(() => {
    setLocalTitle(service.title);
    setLocalDescription(service.description || "");
  }, [service.title, service.description]);

  // Get tiers this service is included in
  const includedTierIds = useMemo(() => {
    const ids = new Set<string>();
    tiers.forEach((tier) => {
      const hasService = tier.serviceLevels.some(
        (sl) => sl.serviceId === service.id && sl.level === "INCLUDED",
      );
      if (hasService) {
        ids.add(tier.id);
      }
    });
    return ids;
  }, [tiers, service.id]);

  return (
    <div
      className={`catalog__service-card ${service.isSetupFormation ? "catalog__service-card--setup" : ""} ${isExpanded ? "catalog__service-card--expanded" : ""}`}
    >
      <div className="catalog__service-main">
        <div className="catalog__service-content">
          <div className="catalog__service-header">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => {
                if (localTitle !== service.title && localTitle.trim()) {
                  onUpdate(service, { title: localTitle.trim() });
                }
              }}
              className="catalog__service-title-input"
            />
            {service.isSetupFormation && (
              <span className="catalog__badge catalog__badge--amber">
                Setup Service
              </span>
            )}
          </div>
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            onBlur={() => {
              if (localDescription !== (service.description || "")) {
                onUpdate(service, { description: localDescription });
              }
            }}
            placeholder="Add a description..."
            rows={2}
            className="catalog__service-desc-input"
          />

          {/* Tier badges - quick view */}
          {tiers.length > 0 && (
            <div className="catalog__service-tiers-preview">
              {tiers.map((tier) => (
                <span
                  key={tier.id}
                  className={`catalog__service-tier-badge ${includedTierIds.has(tier.id) ? "catalog__service-tier-badge--included" : "catalog__service-tier-badge--excluded"}`}
                >
                  {tier.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="catalog__service-actions">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="catalog__service-expand"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="catalog__service-delete"
            aria-label="Delete service"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded section for editing group and tier inclusion */}
      {isExpanded && (
        <div className="catalog__service-expanded">
          {/* Group assignment */}
          <div className="catalog__service-section">
            <label className="catalog__label">Assign to Group</label>
            <select
              value={service.optionGroupId || ""}
              onChange={(e) => {
                const newGroupId = e.target.value || null;
                const targetGroup = newGroupId
                  ? optionGroups.find((g) => g.id === newGroupId)
                  : null;
                const isSetupGroup = targetGroup?.costType === "SETUP";

                onUpdate(service, {
                  optionGroupId: newGroupId,
                  isSetupFormation: isSetupGroup,
                });
              }}
              className="catalog__select"
            >
              <option value="">No group (ungrouped)</option>
              {optionGroups.map((group) => {
                const label =
                  group.costType === "SETUP"
                    ? `${group.name} (Setup)`
                    : group.isAddOn
                      ? `${group.name} (Add-on)`
                      : `${group.name} (Recurring)`;
                return (
                  <option key={group.id} value={group.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Tier inclusion */}
          {tiers.length > 0 && (
            <div className="catalog__service-section">
              <label className="catalog__label">Include in Tiers</label>
              <div className="catalog__tier-grid catalog__tier-grid--compact">
                {tiers.map((tier) => {
                  const isIncluded = includedTierIds.has(tier.id);
                  return (
                    <label
                      key={tier.id}
                      className={`catalog__tier-option ${isIncluded ? "catalog__tier-option--selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={(e) => {
                          onToggleTier(service.id, tier.id, e.target.checked);
                        }}
                        className="catalog__tier-checkbox"
                      />
                      <span className="catalog__tier-name">{tier.name}</span>
                      {tier.pricing.amount !== null && (
                        <span className="catalog__tier-price">
                          ${tier.pricing.amount}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
