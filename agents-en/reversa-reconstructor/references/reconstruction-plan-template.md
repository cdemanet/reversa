# Reconstruction Plan — {{PROJECT_NAME}}

**Stack:** {{STACK}}
**Generated at:** {{DATE}}
**Status:** {{TOTAL}} tasks | {{DONE}} completed | {{PENDING}} pending

---

## Pre-flight alerts

> Review these points before starting. Gaps marked with ⚠️ block the associated task.

{{#each PREFLIGHT_ALERTS}}
- ⚠️ **{{this.gap}}** — blocks Task {{this.task_number}} ({{this.task_name}})
{{/each}}

{{#if NO_ALERTS}}
No critical gaps identified. Can start safely.
{{/if}}

---

## Tasks

### Task 01 — Database Schema
**Status:** pending
**Reads:** `_reversa_sdd/erd-complete.md`, `_reversa_sdd/data-dictionary.md`
**Builds:** migrations, schema, ORM models (per detected stack)
**Ready when:** All ERD tables exist with correct types, constraints, and foreign keys

---

### Task 02 — Domain Entities
**Status:** pending
**Reads:** `_reversa_sdd/domain.md`, `_reversa_sdd/data-dictionary.md`
**Builds:** entities, value objects, domain validations
**Ready when:** All entities implemented with the described business rules

---

### Task 03 — State Machines
**Status:** pending
**Reads:** `_reversa_sdd/state-machines.md`
**Builds:** implementation of each entity's state flows
**Ready when:** All documented states and transitions are implemented
**Note:** Skip this task if `_reversa_sdd/state-machines.md` does not exist

---

<!-- COMPONENT_TASKS_START -->
<!-- The Reconstructor inserts here one task per unit, in the bottom-up order determined by dependencies.md -->
<!-- Example unit task: -->

### Task 04 — [Unit Name]
**Status:** pending
**Reads:** `_reversa_sdd/[unit]/requirements.md`, `_reversa_sdd/[unit]/design.md`, `_reversa_sdd/[unit]/tasks.md`, `_reversa_sdd/dependencies.md`
**Builds:** [module path per stack]
**Ready when:** [acceptance criterion extracted from requirements.md, "Given/When/Then" field]
**Alert:** [if there is an associated gap, describe here]

<!-- COMPONENT_TASKS_END -->

---

### Task {{API_N}} — API Layer
**Status:** pending
**Reads:** `_reversa_sdd/openapi/[file list]`
**Builds:** endpoints, controllers, middlewares, authentication
**Ready when:** All endpoints respond per the OpenAPI contracts

---

### Task {{STORIES_N}} — User Flows
**Status:** pending
**Reads:** `_reversa_sdd/user-stories/[file list]`
**Builds:** end-to-end integration, complete user flows
**Ready when:** All user stories acceptance criteria are satisfied
