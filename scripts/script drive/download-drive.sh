#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# download-drive.sh
#
# Phase 1 of drive replication: downloads a drive's structure and all document
# states to a local data directory. Re-running skips if data already exists.
#
# Prerequisites:
#   - switchboard CLI connected to the source instance
#   - python3
#
# Usage:
#   bash download-drive.sh <drive-slug> [output-dir]
#
# Example:
#   switchboard profile use staging-remote
#   bash download-drive.sh powerhouse-operator-team-admin
###############################################################################

DRIVE_SLUG="${1:?Usage: $0 <drive-slug> [output-dir]}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${2:-$SCRIPT_DIR/data/$DRIVE_SLUG}"

# Document IDs to exclude
EXCLUDE_IDS="${EXCLUDE_IDS:-2112df48-47b1-4ce1-8f0e-189833815b8c,fa1f2bec-1447-4927-a554-77840d5e534e}"

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

# ── Check existing download ──────────────────────────────────────────────────

if [ -f "$OUTPUT_DIR/manifest.json" ]; then
  log "Data already exists at $OUTPUT_DIR — skipping download"
  log "Delete the directory to re-download."
  exit 0
fi

mkdir -p "$OUTPUT_DIR/states"

# ── Download drive tree ──────────────────────────────────────────────────────

step "Download drive tree"

switchboard docs tree "$DRIVE_SLUG" --format json > "$OUTPUT_DIR/tree.json" 2>&1
log "Drive tree saved"

# Try to get drive info (name, etc.)
switchboard drives get "$DRIVE_SLUG" --format json > "$OUTPUT_DIR/drive-info.json" 2>&1 || true
log "Drive info saved"

# ── Download document states ─────────────────────────────────────────────────

step "Download document states"

export OUTPUT_DIR DRIVE_SLUG EXCLUDE_IDS

python3 << 'PYEOF'
import subprocess, json, sys, os, datetime

output_dir = os.environ["OUTPUT_DIR"]
drive_slug = os.environ["DRIVE_SLUG"]
exclude_ids = set(os.environ.get("EXCLUDE_IDS", "").split(","))

G = "\033[0;32m"
Y = "\033[1;33m"
R = "\033[0;31m"
NC = "\033[0m"

# ── Read tree ────────────────────────────────────────────────────────────────

with open(os.path.join(output_dir, "tree.json")) as f:
    tree = json.load(f)

# Try to read drive name
drive_name = drive_slug
try:
    with open(os.path.join(output_dir, "drive-info.json")) as f:
        info = json.load(f)
        drive_name = info.get("name", drive_slug)
except Exception:
    pass

nodes = tree["document"]["state"]["global"]["nodes"]
folders = [n for n in nodes if n["kind"] == "folder"]
files_all = [n for n in nodes if n["kind"] == "file"]
files = [n for n in files_all if n["id"] not in exclude_ids]
excluded = [n for n in files_all if n["id"] in exclude_ids]

print(f"  Found {len(folders)} folders, {len(files)} documents" +
      (f" (excluded {len(excluded)})" if excluded else ""))

# ── GraphQL queries per document type ────────────────────────────────────────

QUERIES = {
    "powerhouse/resource-template": {
        "prefix": "ResourceTemplate",
        "fields": """
            id operatorId title summary description thumbnailUrl infoLink
            status lastModified
            targetAudiences { id label color }
            setupServices
            recurringServices
            facetTargets { id categoryKey categoryLabel selectedOptions }
            services {
                id title isSetupFormation description displayOrder
                optionGroupId parentServiceId
                facetBindings { id facetType facetName supportedOptions }
            }
            optionGroups { id name description defaultSelected isAddOn }
            faqFields { id question answer displayOrder }
            contentSections { id title content displayOrder }
        """,
    },
    "powerhouse/service-offering": {
        "prefix": "ServiceOffering",
        "fields": """
            id operatorId title summary description thumbnailUrl infoLink
            status lastModified resourceTemplateId
            availableBillingCycles
            facetTargets { id categoryKey categoryLabel selectedOptions }
            services {
                id title isSetupFormation description displayOrder optionGroupId
            }
            optionGroups {
                id name description isAddOn defaultSelected
                costType currency price pricingMode discountMode
                availableBillingCycles
                billingCycleDiscounts {
                    billingCycle discountRule { discountType discountValue }
                }
                standalonePricing {
                    setupCost {
                        amount currency
                        discount { discountType discountValue }
                    }
                    recurringPricing {
                        id billingCycle amount currency
                        discount { discountType discountValue }
                    }
                }
                tierDependentPricing {
                    id tierId
                    setupCost {
                        amount currency
                        discount { discountType discountValue }
                    }
                    setupCostDiscounts {
                        billingCycle discountRule { discountType discountValue }
                    }
                    recurringPricing {
                        id billingCycle amount currency
                        discount { discountType discountValue }
                    }
                }
            }
            tiers {
                id name description isCustomPricing mostPopular pricingMode
                defaultBillingCycle
                pricing { amount currency }
                billingCycleDiscounts {
                    billingCycle discountRule { discountType discountValue }
                }
                serviceLevels {
                    id serviceId level customValue optionGroupId
                }
                usageLimits {
                    id serviceId metric unitName freeLimit paidLimit
                    resetCycle unitPrice unitPriceCurrency notes
                }
            }
        """,
    },
}

def get_doc_type(node):
    return node.get("documentType") or node.get("type") or "unknown"

def type_to_prefix(doc_type):
    """Convert 'powerhouse/snapshot-report' to 'SnapshotReport'."""
    name = doc_type.split("/")[-1]
    return "".join(word.capitalize() for word in name.split("-"))

# ── Schema introspection for unknown types ───────────────────────────────────

