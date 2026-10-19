# Pricing and Size Agents

El Team **Pricing and Size Agents** responde dos preguntas distintas. La primera es cuánto cobrar a un cliente por construir o evolucionar una feature (servicio, por feature). La segunda es cuánto cobrar a quien usa el software (producto: licencia perpetua, alquiler, suscripción o tienda de apps). Sirve para quien nunca puso precio a un software, con un camino guiado e investigación en la web, y para quien ya conoce sus números y quiere ir directo al cálculo.

Marcado por defecto en el instalador.

---

## Pipeline

```
/reversa-pricing                 orquestador (puerta de entrada, model-invoked, solo enruta)
        │
        ▼
/reversa-pricing-advisor         obligatorio en el camino orquestado: modelo de venta, graba advisor.json
        │
        ▼
/reversa-pricing-profile         perfil de cobranza; el modo investigar llama al research para la tarifa por hora
        │
        ├── vía PRODUCTO ──▶ /reversa-pricing-product    calculadora de punto de equilibrio
        │
        └── vía SERVICIO ──▶ /reversa-pricing-size ──▶ /reversa-pricing-estimate   (por feature)

/reversa-pricing-research        investigación en la web (el único con internet), llamado por profile y product, o directo
```

El `advisor` y el `profile` corren una vez por proyecto y se reutilizan. El `product` corre una vez por proyecto cuando el advisor marcó la vía de producto. El `size` y el `estimate` corren por feature, después de que la feature fue planificada por `/reversa-forward`.

---

## Para quien nunca puso precio

Escribe `/reversa-pricing`. El orquestador lee lo que ya existe en `_pricing/`, te dice dónde te quedaste y sugiere el próximo agente. Nunca escribe nada por sí mismo.

El orden es simple:

1. El **advisor** hace seis preguntas sobre el software (tipo, quién lo encargó, quién paga, quién lo hospeda, costo mensual, preferencia de ingreso) y explica qué modelos de venta encajan, con motivo y riesgos. Puedes elegir más de uno.
2. El **profile** pregunta si conoces tus valores de cobranza o prefieres investigar. En modo investigar llama al **research** para encontrar un rango de tarifa por hora para tu país, seniority y región, con fuentes y fecha. Tú confirmas el valor antes de que se grabe.
3. En la vía de producto, el **product** arma una escalera de precios (investigada o escrita por ti) y muestra, para cada precio, cuántos clientes pagantes cubren el costo y cuántos alcanzan tu meta de ingreso.
4. En la vía de servicio, el **size** mide la feature planificada y el **estimate** la convierte en tres escenarios lado a lado.

Cada agente hace una pregunta a la vez, en lenguaje sencillo, y termina sugiriendo el próximo paso.

---

## Para quien ya sabe

Elige el modo "ya sé mis valores" (en el chat aparece como "sei informar") en el profile y escribe tarifa por hora, markup y régimen tributario directamente. También puedes llamar a cualquier agente directo, saltando el orquestador: `/reversa-pricing-profile`, `/reversa-pricing-size`, `/reversa-pricing-estimate`, `/reversa-pricing-product` o `/reversa-pricing-research` con el tipo de investigación como argumento. El orquestador existe para que un principiante escriba un único comando; no es obligatorio.

---

## Agentes

| Agente | Stage | Función |
|--------|-------|---------|
| `reversa-pricing` | orchestrator | Puerta de entrada. Detecta la etapa por los artefactos en `_pricing/` y enruta al próximo agente (advisor, profile, product, size, estimate o research). Solo enruta, no escribe nada. |
| `reversa-pricing-advisor` | advisor | Entrevista de seis preguntas sobre el software y la forma de venderlo. Aplica reglas determinísticas de viabilidad y graba `advisor.json` con la lista ordenada de modelos de venta (servicio a medida, licencia perpetua, alquiler, suscripción, tienda de apps), con motivo y riesgos de cada uno. Corre antes del profile. |
| `reversa-pricing-research` | research | El único agente con acceso a internet. Investiga tarifa por hora por seniority y región, precios de productos comparables y comisiones de tiendas de apps. Prueba ciudad, luego estado, luego país, registra fuentes y fecha y nunca completa el profile ni el product por sí mismo. |
| `reversa-pricing-profile` | profile | Entrevista guiada que produce el perfil de cobranza: país, moneda, seniority, tarifa por hora, markup, régimen tributario, modelo de cobranza, perfil de cliente. Tiene modo "ya sé mis valores" (en el chat aparece como "sei informar") y modo "investigar". Cada campo registra su origen. |
| `reversa-pricing-size` | size | Lee requirements, dudas, plan y tasks de la feature activa y produce métricas estructurales determinísticas en `size.json` y `size.md` (T-shirt sizing basado en tasks con ajuste de riesgo). |
| `reversa-pricing-estimate` | estimate | Cruza `profile.json` y `size.json` de la feature activa y produce tres escenarios educativos lado a lado: Esfuerzo, Valor, Rango de Mercado. Avisa cuando valores del profile fueron investigados o vinieron por defecto. Nunca entrega un número único como respuesta final. |
| `reversa-pricing-product` | product | Calculadora de punto de equilibrio para vender el software como producto. Lee `advisor.json` y `profile.json`, pide costo mensual, ingreso deseado e inversión a recuperar, arma una escalera de precios y muestra, por modelo y por precio, cuántos pagantes cubren el costo y cuántos alcanzan la meta. |

