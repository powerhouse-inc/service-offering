---
summary: A shared utility handles service lookup across both top-level services array and nested serviceGroups preventing code duplication
type: pattern
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance]
topics: [[subscription map]], [[architecture map]]
---

# findService utility searches both flat services and nested service groups

The SubscriptionInstance model supports two service collection patterns:
- **Flat**: top-level `state.services` array
- **Grouped**: `state.serviceGroups[].services` arrays (bundles)

The `findService()` utility in `src/reducers/utils.ts` searches both:

```typescript
export function findService(state, serviceId) {
  const standalone = state.services.find(s => s.id === serviceId);
  if (standalone) return standalone;
  for (const group of state.serviceGroups) {
    const grouped = group.services.find(s => s.id === serviceId);
    if (grouped) return grouped;
  }
  return undefined;
}
```

This is used by the metrics reducer to add/update/remove metrics on any service regardless of nesting level. It's a clean pattern that prevents duplication but has a subtlety: it returns the first match, so service IDs must be globally unique across flat and grouped services.

---

Relevant Insights:
- [[subscription metrics track usage per service with current values and limits]] — metrics use this utility

Topics:
- [[subscription map]]
- [[architecture map]]
