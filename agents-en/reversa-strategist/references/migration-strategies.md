> Local copy of the consultive catalog. Canonical source at `templates/migration/catalogs/migration_strategies.md`.

# Migration Strategies (local copy)

## Strategies

### Strangler Fig
- **When it applies**: system in production, cannot stop; need for incrementality; routing possibility (proxy / API gateway).
- **Cost**: medium. **Risk**: low. **Time**: long.
- **Favored appetite**: conservative, balanced.

### Big Bang
- **When it applies**: small system; tolerated window; transformational appetite; few live integrations.
- **Cost**: low. **Risk**: high. **Time**: short.
- **Favored appetite**: transformational (in small systems).

### Parallel Run
- **When it applies**: critical logic (financial / fiscal / regulatory); needs equivalence proof for a long period.
- **Cost**: high. **Risk**: medium. **Time**: medium.
- **Favored appetite**: balanced.

### Branch by Abstraction
- **When it applies**: internal migration (language or framework change, domain stays); conservative appetite.
- **Cost**: low. **Risk**: low. **Time**: medium.
- **Favored appetite**: conservative.

## Recommendation rules

- `conservative` appetite → Branch by Abstraction + Strangler Fig.
- `balanced` appetite → Strangler Fig + Parallel Run.
- `transformational` appetite → Big Bang in small systems; Strangler Fig with deep edges in larger ones.
- Large paradigm change + transformational appetite → recommend Parallel Run to validate parity.
- System with regulatory integrations → never recommend Big Bang.

## Pseudo-procedure

1. Filter applicable strategies based on the brief.
2. Score the remaining ones by adherence to appetite and paradigm gap.
3. Select 2 to 3 candidates.
4. Mark one as recommended with justification.
5. For each other, list cons as reason for non-recommendation.
