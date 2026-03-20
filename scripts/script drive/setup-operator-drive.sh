#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# setup-operator-drive.sh
#
# Creates a complete operator drive mirroring the Powerhouse staging structure:
#   - Builder profile (isOperator = true)
#   - Folder structure:
#       Snapshot Reports / 2025/
#       Service Subscriptions/
#       Services And Offerings / { Products, Service Offerings }
#       Expense Reports / 2025/
#   - 12 resource templates in Products folder (Operational Hub + 11 others)
#   - 2 service offerings in Service Offerings folder
#   - 5 snapshot reports in Snapshot Reports/2025
#   - 5 expense reports in Expense Reports/2025
#   - Operational Hub template & offering fully populated with data
#
# Prerequisites:
#   - switchboard CLI connected to a running instance (switchboard ping)
#   - python3 (for JSON parsing)
#
# Usage:
#   bash scripts/script\ drive/setup-operator-drive.sh [drive-name]
###############################################################################

DRIVE_NAME="${1:-Powerhouse Operator Team Admin}"

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

die() { err "$@"; exit 1; }

# Parse JSON with python3 (jq not available)
pyjq() {
  python3 -c "import sys,json; $1" 2>&1
}

# Run a switchboard query and return the JSON result
sb_query() {
  switchboard query "$1" --format json 2>&1
}

# Create a document via GraphQL mutation and return its ID
# Usage: create_doc <TypePrefix> <document-name>
create_doc() {
  local type_prefix="$1" name="$2"
  local escaped_name
  escaped_name=$(python3 -c "import json,sys; print(json.dumps(sys.argv[1])[1:-1])" "$name")
  local result
  result=$(sb_query "mutation { ${type_prefix}_createDocument(name: \"$escaped_name\", parentIdentifier: \"$DRIVE_ID\") { id name } }")
  echo "$result" | pyjq "print(json.load(sys.stdin)['${type_prefix}_createDocument']['id'])"
}

# Move a document/folder into a target folder on the drive
move_to_folder() {
  local node_id="$1" folder_id="$2"
  switchboard docs mutate "$DRIVE_ID" --op moveNode \
    --input "{\"srcFolder\": \"$node_id\", \"targetParentFolder\": \"$folder_id\"}" \
    --format json --quiet >/dev/null 2>&1
}

# ── Preflight checks ────────────────────────────────────────────────────────

step "Preflight checks"

command -v switchboard >/dev/null 2>&1 || die "switchboard CLI not found"
command -v python3     >/dev/null 2>&1 || die "python3 not found"

switchboard ping --format json >/dev/null 2>&1 || die "Switchboard not reachable"
log "Switchboard reachable"

# ── Step 1: Create drive ────────────────────────────────────────────────────

step "Step 1: Create drive '$DRIVE_NAME'"

DRIVE_JSON=$(switchboard drives create --name "$DRIVE_NAME" --preferred-editor builder-team-admin --format json 2>&1)
DRIVE_ID=$(echo "$DRIVE_JSON"   | pyjq "print(json.load(sys.stdin)['id'])")
DRIVE_SLUG=$(echo "$DRIVE_JSON" | pyjq "print(json.load(sys.stdin)['slug'])")

[ -n "$DRIVE_ID" ] || die "Failed to create drive"
log "Drive created: ID=$DRIVE_ID  Slug=$DRIVE_SLUG"

# Verify
switchboard drives list --format json 2>/dev/null \
  | pyjq "
data = json.load(sys.stdin)
found = any(d['id'] == '$DRIVE_ID' for d in data)
assert found, 'Drive not found in drives list'
" || die "Drive verification failed"
log "Drive verified in drives list"

# ── Step 2: Create folder structure (8 folders) ─────────────────────────────

step "Step 2: Create folder structure"

# Generate 8 folder IDs
FOLDER_IDS=$(python3 -c "
import uuid
for _ in range(8):
    print(str(uuid.uuid4()))
")
SNAPSHOT_REPORTS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '1p')
SNAPSHOT_2025_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '2p')
SUBSCRIPTIONS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '3p')
SERVICES_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '4p')
PRODUCTS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '5p')
OFFERINGS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '6p')
EXPENSE_REPORTS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '7p')
EXPENSE_2025_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '8p')

