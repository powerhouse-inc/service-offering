# Powerhouse/Vetra Glossary

## Core Concepts

| Term | Definition |
|------|-----------|
| **Powerhouse** | Network organization providing open-source software and services for decentralized operations |
| **Vetra** | Builder platform within Powerhouse for creating packages with document models, editors, and apps |
| **Connect** | The contributor's workspace — host application running apps, editors, and drives |
| **Switchboard** | Scalable API service aggregating document data; runs as backend |
| **Fusion** | SDK/marketplace platform for data visualization and SNO interactions |
| **Renown** | Decentralized identity and authentication system using Ethereum wallet signatures |
| **Powergrid** | Decentralized reactor network enabling synchronization |

## Document Modeling

| Term | Definition |
|------|-----------|
| **Document Model** | Structured data model defining how documents store and process information (schema + operations) |
| **Document** | Instance of a document model containing actual data |
| **Document Type** | Unique identifier string (e.g., `powerhouse/todo-list`) |
| **Document State** | Current data held by a document instance per its model definition |
| **Operations** | Named commands representing all ways to change document state |
| **Actions** | Typed objects representing intent to change a document's state |
| **Dispatch** | Sending actions to model reducers to trigger state updates |
| **Reducers** | Pure synchronous functions implementing state transition logic |
| **Event History** | Immutable, append-only log of every operation applied to a document |
| **Immutable Updates** | Operations create new data versions rather than altering existing data |
| **Strands** | Single synchronization channel between two sync points |
| **Time Travel Debugging** | Reconstructing past states by replaying historical events |

## Architecture

| Term | Definition |
|------|-----------|
| **Reactor** | Storage node for documents/files; stores, resolves conflicts, verifies event histories |
| **Reactor-MCP** | MCP server bridging AI systems and Powerhouse document management |
| **Model Context Protocol (MCP)** | Standardized protocol for AI agents to interact via structured operations |
| **CQRS** | Command Query Responsibility Segregation — separating read/write operations |
| **Event Sourcing** | System state stored as sequence of immutable events |
| **DocSync** | Protocol synchronizing document updates across reactors |
| **Supergraph** | Unified GraphQL endpoint consolidating multiple subgraphs |
| **Subgraph** | GraphQL-based modular data component augmenting document models |
| **Drive** | Logical container for storing, organizing, and managing document collections |
| **Preview Drive** | Local testing drive created during development |
| **Remote Drive** | Server-hosted drive enabling collaborative development |

## Development

| Term | Definition |
|------|-----------|
| **Vetra Studio** | Local development mode launched via `ph vetra` |
| **Studio Mode** | Local development mode for real-time model and editor development |
| **Watch Mode** | `--watch` flag enabling dynamic reloading of documents and editors |
| **Interactive Mode** | `--interactive` flag requiring confirmation before code generation |
| **Boilerplate** | Initial project structure from `ph init` |
| **Powerhouse Package** | Published collection of models, editors, and resources |
| **Specification Driven Design** | Using structured specs (GraphQL schemas) for AI-assisted development |
| **Operations History** | Chronological, immutable log of all operations on a document |

## Identity Types

| Term | Definition |
|------|-----------|
| **OID** | Object ID — unique identifier for objects within arrays |
| **PHID** | Powerhouse ID — document-level identifier |
| **OLabel** | Object Label — metadata label for objects |
| **DID** | Decentralized Identifier — user-controlled, globally unique ID |

## Application Types

| Term | Definition |
|------|-----------|
| **Editor** | React component for viewing/modifying individual documents |
| **Drive-App** | Custom interface for managing multiple documents in a drive (kanban, dashboards, etc.) |
| **Processor** | Component that processes document events into derived data stores |
| **Analytics Processor** | Feeds analytics stores for BI and reporting |
| **Operational Processor** | Maintains relational database views of document data |

## Tools

| Term | Definition |
|------|-----------|
| **Powerhouse CLI (ph)** | Command-line tool for project init, code generation, and development |
| **ph-cmd** | Global CLI package (`pnpm install -g ph-cmd`) |
| **PGlite** | Embedded PostgreSQL for real-time relational queries in the browser |
| **Kysely** | Type-safe SQL query builder used with relational database hooks |

## Organizational

| Term | Definition |
|------|-----------|
| **Scalable Network Organization (SNO)** | Framework-based network structure for sustainable growth |
| **AI Assistants** | AI-powered contributors paired with humans to automate tasks |
| **Document Model Agent** | Specialized AI guiding users through model creation |
| **Renown Login Flow** | Ethereum wallet-signature authentication generating user DIDs |
