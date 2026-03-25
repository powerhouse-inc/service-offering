---
summary: Same Powerhouse document renders differently for operators (full edit) vs clients (read-heavy) without separate data stores
type: pattern
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance]
topics: [[ux-flow map]]
---

# subscription editor separates operator and client views on the same document

The dual-mode pattern in the subscription-instance-editor is a noteworthy architectural choice:

**Single document, two projections:**
- The underlying SubscriptionInstance document contains all data (including operator notes)
- The editor renders different views based on the user's role
- Client mode hides operator-only fields and restricts editing
- Operator mode exposes everything with full edit capabilities

This avoids the complexity of maintaining separate operator and client documents that need to stay in sync. Instead, access control is at the UI layer.

This pattern could be extended to other editors — for example, a customer-facing view of ServiceOffering that shows pricing without editing capabilities.

---

Relevant Insights:
- [[subscription editor has dual modes for operator and client views]] — detailed context
- [[editors follow a module-plus-components pattern with auto-generated hooks]] — the component architecture supporting dual mode

Topics:
- [[ux-flow map]]
