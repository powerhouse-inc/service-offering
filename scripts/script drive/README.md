# Operator Drive Setup Scripts

Scripts to create and populate an operator drive via the switchboard CLI.

## Prerequisites

- `switchboard` CLI connected to a running instance (`switchboard ping`)
- `python3` (for JSON parsing)
- Switchboard running at `http://localhost:4001`

## Usage

```bash
bash "scripts/script drive/setup-operator-drive.sh" [drive-name]
```

Default drive name: `operator team`

## What it does

1. **Creates a drive** with `builder-team-admin` preferred editor
2. **Creates folder structure**:
   ```
   Services And Offerings/
   ├── Products/
   └── Service Offerings/
   ```
3. **Creates a builder profile** with `isOperator = true`
4. **Creates a resource template** and **service offering**
5. **Moves documents** into the correct folders
6. **Links documents** to the builder profile via `setOperator`
7. **Populates documents** with full Operational Hub data (template info, services, tiers, FAQs, etc.)

## Output

After completion, the script prints a Connect URL to open the drive:

```
http://localhost:3001/?driveUrl=http://localhost:4001/d/<drive-slug>
```

## Files

| File | Description |
|------|-------------|
| `setup-operator-drive.sh` | Main script — creates drive, documents, folders, and calls populate |
| `populate-operator-documents.sh` | Populates resource template and service offering with Operational Hub data |
