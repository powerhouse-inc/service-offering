---
summary: OptionGroups let service offerings include optional add-ons with independent pricing, extending beyond the base tier model
type: context
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[service-offering map]]
---

# option groups enable add-on pricing beyond base tiers

Beyond the base tier structure (Basic/Pro/Enterprise), ServiceOffering supports OptionGroups — collections of optional add-ons that customers can select independently of their tier choice.

Each option group:
- Has its own name and description
- Contains options with individual pricing (setup + recurring)
- Can be associated with specific services

This enables upselling patterns like "Add premium support for $X/month" or "Include analytics dashboard for $Y/month" regardless of the base tier.

The interaction between option group pricing and tier pricing (especially with discount modes) is one of the more complex business logic areas in the system.

---

Relevant Insights:
- [[pricing matrix shows service availability and cost across tiers]] — option groups appear in the matrix
- [[billing cycles support monthly quarterly annual and one-time with discount modes]] — discounts may apply to option groups

Topics:
- [[service-offering map]]
