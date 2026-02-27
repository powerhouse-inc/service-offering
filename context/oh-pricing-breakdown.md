# OH Pricing — Service Offering Breakdown
> Reference document for manually filling out the Service Offering Editor.
> Source: `OH Pricing-source-of-truth-v2.xlsx - Truth.csv`

---

## TIERS

Four subscription tiers. The editor expects: **name**, **description**, **amount**, **currency**, and **usage limits** per tier.

| # | Name | Monthly Price | Notes |
|---|------|---------------|-------|
| 1 | **Essentials** | $0 | Free entry tier. Solo exploration use. |
| 2 | **Starter** | $750 | + one-time setup fee. Early stage. |
| 3 | **Standard** | $1,250 | + $250/contributor + one-time setup fee. Growing teams of 3+. |
| 4 | **Custom** | Custom Pricing | Negotiated. Scaling organizations. |

### Tier Target Audiences (for `targetAudiences` field)
- `Exploration & Solo Use` — Essentials
- `Early Stage Organizations` — Starter
- `Growing Operations (3+ team)` — Standard
- `Scaling Organizations` — Custom

---

## SERVICE GROUPS

The editor organizes services into groups (mapped to `parentServiceId` hierarchy or visual grouping). Use these four groups derived from the CSV's `Offer Category (internal use)` column:

### Group 1: Core Tools & Documentation
> Free access across all tiers. No setup or recurring cost.

| Service | Description |
|---------|-------------|
| Global Invoice Generator | A global invoice generation tool that creates professionally structured invoices following international best practices, independent from any specific legal or tax jurisdiction. |
| Budget Generator | A budget planning tool that helps organizations allocate resources across teams, projects and categories following financial best practices, with defined budget categories and time horizons. |
| Legal Document Templates | Standardized legal document templates for operational use. |
| Needs Analysis | Initial assessment and recommendations for organizational needs. |

**Tier Availability:** `INCLUDED` in all tiers (Essentials, Starter, Standard, Custom)

---

### Group 2: Entity & Compliance Foundation
> Setup and ongoing compliance services. Available from Starter tier onward.

| Service | Description | Type |
|---------|-------------|------|
| Swiss Association Formation | Formation of a Swiss Association with the support of a Swiss licensed counsel. Includes founding document templates, articles of association, a workshop, and a founding meeting with counsel. | Setup / `isSetupFormation: true` |
| Registered Address (Zug) | Official registered address in Zug, Switzerland. Contract templates included: contributor agreements, internal Multisig Agreements, and other operational needs. | Recurring |
| VAT Documentation | VAT documentation for Swiss VAT reporting. Ensures all relevant invoices, payment records, and transaction classifications are properly maintained to support accurate VAT filings and potential audits by the Swiss Federal Tax Administration (FTA). Note: if entity is not registered in the Commercial registry, the VAT ID may serve as the company identification number. | Recurring |
| Annual Tax Filing + VAT Reporting | Structured support for Swiss annual tax compliance and VAT reporting (default: quarterly), handled by licensed tax professionals, coordinated through our operational framework. | Recurring |

**Tier Availability:** `NOT_INCLUDED` in Essentials; `INCLUDED` in Starter, Standard, Custom

---

### Group 3: Financial Operations & Reporting
> Core financial workflow management. Starter tier gets the base set; Standard unlocks policies.

| Service | Description | Type |
|---------|-------------|------|
| Reimbursement Management | Expense tracking and reimbursement workflows. | Recurring |
| Invoice Management | End-to-end handling of invoices — from submission and approval to accounting and payment. | Recurring |
| Monthly Accounting & Close | Reconciliation of transactions, validation of balances and accurate financial records in accounting system for reporting and decision making. | Recurring |
| Monthly Expense Report | A report of all expenses incurred during the month, categorized and reviewed to provide visibility into spending and budget performance. | Recurring |
| Expense Policies | Defined rules governing how expenses are submitted, approved and reimbursed. | Recurring |

**Tier Availability:**
- Essentials: `NOT_INCLUDED` for all
- Starter: `INCLUDED` for Reimbursement, Invoice, Accounting, Expense Report; `NOT_INCLUDED` for Expense Policies
- Standard & Custom: `INCLUDED` for all

---

### Group 4: Team & Contributor Operations
> People and payment operations. Standard tier and above only.

| Service | Description | Type |
|---------|-------------|------|
| Contributor Onboarding & Operations | Operational processes to onboard contributors, manage contracts and payment details. | Recurring |
| Multi-Currency Payouts | Crypto-to-Fiat Conversions — 48-hour transfers in USD, GBP, EUR, CHF, DKK. Additional currencies available upon request. | Recurring |
| Dedicated Ops Support | Dedicated operational support with an assigned point of contact for handling day-to-day financial and administrative requests. | Recurring |

**Tier Availability:**
- Essentials & Starter: `NOT_INCLUDED`
- Standard & Custom: `INCLUDED`

---

### Group 5: Advanced & Scale Features
> Enterprise-grade capabilities. Custom tier only.

| Service | Description | Type |
|---------|-------------|------|
| Multiple Entities | Operational support across multiple legal entities, with consolidated oversight and coordinated financial workflows. | Recurring |
| Dedicated Account Manager | A dedicated account manager for overseeing the relationship and coordinating ongoing requests. | Recurring |
| Admin Portal | An informative admin portal providing visibility into billing, active services, and key operational documents. | Recurring |
| Custom Workflows & Reporting | Tailored operational workflows and reporting structures. | Recurring |

