# Editors Reference

Comprehensive reference for creating and managing document editors in the Powerhouse/Vetra ecosystem. Covers the full editor lifecycle from creation through MCP to styling, state management, and quality assurance.

---

## Table of Contents

1. [Editor Creation Flow](#1-editor-creation-flow)
2. [Editor Template Generation](#2-editor-template-generation)
3. [Hook-Based Architecture](#3-hook-based-architecture)
4. [Component Patterns](#4-component-patterns)
5. [Styling Approaches](#5-styling-approaches)
6. [State Management](#6-state-management)
7. [Error Handling](#7-error-handling)
8. [Drive-Apps](#8-drive-apps)
9. [Document Confirmation](#9-document-confirmation)
10. [Quality Assurance](#10-quality-assurance)

---

## 1. Editor Creation Flow

### Step-by-Step MCP Workflow

1. **Check if editor already exists** -- Ask user if a new one should be created or existing one reimplemented
2. **Create editor document** on the `vetra-{hash}` drive:
   ```
   mcp__reactor-mcp__createDocument({ documentType: "powerhouse/document-editor" })
   ```
3. **Check the editor schema** to understand available operations:
   ```
   mcp__reactor-mcp__getDocumentModelSchema({ type: "powerhouse/document-editor" })
   ```
4. **Configure the editor** (name, document types):
   ```
   mcp__reactor-mcp__addActions({
     documentId: "<editor-id>",
     actions: [
       { type: "SET_EDITOR_NAME", scope: "global", input: { name: "My Editor" } },
       { type: "SET_EDITOR_DOCUMENT_TYPES", scope: "global", input: { documentTypes: ["powerhouse/my-model"] } }
     ]
   })
   ```
5. **CRITICAL: Confirm the editor** (code generation only runs for confirmed documents):
   ```
   mcp__reactor-mcp__addActions({
     documentId: "<editor-id>",
     actions: [{ type: "SET_EDITOR_STATUS", scope: "global", input: { status: "CONFIRMED" } }]
   })
   ```
6. **Add to vetra drive** using `ADD_FILE` action
7. **Wait for code generation** -- files appear in `editors/<editor-name>/`
8. **Implement the editor** using generated hooks and action creators

---

## 2. Editor Template Generation

### Methods

| Method | Command/Action |
|--------|---------------|
| **MCP** | `createDocument` + `addActions` (SET_EDITOR_NAME, SET_EDITOR_DOCUMENT_TYPES, SET_EDITOR_STATUS) |
| **Vetra Studio** | `ph vetra --interactive --watch` then create via UI |
| **CLI** | `ph generate --editor <name> --document-types <type>` |

### Generated File Structure

```
editors/<editor-name>/
  editor.tsx          -- Main editor component (implement here)
  module.ts           -- Editor module definition (auto-generated)
```

### The Module File (module.ts)

Auto-generated, do not edit:

```typescript
import type { EditorModule } from "document-model";
import { lazy } from "react";

export const MyEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/my-document-type"],
  config: {
    id: "my-editor",
    name: "My Editor",
  },
};
```

### The Registry File (editors.ts)

All editors are collected into a single array:

```typescript
import type { EditorModule } from "document-model";
import { MyEditor } from "./my-editor/module.js";

export const editors: EditorModule[] = [MyEditor];
```

---

## 3. Hook-Based Architecture

The modern pattern for Powerhouse editors uses React hooks from `@powerhousedao/reactor-browser`.

### Auto-Generated Hooks

When an editor is created, hooks are auto-generated in `editors/hooks/` or `document-models/<model-name>/hooks.ts`. These hooks provide type-safe access to the document and dispatch function.

### Available Hook Functions

For a document model named `Xxx`, the following hooks are generated:

| Hook | Purpose |
|------|---------|
| `useSelectedXxxDocument()` | Returns `[document, dispatch]` for the currently selected document |
| `useXxxDocumentById(id)` | Returns `[document, dispatch]` for a document by ID |
| `useXxxDocumentsInSelectedDrive()` | Returns all documents of this type in the selected drive |
| `useXxxDocumentsInSelectedFolder()` | Returns all documents of this type in the selected folder |

### Primary Hook Usage Pattern

```typescript
import { useSelectedServiceOfferingDocument } from "../../document-models/service-offering/hooks.js";

export default function ServiceOfferingEditor() {
  const [document, dispatch] = useSelectedServiceOfferingDocument();

  // document contains the full document state
  // dispatch sends actions to the reducer
}
```

### Importing Action Creators

Action creators are auto-generated in `document-models/<model-name>/gen/creators.ts`:

```typescript
import {
  addService,
  updateService,
  deleteService,
} from "../../../document-models/service-offering/gen/creators.js";
```

### Generating IDs for New Entities

Use `generateId` from `document-model/core` -- critical because reducers must be pure:

```typescript
import { generateId } from "document-model/core";

function handleAddItem() {
  dispatch(addItem({ id: generateId(), title: "New Item" }));
}
```

### Complete Editor Example

```typescript
import { useState } from "react";
import { generateId } from "document-model/core";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedTodoDocument } from "../../document-models/todo/hooks.js";
import { addTodo, toggleTodo, deleteTodo } from "../../document-models/todo/gen/creators.js";

export default function TodoEditor() {
  const [document, dispatch] = useSelectedTodoDocument();
  const [newTitle, setNewTitle] = useState("");

  if (!document) {
    return <div>No document selected</div>;
  }

  const todos = document.state.global.todos || [];

  function handleAdd() {
    if (newTitle.trim()) {
      dispatch(addTodo({ id: generateId(), title: newTitle.trim() }));
      setNewTitle("");
    }
  }

  return (
    <div>
      <DocumentToolbar />
      <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Add a todo..." />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input type="checkbox" checked={todo.completed} onChange={() => dispatch(toggleTodo({ id: todo.id }))} />
            {todo.title}
            <button onClick={() => dispatch(deleteTodo({ id: todo.id }))}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. Component Patterns

### Directory Structure

Organize editors with modular components in separate files:

```
editors/<editor-name>/
  editor.tsx                -- Main wrapper component
  module.ts                 -- Editor module definition (auto-generated)
  types.ts                  -- Shared TypeScript types
  components/
    ComponentA.tsx           -- Individual UI component
    ComponentB.tsx           -- Individual UI component
    shared-utils.ts         -- Shared utility functions
```

### Main Editor Component Pattern

The main `editor.tsx` should be a thin wrapper:

```typescript
import { useState } from "react";
import { DocumentToolbar } from "@powerhousedao/design-system/connect";
import { useSelectedMyModelDocument } from "../../document-models/my-model/hooks.js";
import { SectionA } from "./components/SectionA.js";
import { SectionB } from "./components/SectionB.js";

export default function MyModelEditor() {
  const [document, dispatch] = useSelectedMyModelDocument();

  if (!document) {
    return <div className="my-editor"><div className="my-editor__empty">No document selected</div></div>;
  }

  return (
    <div className="my-editor">
      <DocumentToolbar />
      <div className="my-editor__container">
        <SectionA document={document} dispatch={dispatch} />
        <SectionB document={document} dispatch={dispatch} />
      </div>
    </div>
  );
}
```

### Child Component Pattern

Child components receive document and dispatch as props:

```typescript
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import type { MyModelDocument, MyModelAction } from "@powerhousedao/my-package/document-models/my-model";

interface Props {
  document: MyModelDocument;
  dispatch: DocumentDispatch<MyModelAction>;
}

export function SectionA({ document, dispatch }: Props) {
  const state = document.state.global;
  // ...
}
```

### DocumentToolbar Component

Always include `<DocumentToolbar />` from `@powerhousedao/design-system/connect` in the main editor. Only remove if the user explicitly requests removal.

### Tab Navigation Pattern

For editors with multiple sections:

```typescript
type TabId = "overview" | "details" | "settings";

export default function Editor() {
  const [document, dispatch] = useSelectedMyDocument();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return <Overview document={document} dispatch={dispatch} />;
      case "details": return <Details document={document} dispatch={dispatch} />;
      case "settings": return <Settings document={document} dispatch={dispatch} />;
      default: return null;
    }
  };

  return (
    <div>
      <DocumentToolbar />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  );
}
```

---

## 5. Styling Approaches

### Approach 1: Scoped Style Tag (Most Common)

Embed a `<style>` tag with a namespaced CSS class prefix. This is the pattern used by existing editors in this project.

Key rules:
- Use a unique prefix per editor (e.g., `so-` for service-offering, `rt-` for resource-template, `si-` for subscription-instance)
- All CSS selectors must be scoped under the editor's root class
- Use CSS custom properties for theming consistency

```typescript
export default function MyEditor() {
  return (
    <div className="me-editor">
      <style>{editorStyles}</style>
      {/* editor content */}
    </div>
  );
}

const editorStyles = `
  .me-editor {
    --me-font-sans: 'DM Sans', system-ui, sans-serif;
    --me-slate-500: #64748b;
    --me-radius-md: 10px;
    --me-shadow-md: 0 4px 12px rgba(15, 23, 42, 0.06);
    --me-transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    font-family: var(--me-font-sans);
    min-height: 100%;
    overflow-y: auto;
  }

  .me-editor__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px 48px;
  }
`;
```

### Approach 2: Tailwind CSS

Tailwind CSS is pre-installed. Use utility classes directly:

```typescript
<div className="min-h-full overflow-y-auto bg-gray-50">
  <div className="max-w-5xl mx-auto px-8 py-6">
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800">Title</h2>
    </div>
  </div>
</div>
```

### Approach 3: Custom CSS Files

**CRITICAL**: Centralize style imports in `styles.css`. Direct CSS imports in `.tsx` files may not work in production builds. Currently, existing editors use the scoped style tag approach.

### Best Practices

1. **Namespace all selectors** with a unique prefix per editor
2. **Use CSS custom properties** for colors, spacing, radii, shadows, transitions
3. **Handle empty states** with centered, visually distinct placeholder content
4. **Use animations sparingly** -- fade-in for transitions, subtle hover effects

---

## 6. State Management

### Document State vs Local UI State

| Type | Purpose | Persistence | How to Modify |
|------|---------|-------------|---------------|
| **Global document state** | Actual document data shared with all users | Persisted, synced, versioned | Dispatch actions via `dispatch()` |
| **Local UI state** | Ephemeral UI concerns (selected tab, input values) | Not persisted | React `useState` hook |

### Accessing Document State

```typescript
const [document, dispatch] = useSelectedMyDocument();

// Global state (persisted, shared)
const globalState = document.state.global;
const items = globalState.items || [];

// Local state (per-user, persisted locally)
const localState = document.state.local;
```

### The Dispatch Function

```typescript
type DocumentDispatch<A> = (
  actionOrActions: A | A[] | undefined,
  onErrors?: (errors: Error[]) => void,
) => void;
```

### Dispatching Multiple Actions

```typescript
dispatch([
  addItem({ id: generateId(), title: "Item 1" }),
  addItem({ id: generateId(), title: "Item 2" }),
]);
```

### Pure Reducers Constraint

All dynamic values must be computed BEFORE dispatching:

```typescript
// Correct: Generate ID before dispatch
const newId = generateId();
dispatch(addItem({ id: newId, title: "New Item", createdAt: new Date().toISOString() }));

// WRONG: Never rely on the reducer to generate IDs or timestamps
```

---

## 7. Error Handling

### Dispatch Error Handling

```typescript
dispatch(
  updateRecord({ id: data.id, name: data.name }),
  (errors) => {
    if (errors.length > 0) setErrorMessage(errors[0].message);
  }
);
```

### Empty State Handling

```typescript
if (!document) return <EmptyState message="No document selected" />;
const items = document.state.global.items || [];
const name = document.state.global.name ?? "Untitled";
```

### Input Validation Before Dispatch

```typescript
function handleAdd(title: string) {
  if (!title.trim()) { setValidationError("Title is required"); return; }
  setValidationError(null);
  dispatch(addItem({ id: generateId(), title: title.trim() }));
}
```

### Type Safety

Use auto-generated types. Avoid `any` and type casting. If types don't match, update the document model schema.

---

## 8. Drive-Apps

Drive-apps provide custom views for managing multiple documents within a drive (kanban boards, dashboards, list views).

### When to Use

- Overview or dashboard across multiple documents
- Kanban-style or list-style views
- Custom document management workflows
- Aggregated views combining data from several documents

### Generating a Drive-App

```bash
ph generate --drive-editor <app-name>
```

### Drive-App vs Standard Editor

| Aspect | Standard Editor | Drive-App |
|--------|----------------|-----------|
| Scope | Single document | Multiple documents |
| Hook | `useSelectedXxxDocument()` | Drive-level hooks |
| Purpose | Edit document content | Manage/visualize documents |
| Navigation | Within document sections | Between documents |

---

## 9. Document Confirmation

### Why Confirmation Matters

Documents created via MCP start in `DRAFT` status. The code generator ignores documents in `DRAFT` status. No files will be generated until confirmed.

### Confirmation Actions by Document Type

| Document Type | Confirmation Action | Input |
|---|---|---|
| `powerhouse/document-editor` | `SET_EDITOR_STATUS` | `{ status: "CONFIRMED" }` |
| `powerhouse/app` | `SET_APP_STATUS` | `{ status: "CONFIRMED" }` |
| `powerhouse/processor` | `SET_PROCESSOR_STATUS` | `{ status: "CONFIRMED" }` |
| `powerhouse/subgraph` | `SET_SUBGRAPH_STATUS` | `{ status: "CONFIRMED" }` |

### Post-Confirmation

After confirmation and adding to the drive:
- Code generation runs automatically
- Files appear in `editors/<editor-name>/`
- Hooks appear in `document-models/<model-name>/hooks.ts`
- Editor module is registered in `editors/editors.ts`

---

## 10. Quality Assurance

### Mandatory Checks

After creating or modifying ANY editor:

```bash
npm run tsc        # TypeScript type checking
npm run lint:fix   # ESLint checking and auto-fix
```

### Common Type Errors and Fixes

```typescript
// ERROR: Object is possibly 'undefined'
const items = document.state.global.items;
// FIX:
const items = document.state.global.items || [];

// ERROR: Argument of type '{ title: string }' is not assignable
dispatch(addItem({ title: "test" }));
// FIX: Include all required fields
dispatch(addItem({ id: generateId(), title: "test" }));
```

### Pre-Implementation Checklist

- [ ] Verified document model schema to understand state shape
- [ ] Checked available action creators in `gen/creators.ts`
- [ ] Reviewed auto-generated hooks
- [ ] Confirmed the editor document via MCP (status: "CONFIRMED")

### Post-Implementation Checklist

- [ ] `<DocumentToolbar />` is included (unless user requested removal)
- [ ] Empty state is handled
- [ ] All state access uses proper null guards
- [ ] IDs generated with `generateId()` before dispatch
- [ ] Components are modular (separate files in `components/`)
- [ ] No `any` types or type casts
- [ ] `npm run tsc` passes
- [ ] `npm run lint:fix` passes
