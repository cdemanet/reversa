# `handoff.md` checklist

Before closing the pipeline, the orchestrator validates that `handoff.md` meets all items.

## Mandatory checklist

- [ ] `paradigm_decision.md` appears as the **first item** of the "Mandatory reading" section and of the "Recommended reading order".
- [ ] `topology_decision.md` appears as the **second item** of the "Mandatory reading" section.
- [ ] `screen_modernization_decision.md` appears as the **third item** when there is UI; in legacy without UI (Screen Translator skipped), the entry is omitted with the explicit note "Screen Translator skipped, legacy without UI".
- [ ] List of produced artifacts is complete and reflects the real `_reversa_sdd/migration/` and `_reversa_sdd/screens/`.
- [ ] Pending deviations in `screen_deviation_log.md` appear as blockers; approved deviations are reflected in `parity_specs.md § Exceptions`.
- [ ] REFERRED TO CODING items from `ambiguity_log.md` appear in a dedicated section of `handoff.md`.
- [ ] Listed blockers or the line "no blockers, proceed".
- [ ] Next steps for the coding agent are specific and actionable (not generic).
- [ ] In `--auto`: explicitly listed auto-decided items.
- [ ] Style consistent with the installed engine (adapted format, e.g.: compatible front-matter).

## Minimum structure

1. Banner for mandatory reading of `paradigm_decision.md`, `topology_decision.md` and (when there is UI) `screen_modernization_decision.md`.
2. Recommended reading order.
3. List of artifacts.
4. Blockers.
5. Next steps for the coding agent.
6. Auto-decided items (only if `--auto`).
7. Final notes.

## Strong signaling to the coding agent

The first sentence of `handoff.md` must convey immediate clarity. Suggested pattern:

> "New system to be built in <X> paradigm, <Y> topology, screens in <Z> mode. Before any line of code, read `paradigm_decision.md`, `topology_decision.md` and `screen_modernization_decision.md`."

In legacy without UI (Screen Translator skipped), replace the screens segment with: "screens: none (system without UI)".