---

## Pista de producto: punto de equilibrio, no pronóstico

El product calcula, para cada precio de la escalera, el neto por cliente después de la comisión de la tienda y la reserva de impuestos, y divide el costo mensual (más la inversión repartida en el horizonte de recuperación, más la meta de ingreso) por ese neto. El resultado es un conteo de pagantes o de licencias, siempre redondeado hacia arriba.

No modela churn, conversión, comisiones de pasarela de pago, descuentos, trial, impuestos específicos de producto ni tipo de cambio. Dice lo que cada precio exige; no dice cuántos clientes vas a conseguir. La escalera siempre tiene de tres a cinco precios, y el agente nunca elige uno por ti.

---

## Investigación en la web

Solo el `reversa-pricing-research` accede a la web. Todos los demás agentes trabajan offline.

- Fuentes aceptadas: portales de salarios, plataformas freelance, estadística oficial, documentación oficial de las tiendas de apps y páginas de precios de productos. Foros sin números, páginas sin fecha y fuentes en otra moneda se descartan y se listan con el motivo.
- Para tarifa por hora la búsqueda va por ciudad, luego estado, luego país, y el resultado informa qué nivel se usó. El dato por ciudad es escaso; el país suele ser el nivel que funciona.
- La confianza es alta, media o baja según cuánto discrepan las fuentes. Menos de dos fuentes marca el resultado como débil.
- El resultado es un rango con fuentes y fecha. Nada entra en el profile ni en el product hasta que lo confirmes en el agente que llamó.
- Si el engine no tiene herramienta de búsqueda en la web, el research lo avisa y el agente que llamó vuelve a pedirte el valor.

---

## Dónde caen los artefactos

```
_reversa_sdd/_pricing/
├── advisor.json / advisor.md              (una vez por proyecto, /reversa-pricing-advisor)
├── profile.json / profile.md              (una vez, /reversa-pricing-profile)
├── research/
│   ├── hourly_rate.json / .md             (/reversa-pricing-research, llamado por profile en modo investigar)
│   ├── comparables.json / .md             (llamado por product)
│   └── store_commission.json / .md        (opcional, cuando la tabla estática está vieja)
├── product/
│   └── product.json / product.md          (/reversa-pricing-product)
└── <feature>/
    ├── size.json / size.md                (/reversa-pricing-size)
    └── estimate.json / estimate.md        (/reversa-pricing-estimate)
```

Cuando un artefacto ya existe, el agente muestra un resumen y pregunta antes de recalcular. El archivo antiguo se conserva como copia `.bak`.

---

## Origen de los valores

Cada campo de cobranza del profile registra su origen: `digitado` (lo informaste tú), `pesquisado` (vino del research, con fuente y fecha) o `padrao` (sugerencia del framework, como el markup del 35% o el régimen tributario por defecto del país). El estimate lista cada campo que no fue informado por ti y avisa que los valores investigados o por defecto reducen la confianza, para que revises tarifa por hora, markup y régimen antes de enviar una propuesta.

Los Pricing and Size Agents nunca modifican código legado, artefactos del Discovery ni del Forward. Solo los leen y escriben dentro de `_pricing/`.

Estos agentes ofrecen referencias y cálculos educativos, no asesoría financiera, legal ni tributaria. Valida los números con tu contador antes de decidir.
