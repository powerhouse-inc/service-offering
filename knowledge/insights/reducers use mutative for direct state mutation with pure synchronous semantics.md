---
summary: Powerhouse wraps reducers with Mutative enabling clean mutable-style code while maintaining immutable operation semantics
type: pattern
created: 2026-03-25
status: active
affects_models: [ServiceOffering, SubscriptionInstance, ResourceTemplate, ResourceInstance, Facet]
topics: [[architecture map]]
---

# reducers use mutative for direct state mutation with pure synchronous semantics

All document model reducers in the ecosystem follow the Powerhouse convention:
- Wrapped with Mutative (similar to Immer) for direct state mutation syntax
- Must be **pure synchronous functions** — no async, no side effects
- All dynamic values (IDs, dates) must come from operation input, never generated inside the reducer
- Errors use custom error classes auto-generated in `gen/{module}/error.js`

This pattern enables writing clean `state.property = value` code while maintaining the immutability guarantees needed for document model operations.

The reducers live in `src/reducers/{module}.ts` for each model and are the primary hand-written code. Everything in `gen/` is auto-generated.

---

Relevant Insights:
- [[all dynamic values must come from operation input not generated in reducers]] — non-deterministic operations are forbidden
- [[editors follow a module-plus-components pattern with auto-generated hooks]] — editors consume reducer operations through hooks

Topics:
- [[architecture map]]
