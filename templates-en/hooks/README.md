# Reversa Hooks

## check-legacy-policy.mjs (Claude Code, optional)

Hard enforcement of the legacy edit policy (`.reversa/reversa-config.json`). Without it, the policy holds as an instruction-level guardrail, which is the common denominator among engines (Cursor, Codex, Gemini CLI, etc.). With it, Claude Code blocks `Write`/`Edit` outside the allowed paths BEFORE the tool executes, including in permissive execution modes.

What the hook blocks:

- Any write outside Reversa's own folders when `allowLegacyEdits` is `false`, or when the config is missing or invalid (fail-safe).
- Writes to a path that matches no glob in `allowedPaths` when `allowLegacyEdits` is `true`.
- Any agent write to `.reversa/reversa-config.json`: the config only changes by the user's hand.

Reversa's own folders remain always writable, regardless of the policy.

### Installation (manual step)

Add to the project's `.claude/settings.json` (create the file if it does not exist, or merge with the current content):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node .reversa/hooks/check-legacy-policy.mjs"
          }
        ]
      }
    ]
  }
}
```

Requirement: Node.js 18+ available on the PATH (the same requirement as the Reversa installer).

### Removal

Remove the block above from `.claude/settings.json`. The file `.reversa/hooks/check-legacy-policy.mjs` can stay; it only acts when referenced by the settings.