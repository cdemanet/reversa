---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: parity_specs
producedBy: inspector
hash: "sha256:<hash of the body below the front-matter>"
---

# Parity Specs

> Validation strategy for behavioral equivalence between the legacy and the new system, adapted to the paradigm chosen in `paradigm_decision.md`.

## General strategy
- **Applicable validation modes** (mark the ones used):
  - [ ] Shadow mode (traffic mirroring with async comparison)
  - [ ] Characterization tests (suite derived from the legacy's current behavior)
  - [ ] Contract tests (external interfaces)
  - [ ] Data parity (snapshots and checksums)
  - [ ] Other: <specify>

## "Accepted parity" criteria
- **Primary metric**: <e.g. functional divergence index < 0.01% over N consecutive days>
- **Observation window**: <evaluation period>
- **Blocker criterion**: <when insufficient parity blocks the cutover>

## Coverage adapted to the paradigm

> This section changes according to the target paradigm confirmed in `paradigm_decision.md`.

### No paradigm change
- Standard functional equivalence: same input → same output → same observable side effect.

### Sync → event-driven change
- **Message order**: <acceptance criterion per channel / partition>
- **Idempotency**: <proof that reprocessing does not duplicate effect>
- **Eventual consistency**: <maximum acceptable propagation window>
- **Behavior under queue failure**: <retry, DLQ, replay>

### Procedural → OO change
- **Invariants in aggregates**: <set to validate>
- **Validation in factories / constructors**: <critical cases>

### OO → functional change
- **Immutability**: <critical points to observe>
- **Absence of expected side effects**: <where the legacy had implicit side effect>
- **Equivalence under composition**: <composed functions equal the legacy flow>

## Test types to apply
- **Functional**: <description, tool>
- **Contract**: <description, tool>
- **Load / performance**: <description, targets>
- **Resilience** (if applicable): <queue failure, external dependency unavailable>

## Reuse of characterization_specs from the discovery team
- **Origin**: `_reversa_sdd/characterization_specs/` or available equivalent.
- **Adaptations needed for the new system**: <text>

## Outputs
- `parity_tests/*.feature`: scenarios in Gherkin for the critical flows.

## Notes
<Additional observations.>
