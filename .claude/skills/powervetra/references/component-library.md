# Component Library Reference

Reference for the UI component libraries available in the Powerhouse/Vetra ecosystem. Covers `@powerhousedao/document-engineering` and `@powerhousedao/design-system`.

---

## Available Packages

| Package | Purpose |
|---------|---------|
| `@powerhousedao/document-engineering` | Document-specific components, scalar editors, GraphQL path utilities |
| `@powerhousedao/design-system` | General UI components (buttons, icons, modals) |
| `@powerhousedao/design-system/connect` | Document-aware components (`DocumentToolbar`) |

---

## DocumentToolbar

The most commonly used component. Always include it in editors unless the user explicitly requests removal.

```typescript
import { DocumentToolbar } from "@powerhousedao/design-system/connect";

export default function MyEditor() {
  return (
    <div>
      <DocumentToolbar />
      {/* editor content */}
    </div>
  );
}
```

Provides: undo, redo, revision history, document name, and other standard document operations.

---

## Document Engineering Components

### Scalar Components

The `@powerhousedao/document-engineering` package provides React components for rendering and editing Powerhouse scalar types.

#### Available Scalar Editors

Each built-in scalar type has a corresponding React component:

| Scalar | Component | Description |
|--------|-----------|-------------|
| `String` | Text input | Standard string editing |
| `Int` / `Float` | Number input | Numeric editing |
| `Boolean` | Checkbox/toggle | Boolean editing |
| `OID` | Read-only display | Object identifier (not user-editable) |
| `PHID` | Read-only display | Powerhouse identifier |
| `Date` | Date picker | Calendar date selection |
| `DateTime` | DateTime picker | Date and time selection |
| `URL` | URL input with validation | URL editing |
| `EmailAddress` | Email input with validation | Email editing |
| `EthereumAddress` | Address input | Ethereum address with validation |
| `Currency` | Currency selector | Currency code selection |
| `Amount` | Amount input | Numeric amount editing |
| `Amount_Money` | Money input | Amount with currency |
| `Amount_Percentage` | Percentage input | Percentage editing |

### Integration into React Components

```typescript
import { ScalarEditor } from "@powerhousedao/document-engineering";

function MyComponent({ value, onChange }) {
  return (
    <ScalarEditor
      scalarType="Amount_Money"
      value={value}
      onChange={onChange}
    />
  );
}
```

### GraphQL Path Utilities

The document engineering package provides utilities for working with GraphQL paths in document state:

```typescript
import { getValueAtPath, setValueAtPath } from "@powerhousedao/document-engineering";

// Read a value from the document state using a GraphQL path
const value = getValueAtPath(document.state.global, "todos[0].title");

// Set a value at a GraphQL path
const newState = setValueAtPath(document.state.global, "todos[0].title", "Updated");
```

---

## Custom Scalar Creation

### When to Create Custom Scalars

Create custom scalars when:
- You need specialized validation for a data type
- You want a custom editor UI for a specific field type
- The built-in scalars don't match your domain requirements

### Registration Steps

1. **Define the scalar** in your GraphQL schema:
   ```graphql
   scalar ProjectCode
   ```

2. **Create the scalar definition**:
   ```typescript
   import { createScalar } from "@powerhousedao/document-engineering";

   export const ProjectCodeScalar = createScalar({
     name: "ProjectCode",
     serialize: (value: string) => value.toUpperCase(),
     parseValue: (value: string) => {
       if (!/^[A-Z]{2,6}-\d{3,6}$/.test(value)) {
         throw new Error("Invalid project code format");
       }
       return value.toUpperCase();
     },
   });
   ```

3. **Create a display component** for read-only views:
   ```typescript
   function ProjectCodeDisplay({ value }: { value: string }) {
     return <span className="project-code">{value}</span>;
   }
   ```

4. **Create an edit component** for inline editing:
   ```typescript
   function ProjectCodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
     return (
       <input
         value={value}
         onChange={(e) => onChange(e.target.value.toUpperCase())}
         pattern="[A-Z]{2,6}-\d{3,6}"
         placeholder="ABC-123"
       />
     );
   }
   ```

5. **Register in your package configuration** so the scalar is available system-wide

---

## Design System Components

### Common Components from `@powerhousedao/design-system`

Before using components, check actual package exports by reading the package's type definitions:

```typescript
import { Button, Icon } from "@powerhousedao/design-system";
```

#### Available Component Categories

| Category | Examples |
|----------|---------|
| **Buttons** | Button, IconButton |
| **Layout** | Card, Panel, Section |
| **Feedback** | Toast, Modal, Dialog |
| **Navigation** | Tabs, Breadcrumbs |
| **Data Display** | Table, Badge, Tag |
| **Form Controls** | Input, Select, Checkbox |
| **Icons** | Icon component with name prop |

### Icon Usage

```typescript
import { Icon } from "@powerhousedao/design-system";

<Icon name="plus" size={16} />
<Icon name="edit" size={20} />
<Icon name="trash" size={16} color="red" />
```

### Confirm Dialog

```typescript
import { confirm } from "@powerhousedao/design-system";

async function handleDelete() {
  const confirmed = await confirm({
    title: "Delete Item",
    message: "Are you sure you want to delete this item?",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
  });
  if (confirmed) {
    dispatch(deleteItem({ id: itemId }));
  }
}
```

---

## Best Practices

1. **Check actual exports** before importing -- read package type definitions to verify what's available
2. **Prefer design system components** over custom implementations for standard UI patterns
3. **Use DocumentToolbar** in all editors unless explicitly told to remove it
4. **Use scalar components** from document-engineering for standard data types
5. **Create custom scalars** only when built-in types are insufficient
6. **Keep styling consistent** with the design system's visual language
7. **Import from the correct subpath** -- `@powerhousedao/design-system/connect` for document-aware components
