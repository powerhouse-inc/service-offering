#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# upload-drive.sh
#
# Phase 2 of drive replication: creates a new drive from downloaded data.
# Reads the manifest and document states saved by download-drive.sh.
#
# Prerequisites:
#   - switchboard CLI connected to the TARGET instance
#   - python3
#   - Data directory from download-drive.sh
#
# Usage:
#   bash upload-drive.sh <data-dir> [drive-name]
#
# Example:
#   switchboard profile use local
#   bash upload-drive.sh data/powerhouse-operator-team-admin
###############################################################################

DATA_DIR="${1:?Usage: $0 <data-dir> [drive-name]}"
DRIVE_NAME="${2:-}"

[ -f "$DATA_DIR/manifest.json" ] || { echo "Error: $DATA_DIR/manifest.json not found" >&2; exit 1; }

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

# ── Preflight ────────────────────────────────────────────────────────────────

step "Preflight"

command -v switchboard >/dev/null 2>&1 || die "switchboard CLI not found"
command -v python3     >/dev/null 2>&1 || die "python3 not found"

switchboard ping --format json >/dev/null 2>&1 || die "Switchboard not reachable"
log "Switchboard reachable"
log "Data dir: $DATA_DIR"

# ── Upload ───────────────────────────────────────────────────────────────────

step "Creating drive from downloaded data"

export DATA_DIR DRIVE_NAME

python3 << 'PYEOF'
import subprocess, json, sys, os, tempfile, uuid, datetime

data_dir = os.environ["DATA_DIR"]
drive_name_override = os.environ.get("DRIVE_NAME", "").strip()

G = "\033[0;32m"
Y = "\033[1;33m"
R = "\033[0;31m"
C = "\033[0;36m"
NC = "\033[0m"

def log(msg):  print(f"  {G}✓{NC} {msg}")
def warn(msg): print(f"  {Y}!{NC} {msg}")
def errf(msg): print(f"  {R}✗{NC} {msg}", file=sys.stderr)
def step(msg): print(f"\n{C}━━━ {msg} ━━━{NC}")

# ── Read manifest ────────────────────────────────────────────────────────────

with open(os.path.join(data_dir, "manifest.json")) as f:
    manifest = json.load(f)

drive_name = drive_name_override or manifest["source"]["name"]
log(f"Source: {manifest['source']['slug']} ({manifest['source']['downloadedAt']})")
log(f"Drive name: {drive_name}")
log(f"Documents: {len(manifest['documents'])}, Folders: {len(manifest['folders'])}")

# ── Helpers ──────────────────────────────────────────────────────────────────

def sb_run(*args, check=True):
    """Run switchboard CLI command, return stdout."""
    cmd = ["switchboard"] + list(args)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if check and result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{result.stderr[:500]}")
    return result.stdout

def sb_query(query):
    """Run GraphQL query, return parsed JSON."""
    stdout = sb_run("query", query, "--format", "json")
    return json.loads(stdout) if stdout.strip() else None

