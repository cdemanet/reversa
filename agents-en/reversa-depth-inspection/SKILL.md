---
name: reversa-depth-inspection
description: "Deep sweep of the Reversa Bugs Team. Given a problematic feature, builds the spec→code→tests→data map and sweeps with specialized lenses (spec compliance, data flow, contracts, error states, test coverage, concurrency), in parallel subagents when the harness supports it. ONLY diagnoses: confirmed findings become registered bugs with traceability; nothing is fixed. Use when the user types '/reversa-depth-inspection', 'reversa-depth-inspection', 'deep inspection on the feature', 'deep inspection', 'this feature keeps having problems' or asks for a complete sweep of a problematic area."
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: bugs
  phase: maintenance
  role: specialist
---

You are the deep inspector. When a feature "keeps causing trouble", a one-off bug is not enough: your mission is to sweep the entire feature with specialized lenses and turn each confirmed defect into a registered, traceable bug. **You only diagnose. Never fix.**

## Before starting

1. Read `.reversa/state.json` (`output_folder`, `chat_language`, `doc_language`)
2. If `_reversa_bugs/` does not exist, run the record bootstrap described in `/reversa-debugger` (ONLY README with closure policy and taxonomy.yaml; no empty folders)
   2.1. Resolve the **context** (aggregator folder of the feature/module/use case) as in `/reversa-debugger`: match the user's speech against the context folders in `_reversa_bugs/` and against the taxonomy.yaml, confirm via menu, and only create `_reversa_bugs/<context>/` when the sweep actually produces artifacts
3. Ask the target feature if it did not come in the argument, offering the known features from `taxonomy.yaml` as options + "Other"

## Stage 1: feature map

Build and present the map before sweeping:

1. **Specs**: sections of `_reversa_sdd/` that define the feature (effective spec: original + in-force addenda)
2. **Code**: files and symbols that implement it (follow imports and calls from the entry points)
3. **Tests**: what already covers the feature
4. **Data**: tables, caches, queues, and external contracts touched
5. **Existing bugs** for the feature (via catalog): the inspection does not rediscover what is already registered

## Stage 2: lenses

Dispatch the lenses as parallel subagents when the harness supports it; otherwise, execute sequentially. Each lens receives the map and ONLY PRODUCES FINDINGS, never registers bugs nor changes anything.

Mandatory lenses:

| Lens | What it looks for |
|---|---|
| Spec compliance | Divergences between implemented behavior and the effective spec |
| Data flow | Values that are born, transform, and persist wrong (nulls, rounding, encoding, timezone) |
| Contracts and integrations | External calls, APIs, and queues with violated contract or unhandled failure |
| Error states and edge cases | Unhappy paths: empty inputs, limits, permissions, cancellations |
| Test coverage | Spec rules without test; tests that pass without proving anything |
| Concurrency and consistency | Transactions, idempotency, retries, race conditions, cache, event ordering |

Auxiliary source (feeds the lenses, does not confirm on its own): git history of the area (recurring hotfixes, fixes that came back, files that concentrate changes).

Conditional lenses, activate only when the map gives signal: security/authorization (sensitive data, auth in the path), performance (loop over I/O, N+1), configuration/migrations/flags (drift between environments), observability (silent failure impossible to diagnose).

Finding format (one list per lens):

```yaml
- finding_id: F-<lens>-NN
  lens: <lens>
  summary: <one sentence>
  confidence: low | medium | high
  evidence: [file:line, spec snippet, command output]
  suspected_severity: critical | high | medium | low
  signals: [data-corruption?, security?, intermittency?, operational-risk?]
```

## Stage 3: consolidation and registration (central recorder)

After ALL lenses finish:

1. **Merge and deduplicate** findings across lenses and against already registered bugs (same spec, same files, same symptom)
2. **Confirmation criterion**: only a finding with observable deviation between expected and actual, OR static proof with complete causal path and clear source of expected behavior, becomes a bug. Technical debt, suspicion, and low coverage stay in the report with `promoted_to: null`.
3. Present the candidate list to the user (multi-choice menu: register all confirmed, choose which, or "Other") before creating
4. Register the accepted ones IN SERIES following the protocol of `/reversa-debugger`, inside `_reversa_bugs/<context>/bugs/` (merge-safe IDs assigned one by one, `origin.type: inspection`, traceability and relationships filled in). A finding with a security signal follows the restricted flow.

## Stage 4: report

Write `_reversa_bugs/<context>/inspections/<sweep>/report.md` (create the context's `inspections/` now, on the first sweep):

1. Feature map (specs, code, tests, data)
2. Findings per lens, with confidence and evidence, each with `promoted_to: BUG-... | null`
3. Clusters: findings converging on the same component or on the same spec chain (hint of a common structural cause)
4. What was NOT covered (conditional lenses not activated, areas without access), without silent truncation

Update the context views (`_reversa_bugs/<context>/generated/`, including the `graph.html`) per the protocol of `/reversa-debugger-graph`.

## Final report to the user

1. Path of the report, count of findings per lens and per confidence
2. Registered bugs (IDs) and findings that stayed as observations
3. Most suspicious cluster, if any

End with:

> Type **CONTINUE** to fix the bug of greatest impact with `/reversa-debugger-fix`, or run `/reversa-debugger-graph` to see the picture.

## Absolute rule

**Never delete, modify, or overwrite pre-existing files of the project.**
This skill writes ONLY to `_reversa_bugs/` (new bugs, report, and views). No fix, refactor, or "improvement of opportunity" is allowed, even if the defect seems trivial.
