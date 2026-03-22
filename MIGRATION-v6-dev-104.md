# Migration Guide: Powerhouse v6 (`6.0.0-dev.104`)

This guide covers the two major migration tasks when upgrading to `6.0.0-dev.104`:
1. **GraphQL Client Migration** — the Reactor API no longer exposes model-specific queries/mutations
2. **package.json Cleanup** — remove unused packages and align with the new baseline

---

## 1. GraphQL Client Migration

The Reactor API has removed auto-generated document-model-specific queries and mutations (e.g. `BuilderProfile_findDocuments`, `ResourceTemplate_document`). All projects must migrate to the **generic Reactor API**.

### Find Documents

```diff
- query FindBuilderProfiles {
-   BuilderProfile_findDocuments(search: {}) {
-     items { id name state { global { name slug } } }
+ query FindBuilderProfiles {
+   findDocuments(search: { type: "powerhouse/builder-profile" }) {
+     items { id name state }
      totalCount
    }
  }
```

- Use `findDocuments(search: { type: "<your-document-type>" })` instead of `<ModelName>_findDocuments`
- `state` is now `JSONObject` (untyped), not a typed nested object — extract `global` scope at runtime

### Get Single Document

```diff
- query GetBuilderProfile($identifier: String!) {
-   BuilderProfile_document(identifier: $identifier) {
-     document { id name state { global { name slug } } }
+ query GetBuilderProfile($identifier: String!) {
+   document(identifier: $identifier) {
+     document { id name state }
    }
  }
```

- Use `document(identifier: ...)` instead of `<ModelName>_document`

### Mutations (dispatching actions)

```diff
- mutation SetOpHubMember($docId: PHID!, $input: BuilderProfile_SetOpHubMemberInput!) {
-   BuilderProfile_setOpHubMember(docId: $docId, input: $input)
- }
+ mutation SetOpHubMember($documentIdentifier: String!, $actions: [JSONObject!]!) {
+   mutateDocument(documentIdentifier: $documentIdentifier, actions: $actions) {
+     id
+     name
+   }
+ }
```

- Use `mutateDocument(documentIdentifier, actions)` instead of `<ModelName>_<operationName>`
- Actions are plain JSON objects: `{ type: "SET_OP_HUB_MEMBER", input: {...}, scope: "global" }`
- The response returns the updated `PHDocument`, not a boolean

### Subgraph-style queries (also removed)

```diff
- query GetBuilderProfiles($driveId: String!) {
-   BuilderProfile {
-     getDocuments(driveId: $driveId) { id state { name slug icon } }
-   }
- }
+ query GetBuilderProfiles {
+   findDocuments(search: { type: "powerhouse/builder-profile" }) {
+     items { id name state }
+     totalCount
+   }
+ }
```

- The `<ModelName> { getDocuments(...) }` and `<ModelName> { getDocument(...) }` patterns are also removed
- Use the same generic `findDocuments` / `document` queries

### Handling the `state` field

The `state` field is now `JSONObject`. Extract the global scope at runtime:

```typescript
function getGlobalState(state: Record<string, unknown>): Record<string, unknown> {
  if (state && typeof state === "object" && "global" in state) {
    return (state as { global: Record<string, unknown> }).global;
  }
  return state;
}

// Usage
const global = getGlobalState(item.state);
const name = (global.name as string) ?? null;
```

### Response interface changes

```diff
- interface FindResponse {
-   BuilderProfile_findDocuments: { items: Item[]; totalCount: number };
- }
+ interface FindResponse {
+   findDocuments: { items: Item[]; totalCount: number };
+ }

- interface SingleResponse {
-   BuilderProfile_document: { document: Item } | null;
- }
+ interface SingleResponse {
+   document: { document: Item } | null;
+ }

- interface MutationResponse {
-   BuilderProfile_setOpHubMember: boolean;
- }
+ interface MutationResponse {
+   mutateDocument: { id: string; name: string } | null;
+ }
```

### Quick reference

| Operation | Old (removed) | New (generic) |
|-----------|--------------|---------------|
| Find documents | `<Model>_findDocuments(search)` | `findDocuments(search: { type: "powerhouse/<model>" })` |
| Get document | `<Model>_document(identifier)` | `document(identifier)` |
| Subgraph get | `<Model> { getDocuments(driveId) }` | `findDocuments(search: { type: "powerhouse/<model>" })` |
| Mutate | `<Model>_<operation>(docId, input)` | `mutateDocument(documentIdentifier, actions)` |

### Full schema reference

