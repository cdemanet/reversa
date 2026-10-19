# Pricing and Size Agents

The **Pricing and Size Agents** Team answers two different questions. The first is how much to charge a client to build or evolve a feature (service, per feature). The second is how much to charge the people who use the software (product: perpetual license, rental, subscription or app store). It works for people who have never priced software, with a guided path and web research, and for people who already know their numbers and want to go straight to the calculation.

Pre-checked in the installer.

---

## Pipeline

```
/reversa-pricing                 orchestrator (entry point, model-invoked, only routes)
        │
        ▼
/reversa-pricing-advisor         required on the orchestrated path: sale model, writes advisor.json
        │
        ▼
/reversa-pricing-profile         billing profile; research mode calls research for the hourly rate
        │
        ├── PRODUCT track ──▶ /reversa-pricing-product    break-even calculator
        │
        └── SERVICE track ──▶ /reversa-pricing-size ──▶ /reversa-pricing-estimate   (per feature)

/reversa-pricing-research        web research (the only one with internet), called by profile and product, or directly
```

`advisor` and `profile` run once per project and are reused. `product` runs once per project when the advisor marked the product track. `size` and `estimate` run for each feature, after the feature has been planned by `/reversa-forward`.

---

## If you have never priced software

Type `/reversa-pricing`. The orchestrator reads what already exists in `_pricing/`, tells you where you stopped and suggests the next agent. It never writes anything by itself.

The order is simple:

1. The **advisor** asks six questions about the software (type, who ordered it, who pays, who hosts it, monthly cost, income preference) and explains which sale models fit, with reasons and risks. You can pick more than one.
2. The **profile** asks whether you know your billing numbers or prefer research. In research mode it calls the **research** agent to find an hourly rate range for your country, seniority and region, with sources and date. You confirm the value before it is saved.
3. On the product track, the **product** agent builds a price ladder (researched or typed by you) and shows, for each price, how many paying customers cover the cost and how many reach your income goal.
4. On the service track, **size** measures the planned feature and **estimate** turns it into three scenarios side by side.

Each agent asks one question at a time, in plain language, and ends by suggesting the next step.

---

## If you already know your numbers

Pick "I know" mode in the profile and type your hourly rate, markup and tax regime directly. You can also call any agent directly, skipping the orchestrator: `/reversa-pricing-profile`, `/reversa-pricing-size`, `/reversa-pricing-estimate`, `/reversa-pricing-product` or `/reversa-pricing-research` with the research kind as argument. The orchestrator exists so a beginner can type a single command; it is not mandatory.

---

## Agents

| Agent | Stage | Role |
|-------|-------|------|
| `reversa-pricing` | orchestrator | Entry point. Detects the stage from the artifacts in `_pricing/` and routes to the next agent (advisor, profile, product, size, estimate or research). Only routes, writes nothing. |
| `reversa-pricing-advisor` | advisor | Six-question interview about the software and how it will be sold. Applies deterministic viability rules and writes `advisor.json` with the ordered list of sale models (custom service, perpetual license, rental, subscription, app store), with reason and risks for each. Runs before the profile. |
| `reversa-pricing-research` | research | The only agent with internet access. Searches for hourly rates by seniority and region, prices of comparable products and app store commissions. Tries city, then state, then country, records sources and date, and never fills the profile or the product by itself. |
| `reversa-pricing-profile` | profile | Guided interview that produces the billing profile: country, currency, seniority, hourly rate, markup, tax regime, billing model, client profile. Has an "I know" mode and a "research for me" mode. Every field records its origin. |
| `reversa-pricing-size` | size | Reads requirements, doubts, plan and tasks of the active feature and produces deterministic structural metrics in `size.json` and `size.md` (T-shirt sizing based on tasks plus risk adjustment). |
| `reversa-pricing-estimate` | estimate | Combines `profile.json` and `size.json` of the active feature to produce three educational scenarios side by side: Effort, Value, Market Range. Warns when profile values were researched or defaulted. Never delivers a single number as the final answer. |
| `reversa-pricing-product` | product | Break-even calculator for selling the software as a product. Reads `advisor.json` and `profile.json`, asks for monthly cost, income goal and investment to recover, builds a price ladder and shows, per model and per price, how many paying customers cover the cost and how many reach the goal. |

---

## Product track: break-even, not forecast

The product agent computes, for each price on the ladder, the net amount per customer after store commission and tax reserve, then divides the monthly cost (plus the investment spread over the recovery horizon, plus the income goal) by that net amount. The result is a count of paying customers or licenses, always rounded up.

It does not model churn, conversion rate, payment gateway fees, discounts, trials, product-specific taxes or exchange rates. It tells you what each price demands; it does not tell you how many customers you will get. The ladder always has three to five prices, and the agent never picks one for you.

---

## Web research

Only `reversa-pricing-research` touches the web. All other agents work offline.

- Accepted sources: salary portals, freelance platforms, official statistics, official app store documentation and product pricing pages. Forums without numbers, undated pages and sources in a different currency are skipped and listed with the reason.
- For hourly rates the search goes city, then state, then country, and the result says which level was used. City data is scarce; country is usually the level that works.
- Confidence is high, medium or low depending on how much the sources disagree. Fewer than two sources marks the result as weak.
- The result is a range with sources and date. Nothing enters the profile or the product until you confirm it in the calling agent.
- If the engine has no web search tool, research reports that and the calling agent falls back to asking you for the value.

---

## Where artifacts land

```
_reversa_sdd/_pricing/
├── advisor.json / advisor.md              (once per project, /reversa-pricing-advisor)
├── profile.json / profile.md              (once, /reversa-pricing-profile)
├── research/
│   ├── hourly_rate.json / .md             (/reversa-pricing-research, called by profile in research mode)
│   ├── comparables.json / .md             (called by product)
│   └── store_commission.json / .md        (optional, when the static table is old)
├── product/
│   └── product.json / product.md          (/reversa-pricing-product)
└── <feature>/
    ├── size.json / size.md                (/reversa-pricing-size)
    └── estimate.json / estimate.md        (/reversa-pricing-estimate)
```

When an artifact already exists, the agent shows a summary and asks before recalculating. The old file is kept as a `.bak` copy.

---

## Where values come from

Every billing field in the profile records its origin: `digitado` (typed, you informed it), `pesquisado` (researched, from the research agent, with source and date) or `padrao` (default, the framework's suggestion, such as the 35% markup or the country's default tax regime). The estimate lists every field that was not typed and warns that researched or default values reduce confidence, so you review hourly rate, markup and tax regime before sending a proposal.

The Pricing and Size Agents never modify legacy code, Discovery artifacts or Forward artifacts. They only read those and write inside `_pricing/`.

These agents offer educational references and calculations, not financial, legal or tax advice. Validate numbers with your accountant before deciding.
