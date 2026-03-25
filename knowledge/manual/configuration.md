---
summary: How to adjust settings via config.yaml and /architect mode
type: manual
generated_from: "arscontexta-1.0"
---
# Configuration

This page explains how to customize the Service Offering knowledge system. Configuration controls how insights are processed, how connections are weighted, and how the vault evolves.

## config.yaml

The vault configuration lives in `knowledge/self/config.yaml`. This file defines the operational parameters for the knowledge system.

### Structure

```yaml
vault:
  name: "service-offering"
  version: "1.0"
  domain: "SaaS commerce — service offerings, subscriptions, resources, facets"

processing:
  extract:
    min_insight_length: 50          # Minimum characters for a valid insight
    max_insight_length: 2000        # Maximum characters before suggesting a split
    auto_tag: true                  # Automatically suggest tags during extraction
  connect:
    min_similarity: 0.3             # Minimum relevance threshold for suggested connections
    max_suggestions: 10             # Maximum connection suggestions per insight
    prefer_maps: true               # Suggest map creation when clusters form
  evolve:
    stale_threshold_sessions: 10    # Sessions before an insight is considered stale
    auto_evolve: false              # Whether /pipeline automatically evolves stale insights
  validate:
    require_summary: true           # Every insight must have a frontmatter summary
    require_connections: true       # Flag insights with zero inbound links
    max_orphan_age_sessions: 3      # Sessions an orphan can exist before flagging

dimensions:
  # Position values range from 0.0 to 1.0
  # These tune how the system prioritizes different aspects
  depth_vs_breadth: 0.6            # 0.0 = broad coverage, 1.0 = deep analysis
  theory_vs_practice: 0.7          # 0.0 = conceptual, 1.0 = implementation-focused
  stability_vs_exploration: 0.5    # 0.0 = consolidate existing, 1.0 = seek new areas
  detail_vs_abstraction: 0.5       # 0.0 = high-level patterns, 1.0 = concrete specifics

maintenance:
  orphan_threshold: 3              # Max orphans before maintenance is triggered
  inbox_overflow: 10               # Max inbox items before processing is urged
  map_max_links: 20                # Max direct links in a map before splitting
  reassess_interval_sessions: 10   # Sessions between /reassess prompts
```

### Modifying config.yaml

Edit the file directly or use `/arscontexta:architect` to make guided changes. After modifying, the new settings take effect on the next command invocation.

## /architect Mode

The `/architect` command (or `/arscontexta:architect`) enters a guided configuration mode. This is the recommended way to make structural decisions about the vault.

### What /architect Can Do

1. **Adjust dimensions** — Shift the vault's processing priorities. For example, if you find that extracted insights are too abstract and you want more implementation-specific knowledge about how the editors dispatch actions, increase `theory_vs_practice` toward 1.0.

2. **Change processing thresholds** — Tune how aggressively the system suggests connections, how quickly insights are marked stale, or how large an insight can grow before splitting is recommended.

3. **Define domain scopes** — Tell the system which areas of the Service Offering product to prioritize. You might focus on the pricing subsystem during a sprint, or broaden to cover all five document models during a documentation phase.

4. **Update maintenance rules** — Change when maintenance is triggered. If you work in short, frequent sessions, lower the `stale_threshold_sessions`. If you work in long, infrequent sessions, raise it.

### Example /architect Session

```
> /architect

Entering architect mode. Current vault: service-offering

Current dimensions:
  depth_vs_breadth:        0.6 (slightly favoring depth)
  theory_vs_practice:      0.7 (favoring practical/implementation)
  stability_vs_exploration: 0.5 (balanced)
  detail_vs_abstraction:   0.5 (balanced)

What would you like to adjust?

> Shift toward more exploration — we're starting work on a new Facet
  editor and need to build knowledge in that area.

Proposed changes:
  stability_vs_exploration: 0.5 -> 0.7
  This will cause /next to prioritize extracting new material over
  consolidating existing insights.

Accept? (y/n)
```

## Dimension Positions and Their Meaning

Each dimension is a spectrum from 0.0 to 1.0. The position affects how commands behave.

### depth_vs_breadth (default: 0.6)

| Position | Effect |
|---|---|
| 0.0-0.3 | `/extract` produces more insights per source, each covering less. `/connect` suggests broader, weaker links. `/next` prioritizes uncharted areas. |
| 0.4-0.6 | Balanced — standard behavior. |
| 0.7-1.0 | `/extract` produces fewer, more detailed insights. `/connect` favors strong, specific links. `/next` prioritizes deepening existing clusters. |

For the Service Offering vault, a value of 0.6 means we slightly prefer deep understanding of each document model over broad but shallow coverage.

### theory_vs_practice (default: 0.7)

| Position | Effect |
|---|---|
| 0.0-0.3 | Insights favor conceptual patterns, architectural principles, and design rationale. |
| 0.4-0.6 | Balanced. |
| 0.7-1.0 | Insights favor implementation details, code patterns, reducer behavior, and editor component structure. |

At 0.7, the vault is tuned toward practical implementation knowledge — how the reducers handle InputMaybe types, how editors dispatch actions, how the subgraph resolves queries.

### stability_vs_exploration (default: 0.5)

| Position | Effect |
|---|---|
| 0.0-0.3 | `/next` prioritizes `/evolve` and `/validate` over `/extract`. The vault consolidates and strengthens existing knowledge. |
| 0.4-0.6 | Balanced. |
| 0.7-1.0 | `/next` prioritizes `/extract` and `/learn`. The vault expands into new areas. |

Shift this toward exploration when starting a new feature (e.g., building a Facet editor) and toward stability when preparing for a release.

### detail_vs_abstraction (default: 0.5)

| Position | Effect |
|---|---|
| 0.0-0.3 | Insights capture high-level patterns: "Editors follow a dispatch pattern using auto-generated hooks." Maps are favored over individual insights. |
| 0.4-0.6 | Balanced. |
| 0.7-1.0 | Insights capture specific details: "The subscription-instance-editor uses 10+ components for billing, metrics, and service management." Individual insights are favored over maps. |

## Environment-Specific Configuration

The config.yaml can be extended with environment-specific sections:

```yaml
environments:
  solo:
    # When working alone
    reassess_interval_sessions: 5
    auto_evolve: true
  team:
    # When collaborating
    reassess_interval_sessions: 10
    require_summary: true
    require_connections: true
```

## See Also

- [[meta-skills]] — /architect in depth, plus /reassess which may recommend configuration changes
- [[workflows]] — How configuration affects the processing pipeline
- [[skills]] — Complete command reference
- [[troubleshooting]] — Configuration-related issues
