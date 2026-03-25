---
_schema:
  entity_type: "observation"
  applies_to: "ops/observations/*.md"
  required:
    - summary
    - category
  optional:
    - status
    - observed
  enums:
    category:
      - friction
      - surprise
      - process-gap
      - methodology
    status:
      - pending
      - processed
      - archived
  constraints:
    summary:
      max_length: 200
      format: "What happened and what it suggests"

# Template fields
summary: ""
category: ""
status: pending
observed: ""
---

# {the observation as a sentence}

{What happened, why it matters, and what might change}
