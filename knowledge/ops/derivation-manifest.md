---
engine_version: "1.0.0"
research_snapshot: "2026-03-25"
generated_at: "2026-03-25T00:00:00Z"
platform: claude-code
kernel_version: "1.0"

dimensions:
  granularity: moderate
  organization: flat
  linking: explicit+implicit
  processing: heavy
  navigation: 3-tier
  maintenance: condition-based
  schema: dense
  automation: full

active_blocks:
  - wiki-links
  - maintenance
  - self-evolution
  - session-rhythm
  - templates
  - ethical-guardrails
  - processing-pipeline
  - mocs
  - schema
  - helper-functions
  - graph-analysis
  - self-space

coherence_result: passed

vocabulary:
  # Level 1: Folder names
  notes: "insights"
  inbox: "inbox"
  archive: "archive"
  ops: "ops"

  # Level 2: Note types
  note: "insight"
  note_plural: "insights"

  # Level 3: Schema field names
  description: "summary"
  topics: "topics"
  relevant_notes: "relevant insights"

  # Level 4: Navigation terms
  topic_map: "map"
  hub: "index"

  # Level 5: Process verbs
  reduce: "extract"
  reflect: "connect"
  reweave: "evolve"
  verify: "validate"
  validate: "validate"
  rethink: "reassess"

  # Level 6: Command names
  cmd_reduce: "/extract"
  cmd_reflect: "/connect"
  cmd_reweave: "/evolve"
  cmd_verify: "/validate"
  cmd_rethink: "/reassess"

  # Level 7: Extraction categories
  extraction_categories:
    - name: "business-gap"
      what_to_find: "Missing features or workflows the editors don't cover"
      output_type: "insight"
    - name: "architecture"
      what_to_find: "Structural patterns, refactoring opportunities in reducers and editors"
      output_type: "insight"
    - name: "domain-model"
      what_to_find: "How document models map to real business needs"
      output_type: "insight"
    - name: "ux-flow"
      what_to_find: "User experience observations from editor components"
      output_type: "insight"
    - name: "pricing"
      what_to_find: "Pricing logic, discount patterns, billing model evolution"
      output_type: "insight"
    - name: "integration"
      what_to_find: "Cross-model dependencies and synchronization points"
      output_type: "insight"

platform_hints:
  context: single
  semantic_search_tool: null

personality:
  warmth: neutral-helpful
  opinionatedness: neutral
  formality: professional
  emotional_awareness: task-focused
---
