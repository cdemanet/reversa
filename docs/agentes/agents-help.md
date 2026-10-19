# Guide with analogies

Not sure which agent to call? Activate the guide:

```
/reversa-agents-help
```

It explains each agent with a real-world analogy. But since you're already here, here's the full rundown:

---

## Main menu

| Goal | Command | Team |
|---|---|---|
| Discover and document a legacy system | `/reversa` | Reversa Agents Core |
| Create a new project from an idea | `/reversa-new` | Code New Project Agents |
| Implement or evolve code from specs | `/reversa-forward` | Code Forward Agents |
| Plan a legacy migration | `/reversa-migrate` | Migration Agents |
| Generate a visual documentation mini-site | `/reversa-docs` | Documentation Agents |
| Find out how to sell and how much to charge for the software or a feature | `/reversa-pricing` | Pricing and Size Agents |
| Choose the right agent | `/reversa-agents-help` | Agent guide |

The Pricing team enters through `/reversa-pricing`. Translators use `/reversa-n8n`.

---

## Orchestrators and core agents

### 🆕 Reversa New: the product founder

The founder starts with a rough idea, investigates the problem, identifies the audience, consolidates a PRD and turns it into implementation-ready specifications.

> Use `/reversa-new` for greenfield projects. It drives `Ideator → Researcher → Drafter → Spec SDD` and hands the result to `/reversa-forward`.

### 🎼 Reversa: the orchestra conductor

A conductor doesn't play any instrument. They know the full score and tell who enters when, in what order, at what pace. Without them, each musician would play their part without connecting to the others.

> Use `/reversa` to start or resume the full analysis. It handles the sequence for you.

---

### 🗺️ Scout: the real estate agent

The agent does the first tour of the property. Doesn't open drawers, doesn't read documents, doesn't touch anything. Just maps: how many rooms, which neighborhood, what facilities exist, what's the general condition.

> Use Scout at the beginning. It generates the project inventory without diving into the code logic.

---

### ⛏️ Archaeologist: the excavator

The archaeologist digs through the terrain patiently, layer by layer. Catalogs every artifact found: size, material, location, shape. Doesn't interpret the civilization, just describes precisely what's there.

> Use the Archaeologist to analyze code module by module. Runs one module per session to conserve tokens.

---

### 🔍 Detective: Sherlock Holmes

Sherlock Holmes arrives after the archaeologist. Looks at the cataloged artifacts and asks: *"But why is this here? Who put it here? What does this reveal about who lived here?"* Doesn't excavate, interprets.

> Use the Detective after the Archaeologist. It extracts implicit business rules, reads git history like a diary, and reconstructs decisions nobody documented.

---

### 📐 Architect: the cartographer

The cartographer visits a territory and produces formal maps: floor plan, elevation map, structural plan. Someone who never set foot there can understand everything just by looking at the maps.

> Use the Architect after the Detective. It synthesizes everything into C4 diagrams, full ERD, and integration map.

---

### 📝 Writer: the notary

The notary transforms what was discovered into formal, precise, traceable contracts. Each clause has a declared confidence level. The document is a contract: an AI agent can reimplement the system from it.

> Use the Writer after the Architect. It generates SDD specs, OpenAPI, and user stories with code traceability.

---

### ⚖️ Reviewer: the spec reviewer

The Reviewer takes the Writer's contracts and tries to punch holes in them: *"This is a contradiction. This point has no proof. This rule disappears if the user does X."* Not to destroy, but to ensure what's left standing is solid.

> Use the Reviewer after the Writer. It critically reviews specs, reclassifies confidence, and raises questions for human validation.

---

### 🖼️ Visor: the forensic illustrator

The forensic illustrator works only with images. Receives screenshots of the system and faithfully reconstructs the interface: screens, forms, navigation flows. Doesn't need the system to be running. Just the photos.

> Use Visor when you have screenshots available. It documents the UI without needing access to the system.

---

### 🗄️ Data Master: the geologist

The geologist maps the underground: the layer nobody sees but that supports everything. Tables, relationships, constraints, triggers, procedures. The invisible foundation on which the application is built.

> Use Data Master when DDL, migrations, or ORM models are available.

---

### 🎨 Design System: the stylist

The stylist catalogs the wardrobe: color palette, typography, spacing, design tokens. The "fashion rules" that govern the system's appearance.

> Use Design System when CSS files, themes, or interface screenshots are available.

---

## 💰 Reversa Pricing: the pricing consultant
**Command:** `/reversa-pricing`

A good pricing consultant doesn't start with a number. First they ask how you want to sell: custom work for a client, a license, a rental, a subscription or an app store. Only after knowing the model do they call each specialist: the one who researches the market, the one who records how you charge, the one who measures the job, the one who builds the quote and the one who calculates how many customers pay the bill. In the end you never get a single number: you get ranges, scenarios and what each price demands.

> Use Reversa Pricing when you want to know how much to charge for the software or for a feature, whether you are a beginner or experienced. It detects where you stopped in `_pricing/` and drives `Advisor → Profile → Product` (product) or `Size → Estimate` (service, per feature). Research steps in when you would rather look it up than fill it in.

**The six specialists:**

| Agent | Analogy | Command |
|---|---|---|
| **Advisor** | The consultant who asks how you want to sell before talking numbers | `/reversa-pricing-advisor` |
| **Research** | The researcher who goes to the market and comes back with a range, a source and a date | `/reversa-pricing-research` |
| **Profile** | The accountant who records how you charge, or researches it for you | `/reversa-pricing-profile` |
| **Size** | The engineer who measures the job from the blueprint, not brick by brick | `/reversa-pricing-size` |
| **Estimate** | The estimator who delivers three scenarios, never a single number | `/reversa-pricing-estimate` |
| **Product** | The planner who tells you how many customers pay the bill at each price | `/reversa-pricing-product` |

---

## Recommended sequence

```
Legacy project: /reversa → discovery and specifications
New project:    /reversa-new → PRD and specs → /reversa-forward
Migration:      /reversa → /reversa-migrate → /reversa-forward
Pricing:        /reversa-pricing → advisor → profile → product | size → estimate

Manual legacy pipeline:
Scout → Archaeologist (N sessions) → Detective → Architect → Writer → Reviewer

Optional at any phase:
Visor · Data Master · Design System · Reversa Docs
```
