---
name: reversa-forward-autonomous
description: 'Autonomous mode of the Reversa forward cycle: implements a queue of features (e.g. "features 10 to 20") end to end, requirements through sync, without stopping between phases or between features, with a single interview at the start. Used to evolve code without supervision (YOLO mode, /goal). Not to be confused with /reversa-autonomous, which is the extraction. Use with "/reversa-forward-autonomous", "autonomous forward", "implement features X to Y without stopping", "run the feature plan through reversa-forward".'
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  role: orchestrator
  mode: autonomous
---

You are the Reversa forward orchestrator in **autonomous mode**. You run the same pipeline as `reversa-forward` (requirements, clarify?, plan, to-do, audit?, quality?, coding, sync) over a **queue of features**, one after another. Every decision the normal flow asks along the way is collected in a **single interview at the start**. After it, you only stop in the cases in the "Legitimate stops" section.

## Relationship with the pipeline skills

1. Read the `SKILL.md` of `reversa-forward` (sibling folder `reversa-forward/` in the same skills directory). From it you inherit the folder resolution, the spec organization and the **physical stage table**, which is the only source of truth about where each feature stands.
2. To run a phase, read the `SKILL.md` of the phase skill (sibling folder `reversa-<phase>/`) and follow its instructions in the current context. The phase skills are user-invoked, so never try to activate them by name: read the file.
3. Apply the **overrides** of this document on top. In conflict, this document wins.

## Notice about the execution mode

This skill is made for sessions with automatic tool approval (YOLO mode of Claude Code, `/goal` or equivalent). Unlike `/reversa-autonomous`, which only writes documentation, this skill **writes project code**, and only through one path: the `reversa-coding` phase, obeying `.reversa/reversa-config.json`. Therefore:

- Outside the coding phase, write only to `.reversa/`, `<output_folder>/` and `<forward_folder>/`.
- In the coding phase, the legacy edit policy applies with full rigor. **NEVER create or edit `.reversa/reversa-config.json`**: neither the interview, nor `/goal`, nor a request in the conversation unlocks editing. The config only changes by the user's hand.
- Never run `git push`, publishing, deploy or a destructive command on your own. Local builds and tests that the `actions.md` actions request are allowed. Install a dependency only when an `actions.md` action explicitly requests it.
- When in doubt between acting and not acting on something outside of what the phase mandates, **don't act** and record it in the final report.

## Building the queue

The queue is an ordered list of items. Each item is one of these types:

1. **Existing feature:** folder `<forward_folder>/<NNN>-<short-name>`. A number or range from the user ("10 to 20", "12, 14, 15") matches the numeric prefix `NNN` of these folders, compared as a number (`10` matches `010-*`). With `prefix-format: timestamp`, the user must cite the folders by name.
2. **New feature:** description in natural language, typed by the user or taken from a document they point to (backlog, PRD, feature list). It enters the pipeline through `reversa-requirements`.

Rules:

- Number without a corresponding folder: **never invent the feature**. In the interview, ask for the description or the document to take it from. Without an answer, the item leaves the queue and goes to the report.
- The queue order is the numeric order, or the order in which the user listed them. Later features may depend on earlier ones.
- A feature already in `done` with an addendum in force in `<output_folder>/addenda/` is skipped and recorded as "already completed".
- An existing folder in the `empty` stage (without `requirements.md`) is **blocked**: `reversa-requirements` would create another folder with a new number, duplicating the feature. Record it in the report.
- A new feature receives the next free number (`max + 1`), not the number the user cited. Show in the interview the number each one will receive.

## Initial interview (the only planned stop)

When activated, first check whether there is a run in progress ("Resume" section). Otherwise, assemble the interview with only what **has not yet been answered**, whether in the invocation argument, in `.reversa/state.json` or in `.reversa/config.toml`.

**Without interview:** if the argument already identifies the queue and contains "without interview", "use the defaults" or equivalent (typical of `/goal`), skip the questions, apply the defaults marked below and waive the START confirmation. The pre-check remains mandatory.

Use the engine's interactive menu (in Claude Code, `AskUserQuestion`). In engines without support, use numbered menus. Every choice question has an open final option "Other".

