# CLI Reference

Complete reference for the Powerhouse CLI (`ph`) -- the command-line tool for project initialization, code generation, and development in the Powerhouse/Vetra ecosystem.

---

## Installation

```bash
pnpm install -g ph-cmd
```

After installation, the `ph` command is available globally.

---

## Project Initialization

### `ph init <name>`

Creates a new Powerhouse project with boilerplate structure.

```bash
ph init my-project
cd my-project
pnpm install
```

Generated project structure:
```
my-project/
  document-models/        -- Document model definitions
  editors/                -- Editor components
  scripts/                -- Utility scripts
  powerhouse.manifest.json  -- Package manifest
  package.json
  tsconfig.json
```

---

## Development Mode

### `ph vetra`

Launches Vetra Studio for local development. This is the primary development command.

#### Recommended Mode

```bash
ph vetra --interactive --watch
```

#### Flags

| Flag | Description |
|------|-------------|
| `--interactive` | Requires confirmation before code generation runs |
| `--watch` | Enables dynamic reloading of documents and editors |
| (no flags) | Runs in default mode (auto-generates without confirmation) |

#### Development Modes

| Mode | Command | Use Case |
|------|---------|----------|
| **Interactive + Watch** | `ph vetra --interactive --watch` | Recommended for development |
| **Watch Only** | `ph vetra --watch` | Auto-generate on changes |
| **Interactive Only** | `ph vetra --interactive` | Manual confirmation, no live reload |
| **Default** | `ph vetra` | Quick start, auto-generates everything |

### What `ph vetra` Does

1. Starts a local reactor server
2. Creates a vetra drive (`vetra-{hash}`) for source documents
3. Creates a preview drive (`preview-{hash}`) for testing
4. Starts an MCP server for AI agent interactions
5. Watches for document changes and triggers code generation
6. Serves the Connect UI for browser-based editing

---

## Code Generation

### `ph generate`

Generates boilerplate code for editors, subgraphs, and drive editors.

#### Generate an Editor

```bash
ph generate --editor <name> --document-types <type1> [<type2> ...]
```

Example:
```bash
ph generate --editor todo-editor --document-types powerhouse/todo-list
```

#### Generate a Subgraph

```bash
ph generate --subgraph <name>
```

Example:
```bash
ph generate --subgraph analytics-subgraph
```

#### Generate a Drive Editor (Drive-App)

```bash
ph generate --drive-editor <name>
```

Example:
```bash
ph generate --drive-editor project-dashboard
```

---

## Connect Studio

### `ph connect`

Launches Connect Studio in the browser for interactive editing and document management.

```bash
ph connect
```

### `ph connect --build`

Builds Connect Studio for production.

### `ph connect --preview`

Previews the production build locally.

---

## Package Management

### `ph use <package>`

Installs a Powerhouse package from the registry.

```bash
ph use @powerhousedao/todo-package
```

### `ph install`

Installs dependencies and sets up the project.

```bash
ph install
```

### `ph uninstall <package>`

Removes a Powerhouse package.

```bash
ph uninstall @powerhousedao/todo-package
```

### `ph list`

Lists installed Powerhouse packages.

```bash
ph list
```

---

## Inspection and Debugging

### `ph inspect`

Inspects a document or drive for debugging purposes.

```bash
ph inspect <document-path>
```

### `ph checkout`

Checks out a specific version or revision of a document.

### `ph migrate`

Runs migrations for document models (e.g., upgrading from v4 to v5).

```bash
ph migrate
```

---

## Server Commands

### `ph switchboard`

Starts the Switchboard server -- the scalable API service for document data.

```bash
ph switchboard
```

### `ph reactor`

Manages reactor instances.

```bash
ph reactor start
ph reactor stop
ph reactor status
```

---

## Authentication

### `ph login`

Authenticates with the Powerhouse network using Ethereum wallet signatures (Renown).

```bash
ph login
```

### `ph access-token`

Manages access tokens for API authentication.

```bash
ph access-token create
ph access-token list
ph access-token revoke <token-id>
```

---

## Service Commands

### `ph service`

Manages background services.

```bash
ph service start
ph service stop
ph service status
```

---

## Build and Publish

### Build

```bash
pnpm build
```

### Publish

```bash
npm publish --access public
```

### Quality Checks (Run Before Publishing)

```bash
npm run tsc          # TypeScript type checking
npm run lint:fix     # ESLint with auto-fix
pnpm run test        # Run tests
```

---

## Vetra Remote Drive Configuration

### Connecting to a Remote Drive

Remote drives enable collaborative development across teams.

```bash
# Via MCP
mcp__reactor-mcp__addRemoteDrive({
  url: "https://your-server.com/d/<drive-id>",
  options: {
    availableOffline: true,
    pullInterval: 3000
  }
})
```

### Pull Filter Options

Filter which documents sync from the remote:

```typescript
{
  pullFilter: {
    documentType: ["powerhouse/todo-list"],  // Only sync specific types
    branch: ["main"],                         // Only sync specific branches
    documentId: ["doc-123"],                  // Only sync specific documents
    scope: ["global"]                         // Only sync specific scopes
  }
}
```

---

## Network Endpoints

| Service | Default URL |
|---------|-------------|
| Connect Studio | `http://localhost:3000` |
| Switchboard | `http://localhost:4001` |
| Reactor API | `http://localhost:4001/api/v1` |
| MCP Server | Started automatically by `ph vetra` |

---

## Troubleshooting

### MCP Server Not Available

If the reactor-mcp server is unavailable:
1. Run `ph vetra` in a separate terminal
2. Wait for the server to start (look for "MCP server started" message)
3. Retry the MCP tool connection

### Code Generation Not Running

1. Verify the document is **CONFIRMED** (not DRAFT)
2. Check that `ph vetra` is running with `--watch` flag
3. Look for errors in the `ph vetra` terminal output

### TypeScript Errors After Schema Changes

1. Run `npm run tsc` to see all errors
2. Check that state type names follow the `<Name>State` convention
3. Verify all array types use `[Type!]!` format
4. Check that optional fields use proper null handling in reducers
