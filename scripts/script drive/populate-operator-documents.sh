#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# populate-operator-documents.sh
#
# Populates a resource template and service offering with full Operational Hub
# data. Called by setup-operator-drive.sh after document creation.
#
# Usage:
#   bash populate-operator-documents.sh <RT_ID> <SO_ID> <BP_ID>
###############################################################################

RT_ID="${1:?Usage: $0 <RT_ID> <SO_ID> <BP_ID>}"
SO_ID="${2:?Usage: $0 <RT_ID> <SO_ID> <BP_ID>}"
BP_ID="${3:?Usage: $0 <RT_ID> <SO_ID> <BP_ID>}"

# ── Helpers ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}  ✓${NC} $*"; }
warn() { echo -e "${YELLOW}  !${NC} $*"; }
err()  { echo -e "${RED}  ✗${NC} $*" >&2; }
step() { echo -e "\n${CYAN}━━━ $* ━━━${NC}"; }
die()  { err "$@"; exit 1; }

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Mutate a document using --input-file (reads JSON from stdin)
mutate() {
  local doc_id="$1" op="$2"
  local tmpfile
  tmpfile=$(mktemp /tmp/sb-input-XXXXXX.json)
  cat > "$tmpfile"
  switchboard docs mutate "$doc_id" --op "$op" --input-file "$tmpfile" --format json --quiet >/dev/null 2>&1 \
    || { err "Failed: mutate $doc_id $op"; rm -f "$tmpfile"; return 1; }
  rm -f "$tmpfile"
}

###############################################################################
# RESOURCE TEMPLATE
###############################################################################

step "Populating Resource Template ($RT_ID)"

# ── Template Info ────────────────────────────────────────────────────────────

mutate "$RT_ID" updateTemplateInfo <<EOF
{
  "title": "Operational Hub",
  "summary": "A turnkey legal and operational setup for open-source builder teams — entity formation, invoicing, payouts, and compliance bundled under one roof.",
  "description": "A ready-to-use operational setup that gives open-source and public-goods builder teams the legal and financial infrastructure to receive funding, pay contributors, and operate compliantly from day one.\n\nStructured as a Swiss Association — a cost-efficient, privacy-preserving legal form with strong international recognition — the Operational Hub reduces personal liability for contributors, simplifies compliance, and provides a professional foundation for teams that are already doing the work.",
  "thumbnailUrl": "https://staging.achra.com/_next/image?url=%2Fservices%2Fcovers%2Fcover-02.jpg&w=3840&q=75&dpl=dpl_FjkVSKv1rrWGpfaa2yG8PPxLE1Na",
  "lastModified": "$TIMESTAMP"
}
EOF
log "Template info set"

# ── Template Status ──────────────────────────────────────────────────────────

mutate "$RT_ID" updateTemplateStatus <<EOF
{"status": "ACTIVE", "lastModified": "$TIMESTAMP"}
EOF
log "Template status: ACTIVE"

# ── Target Audiences ─────────────────────────────────────────────────────────

mutate "$RT_ID" addTargetAudience <<EOF
{"id": "02aad85b-88d4-4d55-b841-d9e739c54a77", "label": "Builders", "color": "#0ea5e9", "lastModified": "$TIMESTAMP"}
EOF
mutate "$RT_ID" addTargetAudience <<EOF
{"id": "2a9d36ae-000d-4a61-8361-8f85d34edf5f", "label": "Networks", "color": "#10b981", "lastModified": "$TIMESTAMP"}
EOF
log "Target audiences: Builders, Networks"

# ── Facet Targets ────────────────────────────────────────────────────────────

