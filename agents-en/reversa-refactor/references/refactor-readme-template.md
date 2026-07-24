# Code Quality Record (Reversa Refactor)

> GENERATED / MANAGED by the Reversa Code Quality team. This README holds the policies of the record.
> The context folders and transformation artifacts are born on demand.

## Policies

- `control_mode`: gated
  - `gated` (default): reading, analysis, measurement, and behavior proof flow without approval. EVERY step that touches the project code goes through a gate with an approved diff.
  - `supervised`: the agent may apply low-risk transformations that are already proven, with notice; high risk still requires a gate.
  - `autonomous`: automatically applies what is 🟢 and proven. Even here, mandatory gates apply: removing code, altering the effective spec, sending material to an external harness, destructive operation.
- `safety_net_policy`: require-characterization
  - `require-characterization` (default): a transformation that changes structure or logic requires a safety net (existing tests + characterization) green before and after.
  - `allow-unproven`: allows a transformation without a net, always downgraded to 🔴 and marked as without mechanical proof in the record.

## Record invariant

No transformation changes observable behavior. What does not prove preservation stops at the gate. Every applied transformation is reversible by the stored diff.

## Structure

```
_reversa_refactor/
  README.md                         (this file)
  <context>/                        (feature, module, or use case)
    opportunities/                  (detected opportunities, one per file)
    transformations/
      OPP-<date>-<suffix>-<slug>/
        plan.html                   (visual report of the plan, before touching any file)
        safety-net/                 (characterization tests + green/red result)
        before-after/               (evidence: measurement, equivalence proof, death proof)
        CHG-NNN.diff                (applied diffs, source of reversal)
        transformation.md           (record per opportunity-schema.md)
    generated/                      (regenerable index and catalog, never hand-edited)
```
