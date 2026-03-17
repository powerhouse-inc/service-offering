#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# setup-operator-drive.sh
#
# Creates an operator drive with:
#   - Builder profile (isOperator = true)
#   - Folder structure: Services And Offerings / { Products, Service Offerings }
#   - Resource template in Products folder
#   - Service offering in Service Offerings folder
#   - Both template & offering linked to the builder profile via SET_OPERATOR
#
# Prerequisites:
#   - switchboard CLI connected to a running instance (switchboard ping)
#   - python3 (for JSON parsing)
#
# Usage:
#   bash scripts/script\ drive/setup-operator-drive.sh [drive-name]
###############################################################################

DRIVE_NAME="${1:-operator team}"

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

# ── Step 2: Create folder structure ─────────────────────────────────────────

step "Step 2: Create folder structure"

# Generate folder IDs
FOLDER_IDS=$(python3 -c "
import uuid
for _ in range(4):
    print(str(uuid.uuid4()))
")
SERVICES_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '1p')
PRODUCTS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '2p')
OFFERINGS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '3p')
SUBSCRIPTIONS_FOLDER_ID=$(echo "$FOLDER_IDS" | sed -n '4p')

# Create "Services And Offerings" at root
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$SERVICES_FOLDER_ID\", \"name\": \"Services And Offerings\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Services And Offerings ($SERVICES_FOLDER_ID)"

# Create "Products" subfolder
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$PRODUCTS_FOLDER_ID\", \"name\": \"Products\", \"parentFolder\": \"$SERVICES_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Products ($PRODUCTS_FOLDER_ID)"

# Create "Service Offerings" subfolder
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$OFFERINGS_FOLDER_ID\", \"name\": \"Service Offerings\", \"parentFolder\": \"$SERVICES_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Service Offerings ($OFFERINGS_FOLDER_ID)"

# Create "Service Subscriptions" subfolder (team subfolders created by the resolver)
switchboard docs mutate "$DRIVE_ID" --op addFolder \
  --input "{\"id\": \"$SUBSCRIPTIONS_FOLDER_ID\", \"name\": \"Service Subscriptions\", \"parentFolder\": \"$SERVICES_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Created: Service Subscriptions ($SUBSCRIPTIONS_FOLDER_ID)"

