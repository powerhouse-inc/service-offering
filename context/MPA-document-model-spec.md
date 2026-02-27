# MPA Document Model — Specification

**Status**: Ready for implementation
**Date**: 2026-02-27
**Source**: `MPA-requirements-report.md` + requirements sessions
**Jurisdiction**: Swiss law, Zug courts

---

## Overview

Two document models are required:

| Model | Type | Purpose |
|---|---|---|
| `MultisigParticipationAgreement` | `powerhouse/document-model` | Template + live instance of a single MPA between the Association and one Active Signer |
| `SignatureRequest` | `powerhouse/document-model` | Companion model for individual transaction approval requests (separate spec — out of scope here) |

This spec covers **`MultisigParticipationAgreement`** only.

---

## 1. Model Metadata

| Field | Value |
|---|---|
| Name | `MultisigParticipationAgreement` |
| ID | `powerhouse/multisig-participation-agreement` |
| Extension | `.mpa` |
| Description | Legal agreement between the Association and an Active Signer governing participation in a multisignature wallet scheme |
| Author | Powerhouse |

---

## 2. State Schema (Global)

Type name: `MultisigParticipationAgreementState`

```graphql
type MultisigParticipationAgreementState {
  # --- Core metadata ---
  templateVersion: String
  status: MPAStatus

  # --- Parties ---
  associationName: String
  activeSigner: ActiveSigner

  # --- Wallet (Exhibit 1) ---
  wallet: WalletDescription

  # --- Process (Exhibit 2) ---
  communicationChannel: String
  unavailabilityThresholdHours: Int
  policyLinks: [PolicyLink!]!

  # --- Signatures ---
  associationSigners: [AssociationSigner!]!
  activeSignerSignature: SignatureRecord

  # --- Compliance record ---
  complianceEvents: [ComplianceEvent!]!

  # --- Lifecycle timestamps ---
  effectiveDate: DateTime
  terminationDate: DateTime
  terminationReason: String
}

enum MPAStatus {
  DRAFT
  PENDING_SIGNATURE
  ACTIVE
  TERMINATED
}

type ActiveSigner {
  type: SignerType!
  name: String
  isAnonymous: Boolean
  # Natural person fields
  citizenship: String
  residenceCountry: String
  # Legal entity fields
  incorporationCity: String
  incorporationCountry: String
}

enum SignerType {
  NATURAL_PERSON
  LEGAL_ENTITY
}

type WalletDescription {
  numberOfKeys: Int
  decisionQuorum: Int
  signaturePlatform: String
  walletAddresses: [String!]!
}

type PolicyLink {
  id: OID!
  label: String
  url: URL
  snapshotDate: DateTime
}

type AssociationSigner {
  id: OID!
  name: String
  function: String
  place: String
  date: DateTime
  signature: SignatureRecord
}

type SignatureRecord {
  place: String
  date: DateTime
  eSignaturePlatform: String
  eSignatureReference: String
  eSignatureTimestamp: DateTime
}

type ComplianceEvent {
  id: OID!
  type: ComplianceEventType!
  occurredAt: DateTime!
  enteredAt: DateTime!
  enteredBy: String
  description: String
  # SLA tracking
  slaDeadlineHours: Int
  slaDeadlineAt: DateTime
  slaBreached: Boolean
  # Amendment chain
  supersededById: OID
  supersedes: OID
  amendmentReason: String
}

enum ComplianceEventType {
  SIGNATURE_REQUEST_RESPONSE
  COORDINATION_RESPONSE
  DISPUTE_RESOLUTION
  KEY_COMPROMISE_REPORTED
  KEY_COMPROMISE_REPLACEMENT_COMPLETED
  UNAVAILABILITY_NOTICE
  CONFLICT_OF_INTEREST_DISCLOSURE
  AML_KYC_REQUEST
  AML_KYC_RESPONSE
}
```

---

## 3. Modules & Operations

### Module 1: `agreement` — Agreement lifecycle and party setup

