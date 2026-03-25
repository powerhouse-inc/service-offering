---
summary: Deep guide to /ask, /architect, /reassess, and /remember — the reflective commands
type: manual
generated_from: "arscontexta-1.0"
---
# Meta-Skills

Meta-skills are commands that operate on the vault itself rather than on domain knowledge. While [[skills]] like `/extract` and `/connect` build the knowledge graph, meta-skills shape how the graph grows, capture process learnings, and answer questions across the entire vault.

## /ask — Query the Knowledge Graph

`/ask` lets you pose questions to the vault and receive answers synthesized from existing insights.

### How It Works

When you run `/ask`, the system:
1. Parses your question to identify relevant concepts
2. Searches the knowledge graph for insights matching those concepts
3. Follows connections to find related insights
4. Synthesizes an answer from the matched insights
5. Cites which insights contributed to the answer

### Usage

```
/ask <your question>
```

### Examples

```
/ask How does pricing flow from ServiceOffering tiers to SubscriptionInstance billing?
```

This might draw from insights about tier pricing structure, discount calculations, and the subscription billing components to produce a connected answer.

```
/ask What patterns do the four editors share?
```

This traverses insights about each editor's structure — the `editor.tsx` entry point, `module.ts` registration, `components/` directory, and auto-generated hooks — to identify commonalities.

```
/ask What is the relationship between Facet and ResourceTemplate?
```

This follows connections between insights about facet option hierarchies and resource template audience targeting.

### When to Use /ask

- **Before extracting**: Check if the vault already covers a topic. `/ask` can reveal existing insights you forgot about, preventing duplicate extraction.
- **During design discussions**: Use the vault as a reference to answer architecture questions.
- **When exploring connections**: Sometimes a question reveals connections you had not explicitly created.

### Limitations

`/ask` can only answer from what the vault contains. If it returns a thin answer, that is a signal to use `/learn` or `/seed` to build coverage in that area.

## /architect — Shape the Vault's Structure

`/architect` enters a guided mode for making structural decisions. It is the primary tool for vault configuration and evolution.

### How It Works

Architect mode presents the current vault configuration, identifies areas of tension or opportunity, and walks you through changes. It modifies `knowledge/self/config.yaml` and may propose structural changes to the vault.

### Usage

```
/architect
```

Or for a specific focus:

```
/architect dimensions          — Tune processing dimensions
/architect maintenance         — Adjust maintenance triggers
/architect scope               — Redefine domain focus areas
```

### What You Can Change

| Area | Examples |
|---|---|
| **Dimensions** | Shift depth_vs_breadth, theory_vs_practice, stability_vs_exploration, detail_vs_abstraction |
| **Processing rules** | Adjust similarity thresholds, stale intervals, insight size limits |
| **Maintenance triggers** | Change orphan thresholds, inbox overflow limits, map size caps |
| **Domain scope** | Focus on specific document models, editors, or subsystems |

See [[configuration]] for the full details on each setting.

### When to Use /architect

- **At project milestones**: When starting a new phase of work (e.g., shifting from ServiceOffering development to SubscriptionInstance billing), adjust dimensions to match.
- **After /reassess**: When reassessment identifies systemic issues, architect mode is where you implement the structural fixes.
- **When the vault feels wrong**: If extraction consistently produces insights that feel too abstract, or connections feel forced, dimensions probably need tuning.

### Example Session

```
> /architect scope

Current domain scope: "SaaS commerce — service offerings, subscriptions,
resources, facets"

Active focus areas (ordered by priority):
  1. ServiceOffering pricing and tiers
  2. SubscriptionInstance lifecycle
  3. Editor component patterns
  4. Subgraph query resolution
  5. Resource management (templates, instances, facets)

Vault analysis:
  - 68% of insights cover areas 1-2
  - 12% cover area 3
  - 8% cover area 4
  - 12% cover area 5

Suggestion: Areas 3-5 are underrepresented relative to their
codebase complexity. Consider shifting stability_vs_exploration
toward exploration for the next few sessions.

What would you like to change?
```

## /reassess — Review Accumulated Friction

`/reassess` performs a systematic review of the vault's health, looking for patterns that indicate structural problems.

### How It Works

