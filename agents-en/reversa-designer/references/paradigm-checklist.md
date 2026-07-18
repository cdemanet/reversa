# Honoring the target paradigm checklist

Quick verification list that the Designer applies before closing `target_architecture.md` and `target_domain_model.md`.

## Event-driven

- [ ] Events are named in the past (`OrderCreated`, not `CreateOrder`).
- [ ] Each event has an explicit schema with versioning.
- [ ] Commands and events are distinct.
- [ ] Idempotency is guaranteed by construction (event ID, dedup key).
- [ ] Message order is handled by partitioning key.
- [ ] Saga / orchestrator for distributed transactions, with compensation.
- [ ] Outbox table for at-least-once guarantee between DB and queue.
- [ ] DLQ defined for terminal failures.

## OO with DI

- [ ] Explicit interfaces for external dependencies.
- [ ] Injection container configured per bounded context.
- [ ] Aggregates don't depend on infra (no persistence inside the aggregate).
- [ ] Concrete repositories live in the infra layer.
- [ ] Active Record explicitly prohibited.

## Functional

- [ ] Immutable types in the domain.
- [ ] Pure functions in the core; side effects at the edge.
- [ ] State is a sequence of transformations, not mutation.
- [ ] Composition used to build flows.
- [ ] Algebraic types (sum types) for disjoint states.

## Actor model

- [ ] Each actor has a mailbox and isolated state.
- [ ] Hierarchical supervision defined.
- [ ] Messages between actors are immutable.
- [ ] Persistence via event sourcing or snapshot.

## Procedural / dataflow

- [ ] Flow expressed as a transformation pipeline.
- [ ] No shared mutation.
- [ ] Independent and isolated testable stages.

## General (any paradigm)

- [ ] Each element points to a source in the legacy or to `discard_log.md`.
- [ ] Bounded contexts justified by cohesion, not by legacy structure.
- [ ] Mermaid diagram renders without error.
- [ ] Architectural decisions documented in summarized ADR format.