mutate "$RT_ID" setFacetTarget <<EOF
{"id": "df976250-6b17-4f0b-b60c-34cca38d9156", "categoryKey": "sno-function", "categoryLabel": "SNO Function", "selectedOptions": ["Operational Hub for Open Source Builders", "Operational Hub"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$RT_ID" setFacetTarget <<EOF
{"id": "c9aa8cc9-40bf-4b52-9ac0-4434061583a2", "categoryKey": "legal-entity", "categoryLabel": "Legal Entity", "selectedOptions": ["Swiss Association", "BVI Entity"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$RT_ID" setFacetTarget <<EOF
{"id": "a519bba5-09df-461e-9364-0dd2ea3c2fb5", "categoryKey": "anonymity", "categoryLabel": "Anonymity", "selectedOptions": ["High", "Highest"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$RT_ID" setFacetTarget <<EOF
{"id": "9a57462a-678c-4c21-b2f4-578851f95cbf", "categoryKey": "team", "categoryLabel": "Team", "selectedOptions": ["Remote", "Local"], "lastModified": "$TIMESTAMP"}
EOF
log "Facet targets: sno-function, legal-entity, anonymity, team"

# ── Setup Services ───────────────────────────────────────────────────────────

mutate "$RT_ID" setSetupServices <<EOF
{"services": ["Registered address (Zug)", "VAT documentation", "Contract templates", "Swiss Association setup with local counsel"], "lastModified": "$TIMESTAMP"}
EOF
log "Setup services (4)"

# ── Recurring Services ───────────────────────────────────────────────────────

mutate "$RT_ID" setRecurringServices <<EOF
{"services": ["Annual tax filing", "Reimbursement management", "Invoice management", "Monthly accounting & close", "Monthly expense reports", "Expense policies (role-based)", "Contributor onboarding & operations", "Multi-currency payouts", "Dedicated ops support", "Multiple entities", "Dedicated account manager", "Admin portal", "Custom workflows & reporting"], "lastModified": "$TIMESTAMP"}
EOF
log "Recurring services (13)"

# ── FAQs ─────────────────────────────────────────────────────────────────────

mutate "$RT_ID" addFaq <<EOF
{"id": "fd3c1dbc-8c7c-4202-9417-154b4f26bb04", "question": "What is an Operational Hub?", "answer": "A ready-to-use, non-commercial entity that serves as a coordination and execution hub with essential legal and operational infrastructure for open-source and public-goods builder teams.", "displayOrder": 0}
EOF
mutate "$RT_ID" addFaq <<EOF
{"id": "d0d661ca-0a9d-422a-a41f-a5848165695a", "question": "Who is this for?", "answer": "Builder teams, open-source projects, and DAOs that receive grants or donations, pay contributors, or hold a treasury — and need a legal and operational structure to do so properly. Particularly well suited to globally distributed teams that want to operate under a recognized legal framework without setting up a traditional company.", "displayOrder": 1}
EOF
mutate "$RT_ID" addFaq <<EOF
{"id": "628fcf58-a69e-4cc6-b387-db1fd0148ab7", "question": "Do contributors need to reveal their identity?", "answer": "Contributors are not publicly identified. Swiss Associations do not list members in a public registry. However, contributor identities are disclosed to legal counsel (attorney-client privilege) and the operator for KYB/KYC compliance purposes.", "displayOrder": 2}
EOF
mutate "$RT_ID" addFaq <<EOF
{"id": "41f93228-2c7a-4bd8-933f-0cd8f3474a98", "question": "How does setup work?", "answer": "After an initial consultation, the process includes KYB/KYC verification, a founding meeting with licensed Swiss counsel, and entity registration. Once the entity is created, ongoing operational services begin immediately.", "displayOrder": 3}
EOF
mutate "$RT_ID" addFaq <<EOF
{"id": "65df910d-d6eb-4a7d-97e3-a2052633e1f2", "question": "What's the difference between Starter and Standard?", "answer": "Starter (\$750/mo) is designed for early-stage teams and includes entity formation, financial operations, and up to 5 invoices per month. Standard (\$1,250/mo + \$250/contributor) is for growing teams of 3+ and adds contributor onboarding, multi-currency payouts, dedicated ops support, expense policies, and unlimited invoicing.", "displayOrder": 4}
EOF
log "FAQs (5)"

# ── Content Sections ─────────────────────────────────────────────────────────

mutate "$RT_ID" addContentSection <<EOF
{"id": "ace1fdae-8fae-e7de-89af-b11b4484a6f0", "title": "Why a Swiss Association?", "content": "Swiss Associations are a flexible, cost-efficient legal form well suited to open-source and public-goods teams. They offer independent legal personhood, privacy protections (members are not listed in a public registry), democratic governance, international recognition, and low administrative overhead.\n\nUnlike a traditional company, a Swiss Association is non-commercial — it cannot carry out exclusively commercial activities, receive equity investments, or distribute profits. For teams receiving grants, paying contributors, and building public goods, this is the right legal fit.", "displayOrder": 0, "lastModified": "$TIMESTAMP"}
EOF
mutate "$RT_ID" addContentSection <<EOF
{"id": "ba96235c-ba48-22b6-5320-d278bd6bb2cd", "title": "What's Included", "content": "Every Operational Hub subscription includes entity formation and ongoing operational support.\n\nFormation & Setup: Swiss association formation with licensed counsel, a registered address in Zug, legal document templates, and VAT documentation.\n\nOngoing Operations: Financial management (invoicing, accounting, expense reporting, tax filing), contributor operations (onboarding, multi-currency payouts, expense policies), and dedicated operational support.\n\nAdvanced & Custom: For scaling organizations — multiple entity support, a dedicated account manager, admin portal, and custom workflows. Add-ons available for exchange setup, banking, AML monitoring, and more.", "displayOrder": 1, "lastModified": "$TIMESTAMP"}
EOF
mutate "$RT_ID" addContentSection <<EOF
{"id": "78ef2f6b-22f1-295a-0e88-cd5d0fe1c679", "title": "Privacy & Liability Protection", "content": "Contributors work through the entity, not as individuals — avoiding the risk of being treated as a general partnership where each person carries unlimited personal liability.\n\nMembers of a Swiss Association are not listed in any public registry. While identities are known to legal counsel and the operator for KYB/KYC compliance, they are not publicly disclosed.\n\nA legal entity protects against the majority of operational and contractual liability. It does not protect against gross negligence, willful misconduct, or criminal liability.", "displayOrder": 2, "lastModified": "$TIMESTAMP"}
EOF
log "Content sections (3)"

log "Resource Template populated"

###############################################################################
# SERVICE OFFERING
###############################################################################

step "Populating Service Offering ($SO_ID)"

# Tier IDs (defined early so they can be used in option group tier pricing)
ESSENTIALS_TIER="62530b23-f0b9-49f6-beee-0730d6ff2fb6"
STARTER_TIER="7728d31a-3190-42fc-b76c-37bba1d25085"
STANDARD_TIER="2521782c-120b-49bd-be3e-14e86fd4eeb1"
CUSTOM_TIER="4a94171e-9abe-4cae-ad40-375ad18a5c7a"

# ── Offering Info ────────────────────────────────────────────────────────────

mutate "$SO_ID" updateOfferingInfo <<EOF
{
  "title": "Operational Hub",
  "summary": "A turnkey legal and operational setup for open-source builder teams — entity formation, invoicing, payouts, and compliance bundled under one roof.",
  "description": "A ready-to-use operational setup that gives open-source and public-goods builder teams the legal and financial infrastructure to receive funding, pay contributors, and operate compliantly from day one.\n\nStructured as a Swiss Association — a cost-efficient, privacy-preserving legal form with strong international recognition — the Operational Hub reduces personal liability for contributors, simplifies compliance, and provides a professional foundation for teams that are already doing the work.",
  "thumbnailUrl": "https://staging.achra.com/_next/image?url=%2Fservices%2Fcovers%2Fcover-02.jpg&w=3840&q=75&dpl=dpl_FjkVSKv1rrWGpfaa2yG8PPxLE1Na",
  "lastModified": "$TIMESTAMP"
}
EOF
log "Offering info set"

# ── Offering Status ──────────────────────────────────────────────────────────

mutate "$SO_ID" updateOfferingStatus <<EOF
{"status": "ACTIVE", "lastModified": "$TIMESTAMP"}
EOF
log "Offering status: ACTIVE"

# ── Link to Resource Template ────────────────────────────────────────────────

mutate "$SO_ID" selectResourceTemplate <<EOF
{"resourceTemplateId": "$RT_ID", "lastModified": "$TIMESTAMP"}
EOF
log "Linked to resource template"

# ── Billing Cycles ───────────────────────────────────────────────────────────

mutate "$SO_ID" setAvailableBillingCycles <<EOF
{"billingCycles": ["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
log "Billing cycles: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL"

# ── Facet Targets ────────────────────────────────────────────────────────────

mutate "$SO_ID" setFacetTarget <<EOF
{"id": "1c4c7002-e263-4f2b-8e7f-193975a25d7c", "categoryKey": "sno-function", "categoryLabel": "SNO Function", "selectedOptions": ["Operational Hub"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" setFacetTarget <<EOF
{"id": "be9d299b-be2f-4d71-8d24-559d77a0c7ca", "categoryKey": "legal-entity", "categoryLabel": "Legal Entity", "selectedOptions": ["Swiss Association"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" setFacetTarget <<EOF
{"id": "4e112a9c-64a9-44ca-8c59-c2e3c21e20eb", "categoryKey": "team", "categoryLabel": "Team", "selectedOptions": ["Remote"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" setFacetTarget <<EOF
{"id": "99cd71c3-23ae-4714-994b-8e4f64e6d1fd", "categoryKey": "anonymity", "categoryLabel": "Anonymity", "selectedOptions": ["High"], "lastModified": "$TIMESTAMP"}
EOF
log "Facet targets (4)"

# ── Option Groups ────────────────────────────────────────────────────────────

mutate "$SO_ID" addOptionGroup <<EOF
{"id": "b569d93b-d93b-4cf7-9205-d98b80f2ecd8", "name": "Core Tools & Documentation", "description": "Free tools for legal documentation, invoicing, budgeting, and needs assessment.", "isAddOn": false, "defaultSelected": true, "costType": "RECURRING", "availableBillingCycles": ["MONTHLY","QUARTERLY","SEMI_ANNUAL","ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addOptionGroup <<EOF
{"id": "4f215157-a75f-4cab-ab91-a6ea708ce474", "name": "Entity & Compliance Foundation", "description": "One-time entity formation: Swiss Association setup, registered address in Zug, and VAT registration.", "isAddOn": false, "defaultSelected": true, "costType": "SETUP", "availableBillingCycles": ["ONE_TIME"], "price": 3000, "currency": "USD", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addOptionGroup <<EOF
{"id": "076744ed-c6a1-4ecd-b15e-e241c6fed82e", "name": "Financial Operations & Reporting", "description": "Ongoing financial management: tax filing, invoicing, accounting, expense reporting, and reimbursements.", "isAddOn": false, "defaultSelected": true, "costType": "RECURRING", "availableBillingCycles": ["MONTHLY","QUARTERLY","SEMI_ANNUAL","ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addOptionGroup <<EOF
{"id": "45cb921f-e2e7-4043-ae54-a4b9f44be415", "name": "Team & Contributor Operations", "description": "Contributor onboarding, multi-currency payouts, and dedicated ops support for distributed teams.", "isAddOn": false, "defaultSelected": true, "costType": "RECURRING", "availableBillingCycles": ["MONTHLY","QUARTERLY","SEMI_ANNUAL","ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addOptionGroup <<EOF
{"id": "0894f5e4-a03d-42f6-8e86-672fd6b7d46f", "name": "Advanced & Scale Features", "description": "Enterprise features: multiple entities, dedicated account manager, admin portal, and custom workflows.", "isAddOn": false, "defaultSelected": true, "costType": "RECURRING", "availableBillingCycles": ["MONTHLY","QUARTERLY","SEMI_ANNUAL","ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addOptionGroup <<EOF
{"id": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "name": "Financial Operations & Reporting", "description": "Add-on: Exchange/bank setup, payment infrastructure, EOR/PEO, reconciliation, and audit support.", "isAddOn": true, "defaultSelected": false, "costType": "RECURRING", "availableBillingCycles": ["MONTHLY","QUARTERLY","SEMI_ANNUAL","ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addOptionGroup <<EOF
{"id": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "name": "Advanced & Scale Add-On", "description": "Add-on: Supplier liaison, AML monitoring, compliance, card operations, and legal counsel.", "isAddOn": true, "defaultSelected": false, "costType": "RECURRING", "availableBillingCycles": ["MONTHLY","QUARTERLY","SEMI_ANNUAL","ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addOptionGroup <<EOF
{"id": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "name": "Virtual Assistant Services", "description": "Add-on: AI-powered information retrieval, document generation, workflow execution, and reporting.", "isAddOn": true, "defaultSelected": false, "costType": "RECURRING", "availableBillingCycles": ["MONTHLY","QUARTERLY","SEMI_ANNUAL","ANNUAL"], "lastModified": "$TIMESTAMP"}
EOF
log "Option groups (8)"

# ── Option Group Standalone Pricing ──────────────────────────────────────────

# Entity & Compliance Foundation — setup cost 3000 USD
mutate "$SO_ID" setOptionGroupStandalonePricing <<EOF
{"optionGroupId": "4f215157-a75f-4cab-ab91-a6ea708ce474", "setupCost": {"amount": 3000, "currency": "USD"}, "recurringPricing": [], "lastModified": "$TIMESTAMP"}
EOF
log "Standalone pricing: Entity & Compliance Foundation (setup 3000 USD)"

# Financial Operations & Reporting (add-on) — setup 3600 + 1810/cycle
mutate "$SO_ID" setOptionGroupStandalonePricing <<EOF
{"optionGroupId": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "setupCost": {"amount": 3600, "currency": "USD"}, "recurringPricing": [{"id": "8789c155-6c60-46b0-aa87-178c070271ff", "billingCycle": "MONTHLY", "amount": 1810, "currency": "USD"}, {"id": "f54af8e5-3912-43d2-8786-e21e8649a9a1", "billingCycle": "QUARTERLY", "amount": 1810, "currency": "USD"}, {"id": "179ac467-2f47-402e-a738-da90d52a7adb", "billingCycle": "SEMI_ANNUAL", "amount": 1810, "currency": "USD"}, {"id": "e7bbd5a9-ce44-4c84-9111-beefdb1e4560", "billingCycle": "ANNUAL", "amount": 1810, "currency": "USD"}], "lastModified": "$TIMESTAMP"}
EOF
log "Standalone pricing: Financial Ops add-on (setup 3600 + 1810/cycle)"

# Advanced & Scale Add-On — 1860/cycle
mutate "$SO_ID" setOptionGroupStandalonePricing <<EOF
{"optionGroupId": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "recurringPricing": [{"id": "1d59c346-e0a3-4b9a-a074-cb8db7233e55", "billingCycle": "MONTHLY", "amount": 1860, "currency": "USD"}, {"id": "4f9a71b1-0b7e-4dcf-884b-d9c2012bfd5d", "billingCycle": "QUARTERLY", "amount": 1860, "currency": "USD"}, {"id": "0fce5192-aa5d-4341-89b3-45ffe6619d26", "billingCycle": "SEMI_ANNUAL", "amount": 1860, "currency": "USD"}, {"id": "b941059c-2103-4a0b-a56e-86bc7c8878ad", "billingCycle": "ANNUAL", "amount": 1860, "currency": "USD"}], "lastModified": "$TIMESTAMP"}
EOF
log "Standalone pricing: Advanced & Scale Add-On (1860/cycle)"

# Virtual Assistant Services — 3010/cycle
mutate "$SO_ID" setOptionGroupStandalonePricing <<EOF
{"optionGroupId": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "recurringPricing": [{"id": "d62a4db1-fded-41cd-9c28-34bcf2f536db", "billingCycle": "MONTHLY", "amount": 3010, "currency": "USD"}, {"id": "e0e4fc82-9432-4945-b67a-25d30b2848bd", "billingCycle": "QUARTERLY", "amount": 3010, "currency": "USD"}, {"id": "abc76701-b352-4782-b3b6-6d0739930d78", "billingCycle": "SEMI_ANNUAL", "amount": 3010, "currency": "USD"}, {"id": "7d2a3185-fa11-4f10-83cb-e51c2d91816e", "billingCycle": "ANNUAL", "amount": 3010, "currency": "USD"}], "lastModified": "$TIMESTAMP"}
EOF
log "Standalone pricing: Virtual Assistant Services (3010/cycle)"

# ── Option Group Tier-Dependent Pricing ──────────────────────────────────────

# Helper: generate recurring pricing JSON for 4 billing cycles at a given amount
mk_recurring() {
  local amt=$1
  python3 -c "
import uuid, json
cycles = ['MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL']
entries = [{'id': str(uuid.uuid4()), 'billingCycle': c, 'amount': $amt, 'currency': 'USD'} for c in cycles]
print(json.dumps(entries))
"
}

# Pricing breakdown per tier (option group recurring, not including tier base):
#   Essentials (0):   Core=0, Financial=0, Team=0, Advanced=0
#   Starter (750):    Core=0, Financial=750, Team=0, Advanced=0
#   Standard (1250):  Core=0, Financial=550, Team=350, Advanced=350

# Core Tools & Documentation — 0 all tiers (free tools)
OG_CORE="b569d93b-d93b-4cf7-9205-d98b80f2ecd8"
for pair in "$ESSENTIALS_TIER:d30f2f19-ca16-4f21-a1bc-58b76e327179:0" "$STARTER_TIER:99b60847-9d4f-4209-b988-6480567e4530:0" "$STANDARD_TIER:36abbca7-585a-4970-a5c0-0f07c277ab53:0"; do
  IFS=':' read -r tid tpid amt <<< "$pair"
  RP=$(mk_recurring "$amt")
  mutate "$SO_ID" addOptionGroupTierPricing <<EOF
{"optionGroupId": "$OG_CORE", "tierPricingId": "$tpid", "tierId": "$tid", "recurringPricing": $RP, "lastModified": "$TIMESTAMP"}
EOF
done
log "Tier pricing: Core Tools & Documentation (3 tiers @ free)"

# Entity & Compliance Foundation — setup only, no recurring per tier
OG_ENTITY="4f215157-a75f-4cab-ab91-a6ea708ce474"
for pair in "$ESSENTIALS_TIER:d0636421-f52c-442f-86d2-c5c47c8f70c4" "$STARTER_TIER:cbc3ed7c-65e3-4501-aff8-b3b4581a4610" "$STANDARD_TIER:d09d236e-a32f-43d9-9a8d-31d0253050e3"; do
  IFS=':' read -r tid tpid <<< "$pair"
  mutate "$SO_ID" addOptionGroupTierPricing <<EOF
{"optionGroupId": "$OG_ENTITY", "tierPricingId": "$tpid", "tierId": "$tid", "recurringPricing": [], "lastModified": "$TIMESTAMP"}
EOF
done
log "Tier pricing: Entity & Compliance Foundation (3 tiers, setup only)"

# Financial Operations & Reporting — Essentials=0, Starter=750, Standard=550
OG_FINOPS="076744ed-c6a1-4ecd-b15e-e241c6fed82e"
for pair in "$ESSENTIALS_TIER:0f7c52de-4ae7-49f5-93fa-61c3500a4640:0" "$STARTER_TIER:414d9867-8064-4fda-84aa-4fea80750f23:750" "$STANDARD_TIER:a2c42345-762c-4b97-a9f9-bf184d906a0c:550"; do
  IFS=':' read -r tid tpid amt <<< "$pair"
  RP=$(mk_recurring "$amt")
  mutate "$SO_ID" addOptionGroupTierPricing <<EOF
{"optionGroupId": "$OG_FINOPS", "tierPricingId": "$tpid", "tierId": "$tid", "recurringPricing": $RP, "lastModified": "$TIMESTAMP"}
EOF
done
log "Tier pricing: Financial Ops & Reporting (Essentials=free, Starter=750, Standard=550)"

# Team & Contributor Operations — Essentials=0, Starter=0, Standard=350
OG_TEAM="45cb921f-e2e7-4043-ae54-a4b9f44be415"
for pair in "$ESSENTIALS_TIER:ed84bf98-225e-4c1f-9395-3557ed4f614a:0" "$STARTER_TIER:c59d491a-601c-4c67-a1b5-5c231664aa95:0" "$STANDARD_TIER:17fdecd5-221a-477e-882d-6352adb49188:350"; do
  IFS=':' read -r tid tpid amt <<< "$pair"
  RP=$(mk_recurring "$amt")
  mutate "$SO_ID" addOptionGroupTierPricing <<EOF
{"optionGroupId": "$OG_TEAM", "tierPricingId": "$tpid", "tierId": "$tid", "recurringPricing": $RP, "lastModified": "$TIMESTAMP"}
EOF
done
log "Tier pricing: Team & Contributor Ops (Essentials=free, Starter=free, Standard=350)"

# Advanced & Scale Features — Essentials=0, Starter=0, Standard=350
OG_ADV="0894f5e4-a03d-42f6-8e86-672fd6b7d46f"
for pair in "$ESSENTIALS_TIER:227b20b9-4edd-40da-9856-c9a6a2d89e03:0" "$STARTER_TIER:b97846e2-bd1a-40bb-833c-392572c8fdc6:0" "$STANDARD_TIER:51721efc-d35c-42a4-a392-dffd6354393e:350"; do
  IFS=':' read -r tid tpid amt <<< "$pair"
  RP=$(mk_recurring "$amt")
  mutate "$SO_ID" addOptionGroupTierPricing <<EOF
{"optionGroupId": "$OG_ADV", "tierPricingId": "$tpid", "tierId": "$tid", "recurringPricing": $RP, "lastModified": "$TIMESTAMP"}
EOF
done
log "Tier pricing: Advanced & Scale (Essentials=free, Starter=free, Standard=350)"

# ── Services ─────────────────────────────────────────────────────────────────

# Essentials group
mutate "$SO_ID" addService <<EOF
{"id": "0c4a026a-07ea-48c5-ae1a-a3bfda696881", "title": "Legal Document Templates", "description": "Professionally drafted contract templates for contributor agreements, internal Multisig Agreements, and other operational needs.", "isSetupFormation": false, "optionGroupId": "b569d93b-d93b-4cf7-9205-d98b80f2ecd8", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "c7d5fd36-6294-43a0-a48b-b30db8befaf4", "title": "Global Invoice generator", "description": "A global invoice generation tool that creates professionally structured invoices following international best practices, while remaining independent from any specific legal or tax jurisdiction.", "isSetupFormation": false, "optionGroupId": "b569d93b-d93b-4cf7-9205-d98b80f2ecd8", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "960a5814-a1f7-41a2-96e8-6ee39ace7c5f", "title": "Budget generator", "description": "A budget planning tool that helps organizations allocate resources across teams, projects, and categories following financial best practices, with defined budget categories and time horizons.", "isSetupFormation": false, "optionGroupId": "b569d93b-d93b-4cf7-9205-d98b80f2ecd8", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "70cc2100-3843-4449-b422-174f5f3cbabd", "title": "Needs analysis", "description": "A guided self-assessment to help teams evaluate their operational and legal needs before choosing a plan.", "isSetupFormation": false, "optionGroupId": "b569d93b-d93b-4cf7-9205-d98b80f2ecd8", "lastModified": "$TIMESTAMP"}
EOF

# Formation & Setup group
mutate "$SO_ID" addService <<EOF
{"id": "583c4d12-6b9b-422e-97ed-8ba2895e6950", "title": "Swiss association setup", "description": "Formation of a Swiss Association with the support of a Swiss licensed counsel. Includes onboarding checklist, use of templates for founding documents and articles of association, a workshop, and a founding meeting with counsel.", "isSetupFormation": true, "optionGroupId": "4f215157-a75f-4cab-ab91-a6ea708ce474", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "f67111bc-a0af-45be-9220-8ff1d1c8e05d", "title": "Registered address (Zug)", "description": "A registered legal address in Zug, Switzerland for the entity.", "isSetupFormation": true, "optionGroupId": "4f215157-a75f-4cab-ab91-a6ea708ce474", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "41ecaf72-b84e-449b-a561-916424740a4c", "title": "VAT registration", "description": "VAT registration and issuance of a VAT number. If the entity is not registered in the Commercial registry, the VAT ID may serve as the company identification number with customers and suppliers.", "isSetupFormation": true, "optionGroupId": "4f215157-a75f-4cab-ab91-a6ea708ce474", "lastModified": "$TIMESTAMP"}
EOF

# Financial Operations group
mutate "$SO_ID" addService <<EOF
{"id": "db3d3cd6-591e-4bc7-83eb-2b2ed26ab55a", "title": "Annual tax filing and VAT reporting", "description": "Structured support for Swiss annual tax compliance and VAT reporting (by default, quarterly), handled by licensed tax professionals, coordinated through our operational framework. Documentation for Swiss VAT reporting, ensuring that all relevant invoices, payment records, and transaction classifications are properly maintained to support accurate VAT filings and potential audits by the Swiss Federal Tax Administration (FTA).", "isSetupFormation": false, "optionGroupId": "076744ed-c6a1-4ecd-b15e-e241c6fed82e", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "f0a3fb67-dd66-4303-b749-217d69f3aa5f", "title": "Reimbursement management", "description": "Expense tracking and reimbursement workflows.", "isSetupFormation": false, "optionGroupId": "076744ed-c6a1-4ecd-b15e-e241c6fed82e", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "d60a7e1f-d9e5-40f3-9172-3b246646c7b7", "title": "Invoice management", "description": "End-to-end handling of invoices from submission and approval to accounting and payment.", "isSetupFormation": false, "optionGroupId": "076744ed-c6a1-4ecd-b15e-e241c6fed82e", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "05894260-606a-491b-95b5-646a39fbb71a", "title": "Monthly accounting & close", "description": "Reconciliation of transactions, validation of balances, and accurate financial records in the accounting system for reporting and decision-making.", "isSetupFormation": false, "optionGroupId": "076744ed-c6a1-4ecd-b15e-e241c6fed82e", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "7eaa226b-5156-4ceb-a5e8-9cb8850551f1", "title": "Monthly expense report", "description": "A report of all expenses incurred during the month, categorized and reviewed to provide visibility into spending and budget performance.", "isSetupFormation": false, "optionGroupId": "076744ed-c6a1-4ecd-b15e-e241c6fed82e", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "dfe25adf-eb55-4eb1-9434-2c8a6d2d9a79", "title": "Expense Policies", "description": "Defined rules governing how expenses are submitted, approved, and reimbursed.", "isSetupFormation": false, "optionGroupId": "076744ed-c6a1-4ecd-b15e-e241c6fed82e", "lastModified": "$TIMESTAMP"}
EOF

# Contributor Operations group
mutate "$SO_ID" addService <<EOF
{"id": "060de4c6-003f-4db0-b0b3-73bc1eee3667", "title": "Contributor onboarding and operations", "description": "Operational processes to onboard contributors, manage contracts, and payment details.", "isSetupFormation": false, "optionGroupId": "45cb921f-e2e7-4043-ae54-a4b9f44be415", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "6527d83a-ac0b-4e01-9a43-448d444fd982", "title": "Multi-currency payouts", "description": "Crypto-to-fiat conversions with 48-hour transfers in USD, GBP, EUR, CHF, and DKK. Additional currencies available upon request.", "isSetupFormation": false, "optionGroupId": "45cb921f-e2e7-4043-ae54-a4b9f44be415", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "afe19ef7-ee82-492d-9814-e427bf19c72a", "title": "Dedicated ops support", "description": "Dedicated operational support with an assigned point of contact for handling day-to-day financial and administrative requests.", "isSetupFormation": false, "optionGroupId": "45cb921f-e2e7-4043-ae54-a4b9f44be415", "lastModified": "$TIMESTAMP"}
EOF

# Advanced & Custom group
mutate "$SO_ID" addService <<EOF
{"id": "309cbb23-e978-452f-bca2-dc4995993a48", "title": "Multiple entities", "description": "Operational support across multiple legal entities, with consolidated oversight and coordinated financial workflows.", "isSetupFormation": false, "optionGroupId": "0894f5e4-a03d-42f6-8e86-672fd6b7d46f", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "2e7d934b-2324-4ab9-8e72-37bf64488841", "title": "Dedicated account manager", "description": "A dedicated account manager for overseeing the relationship and coordinating ongoing requests.", "isSetupFormation": false, "optionGroupId": "0894f5e4-a03d-42f6-8e86-672fd6b7d46f", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "ceaf4759-63f3-488e-bb1d-6ba6ce7919fa", "title": "Admin portal", "description": "An informative admin portal providing visibility into billing, active services, and key operational documents.", "isSetupFormation": false, "optionGroupId": "0894f5e4-a03d-42f6-8e86-672fd6b7d46f", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "43a9473a-a217-4e67-9b26-31e1c6cbb2b5", "title": "Custom workflows & reporting", "description": "Tailored operational workflows and reporting structures.", "isSetupFormation": false, "optionGroupId": "0894f5e4-a03d-42f6-8e86-672fd6b7d46f", "lastModified": "$TIMESTAMP"}
EOF

# Setup & Infrastructure group
mutate "$SO_ID" addService <<EOF
{"id": "7b892ca8-3781-43a5-8535-d19022dba5c2", "title": "Exchange account setup", "description": "Setup of centralized exchange accounts (Kraken, Coinbase, Binance, Bitfinex, Crypto.com, Nexo).", "isSetupFormation": false, "optionGroupId": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "9df512e6-d003-40bf-ba7d-642b3297dbab", "title": "Crypto-friendly bank setup", "description": "Crypto-friendly banking services setup.", "isSetupFormation": false, "optionGroupId": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "df8a6ed0-f1d3-4b98-8916-0167d4f5a8f6", "title": "Payment provider & off-ramp setup", "description": "Off-ramp setup for fiat conversion.", "isSetupFormation": false, "optionGroupId": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "89733dc9-b855-4250-bb2e-d0a25fab0266", "title": "EOR/PEO setup", "description": "Payroll setup with local Professional Employer Organization providers.", "isSetupFormation": false, "optionGroupId": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "0819dd5e-2eab-45cd-87e0-2d3d73a838ba", "title": "Payment controls & reconciliation", "description": "Setting up crypto payments for second-party approval based on invoices received.", "isSetupFormation": false, "optionGroupId": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "5b7956e2-808e-414d-bd1d-5fa8c38881e7", "title": "Audit support", "description": "Assistance in coordinating financial information to support external audits.", "isSetupFormation": false, "optionGroupId": "d9a9ca46-a603-487c-ad00-a6b2fb25b81c", "lastModified": "$TIMESTAMP"}
EOF

# Compliance & Risk group
mutate "$SO_ID" addService <<EOF
{"id": "f31e6ba6-4457-4d8b-8ba6-0ee1a56357ee", "title": "Supplier & partner liaison", "description": "Maintaining accounts with EORs/PEOs and other suppliers to reduce the risk of being offboarded.", "isSetupFormation": false, "optionGroupId": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "267f9fff-5d50-48cc-a29a-be7b60948f73", "title": "AML monitoring & compliance reporting", "description": "Regular checks on contractors and clients for sanctions, PEP status, and other compliance flags. Monitoring of connected wallets for risk assessment. Regular compliance reports.", "isSetupFormation": false, "optionGroupId": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "6a353e64-b8a7-451e-854f-4d22b1a7bf6c", "title": "Contractor documentation support", "description": "Assist in preparing documents needed by individuals showing income/affiliation for visas, loans, or other purposes.", "isSetupFormation": false, "optionGroupId": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "397cc5c1-4c49-4ca0-9d83-b872a1adad6c", "title": "Invoice compliance review", "description": "Monitor incoming invoices for compliance to make sure invoices contain everything needed under local law prior to payment.", "isSetupFormation": false, "optionGroupId": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "c6687ae3-3fc4-4a2e-b927-4beb8afba421", "title": "Card & spend operations", "description": "Monitor connected accounts, assist with creating new cards/users, and monitor for dubious/restricted transactions.", "isSetupFormation": false, "optionGroupId": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "56d73f9a-6a51-4e20-993f-d44f6de53ce1", "title": "Legal Counsel advice", "description": "Five additional hours of legal advice provided by Swiss counsel.", "isSetupFormation": false, "optionGroupId": "830bca2e-e230-48d5-b9ff-f93779ebf5be", "lastModified": "$TIMESTAMP"}
EOF

# AI Operations group
mutate "$SO_ID" addService <<EOF
{"id": "cb301072-23ff-47fe-bef7-8be3dc10b7b8", "title": "Information Retrieval", "description": "Finds, compiles, and summarizes information from connected sources on request", "displayOrder": 1, "isSetupFormation": false, "optionGroupId": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "8acde3a7-ef03-4698-aee4-35a1d4a891f7", "title": "Document Generation", "description": "Produces structured documents from templates, data inputs, or natural language instructions", "isSetupFormation": false, "optionGroupId": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "05fd3d8d-e448-41ad-b25f-b56cea574f0e", "title": "Data Entry & Form Completion", "description": "Fills forms, updates records, and populates fields across connected systems", "isSetupFormation": false, "optionGroupId": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "5ef19c2f-b42f-4e14-8c93-dad35d9db421", "title": "Workflow Execution", "description": "Runs multi-step processes autonomously end-to-end based on triggers or instructions", "isSetupFormation": false, "optionGroupId": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "72bb76d7-7bcc-42fd-b652-3b79b4d51295", "title": "Task Routing & Escalation", "description": "Identifies tasks outside scope and hands off to the right human or system with context", "isSetupFormation": false, "optionGroupId": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addService <<EOF
{"id": "44873698-5756-4d3c-86b9-96fe8771b9a3", "title": "Reporting & Summarization", "description": "Aggregates data and produces structured reports or digests on a schedule or on demand", "isSetupFormation": false, "optionGroupId": "ea1d4d3a-3611-471e-9cf8-0b749e63ba81", "lastModified": "$TIMESTAMP"}
EOF
log "Services (32)"

# ── Tiers ────────────────────────────────────────────────────────────────────

mutate "$SO_ID" addTier <<EOF
{"id": "$ESSENTIALS_TIER", "name": "Essentials", "description": "Free tools and self-service resources for any team", "currency": "USD", "isCustomPricing": false, "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addTier <<EOF
{"id": "$STARTER_TIER", "name": "Starter", "description": "For early-stage teams needing entity formation and basic financial operations", "currency": "USD", "isCustomPricing": false, "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addTier <<EOF
{"id": "$STANDARD_TIER", "name": "Standard", "description": "For growing teams of 3+ with full contributor operations and dedicated support", "currency": "USD", "isCustomPricing": false, "lastModified": "$TIMESTAMP"}
EOF
log "Tiers: Essentials, Starter, Standard"

# ── Tier Pricing & Defaults ─────────────────────────────────────────────────

mutate "$SO_ID" updateTierPricing <<EOF
{"tierId": "$STARTER_TIER", "amount": 750, "currency": "USD", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" updateTierPricing <<EOF
{"tierId": "$STANDARD_TIER", "amount": 1250, "currency": "USD", "lastModified": "$TIMESTAMP"}
EOF
log "Tier pricing: Starter=750, Standard=1250"

for TIER_ID in "$ESSENTIALS_TIER" "$STARTER_TIER" "$STANDARD_TIER" "$CUSTOM_TIER"; do
  mutate "$SO_ID" setTierDefaultBillingCycle <<EOF
{"tierId": "$TIER_ID", "defaultBillingCycle": "MONTHLY", "lastModified": "$TIMESTAMP"}
EOF
done
log "Default billing cycle: MONTHLY (all tiers)"

# ── Service Levels: Essentials Tier ──────────────────────────────────────────

# Essentials group services
for pair in \
  "ebca726e-1edf-4b79-a295-f6994c074a3f:0c4a026a-07ea-48c5-ae1a-a3bfda696881:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "bd6a797a-943d-4741-bb1f-fee79b6daba5:c7d5fd36-6294-43a0-a48b-b30db8befaf4:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "8ed3fbf0-a5c6-4a32-a8e3-51fd77d5be6a:960a5814-a1f7-41a2-96e8-6ee39ace7c5f:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "c98faf8b-aad6-46be-a78f-40bc9686cfcf:70cc2100-3843-4449-b422-174f5f3cbabd:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "99998c59-7932-4f4d-81e3-dc6803a79732:7b892ca8-3781-43a5-8535-d19022dba5c2:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "41e7eff1-59f6-4a64-87fd-c0c3d3265bf1:9df512e6-d003-40bf-ba7d-642b3297dbab:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "66f67b64-8cbb-4ccb-9f40-59e1f3d71c52:df8a6ed0-f1d3-4b98-8916-0167d4f5a8f6:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "6aa85e1e-ee94-4376-9bca-85c537b427cc:89733dc9-b855-4250-bb2e-d0a25fab0266:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "a5155d24-fc68-4c52-a0b9-be60f77f8d49:0819dd5e-2eab-45cd-87e0-2d3d73a838ba:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "93b70daa-5f3a-4cff-a7cf-0c6cbe6b4a36:5b7956e2-808e-414d-bd1d-5fa8c38881e7:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "8eac69fe-8674-4418-9c1a-762fe05ca935:f31e6ba6-4457-4d8b-8ba6-0ee1a56357ee:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "91bf4471-4648-4667-9863-cdc7003e43d3:267f9fff-5d50-48cc-a29a-be7b60948f73:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "ce961898-1c20-4e5d-921b-6fde72756066:6a353e64-b8a7-451e-854f-4d22b1a7bf6c:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "4573b55a-272a-4394-8bc7-2b0eeb3255ce:397cc5c1-4c49-4ca0-9d83-b872a1adad6c:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "4f3f3c36-740f-499a-936a-c42afdcff1fa:c6687ae3-3fc4-4a2e-b927-4beb8afba421:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "6c435de2-b9e5-45fc-b08c-68b588471a18:56d73f9a-6a51-4e20-993f-d44f6de53ce1:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "46710869-4ef6-41c3-8720-a13df1c43c10:cb301072-23ff-47fe-bef7-8be3dc10b7b8:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "451d86b8-0193-4f89-b23a-3994ffe97ade:8acde3a7-ef03-4698-aee4-35a1d4a891f7:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "34a29fe3-a396-46ce-b939-6cc94650f0b3:05fd3d8d-e448-41ad-b25f-b56cea574f0e:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "af4219d9-ed70-400a-9ce7-b4ff7b555112:5ef19c2f-b42f-4e14-8c93-dad35d9db421:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "cae8da22-a461-4114-874f-4342daba5d6c:72bb76d7-7bcc-42fd-b652-3b79b4d51295:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "9fe6a1e8-96fd-402d-ae28-d05a151f3a01:44873698-5756-4d3c-86b9-96fe8771b9a3:ea1d4d3a-3611-471e-9cf8-0b749e63ba81"
do
  IFS=':' read -r sl_id svc_id og_id <<< "$pair"
  mutate "$SO_ID" addServiceLevel <<EOF
{"tierId": "$ESSENTIALS_TIER", "serviceLevelId": "$sl_id", "serviceId": "$svc_id", "level": "INCLUDED", "optionGroupId": "$og_id", "lastModified": "$TIMESTAMP"}
EOF
done
log "Essentials tier: 22 service levels"

# ── Service Levels: Starter Tier ─────────────────────────────────────────────

for pair in \
  "6be42a6b-0fd3-4b1c-af69-997607e9d15d:0c4a026a-07ea-48c5-ae1a-a3bfda696881:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "a7cdf3bb-d1bb-4e70-aafa-66918bcf9a4d:c7d5fd36-6294-43a0-a48b-b30db8befaf4:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "307421fb-48f8-4875-888a-d6e74108b796:960a5814-a1f7-41a2-96e8-6ee39ace7c5f:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "7b8f6769-422d-40a2-80e8-defb63ddda9d:70cc2100-3843-4449-b422-174f5f3cbabd:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "d425b8dc-5883-4c9f-9c36-ad3f2868a604:583c4d12-6b9b-422e-97ed-8ba2895e6950:4f215157-a75f-4cab-ab91-a6ea708ce474" \
  "ee50d7db-9935-4b8d-95ef-0ba6f7f7c8da:f67111bc-a0af-45be-9220-8ff1d1c8e05d:4f215157-a75f-4cab-ab91-a6ea708ce474" \
  "647e709f-d241-43aa-988f-99a8f9a00bef:41ecaf72-b84e-449b-a561-916424740a4c:4f215157-a75f-4cab-ab91-a6ea708ce474" \
  "ee629b74-aecc-4cb7-8a1b-1fe2be80980f:db3d3cd6-591e-4bc7-83eb-2b2ed26ab55a:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "66c03dd1-5eb9-4b69-b469-9180f165396f:f0a3fb67-dd66-4303-b749-217d69f3aa5f:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "b01607f1-3f3d-496a-8b82-31069e9cece5:d60a7e1f-d9e5-40f3-9172-3b246646c7b7:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "94ad5473-25c4-4a2c-95e6-9df3c1eea911:05894260-606a-491b-95b5-646a39fbb71a:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "023724bf-b1f1-4f84-956c-8ea7fdd5ae93:7eaa226b-5156-4ceb-a5e8-9cb8850551f1:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "a7beab16-0221-4d3a-9905-51213bcdf8ad:7b892ca8-3781-43a5-8535-d19022dba5c2:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "c846fdaf-f2b9-4924-8162-a866190681c4:9df512e6-d003-40bf-ba7d-642b3297dbab:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "635357a2-852c-4487-97e3-72a5ce54fab3:df8a6ed0-f1d3-4b98-8916-0167d4f5a8f6:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "61830989-f5c0-4bb6-bf88-d1b5cafa402e:89733dc9-b855-4250-bb2e-d0a25fab0266:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "a9c2a726-7b54-439a-b6c8-68989d8fd5a4:0819dd5e-2eab-45cd-87e0-2d3d73a838ba:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "59df8e25-7dd7-4918-a3a3-15852e97a8b1:5b7956e2-808e-414d-bd1d-5fa8c38881e7:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "83c55eec-49a5-46fd-af8e-8123ba9ca5e6:f31e6ba6-4457-4d8b-8ba6-0ee1a56357ee:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "6b19465d-ee40-44a3-b366-ca59cfafc690:267f9fff-5d50-48cc-a29a-be7b60948f73:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "661f42cc-6ed1-4281-bd5c-6f8ffee7f4fc:6a353e64-b8a7-451e-854f-4d22b1a7bf6c:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "450840c8-15c8-4b40-9ce7-179aaadca1eb:397cc5c1-4c49-4ca0-9d83-b872a1adad6c:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "28ecc679-1ebd-4eb0-ae06-ec885dca39f5:c6687ae3-3fc4-4a2e-b927-4beb8afba421:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "55049473-ec0f-4a0d-b202-eaf0df6922d6:56d73f9a-6a51-4e20-993f-d44f6de53ce1:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "15a79254-1848-46f5-9a79-3ffeb92f772a:cb301072-23ff-47fe-bef7-8be3dc10b7b8:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "c69f4d94-161c-47ad-adec-d964fdf4be79:8acde3a7-ef03-4698-aee4-35a1d4a891f7:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "0f9ad1b0-aeda-43d3-b329-1fe94abd2e24:05fd3d8d-e448-41ad-b25f-b56cea574f0e:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "8df45a89-393a-4bb9-b2c0-8a88156ead6b:5ef19c2f-b42f-4e14-8c93-dad35d9db421:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "db00dcb4-b66e-4765-b4da-b84116d1790a:72bb76d7-7bcc-42fd-b652-3b79b4d51295:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "9588ff32-f2bb-4ae3-8a17-4fef856abea0:44873698-5756-4d3c-86b9-96fe8771b9a3:ea1d4d3a-3611-471e-9cf8-0b749e63ba81"
do
  IFS=':' read -r sl_id svc_id og_id <<< "$pair"
  mutate "$SO_ID" addServiceLevel <<EOF
{"tierId": "$STARTER_TIER", "serviceLevelId": "$sl_id", "serviceId": "$svc_id", "level": "INCLUDED", "optionGroupId": "$og_id", "lastModified": "$TIMESTAMP"}
EOF
done
log "Starter tier: 30 service levels"

# Starter tier usage limit
mutate "$SO_ID" addUsageLimit <<EOF
{"tierId": "$STARTER_TIER", "limitId": "aa10928c-7e1d-4917-9528-87249e00910d", "serviceId": "d60a7e1f-d9e5-40f3-9172-3b246646c7b7", "metric": "Invoice(s)", "unitName": "Invoice(s)", "freeLimit": 5, "paidLimit": 10, "resetCycle": "MONTHLY", "unitPrice": 21, "unitPriceCurrency": "USD", "lastModified": "$TIMESTAMP"}
EOF
log "Starter tier: usage limit (invoices)"

# ── Service Levels: Standard Tier ────────────────────────────────────────────

for pair in \
  "cff58708-dd37-4c10-9f7d-e3f0f00c197b:0c4a026a-07ea-48c5-ae1a-a3bfda696881:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "264f12a4-3568-40d3-816e-83d596545fd0:c7d5fd36-6294-43a0-a48b-b30db8befaf4:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "e521ec69-6b2e-42ca-9d7b-51fc4b34f59b:960a5814-a1f7-41a2-96e8-6ee39ace7c5f:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "f386318c-59a1-49bf-9145-fe2bb7f1eb29:70cc2100-3843-4449-b422-174f5f3cbabd:b569d93b-d93b-4cf7-9205-d98b80f2ecd8" \
  "7aaa069e-037d-45f8-a547-5385f2505ca6:583c4d12-6b9b-422e-97ed-8ba2895e6950:4f215157-a75f-4cab-ab91-a6ea708ce474" \
  "0399aed2-2192-44be-821f-6fe16e329e9a:f67111bc-a0af-45be-9220-8ff1d1c8e05d:4f215157-a75f-4cab-ab91-a6ea708ce474" \
  "13fd779f-9c45-4460-8c8e-90f3af973be6:41ecaf72-b84e-449b-a561-916424740a4c:4f215157-a75f-4cab-ab91-a6ea708ce474" \
  "3d3d8e56-c41c-47ed-876f-735046fefcd3:db3d3cd6-591e-4bc7-83eb-2b2ed26ab55a:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "f363aec0-63e3-40e0-be0c-a063ae09d8ca:f0a3fb67-dd66-4303-b749-217d69f3aa5f:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "709586df-ac6b-4d20-ae03-fdabd41c4dbc:d60a7e1f-d9e5-40f3-9172-3b246646c7b7:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "a2a6fdaa-4c3c-45ce-8545-a10d95062afa:05894260-606a-491b-95b5-646a39fbb71a:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "212970b3-ecd4-46b8-ad8d-770a9fca2e81:7eaa226b-5156-4ceb-a5e8-9cb8850551f1:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "c22d7e4d-320e-4a10-8536-e66a3731f507:dfe25adf-eb55-4eb1-9434-2c8a6d2d9a79:076744ed-c6a1-4ecd-b15e-e241c6fed82e" \
  "b45dade5-7c15-493e-b876-39cfb234d609:060de4c6-003f-4db0-b0b3-73bc1eee3667:45cb921f-e2e7-4043-ae54-a4b9f44be415" \
  "329ad638-494b-4877-ba3f-2116c6fa81f5:6527d83a-ac0b-4e01-9a43-448d444fd982:45cb921f-e2e7-4043-ae54-a4b9f44be415" \
  "42ab8332-bed1-4ced-bdc6-61181e7beca1:afe19ef7-ee82-492d-9814-e427bf19c72a:45cb921f-e2e7-4043-ae54-a4b9f44be415" \
  "e1a3b5c7-9d2f-4e8a-b6c4-1f0d8e7a2b59:309cbb23-e978-452f-bca2-dc4995993a48:0894f5e4-a03d-42f6-8e86-672fd6b7d46f" \
  "a4d8f2e6-3b7c-41a9-8e5d-6c9f0b2a1d73:2e7d934b-2324-4ab9-8e72-37bf64488841:0894f5e4-a03d-42f6-8e86-672fd6b7d46f" \
  "c7f1a9b3-5e4d-42c8-96a7-2d8b0e3f5c16:ceaf4759-63f3-488e-bb1d-6ba6ce7919fa:0894f5e4-a03d-42f6-8e86-672fd6b7d46f" \
  "b2e6d4a8-1c9f-43b7-a5e3-7f0c8d1b6a24:43a9473a-a217-4e67-9b26-31e1c6cbb2b5:0894f5e4-a03d-42f6-8e86-672fd6b7d46f" \
  "14784011-2ac9-4f02-a37e-568824b2bd49:7b892ca8-3781-43a5-8535-d19022dba5c2:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "86dd1390-d1d0-43e6-ac0a-eac1b212d456:9df512e6-d003-40bf-ba7d-642b3297dbab:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "9e51f5dc-08cc-4fae-9ccc-79594ee3abcc:df8a6ed0-f1d3-4b98-8916-0167d4f5a8f6:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "5b717f4d-ba1a-4826-88ca-16146b083717:0819dd5e-2eab-45cd-87e0-2d3d73a838ba:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "9c45726e-a363-461c-acd1-11631b3ed2e3:5b7956e2-808e-414d-bd1d-5fa8c38881e7:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "d001f23f-aa63-475b-8b0d-2e39373069bc:f31e6ba6-4457-4d8b-8ba6-0ee1a56357ee:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "b613d313-f01b-4470-addd-9093cda815a9:6a353e64-b8a7-451e-854f-4d22b1a7bf6c:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "73af2b75-d5f9-44e2-a8bd-a14c9004d682:397cc5c1-4c49-4ca0-9d83-b872a1adad6c:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "38d55ca2-5d3a-4b2a-b3a4-418342269b9f:c6687ae3-3fc4-4a2e-b927-4beb8afba421:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "a00eb24a-3c7f-484f-8f83-b6379a286965:cb301072-23ff-47fe-bef7-8be3dc10b7b8:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "b08839db-3b97-42b5-8eb8-782842bab720:267f9fff-5d50-48cc-a29a-be7b60948f73:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "1ee656f5-bb5b-4414-a564-79f1d31d65eb:56d73f9a-6a51-4e20-993f-d44f6de53ce1:830bca2e-e230-48d5-b9ff-f93779ebf5be" \
  "37b01d40-0832-447b-9edd-b119d4cb80fd:89733dc9-b855-4250-bb2e-d0a25fab0266:d9a9ca46-a603-487c-ad00-a6b2fb25b81c" \
  "782cafa6-9bb6-4f88-9247-d94c16a32d35:8acde3a7-ef03-4698-aee4-35a1d4a891f7:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "c3730db4-f03c-4ec1-beba-6afec6b47909:05fd3d8d-e448-41ad-b25f-b56cea574f0e:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "8b5754c4-83cd-4256-b4a6-2b5f8fef2ab9:5ef19c2f-b42f-4e14-8c93-dad35d9db421:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "d865741e-889b-409a-b0c3-99f4513427cc:72bb76d7-7bcc-42fd-b652-3b79b4d51295:ea1d4d3a-3611-471e-9cf8-0b749e63ba81" \
  "dd4f8d53-0d82-4a81-97e3-eb9008776d9f:44873698-5756-4d3c-86b9-96fe8771b9a3:ea1d4d3a-3611-471e-9cf8-0b749e63ba81"
do
  IFS=':' read -r sl_id svc_id og_id <<< "$pair"
  mutate "$SO_ID" addServiceLevel <<EOF
{"tierId": "$STANDARD_TIER", "serviceLevelId": "$sl_id", "serviceId": "$svc_id", "level": "INCLUDED", "optionGroupId": "$og_id", "lastModified": "$TIMESTAMP"}
EOF
done
log "Standard tier: 38 service levels"

# Standard tier usage limits
mutate "$SO_ID" addUsageLimit <<EOF
{"tierId": "$STANDARD_TIER", "limitId": "06260a0a-3c4e-4165-8e2d-e456526d7e76", "serviceId": "d60a7e1f-d9e5-40f3-9172-3b246646c7b7", "metric": "Invoice(s)", "unitName": "Invoice(s)", "freeLimit": 50, "paidLimit": 100, "resetCycle": "MONTHLY", "unitPrice": 21, "unitPriceCurrency": "USD", "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" addUsageLimit <<EOF
{"tierId": "$STANDARD_TIER", "limitId": "35367da0-9147-44aa-8cea-8bd592524c4c", "serviceId": "060de4c6-003f-4db0-b0b3-73bc1eee3667", "metric": "Contributor(s)", "unitName": "Contributor(s)", "freeLimit": 1, "paidLimit": 1, "resetCycle": "MONTHLY", "unitPrice": 250, "unitPriceCurrency": "USD", "lastModified": "$TIMESTAMP"}
EOF
log "Standard tier: 2 usage limits (invoices, contributors)"

# ── Custom Tier ──────────────────────────────────────────────────────────────

mutate "$SO_ID" addTier <<EOF
{"id": "$CUSTOM_TIER", "name": "Custom", "description": "Enterprise-grade with custom workflows, multiple entities, and dedicated management", "currency": "USD", "isCustomPricing": true, "lastModified": "$TIMESTAMP"}
EOF
mutate "$SO_ID" setTierDefaultBillingCycle <<EOF
{"tierId": "$CUSTOM_TIER", "defaultBillingCycle": "MONTHLY", "lastModified": "$TIMESTAMP"}
EOF
log "Tier: Custom (custom pricing)"

# Custom tier mirrors Standard tier service levels (with unique IDs generated at runtime)
python3 -c "
import uuid
# Standard tier service/optionGroup pairs (34 total)
standard_pairs = [
    ('0c4a026a-07ea-48c5-ae1a-a3bfda696881','b569d93b-d93b-4cf7-9205-d98b80f2ecd8'),
    ('c7d5fd36-6294-43a0-a48b-b30db8befaf4','b569d93b-d93b-4cf7-9205-d98b80f2ecd8'),
    ('960a5814-a1f7-41a2-96e8-6ee39ace7c5f','b569d93b-d93b-4cf7-9205-d98b80f2ecd8'),
    ('70cc2100-3843-4449-b422-174f5f3cbabd','b569d93b-d93b-4cf7-9205-d98b80f2ecd8'),
    ('583c4d12-6b9b-422e-97ed-8ba2895e6950','4f215157-a75f-4cab-ab91-a6ea708ce474'),
    ('f67111bc-a0af-45be-9220-8ff1d1c8e05d','4f215157-a75f-4cab-ab91-a6ea708ce474'),
    ('41ecaf72-b84e-449b-a561-916424740a4c','4f215157-a75f-4cab-ab91-a6ea708ce474'),
    ('db3d3cd6-591e-4bc7-83eb-2b2ed26ab55a','076744ed-c6a1-4ecd-b15e-e241c6fed82e'),
    ('f0a3fb67-dd66-4303-b749-217d69f3aa5f','076744ed-c6a1-4ecd-b15e-e241c6fed82e'),
    ('d60a7e1f-d9e5-40f3-9172-3b246646c7b7','076744ed-c6a1-4ecd-b15e-e241c6fed82e'),
    ('05894260-606a-491b-95b5-646a39fbb71a','076744ed-c6a1-4ecd-b15e-e241c6fed82e'),
    ('7eaa226b-5156-4ceb-a5e8-9cb8850551f1','076744ed-c6a1-4ecd-b15e-e241c6fed82e'),
    ('dfe25adf-eb55-4eb1-9434-2c8a6d2d9a79','076744ed-c6a1-4ecd-b15e-e241c6fed82e'),
    ('060de4c6-003f-4db0-b0b3-73bc1eee3667','45cb921f-e2e7-4043-ae54-a4b9f44be415'),
    ('6527d83a-ac0b-4e01-9a43-448d444fd982','45cb921f-e2e7-4043-ae54-a4b9f44be415'),
    ('afe19ef7-ee82-492d-9814-e427bf19c72a','45cb921f-e2e7-4043-ae54-a4b9f44be415'),
    ('309cbb23-e978-452f-bca2-dc4995993a48','0894f5e4-a03d-42f6-8e86-672fd6b7d46f'),
    ('2e7d934b-2324-4ab9-8e72-37bf64488841','0894f5e4-a03d-42f6-8e86-672fd6b7d46f'),
    ('ceaf4759-63f3-488e-bb1d-6ba6ce7919fa','0894f5e4-a03d-42f6-8e86-672fd6b7d46f'),
    ('43a9473a-a217-4e67-9b26-31e1c6cbb2b5','0894f5e4-a03d-42f6-8e86-672fd6b7d46f'),
    ('7b892ca8-3781-43a5-8535-d19022dba5c2','d9a9ca46-a603-487c-ad00-a6b2fb25b81c'),
    ('9df512e6-d003-40bf-ba7d-642b3297dbab','d9a9ca46-a603-487c-ad00-a6b2fb25b81c'),
    ('df8a6ed0-f1d3-4b98-8916-0167d4f5a8f6','d9a9ca46-a603-487c-ad00-a6b2fb25b81c'),
    ('0819dd5e-2eab-45cd-87e0-2d3d73a838ba','d9a9ca46-a603-487c-ad00-a6b2fb25b81c'),
    ('5b7956e2-808e-414d-bd1d-5fa8c38881e7','d9a9ca46-a603-487c-ad00-a6b2fb25b81c'),
    ('89733dc9-b855-4250-bb2e-d0a25fab0266','d9a9ca46-a603-487c-ad00-a6b2fb25b81c'),
    ('f31e6ba6-4457-4d8b-8ba6-0ee1a56357ee','830bca2e-e230-48d5-b9ff-f93779ebf5be'),
    ('267f9fff-5d50-48cc-a29a-be7b60948f73','830bca2e-e230-48d5-b9ff-f93779ebf5be'),
    ('6a353e64-b8a7-451e-854f-4d22b1a7bf6c','830bca2e-e230-48d5-b9ff-f93779ebf5be'),
    ('397cc5c1-4c49-4ca0-9d83-b872a1adad6c','830bca2e-e230-48d5-b9ff-f93779ebf5be'),
    ('c6687ae3-3fc4-4a2e-b927-4beb8afba421','830bca2e-e230-48d5-b9ff-f93779ebf5be'),
    ('56d73f9a-6a51-4e20-993f-d44f6de53ce1','830bca2e-e230-48d5-b9ff-f93779ebf5be'),
    ('cb301072-23ff-47fe-bef7-8be3dc10b7b8','ea1d4d3a-3611-471e-9cf8-0b749e63ba81'),
    ('8acde3a7-ef03-4698-aee4-35a1d4a891f7','ea1d4d3a-3611-471e-9cf8-0b749e63ba81'),
    ('05fd3d8d-e448-41ad-b25f-b56cea574f0e','ea1d4d3a-3611-471e-9cf8-0b749e63ba81'),
    ('5ef19c2f-b42f-4e14-8c93-dad35d9db421','ea1d4d3a-3611-471e-9cf8-0b749e63ba81'),
    ('72bb76d7-7bcc-42fd-b652-3b79b4d51295','ea1d4d3a-3611-471e-9cf8-0b749e63ba81'),
    ('44873698-5756-4d3c-86b9-96fe8771b9a3','ea1d4d3a-3611-471e-9cf8-0b749e63ba81'),
]
for svc_id, og_id in standard_pairs:
    sl_id = str(uuid.uuid4())
    print(f'{sl_id}:{svc_id}:{og_id}')
" | while IFS=':' read -r sl_id svc_id og_id; do
  mutate "$SO_ID" addServiceLevel <<EOF
{"tierId": "$CUSTOM_TIER", "serviceLevelId": "$sl_id", "serviceId": "$svc_id", "level": "INCLUDED", "optionGroupId": "$og_id", "lastModified": "$TIMESTAMP"}
EOF
done
log "Custom tier: 38 service levels (mirrors Standard)"

# ── Done ─────────────────────────────────────────────────────────────────────

step "Population complete"
log "Resource Template: $RT_ID"
log "Service Offering:  $SO_ID"
