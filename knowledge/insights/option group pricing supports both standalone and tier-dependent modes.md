---
summary: OptionGroups can use STANDALONE pricing shared across tiers or TIER_DEPENDENT pricing with per-tier rates and discount inheritance
type: context
created: 2026-03-25
status: active
affects_models: [ServiceOffering]
topics: [[service-offering map]]
---

# option group pricing supports both standalone and tier-dependent modes

Each OptionGroup in a ServiceOffering has two pricing strategies:

**STANDALONE** — single pricing structure regardless of which tier the customer selected. All tiers pay the same add-on price.

**TIER_DEPENDENT** — per-tier pricing entries. Enterprise tier might get a lower add-on price than Starter tier.

Additionally, discount inheritance modes control how billing cycle discounts apply:
- **INHERIT_TIER** — add-on inherits the tier's billing cycle discount (e.g., tier has 10% annual discount → add-on also gets 10%)
- **INDEPENDENT** — add-on has its own discount rules separate from the tier

This dual pricing + dual discount model enables sophisticated B2B pricing scenarios but creates complexity in the pricing engine and in the editor's pricing matrix view.

The option-groups reducer at `src/reducers/option-groups.ts` is the most complex module (~265 lines) with deep ternary-based structure mapping for nested cost and discount objects.

---

Relevant Insights:
- [[option groups enable add-on pricing beyond base tiers]] — the business concept
- [[pricing utility computes full price breakdown with discount hierarchy and cycle conversion]] — where this is calculated
- [[pricing matrix shows service availability and cost across tiers]] — where this is displayed

Topics:
- [[service-offering map]]
