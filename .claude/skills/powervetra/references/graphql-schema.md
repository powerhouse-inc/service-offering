# GraphQL Schema Reference

Complete reference for designing GraphQL schemas in the Powerhouse/Vetra ecosystem. Covers state schemas, input types, scalar types, arrays, custom scalars, and design principles.

---

## State Schema Rules

### Global State Type Naming (CRITICAL)

The global state type name MUST follow this exact pattern:

```graphql
type <DocumentModelName>State {
    # your fields here
}
```

**DO NOT** append "Global" to the state type name:

```graphql
# WRONG - causes TypeScript compilation errors
type TodoListGlobalState {
    todos: [Todo!]!
}

# CORRECT - global state
type TodoListState {
    todos: [Todo!]!
}

# CORRECT - local state
type TodoListLocalState {
    localTodos: [Todo!]!
}
```

The code generator expects `<DocumentModelName>State` for global state and `<DocumentModelName>LocalState` for local state.

### Field Optionality

- **Most fields should be optional** to support creating empty documents
- Use required fields (`!`) only when absolutely necessary
- Defaults are handled by operations, not the schema
- Arrays are an exception -- always declare as `[Type!]!`

---

## Scalar Types

### Standard GraphQL Scalars

| Scalar | Description |
|--------|-------------|
| `String` | UTF-8 character sequence |
| `Int` | 32-bit signed integer |
| `Float` | Double-precision floating point |
| `Boolean` | `true` or `false` |

### Custom Identity Scalars

| Scalar | Description | Usage |
|--------|-------------|-------|
| `OID` | Object ID | Unique identifier for objects within arrays. Required on all array items. |
| `PHID` | Powerhouse ID | Document-level identifier |
| `OLabel` | Object Label | Metadata label for objects |

### Custom Amount Scalars

| Scalar | Description |
|--------|-------------|
| `Amount` | Generic numeric amount |
| `Amount_Tokens` | Token quantities |
| `Amount_Money` | Monetary amounts |
| `Amount_Fiat` | Fiat currency amounts |
| `Amount_Currency` | Currency amounts (generic) |
| `Amount_Crypto` | Cryptocurrency amounts |
| `Amount_Percentage` | Percentage values |

### Custom Specialized Scalars

| Scalar | Description |
|--------|-------------|
| `EthereumAddress` | Ethereum wallet address |
| `EmailAddress` | Email address |
| `Date` | Calendar date (no time) |
| `DateTime` | Date and time with timezone |
| `URL` | Uniform Resource Locator |
| `Currency` | Currency code (e.g., "USD", "EUR") |

---

## Arrays and Objects

### Array Declaration Rules

Arrays MUST be mandatory with non-nullable items:

```graphql
# CORRECT
type TodoListState {
    todos: [Todo!]!
}

# WRONG - nullable array
type TodoListState {
    todos: [Todo!]
}

# WRONG - nullable items
type TodoListState {
    todos: [Todo]!
}
```

### Objects in Arrays

Every object stored in an array MUST include an `OID!` field for unique identification:

```graphql
type Todo {
    id: OID!
    title: String
    completed: Boolean
    createdAt: DateTime
}

type TodoListState {
    todos: [Todo!]!
}
```

Include `OLabel` for metadata when relevant:

```graphql
type Category {
    id: OID!
    label: OLabel
    name: String!
    color: String
}
```

---

## Input Types

### Design Principles

- Reflect user intent with descriptive names
- Use simple, specific fields over complex nested types
- Include all dynamic values needed by the reducer
- Always include `id: OID!` for entities being created, updated, or deleted

### Example Input Schemas

```graphql
# Creating a new entity
input AddTodoInput {
    id: OID!
    title: String!
    createdAt: DateTime!
}

# Updating an entity
input UpdateTodoInput {
    id: OID!
    title: String
    completed: Boolean
    notes: String
}

# Deleting an entity
input DeleteTodoInput {
    id: OID!
}

# Toggling a property
input ToggleTodoInput {
    id: OID!
}
```

### Input Schema for Operation Actions

When defining operations via `SET_OPERATION_SCHEMA`, provide the input schema as a GraphQL string:

```graphql
input AddServiceInput {
    id: OID!
    name: String!
    description: String
    category: String
    createdAt: DateTime!
}
```

---

## Custom Scalar Creation

Powerhouse supports creating custom scalars through the `@powerhousedao/document-engineering` package.

### 8-Step Registration Process

1. **Define the scalar** in your GraphQL schema:
   ```graphql
   scalar MyCustomScalar
   ```

2. **Create a scalar module** implementing the scalar interface:
   ```typescript
   import { createScalar } from "@powerhousedao/document-engineering";

   export const MyCustomScalar = createScalar({
     name: "MyCustomScalar",
     serialize: (value) => String(value),
     parseValue: (value) => String(value),
     parseLiteral: (ast) => { /* handle AST */ },
   });
   ```

3. **Create a React component** for rendering/editing the scalar in editors

4. **Register the scalar** in your package configuration

5. **Export from the package** so it's available system-wide

6. **Add validation logic** in the serialize/parseValue functions

7. **Provide a display component** for read-only views

8. **Provide an edit component** for inline editing in editors

### Built-in Scalar Components

The `@powerhousedao/document-engineering` package provides React components for all built-in scalars. These components handle rendering and editing out of the box.

---

## Enum Types

Use GraphQL enum types for fixed sets of values:

```graphql
enum TodoPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
}

enum ServiceStatus {
    DRAFT
    ACTIVE
    PAUSED
    ARCHIVED
}

type Todo {
    id: OID!
    title: String!
    priority: TodoPriority
    status: ServiceStatus
}
```

---

## Nested Types

For complex state structures, nest types:

```graphql
type Address {
    street: String
    city: String
    country: String
    postalCode: String
}

type Contact {
    id: OID!
    name: String!
    email: EmailAddress
    phone: String
    address: Address
}

type ServiceOfferingState {
    contacts: [Contact!]!
}
```

Note: Nested types that are NOT in arrays do not require `OID`.

---

## Design Principles

### Schema Granularity

- Keep schemas flat where possible
- Use nesting only when data is logically grouped
- Avoid deeply nested structures (max 2-3 levels)

### Naming Conventions

- **Types**: PascalCase (e.g., `ServiceOffering`, `LineItem`)
- **Fields**: camelCase (e.g., `firstName`, `createdAt`)
- **Enums**: SCREAMING_SNAKE_CASE values (e.g., `HIGH`, `IN_PROGRESS`)
- **Input types**: PascalCase with `Input` suffix (e.g., `AddTodoInput`)

### State vs Input Design

| Aspect | State Schema | Input Schema |
|--------|-------------|-------------|
| Fields | Mostly optional | Required for mandatory data |
| Purpose | Data storage | User intent capture |
| Arrays | `[Type!]!` | Not typically nested |
| IDs | `OID!` on array items | `OID!` for entity reference |
| Timestamps | Optional on state | Required if tracking time |

### Evolution Strategy

When evolving schemas:
1. Add new fields as optional (backwards compatible)
2. Never remove or rename existing fields without migration
3. Use the two-step modification process (MCP + source files)
4. Run `npm run tsc` after schema changes to catch type errors
