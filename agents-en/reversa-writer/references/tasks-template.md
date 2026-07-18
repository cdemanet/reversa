# [Unit Name], Implementation Tasks

> Template for the `tasks.md` file. Focuses on an executable sequence of tasks to reimplement the unit from the legacy, with traceability to the original code.

## Prerequisites
- [ ] Unit dependencies listed in `design.md` are available
- [ ] Compatible database schema/migrations (if applicable)
- [ ] Necessary environment variables / configs documented

## Tasks

> Each task references the legacy file from which the behavior was extracted.

- [ ] T-01, [Task description]
  - Origin in the legacy: `path/file.ext:line`
  - Ready criterion: [how to validate]
  - Confidence: 🟢 / 🟡 / 🔴

- [ ] T-02, [Task description]
  - Origin in the legacy: `path/file.ext:line`
  - Ready criterion: [how to validate]
  - Confidence: 🟢 / 🟡 / 🔴

## Testing tasks

- [ ] TT-01, Test of the main flow happy path (see `requirements.md`, Acceptance Criteria)
- [ ] TT-02, Test of the main error case
- [ ] TT-03, [Other relevant scenarios]

## Data migration tasks (if applicable)

- [ ] TM-01, [Data migration X, with reference to the legacy schema]

## Suggested order
1. [Which tasks should be done first and why]
2. [Blockers between tasks]

## Pending gaps (🔴)
[List here the decisions that depend on human validation before implementation]
