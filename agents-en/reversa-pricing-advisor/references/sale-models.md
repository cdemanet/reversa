# Catalog of sales models and viability rules (version 1.0)

This file is the reference of the `reversa-pricing-advisor` agent. It defines the five sales models, the deterministic scoring and blocking rules, the default risks of each model, and the presentation order. The rules are simple on purpose: the goal is to guide whoever has never priced software, not to predict the market.

## Catalog

Canonical keys, in this catalog order. The catalog order breaks ties when two models have the same score.

| # | key | Plain name | Track | Recurrence |
|---|---|---|---|---|
| 1 | `custom_service` | Charge for the work of building or evolving something for one client | service | not applicable |
| 2 | `perpetual_license` | Sell the license once, the client installs and uses it forever | product | one-off sale |
| 3 | `rental` | License per period (monthly or yearly), the client installs and renews | product | recurring |
| 4 | `subscription` | Continuous access to the software you host, monthly or yearly billing | product | recurring |
| 5 | `app_store` | Publish in a store (Google Play, App Store, Microsoft Store, Steam), one-off sale or subscription inside the store, with commission | product | depends on `store_billing` |

The `service` track leads to the pipeline per feature (`size` and `estimate`). The `product` track leads to `product` (breakeven).

## Inputs

The rules use the six answers of the interview, with the canonical values:

```
software_type           mobile_app | desktop_app | web_system | api_service | internal_tool | other
origin                  custom_order | many | both
payer                   individual | company | both
hosting                 i_host | client_installs | unknown
monthly_recurring_cost  number >= 0, or null when recurring_cost_known = false
income_preference       one_off | recurring | either
```

## Scoring and blocking rules

For each model, `score` starts at 0 and adds the points of the rules that match. A block does not zero the score: it only makes the model unviable. The score keeps being calculated and shown.

```
viable = score >= 1 AND no block
```

Comparisons with `monthly_recurring_cost`: when the value is `null` (the user answered "I don't know"), no cost rule scores, neither the `> 0` nor the `= 0` one.

### `custom_service`

| Rule | Points | Phrase for the reason |
|---|---|---|
| `origin` in {custom_order, both} | +2 | it was made to order, so there is someone paying for the work |
| `payer` in {company, both} | +1 | companies usually hire development and evolution |
| `software_type = internal_tool` | +1 | an internal tool is work done for whoever uses it |

No block. If the score is 0, the reason is: "there is no client ordering the work".

### `subscription`

| Rule | Points | Phrase for the reason |
|---|---|---|
| `hosting = i_host` | +2 | you host it, so you can charge for continuous access |
| `monthly_recurring_cost > 0` | +1 | there is a monthly cost, and recurring billing covers that cost |
| `income_preference` in {recurring, either} | +1 | you accept recurring income |
| `software_type` in {web_system, api_service} | +1 | web systems and APIs are accessed over the network, the natural format of a subscription |

Block: `software_type = internal_tool`, reason "an internal tool is not sold to third parties".

### `rental`

| Rule | Points | Phrase for the reason |
|---|---|---|
| `hosting = client_installs` | +2 | the client installs it, so the license can have a term and renewal |
| `income_preference` in {recurring, either} | +1 | you accept recurring income |
| `monthly_recurring_cost > 0` | +1 | there is a monthly cost, and the renewal helps to cover it |

Blocks:

- `hosting = i_host`, reason "you host it: the equivalent model is subscription"
- `software_type = internal_tool`, reason "an internal tool is not sold to third parties"

### `perpetual_license`

| Rule | Points | Phrase for the reason |
|---|---|---|
| `hosting = client_installs` | +2 | the client installs it and uses it on their own |
| `income_preference` in {one_off, either} | +1 | you accept a one-off payment |
| `monthly_recurring_cost = 0` | +1 | with no monthly cost, the one-off sale leaves no open bill |

Mandatory risk when `monthly_recurring_cost > 0` or `null`: "a one-off sale does not cover a continuous monthly cost".

Blocks:

- `hosting = i_host`, reason "you host it: the equivalent model is subscription"
- `software_type = internal_tool`, reason "an internal tool is not sold to third parties"

### `app_store`

| Rule | Points | Phrase for the reason |
|---|---|---|
| `software_type` in {mobile_app, desktop_app} | +2 | mobile and desktop apps are distributed by stores |
| `payer` in {individual, both} | +1 | individuals buy in stores |
| `origin` in {many, both} | +1 | made for many, and the store reaches many |