1. **Queue:** show the resolved queue (item, current physical stage, starting phase) and ask for confirmation. Include here the descriptions missing for new features.
2. **How far to go in each feature:**
   1. **Through sync** (default): each feature ends converged in the extraction.
   2. **Through coding**: the code is ready, sync is left for later.
   3. **Through to-do**: planning only, no line of code.
3. **Doubts in the requirements (`[DOUBT]`):**
   1. **Don't stop** (default): clarify is skipped. Each `[DOUBT]` becomes an explicit premise in `roadmap.md`, through the path `reversa-plan` already provides, and is recorded in `<forward_folder>/<feature>/questions.md`.
   2. **Stop and ask**: clarify runs normally and pauses the execution on each doubt.
4. **Optional stages:** run `/reversa-audit` and `/reversa-quality` before coding? Default: no.
5. **Failure in a feature** (an action that fails, a path outside `allowedPaths`, a phase abort):
   1. **Stop the queue** (default): the next features may depend on this one.
   2. **Skip and continue**: the feature is blocked and the queue continues to the next one.

## Pre-check (before START)

Everything that would block the queue midway is verified now, not at feature 7:

1. **Spec organization:** if `[specs] granularity` is not decided, ask the `reversa-forward` question in this interview.
2. **Context anchor** (if the queue reaches coding): `<output_folder>/` must have `architecture.md` + `domain.md` (legacy) or `prd.md` + specs in `sdd/` (greenfield). Without either, reduce the target to "through to-do" and warn, or stop if the user wants code.
3. **Edit policy** (if the queue reaches coding): read `.reversa/reversa-config.json`.
   - Absent, invalid or `allowLegacyEdits: false`: show the current state and the snippet the user must save (`{"version": 1, "allowLegacyEdits": true, "allowedPaths": [...]}`). Offer two exits: the user edits the config and confirms, or the queue runs "through to-do". Do not proceed to coding with the policy blocked.
   - `allowedPaths` filled: warn that paths outside the list will block the feature.
4. **Hooks:** read `.reversa/hooks.yml` and list the `optional: false` hooks that will run on their own. Those with an external effect (e.g. syncing with Plane, Jira or GitHub) appear highlighted.

In **without interview** mode, any pending pre-check item (granularity not decided, missing anchor, blocked policy) interrupts before starting, saying what the user needs to resolve. Don't reduce the target on your own.

End with:

> "[Name], queue ready: [N] features, from [first] to [last], going through [target]. From here I won't stop again, except by real need. Type **START** to begin."

After START, save the checkpoint ("Checkpoint" section) and begin.

## Execution

For each item in the queue, in order:

1. **Activate the feature.** Existing feature: if it is not the active one in `.reversa/active-requirements.json`, perform the swap following the "Swap" section of the `SKILL.md` of `reversa-resume` (the previous active one goes to `paused-features` if it is not `done`). If the folder exists but is not listed in `paused-features`, build the entry from the folder and the physical stage. New feature: proceed to requirements, which creates the folder and `active-requirements.json`.
2. **Detect the physical stage** using the `reversa-forward` table.
3. **Run the phase** indicated by the routing matrix of `reversa-forward`, reading its `SKILL.md`.
4. **Save the checkpoint** and return to step 2, until the feature reaches the target chosen in the interview.
5. One-line summary of the feature and next in the queue, without asking CONTINUE.

An existing feature never returns to requirements: it resumes from the stage it is in.

With the optional stages on, run `reversa-audit` and then `reversa-quality` right after to-do, before the feature's first coding round. The `reversa-forward` matrix does not route to them, so the insertion is yours.

**Re-read from disk before each phase.** On a long queue the context is compacted without warning and the instructions read earlier are lost. Before each phase, re-read `.reversa/forward-autonomous.json` and the phase's `SKILL.md`, even if you have already read them in this session.

### Per-phase overrides

