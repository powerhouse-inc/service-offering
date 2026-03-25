---
summary: The subgraph mutation creates a team drive plus BuilderProfile ResourceInstance and SubscriptionInstance documents in one atomic operation
type: context
created: 2026-03-25
status: active
affects_models: [ResourceInstance, SubscriptionInstance, ServiceOffering]
topics: [[architecture map]], [[resource map]], [[subscription map]]
---

# createProductInstances mutation orchestrates team drive and triple document creation

The `createProductInstances` mutation in `subgraphs/resources-services/resolvers.ts` (lines 58-443) is the primary customer provisioning entry point:

**Input**: serviceOfferingId, name, teamName, customerEmail, userSelection (tierId, billingCycle, optionGroupIds)

**What it creates:**
1. A team drive (DocumentDriveDocument) with slug from `parsedTeamName`
2. A BuilderProfile document (customer identity)
3. A ResourceInstance document (provisioned resource)
4. A SubscriptionInstance document (billing and service tracking)

**Key steps:**
- Fetches ServiceOffering → extracts ResourceTemplate reference
- Maps offering data to subscription via `mapOfferingToSubscription()` (imported from editor utilities)
- Computes price breakdown using `getUserSelectionPriceBreakdown()`
- Validates input (name length, required fields, offering existence)
- Returns success/errors array

This is the most complex cross-model operation in the system — it bridges all five document models and creates the team-scoped drive for multi-tenant isolation.

---

Relevant Insights:
- [[subgraph exposes resourceTemplates and serviceOfferings as top-level queries]] — the subgraph that hosts this mutation
- [[pricing utility computes full price breakdown with discount hierarchy and cycle conversion]] — used during instance creation
- [[facets serve as the shared categorization primitive across all models]] — facet configuration flows through this path

Topics:
- [[architecture map]]
- [[resource map]]
- [[subscription map]]
