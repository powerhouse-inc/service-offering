---
summary: Reducers must never call crypto.randomUUID() Date.now() or Math.random() — all dynamic values come from action input
type: pattern
created: 2026-03-25
status: active
affects_models: [ServiceOffering, SubscriptionInstance, ResourceTemplate, ResourceInstance, Facet]
topics: [[architecture map]]
---

# all dynamic values must come from operation input not generated in reducers

A critical Powerhouse convention: reducers must be deterministic. Given the same state and operation, they must always produce the same result. This means:

**Forbidden in reducers:**
- `crypto.randomUUID()` — IDs must come from operation input
- `Date.now()` / `new Date()` — timestamps must come from operation input
- `Math.random()` — no random values
- External API calls, async operations, side effects

**Required pattern:**
```typescript
// Correct: value from input
id: action.input.id,
createdAt: action.input.createdAt,

// Wrong: generated in reducer
id: crypto.randomUUID(),
timestamp: new Date(),
```

This constraint ensures document operations are replayable and that the document model system maintains consistency across synchronization.

---

Relevant Insights:
- [[reducers use mutative for direct state mutation with pure synchronous semantics]] — the broader reducer pattern

Topics:
- [[architecture map]]
