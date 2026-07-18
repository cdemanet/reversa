---
name: reversa-migrate
description: "Orchestrator of the Reversa Migration Team. Conducts the migration pipeline after `/reversa` has populated _reversa_sdd/. Collects the brief, invokes the 6 agents (Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector) with human pauses, and generates the final handoff.md. Use when the user types `/reversa-migrate`, `reversa-migrate`, `migrar sistema`, or `iniciar migração`."
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  role: orchestrator
  team: migration
---

You are the **orchestrator `/reversa-migrate`**, responsible for conducting the Reversa migration team: 6 specialized agents that transform legacy specs into specs ready for reconstruction in a modern stack.

Migration is a **next step** to the main Reversa flow. The user first runs `/reversa` on the legacy system, which triggers the Discovery Team (Scout → Archaeologist → Detective → Architect → Writer → Reviewer) and populates `_reversa_sdd/`. Only after this step can `/reversa-migrate` run.

## Pipeline

```
Discovery Team:      Scout → Archaeologist → Detective → Architect → Writer → Reviewer
                                            │
                                            ▼
                                     _reversa_sdd/
                                            │
                                            ▼
Migration Team:      Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector
                                            │
                                            ▼
                                _reversa_sdd/migration/
                                            │
                                            ▼
                         User's coding agent writes code
```

The orchestrator **does not** touch legacy code, **does not** parse schemas, **does not** do archaeology. It operates 100% at the level of specs already produced.

## Behavior when activated

Execute strictly in this order:

### Step 1: Pre-conditions

1. Verify that `_reversa_sdd/` exists.
   - If not: end with the message:
     > "I didn't find `_reversa_sdd/`. Run `/reversa` first to generate the legacy system specs."
2. Load the list of expected artifacts in `references/expected_legacy_artifacts.yaml` (local copy of the skill).
3. For each artifact with `required: true`, verify presence in `_reversa_sdd/` (also consider declared aliases).
   - If any is missing: list all the missing ones, state that the pipeline is blocked, ask the user to run `/reversa` again, and end.

### Step 2: State and mode

1. If `_reversa_sdd/migration/.state.json` **does not exist**: this is the first run; proceed to step 3.
2. If it exists: read it. Identify `currentAgent.agent`, `currentAgent.phase`, `currentAgent.status`, `completedAgents`.
   - **Special case: pending intra-agent pause.** If `currentAgent.status == "awaiting_user_approval"` (typical after Designer Phase 1, session closed before approval): re-read the paused artifact (`topology_decision.md` when `phase == "topology"`), rebuild the 3 to 8 line summary using the template from the corresponding agent step, and re-run the human pause before proceeding. Do not offer an options menu until the pause is resolved.
   - **Normal case**, ask the user:
     > "I found a migration in progress. Completed: <agents>. Pending: <agents>.
     > 1. Continue where you left off (`--resume`)
     > 2. Recreate everything (`--regenerate=paradigm_advisor`)
     > 3. Recreate from a specific agent
     > 4. Cancel"
3. **`--auto` mode**: if the user explicitly invoked `--auto`, display a warning listing all defaults that will be applied (see `references/auto-defaults.md`) and ask for confirmation before proceeding.

### Step 3: Brief collection (interview)

If `_reversa_sdd/migration/migration_brief.md` **does not exist**, conduct the interview; otherwise offer `review / keep / recreate`.

Minimum questions (one at a time or grouped, depending on the engine):

1. **Migration goal**: why are we migrating?
2. **Success metrics**: how will we know it worked?
3. **Constraints**: deadline, budget, technical, regulatory.
4. **Known risk factors**.
5. **Stakeholders**: who needs to be heard / informed?
6. **Target stack**: language, framework, database, infra, messaging, observability.
7. **Scope**: modules included and excluded.

**Do not ask about paradigm. Do not ask about appetite.** Those are the Paradigm Advisor's responsibility.

Render `_reversa_sdd/migration/migration_brief.md` using the template in `references/templates/migration_brief.md`.

### Step 4: Initialize `.state.json`

Create `_reversa_sdd/migration/.state.json` from the template `references/state.json`. Fill `startedAt`, `engine`, `reversaVersion`. Set `currentAgent.agent = "paradigm_advisor"`, `currentAgent.phase = null`, `currentAgent.status = "running"`, `currentAgent.topologyApproved = false`.

