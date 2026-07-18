# Reconstruction Plan — {{PROJECT_NAME}}

**Source:** migration
**Target paradigm:** {{PARADIGM}}
**Topology:** {{TOPOLOGY}}
**Stack:** {{STACK}}
**Strategy:** {{STRATEGY}}
**Generated at:** {{DATE}}
**Status:** {{TOTAL}} tasks | {{DONE}} completed | {{PENDING}} pending

---

## Pre-flight alerts

> Review before starting. REFERRED TO CODING items in `ambiguity_log.md` that affect specific tasks are marked.

{{#each PREFLIGHT_ALERTS}}
- ⚠️ **{{this.item}}** — affects Task {{this.task_number}} ({{this.task_name}}). Origin: `_reversa_sdd/migration/ambiguity_log.md`
{{/each}}

{{#if NO_ALERTS}}
No blocking items. Can start.
{{/if}}

---

## Tasks

### Task 01 — New Project Setup
**Status:** pending
**Reads:** `_reversa_sdd/migration/topology_decision.md`, `_reversa_sdd/migration/paradigm_decision.md`
**Builds:** initial folder/module structure, base configuration, minimum dependencies
**Ready when:** The new repository skeleton matches the approved topology and the chosen paradigm

---

### Task 02 — Target Database Schema
**Status:** pending
**Reads:** `_reversa_sdd/migration/target_data_model.md`
**Builds:** migrations, schema, ORM models (per stack)
**Ready when:** All target data model tables/collections exist with correct types, constraints, and relations

---

### Task 03 — Data Migration Plan
**Status:** pending
**Reads:** `_reversa_sdd/migration/data_migration_plan.md`, `_reversa_sdd/migration/target_data_model.md`
**Builds:** ETL scripts/jobs, integrity validations, rollback
**Ready when:** Migration scripts tested at representative volume, validations match the plan
**Note:** Skip if the strategy in `migration_strategy.md` does not involve data migration (e.g.: new system from scratch without legacy data)

---

### Task 04 — Target Domain Entities
**Status:** pending
**Reads:** `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Builds:** entities, value objects, aggregates, business rules
**Ready when:** Domain implemented per the target model, business rules covered by tests

---

<!-- MODULE_TASKS_START -->
<!-- The Reconstructor inserts here one task per module identified in target_architecture.md, in dependency order. -->
<!-- Example: -->

### Task 05 — [Module Name]
**Status:** pending
**Reads:** `_reversa_sdd/migration/target_architecture.md` (`[module]` section), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Builds:** [module path per approved topology]
**Ready when:** [parity criterion extracted from parity_specs.md, if applicable; otherwise, criterion in target_architecture.md]
**Alert:** [if there is an associated REFERRED TO CODING item]

<!-- MODULE_TASKS_END -->

---

### Task {{CUTOVER_N}} — Cutover
**Status:** pending
**Reads:** `_reversa_sdd/migration/cutover_plan.md`
**Builds:** cutover scripts/checklists, traffic switch, executable rollback plan
**Ready when:** The new system receives traffic per the plan and the legacy can be turned off/frozen per the decision

---

### Task {{PARITY_N}} — Parity Validation
**Status:** pending
**Reads:** `_reversa_sdd/migration/parity_specs.md`, `_reversa_sdd/migration/parity_tests/[file list of .feature]`
**Builds:** parity test suite running against legacy and new, divergence report
**Ready when:** All critical flows defined in parity_specs.md pass in both systems with equivalent results
