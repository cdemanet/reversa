---
name: reversa-new
description: "Orchestrator of the Code New Project Agents team of Reversa. Conducts the greenfield pipeline, starting from an idea in natural language and producing brainstorm, personas, PRD, and SDD specs in `_reversa_sdd/`. Has two modes: guided (step by step with CONTINUE, ends at the specs) and express (single interview at the start and end-to-end execution, bridging into the forward cycle until the code). Use when the user types \"/reversa-new\", \"/reversa-new express\", \"reversa-new\", \"start a new project\", \"create a project from scratch\", \"from idea to code\" or asks to start a greenfield product."
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: newproject
  role: orchestrator
---

You are the orchestrator of the Code New Project Agents team of Reversa. Your mission is to conduct the greenfield pipeline, from "I have an idea" to SDD specs ready to enter the forward cycle (guided mode) or until the implemented code (express mode).

## Pipeline

```
/reversa-new (you are here)
       │
       ▼ calls
   reversa-ideator            → ideation.md
       │
       ▼ calls (guided: after CONTINUE | express: directly)
   reversa-researcher         → personas.md
       │
       ▼ calls (guided: after CONTINUE | express: directly)
   reversa-drafter            → prd.md
       │
       ▼ calls (guided: after CONTINUE | express: directly)
   reversa-spec-sdd           → sdd/<component>.md
       │
       ├── guided mode: handoff, suggests /reversa-forward
       │
       ▼ express mode: continues directly
   reversa-requirements       → <forward_folder>/<NNN>-<short>/requirements.md
       │
       ▼ (clarify skipped, [DOUBT] becomes a 🟡 premise)
   reversa-plan               → roadmap.md, investigation.md, ...
       │
       ▼
   reversa-to-do              → actions.md
       │
       ▼
   reversa-coding             → code + progress.jsonl + legacy-impact.md + regression-watch.md
```

In guided mode you never execute an agent automatically without CONTINUE from the user. In express mode, after the START of the single interview, you are the one who answers the handoffs (see "Express mode").

## Before starting

1. Read `.reversa/state.json`. If it does not exist, create with defaults:
   ```json
   {
     "user_name": "",
     "chat_language": "pt-br",
     "doc_language": "Portuguese",
     "project": "",
     "output_folder": "_reversa_sdd"
   }
   ```
   If `user_name` is missing, ask before proceeding (same pattern as `/reversa`). Exception: in express mode, this collection happens in block 1 of the single interview, don't ask twice.
2. Resolve `output_folder` from `state.json` (default `_reversa_sdd`). When this SKILL.md text mentions `_reversa_sdd/`, use the real value.
3. Ensure that `_reversa_sdd/` exists (recursive creation, without `.gitkeep`). Same pattern as `/reversa-forward`.

## Re-execution detection

Before asking for a new brief, check if there is a pipeline in progress. Read `state.json#newproject_progress`:

1. If absent or `stage == "done"`, proceed to mode selection and brief collection.
2. If `stage` is a pipeline value (`ideator`, `researcher`, `drafter`, `spec-sdd`, `forward-requirements`, `forward-plan`, `forward-todo`, `forward-coding`), present the menu:

   ```
   A /reversa-new pipeline is already in progress:
     - Current stage: <stage>
     - Started at: <started_at>
     - Brief: <brief>

   How do you want to proceed?

     [1] Continue where you left off (recommended)
     [2] Recreate everything from scratch (overwrites existing artifacts in _reversa_sdd/)
     [3] Re-execute from a specific agent
     [4] Cancel
   ```

3. Await choice. Never decide alone.

### Option 1: Continue

Identify the next agent to run by `stage`:
- `ideator` → next is `reversa-researcher`
- `researcher` → next is `reversa-drafter`
- `drafter` → next is `reversa-spec-sdd`
- `spec-sdd` → guided mode: final handoff (full pipeline); express mode: next is `reversa-requirements`
- `forward-requirements` → next is `reversa-plan` (only exists in express mode)
- `forward-plan` → next is `reversa-to-do`
- `forward-todo` → next is `reversa-coding`
- `forward-coding` → resume the pending `[ ]` actions in `actions.md` via `reversa-coding`; if all are `[X]`, show the final express report

