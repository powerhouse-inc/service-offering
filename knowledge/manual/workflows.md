---
summary: Processing pipeline, session rhythm, maintenance triggers, and batch processing
type: manual
generated_from: "arscontexta-1.0"
---
# Workflows

This page explains how the knowledge system's commands combine into repeatable workflows. Understanding these patterns helps you maintain a healthy, growing vault.

## The Processing Pipeline

Every piece of knowledge moves through four stages:

```
Capture  -->  Extract  -->  Connect  -->  Validate
(inbox)      (insights)    (links/maps)   (quality)
```

### Stage 1: Capture

Raw material enters the vault through the inbox. This can be:

- Code snippets from the five document models (ServiceOffering, SubscriptionInstance, ResourceTemplate, ResourceInstance, Facet)
- Design decisions from editor development (service-offering-editor, subscription-instance-editor, resource-template-editor, resource-instance-editor)
- Schema changes from the subgraph
- Architecture discussions, PR reviews, or meeting notes
- Observations made while working in the codebase

Use `/seed` to add material, or drop files directly into `knowledge/inbox/`.

### Stage 2: Extract

Extraction distills raw material into insights. Each insight captures one idea:

- **Good scope**: "ServiceOffering tiers use independent pricing with base amount plus optional percentage and fixed discounts"
- **Too broad**: "How ServiceOffering works" (this should be a map, not an insight)
- **Too narrow**: "The discount field is a Float" (this is a fact, not an insight)

The `/extract` command handles this transformation. For batch processing, `/ralph` processes multiple inbox items sequentially.

### Stage 3: Connect

New insights must be woven into the existing knowledge graph. Connection happens at two levels:

1. **Direct links** — Wiki links between insights that share a concept. For example, an insight about ResourceTemplate audience targeting links to an insight about Facet option hierarchies because facets define the targeting dimensions.

2. **Maps** — When a cluster of related insights forms around a theme, a map provides a navigational overview. Maps for this vault might include:
   - "Pricing Architecture" — connecting ServiceOffering tier pricing, discount calculations, and SubscriptionInstance billing
   - "Resource Lifecycle" — linking ResourceTemplate creation, ResourceInstance instantiation, and facet configuration
   - "Editor Patterns" — insights about shared component patterns, hook usage, and dispatch mechanisms across the four editors

Use `/connect` after extraction, and review map coverage during maintenance.

### Stage 4: Validate

Validation checks that the vault remains internally consistent:

- Every insight has a summary and meaningful connections
- Wiki links resolve to existing insights
- No insights contradict each other
- Stale insights (those not updated as the codebase evolved) are flagged

Use `/validate` at the end of each session.

## Session Rhythm

Each vault session follows the **orient-work-persist** pattern described in [[getting-started]]. Here is the detailed version:

### Orient (2-5 minutes)

```
/stats          — Check vault health
/next           — Get recommended action
/tasks          — Review pending work
```

Decide your focus for the session. Common focuses:
- **Inbox processing** — Material has accumulated and needs extraction
- **Connection work** — Recent insights are poorly connected
- **Maintenance** — Stale insights, orphans, or structural issues need attention
- **Growth** — A specific domain area needs deeper coverage

### Work (the bulk of the session)

Depending on your focus:

| Focus | Primary Commands | Example |
|---|---|---|
| Inbox processing | `/ralph`, `/extract` | Process 5 new items about the subgraph query resolvers |
| Connection work | `/connect`, `/graph` | Link orphaned insights about Facet options to the Resource Lifecycle map |
| Maintenance | `/evolve`, `/validate`, `/refactor` | Update insights written before the SubscriptionInstance billing refactor |
| Growth | `/learn`, `/seed`, `/extract` | Research how the resource-instance-editor handles external GraphQL queries |

### Persist (2-5 minutes)

```
/validate --recent    — Check today's work
/stats --brief        — Confirm vault health
```

Ensure no orphaned insights were left behind. Commit changes to the repository.

## Maintenance Triggers

Certain vault conditions should trigger a maintenance session:

| Condition | Trigger Threshold | Action |
|---|---|---|
| Orphan insights | More than 3 unconnected insights | Run `/connect` on each orphan |
| Stale insights | Any insight older than 10 sessions without review | Run `/evolve --stale` |
| Inbox overflow | More than 10 unprocessed items | Dedicated `/ralph` session |
| Dangling links | Any `[[link]]` pointing to nonexistent insight | Create the missing insight or fix the link |
| Map overload | Any map with more than 20 direct links | Consider splitting via `/refactor` |
| Methodology drift | `/reassess` recommended by `/next` | Run `/reassess` and act on findings |

See [[troubleshooting]] for how to resolve each of these conditions.

## Batch Processing

For large processing runs (e.g., extracting insights from an entire module's codebase), use the pipeline:

```
/pipeline
```

This runs all four stages automatically. For more control:

```
# Step-by-step batch processing
/ralph --limit 10          # Extract from first 10 inbox items
/connect                    # Connect all new insights
/evolve --stale            # Update anything that needs it
/validate                  # Check everything
```

### Batch Processing Tips

- **Scope your batches**: Process material from one document model or one editor at a time. Mixing ServiceOffering pricing material with ResourceTemplate facet material in a single batch makes connection harder.
- **Review before connecting**: After `/ralph` produces insights, scan them for quality before running `/connect`. It is easier to fix an insight before it is woven into the graph.
- **Save maps for after**: Do not create maps during batch extraction. Extract first, connect second, and let maps emerge from the connection patterns.

## The Full Pipeline Visualized

```
    /seed (capture)
        |
        v
    inbox/
        |
    /ralph or /extract
        |
        v
    insights/
        |
    /connect
        |
        v
    insights/ (now linked) + maps
        |
    /validate
        |
        v
    Clean vault state
        |
    /evolve (periodic)
        |
        v
    Updated insights
```

## See Also

- [[getting-started]] — The simplified version for your first session
- [[skills]] — Detailed reference for each command
- [[configuration]] — How to adjust pipeline behavior
- [[troubleshooting]] — When the pipeline stalls or produces unexpected results
