# Subgraphs & Processors Reference

Complete reference for creating subgraphs and processors in the Powerhouse/Vetra ecosystem. Subgraphs provide GraphQL-based data views, while processors transform document events into derived data stores.

---

## Subgraphs

### What is a Subgraph?

A subgraph is a modular GraphQL data component that augments document models with custom queries and resolvers. Subgraphs are combined into a unified **Supergraph** endpoint via a GraphQL gateway.

### When to Use Subgraphs

- Custom GraphQL queries beyond basic document CRUD
- Aggregated views across multiple documents
- Complex data transformations
- API endpoints for external consumers
- Real-time data subscriptions

### Creating a Subgraph via MCP

1. **Check the subgraph schema**:
   ```
   mcp__reactor-mcp__getDocumentModelSchema({ type: "powerhouse/subgraph" })
   ```

2. **Create the subgraph document**:
   ```
   mcp__reactor-mcp__createDocument({ documentType: "powerhouse/subgraph" })
   ```

3. **Configure the subgraph** (name, data sources):
   ```
   mcp__reactor-mcp__addActions({
     documentId: "<subgraph-id>",
     actions: [
       { type: "SET_SUBGRAPH_NAME", scope: "global", input: { name: "Analytics" } },
       { type: "SET_SUBGRAPH_DATA_SOURCES", scope: "global", input: { dataSources: ["powerhouse/my-model"] } }
     ]
   })
   ```

4. **Confirm the subgraph**:
   ```
   mcp__reactor-mcp__addActions({
     documentId: "<subgraph-id>",
     actions: [{ type: "SET_SUBGRAPH_STATUS", scope: "global", input: { status: "CONFIRMED" } }]
   })
   ```

5. **Add to the vetra drive** using `ADD_FILE`

### Creating a Subgraph via CLI

```bash
ph generate --subgraph <name>
```

### Subgraph File Structure

```
subgraphs/<name>/
  schema.graphql       -- GraphQL schema definition
  resolvers.ts         -- Resolver implementations
  index.ts             -- Module exports
```

### Schema Definition

Define your subgraph schema in GraphQL:

```graphql
type Query {
  todosByStatus(status: String!): [Todo!]!
  todoStats: TodoStats!
}

type TodoStats {
  total: Int!
  completed: Int!
  pending: Int!
}
```

### Resolver Implementation

```typescript
export const resolvers = {
  Query: {
    todosByStatus: async (_, { status }, context) => {
      const documents = await context.getDocuments("powerhouse/todo-list");
      return documents
        .flatMap(doc => doc.state.global.todos)
        .filter(todo => todo.status === status);
    },
    todoStats: async (_, __, context) => {
      const documents = await context.getDocuments("powerhouse/todo-list");
      const allTodos = documents.flatMap(doc => doc.state.global.todos);
      return {
        total: allTodos.length,
        completed: allTodos.filter(t => t.completed).length,
        pending: allTodos.filter(t => !t.completed).length,
      };
    },
  },
};
```

### Runtime Auto-Generation (v5.3.0+)

Starting with Powerhouse runtime v5.3.0, subgraph schemas and resolvers can be auto-generated based on document model definitions, reducing boilerplate for standard CRUD operations.

---

## GraphQL Gateway (Supergraph)

The Switchboard aggregates all subgraphs into a unified GraphQL endpoint:

```
https://your-switchboard.com/graphql
```

Each subgraph contributes its types and queries to the supergraph. The gateway handles:
- Schema stitching/federation
- Query routing to appropriate subgraphs
- Authentication and authorization

---

## Processors

### What is a Processor?

A processor is a component that processes document events (operations) and transforms them into derived data stores. Processors run reactively -- when a document changes, the processor updates its derived data.

### Processor Types

| Type | Purpose | Data Store |
|------|---------|------------|
| **Analytics Processor** | Feeds analytics stores for BI and reporting | Analytics databases |
| **Operational (Relational) Processor** | Maintains relational database views | PGlite (in-browser PostgreSQL) |

### Creating a Processor via MCP

1. **Check the processor schema**:
   ```
   mcp__reactor-mcp__getDocumentModelSchema({ type: "powerhouse/processor" })
   ```

