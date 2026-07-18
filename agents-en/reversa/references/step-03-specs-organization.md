# Step 3, Specs organization

This step happens immediately after the user chooses the `doc_level` (Essential / Complete / Detailed) and before invoking the Archaeologist. This is when Reversa decides and persists in which structure the specs will be generated.

## 1. Decide whether the menu should be shown

Read, in this order, and merge key by key (total precedence for `config.user.toml`):

1. `.reversa/config.toml`, `[specs]` section (config managed by Reversa)
2. `.reversa/config.user.toml`, `[specs]` section (manual user override)

The merge is evaluated by key: each key present in `config.user.toml` overrides the corresponding one in `config.toml`. Missing keys continue coming from `config.toml`.

The section is considered **decided** when, after the merge, `granularity` is filled with one of the valid values: `module`, `use-case`, `endpoint`, `hybrid`, `feature`, `custom`.

- **If decided:** skip this whole step. Go straight to invoking the Archaeologist.
- **If not decided** (section missing, or `granularity` empty): show the menu (step 2 below).

### Special case, RF-18

If `granularity` is empty in `config.toml` (or the section was removed) **and** there is a `[specs]` section in `config.user.toml` with any key filled, warn the user before showing the menu. Use exactly this format:

> "I detected that `.reversa/config.toml` has no specs organization decision, but `.reversa/config.user.toml` contains an override in `[specs]`. The override will remain active after your choice and may overwrite fields you decide now.
>
> Current override in `config.user.toml`:
> [list keys and values]
>
> Do you want to proceed with the menu anyway? (y/N)"

Wait for an explicit affirmative response before going to the menu. Empty or negative response aborts without persisting anything.

## 2. Present the menu

Read `.reversa/context/surface.json` → `organization_suggestion`. Use the `granularity` field to pre-mark the suggested option and the `rationale` field to show the reason.

If `surface.json` has no `organization_suggestion` filled (Scout did not run or failed), display the menu without a default and ask the user to choose manually, as in EC-01 of the organization spec.

Use exactly this format (language following `chat_language` from `state.json`, example below in English):

```
How do you want to organize the specs of this project?

The Scout analyzed the legacy and suggests: [translation of suggested granularity].
Reason: [organization_suggestion.rationale]

  [1] [marker] By code module
  [2] [marker] By use case
  [3] [marker] By endpoint/contract
  [4] [marker] Hybrid (module at root, use cases nested)
  [5] [marker] By features (Scout lists the discovered features)
  [6] [marker] Custom

Choose (Enter accepts the suggested):
```

Where `[marker]` is `*` (asterisk) on the pre-marked option and space on the others. Add `(suggested)` next to the pre-marked option.

Mapping of the 6 options to the `granularity` value:

| Option | `granularity` |
|-------|---------------|
| 1 | `module` |
| 2 | `use-case` |
| 3 | `endpoint` |
| 4 | `hybrid` |
| 5 | `feature` |
| 6 | `custom` |

### Accept input

- Enter without typing: accept the pre-marked option.
- Number from 1 to 6: accept the corresponding option.
- Any other input: ask again without persisting anything.
- Ctrl+C / ESC / cancellation: abort execution and do not persist anything (EC-02).

### Option 6, custom

If the user chooses 6, open the following prompt:

> "What are the names of the first-level folders? List them separated by comma or one per line (minimum 1)."

Accept the input, sanitize each name (remove characters forbidden by the OS filesystem, discard empty names). If the list is empty, repeat the prompt (EC-07). The names go into `custom_folders`.

## 3. Detect conflict with structure already on disk (RF-11)

Before persisting the decision, check whether there is a specs structure already materialized in `<output_folder>/` (defined in `state.json`).

If the output folder has subfolders that match a granularity different from the one chosen now (for example, you chose `endpoint` but the disk has folders that look like `module`), display a warning comparing the two structures and ask for confirmation:

> "I detected that there are already specs generated with the **[old]** structure in `<output_folder>/`. You chose **[new]** now, which differs from the previous one.
>
> I will create the new structure in parallel, without touching the previous one. Existing specs stay preserved.
>
> Confirm? (y/N)"

Wait for an explicit affirmative response. Denial aborts without persisting.

The detection is heuristic and best-effort: compare top-level subfolder names with the modules identified by the Scout (`module`), with URIs/routes (`endpoint`), with features (`feature`), etc. When the heuristic cannot decide clearly, **do not** show the warning (avoids false positives).

## 4. Persist the decision (RNF-03, atomic write)

Update `.reversa/config.toml`, `[specs]` section, with:

```toml
[specs]
layout = "feature-folder"
granularity = "<user choice>"
custom_folders = [<list>]   # only when granularity == "custom", otherwise []
scout_suggestion = "<organization_suggestion.granularity from surface.json>"
decided_at = "<ISO 8601 UTC timestamp, example 2026-05-03T14:32:00Z>"
```

Rules:

- **Atomic write:** write to a temporary file in the same directory (`config.toml.tmp`) and do an atomic rename to `config.toml`. A failure during the write cannot leave `config.toml` corrupted.
- **scout_suggestion is immutable** (RF-14): if the `[specs]` section already existed but had `granularity` empty and `scout_suggestion` filled, preserve `scout_suggestion`. On first run, copy the current value of `organization_suggestion.granularity` from `surface.json`.
- **Non-destructive:** preserve any key/section you are not explicitly updating. Do not touch `[project]`, `[user]`, `[output]`, `[agents]`, `[engines]`, `[analysis]` or other sections.
- **Do not touch `.reversa/config.user.toml`.** That file belongs to the user.
- **IO failure** (disk full, no permission, EC-06): display a clear error, do not create spec folders, do not consider the choice confirmed. The user can try again on the next run.

## 5. Flow continuation

After a successful persistence, proceed with invoking the Archaeologist according to `plan.md`. The decision is available to all agents that write specs.

## 6. Manual re-presentation (RF-17)

There is no dedicated CLI flag to reconfigure. The user re-presents the menu by manually removing the `[specs]` section from `.reversa/config.toml` (or emptying `granularity`). On the next run, this step detects the "not decided" state and runs again.

## Folder language (RF-10)

The names Reversa uses for feature folders follow `doc_language` from `state.json`. Do not ask for a language in this step. In an `en` installation, the folders come out in English; in `pt-br`, in Portuguese.

## Pre-advance checklist

- [ ] Read `[specs]` from `config.toml` and merge with `config.user.toml` key by key
- [ ] If already decided, skip the step
- [ ] If there is an override in `config.user.toml` but `config.toml` is empty, show RF-18 warning
- [ ] Read `organization_suggestion` from `surface.json`
- [ ] Display menu with pre-marked suggestion
- [ ] Accept Enter, number 1 to 6, or cancellation
- [ ] If option 6, collect `custom_folders`
- [ ] Detect conflict with structure on disk and ask for confirmation
- [ ] Atomic write to `config.toml`
- [ ] Preserve `scout_suggestion` on re-runs with partial section
- [ ] Proceed to the Archaeologist
