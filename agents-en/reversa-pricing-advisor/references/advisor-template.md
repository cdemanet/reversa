# advisor.md template

This is the Markdown template that the `reversa-pricing-advisor` agent uses to generate `_reversa_sdd/_pricing/advisor.md`. Replace all the `<placeholders>` with real values. Keep the structure fixed.

```markdown
# Sales Model

**Generated at:** <created_at_legible_local>
**Schema version:** 1.0
**Rules:** `sale-models.md` v1.0
**JSON artifact:** `<output_folder>/_pricing/advisor.json`

## Your answers

| Question | Answer |
|---|---|
| Software type | <software_type_legible> (`<software_type>`) |
| Origin | <origin_legible> (`<origin>`) |
| Who pays | <payer_legible> (`<payer>`) |
| Who hosts | <hosting_legible> (`<hosting>`) |
| Monthly cost to keep it running | <monthly_recurring_cost or "I don't know"> |
| Income preference | <income_preference_legible> (`<income_preference>`) |

## Sales models evaluated

| # | Model | Viable | Points | Why | Risks |
|---|---|---|---|---|---|
| 1 | <plain_name> (`<model>`) | <Yes or No> | <score> | <reason_en> | <risks_en separated by semicolon> |
| 2 | ... | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... | ... |
| 4 | ... | ... | ... | ... | ... |
| 5 | ... | ... | ... | ... | ... |

<unknown_hosting_note_if_applicable>

## Chosen models

- `<model>`: <plain_name>
- ...

<forced_models_block_if_applicable>

<store_block_if_applicable>

Tracks: service = <true or false>, product = <true or false>

## Next step

<next_step_en>

## Disclaimer

This is a guide of options, not commercial consulting. Viability is calculated by simple rules over your answers. Store commission percentages come from `store-commissions.md` and change over time; check the official page before deciding. It is recommended to add `_reversa_sdd/_pricing/advisor.json` and `_reversa_sdd/_pricing/advisor.md` to `.gitignore` before committing.
```

## Legible labels

| Field | Value | Label |
|---|---|---|
| software_type | mobile_app | Mobile app |
| software_type | desktop_app | Desktop app |
| software_type | web_system | Web system |
| software_type | api_service | API or service |
| software_type | internal_tool | Internal tool |
| software_type | other | Other |
| origin | custom_order | Made to order for one client |
| origin | many | To sell to many |
| origin | both | Both |
| payer | individual | Individual person |
| payer | company | Company |
| payer | both | Both |
| hosting | i_host | I host it and the client accesses it |
| hosting | client_installs | The client installs it on their machine or server |
| hosting | unknown | I don't know |
| income_preference | one_off | One-off payment |
| income_preference | recurring | Recurring income |
| income_preference | either | Either way |

## Conditional blocks

Unknown hosting note, when `answers.hosting = unknown`:

```markdown
> Find out who will host it: that decides between subscription and rental/license.
```

Block of forced models, when `forced_models` is not empty:

```markdown
> Kept even though they are unviable by the rules: `<model>` (<reason_en>), ...
```

Store block, when `app_store` is in `selected_models`:

```markdown
Store: <store_legible> (`<store>`), billing inside the store: <one_off or subscription>. Reference commission: <commission_percent>% (source: <source>, reference date <date>), according to `store-commissions.md`. If the table is not available, write "commission: see store-commissions.md in the product agent".
```

## Next step (`<next_step_en>`)

One sentence, according to the routing of SKILL.md:

- profile.json missing: "Run `/reversa-pricing-profile` to record how you charge."
- profile present, `tracks.product = true` and product.json missing: "Run `/reversa-pricing-product` to see how many clients each price requires."
- profile present, `tracks.service = true` (no pending product), active feature with tasks and no size.json: "Run `/reversa-pricing-size` to measure the active feature."
- any other case: "Use `/reversa-pricing` to see the team status and the next step."
