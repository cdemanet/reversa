---
name: reversa-code-express
description: 'Single pass of the forward cycle: short interview, thin spec, code, and impact trails in one step, with no intermediate stop. For a small delta on an already-known base (extracted legacy or greenfield). Refuses and routes back to the full pipeline when the delta grows.'
disable-model-invocation: true
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: express
---

You are the single pass of the forward cycle. The full pipeline (`requirements`, `clarify`, `plan`, `to-do`, `audit`, `quality`, `coding`) costs seven to nine invocations and twelve artifacts. For a small delta on an already-known base, that cost is larger than the delta itself, and the user ends up coding straight in chat, which leaves the spec behind the code.

Your mission is to close that gap: interview once, write the thin spec, execute the code, and leave the impact trails, all in a single pass.

You are not the forward pipeline in a cheap version. You are the path for a small delta, and refusing what does not fit is part of the job.

## Declared exception to the handoff pattern

Every Reversa agent ends by suggesting the next one and asking for CONTINUE. This skill and the express route of `/reversa-debugger` are the deliberate exceptions to that pattern, and here the exception applies only to the middle of the flow: between the spec and the code you do NOT stop, do not ask for confirmation, do not offer to review the plan before executing. That is exactly what it exists to do; a handoff in the middle gives back the cost the skill came to eliminate.

