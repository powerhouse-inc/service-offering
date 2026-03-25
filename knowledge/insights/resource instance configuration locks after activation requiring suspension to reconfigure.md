---
summary: Configuration operations throw ConfigurationLockedError when status is ACTIVE forcing suspension before any facet changes
type: pattern
created: 2026-03-25
status: active
affects_models: [ResourceInstance]
topics: [[resource map]], [[architecture map]]
---

# resource instance configuration locks after activation requiring suspension to reconfigure

The ResourceInstance model enforces configuration immutability after activation:

- **DRAFT, PROVISIONING, SUSPENDED** — facet configuration is mutable (SET_INSTANCE_FACET, REMOVE_INSTANCE_FACET, UPDATE_INSTANCE_FACET, APPLY_CONFIGURATION_CHANGES)
- **ACTIVE** — configuration operations throw `ConfigurationLockedError`
- **TERMINATED** — no operations possible

This pattern at `src/reducers/configuration-management.ts` (lines 11-73) prevents mid-lifecycle configuration drift. To reconfigure an active instance, an operator must:
1. Suspend the instance (for maintenance)
2. Apply configuration changes
3. Resume the instance

This is a deliberate safety mechanism for infrastructure-provisioned resources where configuration changes have real-world consequences.

---

Relevant Insights:
- [[resource instances model infrastructure provisioning with explicit lifecycle states]] — the lifecycle these locks protect
- [[suspension distinguishes non-payment from maintenance reasons]] — maintenance suspension enables reconfiguration

Topics:
- [[resource map]]
- [[architecture map]]