See `node_modules/@powerhousedao/reactor-api/dist/src/graphql/reactor/schema.graphql` for all available queries, mutations, and input types.

---

## 2. package.json Cleanup

### Baseline dependencies

Below is the minimal set of dependencies for a v6 project. Add only what your project actually imports.

#### dependencies (runtime)

```json
{
  "@electric-sql/pglite": "0.3.15",
  "@powerhousedao/builder-tools": "6.0.0-dev.104",
  "@powerhousedao/common": "6.0.0-dev.104",
  "@powerhousedao/design-system": "6.0.0-dev.104",
  "@powerhousedao/document-engineering": "1.40.1",
  "@powerhousedao/vetra": "6.0.0-dev.104",
  "document-model": "6.0.0-dev.104",
  "graphql": "16.12.0",
  "graphql-tag": "^2.12.6",
  "zod": "^4.3.5"
}
```

#### devDependencies

```json
{
  "@eslint/js": "^9.38.0",
  "@powerhousedao/analytics-engine-core": "6.0.0-dev.104",
  "@powerhousedao/config": "6.0.0-dev.104",
  "@powerhousedao/connect": "6.0.0-dev.104",
  "@powerhousedao/ph-cli": "6.0.0-dev.104",
  "@powerhousedao/reactor-api": "6.0.0-dev.104",
  "@powerhousedao/reactor-browser": "6.0.0-dev.104",
  "@powerhousedao/reactor-local": "6.0.0-dev.104",
  "@powerhousedao/switchboard": "6.0.0-dev.104",
  "@tailwindcss/cli": "^4.1.4",
  "@testing-library/react": "^16.3.0",
  "@types/node": "^24.9.2",
  "@types/react": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.0",
  "document-drive": "6.0.0-dev.104",
  "eslint": "^9.38.0",
  "eslint-config-prettier": "^10.1.8",
  "eslint-plugin-prettier": "^5.5.4",
  "eslint-plugin-react": "^7.37.5",
  "eslint-plugin-react-hooks": "^7.0.1",
  "globals": "^16.4.0",
  "package-manager-detector": "^0.2.8",
  "pm2": "^5.4.3",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "tailwindcss": "^4.1.16",
  "typescript": "^5.9.3",
  "typescript-eslint": "^8.46.2",
  "vite": "^6.2.3",
  "vite-plugin-node-polyfills": "^0.24.0",
  "vitest": "^3.0.9"
}
```

#### overrides

```diff
  "overrides": {
-   "graphql": "16.12.0"
+   "graphql": "$graphql"
  }
```

The `$graphql` syntax references the version from your own `dependencies`, avoiding duplication.

### Packages safe to remove

These were commonly included in older projects but are no longer needed by the v6 toolchain:

| Package | Reason |
|---------|--------|
| `@tailwindcss/vite` | Tailwind v4 uses `@tailwindcss/cli` instead |
| `cmd-ts` | Not used by project code |
| `vite-plugin-html` | Not used by project code |
| `vite-plugin-svgr` | Not used by project code |
| `@openfeature/web-sdk` | Not used by project code |
| `@sentry/react` | Not used by project code |
| `i18next` / `react-i18next` | Not used by project code |
| `react-error-boundary` | Not used by project code |
| `react-hotkeys-hook` | Not used by project code |
| `react-router-dom` | Not used by project code |

> **Note:** Audit your own imports before removing. Some projects may genuinely use packages like `lucide-react`, `rehype-slug`, or `@uiw/react-md-editor` — keep those if imported.

### Scripts

```diff
  "scripts": {
-   "build": "npm run tsc && npm run tailwind && npm run copy-css",
-   "copy-css": "cp editors/.../editor.css dist/editors/.../editor.css",
+   "build": "npm run tsc && npm run tailwind",
  }
```

The `copy-css` step is no longer needed — Tailwind CLI handles all CSS output.

---

## Migration Checklist

- [ ] Update all `@powerhousedao/*` and `document-model`/`document-drive` packages to `6.0.0-dev.104`
- [ ] Search codebase for `_findDocuments`, `_document(`, and `<Model>_` patterns in GraphQL queries
- [ ] Replace with generic `findDocuments`, `document`, `mutateDocument` queries
- [ ] Update all response interfaces to match the new generic shapes
- [ ] Add `getGlobalState()` helper for extracting typed state from `JSONObject`
- [ ] Remove unused packages from `dependencies` and `devDependencies`
- [ ] Update `overrides.graphql` to `"$graphql"`
- [ ] Remove `copy-css` from build scripts if present
- [ ] Run `tsc` and `lint:fix` to verify no type or lint errors