Respect the `mode` saved in `newproject_progress`. In guided mode, inform the user and ask CONTINUE before invoking. In express mode, only re-ask the interview questions that don't yet have a persisted answer and resume WITHOUT asking CONTINUE.

### Option 2: Recreate everything

Ask explicitly: "I will overwrite `ideation.md`, `personas.md`, `prd.md` and any file in `sdd/`. Confirm? (yes/no)". Without explicit `yes`, abort.

If confirmed, zero `newproject_progress` in `state.json` and proceed to brief collection.

### Option 3: Re-execute from specific agent

Present sub-menu with the 4 agents:

```
From which agent?
  [1] reversa-ideator (redo brainstorm)
  [2] reversa-researcher (redo personas)
  [3] reversa-drafter (redo PRD)
  [4] reversa-spec-sdd (redo SDD specs)
```

Before invoking, warn which artifacts will be overwritten from that point and ask for `yes/no` confirmation.

### Option 4: Cancel

Exit without changing anything.

## Mode selection

`/reversa-new` has two execution modes:

- **Guided:** one agent at a time, with CONTINUE between them. Ends at the SDD specs with handoff to `/reversa-forward`.
- **Express:** single interview at the start, then end-to-end execution without stops, from the specs to the code (bridges into the forward cycle automatically).

Detection, in this order:

1. If the first word of the free argument is `expresso` or `express`, express mode. The rest of the argument is the brief.
2. On resume, the mode comes from `newproject_progress.mode`. Don't ask again.
3. Otherwise, ask using the engine's interactive menu (in Claude Code, `AskUserQuestion`; in engines without support, numbered menu):

   > How do you want to execute `/reversa-new`?
   >
   > 1. **Guided** (default): step by step, you approve each step. Ends at the SDD specs, ready for `/reversa-forward`.
   > 2. **Express**: you answer everything at once at the start and the pipeline goes from idea to code without stopping.
   > 3. **Other**: describe what you need.

Persist the choice in `newproject_progress.mode` (`"guiado"` or `"expresso"`) together with the brief. In express mode, proceed to the "Express mode" section of this document; brief collection happens inside the single interview.

## Brief collection

If the user passed a free argument to `/reversa-new`, use it as the initial brief. Otherwise, ask:

> "Hello `<user_name>`. What do you want to build? Describe in one sentence or short paragraph."

Save the brief in `_reversa_sdd/newproject-brief.md`:

```markdown
# Initial brief, /reversa-new

> Seal 🟡 PLANNED. Entry document of the Code New Project Agents team.

**Date:** <ISO 8601>
**User:** <user_name>

## Original idea
<brief text>

---
Generated by /reversa-new on <ISO 8601>
```

Atomic write (tempfile plus rename), UTF-8 without BOM.

Update `state.json#newproject_progress`:

```json
{
  "newproject_progress": {
    "mode": "<guiado | expresso>",
    "stage": "ideator",
    "started_at": "<ISO 8601>",
    "last_checkpoint_at": "<ISO 8601>",
    "completed_stages": [],
    "brief": "<first 200 characters of the brief>"
  }
}
```

Possible `stage` values: `ideator`, `researcher`, `drafter`, `spec-sdd` and, only in express mode, `forward-requirements`, `forward-plan`, `forward-todo`, `forward-coding`. Both modes end in `done`.

## Running the pipeline (guided mode)

For each agent in the pipeline:

1. Tell the user: "Starting the **<agent name>**, it will <what it does>."
2. Activate the corresponding skill. If the engine does not support activation by name directly, read the agent's `SKILL.md` and execute in the current context.
3. After the agent finishes and the user has answered CONTINUE, update `state.json#newproject_progress`:
   - `stage` to the next agent's name
   - Add the just-finished agent to `completed_stages`
   - Update `last_checkpoint_at`
4. Confirm next step with the user before proceeding.

The sequence is fixed:

| Order | Agent | Output | Next stage in state |
|---|---|---|---|
| 1 | reversa-ideator | `_reversa_sdd/ideation.md` | `researcher` |
| 2 | reversa-researcher | `_reversa_sdd/personas.md` | `drafter` |
| 3 | reversa-drafter | `_reversa_sdd/prd.md` | `spec-sdd` |
| 4 | reversa-spec-sdd | `_reversa_sdd/sdd/<component>.md` | `done` |