# Snapshot Reports
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$SNAPSHOT_REPORTS_FOLDER_ID\", \"name\": \"Snapshot Reports\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Snapshot Reports"

# Snapshot Reports / 2025
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$SNAPSHOT_2025_FOLDER_ID\", \"name\": \"2025\", \"parentFolder\": \"$SNAPSHOT_REPORTS_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Snapshot Reports/2025"

# Service Subscriptions (at root level)
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$SUBSCRIPTIONS_FOLDER_ID\", \"name\": \"Service Subscriptions\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Service Subscriptions"

# Services And Offerings
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$SERVICES_FOLDER_ID\", \"name\": \"Services And Offerings\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Services And Offerings"

# Services And Offerings / Products
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$PRODUCTS_FOLDER_ID\", \"name\": \"Products\", \"parentFolder\": \"$SERVICES_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Services And Offerings/Products"

# Services And Offerings / Service Offerings
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$OFFERINGS_FOLDER_ID\", \"name\": \"Service Offerings\", \"parentFolder\": \"$SERVICES_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Services And Offerings/Service Offerings"

# Expense Reports
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$EXPENSE_REPORTS_FOLDER_ID\", \"name\": \"Expense Reports\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Expense Reports"

# Expense Reports / 2025
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$EXPENSE_2025_FOLDER_ID\", \"name\": \"2025\", \"parentFolder\": \"$EXPENSE_REPORTS_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Expense Reports/2025"

