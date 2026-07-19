---
name: reversa-coding
description: "Drives the execution of actions.md into code. Updates checkboxes to [X], writes progress.jsonl, generates legacy-impact.md and regression-watch.md. Works anchored in the legacy (Discovery extraction in `_reversa_sdd/`) or in greenfield (prd.md + SDD specs from `/reversa-new`). Use when the user types \"/reversa-coding\", \"reversa-coding\", \"execute plan\" or asks to start coding the active feature. Last skill of the forward cycle, after `/reversa-to-do` (and optionally `/reversa-audit` or `/reversa-quality`)."
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: coding
---

You are the executor. Your mission is to transform `actions.md` into real code, phase by phase, respecting parallelism and dependencies. When finished, leave two trails for future auditing: `legacy-impact.md` (what was changed in the legacy) and `regression-watch.md` (what must remain true in future extractions).

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values in places where the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Context anchor: legacy or greenfield

This skill **REQUIRES** a context anchor in `_reversa_sdd/`, otherwise the two central artifacts (`legacy-impact.md` and `regression-watch.md`) lose their value and the forward cycle becomes a generic framework. Two anchors are valid:

1. **Legacy:** `_reversa_sdd/` contains `architecture.md` AND `domain.md` (extraction from the Discovery Team via `/reversa`). Classic behavior.
2. **Greenfield:** `_reversa_sdd/` contains `prd.md` AND at least one spec in `_reversa_sdd/sdd/` (artifacts from `/reversa-new`). A new project is a valid case; the pipeline does not block on the absence of the extraction. The skill's artifacts adapt as described in the generation sections.

If both anchors exist (a project that ran both `/reversa` and `/reversa-new`), use the legacy one as the main anchor and the SDD specs as a complement.

The check remains strict when NO anchor exists: the skill aborts with a clear message, does NOT offer the option to proceed anyway, does NOT write anything to disk.

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If missing, abort with a message pointing to `/reversa-requirements`
2. Verify the existence of `feature-dir/actions.md`
   2.1. If missing, abort with a message pointing to `/reversa-to-do`
3. Verify the context anchor:
   3.1. **Legacy anchor:** `_reversa_sdd/` exists AND contains `architecture.md` AND `domain.md`. If satisfied, internally record the scenario as **legacy** and proceed to step 4.
   3.2. **Greenfield anchor:** `_reversa_sdd/` exists AND contains `prd.md` AND at least one `.md` file in `_reversa_sdd/sdd/`. If satisfied (and the legacy one is not), record the scenario as **greenfield**, inform the user ("No legacy extraction, I will anchor in the `/reversa-new` artifacts: `prd.md` and SDD specs.") and proceed to step 4.
   3.3. If NONE of the two anchors is satisfied, abort with the message:

      > 🛑 `/reversa-coding` requires a context anchor in `_reversa_sdd/` and I didn't find any:
      >
      > - **Legacy:** `architecture.md` + `domain.md` (generate with `/reversa`)
      > - **Greenfield:** `prd.md` + specs in `sdd/` (generate with `/reversa-new`)
      >
      > Without that context, `legacy-impact.md` and `regression-watch.md` would lose their anchor and the forward cycle would lose its edge. Run one of the two pipelines and come back here.

   3.4. In the case of step 3.3, do NOT create `legacy-impact.md`, do NOT create `regression-watch.md`, do NOT touch `actions.md`, do NOT write `progress.jsonl`. Only report and end.

4. Apply `before-coding` in the default way

## Scope of the run

1. If the free argument indicates a phase or ID range (e.g. "just Core", "T001-T005"), restrict the execution to that scope
2. Otherwise, run in order all `[ ]` actions not yet completed

## Execution loop per phase

For each phase, in order Preparation, Tests, Core, Integration, Polish:

1. Select all actions of the phase with status `[ ]`
2. Calculate the independent set (actions with no open dependency)
3. For the independent set, identify the sub-set marked `[//]`
   3.1. Execute that sub-set thinking of each action as a coherent block, but report separately
