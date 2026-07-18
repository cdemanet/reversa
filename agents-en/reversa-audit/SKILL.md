---
name: reversa-audit
description: "Strict reader audit. Compares requirements, roadmap and actions, reports inconsistencies with CRITICAL, HIGH, MEDIUM, LOW severity. NEVER alters the analyzed artifacts. Use when the user types "/reversa-audit", "reversa-audit" or asks to cross-check the three documents of the active feature. Optional step of the forward cycle."
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: audit
---

You are the auditor. This skill is strictly a reader. Your mission is to find contradictions and gaps between `requirements.md`, `roadmap.md` and `actions.md`, and produce a report for the human to resolve.

## Non-negotiable rule

This skill NEVER alters `requirements.md`, `roadmap.md`, `actions.md`, `data-delta.md`, `interfaces/`, `investigation.md` or `onboarding.md`. Under no circumstances, even if the user asks. If the user asks for a fix, direct them to use `/reversa-clarify` or manual editing.

The only allowed write is `feature-dir/audit/cross-check.md`.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values in places where the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If absent, abort
2. Verify the existence of the three artifacts: `requirements.md`, `roadmap.md`, `actions.md`
   2.1. If any is absent, abort with a message listing what is missing and which skill generates it
3. Apply `before-audit` in the default way

## Comparison axes

Check each pair of artifacts for:

1. Coverage
   1.1. Every functional requirement became at least one decision in the roadmap
   1.2. Every decision in the roadmap became at least one action in actions
   1.3. Every Gherkin scenario in requirements is covered by some action or decision
2. Consistency
   2.1. Terms use the same name across the three documents (don't see "invoice" in one and "bill" in another)
   2.2. Quoted identifiers exist (RF-12 referenced in the roadmap must exist in requirements)
   2.3. Contracts described in `interfaces/` appear in the roadmap
3. Coherence with the legacy
   3.1. Roadmap decisions do not contradict 🟢 rules of `_reversa_sdd/domain.md`
   3.2. Quoted components of `_reversa_sdd/architecture.md` actually exist
4. actions sanity
   4.1. Dependencies point to existing IDs
   4.2. Tasks marked `[//]` do not share a target file
   4.3. No dependency cycle

## Severity

| Severity | When to apply |
|------------|----------------|
| CRITICAL | Direct conflict with 🟢 rule of the legacy, broken external contract, dependency cycle |
| HIGH | Requirement without roadmap coverage, decision without corresponding action, phantom identifier |
| MEDIUM | Terminological inconsistency between two documents, dependency pointing outside the list |
| LOW | Cosmetic, spelling in ID, underused parallelism |

## Building the report

Write to `feature-dir/audit/cross-check.md`:

1. Header with date, feature identifier and link to the three analyzed artifacts
2. Summary: finding count by severity
3. Table `ID | Severity | Axis | Description | Where it is`
4. For each CRITICAL or HIGH finding, paragraph explaining the impact and skill suggestion for the human to fix (NEVER promise that this skill does the fix, only point the direction)
5. List of checked items that passed, grouped by axis (so the human can see what is OK)

Use IDs in the format `A001`, `A002`, ... stable within the report, but NOT shared with IDs from other documents.

## Persistence

- Create `feature-dir/audit/` if it doesn't exist
- Write `cross-check.md` with atomic write
- Always complete rewrite, never append

## Post-execution hooks

Apply `after-audit` in the default way.

## Final report to the user

1. Absolute path of `cross-check.md`
2. Finding count by severity (CRITICAL, HIGH, MEDIUM, LOW)
3. Explicit warning: none of the three artifacts was altered
4. Next step suggestion:
   4.1. If there are CRITICAL or HIGH, suggest manual review before proceeding
   4.2. Otherwise, suggest `/reversa-coding`

End with:

> Type **CONTINUE** to proceed as suggested above.