# Verify folder structure
TREE_JSON=$(switchboard docs tree "$DRIVE_SLUG" --format json 2>&1)
FOLDER_COUNT=$(echo "$TREE_JSON" | pyjq "
data = json.load(sys.stdin)
nodes = data['document']['state']['global']['nodes']
folders = [n for n in nodes if n['kind'] == 'folder']
print(len(folders))
")
[ "$FOLDER_COUNT" = "8" ] || die "Expected 8 folders, got $FOLDER_COUNT"
log "Folder structure verified (8 folders)"

# ── Step 3: Create builder profile ──────────────────────────────────────────

step "Step 3: Create builder profile"

BP_JSON=$(sb_query "mutation { BuilderProfile_createDocument(name: \"Powerhouse Operator Profile\", parentIdentifier: \"$DRIVE_ID\") { id name } }")
BP_ID=$(echo "$BP_JSON" | pyjq "print(json.load(sys.stdin)['BuilderProfile_createDocument']['id'])")

[ -n "$BP_ID" ] || die "Failed to create builder profile"
log "Builder profile created: $BP_ID"

# Set isOperator = true
switchboard docs mutate "$BP_ID" --op setOperator \
  --input '{"isOperator": true}' \
  --format json --quiet >/dev/null 2>&1
log "Set isOperator = true"

# Set profile name and slug
BP_SLUG=$(echo "$DRIVE_NAME" | python3 -c "
import sys, re
name = sys.stdin.read().strip()
slug = re.sub(r'[^a-z0-9-]', '', name.lower().replace(' ', '-')).strip('-')
print(slug)
")
BP_CODE=$(python3 -c "
import sys
name = sys.argv[1].strip()
words = name.split()
if len(words) >= 2:
    code = ''.join(w[0] for w in words)[:5]
else:
    w = words[0]
    mid = len(w) // 2
    code = w[0] + w[mid] + w[-1]
print(code.upper())
" "$DRIVE_NAME")

switchboard docs mutate "$BP_ID" --op updateProfile \
  --input "{\"name\": \"$DRIVE_NAME\", \"slug\": \"$BP_SLUG\", \"code\": \"$BP_CODE\"}" \
  --format json --quiet >/dev/null 2>&1
log "Set profile: name='$DRIVE_NAME', slug='$BP_SLUG', code='$BP_CODE'"

# Verify
BP_STATE=$(sb_query "{ BuilderProfile_document(identifier: \"$BP_ID\") { document { id name state { global { isOperator name slug } } } } }")
BP_IS_OP=$(echo "$BP_STATE" | pyjq "
data = json.load(sys.stdin)
g = data['BuilderProfile_document']['document']['state']['global']
print(g.get('isOperator', False))
")
[ "$BP_IS_OP" = "True" ] || die "isOperator not set correctly (got: $BP_IS_OP)"
log "Builder profile verified: isOperator=true"

# ── Step 4: Create resource templates (12) ──────────────────────────────────

step "Step 4: Create resource templates"

# Operational Hub RT — will be fully populated
OH_RT_ID=$(create_doc "ResourceTemplate" "Operational Hub")
log "Resource template: Operational Hub ($OH_RT_ID)"

# Remaining 11 resource templates from staging (created empty)
RT_NAMES=(
  "ALTERNATIVE RISK TRANSFER (ART)"
  "rupert"
  "NETWORK REVENUE GENERATING HUB"
  "Intellectual Property SPV (IP SPV)"
  "COMMERCIAL OPERATIONAL HUB (OH)"
  "NETWORK EMBRYONIC HUB"
  "NETWORK IP SPV"
  "AgentOps"
  "FUNDRAISING VEHICLE  (OCF)"
  "NETWORK OPERATIONAL HUB"
  "REVENUE GENERATING HUB (RGH)"
)

declare -a RT_IDS=()
for name in "${RT_NAMES[@]}"; do
  id=$(create_doc "ResourceTemplate" "$name")
  RT_IDS+=("$id")
  log "Resource template: $name ($id)"
done
log "Created 12 resource templates total"

# ── Step 5: Create service offerings (2) ────────────────────────────────────

step "Step 5: Create service offerings"

OH_SO_ID=$(create_doc "ServiceOffering" "Operational Hub")
log "Service offering: Operational Hub ($OH_SO_ID)"

AGENTIC_SO_ID=$(create_doc "ServiceOffering" "AgenticOps")
log "Service offering: AgenticOps ($AGENTIC_SO_ID)"

# ── Step 6: Create snapshot reports (5) ─────────────────────────────────────

step "Step 6: Create snapshot reports"

SNAPSHOT_NAMES=(
  "April 2025 - Snapshot Report"
  "March 2025 - Snapshot Report"
  "February 2025 - Snapshot Report"
  "July 2025 - Snapshot Report"
  "June 2025 - Snapshot Report"
)

declare -a SNAPSHOT_IDS=()
for name in "${SNAPSHOT_NAMES[@]}"; do
  id=$(create_doc "SnapshotReport" "$name")
  SNAPSHOT_IDS+=("$id")
  log "Snapshot report: $name ($id)"
done

# ── Step 7: Create expense reports (5) ──────────────────────────────────────

step "Step 7: Create expense reports"

EXPENSE_NAMES=(
  "11-2025 Powerhouse"
  "12-2025 Powerhouse"
  "07-2025 Powerhouse"
  "10-2025 Powerhouse"
  "08-2025 Powerhouse"
)

declare -a EXPENSE_IDS=()
for name in "${EXPENSE_NAMES[@]}"; do
  id=$(create_doc "ExpenseReport" "$name")
  EXPENSE_IDS+=("$id")
  log "Expense report: $name ($id)"
done

# ── Step 8: Move documents to correct folders ───────────────────────────────

step "Step 8: Move documents to folders"

# Resource templates → Products
move_to_folder "$OH_RT_ID" "$PRODUCTS_FOLDER_ID"
for id in "${RT_IDS[@]}"; do
  move_to_folder "$id" "$PRODUCTS_FOLDER_ID"
done
log "Moved 12 resource templates → Products"

# Service offerings → Service Offerings
move_to_folder "$OH_SO_ID" "$OFFERINGS_FOLDER_ID"
move_to_folder "$AGENTIC_SO_ID" "$OFFERINGS_FOLDER_ID"
log "Moved 2 service offerings → Service Offerings"

# Snapshot reports → Snapshot Reports/2025
for id in "${SNAPSHOT_IDS[@]}"; do
  move_to_folder "$id" "$SNAPSHOT_2025_FOLDER_ID"
done
log "Moved 5 snapshot reports → Snapshot Reports/2025"

# Expense reports → Expense Reports/2025
for id in "${EXPENSE_IDS[@]}"; do
  move_to_folder "$id" "$EXPENSE_2025_FOLDER_ID"
done
log "Moved 5 expense reports → Expense Reports/2025"

# Verify file count
TREE_JSON=$(switchboard docs tree "$DRIVE_SLUG" --format json 2>&1)
FILE_COUNT=$(echo "$TREE_JSON" | pyjq "
data = json.load(sys.stdin)
nodes = data['document']['state']['global']['nodes']
files = [n for n in nodes if n['kind'] == 'file']
print(len(files))
")
log "File count: $FILE_COUNT (expected 25: 1 profile + 12 RT + 2 SO + 5 snapshots + 5 expenses)"

# ── Step 9: Set operator on documents ───────────────────────────────────────

step "Step 9: Set operator (builder profile) on documents"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Set operator on all resource templates
switchboard docs mutate "$OH_RT_ID" --op setOperator \
  --input "{\"operatorId\": \"$BP_ID\", \"lastModified\": \"$TIMESTAMP\"}" \
  --format json --quiet >/dev/null 2>&1
for id in "${RT_IDS[@]}"; do
  switchboard docs mutate "$id" --op setOperator \
    --input "{\"operatorId\": \"$BP_ID\", \"lastModified\": \"$TIMESTAMP\"}" \
    --format json --quiet >/dev/null 2>&1
done
log "Set operator on 12 resource templates"

# Set operator on all service offerings
switchboard docs mutate "$OH_SO_ID" --op setOperator \
  --input "{\"operatorId\": \"$BP_ID\", \"lastModified\": \"$TIMESTAMP\"}" \
  --format json --quiet >/dev/null 2>&1
switchboard docs mutate "$AGENTIC_SO_ID" --op setOperator \
  --input "{\"operatorId\": \"$BP_ID\", \"lastModified\": \"$TIMESTAMP\"}" \
  --format json --quiet >/dev/null 2>&1
log "Set operator on 2 service offerings"

# Verify operator on Operational Hub RT
RT_STATE=$(sb_query "{ ResourceTemplate_document(identifier: \"$OH_RT_ID\") { document { state { global { operatorId } } } } }")
RT_OP_ID=$(echo "$RT_STATE" | pyjq "
data = json.load(sys.stdin)
print(data['ResourceTemplate_document']['document']['state']['global'].get('operatorId', ''))
")
if [ "$RT_OP_ID" = "$BP_ID" ]; then
  log "Operational Hub RT operatorId verified"
else
  warn "Operational Hub RT operatorId mismatch: got '$RT_OP_ID', expected '$BP_ID'"
fi

# Verify operator on Operational Hub SO
SO_STATE=$(sb_query "{ ServiceOffering_document(identifier: \"$OH_SO_ID\") { document { state { global { operatorId } } } } }")
SO_OP_ID=$(echo "$SO_STATE" | pyjq "
data = json.load(sys.stdin)
print(data['ServiceOffering_document']['document']['state']['global'].get('operatorId', ''))
")
if [ "$SO_OP_ID" = "$BP_ID" ]; then
  log "Operational Hub SO operatorId verified"
else
  warn "Operational Hub SO operatorId mismatch: got '$SO_OP_ID', expected '$BP_ID'"
fi

# ── Step 10: Populate Operational Hub data ──────────────────────────────────

step "Step 10: Populate Operational Hub documents"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/populate-operator-documents.sh" "$OH_RT_ID" "$OH_SO_ID" "$BP_ID"

# ── Final summary ───────────────────────────────────────────────────────────

step "Final drive tree"
switchboard docs tree "$DRIVE_SLUG" 2>&1 || true

echo ""
step "Summary"
log "Drive:              $DRIVE_NAME (ID: $DRIVE_ID, Slug: $DRIVE_SLUG)"
log "Builder Profile:    $BP_ID (isOperator: true)"
log "Resource Templates: 12 total (Operational Hub populated, 11 empty)"
log "Service Offerings:  2 total (Operational Hub populated, AgenticOps empty)"
log "Snapshot Reports:   5 (empty)"
log "Expense Reports:    5 (empty)"
CONNECT_URL="http://localhost:3001"
SWITCHBOARD_URL="http://localhost:4001"
echo ""
log "Open in Connect:"
echo -e "  ${CYAN}${CONNECT_URL}/?driveUrl=${SWITCHBOARD_URL}/d/${DRIVE_SLUG}${NC}"
echo ""
log "Done!"
