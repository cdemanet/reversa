# Schema — .reversa/state.json

This file persists the complete state of the analysis between sessions. Reversa reads and writes this file.

## Complete structure

```json
{
  "version": "1.0.0",
  "project": "project-name",
  "user_name": "User Name",
  "chat_language": "en",
  "doc_language": "English",
  "answer_mode": "chat",
  "doc_level": null,
  "output_folder": "_reversa_sdd",
  "phase": "recognition",
  "completed": ["recognition"],
  "pending": ["excavation", "interpretation", "generation", "review"],
  "engines": ["claude-code"],
  "agents": ["reversa", "reversa-scout", "reversa-archaeologist"],
  "checkpoints": {
    "scout": {
      "completed_at": "2026-04-26T10:00:00Z",
      "files": [
        "_reversa_sdd/inventory.md",
        "_reversa_sdd/dependencies.md",
        ".reversa/context/surface.json"
      ]
    },
    "archaeologist": {
      "completed_at": "2026-04-26T11:00:00Z",
      "modules_analyzed": ["auth", "orders", "payments"],
      "files": [
        "_reversa_sdd/code-analysis.md",
        "_reversa_sdd/data-dictionary.md",
        ".reversa/context/modules.json"
      ]
    }
  },
  "created_files": [
    "CLAUDE.md",
    ".agents/skills/reversa/SKILL.md",
    ".reversa/state.json",
    ".reversa/plan.md"
  ]
}
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Installed Reversa version |
| `project` | string | Legacy project name |
| `user_name` | string | User name (for interactions) |
| `chat_language` | string | Interaction language (e.g. en, en-US) |
| `doc_language` | string | Language of generated specs (e.g. English, Portuguese) |
| `answer_mode` | string | How the user answers gaps: `chat` or `file` |
| `doc_level` | string \| null | Volume of generated documentation: `essential`, `complete` or `detailed`. Starts `null` — required to fill via the user's choice after the Scout. |
| `output_folder` | string | Specs output folder (default: `_reversa_sdd`) |
| `phase` | string \| null | Current phase. `null` = not started |
| `completed` | string[] | Completed phases |
| `pending` | string[] | Pending phases |
| `checkpoints` | object | Completion log of each agent |
| `engines` | string[] | Configured engines (e.g. `["claude-code", "codex"]`) |
| `agents` | string[] | Installed agents |
| `created_files` | string[] | All files created by Reversa (for safe uninstall) |

## Valid phases

`recognition` → `excavation` → `interpretation` → `generation` → `review`

## Rule when writing

Never remove existing fields. Only add or update.

## Where NOT to write

The specs organization decision (granularity, custom folders, original Scout suggestion, choice timestamp) **does not** go in `state.json`. It is persisted in `.reversa/config.toml`, `[specs]` section, as described in `references/step-03-specs-organization.md`. `state.json` is runtime state; `config.toml` is the long-term decision.
