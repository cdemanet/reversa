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

> Behavioral equivalence validation strategy between the legacy and the new system, adapted to the paradigm chosen in `paradigm_decision.md`.

## Overall strategy
- **Applicable validation modes** (check the ones used):
  - [ ] Shadow mode (traffic mirroring with async comparison)
  - [ ] Characterization tests (suite derived from the legacy's current behavior)
  - [ ] Contract tests (external interfaces)
  - [ ] Data parity (snapshots and checksums)
  - [ ] Other: <specify>

## "Accepted parity" criteria
- **Primary metric**: <e.g.: functional divergence index < 0.01% in N consecutive days>
- **Observation window**: <evaluation period>
- **Blocking criterion**: <when insufficient parity blocks the cutover>

## Coverage adapted to the paradigm

> This section changes according to the target paradigm confirmed in `paradigm_decision.md`.

### No paradigm change
- Default functional equivalence: same input → same output → same observable side effect.

### Synchronous → event-driven change
- **Message order**: <acceptance criterion by channel / partition>
- **Idempotency**: <proof that reprocessing does not duplicate the effect>
- **Eventual consistency**: <maximum accepted propagation window>
- **Behavior on queue failure**: <retry, DLQ, replay>

### Procedural → OO change
- **Aggregate invariants**: <set to validate>
- **Validation in factories / constructors**: <critical cases>

### OO → functional change
- **Immutability**: <critical points to observe>
- **Absence of expected side effects**: <where the legacy had implicit side effects>
- **Equivalence under composition**: <composed functions equivalent to the legacy flow>

## Test types to apply
- **Functional**: <description, tool>
- **Contract**: <description, tool>
- **Load / performance**: <description, targets>
- **Resilience** (when applicable): <queue failure, external dependency unavailable>

## Reuse of characterization_specs from the discovery team
- **Origin**: `_reversa_sdd/characterization_specs/` or equivalent available.
- **Adaptations needed for the new system**: <text>

## Outputs
- `parity_tests/*.feature`: Gherkin scenarios for the critical flows.

## Notes
<Additional observations.>
