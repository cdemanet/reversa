# Curator Decision Rubric

Quick reference table to apply the decision policy.

## Decision table

| Signal observed in the rule | Default decision | Notes |
|---|---|---|
| 🟢 CONFIRMED, compatible with target paradigm, no pain point | MIGRATE | no caveat |
| 🟡 INFERRED, compatible with target paradigm | MIGRATE | add note "validate in coding agent" |
| 🔴 GAP | HUMAN DECISION | optional recommendation |
| ⚠️ AMBIGUOUS | HUMAN DECISION | mandatory list interpretations |
| Rule quoted as a pain point | HUMAN DECISION | default recommendation: replace with X in new |
| Rule incompatible with brief (out of scope) | DISCARD | justification: "out of scope declared in migration_brief.md" |
| Rule incompatible with brief (technical) | DISCARD | justification: "technical restriction in brief prevents it" |
| Rule is a mechanism of the legacy paradigm, paradigm changed | DISCARD (paradigm-linked) | indicate substitute in target paradigm |
| Rule is a mechanism of the legacy paradigm, paradigm is the same | MIGRATE | no caveat |

## List of typical paradigm mechanisms (discardable when paradigm changes)

### Procedural → event-driven
- Pessimistic lock (`SELECT ... FOR UPDATE`)
- Full ACID transaction around the flow
- Synchronous response to the user with inline side effect
- Retry implemented as `for` in the controller

### Classical OO → OO with DI
- Active Record that mixes persistence and domain
- Inheritance used to reuse behavior (prefer composition)
- Manual singleton (prefer scoped DI)

### Classical OO → functional
- Mutable encapsulation (prefer immutable types)
- Void methods with side effect (prefer return + pure function)

### OO with DI → event-driven
- Synchronous commands with immediate return (prefer event + ack)
- Centralized orchestration (prefer choreography)
- 2PC / distributed transaction (prefer saga)

### Synchronous → asynchronous in general
- Timeout configured in controller (goes to retry policy of the consumer)
- Error handling as propagated exception (becomes DLQ)

## What to NEVER discard for paradigm

- Pure business rules (calculations, conditions, derivations).
- Regulatory rules.
- Domain invariants.
- Rights / permissions.

These rules change **location** in the new paradigm, but they don't disappear.