**Tier Availability:**
- Essentials, Starter, Standard: `NOT_INCLUDED`
- Custom: `INCLUDED`

---

## METRICS / USAGE LIMITS

These map to the editor's **Usage Limits** per tier (`metric`, `freeLimit`, `resetCycle`).

| Metric | Essentials | Starter | Standard | Custom | Reset Cycle | Notes |
|--------|-----------|---------|----------|--------|-------------|-------|
| Contributors | Unlimited (solo use implied) | Included in base | Base included; +$250/contributor add-on | Custom | MONTHLY | Standard tier charges per additional contributor |
| Invoices (processed) | — | — | — | — | MONTHLY | Per-invoice add-on at $21/invoice across all tiers |
| Entities | 1 | 1 | 1 | Multiple | N/A | Multi-entity only in Custom |
| VAT Reporting Cycles | — | Quarterly (default) | Quarterly (default) | Custom | NONE | Annual tax filing + quarterly VAT default |

---

## ADD-ONS

All add-ons are available across all tiers unless noted. Map to `OptionGroup` with `isAddOn: true`.

### Financial Operations Add-Ons

| Add-On Name | Price | Billing | Description |
|-------------|-------|---------|-------------|
| Invoice (processed) | $21.00 | Per invoice | Per processed invoice fee. |
| Exchange Account Setup | $600.00 | One-time | Centralized exchanges: Kraken, Coinbase, Binance, Bitfinex, Crypto.com, Nexo. |
| Crypto-Friendly Bank Setup | $1,200.00 | One-time | Crypto-friendly banking services setup. |
| Payment Provider & Off-Ramp Setup | $600.00 | One-time | Off-ramp setup for fiat conversion providers. |
| EOR / PEO Setup | $600.00 | One-time | Payroll setup with local Professional Employer Organization providers. |
| Payment Controls & Reconciliation | $300.00 | Monthly | Setting up crypto payments for 2nd-party approval based on invoices received. |
| Audit Support | $1,510.00 | Monthly | Assistance in coordinating financial information to support external audits. |

### Team & Contributor Add-Ons

| Add-On Name | Price | Billing | Description |
|-------------|-------|---------|-------------|
| Additional Contributor | $250.00 | Per contributor | Available in Standard tier. Each additional contributor beyond the base included count. |

### Advanced & Scale Add-Ons

| Add-On Name | Price | Billing | Description |
|-------------|-------|---------|-------------|
| Supplier & Partner Liaison | $180.00 | Monthly | For EORs/PEOs and other suppliers to maintain accounts and reduce the risk of being offboarded. |
| AML Monitoring & Compliance Reporting | $900.00 | Monthly | Regular checks on contractors/clients for watchlists (wanted, PEP, sanctioned). Monitoring connected wallets via AML tool. Regular compliance reports. |
| Contractor Documentation Support | $180.00 | Per request | Preparing documents for individuals showing income/affiliation for visas, loans, or other purposes. |
| Invoice Compliance Review | $300.00 | Monthly | Monitor incoming invoices for compliance — ensures invoices contain everything required by local law prior to payment. |
| Card & Spend Operations | $300.00 | Monthly | Monitor connected accounts for top-ups. Assist with new cards/users. Monitor for dubious/restricted transactions (cash withdrawals, crypto purchases, personal expenses). |
| Virtual Assistant Services | $3,010.00 | Monthly (per VA) | Virtual assistants for ad hoc team roles. Handles withholding taxes, health insurance, bonuses, equipment, etc. |

> **Note:** One add-on is incomplete in the source data — "Five additional hours of legal advice provided by Swiss counsel" has no price listed. Excluded from the table above pending pricing confirmation.

---

## EDITOR FILL-OUT GUIDE

### Step-by-Step Order

1. **Scope & Facets Tab** — Select the ResourceTemplate, set target audiences
2. **Service Catalog Tab** — Add services in group order (use groups above as parent services)
   - Add each group as a parent service first (no price, just title + description)
   - Add child services under each group
   - For add-ons: create OptionGroups with `isAddOn: true`
3. **Tier Definition Tab** — Create 4 tiers in order:
   - Essentials ($0), Starter ($750), Standard ($1,250), Custom (0 = negotiated)
   - For each tier: assign service levels (INCLUDED / NOT_INCLUDED / OPTIONAL)
   - For Standard: add usage limit for "Additional Contributors" at $250/contributor
   - For Standard: add usage limit for "Invoices" at $21/invoice
4. **The Matrix Tab** — Review service × tier matrix for correctness

### Key Editor Concepts

| Editor Concept | OH Pricing Equivalent |
|---------------|----------------------|
| `Service` | Individual line items in the CSV (e.g., "Invoice Management") |
| `Service Group / parentServiceId` | Offer Category (Core Tools, Financial Ops, etc.) |
| `OptionGroup (isAddOn: false)` | Core tier service bundles |
| `OptionGroup (isAddOn: true)` | Add-ons section in the CSV |
| `Tier` | Tier 1–4 columns |
| `ServiceLevelBinding` level `INCLUDED` | `TRUE` in CSV |
| `ServiceLevelBinding` level `NOT_INCLUDED` | `-` (dash) in CSV |
| `UsageLimit` | Per-contributor / per-invoice pricing |
| `isSetupFormation: true` | One-time setup services (Swiss Association Formation) |
| `resetCycle: MONTHLY` | Monthly recurring add-ons |
| `resetCycle: NONE` | One-time add-ons |
