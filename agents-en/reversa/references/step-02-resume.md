# Step 2 — Session resume

## 0. In-progress migration check

First, read `.reversa/state.json` only to resolve `output_folder` (default `_reversa_sdd`).

Check whether `<output_folder>/migration/.state.json` exists. If it doesn't, skip this section and go to section 1.

If it exists, read the file and classify the migration state:

| Condition | State |
|----------|--------|
| `pendingAgents.length > 0` or `currentAgent.agent` different from `null` | in progress |
| `currentAgent.status == "awaiting_user_approval"` | intra-agent pause pending |
| `pendingAgents.length == 0`, `currentAgent.agent == null` and `<output_folder>/migration/handoff.md` exists | completed |

If the state is **completed**, skip this section (the migration is already finished, nothing to ask) and go to section 1.

If the state is **in progress** or **intra-agent pause pending**, present the question to the user before doing anything else:

> "[Name], I found a **migration in progress** in `<output_folder>/migration/`.
>
> - Completed: <N> of 6 agents (<completedAgents list>)
> - Pending: <pendingAgents list>
> - Current state: <currentAgent.agent or \"awaiting human approval\">
>
> How do you want to continue:
>
> 1. **Resume the migration**: returns to the Migration Team from where it stopped
> 2. **Resume the Reversa flow**: proceed with discovery/forward, ignore the migration for now
> 3. **Cancel**: end this session without changing anything
> 4. **Other**: describe what you want to do
>
> Use the engine's interactive menu mechanism (in Claude Code, `AskUserQuestion`); in engines without menu support, ask the user to type the number 1–4 or free text."

Wait for the response. DO NOT choose on your own.

- If **1**: end the `/reversa` here with the final instruction:
  > "To resume the migration, type `/reversa-migrate`. It detects the saved state and offers the resume options."
  
  Do NOT activate `reversa-migrate` automatically; let the user type (Reversa explicit handoff default).
- If **2**: proceed with section 1 of this step normally.
- If **3**: end without doing anything.
- If **4** (free text): interpret the user's intent and offer the best possible route, without inventing new flows. If the intent is ambiguous, ask once more before deciding.

## 1. Reading the state

Read `.reversa/state.json` and `.reversa/plan.md`.

## 2. Version check

Compare `.reversa/version` with the npm registry. If there is a newer version, mention it discreetly:
> "💡 New version available. Run `npx reversa update` whenever you want to update."

## 3. Greeting

Say: "[Name], welcome back to Reversa! 🎼"

## 4. Progress summary

Show:
- ✅ Completed phases (`completed` field of state.json)
- 🔄 Current phase (`phase` field) with the last task recorded in `checkpoints`
- ⏳ Next phases (`pending` field)

Example:
> "Current progress:
> ✅ Recognition completed
> 🔄 Excavation in progress — `auth` and `orders` modules analyzed, `payments` and `users` pending
> ⏳ Interpretation, Generation, Review"

## 5. Gap response mode

If `answer_mode` is `"file"`:
> "Remember: your answers to the questions must be filled in `_reversa_sdd/questions.md`. Let me know when you are done."

If `answer_mode` is `"chat"` (default):
> "Continue normally — I will ask the questions here in chat."

## 6. Confirmation

Ask only: "Do we continue from where we stopped? (CONTINUE to proceed)"

After confirmation, resume the next pending task in the plan (`.reversa/plan.md`).

**🚫 Do not offer `/clear` + `/reversa` at this point.** The user has just resumed the session; asking to clear and reopen now is redundant. The between-steps pause prompt (described in `SKILL.md`, section "Preventive checkpoint between steps") only applies **after** an agent finishes work within this session, never in the resume greeting itself.

Consult `references/checkpoint-guide.md` for the rules on writing to state.json.
