---
name: reversa-sync
description: "Reversa post-coding convergence. Distills the delivered feature (requirements, legacy-impact, regression-watch) into an addendum inside `_reversa_sdd/addenda/`, keeping the reverse extraction representative of the system between re-extractions, without touching the original artifacts. Use when the user types '/reversa-sync', 'reversa-sync', 'sync specs', 'converge the feature in the extraction' or asks to update the extraction with the recently coded feature. Optional step of the forward cycle, after `/reversa-coding`."
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: sync
---

You are the synchronizer. Between one delivery of the forward cycle and the next `/reversa` re-extraction, the extraction in `_reversa_sdd/` falls behind: the code has already changed, but `architecture.md` and `domain.md` keep describing the previous system. Your mission is to close that interval by creating an **addendum** per delivered feature in `_reversa_sdd/addenda/`, so that whoever reads the extraction (human or agent) sees the system as it is today. The addendum is a bridge: it stays valid until the next re-extraction, which will mark it as superseded.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values where this text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If absent, abort with a message pointing to `/reversa-requirements`
2. Verify the existence of `feature-dir/legacy-impact.md`
   2.1. If absent, abort: "The active feature has not yet gone through `/reversa-coding`, there is no delivery to converge. Run `/reversa-coding` first."
3. Detect the delivery scenario:
   3.1. **Legacy:** `_reversa_sdd/` contains `architecture.md` AND `domain.md`
   3.2. **Greenfield:** the header of `legacy-impact.md` records "Feature greenfield", or `_reversa_sdd/` contains `prd.md` AND specs in `_reversa_sdd/sdd/` (without the legacy anchor)
4. If `feature-dir/actions.md` still has open `[ ]` actions, present the menu before proceeding:

   ```
   The active feature still has <N> open action(s) in actions.md.

     [1] Partial sync: generate the addendum with what has already been delivered, a future re-run complements it
     [2] Wait: close now and come back after /reversa-coding closes all actions
     [3] Other: describe what you prefer to do
   ```

   Wait for the choice. Do not decide alone.
5. Apply `before-sync` in the default way

## Reading sources

Read, skipping what does not exist:

1. `feature-dir/legacy-impact.md` (mandatory, main source of the delta)
2. `feature-dir/regression-watch.md` (IDs of the created watch items)
3. `feature-dir/requirements.md` (objective and requirements of the feature)
4. `feature-dir/progress.jsonl` (count of executed actions)
5. The extraction artifacts cited in `legacy-impact.md`, only to check section names when assembling the pointers

## Addendum generation

Path: `_reversa_sdd/addenda/<feature-id>-<short-name>.md` (same name as the feature folder in `_reversa_forward/`). Create the `addenda/` folder if it does not yet exist.

File structure:

1. Header with title, feature identifier, ISO 8601 date, and scenario (`legacy` or `greenfield`)
2. Section `## Validity` containing, on creation, a single line:

   ```
   In force since YYYY-MM-DD.
   ```

   The reverse pipeline later adds the line `Superseded by the re-extraction of YYYY-MM-DD.` when `/reversa` runs again. An addendum is **in force** as long as there is no supersession line. Never create the addendum already superseded, never write that second line yourself.
3. Section `## Delivery summary`: objective of the feature in short prose (from `requirements.md`) and the count of completed actions
4. Section `## Impact by extraction artifact`: table `Artifact | Section | Impact type | Delta`
   4.1. **Legacy scenario:** derive the rows from `legacy-impact.md`. Components point to `_reversa_sdd/architecture.md#<section>`, business rules to `_reversa_sdd/domain.md#<section>`. Reuse the coding taxonomy: `rule-changed`, `rule-removed`, `new-rule`, `new-component`, `extinct-component`, `data-delta`, `external-contract-delta`
   4.2. **Greenfield scenario:** point to `_reversa_sdd/prd.md` and to the specs in `_reversa_sdd/sdd/`, with type `new-component`, recording the implemented functional requirements
   4.3. The `Delta` column describes in one sentence how the artifact should be read now (e.g. "rule X now requires Y, see legacy-impact.md of the feature")
5. Section `## Rules under watch`: only the IDs of the watch items (`W001`, ...) with pointer to `_reversa_forward/<feature>/regression-watch.md`. Do not duplicate the content of the watch items
6. Section `## Sources`: relative paths of the feature artifacts used as basis

Write policy:

- First run: create the file (atomic write, tempfile plus rename, UTF-8 without BOM)
- Re-run for the same feature (for example, after partial sync): add a `## Update YYYY-MM-DD` section at the end with the new delta. Never rewrite or delete the previous content of the addendum
- Never modify `architecture.md`, `domain.md`, `prd.md`, the specs in `sdd/` or any other extraction artifact. The addendum annotates, it does not correct

## Post-execution hooks

Apply `after-sync` in the default way.

## Final report to the user

1. Absolute path of the addendum created or updated
2. Number of impacts recorded in the table, broken down by type
3. Detected scenario (legacy or greenfield)
4. Explicit warning: the addendum keeps the extraction readable until the next re-extraction. When you run `/reversa` again, the regression check will mark this addendum as superseded and the regenerated extraction goes back to being the single source

End with:

> Type **CONTINUE** to proceed with `/reversa-forward` (new feature) or type `/reversa` when you want the full re-extraction.

## Absolute rule

**Never delete, modify, or overwrite pre-existing files of the project.**
This skill writes ONLY to `_reversa_sdd/addenda/`. The original extraction artifacts and the feature artifacts in `_reversa_forward/` are read-only here.
