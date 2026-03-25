---
summary: Complete reference for every command, grouped by category
type: manual
generated_from: "arscontexta-1.0"
---
# Skills

This page is a complete reference for every command available in the Service Offering knowledge system. Commands are grouped by what they help you do.

## Processing

These are the core operations that turn raw material into connected knowledge.

### /extract

**Distill insights from source material.**

Takes raw content — code snippets, design documents, meeting notes, PR descriptions — and produces one or more insights. Each insight captures a single idea with a clear title, summary, and body.

```
/extract <source material or reference>
```

Example: extracting from a code review discussion about how ServiceOffering option groups handle mutual exclusivity.

When to use: You have new material in the inbox or encounter something worth capturing. This is the entry point for all new knowledge.

### /connect

**Find and create connections between insights.**

Scans the vault for insights that relate to a target insight (or the most recent one). Proposes wiki links and may suggest creating or updating maps.

```
/connect                     — Connect the most recent insight
/connect <insight-name>      — Connect a specific insight
```

When to use: After extracting new insights. Also useful during maintenance when you notice isolated clusters in the graph.

### /evolve

**Update insights as understanding deepens.**

Reviews an insight against current knowledge and proposes updates. This might mean refining the summary, adding new connections, correcting outdated information, or merging with another insight.

```
/evolve <insight-name>       — Evolve a specific insight
/evolve --stale              — Find and evolve the most stale insights
```

Example: evolving an insight about SubscriptionInstance metrics after the billing components were refactored to support new measurement types.

When to use: When you know an insight is outdated, or during scheduled maintenance cycles. See [[workflows]] for maintenance triggers.

### /validate

**Check quality and consistency of insights.**

Examines insights for problems: missing summaries, broken wiki links, orphaned insights (no inbound connections), stale content, or contradictions with other insights.

```
/validate                    — Validate the entire vault
/validate <insight-name>     — Validate a specific insight
/validate --recent           — Validate insights from the current session
```

When to use: At the end of a work session, or when `/stats` reports quality issues.

## Orchestration

Commands that manage the flow of material through the system.

### /seed

**Add source material to the inbox.**

Places new material into the inbox for later processing. Accepts text, file references, or URLs.

```
/seed <material>
/seed --file <path>
```

Example: seeding the subgraph resolver code for `resourceTemplates` to extract insights about query patterns.

When to use: When you encounter material worth processing but want to defer extraction to a focused session.

### /ralph

**Batch process inbox items.**

Runs `/extract` across multiple inbox items in sequence, producing insights for each. Named for the systematic, methodical approach.

```
/ralph                       — Process all inbox items
/ralph --limit 5             — Process up to 5 items
```

When to use: When the inbox has accumulated multiple items and you want to process them efficiently.

### /pipeline

**Run the full processing pipeline.**

Executes the complete sequence: extract unprocessed material, connect new insights, evolve stale insights, validate results. This is the "do everything" command.

```
/pipeline                    — Full pipeline run
/pipeline --extract-only     — Only the extraction phase
```

When to use: At the start of a dedicated vault maintenance session. See [[workflows]] for the recommended rhythm.

### /tasks

**Manage the task queue.**

Lists, adds, or completes tasks that track pending vault work. Tasks are generated automatically (e.g., "connect orphaned insight X") or created manually.

```
/tasks                       — List pending tasks
/tasks add <description>     — Add a task manually
/tasks done <task-id>        — Mark a task complete
```

When to use: To see what the vault needs, especially at the start of a session.

## Navigation

Commands that help you understand and traverse the vault.

### /stats

**Show vault statistics.**

Reports insight count, connection density, orphan count, stale insight count, inbox size, and overall vault health score.

```
/stats                       — Full statistics
/stats --brief               — One-line summary
```

When to use: At the start of every session to orient yourself.

### /graph

**Analyze the knowledge graph.**

Provides structural analysis: clusters of related insights, bridge insights that connect clusters, isolated nodes, and the most-connected hubs.

```
/graph                       — Full graph analysis
/graph --clusters            — Show insight clusters
/graph --bridges             — Show bridge insights
```

Example: discovering that insights about ServiceOffering pricing form a dense cluster connected to SubscriptionInstance billing through a single bridge insight about discount propagation.

When to use: During maintenance to understand vault structure, or when deciding where to focus connection efforts.

### /next

**Get the next recommended action.**

Analyzes vault state and suggests the single most valuable thing you can do right now. Considers inbox size, orphan count, stale insights, and unfinished tasks.

```
/next
```

When to use: When you are unsure what to work on. Especially useful combined with the orient phase of each session.

## Growth

Commands that expand the vault's knowledge and methodology.

### /learn

**Research a topic and extract insights.**

Investigates a topic using available sources and produces insights. More autonomous than `/extract` — it seeks out material rather than requiring you to provide it.

```
/learn <topic>
```

Example: `/learn ResourceTemplate facet targeting` to research how facets are applied to resource templates and extract insights from the codebase.

When to use: When you want to deepen coverage of a domain area without manually gathering source material.

### /remember

**Capture a methodology learning.**

Records a lesson about how the vault itself should work — not domain knowledge, but process knowledge. These learnings shape future sessions.

```
/remember <lesson>
```

Example: `/remember When extracting from reducer code, always check for InputMaybe vs Maybe type distinctions — they affect how insights about data flow should be framed.`

When to use: When you notice a pattern in how you work with the vault that should be preserved.

## Evolution

Commands that reshape the vault at a structural level.

### /reassess

**Review accumulated friction and propose changes.**

Examines the vault for systemic issues: recurring patterns in orphaned insights, overloaded maps, poorly scoped insight boundaries, or methodology drift.

```
/reassess
```

When to use: Periodically (every 5-10 sessions), or when you feel the vault's structure is fighting you. See [[meta-skills]] for details.

### /refactor

**Restructure part of the vault.**

Executes structural changes: splitting oversized insights, merging duplicates, reorganizing maps, or renaming for consistency.

```
/refactor <scope>
/refactor --merge <insight-a> <insight-b>
/refactor --split <insight>
```

Example: refactoring the "Pricing" map into separate maps for "Tier Pricing" and "Discount Calculations" as the domain coverage grew.

When to use: After `/reassess` identifies structural issues, or when a map has grown unwieldy.

## Plugin Commands

Commands provided by the arscontexta plugin for system-level operations.

### /arscontexta:help

Display help information about the plugin and available commands.

### /arscontexta:health

Run a health check on the vault. Reports on structural integrity, configuration validity, and any detected issues.

### /arscontexta:ask

Ask a question about the vault's contents. This queries the knowledge graph and returns relevant insights. See [[meta-skills]] for detailed usage.

### /arscontexta:architect

Enter architect mode to make structural decisions about the vault. Used for configuration changes, dimension tuning, and methodology adjustments. See [[configuration]] for details.

## See Also

- [[getting-started]] — How to use these commands in your first session
- [[workflows]] — How commands combine into processing pipelines
- [[meta-skills]] — Deep dive into /ask, /architect, /reassess, /remember
- [[troubleshooting]] — When commands produce unexpected results