| Stop point of the normal flow | Autonomous behavior |
|---|---|
| Every skill ends with "Type CONTINUE" | The orchestrator answers: goes straight to the next phase or feature |
| `reversa-requirements`, re-execution policy (previous feature in progress) | Option 2, create in parallel: the previous one goes to `paused-features`. Never abandons a feature |
| `reversa-clarify`, questions to the user | "Don't stop" mode: skipped. "Stop" mode: runs normally |
| `reversa-plan`, "prefer to run clarify first?" | "Don't stop" mode: proceeds, each `[DOUBT]` becomes an explicit premise with a warning in `roadmap.md` |
| `reversa-coding`, deletion of a pre-existing file | Does not delete. Records the file in the report for the user to decide |
| `reversa-coding`, path outside `allowedPaths` or action that fails | Does not write. The feature becomes **blocked** with the missing globs; applies the failure rule from the interview |
| `reversa-sync`, actions still open | Option 2, wait: does not generate a partial addendum. The feature becomes blocked |
| `optional: false` hook ("EXECUTE and wait") | Runs the command and waits, as `hooks.yml` defines. A hook failure blocks the feature |
| `optional: true` hook | Does not run. Lists it in the final report |

The `optional: false` hooks run even with an external effect because the user configured them as mandatory. That is why the pre-check shows them before START.

## Legitimate stops (closed list)

Only interrupt execution in these cases:

1. **Pending pre-check:** edit policy blocked, missing anchor or granularity not decided, and the user has not yet resolved it.
2. **"Stop and ask" mode** for doubts: clarify pauses, because the user asked.
3. **Feature failure with the "stop the queue" rule**: explain the failure, what was completed and what the user needs to fix.
4. **Unrecoverable error:** IO failure, corrupted `state.json` or `active-requirements.json`, folder without write permission.
5. **Context overflow:** save the checkpoint immediately and say:
   > "[Name], I'll pause to preserve the context. Everything saved. Type `/reversa-forward-autonomous` in a new session to continue from where we stopped."

Any other urge to ask is not a legitimate stop: choose the safe default, record it in the final report and continue.

## Checkpoint

File `.reversa/forward-autonomous.json`, written atomically (tempfile plus rename) after START and after each phase:

```json
{
  "schema-version": 1,
  "started-at": "<ISO 8601>",
  "status": "running | paused | blocked | done",
  "answers": {
    "target": "sync | coding | to-do",
    "doubts": "file | chat",
    "optional-stages": false,
    "on-failure": "stop | skip"
  },
  "queue": [
    {
      "item": "<NNN-short-name or description of the new feature>",
      "feature-dir": "<path, filled in when it exists>",
      "status": "pending | running | done | blocked | skipped",
      "last-stage": "<physical stage after the last phase>",
      "note": "<reason for the block or skip>"
    }
  ],
  "warnings": []
}
```

The checkpoint only records progress. The real stage of each feature continues to come from the physical artifacts.

## Resume

If `.reversa/forward-autonomous.json` exists with `status` different from `done`:

1. Show the progress (✅ completed, 🔄 current, ⏳ pending, ⛔ blocked).
2. Redo only the pre-check, because the config may have changed. Do not redo the interview.
3. Resume the current item from its physical stage, **without asking CONTINUE**. A blocked item whose cause has been fixed (e.g. globs added to the config) returns to `running`.

If the user passed a new queue in the argument, ask once whether they want to discard the previous run or resume it. Discarding only rewrites the checkpoint, never deletes a feature folder.

## Final report

When the queue ends, save `status: done` and present:

1. Per feature: final stage, generated artifacts and, for those that went through coding, the project files touched (from `legacy-impact.md`).
2. Blocked or skipped features, with the reason and what to do to unblock them.
3. Premises assumed in place of `[DOUBT]`, pointing to the `questions.md` the user should review.
4. Files coding wanted to delete and did not delete, optional hooks not run and other accumulated warnings.
5. Next steps: review the diff, run the project tests and, when the queue went through coding, run sync afterwards.

## Absolute rule

**Never delete, move or overwrite pre-existing project files outside of what the coding phase does under the policy of `.reversa/reversa-config.json`.** The feature folders in `<forward_folder>/` are never deleted, nor are the paused or abandoned ones.
