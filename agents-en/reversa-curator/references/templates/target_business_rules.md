---
schemaVersion: 1
generatedAt: <ISO-8601>
reversa:
  version: "x.y.z"
kind: target_business_rules
producedBy: curator
hash: "sha256:<hash of the body below the front-matter>"
---

# Target Business Rules

> Catalog of the legacy business rules with the migration decision: MIGRATE, DISCARD or HUMAN DECISION.
> Each item traces to the source in `_reversa_sdd/` and respects `paradigm_decision.md`.

## Summary
- Total rules analyzed: <N>
- MIGRATE: <n>
- DISCARD: <n> (detail in `discard_log.md`)
- HUMAN DECISION: <n>

## MIGRATE rules

### BR-MIGRAR-001
- **Source**: `_reversa_sdd/<unit>/{requirements,design}.md` § <section>
- **Original confidence**: 🟢 | 🟡 | 🔴 | ⚠️
- **Description**: <rule>
- **Migration justification**: <why it migrates>
- **Compatibility with target paradigm**: <note; e.g. will need to be expressed as event>

<repeat per rule>

## DISCARD rules (summary)

| ID | Source | Short reason | Paradigm-linked? |
|---|---|---|---|
| BR-DESCARTAR-001 | <ref> | <reason> | yes/no |

> Full detail in `discard_log.md`.

## HUMAN DECISION rules

### BR-HUMANA-001
- **Source**: <ref>
- **Ambiguity type**: ⚠️ AMBIGUOUS | 🔴 GAP | stakeholder dependency
- **Description**: <rule>
- **Options**: <clear options>
- **Curator recommendation**: <suggested option and why>
- **Status**: PENDING | RESOLVED (choice + decision-maker + date)

<repeat per item>

## Notes
<General observations from the Curator. Items that will be consolidated in `ambiguity_log.md`.>
