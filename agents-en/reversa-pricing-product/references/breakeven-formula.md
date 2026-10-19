# Breakeven formula (breakeven-formula.md)

**Formula version:** 1.0

Documents the deterministic calculation that the `reversa-pricing-product` agent applies to each product sales model (subscription, rental, perpetual license and app store). The formula answers a single question: **how many paying clients each price of the ladder requires** to cover the cost and to reach the income goal. It does not predict how many clients will show up.

## Source and criterion

Break-even is the sold quantity at which the net revenue equals the cost. It is a basic managerial accounting calculation, not a demand model. Reversa uses the simplest version: fixed cost divided by the net amount per unit, rounded up because there is no half client.

Reference:

- Charles T. Horngren et al., *Cost Accounting: A Managerial Emphasis*, chapter on cost-volume-profit (CVP) analysis, Pearson
- Corporate Finance Institute, Break-Even Analysis: https://corporatefinanceinstitute.com/resources/accounting/break-even-analysis/

## Inputs

Coming from the profile:

```
tax_factor = profile.tax_factor          (approximate tax reserve, 0 to 1)
currency   = profile.currency
```

Coming from the product interview:

```
monthly_recurring_cost        monthly cost to keep it running (>= 0)
monthly_target_income         desired monthly income (> 0)
development_cost_to_recover   investment to recover (>= 0, 0 to ignore)
recovery_horizon_months       months to recover and evaluate the one-off sale (integer, 1 to 60)
price_ladders                 one ladder per present unit (monthly, yearly, license), each with 3 to 5 positive prices, ordered
```

Each model uses the ladder of its unit (`ladder_unit`): `monthly` for subscription, monthly rental and store with subscription; `yearly` for yearly rental; `license` for perpetual license and store with one-off sale.

Coming from the model:

```
period_months        1 (monthly) or 12 (yearly) on recurring models; null on one-off sale
commission_percent   store percentage (0 on the direct channel)
```

## Step 1: net per price

```
commission = commission_percent / 100          (0 on the direct channel)
net(price) = price * (1 - commission) * (1 - tax_factor)
```

The commission is discounted before the tax because the store retains its share before passing it on to the developer. The `tax_factor` enters as an approximate reserve over what reaches the developer.

Guard: if `net <= 0`, the row becomes `available = false` with `reason = "not available: the price does not cover commission and tax"` and no count is calculated.

## Step 2: recurring models (subscription, rental, store with subscription)

```
equivalent_monthly_price = price / period_months
monthly_net = net(equivalent_monthly_price)
total_monthly_cost = monthly_recurring_cost + development_cost_to_recover / recovery_horizon_months
payers_to_cover_cost = ceil(total_monthly_cost / monthly_net)
payers_to_goal = ceil((total_monthly_cost + monthly_target_income) / monthly_net)
```

The investment to recover is diluted in equal monthly installments along the horizon. `total_monthly_cost` is calculated without rounding (full decimal precision). When `total_monthly_cost = 0`, `payers_to_cover_cost = 0`.

In the yearly rental (`period_months = 12`), the ladder price is per year and the table also shows the monthly equivalent. In subscription and store with subscription, `period_months = 1` and `equivalent_monthly_price = price`.

## Step 3: one-off sale (perpetual license, store with one-off sale)

```
net_per_unit = net(price)
horizon_cost = monthly_recurring_cost * recovery_horizon_months + development_cost_to_recover
horizon_goal = monthly_target_income * recovery_horizon_months
units_to_cover_cost = ceil(horizon_cost / net_per_unit)
units_to_goal = ceil((horizon_cost + horizon_goal) / net_per_unit)
units_per_month_to_goal = ceil(units_to_goal / recovery_horizon_months)
```

A one-off sale has no recurring revenue, so the calculation is made over the whole horizon: everything that must be covered in the `recovery_horizon_months` months, divided by the net amount of one license. `horizon_cost` is calculated without rounding (full decimal precision). When `horizon_cost = 0`, `units_to_cover_cost = 0`.

## Step 4: rounding

1. Commercial rounding, half up, calculated in decimal, never in binary float
2. Currency with 2 decimal places: `equivalent_monthly_price` and `net` are rounded to 2 decimals before any division
3. Order in the yearly rental: `equivalent_monthly_price = price / 12` is rounded to 2 decimals first; then `monthly_net = net(equivalent_monthly_price already rounded)`; then `monthly_net` is rounded to 2 decimals; only then the `ceil`
4. `total_monthly_cost` and `horizon_cost` are not rounded: they enter the division with full decimal precision. product.md prints both with 2 decimals in the inputs table, so the reader can redo the calculation
5. The counts use the already rounded `net`, so that whoever reads the table can redo the calculation with the printed numbers
6. Counts are integers, always with `ceil` (round up): there is no fraction of a client
7. Commission percentages are used as they are in the table, without rounding

## Example (a): subscription app on Google Play

```
profile:
  currency = BRL, tax_factor = 0.15

model:
  app_store, store = google_play, store_billing = subscription
  recurrence = recurring, period_months = 1
  commission_percent = 15

interview:
  monthly_recurring_cost = 300.00
  monthly_target_income = 5000.00
  development_cost_to_recover = 0
  recovery_horizon_months = 12
  price_ladders = { monthly: [9.90, 19.90, 29.90] }    (model ladder_unit = monthly)
```

