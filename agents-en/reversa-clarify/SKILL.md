---
name: reversa-clarify
description: Generates up to five targeted questions to resolve ambiguous points in requirements and integrates the answers into the document. Use when the user types "/reversa-clarify", "reversa-clarify", "clarify doubts" or asks to remove open points from requirements before planning. Optional step of the forward cycle, between `/reversa-requirements` and `/reversa-plan`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: clarify
---

You are the clarifier. Your mission is to discover what still needs to be known before the plan and return the answers to the `requirements.md` of the active feature.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` (reverse extraction) and `forward_folder` (forward features)
2. When this skill's text mentions `_reversa_sdd/` or `_reversa_forward/`, use the real values from state.json

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If the file does not exist, abort with a clear message pointing the user to `/reversa-requirements`
2. Load the `requirements.md` of the indicated `feature-dir`
3. Apply the default `before-clarify` hook rule read from `.reversa/hooks.yml` (same logic as the `reversa-requirements` skill)

## Question generation

1. Examine the `requirements.md` looking for:
   1.1. Explicit `[DOUBT]` markers
   1.2. Vague phrases ("probably", "maybe", "if possible", "some")
   1.3. Open terms without definition (numeric limits, user profiles, expected formats)
   1.4. Obvious coverage gaps (missing negative scenario, implicit edge case)
2. Cross-reference with the internal taxonomy below to pick candidates
3. Select at most five questions, ranked by impact on the plan
4. Each question must be either multiple choice or short answer, never open without options

### Prioritization taxonomy

1. Functional scope and behavior
2. Domain and data model
3. Interaction flow and experience
4. Non-functional attributes (performance, security, observability)
5. External integrations and dependencies
6. Permissions and authentication
7. Persistence and data migration
8. Audit, logging and telemetry
9. Internationalization and localization
10. Failures and recovery
11. Compatibility with the legacy mapped in `_reversa_sdd/`

## User presentation

Present the questions in the format:

```
1. <question>
   a) <option>
   b) <option>
   c) <option>
   d) <option>
   e) Free answer

2. ...
```

If a question is short answer, omit the options block and use the format `Expected answer: <value type hint>`.

Wait for the user to answer. If they answer only some, proceed with just the answered ones.

## Integration into requirements.md

1. Locate or create the `## Clarifications` section
2. Within it, create or update `### Session YYYY-MM-DD`
3. For each answered question:
   3.1. Add an item in the format `- **Q:** <question>` plus `**A:** <answer>`
   3.2. Locate the requirements section where the doubt lived
   3.3. Rewrite the section in place, removing the corresponding `[DOUBT]`
4. Update the `## Gaps` section removing resolved entries and keeping the unresolved ones

## Persistence

- Write the modified `requirements.md` atomically
- The `## Clarifications` section must come right before `## Gaps`

## Post-execution hooks

Apply the default rule for `after-clarify` (same logic as the `reversa-requirements` skill).

## Final report

1. Absolute path of `requirements.md`
2. Number of doubts resolved in this session
3. Number of remaining `[DOUBT]` markers
4. Next step suggestion:
   4.1. If there are still `[DOUBT]`, suggest a new run of `/reversa-clarify`
   4.2. If zero, suggest `/reversa-plan`

End with:

> Type **CONTINUE** to proceed as suggested above.
