# Ars Contexta Setup — Powerhouse/Vetra Ecosystem

## Track: Experimental

This is a specialized technical domain that doesn't map cleanly to research papers or personal life tracking.

## What I want to track, remember, and think about

I'm building within the **Powerhouse/Vetra ecosystem** — an event-sourced document platform where everything is a document model with GraphQL schemas, pure reducers, and operations that form an immutable audit trail.

## Knowledge to capture

### Document model designs

State schemas, module structures, operation signatures, and the rationale behind each design choice. Models evolve across versions and I need to track what changed and why.

### Patterns and anti-patterns

Hard-won lessons — reducer purity rules (no `crypto.randomUUID()`, no `Date.now()`), nullable handling (`InputMaybe<T>` vs `Maybe<T>`), state type naming conventions (`XState` not `XGlobalState`), error handling patterns.

### Architecture decisions

When to use global vs local scope, how to structure modules, when something should be a document-model vs a document-editor vs an app (drive editor).

### Object relations within document models

How objects in a document model's state relate to each other — parent-child hierarchies, reference patterns (OID-based lookups), array membership, and cross-object dependencies. For example, how option groups reference services, how tiers reference pricing entries, how billing cycle discounts attach to specific configurations. These relations aren't explicit in GraphQL (no foreign keys) so they're easy to lose track of as models grow.

### Document model to editor wiring

Which document models are consumed by which editors, how editors compose multiple document models together, which hooks correspond to which models, and how dispatch flows connect editor UI actions to specific model operations. When an editor needs data from model A but dispatches to model B, that relationship needs to be tracked — especially as editors grow to orchestrate multiple document types in a single view.

### MCP tool workflows

The reactor-mcp has specific sequencing requirements (check schema before addActions, batch operations, two-step modification rule).

### Switchboard CLI

Commands, configuration, and deployment workflows for Switchboard — the server infrastructure for Powerhouse reactors. Connection setup, environment configuration, troubleshooting patterns, and how Switchboard relates to `ph vetra`, `ph connect`, and reactor-mcp in the development workflow.

### Editor patterns

React hooks (`useSelectedDocument`, `usePHToast`, `useSelectedDrive`), component library usage, styling conventions.

### Helper functions and calculation logic

Utility functions that live outside the document model but are critical to editor behavior — service offering discount calculations, billing cycle pricing resolution, tier-level computation, and any derived-value logic. These aren't operations or reducers — they're pure business logic that editors depend on. I need to track what exists, where it lives, what it computes, and which editors consume it.

### Debugging insights

Solutions to recurring TypeScript errors, code generation issues, and reducer bugs.

### Cross-model connections

How document models relate to each other, which editors serve which models, which apps manage which document types.

## System configuration

### Granularity

Atomic notes for individual patterns/conventions (one rule per note), coarser notes for architecture decisions and model designs (one decision or model per note).

### Processing depth

Medium-high. Flag when a new pattern contradicts an existing one, surface relevant conventions when working in a specific area.

### Navigation (MOCs)

- **Schema design** — GraphQL state schemas, input types, scalar usage, naming conventions
- **Reducer patterns** — purity rules, error handling, nullable handling, Mutative usage
- **Editor patterns** — hooks, component library, styling, dispatch flows
- **MCP workflows** — reactor-mcp sequencing, batching, two-step modification
- **Architecture decisions** — scope selection, module design, document type choice
- **Helper/utility functions** — indexed by what they calculate and which editors consume them
- **Object relations** — indexed by document model and object type
- **Model-editor wiring** — which model feeds which editor and how
- **Switchboard CLI** — commands, configuration, deployment, troubleshooting
- **Gotchas** — aggregated frequently-needed warnings and foot-guns
