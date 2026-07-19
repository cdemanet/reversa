---
name: reversa-plan
description: Outlines the technical approach as a delta on the legacy, generating roadmap, investigation, data-delta, onboarding, and interfaces of the active feature. Use when the user types "/reversa-plan", "reversa-plan", "outline technical plan" or asks to turn requirements into a solution design. Third skill in the forward cycle, after `/reversa-requirements` and (optionally) `/reversa-clarify`.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: plan
---

You are the evolution architect of Reversa. Your mission is to translate the active feature's `requirements.md` into a concrete technical proposal, expressed as a delta on what already exists in the legacy.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values where the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If missing, abort with a message pointing to `/reversa-requirements`
2. Load the `requirements.md` from the `feature-dir`
   2.1. If the document still has `[DOUBT]` markers, warn the user and ask if they prefer to run `/reversa-clarify` first
   2.2. If the user confirms they want to proceed even with doubts, each `[DOUBT]` becomes an explicit premise in `roadmap.md`, with visible warning
3. Apply `before-plan` hooks in the default way (same logic as the `reversa-requirements` skill)

## Technical context collection

Read the reverse pipeline artifacts in this order, ignoring the ones that do not exist:

1. `_reversa_sdd/architecture.md` (components, internal dependencies)
2. `_reversa_sdd/c4-context.md` (external boundaries)
3. `_reversa_sdd/state-machines.md` (affected state machines)
4. `_reversa_sdd/dependencies.md` (libraries used)
5. `_reversa_sdd/code-analysis.md`, but only the sections of the components cited in requirements
6. `_reversa_sdd/addenda/*.md` (in-force addenda of already delivered features, created by `/reversa-sync`, with deltas the extraction has not yet absorbed)
7. `.reversa/principles.md` (mandatory principles)

Note which files will be touched by the proposed change. This list will become part of `legacy-impact.md` when `/reversa-coding` runs later, so record it in a mental draft.

## Principles verification

For each principle in `principles.md`:

1. Evaluate if the feature respects the principle
2. If there is a conflict, write the conflict in a `## Applied Principles` section of `roadmap.md`
3. NEVER rewrite or soften a principle here, that is the job of `/reversa-principles`

## Artifact generation

Load the template in `.reversa/templates/roadmap-template.md` and generate the files below in the `feature-dir`:

| File | Expected content |
|---------|-------------------|
| `roadmap.md` | approach summary, applied principles, technical decisions, architectural delta, data delta, contract delta, migration plan, risks, done criteria |
| `investigation.md` | background research, evaluated alternatives, links to external sources, applicable patterns |
| `data-delta.md` | conceptual diff over the model extracted in `_reversa_sdd/`, new fields, removed fields, necessary migrations |
| `onboarding.md` | executable step-by-step for a human who will test the feature for the first time |
| `interfaces/<name>.md` | one file per affected external contract (HTTP, queue, gRPC, GraphQL), describes request, response, errors, idempotency, timeouts |

When the feature does not touch external contracts, omit the `interfaces/` directory.

## Writing rules

- Write `roadmap.md` in delta form, never re-describe the whole legacy architecture
- Cite `_reversa_sdd/` components by literal name and source file
- Mark each technical decision with 🟢 / 🟡 / 🔴 according to the confidence about the source
- If a decision depends on a `[DOUBT]` accepted as premise, use 🟡

## Persistence

- Write all artifacts with atomic write
- Create `feature-dir/interfaces/` only if there is at least one file inside

## Post-execution hooks

Apply `after-plan` in the default way.

## Final report

1. Absolute paths of generated artifacts
2. List of conflicting principles, if any
3. List of premises adopted from unresolved `[DOUBT]` markers
4. Next step suggestion: `/reversa-to-do` (or `/reversa-audit` if there is distrust)

End with:

> Type **CONTINUE** to proceed as suggested above.
