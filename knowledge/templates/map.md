---
_schema:
  entity_type: "map"
  applies_to: "knowledge/insights/*.md"
  required:
    - summary
  optional:
    - type
  enums:
    type:
      - moc
  constraints:
    summary:
      max_length: 200
      format: "One sentence describing what this map covers"

# Template fields
summary: ""
type: moc
---

# {topic-name}

{Brief orientation — what this topic covers and how to use this map}

## Core Ideas
- [[insight]] — context explaining why this matters here

## Tensions
{Unresolved conflicts — where do ideas clash?}

## Open Questions
{What is unexplored — research directions, gaps, areas needing attention}
