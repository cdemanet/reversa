---
name: reversa-principles
description: Creates or updates the project's enduring principles and propagates adjustment suggestions to dependent templates. Principles are rare, change little, and influence all artifacts. Use when the user types "/reversa-principles", "reversa-principles", "definir principios" or asks to create/change/retire a project principle. Can run even before the first feature.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: forward
  stage: principles
---

You are the guardian of principles. This skill deals with lasting project rules, separate from each feature's specific requirements. Principles change little and influence all other artifacts.

This skill is rare, typically less than once a month. It is NOT part of the `requirements`, `plan`, `to-do`, `coding` pipeline. It can run alone, even before the first feature.

## Before starting

1. Read `.reversa/state.json` to resolve `output_folder` and `forward_folder`
2. Use the real values where the text mentions `_reversa_sdd/` or `_reversa_forward/`

## Initial checks

1. Try to read `.reversa/principles.md`
   1.1. If absent, mode is `create`
   1.2. If present, mode is `update`
2. Apply `before-principles` in the default way

## Create mode

1. Load `.reversa/templates/principles-template.md`
2. Ask the user for candidate principles, in batch or one at a time
3. For each principle:
   3.1. Assign sequential Roman numbering (I, II, III, ...)
   3.2. Ask for a short title, description, and a concrete application example
   3.3. Record creation date
4. List, in the "Impact" section, which templates will be affected when the principle changes (always `requirements-template.md`, `roadmap-template.md`, and potentially `actions-template.md`)
5. Start the "Change History" section with the initial entry

## Update mode

1. Present to the user the current list of numbered principles
2. Ask which operation they want:
   2.1. Add new (continues in the next Roman numbering, never recycles)
   2.2. Change text of an existing (keeps numbering, records change in history)
   2.3. Retire one (DOES NOT delete, marks as `retired on YYYY-MM-DD` and moves to the end of the document)
3. After the operation:
   3.1. Update the "Impact" section if necessary
   3.2. Add entry to "Change History"

## Impact propagation

1. For each template listed in the "Impact" section:
   1.1. Read the template in `.reversa/templates/<name>`
   1.2. Verify if the template needs a new placeholder or section to reflect the principle
   1.3. NEVER rewrite the whole template automatically, generate only an impact report in `.reversa/principles-impact-YYYYMMDD.md`
2. The report lists, per template, textual adjustment suggestions
3. Applying these suggestions is a human decision, this skill only suggests

## Persistence

- Write `.reversa/principles.md` with atomic write
- Write the impact report in `.reversa/principles-impact-YYYYMMDD.md`
- Never overwrite old impact reports, each execution creates a dated file

## Post-execution hooks

Apply `after-principles` in the default way.

## Final report to the user

1. Absolute path of `principles.md`
2. List of active principles, with numbering and short title
3. List of retired principles, if any
4. Path of the generated impact report
5. Warning: new or changed principles only take effect in features started after this date

End with:

> Type **CONTINUE** to proceed with the next action you want.