2. **Create the processor document**:
   ```
   mcp__reactor-mcp__createDocument({ documentType: "powerhouse/processor" })
   ```

3. **Configure and confirm**:
   ```
   mcp__reactor-mcp__addActions({
     documentId: "<processor-id>",
     actions: [
       { type: "SET_PROCESSOR_NAME", scope: "global", input: { name: "Todo Analytics" } },
       { type: "SET_PROCESSOR_STATUS", scope: "global", input: { status: "CONFIRMED" } }
     ]
   })
   ```

4. **Add to the vetra drive**

---

## Relational Database Hooks

Powerhouse provides hooks for maintaining relational database views using **PGlite** (embedded PostgreSQL) and **Kysely** (type-safe SQL query builder).

### `createProcessorQuery`

Creates a processor that maintains a SQL table from document operations.

```typescript
import { createProcessorQuery } from "@powerhousedao/reactor-browser";

const todoProcessor = createProcessorQuery({
  documentType: "powerhouse/todo-list",
  tableName: "todos",
  columns: {
    id: "text primary key",
    title: "text not null",
    completed: "boolean default false",
    created_at: "timestamp",
  },
  onOperation: (operation, db) => {
    switch (operation.type) {
      case "ADD_TODO":
        return db.insertInto("todos").values({
          id: operation.input.id,
          title: operation.input.title,
          completed: false,
          created_at: operation.input.createdAt,
        });
      case "TOGGLE_TODO":
        return db.updateTable("todos")
          .set({ completed: true })
          .where("id", "=", operation.input.id);
      case "DELETE_TODO":
        return db.deleteFrom("todos")
          .where("id", "=", operation.input.id);
    }
  },
});
```

### `useRelationalDb`

Hook for accessing the PGlite database instance.

```typescript
import { useRelationalDb } from "@powerhousedao/reactor-browser";

function MyComponent() {
  const db = useRelationalDb();
  // Use db for direct SQL queries
}
```

### `useRelationalQuery`

Hook for executing SQL queries reactively.

```typescript
import { useRelationalQuery } from "@powerhousedao/reactor-browser";

function TodoDashboard() {
  const { data, loading, error } = useRelationalQuery(
    (db) => db.selectFrom("todos")
      .select(["id", "title", "completed"])
      .where("completed", "=", false)
      .orderBy("created_at", "desc")
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### Kysely Query Building

Kysely provides a type-safe SQL query builder:

```typescript
// SELECT with conditions
db.selectFrom("todos")
  .select(["id", "title"])
  .where("completed", "=", false)
  .orderBy("created_at", "desc")
  .limit(10);

// INSERT
db.insertInto("todos")
  .values({ id: "1", title: "Test", completed: false });

// UPDATE
db.updateTable("todos")
  .set({ completed: true })
  .where("id", "=", "1");

// DELETE
db.deleteFrom("todos")
  .where("id", "=", "1");

// Aggregations
db.selectFrom("todos")
  .select([
    db.fn.count("id").as("total"),
    db.fn.countAll().as("count"),
  ]);
```

### Raw SQL

For complex queries not easily expressed with Kysely:

```typescript
const result = await db.executeQuery(
  sql`SELECT * FROM todos WHERE title LIKE ${"%" + searchTerm + "%"}`
);
```

---

## Comparison Table

| Aspect | Subgraph | Processor |
|--------|----------|-----------|
| **Purpose** | GraphQL API layer | Data transformation |
| **Output** | GraphQL types + resolvers | Derived data store |
| **Technology** | GraphQL schema | SQL / PGlite / Kysely |
| **Reactivity** | On-demand (query time) | Event-driven (on document change) |
| **Use Case** | External API, custom queries | Dashboards, analytics, relational views |
| **MCP Confirmation** | `SET_SUBGRAPH_STATUS` | `SET_PROCESSOR_STATUS` |

---

## Best Practices

1. **Use subgraphs** for external API access and complex queries
2. **Use processors** for maintaining derived/aggregated views
3. **Always confirm** subgraphs and processors (CONFIRMED status required for code generation)
4. **Batch processor operations** for performance
5. **Use Kysely's type-safe builder** over raw SQL when possible
6. **Handle missing data gracefully** -- documents may not have all fields populated
7. **Keep processor logic idempotent** -- processors may re-process events during sync
