---
_schema:
  entity_type: "source-capture"
  applies_to: "knowledge/inbox/*.md"
  required:
    - summary
  optional:
    - source_type
    - pr_reference
    - session_context
    - created
  enums:
    source_type:
      - coding-session
      - pr-review
      - brainstorm
      - documentation
      - external
      - bug-report
  constraints:
    summary:
      max_length: 200
      format: "Brief description of the source material"

# Template fields
summary: ""
source_type: ""
created: ""
---

# {source description}

{Raw content — observations, notes, code snippets, ideas captured during work}

## Key Points
{Quick bullet points of what's worth extracting}
