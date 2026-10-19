# Research policy (research-policy.md)

**Policy version:** 1.0
**Reference date:** 2026-05

Documents the rules that the `reversa-pricing-research` agent follows to look up price references on the web. It is the only agent of the pricing team with internet access; all the others read the result written in `_pricing/research/<kind>.json`.

## Mandatory disclaimer

The research result is a market reference, not a price recommendation. Public sources frequently bring a monthly or yearly salary, not a direct freelance rate; when the line derives an hourly rate from a salary, the `derived` field must be `true` and the `note` must show the calculation. No markup, tax or commission is added here. The value only enters the profile or the product after the user confirms it in the calling agent.

## 1. Search tool per engine

| Engine | Search tool | Page reading tool | How to detect |
|---|---|---|---|
| Claude Code | `WebSearch` | `WebFetch` | it appears in the session tool list; it may be deferred and need to be loaded before use |
| Codex | Codex native web search | Codex URL reading | the session exposes a web search tool; if the environment has no network, it does not appear or fails |
| Gemini CLI | `google_web_search` | `web_fetch` | it appears in the session tool list |
| Cursor | `@web` | open URL through `@web` itself | the context accepts the `@web` mention |
| Other engine | any tool whose function is to search the web | any tool that opens a URL | check the tool list; a different name does not matter, the function does |

Rules:

1. Page reading without search does not count as search. It only serves to open the found URL and confirm the number
2. Without a search tool in the session: write `available = false`, `reason = "engine_without_search"`, warn "This engine has no web search. Inform the value manually in the calling agent." and end
3. Tool present but all searches fail: write `available = false`, `reason = "search_failed"`, keep `queries_run` with the attempted queries
4. Never invent source, URL, number or date. A number from memory does not replace a search

## 2. Search limit

| Rule | Value |
|---|---|
| Searches per run | up to 6 |
| Searches per geographic level (`hourly_rate`) | up to 2 |
| Log | every executed query goes in `queries_run`, with or without a useful result |

Page reading (opening a found URL) does not count in the limit of 6, but open only pages that appeared in a logged search.

## 3. Geographic chain (only `hourly_rate`)

| Order | Level | When to try | Accept when |
|---|---|---|---|
| 1 | `city` | `region.city` informed | at least 2 accepted sources with a number |
| 2 | `state` | `region.state` informed | at least 2 accepted sources with a number |
| 3 | `country` | always | at least 2 accepted sources with a number |

Rules:

1. In each level, up to 2 searches. When reaching 2 accepted sources, stop and write `level_used` with that level
2. A level that did not reach 2 sources enters `levels_tried` and the accepted sources it produced are kept, with `note` indicating the level ("city level")
3. If no level reached 2 sources, `level_used` is the most specific level that produced at least 1 accepted source, and `weak = true`
4. If no level produced an accepted source, `available = false`, `reason = "no_accepted_sources"`
5. Warn the user before starting that city data is scarce and that the country is usually the level that works
6. `comparables` and `store_commission` do not use the chain: `level_used = null`, `levels_tried = []`

## 4. Accepted and rejected sources

### Accepted

| Category | Examples | Used for | Typical unit |
|---|---|---|---|
| Salary portal | Glassdoor, salario.com.br, Indeed, Payscale | `hourly_rate` | `month` or year, normalize to `hour` |
| Freelance platform | Upwork, Workana, 99freelas | `hourly_rate` | `hour` |
| Official statistics | CAGED (BR), BLS (US), INE (PT, ES) and country equivalents | `hourly_rate` | `month`, year or `hour` |
| Official store documentation | Google Play Console Help, Apple Developer, Microsoft Learn, Steamworks Documentation | `store_commission` | `percent` |
| Product price page | "pricing" or "plans" page of the product itself, product store page | `comparables` | `month` or `license` |

Every accepted source needs a name, URL, number, unit, access date and, when available, the publication or update date in `note`.

### Rejected

| Situation | `reason` in `skipped_sources` | Rule |
|---|---|---|
| Forum, comment or question without a number | `no_number` | record it and move on |
| AI generated text without an identifiable source | `ai_generated_without_source` | record it and move on |
| Page without an identifiable date (no publication date, update date or year reference) | `no_date` | record it and move on |
| Source in a currency different from `currency` | `different_currency` | record it, never convert |
| Unit incompatible with the model requested in `comparables` | `different_unit` | keep the unit of the majority of the sources |
| Out of the requested scope (another seniority, another country, another product category, another store) | `out_of_scope` | record it and move on |
| News, blog or forum with a commission percentage | `out_of_scope` | in `store_commission` only the official page counts |

## 5. Normalization

| Source input | Calculation | `derived` | Where it applies |
|---|---|---|---|
| direct hourly rate | none | `false` | `hourly_rate` |
| monthly salary | divide by 160 (160 h/month) | `true` | `hourly_rate` |
| yearly salary | divide by 1920 (1920 h/year) | `true` | `hourly_rate` |
| yearly plan | divide by 12 | `true` | `comparables` |
| monthly price, per license or percentage | none | `false` | `comparables`, `store_commission` |

