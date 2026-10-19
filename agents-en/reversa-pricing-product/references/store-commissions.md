# Catalog of app store commissions

**Table version:** 1.0
**Reference date:** 2026-05

Static catalog used by the `reversa-pricing-product` agent to discount the store commission in the breakeven calculation of the `app_store` model. It is also read by `reversa-pricing-advisor` to cite the commission with source and date instead of citing it from memory.

## How to read this file

Each store has:

- `store`: canonical key saved in `advisor.store_choice.store` and in `product.models[].store`
- `name`: friendly name used in the chat
- `commission_percent (default)`: percentage the product uses without asking
- `brackets and known exceptions`: situations in which the real percentage differs from the default; they appear in product.md as a note
- `source`: official page of the store consulted on the reference date

## Mandatory disclaimer

The percentages recorded here are an approximation based on the official pages known on the reference date. Percentages change by region, regulation and revenue bracket. Validate on the official page before deciding.

The agent must repeat the disclaimer when showing the commission during the interview and in the footer of `product.md`.

## Table

| store | name | commission_percent (default) | brackets and known exceptions | source |
|---|---|---:|---|---|
| google_play | Google Play | 15 | 15% on the first 1 million USD per year per developer, 30% above that; subscriptions 15%; may vary by region and regulation | Google Play Console Help, "Service fees": https://support.google.com/googleplay/android-developer/answer/112622 |
| app_store | Apple App Store | 30 | 15% in the Small Business Program (up to 1 million USD per year) and for subscriptions after the first year; alternative terms in the EU | Apple Developer, App Store Small Business Program: https://developer.apple.com/app-store/small-business-program/ |
| microsoft_store | Microsoft Store (Windows) | 15 | 15% for apps, 12% for games; 0% when the app uses its own payment system | Microsoft Learn, publishing in the Microsoft Store: https://learn.microsoft.com/en-us/windows/apps/publish/ |
| steam | Steam | 30 | 25% above 10 million USD and 20% above 50 million USD of accumulated revenue of the title | Steamworks Documentation, Steam Distribution Agreement: https://partner.steamgames.com/doc/gettingstarted/onboarding |
| other | Other store | null | the user informs it | not applicable |

## How the product uses the table

1. It looks up the row of `advisor.store_choice.store`
2. It uses `commission_percent (default)` without asking and shows the user the percentage, the source and the reference date
3. It copies the known exceptions to product.md as a note of the model
4. If `store = other`, or the row does not exist, it asks "What is the store commission in percent?"
5. If the reference date of this table is more than 12 months away from today's date known by the session, it offers to run `reversa-pricing-research` with kind `store_commission` (optional, Y/N). If the user accepts and the research comes back with a value, it shows the researched range (`range_min` to `range_max`) and asks which percentage to use; Enter uses `range_max`, which is the percentage without a special program. The chosen value replaces the default and `commission_source` points to the research file

## Official sources

- Google Play Console Help, Service fees: https://support.google.com/googleplay/android-developer/answer/112622
- Apple Developer, App Store Small Business Program: https://developer.apple.com/app-store/small-business-program/
- Microsoft Learn, Publish Windows apps and games (Microsoft Store): https://learn.microsoft.com/en-us/windows/apps/publish/
- Steamworks Documentation, Onboarding and Steam Distribution Agreement: https://partner.steamgames.com/doc/gettingstarted/onboarding

## How to extend

1. Add a row to the table with a canonical snake_case key, without spaces
2. Record the default percentage without a special program or membership; discount programs enter as exceptions
3. List the brackets and known exceptions in one sentence
4. Cite the official page of the store with URL
5. Update the reference date at the top of the file when you revalidate all the percentages
6. Do not call the percentage an exact contractual rate: it is an approximation for budgeting
7. If the new store needs to become an option of the advisor, add the key in the question "In which store?" of `reversa-pricing-advisor`, keeping the same spelling of the `store` column
