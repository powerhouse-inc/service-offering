---
summary: ResourceInstance tracks provisioning from draft through active to terminated with suspension reasons
type: context
created: 2026-03-25
status: active
affects_models: [ResourceInstance]
topics: [[resource map]]
---

# resource instances model infrastructure provisioning with explicit lifecycle states

The ResourceInstance lifecycle:

```
DRAFT → PROVISIONING → ACTIVE → SUSPENDED → ACTIVE (resume)
                               → TERMINATED
```

Key features:
- **Provisioning events** track started/completed/failed timestamps
- **Suspension** distinguishes between non-payment and maintenance reasons
- **Configuration** stores facet selections applied at provisioning time

This models real infrastructure provisioning where resources have meaningful lifecycle states beyond just "active" or "not active."

---

Relevant Insights:
- [[suspension distinguishes non-payment from maintenance reasons]] — affects customer communication
- [[facets serve as the shared categorization primitive across all models]] — facets configure instances

Topics:
- [[resource map]]