Factors:

```
commission = 15 / 100 = 0.15
(1 - commission) = 0.85
(1 - tax_factor) = 0.85
net factor = 0.85 * 0.85 = 0.7225
total_monthly_cost = 300.00 + 0 / 12 = 300.00
total_monthly_cost + monthly_target_income = 300.00 + 5000.00 = 5300.00
```

Price 9.90:

```
equivalent_monthly_price = 9.90 / 1 = 9.90
9.90 * 0.85 = 8.415
8.415 * 0.85 = 7.15275  ->  monthly_net = 7.15
payers_to_cover_cost = ceil(300.00 / 7.15) = ceil(41.958...) = 42
payers_to_goal = ceil(5300.00 / 7.15) = ceil(741.258...) = 742
```

Price 19.90:

```
19.90 * 0.85 = 16.915
16.915 * 0.85 = 14.37775  ->  monthly_net = 14.38
payers_to_cover_cost = ceil(300.00 / 14.38) = ceil(20.862...) = 21
payers_to_goal = ceil(5300.00 / 14.38) = ceil(368.567...) = 369
```

Price 29.90:

```
29.90 * 0.85 = 25.415
25.415 * 0.85 = 21.60275  ->  monthly_net = 21.60
payers_to_cover_cost = ceil(300.00 / 21.60) = ceil(13.888...) = 14
payers_to_goal = ceil(5300.00 / 21.60) = ceil(245.370...) = 246
```

Resulting table:

| Price | Net per payer/month | Payers to cover cost | Payers to the goal |
|---:|---:|---:|---:|
| 9.90 BRL | 7.15 BRL | 42 | 742 |
| 19.90 BRL | 14.38 BRL | 21 | 369 |
| 29.90 BRL | 21.60 BRL | 14 | 246 |

Reading: at 19.90 per month you need 21 subscribers to cover the cost and 369 for the goal.

## Example (b): web system sold directly as a perpetual license

```
profile:
  currency = BRL, tax_factor = 0.15

model:
  perpetual_license, direct channel
  recurrence = one_time, period_months = null
  commission_percent = 0

interview:
  monthly_recurring_cost = 0
  monthly_target_income = 4000.00
  development_cost_to_recover = 12000.00
  recovery_horizon_months = 12
  price_ladders = { license: [1500, 3000, 6000] }    (model ladder_unit = license)
```

Factors:

```
commission = 0 / 100 = 0
(1 - commission) = 1.00
(1 - tax_factor) = 0.85
net factor = 1.00 * 0.85 = 0.85
horizon_cost = 0 * 12 + 12000.00 = 12000.00
horizon_goal = 4000.00 * 12 = 48000.00
horizon_cost + horizon_goal = 12000.00 + 48000.00 = 60000.00
```

Price 1500:

```
net_per_unit = 1500 * 0.85 = 1275.00
units_to_cover_cost = ceil(12000.00 / 1275.00) = ceil(9.411...) = 10
units_to_goal = ceil(60000.00 / 1275.00) = ceil(47.058...) = 48
units_per_month_to_goal = ceil(48 / 12) = ceil(4.0) = 4
```

Price 3000:

```
net_per_unit = 3000 * 0.85 = 2550.00
units_to_cover_cost = ceil(12000.00 / 2550.00) = ceil(4.705...) = 5
units_to_goal = ceil(60000.00 / 2550.00) = ceil(23.529...) = 24
units_per_month_to_goal = ceil(24 / 12) = ceil(2.0) = 2
```

Price 6000:

```
net_per_unit = 6000 * 0.85 = 5100.00
units_to_cover_cost = ceil(12000.00 / 5100.00) = ceil(2.352...) = 3
units_to_goal = ceil(60000.00 / 5100.00) = ceil(11.764...) = 12
units_per_month_to_goal = ceil(12 / 12) = ceil(1.0) = 1
```

Resulting table:

| Price | Net per license | Licenses to cover cost (12 months) | Licenses to the goal | Licenses per month |
|---:|---:|---:|---:|---:|
| 1500.00 BRL | 1275.00 BRL | 10 | 48 | 4 |
| 3000.00 BRL | 2550.00 BRL | 5 | 24 | 2 |
| 6000.00 BRL | 5100.00 BRL | 3 | 12 | 1 |

Reading: at 3000 per license you need 5 licenses in 12 months to cover the investment and 24 (2 per month) for the goal.

## Limits

1. It does not model churn (cancellations): the number of payers is what needs to be active in each month, not how many need to come in
2. It does not model conversion (how many visitors or trials become payers)
3. It does not model payment fee (gateway, card, bank slip, Pix)
4. It does not model discounts, coupons or trial period
5. It does not model tax specific to product sale or licensing: it uses the `tax_factor` of the profile as an approximate reserve, which may not be the right regime for this kind of sale
6. It does not model exchange rate: prices and costs stay in the profile currency
7. The investment to recover is diluted in equal installments; the formula does not calculate interest or time value of money
8. The formula tells what each price requires; the choice of the price is the user's
