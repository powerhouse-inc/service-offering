# @powerhousedao/service-offering

A Powerhouse Reactor Package for managing service offerings, subscription tiers, pricing, and resource provisioning.

## Overview

This package provides the document models, editors, subgraph, and processors needed to define service offerings with tiered pricing, manage resource templates, and handle subscription instances for customers.

## Document Models

| Model | Type ID | Description |
|---|---|---|
| **Service Offering** | `powerhouse/service-offering` | Defines a service with tiers, pricing, billing cycles, option groups, and add-ons |
| **Resource Template** | `powerhouse/resource-template` | Describes a resource an operator provides — services, facet targets, FAQs, content sections |
| **Resource Instance** | `powerhouse/resource-instance` | A provisioned instance of a resource template for a specific customer |
| **Subscription Instance** | `powerhouse/subscription-instance` | Tracks a customer's active subscription — billing, services, and status |
| **Facet** | `powerhouse/facet` | A classification dimension (e.g. "Region", "Team Size") with selectable options |

## Editors

| Editor | Target Document |
|---|---|
| **Service Offering Editor** | `powerhouse/service-offering` |
| **Resource Template Editor** | `powerhouse/resource-template` |
| **Resource Instance Editor** | `powerhouse/resource-instance` |
| **Subscription Instance Editor** | `powerhouse/subscription-instance` |

## Subgraph

### resources-services

A GraphQL subgraph that exposes resource templates and service offerings to external consumers. It provides:

- **Queries**
  - `resourceTemplates(filter)` — list/filter resource templates by ID, status, or operator
  - `serviceOfferings(filter)` — list/filter service offerings by ID, status, operator, or linked resource template
- **Mutations**
  - `createProductInstances(input)` — provisions a full customer onboarding: creates a team drive, builder profile, resource instance, and subscription instance from a service offering and user-selected tier/billing cycle

The subgraph reads documents via the Reactor Client and filters out soft-deleted documents and documents belonging to deleted drives.

## Processors

- **Connect** — processor for the Connect web app
- **Switchboard** — processor for the Switchboard API service

## Utils

The `service-offering` document model exports a `getUserSelectionPriceBreakdown` utility that computes a full price breakdown (tier costs, option group costs, add-on costs, discounts, setup fees) from a user's tier and billing cycle selection.

## Development

```bash
# Install dependencies
bun install

# Start Vetra (local dev environment with Connect + Switchboard)
ph vetra --watch

# Run tests
bun test

# Lint
bun run lint:fix

# Type-check
bun run tsc

# Build
bun run build
```

## Package Exports

| Export Path | Contents |
|---|---|
| `.` | Root — document models, editors, processors, manifest |
| `./document-models` | All document model modules |
| `./document-models/*` | Individual document models (e.g. `./document-models/service-offering`) |
| `./editors` | All editor modules |
| `./editors/*` | Individual editors |
| `./subgraphs` | Subgraph modules |
| `./processors` | Processor factory |
| `./style.css` | Compiled Tailwind stylesheet |
