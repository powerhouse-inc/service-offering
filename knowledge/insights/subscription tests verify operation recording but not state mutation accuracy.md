---
summary: Test suite checks that operations are recorded but doesn't assert actual state values after reducer execution
type: idea
created: 2026-03-25
status: open
affects_models: [SubscriptionInstance]
topics: [[subscription map]], [[architecture map]]
---

# subscription tests verify operation recording but not state mutation accuracy

The SubscriptionInstance test suite follows a consistent pattern that verifies operations were recorded but doesn't check state outcomes:

```typescript
// Current pattern — checks operation recording
expect(updatedDocument.operations.global[0].action.type).toBe("OPERATION_TYPE");
expect(updatedDocument.operations.global[0].action.input).toStrictEqual(input);

// Missing — no checks like:
expect(updatedDocument.state.global.status).toBe("ACTIVE");
expect(updatedDocument.state.global.services).toHaveLength(1);
```

This means:
- Invalid state transitions (e.g., activating a non-PENDING subscription) are untested
- Edge cases in partial updates (amount without currency) are unverified
- An unused test helper `createDocWithServiceGroup` in metrics.test.ts suggests planned tests that were never written

This is a significant gap — reducers could have bugs that pass all existing tests.

---

Relevant Insights:
- [[reducers use mutative for direct state mutation with pure synchronous semantics]] — mutations are the thing that should be tested
- [[all dynamic values must come from operation input not generated in reducers]] — determinism enables reproducible test cases

Topics:
- [[subscription map]]
- [[architecture map]]
