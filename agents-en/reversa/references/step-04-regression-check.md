# Step 4, semantic regression check

> This step only runs on **re-extractions**, that is, when a reverse pipeline is executed on a project that has already gone through at least one `/reversa-coding` cycle. In projects without `_reversa_forward/` or without `regression-watch.md`, this step is silently skipped.

## Why it exists

Reversa is not just one-shot extraction. Every `/reversa-coding` leaves in `_reversa_forward/<feature>/regression-watch.md` a list of rules that must remain true in the next extraction. The reverse pipeline, when re-run, has the duty to check these rules against the current code and report regressions. This is Reversa's competitive edge over forward-only frameworks.

## When to run

After the **last agent in the plan** finishes, before the final "extraction completed" message. The trigger is position (last item of `.reversa/plan.md`), not agent name, because the last agent varies according to the optional items selected at install (Reviewer may be absent, for example). Run the checks in order:

1. Check whether `_reversa_forward/` exists in the project root. If it doesn't, end this step silently.
2. List all subfolders of `_reversa_forward/` that contain `regression-watch.md`.
3. If the list is empty, end.
4. Otherwise, proceed with the procedure below, one feature at a time.

## Procedure per feature

For each `_reversa_forward/<feature>/regression-watch.md`:

1. Load the file. Identify the main watch-items table (columns `ID | Source | Expected rule after change | Verification type | Violation signal`).
2. For each watch item of the main table (not the archived ones):
   2.1. Identify the `Verification type`, possible values: `presence`, `absence`, `wording`, `confidence`.
   2.2. Apply the corresponding verification against the newly generated artifacts in `_reversa_sdd/`:
        - `presence`: the rule must be present in `_reversa_sdd/domain.md` (or in the file pointed to by the Source column) with the same semantic essence.
        - `absence`: the original rule MUST NOT appear in the SDD anymore.
        - `wording`: the text was deliberately changed; check whether the new version matches the expectation.
        - `confidence`: the rule is still present, but the confidence (🟢, 🟡, 🔴) must be equal to or higher than expected.
   2.3. Assign a verdict:
        - 🟢 **green**, the expectation matched fully.
        - 🟡 **yellow**, there is semantic equivalence but the text differs, or the evidence is partial. Default verdict when there is ambiguity. Awaits human judgment.
        - 🔴 **red**, the expectation did NOT match. The previously confirmed rule became a broken rule.
3. After evaluating all watch items, update the `## Re-extraction history` section of the same `regression-watch.md` adding a dated block:

```
### Re-extraction YYYY-MM-DD HH:MM

| ID | Verdict | Note |
|----|----------|------------|
| W001 | 🟢 green | rule preserved in _reversa_sdd/domain.md#rule-X |
| W005 | 🔴 red | rule removed from current code; unintended change |
| W010 | 🟡 yellow | equivalent text but differs literally; awaiting judgment |
```

4. Do NOT change the main watch-items table. Do NOT recycle IDs. Do NOT move watch items to "Archived" automatically.

5. For each watch item with three consecutive green verdicts in the history, and provided `setup.json#watch.archive-after` allows, move the item from the main table to the `## Archived` section at the end of the file. Keep the original ID.

## Write policy

- Atomic write (tempfile plus rename) in `regression-watch.md`.
- Never rewrite or delete entries in the re-extraction history.
- The new re-extraction block always goes at the top of the `## Re-extraction history` section (descending order).

## User report

After going through all features, present:

1. Total features verified
2. Total watch items verified
3. Breakdown by verdict: greens, yellows, reds
4. Detailed list of the reds (ID, feature, rule, reason for divergence)
5. Detailed list of the yellows that asked for human judgment

If there is at least one red, present a highlighted warning:

> 🔴 **Attention**, **N semantic regressions** were detected in previously coded features. Review before continuing.

If `setup.json#watch.block-on-red` is `true`, suggest the user **not** to proceed with new `/reversa-requirements` until each red is triaged. Reversa only alerts, never automatically blocks the user's flow.

## Special case, without `_reversa_sdd/`

If during the procedure `_reversa_sdd/` does not have the expected files (because the re-extraction was partial or the documentation level was reduced), record a 🟡 yellow verdict with note `missing evidence, _reversa_sdd/<file> was not generated in this extraction` and move on.

## Known gap

Semantic equivalence between expected rule and extracted rule is a subjective assessment. When in doubt, prefer the yellow verdict. The red verdict should be reserved for cases where the rule simply disappeared or was explicitly contradicted.