Rules:

1. Round to 2 decimals
2. Write the calculation in `note` ("monthly salary 8000 / 160")
3. Never add markup, tax, charges or commission. That is the role of the profile, the estimate and the product
4. Never convert currency. A source in another currency is rejected
5. A source with a single number writes `value_min = value_max`
6. A source whose value is 0 (free plan, "to be agreed") is not accepted: it goes to `skipped_sources` with `reason = "no_number"`. That way the confidence ratio never divides by zero

## 6. Confidence

```
midpoint(source) = (value_min + value_max) / 2
ratio            = highest midpoint / lowest midpoint   (among the accepted sources)
```

| Condition | `confidence` | `weak` |
|---|---|---|
| 2 or more sources and ratio lower than 2 | `high` | `false` |
| 2 or more sources and ratio from 2 to 3 | `medium` | `false` |
| 2 or more sources and ratio greater than 3 | `low` | `false` |
| 1 accepted source | `low` | `true` |
| 0 accepted sources | `null` (with `available = false`) | `true` |

Range:

```
range_min    = lowest value_min among the accepted sources
range_max    = highest value_max among the accepted sources
range_median = median of the midpoints
```

## 7. Access date

`accessed_at` is today's date known by the session, in the `YYYY-MM-DD` format, the same in all the sources of the run. If the session does not know the date, ask the user: "What is today's date? Format YYYY-MM-DD." The publication date of the source, when available, goes in `note`, never in `accessed_at`.

## 8. Presentation

Table of the accepted sources:

```
| Source | Value | Unit | Derived | URL |
```

Then the line:

```
Range: <range_min> to <range_max> <currency>, median <range_median>, level <level_used>, confidence <confidence>
```

In `store_commission`, `<currency>` becomes `%`. A null `level_used` becomes `not applicable`. With `weak = true`, add `(weak: fewer than 2 sources)`. Close by reminding that it is a reference, not a recommendation.

## 9. Writing

| Rule | Value |
|---|---|
| Single write folder | `<output_folder>/_pricing/research/` |
| Files | `<kind>.json` and `<kind>.md` |
| Recalculation | ask "A research/<kind>.json already exists. Do you want to recalculate? Y/N"; "N" ends without changes; "Y" renames to `<file>.bak.<YYYYMMDD-HHMMSS>` before writing |
| Write | atomic (tempfile plus rename), UTF-8 without BOM |
| Forbidden | writing in `profile.json`, `product.json`, `advisor.json`, legacy code, Discovery, Forward or `.reversa/` |

## 10. Example queries per kind

Replace the fields between `<>` with the inputs. Use the document language for the country of the user and English for the others or when the source is international (Upwork, Payscale, BLS, store documentation). Plain seniority labels: junior -> "junior", mid -> "mid-level", senior -> "senior", staff_lead -> "staff" or "lead", principal -> "principal".

### `hourly_rate`

1. `software developer hourly rate <city> <state> <country> <seniority> <year>`
2. `<seniority> software developer salary <state> glassdoor OR payscale OR indeed`
3. `upwork software developer hourly rate <country> <seniority>`
4. `valor hora desenvolvedor <seniority> <city> <state> <year>` (for Portuguese speaking countries)
5. `salario desenvolvedor <seniority> <state> glassdoor OR salario.com.br` (for Portuguese speaking countries)
6. `freelancer desenvolvedor <seniority> valor hora <country> workana OR 99freelas` (for Portuguese speaking countries)

Suggested order in the chain: query 1 in the city level, query 2 in the state level, query 3 in the country level, completing each level with the second search when the first brings fewer than 2 sources.

### `comparables`

1. `<description> pricing plans per month`
2. `<description> software one-time license price`
3. `<description> alternatives pricing <country>`
4. `<description> precos planos assinatura mensal` (for Portuguese speaking countries)
5. `software <description> quanto custa licenca` (for Portuguese speaking countries)
6. `alternativas a <description> preco <country>` (for Portuguese speaking countries)

For `app_store`, add the store name to the query (`google play`, `app store`, `microsoft store`, `steam`) and prefer the product page inside the store.

### `store_commission`

1. `google play service fee percentage developer`
2. `app store commission small business program`
3. `steam revenue share distribution agreement`
4. `comissao google play desenvolvedor percentual taxa de servico`
5. `taxa app store small business program percentual`
6. `comissao microsoft store apps percentual`

For `other`, use `<store name> developer commission percentage` and `<store name> comissao desenvolvedor`. Only the official page of the store counts.

## 11. How to extend

To add an engine, source or kind:

1. New engine: add a row to the table of section 1 with search tool, reading tool and how to detect
2. New source: add it to the accepted table with category, kind it serves and typical unit; a source without a number or without a date stays rejected
3. New kind: define inputs, output unit, whether it uses the geographic chain, example queries (3 in English and 3 in the document language) and add the value to the `kind` enum in `research-schema.json`
4. Change of confidence, normalization or search limit rule: bump the policy version and the `schema_version` when the JSON changes
