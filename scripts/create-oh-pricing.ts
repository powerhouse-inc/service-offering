/**
 * Script to create a Service Offering document populated with
 * OH Pricing source-of-truth data and export it as a .phd file.
 *
 * Run with: npx tsx scripts/create-oh-pricing.ts
 */

import { writeFileSync } from "node:fs";
import JSZip from "jszip";
import { reducer } from "../document-models/service-offering/gen/reducer.js";
import { utils } from "../document-models/service-offering/gen/utils.js";
import {
  updateOfferingInfo,
  updateOfferingStatus,
  setAvailableBillingCycles,
} from "../document-models/service-offering/gen/offering/creators.js";
import { addService } from "../document-models/service-offering/gen/services/creators.js";
import {
  addTier,
  addServiceLevel,
} from "../document-models/service-offering/gen/tiers/creators.js";
import {
  addOptionGroup,
  setOptionGroupStandalonePricing,
} from "../document-models/service-offering/gen/option-groups/creators.js";
import {
  addServiceGroup,
  addServiceGroupTierPricing,
  addRecurringPriceOption,
  setServiceGroupSetupCost,
} from "../document-models/service-offering/gen/service-groups/creators.js";
import type { ServiceOfferingDocument } from "../document-models/service-offering/gen/types.js";

const TS = "2026-02-26T12:00:00.000Z";

// ── Helper ────────────────────────────────────────────────────────────────────

let _opIdx = 0;
function id(prefix: string) {
  return `${prefix}-${String(++_opIdx).padStart(3, "0")}`;
}

function dispatch(
  doc: ServiceOfferingDocument,
  action: Parameters<typeof reducer>[1],
): ServiceOfferingDocument {
  return reducer(doc, action);
}

// ── Build document ────────────────────────────────────────────────────────────

let doc = utils.createDocument();