4. Execute the other actions of the set sequentially
5. After each action:
   5.1. Update `feature-dir/actions.md` changing `[ ]` to `[X]`
   5.2. Write a line in `feature-dir/progress.jsonl` with ISO 8601 timestamp, action ID, final status, touched files
6. If an action fails:
   6.1. Keep `[ ]` in actions
   6.2. Record `status: failed` in progress
   6.3. Stop the phase and report to the user

## Generating legacy-impact.md

After running (even partially):

**Greenfield scenario:** there is no legacy to impact. Generate the file anyway, with adaptations: map each created file to the corresponding component in the specs under `_reversa_sdd/sdd/` (instead of `architecture.md`), use the impact type `new-component` for everything, and register in the header: "Greenfield feature, no pre-existing legacy. Anchor: prd.md + SDD specs." The "Preserved" and "Modified" sections stay empty with that note. Skip steps 4 and 5 below.

**Legacy scenario:**

1. For each project file touched, map to the corresponding component in `_reversa_sdd/architecture.md` when possible
2. For each affected component, classify the impact type: `rule-changed`, `rule-removed`, `new-rule`, `new-component`, `extinct-component`, `data-delta`, `external-contract-delta`
3. Assign severity aligned with `/reversa-audit` (CRITICAL, HIGH, MEDIUM, LOW)
4. List 🟢 rules of `_reversa_sdd/domain.md` that remain intact (go to the "Preserved" section)
5. List 🟢 rules that were changed or removed (go to the "Modified" section)

File structure:

1. Header with date and feature identifier
2. Table `Affected file | Component | Type | Severity | Justification`
3. Conceptual diff per component, in prose
4. "Preserved" section
5. "Modified" section

Write to `feature-dir/legacy-impact.md` atomically, complete rewrite.

## Generating regression-watch.md

**Greenfield scenario:** there are no 🟢 rules to watch (nothing was extracted from existing code yet). Generate the file with the standard structure, empty main watch, and record the implemented FRs (from the SDD specs) in the "Observations" section, without regression weight. They gain weight when a future `/reversa` extraction over the new code confirms them as 🟢. Skip steps 1 to 4 below (step 5, stable IDs, applies to the observations).

**Legacy scenario:**

1. For each rule in the "Modified" section of `legacy-impact.md`, generate a watch item
2. For explicitly removed rules, generate a watch item of type `absence`
3. For changed rules, generate a watch item of type `wording` or `presence` as appropriate
4. For rules with downgraded confidence, generate a watch item of type `confidence`
5. Assign stable ID `W001`, `W002`, ..., recycling old IDs of the file if it already exists

Structure:

1. Header with feature identifier
2. Table `ID | Source (file, section) | Expected rule after change | Verification type | Violation signal`
3. "Re-extraction history" section initially empty, will be filled by the reverse agent when `/reversa` runs again
4. "Archived" section initially empty

NEVER include in the main watch rules that were originally 🟡 or 🔴; those go to an "Observations" section without regression weight.

Write to `feature-dir/regression-watch.md`. The first run creates the file; subsequent runs append in the new items sections, never rewriting history or old IDs.

## Updating progress.jsonl

Each line must have, at minimum:

```json
{"ts":"2026-05-05T16:30:00Z","action":"T003","status":"done","files":["src/x/y.js"]}
```

Append-only. Never rewrite previous lines, even if you discover they were wrong. To correct, add a new `status: corrected` line with the target ID.

## Post-execution hooks

Apply `after-coding` in the default way.

## Final report to the user

1. How many actions executed successfully
2. How many failed (if any)
3. Absolute path of `actions.md`, `progress.jsonl`, `legacy-impact.md`, `regression-watch.md`
4. How many watch items were created in this run
5. Explicit warning: run `/reversa-sync` to converge the delivery in `_reversa_sdd/addenda/` and keep on the radar to run `/reversa` (re-extraction) again at some future moment to close the cycle
6. If the execution was partial, indicate the next phase or pending action

NEVER trigger the re-extraction on your own; that is the user's decision.

End with:

> Type **CONTINUE** to proceed with `/reversa-sync` (delivery convergence in the extraction) or any other action the user wants.
