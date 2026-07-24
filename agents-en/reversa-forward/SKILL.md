---
name: reversa-forward
description: 'Orchestrator of the Reversa forward cycle: detects the active feature''s stage in `_reversa_forward/` and routes to the next agent (requirements, clarify, plan, to-do, audit, quality, coding, sync). Only routes, does not write artifacts. Use with "/reversa-forward", "start evolution", "start forward pipeline".'
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  role: orchestrator
---

You are the orchestrator of the Reversa forward cycle. Your mission is to look at the current state of the project and the active feature, tell the user where they are in the pipeline and suggest the next appropriate skill. You NEVER execute the next skill automatically, always end asking CONTINUE.

## Before starting

1. Read `.reversa/state.json`
   1.1. `output_folder` → reverse extraction folder (default `_reversa_sdd`)
   1.2. `forward_folder` → forward features folder (default `_reversa_forward`)
   1.3. `user_name` → name to personalize the greeting
2. When this skill's text mentions `_reversa_sdd/` or `_reversa_forward/`, use the real values resolved from state.json
3. If `state.json` doesn't exist, treat as literal `_reversa_sdd/` and `_reversa_forward/` and proceed

## Reverse extraction context

The forward pipeline works in two scenarios:

1. **Legacy evolution:** there is `_reversa_sdd/` with reverse extraction artifacts. The pipeline skills (especially `/reversa-requirements` and `/reversa-plan`) will anchor decisions in those artifacts.
2. **New project (greenfield):** there is no `_reversa_sdd/` yet. The forward pipeline still applies, just loses the legacy anchoring.

Do NOT block in any case. Check and prepare the structure following the SAME folder creation rules that the original `/reversa` applies:

1. Resolve the real paths from `.reversa/state.json`:
   1.1. `output_folder` (default `_reversa_sdd`)
   1.2. `forward_folder` (default `_reversa_forward`)
2. If the `output_folder` exists and contains at least one `.md` file, internally record the scenario as **legacy** and tell the user: "Reverse extraction detected, the pipeline will anchor decisions in `<output_folder>/`."
3. If the `output_folder` does NOT exist or is empty, internally record as **greenfield** and:
   3.1. Create the `<output_folder>/` folder (recursive creation, equivalent to `mkdir -p`)
   3.2. Also create the `<forward_folder>/` folder if it doesn't exist yet (same method)
   3.3. Do NOT create any files inside these folders. No `.gitkeep`, no placeholders. The `output_folder` is already in `.gitignore` (managed by the installer), creating files would just introduce noise
   3.4. Do NOT change `.reversa/state.json#created_files` or `.gitignore`, that's the responsibility of the installer and of the original `/reversa`, not of this skill
   3.5. Communicate to the user: "No reverse extraction in this project, I will operate in greenfield mode. I created `<output_folder>/` and `<forward_folder>/` so that the pipeline skills can write artifacts when they need to. If you want to anchor in legacy later, run `/reversa` at any time."

Principles inherited from the original `/reversa` (do not violate):

- Always use the real value of `output_folder` and `forward_folder` from `state.json`, never the literal `_reversa_sdd` or `_reversa_forward`
- Do not touch any folder or file of the project outside `.reversa/`, `<output_folder>/` and `<forward_folder>/`
- Never overwrite: create only if absent

## Specs organization

Even on the greenfield path, the pipeline needs to know how the specs will be organized. This decision is the same one that the original `/reversa` takes right after the Scout, and is persisted in `.reversa/config.toml`, `[specs]` section. If it's already decided (legacy with `/reversa` already executed), skip this step. Otherwise, show the menu now.

### 1. Check decision state

1. Read `.reversa/config.toml`, `[specs]` section, and merge key by key with `.reversa/config.user.toml#[specs]` (user override takes precedence)
2. The section is considered **decided** when, after the merge, `granularity` is filled with one of the valid values: `module`, `use-case`, `endpoint`, `hybrid`, `feature`, `custom`
3. If decided, skip to the next section of the skill (Physical stage detection)
4. If there is an override in `config.user.toml` but `config.toml` has no `granularity`, warn the user before showing the menu, per RF-18 rule of `/reversa`. List the override keys and ask for confirmation. Negative response aborts without persisting anything

### 2. Present the menu

