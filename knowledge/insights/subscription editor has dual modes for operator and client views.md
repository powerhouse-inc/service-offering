---
summary: The same subscription document shows different views and capabilities depending on operator vs client access
type: pattern
created: 2026-03-25
status: active
affects_models: [SubscriptionInstance]
topics: [[subscription map]], [[ux-flow map]]
---

# subscription editor has dual modes for operator and client views

The subscription-instance-editor implements a dual-mode pattern:

**Client mode**: Read-heavy view showing subscription status, selected services, billing projection, and usage metrics. Limited editing capabilities.

**Operator mode**: Full editing capabilities including customer info management, service adjustments, billing settings, auto-renewal configuration, and operator notes (invisible to clients).

This is implemented through 10+ components including: Header, BillingPanel, ServicesPanel (with metrics), CustomerInfo sidebar, and OperatorNotes.

The dual-mode pattern is architecturally interesting because it's the same Powerhouse document with different UI projections — not separate documents for operator and client.

---

Relevant Insights:
- [[operator notes provide internal context that clients never see]] — operator-only data
- [[subscription lifecycle follows pending to active to cancelled with pause and expiry states]] — operators drive lifecycle transitions

Topics:
- [[subscription map]]
- [[ux-flow map]]