Block: `software_type` in {web_system, api_service, internal_tool}, reason "app stores distribute mobile and desktop apps".

Mandatory risk, always: "the store charges commission on each sale; see the table in store-commissions.md".

### `hosting = unknown`

No model receives the hosting points. Add the note, in `notes_en` and below the table: "find out who will host it: that decides between subscription and rental/license".

## How to build the reason (`reason_en`)

1. If the model has a block: the reason is the phrase of the block. If more than one block matches, use the first in the order listed above.
2. Otherwise, if the score is greater than 0: join the phrases of the rules that matched, separated by semicolon, in the order of the model's table.
3. Otherwise (score 0, no block): `custom_service` uses "there is no client ordering the work"; the others use "none of your answers points to this model".

## Default risks per model (`risks_en`)

Plain language, 2 to 3 per model. The conditional mandatory risks come at the front of the list when the condition matches.

### `custom_service`

1. The income stops when the project ends: you need new clients all the time.
2. Scope change without an addendum becomes free work.
3. Depending on one big client leaves you vulnerable if they leave.

### `perpetual_license`

1. (mandatory if `monthly_recurring_cost > 0` or `null`) a one-off sale does not cover a continuous monthly cost
2. After the sale, every update and support is your cost with no new revenue.
3. Copying and use beyond what was agreed are hard to control when the client installs it.

### `rental`

1. The client may not renew, and the revenue falls without warning.
2. You need a way to block usage when the license expires, and that requires technical work.
3. Supporting several versions installed on different machines costs time.

### `subscription`

1. Server, APIs and support are your bill every month, even with few subscribers.
2. Cancellations erode revenue: you need to replace clients all the time.
3. Any service outage becomes an immediate complaint from all subscribers.

### `app_store`

1. (mandatory, always) the store charges commission on each sale; see the table in store-commissions.md
2. The store may reject or remove the app by its own rule, and the review delays launches.
3. The price is exposed and compared with competitors in the same showcase.

Never cite a commission percentage from memory. The percentage, the source and the date come from `reversa-pricing-product/references/store-commissions.md` (sibling folder).

## Ordering

Decreasing score. Tie: catalog order (1 to 5). The five models always appear, including the unviable ones, so the user understands why they were discarded.

## Presentation table

```
# | Model | Viable | Points | Why | Risks
```

`Model` shows the plain name and the key in parentheses. `Viable` shows "Yes" or "No". `Risks` lists the risks separated by semicolon.

## Examples

### Example A: mobile app for many, individual, i host, cost 200, recurring

Answers:

```
software_type           = mobile_app
origin                  = many
payer                   = individual
hosting                 = i_host
monthly_recurring_cost  = 200   (recurring_cost_known = true)
income_preference       = recurring
```

Calculations:

```
custom_service       origin many: 0        | payer individual: 0     | not internal_tool: 0              -> score 0, no block, unviable (score < 1)
subscription         i_host: +2            | cost > 0: +1           | recurring: +1 | mobile_app: 0      -> score 4, viable
rental               client_installs: 0    | recurring: +1          | cost > 0: +1                       -> score 2, BLOCK (i_host), unviable
perpetual_license    client_installs: 0    | one_off/either: 0      | cost = 0: 0                        -> score 0, BLOCK (i_host), unviable
app_store            mobile_app: +2        | individual: +1         | many: +1                           -> score 4, viable
```

Ordering: subscription (4) and app_store (4) tie; subscription comes first because it is item 4 of the catalog and app_store item 5. Then rental (2). Then custom_service (0, item 1) and perpetual_license (0, item 2).

Resulting table:

| # | Model | Viable | Points | Why | Risks |
|---|---|---|---|---|---|
| 1 | Continuous access to the software you host, monthly or yearly billing (`subscription`) | Yes | 4 | you host it, so you can charge for continuous access; there is a monthly cost, and recurring billing covers that cost; you accept recurring income | Server, APIs and support are your bill every month, even with few subscribers; Cancellations erode revenue: you need to replace clients all the time; Any service outage becomes an immediate complaint from all subscribers |
| 2 | Publish in a store (Google Play, App Store, Microsoft Store, Steam), one-off sale or subscription inside the store, with commission (`app_store`) | Yes | 4 | mobile and desktop apps are distributed by stores; individuals buy in stores; made for many, and the store reaches many | the store charges commission on each sale; see the table in store-commissions.md; The store may reject or remove the app by its own rule, and the review delays launches; The price is exposed and compared with competitors in the same showcase |
| 3 | License per period (monthly or yearly), the client installs and renews (`rental`) | No | 2 | you host it: the equivalent model is subscription | The client may not renew, and the revenue falls without warning; You need a way to block usage when the license expires, and that requires technical work; Supporting several versions installed on different machines costs time |
| 4 | Charge for the work of building or evolving something for one client (`custom_service`) | No | 0 | there is no client ordering the work | The income stops when the project ends: you need new clients all the time; Scope change without an addendum becomes free work; Depending on one big client leaves you vulnerable if they leave |
| 5 | Sell the license once, the client installs and uses it forever (`perpetual_license`) | No | 0 | you host it: the equivalent model is subscription | a one-off sale does not cover a continuous monthly cost; After the sale, every update and support is your cost with no new revenue; Copying and use beyond what was agreed are hard to control when the client installs it |

If the user picks 1 and 2: `selected_models = ["subscription", "app_store"]`, `forced_models = []`, `tracks = { service: false, product: true }`, and the agent asks the two extra store questions.

### Example B: web system to order, company, client installs, cost 0, one-off

Answers:

```
software_type           = web_system
origin                  = custom_order
payer                   = company
hosting                 = client_installs
monthly_recurring_cost  = 0   (recurring_cost_known = true)
income_preference       = one_off
```

Calculations:

```
custom_service       custom_order: +2     | company: +1            | not internal_tool: 0              -> score 3, viable
subscription         i_host: 0            | cost > 0: 0            | one_off: 0 | web_system: +1        -> score 1, no block, viable
rental               client_installs: +2  | one_off: 0             | cost > 0: 0                        -> score 2, viable
perpetual_license    client_installs: +2  | one_off: +1            | cost = 0: +1                       -> score 4, viable
app_store            web_system: 0        | company: 0             | custom_order: 0                    -> score 0, BLOCK (web_system), unviable
```

Ordering: perpetual_license (4), custom_service (3), rental (2), subscription (1), app_store (0). No tie.

Resulting table:

| # | Model | Viable | Points | Why | Risks |
|---|---|---|---|---|---|
| 1 | Sell the license once, the client installs and uses it forever (`perpetual_license`) | Yes | 4 | the client installs it and uses it on their own; you accept a one-off payment; with no monthly cost, the one-off sale leaves no open bill | After the sale, every update and support is your cost with no new revenue; Copying and use beyond what was agreed are hard to control when the client installs it |
| 2 | Charge for the work of building or evolving something for one client (`custom_service`) | Yes | 3 | it was made to order, so there is someone paying for the work; companies usually hire development and evolution | The income stops when the project ends: you need new clients all the time; Scope change without an addendum becomes free work; Depending on one big client leaves you vulnerable if they leave |
| 3 | License per period (monthly or yearly), the client installs and renews (`rental`) | Yes | 2 | the client installs it, so the license can have a term and renewal | The client may not renew, and the revenue falls without warning; You need a way to block usage when the license expires, and that requires technical work; Supporting several versions installed on different machines costs time |
| 4 | Continuous access to the software you host, monthly or yearly billing (`subscription`) | Yes | 1 | web systems and APIs are accessed over the network, the natural format of a subscription | Server, APIs and support are your bill every month, even with few subscribers; Cancellations erode revenue: you need to replace clients all the time; Any service outage becomes an immediate complaint from all subscribers |
| 5 | Publish in a store (Google Play, App Store, Microsoft Store, Steam), one-off sale or subscription inside the store, with commission (`app_store`) | No | 0 | app stores distribute mobile and desktop apps | the store charges commission on each sale; see the table in store-commissions.md; The store may reject or remove the app by its own rule, and the review delays launches; The price is exposed and compared with competitors in the same showcase |

Note that `perpetual_license` does not receive the risk "a one-off sale does not cover a continuous monthly cost" because the informed monthly cost was 0.

If the user picks 1 and 2: `selected_models = ["perpetual_license", "custom_service"]`, `forced_models = []`, `tracks = { service: true, product: true }`. If they pick 5 and confirm "Y" on "Do you want to keep it anyway?", `app_store` enters `selected_models` and `forced_models`.
