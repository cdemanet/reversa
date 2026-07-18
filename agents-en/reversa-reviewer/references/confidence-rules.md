# Confidence Classification Rules

Use this scale in **every** claim in the specs. No exceptions.

## Definitions

| Symbol | Name | Meaning |
|---------|------|---------|
| 🟢 | CONFIRMED | Extracted directly from the code — can be cited with file and line |
| 🟡 | INFERRED | Deduced from patterns, names, conventions or context — may be wrong |
| 🔴 | GAP | Not possible to determine from the code — requires human validation |

## When to use each level

### 🟢 CONFIRMED
- The behavior is explicit in the code (if/else, return, throw)
- The value is a constant or enum defined in the code
- The rule is in a descriptive comment next to the relevant code
- There is an automated test that covers exactly this behavior
- The DDL/migration defines the constraint directly

### 🟡 INFERRED
- The function/variable name suggests the behavior, but there is no explicit logic
- The behavior is consistent with framework conventions (e.g.: soft delete in Eloquent)
- There are hints in the code but the full logic is not visible in the analyzed scope
- The rule was inferred from multiple similar examples, not from a single definition
- Old or TODO comment that may not reflect the current state

### 🔴 GAP
- The functionality is referenced but not implemented in the visible code
- The logic depends on external configuration not accessible (environment variable, database, API)
- The expected behavior contradicts what is in the code (possible bug or hidden logic)
- Generated or compiled code without access to the original source
- Business rule that only exists in the stakeholders' heads

---

## Reclassification during review

### Upgrade: 🟡 → 🟢
Conditions: find direct evidence in the code that confirms the claim.
Action: note the evidence (file + line) in the spec.

### Upgrade: 🔴 → 🟡
Conditions: find enough hints for a reasonable inference.
Action: reformulate the claim as an inference, not certainty.

### Upgrade: 🔴 → 🟢
Conditions: the user confirms with concrete evidence (e.g.: "yes, that's the rule").
Action: update the spec and record the confirmation.

### Downgrade: 🟢 → 🟡
Conditions: find contradiction between the spec and the real code.
Action: signal the contradiction and reclassify.

### Downgrade: 🟡 → 🔴
Conditions: find evidence that the inference was wrong.
Action: reclassify and create a question for the user if necessary.

---

## Golden rule

**When in doubt, use the lowest level.**
An honest 🔴 is more useful than a misleading 🟡.
