# Methodology Guide — Spec-Driven Development

## What is SDD?

Spec-Driven Development is the practice of writing a detailed specification of behavior **before** writing any code. The spec answers the **what** the system should do — not the **how** to implement.

Do not confuse with:
- **TDD** (Test-Driven Development): writes tests before code — complementary to SDD
- **DDD** (Domain-Driven Design): architectural pattern — independent of SDD
- **BDD** (Behavior-Driven Development): focus on behaviors with Gherkin — a subset of SDD

---

## Fundamental Principles

### 1. Behavior, not Implementation

The spec describes the observable behavior, not the internal implementation.

❌ Bad: "The system must use Redis for session cache"
✅ Good: "The system must keep the user session active for 30 days on devices where they checked 'remember me'"

Implementation (Redis, JWT, database) is a technical decision of who implements — not the spec's.

### 2. Ambiguity = Future Bug

Every ambiguity in the spec becomes a bug, an alignment meeting, or a PR discussion in the future. Make ambiguities explicit with `⚠️ OPEN:` — better an open visible item than a silent assumption.

### 3. Non-Goals are as important as Goals

"What we will not do" prevents scope creep, aligns expectations, and accelerates decisions. A feature without non-goals tends to grow indefinitely.

### 4. The Spec is a Living Contract

The spec changes as understanding evolves — and that is healthy. What matters is that changes are recorded (Decision Log) and that all stakeholders are aligned with the current version.

### 5. LLM-Readiness

A good modern spec must be readable by LLMs that will help implement. This means:
- Numbered requirements (trackable IDs)
- Explicit behaviors, not implicit
- Documented edge cases (LLMs do not guess extreme cases)
- Included business context (the "why" helps make good implementation decisions)

---

## The SDD Cycle

```
Idea/Problem
      ↓
  Interview  ←──────────────────────┐
      ↓                              │
  Spec Draft                        │
      ↓                              │
  Evaluation (Score)                 │
      ↓                              │
  Score < 80? ──── Yes ──── Identify gaps
      ↓ No
  Approved Spec
      ↓
  Implementation
      ↓
  Spec vs. Code (final validation)
```

---

## When to Write the Spec

| Feature size | Recommendation |
|-------------------|--------------|
| Bug fix | No spec needed |
| Small improvement (< 1 dev day) | Minimum spec: goals + main requirements |
| New feature (1–5 days) | Complete but concise spec |
| Complex feature (> 5 days) | Complete spec + review by 2+ people |
| New system | Architecture spec + specs per feature |

---

## Requirement Priorities (MoSCoW)

| Priority | Meaning | Decision if it does not fit the deadline |
|-----------|-------------|-------------------------------|
| **Must** | Mandatory — without it does not launch | Blocks launch |
| **Should** | Important — but there is a workaround | Postpones to next version |
| **Could** | Nice-to-have | Discard if necessary |
| **Won't** | Consciously out of scope | Document as Non-Goal |

---

## Common Antipatterns

### "Spec like a big-corp PRD"
50-page specs that nobody reads. Prefer concise specs that cover the essential with clarity.

### "Spec as a list of technical tasks"
"Create users table, add POST /auth endpoint, integrate with OAuth..." — this is an implementation plan, not a spec. The spec talks about behavior.

### "Verbal spec / in Slack"
Decisions made in conversation without record get lost and cause conflicts. Every spec must exist as a written document.

### "Spec that never changes"
Frozen specs that do not reflect the reality of what was implemented. The spec must be updated when the implementation intentionally diverges.

### "Silent Open Questions"
Assuming answers to unanswered questions. Always use `⚠️ OPEN:` and resolve before implementing.

---

## SDD Vocabulary

| Term | Definition |
|-------|------------|
| **Spec** | Document that describes the expected behavior of a feature |
| **RF** | Functional Requirement — what the system should do |
| **RNF** | Non-Functional Requirement — how the system should behave (performance, security...) |
| **Goal** | Objective the feature should achieve |
| **Non-Goal** | What is explicitly out of scope |
| **Edge Case** | Limit or non-obvious case the system must handle correctly |
| **Happy Path** | The main and most common flow of use |
| **Acceptance Criterion** | Verifiable condition that defines when a requirement is implemented |
| **Open Question** | Unresolved doubt that may impact design |
| **Decision Log** | Record of important decisions and why they were made |