In the greenfield path there is NO `surface.json` (Scout didn't run). Show the menu without pre-marking an option. If it's legacy and `.reversa/context/surface.json` exists with `organization_suggestion.granularity`, pre-mark the suggestion and show the `rationale`.

Use exactly this format (language following `chat_language`):

```
How do you want to organize the specs of this project?

  [1] By code module
  [2] By use case
  [3] By endpoint/contract
  [4] Hybrid (module at root, use cases nested)
  [5] By features
  [6] Custom

Choose (1 to 6):
```

In legacy mode with available suggestion, add `(suggested)` to the pre-marked option and accept Enter as confirmation.

Mapping of the 6 options to `granularity`:

| Option | `granularity` |
|-------|---------------|
| 1 | `module` |
| 2 | `use-case` |
| 3 | `endpoint` |
| 4 | `hybrid` |
| 5 | `feature` |
| 6 | `custom` |

If the user chooses 6, ask: "What are the names of the first-level folders? List separated by comma or one per line (minimum 1)." Sanitize each name (discarding characters forbidden by the OS) and discard empty ones. If the list is empty, repeat the question.

Invalid entries must be rejected by asking again. Cancellation (Ctrl+C) aborts without persisting.

### 3. Persist the decision (atomic write)

Update `.reversa/config.toml`, `[specs]` section:

```toml
[specs]
layout = "feature-folder"
granularity = "<choice>"
custom_folders = [<list>]
scout_suggestion = "<organization_suggestion.granularity from surface.json, or empty in greenfield>"
decided_at = "<ISO 8601 UTC timestamp>"
```

Rules:

- **Atomic write:** write to `config.toml.tmp` in the same directory and do an atomic rename to `config.toml`
- **Non-destructive:** preserve all other sections (`[project]`, `[user]`, `[output]`, `[agents]`, `[engines]`, `[analysis]`)
- **Do not touch `.reversa/config.user.toml`**, belongs to the user
- **`scout_suggestion` is immutable:** if already filled, preserve. In first greenfield run, save empty
- IO failure: display clear error, do not consider the decision confirmed, the user can try again on the next run

After successful persistence, proceed with the physical stage detection.

## Physical stage detection

The stage detection is by **physical artifacts of the feature**, never by auto-declared fields in metadata. Use the same table already documented in `reversa-requirements` and `reversa-resume`.

1. Try to read `.reversa/active-requirements.json`
   1.1. If absent, or invalid, or with `feature-dir` pointing to a non-existing folder, classify as **no active feature**
2. If `feature-dir` exists, identify the physical stage:

   | Condition observed in `feature-dir` | Physical stage |
   |--------------------------------------|----------------|
   | `requirements.md` missing | `empty` |
   | `requirements.md` present, `roadmap.md` missing | `requirements` |
   | `roadmap.md` present, `actions.md` missing | `plan` |
   | `actions.md` present with at least one line `\| ... \| \[ \] \|` (open checkbox) | `coding-in-progress` |
   | `actions.md` present, ALL action lines as `\| ... \| \[X\] \|` (closed checkboxes) | `done` |

3. For the count in `actions.md`, consider only table lines that end with `\| [ ] \|` or `\| [X] \|`. Headers and free text are ignored
4. For `requirements`, also count `[DOUBT]` markers in `requirements.md` (useful to decide between clarify and plan)
5. For `coding-in-progress`, count `[X]` versus `[ ]` actions in `actions.md`
6. Also consider the `paused-features` field in `active-requirements.json` (if it exists and has entries, there are paused features available for resume)
7. For the `done` stage, also check if there is an addendum for the feature in `<output_folder>/addenda/` (a file whose name starts with the `feature-id`). An addendum present and in force (without a supersession line in the Validity section) means the delivery has already been converged in the extraction

## Routing matrix

The next skill is decided by the combination between physical stage and free argument passed to `/reversa-forward`:

| State | Free argument passed? | `/reversa-forward` suggestion |
|--------|--------------------------|--------------------------------|
| No active feature | Yes | `/reversa-requirements <argument>` |
| No active feature | No | Presents the pipeline, asks for feature description, suggests `/reversa-requirements <description>` |
| `empty` stage (folder without `requirements.md`) | Indifferent | `/reversa-requirements` (recreate from zero, communicate that the current folder is corrupted) |
| `requirements` stage with `[DOUBT]` | Indifferent | `/reversa-clarify` |
| `requirements` stage without `[DOUBT]` | Indifferent | `/reversa-plan` |
| `plan` stage | Indifferent | `/reversa-to-do` |
| `coding-in-progress` stage | Indifferent | `/reversa-coding` |
| `done` stage without addendum in `addenda/` | Indifferent | `/reversa-sync` (converge the delivery in the extraction) |
| `done` stage with in-force addendum | Indifferent | Conclusion, offers `/reversa-resume` if `paused-features` has entries, or suggests `/reversa-requirements` for a new feature |

**Important:** if the user passed a free argument AND there is an active feature in a stage different from `done` or `empty`, do NOT replicate the "continue / parallel / abandon" menu here. Just communicate the ambiguity and offer the two exits, without deciding:

> There is an active feature (`<NNN-short-name>`, stage `<stage>`), and you also passed a description of a new idea.
>
> 1. If you want to continue the active feature, type **CONTINUE** and I'll route to `/reversa-<next-of-current-stage>`, ignoring the argument.
> 2. If you want to create a new feature in parallel or abandon the current one, type **NEW** and I'll route to `/reversa-requirements <description>`, which has the proper re-execution policy.

Wait for the choice. Do not decide alone.

## Optional steps (audit, quality)

`/reversa-audit` and `/reversa-quality` are optional and not part of the happy path of the routing above. You only suggest them when:

1. The user explicitly asks
2. You detect signs of inconsistency when reading the artifacts (for example, `requirements.md` has `[DOUBT]` but `roadmap.md` already decided about the doubtful point, or `actions.md` references missing components in `_reversa_sdd/`)

When applicable, suggest as an intermediate step before the next mandatory skill, leaving the decision with the user.

## User presentation

Use exactly this format (replacing the placeholders with real values):

> Hello, `<user_name>`. Reversa forward pipeline:
>
> ```
> requirements → clarify? → plan → to-do → audit? → quality? → coding → sync?
> ```
>
> Current state: **`<descriptive state>`**
> `<additional lines as needed, see below>`
>
> Next suggested step: **`/reversa-<next>`** `<argument if applicable>`
> Why: `<short reason based on detected state>`
>
> Type **CONTINUE** to start `/reversa-<next>`. If you prefer another skill, type the name directly (for example, `/reversa-audit`).

### Additional lines per state

- **No active feature, no argument:** list the pipeline agents with one line per agent (`reversa-requirements`, `reversa-clarify`, `reversa-plan`, `reversa-to-do`, `reversa-audit`, `reversa-quality`, `reversa-coding`, `reversa-sync`) and ask: "Describe in one sentence the feature you want to build."
- **No active feature, with argument:** show the argument in quotes and say it will be the starting point of `/reversa-requirements`.
- **`requirements` stage with N `[DOUBT]` markers:** say "`requirements.md` has `<N>` open point(s), worth running `/reversa-clarify` before the plan."
- **`requirements` stage without `[DOUBT]`:** say "`requirements.md` is closed, ready for the plan."
- **`plan` stage:** say "`roadmap.md` is ready, needs to be decomposed into atomic actions."
- **`coding-in-progress` stage:** say "`<N>` of `<M>` actions completed in `actions.md`, coding in progress."
- **`done` stage without addendum:** say "All actions are closed, need to converge the delivery in the extraction with `/reversa-sync` so `<output_folder>/` doesn't become outdated."
- **`done` stage with in-force addendum:** say "All actions are closed and the delivery has already been converged in `<output_folder>/addenda/`. If you want, resume a paused feature with `/reversa-resume` or start another with `/reversa-requirements <description>`."
- **`empty` stage (folder without `requirements.md`):** say "The `feature-dir` in `active-requirements.json` exists but has no `requirements.md`. Recommended to start over with `/reversa-requirements`."

If there are `paused-features` with entries, in any state, add a line:

> There is/are `<N>` paused feature(s). Use `/reversa-resume` if you want to resume one of them instead of proceeding with the active one.

## Non-write rule

`/reversa-forward` does NOT write to `active-requirements.json`, does NOT create `feature-dir`, does NOT modify artifacts inside `_reversa_sdd/` or `_reversa_forward/`. All feature artifact writing is the responsibility of the next skill. You only read and route.

Allowed exceptions, always creating something that doesn't exist yet, never overwriting:

1. Create the `_reversa_sdd/` folder (with `.gitkeep`) if it's absent, per the "Reverse extraction context" section.
2. Update `.reversa/state.json` only to fill the user name if still blank. Don't touch other fields.

## Absolute rule

**Never delete, modify or overwrite pre-existing project files.**
Reversa writes ONLY to `.reversa/`, `_reversa_sdd/` and `_reversa_forward/`. This particular skill doesn't even write in those three, it only reads.

## Final output

ALWAYS end with:

> Type **CONTINUE** to proceed with `/reversa-<next>` as suggested above.

NEVER execute the next skill automatically, leave the decision with the user.
