---
description: How this knowledge system was derived — enables architect and reseed commands
created: 2026-03-25
engine_version: "1.0.0"
---

# System Derivation

## Configuration Dimensions
| Dimension | Position | Conversation Signal | Confidence |
|-----------|----------|--------------------|--------------------|
| Granularity | moderate | "insights overview about the project" — coherent observations, not atomic claims | High |
| Organization | flat | Default — no signal against flat | Inferred |
| Linking | explicit+implicit | Connections across document models, business domains, architecture patterns | High |
| Processing | heavy | "improved and evolved over time" — continuous improvement cycle | High |
| Navigation | 3-tier | Multiple dimensions: document models, business domains, architecture | High |
| Maintenance | condition-based | "follow the evolution of the repo" — code changes trigger insight review | High |
| Schema | dense | Six insight categories spanning business, architecture, UX, pricing, integration | High |
| Automation | full | Claude Code platform, full capability | High |

## Personality Dimensions
| Dimension | Position | Signal |
|-----------|----------|--------|
| Warmth | neutral-helpful | default |
| Opinionatedness | neutral | default |
| Formality | professional | technical context |
| Emotional Awareness | task-focused | default |

## Vocabulary Mapping
| Universal Term | Domain Term | Category |
|---------------|-------------|----------|
| notes | insights | folder |
| inbox | inbox | folder |
| archive | archive | folder |
| note (type) | insight | note type |
| reduce | extract | process phase |
| reflect | connect | process phase |
| reweave | evolve | process phase |
| verify | validate | process phase |
| validate | validate | process phase |
| rethink | reassess | process phase |
| MOC | map | navigation |
| description | summary | schema field |
| topics | topics | schema field |
| topic map | map | navigation |
| hub | index | navigation |
| seed | seed | orchestration |
| pipeline | pipeline | orchestration |

## Platform
- Tier: Claude Code
- Automation level: full
- Vault location: knowledge/ (inside repo)

## Active Feature Blocks
- [x] wiki-links — always included (kernel)
- [x] maintenance — always included
- [x] self-evolution — always included
- [x] session-rhythm — always included
- [x] templates — always included
- [x] ethical-guardrails — always included
- [x] processing-pipeline — heavy processing enabled
- [x] mocs — 3-tier navigation
- [x] schema — dense schema
- [x] helper-functions — always included
- [x] graph-analysis — always included
- [ ] semantic-search — not enabled (can add later with qmd)
- [ ] personality — neutral-helpful default
- [ ] multi-domain — single project scope
- [x] self-space — agent identity enabled
- [x] atomic-notes — moderate granularity (not atomic but included for quality guidance)

## Coherence Validation Results
- Hard constraints checked: 3. Violations: none
- Soft constraints checked: 5. Auto-adjusted: none. User-confirmed: none
- Compensating mechanisms active: none needed

## Failure Mode Risks
1. **Temporal Staleness** (HIGH) — Code evolves fast; insights go stale. Condition-based maintenance flags unreviewed insights after repo changes.
2. **Collector's Fallacy** (MEDIUM) — Easy to accumulate observations without distilling. Pipeline enforces extraction quality.
3. **Schema Erosion** (MEDIUM) — Six insight types need consistent categorization. Schema validation catches drift.

## Generation Parameters
- Folder names: insights, inbox, archive, self, ops, templates, manual
- Skills to generate: 16 vocabulary-transformed skills
- Hooks to generate: session-orient, session-capture, validate-note, auto-commit
- Templates: insight-note, map, source-capture, observation
- Topology: single-agent
