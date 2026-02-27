# MPA System — Requirements & Risk Assessment Report

**Document**: Multisignature Participation Agreement (MPA) System
**Source Template**: `[TEMPLATE] MPA v2.docx.md`
**Date**: 2026-02-27
**Status**: Requirements complete — ready for systems architect

---

## 1. System Scope

Three integrated surfaces:

| Surface | Users | Core Function |
|---|---|---|
| **MPA Template Editor** | Legal operator | Draft/version MPA templates; enforce required fields; flag template defects |
| **Legal Operator Dashboard** | Legal operator | Track all MPAs by lifecycle state; monitor compliance SLAs; signer count vs quorum alert |
| **Client Drive View** | Active Signer | View own MPA status and compliance record only |

---

## 2. Data Model

```
MPA
  ├── id: OID
  ├── template_version: string
  ├── status: "DRAFT" | "PENDING_SIGNATURE" | "ACTIVE" | "TERMINATED"
  ├── effective_date: DateTime?
  ├── termination_date: DateTime?
  ├── termination_reason: string?
  │
  ├── association
  │   └── name: string
  │
  ├── active_signer
  │   ├── type: "natural_person" | "legal_entity"
  │   ├── name: string
  │   ├── citizenship: string?           (natural person only)
  │   ├── residence_country: string?     (natural person only)
  │   ├── incorporation_city: string?    (legal entity only)
  │   ├── incorporation_country: string? (legal entity only)
  │   └── is_anonymous: boolean
  │
  ├── wallet (Exhibit 1)
  │   ├── number_of_keys: int
  │   ├── decision_quorum: int
  │   ├── signature_platform: string
  │   └── wallet_addresses: string[]
  │
  ├── process (Exhibit 2)
  │   ├── communication_channel: string
  │   └── policy_links: url[]           (Exhibit 3 — link only, snapshotted at signing)
  │
  ├── signatures
  │   ├── association_signers: [{name, function, place, date, esignature_ref}]
  │   └── active_signer_signature: {place, date, esignature_ref}
  │
  └── compliance_record
      ├── last_response_at: DateTime?
      ├── key_compromise_reported: boolean
      ├── conflict_of_interest_disclosures: [{date, description}]
      └── unavailability_notices: [{from, to, reason}]
```

---

## 3. Lifecycle State Machine

```
DRAFT ──────────────────► PENDING_SIGNATURE
  │                              │
  │ (abandon)                    │ (both parties sign via e-signature)
  ▼                              ▼
(deleted)                     ACTIVE
                                 │
              ┌──────────────────┤
              │                  │
              │ (key compromise  │ (voluntary termination,
              │  auto-trigger)   │  material breach, quorum failure)
              ▼                  ▼
         TERMINATED ◄──────────────
```

### Transition Gate Conditions

| Transition | Required Conditions |
|---|---|
| `DRAFT → PENDING_SIGNATURE` | All required fields filled; no `[…]` placeholder sections remain; unavailability threshold set; e-signature initiated |
| `PENDING_SIGNATURE → ACTIVE` | E-signature confirmed from both parties |
| `ACTIVE → TERMINATED` | Either party trigger OR auto-trigger on key compromise report |
| `TERMINATED → *` | Blocked — new MPA must be created |

---

## 4. Compliance Monitoring

### SLAs the System Tracks

| Event | SLA | Source | Entered By |
|---|---|---|---|
| Signature Request response | 48h | Exhibit 2 §2.3 | Legal operator or Active Signer |
| Coordination response | 24h | Exhibit 2 §2.3 | Legal operator or Active Signer |
| Dispute resolution | 72h | Exhibit 2 §2.3 | Legal operator or Active Signer |
| Key compromise replacement | 7 days | §4.4 | Legal operator or Active Signer |
| Quorum warning | Signer count = quorum + 1 | Exhibit 2 §4 | System auto-computed |

### Compliance Event Input
Both the legal operator and the Active Signer can enter compliance events, with different permission levels.

---

## 5. Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Signature tracking | E-signature required | RISK-007 score 15 (HIGH) — required for enforceability under Swiss law |
| Policy links | URL stored at signing, no content snapshot | Accepted; link snapshotted at execution date |
| Signer type | Both natural person and legal entity | Union type in schema |
| Template versioning | No pinned versions; alert when newer template available | Kept simple |
| Notifications | None — passive dashboard only | Out of scope |
| Multi-association | Single association | Out of scope |
| Multi-signer wallet grouping | Not implemented | Future iteration |

---

## 6. Risk Register

| ID | Description | Severity | Likelihood | Score | Level | Owner | Action |
|---|---|---|---|---|---|---|---|
| RISK-001 | Undefined unavailability threshold (`[X days/hours]` blank) | 4 | 5 | **20** | 🔴 CRITICAL | Senior Counsel | Legal must decide value; system blocks `DRAFT→PENDING` until set |
| RISK-002 | Emergency procedure missing (Exhibit 2 §4 is `[…]`) | 5 | 3 | **15** | 🟠 HIGH | Legal Team | Complete template; system blocks `DRAFT→PENDING` until filled or explicitly waived |
| RISK-003 | Broad mutual liability waiver with termination as sole remedy | 4 | 2 | **8** | 🟡 MEDIUM | Senior Counsel | Document in risk register; counsel review for Swiss law carve-outs |
| RISK-004 | Auto-termination on quorum failure — single-key concentration risk | 5 | 2 | **10** | 🟠 HIGH | System + Legal | Dashboard warning when active signers = quorum + 1 |
| RISK-005 | Exhibit 3 policy link drift (external Google Doc, no versioning) | 3 | 4 | **12** | 🟠 HIGH | System | Snapshot URL at signing date |
| RISK-006 | Duplicate amendment clause in Exhibit 2 (verbatim copy, lines 397–404 and 420–427) | 2 | 3 | **6** | 🟡 MEDIUM | Legal Team | Remove duplicate from template |
| RISK-007 | Agreement enforceability without e-signature | 5 | 3 | **15** | 🟠 HIGH | System | E-signature integration required at `PENDING→ACTIVE` transition |

---

## 7. Open Items for Legal (Blocking)

Before the system can be fully configured, legal must resolve:

1. **RISK-001 (CRITICAL)** — Set the unavailability threshold value (currently `[X days/hours]` in §4.5)
2. **RISK-002 (HIGH)** — Complete the Emergency Procedure section (Exhibit 2 §4)
3. **RISK-006 (MEDIUM)** — Remove the duplicate amendment clause from Exhibit 2

---

## 8. Out of Scope

- Multi-association / multi-tenant
- Push notifications / alerts to users
- Policy document content snapshotting (URL link only)
- Multi-signer wallet grouping across MPAs (deferred to future iteration)