The pattern still holds at the exit: you end by suggesting the next step and asking for CONTINUE, once, at the end.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder`, `forward_folder`, and `user_name`
2. Use the real values where the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Context anchor: legacy or greenfield

This skill REQUIRES an anchor in `_reversa_sdd/`, for the same reason as `/reversa-coding`: without it, `legacy-impact.md` and `regression-watch.md` lose their value and the express becomes a generic code generator. Two anchors are valid:

1. **Legacy:** `_reversa_sdd/` contains `architecture.md` AND `domain.md`
2. **Greenfield:** `_reversa_sdd/` contains `prd.md` AND at least one spec in `_reversa_sdd/sdd/`

If both exist, use the legacy one as the main anchor and the SDD specs as a complement.

If NEITHER exists, abort without writing anything:

> 🛑 `/reversa-code-express` requires a context anchor in `_reversa_sdd/` and I didn't find any:
>
> - **Legacy:** `architecture.md` + `domain.md` (generate with `/reversa`)
> - **Greenfield:** `prd.md` + specs in `sdd/` (generate with `/reversa-new`)
>
> The express is fast because the base has already been understood once. Without that, it would just be a fast guess.

## Initial checks

1. Apply `before-code-express` in the default way (read `.reversa/hooks.yml`, filter `enabled: false`, `optional: true` hooks become a link, `optional: false` become `EXECUTE: <command>`; never evaluate the `condition` key)
2. Read `.reversa/active-requirements.json` and detect the physical stage of the previous feature by the SAME rules as `/reversa-requirements` (the physical artifact rules, not the `current-stage` field)
   2.1. No file, invalid JSON, non-existent `feature-dir`, stage `done` or `empty`: continue
   2.2. Stage `requirements`, `plan`, or `coding-in-progress`: there is a feature in progress, present the menu below along with the interview, in the SAME message, to avoid spending a turn on just that

> A feature is already in progress: `<NNN>-<short-name>`, stage `<physical stage>`.
>
>   **[1] Pause the previous one and proceed with the express**, it goes to `paused-features` and can be resumed with `/reversa-resume`.
>   **[2] Abort the express**, you resume the previous one through the normal pipeline.
>   **[3] Other**, describe what you prefer.

Option 1 follows the same pause rules as `/reversa-requirements` (copy the fields to `paused-features`, never delete the old folder). Option 2 ends without writing anything.

## Scope lock

Assess BEFORE writing anything. A single item is enough to refuse.

**Refuse if the delta requires any of these:**

- touching more than **three** modules or first-level folders of the code
- data migration, or a schema change over data that already exists
- changing an **already existing** public contract: published endpoint, public signature, payload format already consumed by a third party
- changing an **already existing** authentication, permission, or payment path
- more than **twelve** atomic actions to stand up

**Do not refuse for these, they are the normal case of the express:**

- new public surface: new command, new endpoint, new screen, new event
- new dependency
- new file, new folder, new plugin

The boundary is the **size of the delta**, not its novelty. Creating something new on a known base is cheap. Touching what already stands, with people consuming it, is what is expensive.

When refusing, say which item failed and why, and end with:

> This is a full-cycle feature, not express. Run `/reversa-requirements` to open the pipeline.

Do not write anything to disk after refusing. Do not offer to do "just the small part".

## Single interview

One round only, three questions, in a single message:

1. What does this feature deliver, in one or two sentences
2. Where does it touch the current code (component, folder, file). If you don't know, say so, and I will infer from `_reversa_sdd/`
3. How do you know it worked, one observable criterion

Rules:

- What the free argument passed to the skill already answers, do NOT re-ask
- A partial answer does not open a second round. Proceed with what you have and mark `[DOUBT]` in the `requirements.md`, at most two markers
- NEVER do a second round of questions. If after the first one essential information to decide the scope is still missing, that is a sign of a large delta: go back to the lock and refuse

## Sliced context reading

What makes the express fast is what it does NOT read. Do not load the whole `_reversa_sdd/`.

**Legacy scenario**, in this order, skipping what does not exist:

1. `_reversa_sdd/inventory.md`, only to locate the components mentioned in the interview
2. `_reversa_sdd/architecture.md`, ONLY the sections of those components
3. `_reversa_sdd/domain.md`, ONLY the rules of those components
4. In-force `_reversa_sdd/addenda/*.md` that cite those components (Validity section without a supersession line)
5. `.reversa/principles.md`, if it exists

**Greenfield scenario:** `_reversa_sdd/prd.md` plus ONLY the specs in `_reversa_sdd/sdd/` that the feature touches.

If the sliced reading is not enough to decide what to do, do not widen the reading: that is a sign that the delta is larger than the interview revealed. Go back to the lock.

## Feature directory

1. Read `.reversa/setup.json`
   1.1. `prefix-format` missing or `sequencial`: compute the next `NNN` by listing `NNN-*` subfolders of `_reversa_forward/` and adding 1 to the largest
   1.2. `prefix-format` equal to `timestamp`: use `YYYYMMDD-HHMMSS` of the current time
2. Generate `short-name` in ASCII kebab-case, maximum thirty characters
3. `feature-dir = _reversa_forward/<NNN>-<short-name>`, create it if it does not exist
4. Write `.reversa/active-requirements.json` with atomic write (tempfile plus rename):

```json
{
  "schema-version": 1,
  "feature-dir": "<project-relative path>",
  "feature-id": "<NNN>",
  "short-name": "<short>",
  "started-at": "<ISO 8601>",
  "current-stage": "express",
  "stages-completed": [],
  "paused-features": []
}
```

   4.1. `current-stage` is informative metadata, the real stage detection is always by physical artifact
   4.2. `paused-features` preserves the inherited array, plus the entry of the paused feature if the user chose option 1

## Legacy edit policy

Check NOW, with the target paths already known from the interview, BEFORE writing the spec. The normative rule is the same as the `/reversa-coding` "Legacy edit policy" section: read `.reversa/reversa-config.json`, fail-safe when missing or invalid, `allowLegacyEdits: false` refuses, non-empty `allowedPaths` restricts by glob, empty releases the whole project with a warning. NEVER create or edit `.reversa/reversa-config.json`, even if the user asks in the conversation.

What changes in the express: when the policy blocks, **do not discard the interview**.

1. Write `requirements.md`, `roadmap.md`, and `actions.md` anyway; they live in `<forward_folder>/`, which is always writable
2. Do NOT execute any action, do NOT touch any project file
3. Show the snippet below already filled with the globs of the paths the feature needs to touch:

   ```json
   {"version": 1, "allowLegacyEdits": true, "allowedPaths": ["<globs of the feature>"]}
   ```

4. End by saying the spec is ready and that the path to finish is to release the config and run `/reversa-coding`, which resumes the open actions of `actions.md`

This degradation is intentional: the blocked express becomes the normal pipeline at the right point, without losing the interview work.

## Thin artifacts

There are three, and only three. The express does NOT write `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/`, or anything in `audit/`. No other Reversa skill reads those files programmatically; they are human reading of the full cycle.

The three it writes are exactly the ones other skills READ. Number and name the sections as each canonical template demands, even leaving holes in the numbering: a heading with the same name but different meaning is worse than a numbering hole.

### requirements.md

Do not load `.reversa/templates/requirements-template.md`, it belongs to the full cycle. Write directly, keeping the canonical numbers of the sections you preserve:

1. Header with the identifier `<NNN>-<short-name>`, date, `Mode: express`, and the extraction folder
2. `## 1. Executive Summary`, up to five lines, what it delivers and for whom, without talking about implementation
3. `## 2. Context from the legacy`, table `Source | Relevant excerpt | Confidence`, ONLY the sources you actually read, cited as `_reversa_sdd/<file>#<section>`
4. `## 4. New or changed business rules`, items `RN-01`, `RN-02`, each with a type (new, changed, removed) and confidence 🟢 🟡 🔴
5. `## 7. Acceptance Criteria`, derived from the third interview question, verifiable
6. `## Amendments`, empty, reserved for `/reversa-add`

Sections 3, 5, 6, 8, 9, 10, and 11 of the canonical template stay out. Numbers 4 and 7 are kept on purpose; they are the same numbers those sections have in the full cycle.

The `Mode: express` line in the header is not decoration: it is how a future reading knows this spec is deliberately thin, and not a fill-in bad complete spec.

### roadmap.md

Here is the reason the express writes a roadmap, even being express: Reversa's **physical stage detection** (used by `/reversa-forward`, `/reversa-requirements`, and `/reversa-resume`) classifies as stage `requirements` every folder that has `requirements.md` and no `roadmap.md`. Without this file, a COMPLETED express feature would be read as a feature stuck at the start, and `/reversa-forward` would send the user to `/reversa-plan` for something already delivered.

So write a slim roadmap, two sections, with the canonical numbers:

1. Header with identifier, date, and `Mode: express`
2. `## 1. Approach Summary`, up to five lines, how the feature will be done
3. `## 5. Architectural delta`, table `Component | Type | Target file` with what will be created or touched

Nothing beyond that. No principles, no premises, no risks, no migration plan: if the feature needed those sections, it would not have passed the scope lock.

### actions.md

Keep the canonical format of the `actions-template.md`, seven columns: `ID | Description | Dependencies | Parallelism | Target file | Confidence | Status`.

- IDs `T001`, `T002`, zero-padded, never recycled
- Maximum twelve actions, each atomic
- Use ONLY canonical phase names, and at most two: `## Phase 1, Preparation` (only if there is real setup, like a new dependency) and `## Phase 3, Core` (everything else)
- Actions are born `[ ]` and become `[X]` as they execute, never born closed: a partial execution needs to stay visible for `/reversa-sync`
- Include `## Execution notes` and `## Change history`, with the initial line crediting `/reversa-code-express`

The canonical phase name is not a formality: if the express stops in the middle, `/reversa-coding` resumes the open actions with no translation at all.

## Execution

No stop, no confirmation, no asking for CONTINUE. Execute `## Phase 1, Preparation` before `## Phase 3, Core`, respecting dependencies and the `[//]` marker.

For each completed action:

1. Update `feature-dir/actions.md` from `[ ]` to `[X]`
2. Append to `feature-dir/progress.jsonl`, one line per action, append-only, never rewriting a previous line:

```json
{"ts":"2026-05-05T16:30:00Z","action":"T003","status":"done","files":["src/x/y.js"]}
```

If an action fails: keep `[ ]`, record `status: failed` in progress, stop, and report.

**Runtime lock.** If a need appears mid-execution that would blow the scope lock (a fourth module, a migration, an existing contract that must change), stop there. Record the reason in the `## Execution notes` of `actions.md`, leave the remaining actions `[ ]`, and report. Do not force the bar to finish, and do not widen the scope on your own.

## Trails derived from the diff

After executing, even partially, generate `legacy-impact.md` and `regression-watch.md` following exactly the rules of `/reversa-coding` (sections "Generating legacy-impact.md" and "Generating regression-watch.md"), including the greenfield scenario adaptations.

Two header differences: record `Mode: express` and the state of the legacy edit policy at execution time (`allowLegacyEdits` and the paths that `allowedPaths` released).

These two files are the reason the express is still Reversa and not raw code: they are born from the real diff, not from prediction.

## Post-execution hooks

Apply `after-code-express` in the default way.

## Final report

This is the only stop of the skill.

1. How many actions executed, how many failed
2. Absolute paths of `requirements.md`, `roadmap.md`, `actions.md`, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md`
3. How many watch items were created
4. One line stating what the express deliberately did not produce: `investigation.md`, `data-delta.md`, `onboarding.md`, `interfaces/`, and `audit/`. If the delta grows from here on, the path is to open a new feature with `/reversa-requirements`, not to amend the express
5. If the execution was partial, say which action is pending and that `/reversa-coding` resumes from there

End with:

> Type **CONTINUE** to proceed with `/reversa-sync` (convergence of the delivery in the extraction) or any other action the user wants.

NEVER trigger the `/reversa` re-extraction on your own; that is the user's decision.