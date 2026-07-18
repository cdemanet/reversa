# [Unit Name]

> Template for the `requirements.md` file. Focuses on the WHAT the unit does, not the how.

## Overview
[What it is, what problem it solves, 2 to 3 lines]

## Responsibilities
- [Responsibility 1]
- [Responsibility 2]

## Business rules
- [Rule 1] 🟢
- [Rule 2] 🟡
- [Unknown behavior] 🔴

## Functional requirements

| ID | Requirement | Priority | Acceptance criterion |
|----|-----------|-----------|-------------------|
| RF-01 | [Description] | Must | [How to validate] |
| RF-02 | [Description] | Should | [How to validate] |

## Non-functional requirements

| Type | Inferred requirement | Evidence in code | Confidence |
|------|--------------------|---------------------|-----------|
| Performance | [e.g.: 30s timeout in external calls] | `path/file.ext:line` | 🟢 |
| Security | [e.g.: mandatory authentication on the route] | `path/file.ext:line` | 🟡 |
| Scalability | [e.g.: Redis cache use] | `path/file.ext:line` | 🟢 |
| Availability | [e.g.: automatic retry on failure] | `path/file.ext:line` | 🟡 |

> Inferred from the code. Validate with the operations team.

## Acceptance criteria

```gherkin
Given [precondition]
When [action]
Then [expected result]

Given [error condition]
When [invalid action]
Then [expected failure behavior]
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-----------|--------|-----------|
| [Main responsibility] | Must | Critical path, called in every flow |
| [Central business rule] | Must | Business rule without fallback |
| [Secondary functionality] | Should | Important but with alternative |
| [Edge case] | Could | Rarely triggered |

> Priority inferred by call frequency and position in the dependency chain.

## Code traceability

| File | Function / Class | Coverage |
|---------|-----------------|---------|
| `path/file.ext` | `ClassName` | 🟢 |
