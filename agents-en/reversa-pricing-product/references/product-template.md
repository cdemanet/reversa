# product.md template

This is the Markdown template that the `reversa-pricing-product` agent uses to generate `_reversa_sdd/_pricing/product/product.md`. Replace all the `<placeholders>` with real values. Keep the structure fixed. Repeat the "Model" block once per calculated model, in the order of `advisor.selected_models`.

```markdown
# Product Breakeven

**Generated at:** <created_at_legible_local>
**Formula version:** <formula_version>
**Currency:** <currency>

**Prerequisites consumed:**
- Advisor: `<output_folder>/_pricing/advisor.json` (chosen models: <selected_models_legible>)
- Profile: `<output_folder>/_pricing/profile.json` (tax reserve `<tax_factor>`, regime `<tax_regime>`)
- Research: `<research_ref_or_"not used">`

## Inputs

| Item | Value |
|---|---|
| Monthly cost to keep it running | <monthly_recurring_cost> <currency> |
| Desired monthly income | <monthly_target_income> <currency> |
| Investment to recover | <development_cost_to_recover> <currency> |
| Recovery horizon | <recovery_horizon_months> months |
| Tax reserve (profile) | <tax_factor_percent>% |
| Total monthly cost (cost plus diluted investment) | <total_monthly_cost_2_decimals> <currency> |
| Cost in the horizon (cost times horizon plus investment) | <horizon_cost_2_decimals> <currency> |
| Price ladder per month | <price_ladders.monthly.prices_legible> (<price_ladders.monthly.origin>) |
| Price ladder per year | <price_ladders.yearly.prices_legible> (<price_ladders.yearly.origin>) |
| Price ladder per license | <price_ladders.license.prices_legible> (<price_ladders.license.origin>) |

Include only the ladder rows whose group exists in `inputs.price_ladders`. `total_monthly_cost` and `horizon_cost` are written without rounding in product.json and printed here with 2 decimals, so the reader can redo the calculation.

<tax_factor_zero_warning_if_applicable>

## Model: <model_plain_name>

**Channel:** <direct or store: store name>
**Billing:** <monthly, yearly or one-off sale>
**Ladder used:** <per month, per year or per license, according to ladder_unit>
**Commission:** <commission_percent>% (<commission_source>) or "not applicable" on the direct channel

<if recurring>

| Price | Net per payer/month | Payers to cover cost | Payers to the goal |
|---:|---:|---:|---:|
| <price> <currency> | <net> <currency> | <payers_to_cover_cost> | <payers_to_goal> |

<if period_months = 12, add the column "Monthly equivalent" after Price>

<if one-off sale>

| Price | Net per license | Licenses to cover cost (<recovery_horizon_months> months) | Licenses to the goal | Licenses per month |
|---:|---:|---:|---:|---:|
| <price> <currency> | <net> <currency> | <units_to_cover_cost> | <units_to_goal> | <units_per_month_to_goal> |

</if>

Unavailable rows appear as "not available: <reason>" in all the count columns.

**Reading:** <reading_en>

<store_exceptions_note_if_applicable>

## Summary

| Model | Lowest requirement (highest price) | Highest requirement (lowest price) |
|---|---|---|
| <model_plain_name> | at <highest_price>: <N> for the cost, <M> for the goal | at <lowest_price>: <N> for the cost, <M> for the goal |

## How to choose

<guidance_en>

Choose the point of the ladder you believe you can sell; the table tells what each point requires. No price in this list is a recommendation: the calculator does not know how many clients exist for your product.

## Limits

This calculator does not model churn, conversion, payment fee (gateway), discounts, trial, tax specific to product or exchange rate. The investment to recover is diluted in equal installments along the horizon, without interest.

## Disclaimer

This calculator shows what each price requires, not how many clients you will get. It does not model churn, conversion or payment fees. The tax reserve comes from the profile and may not be the right regime for product sale; validate with your accountant. Store commissions change; check the official page. It is recommended to add `_reversa_sdd/_pricing/product/` to `.gitignore`.
```

## Plain names of the models

| model | model_plain_name |
|---|---|
| perpetual_license | Perpetual license (one-off sale, the client installs it) |
| rental | Rental (license per period, the client installs and renews) |
| subscription | Subscription (you host it, recurring billing) |
| app_store | App store: <store name> (<one-off sale or subscription inside the store>) |

## tax_factor zero warning

When `profile.tax_factor = 0` (regime `other` or `not_computed`), include after the inputs table:

```markdown
> Tax reserve not computed: the profile uses regime `other`. The net amounts below do not discount tax; the calculation is up to the accountant.
```

## Store exceptions note

When `channel = store`, include after the reading the exceptions line copied from `store-commissions.md`:

```markdown
> Commission of <store name>: <commission_percent>% default. Known exceptions: <brackets and known exceptions>. Source: <source>, reference date <date>.
```

## Number format

In product.md and in the chat, use the decimal separator of the document language and the currency code after the number. In product.json, numbers stay in JSON format.
