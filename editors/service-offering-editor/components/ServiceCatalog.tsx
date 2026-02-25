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
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<
    "setup" | "recurring" | "addon"
  >("recurring");
  const [newGroupPrice, setNewGroupPrice] = useState("");
  const [newGroupBillingCycle, setNewGroupBillingCycle] =
    useState<BillingCycle>("MONTHLY");
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

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    const groupId = generateId();
    const isSetup = newGroupType === "setup";
    const isAddOn = newGroupType === "addon";
    const costType: GroupCostType = isSetup ? "SETUP" : "RECURRING";
    const price = newGroupPrice ? parseFloat(newGroupPrice) : null;

    dispatch(
      addOptionGroup({
        id: groupId,
        name: newGroupName.trim(),
        isAddOn,
        defaultSelected: !isAddOn,
        costType,
        availableBillingCycles: [isSetup ? "ONE_TIME" : newGroupBillingCycle],
        price: price ?? undefined,
        currency: price ? "USD" : undefined,
        lastModified: new Date().toISOString(),
      }),
    );

    // If a recurring/add-on price is set, set as standalone monthly recurring + per-tier pricing
    if (!isSetup && price && price > 0) {
      const billingCycle = isAddOn
        ? newGroupBillingCycle
        : newGroupBillingCycle;
      dispatch(
        setOptionGroupStandalonePricing({
          optionGroupId: groupId,
          setupCost: null,
          recurringPricing: [
            {
              id: generateId(),
              billingCycle,
              amount: price,
              currency: "USD",
              discount: null,
            },
          ],
          lastModified: new Date().toISOString(),
        }),
      );
      // Pre-populate per-tier pricing for each existing tier
      if (!isAddOn) {
        for (const tier of tiers) {
          dispatch(
            addOptionGroupTierPricing({
              optionGroupId: groupId,
              tierPricingId: generateId(),
              tierId: tier.id,
              setupCost: null,
              setupCostDiscounts: [],
              recurringPricing: [
                {
                  id: generateId(),
                  billingCycle,
                  amount: price,
                  currency: "USD",
                  discount: null,
                },
              ],
              lastModified: new Date().toISOString(),
            }),
          );
        }
      }
    }

    setNewGroupName("");
    setNewGroupType("recurring");
    setNewGroupPrice("");
    setNewGroupBillingCycle("MONTHLY");
    setIsAddingGroup(false);
    setSelectedGroupId(groupId);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this group? Services in this group will become ungrouped.",
      )
    )
      return;
    dispatch(
      deleteOptionGroup({
        id: groupId,
        lastModified: new Date().toISOString(),
      }),
    );
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
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
    if (!confirm("Are you sure you want to delete this service?")) return;
    dispatch(
      deleteService({
        id: serviceId,
        lastModified: new Date().toISOString(),
      }),
    );
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
      <style>{styles}</style>

      {/* Edit Group Modal */}
      {editingGroup && (
        <div
          className="catalog__modal-overlay"
          onClick={() => setEditingGroup(null)}
        >
          <div className="catalog__modal" onClick={(e) => e.stopPropagation()}>
            <div className="catalog__modal-header">
              <h3 className="catalog__modal-title">Edit Group</h3>
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
            <h2 className="catalog__sidebar-title">Service Groups</h2>
            <button
              onClick={() => setIsAddingGroup(true)}
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

          {isAddingGroup && (
            <div className="catalog__add-form">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name..."
                className="catalog__input"
                autoFocus
              />
              <div className="catalog__type-selector">
                <span className="catalog__type-label">Type</span>
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
                      onClick={() => setNewGroupType(type)}
                      className={`catalog__type-btn catalog__type-btn--${color} ${newGroupType === type ? "catalog__type-btn--active" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {newGroupType !== "setup" && (
                <div className="catalog__field">
                  <label className="catalog__label">Billing Cycle</label>
                  <select
                    value={newGroupBillingCycle}
                    onChange={(e) =>
                      setNewGroupBillingCycle(e.target.value as BillingCycle)
                    }
                    className="catalog__select"
                  >
                    {(
                      Object.entries(BILLING_CYCLE_SHORT_LABELS) as [
                        BillingCycle,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="catalog__fee-field">
                <span className="catalog__fee-label">
                  {newGroupType === "setup"
                    ? "One-time Fee"
                    : "Base Monthly Price"}
                </span>
                <div className="catalog__fee-input-wrapper">
                  <span className="catalog__fee-prefix">$</span>
                  <input
                    type="number"
                    value={newGroupPrice}
                    onChange={(e) => setNewGroupPrice(e.target.value)}
                    placeholder="0"
                    className="catalog__fee-input"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="catalog__form-actions">
                <button
                  onClick={handleAddGroup}
                  disabled={!newGroupName.trim()}
                  className="catalog__btn catalog__btn--primary"
                >
                  Add Group
                </button>
                <button
                  onClick={() => {
                    setIsAddingGroup(false);
                    setNewGroupName("");
                    setNewGroupType("recurring");
                    setNewGroupPrice("");
                  }}
                  className="catalog__btn catalog__btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
          <span>{serviceCount} services</span>
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

const styles = `
  .catalog {
    display: flex;
    gap: 24px;
    min-height: 600px;
  }

  /* Sidebar */
  .catalog__sidebar {
    width: 320px;
    flex-shrink: 0;
    background: white;
    border-radius: var(--so-radius-lg);
    box-shadow: var(--so-shadow-md);
    border: 1px solid var(--so-slate-100);
    padding: 20px;
    animation: so-scale-in var(--so-transition-slow) ease-out;
  }

  .catalog__sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .catalog__sidebar-title {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--so-slate-800);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .catalog__add-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--so-radius-md);
    background: var(--so-slate-100);
    border: none;
    color: var(--so-slate-500);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--so-transition-fast);
  }

  .catalog__add-btn:hover {
    background: var(--so-violet-100);
    color: var(--so-violet-600);
  }

  .catalog__add-btn svg {
    width: 18px;
    height: 18px;
  }

  /* Add Group Form */
  .catalog__add-form {
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: so-scale-in var(--so-transition-fast) ease-out;
  }

  .catalog__input {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: var(--so-slate-800);
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    transition: all var(--so-transition-fast);
  }

  .catalog__input:focus {
    outline: none;
    border-color: var(--so-violet-500);
    box-shadow: 0 0 0 2px var(--so-violet-100);
  }

  .catalog__type-selector {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .catalog__type-label,
  .catalog__fee-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--so-slate-500);
  }

  .catalog__type-buttons {
    display: flex;
    gap: 6px;
  }

  .catalog__type-btn {
    flex: 1;
    padding: 8px 10px;
    font-family: var(--so-font-sans);
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: var(--so-radius-sm);
    border: 1.5px solid var(--so-slate-200);
    background: white;
    color: var(--so-slate-600);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .catalog__type-btn:hover {
    border-color: var(--so-slate-300);
  }

  .catalog__type-btn--amber.catalog__type-btn--active {
    border-color: var(--so-amber-500);
    background: var(--so-amber-50);
    color: var(--so-amber-700);
  }

  .catalog__type-btn--emerald.catalog__type-btn--active {
    border-color: var(--so-emerald-500);
    background: var(--so-emerald-50);
    color: var(--so-emerald-700);
  }

  .catalog__type-btn--violet.catalog__type-btn--active {
    border-color: var(--so-violet-500);
    background: var(--so-violet-50);
    color: var(--so-violet-700);
  }

  .catalog__fee-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .catalog__fee-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .catalog__fee-prefix {
    font-size: 0.875rem;
    color: var(--so-slate-500);
  }

  .catalog__fee-input {
    flex: 1;
    padding: 8px 10px;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: var(--so-slate-800);
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
  }

  .catalog__fee-input:focus {
    outline: none;
    border-color: var(--so-violet-500);
    box-shadow: 0 0 0 2px var(--so-violet-100);
  }

  .catalog__setup-tier-discounts {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .catalog__fee-input-wrapper--discount {
    flex: 1;
  }

  .catalog__setup-cycle-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .catalog__setup-cycle-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: var(--so-slate-50);
    border: 1px solid var(--so-slate-150, var(--so-slate-200));
    border-radius: var(--so-radius-sm);
  }

  .catalog__setup-cycle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .catalog__setup-cycle-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .catalog__setup-cycle-base {
    font-family: var(--so-font-mono);
    font-size: 0.75rem;
    color: var(--so-slate-400);
  }

  .catalog__setup-cycle-controls {
    display: flex;
    gap: 6px;
    align-items: stretch;
  }

  .catalog__setup-effective {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--so-emerald-50);
    border: 1px solid var(--so-emerald-100);
    border-radius: var(--so-radius-sm);
    flex-wrap: wrap;
  }

  .catalog__setup-effective-arrow {
    font-size: 0.75rem;
    color: var(--so-emerald-500);
  }

  .catalog__setup-effective-base {
    font-family: var(--so-font-mono);
    font-size: 0.8125rem;
    color: var(--so-slate-400);
    text-decoration: line-through;
  }

  .catalog__setup-effective-price {
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--so-emerald-700);
  }

  .catalog__setup-effective-savings {
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--so-emerald-600);
    background: var(--so-emerald-100);
    padding: 2px 6px;
    border-radius: var(--so-radius-sm);
    margin-left: auto;
  }

  .catalog__pricing-mode {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .catalog__pricing-mode-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .catalog__pricing-mode-option {
    display: flex;
    gap: 12px;
    padding: 12px;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .catalog__pricing-mode-option:hover {
    border-color: var(--so-violet-300);
    background: var(--so-violet-50);
  }

  .catalog__pricing-mode-option:has(input:checked) {
    border-color: var(--so-violet-500);
    background: var(--so-violet-50);
  }

  .catalog__radio {
    margin-top: 2px;
    cursor: pointer;
  }

  .catalog__pricing-mode-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .catalog__pricing-mode-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--so-slate-800);
  }

  .catalog__pricing-mode-desc {
    font-size: 0.8125rem;
    color: var(--so-slate-500);
  }

  .catalog__pricing-mode-note {
    display: flex;
    gap: 8px;
    padding: 10px;
    background: var(--so-blue-50);
    border: 1px solid var(--so-blue-200);
    border-radius: var(--so-radius-sm);
    font-size: 0.8125rem;
    color: var(--so-blue-700);
  }

  .catalog__pricing-mode-note svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .catalog__pricing-config {
    margin-top: 16px;
    padding: 16px;
    background: var(--so-slate-50);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
  }

  .catalog__pricing-config-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
  }

  .catalog__pricing-config-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--so-slate-800);
  }

  .catalog__pricing-config-desc {
    font-size: 0.8125rem;
    color: var(--so-slate-500);
  }

  .catalog__pricing-config-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .catalog__pricing-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .catalog__pricing-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .catalog__recurring-price-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    background: white;
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
  }

  .catalog__cycle-label {
    font-size: 0.8125rem;
    color: var(--so-slate-700);
    min-width: 100px;
  }

  .catalog__discount-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    background: white;
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
  }

  /* old discount-inputs/type/value styles removed - now using catalog__discount-flat */

  .catalog__form-actions {
    display: flex;
    gap: 8px;
  }

  .catalog__btn {
    flex: 1;
    padding: 10px 16px;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: var(--so-radius-md);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all var(--so-transition-fast);
  }

  .catalog__btn svg {
    width: 16px;
    height: 16px;
  }

  .catalog__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .catalog__btn--primary {
    background: linear-gradient(135deg, var(--so-violet-600) 0%, var(--so-violet-700) 100%);
    color: white;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.25);
  }

  .catalog__btn--primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(124, 58, 237, 0.35);
  }

  .catalog__btn--secondary {
    background: var(--so-slate-100);
    color: var(--so-slate-700);
  }

  .catalog__btn--secondary:hover:not(:disabled) {
    background: var(--so-slate-200);
  }

  /* Group Sections */
  .catalog__groups {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .catalog__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .catalog__section-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .catalog__section-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .catalog__section-dot--amber { background: var(--so-amber-500); }
  .catalog__section-dot--emerald { background: var(--so-emerald-500); }
  .catalog__section-dot--violet { background: var(--so-violet-500); }

  .catalog__section-title {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--so-slate-500);
  }

  .catalog__section-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Group Button */
  .catalog__group-wrapper {
    position: relative;
  }

  .catalog__group-btn {
    width: 100%;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-radius: var(--so-radius-md);
    cursor: pointer;
    text-align: left;
    transition: all var(--so-transition-fast);
  }

  .catalog__group-btn:hover {
    background: var(--so-slate-50);
  }

  .catalog__group-btn--active {
    border-left: 3px solid;
  }

  .catalog__group-btn--amber.catalog__group-btn--active {
    background: var(--so-amber-50);
    border-color: var(--so-amber-500);
  }

  .catalog__group-btn--emerald.catalog__group-btn--active {
    background: var(--so-emerald-50);
    border-color: var(--so-emerald-500);
  }

  .catalog__group-btn--violet.catalog__group-btn--active {
    background: var(--so-violet-50);
    border-color: var(--so-violet-500);
  }

  .catalog__group-info {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .catalog__group-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-800);
  }

  .catalog__group-tag {
    padding: 2px 6px;
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 4px;
  }

  .catalog__group-tag--amber {
    background: var(--so-amber-100);
    color: var(--so-amber-700);
  }

  .catalog__group-tag--violet {
    background: var(--so-violet-100);
    color: var(--so-violet-700);
  }

  .catalog__group-tag--emerald {
    background: var(--so-emerald-100);
    color: var(--so-emerald-700);
  }

  .catalog__group-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--so-slate-500);
    margin-top: 2px;
  }

  .catalog__group-fee {
    color: var(--so-amber-600);
  }

  /* Ungrouped Button */
  .catalog__ungrouped-btn {
    width: 100%;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-top: 1px solid var(--so-slate-200);
    border-radius: 0;
    cursor: pointer;
    text-align: left;
    transition: all var(--so-transition-fast);
    margin-top: 8px;
    padding-top: 18px;
  }

  .catalog__ungrouped-btn:hover {
    background: var(--so-slate-50);
  }

  .catalog__ungrouped-btn--active {
    background: var(--so-slate-100);
    border-left: 3px solid var(--so-slate-500);
    border-radius: var(--so-radius-md);
  }

  .catalog__ungrouped-name {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-700);
  }

  .catalog__ungrouped-count {
    display: block;
    font-size: 0.75rem;
    color: var(--so-slate-400);
    margin-top: 2px;
  }

  /* Empty State */
  .catalog__empty {
    text-align: center;
    padding: 32px 16px;
    color: var(--so-slate-500);
  }

  .catalog__empty-title {
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0 0 4px;
  }

  .catalog__empty-text {
    font-size: 0.75rem;
    margin: 0;
    color: var(--so-slate-400);
  }

  /* Main Content */
  .catalog__main {
    flex: 1;
    background: white;
    border-radius: var(--so-radius-lg);
    box-shadow: var(--so-shadow-md);
    border: 1px solid var(--so-slate-100);
    padding: 24px;
    animation: so-scale-in var(--so-transition-slow) ease-out;
    animation-delay: 50ms;
  }

  .catalog__main-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  .catalog__main-info {
    flex: 1;
  }

  .catalog__main-title {
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--so-slate-800);
    margin: 0 0 6px;
    letter-spacing: -0.02em;
  }

  .catalog__main-subtitle {
    font-size: 0.875rem;
    color: var(--so-slate-500);
    margin: 0;
  }

  .catalog__main-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .catalog__fee-display {
    color: var(--so-amber-600);
  }

  .catalog__badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 100px;
  }

  .catalog__badge--amber {
    background: var(--so-amber-100);
    color: var(--so-amber-700);
  }

  /* Notice */
  .catalog__notice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: var(--so-radius-md);
    margin-bottom: 20px;
  }

  .catalog__notice svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .catalog__notice p {
    font-size: 0.8125rem;
    margin: 0;
    line-height: 1.5;
  }

  .catalog__notice--info {
    background: var(--so-sky-50);
    border: 1px solid var(--so-sky-200);
    color: var(--so-sky-700);
  }

  .catalog__notice--warning {
    background: var(--so-amber-50);
    border: 1px solid var(--so-amber-200);
    color: var(--so-amber-700);
  }

  /* Add Service Form */
  .catalog__add-service-form {
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
    border: 1px solid var(--so-slate-200);
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: so-scale-in var(--so-transition-fast) ease-out;
  }

  .catalog__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .catalog__label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--so-slate-500);
  }

  .catalog__checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: var(--so-slate-50);
    border-radius: var(--so-radius-md);
  }

  .catalog__checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--so-slate-700);
  }

  .catalog__checkbox {
    cursor: pointer;
    width: 16px;
    height: 16px;
  }

  .catalog__textarea {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: var(--so-slate-800);
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    resize: none;
    transition: all var(--so-transition-fast);
  }

  .catalog__textarea:focus {
    outline: none;
    border-color: var(--so-violet-500);
    box-shadow: 0 0 0 2px var(--so-violet-100);
  }

  /* Services Empty State */
  .catalog__services-empty {
    text-align: center;
    padding: 60px 24px;
  }

  .catalog__services-empty-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    color: var(--so-slate-300);
  }

  .catalog__services-empty-icon svg {
    width: 100%;
    height: 100%;
  }

  .catalog__services-empty-title {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--so-slate-700);
    margin: 0 0 6px;
  }

  .catalog__services-empty-text {
    font-size: 0.875rem;
    color: var(--so-slate-500);
    margin: 0;
  }

  /* Services List */
  .catalog__services-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Service Card */
  .catalog__service-card {
    display: flex;
    gap: 16px;
    padding: 18px;
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    transition: all var(--so-transition-fast);
  }

  .catalog__service-card:hover {
    border-color: var(--so-slate-300);
    box-shadow: var(--so-shadow-sm);
  }

  .catalog__service-card--setup {
    background: var(--so-amber-50);
    border-color: var(--so-amber-200);
  }

  .catalog__service-card--setup:hover {
    border-color: var(--so-amber-300);
  }

  .catalog__service-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .catalog__service-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .catalog__service-title-input {
    flex: 1;
    font-family: var(--so-font-sans);
    font-size: 1rem;
    font-weight: 500;
    color: var(--so-slate-800);
    background: transparent;
    border: none;
    border-bottom: 1.5px solid transparent;
    padding: 0 0 2px;
    transition: all var(--so-transition-fast);
  }

  .catalog__service-title-input:hover {
    border-color: var(--so-slate-300);
  }

  .catalog__service-title-input:focus {
    outline: none;
    border-color: var(--so-violet-500);
  }

  .catalog__service-desc-input {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--so-font-sans);
    font-size: 0.8125rem;
    color: var(--so-slate-600);
    background: var(--so-slate-50);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    resize: none;
    transition: all var(--so-transition-fast);
  }

  .catalog__service-desc-input:hover {
    background: white;
    border-color: var(--so-slate-300);
  }

  .catalog__service-desc-input:focus {
    outline: none;
    background: white;
    border-color: var(--so-violet-500);
    box-shadow: 0 0 0 2px var(--so-violet-100);
  }

  .catalog__service-delete {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: var(--so-radius-md);
    background: transparent;
    border: none;
    color: var(--so-slate-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--so-transition-fast);
  }

  .catalog__service-delete:hover {
    background: var(--so-rose-100);
    color: var(--so-rose-600);
  }

  .catalog__service-delete svg {
    width: 18px;
    height: 18px;
  }

  /* Tier Selection */
  .catalog__tier-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  .catalog__tier-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .catalog__tier-option:hover {
    border-color: var(--so-slate-300);
    background: var(--so-slate-50);
  }

  .catalog__tier-option--selected {
    border-color: var(--so-emerald-500);
    background: var(--so-emerald-50);
  }

  .catalog__tier-option--selected:hover {
    border-color: var(--so-emerald-600);
    background: var(--so-emerald-50);
  }

  .catalog__tier-checkbox {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    accent-color: var(--so-emerald-600);
    cursor: pointer;
  }

  .catalog__tier-name {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-800);
  }

  .catalog__tier-price {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--so-slate-500);
    white-space: nowrap;
  }

  .catalog__tier-option--selected .catalog__tier-name {
    color: var(--so-emerald-800);
  }

  .catalog__tier-option--selected .catalog__tier-price {
    color: var(--so-emerald-600);
  }

  .catalog__tier-hint {
    font-size: 0.75rem;
    color: var(--so-slate-500);
    margin: 8px 0 0;
    font-style: italic;
  }

  .catalog__tier-grid--compact {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }

  .catalog__tier-grid--compact .catalog__tier-option {
    padding: 10px 12px;
  }

  /* Modal Overlay */
  .catalog__modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: so-fade-in var(--so-transition-fast) ease-out;
  }

  .catalog__modal {
    background: white;
    border-radius: var(--so-radius-lg);
    box-shadow: var(--so-shadow-xl);
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: so-scale-in var(--so-transition-base) ease-out;
  }

  .catalog__modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--so-slate-100);
  }

  .catalog__modal-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--so-slate-800);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .catalog__modal-close {
    width: 32px;
    height: 32px;
    border-radius: var(--so-radius-md);
    background: transparent;
    border: none;
    color: var(--so-slate-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--so-transition-fast);
  }

  .catalog__modal-close:hover {
    background: var(--so-slate-100);
    color: var(--so-slate-600);
  }

  .catalog__modal-close svg {
    width: 18px;
    height: 18px;
  }

  .catalog__modal-body {
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .catalog__modal-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px 20px;
    border-top: 1px solid var(--so-slate-100);
  }

  /* Group Actions */
  .catalog__group-actions {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 2px;
    animation: so-fade-in var(--so-transition-fast) ease-out;
  }

  .catalog__group-action {
    width: 28px;
    height: 28px;
    border-radius: var(--so-radius-md);
    background: white;
    border: 1px solid var(--so-slate-200);
    color: var(--so-slate-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--so-transition-fast);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .catalog__group-action:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .catalog__group-action:active {
    transform: scale(0.95);
  }

  .catalog__group-action svg {
    width: 14px;
    height: 14px;
  }

  .catalog__group-action--edit:hover {
    background: var(--so-violet-50);
    border-color: var(--so-violet-300);
    color: var(--so-violet-600);
  }

  .catalog__group-action--delete:hover {
    background: var(--so-rose-50);
    border-color: var(--so-rose-300);
    color: var(--so-rose-600);
  }

  /* Select element */
  .catalog__select {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--so-font-sans);
    font-size: 0.875rem;
    color: var(--so-slate-800);
    background: white;
    border: 1.5px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
    cursor: pointer;
    transition: all var(--so-transition-fast);
  }

  .catalog__select:hover {
    border-color: var(--so-slate-300);
  }

  .catalog__select:focus {
    outline: none;
    border-color: var(--so-violet-500);
    box-shadow: 0 0 0 2px var(--so-violet-100);
  }

  /* Service Card Updates */
  .catalog__service-card--expanded {
    border-color: var(--so-violet-300);
  }

  .catalog__service-main {
    display: flex;
    gap: 16px;
  }

  .catalog__service-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .catalog__service-expand {
    width: 36px;
    height: 36px;
    border-radius: var(--so-radius-md);
    background: var(--so-slate-100);
    border: none;
    color: var(--so-slate-500);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--so-transition-fast);
  }

  .catalog__service-expand:hover {
    background: var(--so-violet-100);
    color: var(--so-violet-600);
  }

  .catalog__service-expand svg {
    width: 18px;
    height: 18px;
    transition: transform var(--so-transition-fast);
  }

  .catalog__service-tiers-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .catalog__service-tier-badge {
    padding: 3px 8px;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 4px;
  }

  .catalog__service-tier-badge--included {
    background: var(--so-emerald-100);
    color: var(--so-emerald-700);
  }

  .catalog__service-tier-badge--excluded {
    background: var(--so-slate-100);
    color: var(--so-slate-400);
  }

  .catalog__service-expanded {
    border-top: 1px solid var(--so-slate-200);
    margin-top: 16px;
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: so-fade-in var(--so-transition-fast) ease-out;
  }

  .catalog__service-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Header Actions */
  .catalog__header-actions {
    display: flex;
    gap: 8px;
  }

  /* Service Templates Panel */
  .catalog__templates-panel {
    background: linear-gradient(135deg, var(--so-violet-50) 0%, var(--so-slate-50) 100%);
    border: 1px solid var(--so-violet-200);
    border-radius: var(--so-radius-lg);
    padding: 20px;
    margin-bottom: 24px;
    animation: so-scale-in var(--so-transition-fast) ease-out;
  }

  .catalog__templates-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .catalog__templates-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--so-slate-800);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .catalog__templates-title::before {
    content: "⚡";
  }

  .catalog__templates-close {
    width: 28px;
    height: 28px;
    border-radius: var(--so-radius-sm);
    background: transparent;
    border: none;
    color: var(--so-slate-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--so-transition-fast);
  }

  .catalog__templates-close:hover {
    background: white;
    color: var(--so-slate-600);
  }

  .catalog__templates-close svg {
    width: 16px;
    height: 16px;
  }

  .catalog__templates-hint {
    font-size: 0.8125rem;
    color: var(--so-slate-500);
    margin: 0 0 16px;
  }

  .catalog__templates-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .catalog__template-category {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .catalog__template-category-title {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--so-slate-500);
    margin: 0;
    padding-left: 4px;
  }

  .catalog__template-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .catalog__template-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: white;
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    cursor: pointer;
    text-align: left;
    transition: all var(--so-transition-fast);
  }

  .catalog__template-item:hover:not(:disabled) {
    border-color: var(--so-violet-300);
    background: white;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
    transform: translateX(2px);
  }

  .catalog__template-item:active:not(:disabled) {
    transform: translateX(0);
  }

  .catalog__template-item--exists {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .catalog__template-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .catalog__template-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .catalog__template-name {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-800);
  }

  .catalog__template-desc {
    font-size: 0.6875rem;
    color: var(--so-slate-500);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .catalog__template-badge {
    padding: 2px 8px;
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--so-emerald-100);
    color: var(--so-emerald-700);
    border-radius: 4px;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    .catalog__templates-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Compact Pricing Table */
  .catalog__pricing-table {
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    overflow: hidden;
  }

  .catalog__pricing-table-header {
    display: grid;
    grid-template-columns: 100px 1fr 1fr;
    gap: 0;
    padding: 8px 12px;
    background: var(--so-slate-50);
    border-bottom: 1px solid var(--so-slate-200);
  }

  .catalog__pricing-table-th {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--so-slate-500);
  }

  .catalog__pricing-table-row {
    display: grid;
    grid-template-columns: 100px 1fr 1fr;
    gap: 8px;
    padding: 8px 12px;
    align-items: center;
    border-bottom: 1px solid var(--so-slate-100);
  }

  .catalog__pricing-table-row:last-child {
    border-bottom: none;
  }

  .catalog__pricing-table-cycle {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-700);
  }

  .catalog__fee-input-wrapper--compact {
    height: 34px;
  }

  .catalog__fee-input-wrapper--compact .catalog__fee-prefix {
    padding: 6px 6px 6px 10px;
    font-size: 0.8125rem;
  }

  .catalog__fee-input-wrapper--compact .catalog__fee-input {
    padding: 6px 8px 6px 2px;
    font-size: 0.8125rem;
  }

  .catalog__discount-flat--compact {
    height: 34px;
  }

  .catalog__discount-flat--compact .catalog__discount-prefix {
    padding: 6px 4px 6px 10px;
    font-size: 0.8125rem;
  }

  .catalog__discount-flat--compact .catalog__discount-input {
    padding: 6px 8px 6px 2px;
    font-size: 0.8125rem;
  }

  .catalog__discount-flat {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    overflow: hidden;
    transition: all var(--so-transition-fast);
  }

  .catalog__discount-flat:focus-within {
    border-color: var(--so-violet-400);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  .catalog__discount-prefix {
    padding: 10px 8px 10px 12px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-400);
    background: var(--so-slate-50);
    white-space: nowrap;
    user-select: none;
  }

  .catalog__discount-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-500);
    white-space: nowrap;
  }

  .catalog__discount-suffix {
    padding: 10px 12px 10px 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-400);
    background: var(--so-slate-50);
    white-space: nowrap;
    user-select: none;
  }

  .catalog__discount-input {
    flex: 1;
    padding: 10px 12px 10px 4px;
    border: none;
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    color: var(--so-slate-700);
    background: transparent;
    outline: none;
    min-width: 0;
  }

  .catalog__discount-input::placeholder {
    color: var(--so-slate-400);
  }

  .catalog__pricing-config-header {
    margin-bottom: 20px;
  }

  .catalog__pricing-config-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--so-slate-700);
    display: block;
    margin-bottom: 4px;
  }

  .catalog__pricing-config-desc {
    font-size: 0.8125rem;
    color: var(--so-slate-500);
    display: block;
  }

  .catalog__setup-cost-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--so-slate-200);
  }

  .catalog__setup-cost-inline {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--so-slate-200);
  }

  .catalog__setup-cost-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--so-slate-600);
    white-space: nowrap;
  }

  .catalog__pricing-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--so-slate-600);
    display: block;
    margin-bottom: 8px;
  }

  .catalog__pricing-config-content {
    display: flex;
    flex-direction: column;
  }

  .catalog__pricing-mode-note {
    margin-top: 20px;
    padding: 12px;
    background: var(--so-blue-50);
    border-radius: var(--so-radius-md);
    border: 1px solid var(--so-blue-200);
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .catalog__pricing-mode-note svg {
    width: 18px;
    height: 18px;
    color: var(--so-blue-500);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .catalog__pricing-mode-note span {
    font-size: 0.8125rem;
    color: var(--so-slate-600);
    line-height: 1.5;
  }

  /* Add-on Billing Cycle Rows (mirrors tier BCP pattern) */
  .catalog__addon-cycles {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .catalog__addon-cycle-row {
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-md);
    padding: 10px 14px;
    background: var(--so-slate-50);
    transition: var(--so-transition-fast);
  }

  .catalog__addon-cycle-row--active {
    background: var(--so-white);
    border-color: var(--so-slate-200);
  }

  .catalog__addon-cycle-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .catalog__addon-cycle-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .catalog__addon-cycle-total {
    font-family: var(--so-font-mono);
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--so-slate-800);
  }

  .catalog__addon-cycle-dash {
    font-size: 0.875rem;
    color: var(--so-slate-400);
  }

  .catalog__addon-cycle-detail {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed var(--so-slate-200);
  }

  .catalog__addon-cycle-calc {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .catalog__addon-cycle-calc-label {
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--so-violet-500);
  }

  .catalog__addon-cycle-calc-formula {
    font-size: 0.8125rem;
    color: var(--so-slate-600);
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .catalog__addon-cycle-calc-result {
    font-weight: 600;
    color: var(--so-slate-700);
  }

  .catalog__addon-cycle-discount-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .catalog__addon-cycle-effective {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    padding: 6px 10px;
    background: var(--so-emerald-50);
    border-radius: var(--so-radius-sm);
  }

  .catalog__addon-cycle-effective-arrow {
    font-size: 0.8125rem;
    color: var(--so-emerald-600);
  }

  .catalog__addon-cycle-effective-price {
    font-family: var(--so-font-mono);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--so-emerald-700);
  }

  .catalog__addon-cycle-effective-savings {
    margin-left: auto;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--so-emerald-600);
    background: var(--so-emerald-100);
    padding: 2px 8px;
    border-radius: 99px;
  }

  /* Tier Budget Impact Indicator */
  .catalog__tier-budget {
    margin-top: 0.5rem;
    padding: 0.5rem 0.625rem;
    background: var(--so-slate-50);
    border: 1px solid var(--so-slate-200);
    border-radius: var(--so-radius-sm);
  }

  .catalog__tier-budget-title {
    display: block;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--so-slate-700);
    margin-bottom: 0.375rem;
  }

  .catalog__tier-budget-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.1875rem 0;
  }

  .catalog__tier-budget-name {
    flex-shrink: 0;
    width: 4.5rem;
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--so-slate-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .catalog__tier-budget-bar {
    flex: 1;
    height: 0.3125rem;
    background: var(--so-slate-200);
    border-radius: 9999px;
    overflow: hidden;
  }

  .catalog__tier-budget-fill {
    height: 100%;
    background: var(--so-emerald-500);
    border-radius: 9999px;
    transition: width 0.2s ease;
  }

  .catalog__tier-budget-fill--over {
    background: var(--so-rose-500);
  }

  .catalog__tier-budget-amount {
    flex-shrink: 0;
    font-family: var(--so-font-mono);
    font-size: 0.625rem;
    color: var(--so-slate-600);
  }

  .catalog__tier-budget-amount--over {
    color: var(--so-rose-600);
    font-weight: 600;
  }

  .catalog__tier-budget-warn {
    color: var(--so-rose-500);
    font-weight: 700;
  }

  /* Tier Tabs */
  .catalog__tier-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--so-slate-200);
    margin-bottom: 0.75rem;
    overflow-x: auto;
  }

  .catalog__tier-tab {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    font-family: var(--so-font-sans);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--so-slate-500);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--so-transition-fast);
  }

  .catalog__tier-tab:hover {
    color: var(--so-slate-700);
    background: var(--so-slate-50);
  }

  .catalog__tier-tab--active {
    color: var(--so-violet-700);
    border-bottom-color: var(--so-violet-600);
    font-weight: 600;
  }

  .catalog__tier-tab--custom {
    font-style: italic;
  }

  .catalog__tier-tab-badge {
    font-size: 0.5625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--so-amber-600);
    background: var(--so-amber-50);
    padding: 1px 5px;
    border-radius: 99px;
  }

  .catalog__tier-tab-price {
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    color: var(--so-emerald-600);
    font-weight: 600;
  }

  .catalog__tier-tab-warning {
    font-family: var(--so-font-mono);
    font-size: 0.6875rem;
    color: var(--so-amber-500);
    font-weight: 500;
  }

  .catalog__tier-panel {
    animation: catalog__fade-in 0.15s ease;
  }

  @keyframes catalog__fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .catalog__tier-custom-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--so-slate-50);
    border: 1px dashed var(--so-slate-300);
    border-radius: var(--so-radius-sm);
    font-size: 0.75rem;
    color: var(--so-slate-500);
    font-style: italic;
  }
`;