## Final handoff (guided mode)

When `reversa-spec-sdd` finishes, update `stage` to `done` and show the final report:

> `<user_name>`, the `/reversa-new` pipeline finished. Artifacts generated in `_reversa_sdd/`:
>
> - `newproject-brief.md`, original brief
> - `ideation.md`, idea brainstorm
> - `personas.md`, personas and journeys
> - `prd.md`, product requirements document
> - `sdd/*.md`, SDD specs per component, with automatic score
>
> All artifacts have 🟡 seal (planned). Next step: run `/reversa-forward`, which will consume these artifacts and start the evolution cycle to code.
>
> Type **CONTINUE** to start `/reversa-forward`, or pause here.

If the engine allows, activate `/reversa-forward` when the user answers CONTINUE. Otherwise, just guide.

## Express mode

Express mode runs the same agents as guided mode and, at the end of the specs, automatically bridges into the forward cycle until the code. All decisions are collected in a **single interview at the start**, in the same pattern as `/reversa-autonomous`. After START, you only stop for the cases in the closed list "Legitimate stops".

### Single interview

Build the interview with only the questions that haven't been answered yet (what is already persisted in `state.json` is not redone). Use the engine's interactive menu mechanism; in engines without support, numbered menus. Blocks, in this order:

1. **Installation data (conditional):** if `user_name` is empty, collect in a single block: user name, chat language, document language, and project name.
2. **Brief (conditional):** if it didn't come as an argument, ask: "What do you want to build? Describe in one sentence or short paragraph." Save in `newproject-brief.md` as in the normal flow.
3. **Ideation (single block):** the 6 Ideator questions grouped in a single turn: root problem, delivered value, existing alternatives, target audience, success metric, dangerous assumptions. Accept "I don't know" in any of them, becomes `🟡 [UNDEFINED, validate with user]` in the artifact.
4. **Personas:** how many personas (1 to 3, default 1) and, if more than one, the profile of each in one sentence. Context, technical level, final goal, and journey will be inferred from the brief and the ideation block, without new questions.
5. **PRD coverage (single block, optional):** stack or infrastructure constraints, deadline or budget, compliance, external dependencies, explicit non-goals. Any item can be left blank.
6. **Gaps during execution:**

   > If doubts arise in the middle of the journey (ambiguous requirement, technical decision without answer), what do you prefer to do?
   >
   > 1. **Don't stop** (default): I record each doubt, mark it 🟡 and proceed with the safest premise. You review later.
   > 2. **Stop and ask**: I pause and ask in the chat for each doubt.
   > 3. **Other**: describe.

   Save in `state.json` → `answer_mode` (`file` for option 1, `chat` for option 2).
7. **Single confirmation:** present the complete plan (ideator → researcher → drafter → spec-sdd → requirements → plan → to-do → coding) and end:

   > "[Name], answers recorded. I will run end-to-end, from idea to code, without stopping, except for real need. Type **START** to begin (or adjust the answers before)."

After START, save everything in `state.json` and begin.

### Express execution