| Operation | Description | Key Input Fields |
|---|---|---|
| `INITIALIZE_MPA` | Create MPA from template; sets status to `DRAFT` | `templateVersion`, `associationName` |
| `SET_ACTIVE_SIGNER` | Set or update the Active Signer details | `type`, `name`, `isAnonymous`, `citizenship`, `residenceCountry`, `incorporationCity`, `incorporationCountry` |
| `SET_WALLET` | Set Exhibit 1 wallet parameters | `numberOfKeys`, `decisionQuorum`, `signaturePlatform`, `walletAddresses` |
| `SET_PROCESS_DETAILS` | Set Exhibit 2 process parameters | `communicationChannel`, `unavailabilityThresholdHours` |
| `ADD_POLICY_LINK` | Add an Exhibit 3 policy link (snapshotted at time of call) | `id`, `label`, `url` |
| `REMOVE_POLICY_LINK` | Remove a policy link | `id` |
| `ADD_ASSOCIATION_SIGNER` | Add an Association signatory slot | `id`, `name`, `function` |
| `REMOVE_ASSOCIATION_SIGNER` | Remove an Association signatory slot | `id` |
| `SUBMIT_FOR_SIGNATURE` | Transition `DRAFT → PENDING_SIGNATURE`; validates all required fields are present | — |
| `RECORD_ASSOCIATION_SIGNATURE` | Record an Association signer's e-signature | `signerId`, `place`, `date`, `eSignaturePlatform`, `eSignatureReference`, `eSignatureTimestamp` |
| `RECORD_ACTIVE_SIGNER_SIGNATURE` | Record the Active Signer's e-signature; auto-transitions to `ACTIVE` if all Association signers have also signed | `place`, `date`, `eSignaturePlatform`, `eSignatureReference`, `eSignatureTimestamp` |
| `TERMINATE_VOLUNTARY` | Transition `ACTIVE → TERMINATED`; voluntary by either party (§8) | `terminationDate`, `terminationReason` |
| `TERMINATE_BREACH` | Transition `ACTIVE → TERMINATED`; material breach auto-termination (§8) | `terminationDate`, `terminationReason` |
| `TERMINATE_KEY_COMPROMISE` | Transition `ACTIVE → TERMINATED`; key compromise auto-trigger (§4.4) | `terminationDate` |

---

### Module 2: `compliance` — Compliance event tracking

| Operation | Description | Key Input Fields |
|---|---|---|
| `ADD_COMPLIANCE_EVENT` | Append a new compliance event to the record | `id`, `type`, `occurredAt`, `enteredAt`, `enteredBy`, `description`, `slaDeadlineHours` |
| `AMEND_COMPLIANCE_EVENT` | Supersede an existing event with a corrected one; marks original as superseded (immutable audit trail preserved) | `newEventId`, `supersedes`, `amendmentReason`, `type`, `occurredAt`, `enteredAt`, `enteredBy`, `description`, `slaDeadlineHours` |
| `MARK_SLA_BREACHED` | Flag a compliance event as having breached its SLA | `eventId`, `breachedAt` |

---

## 4. Lifecycle Transition Rules (Reducer Guards)

| Transition | Guard Condition | Error if violated |
|---|---|---|
| `DRAFT → PENDING_SIGNATURE` (via `SUBMIT_FOR_SIGNATURE`) | `associationName` set; `activeSigner.name` set; `wallet.decisionQuorum` set; `wallet.numberOfKeys` set; `wallet.signaturePlatform` set; `communicationChannel` set; `unavailabilityThresholdHours` set; at least one `associationSigner` added | `MissingRequiredFieldError` |
| `PENDING_SIGNATURE → ACTIVE` (auto, via `RECORD_ACTIVE_SIGNER_SIGNATURE`) | All `associationSigners` have a `signature` recorded AND `activeSignerSignature` is now set | `IncompleteSignaturesError` |
| `ACTIVE → TERMINATED` | Status must be `ACTIVE` | `TerminateNotActiveError` |
| Any operation except read | Status must not be `TERMINATED` | `AgreementTerminatedError` |
| `AMEND_COMPLIANCE_EVENT` | `supersedes` ID must exist and must not already be superseded | `EventNotFoundError`, `EventAlreadySupersededError` |

---

## 5. SLA Reference Table (Hardcoded in Reducers)

When `ADD_COMPLIANCE_EVENT` is called, `slaDeadlineAt` is computed from `occurredAt + slaDeadlineHours`. The `slaDeadlineHours` value is passed in by the caller — the reducer just computes the deadline timestamp. SLA values per the agreement:

