---
summary: Common issues and how to resolve them — orphans, dangling links, stale content, and more
type: manual
generated_from: "arscontexta-1.0"
---
# Troubleshooting

This page covers common issues you may encounter while working with the Service Offering knowledge system, along with their causes and resolutions.

## Orphan Insights

**Symptom**: `/stats` reports orphaned insights — insights with no inbound wiki links from other insights or maps.

**Why it matters**: Orphaned insights are invisible to navigation. They exist in the vault but cannot be reached by following connections. Over time, they become forgotten knowledge.

**Common causes**:
- Extracting insights without running `/connect` afterward
- Creating an insight about a new topic area (e.g., first insight about the Facet document model) with no existing insights to link from
- Deleting or refactoring an insight that was the sole inbound link

**Resolution**:

1. Run `/validate` to list all orphaned insights.
2. For each orphan, run `/connect <insight-name>` to find natural connections.
3. If no natural connections exist, the insight may belong in a map. Check if a relevant map exists (e.g., a "Resource Management" map for a Facet insight) and add the insight there.
4. If the insight truly has no connections, consider whether it belongs in this vault. It may be too tangential to the Service Offering domain.

**Prevention**: Always run `/connect` after `/extract`. The [[workflows]] page describes this as Stage 3 of the pipeline.

## Dangling Links

**Symptom**: `/validate` reports wiki links (`[[insight-name]]`) that point to nonexistent insights.

**Why it matters**: Dangling links break navigation. A reader following a link hits a dead end, which erodes trust in the vault's quality.

**Common causes**:
- Renaming an insight without updating all inbound links
- Referencing an insight you plan to create but have not created yet
- Typos in wiki link targets

**Resolution**:

1. Run `/validate` to get the full list of dangling links, including which insights contain them.
2. For each dangling link, decide:
   - **Create the missing insight**: If the link points to knowledge that should exist (e.g., `[[facet-option-hierarchy]]`), create it with `/extract` or `/learn`.
   - **Fix the link target**: If it is a typo or the insight was renamed, update the wiki link in the source insight.
   - **Remove the link**: If the referenced knowledge is out of scope, remove the wiki link and rephrase the text.

**Prevention**: After renaming or refactoring insights, run `/validate` to catch broken links immediately.

## Stale Content

**Symptom**: `/stats` reports stale insights, or `/evolve --stale` finds insights that have not been reviewed in many sessions.

**Why it matters**: The Service Offering codebase evolves — reducers are refactored, editors gain new components, the subgraph schema changes. Insights written before these changes may contain outdated information, leading to incorrect answers from `/ask`.

**Common causes**:
- Natural codebase evolution (e.g., SubscriptionInstance billing components were refactored)
- Insights extracted from an early understanding that was later refined
- Long gaps between vault sessions

**Examples in this domain**:
- An insight about ServiceOffering pricing that predates the discount calculation refactor
- An insight about editor component structure written before a component was split into sub-components
- An insight about subgraph query patterns that does not reflect a schema migration

**Resolution**:

1. Run `/evolve --stale` to process stale insights one at a time.
2. For each insight, the system compares it against current vault knowledge and proposes updates.
3. Review the proposed changes. Accept, modify, or reject them.
4. After evolution, run `/validate` on the updated insight to confirm it connects properly.

**Prevention**: Include `/evolve --stale` in your regular session workflow. The [[workflows]] page recommends this as part of maintenance. Adjust `stale_threshold_sessions` in [[configuration]] if insights go stale too quickly or too slowly.

## Methodology Drift

**Symptom**: Insights vary widely in quality, scope, or style. Some are detailed and well-connected; others are vague and isolated. `/reassess` reports methodology inconsistencies.

**Why it matters**: Inconsistent methodology makes the vault harder to navigate and undermines `/ask` answers. If some insights about reducer patterns capture InputMaybe handling while others do not, the vault gives unreliable guidance.

**Common causes**:
- Working without reviewing `/remember` lessons from previous sessions
- Multiple contributors with different extraction styles
- Shifting focus areas without adjusting dimensions via `/architect`
- Long gaps between `/reassess` runs

**Resolution**:

1. Run `/reassess` to get a full methodology report.
2. Identify the specific inconsistencies (scope, detail level, connection quality).
3. Use `/remember` to capture corrective lessons:
   ```
   /remember All reducer pattern insights must note: (1) whether Mutative
   direct mutation is used, (2) how InputMaybe types are handled, and
   (3) what errors are thrown and under what conditions.
   ```
