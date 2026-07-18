---
name: reversa-resume
description: Resumes a paused feature (listed in paused-features of active-requirements.json) and makes it active. Use when the user types "/reversa-resume", "reversa-resume", "retomar feature pausada" or asks to go back to a previous feature. Does NOT create new features, only swaps the active one for the chosen one and (when it makes sense) moves the current active to paused-features.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: resume
---

You are the retaker. Your mission is to swap the active feature for one of those in `paused-features`, without losing the work of either.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values where the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If absent, abort with message:

       > 🛑 `/reversa-resume` requires an active feature to perform the swap. `active-requirements.json` does not exist.
       >
       > Use `/reversa-requirements` to create the project's first feature.

2. Check the `paused-features` field
   2.1. If absent or empty array, abort with message:

       > 🛑 No paused features to resume. The `paused-features` array is empty.
       >
       > Features become paused when you run `/reversa-requirements` on an active feature in progress and choose option 2 (create parallel).

3. Apply `before-resume` hooks in the default way (reads `.reversa/hooks.yml`, filters `enabled: false`, same logic as other forward cycle skills)

## Listing the paused

For each entry in `paused-features`:

1. Verify that the `feature-dir` still exists on disk
   1.1. If it does NOT exist, mark as `absent` (the folder was deleted manually, the entry became garbage)
2. If it exists, detect the **current physical stage** with the same logic as `/reversa-requirements`:

   | Observed condition in `feature-dir` | Physical stage |
   |--------------------------------------|----------------|
   | `requirements.md` absent | `empty` |
   | `requirements.md` present, `roadmap.md` absent | `requirements` |
   | `roadmap.md` present, `actions.md` absent | `plan` |
   | `actions.md` present with at least one `\| ... \| \[ \] \|` line | `coding-in-progress` |
   | `actions.md` present, all actions as `\| ... \| \[X\] \|` | `done` |

3. For `coding-in-progress`, count `[X]` actions versus `[ ]`

Present numbered list to the user:

```
Paused features:

1. <NNN-short-name>  ·  stage: <physical>  ·  paused on <YYYY-MM-DD>  [· N of M actions]
2. <NNN-short-name>  ·  stage: <physical>  ·  paused on <YYYY-MM-DD>
3. <NNN-short-name>  ·  stage: absent   ·  paused on <YYYY-MM-DD>  (folder deleted, orphan entry)
```

For `absent` entries, visually mark them as orphaned.

## User choice

Ask:

> Which feature do you want to resume? Type the number from the list, or `0` to cancel.

Wait for the response. Do NOT choose on your own.

## Orphan entry handling

If the user chose an entry with stage `absent`:

1. Do NOT swap
2. Ask: "That feature's folder was deleted. Do you want to remove this entry from `paused-features`? (yes / no)"
3. If yes, remove only that entry from the array, write updated `active-requirements.json` (atomically), end the skill.
4. If no, end without changing anything.

## Detection of the currently active feature's state

For the feature in `active-requirements.json#feature-dir`, detect the physical stage using the same table above. This value decides whether it will be paused or discarded in the swap.

## Swap

1. Build the new pause entry for the **currently active** feature, copying all fields from `active-requirements.json` except `paused-features`, and adding:
   - `paused-at`: ISO 8601 of the current time
   - `paused-from-stage`: detected physical stage of the current active
2. Decide the destination of the current active feature:
   - 2.1. If physical stage is `requirements`, `plan` or `coding-in-progress`: **pause**, that is, push the built entry into the `paused-features` array
   - 2.2. If physical stage is `done`: **discard from active**, do NOT push (the feature is finished, it does not deserve space in paused-features). Its folder remains untouched in `_reversa_forward/`
   - 2.3. If physical stage is `empty`: **discard from active**, do NOT push (corruption, folder without `requirements.md`)
3. Remove the chosen feature from the `paused-features` array
4. Build the new `active-requirements.json`:

```json
{
  "schema-version": 1,
  "feature-dir": "<feature-dir of the chosen one>",
  "feature-id": "<feature-id of the chosen one>",
  "short-name": "<short-name of the chosen one>",
  "started-at": "<original started-at of the chosen one>",
  "current-stage": "<original current-stage of the chosen one, or detected physical stage>",
  "stages-completed": [<copied from the chosen one, or [] if absent>],
  "paused-features": [<updated array>]
}
```

   4.1. If the chosen one did not have `started-at`/`current-stage`/`stages-completed` (old version entry, before the rich schema), use the detected physical stage for `current-stage` and the current time as `started-at` (record this fallback in a message to the user)

5. Write the JSON atomically (tempfile plus rename)

## Post-execution hooks

Apply `after-resume` in the default way.

## Final report to the user

1. Resumed feature: identifier `<NNN-short-name>`
2. Detected physical stage of this feature: value between `requirements` / `plan` / `coding-in-progress`
3. For `coding-in-progress`, show `N of M actions completed`
4. Destination of the previously active feature:
   4.1. "paused" (if pushed to paused-features)
   4.2. "discarded from active (state: done)" or "discarded from active (state: empty)"
5. Next skill suggestion per the resumed feature's stage:
   5.1. `requirements` → suggest `/reversa-clarify` (if there are `[DOUBT]`) or `/reversa-plan`
   5.2. `plan` → suggest `/reversa-to-do`
   5.3. `coding-in-progress` → suggest `/reversa-coding` (with optional argument to restrict scope)

Always end with:

> Type **CONTINUE** to proceed as suggested above.

Do NOT execute the next skill automatically, leave the decision with the user.
