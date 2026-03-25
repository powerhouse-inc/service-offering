---
summary: Templates and instances reference facet options by OID without runtime validation that the referenced options still exist in the Facet document
type: pattern
created: 2026-03-25
status: active
affects_models: [Facet, ResourceTemplate, ResourceInstance]
topics: [[resource map]], [[architecture map]]
---

# facet references use OIDs creating a decoupled but unvalidated reference pattern

Facets are referenced across models via OID (Object ID) references:

- **ResourceTemplate** stores `facetTargets[].selectedOptions: [OID!]!` pointing to facet option IDs
- **ResourceTemplate services** store `facetBindings[].supportedOptions: [OID!]!` constraining valid options
- **ResourceInstance** stores `configuration[].selectedOption: String!` with the chosen option ID

This decoupling means:
- **Pro**: Facet model can be updated independently; templates don't need to be redeployed
- **Pro**: Instances store resolved selections (snapshot), creating an audit trail
- **Con**: No referential integrity validation — if a facet option is removed, templates/instances still reference the stale OID
- **Con**: No cascade updates — renaming a facet option label doesn't propagate to existing instances

The lack of cross-model validation is consistent with the [[reducers enforce no cross-cutting validation leaving business rules to the UI]] pattern — but facet references are particularly vulnerable because facets are shared master data.

---

Relevant Insights:
- [[facets serve as the shared categorization primitive across all models]] — the shared model
- [[reducers enforce no cross-cutting validation leaving business rules to the UI]] — why validation is missing

Topics:
- [[resource map]]
- [[architecture map]]