Reassessment examines:
1. **Insight distribution** — Are some areas over-documented while others are sparse?
2. **Connection patterns** — Are there isolated clusters that should be linked? Are some maps doing too much?
3. **Methodology friction** — Are certain extraction or connection patterns consistently producing low-quality results?
4. **Growth trajectory** — Is the vault growing in a healthy, sustainable way?

### Usage

```
/reassess
```

### What It Reports

A reassessment report includes:

- **Cluster analysis**: Groups of tightly connected insights and the gaps between them. For example, it might find that ServiceOffering and SubscriptionInstance insights form separate clusters with only one bridge insight between them.
- **Quality distribution**: Which areas have well-validated, well-connected insights versus which areas have shallow, poorly-linked coverage.
- **Methodology observations**: Patterns in how insights are being created. Are extractions too large? Too small? Are connections meaningful or superficial?
- **Recommended actions**: Concrete steps to address identified issues, often pointing to `/architect` for configuration changes or `/refactor` for structural changes.

### When to Use /reassess

- **Periodically**: Every 5-10 sessions, as suggested by the `reassess_interval_sessions` setting in [[configuration]].
- **When /next recommends it**: The system tracks session count and vault health metrics.
- **When something feels off**: If you notice the vault is not serving you well — answers from `/ask` are thin, connections feel forced, or extraction is tedious — reassessment can diagnose why.

### Acting on Reassessment

A reassessment report is advisory. Common follow-up actions:

| Finding | Action |
|---|---|
| Isolated clusters | `/connect` to build bridges, or create a map linking the clusters |
| Overloaded map | `/refactor --split` to break the map into focused sub-maps |
| Sparse domain area | `/learn` or `/seed` to build coverage, then shift dimensions via `/architect` |
| Methodology drift | `/remember` to capture the corrective lesson |
| Stale cluster | `/evolve --stale` on the affected insights |

## /remember — Capture Process Knowledge

`/remember` records a lesson about how to work with the vault. Unlike `/extract` (which captures domain knowledge), `/remember` captures methodology knowledge.

### How It Works

Remembered lessons are stored in `knowledge/self/` and influence future processing. They become part of the system's operating context, shaping how commands behave.

### Usage

```
/remember <lesson>
```

### Examples

```
/remember Insights about reducer patterns should always note whether
the reducer uses Mutative direct mutation or returns a new state,
because this distinction affects how we reason about state transitions
in the SubscriptionInstance lifecycle.
```

```
/remember When extracting from the subgraph resolvers, treat each
query resolver as a separate extraction unit. Combining resourceTemplates
and serviceOfferings into a single insight loses important distinctions
about their different query patterns.
```

```
/remember Map creation should wait until at least 5 insights exist
in a cluster. Creating maps too early leads to maps that are really
just lists, not meaningful navigational structures.
```

### When to Use /remember

- **After a difficult extraction**: When you had to try multiple approaches before getting a good insight, capture what worked.
- **After a reassessment**: When `/reassess` reveals a methodology issue, `/remember` ensures the lesson persists.
- **When you notice a pattern**: If you find yourself repeatedly making the same correction during validation, remember the underlying lesson.

### What Makes a Good /remember

A good remembered lesson is:
- **Specific**: "Always separate pricing insights by tier" not "Be more careful with pricing"
- **Actionable**: Describes what to do, not just what went wrong
- **Scoped**: Applies to a recognizable situation, not everything

## How Meta-Skills Work Together

The meta-skills form a reflective loop:

```
/ask  — "What does the vault know about X?"
  |
  v
/reassess — "Is the vault's knowledge healthy?"
  |
  v
/architect — "How should the vault's behavior change?"
  |
  v
/remember — "What did we learn about our process?"
  |
  v
(back to /ask with an improved vault)
```

This loop runs at a slower cadence than the main processing pipeline (see [[workflows]]). While extract-connect-evolve-validate runs every session, the meta-skill loop runs every few sessions — often triggered by `/reassess` or by friction noticed during regular work.

## See Also

- [[skills]] — Complete command reference including meta-skills
- [[configuration]] — Details on what /architect can change
- [[workflows]] — How meta-skills fit into the session rhythm
- [[troubleshooting]] — When meta-skills reveal problems
