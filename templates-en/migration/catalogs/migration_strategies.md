---
schemaVersion: 1
kind: migration_strategies
description: Consultative catalog of migration strategies with applicability criteria. Used by the Strategist.
---

# Migration Strategies

> Catalog of canonical migration strategies with applicability, cost, risk, time, example, and references.
> Updating this catalog is a maintenance task independent of the Strategist agent.

## Strategies

### Strangler Fig
- **Description**: The new system grows around the legacy, capturing functionality incrementally until the legacy can be shut down.
- **When it applies**:
  - System in production that cannot be stopped.
  - Need for incrementality.
  - Possibility of routing between old and new (proxy / API gateway).
- **Cost**: medium.
- **Risk**: low (partial rollback is viable).
- **Time**: long (months to years in large systems).
- **Favored appetite**: conservative, balanced.
- **Example**: API gateway redirects `/v2/orders/*` endpoints to the new system while `/orders/*` remains on the legacy.
- **References**: Martin Fowler, "StranglerFigApplication"; Sam Newman, "Monolith to Microservices".

### Big Bang
- **Description**: Full replacement in a single cutover window.
- **When it applies**:
  - Small system.
  - Tolerated maintenance window.
  - High transformational appetite.
  - Few live external integrations.
- **Cost**: low (no maintenance of two versions).
- **Risk**: high (full rollback is expensive; failure brings the service down).
- **Time**: short.
- **Favored appetite**: transformational (in small systems).
- **Example**: internal tool used by 50 people migrated in one night with documented rollback.
- **References**: described in several migration frameworks; highly correlated with historical failures in large systems.

### Parallel Run
- **Description**: Legacy and new run in parallel receiving the same input; output is compared to detect divergence.
- **When it applies**:
  - Critical logic (financial, fiscal, regulatory).
  - Need for long-term equivalence proof.
  - Large paradigm change + transformational appetite (high operational risk).
- **Cost**: high (two stacks operating simultaneously; output comparison).
- **Risk**: medium (risks come from dual operation, not from the cut).
- **Time**: medium.
- **Favored appetite**: balanced.
- **Example**: tax calculation running on the legacy and the new for 60 days; cutover only after divergence < 0.01%.
- **References**: Michael Nygard, "Release It!"; common in banking and fiscal systems.

### Branch by Abstraction
- **Description**: Internal refactoring of the legacy to introduce an abstraction that allows swapping the implementation underneath, then replacing.
- **When it applies**:
  - Internal migration (language or framework changes, but the domain stays).
  - Conservative appetite.
  - Team already inside the legacy, with code ownership.
- **Cost**: low.
- **Risk**: low.
- **Time**: medium.
- **Favored appetite**: conservative.
- **Example**: extract the `OrderRepository` interface in the legacy, let old and new implementations be chosen by a flag, then remove the old one.
- **References**: Paul Hammant, "Branch By Abstraction".

## Quick comparison

| Strategy | When it applies | Cost | Risk | Time |
|---|---|---|---|---|
| Strangler Fig | system in production, cannot be stopped | medium | low | long |
| Big Bang | small system, controlled window, transformational appetite | low | high | short |
| Parallel Run | critical logic (financial / fiscal) | high | medium | medium |
| Branch by Abstraction | internal refactoring before migration | low | low | medium |

## Paradigm influence on the choice

- **Appetite `conservative`** → favors Branch by Abstraction and Strangler Fig.
- **Appetite `balanced`** → favors Strangler Fig and Parallel Run.
- **Appetite `transformational`** → allows Big Bang in small systems, Strangler Fig with deep edges in larger systems.
- **Large paradigm change + transformational appetite** → flag `high operational divergence risk` and recommend Parallel Run for validation.

## Utility function (used by the Strategist)

Pseudo-procedure the agent follows when consulting the catalog:

1. Receive `migration_brief` (scope, deadline, constraints) + `derived_appetite` + `paradigm gap`.
2. Filter strategies by applicability (drop those that clearly do not fit).
3. Score each remaining strategy by adherence to the appetite and the gap.
4. Select the 2 to 3 best candidates.
5. Mark one as `recommended` with an explicit justification.
6. For each remaining strategy, list the cons as reasons for not recommending.

## Catalog test scenarios

1. brief = banking system in production, conservative appetite → recommend Strangler Fig + Branch by Abstraction.
2. brief = internal tool with 50 users, transformational appetite → recommend Big Bang.
3. brief = fiscal system, balanced appetite, high paradigm change → recommend Parallel Run + Strangler Fig.
4. brief = Rails monolith to Go microservices, transformational appetite, large paradigm change → recommend Strangler Fig with deep edges, flag operational risk, suggest Parallel Run for critical domains.
5. brief = .NET WebForms to Blazor, balanced appetite, no large paradigm change → recommend Strangler Fig.
6. brief = legacy system with few integrations, tolerated maintenance window, balanced appetite → recommend Big Bang with a robust rollback plan, alternative Strangler Fig.