4. Use `/architect` to adjust dimensions if the drift reflects a priority mismatch. See [[configuration]].
5. Use `/evolve` on the inconsistent insights to bring them up to the corrected standard.

**Prevention**: Run `/reassess` every 5-10 sessions. Review remembered lessons at the start of each session.

## Inbox Overflow

**Symptom**: `/stats` shows more than 10 items in the inbox. `/next` persistently recommends processing the inbox.

**Why it matters**: An overflowing inbox means knowledge is being captured but not processed. Unextracted material has no connections, cannot be found by `/ask`, and may become stale before it is ever processed.

**Common causes**:
- Rapid development producing more seedable material than extraction capacity
- Using `/seed` liberally without follow-up extraction sessions
- Large one-time imports (e.g., seeding all reducer files from a new document model)

**Resolution**:

1. Dedicate a full session to inbox processing:
   ```
   /ralph --limit 10
   ```
2. If the inbox is very large (20+ items), prioritize by relevance. Process items related to active development first.
3. Consider whether some items are not worth extracting. Remove low-value seeds from the inbox.
4. After clearing the backlog, run `/connect` to integrate the new insights.

**Prevention**: Maintain a rhythm of seeding and extracting in the same session when possible. Adjust `inbox_overflow` in [[configuration]] if 10 is too aggressive or too lenient for your workflow.

## Pipeline Stalls

**Symptom**: `/pipeline` starts but does not complete, or produces no output for a phase.

**Common causes**:
- **No inbox items for extraction**: The pipeline skips extraction if the inbox is empty. This is normal — not every pipeline run needs new material.
- **No insights to connect**: If all insights are already well-connected, the connect phase has nothing to do. Check with `/graph` to confirm.
- **Validation blocks on unresolvable issues**: If validation finds problems it cannot auto-fix (like contradictory insights), it reports them and waits for manual resolution.
- **Configuration mismatch**: If `auto_evolve: false` in config.yaml, the pipeline skips the evolution phase. Enable it for fully automated runs.

**Resolution**:

1. Run each phase manually to isolate where the stall occurs:
   ```
   /ralph              — Does extraction work?
   /connect            — Does connection work?
   /evolve --stale     — Does evolution work?
   /validate           — What does validation report?
   ```
2. Address the specific phase's issues using the guidance above.
3. If the issue is configuration-related, use `/architect` to adjust. See [[configuration]].

## Map Overload

**Symptom**: A map contains 20+ direct wiki links and is difficult to navigate. `/reassess` flags it.

**Why it matters**: Maps should provide clear navigational paths, not exhaustive lists. An overloaded map fails as a navigation tool.

**Common causes**:
- A broad topic area (e.g., "ServiceOffering") that accumulated many insights without being split into sub-maps
- Adding every related insight to a map instead of only the most important entry points

**Resolution**:

1. Use `/refactor --split <map-name>` to break the map into focused sub-maps:
   ```
   /refactor --split pricing-architecture
   ```
   This might produce:
   - "Tier Pricing" — insights about base amounts, tier structures, and most-popular flags
   - "Discount Calculations" — insights about percentage discounts, fixed discounts, and matrix flattening
   - "Billing Integration" — insights about how pricing flows to SubscriptionInstance billing

2. Create a lightweight parent map that links to the sub-maps, providing a high-level overview.

**Prevention**: When adding insights to a map, ask whether the insight belongs directly in the map or in a sub-map. Apply the guideline from [[workflows]]: maps should emerge from clusters, not be created preemptively.

## Low-Quality /ask Answers

**Symptom**: `/ask` returns vague, incomplete, or irrelevant answers.

**Common causes**:
- Sparse coverage in the asked-about area
- Poorly connected insights (information exists but `/ask` cannot find paths to it)
- Insights that are too abstract (dimension `detail_vs_abstraction` too low)

**Resolution**:

1. Check if the topic is covered: `/ask` will cite which insights it used. If citations are sparse, use `/learn` or `/seed` to build coverage.
2. Check connections: `/graph --clusters` may reveal that relevant insights exist in an isolated cluster. Use `/connect` to build bridges.
3. Check dimensions: If insights are too abstract, use `/architect` to shift `detail_vs_abstraction` upward and then `/evolve` key insights. See [[configuration]].

## See Also

- [[workflows]] — The processing pipeline that prevents most issues
- [[skills]] — Command reference for the tools mentioned here
- [[configuration]] — Settings that affect issue thresholds
- [[meta-skills]] — /reassess for systematic diagnosis