def mutate(doc_id, op, input_data):
    """Mutate a document using --input-file."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(input_data, f)
        tmppath = f.name
    try:
        sb_run("docs", "mutate", doc_id, "--op", op,
               "--input-file", tmppath, "--format", "json", "--quiet")
    finally:
        os.unlink(tmppath)

def load_state(doc_id):
    """Load downloaded state for a document."""
    path = os.path.join(data_dir, "states", f"{doc_id}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)

# ID mapping: old staging ID → new local ID
id_map = {}

def map_id(old_id):
    """Resolve an old ID to its new counterpart, or return as-is."""
    if not old_id:
        return old_id
    return id_map.get(old_id, old_id)

timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

# ── Step 1: Create drive ─────────────────────────────────────────────────────

step("Step 1: Create drive")

result = json.loads(sb_run(
    "drives", "create", "--name", drive_name,
    "--preferred-editor", "builder-team-admin", "--format", "json"
))
drive_id = result["id"]
drive_slug = result["slug"]
log(f"Drive: {drive_name} (ID: {drive_id}, Slug: {drive_slug})")

# ── Step 2: Create folders ───────────────────────────────────────────────────

step("Step 2: Create folders")

# Topological sort: parents before children
def sort_folders(folders):
    by_id = {f["id"]: f for f in folders}
    result = []
    visited = set()
    def visit(folder):
        if folder["id"] in visited:
            return
        parent = folder.get("parentFolder")
        if parent and parent in by_id:
            visit(by_id[parent])
        visited.add(folder["id"])
        result.append(folder)
    for f in folders:
        visit(f)
    return result

for folder in sort_folders(manifest["folders"]):
    new_id = str(uuid.uuid4())
    id_map[folder["id"]] = new_id
    inp = {"id": new_id, "name": folder["name"]}
    parent = folder.get("parentFolder")
    if parent:
        inp["parentFolder"] = id_map.get(parent, parent)
    mutate(drive_id, "addFolder", inp)
    log(f"Folder: {folder['name']}")

# ── Step 3: Create documents ─────────────────────────────────────────────────

step("Step 3: Create documents")

def type_to_prefix(doc_type):
    """Convert 'powerhouse/snapshot-report' to 'SnapshotReport'."""
    name = doc_type.split("/")[-1]
    return "".join(word.capitalize() for word in name.split("-"))

TYPE_PREFIX = {
    "powerhouse/builder-profile": "BuilderProfile",
    "powerhouse/resource-template": "ResourceTemplate",
    "powerhouse/service-offering": "ServiceOffering",
    "powerhouse/snapshot-report": "SnapshotReport",
    "powerhouse/expense-report": "ExpenseReport",
}

# Order: builder-profiles first, then RTs, then SOs, then others
type_order = {
    "powerhouse/builder-profile": 0,
    "powerhouse/resource-template": 1,
    "powerhouse/service-offering": 2,
}
docs_sorted = sorted(manifest["documents"], key=lambda d: type_order.get(d["type"], 99))

for doc in docs_sorted:
    prefix = TYPE_PREFIX.get(doc["type"]) or type_to_prefix(doc["type"])
    if not prefix:
        warn(f"Unknown type '{doc['type']}' for '{doc['name']}' — skipping")
        continue
    escaped = doc["name"].replace("\\", "\\\\").replace('"', '\\"')
    try:
        result = sb_query(
            f'mutation {{ {prefix}_createDocument(name: "{escaped}", parentIdentifier: "{drive_id}") {{ id name }} }}'
        )
        new_id = result[f"{prefix}_createDocument"]["id"]
        id_map[doc["id"]] = new_id
        log(f"{doc['name']} ({doc['type']}) → {new_id}")
    except Exception as e:
        errf(f"Failed to create {doc['name']}: {e}")

# ── Step 4: Move documents to folders ─────────────────────────────────────────

step("Step 4: Move documents to folders")

moved = 0
for doc in manifest["documents"]:
    new_doc_id = id_map.get(doc["id"])
    parent = doc.get("parentFolder")
    if not new_doc_id or not parent:
        continue
    new_parent = id_map.get(parent)
    if not new_parent:
        continue
    try:
        mutate(drive_id, "moveNode", {
            "srcFolder": new_doc_id,
            "targetParentFolder": new_parent,
        })
        moved += 1
    except Exception as e:
        warn(f"Failed to move {doc['name']}: {e}")

log(f"Moved {moved} documents to folders")

# ── Step 5: Apply document states ─────────────────────────────────────────────

step("Step 5: Apply document states")

# ── ResourceTemplate ──

def apply_resource_template(old_id, new_id, state):
    if not state:
        return
    ops = 0

    # Template info
    info = {"lastModified": timestamp}
    for key in ("title", "summary", "description", "thumbnailUrl", "infoLink"):
        if state.get(key) is not None:
            info[key] = state[key]
    mutate(new_id, "updateTemplateInfo", info)
    ops += 1

    # Status
    if state.get("status"):
        mutate(new_id, "updateTemplateStatus", {"status": state["status"], "lastModified": timestamp})
        ops += 1

    # Operator
    if state.get("operatorId"):
        mutate(new_id, "setOperator", {"operatorId": map_id(state["operatorId"]), "lastModified": timestamp})
        ops += 1

    # Target audiences
    for aud in state.get("targetAudiences") or []:
        mutate(new_id, "addTargetAudience", {
            "id": aud["id"], "label": aud["label"],
            "color": aud.get("color"), "lastModified": timestamp,
        })
        ops += 1

    # Facet targets
    for ft in state.get("facetTargets") or []:
        mutate(new_id, "setFacetTarget", {
            "id": ft["id"], "categoryKey": ft["categoryKey"],
            "categoryLabel": ft["categoryLabel"],
            "selectedOptions": ft["selectedOptions"],
            "lastModified": timestamp,
        })
        ops += 1

    # Setup / recurring services
    if state.get("setupServices"):
        mutate(new_id, "setSetupServices", {"services": state["setupServices"], "lastModified": timestamp})
        ops += 1
    if state.get("recurringServices"):
        mutate(new_id, "setRecurringServices", {"services": state["recurringServices"], "lastModified": timestamp})
        ops += 1

    # FAQs
    for faq in state.get("faqFields") or []:
        mutate(new_id, "addFaq", {
            "id": faq["id"],
            "question": faq.get("question"),
            "answer": faq.get("answer"),
            "displayOrder": faq.get("displayOrder", 0),
        })
        ops += 1

    # Content sections
    for cs in state.get("contentSections") or []:
        mutate(new_id, "addContentSection", {
            "id": cs["id"], "title": cs["title"],
            "content": cs["content"],
            "displayOrder": cs.get("displayOrder", 0),
            "lastModified": timestamp,
        })
        ops += 1

    log(f"Resource template state applied ({ops} ops)")

# ── ServiceOffering ──

def apply_service_offering(old_id, new_id, state):
    if not state:
        return
    ops = 0

    # Offering info
    info = {"lastModified": timestamp}
    for key in ("title", "summary", "description", "thumbnailUrl", "infoLink"):
        if state.get(key) is not None:
            info[key] = state[key]
    mutate(new_id, "updateOfferingInfo", info)
    ops += 1

    # Status
    if state.get("status"):
        mutate(new_id, "updateOfferingStatus", {"status": state["status"], "lastModified": timestamp})
        ops += 1

    # Operator
    if state.get("operatorId"):
        mutate(new_id, "setOperator", {"operatorId": map_id(state["operatorId"]), "lastModified": timestamp})
        ops += 1

    # Resource template link
    if state.get("resourceTemplateId"):
        mutate(new_id, "selectResourceTemplate", {
            "resourceTemplateId": map_id(state["resourceTemplateId"]),
            "lastModified": timestamp,
        })
        ops += 1

    # Billing cycles
    if state.get("availableBillingCycles"):
        mutate(new_id, "setAvailableBillingCycles", {
            "billingCycles": state["availableBillingCycles"],
            "lastModified": timestamp,
        })
        ops += 1

    # Facet targets
    for ft in state.get("facetTargets") or []:
        mutate(new_id, "setFacetTarget", {
            "id": ft["id"], "categoryKey": ft["categoryKey"],
            "categoryLabel": ft["categoryLabel"],
            "selectedOptions": ft["selectedOptions"],
            "lastModified": timestamp,
        })
        ops += 1

    # Option groups (before services that reference them)
    for og in state.get("optionGroups") or []:
        og_input = {
            "id": og["id"], "name": og["name"],
            "isAddOn": og["isAddOn"], "defaultSelected": og["defaultSelected"],
            "lastModified": timestamp,
        }
        for key in ("description", "costType", "currency", "price"):
            if og.get(key) is not None:
                og_input[key] = og[key]
        if og.get("availableBillingCycles"):
            og_input["availableBillingCycles"] = og["availableBillingCycles"]
        mutate(new_id, "addOptionGroup", og_input)
        ops += 1

        # Standalone pricing
        sp = og.get("standalonePricing")
        if sp:
            sp_input = {"optionGroupId": og["id"], "lastModified": timestamp}
            if sp.get("setupCost"):
                sp_input["setupCost"] = sp["setupCost"]
            sp_input["recurringPricing"] = sp.get("recurringPricing") or []
            mutate(new_id, "setOptionGroupStandalonePricing", sp_input)
            ops += 1

    # Services
    for svc in state.get("services") or []:
        svc_input = {
            "id": svc["id"], "title": svc["title"],
            "isSetupFormation": svc["isSetupFormation"],
            "lastModified": timestamp,
        }
        for key in ("description", "displayOrder", "optionGroupId"):
            if svc.get(key) is not None:
                svc_input[key] = svc[key]
        mutate(new_id, "addService", svc_input)
        ops += 1

    # Tiers (before service levels and usage limits)
    for tier in state.get("tiers") or []:
        tier_input = {
            "id": tier["id"], "name": tier["name"],
            "isCustomPricing": tier["isCustomPricing"],
            "lastModified": timestamp,
        }
        if tier.get("description") is not None:
            tier_input["description"] = tier["description"]
        pricing = tier.get("pricing") or {}
        if pricing.get("currency"):
            tier_input["currency"] = pricing["currency"]
        mutate(new_id, "addTier", tier_input)
        ops += 1

        # Tier base pricing
        if pricing.get("amount") is not None and pricing["amount"] > 0:
            mutate(new_id, "updateTierPricing", {
                "tierId": tier["id"],
                "amount": pricing["amount"],
                "currency": pricing.get("currency", "USD"),
                "lastModified": timestamp,
            })
            ops += 1

        # Default billing cycle
        if tier.get("defaultBillingCycle"):
            mutate(new_id, "setTierDefaultBillingCycle", {
                "tierId": tier["id"],
                "defaultBillingCycle": tier["defaultBillingCycle"],
                "lastModified": timestamp,
            })
            ops += 1

        # Service levels
        for sl in tier.get("serviceLevels") or []:
            sl_input = {
                "tierId": tier["id"],
                "serviceLevelId": sl["id"],
                "serviceId": sl["serviceId"],
                "level": sl["level"],
                "lastModified": timestamp,
            }
            if sl.get("optionGroupId") is not None:
                sl_input["optionGroupId"] = sl["optionGroupId"]
            if sl.get("customValue") is not None:
                sl_input["customValue"] = sl["customValue"]
            mutate(new_id, "addServiceLevel", sl_input)
            ops += 1

        # Usage limits
        for ul in tier.get("usageLimits") or []:
            ul_input = {
                "tierId": tier["id"],
                "limitId": ul["id"],
                "serviceId": ul["serviceId"],
                "metric": ul["metric"],
                "lastModified": timestamp,
            }
            for key in ("unitName", "freeLimit", "paidLimit", "resetCycle",
                        "unitPrice", "unitPriceCurrency", "notes"):
                if ul.get(key) is not None:
                    ul_input[key] = ul[key]
            mutate(new_id, "addUsageLimit", ul_input)
            ops += 1

    # Option group tier-dependent pricing (after tiers exist)
    for og in state.get("optionGroups") or []:
        for tp in og.get("tierDependentPricing") or []:
            tp_input = {
                "optionGroupId": og["id"],
                "tierPricingId": tp["id"],
                "tierId": tp["tierId"],
                "recurringPricing": tp.get("recurringPricing") or [],
                "lastModified": timestamp,
            }
            if tp.get("setupCost"):
                tp_input["setupCost"] = tp["setupCost"]
            mutate(new_id, "addOptionGroupTierPricing", tp_input)
            ops += 1

    log(f"Service offering state applied ({ops} ops)")

# ── Generic state handler via mutation introspection ──────────────────────────

_mutation_cache = {}
_input_type_cache = {}

def unwrap_gql_type(t):
    """Unwrap NON_NULL/LIST wrappers."""
    while t and t.get("kind") in ("NON_NULL", "LIST"):
        t = t.get("ofType") or {}
    return t or {"kind": "SCALAR", "name": "String"}

def discover_mutations(type_prefix):
    """Find all mutations for a document type prefix via introspection."""
    if type_prefix in _mutation_cache:
        return _mutation_cache[type_prefix]

    try:
        data = sb_query(
            '{ __schema { mutationType { fields { name args { name type { name kind ofType { name kind ofType { name kind } } } } } } } }'
        )
    except Exception:
        _mutation_cache[type_prefix] = []
        return []

    all_mutations = data.get("__schema", {}).get("mutationType", {}).get("fields", [])
    prefix = f"{type_prefix}_"
    result = [
        m for m in all_mutations
        if m["name"].startswith(prefix) and m["name"] != f"{type_prefix}_createDocument"
    ]
    _mutation_cache[type_prefix] = result
    return result

def get_input_fields(input_type_name):
    """Introspect an input type to get its field names."""
    if input_type_name in _input_type_cache:
        return _input_type_cache[input_type_name]

    try:
        data = sb_query(
            '{ __type(name: "' + input_type_name + '") { name inputFields { name type { name kind ofType { name kind ofType { name kind } } } } } }'
        )
    except Exception:
        _input_type_cache[input_type_name] = []
        return []

    fields = (data or {}).get("__type", {}).get("inputFields") or []
    _input_type_cache[input_type_name] = fields
    return fields

def get_mutation_input_type(mutation):
    """Get the input type name for a mutation's 'input' argument."""
    for arg in mutation.get("args", []):
        if arg["name"] == "input":
            return unwrap_gql_type(arg["type"]).get("name")
    return None