# Verify folder structure
TREE_JSON=$(switchboard docs tree "$DRIVE_SLUG" --format json 2>&1)
FOLDER_COUNT=$(echo "$TREE_JSON" | pyjq "
data = json.load(sys.stdin)
nodes = data['document']['state']['global']['nodes']
folders = [n for n in nodes if n['kind'] == 'folder']
print(len(folders))
")
[ "$FOLDER_COUNT" = "4" ] || die "Expected 4 folders, got $FOLDER_COUNT"
log "Folder structure verified (4 folders)"

# ── Step 3: Create builder profile ──────────────────────────────────────────

step "Step 3: Create builder profile"

BP_JSON=$(sb_query "mutation { BuilderProfile_createDocument(name: \"$DRIVE_NAME\", parentIdentifier: \"$DRIVE_ID\") { id name } }")
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
name = '$DRIVE_NAME'.strip()
words = name.split()
if len(words) >= 2:
    code = ''.join(w[0] for w in words)[:5]
else:
    w = words[0]
    mid = len(w) // 2
    code = w[0] + w[mid] + w[-1]
print(code.upper())
")

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

# ── Step 4: Create resource template and service offering ───────────────────

step "Step 4: Create resource template and service offering"

# Create resource template
RT_JSON=$(sb_query "mutation { ResourceTemplate_createDocument(name: \"Products\", parentIdentifier: \"$DRIVE_ID\") { id name } }")
RT_ID=$(echo "$RT_JSON" | pyjq "print(json.load(sys.stdin)['ResourceTemplate_createDocument']['id'])")

[ -n "$RT_ID" ] || die "Failed to create resource template"
log "Resource template created: $RT_ID"

# Create service offering
SO_JSON=$(sb_query "mutation { ServiceOffering_createDocument(name: \"Offering\", parentIdentifier: \"$DRIVE_ID\") { id name } }")
SO_ID=$(echo "$SO_JSON" | pyjq "print(json.load(sys.stdin)['ServiceOffering_createDocument']['id'])")

[ -n "$SO_ID" ] || die "Failed to create service offering"
log "Service offering created: $SO_ID"

# ── Step 5: Move documents to correct folders ───────────────────────────────

step "Step 5: Move documents to folders"

# Move resource template to Products folder
switchboard docs mutate "$DRIVE_ID" --op moveNode \
  --input "{\"srcFolder\": \"$RT_ID\", \"targetParentFolder\": \"$PRODUCTS_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Moved resource template → Products"

# Move service offering to Service Offerings folder
switchboard docs mutate "$DRIVE_ID" --op moveNode \
  --input "{\"srcFolder\": \"$SO_ID\", \"targetParentFolder\": \"$OFFERINGS_FOLDER_ID\"}" \
  --format json --quiet >/dev/null 2>&1
log "Moved service offering → Service Offerings"

# Verify placement via drive tree
TREE_JSON=$(switchboard docs tree "$DRIVE_SLUG" --format json 2>&1)
PLACEMENT_OK=$(echo "$TREE_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = data['document']['state']['global']['nodes']
node_map = {n['id']: n for n in nodes}
rt = node_map.get('$RT_ID', {})
so = node_map.get('$SO_ID', {})
rt_ok = rt.get('parentFolder') == '$PRODUCTS_FOLDER_ID'
so_ok = so.get('parentFolder') == '$OFFERINGS_FOLDER_ID'
print('OK' if rt_ok and so_ok else 'FAIL')
")
[ "$PLACEMENT_OK" = "OK" ] || die "Document placement verification failed"
log "Document placement verified"

# ── Step 6: Set operator on resource template and service offering ──────────

step "Step 6: Set operator (builder profile) on documents"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Set operator on resource template
switchboard docs mutate "$RT_ID" --op setOperator \
  --input "{\"operatorId\": \"$BP_ID\", \"lastModified\": \"$TIMESTAMP\"}" \
  --format json --quiet >/dev/null 2>&1
log "Set operator on resource template"

# Set operator on service offering
switchboard docs mutate "$SO_ID" --op setOperator \
  --input "{\"operatorId\": \"$BP_ID\", \"lastModified\": \"$TIMESTAMP\"}" \
  --format json --quiet >/dev/null 2>&1
log "Set operator on service offering"

# Verify operator on resource template
RT_STATE=$(sb_query "{ ResourceTemplate_document(identifier: \"$RT_ID\") { document { state { global { operatorId } } } } }")
RT_OP_ID=$(echo "$RT_STATE" | pyjq "
data = json.load(sys.stdin)
print(data['ResourceTemplate_document']['document']['state']['global'].get('operatorId', ''))
")
if [ "$RT_OP_ID" = "$BP_ID" ]; then
  log "Resource template operatorId verified"
else
  warn "Resource template operatorId mismatch: got '$RT_OP_ID', expected '$BP_ID'"
fi

# Verify operator on service offering
SO_STATE=$(sb_query "{ ServiceOffering_document(identifier: \"$SO_ID\") { document { state { global { operatorId } } } } }")
SO_OP_ID=$(echo "$SO_STATE" | pyjq "
data = json.load(sys.stdin)
print(data['ServiceOffering_document']['document']['state']['global'].get('operatorId', ''))
")
if [ "$SO_OP_ID" = "$BP_ID" ]; then
  log "Service offering operatorId verified"
else
  warn "Service offering operatorId mismatch: got '$SO_OP_ID', expected '$BP_ID'"
fi

# ── Step 7: Populate documents with data ─────────────────────────────────────

step "Step 7: Populate documents with Operational Hub data"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/populate-operator-documents.sh" "$RT_ID" "$SO_ID" "$BP_ID"

# ── Final summary ───────────────────────────────────────────────────────────

step "Final drive tree"
switchboard docs tree "$DRIVE_SLUG" 2>&1 || true

echo ""
step "Summary"
log "Drive:             $DRIVE_NAME (ID: $DRIVE_ID, Slug: $DRIVE_SLUG)"
log "Builder Profile:   $BP_ID (isOperator: true)"
log "Resource Template: $RT_ID (operator: $BP_ID) → Products folder"
log "Service Offering:  $SO_ID (operator: $BP_ID) → Service Offerings folder"
CONNECT_URL="http://localhost:3001"
SWITCHBOARD_URL="http://localhost:4001"
echo ""
log "Open in Connect:"
echo -e "  ${CYAN}${CONNECT_URL}/?driveUrl=${SWITCHBOARD_URL}/d/${DRIVE_SLUG}${NC}"
echo ""
log "Done!"
