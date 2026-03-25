---
summary: Reducers are pure state transitions that skip referential integrity and business rule checks — validation responsibility is on the client
type: decision
created: 2026-03-25
status: active
affects_models: [ServiceOffering, SubscriptionInstance, ResourceTemplate, ResourceInstance, Facet]
topics: [[architecture map]]
---

# reducers enforce no cross-cutting validation leaving business rules to the UI

A deliberate architectural decision across all document models: reducers do NOT validate:
- Referential integrity (e.g., does the referenced serviceId actually exist?)
- Business rules (e.g., "at least one INCLUDED service per tier")
- Cross-field consistency (e.g., "billing cycle matches between tier and option group")

Reducers validate only:
- Entity existence within their own scope (find-by-id, throw if not found)
- Required state transitions (e.g., can only activate a PENDING subscription)

This means business rules are enforced at the editor/UI layer. The tradeoff:
- **Pro**: Reducers stay simple, deterministic, and focused on state transitions
- **Con**: Invalid states can be created through direct API/MCP access bypassing the UI
- **Con**: Business rules are scattered across editor components rather than centralized

---

Relevant Insights:
- [[reducers use mutative for direct state mutation with pure synchronous semantics]] — the reducer philosophy
- [[all dynamic values must come from operation input not generated in reducers]] — another purity constraint

Topics:
- [[architecture map]]