def build_mutation_input(state, input_fields):
    """Try to build a mutation input object from state data and input field definitions."""
    result = {}
    for field in input_fields:
        fname = field["name"]
        base = unwrap_gql_type(field["type"])
        if fname == "lastModified":
            result[fname] = timestamp
        elif fname in state and state[fname] is not None:
            result[fname] = state[fname]
    return result

def apply_generic_state(old_id, new_id, state, doc_type):
    """Apply state for any document type by introspecting its mutations."""
    prefix = TYPE_PREFIX.get(doc_type) or type_to_prefix(doc_type)
    mutations = discover_mutations(prefix)

    if not mutations:
        warn(f"No mutations discovered for {prefix} — '{doc_type}' left empty")
        return

    ops = 0
    consumed_arrays = set()

    # Phase 1: set/update mutations → match input fields to scalar state fields
    for m in mutations:
        op_name = m["name"].replace(f"{prefix}_", "")
        if not (op_name.startswith("set") or op_name.startswith("update")):
            continue

        input_type_name = get_mutation_input_type(m)
        if not input_type_name:
            continue

        input_fields = get_input_fields(input_type_name)
        if not input_fields:
            continue

        input_data = build_mutation_input(state, input_fields)

        # Only call if we have meaningful data beyond just lastModified
        real_fields = {k for k in input_data if k != "lastModified"}
        if not real_fields:
            continue

        try:
            mutate(new_id, op_name, input_data)
            ops += 1
        except Exception:
            pass  # move on, some mutations may not apply

    # Phase 2: add mutations → match input fields to state array items
    for m in mutations:
        op_name = m["name"].replace(f"{prefix}_", "")
        if not op_name.startswith("add"):
            continue

        input_type_name = get_mutation_input_type(m)
        if not input_type_name:
            continue

        input_fields = get_input_fields(input_type_name)
        if not input_fields:
            continue

        field_names = {f["name"] for f in input_fields} - {"lastModified"}

        # Find the best matching array in state
        best_key = None
        best_score = 0
        for state_key, state_val in state.items():
            if not isinstance(state_val, list) or not state_val:
                continue
            if state_key in consumed_arrays:
                continue
            sample = state_val[0]
            if not isinstance(sample, dict):
                continue
            overlap = len(field_names & set(sample.keys()))
            if overlap > best_score and overlap >= max(1, len(field_names) * 0.4):
                best_score = overlap
                best_key = state_key

        if not best_key:
            continue

        consumed_arrays.add(best_key)
        for item in state[best_key]:
            item_input = {}
            for f in input_fields:
                fname = f["name"]
                if fname == "lastModified":
                    item_input[fname] = timestamp
                elif fname in item and item[fname] is not None:
                    item_input[fname] = item[fname]
            try:
                mutate(new_id, op_name, item_input)
                ops += 1
            except Exception as e:
                warn(f"  {op_name} failed: {e}")
                break  # stop trying this array if one fails

    log(f"Generic state applied for {prefix} ({ops} ops)")

