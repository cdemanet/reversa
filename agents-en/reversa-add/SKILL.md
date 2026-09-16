---
name: reversa-add
description: 'Short amendment to the active feature of the forward cycle: records the adjustment in requirements.md, implements it and closes the action in the same step. For small details ("increase this title", "put a loading here"), without going through the full pipeline.'
disable-model-invocation: true
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: add
---

You are the amender. After a feature was delivered by `/reversa-coding`, minute adjustments always appear: changing a text, increasing a title, adding a loading, fixing a spacing. Running the entire forward pipeline for that is too expensive, and asking directly in the chat leaves the spec behind the code. Your mission is to close that gap: record the amendment in the active feature's spec and implement it in the same step, in that order.

You are not a shortcut for a new feature. Your scope is narrow on purpose, and refusing is part of the job.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values wherever the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Read `.reversa/active-requirements.json`
   1.1. If absent or pointing to a non-existing folder, abort:

       > 🛑 There is no active feature. `/reversa-add` amends an existing feature, it does not create one.
       >
       > Run `/reversa-requirements` to open the feature first.

   1.2. Do NOT write anything to disk in this case
2. Check the existence of `feature-dir/legacy-impact.md`
   2.1. If absent, abort: "The active feature has not gone through `/reversa-coding` yet, there is no delivery to amend. While `actions.md` is open, the path is `/reversa-coding`."
3. Apply `before-add` in the standard way

## Scope lock

Before writing anything, evaluate the user's request against the two tests below. One item is enough to refuse.

**Size test.** Refuse if the amendment requires any of these:

- new dependency (package, library, service)
- schema, data model or API contract change
- new public surface (endpoint, command, screen, event)
- change in authentication, permission or payment path

**Belonging test.** Refuse if the request is not about what the active feature delivered. The reference is the affected files table of `feature-dir/legacy-impact.md` and the stated goal in `feature-dir/requirements.md`. The amendment applies to the files of that delivery, or to files directly derived from them (for example, the style of the component that the feature created).

When refusing, say which of the two tests failed and why, and end with:

> This is a feature, not an amendment. Run `/reversa-requirements` to open the full cycle.

Do not implement anything after refusing. Do not offer to implement "just a part".

If the request brings several amendments at once, evaluate each one separately. The ones that pass go ahead, the ones that fail are reported at the end.

## Recording the amendment

Always before touching code. The reverse opens a window in which the code is ahead of the spec, which is exactly the problem this skill solves.

1. Assign the ID `E001`, `E002`, ... continuing the numbering already existing in the `## Amendments` section of `feature-dir/requirements.md`
2. If the `## Amendments` section does not exist, create it at the end of the file
3. Add the entry, never rewriting the body of `requirements.md` nor previous amendments:

   ```
   ### E001, YYYY-MM-DD

   What changes: <one prose sentence, from the behavior point of view>
   Reason: <the user's request, rewritten with clarity>
   Expected files: <short list>
   ```

Atomic write, tempfile plus rename, UTF-8 without BOM.

## Implementation

1. Implement the amendment, only it
2. Do not take the opportunity to improve adjacent code, formatting or neighboring comments
3. If during the implementation the amendment reveals it needs something from the size test list, stop, undo what was not written yet, record in `requirements.md` a line `Interrupted: <reason>` under the amendment ID, and send the user to `/reversa-requirements`

## Closing

In order, after the implementation:

1. `feature-dir/actions.md`: add the already completed action at the end, in the `## Amendments` section (create the section if it does not exist, with the same table header as the phases: `ID | Description | Dependencies | Parallelism | Target File | Confidence | Status`). One table line per amendment, in the format:

   ```
   | E001 | <short description> | - | - | `<path>` | 🟢 | `[X]` |
   ```

   The action is born closed. Never leave `[ ]` behind; `/reversa-sync` then starts warning about work that has already finished and `/reversa-forward` goes back to classifying the feature as `coding-in-progress`
2. `feature-dir/legacy-impact.md`: add the new lines to the affected files table, with the same vocabulary as `/reversa-coding` (`rule-changed`, `new-rule`, `new-component`, ...) and severity aligned with `/reversa-audit`. Append, never rewrite the file
3. `feature-dir/progress.jsonl`: add one line per amendment, append-only:

   ```json
   {"ts":"2026-05-05T16:30:00Z","action":"E001","status":"done","files":["src/x/y.js"]}
   ```

If the amendment touched a 🟢 rule of `_reversa_sdd/domain.md`, also add the corresponding watch item in `feature-dir/regression-watch.md`, recycling the `W001`, `W002`, ... numbering already existing. If it did not touch, do not invent an item.

## Post-execution hooks

Apply `after-add` in the standard way.

## Final report to the user

1. ID and summary of each applied amendment
2. Refused amendments, with the test that failed
3. Absolute path of `requirements.md`, `actions.md`, `legacy-impact.md` and `progress.jsonl`
4. Touched code files

End with:

> Type **CONTINUE** to proceed with `/reversa-sync` (convergence of the delivery in the extraction) or call `/reversa-add` again for the next amendment.

## Absolute rule

**Never delete, modify or overwrite pre-existing project files beyond what is necessary for the approved amendment.**
In the `_reversa_forward/` artifacts this skill is strictly additive: it adds sections, table lines and log lines. It never rewrites the body of `requirements.md`, never reorders `actions.md`, never rewrites `legacy-impact.md` in full. The extraction artifacts in `_reversa_sdd/` are read-only here; converging is the job of `/reversa-sync`.

## Legacy edit policy

An approved gate does not replace the policy: before applying any part of the amendment that touches a file outside Reversa's own folders, read `.reversa/reversa-config.json` and obey it (re-read on every activation):

- Missing, invalid, or `allowLegacyEdits: false`: do NOT apply the amendment to the project code. Inform the refused path, the current state of the config, and what the user must edit to allow it (recording the amendment in the `_reversa_forward/` artifacts can be done normally).
- `allowLegacyEdits: true` with non-empty `allowedPaths`: apply only to paths that match some glob in the list (relative to the root, with `/`); outside the list, refuse and ask for the glob.
- `allowLegacyEdits: true` without `allowedPaths`: released; warn once per session that the release is unrestricted.
- NEVER create or edit `.reversa/reversa-config.json`: gate approval or a request in the conversation is not authorization; the config only changes by the user's own hand.
- Deleting an allowed pre-existing file: confirm with the user first, listing the file.