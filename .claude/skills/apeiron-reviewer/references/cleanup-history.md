# Cleanup History

Track what was removed and why — so the same dead weight never creeps back in.

## 2026-03-03: Service Offering Schema Cleanup

**Commit**: `refactor(service-offering): remove serviceGroups, targetAudiences, and facetBindings`

**What was removed:**

| Removed | Why | Scope |
|---------|-----|-------|
| `serviceGroups` (state + all operations) | Always empty. All pricing via optionGroups. | Schema, reducers, tests, subgraph schema/resolvers |
| `targetAudiences` (from service-offering) | Moved to resource-template only — offering shouldn't duplicate it | Schema, reducers, ScopeAndFacets editor UI, subgraph |
| `facetBindings` (state-level + per-service ops) | Facets handled by `facetTargets`. Half-migrated design with conflicting ops. | Schema, reducers, subgraph |
| `SET_FACET_BINDINGS` | Replaced by SET_FACET_TARGET / ADD_FACET_OPTION | Operation + reducer removed |
| `ADD_FACET_BINDING` / `REMOVE_FACET_BINDING` | Per-service ops that pushed to state-level. Unused in editor. | Operations + reducers removed |

**Still pending cleanup (subgraph):**
- `RSResourceFacetBinding` type in `schema.ts` — defined but unreferenced
- `facetBindings` on `RSService` in `schema.ts` — resource-template side, not mapped

**How it was caught:** Weekly schema audit (apeiron skill). Compared document state against editor usage and subgraph resolver mappings. Fields existed in schema but had zero consumers.

**Lesson:** AI-generated schemas add fields optimistically. Always trace every field to a consumer before accepting.
