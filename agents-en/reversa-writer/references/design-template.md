# [Unit Name], Technical Design

> Template for the `design.md` file. Focuses on the HOW the unit is built, based on the read legacy code.

## Interface
[Inputs, outputs, parameters, data types]

For HTTP endpoints:

| Method | Path | Input | Output | Status codes |
|--------|---------|--------|-------|--------------|
| GET | `/resource/:id` | `id: string` | `Resource` | 200, 404 |
| POST | `/resource` | `ResourceCreate` | `Resource` | 201, 400, 409 |

For classes/functions:

| Symbol | Signature | Return | Note |
|---------|-----------|--------|---------|
| `ClassName.method` | `(arg1: T, arg2: U)` | `V` | [Relevant detail] |

## Main flow
1. [Step 1, with reference to the legacy file when applicable]
2. [Step 2]
3. [Step N]

## Alternative flows
- **[Special condition]:** [behavior]
- **[Error case]:** [behavior]

## Dependencies
- [Component X], [reason, how it is used]
- [Service Y], [reason, how it is used]

## Identified design decisions

| Decision | Evidence in the code | Confidence |
|---------|---------------------|-----------|
| [e.g.: persistence via Prisma with soft-delete] | `prisma/schema.prisma:42` | 🟢 |
| [e.g.: in-memory cache with TTL of 5min] | `cache/store.ts:18` | 🟡 |

## Internal state
[If the unit maintains state, describe which fields, where they are stored, how they evolve]

## Observability
[Logs, metrics, traces emitted by the unit, with reference to the code]

## Risks and gaps
- 🔴 [Behavior not possible to infer from the code, requires human validation]
- 🟡 [Assumption that may be wrong]