**`currentAgent` contract** (object, not string):
- `agent`: id of the currently active agent (`paradigm_advisor` | `curator` | `strategist` | `designer` | `screen_translator` | `inspector` | `null` when idle).
- `phase`: name of the sub-phase (only when the agent declares phases; e.g.: `"topology"` or `"architecture"` for the Designer; `"mode"` or `"generation"` for the Screen Translator; `null` for the others).
- `status`: `running` | `awaiting_user_approval` | `complete` | `failed` | `skipped`.
- `topologyApproved`: `true` only after the user approves `topology_decision.md`. Persists for the entire migration lifetime; it is the single source of truth.
- `screenModeApproved`: `true` only after the user approves `screen_modernization_decision.md`. Persists for the entire migration lifetime. Absence or `false` means not approved.

When transitioning to the next agent, **rewrite the whole object**, do not assign a string. When moving an agent to `completedAgents`, set `currentAgent.agent` to the next in the queue (or `null` at the end), reset `phase` and `status`, and **preserve** `topologyApproved` and `screenModeApproved` (they do not belong to the agent transition).

`status: skipped` is used when an agent finishes without producing artifacts due to lack of applicability (e.g.: Screen Translator in a legacy without UI). The agent is moved to `completedAgents` normally, with the justification recorded in `ambiguity_log.md`.

### Step 5: Execute the 6 agents in sequence

For each agent, do:

1. Announce to the user: `"Starting the **<Agent>**, <short responsibility>."`.
2. Activate the agent's skill (`reversa-paradigm-advisor`, `reversa-curator`, `reversa-strategist`, `reversa-designer`, `reversa-screen-translator`, `reversa-inspector`). If the engine does not support activation by name directly, instruct reading `.agents/skills/<id>/SKILL.md` in the current context.
3. Wait for completion **or** an intra-agent checkpoint (see step 5b). If completion, validate the expected artifacts.
4. Update `.state.json`: move agent from `pendingAgents` → `completedAgents`, update `lastCheckpoint`, register artifacts with SHA-256 hash.
5. **Human pause** (see step 6) before proceeding, per the table below.

#### Step 5b: Intra-agent checkpoint

Some agents operate in phases with a human pause between them. Today, **Designer** and **Screen Translator** behave this way. Each declares its own phases in the "Phase detection on start" section of SKILL.md, and uses a `<artifact>Approved` field in `currentAgent` as the single source of truth for approval.

| Agent | Phase 1 (decide, pause) | Artifact | Approval field | Phase 2 (generate) |
|---|---|---|---|---|
| Designer | `topology` | `topology_decision.md` | `topologyApproved` | `architecture` (Designer Phase 2) |
| Screen Translator | `mode` | `screen_modernization_decision.md` | `screenModeApproved` | `generation` (target_screens, deviations, golden) |

Generic flow:

1. Agent runs Phase 1, writes the decision artifact, and returns control with signal `phase: <phase-1-name>, status: awaiting_user_approval`.
2. Orchestrator records `currentAgent.phase` and `currentAgent.status` in `.state.json`. **Does not** move the agent to `completedAgents`.
3. Orchestrator runs the human pause described in step 6 (corresponding row in the table).
4. After approval, orchestrator records `currentAgent.<artifact>Approved = true`. This is the single source of truth; **do not** duplicate in the artifact's front-matter.
5. Orchestrator **re-activates the same agent**. The agent detects that the artifact exists and is approved, and skips directly to Phase 2.
6. When Phase 2 finishes, the agent returns control with `status: complete` (or `skipped` if it's the Screen Translator's case in a legacy without UI). The orchestrator runs the corresponding pause in the table.
7. If the user requests adjustments in any of the two phases, orchestrator re-activates the agent explicitly pointing which phase should be redone:
   - Designer: `--regenerate-phase=topology` or `--regenerate-phase=architecture`.
   - Screen Translator: `--regenerate-phase=mode` or `--regenerate-phase=generation`.
   The agent respects and discards artifacts from that phase onward.

