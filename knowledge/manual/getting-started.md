---
summary: First session guide — creating insights, making connections, and finding your rhythm
type: manual
generated_from: "arscontexta-1.0"
---
# Getting Started

This page walks you through your first session with the Service Offering knowledge system. By the end, you will have created your first insight, connected it to the vault, and understood the rhythm that keeps everything moving.

## Prerequisites

The vault lives at `knowledge/` inside the service-offering repository. You need:

- The repository cloned and dependencies installed (`bun install`)
- Familiarity with the five document models: ServiceOffering, SubscriptionInstance, ResourceTemplate, ResourceInstance, and Facet
- A text editor that supports wiki-link resolution (Obsidian recommended, but any Markdown editor works)

## Your First Session

### 1. Orient Yourself

Start by scanning the vault structure:

```
knowledge/
  inbox/          — Raw material waiting to be processed
  insights/       — Extracted insights, the core of the vault
  manual/         — This manual (you are here)
  ops/            — Operational logs and session records
  self/           — Vault metadata, config, and methodology
  templates/      — Templates for new insights, maps, and sessions
```

Run `/stats` to see the current state of the vault: how many insights exist, how connected they are, and what needs attention.

### 2. Create Your First Insight

An insight is the atomic unit of knowledge. It captures one idea, one pattern, or one finding. For example, you might extract an insight about how ServiceOffering tiers relate to pricing:

> "Each ServiceOffering tier contains independent pricing that combines a base amount with optional discounts. The discount calculation in the pricing matrix flattens percentage-based and fixed-amount adjustments into a single effective price."

To create this insight from source material, use `/extract`:

```
/extract <paste or reference the source material>
```

The system will distill the material into one or more insights, each with:
- A clear title
- A summary in the frontmatter
- Tags linking it to relevant domain areas
- The body of the insight itself

### 3. Make Your First Connection

Insights gain value when connected. The system uses **wiki links** (`[[insight-name]]`) to create a web of related knowledge.

After extracting an insight, run `/connect` to find relationships:

```
/connect
```

This scans the vault for insights that relate to your new one and proposes links. You might discover that your pricing insight connects to an existing insight about SubscriptionInstance billing cycles, or to a map covering the commerce data model.

### 4. Understand Maps

Maps are higher-order structures that organize insights around a theme. Unlike an insight (which captures one idea), a map provides a navigational view across many insights. Examples:

- A map of "Subscription Lifecycle" connecting insights about creation, activation, billing, metrics, and cancellation
- A map of "Resource Management" linking ResourceTemplate, ResourceInstance, and Facet insights

Maps use the same wiki-link syntax to reference insights. They are not summaries — they are curated paths through the knowledge graph.

## The Session Rhythm

Every session follows the **orient-work-persist** pattern:

1. **Orient** — Run `/stats` and `/next` to see what the vault needs. Check the inbox for unprocessed material. Review any pending tasks.

2. **Work** — Process material through the pipeline:
   - `/extract` to distill new insights from source material
   - `/connect` to link new insights to existing ones
   - `/evolve` to update insights that have grown stale or incomplete
   - `/validate` to check quality and consistency

3. **Persist** — Save your session. The vault should be in a clean state: inbox items processed, new insights connected, no orphans left behind.

## Running the Tutorial

For a guided walkthrough, run:

```
/tutorial
```

This provides a step-by-step interactive session covering extraction, connection, evolution, and validation using real examples from the Service Offering domain.

## Next Steps

- [[skills]] — Learn every command available to you
- [[workflows]] — Understand the full processing pipeline
- [[configuration]] — Customize the system for your workflow
- [[troubleshooting]] — What to do when things go wrong