_introspect_cache = {}

def sb_introspect(query):
    """Run an introspection query and return parsed JSON."""
    try:
        result = subprocess.run(
            ["switchboard", "query", query, "--format", "json"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode != 0:
            return None
        return json.loads(result.stdout)
    except Exception:
        return None

def unwrap_type(t):
    """Unwrap NON_NULL/LIST wrappers to get the base type."""
    while t and t.get("kind") in ("NON_NULL", "LIST"):
        t = t.get("ofType") or {}
    return t or {"kind": "SCALAR", "name": "String"}

def build_field_selection(type_name, depth=4):
    """Recursively introspect a GraphQL type and build a field selection string."""
    if type_name in _introspect_cache:
        return _introspect_cache[type_name]
    if depth <= 0:
        return None

    data = sb_introspect(
        '{ __type(name: "' + type_name + '") { name kind fields { name type { name kind ofType { name kind ofType { name kind ofType { name kind } } } } } } }'
    )
    type_info = (data or {}).get("__type")
    if not type_info or not type_info.get("fields"):
        _introspect_cache[type_name] = None
        return None

    parts = []
    for field in type_info["fields"]:
        if field["name"].startswith("__"):
            continue
        base = unwrap_type(field["type"])
        kind = base.get("kind", "")
        if kind in ("SCALAR", "ENUM"):
            parts.append(field["name"])
        elif kind == "OBJECT" and depth > 1:
            sub = build_field_selection(base["name"], depth - 1)
            if sub:
                parts.append(f'{field["name"]} {{ {sub} }}')
        elif kind == "LIST":
            item = unwrap_type(base.get("ofType") or field["type"].get("ofType") or {})
            item = unwrap_type(item)  # double-unwrap for NON_NULL inside LIST
            if item.get("kind") in ("SCALAR", "ENUM"):
                parts.append(field["name"])
            elif item.get("kind") == "OBJECT" and depth > 1:
                sub = build_field_selection(item["name"], depth - 1)
                if sub:
                    parts.append(f'{field["name"]} {{ {sub} }}')
                else:
                    parts.append(field["name"])

    selection = " ".join(parts) if parts else None
    _introspect_cache[type_name] = selection
    return selection

def discover_fields_for_type(doc_type):
    """Discover fields for an unknown document type via introspection.

    The GraphQL API exposes state types with a prefixed name (e.g.,
    BuilderProfile_BuilderProfileState) which may differ from the
    document model's internal type (BuilderProfileState). The prefixed
    version is what the _document query actually returns, so we prefer it.
    """
    prefix = type_to_prefix(doc_type)
    # Try naming conventions — prefixed first (matches the API), then bare
    candidates = [
        f"{prefix}_{prefix}State",
        f"{prefix}State",
        f"{prefix}GlobalState",
    ]
    for state_type in candidates:
        fields = build_field_selection(state_type)
        if fields:
            print(f"  {G}✓{NC} Introspected schema: {state_type}")
            return {"prefix": prefix, "fields": fields}
    return None

# ── Fetch document state ─────────────────────────────────────────────────────

def fetch_state(doc_id, doc_type):
    spec = QUERIES.get(doc_type)

    # Try introspection for unknown types
    if not spec:
        spec = discover_fields_for_type(doc_type)
        if spec:
            QUERIES[doc_type] = spec  # cache for next document of same type
            print(f"  {G}✓{NC} Introspected schema for {doc_type}")

    if not spec:
        return None

    query = '{{ {prefix}_document(identifier: "{id}") {{ document {{ id name state {{ global {{ {fields} }} }} }} }} }}'.format(
        prefix=spec["prefix"],
        id=doc_id,
        fields=" ".join(spec["fields"].split()),
    )

    try:
        result = subprocess.run(
            ["switchboard", "query", query, "--format", "json"],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            return None
        data = json.loads(result.stdout)
        doc = data.get(f"{spec['prefix']}_document", {}).get("document", {})
        return doc.get("state", {}).get("global")
    except Exception as e:
        print(f"  {R}✗{NC} Error fetching {doc_id}: {e}", file=sys.stderr)
        return None

# ── Download each document ───────────────────────────────────────────────────

downloaded = 0
skipped = 0

for f in files:
    doc_id = f["id"]
    doc_type = get_doc_type(f)
    state = fetch_state(doc_id, doc_type)

    state_path = os.path.join(output_dir, "states", f"{doc_id}.json")
    with open(state_path, "w") as fp:
        json.dump(state, fp, indent=2)

    if state is not None:
        downloaded += 1
        print(f"  {G}✓{NC} {f['name']} ({doc_type})")
    else:
        skipped += 1
        print(f"  {Y}!{NC} {f['name']} ({doc_type}) — no state handler")

# ── Save manifest ────────────────────────────────────────────────────────────

manifest = {
    "source": {
        "slug": drive_slug,
        "name": drive_name,
        "downloadedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
    },
    "excluded": sorted(exclude_ids),
    "folders": [
        {
            "id": f["id"],
            "name": f["name"],
            "parentFolder": f.get("parentFolder"),
        }
        for f in folders
    ],
    "documents": [
        {
            "id": f["id"],
            "name": f["name"],
            "type": get_doc_type(f),
            "parentFolder": f.get("parentFolder"),
        }
        for f in files
    ],
}

with open(os.path.join(output_dir, "manifest.json"), "w") as fp:
    json.dump(manifest, fp, indent=2)

print(f"\n  {G}✓{NC} Downloaded {downloaded} states, {skipped} skipped (unsupported type)")
PYEOF

# ── Done ─────────────────────────────────────────────────────────────────────

step "Download complete"
log "Data saved to: $OUTPUT_DIR"
log "Next: connect to the target switchboard and run upload-drive.sh"