# ── Apply states to all documents ─────────────────────────────────────────────

HANDLERS = {
    "powerhouse/resource-template": apply_resource_template,
    "powerhouse/service-offering": apply_service_offering,
}

for doc in docs_sorted:
    new_id = id_map.get(doc["id"])
    if not new_id:
        continue
    state = load_state(doc["id"])
    if state is None:
        continue

    handler = HANDLERS.get(doc["type"])
    if handler:
        try:
            handler(doc["id"], new_id, state)
        except Exception as e:
            errf(f"Error applying state for '{doc['name']}': {e}")
    else:
        # Use generic introspection-based handler
        try:
            apply_generic_state(doc["id"], new_id, state, doc["type"])
        except Exception as e:
            errf(f"Error applying generic state for '{doc['name']}': {e}")

# ── Final summary ─────────────────────────────────────────────────────────────

step("Summary")
log(f"Drive: {drive_name} (ID: {drive_id}, Slug: {drive_slug})")

type_counts = {}
for doc in manifest["documents"]:
    t = doc["type"]
    type_counts[t] = type_counts.get(t, 0) + 1
for t, count in sorted(type_counts.items()):
    mode = "dedicated handler" if t in HANDLERS else "generic introspection"
    log(f"  {t}: {count} ({mode})")

print()
log(f"Open in Connect:")
print(f"  {C}http://localhost:3001/?driveUrl=http://localhost:4001/d/{drive_slug}{NC}")
print()
log("Done!")
PYEOF
