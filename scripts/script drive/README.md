# Operator Drive Scripts

Scripts to replicate and populate operator drives via the switchboard CLI.

## Prerequisites

- `switchboard` CLI connected to a running instance (`switchboard ping`)
- `python3` (for JSON parsing)

## Two-Phase Drive Replication (from staging)

### Phase 1: Download

Connect to the source switchboard (e.g., staging) and download the drive:

```bash
switchboard profile use staging-remote
bash "scripts/script drive/download-drive.sh" powerhouse-operator-team-admin
```

This saves the drive tree and all document states to `data/powerhouse-operator-team-admin/`. If the data already exists, the download is skipped — delete the directory to re-download.

### Phase 2: Upload

Connect to the target switchboard (e.g., local) and create the drive:

```bash
switchboard profile use local
bash "scripts/script drive/upload-drive.sh" data/powerhouse-operator-team-admin
```

Optionally override the drive name:

```bash
bash "scripts/script drive/upload-drive.sh" data/powerhouse-operator-team-admin "My Custom Drive Name"
```

### What gets replicated

| Document Type | Strategy |
|---|---|
| `powerhouse/builder-profile` | Dedicated handler: isOperator, name, slug, code |
| `powerhouse/resource-template` | Dedicated handler: info, status, audiences, facets, services, FAQs, content sections |
| `powerhouse/service-offering` | Dedicated handler: info, status, billing, facets, option groups, pricing, services, tiers, service levels, usage limits |
| Any other type (e.g., `snapshot-report`, `expense-report`) | **Generic introspection**: schema and mutations discovered at runtime via GraphQL introspection |

**How generic introspection works:**

1. **Download**: The state type (e.g., `SnapshotReportState`) is introspected recursively to discover all fields, then the full state is fetched.
2. **Upload**: Available mutations are discovered (e.g., `SnapshotReport_set*`, `SnapshotReport_add*`), their input types introspected, and state fields are matched to mutation inputs automatically.
   - `set*`/`update*` mutations → matched to scalar/object state fields
   - `add*` mutations → matched to array state items

Cross-document references (e.g., `operatorId`, `resourceTemplateId`) are automatically remapped to the new document IDs.

### Excluded documents

By default, these are excluded from download:

- `2112df48-47b1-4ce1-8f0e-189833815b8c` (updatedOpHubResourceTemplate)
- `fa1f2bec-1447-4927-a554-77840d5e534e` (TEST)

Override with: `EXCLUDE_IDS="id1,id2" bash download-drive.sh ...`

## Quick Setup (hardcoded data)

For creating a drive with hardcoded Operational Hub data without a staging connection:

```bash
bash "scripts/script drive/setup-operator-drive.sh" [drive-name]
```

Default drive name: `Powerhouse Operator Team Admin`

## Files

| File | Description |
|---|---|
| `download-drive.sh` | Phase 1 — downloads drive tree and document states from source |
| `upload-drive.sh` | Phase 2 — creates drive and applies states on target |
| `setup-operator-drive.sh` | Standalone — creates drive with hardcoded structure and calls populate |
| `populate-operator-documents.sh` | Populates Operational Hub resource template and service offering |