This mechanism is generic: new agents can adopt it by declaring their checkpoints in the "Phase detection on start" section of their own SKILL.md and adding a `<artifact>Approved` field to the `currentAgent` contract.

| After the agent | Pause for |
|---|---|
| Paradigm Advisor | Confirm paradigm and gap |
| Curator | Review HUMAN DECISION items |
| Strategist | Choose strategy |
| Designer (Phase 1) | Approve `topology_decision.md` (preserve / modernize / hybrid) before detailing architecture |
| Designer (Phase 2) | Approve architecture (if adjustments, Designer runs again) |
| Screen Translator (Phase 1) | Approve `screen_modernization_decision.md` (literal / modernized / hybrid). In hybrid mode, explicit screen lists per mode are mandatory. In legacy without UI, agent skips without pause. |
| Screen Translator (Phase 2) | Approve pending deviations in `screen_deviation_log.md` (if any) before proceeding to Inspector |
| Inspector | (no pause; proceeds to handoff) |

### Step 6: Human pause (`human_decision_gate`)

At each pause:

1. Present a clear summary of what the previous agent produced (3 to 8 lines).
2. List explicitly what needs a decision.
3. Await user response.

Behavior by engine:

- **Engines with interactive chat (Claude Code, Cursor, Codex, etc.)**: ask directly in chat and wait.
- **Engines without interactive TTY**: write `_reversa_sdd/migration/pending_decisions.md` with the open decisions, instruct the user to edit and signal completion; re-read the file after signaling.
- **`--auto` mode**: apply the defaults documented in `references/auto-defaults.md`. Mark each auto-applied decision in `ambiguity_log.md` for later review.

### Step 7: Consolidate `ambiguity_log.md`

After each agent, integrate ⚠️ items and pending items into `_reversa_sdd/migration/ambiguity_log.md`. At the end, organize in three groups:

- PENDING (there must be none after Inspector finishes)
- RESOLVED WITH HUMAN DECISION
- REFERRED TO CODING

### Step 8: Generate `handoff.md`

After Inspector finishes and `ambiguity_log` is consolidated:

1. Render `_reversa_sdd/migration/handoff.md` using the template in `references/templates/handoff.md`.
2. List all the artifacts produced.
3. **Highlight `paradigm_decision.md` and `topology_decision.md` as mandatory first reading** (paradigm decides the "how to think"; topology decides the "how to organize the tree").
4. List REFERRED TO CODING items in a dedicated section.
5. Add specific next steps for the coding agent (configure the new repository, implement bottom-up, validate parity, execute cutover).
6. In `--auto` mode: list auto-decided items for later review.

### Step 9: Final summary and logs

Present in chat:

> "Migration finished.
> - Agents executed: 6 (Screen Translator may have run in `skipped` mode if the legacy has no UI)
> - Artifacts created: <N>
> - Items in `ambiguity_log.md`: <N> pending (expected 0), <N> resolved, <N> referred to coding
> - Total time: <minutes>
>
> Next step: open `_reversa_sdd/migration/handoff.md` in the coding agent that will implement the new system."

Write a complete log in `_reversa_sdd/migration/.logs/<timestamp>-migrate.log` with timestamp per entry and agent identification. If the engine exposes token count or cost, record it; otherwise leave fields empty without invalidating the log.

## Special modes

### `--resume`

1. Read `.state.json`.
2. Identify `currentAgent.agent`, `currentAgent.phase`, and `currentAgent.status`.
3. If `currentAgent.status == "awaiting_user_approval"`, follow the special case from step 2 (re-executes the pending pause). Otherwise, confirm with the user before resuming.
4. Continue from the next agent (or from the same one if it was `failed`, or from the next phase if it was `awaiting_user_approval` and has been resolved).

### `--regenerate=<agent>`, `--regenerate=designer:<phase>`, or `--regenerate=screen_translator:<phase>`

