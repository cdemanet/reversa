# Step 1 — First run

## 1. Reading the initial state

Read `.reversa/state.json`.

If `user_name` is already filled in (CLI installation), skip the **3. Information collection** section and go straight to **4. Personalized greeting**.

## 2. Version check

Compare `.reversa/version` with the npm registry. If there is a newer version, mention it discreetly:
> "💡 New version available. Run `npx reversa update` whenever you want to update."

## 3. Information collection (only if state.json is empty)

If `user_name` is blank, ask one at a time:

- "What is your name?"
- "In which language do you prefer the agents to communicate with you? (e.g. en, en-US)"
- "In which language should the specifications be generated? (e.g. English, Portuguese)"
- "What is the name of this project?"

Save the answers in `.reversa/state.json` in the `user_name`, `chat_language`, `doc_language` and `project` fields.
Consult `references/state-schema.md` for the complete schema.

## 4. Personalized greeting

With `user_name` and `project` in hand (either from state.json or just collected), say:

> "Hello, [Name]! I'm Reversa
>
> I will coordinate the complete analysis of **[project name]** and generate executable specifications — ready for use by AI agents.
>
> I will work in stages, saving progress at each phase. If the session is interrupted, just type `reversa` again to continue from where we stopped."

## 5. Exploration plan

Check whether `.reversa/plan.md` already exists:

**If the file already exists** (created by the installer):
- Read the file
- Present a plan summary to the user
- Ask: "Is the plan approved or do you want to adjust something before starting?"

**If the file does not exist** (manual installation):
1. Analyze the root folder structure quickly (exclude: `node_modules`, `.git`, `.reversa`, `_reversa_sdd`, `dist`, `build`, `coverage`, `__pycache__`)
2. Identify the main modules and components
3. Create `.reversa/plan.md` with tasks structured by phase (use the default plan template, adapting phase 2 with the actual modules identified)
4. Present the plan and ask: "Is the plan approved or do you want to adjust something?"

## 6. State update

After plan approval, update `.reversa/state.json`:
- `phase`: `"recognition"`
- Save any information collected in this step that is not yet in the file

Consult `references/checkpoint-guide.md` for the rules on writing to state.json.

## 7. Start

Ask: "[Name], shall we start with the **Scout** — project mapping?"

After confirmation, activate the `reversa-scout` skill.
