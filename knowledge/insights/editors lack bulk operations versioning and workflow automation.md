---
summary: All four editors are single-item CRUD with no batch import, version history, approval flows, or scheduled transitions
type: idea
created: 2026-03-25
status: open
affects_models: [ServiceOffering, SubscriptionInstance, ResourceTemplate, ResourceInstance]
topics: [[ux-flow map]]
---

# editors lack bulk operations versioning and workflow automation

Across all four editors, several categories of functionality are consistently absent:

**Bulk operations** (high impact):
- Services must be added one-by-one (no CSV import)
- Metrics can't be edited in batch
- Facet configurations are manual per-instance
- No template cloning

**Versioning** (high impact):
- Service offerings can't be versioned or compared
- Templates have no version history
- No way to see what changed between edits

**Workflow automation** (high impact):
- No approval flows for pricing changes
- No scheduled status transitions (e.g., auto-deprecate on date)
- No conditional logic or rules engine

**Data enrichment** (medium impact):
- Limited cross-document queries
- No cost forecasting or usage analytics
- No dependency visualization (which subscriptions use this offering?)
- No audit logging of operator changes

These gaps define the natural evolution roadmap for the editor ecosystem.

---

Relevant Insights:
- [[service offering editor uses four tabs for progressive complexity]] — the most feature-rich editor still lacks these
- [[subscription editor has dual modes for operator and client views]] — operator mode lacks audit trail
- [[resource editors are lighter weight reflecting simpler business processes]] — even simpler editors need bulk ops

Topics:
- [[ux-flow map]]
