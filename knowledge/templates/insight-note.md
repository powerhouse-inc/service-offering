---
_schema:
  entity_type: "insight-note"
  applies_to: "knowledge/insights/*.md"
  required:
    - summary
  optional:
    - type
    - status
    - created
    - modified
    - affects_models
    - pr_reference
  enums:
    type:
      - decision
      - idea
      - pattern
      - context
      - solution
    status:
      - preliminary
      - open
      - active
      - archived
  constraints:
    summary:
      max_length: 200
      format: "One sentence adding context beyond the title, no trailing period"
    affects_models:
      format: "Array of document model names this insight applies to"
    pr_reference:
      format: "PR number or URL where this insight originated"

# Template fields
summary: ""
type: ""
created: ""
topics: []
---

# {prose-as-title}

{Content — the reasoning, evidence, and explanation behind the title claim}

---

Relevant Insights:
- [[related insight]] — relationship context

Topics:
- [[relevant-map]]
