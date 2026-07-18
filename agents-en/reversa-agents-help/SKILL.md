---
name: reversa-agents-help
description: Explains with analogies what each Reversa agent does and when to use it. Activate with /reversa-agents-help.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  role: help
---

Present the text below exactly, without changes, without summarizing.

---

# Reversa Agents — guide with analogies

Reversa is a team of specialists. Each agent does one thing — and does it well.

---

## Main menu

| What do you want to do? | Command | Team |
|---|---|---|
| Discover and document a legacy system | `/reversa` | Reversa Agents Core |
| Create a new project from an idea | `/reversa-new` | Code New Project Agents |
| Implement or evolve code from specs | `/reversa-forward` | Code Forward Agents |
| Plan the migration of a legacy | `/reversa-migrate` | Migration Agents |
| Generate a visual mini-site from documentation | `/reversa-docs` | Documentation Agents |
| Understand which agent to use | `/reversa-agents-help` | Agent guide |

The Pricing and Translators teams have specialized commands. Use `/reversa-pricing-profile`, `/reversa-pricing-size`, `/reversa-pricing-estimate` or `/reversa-n8n` as needed.

---

## 🆕 Reversa New — the product founder
**Command:** `/reversa-new`

The founder starts with a raw idea, investigates the problem, understands who the product is for, consolidates a PRD and turns everything into specifications ready for implementation.

> Use Reversa New for greenfield projects. It runs `Ideator → Researcher → Drafter → Spec SDD` and hands the result to `/reversa-forward`.

---

## 🎼 Reversa — central orchestrator
**Command:** `/reversa`

An orchestra conductor doesn't play any instrument. He knows the whole score and tells who comes in when, in what order, at what pace. Without him, each musician would play their part without connecting with the others.

> Use Reversa to start or resume the full analysis. It takes care of the sequence for you.

---

## 🗺️ Scout — the real estate agent
**Command:** `/reversa-scout`

The real estate agent does the first tour of the property. He doesn't open drawers, doesn't read documents, doesn't touch anything. He only maps: how many rooms, what neighborhood, what installations exist, what the general state is.

> Use the Scout at the start. It generates the project inventory — languages, frameworks, modules, dependencies — without going into the code.

---

## 🧬 Soul Extractor: the express biographer
**Command:** `/reversa-extract-soul`

The express biographer visits the character, reads the agent's notes (Scout), browses some family albums and the letter history (git log) quickly, and produces a one-page biography: who they are, what they do, and the founding decisions that shaped their whole life. It's not the full story, it's the distilled soul.

> Use Soul Extractor right after the Scout, when you want an executive synthesis of the system (purpose, central entities and founding decisions) in a single Spec, without waiting for the whole pipeline. It does not replace Archaeologist or Detective.

---

## ⛏️ Archaeologist — the excavator
**Command:** `/reversa-archaeologist`

The archaeologist excavates the terrain patiently, layer by layer. Catalogs every artifact found: size, material, location, shape. He doesn't interpret the civilization, he just describes precisely what is there.

> Use the Archaeologist to analyze the code module by module. It extracts functions, algorithms, data structures and control flows. **Runs one module per session** to save tokens.

---

## 🔍 Detective — the Sherlock Holmes
**Command:** `/reversa-detective`

Sherlock Holmes arrives after the archaeologist. He looks at the cataloged artifacts and asks: *"But why is this here? Who put it? What does it reveal about who lived here?"* He doesn't excavate. He interprets.

> Use the Detective after the Archaeologist. It extracts implicit business rules, reads the git history like a diary and reconstructs decisions that nobody documented.

---

## 📐 Architect — the cartographer
**Command:** `/reversa-architect`

The cartographer visits a territory and produces formal maps: floor plan, elevation map, structural plan. Someone who has never set foot there can understand everything just by looking at the maps.

> Use the Architect after the Detective. It synthesizes everything into C4 diagrams, a complete ERD and an integration map.

---

## 📝 Writer — the notary
**Command:** `/reversa-writer`

The notary turns what was discovered into formal, precise and traceable contracts. Each clause has a declared degree of certainty. The document counts as a contract: an AI agent can reimplement the system from it.

> Use the Writer after the Architect. It generates SDD specs, OpenAPI and user stories with code traceability.

---

## ⚖️ Reviewer — the spec reviewer
**Command:** `/reversa-reviewer`

The Reviewer takes the Writer's contracts and tries to poke holes: *"That's a contradiction. This point has no proof. This rule disappears if the user does X."* He doesn't want to destroy, he wants to make sure what stands is solid.

> Use the Reviewer after the Writer. It critically reviews the specs, reclassifies confidence and raises questions for human validation.

---

## 🖼️ Visor — the forensic illustrator
**Command:** `/reversa-visor`

The forensic illustrator works only with images. He receives screenshots of the system and faithfully reconstructs the interface: screens, forms, navigation flows. He doesn't need the system to be running — only the photos.

> Use the Visor when screenshots are available. It documents the UI without needing access to the system.

---

## 🗄️ Data Master — the geologist
**Command:** `/reversa-data-master`

The geologist maps the subsurface — the layer nobody sees but that holds everything up. Tables, relationships, constraints, triggers, procedures. The invisible foundation on which the application is built.

> Use the Data Master when DDL, migrations or ORM models are available. It documents the database completely.

---

## 🎨 Design System — the stylist
**Command:** `/reversa-design-system`

The stylist catalogs the wardrobe: color palette, typography, spacing, design tokens. The "fashion rules" that govern the system's look — what can and cannot be combined.

> Use the Design System when there are CSS files, themes or interface screenshots. It extracts the visual tokens from the project.

---

## Recommended sequence

```
Legacy project: /reversa → discovery and specifications
New project:   /reversa-new → PRD and specs → /reversa-forward
Migration:     /reversa → /reversa-migrate → /reversa-forward

Manual legacy pipeline:
Scout → Archaeologist (N sessions) → Detective → Architect → Writer → Reviewer

Optional at any phase:
Soul Extractor · Visor · Data Master · Design System · Reversa Docs
```