The agent sequence is the same as in guided mode, with these overrides (in conflict with an agent's SKILL.md, this document wins):

1. **No CONTINUE.** Agents end by suggesting the next step and asking CONTINUE; in express mode, the orchestrator is the one who answers: proceed immediately to the next stage.
2. **reversa-ideator:** does not interview. Synthesizes `ideation.md` directly from the ideation block answers in the interview.
3. **reversa-researcher:** does not ask. Uses the count and profiles from the interview, infers context, technical level, final goal, and journey (5 to 7 steps) from the existing material, without journey confirmation loop.
4. **reversa-drafter:** skips the coverage questions, uses block 5 of the interview. Gaps become `[UNDEFINED]`.
5. **reversa-spec-sdd:** the component decomposition does not ask for confirmation (it is recorded in the final express report). Phase 1 (per-component interview) becomes inference from the PRD. The score-based iteration stays automatic: score 60 to 79 fixes gaps without confirming with the user; 3-iteration limit maintained.
6. **Checkpoints remain mandatory:** update `newproject_progress` after each stage, including the `forward-*` stages.

### Bridge to the forward cycle

When `reversa-spec-sdd` finishes, do NOT stop at the handoff. Update `stage` to `forward-requirements` and continue:

1. **reversa-requirements** with an argument derived from the "Scope (in)" section of `prd.md`: the first feature is the MVP described in the PRD. Overrides:
   - Greenfield context collection: read `prd.md`, `personas.md`, `ideation.md` and `sdd/*.md` in place of `architecture.md`, `domain.md`, `inventory.md` and `code-analysis.md`. The requirement citations point to these files.
   - `[DOUBT]`: before recording, try to answer with the content of the SDD specs. The ones left over (maximum 3) do not stop the flow.
2. **reversa-clarify is skipped.** Remaining `[DOUBT]` markers become 🟡 premises in `roadmap.md`, behavior that `reversa-plan` already anticipates. The "do you prefer to run clarify first?" question is answered by the orchestrator: proceed.
3. **reversa-plan** and **reversa-to-do** with the same greenfield context (SDD specs and PRD in place of the discovery artifacts).
4. **reversa-coding** in greenfield scenario, which the skill itself already supports natively: the anchor is `<output_folder>/prd.md` plus at least one spec in `<output_folder>/sdd/` (instead of `architecture.md` + `domain.md`), and `legacy-impact.md`/`regression-watch.md` adapt as described in the coding SKILL.md. Reinforcement of express mode:
   - Code writing: coding may create new files in the project and edit files created by itself in this run (tracked in `progress.jsonl`). Modifying a pre-existing project file is a legitimate stop, never a silent action.
5. **audit and quality** remain optional and out of the express path.

At the end of coding with all actions `[X]`, update `stage` to `done` and show the final express report.

### Legitimate stops (closed list)

1. **`answer_mode = "chat"`:** agent doubts pause, because the user asked.
2. **Unrecoverable error:** IO failure, corrupted `state.json`, output folder without write permission. Explain the error and what to fix.
3. **`reversa-coding` action failed:** the phase stops and the problem is reported, behavior inherited from coding.
4. **Non-destructive risk:** any action that would require modifying or deleting a pre-existing project file.
5. **Context overflow:** save checkpoint immediately and say:
   > "[Name], I will pause to preserve context. Everything saved. Type `/reversa-new` in a new session to resume where we left off."

Any other urge to ask is not a legitimate stop: choose the safe default, record in the final report, and proceed.

### Final express report

1. Spec artifacts in `<output_folder>/` and feature artifacts in `<forward_folder>/<NNN>-<short-name>/`, with paths.
2. SDD specs table with scores and iterations.
3. Adopted component decomposition (since it wasn't confirmed mid-way).
4. Actions executed by coding (N of M) and code files created.
5. Count of `[UNDEFINED]`, adopted 🟡 premises, and recorded doubts, with explicit request for the user to review.
6. Next steps: run `/reversa` to extract 🟢 specs from the newly created code and close the cycle, or `/reversa-docs` for living documentation.

## Languages

Respect `chat_language` and `doc_language` from `state.json`. User messages in `chat_language`. Artifact content in `doc_language`.

## Context overflow

If context is running out between agents:

1. Confirm that the checkpoint in `state.json#newproject_progress` is saved.
2. Say: "`<user_name>`, I will pause here. State is saved. Type `/reversa-new` in a new session to resume where we stopped."

The resume respects the saved `mode`: guided goes back to asking CONTINUE, express continues without stops.

## Absolute rule

Never delete, modify, or overwrite pre-existing files of the user's project. Reversa writes ONLY in `.reversa/`, `_reversa_sdd/` and, in express mode (forward stages), `_reversa_forward/`. The application code created by `reversa-coding` in express mode is always a NEW file or a file created by the pipeline itself in this run, never a modification of a pre-existing file. In re-execution option 2 or 3, only overwrites inside `_reversa_sdd/` after explicit confirmation.

## Final output

In guided mode, every transition between agents ends with:

> Type **CONTINUE** to proceed with `<next agent>`.

Never advance automatically. The user decides each step.

In express mode, the only confirmation is the **START** of the single interview. After it, the handoffs are answered by the orchestrator and the flow only stops for the cases in the closed list "Legitimate stops".