// 1. Basic info
doc = dispatch(
  doc,
  updateOfferingInfo({
    title: "Operational HQ (OH) Service Offering",
    summary:
      "Comprehensive back-office operations for decentralized organizations — from entity formation and compliance to financial operations and contributor management.",
    description:
      "Operational HQ provides tiered operational services covering Swiss entity setup, compliance, financial reporting, and contributor operations. Choose from Essentials (free exploration), Starter ($750/mo), Standard ($1,250/mo + $250/contributor), or Custom (enterprise) tiers.",
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  updateOfferingStatus({ status: "ACTIVE", lastModified: TS }),
);

doc = dispatch(
  doc,
  setAvailableBillingCycles({
    billingCycles: ["MONTHLY", "ONE_TIME"],
    lastModified: TS,
  }),
);

// ── Tiers ─────────────────────────────────────────────────────────────────────

const TIER_1 = id("tier");
const TIER_2 = id("tier");
const TIER_3 = id("tier");
const TIER_4 = id("tier");

doc = dispatch(
  doc,
  addTier({
    id: TIER_1,
    name: "Essentials",
    description:
      "Exploration & solo use — free access to core tools and documentation.",
    amount: 0,
    currency: "USD",
    isCustomPricing: false,
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  addTier({
    id: TIER_2,
    name: "Starter",
    description:
      "Early stage organizations — entity setup, compliance, and financial ops.",
    amount: 750,
    currency: "USD",
    isCustomPricing: false,
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  addTier({
    id: TIER_3,
    name: "Standard",
    description:
      "Growing operations for teams of 3+ — full ops with contributor management. +$250/contributor.",
    amount: 1250,
    currency: "USD",
    isCustomPricing: false,
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  addTier({
    id: TIER_4,
    name: "Custom",
    description:
      "Scaling organizations — enterprise pricing with dedicated support and custom workflows.",
    amount: undefined,
    currency: "USD",
    isCustomPricing: true,
    lastModified: TS,
  }),
);

// ── Service Groups ────────────────────────────────────────────────────────────

const SG_CORE = id("sg");
const SG_ENTITY = id("sg");
const SG_FIN = id("sg");
const SG_TEAM = id("sg");
const SG_ADVANCED = id("sg");

doc = dispatch(
  doc,
  addServiceGroup({
    id: SG_CORE,
    name: "Core Tools & Documentation",
    description: "Foundation tools available across all tiers.",
    billingCycle: "MONTHLY",
    displayOrder: 1,
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  addServiceGroup({
    id: SG_ENTITY,
    name: "Entity & Compliance Foundation",
    description:
      "Swiss entity formation, registered address, VAT documentation, and annual tax compliance.",
    billingCycle: "MONTHLY",
    displayOrder: 2,
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  addServiceGroup({
    id: SG_FIN,
    name: "Financial Operations & Reporting",
    description:
      "End-to-end invoice management, expense tracking, monthly accounting, and reporting.",
    billingCycle: "MONTHLY",
    displayOrder: 3,
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  addServiceGroup({
    id: SG_TEAM,
    name: "Team & Contributor Operations",
    description:
      "Contributor onboarding, multi-currency payouts, and dedicated operational support.",
    billingCycle: "MONTHLY",
    displayOrder: 4,
    lastModified: TS,
  }),
);

doc = dispatch(
  doc,
  addServiceGroup({
    id: SG_ADVANCED,
    name: "Advanced & Scale Features",
    description:
      "Enterprise features including multiple entities, dedicated account manager, admin portal, and custom workflows.",
    billingCycle: "MONTHLY",
    displayOrder: 5,
    lastModified: TS,
  }),
);

// ── Service Group Tier Pricing ────────────────────────────────────────────────
// Core Tools: included in all tiers at $0 (no separate recurring charge)
// Entity/Fin/Team/Advanced: bundled in monthly tier price

const addTierPricing = (sgId: string, tierId: string) => {
  const tpId = id("tp");
  doc = dispatch(
    doc,
    addServiceGroupTierPricing({
      serviceGroupId: sgId,
      tierId,
      tierPricingId: tpId,
      lastModified: TS,
    }),
  );
  return tpId;
};

// Core group — all 4 tiers
addTierPricing(SG_CORE, TIER_1);
addTierPricing(SG_CORE, TIER_2);
addTierPricing(SG_CORE, TIER_3);
addTierPricing(SG_CORE, TIER_4);

// Entity — Tier 2, 3, 4 (included in monthly price)
addTierPricing(SG_ENTITY, TIER_2);
addTierPricing(SG_ENTITY, TIER_3);
addTierPricing(SG_ENTITY, TIER_4);

// Financial — Tier 2, 3, 4
addTierPricing(SG_FIN, TIER_2);
addTierPricing(SG_FIN, TIER_3);
addTierPricing(SG_FIN, TIER_4);

// Team — Tier 3, 4
addTierPricing(SG_TEAM, TIER_3);
addTierPricing(SG_TEAM, TIER_4);

// Advanced — Tier 4
addTierPricing(SG_ADVANCED, TIER_4);

// Monthly recurring prices for the main service groups (bundled into tier price)
// These represent the per-group portion of the tier monthly fee for visibility
// Tier 2 ($750/mo) — Entity + Fin primary services
doc = dispatch(
  doc,
  addRecurringPriceOption({
    serviceGroupId: SG_ENTITY,
    tierId: TIER_2,
    priceOptionId: id("rp"),
    billingCycle: "MONTHLY",
    amount: 750,
    currency: "USD",
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addRecurringPriceOption({
    serviceGroupId: SG_ENTITY,
    tierId: TIER_3,
    priceOptionId: id("rp"),
    billingCycle: "MONTHLY",
    amount: 1250,
    currency: "USD",
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addRecurringPriceOption({
    serviceGroupId: SG_ENTITY,
    tierId: TIER_4,
    priceOptionId: id("rp"),
    billingCycle: "MONTHLY",
    amount: 0,
    currency: "USD",
    lastModified: TS,
  }),
);

// One-time setup fees for Tier 2 and 3
doc = dispatch(
  doc,
  setServiceGroupSetupCost({
    serviceGroupId: SG_ENTITY,
    tierId: TIER_2,
    amount: 1,
    currency: "USD",
    lastModified: TS,
  }),
); // setup fee — exact amount TBD by operator
doc = dispatch(
  doc,
  setServiceGroupSetupCost({
    serviceGroupId: SG_ENTITY,
    tierId: TIER_3,
    amount: 1,
    currency: "USD",
    lastModified: TS,
  }),
);

// ── Services ──────────────────────────────────────────────────────────────────

// Core Tools & Documentation services
const SVC_INVOICE_GEN = id("svc");
const SVC_BUDGET_GEN = id("svc");
const SVC_LEGAL_TEMPLATES = id("svc");
const SVC_NEEDS_ANALYSIS = id("svc");

doc = dispatch(
  doc,
  addService({
    id: SVC_INVOICE_GEN,
    title: "Global Invoice Generator",
    description:
      "A global invoice generation tool that creates professionally structured invoices following international best practices, while remaining independent from any specific legal or tax jurisdiction.",
    serviceGroupId: SG_CORE,
    displayOrder: 1,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_BUDGET_GEN,
    title: "Budget Generator",
    description:
      "A budget planning tool that helps organizations allocate resources across teams, projects, and categories following financial best practices, with defined budget categories and time horizons.",
    serviceGroupId: SG_CORE,
    displayOrder: 2,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_LEGAL_TEMPLATES,
    title: "Legal Document Templates",
    description:
      "Professionally drafted legal document templates for operational needs.",
    serviceGroupId: SG_CORE,
    displayOrder: 3,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_NEEDS_ANALYSIS,
    title: "Needs Analysis",
    description:
      "Assessment of organizational operational needs and requirements.",
    serviceGroupId: SG_CORE,
    displayOrder: 4,
    isSetupFormation: false,
    lastModified: TS,
  }),
);

// Entity & Compliance Foundation services
const SVC_SWISS_ASSOC = id("svc");
const SVC_REG_ADDRESS = id("svc");
const SVC_VAT_DOC = id("svc");
const SVC_TAX_FILING = id("svc");

doc = dispatch(
  doc,
  addService({
    id: SVC_SWISS_ASSOC,
    title: "Swiss Association Formation",
    description:
      "Formation of a Swiss Association with the support of a Swiss licensed counsel. Includes use of templates for founding documents and articles of association, a workshop, and a founding meeting with counsel.",
    serviceGroupId: SG_ENTITY,
    displayOrder: 1,
    isSetupFormation: true,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_REG_ADDRESS,
    title: "Registered Address (Zug)",
    description: "Registered business address in Zug, Switzerland.",
    serviceGroupId: SG_ENTITY,
    displayOrder: 2,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_VAT_DOC,
    title: "VAT Documentation",
    description:
      "VAT documentation for Swiss VAT reporting, ensuring that all relevant invoices, payment records, and transaction classifications are properly maintained to support accurate VAT filings and potential audits by the Swiss Federal Tax Administration (FTA).",
    serviceGroupId: SG_ENTITY,
    displayOrder: 3,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_TAX_FILING,
    title: "Annual Tax Filing + VAT Reporting (default: quarterly)",
    description:
      "Structured support for Swiss annual tax compliance and VAT reporting (by default, quarterly), handled by licensed tax professionals, coordinated through our operational framework.",
    serviceGroupId: SG_ENTITY,
    displayOrder: 4,
    isSetupFormation: false,
    lastModified: TS,
  }),
);

// Financial Operations & Reporting services
const SVC_REIMBURSE = id("svc");
const SVC_INVOICE_MGMT = id("svc");
const SVC_ACCOUNTING = id("svc");
const SVC_EXPENSE_REPORT = id("svc");
const SVC_EXPENSE_POLICY = id("svc");

doc = dispatch(
  doc,
  addService({
    id: SVC_REIMBURSE,
    title: "Reimbursement Management",
    description: "Expense tracking and reimbursement workflows.",
    serviceGroupId: SG_FIN,
    displayOrder: 1,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_INVOICE_MGMT,
    title: "Invoice Management",
    description:
      "End to end handling of invoices from submission and approval to accounting and payment.",
    serviceGroupId: SG_FIN,
    displayOrder: 2,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_ACCOUNTING,
    title: "Monthly Accounting & Close",
    description:
      "Reconciliation of transactions, validation of balances and accurate financial records in accounting system for reporting and decision making.",
    serviceGroupId: SG_FIN,
    displayOrder: 3,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_EXPENSE_REPORT,
    title: "Monthly Expense Report",
    description:
      "A report of all expenses incurred during the month, categorized and reviewed to provide visibility into spending and budget performance.",
    serviceGroupId: SG_FIN,
    displayOrder: 4,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_EXPENSE_POLICY,
    title: "Expense Policies",
    description:
      "Defined rules governing how expenses are submitted, approved, and reimbursed.",
    serviceGroupId: SG_FIN,
    displayOrder: 5,
    isSetupFormation: false,
    lastModified: TS,
  }),
);

// Team & Contributor Operations services
const SVC_CONTRIBUTOR_OPS = id("svc");
const SVC_MULTI_CURRENCY = id("svc");
const SVC_DEDICATED_OPS = id("svc");

doc = dispatch(
  doc,
  addService({
    id: SVC_CONTRIBUTOR_OPS,
    title: "Contributor Onboarding & Operations",
    description:
      "Operational processes to onboard contributors, manage contracts and payment details.",
    serviceGroupId: SG_TEAM,
    displayOrder: 1,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_MULTI_CURRENCY,
    title: "Multi-Currency Payouts",
    description:
      "Crypto-to-Fiat Conversions — 48-hour transfers in USD, GBP, EUR, CHF, DKK. Additional currencies available upon request.",
    serviceGroupId: SG_TEAM,
    displayOrder: 2,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_DEDICATED_OPS,
    title: "Dedicated Ops Support",
    description:
      "Dedicated operational support with an assigned point of contact for handling day-to-day financial and administrative requests.",
    serviceGroupId: SG_TEAM,
    displayOrder: 3,
    isSetupFormation: false,
    lastModified: TS,
  }),
);

// Advanced & Scale Features services
const SVC_MULTI_ENTITY = id("svc");
const SVC_ACCOUNT_MGR = id("svc");
const SVC_ADMIN_PORTAL = id("svc");
const SVC_CUSTOM_WORKFLOWS = id("svc");

doc = dispatch(
  doc,
  addService({
    id: SVC_MULTI_ENTITY,
    title: "Multiple Entities",
    description:
      "Operational support across multiple legal entities, with consolidated oversight and coordinated financial workflows.",
    serviceGroupId: SG_ADVANCED,
    displayOrder: 1,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_ACCOUNT_MGR,
    title: "Dedicated Account Manager",
    description:
      "A dedicated account manager for overseeing the relationship and coordinating ongoing requests.",
    serviceGroupId: SG_ADVANCED,
    displayOrder: 2,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_ADMIN_PORTAL,
    title: "Admin Portal",
    description:
      "An informative admin portal providing visibility into billing, active services and key operational documents.",
    serviceGroupId: SG_ADVANCED,
    displayOrder: 3,
    isSetupFormation: false,
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addService({
    id: SVC_CUSTOM_WORKFLOWS,
    title: "Custom Workflows & Reporting",
    description: "Tailored operational workflows and reporting structures.",
    serviceGroupId: SG_ADVANCED,
    displayOrder: 4,
    isSetupFormation: false,
    lastModified: TS,
  }),
);

// ── Service Levels per Tier ───────────────────────────────────────────────────
// Core Tools — INCLUDED in all 4 tiers
const coreServices = [
  SVC_INVOICE_GEN,
  SVC_BUDGET_GEN,
  SVC_LEGAL_TEMPLATES,
  SVC_NEEDS_ANALYSIS,
];
for (const tierId of [TIER_1, TIER_2, TIER_3, TIER_4]) {
  for (const svcId of coreServices) {
    doc = dispatch(
      doc,
      addServiceLevel({
        tierId,
        serviceId: svcId,
        serviceLevelId: id("sl"),
        level: "INCLUDED",
        lastModified: TS,
      }),
    );
  }
}

// Entity — NOT_INCLUDED in T1, INCLUDED in T2/T3/T4
const entityServices = [
  SVC_SWISS_ASSOC,
  SVC_REG_ADDRESS,
  SVC_VAT_DOC,
  SVC_TAX_FILING,
];
for (const svcId of entityServices) {
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_1,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "NOT_INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_2,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_3,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_4,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
}

// Financial — NOT_INCLUDED in T1, INCLUDED in T2/T3; Expense Policy T3+ only
const finBaseServices = [
  SVC_REIMBURSE,
  SVC_INVOICE_MGMT,
  SVC_ACCOUNTING,
  SVC_EXPENSE_REPORT,
];
for (const svcId of finBaseServices) {
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_1,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "NOT_INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_2,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_3,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_4,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
}
// Expense Policy — T3/T4 only
doc = dispatch(
  doc,
  addServiceLevel({
    tierId: TIER_1,
    serviceId: SVC_EXPENSE_POLICY,
    serviceLevelId: id("sl"),
    level: "NOT_INCLUDED",
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addServiceLevel({
    tierId: TIER_2,
    serviceId: SVC_EXPENSE_POLICY,
    serviceLevelId: id("sl"),
    level: "NOT_INCLUDED",
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addServiceLevel({
    tierId: TIER_3,
    serviceId: SVC_EXPENSE_POLICY,
    serviceLevelId: id("sl"),
    level: "INCLUDED",
    lastModified: TS,
  }),
);
doc = dispatch(
  doc,
  addServiceLevel({
    tierId: TIER_4,
    serviceId: SVC_EXPENSE_POLICY,
    serviceLevelId: id("sl"),
    level: "INCLUDED",
    lastModified: TS,
  }),
);

// Team — T3/T4 only
const teamServices = [
  SVC_CONTRIBUTOR_OPS,
  SVC_MULTI_CURRENCY,
  SVC_DEDICATED_OPS,
];
for (const svcId of teamServices) {
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_1,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "NOT_INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_2,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "NOT_INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_3,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_4,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
}

// Advanced — T4 only
const advancedServices = [
  SVC_MULTI_ENTITY,
  SVC_ACCOUNT_MGR,
  SVC_ADMIN_PORTAL,
  SVC_CUSTOM_WORKFLOWS,
];
for (const svcId of advancedServices) {
  for (const tierId of [TIER_1, TIER_2, TIER_3]) {
    doc = dispatch(
      doc,
      addServiceLevel({
        tierId,
        serviceId: svcId,
        serviceLevelId: id("sl"),
        level: "NOT_INCLUDED",
        lastModified: TS,
      }),
    );
  }
  doc = dispatch(
    doc,
    addServiceLevel({
      tierId: TIER_4,
      serviceId: svcId,
      serviceLevelId: id("sl"),
      level: "INCLUDED",
      lastModified: TS,
    }),
  );
}

// ── Add-On Option Groups ──────────────────────────────────────────────────────

const addAddon = (
  name: string,
  description: string,
  price: number,
  billingCycles: Array<"MONTHLY" | "ONE_TIME">,
) => {
  const ogId = id("og");
  doc = dispatch(
    doc,
    addOptionGroup({
      id: ogId,
      name,
      description,
      isAddOn: true,
      defaultSelected: false,
      costType:
        billingCycles.includes("ONE_TIME") && !billingCycles.includes("MONTHLY")
          ? "SETUP"
          : "RECURRING",
      availableBillingCycles: billingCycles,
      currency: "USD",
      price,
      lastModified: TS,
    }),
  );
  // Set standalone pricing
  const recurringPricing = billingCycles
    .filter((c) => c !== "ONE_TIME")
    .map((billingCycle) => ({
      id: id("rp"),
      billingCycle: billingCycle as "MONTHLY",
      amount: price,
      currency: "USD",
    }));
  const setupCost = billingCycles.includes("ONE_TIME")
    ? { amount: price, currency: "USD" }
    : undefined;
  doc = dispatch(
    doc,
    setOptionGroupStandalonePricing({
      optionGroupId: ogId,
      recurringPricing:
        recurringPricing.length > 0
          ? recurringPricing
          : [
              {
                id: id("rp"),
                billingCycle: "MONTHLY",
                amount: price,
                currency: "USD",
              },
            ],
      setupCost:
        billingCycles.includes("ONE_TIME") && !billingCycles.includes("MONTHLY")
          ? setupCost
          : undefined,
      lastModified: TS,
    }),
  );
  return ogId;
};

// Per-invoice add-on (price = 21 per processed invoice)
addAddon(
  "Invoice Processing (per invoice)",
  "Processed invoice. $21 per invoice.",
  21,
  ["MONTHLY"],
);

// One-time setup add-ons
addAddon(
  "Exchange Account Setup",
  "Centralized exchanges such as Kraken, Coinbase, Binance, Bitfinex, Crypto.com, Nexo.",
  600,
  ["ONE_TIME"],
);
addAddon(
  "Crypto-Friendly Bank Setup",
  "Crypto-friendly banking services setup.",
  1200,
  ["ONE_TIME"],
);
addAddon(
  "Payment Provider & Off-Ramp Setup",
  "Offramps setup — payment provider and off-ramp configuration.",
  600,
  ["ONE_TIME"],
);
addAddon(
  "EOR / PEO Setup",
  "Payroll setup with local Professional Employer Organization providers.",
  600,
  ["ONE_TIME"],
);

// Monthly add-ons
addAddon(
  "Payment Controls & Reconciliation",
  "Setting up crypto payments for 2nd-party approval based on invoices received.",
  300,
  ["MONTHLY"],
);
addAddon(
  "Audit Support",
  "Assistance in coordinating financial information to support external audits.",
  1510,
  ["MONTHLY"],
);
addAddon(
  "Additional Contributor",
  "Additional contributor beyond the plan's base allocation. +$250 per contributor per month.",
  250,
  ["MONTHLY"],
);
addAddon(
  "Supplier & Partner Liaison",
  "For EORs/PEOs and other suppliers to maintain accounts and reduce the risk of getting offboarded.",
  180,
  ["MONTHLY"],
);
addAddon(
  "AML Monitoring & Compliance Reporting",
  "Regular checks on contractors/clients for AML compliance, wallet risk assessment, and compliance reporting.",
  900,
  ["MONTHLY"],
);
addAddon(
  "Contractor Documentation Support",
  "Assist in preparing documents needed by individuals showing income/affiliation for visas, loans, or other purposes.",
  180,
  ["MONTHLY"],
);
addAddon(
  "Invoice Compliance Review",
  "Monitor incoming invoices for compliance to ensure invoices contain everything needed prior to payments.",
  300,
  ["MONTHLY"],
);
addAddon(
  "Card & Spend Operations",
  "Monitor connected accounts, assist with card/user management, and monitor for dubious/restricted transactions.",
  300,
  ["MONTHLY"],
);
addAddon(
  "Virtual Assistant Services",
  "Employ virtual assistants for ad hoc roles, handling withholding taxes, health insurance, bonuses, equipment, etc.",
  3010,
  ["MONTHLY"],
);

// ── Export as .phd ────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";

const now = new Date().toISOString();
const docId = doc.header.id;

const header = {
  branch: "main",
  createdAtUtcIso: now,
  documentType: "powerhouse/service-offering",
  id: docId,
  lastModifiedAtUtcIso: now,
  meta: {},
  name: "OH Pricing - Service Offering",
  revision: {
    document: 0,
    global: doc.operations.global.length,
    header: 0,
    local: 0,
  },
  sig: { nonce: "", publicKey: {} },
  slug: docId,
};

const initialStatePayload = {
  auth: {},
  document: { hash: { algorithm: "sha1", encoding: "base64" }, version: 0 },
  global: {
    id: "",
    operatorId: "",
    resourceTemplateId: null,
    title: "",
    summary: "",
    description: null,
    thumbnailUrl: null,
    infoLink: null,
    status: "DRAFT",
    lastModified: "2024-01-01T00:00:00.000Z",
    availableBillingCycles: [],
    targetAudiences: [],
    facetTargets: [],
    facetBindings: [],
    serviceGroups: [],
    services: [],
    tiers: [],
    optionGroups: [],
    finalConfiguration: null,
  },
  local: {},
};

const currentStatePayload = {
  auth: {},
  document: { hash: { algorithm: "sha1", encoding: "base64" }, version: 0 },
  global: doc.state.global,
  local: doc.state.local,
};

// Build operations.json in the format the importer expects:
// { document: [], global: [...ops], header: [], local: [] }
// Each op needs: action, hash, id, index, skip, timestampUtcMs
const globalOps = doc.operations.global.map((op, idx) => {
  const actionStr = JSON.stringify(op.input ?? {});
  const hash = createHash("sha1").update(actionStr).digest("base64");
  const opId = createHash("md5").update(`${docId}-${idx}`).digest("hex");
  return {
    action: {
      id: op.id ?? opId,
      input: op.input,
      scope: "global",
      timestampUtcMs: TS,
      type: op.type,
    },
    hash,
    id: opId,
    index: idx,
    skip: 0,
    timestampUtcMs: TS,
  };
});

const operationsPayload = {
  document: [],
  global: globalOps,
  header: [],
  local: [],
};

const zip = new JSZip();
zip.file("header.json", JSON.stringify(header, null, 2));
zip.file("state.json", JSON.stringify(initialStatePayload, null, 2));
zip.file("current-state.json", JSON.stringify(currentStatePayload, null, 2));
zip.file("operations.json", JSON.stringify(operationsPayload, null, 2));

const buffer = await zip.generateAsync({ type: "nodebuffer" });
const outPath = "backup-documents/OH-Pricing-Service-Offering.phso.phd";
writeFileSync(outPath, buffer);

console.log(`✅ Written to ${outPath}`);
console.log(`   Document ID : ${docId}`);
console.log(`   Operations  : ${doc.operations.global.length}`);
console.log(`   Tiers       : ${doc.state.global.tiers.length}`);
console.log(`   Services    : ${doc.state.global.services.length}`);
console.log(`   Add-ons     : ${doc.state.global.optionGroups.length}`);
console.log(`   Svc Groups  : ${doc.state.global.serviceGroups.length}`);