| `ComplianceEventType` | SLA Hours | Source |
|---|---|---|
| `SIGNATURE_REQUEST_RESPONSE` | 48 | Exhibit 2 §2.3 |
| `COORDINATION_RESPONSE` | 24 | Exhibit 2 §2.3 |
| `DISPUTE_RESOLUTION` | 72 | Exhibit 2 §2.3 |
| `KEY_COMPROMISE_REPLACEMENT_COMPLETED` | 168 (7 days) | §4.4 |
| All others | null (no SLA) | — |

---

## 6. Error Definitions

| Error Name | Code | Description | Operation |
|---|---|---|---|
| `MissingRequiredFieldError` | `MISSING_REQUIRED_FIELD` | A required field is not set before submitting for signature | `SUBMIT_FOR_SIGNATURE` |
| `TerminateNotActiveError` | `TERMINATE_NOT_ACTIVE` | Cannot terminate an MPA that is not ACTIVE | `TERMINATE_*` |
| `AgreementTerminatedError` | `AGREEMENT_TERMINATED` | Cannot modify a terminated MPA | all write ops |
| `IncompleteSignaturesError` | `INCOMPLETE_SIGNATURES` | Not all required signatures are present | `RECORD_ACTIVE_SIGNER_SIGNATURE` |
| `SignerNotFoundError` | `SIGNER_NOT_FOUND` | Referenced association signer ID does not exist | `RECORD_ASSOCIATION_SIGNATURE`, `REMOVE_ASSOCIATION_SIGNER` |
| `SignerAlreadySignedError` | `SIGNER_ALREADY_SIGNED` | Association signer has already submitted their signature | `RECORD_ASSOCIATION_SIGNATURE` |
| `EventNotFoundError` | `EVENT_NOT_FOUND` | Referenced compliance event ID does not exist | `AMEND_COMPLIANCE_EVENT`, `MARK_SLA_BREACHED` |
| `EventAlreadySupersededError` | `EVENT_ALREADY_SUPERSEDED` | Cannot amend an event that has already been superseded | `AMEND_COMPLIANCE_EVENT` |
| `InvalidStatusTransitionError` | `INVALID_STATUS_TRANSITION` | The requested status transition is not permitted from current status | `SUBMIT_FOR_SIGNATURE` |
| `DuplicateSignerIdError` | `DUPLICATE_SIGNER_ID` | An association signer with this ID already exists | `ADD_ASSOCIATION_SIGNER` |
| `DuplicatePolicyLinkIdError` | `DUPLICATE_POLICY_LINK_ID` | A policy link with this ID already exists | `ADD_POLICY_LINK` |
| `PolicyLinkNotFoundError` | `POLICY_LINK_NOT_FOUND` | Referenced policy link ID does not exist | `REMOVE_POLICY_LINK` |

---

## 7. Initial State

```json
{
  "templateVersion": null,
  "status": "DRAFT",
  "associationName": null,
  "activeSigner": null,
  "wallet": null,
  "communicationChannel": null,
  "unavailabilityThresholdHours": null,
  "policyLinks": [],
  "associationSigners": [],
  "activeSignerSignature": null,
  "complianceEvents": [],
  "effectiveDate": null,
  "terminationDate": null,
  "terminationReason": null
}
```

---

## 8. Out of Scope (This Model)

- `SignatureRequest` document model (companion model, separate spec)
- Quorum warning computation (dashboard-level concern, requires counting across multiple MPA documents)
- Multi-wallet grouping (future iteration)
- Push notifications
- Multi-association / multi-tenant

---

## 9. Notes for Implementer

- `RECORD_ACTIVE_SIGNER_SIGNATURE` must check whether all `associationSigners[].signature` slots are filled before auto-transitioning to `ACTIVE`. If any are missing, the status stays `PENDING_SIGNATURE` but the signature is still recorded.
- `AMEND_COMPLIANCE_EVENT` creates a **new** event record referencing the old one via `supersedes`. The original event gets its `supersededById` set. Neither record is deleted. The current view of a compliance event is always the one with `supersededById === null`.
- `snapshotDate` on `PolicyLink` is set by the reducer to `action.input.enteredAt` (passed in by caller) — not `new Date()`.
- All timestamps (`occurredAt`, `enteredAt`, `eSignatureTimestamp`, `terminationDate`, etc.) must come from action input — never generated in the reducer.
- The `slaDeadlineAt` field is computed in the reducer as `occurredAt + slaDeadlineHours` using date arithmetic on the input timestamp strings (parse → add hours → serialize back to ISO string). No `Date.now()`.