1. Confirm with the user (destructive operation in the scope of `_reversa_sdd/migration/` and `_reversa_sdd/screens/`).
2. Make a backup in `_reversa_sdd/migration/.backup-<timestamp>/` and, if applicable to Screen Translator, in `_reversa_sdd/screens/.backup-<timestamp>/`.
3. Delete artifacts:
   - `--regenerate=<agent>`: artifacts of the specified agent **and all subsequent agents** in the pipeline order. For Designer, includes `topology_decision.md` and resets `currentAgent.topologyApproved = false`. For Screen Translator, includes `screen_modernization_decision.md`, `target_screens.md`, `screen_deviation_log.md`, `_reversa_sdd/screens/inventory.json` and `_reversa_sdd/screens/golden/`, and resets `currentAgent.screenModeApproved = false`.
   - `--regenerate=designer:topology`: deletes all Designer artifacts (including `topology_decision.md`) and resets `topologyApproved`. Equivalent to `--regenerate=designer` but explicit about going back to Phase 1.
   - `--regenerate=designer:architecture`: deletes only Designer Phase 2 artifacts (`target_architecture.md`, `target_domain_model.md`, `target_data_model.md`, `data_migration_plan.md`). Preserves `topology_decision.md` and `topologyApproved`.
   - `--regenerate=screen_translator:mode`: deletes all Screen Translator artifacts (including `screen_modernization_decision.md`) and resets `screenModeApproved`. Equivalent to `--regenerate=screen_translator` but explicit about going back to Phase 1.
   - `--regenerate=screen_translator:generation`: deletes only Phase 2 artifacts (`target_screens.md`, `screen_deviation_log.md`, `_reversa_sdd/screens/inventory.json`, `_reversa_sdd/screens/golden/`). Preserves `screen_modernization_decision.md` and `screenModeApproved`.
4. Update `.state.json` removing agents from `completedAgents` (when applicable) and adjusting `currentAgent`.
5. Re-activate the agent with the phase flag, if applicable.

### `--auto`

Applies defaults without human pauses. See `references/auto-defaults.md`.

Always display explicit warning before starting, listing all defaults to apply.

## Edge cases

- **Incomplete `_reversa_sdd/`**: list missing artifacts and abort.
- **Brief present but changes in the legacy system**: offer to review / recreate before proceeding.
- **Manual modification of a generated artifact** (hash in `.state.json` diverges): pause, show summarized diff and offer (a) preserve modified version and abort regeneration, (b) overwrite with backup, (c) abort pipeline. `--auto` adopts (a) by default.
- **LLM failure in the middle of an agent**: state preserved, agent marked as `failed`. `--resume` re-executes that agent.
- **Designer agent requested adjustments** after architecture review: re-run Designer at the same step, without advancing to Inspector.

## Output layout (cross-cutting)

This agent is part of the Migration Team and writes exclusively in `_reversa_sdd/migration/`. That folder is cross-cutting to the organization chosen in `[specs]` of `config.toml`, outside the unit folders (feature folders) of the Discovery Team. Do not apply the `<unit>/requirements.md|design.md|tasks.md` structure here; that belongs to the Writer.

## Absolute rules

- **Do not modify anything outside `_reversa_sdd/migration/`.**
- Pre-existing artifacts in `_reversa_sdd/` are **read**, never modified.
- Automatic backup before any destructive operation.
- Default mode is interactive. `--auto` is explicit and displays the defaults before applying.
- Each pause presents a summary + pending decisions; never proceeds silently.

## Output

```
_reversa_sdd/
├── migration/
│   ├── migration_brief.md
│   ├── paradigm_decision.md
│   ├── target_business_rules.md
│   ├── discard_log.md
│   ├── migration_strategy.md
│   ├── risk_register.md
│   ├── cutover_plan.md
│   ├── topology_decision.md
│   ├── target_architecture.md
│   ├── target_domain_model.md
│   ├── target_data_model.md
│   ├── data_migration_plan.md
│   ├── screen_modernization_decision.md
│   ├── target_screens.md
│   ├── screen_deviation_log.md
│   ├── parity_specs.md
│   ├── parity_tests/
│   │   ├── 01-<flow>.feature
│   │   └── ...
│   ├── ambiguity_log.md
│   ├── handoff.md
│   ├── pending_decisions.md   (transient, during pauses)
│   ├── .state.json
│   └── .logs/
│       └── <timestamp>-migrate.log
└── screens/
    ├── inventory.json
    └── golden/
        ├── manifest.yaml
        └── <screen>.<ext>      (optional, when the oracle runs)
```
