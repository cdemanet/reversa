# Sizing formula (sizing-formula.md)

**Formula version:** 2.0
**size.json schema version:** 1.1

Documents the deterministic calculation that the `reversa-pricing-size` agent applies to transform the forward cycle artifacts into a complexity class (`S/M/L/XL/XXL`). The v2 formula abandons the linear sum of arbitrary weights and uses T-shirt sizing based on tasks, with a separate risk adjustment.

## Source and criterion

Reversa v1 needs a comprehensible measure for the lay user, multi-engine, and derived from files already produced in `_reversa_sdd/forward/<feature>/`.

Function Points (IFPUG, ISO/IEC 20926) and COSMIC (ISO/IEC 19761) are formal functional measurement standards, but require specialized classification. For the Reversa UX, the best basis is approximate agile estimation, inspired by Story Points and T-shirt sizing. Mike Cohn, in *Agile Estimating and Planning* (Addison-Wesley, 2005), describes relative estimation and approximate sizes as agile planning practices.

This formula does not claim that the ranges are universal standards. It documents a simple Reversa heuristic, based on T-shirt sizing, and keeps risk factors separate to avoid false precision.

## Inputs

The inputs continue to come from `metrics`:

- `tasks.total`
- `doubts.high`, `doubts.medium`, `doubts.low`, `doubts.total`
- `plan_depth`
- `principles_touched`
- `requirements.total`, used only as a consistency alert, not as the primary driver

## Step 1: base class by number of tasks

`tasks.total` is the best size proxy because the forward cycle has already broken the feature into work units.

```
if tasks.total <= 0:       base_complexity_class = "S"
elif tasks.total <= 3:     base_complexity_class = "S"
elif tasks.total <= 7:     base_complexity_class = "M"
elif tasks.total <= 15:    base_complexity_class = "L"
elif tasks.total <= 30:    base_complexity_class = "XL"
else:                      base_complexity_class = "XXL"
```

## Step 2: risk points

Risk is not size. It adjusts the class upward when the feature has uncertainty, depth, or transversal impact.

```
unclassified_doubts =
  max(0, doubts.total - doubts.high - doubts.medium - doubts.low)

risk_points =
  doubts.high * 2 +
  doubts.medium * 1 +
  unclassified_doubts * 1 +
  max(0, plan_depth - 3) +
  floor(len(principles_touched) / 3)
```

`doubts.low` does not raise risk in v2. Low doubt is expected noise from refinement.

## Step 3: risk adjustment

```
if risk_points <= 2:       risk_adjustment_classes = 0
elif risk_points <= 5:     risk_adjustment_classes = 1
else:                      risk_adjustment_classes = 2
```

## Step 4: final class

Classes are ordered like this:

```
S=0, M=1, L=2, XL=3, XXL=4
```

```
complexity_class =
  class_from_index(min(4, index(base_complexity_class) + risk_adjustment_classes))
```

## Step 5: auxiliary size_score

`size_score` stays only for compatibility and quick reading. It should no longer directly drive hours.

```
size_score_by_class:
  S:   15
  M:   35
  L:   60
  XL:  80
  XXL: 95
```

## Recommended fields in size.json

The agent must write these fields in addition to the old ones:

```
sizing_method = "task_tshirt_with_risk_adjustment"
base_complexity_class = <class before risk>
risk_points = <integer>
risk_adjustment_classes = <0, 1 or 2>
size_score = <auxiliary midpoint of the final class>
```

## Calculation examples

### Example 1: small feature (S)

```
tasks.total = 3
doubts.high = 0
doubts.medium = 0
doubts.low = 0
doubts.total = 0
plan_depth = 2
principles_touched = []

base_complexity_class = S
risk_points = 0
risk_adjustment_classes = 0
complexity_class = S
size_score = 15
```

### Example 2: medium feature that goes up to L by risk

```
tasks.total = 7
doubts.total = 3 (high=1, medium=2, low=0)
plan_depth = 3
principles_touched = ["non_destructive", "multi_engine", "handoff_pattern"]

base_complexity_class = M
risk_points = 1*2 + 2*1 + 0 + 0 + floor(3/3) = 5
risk_adjustment_classes = 1
complexity_class = L
size_score = 60
```

### Example 3: large feature (XL)

```
tasks.total = 12
doubts.total = 1 (high=0, medium=1, low=0)
plan_depth = 4
principles_touched = 2

base_complexity_class = L
risk_points = 0 + 1 + 0 + 1 + 0 = 2
risk_adjustment_classes = 0
complexity_class = L
size_score = 60
```

### Example 4: huge feature (XXL)

```
tasks.total = 31
doubts.total = 6 (high=2, medium=3, low=1)
plan_depth = 6
principles_touched = 8

base_complexity_class = XXL
risk_points = 2*2 + 3*1 + 0 + 3 + floor(8/3) = 12
risk_adjustment_classes = 2
complexity_class = XXL
size_score = 95
```

## Consistency alerts

Requirements do not enter the primary calculation, but can generate a note:

```
if requirements.total >= 12 and tasks.total <= 3:
  notes += "Many requirements for few tasks. Verify if tasks.md is granular enough."
```

## Limits and premises

1. The formula measures structural size before coding, therefore does not use LOC
2. Tokens are not counted
3. `size_score` is auxiliary, should not be converted directly to hours
4. XXL must generate a strong scope-splitting recommendation before pricing or coding
5. If changing the class limit, bump in `formula_version`
