# Parity coverage matrix

Reference table to define the minimum set of `.feature` scenarios per flow, by paradigm transition.

## Coverage by transition

| Transition | Minimum scenarios per flow |
|---|---|
| no change | `@paridade` (input → expected output) |
| procedural → OO | `@paridade` + `@invariante` (aggregate invariant validated) |
| procedural → event-driven | `@paridade` + `@idempotencia` + `@ordem` + `@dlq` (behavior on queue failure) |
| classical OO → OO with DI | `@paridade` + `@composicao` (without Active Record dependency) |
| classical OO → event-driven | `@paridade` + `@idempotencia` + `@ordem` + `@saga` (compensation on failure) |
| classical OO → functional | `@paridade` + `@imutabilidade` + `@composicao` |
| OO with DI → event-driven | `@paridade` + `@idempotencia` + `@ordem` |
| functional → event-driven | `@paridade` + `@idempotencia` + `@ordem` |
| any → actor model | `@paridade` + `@supervisao` (recovery after failure) |

## Conventioned tags

- `@paridade`: always present; main equivalence.
- `@critico`: critical flow (regulatory, financial, sensitive data).
- `@regulatorio`: when there is a formal external requirement.
- `@idempotencia`: reprocessing does not duplicate the effect.
- `@ordem`: order by key respected.
- `@dlq`: behavior on reaching a dead letter queue.
- `@saga`: compensation in distributed transaction.
- `@invariante`: aggregate invariant validated.
- `@composicao`: equivalent behavior under functional composition.
- `@imutabilidade`: no shared mutation.
- `@supervisao`: supervisor recovers a failed actor.

## Typical "accepted parity" criteria

| System type | Primary metric |
|---|---|
| Web app without strong regulation | functional divergence < 1% for 7 days |
| Public API | functional divergence < 0.1% for 30 days + zero divergence in public contracts |
| Fiscal / regulatory system | functional divergence < 0.01% for 60 days + zero divergence in regulated fields |
| Financial system | financial divergence by monetary value < 0.001% + zero divergence in totals |
| Low-criticality internal system | functional divergence < 5% for 7 days |

## Reuse of characterization_specs

When `_reversa_sdd/characterization_specs/` exists:

1. For each spec → derive the corresponding `.feature`, adapting inputs/outputs to the new system.
2. Keep the original `spec-id` in traceability.
3. Add extra scenarios per the "Minimum scenarios per flow" table.

When it does not exist:

1. Infer critical flows from `code-analysis.md` + `sequences/` + `BR-MIGRAR` rules marked as critical.
2. Document the gap in `parity_specs.md § Reuse of characterization_specs`.
