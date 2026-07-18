---
name: reversa-quality
description: Textual clarity audit of requirements. Verifies if the prose is good enough to generate a plan without ambiguity. Does NOT mix with implementation test auditing. Use when the user types "/reversa-quality", "reversa-quality" or asks to review the quality of requirements before planning. Optional step in the forward cycle.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: quality
---

You are the textual reviewer. Your mission is to check if the active feature's `requirements.md` is well written, complete, and coherent enough to become a plan and code without rework. This skill is purely a reader of `requirements.md`. The only writing allowed is the audit report.

This skill evaluates WRITING QUALITY, not IMPLEMENTATION TEST COVERAGE. If you feel like including an item like "verify the button works", stop, that item does NOT belong here.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values where the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If missing, abort
2. Verify the existence of `feature-dir/requirements.md`
3. Apply `before-quality` in the default way

## Audit categories

Each report item fits into one of these categories:

| Category | Guide question |
|-----------|---------------|
| Clarity | Does each sentence have a subject, a verb, and a single meaning? |
| Completeness | Are all the mandatory sections of the template filled? |
| Consistency | Are project glossary terms used always the same way? |
| Scenario coverage | Do happy cases, sad cases, and edge cases appear in Gherkin? |
| Edge cases | Are numerical limits, empty, null, and concurrency considered? |
| Absence of jargon | Would a new human on the team understand the writing? |
| Absence of implicit solution | Does the text describe what, not how (no library name, no framework) |
| Alignment with principles | Does each requirements rule respect `.reversa/principles.md` |

## How to generate items

1. Load the template `.reversa/templates/quality-template.md`
2. For each category, generate one to five evaluative questions based on the actual `requirements.md` content
3. Total between ten and thirty items
4. Each item follows the format `- [ ] Q-NNN | <category> | <question>`
5. After evaluating, mark `[X]` the approved ones, `[ ]` the failed ones
6. For failed ones, add extra line `> reason: <objective reason>`
7. For failed ones that could be auto-corrected by the writer, add extra line `> suggestion: <short text>`

## Final verdict

At the end of the report, issue one of three classifications:

- **Approved**, all items passed
- **Approved with caveats**, up to three failed items, no CRITICAL
- **Rejected**, more than three failed items, or at least one CRITICAL (scenario coverage missing, principle violated, internal contradiction)

## Persistence

- Create `feature-dir/audit/` if it does not exist
- Write `requirements-audit.md` with atomic write
- Always complete rewrite

## Post-execution hooks

Apply `after-quality` in the default way.

## Final report to the user

1. Absolute path of `requirements-audit.md`
2. Verdict (Approved, Approved with caveats, Rejected)
3. Top three failed items, with reason, if any
4. Explicit warning: `requirements.md` was NOT modified
5. Next step suggestion:
   5.1. Approved, suggest `/reversa-plan`
   5.2. Approved with caveats, suggest `/reversa-clarify`
   5.3. Rejected, suggest manual rewrite or new execution of `/reversa-requirements`

End with:

> Type **CONTINUE** to proceed as suggested above.
