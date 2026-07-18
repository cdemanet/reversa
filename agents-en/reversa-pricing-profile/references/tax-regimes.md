# Tax regime catalog

Extensible catalog used by the `reversa-pricing-profile` agent to map the user-declared tax regime into an approximate `tax_factor`. The factors are didactic reserves for budgeting, not exact legal rates.

## How to read this file

Each regime has:

- `key`: canonical key saved in `profile.json`
- `country`: ISO 3166-1 alpha-2 code or `INTL`
- `name_en`: friendly name used in chat
- `tax_factor`: approximate factor applied over direct cost
- `tax_factor_kind`: `effective_reserve_estimate`, `statutory_proxy` or `not_computed`
- `includes_vat`: whether it combines income tax / contribution with VAT/IVA/ISS highlighted
- `vat_pass_through_warning`: whether the estimate must warn that part of the tax may be passed through to the client
- `tax_factor_source`: public source or description of the basis
- `notes_en`: short observation for the user

## Mandatory disclaimer

The factors recorded here are didactic approximations based on public references known in 2026-05. They do not replace accounting guidance. Accuracy depends on deductions, municipality, revenue bracket, CNAE, classification, withholdings, international treaties, and rules in effect at the time of issuing the invoice.

The agent must repeat the disclaimer during the interview and in the footer of `profile.md`.

## Brazil (BR)

| key | name_en | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_en |
|---|---|---:|---|---|---|---|---|
| MEI | Individual Microentrepreneur (MEI) | 0.06 | effective_reserve_estimate | true | true | Empreendedor Portal and public DAS-MEI rules | Simplified reserve. MEI usually has fixed DAS and revenue limit. Software activity may require classification validation. |
| simples_servicos | Simples Nacional, IT services | 0.15 | effective_reserve_estimate | true | true | Brazilian Federal Revenue, Simples Nacional, annexes, and Fator R | Average reserve. Real rate depends on annex, RBT12, Fator R, ISS, and withholdings. |
| lucro_presumido | Presumed Profit, services | 0.165 | effective_reserve_estimate | true | true | Brazilian Federal Revenue, IRPJ, CSLL, PIS, COFINS, and ISS | Combined reserve for services. Validate municipal ISS and withholdings. |
| autonomo_pf | Self-employed individual, carne-leao | 0.275 | effective_reserve_estimate | false | false | Brazilian Federal Revenue, progressive IRPF and INSS | Reserve for senior professional. Effective rate varies by deductions and social security contribution. |

## United States (US)

| key | name_en | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_en |
|---|---|---:|---|---|---|---|---|
| self_employed_1099 | Self-Employed, 1099, sole proprietor | 0.30 | effective_reserve_estimate | false | false | IRS, self-employment tax and federal income tax | Combined reserve. Does not include state tax or specific deductions. |
| s_corp_llc | S-Corp or LLC with S-Corp election | 0.22 | effective_reserve_estimate | false | false | IRS, payroll tax, reasonable salary, and distributions | Simplified reserve. Requires accountant for reasonable salary and distributions. |

## Portugal (PT)

| key | name_en | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_en |
|---|---|---:|---|---|---|---|---|
| pt_simplificado | Category B, simplified regime | 0.21 | effective_reserve_estimate | true | true | Tax Authority, IRS Category B, IVA, and Social Security | Combined reserve. IVA can be highlighted and passed through to the client. |
| pt_organizada | Category B, organized accounting | 0.18 | effective_reserve_estimate | true | true | Tax Authority, organized accounting | Simplified reserve. Real costs can reduce the taxable base. |

## Mexico (MX)

| key | name_en | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_en |
|---|---|---:|---|---|---|---|---|
| mx_resico | Regimen Simplificado de Confianza (RESICO) | 0.10 | effective_reserve_estimate | true | true | SAT, RESICO PF, and IVA | Combined reserve. ISR can be low, but IVA may apply case by case. |
| mx_actividad_empresarial | Actividad Empresarial y Profesional (PF) | 0.20 | effective_reserve_estimate | true | true | SAT, progressive ISR, and IVA | Simplified reserve for self-employed professional. |

## International (INTL)

| key | name_en | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_en |
|---|---|---:|---|---|---|---|---|
| intl_freelance_no_withhold | International freelance, client without withholding | 0.00 | not_computed | false | false | Depends on the provider's country | Client pays gross. Use the provider's national regime for real tax. |
| intl_freelance_with_withhold | International freelance, client withholds at source | 0.15 | effective_reserve_estimate | false | false | Bilateral treaties and local rules | Real withholding depends on treaty and client's country. |

## Other

| key | name_en | tax_factor | tax_factor_kind | includes_vat | vat_pass_through_warning | tax_factor_source | notes_en |
|---|---|---:|---|---|---|---|---|
| other | Other regime, not listed | 0.00 | not_computed | false | false | User informed uncataloged regime | Tax not computed. Estimate must warn that the calculation is up to the accountant. |

## Essential regimes for future regions

Do not enable these countries as covered in the Market scenario without cataloging the minimum regimes:

| country | essential regimes |
|---|---|
| GB | sole_trader_self_assessment, limited_company |
| DE | freiberufler, gewerbe_einzelunternehmen, gmbh |
| ES | autonomo_estimacion_directa_simplificada, autonomo_estimacion_directa_normal, sociedad_limitada |
| AR | monotributo, responsable_inscripto |
| CO | regimen_simple, regimen_ordinario_persona_natural, sociedad |

Verified official sources:

- UK GOV.UK, sole trader and limited company: https://www.gov.uk/set-up-business/sole-trader.html
- Germany, federal administrative portal, fiscal registration: https://verwaltung.bund.de/leistungsverzeichnis/EN/leistung/99102019120000/herausgeber/HH-S1000020010000009790/region/020000000000
- Spain, Agencia Tributaria, income determination regimes: https://sede.agenciatributaria.gob.es/Sede/irpf/empresarios-individuales-profesionales/regimenes-determinar-rendimiento-actividad.html
- Argentina ARCA, Monotributo: https://www.afip.gob.ar/monotributo/
- Colombia DIAN, Regimen Simple de Tributacion: https://micrositios.dian.gov.co/regimen-simple-tributacion/

## Default regime suggestion by country

When the user answers "I don't know", the agent suggests the default below and marks `tax_regime_confidence = "low"`:

| country | suggested default regime |
|---|---|
| BR | simples_servicos |
| US | self_employed_1099 |
| PT | pt_simplificado |
| MX | mx_resico |
| Other country | no suggestion, ask for explicit choice |

## How to extend

1. Add the country section with the same table
2. Cite a public source
3. Mark if the factor includes VAT, IVA, or highlighted tax
4. Do not call `tax_factor` a legal rate
5. Update the schema if new fields are needed
