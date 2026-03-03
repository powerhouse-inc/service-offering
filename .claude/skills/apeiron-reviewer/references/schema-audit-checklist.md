# Schema Audit Checklist

Run this before any document model schema change ships.

## Step 1: State Field Check

For every field in `document-models/<model>/schema.graphql` state type:

- [ ] Search the model's editor for usage (grep in `editors/<editor>/` .tsx/.ts files)
- [ ] If the model has a subgraph, check the subgraph schema and resolver mapper
- [ ] If not found in any consumer, flag it

## Step 2: Operation Check

For every operation in the document model:

- [ ] Verify the reducer in `document-models/<model>/src/reducers/` is implemented (not a stub throwing "not implemented")
- [ ] Verify the operation is dispatched somewhere in the editor OR used programmatically (scripts, subgraph mutations)
- [ ] If the operation exists but nothing dispatches it, flag it

## Step 3: Subgraph Alignment

Only for models with subgraphs (see model table in SKILL.md).

For every type in the subgraph schema:

- [ ] Verify the corresponding field is actually populated in the resolver mapper
- [ ] If the subgraph type exists but the resolver returns empty/null for it, flag it

## Step 4: Report

Present findings as:

| Field/Type | In Schema | In Editor | In Subgraph | Populated in Docs | Status |
|------------|-----------|-----------|-------------|-------------------|--------|
| `fieldName` | Y | Y/N | Y/N/N/A | Y/N | LIVE / DEAD / PROGRAMMATIC / PLANNED |

### Status Meanings

- **LIVE**: Used in editor AND populated in documents
- **DEAD**: Not used anywhere, not populated — remove it
- **PROGRAMMATIC**: Not in editor UI but set by scripts/mutations — justify and document
- **PLANNED**: Not yet used but has a documented future purpose — must have a reason

## Schema Delivery Checklist (pre-commit)

Before committing any schema change to any document model:

- [ ] Every new state field has a consumer (editor, subgraph, or programmatic use)
- [ ] Every new operation has a non-stub reducer in `src/reducers/`
- [ ] Every new operation is dispatched in an editor OR has documented programmatic use
- [ ] Every new operation has error definitions where applicable
- [ ] If the model has a subgraph: schema and resolver mapper updated for externally consumed fields
- [ ] No orphaned types (types defined but not referenced by any state or input type)
- [ ] Two-step rule followed: MCP update AND source file update (per CLAUDE.md)
- [ ] `npm run tsc` passes
- [ ] `npm run lint:fix` passes
- [ ] Dead code flagged for removal (don't leave it silently)
